/**
 * Driver Dost - Tombstone-Aware Cloud Synchronization & Per-Document Storage Engine
 *
 * Addresses audit items:
 * - #1: Tombstones with LWW delete vs recreate comparison + 90-day TTL prevent deleted items returning.
 * - #2: Deleting the last item in a collection pushes empty state & tombstones cleanly to Firestore.
 * - #3: Deleted bilty records never recreate their public verification documents on sync.
 * - #8: Per-document Firestore subcollections (`users/{uid}/{coll}Docs/{docId}`) avoid 1 MiB limits with legacy dual-read.
 * - #9: Offline queue preserves all entries in IndexedDB-backed safeStorage with exponential backoff (never drops after 3 retries / 30 items).
 * - #10: Permission-denied sync errors mark queue items as `blocked` and surface clear errors instead of counting as processed.
 * - #28: Centralized owner authorization via `authUtils.ts`.
 */

import {
  BiltyRecord,
  Driver,
  FuelLogItem,
  OfflineAction,
  PodConfirmation,
  RoutePreset,
  SyncStatusState,
  Trip,
  Vehicle
} from '../types';
import { auth, db } from './firebase';
import * as firestoreModule from 'firebase/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  setDoc,
  Unsubscribe
} from 'firebase/firestore';
import { getScopedStorageKey } from './calculator';
import {
  DEFAULT_AUTHORIZED_EMAILS,
  isOwnerEmail,
  normalizeEmail,
  verifyOwnerOrStaffClaim
} from './authUtils';
import { getActiveUserScope, getScopedItem, removeScopedItem, safeStorage, setScopedItem } from './storageCore';

export type SyncCollectionName = 'bilties' | 'trips' | 'vehicles' | 'drivers' | 'fuel' | 'routes';

export const SYNC_COLLECTION_TO_DOC_SUBCOLL: Record<SyncCollectionName, string> = {
  bilties: 'biltiesDocs',
  trips: 'tripsDocs',
  vehicles: 'vehiclesDocs',
  drivers: 'driversDocs',
  fuel: 'fuelDocs',
  routes: 'routesDocs'
};

export const TOMBSTONE_TTL_DAYS = 90;
const MAX_LEGACY_DOC_BYTES = 600_000;
const MAX_TOMBSTONES_PER_COLL = 500;
const FIRESTORE_BATCH_LIMIT = 400;
const MIN_AMBIENT_SYNC_COOLDOWN_MS = 30_000;
const KILLSWITCH_CACHE_MS = 5 * 60 * 1000;

export type TombstoneMap = Record<string, string>; // entityKey -> deletedAt ISO string

// ---------------------------------------------------------------------------
// Generic Timeout, Batch Write & Permission Classification Helpers
// ---------------------------------------------------------------------------

export function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out (offline)')), timeoutMs)
    )
  ]);
}

function isPermissionDeniedError(err: unknown): boolean {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
  const msg = err instanceof Error ? err.message : String(err || '');
  return (
    code === 'permission-denied' ||
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('permission-denied')
  );
}

interface BatchWriteOp {
  type: 'set' | 'delete';
  ref: ReturnType<typeof doc>;
  data?: Record<string, unknown>;
  merge?: boolean;
}

async function commitBatchOps(ops: BatchWriteOp[], timeoutMs = 10000): Promise<void> {
  if (ops.length === 0 || !db) return;

  const writeBatchFn = (firestoreModule as unknown as { writeBatch?: typeof firestoreModule.writeBatch }).writeBatch;
  if (typeof writeBatchFn === 'function') {
    for (let i = 0; i < ops.length; i += FIRESTORE_BATCH_LIMIT) {
      const chunk = ops.slice(i, i + FIRESTORE_BATCH_LIMIT);
      const batch = writeBatchFn(db);
      for (const op of chunk) {
        if (op.type === 'set') {
          batch.set(op.ref, op.data || {}, op.merge ? { merge: true } : undefined);
        } else {
          batch.delete(op.ref);
        }
      }
      await withTimeout(batch.commit(), timeoutMs);
    }
    return;
  }

  // Fallback for partial unit-test mocks that do not stub `writeBatch`
  for (let i = 0; i < ops.length; i += 25) {
    const chunk = ops.slice(i, i + 25);
    await withTimeout(
      Promise.all(
        chunk.map(op =>
          op.type === 'set'
            ? setDoc(op.ref, op.data || {}, op.merge ? { merge: true } : undefined)
            : deleteDoc(op.ref)
        )
      ),
      timeoutMs
    );
  }
}

// ---------------------------------------------------------------------------
// Tombstone Storage & LWW Reconciliation Helpers (#1, #2, #3)
// ---------------------------------------------------------------------------

function toSafeFirestoreDocId(rawKey: string): string {
  const clean = String(rawKey || '')
    .trim()
    .replace(/[\/\\?#[\]*]/g, '_');
  return clean || `doc_${Date.now()}`;
}

export function getEntitySyncKey(collName: SyncCollectionName, item: Record<string, unknown>): string {
  if (collName === 'bilties') {
    const biltyNo = item.biltyNo ? String(item.biltyNo).trim().toUpperCase() : '';
    if (biltyNo) return biltyNo;
  }
  const idVal = item.id ?? item.reg ?? '';
  const idStr = String(idVal).trim();
  return idStr || JSON.stringify(item);
}

/**
 * Parses strictly real mutation timestamps (`updatedAt` / `createdAt`), NEVER business `item.date`.
 * Prevents deleted records with future-dated business entries from beating deletion tombstones.
 */
export function parseEntityMutationTimeMs(item: Record<string, unknown>): number {
  const parse = (v: unknown): number => {
    if (!v) return 0;
    const ms = new Date(String(v)).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };
  return Math.max(parse(item.updatedAt), parse(item.createdAt));
}

function getTombstonesKey(collName: string, scope: string = getActiveUserScope()): string {
  return `wg_v3_tombstones_${scope}_${collName}`;
}

export function pruneTombstoneMap(map: TombstoneMap, nowMs = Date.now()): TombstoneMap {
  const cutoffMs = nowMs - TOMBSTONE_TTL_DAYS * 24 * 60 * 60 * 1000;
  const validEntries: Array<[string, string, number]> = [];
  for (const [key, deletedAt] of Object.entries(map)) {
    if (!key || !deletedAt) continue;
    const ts = new Date(deletedAt).getTime();
    if (!Number.isNaN(ts) && ts >= cutoffMs) {
      validEntries.push([key, deletedAt, ts]);
    }
  }
  if (validEntries.length > MAX_TOMBSTONES_PER_COLL) {
    validEntries.sort((a, b) => b[2] - a[2]);
    validEntries.length = MAX_TOMBSTONES_PER_COLL;
  }
  const pruned: TombstoneMap = {};
  for (const [key, deletedAt] of validEntries) {
    pruned[key] = deletedAt;
  }
  return pruned;
}

export function getTombstones(collName: string, scope: string = getActiveUserScope()): TombstoneMap {
  try {
    const raw = safeStorage.getItem(getTombstonesKey(collName, scope));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return pruneTombstoneMap(parsed as TombstoneMap);
  } catch {
    return {};
  }
}

export function saveTombstones(
  collName: string,
  map: TombstoneMap,
  scope: string = getActiveUserScope()
): void {
  const pruned = pruneTombstoneMap(map);
  const key = getTombstonesKey(collName, scope);
  if (Object.keys(pruned).length === 0) {
    safeStorage.removeItem(key);
  } else {
    safeStorage.setItem(key, JSON.stringify(pruned));
  }
}

export function mergeTombstoneMaps(localMap: TombstoneMap, cloudMap: TombstoneMap): TombstoneMap {
  const merged: TombstoneMap = { ...localMap };
  for (const [k, cloudIso] of Object.entries(cloudMap)) {
    const localIso = merged[k];
    const cloudMs = new Date(cloudIso).getTime();
    const localMs = localIso ? new Date(localIso).getTime() : 0;
    if (!localIso || (!Number.isNaN(cloudMs) && cloudMs >= localMs)) {
      merged[k] = cloudIso;
    }
  }
  return pruneTombstoneMap(merged);
}

/**
 * Checks if a record is killed by a tombstone (tombstone timestamp >= entity mutation timestamp).
 * Strictly ignores business `item.date` so future-dated entries cannot resurrect deleted records.
 */
export function isEntityTombstoned(
  collName: SyncCollectionName,
  item: Record<string, unknown>,
  tombstones: TombstoneMap
): boolean {
  const primaryKey = getEntitySyncKey(collName, item);
  const idKey = item.id !== undefined && item.id !== null ? String(item.id) : '';
  const deletedAt = tombstones[primaryKey] || (idKey ? tombstones[idKey] : undefined);
  if (!deletedAt) return false;
  const deletedMs = new Date(deletedAt).getTime();
  if (Number.isNaN(deletedMs)) return false;
  const entityMs = parseEntityMutationTimeMs(item);
  // Tombstone wins unless the item was genuinely recreated/updated AFTER deletedAt
  return deletedMs >= entityMs;
}

/**
 * Diffs previous vs next collection state and records tombstones for removed keys,
 * returning the list of keys explicitly deleted in this mutation.
 */
export function recordCollectionMutations<T extends Record<string, unknown>>(
  collName: SyncCollectionName,
  previousItems: T[],
  nextItems: T[],
  timestampIso: string = new Date().toISOString()
): { deletedKeys: string[]; tombstones: TombstoneMap } {
  const scope = getActiveUserScope();
  const tombstones = getTombstones(collName, scope);
  const nextKeySet = new Set<string>();

  for (const item of nextItems) {
    const k = getEntitySyncKey(collName, item);
    nextKeySet.add(k);
    if (item.id !== undefined && item.id !== null) {
      nextKeySet.add(String(item.id));
    }
    // If an item is freshly added/updated, clear any older tombstone
    const existingDel = tombstones[k];
    if (existingDel) {
      const itemMs = parseEntityMutationTimeMs(item);
      const delMs = new Date(existingDel).getTime();
      if (itemMs > delMs || Number.isNaN(delMs)) {
        delete tombstones[k];
      }
    }
  }

  const deletedKeys: string[] = [];
  for (const prev of previousItems) {
    const prevKey = getEntitySyncKey(collName, prev);
    const prevId = prev.id !== undefined && prev.id !== null ? String(prev.id) : '';
    if (!nextKeySet.has(prevKey) && (!prevId || !nextKeySet.has(prevId))) {
      tombstones[prevKey] = timestampIso;
      deletedKeys.push(prevKey);
    }
  }

  saveTombstones(collName, tombstones, scope);
  return { deletedKeys, tombstones };
}

/**
 * Compares previous vs next collection items and advances `updatedAt = nowIso`
 * on every newly inserted or content-modified record while keeping untouched records' timestamps stable.
 */
function stampMutatedEntities<T extends Record<string, unknown>>(
  collName: SyncCollectionName,
  previousItems: T[],
  nextItems: T[],
  nowIso: string
): { stamped: T[]; changedKeys: string[] } {
  const prevByKey = new Map<string, T>();
  for (const prev of previousItems) {
    prevByKey.set(getEntitySyncKey(collName, prev), prev);
  }

  const stripTimestamps = (obj: Record<string, unknown>): string => {
    const clone: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) {
      if (k === 'updatedAt') continue;
      clone[k] = obj[k];
    }
    return JSON.stringify(clone);
  };

  const changedKeys: string[] = [];
  const stamped = nextItems.map(item => {
    const key = getEntitySyncKey(collName, item);
    const prev = prevByKey.get(key);
    const existingUpdatedAt = typeof item.updatedAt === 'string' && item.updatedAt ? item.updatedAt : undefined;
    if (!prev) {
      changedKeys.push(key);
      return {
        ...item,
        updatedAt: existingUpdatedAt && new Date(existingUpdatedAt).getTime() > new Date(nowIso).getTime()
          ? existingUpdatedAt
          : nowIso
      } as T;
    }

    const prevBody = stripTimestamps(prev);
    const nextBody = stripTimestamps(item);
    if (prevBody !== nextBody || !existingUpdatedAt) {
      changedKeys.push(key);
      return {
        ...item,
        updatedAt: nowIso
      } as T;
    }

    return {
      ...item,
      updatedAt: existingUpdatedAt
    } as T;
  });

  return { stamped, changedKeys };
}

/**
 * Deterministic Timestamp-Based Last-Write-Wins (LWW) Conflict Resolver.
 * Uses `updatedAt` / `createdAt` strictly; falls back to business `date` ONLY when
 * neither record carries any mutation timestamp.
 */
export function resolveEntityLWW<T extends Record<string, any>>(local: T, cloud: T): T {
  const localTime = parseEntityMutationTimeMs(local);
  const cloudTime = parseEntityMutationTimeMs(cloud);
  if (localTime > 0 || cloudTime > 0) {
    return localTime >= cloudTime ? local : cloud;
  }
  const parseDate = (v: unknown): number => {
    if (!v) return 0;
    const ms = new Date(String(v)).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };
  return parseDate(local.date) >= parseDate(cloud.date) ? local : cloud;
}

// ---------------------------------------------------------------------------
// Queue Persistence & Status Listeners (#9, #10)
// ---------------------------------------------------------------------------

type SyncListener = () => void;
const syncListeners = new Set<SyncListener>();

export function subscribeToSyncEvents(listener: SyncListener): () => void {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

export function notifySyncListeners(): void {
  syncListeners.forEach(fn => {
    try {
      fn();
    } catch {
      // ignore listener error
    }
  });
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const activeScope = getActiveUserScope();
    const scopedQueueKey = getScopedStorageKey('offline-queue', activeScope);
    const scopedRaw = safeStorage.getItem(scopedQueueKey);
    if (scopedRaw !== null) {
      const parsed = JSON.parse(scopedRaw);
      return Array.isArray(parsed) ? parsed : [];
    }

    // One-time read from legacy queue keys if scoped key is absent
    const legacyKeys = [
      getScopedStorageKey('offline-queue', 'guest'),
      'ah-offline-queue',
      'offline-queue'
    ].filter(k => k !== scopedQueueKey);

    for (const k of legacyKeys) {
      const data = safeStorage.getItem(k);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          safeStorage.setItem(scopedQueueKey, data);
          safeStorage.removeItem(k);
          return parsed;
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredOfflineQueue(queue: OfflineAction[]): void {
  const activeScope = getActiveUserScope();
  const scopedKey = getScopedStorageKey('offline-queue', activeScope);
  if (queue.length === 0) {
    safeStorage.removeItem(scopedKey);
  } else {
    safeStorage.setItem(scopedKey, JSON.stringify(queue));
  }
}

export function clearOfflineQueue(): void {
  saveStoredOfflineQueue([]);
  safeStorage.removeItem('ah-last-sync-error');
  notifySyncListeners();
}

export function getErrorLogs(): Array<{
  id: string;
  timestamp: string;
  action: string;
  error: string;
  context?: string;
}> {
  try {
    const raw = safeStorage.getItem('ah-error-logs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearErrorLogs(): void {
  try {
    safeStorage.removeItem('ah-error-logs');
    safeStorage.removeItem('ah-last-sync-error');
  } catch {
    // Ignore
  }
}

// ---------------------------------------------------------------------------
// Document Authorization Helper (#28)
// ---------------------------------------------------------------------------

function isCurrentUserBiltyAuthorizedForSync(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  if (isOwnerEmail(user.email)) return true;
  try {
    const rawUids = safeStorage.getItem('wg_global_bilty_allowed_uids');
    const rawEmails = safeStorage.getItem('wg_global_bilty_allowed_emails');
    const uids: string[] = rawUids ? JSON.parse(rawUids) : [];
    const emails: string[] = rawEmails ? JSON.parse(rawEmails) : [];
    return verifyOwnerOrStaffClaim(user, Array.isArray(uids) ? uids : [], Array.isArray(emails) ? emails : []);
  } catch {
    return false;
  }
}

export function enqueueOfflineAction(type: OfflineAction['type'], data: unknown): void {
  try {
    const user = auth.currentUser;
    const isOwner = isOwnerEmail(user?.email);

    // Prevent poison pills: do not enqueue owner/authorized-only cloud writes for unauthorized users
    if (type === 'settings' && !isOwner) {
      return;
    }
    if (
      (type === 'bilty' || type === 'bilties' || type === 'public_bilty' || type === 'delete_public_bilty') &&
      !isCurrentUserBiltyAuthorizedForSync()
    ) {
      return;
    }

    const queue = getStoredOfflineQueue();
    const newAction: OfflineAction = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    };

    const dataObj = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const targetBiltyNo = dataObj?.biltyNo ? String(dataObj.biltyNo).trim().toUpperCase() : '';

    const filtered = queue.filter(item => {
      if (
        (type === 'public_bilty' || type === 'delete_public_bilty') &&
        (item.type === 'public_bilty' || item.type === 'delete_public_bilty')
      ) {
        const itemData = item.data && typeof item.data === 'object' ? (item.data as Record<string, unknown>) : null;
        const itemNo = itemData?.biltyNo ? String(itemData.biltyNo).trim().toUpperCase() : '';
        if (itemNo && targetBiltyNo) {
          return itemNo !== targetBiltyNo;
        }
      }
      if (item.type !== type) return true;
      if (type === 'bilties' || type === 'bilty') return false;
      if (['trips', 'vehicles', 'drivers', 'fuel', 'routes', 'settings'].includes(type)) return false;
      return JSON.stringify(item.data) !== JSON.stringify(data);
    });

    // No hard 30-item truncation (#9): IndexedDB-backed safeStorage preserves the entire queue
    saveStoredOfflineQueue([newAction, ...filtered]);
    notifySyncListeners();
  } catch (e) {
    console.warn('Error enqueuing offline action:', e);
  }
}

// ---------------------------------------------------------------------------
// Per-Document & Collection Sync Primitives (#2, #8)
// ---------------------------------------------------------------------------

function normalizeCollectionKey(rawType: string): SyncCollectionName | null {
  if (rawType === 'bilty' || rawType === 'bilties') return 'bilties';
  if (rawType === 'trip' || rawType === 'trips') return 'trips';
  if (rawType === 'vehicle' || rawType === 'vehicles') return 'vehicles';
  if (rawType === 'driver' || rawType === 'drivers') return 'drivers';
  if (rawType === 'fuel' || rawType === 'fuels') return 'fuel';
  if (rawType === 'routes') return 'routes';
  return null;
}

interface PerDocWriteOptions {
  changedKeys?: string[] | null;
  cloudSubDocMap?: Map<string, Record<string, unknown>>;
  cloudSubDocTombstones?: TombstoneMap;
  cloudTombstonesForColl?: TombstoneMap;
  hasCloudTombstonesSnapshot?: boolean;
  existingLegacyData?: Record<string, unknown> | null;
  hasLegacySnapshot?: boolean;
}

function stableEntityDigest(item: Record<string, unknown>): string {
  const clone: Record<string, unknown> = {};
  for (const k of Object.keys(item).sort()) {
    if (k === '_deleted' || k === 'deletedAt') continue;
    clone[k] = item[k];
  }
  return JSON.stringify(clone);
}

async function writePerDocCollectionToFirestore(
  uid: string,
  collName: SyncCollectionName,
  items: Array<Record<string, unknown>>,
  deletedKeys: string[] = [],
  options: PerDocWriteOptions = {}
): Promise<number> {
  const subColl = SYNC_COLLECTION_TO_DOC_SUBCOLL[collName];
  const nowIso = new Date().toISOString();
  const ops: BatchWriteOp[] = [];
  const changedKeySet = Array.isArray(options.changedKeys) ? new Set(options.changedKeys) : null;
  const localTombstones = getTombstones(collName, uid);

  // 1. Upsert ONLY changed/missing documents into users/{uid}/{coll}Docs/{docId} (#8 + delta)
  for (const item of items) {
    const entityKey = getEntitySyncKey(collName, item);
    if (changedKeySet !== null && !changedKeySet.has(entityKey)) {
      continue;
    }
    if (options.cloudSubDocMap) {
      const cloudDoc = options.cloudSubDocMap.get(entityKey);
      if (cloudDoc && stableEntityDigest(cloudDoc) === stableEntityDigest(item)) {
        continue;
      }
    }
    const docId = toSafeFirestoreDocId(entityKey);
    const docRef = doc(db, 'users', uid, subColl, docId);
    ops.push({
      type: 'set',
      ref: docRef,
      data: { ...item, _deleted: false, deletedAt: null, updatedAt: item.updatedAt || nowIso },
      merge: true
    });
  }

  // 2. Write explicit tombstone markers on newly deleted or un-marked deleted docs (#1, #2)
  if (deletedKeys.length > 0) {
    for (const delKey of deletedKeys) {
      const expectedDeletedAt = localTombstones[delKey] || nowIso;
      if (
        options.cloudSubDocTombstones &&
        options.cloudSubDocTombstones[delKey] === expectedDeletedAt &&
        !options.cloudSubDocMap?.has(delKey)
      ) {
        continue;
      }
      const docId = toSafeFirestoreDocId(delKey);
      const docRef = doc(db, 'users', uid, subColl, docId);
      ops.push({
        type: 'set',
        ref: docRef,
        data: { _deleted: true, deletedAt: expectedDeletedAt, updatedAt: expectedDeletedAt, id: delKey },
        merge: true
      });
    }
  }

  // 3. Push tombstones map for this collection ONLY if changed vs cloud (#1)
  const cloudTombsJson = options.hasCloudTombstonesSnapshot
    ? JSON.stringify(options.cloudTombstonesForColl || {})
    : null;
  const localTombsJson = JSON.stringify(localTombstones);
  const tombsChanged = cloudTombsJson === null
    ? (Object.keys(localTombstones).length > 0 || deletedKeys.length > 0)
    : cloudTombsJson !== localTombsJson;

  if (tombsChanged) {
    const tombRef = doc(db, 'users', uid, 'collections', 'tombstones');
    ops.push({
      type: 'set',
      ref: tombRef,
      data: { [collName]: localTombstones, updatedAt: nowIso },
      merge: true
    });
  }

  // 4. Maintain legacy doc if payload fits under 600KB; skip redundant rewrites if unchanged (#2, #8)
  const legacyRef = doc(db, 'users', uid, 'collections', collName);
  const serializedSize = JSON.stringify(items).length;
  const existingLegacy = options.existingLegacyData;

  if (serializedSize <= MAX_LEGACY_DOC_BYTES) {
    const legacyUnchanged =
      options.hasLegacySnapshot &&
      existingLegacy &&
      existingLegacy.migratedToPerDoc !== true &&
      Array.isArray(existingLegacy.items) &&
      JSON.stringify(existingLegacy.items) === JSON.stringify(items);

    if (!legacyUnchanged) {
      ops.push({
        type: 'set',
        ref: legacyRef,
        data: { items, updatedAt: nowIso, perDocSynced: true },
        merge: true
      });
    }
  } else {
    const markerUnchanged =
      options.hasLegacySnapshot &&
      existingLegacy &&
      existingLegacy.migratedToPerDoc === true &&
      existingLegacy.itemsCount === items.length;

    if (!markerUnchanged) {
      ops.push({
        type: 'set',
        ref: legacyRef,
        data: { items: [], migratedToPerDoc: true, itemsCount: items.length, updatedAt: nowIso },
        merge: true
      });
    }
  }

  if (ops.length > 0) {
    await commitBatchOps(ops, 10000);
  }
  return ops.length;
}

export async function syncToFirestore<T>(
  key: string,
  data: T,
  deletedKeys: string[] = [],
  changedKeys?: string[]
): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    enqueueOfflineAction(key as OfflineAction['type'], data);
    return false;
  }

  try {
    const user = auth.currentUser;
    if (!user || !db) return false;

    const collName = normalizeCollectionKey(key);
    if (collName && Array.isArray(data)) {
      if (Array.isArray(changedKeys) && changedKeys.length === 0 && deletedKeys.length === 0) {
        return true;
      }
      await writePerDocCollectionToFirestore(
        user.uid,
        collName,
        data as Array<Record<string, unknown>>,
        deletedKeys,
        changedKeys !== undefined ? { changedKeys } : {}
      );
      return true;
    }

    const userDocRef = doc(db, 'users', user.uid, 'collections', key);
    await withTimeout(
      setDoc(userDocRef, { items: data, updatedAt: new Date().toISOString() }, { merge: true }),
      8000
    );
    return true;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      const queue = getStoredOfflineQueue();
      const blockedAction: OfflineAction = {
        id: `blocked_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: key as OfflineAction['type'],
        data,
        timestamp: new Date().toISOString(),
        retryCount: 1,
        status: 'blocked',
        lastError: 'Permission denied by Firestore rules'
      };
      saveStoredOfflineQueue([blockedAction, ...queue.filter(q => q.type !== blockedAction.type)]);
      safeStorage.setItem('ah-last-sync-error', blockedAction.lastError || 'Permission denied');
      notifySyncListeners();
      return false;
    }

    enqueueOfflineAction(key as OfflineAction['type'], data);
    return false;
  }
}

/**
 * Public Verification helpers used across sync
 */
export interface PublicBiltyVerification {
  biltyNo: string;
  biltyDate: string;
  origin: string;
  destination: string;
  goodsDescription: string;
  weightOrQty: string;
  vehicleNo: string;
  status: string;
}

export function extractPublicBiltyVerification(
  bilty: Partial<BiltyRecord> & {
    biltyDate?: string;
    origin?: string;
    destination?: string;
    goodsDescription?: string;
    weightOrQty?: string;
    status?: string;
  }
): PublicBiltyVerification {
  const normalizedNo = bilty.biltyNo ? String(bilty.biltyNo).trim().toUpperCase() : '';
  const biltyDate = String(bilty.date || bilty.biltyDate || '').trim();
  const origin = String(bilty.sendingCity || bilty.origin || '').trim();
  const destination = String(bilty.receivingCity || bilty.destination || '').trim();
  const goodsDescription = String(bilty.itemDescription || bilty.goodsDescription || '').trim();

  const qtyStr = bilty.qty !== undefined && bilty.qty !== null ? String(bilty.qty).trim() : '';
  const weightStr = bilty.weight !== undefined && bilty.weight !== null ? String(bilty.weight).trim() : '';
  const combinedWeightOrQty = [qtyStr, weightStr].filter(Boolean).join(' / ');
  const weightOrQty = combinedWeightOrQty || String(bilty.weightOrQty || '').trim();

  const vehicleNo = String(bilty.vehicleNo || '').trim();
  const rawStatus = typeof bilty.status === 'string' ? bilty.status.trim() : '';
  const status = rawStatus && rawStatus.toLowerCase() !== 'in transit' ? rawStatus : 'Verified';

  return {
    biltyNo: normalizedNo,
    biltyDate,
    origin,
    destination,
    goodsDescription,
    weightOrQty,
    vehicleNo,
    status
  };
}

export async function syncPublicBiltyVerification(bilty: Partial<BiltyRecord>): Promise<boolean> {
  if (!bilty?.biltyNo) return false;
  const user = auth.currentUser;
  if (!user) return false;

  const safeData = extractPublicBiltyVerification(bilty as Partial<BiltyRecord> & Record<string, unknown>);
  const normalizedNo = safeData.biltyNo;
  if (!normalizedNo) return false;

  // Never upload a public verification record if this biltyNo is currently tombstoned (#3)
  const biltiesTombstones = getTombstones('bilties', user.uid);
  if (isEntityTombstoned('bilties', bilty as Record<string, unknown>, biltiesTombstones)) {
    return false;
  }

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline || !db) {
    enqueueOfflineAction('public_bilty', safeData);
    return false;
  }

  try {
    const docRef = doc(db, 'publicBiltyVerifications', normalizedNo);
    await withTimeout(setDoc(docRef, safeData), 8000);
    return true;
  } catch (err) {
    if (!isPermissionDeniedError(err)) {
      enqueueOfflineAction('public_bilty', safeData);
    }
    return false;
  }
}

export async function deletePublicBiltyVerification(biltyNo: string): Promise<boolean> {
  const normalizedNo = String(biltyNo || '').trim().toUpperCase();
  if (!normalizedNo) return false;

  try {
    const queue = getStoredOfflineQueue();
    const cleaned = queue.filter(item => {
      if (item.type === 'public_bilty' || item.type === 'pod_confirmation') {
        const d = item.data && typeof item.data === 'object' ? (item.data as Record<string, unknown>) : null;
        const itemNo = d?.biltyNo ? String(d.biltyNo).trim().toUpperCase() : '';
        return itemNo !== normalizedNo;
      }
      return true;
    });
    if (cleaned.length !== queue.length) {
      saveStoredOfflineQueue(cleaned);
    }
  } catch {
    // ignore
  }

  const user = auth.currentUser;
  if (!user) return false;

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline || !db) {
    enqueueOfflineAction('delete_public_bilty', { biltyNo: normalizedNo });
    return false;
  }

  try {
    const docRef = doc(db, 'publicBiltyVerifications', normalizedNo);
    await withTimeout(deleteDoc(docRef), 8000);
    const cleanId = normalizedNo.replace(/[^A-Z0-9]/g, '');
    if (cleanId && cleanId !== normalizedNo) {
      await withTimeout(deleteDoc(doc(db, 'publicBiltyVerifications', cleanId)), 4000).catch(() => {});
    }
    return true;
  } catch {
    enqueueOfflineAction('delete_public_bilty', { biltyNo: normalizedNo });
    return false;
  }
}

/**
 * Genuine Offline Queue Processor & Retry Mechanism (#9, #10)
 * - Never drops actions silently after 3 retries (applies capped exponential backoff instead).
 * - Separates permission-denied failures into `blocked` items and NEVER counts them as `processed`.
 */
export async function processOfflineQueue(): Promise<{
  processed: number;
  remaining: number;
  blocked: number;
  errors: string[];
}> {
  const queue = getStoredOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, remaining: 0, blocked: 0, errors: [] };
  }

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { processed: 0, remaining: queue.length, blocked: 0, errors: ['Device is offline'] };
  }

  const user = auth.currentUser;
  const remainingQueue: OfflineAction[] = [];
  let processedCount = 0;
  let blockedCount = 0;
  const errorLogs: string[] = [];
  const nowMs = Date.now();

  for (const action of queue) {
    // Skip items still in backoff window without mutating retryCount
    if (action.status !== 'blocked' && action.nextRetryAt && action.nextRetryAt > nowMs) {
      remainingQueue.push(action);
      continue;
    }

    if (!user || !action.type) {
      remainingQueue.push(action);
      continue;
    }

    try {
      const biltyTombstones = getTombstones('bilties', user.uid);

      if ((action.type === 'bilty' || action.type === 'bilties') && Array.isArray(action.data)) {
        const filteredBilties = (action.data as Array<Record<string, unknown>>).filter(
          b => !isEntityTombstoned('bilties', b, biltyTombstones)
        );
        await writePerDocCollectionToFirestore(
          user.uid,
          'bilties',
          filteredBilties,
          Object.keys(biltyTombstones)
        );
        for (const b of filteredBilties) {
          if (b?.biltyNo) {
            const safeData = extractPublicBiltyVerification(b);
            const pubRef = doc(db, 'publicBiltyVerifications', safeData.biltyNo);
            await withTimeout(setDoc(pubRef, safeData), 8000);
          }
        }
        processedCount++;
      } else if (action.type === 'public_bilty' && action.data?.biltyNo) {
        if (!isEntityTombstoned('bilties', action.data, biltyTombstones)) {
          const safeData = extractPublicBiltyVerification(action.data);
          const pubRef = doc(db, 'publicBiltyVerifications', safeData.biltyNo);
          await withTimeout(setDoc(pubRef, safeData), 8000);
        }
        processedCount++;
      } else if (action.type === 'delete_public_bilty' && action.data?.biltyNo) {
        const normalizedNo = String(action.data.biltyNo).trim().toUpperCase();
        if (normalizedNo) {
          const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
          await withTimeout(deleteDoc(pubRef), 8000);
        }
        processedCount++;
      } else if ((action.type === 'bilty' || action.type === 'bilties') && !Array.isArray(action.data)) {
        if (action.data?.biltyNo && !isEntityTombstoned('bilties', action.data, biltyTombstones)) {
          const safeData = extractPublicBiltyVerification(action.data);
          const pubRef = doc(db, 'publicBiltyVerifications', safeData.biltyNo);
          await withTimeout(setDoc(pubRef, safeData), 8000);
        }
        processedCount++;
      } else {
        const collName = normalizeCollectionKey(action.type);
        if (collName) {
          const collTombstones = getTombstones(collName, user.uid);
          const rawItems = Array.isArray(action.data) ? action.data : [action.data];
          const safeItems = (rawItems as Array<Record<string, unknown>>).filter(
            item => !isEntityTombstoned(collName, item, collTombstones)
          );
          await writePerDocCollectionToFirestore(
            user.uid,
            collName,
            safeItems,
            Object.keys(collTombstones)
          );
          processedCount++;
        } else if (action.type === 'settings') {
          if (!isOwnerEmail(user.email)) {
            throw new Error('permission-denied: Only owner can update company profile');
          }
          const docRef = doc(db, 'settings', 'companyProfile');
          await withTimeout(setDoc(docRef, action.data, { merge: true }), 8000);
          processedCount++;
        } else if (action.type === 'pod_confirmation' && action.data?.biltyNo) {
          if (!isEntityTombstoned('bilties', action.data, biltyTombstones)) {
            const safeData = extractPublicBiltyVerification({
              ...action.data,
              isDelivered: true,
              status: 'Delivered'
            });
            const pubRef = doc(db, 'publicBiltyVerifications', safeData.biltyNo);
            await withTimeout(setDoc(pubRef, safeData), 8000);
          }
          processedCount++;
        } else {
          processedCount++;
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const retry = (action.retryCount || 0) + 1;

      if (isPermissionDeniedError(err)) {
        // #10: NEVER count permission errors as processed! Surface as blocked item
        blockedCount++;
        const blockedMsg = `Permission denied syncing ${action.type}`;
        errorLogs.push(blockedMsg);
        remainingQueue.push({
          ...action,
          retryCount: retry,
          status: 'blocked',
          lastError: blockedMsg
        });
      } else {
        // #9: Never silently drop data after 3 retries — retain with capped exponential backoff (max 1h)
        const backoffMs = Math.min(60 * 60 * 1000, 15_000 * Math.pow(2, Math.min(retry - 1, 8)));
        const errNote = `Sync paused (attempt ${retry}): ${errMsg}`;
        errorLogs.push(errNote);
        remainingQueue.push({
          ...action,
          retryCount: retry,
          status: 'retrying',
          lastError: errMsg,
          nextRetryAt: nowMs + backoffMs
        });
      }
    }
  }

  saveStoredOfflineQueue(remainingQueue);
  if (errorLogs.length > 0) {
    safeStorage.setItem('ah-last-sync-error', errorLogs[0]);
  } else if (remainingQueue.length === 0) {
    safeStorage.removeItem('ah-last-sync-error');
  }
  notifySyncListeners();

  return {
    processed: processedCount,
    remaining: remainingQueue.length,
    blocked: blockedCount,
    errors: errorLogs
  };
}

// ---------------------------------------------------------------------------
// Remote Sync Kill-Switch, Digest Tracking & Single-Flight Lock
// ---------------------------------------------------------------------------

let killSwitchCache: { checkedAt: number; disabled: boolean } | null = null;
const activeReconcilePromises = new Map<
  string,
  Promise<{ synced: boolean; count: number; blockedCount?: number }>
>();

async function isAmbientSyncKilledRemotely(): Promise<boolean> {
  if (!db) return false;
  const now = Date.now();
  if (killSwitchCache && now - killSwitchCache.checkedAt < KILLSWITCH_CACHE_MS) {
    return killSwitchCache.disabled;
  }
  try {
    const snap = await withTimeout(getDoc(doc(db, 'settings', 'syncConfig')), 2500);
    const disabled = Boolean(snap && snap.exists() && snap.data()?.disableAmbientSyncV3 === true);
    killSwitchCache = { checkedAt: now, disabled };
    return disabled;
  } catch {
    return killSwitchCache?.disabled ?? false;
  }
}

function getPublicBiltyDigestCache(uid: string): Record<string, string> {
  try {
    const raw = safeStorage.getItem(`wg_v3_pub_bilty_digest_${uid}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function savePublicBiltyDigestCache(uid: string, map: Record<string, string>): void {
  safeStorage.setItem(`wg_v3_pub_bilty_digest_${uid}`, JSON.stringify(map));
}

function getDeletedPublicBiltyCache(uid: string): Record<string, true> {
  try {
    const raw = safeStorage.getItem(`wg_v3_pub_bilty_deleted_${uid}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveDeletedPublicBiltyCache(uid: string, map: Record<string, true>): void {
  safeStorage.setItem(`wg_v3_pub_bilty_deleted_${uid}`, JSON.stringify(map));
}

/**
 * Bi-directional Reconciliation & Delta Auto-Sync Engine (#1, #2, #3, #8, #10)
 */
export async function autoReconcileAllLocalToCloud(
  targetUid?: string,
  options: { bypassKillSwitch?: boolean } = {}
): Promise<{
  synced: boolean;
  count: number;
  blockedCount?: number;
}> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline || !db) return { synced: false, count: 0 };

  const user = auth.currentUser;
  const uid = targetUid || user?.uid;
  if (!uid) return { synced: false, count: 0 };

  const existingInFlight = activeReconcilePromises.get(uid);
  if (existingInFlight) {
    return existingInFlight;
  }

  const runPromise = (async (): Promise<{ synced: boolean; count: number; blockedCount?: number }> => {
    if (!options.bypassKillSwitch && (await isAmbientSyncKilledRemotely())) {
      return { synced: true, count: 0, blockedCount: 0 };
    }

    let totalSynced = 0;

    // 1. Process offline action queue first (and preserve any remaining/blocked items!)
    const queueResult = await processOfflineQueue().catch(() => ({
      processed: 0,
      remaining: 0,
      blocked: 0,
      errors: ['Queue execution failed']
    }));

    // 2. Fetch cloud tombstones map once
    let cloudAllTombstones: Record<string, TombstoneMap> = {};
    let hasCloudTombstonesSnapshot = false;
    try {
      const tombSnap = await withTimeout(getDoc(doc(db, 'users', uid, 'collections', 'tombstones')), 8000).catch(
        () => null
      );
      if (tombSnap) {
        hasCloudTombstonesSnapshot = true;
        if (tombSnap.exists()) {
          cloudAllTombstones = (tombSnap.data() || {}) as Record<string, TombstoneMap>;
        }
      }
    } catch {
      cloudAllTombstones = {};
    }

    const syncCollections: SyncCollectionName[] = ['bilties', 'trips', 'vehicles', 'drivers', 'fuel', 'routes'];
    let syncErrors = queueResult.errors.length;

    for (const collName of syncCollections) {
      try {
        const scopedKey = getScopedStorageKey(collName, uid);
        const rawLocal = safeStorage.getItem(scopedKey);
        const localItems: Array<Record<string, unknown>> = rawLocal ? JSON.parse(rawLocal) : [];

        const localTombstones = getTombstones(collName, uid);
        const remoteCollTombstones: TombstoneMap =
          cloudAllTombstones[collName] && typeof cloudAllTombstones[collName] === 'object'
            ? cloudAllTombstones[collName]
            : {};

        // Dual-read: per-document subcollection AND legacy array document (#8)
        const subColl = SYNC_COLLECTION_TO_DOC_SUBCOLL[collName];
        const [legacySnap, docsSnap] = await Promise.all([
          withTimeout(getDoc(doc(db, 'users', uid, 'collections', collName)), 8000).catch(() => null),
          withTimeout(getDocs(collection(db, 'users', uid, subColl)), 8000).catch(() => null)
        ]);

        const hasLegacySnapshot = Boolean(legacySnap);
        const existingLegacyData =
          legacySnap && legacySnap.exists() ? (legacySnap.data() as Record<string, unknown>) : null;
        const legacyItems: Array<Record<string, unknown>> =
          existingLegacyData && Array.isArray(existingLegacyData.items)
            ? (existingLegacyData.items as Array<Record<string, unknown>>)
            : [];

        const subDocItems: Array<Record<string, unknown>> = [];
        const cloudSubDocMap = new Map<string, Record<string, unknown>>();
        const subDocTombstones: TombstoneMap = {};
        if (docsSnap) {
          docsSnap.forEach(d => {
            const data = d.data() as Record<string, unknown>;
            if (data?._deleted === true && typeof data.deletedAt === 'string') {
              const key = getEntitySyncKey(collName, data);
              subDocTombstones[key] = data.deletedAt;
            } else if (data && !data._deleted) {
              const cleaned = { ...data };
              delete cleaned._deleted;
              delete cleaned.deletedAt;
              subDocItems.push(cleaned);
              cloudSubDocMap.set(getEntitySyncKey(collName, cleaned), cleaned);
            }
          });
        }

        const mergedTombstones = mergeTombstoneMaps(
          mergeTombstoneMaps(localTombstones, remoteCollTombstones),
          subDocTombstones
        );

        // Merge cloud (legacy + per-doc) + local via LWW
        const mergedMap = new Map<string, Record<string, unknown>>();
        for (const item of [...legacyItems, ...subDocItems]) {
          const key = getEntitySyncKey(collName, item);
          const prev = mergedMap.get(key);
          mergedMap.set(key, prev ? resolveEntityLWW(prev, item) : item);
        }
        for (const item of localItems) {
          const key = getEntitySyncKey(collName, item);
          const prev = mergedMap.get(key);
          mergedMap.set(key, prev ? resolveEntityLWW(item, prev) : item);
        }

        // Apply tombstones (#1): suppress deleted items unless recreated AFTER deletion timestamp
        const mergedList: Array<Record<string, unknown>> = [];
        for (const [key, item] of mergedMap.entries()) {
          if (isEntityTombstoned(collName, item, mergedTombstones)) {
            continue;
          }
          if (mergedTombstones[key]) {
            delete mergedTombstones[key];
          }
          mergedList.push(item);
        }

        // Persist reconciled list (even when empty []) & tombstones (#1, #2)
        safeStorage.setItem(scopedKey, JSON.stringify(mergedList));
        saveTombstones(collName, mergedTombstones, uid);

        // Delta-push reconciled state (#2 + Spark write reduction)
        const deletedToPush = Object.keys(mergedTombstones);
        await writePerDocCollectionToFirestore(uid, collName, mergedList, deletedToPush, {
          cloudSubDocMap,
          cloudSubDocTombstones: subDocTombstones,
          cloudTombstonesForColl: remoteCollTombstones,
          hasCloudTombstonesSnapshot,
          existingLegacyData,
          hasLegacySnapshot
        });
        totalSynced += mergedList.length;

        // For bilties: delta-sync public verifications & clean up deleted (#3)
        if (collName === 'bilties') {
          const pubDigest = getPublicBiltyDigestCache(uid);
          const pubDeleted = getDeletedPublicBiltyCache(uid);
          let digestDirty = false;
          let deletedDirty = false;

          for (const tombKey of Object.keys(mergedTombstones)) {
            const cleanNo = String(tombKey || '').trim().toUpperCase();
            if (cleanNo && !pubDeleted[cleanNo]) {
              const delOk = await deletePublicBiltyVerification(cleanNo).catch(() => false);
              if (delOk) {
                pubDeleted[cleanNo] = true;
                deletedDirty = true;
              }
            }
            if (cleanNo && pubDigest[cleanNo]) {
              delete pubDigest[cleanNo];
              digestDirty = true;
            }
          }

          let highestBiltySeq = 1000;
          for (const b of mergedList) {
            if (b?.biltyNo) {
              const safePublic = extractPublicBiltyVerification(b as Partial<BiltyRecord> & Record<string, unknown>);
              const serializedPub = JSON.stringify(safePublic);
              if (safePublic.biltyNo) {
                if (pubDeleted[safePublic.biltyNo]) {
                  delete pubDeleted[safePublic.biltyNo];
                  deletedDirty = true;
                }
                if (pubDigest[safePublic.biltyNo] !== serializedPub) {
                  const ok = await syncPublicBiltyVerification(b as Partial<BiltyRecord>).catch(() => false);
                  if (ok) {
                    pubDigest[safePublic.biltyNo] = serializedPub;
                    digestDirty = true;
                  }
                }
              }
              const numPart = parseInt(String(b.biltyNo).replace(/\D/g, ''), 10);
              if (!Number.isNaN(numPart) && numPart > highestBiltySeq && numPart <= 9999) {
                highestBiltySeq = numPart;
              }
            }
          }

          if (digestDirty) savePublicBiltyDigestCache(uid, pubDigest);
          if (deletedDirty) saveDeletedPublicBiltyCache(uid, pubDeleted);

          try {
            const counterRef = doc(db, 'counters', 'biltyCounter');
            const counterSnap = await withTimeout(getDoc(counterRef), 5000).catch(() => null);
            const currentCloudVal =
              counterSnap && counterSnap.exists()
                ? (counterSnap.data()?.currentValue ?? counterSnap.data()?.value ?? 1000)
                : 1000;
            if (highestBiltySeq > currentCloudVal) {
              await setDoc(
                counterRef,
                { currentValue: highestBiltySeq, value: highestBiltySeq, updatedAt: new Date().toISOString() },
                { merge: true }
              ).catch(() => {});
            }
          } catch {
            // non-critical counter sync
          }
        }
      } catch (e) {
        syncErrors++;
        if (isPermissionDeniedError(e)) {
          safeStorage.setItem('ah-last-sync-error', `Permission denied syncing ${collName}`);
        }
        console.warn(`Reconciliation notice for ${collName}:`, e);
      }
    }

    // 4. Reconcile Khata / Ledger
    try {
      const { fetchKhataFromFirestore, syncAllKhataToFirestore, processKhataDocQueue } = await import(
        './ledgerStorage'
      );
      await syncAllKhataToFirestore().catch(() => {});
      await fetchKhataFromFirestore().catch(() => {});
      await processKhataDocQueue().catch(() => {});
    } catch (kErr) {
      console.warn('[KhataSync] reconciliation notice:', kErr);
    }

    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (syncErrors === 0 && queueResult.remaining === 0 && queueResult.blocked === 0) {
      safeStorage.removeItem('ah-last-sync-error');
    }
    notifySyncListeners();

    return {
      synced: syncErrors === 0 && queueResult.blocked === 0,
      count: totalSynced,
      blockedCount: queueResult.blocked
    };
  })();

  activeReconcilePromises.set(uid, runPromise);
  try {
    return await runPromise;
  } finally {
    activeReconcilePromises.delete(uid);
  }
}

export async function loadFromFirestore(uid: string) {
  return autoReconcileAllLocalToCloud(uid);
}

// ---------------------------------------------------------------------------
// Scoped Entities Getters & Setters (#2, #7)
// ---------------------------------------------------------------------------

const INITIAL_TRIPS: Trip[] = [];
const INITIAL_VEHICLES: Vehicle[] = [];
const INITIAL_DRIVERS: Driver[] = [];
const INITIAL_ROUTES: RoutePreset[] = [
  { id: 1, from: 'Lahore', to: 'Karachi Port', dist: 1250, toll: 4800 },
  { id: 2, from: 'Faisalabad', to: 'Rawalpindi', dist: 285, toll: 950 },
  { id: 3, from: 'Multan', to: 'Lahore', dist: 340, toll: 1100 },
  { id: 4, from: 'Sialkot', to: 'Islamabad Dryport', dist: 230, toll: 750 }
];
const INITIAL_FUEL: FuelLogItem[] = [
  { id: 1, date: '09 Sep 2026', diesel: 290.0, petrol: 280.0, cng: 220.0 },
  { id: 2, date: '01 Sep 2026', diesel: 288.5, petrol: 279.0, cng: 220.0 },
  { id: 3, date: '15 Aug 2026', diesel: 285.0, petrol: 275.0, cng: 215.0 }
];

export function getStoredTrips(): Trip[] {
  try {
    const data = getScopedItem('trips');
    return data !== null ? JSON.parse(data) : INITIAL_TRIPS;
  } catch {
    return INITIAL_TRIPS;
  }
}

export function saveStoredTrips(trips: Trip[]): void {
  const prev = getStoredTrips();
  const nowIso = new Date().toISOString();
  const { stamped, changedKeys } = stampMutatedEntities(
    'trips',
    prev as unknown as Array<Record<string, unknown>>,
    trips as unknown as Array<Record<string, unknown>>,
    nowIso
  );
  const { deletedKeys } = recordCollectionMutations('trips', prev as unknown as Array<Record<string, unknown>>, stamped, nowIso);
  setScopedItem('trips', JSON.stringify(stamped));
  void syncToFirestore('trips', stamped, deletedKeys, changedKeys);
  scheduleAmbientSync();
}

export function getStoredVehicles(): Vehicle[] {
  try {
    const data = getScopedItem('vehicles');
    return data !== null ? JSON.parse(data) : INITIAL_VEHICLES;
  } catch {
    return INITIAL_VEHICLES;
  }
}

export function saveStoredVehicles(vehicles: Vehicle[]): void {
  const prev = getStoredVehicles();
  const nowIso = new Date().toISOString();
  const { stamped, changedKeys } = stampMutatedEntities(
    'vehicles',
    prev as unknown as Array<Record<string, unknown>>,
    vehicles as unknown as Array<Record<string, unknown>>,
    nowIso
  );
  const { deletedKeys } = recordCollectionMutations('vehicles', prev as unknown as Array<Record<string, unknown>>, stamped, nowIso);
  setScopedItem('vehicles', JSON.stringify(stamped));
  void syncToFirestore('vehicles', stamped, deletedKeys, changedKeys);
  scheduleAmbientSync();
}

export function getStoredDrivers(): Driver[] {
  try {
    const data = getScopedItem('drivers');
    return data !== null ? JSON.parse(data) : INITIAL_DRIVERS;
  } catch {
    return INITIAL_DRIVERS;
  }
}

export function saveStoredDrivers(drivers: Driver[]): void {
  const prev = getStoredDrivers();
  const nowIso = new Date().toISOString();
  const { stamped, changedKeys } = stampMutatedEntities(
    'drivers',
    prev as unknown as Array<Record<string, unknown>>,
    drivers as unknown as Array<Record<string, unknown>>,
    nowIso
  );
  const { deletedKeys } = recordCollectionMutations('drivers', prev as unknown as Array<Record<string, unknown>>, stamped, nowIso);
  setScopedItem('drivers', JSON.stringify(stamped));
  void syncToFirestore('drivers', stamped, deletedKeys, changedKeys);
  scheduleAmbientSync();
}

export function getStoredRoutes(): RoutePreset[] {
  try {
    const data = getScopedItem('routes');
    return data !== null ? JSON.parse(data) : INITIAL_ROUTES;
  } catch {
    return INITIAL_ROUTES;
  }
}

export function saveStoredRoutes(routes: RoutePreset[]): void {
  const prev = getStoredRoutes();
  const nowIso = new Date().toISOString();
  const { stamped, changedKeys } = stampMutatedEntities(
    'routes',
    prev as unknown as Array<Record<string, unknown>>,
    routes as unknown as Array<Record<string, unknown>>,
    nowIso
  );
  const { deletedKeys } = recordCollectionMutations('routes', prev as unknown as Array<Record<string, unknown>>, stamped, nowIso);
  setScopedItem('routes', JSON.stringify(stamped));
  void syncToFirestore('routes', stamped, deletedKeys, changedKeys);
  scheduleAmbientSync();
}

export function getStoredFuelLog(): FuelLogItem[] {
  try {
    const data = getScopedItem('fuel');
    return data !== null ? JSON.parse(data) : INITIAL_FUEL;
  } catch {
    return INITIAL_FUEL;
  }
}

export function saveStoredFuelLog(items: FuelLogItem[]): void {
  const prev = getStoredFuelLog();
  const nowIso = new Date().toISOString();
  const { stamped, changedKeys } = stampMutatedEntities(
    'fuel',
    prev as unknown as Array<Record<string, unknown>>,
    items as unknown as Array<Record<string, unknown>>,
    nowIso
  );
  const { deletedKeys } = recordCollectionMutations('fuel', prev as unknown as Array<Record<string, unknown>>, stamped, nowIso);
  setScopedItem('fuel', JSON.stringify(stamped));
  void syncToFirestore('fuel', stamped, deletedKeys, changedKeys);
  scheduleAmbientSync();
}

export function getStoredBilties(): BiltyRecord[] {
  try {
    const scopedRaw = getScopedItem('bilties');
    if (scopedRaw === null) {
      return [];
    }
    const parsed = JSON.parse(scopedRaw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }

    const deduped: BiltyRecord[] = [];
    for (const item of parsed as BiltyRecord[]) {
      if (!item || (!item.biltyNo && !item.id)) continue;
      const matchIndex = deduped.findIndex(existing => {
        if (existing.id && item.id && String(existing.id) === String(item.id)) return true;
        const sameVeh = (existing.vehicleNo || '').trim().toUpperCase() === (item.vehicleNo || '').trim().toUpperCase();
        const sameDate = (existing.date || '').trim() === (item.date || '').trim();
        const sameSender = (existing.senderName || '').trim().toLowerCase() === (item.senderName || '').trim().toLowerCase();
        const sameReceiver = (existing.receiverName || '').trim().toLowerCase() === (item.receiverName || '').trim().toLowerCase();
        const sameTotal = Number(existing.total || 0) === Number(item.total || 0);
        const hasVeh = Boolean((existing.vehicleNo || '').trim());
        return sameVeh && sameDate && sameSender && sameReceiver && sameTotal && hasVeh;
      });
      if (matchIndex >= 0) {
        deduped[matchIndex] = resolveEntityLWW(item, deduped[matchIndex]);
      } else {
        deduped.push({ ...item });
      }
    }

    deduped.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

    const usedNumbers = new Set<string>();
    let highestSequence = 1000;
    const finalRecords: BiltyRecord[] = [];

    for (const rec of deduped) {
      let bNo = rec.biltyNo ? String(rec.biltyNo).trim().toUpperCase() : '';
      if (!bNo || usedNumbers.has(bNo)) {
        let candidate = Math.max(highestSequence, 1000) + 1;
        while (candidate <= 9999 && usedNumbers.has(`WG-${String(candidate).padStart(4, '0')}`)) {
          candidate++;
        }
        if (candidate > 9999) {
          candidate = 1001;
          while (candidate <= 9999 && usedNumbers.has(`WG-${String(candidate).padStart(4, '0')}`)) {
            candidate++;
          }
        }
        highestSequence = candidate;
        bNo = `WG-${String(candidate).padStart(4, '0')}`;
      } else {
        const rawDigits = bNo.replace(/\D/g, '');
        const numPart = parseInt(rawDigits.length > 4 ? rawDigits.slice(-4) : rawDigits, 10);
        if (!Number.isNaN(numPart) && numPart >= 1000 && numPart <= 9999) {
          highestSequence = Math.max(highestSequence, numPart);
        }
      }
      usedNumbers.add(bNo);
      finalRecords.push({ ...rec, biltyNo: bNo });
    }

    if (highestSequence > 1000) {
      persistBiltyCounterLocally(highestSequence);
    }

    finalRecords.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
    return finalRecords;
  } catch {
    return [];
  }
}

export function saveStoredBilties(bilties: BiltyRecord[]): void {
  const prevBilties = getStoredBilties();
  const nowIso = new Date().toISOString();
  const { stamped, changedKeys } = stampMutatedEntities(
    'bilties',
    prevBilties as unknown as Array<Record<string, unknown>>,
    bilties as unknown as Array<Record<string, unknown>>,
    nowIso
  );

  const { deletedKeys } = recordCollectionMutations(
    'bilties',
    prevBilties as unknown as Array<Record<string, unknown>>,
    stamped as unknown as Array<Record<string, unknown>>,
    nowIso
  );

  // Strictly scoped save (#7): no shadow owner copies
  setScopedItem('bilties', JSON.stringify(stamped));
  void syncToFirestore('bilties', stamped, deletedKeys, changedKeys);
  scheduleAmbientSync();

  const prevPublicMap = new Map<string, string>();
  for (const prev of prevBilties) {
    if (prev?.biltyNo) {
      const safePrev = extractPublicBiltyVerification(prev as Partial<BiltyRecord> & Record<string, unknown>);
      if (safePrev.biltyNo) {
        prevPublicMap.set(safePrev.biltyNo, JSON.stringify(safePrev));
      }
    }
  }

  const currentBiltyNos = new Set<string>();
  for (const b of stamped) {
    if (!b?.biltyNo) continue;
    const typedB = b as unknown as BiltyRecord;
    const safeCurr = extractPublicBiltyVerification(b);
    if (!safeCurr.biltyNo) continue;
    currentBiltyNos.add(safeCurr.biltyNo);

    const prevJson = prevPublicMap.get(safeCurr.biltyNo);
    const currJson = JSON.stringify(safeCurr);
    if (prevJson !== currJson) {
      syncPublicBiltyVerification(typedB).catch(() => {});
    }
  }

  for (const prevNo of prevPublicMap.keys()) {
    if (!currentBiltyNos.has(prevNo)) {
      deletePublicBiltyVerification(prevNo).catch(() => {});
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('driverdost:bilties_updated', { detail: stamped }));
  }
}

/**
 * Applies a restored collection cleanly while clearing tombstones for restored items
 * and updating timestamps so subsequent cloud sync preserves restored state instead of deleting it.
 */
export function applyRestoredCollection(
  collName: SyncCollectionName,
  restoredItems: Array<Record<string, unknown>>,
  mode: 'merge' | 'overwrite' = 'merge'
): Array<Record<string, unknown>> {
  const scope = getActiveUserScope();
  const nowIso = new Date().toISOString();
  const rawPrev = getScopedItem(collName);
  let prevItems: Array<Record<string, unknown>> = [];
  try {
    prevItems = rawPrev ? JSON.parse(rawPrev) : [];
    if (!Array.isArray(prevItems)) prevItems = [];
  } catch {
    prevItems = [];
  }

  const tombstones = getTombstones(collName, scope);
  const stampedRestored = restoredItems.map(item => {
    const key = getEntitySyncKey(collName, item);
    if (tombstones[key]) delete tombstones[key];
    if (item.id !== undefined && item.id !== null && tombstones[String(item.id)]) {
      delete tombstones[String(item.id)];
    }
    return {
      ...item,
      updatedAt: nowIso
    };
  });

  saveTombstones(collName, tombstones, scope);

  let finalItems: Array<Record<string, unknown>> = [];
  let deletedKeys: string[] = [];

  if (mode === 'overwrite') {
    const res = recordCollectionMutations(collName, prevItems, stampedRestored, nowIso);
    deletedKeys = res.deletedKeys;
    finalItems = stampedRestored;
  } else {
    const mergedMap = new Map<string, Record<string, unknown>>();
    for (const prev of prevItems) {
      mergedMap.set(getEntitySyncKey(collName, prev), prev);
    }
    for (const rest of stampedRestored) {
      const k = getEntitySyncKey(collName, rest);
      const existing = mergedMap.get(k);
      if (!existing) {
        mergedMap.set(k, rest);
      } else {
        // Keep whichever has newer mutation timestamp, or restored if identical
        const existingMs = parseEntityMutationTimeMs(existing);
        const restMs = parseEntityMutationTimeMs(rest);
        mergedMap.set(k, existingMs > restMs ? existing : rest);
      }
    }
    finalItems = Array.from(mergedMap.values());
  }

  setScopedItem(collName, JSON.stringify(finalItems));
  void syncToFirestore(collName, finalItems, deletedKeys);

  if (collName === 'bilties') {
    for (const b of finalItems) {
      if (b?.biltyNo) {
        void syncPublicBiltyVerification(b as Partial<BiltyRecord>).catch(() => {});
      }
    }
    for (const delKey of deletedKeys) {
      void deletePublicBiltyVerification(delKey).catch(() => {});
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('driverdost:bilties_updated', { detail: finalItems }));
    }
  }

  return finalItems;
}

export async function confirmBiltyDelivery(
  bilty: BiltyRecord,
  receiverName: string,
  photoUrl?: string
): Promise<{ success: boolean; offlineQueued: boolean; podConfirmation: PodConfirmation }> {
  const trimmedName = receiverName.trim() || bilty.receiverName || 'Consignee';
  const confirmedAt = new Date().toISOString();
  const podConfirmation: PodConfirmation = {
    receiverName: trimmedName,
    confirmedAt,
    photoUrl: photoUrl || undefined,
    status: 'delivered'
  };

  const updatedBilty: BiltyRecord = {
    ...bilty,
    podConfirmation,
    isDelivered: true,
    receivedBy: trimmedName,
    updatedAt: confirmedAt
  };

  try {
    const stored = getStoredBilties();
    const cleanBiltyNo = String(bilty.biltyNo || '').trim().toUpperCase();
    const updated = stored.map(b => {
      if (String(b.biltyNo).trim().toUpperCase() === cleanBiltyNo || String(b.id) === String(bilty.id)) {
        return {
          ...b,
          podConfirmation,
          isDelivered: true,
          receivedBy: trimmedName,
          updatedAt: confirmedAt
        };
      }
      return b;
    });
    if (stored.some(b => String(b.biltyNo).trim().toUpperCase() === cleanBiltyNo || String(b.id) === String(bilty.id))) {
      setScopedItem('bilties', JSON.stringify(updated));
      syncToFirestore('bilties', updated, [], cleanBiltyNo ? [cleanBiltyNo] : undefined).catch(() => {});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('driverdost:bilties_updated', { detail: updated }));
      }
    }
  } catch (err) {
    console.warn('Local bilty POD update notice:', err);
  }

  const safeData = extractPublicBiltyVerification(
    updatedBilty as Partial<BiltyRecord> & Record<string, unknown>
  );
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;

  if (!isOnline || !db) {
    enqueueOfflineAction('pod_confirmation', safeData);
    return { success: true, offlineQueued: true, podConfirmation };
  }

  try {
    const normalizedNo = safeData.biltyNo;
    if (normalizedNo) {
      const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
      await withTimeout(setDoc(pubRef, safeData), 4000);
    }

    const user = auth.currentUser;
    if (user) {
      const subDocRef = doc(db, 'users', user.uid, 'biltiesDocs', toSafeFirestoreDocId(normalizedNo));
      await setDoc(subDocRef, updatedBilty, { merge: true }).catch(() => {});
    }

    return { success: true, offlineQueued: false, podConfirmation };
  } catch (err) {
    console.warn('POD direct write timed out or failed, enqueuing offline action:', err);
    enqueueOfflineAction('pod_confirmation', safeData);
    return { success: true, offlineQueued: true, podConfirmation };
  }
}

// ---------------------------------------------------------------------------
// Bilty Sequence Counter Helpers (WG-xxxx collision-safe)
// ---------------------------------------------------------------------------

export function persistBiltyCounterLocally(seq: number): void {
  const str = String(seq);
  safeStorage.setItem('wg_bilty_counter', str);
  setScopedItem('bilty-counter', str);
}

export function getStoredHighestBiltySeq(): number {
  let highest = 1000;
  const activeScope = getActiveUserScope();
  const counterKeys = [
    'wg_bilty_counter',
    getScopedStorageKey('bilty-counter', activeScope),
    'wg_v2_guest_bilty-counter',
    'ah-bilty-counter',
    'bilty-counter'
  ];
  for (const k of counterKeys) {
    const val = safeStorage.getItem(k);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!Number.isNaN(parsed) && parsed >= 1000 && parsed <= 9999 && parsed > highest) {
        highest = parsed;
      }
    }
  }

  const bilties = getStoredBilties();
  for (const item of bilties) {
    if (item?.biltyNo) {
      const rawDigits = String(item.biltyNo).replace(/\D/g, '');
      const numPart = parseInt(rawDigits.length > 4 ? rawDigits.slice(-4) : rawDigits, 10);
      if (!Number.isNaN(numPart) && numPart >= 1000 && numPart <= 9999 && numPart > highest) {
        highest = numPart;
      }
    }
  }

  return highest;
}

export function findNextAvailableBiltySeq(startCandidate: number): number {
  const activeNums = new Set<number>();
  for (const b of getStoredBilties()) {
    if (!b?.biltyNo) continue;
    const rawDigits = String(b.biltyNo).replace(/\D/g, '');
    const parsed = parseInt(rawDigits.length > 4 ? rawDigits.slice(-4) : rawDigits, 10);
    if (!Number.isNaN(parsed) && parsed >= 1001 && parsed <= 9999) {
      activeNums.add(parsed);
    }
  }

  const first = startCandidate >= 1001 && startCandidate <= 9999 ? startCandidate : 1001;
  for (let n = first; n <= 9999; n++) {
    if (!activeNums.has(n)) return n;
  }
  for (let n = 1001; n < first; n++) {
    if (!activeNums.has(n)) return n;
  }
  throw new Error('WG-xxxx capacity reached (all 8999 active numbers in use). Please archive/delete old records.');
}

export async function checkBiltyNoConflict(
  biltyNo: string,
  excludeId?: number | string
): Promise<{ conflict: boolean; source?: 'local' | 'cloud' }> {
  const normalized = String(biltyNo || '').trim().toUpperCase();
  if (!normalized) return { conflict: false };

  const localDup = getStoredBilties().some(
    b =>
      String(b.biltyNo || '').trim().toUpperCase() === normalized &&
      (excludeId === undefined || String(b.id) !== String(excludeId))
  );
  if (localDup) {
    return { conflict: true, source: 'local' };
  }

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (isOnline && db && auth.currentUser) {
    try {
      const snap = await withTimeout(getDoc(doc(db, 'publicBiltyVerifications', normalized)), 2500);
      if (snap && snap.exists()) {
        return { conflict: true, source: 'cloud' };
      }
    } catch {
      // Fail open offline/timeout
    }
  }
  return { conflict: false };
}

export async function allocateNextBiltyNumber(_userUid?: string): Promise<string> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const user = auth.currentUser;
  const baseline = getStoredHighestBiltySeq();

  if (isOnline && db && user) {
    try {
      const counterDocRef = doc(db, 'counters', 'biltyCounter');
      const nextSeq = await withTimeout(
        runTransaction(db, async transaction => {
          const snap = await transaction.get(counterDocRef);
          let cloudCurrent = 1000;
          if (snap.exists()) {
            const d = snap.data();
            const rawVal = d?.currentValue ?? d?.value;
            const parsed = typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal || ''), 10);
            if (!Number.isNaN(parsed) && parsed >= 1000 && parsed <= 9999) {
              cloudCurrent = parsed;
            }
          }
          const next = findNextAvailableBiltySeq(Math.max(cloudCurrent, baseline) + 1);
          transaction.set(
            counterDocRef,
            {
              currentValue: next,
              value: next,
              updatedAt: new Date().toISOString()
            },
            { merge: true }
          );
          return next;
        }),
        8000
      );

      persistBiltyCounterLocally(nextSeq);
      return `WG-${String(nextSeq).padStart(4, '0')}`;
    } catch (err) {
      console.warn('Firestore counter transaction error, falling back to local monotonic sequence:', err);
    }
  }

  const nextLocalSeq = findNextAvailableBiltySeq(baseline + 1);
  persistBiltyCounterLocally(nextLocalSeq);

  return `WG-${String(nextLocalSeq).padStart(4, '0')}`;
}

export function getNextBiltyNo(): string {
  const baseline = getStoredHighestBiltySeq();
  const nextNo = findNextAvailableBiltySeq(baseline + 1);
  persistBiltyCounterLocally(nextNo);
  return `WG-${String(nextNo).padStart(4, '0')}`;
}

// ---------------------------------------------------------------------------
// Ambient Synchronization Engine
// ---------------------------------------------------------------------------

let ambientSyncTimer: ReturnType<typeof setTimeout> | null = null;
let isReconcilingAmbient = false;
let lastAmbientRunAtMs = 0;

export function scheduleAmbientSync(delayMs = 350): void {
  if (typeof window === 'undefined') return;
  if (ambientSyncTimer) clearTimeout(ambientSyncTimer);

  ambientSyncTimer = setTimeout(async () => {
    if (isReconcilingAmbient) return;
    const isOnline = typeof navigator === 'undefined' || navigator.onLine;
    if (!isOnline) {
      notifySyncListeners();
      return;
    }

    const nowMs = Date.now();
    const pendingQueue = getStoredOfflineQueue().length;
    if (pendingQueue === 0 && lastAmbientRunAtMs > 0 && nowMs - lastAmbientRunAtMs < MIN_AMBIENT_SYNC_COOLDOWN_MS) {
      return;
    }

    isReconcilingAmbient = true;
    notifySyncListeners();

    try {
      const user = auth.currentUser;
      if (user) {
        const res = await autoReconcileAllLocalToCloud(user.uid);
        lastAmbientRunAtMs = Date.now();
        if (res.synced) {
          safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
          safeStorage.removeItem('ah-last-sync-error');
        }
      } else {
        safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
      }
    } catch (e) {
      console.warn('[AmbientSync] silent pass note:', e);
    } finally {
      isReconcilingAmbient = false;
      notifySyncListeners();
    }
  }, delayMs);
}

let ambientEngineInitialized = false;

export function initAmbientSyncEngine(): () => void {
  if (ambientEngineInitialized || typeof window === 'undefined') return () => {};
  ambientEngineInitialized = true;

  const handleOnline = () => scheduleAmbientSync(100);
  const handleOffline = () => notifySyncListeners();
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') scheduleAmbientSync(200);
  };
  const handleFocus = () => scheduleAmbientSync(200);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('focus', handleFocus);

  const sweepInterval = setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine && document.visibilityState === 'visible') {
      scheduleAmbientSync(100);
    }
  }, 4 * 60 * 1000);

  scheduleAmbientSync(500);

  return () => {
    ambientEngineInitialized = false;
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('focus', handleFocus);
    clearInterval(sweepInterval);
  };
}

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const blockedCount = queue.filter(q => q.status === 'blocked').length;
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (isReconcilingAmbient) {
    status = 'syncing';
  } else if (blockedCount > 0 || lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    blockedCount,
    lastSyncTime,
    lastError,
    errorsList: [
      ...queue
        .filter(q => q.status === 'blocked' && q.lastError)
        .map(q => ({
          id: String(q.id),
          timestamp: q.timestamp,
          message: q.lastError || `Blocked syncing ${q.type}`,
          retryCount: q.retryCount,
          status: 'blocked' as const
        })),
      ...errorLogs.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        message: `${e.action}: ${e.error}`,
        status: 'retrying' as const
      }))
    ]
  };
}

export async function triggerManualSync(): Promise<{
  success: boolean;
  processed: number;
  remaining: number;
  blocked: number;
  errors: string[];
}> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      blocked: 0,
      errors: ['Device is currently offline']
    };
  }

  const user = auth.currentUser;
  if (!user) {
    clearErrorLogs();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    safeStorage.removeItem('ah-last-sync-error');
    notifySyncListeners();
    return {
      success: true,
      processed: 0,
      remaining: 0,
      blocked: 0,
      errors: []
    };
  }

  try {
    const result = await processOfflineQueue();
    const reconcileRes = await autoReconcileAllLocalToCloud(user.uid).catch(() => ({
      synced: false,
      count: 0,
      blockedCount: result.blocked
    }));
    const totalProcessed = result.processed + reconcileRes.count;

    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0 || result.blocked > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0] || 'Some records failed permission check');
    } else if (result.remaining === 0) {
      safeStorage.removeItem('ah-last-sync-error');
    }
    notifySyncListeners();

    return {
      success: result.blocked === 0 && result.errors.length === 0 && reconcileRes.synced,
      processed: totalProcessed,
      remaining: result.remaining,
      blocked: result.blocked,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    notifySyncListeners();
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      blocked: 0,
      errors: [errorMsg]
    };
  }
}

// ---------------------------------------------------------------------------
// Document Access Config (Centralized Owner Helpers #28)
// ---------------------------------------------------------------------------

export interface BiltyAccessConfigData {
  allowedUIDs: string[];
  allowedEmails: string[];
}

export function normalizeBiltyConfig(data: unknown): BiltyAccessConfigData {
  const obj = data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const allowedUIDs: string[] = Array.isArray(obj.allowedUIDs)
    ? obj.allowedUIDs.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];
  const rawEmails = Array.isArray(obj.allowedEmails) ? obj.allowedEmails.filter(Boolean) : [];
  const mergedEmails = [...DEFAULT_AUTHORIZED_EMAILS, ...rawEmails.map(e => normalizeEmail(String(e)))];
  const allowedEmails = Array.from(new Set(mergedEmails.filter(Boolean)));
  return { allowedUIDs, allowedEmails };
}

export async function getBiltyAccessConfig(): Promise<BiltyAccessConfigData> {
  if (isOwnerEmail(auth.currentUser?.email) && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const accessRef = doc(db, 'access', 'biltyAccess');
      const snap = await withTimeout(getDoc(accessRef), 3000);
      if (snap.exists()) {
        const config = normalizeBiltyConfig(snap.data());
        setScopedItem('bilty-allowed-uids', JSON.stringify(config.allowedUIDs));
        setScopedItem('bilty-allowed-emails', JSON.stringify(config.allowedEmails));
        safeStorage.setItem('wg_global_bilty_allowed_uids', JSON.stringify(config.allowedUIDs));
        safeStorage.setItem('wg_global_bilty_allowed_emails', JSON.stringify(config.allowedEmails));
        return config;
      }
    } catch (err: unknown) {
      if (!isPermissionDeniedError(err)) {
        console.warn('Could not fetch remote access config, using local cache:', err);
      }
    }
  }

  try {
    const cachedUIDs =
      safeStorage.getItem('wg_global_bilty_allowed_uids') || getScopedItem('bilty-allowed-uids');
    const cachedEmails =
      safeStorage.getItem('wg_global_bilty_allowed_emails') || getScopedItem('bilty-allowed-emails');
    const parsedUIDs: string[] = cachedUIDs ? JSON.parse(cachedUIDs) : [];
    const parsedEmails: string[] = cachedEmails ? JSON.parse(cachedEmails) : [];
    const mergedEmails = Array.from(
      new Set([...DEFAULT_AUTHORIZED_EMAILS, ...parsedEmails.map(normalizeEmail)].filter(Boolean))
    );
    return {
      allowedUIDs: Array.isArray(parsedUIDs) ? parsedUIDs : [],
      allowedEmails: mergedEmails
    };
  } catch {
    return { allowedUIDs: [], allowedEmails: [...DEFAULT_AUTHORIZED_EMAILS] };
  }
}

export function subscribeToBiltyAccess(onUpdate: (config: BiltyAccessConfigData) => void): Unsubscribe {
  if (!isOwnerEmail(auth.currentUser?.email)) {
    return () => {};
  }
  try {
    const accessRef = doc(db, 'access', 'biltyAccess');
    return onSnapshot(
      accessRef,
      docSnap => {
        if (docSnap.exists()) {
          const config = normalizeBiltyConfig(docSnap.data());
          setScopedItem('bilty-allowed-uids', JSON.stringify(config.allowedUIDs));
          setScopedItem('bilty-allowed-emails', JSON.stringify(config.allowedEmails));
          safeStorage.setItem('wg_global_bilty_allowed_uids', JSON.stringify(config.allowedUIDs));
          safeStorage.setItem('wg_global_bilty_allowed_emails', JSON.stringify(config.allowedEmails));
          onUpdate(config);
        }
      },
      err => {
        if (!isPermissionDeniedError(err)) {
          console.warn('Access real-time subscription error:', err);
        }
      }
    );
  } catch {
    return () => {};
  }
}

export async function updateBiltyAccessInFirestore(
  allowedUIDs: string[],
  allowedEmails: string[] = []
): Promise<void> {
  if (!isOwnerEmail(auth.currentUser?.email)) {
    console.warn('Unauthorized attempt to update access configuration.');
    return;
  }
  const cleanUIDs = Array.from(new Set(allowedUIDs.filter(Boolean)));
  const cleanEmails = Array.from(new Set(allowedEmails.map(normalizeEmail).filter(Boolean)));

  try {
    setScopedItem('bilty-allowed-uids', JSON.stringify(cleanUIDs));
    setScopedItem('bilty-allowed-emails', JSON.stringify(cleanEmails));
    safeStorage.setItem('wg_global_bilty_allowed_uids', JSON.stringify(cleanUIDs));
    safeStorage.setItem('wg_global_bilty_allowed_emails', JSON.stringify(cleanEmails));
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const accessRef = doc(db, 'access', 'biltyAccess');
      await withTimeout(
        setDoc(
          accessRef,
          {
            allowedUIDs: cleanUIDs,
            allowedEmails: cleanEmails,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        ),
        3000
      );
    }
  } catch (err) {
    console.warn('Failed saving access config to firestore:', err);
  }
}

// Re-export removeScopedItem for modules/tests performing full key resets cleanly
export { removeScopedItem };
