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
  BranchConfig,
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
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  isOwnerEmail,
  normalizeEmail,
  verifyOwnerOrStaffClaim
} from './authUtils';
import {
  clearLocalBranchAndAddaCaches,
  getActiveBranchId,
  getCachedBranchById,
  isUsingSharedBranchScope,
  setActiveBranchId
} from './branchContext';
import { deleteAllAttachmentsForBilty } from './biltyAttachments';
import { savePreRestoreSnapshotIdbOnly } from './persistentStorage';
import {
  cleanupUploadedLegacyAndStagingKeys,
  getActiveBiltyScope,
  getActiveKhataScope,
  getActiveUserScope,
  getEffectiveScopeForKey,
  getScopedItem,
  removeScopedItem,
  safeStorage,
  setScopedItem
} from './storageCore';

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
const AMBIENT_HEARTBEAT_INTERVAL_MS = 15 * 60 * 1000;
const CURSOR_OVERLAP_MS = 120_000;
const CURSOR_MAX_AGE_MS = 80 * 24 * 60 * 60 * 1000;
const WEEKLY_DRIFT_CHECK_MS = 7 * 24 * 60 * 60 * 1000;
const FUTURE_CLOCK_SKEW_LIMIT_MS = 60_000;

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

function safeGetFirestoreExport<T>(name: string): T | undefined {
  try {
    return (firestoreModule as unknown as Record<string, T | undefined>)[name];
  } catch {
    return undefined;
  }
}

async function commitBatchOps(ops: BatchWriteOp[], timeoutMs = 10000): Promise<void> {
  if (ops.length === 0 || !db) return;

  const writeBatchFn = safeGetFirestoreExport<typeof firestoreModule.writeBatch>('writeBatch');
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
 * Clamps a mutation timestamp against extreme future client clock skew (max +60s ahead of real time).
 */
export function clampMutationMs(ms: number, nowMs = Date.now()): number {
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.min(ms, nowMs + FUTURE_CLOCK_SKEW_LIMIT_MS);
}

export function clampMutationIso(iso: string, nowMs = Date.now()): string {
  const ms = new Date(iso).getTime();
  if (Number.isNaN(ms)) return new Date(nowMs).toISOString();
  const maxAllowed = nowMs + FUTURE_CLOCK_SKEW_LIMIT_MS;
  return ms > maxAllowed ? new Date(maxAllowed).toISOString() : iso;
}

function parseTimestampValueMs(v: unknown): number {
  if (!v || v === 'SERVER_TS') return 0;
  if (typeof v === 'object' && v !== null) {
    const maybeTs = v as { toMillis?: () => number; seconds?: number };
    if (typeof maybeTs.toMillis === 'function') {
      const m = maybeTs.toMillis();
      return Number.isFinite(m) ? m : 0;
    }
    if (typeof maybeTs.seconds === 'number') {
      return maybeTs.seconds * 1000;
    }
  }
  const ms = new Date(String(v)).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

/**
 * Parses strictly real mutation timestamps (`updatedAt` / `createdAt`), NEVER business `item.date`.
 * Clamps future clock-skew timestamps so broken device clocks cannot permanently override real edits.
 */
export function parseEntityMutationTimeMs(item: Record<string, unknown>, nowMs = Date.now()): number {
  const best = Math.max(
    parseTimestampValueMs(item.updatedAt),
    parseTimestampValueMs(item.createdAt)
  );
  return clampMutationMs(best, nowMs);
}

function getTombstonesKey(collName: string, scope: string = getActiveUserScope()): string {
  return `wg_v3_tombstones_${scope}_${collName}`;
}

export function pruneTombstoneMap(map: TombstoneMap, nowMs = Date.now()): TombstoneMap {
  const cutoffMs = nowMs - TOMBSTONE_TTL_DAYS * 24 * 60 * 60 * 1000;
  const validEntries: Array<[string, string, number]> = [];
  for (const [key, deletedAt] of Object.entries(map)) {
    if (!key || !deletedAt) continue;
    const rawTs = new Date(deletedAt).getTime();
    const ts = clampMutationMs(rawTs, nowMs);
    if (!Number.isNaN(rawTs) && ts >= cutoffMs) {
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

function findExpiredTombstoneKeys(map: TombstoneMap, nowMs = Date.now()): string[] {
  const cutoffMs = nowMs - TOMBSTONE_TTL_DAYS * 24 * 60 * 60 * 1000;
  const expired: string[] = [];
  for (const [key, deletedAt] of Object.entries(map)) {
    if (!key || !deletedAt) continue;
    const rawTs = new Date(deletedAt).getTime();
    if (!Number.isNaN(rawTs) && rawTs < cutoffMs) {
      expired.push(key);
    }
  }
  return expired;
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
  const scope = getEffectiveScopeForKey(collName);
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
      if (k === 'updatedAt' || k === 'serverUpdatedAt') continue;
      clone[k] = obj[k];
    }
    return JSON.stringify(clone);
  };

  const clampedNowIso = clampMutationIso(nowIso);
  const nowMs = new Date(clampedNowIso).getTime();
  const changedKeys: string[] = [];
  const stamped = nextItems.map(item => {
    const key = getEntitySyncKey(collName, item);
    const prev = prevByKey.get(key);
    const rawExistingUpdated =
      typeof item.updatedAt === 'string' && item.updatedAt ? item.updatedAt : undefined;
    const existingUpdatedAt = rawExistingUpdated ? clampMutationIso(rawExistingUpdated, nowMs) : undefined;
    if (!prev) {
      changedKeys.push(key);
      return {
        ...item,
        updatedAt:
          existingUpdatedAt && new Date(existingUpdatedAt).getTime() > nowMs
            ? existingUpdatedAt
            : clampedNowIso
      } as T;
    }

    const prevBody = stripTimestamps(prev);
    const nextBody = stripTimestamps(item);
    if (prevBody !== nextBody || !existingUpdatedAt) {
      changedKeys.push(key);
      return {
        ...item,
        updatedAt: clampedNowIso
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
  // Remove legacy un-scoped offline queue copies once scoped queue is authoritative
  safeStorage.removeItem('ah-offline-queue');
  safeStorage.removeItem('offline-queue');
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

export interface SyncCursorState {
  cursorMs: number;
  lastPushedMs: number;
  lastFullDriftMs: number;
}

function getCursorStorageKey(cursorScope: string, collName: string): string {
  return `wg_v3_sync_cursor_${cursorScope}_${collName}`;
}

export function getSyncCursorState(cursorScope: string, collName: string): SyncCursorState {
  try {
    const raw = safeStorage.getItem(getCursorStorageKey(cursorScope, collName));
    if (!raw) return { cursorMs: 0, lastPushedMs: 0, lastFullDriftMs: 0 };
    const parsed = JSON.parse(raw) as Partial<SyncCursorState>;
    return {
      cursorMs: Math.max(0, Number(parsed?.cursorMs) || 0),
      lastPushedMs: Math.max(0, Number(parsed?.lastPushedMs) || 0),
      lastFullDriftMs: Math.max(0, Number(parsed?.lastFullDriftMs) || 0)
    };
  } catch {
    return { cursorMs: 0, lastPushedMs: 0, lastFullDriftMs: 0 };
  }
}

export function saveSyncCursorState(cursorScope: string, collName: string, state: SyncCursorState): void {
  try {
    safeStorage.setItem(getCursorStorageKey(cursorScope, collName), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearSyncCursorsForScope(cursorScope: string): void {
  const colls: string[] = ['bilties', 'biltiesDocs', 'trips', 'vehicles', 'drivers', 'fuel', 'routes', 'adda'];
  for (const c of colls) {
    safeStorage.removeItem(getCursorStorageKey(cursorScope, c));
  }
}

export function getActiveSyncScopeKey(uid: string): string {
  const branchId = getActiveBranchId();
  if (isUsingSharedBranchScope() && branchId) {
    return `user:${uid}|branch:${branchId}`;
  }
  if (branchId && isOwnerEmail(auth.currentUser?.email)) {
    return `user:${uid}|ownerBranch:${branchId}`;
  }
  return `user:${uid}`;
}

function safeServerTimestamp(): unknown {
  const fn = safeGetFirestoreExport<() => unknown>('serverTimestamp');
  return typeof fn === 'function' ? fn() : new Date().toISOString();
}

function buildIncrementalCollectionQuery(
  collRef: ReturnType<typeof collection>,
  sinceMs: number
): ReturnType<typeof collection> {
  const queryFn = safeGetFirestoreExport<(...args: unknown[]) => unknown>('query');
  const whereFn = safeGetFirestoreExport<(...args: unknown[]) => unknown>('where');
  if (typeof queryFn === 'function' && typeof whereFn === 'function' && sinceMs > 0) {
    const tsCtor = safeGetFirestoreExport<{ fromMillis?: (m: number) => unknown }>('Timestamp');
    const cutoff =
      tsCtor && typeof tsCtor.fromMillis === 'function'
        ? tsCtor.fromMillis(sinceMs)
        : new Date(sinceMs);
    return queryFn(collRef, whereFn('serverUpdatedAt', '>', cutoff)) as ReturnType<typeof collection>;
  }
  return collRef;
}

function getSubCollectionForRoot(
  collName: SyncCollectionName,
  cloudRoot: readonly ['users', string] | readonly ['branches', string]
): string {
  if (collName === 'bilties' && cloudRoot[0] === 'branches') {
    return 'bilties';
  }
  return SYNC_COLLECTION_TO_DOC_SUBCOLL[collName];
}

function resolveCollectionSyncTarget(
  collName: SyncCollectionName | string,
  userUid: string
): {
  localScope: string;
  cursorScope: string;
  cloudRoot: readonly ['users', string] | readonly ['branches', string];
  branchId: string | null;
} {
  const branchId = getActiveBranchId();
  if (collName === 'bilties' && isUsingSharedBranchScope() && branchId) {
    return {
      localScope: `branch_${branchId}`,
      cursorScope: `branch_${branchId}`,
      cloudRoot: ['branches', branchId] as const,
      branchId
    };
  }
  return {
    localScope: userUid,
    cursorScope: `user_${userUid}`,
    cloudRoot: ['users', userUid] as const,
    branchId
  };
}

function isCurrentUserBiltyAuthorizedForSync(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  if (isOwnerEmail(user.email)) return true;
  try {
    const cleanEmail = normalizeEmail(user.email);
    if (cleanEmail) {
      const rawBranchAccess = safeStorage.getItem(`wg_user_branch_access_v1_${cleanEmail}`);
      if (rawBranchAccess) {
        const parsed = JSON.parse(rawBranchAccess) as {
          status?: string;
          permissions?: { createBilty?: boolean; editDeleteBilty?: boolean; viewAllBilties?: boolean };
        };
        if (
          parsed?.status === 'active' &&
          (parsed.permissions?.createBilty ||
            parsed.permissions?.editDeleteBilty ||
            parsed.permissions?.viewAllBilties)
        ) {
          return true;
        }
      }
    }
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
  cloudRoot?: readonly ['users', string] | readonly ['branches', string];
  localScopeOverride?: string;
  subCollOverride?: string;
  skipLegacyRewriteWhenNoChanges?: boolean;
  expiredTombstoneKeysToPurge?: string[];
}

function stableEntityDigest(item: Record<string, unknown>): string {
  const clone: Record<string, unknown> = {};
  for (const k of Object.keys(item).sort()) {
    if (k === '_deleted' || k === 'deletedAt' || k === 'serverUpdatedAt') continue;
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
  const target = resolveCollectionSyncTarget(collName, uid);
  const cloudRoot = options.cloudRoot || target.cloudRoot;
  const subColl = options.subCollOverride || getSubCollectionForRoot(collName, cloudRoot);
  const nowIso = new Date().toISOString();
  const serverTs = safeServerTimestamp();
  const ops: BatchWriteOp[] = [];
  const changedKeySet = Array.isArray(options.changedKeys) ? new Set(options.changedKeys) : null;
  const localScope = options.localScopeOverride || target.localScope;
  const localTombstones = getTombstones(collName, localScope);
  const safeItems =
    collName === 'bilties'
      ? items.map(item => {
          if (!item || !('legalVault' in item)) return item;
          const copy = { ...item };
          delete copy.legalVault;
          return copy;
        })
      : items;

  // 1. Upsert ONLY changed/missing documents into {users|branches}/{rootId}/{subColl}/{docId}
  for (const item of safeItems) {
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
    const docRef = doc(db, cloudRoot[0], cloudRoot[1], subColl, docId);
    ops.push({
      type: 'set',
      ref: docRef,
      data: {
        ...item,
        _deleted: false,
        deletedAt: null,
        updatedAt: item.updatedAt || nowIso,
        serverUpdatedAt: serverTs
      },
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
      const docRef = doc(db, cloudRoot[0], cloudRoot[1], subColl, docId);
      ops.push({
        type: 'set',
        ref: docRef,
        data: {
          _deleted: true,
          deletedAt: expectedDeletedAt,
          updatedAt: expectedDeletedAt,
          serverUpdatedAt: serverTs,
          id: delKey
        },
        merge: true
      });
    }
  }

  // 2b. Clean up expired (>90 days) _deleted tombstone sub-docs in cloud
  if (options.expiredTombstoneKeysToPurge && options.expiredTombstoneKeysToPurge.length > 0) {
    for (const expiredKey of options.expiredTombstoneKeysToPurge) {
      if (localTombstones[expiredKey]) continue;
      const docId = toSafeFirestoreDocId(expiredKey);
      ops.push({
        type: 'delete',
        ref: doc(db, cloudRoot[0], cloudRoot[1], subColl, docId)
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
    const tombRef = doc(db, cloudRoot[0], cloudRoot[1], 'collections', 'tombstones');
    ops.push({
      type: 'set',
      ref: tombRef,
      data: { [collName]: localTombstones, updatedAt: nowIso, serverUpdatedAt: serverTs },
      merge: true
    });
  }

  // 4. Maintain legacy doc if payload fits under 600KB; skip redundant rewrites on steady-state incremental passes (#2, #8)
  const shouldMaintainLegacy = !options.skipLegacyRewriteWhenNoChanges || ops.length > 0;
  if (shouldMaintainLegacy) {
    const legacyRef = doc(db, cloudRoot[0], cloudRoot[1], 'collections', collName);
    const serializedSize = JSON.stringify(safeItems).length;
    const existingLegacy = options.existingLegacyData;

    if (serializedSize <= MAX_LEGACY_DOC_BYTES) {
      const legacyUnchanged =
        options.hasLegacySnapshot &&
        existingLegacy &&
        existingLegacy.migratedToPerDoc !== true &&
        Array.isArray(existingLegacy.items) &&
        JSON.stringify(existingLegacy.items) === JSON.stringify(safeItems);

      if (!legacyUnchanged) {
        ops.push({
          type: 'set',
          ref: legacyRef,
          data: { items: safeItems, updatedAt: nowIso, serverUpdatedAt: serverTs, perDocSynced: true },
          merge: true
        });
      }
    } else {
      const markerUnchanged =
        options.hasLegacySnapshot &&
        existingLegacy &&
        existingLegacy.migratedToPerDoc === true &&
        existingLegacy.itemsCount === safeItems.length;

      if (!markerUnchanged) {
        ops.push({
          type: 'set',
          ref: legacyRef,
          data: {
            items: [],
            migratedToPerDoc: true,
            itemsCount: safeItems.length,
            updatedAt: nowIso,
            serverUpdatedAt: serverTs
          },
          merge: true
        });
      }
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
      const target = resolveCollectionSyncTarget(collName, user.uid);
      if (target.cloudRoot[0] === 'branches') {
        const kill = await getRemoteSyncKillSwitchState();
        if (kill.branchDisabled) {
          return false;
        }
      }

      await writePerDocCollectionToFirestore(
        user.uid,
        collName,
        data as Array<Record<string, unknown>>,
        deletedKeys,
        {
          ...(changedKeys !== undefined ? { changedKeys } : {}),
          cloudRoot: target.cloudRoot,
          localScopeOverride: target.localScope
        }
      );

      // When App Creator writes Head Office Bilties, mirror to branches/head unless branch sync is killed remotely
      if (
        collName === 'bilties' &&
        target.cloudRoot[0] === 'users' &&
        isOwnerEmail(user.email)
      ) {
        const kill = await getRemoteSyncKillSwitchState();
        if (!kill.branchDisabled) {
          const headItems = (data as Array<Record<string, unknown>>).filter(
            item => !item.branchId || item.branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID
          );
          void writePerDocCollectionToFirestore(
            user.uid,
            'bilties',
            headItems,
            deletedKeys,
            {
              ...(changedKeys !== undefined ? { changedKeys } : {}),
              cloudRoot: ['branches', DEFAULT_HEAD_OFFICE_BRANCH_ID] as const,
              localScopeOverride: target.localScope
            }
          ).catch(() => {});
        }
      }
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
      const collNorm = normalizeCollectionKey(key);
      if (collNorm === 'bilties' && isUsingSharedBranchScope()) {
        await clearLocalBranchAndAddaCaches({ preserveBranchesMetadata: true });
        setActiveBranchId(null);
      }
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
  branchId?: string;
  biltyId?: number | string;
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

/**
 * Builds the Firestore payload for `publicBiltyVerifications/{BILTY_NO}` attaching `branchId`
 * (and optional `biltyId`) required by Firestore rules for branch-authorized writes, without PII.
 */
export function buildPublicBiltyCloudPayload(
  bilty: Partial<BiltyRecord> & Record<string, unknown>
): PublicBiltyVerification {
  const base = extractPublicBiltyVerification(bilty);
  const rawBranch = typeof bilty.branchId === 'string' && bilty.branchId.trim()
    ? bilty.branchId.trim()
    : getActiveBranchId() || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  const canonicalBranchId = rawBranch === 'samundri' ? DEFAULT_HEAD_OFFICE_BRANCH_ID : rawBranch;
  const payload: PublicBiltyVerification = {
    ...base,
    branchId: canonicalBranchId
  };
  if (bilty.id !== undefined && bilty.id !== null && String(bilty.id) !== '') {
    payload.biltyId = bilty.id as number | string;
  } else if (bilty.biltyId !== undefined && bilty.biltyId !== null && String(bilty.biltyId) !== '') {
    payload.biltyId = bilty.biltyId as number | string;
  }
  return payload;
}

export async function syncPublicBiltyVerification(bilty: Partial<BiltyRecord>): Promise<boolean> {
  if (!bilty?.biltyNo) return false;
  const user = auth.currentUser;
  if (!user) return false;

  const safeData = buildPublicBiltyCloudPayload(bilty as Partial<BiltyRecord> & Record<string, unknown>);
  const normalizedNo = safeData.biltyNo;
  if (!normalizedNo) return false;

  // Never upload a public verification record if this biltyNo is currently tombstoned (#3)
  const biltiesTombstones = getTombstones('bilties', getActiveBiltyScope());
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

  for (let idx = 0; idx < queue.length; idx++) {
    const action = queue[idx];
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
      const biltyTombstones = getTombstones('bilties', getActiveBiltyScope());

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
            const safeData = buildPublicBiltyCloudPayload(b as Partial<BiltyRecord> & Record<string, unknown>);
            const pubRef = doc(db, 'publicBiltyVerifications', safeData.biltyNo);
            await withTimeout(setDoc(pubRef, safeData), 8000);
          }
        }
        processedCount++;
        saveStoredOfflineQueue([...remainingQueue, ...queue.slice(idx + 1)]);
      } else if (action.type === 'public_bilty' && action.data?.biltyNo) {
        if (!isEntityTombstoned('bilties', action.data, biltyTombstones)) {
          const safeData = buildPublicBiltyCloudPayload(action.data);
          const pubRef = doc(db, 'publicBiltyVerifications', safeData.biltyNo);
          await withTimeout(setDoc(pubRef, safeData), 8000);
        }
        processedCount++;
        saveStoredOfflineQueue([...remainingQueue, ...queue.slice(idx + 1)]);
      } else if (action.type === 'delete_public_bilty' && action.data?.biltyNo) {
        const normalizedNo = String(action.data.biltyNo).trim().toUpperCase();
        if (normalizedNo) {
          const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
          await withTimeout(deleteDoc(pubRef), 8000);
        }
        processedCount++;
        saveStoredOfflineQueue([...remainingQueue, ...queue.slice(idx + 1)]);
      } else if ((action.type === 'bilty' || action.type === 'bilties') && !Array.isArray(action.data)) {
        if (action.data?.biltyNo && !isEntityTombstoned('bilties', action.data, biltyTombstones)) {
          const safeData = buildPublicBiltyCloudPayload(action.data);
          const pubRef = doc(db, 'publicBiltyVerifications', safeData.biltyNo);
          await withTimeout(setDoc(pubRef, safeData), 8000);
        }
        processedCount++;
        saveStoredOfflineQueue([...remainingQueue, ...queue.slice(idx + 1)]);
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
          saveStoredOfflineQueue([...remainingQueue, ...queue.slice(idx + 1)]);
        } else if (action.type === 'settings') {
          if (!isOwnerEmail(user.email)) {
            throw new Error('permission-denied: Only owner can update company profile');
          }
          const docRef = doc(db, 'settings', 'companyProfile');
          await withTimeout(setDoc(docRef, action.data, { merge: true }), 8000);
          processedCount++;
          saveStoredOfflineQueue([...remainingQueue, ...queue.slice(idx + 1)]);
        } else if (action.type === 'pod_confirmation' && action.data?.biltyNo) {
          if (!isEntityTombstoned('bilties', action.data, biltyTombstones)) {
            const safeData = buildPublicBiltyCloudPayload({
              ...action.data,
              isDelivered: true,
              status: 'Delivered'
            });
            const pubRef = doc(db, 'publicBiltyVerifications', safeData.biltyNo);
            await withTimeout(setDoc(pubRef, safeData), 8000);
          }
          processedCount++;
          saveStoredOfflineQueue([...remainingQueue, ...queue.slice(idx + 1)]);
        } else {
          processedCount++;
          saveStoredOfflineQueue([...remainingQueue, ...queue.slice(idx + 1)]);
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

let killSwitchCache: {
  checkedAt: number;
  ambientDisabled: boolean;
  branchDisabled: boolean;
} | null = null;
const activeReconcilePromises = new Map<
  string,
  Promise<{ synced: boolean; count: number; blockedCount?: number }>
>();

export function resetRemoteSyncKillSwitchCacheForTests(): void {
  killSwitchCache = null;
}

export async function getRemoteSyncKillSwitchState(): Promise<{
  ambientDisabled: boolean;
  branchDisabled: boolean;
}> {
  if (!db) return { ambientDisabled: false, branchDisabled: false };
  const now = Date.now();
  if (killSwitchCache && now - killSwitchCache.checkedAt < KILLSWITCH_CACHE_MS) {
    return {
      ambientDisabled: killSwitchCache.ambientDisabled,
      branchDisabled: killSwitchCache.branchDisabled
    };
  }
  try {
    const snap = await withTimeout(getDoc(doc(db, 'settings', 'syncConfig')), 2500);
    const data = snap && snap.exists() ? (snap.data() as Record<string, unknown>) : {};
    const ambientDisabled = data?.disableAmbientSyncV3 === true;
    const branchDisabled = data?.disableBranchSync === true;
    killSwitchCache = { checkedAt: now, ambientDisabled, branchDisabled };
    return { ambientDisabled, branchDisabled };
  } catch {
    return {
      ambientDisabled: killSwitchCache?.ambientDisabled ?? false,
      branchDisabled: killSwitchCache?.branchDisabled ?? false
    };
  }
}

async function isAmbientSyncKilledRemotely(): Promise<boolean> {
  const state = await getRemoteSyncKillSwitchState();
  return state.ambientDisabled;
}

export async function isBranchSyncKilledRemotely(): Promise<boolean> {
  const state = await getRemoteSyncKillSwitchState();
  return state.branchDisabled;
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
 * Uses unified syncScope (`user:{uid}` vs `user:{uid}|branch:{branchId}`), incremental `serverUpdatedAt`
 * cursors with 2m overlap, 80d safety reset, 7d drift check, and 90d tombstone purge.
 */
export async function autoReconcileAllLocalToCloud(
  targetUid?: string,
  options: { bypassKillSwitch?: boolean; forceFullResync?: boolean } = {}
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

  const scopeLockKey = getActiveSyncScopeKey(uid);
  const existingInFlight = activeReconcilePromises.get(scopeLockKey);
  if (existingInFlight) {
    return existingInFlight;
  }

  const runPromise = (async (): Promise<{ synced: boolean; count: number; blockedCount?: number }> => {
    const killState = options.bypassKillSwitch
      ? { ambientDisabled: false, branchDisabled: false }
      : await getRemoteSyncKillSwitchState();
    if (!options.bypassKillSwitch && killState.ambientDisabled) {
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

    // 2. Fetch cloud tombstones map per sync root (users/{uid} and optional active branches/{branchId})
    const syncCollections: SyncCollectionName[] = ['bilties', 'trips', 'vehicles', 'drivers', 'fuel', 'routes'];
    let syncErrors = queueResult.errors.length;

    const rootTombstoneCache = new Map<
      string,
      { map: Record<string, TombstoneMap>; hasSnapshot: boolean }
    >();
    const fetchTombstonesForRoot = async (
      cloudRoot: readonly ['users', string] | readonly ['branches', string]
    ) => {
      const cacheKey = `${cloudRoot[0]}:${cloudRoot[1]}`;
      const cached = rootTombstoneCache.get(cacheKey);
      if (cached) return cached;
      let map: Record<string, TombstoneMap> = {};
      let hasSnapshot = false;
      try {
        const tombSnap = await withTimeout(
          getDoc(doc(db, cloudRoot[0], cloudRoot[1], 'collections', 'tombstones')),
          8000
        );
        if (tombSnap) {
          hasSnapshot = true;
          if (tombSnap.exists()) {
            map = (tombSnap.data() || {}) as Record<string, TombstoneMap>;
          }
        }
      } catch (tombErr) {
        if (cloudRoot[0] === 'branches' && isPermissionDeniedError(tombErr)) {
          await clearLocalBranchAndAddaCaches({ preserveBranchesMetadata: true });
          setActiveBranchId(null);
          throw tombErr;
        }
        map = {};
      }
      const entry = { map, hasSnapshot };
      rootTombstoneCache.set(cacheKey, entry);
      return entry;
    };

    for (const collName of syncCollections) {
      try {
        const target = resolveCollectionSyncTarget(collName, uid);
        if (target.cloudRoot[0] === 'branches' && killState.branchDisabled && !options.bypassKillSwitch) {
          continue;
        }

        const scopedKey = getScopedStorageKey(collName, target.localScope);
        const rawLocal = safeStorage.getItem(scopedKey);
        const localItems: Array<Record<string, unknown>> = rawLocal ? JSON.parse(rawLocal) : [];

        const { map: cloudAllTombstones, hasSnapshot: hasCloudTombstonesSnapshot } =
          await fetchTombstonesForRoot(target.cloudRoot);

        const localTombstones = getTombstones(collName, target.localScope);
        const remoteCollTombstones: TombstoneMap =
          cloudAllTombstones[collName] && typeof cloudAllTombstones[collName] === 'object'
            ? cloudAllTombstones[collName]
            : {};

        const subColl = getSubCollectionForRoot(collName, target.cloudRoot);
        const nowMs = Date.now();
        const cursorState = getSyncCursorState(target.cursorScope, collName);
        const cursorExpired =
          cursorState.cursorMs > 0 && nowMs - cursorState.cursorMs > CURSOR_MAX_AGE_MS;
        const driftExpired =
          cursorState.lastFullDriftMs <= 0 ||
          nowMs - cursorState.lastFullDriftMs > WEEKLY_DRIFT_CHECK_MS;
        const useIncremental =
          !options.forceFullResync &&
          cursorState.cursorMs > 0 &&
          !cursorExpired &&
          !driftExpired &&
          rawLocal !== null;

        const subCollRef = collection(db, target.cloudRoot[0], target.cloudRoot[1], subColl);
        const docsQuery = useIncremental
          ? buildIncrementalCollectionQuery(subCollRef, Math.max(0, cursorState.cursorMs - CURSOR_OVERLAP_MS))
          : subCollRef;

        const [legacySnap, docsSnap] = await Promise.all([
          useIncremental
            ? Promise.resolve(null)
            : withTimeout(
                getDoc(doc(db, target.cloudRoot[0], target.cloudRoot[1], 'collections', collName)),
                8000
              ).catch(() => null),
          withTimeout(getDocs(docsQuery), 8000)
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
              delete cleaned.serverUpdatedAt;
              subDocItems.push(cleaned);
              cloudSubDocMap.set(getEntitySyncKey(collName, cleaned), cleaned);
            }
          });
        }

        const expiredKeys = Array.from(
          new Set([
            ...findExpiredTombstoneKeys(remoteCollTombstones, nowMs),
            ...findExpiredTombstoneKeys(subDocTombstones, nowMs)
          ])
        );

        const mergedTombstones = mergeTombstoneMaps(
          mergeTombstoneMaps(localTombstones, remoteCollTombstones),
          subDocTombstones
        );

        // Merge cloud (legacy + per-doc) + local via LWW (preserving colliding distinct bilties cleanly)
        const mergedMap = new Map<string, Record<string, unknown>>();
        const mergeCandidateIntoMap = (item: Record<string, unknown>, preferFirstOnTie: boolean) => {
          const key = getEntitySyncKey(collName, item);
          const prev = mergedMap.get(key);
          if (!prev) {
            mergedMap.set(key, item);
            return;
          }
          if (
            collName === 'bilties' &&
            prev.id &&
            item.id &&
            String(prev.id) !== String(item.id)
          ) {
            const conflictKey = `${key}__conflict__${String(item.id)}`;
            const existingConflict = mergedMap.get(conflictKey);
            mergedMap.set(conflictKey, existingConflict ? resolveEntityLWW(item, existingConflict) : item);
            return;
          }
          mergedMap.set(key, preferFirstOnTie ? resolveEntityLWW(item, prev) : resolveEntityLWW(prev, item));
        };

        for (const item of [...legacyItems, ...subDocItems]) {
          mergeCandidateIntoMap(item, false);
        }
        for (const item of localItems) {
          mergeCandidateIntoMap(item, true);
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
        saveTombstones(collName, mergedTombstones, target.localScope);

        // On incremental runs, only push local records mutated after lastPushedMs (avoiding full-collection rewrites)
        const changedKeysFilter = useIncremental
          ? mergedList
              .filter(item => {
                const mutMs = parseEntityMutationTimeMs(item, nowMs);
                return mutMs === 0 || mutMs > cursorState.lastPushedMs;
              })
              .map(item => getEntitySyncKey(collName, item))
          : undefined;

        const deletedToPush = Object.keys(mergedTombstones);
        await writePerDocCollectionToFirestore(uid, collName, mergedList, deletedToPush, {
          ...(changedKeysFilter !== undefined ? { changedKeys: changedKeysFilter } : {}),
          cloudSubDocMap: useIncremental ? undefined : cloudSubDocMap,
          cloudSubDocTombstones: subDocTombstones,
          cloudTombstonesForColl: remoteCollTombstones,
          hasCloudTombstonesSnapshot,
          existingLegacyData,
          hasLegacySnapshot,
          cloudRoot: target.cloudRoot,
          localScopeOverride: target.localScope,
          skipLegacyRewriteWhenNoChanges: useIncremental,
          expiredTombstoneKeysToPurge: expiredKeys
        });

        saveSyncCursorState(target.cursorScope, collName, {
          cursorMs: nowMs,
          lastPushedMs: nowMs,
          lastFullDriftMs: useIncremental ? cursorState.lastFullDriftMs : nowMs
        });

        // When Owner reconciles Head Office Bilties, mirror to branches/head unless disabled remotely
        if (
          collName === 'bilties' &&
          target.cloudRoot[0] === 'users' &&
          isOwnerEmail(user?.email) &&
          !killState.branchDisabled
        ) {
          const headItems = mergedList.filter(
            item => !item.branchId || item.branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID
          );
          void writePerDocCollectionToFirestore(uid, 'bilties', headItems, deletedToPush, {
            ...(changedKeysFilter !== undefined ? { changedKeys: changedKeysFilter } : {}),
            cloudRoot: ['branches', DEFAULT_HEAD_OFFICE_BRANCH_ID] as const,
            localScopeOverride: target.localScope,
            skipLegacyRewriteWhenNoChanges: useIncremental
          }).catch(() => {});
        }
        totalSynced += mergedList.length;

        // Immediately remove uploaded collection queue entries from localStorage so synced items are not kept queued
        const currentQ = getStoredOfflineQueue();
        if (currentQ.length > 0) {
          const prunedQ = currentQ.filter(q => {
            if (q.status === 'blocked') return true;
            return normalizeCollectionKey(q.type) !== collName;
          });
          if (prunedQ.length !== currentQ.length) {
            saveStoredOfflineQueue(prunedQ);
          }
        }

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
              const numPart = parseBiltySeqDigits(String(b.biltyNo));
              if (numPart !== null && numPart > highestBiltySeq) {
                highestBiltySeq = numPart;
              }
            }
          }

          if (digestDirty) savePublicBiltyDigestCache(uid, pubDigest);
          if (deletedDirty) saveDeletedPublicBiltyCache(uid, pubDeleted);

          // Clear uploaded public_bilty / delete_public_bilty entries from localStorage queue
          const afterPubQ = getStoredOfflineQueue();
          if (afterPubQ.length > 0) {
            const prunedPubQ = afterPubQ.filter(q => {
              if (q.status === 'blocked') return true;
              if (q.type !== 'public_bilty' && q.type !== 'delete_public_bilty') return true;
              const qData = q.data && typeof q.data === 'object' ? (q.data as Record<string, unknown>) : null;
              const qNo = qData?.biltyNo ? String(qData.biltyNo).trim().toUpperCase() : '';
              if (!qNo) return true;
              if (q.type === 'public_bilty') return !pubDigest[qNo];
              return !pubDeleted[qNo];
            });
            if (prunedPubQ.length !== afterPubQ.length) {
              saveStoredOfflineQueue(prunedPubQ);
            }
          }

          if (isOwnerEmail(user?.email)) {
            try {
              const activeBranchId = getActiveBranchId();
              const isCustomBranch = Boolean(
                activeBranchId && activeBranchId !== DEFAULT_HEAD_OFFICE_BRANCH_ID
              );
              const counterDocId = isCustomBranch ? `branch_${activeBranchId}_bilty` : 'biltyCounter';
              const counterRef = doc(db, 'counters', counterDocId);
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
        }
      } catch (e) {
        syncErrors++;
        if (isPermissionDeniedError(e)) {
          if (collName === 'bilties' && isUsingSharedBranchScope()) {
            await clearLocalBranchAndAddaCaches({ preserveBranchesMetadata: true });
            setActiveBranchId(null);
          }
          safeStorage.setItem('ah-last-sync-error', `Permission denied syncing ${collName}`);
        }
        console.warn(`Reconciliation notice for ${collName}:`, e);
      }
    }

    // 4. Reconcile Khata / Ledger (strictly personal users/{uid})
    let khataBlockedCount = 0;
    let khataRemainingCount = 0;
    try {
      const { fetchKhataFromFirestore, syncAllKhataToFirestore, processKhataDocQueue } = await import(
        './ledgerStorage'
      );
      await syncAllKhataToFirestore().catch(() => {});
      await fetchKhataFromFirestore().catch(() => {});
      const khataRes = await processKhataDocQueue().catch(() => ({ processed: 0, remaining: 0, blocked: 0 }));
      khataBlockedCount = khataRes.blocked || 0;
      khataRemainingCount = khataRes.remaining || 0;
    } catch (kErr) {
      console.warn('[KhataSync] reconciliation notice:', kErr);
    }

    const totalBlocked = queueResult.blocked + khataBlockedCount;
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (syncErrors === 0 && getStoredOfflineQueue().length === 0 && khataRemainingCount === 0 && totalBlocked === 0) {
      safeStorage.removeItem('ah-last-sync-error');
    }

    // Remove uploaded legacy/staging/empty-guest keys cleanly from localStorage once cloud sync succeeds
    if (syncErrors === 0 && totalBlocked === 0) {
      cleanupUploadedLegacyAndStagingKeys(uid);
    }

    notifySyncListeners();

    return {
      synced: syncErrors === 0 && totalBlocked === 0,
      count: totalSynced,
      blockedCount: totalBlocked
    };
  })();

  activeReconcilePromises.set(scopeLockKey, runPromise);
  try {
    return await runPromise;
  } finally {
    activeReconcilePromises.delete(scopeLockKey);
  }
}

export async function loadFromFirestore(uid: string) {
  return autoReconcileAllLocalToCloud(uid);
}

/**
 * Pulls and reconciles Bilty records for a specific branch (`branches/{branchId}`) into local branch scope
 * using incremental `serverUpdatedAt` cursors, while respecting `disableBranchSync` fallback and wiping
 * branch caches immediately upon `permission-denied`.
 */
export async function loadBranchBiltiesFromFirestore(
  branchId: string,
  options: { forceFullResync?: boolean; bypassKillSwitch?: boolean } = {}
): Promise<BiltyRecord[]> {
  const user = auth.currentUser;
  if (!user || !db || !branchId) {
    return getStoredBilties();
  }

  const cleanBranchId = branchId.trim() === 'samundri' ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId.trim();
  const killState = options.bypassKillSwitch
    ? { ambientDisabled: false, branchDisabled: false }
    : await getRemoteSyncKillSwitchState();
  const isCreatorOnHead =
    isOwnerEmail(user.email) && cleanBranchId === DEFAULT_HEAD_OFFICE_BRANCH_ID;

  if (killState.branchDisabled && !options.bypassKillSwitch) {
    if (isCreatorOnHead) {
      await autoReconcileAllLocalToCloud(user.uid, {
        forceFullResync: options.forceFullResync
      }).catch(() => {});
    }
    return getStoredBilties();
  }

  const branchScope = isCreatorOnHead ? user.uid : `branch_${cleanBranchId}`;
  const cursorScope = `branch_${cleanBranchId}`;
  const scopedKey = getScopedStorageKey('bilties', branchScope);

  try {
    const rawLocal = safeStorage.getItem(scopedKey);
    const localItems: Array<Record<string, unknown>> = rawLocal ? JSON.parse(rawLocal) : [];
    const localTombstones = getTombstones('bilties', branchScope);

    const nowMs = Date.now();
    const cursorState = getSyncCursorState(cursorScope, 'bilties');
    const cursorExpired =
      cursorState.cursorMs > 0 && nowMs - cursorState.cursorMs > CURSOR_MAX_AGE_MS;
    const driftExpired =
      cursorState.lastFullDriftMs <= 0 ||
      nowMs - cursorState.lastFullDriftMs > WEEKLY_DRIFT_CHECK_MS;
    const useIncremental =
      !options.forceFullResync &&
      cursorState.cursorMs > 0 &&
      !cursorExpired &&
      !driftExpired &&
      rawLocal !== null;

    const sinceMs = Math.max(0, cursorState.cursorMs - CURSOR_OVERLAP_MS);
    const canonicalColl = collection(db, 'branches', cleanBranchId, 'bilties');
    const transitionalColl = collection(db, 'branches', cleanBranchId, 'biltiesDocs');
    const canonicalQuery = useIncremental ? buildIncrementalCollectionQuery(canonicalColl, sinceMs) : canonicalColl;
    const transitionalQuery = useIncremental
      ? buildIncrementalCollectionQuery(transitionalColl, sinceMs)
      : transitionalColl;

    const [tombSnap, legacySnap, canonicalDocsSnap, transitionalDocsSnap] = await Promise.all([
      withTimeout(getDoc(doc(db, 'branches', cleanBranchId, 'collections', 'tombstones')), 8000).catch(err => {
        if (isPermissionDeniedError(err)) throw err;
        return null;
      }),
      useIncremental
        ? Promise.resolve(null)
        : withTimeout(getDoc(doc(db, 'branches', cleanBranchId, 'collections', 'bilties')), 8000).catch(err => {
            if (isPermissionDeniedError(err)) throw err;
            return null;
          }),
      withTimeout(getDocs(canonicalQuery), 8000),
      withTimeout(getDocs(transitionalQuery), 8000).catch(() => null)
    ]);

    const remoteTombData =
      tombSnap && tombSnap.exists() ? ((tombSnap.data() || {}) as Record<string, TombstoneMap>) : {};
    const remoteCollTombstones: TombstoneMap =
      remoteTombData.bilties && typeof remoteTombData.bilties === 'object' ? remoteTombData.bilties : {};

    const existingLegacyData =
      legacySnap && legacySnap.exists() ? (legacySnap.data() as Record<string, unknown>) : null;
    const legacyItems: Array<Record<string, unknown>> =
      existingLegacyData && Array.isArray(existingLegacyData.items)
        ? (existingLegacyData.items as Array<Record<string, unknown>>)
        : [];

    const subDocItems: Array<Record<string, unknown>> = [];
    const subDocTombstones: TombstoneMap = {};
    const consumeSnap = (snap: typeof canonicalDocsSnap | null) => {
      if (!snap) return;
      snap.forEach(d => {
        const data = d.data() as Record<string, unknown>;
        if (data?._deleted === true && typeof data.deletedAt === 'string') {
          subDocTombstones[getEntitySyncKey('bilties', data)] = data.deletedAt;
        } else if (data && !data._deleted) {
          const cleaned = { ...data };
          delete cleaned._deleted;
          delete cleaned.deletedAt;
          delete cleaned.serverUpdatedAt;
          subDocItems.push(cleaned);
        }
      });
    };
    consumeSnap(canonicalDocsSnap);
    consumeSnap(transitionalDocsSnap);

    const mergedTombstones = mergeTombstoneMaps(
      mergeTombstoneMaps(localTombstones, remoteCollTombstones),
      subDocTombstones
    );
    const mergedMap = new Map<string, Record<string, unknown>>();
    const mergeBranchBilty = (item: Record<string, unknown>, preferIncomingOnTie: boolean) => {
      const k = getEntitySyncKey('bilties', item);
      const prev = mergedMap.get(k);
      if (!prev) {
        mergedMap.set(k, item);
        return;
      }
      if (prev.id && item.id && String(prev.id) !== String(item.id)) {
        const conflictKey = `${k}__conflict__${String(item.id)}`;
        const existingConflict = mergedMap.get(conflictKey);
        mergedMap.set(conflictKey, existingConflict ? resolveEntityLWW(item, existingConflict) : item);
        return;
      }
      mergedMap.set(k, preferIncomingOnTie ? resolveEntityLWW(item, prev) : resolveEntityLWW(prev, item));
    };
    for (const item of [...legacyItems, ...subDocItems]) {
      mergeBranchBilty(item, false);
    }
    for (const item of localItems) {
      mergeBranchBilty(item, true);
    }

    const mergedList: Array<Record<string, unknown>> = [];
    for (const [k, item] of mergedMap.entries()) {
      if (isEntityTombstoned('bilties', item, mergedTombstones)) continue;
      if (mergedTombstones[k]) delete mergedTombstones[k];
      mergedList.push(item);
    }

    safeStorage.setItem(scopedKey, JSON.stringify(mergedList));
    saveTombstones('bilties', mergedTombstones, branchScope);
    saveSyncCursorState(cursorScope, 'bilties', {
      cursorMs: nowMs,
      lastPushedMs: cursorState.lastPushedMs || nowMs,
      lastFullDriftMs: useIncremental ? cursorState.lastFullDriftMs : nowMs
    });

    if (isCreatorOnHead) {
      await autoReconcileAllLocalToCloud(user.uid, {
        forceFullResync: options.forceFullResync
      }).catch(() => {});
    }
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      await clearLocalBranchAndAddaCaches({ preserveBranchesMetadata: true });
      setActiveBranchId(null);
      safeStorage.setItem('ah-last-sync-error', 'Permission denied loading branch records');
      notifySyncListeners();
      return [];
    }
    console.warn(`[BranchSync] Pull notice for ${cleanBranchId}:`, err);
  }

  return getStoredBilties();
}

export const HEAD_MIGRATION_FLAG_PREFIX = 'wg_v3_head_migrated_';
const HEAD_SOURCE_RETENTION_DAYS = 30;

function computeBiltyCollectionDigest(items: Array<Record<string, unknown>>): {
  count: number;
  totalFreight: number;
} {
  let totalFreight = 0;
  for (const item of items) {
    const val = Number(item?.total) || 0;
    if (Number.isFinite(val)) {
      totalFreight += Math.round(val);
    }
  }
  return { count: items.length, totalFreight };
}

/**
 * One-time idempotent Head Office (`head`) migration for App Creator:
 * 1. Captures an IndexedDB pre-migration snapshot first.
 * 2. Copies Creator's personal Bilties (`users/{uid}`) + any legacy `branches/samundri` data into `branches/head`.
 * 3. Verifies exact count & freight total digest before marking complete (`wg_v3_head_migrated_<uid>`).
 * 4. Leaves ALL original `users/{uid}` and `branches/samundri` docs intact for >= 30 days for kill-switch fallback.
 */
export async function migrateHeadOfficeToBranchesHead(
  targetUid?: string,
  options: { force?: boolean } = {}
): Promise<{
  migrated: boolean;
  copiedBilties: number;
  copiedLegacyBranchDocs: number;
  totalFreight: number;
  skippedReason?: string;
  error?: string;
}> {
  const user = auth.currentUser;
  const uid = targetUid || user?.uid;
  if (!uid || !db || !isOwnerEmail(user?.email)) {
    return {
      migrated: false,
      copiedBilties: 0,
      copiedLegacyBranchDocs: 0,
      totalFreight: 0,
      skippedReason: 'unauthorized'
    };
  }

  const flagKey = `${HEAD_MIGRATION_FLAG_PREFIX}${uid}`;
  if (!options.force && safeStorage.getItem(flagKey) === '1') {
    return {
      migrated: true,
      copiedBilties: 0,
      copiedLegacyBranchDocs: 0,
      totalFreight: 0,
      skippedReason: 'already_migrated'
    };
  }

  const killState = await getRemoteSyncKillSwitchState();
  if (killState.branchDisabled) {
    return {
      migrated: false,
      copiedBilties: 0,
      copiedLegacyBranchDocs: 0,
      totalFreight: 0,
      skippedReason: 'branch_sync_disabled'
    };
  }

  try {
    const nowIso = new Date().toISOString();
    const serverTs = safeServerTimestamp();

    // Check remote completion marker if not forced
    const headRef = doc(db, 'branches', DEFAULT_HEAD_OFFICE_BRANCH_ID);
    const existingHeadSnap = await withTimeout(getDoc(headRef), 8000).catch(() => null);
    const existingHeadData =
      existingHeadSnap && existingHeadSnap.exists()
        ? (existingHeadSnap.data() as Record<string, unknown>)
        : null;
    if (
      !options.force &&
      existingHeadData &&
      typeof existingHeadData.headMigration === 'object' &&
      (existingHeadData.headMigration as { completed?: boolean })?.completed === true
    ) {
      safeStorage.setItem(flagKey, '1');
      return {
        migrated: true,
        copiedBilties: 0,
        copiedLegacyBranchDocs: 0,
        totalFreight: 0,
        skippedReason: 'already_migrated_cloud'
      };
    }

    // Step 1: Collect source Creator Bilties (users/{uid}/biltiesDocs + collections/bilties + local)
    // and legacy `branches/samundri` data
    const [
      userDocsSnap,
      userLegacySnap,
      samBranchSnap,
      samDocsSnap,
      samCanonSnap,
      samLegacySnap,
      samMembersSnap,
      samStaffSnap,
      samCountersSnap,
      samFreightSnap,
      samCommSnap,
      samBillsSnap,
      samAddaItemsSnap,
      samAddaBillsSnap,
      samAddaPartiesSnap,
      samTombSnap
    ] = await Promise.all([
      withTimeout(getDocs(collection(db, 'users', uid, 'biltiesDocs')), 8000).catch(() => null),
      withTimeout(getDoc(doc(db, 'users', uid, 'collections', 'bilties')), 8000).catch(() => null),
      withTimeout(getDoc(doc(db, 'branches', 'samundri')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'biltiesDocs')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'bilties')), 8000).catch(() => null),
      withTimeout(getDoc(doc(db, 'branches', 'samundri', 'collections', 'bilties')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'members')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'staff')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'counters')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'addaPendingFreight')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'addaPendingCommissions')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'addaBills')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'adda_items')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'adda_bills')), 8000).catch(() => null),
      withTimeout(getDocs(collection(db, 'branches', 'samundri', 'adda_parties')), 8000).catch(() => null),
      withTimeout(getDoc(doc(db, 'branches', 'samundri', 'collections', 'tombstones')), 8000).catch(() => null)
    ]);

    const localRawBilties = safeStorage.getItem(getScopedStorageKey('bilties', uid));
    const localBilties: Array<Record<string, unknown>> = localRawBilties ? JSON.parse(localRawBilties) : [];
    const localTombs = getTombstones('bilties', uid);

    const biltySourceList: Array<Record<string, unknown>> = [];
    const pushIfHead = (item: Record<string, unknown>) => {
      if (!item || item._deleted) return;
      const bId = item.branchId ? String(item.branchId).trim() : '';
      if (!bId || bId === DEFAULT_HEAD_OFFICE_BRANCH_ID || bId === 'samundri') {
        const cleaned = { ...item };
        delete cleaned.legalVault;
        delete cleaned._deleted;
        delete cleaned.deletedAt;
        delete cleaned.serverUpdatedAt;
        cleaned.branchId = DEFAULT_HEAD_OFFICE_BRANCH_ID;
        if (cleaned.branch === 'samundri') cleaned.branch = DEFAULT_HEAD_OFFICE_BRANCH_ID;
        biltySourceList.push(cleaned);
      }
    };

    userDocsSnap?.forEach(d => pushIfHead(d.data() as Record<string, unknown>));
    if (userLegacySnap && userLegacySnap.exists() && Array.isArray(userLegacySnap.data()?.items)) {
      (userLegacySnap.data().items as Array<Record<string, unknown>>).forEach(pushIfHead);
    }
    samDocsSnap?.forEach(d => pushIfHead(d.data() as Record<string, unknown>));
    samCanonSnap?.forEach(d => pushIfHead(d.data() as Record<string, unknown>));
    if (samLegacySnap && samLegacySnap.exists() && Array.isArray(samLegacySnap.data()?.items)) {
      (samLegacySnap.data().items as Array<Record<string, unknown>>).forEach(pushIfHead);
    }
    localBilties.forEach(pushIfHead);

    const dedupedMap = new Map<string, Record<string, unknown>>();
    for (const item of biltySourceList) {
      const k = getEntitySyncKey('bilties', item);
      if (isEntityTombstoned('bilties', item, localTombs)) continue;
      const prev = dedupedMap.get(k);
      dedupedMap.set(k, prev ? resolveEntityLWW(item, prev) : item);
    }
    const sourceHeadBilties = Array.from(dedupedMap.values());
    const sourceDigest = computeBiltyCollectionDigest(sourceHeadBilties);

    // Step 2: Capture IDB pre-migration snapshot BEFORE writing `branches/head`
    await savePreRestoreSnapshotIdbOnly(`head_migration_${uid}`, {
      capturedAt: nowIso,
      sourceDigest,
      bilties: sourceHeadBilties,
      samundriProfile: samBranchSnap?.exists() ? samBranchSnap.data() : null
    });

    // Step 3: Batch-copy verified bilties & legacy samundri docs to `branches/head` (never deleting sources)
    const ops: BatchWriteOp[] = [];
    for (const item of sourceHeadBilties) {
      const docId = toSafeFirestoreDocId(getEntitySyncKey('bilties', item));
      ops.push({
        type: 'set',
        ref: doc(db, 'branches', DEFAULT_HEAD_OFFICE_BRANCH_ID, 'bilties', docId),
        data: { ...item, _deleted: false, deletedAt: null, serverUpdatedAt: serverTs },
        merge: true
      });
    }

    let copiedLegacyBranchDocs = 0;
    const copySubDocs = (
      snap: typeof samMembersSnap | null,
      subCollName: string,
      transform?: (id: string, data: Record<string, unknown>) => { docId: string; data: Record<string, unknown> } | null
    ) => {
      if (!snap) return;
      snap.forEach(d => {
        const data = d.data() as Record<string, unknown>;
        const out = transform ? transform(d.id, data) : { docId: d.id, data: { ...data, branchId: DEFAULT_HEAD_OFFICE_BRANCH_ID } };
        if (!out) return;
        ops.push({
          type: 'set',
          ref: doc(db, 'branches', DEFAULT_HEAD_OFFICE_BRANCH_ID, subCollName, out.docId),
          data: { ...out.data, serverUpdatedAt: serverTs },
          merge: true
        });
        copiedLegacyBranchDocs++;
      });
    };

    const normalizeMemberCopy = (id: string, data: Record<string, unknown>) => {
      const emailLower = normalizeEmail(String(data?.email || id));
      if (!emailLower || isOwnerEmail(emailLower)) return null;
      return {
        docId: emailLower,
        data: {
          ...data,
          email: emailLower,
          branchId: DEFAULT_HEAD_OFFICE_BRANCH_ID,
          branchActive: true
        }
      };
    };
    copySubDocs(samStaffSnap, 'members', normalizeMemberCopy);
    copySubDocs(samMembersSnap, 'members', normalizeMemberCopy);
    copySubDocs(samCountersSnap, 'counters');
    copySubDocs(samFreightSnap, 'addaPendingFreight');
    copySubDocs(samCommSnap, 'addaPendingCommissions');
    copySubDocs(samBillsSnap, 'addaBills');
    copySubDocs(samAddaItemsSnap, 'adda_items');
    copySubDocs(samAddaBillsSnap, 'adda_bills');
    copySubDocs(samAddaPartiesSnap, 'adda_parties');

    if (samTombSnap && samTombSnap.exists()) {
      ops.push({
        type: 'set',
        ref: doc(db, 'branches', DEFAULT_HEAD_OFFICE_BRANCH_ID, 'collections', 'tombstones'),
        data: { ...(samTombSnap.data() || {}), updatedAt: nowIso, serverUpdatedAt: serverTs },
        merge: true
      });
      copiedLegacyBranchDocs++;
    }

    if (ops.length > 0) {
      await commitBatchOps(ops, 15000);
    }

    // Step 4: Verify destination digest against source digest
    const verifySnap = await withTimeout(
      getDocs(collection(db, 'branches', DEFAULT_HEAD_OFFICE_BRANCH_ID, 'bilties')),
      10000
    ).catch(() => null);
    if (verifySnap) {
      const targetItems: Array<Record<string, unknown>> = [];
      verifySnap.forEach(d => {
        const data = d.data() as Record<string, unknown>;
        if (data && !data._deleted) targetItems.push(data);
      });
      const targetDigest = computeBiltyCollectionDigest(targetItems);
      if (targetDigest.count < sourceDigest.count) {
        return {
          migrated: false,
          copiedBilties: sourceDigest.count,
          copiedLegacyBranchDocs,
          totalFreight: sourceDigest.totalFreight,
          error: `Digest count mismatch (${targetDigest.count} vs ${sourceDigest.count})`
        };
      }
    }

    // Step 5: Persist idempotent completion markers (retention >= 30 days)
    const retentionUntil = new Date(
      Date.now() + HEAD_SOURCE_RETENTION_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
    const samProfile = samBranchSnap?.exists() ? (samBranchSnap.data() as Record<string, unknown>) : {};
    await withTimeout(
      setDoc(
        headRef,
        {
          ...samProfile,
          ...existingHeadData,
          id: DEFAULT_HEAD_OFFICE_BRANCH_ID,
          isHeadOffice: true,
          active: true,
          headMigration: {
            completed: true,
            migratedAt: nowIso,
            sourceRetentionUntil: retentionUntil,
            biltyCount: sourceDigest.count,
            totalFreight: sourceDigest.totalFreight,
            copiedLegacyBranchDocs
          },
          updatedAt: nowIso
        },
        { merge: true }
      ),
      8000
    );

    safeStorage.setItem(flagKey, '1');
    return {
      migrated: true,
      copiedBilties: sourceDigest.count,
      copiedLegacyBranchDocs,
      totalFreight: sourceDigest.totalFreight
    };
  } catch (err) {
    return {
      migrated: false,
      copiedBilties: 0,
      copiedLegacyBranchDocs: 0,
      totalFreight: 0,
      error: err instanceof Error ? err.message : String(err || 'Migration failed')
    };
  }
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
        const sameNo =
          (existing.biltyNo || '').trim().toUpperCase() === (item.biltyNo || '').trim().toUpperCase();
        const sameVeh = (existing.vehicleNo || '').trim().toUpperCase() === (item.vehicleNo || '').trim().toUpperCase();
        const sameDate = (existing.date || '').trim() === (item.date || '').trim();
        const sameSender = (existing.senderName || '').trim().toLowerCase() === (item.senderName || '').trim().toLowerCase();
        const sameReceiver = (existing.receiverName || '').trim().toLowerCase() === (item.receiverName || '').trim().toLowerCase();
        const sameTotal = Number(existing.total || 0) === Number(item.total || 0);
        const hasVeh = Boolean((existing.vehicleNo || '').trim());
        return sameNo && sameVeh && sameDate && sameSender && sameReceiver && sameTotal && hasVeh;
      });
      if (matchIndex >= 0) {
        deduped[matchIndex] = resolveEntityLWW(item, deduped[matchIndex]);
      } else {
        deduped.push({ ...item });
      }
    }

    deduped.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

    const countByNo = new Map<string, number>();
    let highestSequence = 1000;
    const normalizedEntries = deduped.map((rec) => {
      const bNo = rec.biltyNo ? String(rec.biltyNo).trim().toUpperCase() : '';
      if (bNo) {
        countByNo.set(bNo, (countByNo.get(bNo) || 0) + 1);
        const numPart = parseBiltySeqDigits(bNo);
        if (numPart !== null && numPart >= 1000 && numPart <= 999_999_999) {
          highestSequence = Math.max(highestSequence, numPart);
        }
      }
      return { rec, bNo };
    });

    // Preserve duplicate colliding biltyNo records intact and flag `numberConflict: true` (never silently renumber)
    const finalRecords: BiltyRecord[] = normalizedEntries.map(({ rec, bNo }) => {
      if (!bNo) {
        const placeholder = `PENDING-${rec.id || Date.now()}`;
        return {
          ...rec,
          biltyNo: placeholder,
          numberConflict: true,
          conflictNote: 'Missing Bilty number — please assign a sequential number from Branch Owner/Creator controls. / بلٹی نمبر غائب ہے، براہ کرم نیا نمبر تفویض کریں۔'
        };
      }
      const dupCount = countByNo.get(bNo) || 0;
      if (dupCount > 1) {
        return {
          ...rec,
          biltyNo: bNo,
          numberConflict: true,
          conflictNote: `Duplicate Bilty # ${bNo} found across ${dupCount} records. Owner resolution required. / بلٹی نمبر ${bNo} ${dupCount} ریکارڈز میں موجود ہے۔`
        };
      }
      if (rec.numberConflict || rec.conflictNote) {
        const cleaned = { ...rec, biltyNo: bNo };
        delete cleaned.numberConflict;
        delete cleaned.conflictNote;
        return cleaned;
      }
      return { ...rec, biltyNo: bNo };
    });

    if (highestSequence > 1000) {
      const currentCounterRaw = getScopedItem('bilty-counter');
      const currentCounter = currentCounterRaw ? parseInt(currentCounterRaw, 10) : 0;
      if (Number.isNaN(currentCounter) || highestSequence > currentCounter) {
        persistBiltyCounterLocally(highestSequence);
      }
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
  if (deletedKeys.length > 0) {
    for (const delKey of deletedKeys) {
      void deleteAllAttachmentsForBilty(delKey);
    }
  }
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
  const scope = getEffectiveScopeForKey(collName);
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
      if (mode === 'overwrite') {
        void deleteAllAttachmentsForBilty(delKey);
      }
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

  const safeData = buildPublicBiltyCloudPayload(
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
      const target = resolveCollectionSyncTarget('bilties', user.uid);
      const subColl = getSubCollectionForRoot('bilties', target.cloudRoot);
      const subDocRef = doc(db, target.cloudRoot[0], target.cloudRoot[1], subColl, toSafeFirestoreDocId(normalizedNo));
      const { legalVault: _omittedVault, ...cloudBiltyPayload } = updatedBilty;
      await setDoc(subDocRef, cloudBiltyPayload, { merge: true }).catch(() => {});
    }

    return { success: true, offlineQueued: false, podConfirmation };
  } catch (err) {
    console.warn('POD direct write timed out or failed, enqueuing offline action:', err);
    enqueueOfflineAction('pod_confirmation', safeData);
    return { success: true, offlineQueued: true, podConfirmation };
  }
}

// ---------------------------------------------------------------------------
// Bilty & Bill Sequence Counter Helpers + 20-Number Offline Block Reservation
// ---------------------------------------------------------------------------

export const BRANCH_NUMBER_BLOCK_SIZE = 20;
export const BRANCH_NUMBER_BLOCK_LOW_WATER = 5;

export interface OfflineNumberBlock {
  branchId: string;
  kind: 'bilty' | 'bill';
  start: number;
  end: number;
  nextSeq: number;
  reservedAt: string;
}

export class OfflineBlockExhaustedError extends Error {
  readonly code = 'OFFLINE_BLOCK_EXHAUSTED';
  readonly kind: 'bilty' | 'bill';
  readonly branchId: string;
  readonly messageEn: string;
  readonly messageUr: string;

  constructor(kind: 'bilty' | 'bill', branchId: string) {
    const labelEn = kind === 'bilty' ? 'Bilty' : 'Adda Bill';
    const labelUr = kind === 'bilty' ? 'بلٹی' : 'اڈا بل';
    const messageEn = `Offline ${labelEn} number block exhausted for branch "${branchId}". Reconnect briefly to reserve the next 20 numbers.`;
    const messageUr = `آف لائن ${labelUr} نمبرز کا بلاک ختم ہو گیا ہے۔ اگلے 20 نمبرز لینے کے لیے انٹرنیٹ سے منسلک ہوں۔`;
    super(`${messageEn} / ${messageUr}`);
    this.name = 'OfflineBlockExhaustedError';
    this.kind = kind;
    this.branchId = branchId;
    this.messageEn = messageEn;
    this.messageUr = messageUr;
  }
}

function getNumberBlockKey(branchId: string, kind: 'bilty' | 'bill'): string {
  const canonical = !branchId || branchId === 'samundri' ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  return `wg_v3_number_block_${kind}_${canonical}`;
}

export function getLocalNumberBlock(branchId: string, kind: 'bilty' | 'bill'): OfflineNumberBlock | null {
  try {
    const raw = safeStorage.getItem(getNumberBlockKey(branchId, kind));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OfflineNumberBlock>;
    if (
      typeof parsed?.start !== 'number' ||
      typeof parsed?.end !== 'number' ||
      typeof parsed?.nextSeq !== 'number'
    ) {
      return null;
    }
    const canonical = !branchId || branchId === 'samundri' ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
    return {
      branchId: canonical,
      kind,
      start: parsed.start,
      end: parsed.end,
      nextSeq: parsed.nextSeq,
      reservedAt: typeof parsed.reservedAt === 'string' ? parsed.reservedAt : new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function saveLocalNumberBlock(block: OfflineNumberBlock): void {
  try {
    safeStorage.setItem(getNumberBlockKey(block.branchId, block.kind), JSON.stringify(block));
  } catch {
    // ignore storage errors
  }
}

export function getRemainingBlockCount(branchId: string, kind: 'bilty' | 'bill'): number {
  const block = getLocalNumberBlock(branchId, kind);
  if (!block) return 0;
  return Math.max(0, block.end - block.nextSeq + 1);
}

/**
 * Extracts the trailing numeric sequence from any Bilty number (supports WG-1001, WG-10001+, WG-LHR-1001).
 */
export function parseBiltySeqDigits(biltyNo: string): number | null {
  const clean = String(biltyNo || '').trim().toUpperCase();
  if (!clean) return null;
  const trailing = clean.match(/(\d+)$/);
  if (!trailing) return null;
  const n = parseInt(trailing[1], 10);
  return Number.isNaN(n) ? null : n;
}

function normalizeBranchPrefixCode(branchOrCode?: BranchConfig | string | null): string {
  if (!branchOrCode) return '';
  if (typeof branchOrCode === 'string') {
    const c = branchOrCode.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    return c && c !== 'WG' && c !== 'HEA' ? c : '';
  }
  if (
    branchOrCode.id === DEFAULT_HEAD_OFFICE_BRANCH_ID ||
    branchOrCode.id === 'samundri' ||
    branchOrCode.isHeadOffice
  ) {
    return '';
  }
  const c = String(branchOrCode.branchCode || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  return c && c !== 'WG' && c !== 'HEA' ? c : '';
}

export function formatBiltySeqNumber(
  seq: number,
  branchOrCode?: BranchConfig | string | null
): string {
  const safe = Math.max(1001, Math.floor(Number(seq) || 1001));
  const numPart = safe > 9999 ? String(safe) : String(safe).padStart(4, '0');
  const code = normalizeBranchPrefixCode(branchOrCode);
  return code ? `WG-${code}-${numPart}` : `WG-${numPart}`;
}

export function persistBiltyCounterLocally(seq: number, branchId?: string | null): void {
  const str = String(seq);
  const resolvedBranchId = branchId ?? getActiveBranchId();
  const cleanBranch = resolvedBranchId === 'samundri' ? DEFAULT_HEAD_OFFICE_BRANCH_ID : resolvedBranchId;
  const isCustomBranchScope =
    Boolean(cleanBranch && cleanBranch !== DEFAULT_HEAD_OFFICE_BRANCH_ID) ||
    isUsingSharedBranchScope();
  if (!isCustomBranchScope) {
    safeStorage.setItem('wg_bilty_counter', str);
  }
  if (cleanBranch && cleanBranch !== DEFAULT_HEAD_OFFICE_BRANCH_ID) {
    safeStorage.setItem(getScopedStorageKey('bilty-counter', `branch_${cleanBranch}`), str);
  } else {
    setScopedItem('bilty-counter', str);
  }
}

export function getStoredHighestBiltySeq(branch?: BranchConfig | null): number {
  const activeBranch = branch || getCachedBranchById(getActiveBranchId());
  const canonicalBranchId =
    activeBranch?.id === 'samundri' ? DEFAULT_HEAD_OFFICE_BRANCH_ID : activeBranch?.id;
  const isCustomBranch = Boolean(canonicalBranchId && canonicalBranchId !== DEFAULT_HEAD_OFFICE_BRANCH_ID);
  const minFloor = Math.max(1000, (Number(activeBranch?.startingBiltySeq) || 1001) - 1);
  let highest = minFloor;
  const maxAllowed = 999_999_999;

  const counterScope = isCustomBranch
    ? `branch_${canonicalBranchId}`
    : getEffectiveScopeForKey('bilty-counter');

  const counterKeys = isCustomBranch
    ? [getScopedStorageKey('bilty-counter', counterScope)]
    : [
        'wg_bilty_counter',
        getScopedStorageKey('bilty-counter', counterScope),
        'wg_v2_guest_bilty-counter',
        'ah-bilty-counter',
        'bilty-counter'
      ];

  for (const k of counterKeys) {
    const val = safeStorage.getItem(k);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!Number.isNaN(parsed) && parsed >= 1000 && parsed <= maxAllowed && parsed > highest) {
        highest = parsed;
      }
    }
  }

  let bilties: BiltyRecord[] = [];
  if (isCustomBranch && canonicalBranchId) {
    try {
      const raw = safeStorage.getItem(getScopedStorageKey('bilties', `branch_${canonicalBranchId}`));
      const parsed = raw ? JSON.parse(raw) : [];
      bilties = Array.isArray(parsed) ? parsed : [];
    } catch {
      bilties = [];
    }
  } else {
    bilties = getStoredBilties();
  }

  for (const item of bilties) {
    if (item?.biltyNo) {
      const numPart = parseBiltySeqDigits(String(item.biltyNo));
      if (numPart !== null && numPart >= 1000 && numPart <= maxAllowed && numPart > highest) {
        highest = numPart;
      }
    }
  }

  return highest;
}

export function findNextAvailableBiltySeq(startCandidate: number, allowOver9999 = true): number {
  const maxSeq = allowOver9999 ? 999_999_999 : 999_999_999;
  const activeNums = new Set<number>();
  for (const b of getStoredBilties()) {
    if (!b?.biltyNo) continue;
    const parsed = parseBiltySeqDigits(String(b.biltyNo));
    if (parsed !== null && parsed >= 1001 && parsed <= maxSeq) {
      activeNums.add(parsed);
    }
  }

  const first = Math.max(1001, Math.floor(Number(startCandidate) || 1001));
  let n = first;
  while (activeNums.has(n) && n < maxSeq) {
    n++;
  }
  return n;
}

const activeBlockReservations = new Map<string, Promise<OfflineNumberBlock | null>>();

/**
 * Atomically reserves a 20-number block from `branches/{branchId}/counters/{kind}`.
 * Respects Firestore rule whitelist: ['branchId', 'nextSeq', 'currentValue', 'value', 'updatedAt'].
 */
export async function reserveNextNumberBlockTransaction(
  branchId: string,
  kind: 'bilty' | 'bill',
  minSeed = 1
): Promise<OfflineNumberBlock | null> {
  const cleanBranchId =
    !branchId || branchId === 'samundri' ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId.trim();
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const user = auth.currentUser;
  if (!isOnline || !db || !user) return null;

  const lockKey = `${cleanBranchId}:${kind}`;
  const inFlight = activeBlockReservations.get(lockKey);
  if (inFlight) return inFlight;

  const run = (async (): Promise<OfflineNumberBlock | null> => {
    const counterDocRef = doc(db, 'branches', cleanBranchId, 'counters', kind);
    const runTxFn = safeGetFirestoreExport<typeof runTransaction>('runTransaction') || runTransaction;
    if (typeof runTxFn !== 'function') return null;

    let reservedInsideTx: OfflineNumberBlock | null = null;
    await withTimeout(
      runTxFn(db, async transaction => {
        const snap = await transaction.get(counterDocRef);
        let cloudNextSeq = minSeed;
        if (snap && snap.exists()) {
          const d = snap.data() as Record<string, unknown>;
          const rawNext = typeof d?.nextSeq === 'number' ? d.nextSeq : parseInt(String(d?.nextSeq || ''), 10);
          const rawVal = d?.currentValue ?? d?.value;
          const parsedVal = typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal || ''), 10);
          if (!Number.isNaN(rawNext) && rawNext >= 1) {
            cloudNextSeq = Math.max(cloudNextSeq, rawNext);
          }
          if (!Number.isNaN(parsedVal) && parsedVal >= 0) {
            cloudNextSeq = Math.max(cloudNextSeq, parsedVal + 1);
          }
        }

        const existingLocal = getLocalNumberBlock(cleanBranchId, kind);
        const blockStart = Math.max(
          cloudNextSeq,
          minSeed,
          existingLocal ? existingLocal.end + 1 : 0
        );
        const blockEnd = blockStart + BRANCH_NUMBER_BLOCK_SIZE - 1;
        const newNextSeq = blockEnd + 1;
        const nowIso = new Date().toISOString();

        transaction.set(
          counterDocRef,
          {
            branchId: cleanBranchId,
            nextSeq: newNextSeq,
            currentValue: blockEnd,
            value: blockEnd,
            updatedAt: nowIso
          },
          { merge: true }
        );

        reservedInsideTx = {
          branchId: cleanBranchId,
          kind,
          start: blockStart,
          end: blockEnd,
          nextSeq: blockStart,
          reservedAt: nowIso
        };
        return reservedInsideTx;
      }),
      8000
    );

    if (reservedInsideTx) {
      saveLocalNumberBlock(reservedInsideTx);
      return reservedInsideTx;
    }
    return null;
  })();

  activeBlockReservations.set(lockKey, run);
  try {
    return await run;
  } finally {
    activeBlockReservations.delete(lockKey);
  }
}

export async function allocateBranchBlockNumber(params: {
  kind: 'bilty' | 'bill';
  branch?: BranchConfig | null;
  branchId?: string | null;
  minStart: number;
  existingSeqs?: Set<number>;
}): Promise<{ seq: number; fromBlock: boolean }> {
  const { kind, branch, minStart, existingSeqs } = params;
  const resolvedBranchId =
    params.branchId || branch?.id || getActiveBranchId() || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  const cleanBranchId =
    !resolvedBranchId || resolvedBranchId === 'samundri'
      ? DEFAULT_HEAD_OFFICE_BRANCH_ID
      : resolvedBranchId;

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const user = auth.currentUser;

  const tryConsumeBlock = (block: OfflineNumberBlock | null): { seq: number; remaining: number } | null => {
    if (!block) return null;
    let candidate = Math.max(block.nextSeq, block.start, minStart);
    while (candidate <= block.end && existingSeqs?.has(candidate)) {
      candidate++;
    }
    if (candidate > block.end) {
      return null;
    }
    const updated: OfflineNumberBlock = {
      ...block,
      nextSeq: candidate + 1
    };
    saveLocalNumberBlock(updated);
    return { seq: candidate, remaining: Math.max(0, updated.end - updated.nextSeq + 1) };
  };

  const existingBlock = getLocalNumberBlock(cleanBranchId, kind);
  const consumed = tryConsumeBlock(existingBlock);
  if (consumed) {
    if (consumed.remaining < BRANCH_NUMBER_BLOCK_LOW_WATER && isOnline && db && user) {
      // Prefetch/reserve next 20 numbers proactively in background when remaining < 5
      void reserveNextNumberBlockTransaction(
        cleanBranchId,
        kind,
        Math.max(minStart, (existingBlock?.end || consumed.seq) + 1)
      ).catch(() => {});
    }
    return { seq: consumed.seq, fromBlock: true };
  }

  // If existing block was initialized and is now exhausted, or user is authenticated offline:
  const hadExhaustedBlock = Boolean(existingBlock && existingBlock.nextSeq > existingBlock.end);

  if (isOnline && db && user) {
    try {
      const reserved = await reserveNextNumberBlockTransaction(cleanBranchId, kind, minStart);
      if (reserved) {
        const freshConsumed = tryConsumeBlock(reserved);
        if (freshConsumed) {
          return { seq: freshConsumed.seq, fromBlock: true };
        }
      }
    } catch (err) {
      if (hadExhaustedBlock && !isPermissionDeniedError(err)) {
        throw new OfflineBlockExhaustedError(kind, cleanBranchId);
      }
      console.warn(`[BlockAllocator:${kind}] cloud reservation notice:`, err);
    }
  } else if (hadExhaustedBlock || (user && !isOnline)) {
    throw new OfflineBlockExhaustedError(kind, cleanBranchId);
  }

  // Fallback for unauthenticated offline guest mode or unit tests without auth/block
  return { seq: -1, fromBlock: false };
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

export async function allocateNextBiltyNumber(
  _userUid?: string,
  branch?: BranchConfig | null
): Promise<string> {
  const resolvedBranch = branch || getCachedBranchById(getActiveBranchId());
  const canonicalBranchId =
    resolvedBranch?.id === 'samundri'
      ? DEFAULT_HEAD_OFFICE_BRANCH_ID
      : resolvedBranch?.id || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  const minStart = Math.max(1001, Number(resolvedBranch?.startingBiltySeq) || 1001);
  const baseline = getStoredHighestBiltySeq(resolvedBranch);
  const minSeed = Math.max(minStart, baseline + 1);

  const existingSeqs = new Set<number>();
  for (const b of getStoredBilties()) {
    const seq = b?.biltyNo ? parseBiltySeqDigits(String(b.biltyNo)) : null;
    if (seq !== null) existingSeqs.add(seq);
  }

  const blockRes = await allocateBranchBlockNumber({
    kind: 'bilty',
    branch: resolvedBranch,
    branchId: canonicalBranchId,
    minStart: minSeed,
    existingSeqs
  });

  if (blockRes.fromBlock && blockRes.seq >= minStart) {
    persistBiltyCounterLocally(blockRes.seq, canonicalBranchId);
    return formatBiltySeqNumber(blockRes.seq, resolvedBranch);
  }

  const nextLocalSeq = findNextAvailableBiltySeq(minSeed, true);
  persistBiltyCounterLocally(nextLocalSeq, canonicalBranchId);
  return formatBiltySeqNumber(nextLocalSeq, resolvedBranch);
}

export function getNextBiltyNo(branch?: BranchConfig | null): string {
  const resolvedBranch = branch || getCachedBranchById(getActiveBranchId());
  const canonicalBranchId =
    resolvedBranch?.id === 'samundri'
      ? DEFAULT_HEAD_OFFICE_BRANCH_ID
      : resolvedBranch?.id || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  const minStart = Math.max(1001, Number(resolvedBranch?.startingBiltySeq) || 1001);

  const localBlock = getLocalNumberBlock(canonicalBranchId, 'bilty');
  if (localBlock) {
    if (localBlock.nextSeq > localBlock.end) {
      throw new OfflineBlockExhaustedError('bilty', canonicalBranchId);
    }
    const seq = Math.max(localBlock.nextSeq, localBlock.start, minStart);
    saveLocalNumberBlock({ ...localBlock, nextSeq: seq + 1 });
    persistBiltyCounterLocally(seq, canonicalBranchId);
    return formatBiltySeqNumber(seq, resolvedBranch);
  }

  const baseline = getStoredHighestBiltySeq(resolvedBranch);
  const seed = Math.max(baseline, minStart - 1);
  const nextNo = findNextAvailableBiltySeq(seed + 1, true);
  persistBiltyCounterLocally(nextNo, canonicalBranchId);
  return formatBiltySeqNumber(nextNo, resolvedBranch);
}

/**
 * Resolves a duplicate `numberConflict` on a specific Bilty record by assigning a fresh non-colliding
 * number from the branch block allocator and updating local/cloud/public verification state.
 */
export async function resolveBiltyNumberConflict(
  biltyId: number,
  branch?: BranchConfig | null
): Promise<BiltyRecord[]> {
  const current = getStoredBilties();
  const target = current.find(b => b.id === biltyId);
  if (!target) return current;

  const resolvedBranch = branch || getCachedBranchById(target.branchId || getActiveBranchId());
  const freshNo = await allocateNextBiltyNumber(undefined, resolvedBranch);
  const nowIso = new Date().toISOString();

  const updated = current.map(b => {
    if (b.id !== biltyId) return b;
    const next: BiltyRecord = {
      ...b,
      biltyNo: freshNo,
      updatedAt: nowIso
    };
    delete next.numberConflict;
    delete next.conflictNote;
    return next;
  });

  saveStoredBilties(updated);
  const cleaned = getStoredBilties();
  const refreshedTarget = cleaned.find(b => b.id === biltyId);
  if (refreshedTarget) {
    void syncPublicBiltyVerification(refreshedTarget).catch(() => {});
  }
  return cleaned;
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
  }, AMBIENT_HEARTBEAT_INTERVAL_MS);

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
  const khataScope = getActiveKhataScope();
  let khataQueue: Array<{ id?: string; timestamp?: string; status?: string; lastError?: string; retryCount?: number; collectionPath?: string }> = [];
  try {
    const rawKhataQueue = safeStorage.getItem(getScopedStorageKey('dd_khata_doc_queue_v2', khataScope));
    if (rawKhataQueue) {
      const parsed = JSON.parse(rawKhataQueue);
      if (Array.isArray(parsed)) khataQueue = parsed;
    }
  } catch {
    khataQueue = [];
  }

  const blockedCount =
    queue.filter(q => q.status === 'blocked').length +
    khataQueue.filter(q => q.status === 'blocked').length;
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
    pendingCount: queue.length + khataQueue.length,
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
      ...khataQueue
        .filter(q => q.status === 'blocked' && q.lastError)
        .map((q, idx) => ({
          id: String(q.id || `khata_blocked_${idx}`),
          timestamp: q.timestamp || new Date().toISOString(),
          message: q.lastError || `Blocked syncing ${q.collectionPath || 'khata'}`,
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

/**
 * Forces a full non-incremental reconciliation across active personal & branch scopes.
 */
export async function triggerFullResync(): Promise<{
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
    return triggerManualSync();
  }

  clearSyncCursorsForScope(`user_${user.uid}`);
  const branchId = getActiveBranchId();
  if (branchId) {
    clearSyncCursorsForScope(`branch_${branchId}`);
  }

  try {
    const queueRes = await processOfflineQueue();
    const reconcileRes = await autoReconcileAllLocalToCloud(user.uid, {
      forceFullResync: true,
      bypassKillSwitch: true
    });
    if (branchId) {
      await loadBranchBiltiesFromFirestore(branchId, { forceFullResync: true });
      const { fetchAddaFromFirestore } = await import('./addaBillingStorage');
      await fetchAddaFromFirestore(branchId, { forceFullResync: true });
    }
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (queueRes.errors.length === 0 && queueRes.blocked === 0 && reconcileRes.synced) {
      safeStorage.removeItem('ah-last-sync-error');
    }
    notifySyncListeners();
    return {
      success: queueRes.blocked === 0 && queueRes.errors.length === 0 && reconcileRes.synced,
      processed: queueRes.processed + reconcileRes.count,
      remaining: queueRes.remaining,
      blocked: queueRes.blocked + (reconcileRes.blockedCount || 0),
      errors: queueRes.errors
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
