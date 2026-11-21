/**
 * Bilty ID-Card & Legal Document Attachments Storage, Compression & Retention Engine
 *
 * Architecture & Safety Guarantees:
 * 1. Separated Storage:
 *    - Locally stored strictly in IndexedDB object store (`bilty_attachments`), NEVER in `localStorage`.
 *    - Cloud-synced individually to `users/{uid}/biltyAttachments/{attachmentId}` (owner-only),
 *      NEVER embedded inside `BiltyRecord`, `biltiesDocs`, `publicBiltyVerifications`, or backup chunks.
 * 2. Low-Memory WebView Processing:
 *    - Sequential async queue processes ONE image at a time (`enqueueImageProcess`).
 *    - Decodes via `URL.createObjectURL`, caps dimensions to 1000 px, encodes JPEG at 0.7
 *      (stepping toward <= 150 KB target, enforcing <= 400 KB hard cap), and immediately revokes URLs
 *      and zeros temporary canvas/img handles in `finally`.
 * 3. Spark-Compatible 180-Day Auto-Retention & Legal Hold:
 *    - Stores `createdAtMs`, `expireAtMs` (+180 days), `expireAtIso`, `expireAt` (Firestore Timestamp),
 *      and `legalHold`. Enabling legal hold pushes `expireAt` +50 years into the future.
 *    - Daily client-side cleanup (max once per 24h) purges expired non-hold attachments from IDB & Firestore.
 * 4. Fault-Isolated Individual Cloud Sync:
 *    - Backed by an IndexedDB-only queue (`wg_idb_attach_sync_q_*`) so a single failing or oversized
 *      attachment never blocks `bilties` or other fleet collections.
 * 5. Idempotent Verified Migration:
 *    - Snapshots before migrating legacy `BiltyRecord.legalVault` entries without dropping >2 legacy
 *      photos, verifies every written record in IndexedDB before stripping `legalVault` locally & in cloud.
 */

import JSZip from 'jszip';
import * as firestoreModule from 'firebase/firestore';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { isOwnerEmail } from './authUtils';
import {
  BiltyAttachmentKind,
  BiltyAttachmentRecord,
  BiltyAttachmentSlot,
  BiltyLegalVault,
  BiltyRecord
} from '../types';
import {
  IDB_ONLY_KEY_PREFIX,
  idbDeleteAttachmentsByBiltyKey,
  idbDeleteBiltyAttachment,
  idbGetAllBiltyAttachments,
  idbGetAttachmentsByBiltyKey,
  idbGetBiltyAttachment,
  idbOnlyDelete,
  idbOnlyGet,
  idbOnlySet,
  idbPutBiltyAttachment
} from './persistentStorage';
import { getActiveUserScope, getScopedItem, setScopedItem } from './storageCore';
import { shareOrDownloadBlob } from './nativeExport';

// ---------------------------------------------------------------------------
// Single-Source Configuration Constants
// ---------------------------------------------------------------------------

/** Configurable default max NEW ID-card images per freight document (can be raised anytime). */
export const DEFAULT_MAX_ID_IMAGES_PER_DOC = 2;

export const ATTACHMENT_IMAGE_MAX_DIM = 1000;
export const ATTACHMENT_IMAGE_JPEG_QUALITY = 0.7;
export const ATTACHMENT_IMAGE_TARGET_BYTES = 150 * 1024;
export const ATTACHMENT_HARD_CAP_BYTES = 400 * 1024;

export const ATTACHMENT_RETENTION_DAYS = 180;
export const ATTACHMENT_EXPIRY_WARNING_DAYS = 7;
export const LEGAL_HOLD_FAR_FUTURE_YEARS = 50;
export const DAILY_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const ID_CARD_SLOTS: ReadonlySet<BiltyAttachmentSlot> = new Set([
  'driverCnic',
  'senderCnic',
  'receiverCnic',
  'driverLicense'
]);

const LEGACY_VAULT_IMAGE_SLOTS: ReadonlyArray<{
  slot: BiltyAttachmentSlot;
  isIdCard: boolean;
}> = [
  { slot: 'driverPhoto', isIdCard: false },
  { slot: 'driverLicense', isIdCard: true },
  { slot: 'driverCnic', isIdCard: true },
  { slot: 'vehiclePhoto', isIdCard: false },
  { slot: 'senderPhoto', isIdCard: false },
  { slot: 'senderCnic', isIdCard: true },
  { slot: 'receiverPhoto', isIdCard: false },
  { slot: 'receiverCnic', isIdCard: true }
];

const SYNC_QUEUE_KEY_PREFIX = `${IDB_ONLY_KEY_PREFIX}attach_sync_q_v1_`;
const CLEANUP_LAST_RUN_PREFIX = `${IDB_ONLY_KEY_PREFIX}attach_cleanup_last_`;
export const BILTY_VAULT_PRE_MIGRATION_PREFIX = `${IDB_ONLY_KEY_PREFIX}bilty_vault_pre_mig_`;
export const BILTY_VAULT_MIGRATED_PREFIX = `${IDB_ONLY_KEY_PREFIX}bilty_vault_migrated_`;

export interface AttachmentSyncQueueItem {
  opId: string;
  action: 'upsert' | 'delete';
  attachmentId: string;
  updatedAt: string;
  retryCount: number;
  lastError?: string;
}

export interface CompressedImageResult {
  dataUrl: string;
  mimeType: string;
  byteSize: number;
  width?: number;
  height?: number;
}

export interface SaveAttachmentInput {
  slot: BiltyAttachmentSlot;
  kind: BiltyAttachmentKind;
  dataUrl: string;
  mimeType?: string;
  name?: string;
  width?: number;
  height?: number;
  duration?: number;
  attachmentId?: string;
  allowReplaceSlot?: boolean;
  bypassIdLimit?: boolean;
  createdAtMs?: number;
  migratedFromLegacy?: boolean;
}

export interface PendingDraftAttachment {
  tempId: string;
  slot: BiltyAttachmentSlot;
  kind: BiltyAttachmentKind;
  isIdCard: boolean;
  name?: string;
  mimeType: string;
  dataUrl: string;
  byteSize: number;
  width?: number;
  height?: number;
  duration?: number;
  createdAtMs: number;
}

// ---------------------------------------------------------------------------
// Sequential Low-Memory Image Processing Queue
// ---------------------------------------------------------------------------

let imageProcessChain: Promise<unknown> = Promise.resolve();

function enqueueImageProcess<T>(fn: () => Promise<T>): Promise<T> {
  const run = imageProcessChain.then(fn, fn);
  imageProcessChain = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export function getBiltyAttachmentKey(
  bilty: Pick<BiltyRecord, 'biltyNo' | 'id'> | string | number
): string {
  if (typeof bilty === 'string' || typeof bilty === 'number') {
    const clean = String(bilty).trim();
    return clean ? clean.toUpperCase() : 'UNKNOWN';
  }
  const cleanNo = String(bilty.biltyNo || '').trim().toUpperCase();
  if (cleanNo) return cleanNo;
  if (bilty.id !== undefined && bilty.id !== null) {
    return `ID_${String(bilty.id)}`;
  }
  return 'UNKNOWN';
}

export function isIdCardSlot(slot: BiltyAttachmentSlot): boolean {
  return ID_CARD_SLOTS.has(slot);
}

export function estimateDataUrlBytes(dataUrl: string): number {
  if (!dataUrl || typeof dataUrl !== 'string') return 0;
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) {
    return typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(dataUrl).length : dataUrl.length;
  }
  const meta = dataUrl.slice(0, commaIdx);
  const body = dataUrl.slice(commaIdx + 1).trim();
  if (/;base64/i.test(meta)) {
    let padding = 0;
    if (body.endsWith('==')) padding = 2;
    else if (body.endsWith('=')) padding = 1;
    return Math.max(0, Math.floor((body.length * 3) / 4) - padding);
  }
  return typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(body).length : body.length;
}

export function computeAttachmentExpireAtMs(
  createdAtMs: number,
  legalHold: boolean
): number {
  if (legalHold) {
    return createdAtMs + LEGAL_HOLD_FAR_FUTURE_YEARS * 365 * 86_400_000;
  }
  return createdAtMs + ATTACHMENT_RETENTION_DAYS * 86_400_000;
}

function toFirestoreTimestampSafe(ms: number): unknown {
  const tsClass = (firestoreModule as unknown as {
    Timestamp?: { fromMillis?: (value: number) => unknown };
  }).Timestamp;
  if (tsClass && typeof tsClass.fromMillis === 'function') {
    return tsClass.fromMillis(ms);
  }
  return new Date(ms);
}

function toSafeFirestoreDocId(rawId: string): string {
  const clean = String(rawId || 'att').trim().replace(/[\/.#$\[\]\s]+/g, '_');
  return clean.slice(0, 140) || `att_${Date.now()}`;
}

function makeAttachmentId(biltyKey: string, slot: BiltyAttachmentSlot): string {
  const safeKey = toSafeFirestoreDocId(biltyKey);
  if (slot === 'voiceNote' || slot === 'legalDoc') {
    return `${safeKey}__${slot}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
  return `${safeKey}__${slot}`;
}

function toFirestoreAttachmentPayload(record: BiltyAttachmentRecord): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: record.id,
    biltyKey: record.biltyKey,
    biltyNo: record.biltyNo,
    slot: record.slot,
    kind: record.kind,
    isIdCard: record.isIdCard,
    mimeType: record.mimeType,
    dataUrl: record.dataUrl,
    byteSize: record.byteSize,
    createdAt: record.createdAt,
    createdAtMs: record.createdAtMs,
    updatedAt: record.updatedAt,
    expireAtMs: record.expireAtMs,
    expireAtIso: record.expireAtIso,
    expireAt: toFirestoreTimestampSafe(record.expireAtMs),
    legalHold: record.legalHold
  };
  if (typeof record.biltyId === 'number' && Number.isFinite(record.biltyId)) {
    payload.biltyId = record.biltyId;
  }
  if (record.name) payload.name = record.name;
  if (typeof record.width === 'number') payload.width = record.width;
  if (typeof record.height === 'number') payload.height = record.height;
  if (typeof record.duration === 'number') payload.duration = record.duration;
  if (record.ownerUid) payload.ownerUid = record.ownerUid;
  if (record.migratedFromLegacy) payload.migratedFromLegacy = true;
  return payload;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) {
    return new Blob([dataUrl], { type: 'application/octet-stream' });
  }
  const header = dataUrl.slice(0, commaIdx);
  const base64Body = dataUrl.slice(commaIdx + 1);
  const mimeMatch = header.match(/data:([^;]+)/i);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64Body);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed converting blob to data URL'));
    reader.readAsDataURL(blob);
  });
}

function loadImageElement(srcUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      img.onload = null;
      img.onerror = null;
      reject(new Error('Failed to decode attachment image'));
    };
    img.src = srcUrl;
  });
}

function encodeCanvasJpeg(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.width = 0;
    canvas.height = 0;
    throw new Error('Canvas 2D context unavailable');
  }
  try {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

/**
 * Compresses a single image (File, Blob, or data URL) strictly one at a time on a low-memory queue.
 * - Max edge capped at ~1000 px
 * - Starts at JPEG quality 0.7
 * - Targets <= 150 KB and rejects > 400 KB hard cap
 * - Revokes object URLs and clears DOM/canvas allocations in `finally`
 */
export function compressAttachmentImage(
  input: File | Blob | string,
  options?: {
    maxDim?: number;
    quality?: number;
    targetBytes?: number;
    hardCapBytes?: number;
  }
): Promise<CompressedImageResult> {
  const maxDim = options?.maxDim ?? ATTACHMENT_IMAGE_MAX_DIM;
  const initialQuality = options?.quality ?? ATTACHMENT_IMAGE_JPEG_QUALITY;
  const targetBytes = options?.targetBytes ?? ATTACHMENT_IMAGE_TARGET_BYTES;
  const hardCapBytes = options?.hardCapBytes ?? ATTACHMENT_HARD_CAP_BYTES;

  return enqueueImageProcess(async () => {
    // Non-DOM Node/test fallback: check raw data URL size cleanly
    if (typeof input === 'string' && (typeof document === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function')) {
      const byteSize = estimateDataUrlBytes(input);
      if (byteSize > hardCapBytes) {
        throw new Error(
          `Image size (${Math.round(byteSize / 1024)} KB) exceeds the ${Math.round(hardCapBytes / 1024)} KB hard cap.`
        );
      }
      return {
        dataUrl: input,
        mimeType: 'image/jpeg',
        byteSize
      };
    }

    if (typeof input !== 'string' && (typeof document === 'undefined' || typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function')) {
      const dataUrl = await blobToDataUrl(input);
      const byteSize = estimateDataUrlBytes(dataUrl);
      if (byteSize > hardCapBytes) {
        throw new Error(
          `Image size (${Math.round(byteSize / 1024)} KB) exceeds the ${Math.round(hardCapBytes / 1024)} KB hard cap.`
        );
      }
      return {
        dataUrl,
        mimeType: input.type || 'image/jpeg',
        byteSize
      };
    }

    const blob = typeof input === 'string' ? dataUrlToBlob(input) : input;
    const objectUrl = URL.createObjectURL(blob);
    let img: HTMLImageElement | null = null;

    try {
      img = await loadImageElement(objectUrl);
      let width = img.naturalWidth || img.width || maxDim;
      let height = img.naturalHeight || img.height || maxDim;

      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      let bestDataUrl = encodeCanvasJpeg(img, width, height, initialQuality);
      let bestBytes = estimateDataUrlBytes(bestDataUrl);

      // Gently step quality/scale down toward 150 KB target if still above target
      const qualitySteps = [0.6, 0.52, 0.45];
      for (const q of qualitySteps) {
        if (bestBytes <= targetBytes) break;
        const candidate = encodeCanvasJpeg(img, width, height, q);
        const candidateBytes = estimateDataUrlBytes(candidate);
        if (candidateBytes < bestBytes) {
          bestDataUrl = candidate;
          bestBytes = candidateBytes;
        }
      }

      if (bestBytes > targetBytes && Math.max(width, height) > 760) {
        const scale = 760 / Math.max(width, height);
        const w2 = Math.round(width * scale);
        const h2 = Math.round(height * scale);
        const candidate = encodeCanvasJpeg(img, w2, h2, 0.55);
        const candidateBytes = estimateDataUrlBytes(candidate);
        if (candidateBytes < bestBytes) {
          bestDataUrl = candidate;
          bestBytes = candidateBytes;
          width = w2;
          height = h2;
        }
      }

      if (bestBytes > hardCapBytes) {
        throw new Error(
          `Image size (${Math.round(bestBytes / 1024)} KB) exceeds maximum allowed ${Math.round(hardCapBytes / 1024)} KB.`
        );
      }

      return {
        dataUrl: bestDataUrl,
        mimeType: 'image/jpeg',
        byteSize: bestBytes,
        width,
        height
      };
    } catch (err) {
      // Allow environments without functional Canvas 2D implementation (like JSDOM) if already under cap
      if (typeof input === 'string') {
        const fallbackBytes = estimateDataUrlBytes(input);
        if (fallbackBytes > 0 && fallbackBytes <= hardCapBytes) {
          return {
            dataUrl: input,
            mimeType: 'image/jpeg',
            byteSize: fallbackBytes
          };
        }
      }
      throw err instanceof Error ? err : new Error('Failed to process attachment image');
    } finally {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // ignore
      }
      if (img) {
        img.onload = null;
        img.onerror = null;
        img.src = '';
        img = null;
      }
    }
  });
}

export function validateAudioAttachmentDataUrl(
  dataUrl: string,
  hardCapBytes = ATTACHMENT_HARD_CAP_BYTES
): { byteSize: number; mimeType: string } {
  const byteSize = estimateDataUrlBytes(dataUrl);
  if (byteSize > hardCapBytes) {
    throw new Error(
      `Audio recording (${Math.round(byteSize / 1024)} KB) exceeds the ${Math.round(hardCapBytes / 1024)} KB limit.`
    );
  }
  const match = dataUrl.match(/^data:([^;]+)/i);
  return {
    byteSize,
    mimeType: match ? match[1] : 'audio/webm'
  };
}

// ---------------------------------------------------------------------------
// Bilty Metadata Helper (lightweight count/hold update in localStorage)
// ---------------------------------------------------------------------------

function updateLocalBiltyAttachmentMetadata(
  biltyKey: string,
  updates: { attachmentCount?: number; legalHold?: boolean; stripLegacyVault?: boolean }
): void {
  try {
    const raw = getScopedItem('bilties');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    let changed = false;
    const next = parsed.map((item: BiltyRecord) => {
      if (!item) return item;
      if (getBiltyAttachmentKey(item) !== biltyKey) return item;
      const copy: BiltyRecord = { ...item };
      if (typeof updates.attachmentCount === 'number' && copy.attachmentCount !== updates.attachmentCount) {
        copy.attachmentCount = updates.attachmentCount;
        changed = true;
      }
      if (typeof updates.legalHold === 'boolean' && copy.legalHold !== updates.legalHold) {
        copy.legalHold = updates.legalHold;
        changed = true;
      }
      if (updates.stripLegacyVault && 'legalVault' in copy) {
        delete copy.legalVault;
        changed = true;
      }
      return copy;
    });

    if (changed) {
      setScopedItem('bilties', JSON.stringify(next));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('driverdost:bilties_updated', { detail: next }));
      }
    }
  } catch {
    // ignore
  }
}

async function logAttachmentActivity(action: string, details: string): Promise<void> {
  const user = auth.currentUser;
  const entry = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    uid: user?.uid || 'system',
    email: user?.email || 'system',
    action,
    details,
    category: 'bilty' as const
  };

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingRaw = window.localStorage.getItem('ah-activity-logs');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updated = [entry, ...(Array.isArray(existing) ? existing : [])].slice(0, 100);
      window.localStorage.setItem('ah-activity-logs', JSON.stringify(updated));
    }
  } catch {
    // ignore
  }

  if ((typeof navigator === 'undefined' || navigator.onLine) && user && db) {
    try {
      await firestoreModule.addDoc(collection(db, 'activityLog'), entry);
    } catch {
      // ignore offline
    }
  }
}

// ---------------------------------------------------------------------------
// IDB-Backed Fault-Isolated Firestore Sync Queue
// ---------------------------------------------------------------------------

async function getAttachmentSyncQueue(uid: string): Promise<AttachmentSyncQueueItem[]> {
  try {
    const raw = await idbOnlyGet(`${SYNC_QUEUE_KEY_PREFIX}${uid}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAttachmentSyncQueue(uid: string, items: AttachmentSyncQueueItem[]): Promise<void> {
  const key = `${SYNC_QUEUE_KEY_PREFIX}${uid}`;
  if (items.length === 0) {
    await idbOnlyDelete(key);
    return;
  }
  await idbOnlySet(key, JSON.stringify(items.slice(-250)));
}

async function enqueueAttachmentSyncOp(
  uid: string,
  action: 'upsert' | 'delete',
  attachmentId: string
): Promise<void> {
  const queue = await getAttachmentSyncQueue(uid);
  const filtered = queue.filter((q) => q.attachmentId !== attachmentId);
  filtered.push({
    opId: `${action}_${attachmentId}_${Date.now()}`,
    action,
    attachmentId,
    updatedAt: new Date().toISOString(),
    retryCount: 0
  });
  await saveAttachmentSyncQueue(uid, filtered);
}

async function syncSingleAttachmentToCloud(uid: string, record: BiltyAttachmentRecord): Promise<boolean> {
  if (!db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueAttachmentSyncOp(uid, 'upsert', record.id);
    return false;
  }
  if (record.byteSize > ATTACHMENT_HARD_CAP_BYTES) {
    return false;
  }
  try {
    const ref = doc(db, 'users', uid, 'biltyAttachments', toSafeFirestoreDocId(record.id));
    await setDoc(ref, toFirestoreAttachmentPayload({ ...record, ownerUid: uid }), { merge: true });
    return true;
  } catch (err) {
    const queue = await getAttachmentSyncQueue(uid);
    const filtered = queue.filter((q) => q.attachmentId !== record.id);
    filtered.push({
      opId: `upsert_${record.id}_${Date.now()}`,
      action: 'upsert',
      attachmentId: record.id,
      updatedAt: new Date().toISOString(),
      retryCount: 1,
      lastError: err instanceof Error ? err.message : String(err)
    });
    await saveAttachmentSyncQueue(uid, filtered);
    return false;
  }
}

async function deleteSingleAttachmentFromCloud(uid: string, attachmentId: string): Promise<boolean> {
  if (!db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    await enqueueAttachmentSyncOp(uid, 'delete', attachmentId);
    return false;
  }
  try {
    const ref = doc(db, 'users', uid, 'biltyAttachments', toSafeFirestoreDocId(attachmentId));
    await deleteDoc(ref);
    return true;
  } catch (err) {
    const queue = await getAttachmentSyncQueue(uid);
    const filtered = queue.filter((q) => q.attachmentId !== attachmentId);
    filtered.push({
      opId: `delete_${attachmentId}_${Date.now()}`,
      action: 'delete',
      attachmentId,
      updatedAt: new Date().toISOString(),
      retryCount: 1,
      lastError: err instanceof Error ? err.message : String(err)
    });
    await saveAttachmentSyncQueue(uid, filtered);
    return false;
  }
}

export async function flushBiltyAttachmentSyncQueue(uidOverride?: string): Promise<{
  synced: number;
  remaining: number;
}> {
  const user = auth.currentUser;
  const uid = uidOverride || user?.uid;
  if (!uid || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { synced: 0, remaining: 0 };
  }
  if (user && !isOwnerEmail(user.email)) {
    return { synced: 0, remaining: 0 };
  }

  const queue = await getAttachmentSyncQueue(uid);
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  const remaining: AttachmentSyncQueueItem[] = [];
  let synced = 0;

  for (const item of queue) {
    try {
      const ref = doc(db, 'users', uid, 'biltyAttachments', toSafeFirestoreDocId(item.attachmentId));
      if (item.action === 'delete') {
        await deleteDoc(ref);
        synced++;
      } else {
        const rec = await idbGetBiltyAttachment<BiltyAttachmentRecord>(item.attachmentId);
        if (!rec) {
          synced++;
          continue;
        }
        if (rec.byteSize > ATTACHMENT_HARD_CAP_BYTES) {
          continue;
        }
        await setDoc(ref, toFirestoreAttachmentPayload({ ...rec, ownerUid: uid }), { merge: true });
        synced++;
      }
    } catch (err) {
      remaining.push({
        ...item,
        retryCount: (item.retryCount || 0) + 1,
        lastError: err instanceof Error ? err.message : String(err)
      });
    }
  }

  await saveAttachmentSyncQueue(uid, remaining);
  return { synced, remaining: remaining.length };
}

// ---------------------------------------------------------------------------
// Attachment CRUD & Legal Hold
// ---------------------------------------------------------------------------

export async function getAttachmentsForBilty(
  bilty: Pick<BiltyRecord, 'biltyNo' | 'id' | 'legalVault' | 'legalHold'>
): Promise<BiltyAttachmentRecord[]> {
  const biltyKey = getBiltyAttachmentKey(bilty);
  const fromIdb = await idbGetAttachmentsByBiltyKey<BiltyAttachmentRecord>(biltyKey);
  if (fromIdb.length > 0) {
    return [...fromIdb].sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
  }

  // Fallback read-only projection if legacy legalVault hasn't finished migrating yet
  if (bilty.legalVault) {
    const projected: BiltyAttachmentRecord[] = [];
    const baseMs = bilty.legalVault.updatedAt ? new Date(bilty.legalVault.updatedAt).getTime() || Date.now() : Date.now();
    const hold = Boolean(bilty.legalHold);
    const expireAtMs = computeAttachmentExpireAtMs(baseMs, hold);
    for (const meta of LEGACY_VAULT_IMAGE_SLOTS) {
      const url = bilty.legalVault[meta.slot as keyof BiltyLegalVault];
      if (typeof url === 'string' && url.length > 0) {
        projected.push({
          id: `${toSafeFirestoreDocId(biltyKey)}__${meta.slot}`,
          biltyKey,
          biltyNo: bilty.biltyNo || biltyKey,
          biltyId: bilty.id,
          slot: meta.slot,
          kind: 'image',
          isIdCard: meta.isIdCard,
          mimeType: 'image/jpeg',
          dataUrl: url,
          byteSize: estimateDataUrlBytes(url),
          createdAt: new Date(baseMs).toISOString(),
          createdAtMs: baseMs,
          updatedAt: new Date(baseMs).toISOString(),
          expireAtMs,
          expireAtIso: new Date(expireAtMs).toISOString(),
          legalHold: hold,
          migratedFromLegacy: true
        });
      }
    }
    if (Array.isArray(bilty.legalVault.recordings)) {
      for (const rec of bilty.legalVault.recordings) {
        if (!rec?.dataUrl) continue;
        const rMs = rec.createdAt ? new Date(rec.createdAt).getTime() || baseMs : baseMs;
        const rExp = computeAttachmentExpireAtMs(rMs, hold);
        projected.push({
          id: `${toSafeFirestoreDocId(biltyKey)}__rec_${toSafeFirestoreDocId(rec.id || String(rMs))}`,
          biltyKey,
          biltyNo: bilty.biltyNo || biltyKey,
          biltyId: bilty.id,
          slot: 'voiceNote',
          kind: 'audio',
          isIdCard: false,
          name: rec.name,
          mimeType: 'audio/webm',
          dataUrl: rec.dataUrl,
          byteSize: estimateDataUrlBytes(rec.dataUrl),
          duration: rec.duration,
          createdAt: rec.createdAt || new Date(rMs).toISOString(),
          createdAtMs: rMs,
          updatedAt: rec.createdAt || new Date(rMs).toISOString(),
          expireAtMs: rExp,
          expireAtIso: new Date(rExp).toISOString(),
          legalHold: hold,
          migratedFromLegacy: true
        });
      }
    }
    return projected;
  }

  return [];
}

export async function getAllBiltyAttachments(): Promise<BiltyAttachmentRecord[]> {
  return idbGetAllBiltyAttachments<BiltyAttachmentRecord>();
}

export async function saveBiltyAttachment(
  bilty: Pick<BiltyRecord, 'id' | 'biltyNo' | 'legalHold'>,
  input: SaveAttachmentInput
): Promise<BiltyAttachmentRecord> {
  const biltyKey = getBiltyAttachmentKey(bilty);
  const existing = await idbGetAttachmentsByBiltyKey<BiltyAttachmentRecord>(biltyKey);
  const isId = isIdCardSlot(input.slot);

  const byteSize = estimateDataUrlBytes(input.dataUrl);
  if (byteSize > ATTACHMENT_HARD_CAP_BYTES) {
    throw new Error(
      `Attachment size (${Math.round(byteSize / 1024)} KB) exceeds the ${Math.round(ATTACHMENT_HARD_CAP_BYTES / 1024)} KB hard cap.`
    );
  }

  const targetId = input.attachmentId || makeAttachmentId(biltyKey, input.slot);
  const replacingSame = existing.some((e) => e.id === targetId || (input.allowReplaceSlot !== false && e.slot === input.slot && e.slot !== 'voiceNote' && e.slot !== 'legalDoc'));

  if (isId && !input.bypassIdLimit && !replacingSame) {
    const idCardCount = existing.filter((e) => e.isIdCard).length;
    if (idCardCount >= DEFAULT_MAX_ID_IMAGES_PER_DOC) {
      throw new Error(
        `Maximum ${DEFAULT_MAX_ID_IMAGES_PER_DOC} ID-card images per freight document reached.`
      );
    }
  }

  const nowMs = input.createdAtMs ?? Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const legalHold = Boolean(bilty.legalHold);
  const expireAtMs = computeAttachmentExpireAtMs(nowMs, legalHold);
  const ownerUid = auth.currentUser && isOwnerEmail(auth.currentUser.email) ? auth.currentUser.uid : undefined;

  const record: BiltyAttachmentRecord = {
    id: targetId,
    biltyKey,
    biltyNo: String(bilty.biltyNo || biltyKey).trim().toUpperCase(),
    biltyId: bilty.id,
    slot: input.slot,
    kind: input.kind,
    isIdCard: isId,
    name: input.name,
    mimeType: input.mimeType || (input.kind === 'audio' ? 'audio/webm' : 'image/jpeg'),
    dataUrl: input.dataUrl,
    byteSize,
    width: input.width,
    height: input.height,
    duration: input.duration,
    createdAt: nowIso,
    createdAtMs: nowMs,
    updatedAt: new Date().toISOString(),
    expireAtMs,
    expireAtIso: new Date(expireAtMs).toISOString(),
    legalHold,
    ownerUid,
    migratedFromLegacy: input.migratedFromLegacy
  };

  await idbPutBiltyAttachment(record);

  const refreshed = await idbGetAttachmentsByBiltyKey<BiltyAttachmentRecord>(biltyKey);
  updateLocalBiltyAttachmentMetadata(biltyKey, { attachmentCount: refreshed.length });

  if (ownerUid) {
    void syncSingleAttachmentToCloud(ownerUid, record);
  }

  return record;
}

export async function deleteBiltyAttachment(
  attachmentId: string,
  bilty?: Pick<BiltyRecord, 'biltyNo' | 'id'>,
  uidOverride?: string
): Promise<boolean> {
  const existing = await idbGetBiltyAttachment<BiltyAttachmentRecord>(attachmentId);
  const biltyKey = bilty ? getBiltyAttachmentKey(bilty) : existing?.biltyKey;

  await idbDeleteBiltyAttachment(attachmentId);

  if (biltyKey) {
    const remaining = await idbGetAttachmentsByBiltyKey<BiltyAttachmentRecord>(biltyKey);
    updateLocalBiltyAttachmentMetadata(biltyKey, { attachmentCount: remaining.length });
  }

  const uid = uidOverride || (auth.currentUser && isOwnerEmail(auth.currentUser.email) ? auth.currentUser.uid : undefined);
  if (uid) {
    void deleteSingleAttachmentFromCloud(uid, attachmentId);
  }
  return true;
}

export async function deleteAllAttachmentsForBilty(
  biltyOrKey: Pick<BiltyRecord, 'biltyNo' | 'id'> | string | number,
  uidOverride?: string
): Promise<number> {
  const biltyKey = getBiltyAttachmentKey(biltyOrKey);
  const deletedIds = await idbDeleteAttachmentsByBiltyKey(biltyKey);

  updateLocalBiltyAttachmentMetadata(biltyKey, { attachmentCount: 0, stripLegacyVault: true });

  const uid = uidOverride || (auth.currentUser && isOwnerEmail(auth.currentUser.email) ? auth.currentUser.uid : undefined);
  if (uid) {
    for (const id of deletedIds) {
      void deleteSingleAttachmentFromCloud(uid, id);
    }
    // Also clean any remote-only attachment docs linked to biltyKey
    if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const snap = await getDocs(collection(db, 'users', uid, 'biltyAttachments'));
        for (const d of snap.docs) {
          const data = d.data() as Partial<BiltyAttachmentRecord>;
          if (data?.biltyKey === biltyKey && !deletedIds.includes(d.id)) {
            await deleteDoc(doc(db, 'users', uid, 'biltyAttachments', d.id)).catch(() => {});
          }
        }
      } catch {
        // offline or query error ignored; local IDs already queued
      }
    }
  }

  return deletedIds.length;
}

export async function setBiltyLegalHold(
  bilty: Pick<BiltyRecord, 'biltyNo' | 'id'>,
  legalHold: boolean,
  uidOverride?: string
): Promise<BiltyAttachmentRecord[]> {
  const biltyKey = getBiltyAttachmentKey(bilty);
  const items = await idbGetAttachmentsByBiltyKey<BiltyAttachmentRecord>(biltyKey);
  const nowIso = new Date().toISOString();
  const uid = uidOverride || (auth.currentUser && isOwnerEmail(auth.currentUser.email) ? auth.currentUser.uid : undefined);

  const updatedItems: BiltyAttachmentRecord[] = [];
  for (const item of items) {
    const expireAtMs = computeAttachmentExpireAtMs(item.createdAtMs || Date.now(), legalHold);
    const updated: BiltyAttachmentRecord = {
      ...item,
      legalHold,
      expireAtMs,
      expireAtIso: new Date(expireAtMs).toISOString(),
      updatedAt: nowIso
    };
    await idbPutBiltyAttachment(updated);
    updatedItems.push(updated);
    if (uid) {
      void syncSingleAttachmentToCloud(uid, updated);
    }
  }

  updateLocalBiltyAttachmentMetadata(biltyKey, { legalHold });
  return updatedItems;
}

/**
 * Pulls owner attachments from Firestore `users/{uid}/biltyAttachments` into IndexedDB if missing locally.
 * Helps restore attachments on a fresh device even though standard backup chunks omit attachment payloads.
 */
export async function pullRemoteBiltyAttachmentsForOwner(uid: string): Promise<number> {
  if (!uid || !db || (typeof navigator !== 'undefined' && !navigator.onLine)) return 0;
  const user = auth.currentUser;
  if (user && !isOwnerEmail(user.email)) return 0;

  let pulled = 0;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'biltyAttachments'));
    const touchedKeys = new Set<string>();
    for (const d of snap.docs) {
      const remote = d.data() as Partial<BiltyAttachmentRecord>;
      if (!remote?.id || !remote?.dataUrl || !remote?.biltyKey) continue;
      const existing = await idbGetBiltyAttachment<BiltyAttachmentRecord>(remote.id);
      if (!existing) {
        const createdAtMs = typeof remote.createdAtMs === 'number'
          ? remote.createdAtMs
          : (remote.createdAt ? new Date(remote.createdAt).getTime() || Date.now() : Date.now());
        const legalHold = Boolean(remote.legalHold);
        const expireAtMs = typeof remote.expireAtMs === 'number'
          ? remote.expireAtMs
          : computeAttachmentExpireAtMs(createdAtMs, legalHold);

        const rec: BiltyAttachmentRecord = {
          id: remote.id,
          biltyKey: String(remote.biltyKey),
          biltyNo: String(remote.biltyNo || remote.biltyKey),
          biltyId: typeof remote.biltyId === 'number' ? remote.biltyId : undefined,
          slot: (remote.slot as BiltyAttachmentSlot) || 'legalDoc',
          kind: remote.kind === 'audio' ? 'audio' : 'image',
          isIdCard: Boolean(remote.isIdCard),
          name: remote.name,
          mimeType: remote.mimeType || 'image/jpeg',
          dataUrl: remote.dataUrl,
          byteSize: typeof remote.byteSize === 'number' ? remote.byteSize : estimateDataUrlBytes(remote.dataUrl),
          width: remote.width,
          height: remote.height,
          duration: remote.duration,
          createdAt: remote.createdAt || new Date(createdAtMs).toISOString(),
          createdAtMs,
          updatedAt: remote.updatedAt || new Date().toISOString(),
          expireAtMs,
          expireAtIso: remote.expireAtIso || new Date(expireAtMs).toISOString(),
          legalHold,
          ownerUid: uid
        };
        await idbPutBiltyAttachment(rec);
        touchedKeys.add(rec.biltyKey);
        pulled++;
      }
    }
    for (const k of touchedKeys) {
      const list = await idbGetAttachmentsByBiltyKey(k);
      updateLocalBiltyAttachmentMetadata(k, { attachmentCount: list.length });
    }
  } catch (err) {
    console.warn('[BiltyAttachments] Remote attachment pull notice:', err);
  }
  return pulled;
}

// ---------------------------------------------------------------------------
// Daily Spark Retention Cleanup & 7-Day Expiring Warning + ZIP Export
// ---------------------------------------------------------------------------

export async function runDailyBiltyAttachmentCleanup(
  uid: string,
  options?: { force?: boolean; nowMs?: number }
): Promise<{ executed: boolean; deletedCount: number; skippedHoldCount: number }> {
  if (!uid) return { executed: false, deletedCount: 0, skippedHoldCount: 0 };
  const user = auth.currentUser;
  if (user && !isOwnerEmail(user.email)) {
    return { executed: false, deletedCount: 0, skippedHoldCount: 0 };
  }

  const nowMs = options?.nowMs ?? Date.now();
  const lastRunKey = `${CLEANUP_LAST_RUN_PREFIX}${uid}`;

  if (!options?.force) {
    const lastRunStr = await idbOnlyGet(lastRunKey);
    const lastRunMs = lastRunStr ? Number(lastRunStr) : 0;
    if (Number.isFinite(lastRunMs) && lastRunMs > 0 && nowMs - lastRunMs < DAILY_CLEANUP_INTERVAL_MS) {
      return { executed: false, deletedCount: 0, skippedHoldCount: 0 };
    }
  }

  // Also ensure any pending attachment sync ops run before/during daily maintenance
  await flushBiltyAttachmentSyncQueue(uid).catch(() => {});

  const allLocal = await idbGetAllBiltyAttachments<BiltyAttachmentRecord>();
  let deletedCount = 0;
  let skippedHoldCount = 0;
  const affectedBiltyKeys = new Set<string>();
  const deletedIds = new Set<string>();

  for (const att of allLocal) {
    if (!att || !att.id) continue;
    if (att.legalHold) {
      skippedHoldCount++;
      continue;
    }
    const expMs = typeof att.expireAtMs === 'number'
      ? att.expireAtMs
      : computeAttachmentExpireAtMs(att.createdAtMs || nowMs, false);

    if (expMs <= nowMs) {
      await idbDeleteBiltyAttachment(att.id);
      deletedIds.add(att.id);
      affectedBiltyKeys.add(att.biltyKey);
      await deleteSingleAttachmentFromCloud(uid, att.id);
      deletedCount++;
    }
  }

  // Also check remote attachments directly for any expired items on server
  if (db && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const snap = await getDocs(collection(db, 'users', uid, 'biltyAttachments'));
      for (const d of snap.docs) {
        const remote = d.data() as Partial<BiltyAttachmentRecord>;
        if (!remote || remote.legalHold || deletedIds.has(d.id)) continue;
        const expMs = typeof remote.expireAtMs === 'number' ? remote.expireAtMs : Number.POSITIVE_INFINITY;
        if (expMs <= nowMs) {
          await deleteDoc(doc(db, 'users', uid, 'biltyAttachments', d.id)).catch(() => {});
          if (remote.biltyKey) affectedBiltyKeys.add(String(remote.biltyKey));
          deletedCount++;
        }
      }
    } catch {
      // Offline/query failure safe to retry next day
    }
  }

  for (const key of affectedBiltyKeys) {
    const remaining = await idbGetAttachmentsByBiltyKey(key);
    updateLocalBiltyAttachmentMetadata(key, { attachmentCount: remaining.length });
  }

  await idbOnlySet(lastRunKey, String(nowMs));

  if (deletedCount > 0) {
    await logAttachmentActivity(
      'Attachment Retention Cleanup',
      `Auto-deleted ${deletedCount} expired bilty attachment(s) after ${ATTACHMENT_RETENTION_DAYS}-day retention (skipped ${skippedHoldCount} under legal hold).`
    );
  }

  return { executed: true, deletedCount, skippedHoldCount };
}

export async function getExpiringBiltyAttachmentsSummary(
  withinDays = ATTACHMENT_EXPIRY_WARNING_DAYS,
  nowMs = Date.now()
): Promise<{ count: number; attachments: BiltyAttachmentRecord[] }> {
  const all = await idbGetAllBiltyAttachments<BiltyAttachmentRecord>();
  const windowEndMs = nowMs + withinDays * 86_400_000;
  const expiring = all
    .filter((att) => !att.legalHold && att.expireAtMs > nowMs && att.expireAtMs <= windowEndMs)
    .sort((a, b) => a.expireAtMs - b.expireAtMs);
  return {
    count: expiring.length,
    attachments: expiring
  };
}

export async function exportAttachmentsZipBundle(
  attachments: BiltyAttachmentRecord[],
  filePrefix = 'Warraich_Goods_Expiring_Attachments'
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!attachments || attachments.length === 0) {
    return { success: false, count: 0, error: 'No attachments available to export.' };
  }

  try {
    const zip = new JSZip();
    const manifest: Array<Record<string, unknown>> = [];

    for (const att of attachments) {
      const folder = zip.folder(toSafeFirestoreDocId(att.biltyNo || att.biltyKey));
      if (!folder || !att.dataUrl || !att.dataUrl.includes(',')) continue;
      const base64 = att.dataUrl.split(',')[1];
      const ext = att.kind === 'audio' ? 'webm' : 'jpg';
      const safeName = `${toSafeFirestoreDocId(att.slot)}_${toSafeFirestoreDocId(att.id)}.${ext}`;
      folder.file(safeName, base64, { base64: true });
      manifest.push({
        id: att.id,
        biltyNo: att.biltyNo,
        slot: att.slot,
        kind: att.kind,
        createdAt: att.createdAt,
        expireAt: att.expireAtIso,
        legalHold: att.legalHold,
        byteSize: att.byteSize
      });
    }

    zip.file('attachments-manifest.json', JSON.stringify(manifest, null, 2));
    const zipBytes = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `${filePrefix}_${dateStamp}.zip`;

    await shareOrDownloadBlob(blob, filename, {
      title: filename,
      dialogTitle: filename
    });
    return { success: true, count: manifest.length };
  } catch (err) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : 'ZIP export failed'
    };
  }
}

// ---------------------------------------------------------------------------
// One-Time, Verified, Idempotent Migration of Legacy BiltyRecord.legalVault
// ---------------------------------------------------------------------------

export async function migrateLegacyBiltyLegalVaults(uidOverride?: string): Promise<{
  migratedBilties: number;
  migratedAttachments: number;
  alreadyDone: boolean;
}> {
  const scope = uidOverride || getActiveUserScope();
  const user = auth.currentUser;
  const uid = uidOverride || (user && isOwnerEmail(user.email) ? user.uid : undefined);

  const rawBilties = getScopedItem('bilties');
  let bilties: BiltyRecord[] = [];
  try {
    bilties = rawBilties ? JSON.parse(rawBilties) : [];
    if (!Array.isArray(bilties)) bilties = [];
  } catch {
    bilties = [];
  }

  const withLegacyVault = bilties.filter((b) => {
    if (!b?.legalVault) return false;
    const hasImg = LEGACY_VAULT_IMAGE_SLOTS.some((m) => Boolean(b.legalVault?.[m.slot as keyof BiltyLegalVault]));
    const hasRec = Array.isArray(b.legalVault.recordings) && b.legalVault.recordings.length > 0;
    return hasImg || hasRec;
  });

  const migratedFlagKey = `${BILTY_VAULT_MIGRATED_PREFIX}${scope}`;
  if (withLegacyVault.length === 0) {
    // Strip empty leftover legalVault shells if any exist
    if (bilties.some((b) => 'legalVault' in b)) {
      const cleaned = bilties.map((b) => {
        if (!('legalVault' in b)) return b;
        const copy = { ...b };
        delete copy.legalVault;
        return copy;
      });
      setScopedItem('bilties', JSON.stringify(cleaned));
    }
    await idbOnlySet(migratedFlagKey, '1');
    return { migratedBilties: 0, migratedAttachments: 0, alreadyDone: true };
  }

  // Step 1: Capture pre-migration snapshot in IndexedDB ONLY before altering any record
  const preSnapKey = `${BILTY_VAULT_PRE_MIGRATION_PREFIX}${scope}`;
  const existingPreSnap = await idbOnlyGet(preSnapKey);
  if (!existingPreSnap) {
    await idbOnlySet(
      preSnapKey,
      JSON.stringify({
        capturedAt: new Date().toISOString(),
        bilties: withLegacyVault
      })
    );
  }

  let migratedBilties = 0;
  let migratedAttachments = 0;
  const verifiedCleanKeys = new Set<string>();

  for (const bilty of withLegacyVault) {
    const vault = bilty.legalVault;
    if (!vault) continue;

    const biltyKey = getBiltyAttachmentKey(bilty);
    const createdAtMs = vault.updatedAt
      ? new Date(vault.updatedAt).getTime() || Date.now()
      : (bilty.createdAt ? new Date(bilty.createdAt).getTime() || Date.now() : Date.now());
    const expectedIds: string[] = [];
    let allSucceededForBilty = true;

    for (const meta of LEGACY_VAULT_IMAGE_SLOTS) {
      const rawDataUrl = vault[meta.slot as keyof BiltyLegalVault];
      if (typeof rawDataUrl !== 'string' || !rawDataUrl.trim()) continue;

      const deterministicId = `${toSafeFirestoreDocId(biltyKey)}__${meta.slot}`;
      expectedIds.push(deterministicId);

      // Idempotent check: skip re-compressing if already stored & verified in IDB
      const already = await idbGetBiltyAttachment<BiltyAttachmentRecord>(deterministicId);
      if (already && already.dataUrl) {
        continue;
      }

      try {
        let finalUrl = rawDataUrl;
        let width: number | undefined;
        let height: number | undefined;
        let mimeType = 'image/jpeg';

        if (estimateDataUrlBytes(rawDataUrl) > ATTACHMENT_HARD_CAP_BYTES) {
          const compressed = await compressAttachmentImage(rawDataUrl);
          finalUrl = compressed.dataUrl;
          width = compressed.width;
          height = compressed.height;
          mimeType = compressed.mimeType;
        } else if (estimateDataUrlBytes(rawDataUrl) > ATTACHMENT_IMAGE_TARGET_BYTES) {
          try {
            const compressed = await compressAttachmentImage(rawDataUrl);
            finalUrl = compressed.dataUrl;
            width = compressed.width;
            height = compressed.height;
            mimeType = compressed.mimeType;
          } catch {
            // Keep original under-hard-cap URL if canvas recompression unavailable
          }
        }

        await saveBiltyAttachment(bilty, {
          attachmentId: deterministicId,
          slot: meta.slot,
          kind: 'image',
          dataUrl: finalUrl,
          mimeType,
          width,
          height,
          allowReplaceSlot: true,
          bypassIdLimit: true, // NEVER drop >2 legacy ID photos
          createdAtMs,
          migratedFromLegacy: true
        });
        migratedAttachments++;
      } catch (err) {
        console.warn('[Migration] Failed migrating image slot', meta.slot, biltyKey, err);
        allSucceededForBilty = false;
      }
    }

    if (Array.isArray(vault.recordings)) {
      for (const rec of vault.recordings) {
        if (!rec?.dataUrl) continue;
        const safeRecId = toSafeFirestoreDocId(rec.id || String(Date.now()));
        const deterministicId = `${toSafeFirestoreDocId(biltyKey)}__rec_${safeRecId}`;
        expectedIds.push(deterministicId);

        const already = await idbGetBiltyAttachment<BiltyAttachmentRecord>(deterministicId);
        if (already && already.dataUrl) {
          continue;
        }

        try {
          const rMs = rec.createdAt ? new Date(rec.createdAt).getTime() || createdAtMs : createdAtMs;
          await saveBiltyAttachment(bilty, {
            attachmentId: deterministicId,
            slot: 'voiceNote',
            kind: 'audio',
            dataUrl: rec.dataUrl,
            name: rec.name,
            duration: rec.duration,
            allowReplaceSlot: true,
            bypassIdLimit: true,
            createdAtMs: rMs,
            migratedFromLegacy: true
          });
          migratedAttachments++;
        } catch (err) {
          console.warn('[Migration] Failed migrating recording', rec.id, biltyKey, err);
          allSucceededForBilty = false;
        }
      }
    }

    // Step 2: Verify every expected attachment exists in IndexedDB BEFORE stripping legalVault
    let verifiedCount = 0;
    for (const id of expectedIds) {
      const check = await idbGetBiltyAttachment<BiltyAttachmentRecord>(id);
      if (check && check.dataUrl && check.dataUrl.length > 0) {
        verifiedCount++;
      }
    }

    if (allSucceededForBilty && verifiedCount === expectedIds.length) {
      verifiedCleanKeys.add(biltyKey);
      migratedBilties++;
    }
  }

  // Step 3: Strip `legalVault` ONLY for verified bilties in local storage & update attachmentCount
  if (verifiedCleanKeys.size > 0) {
    const updatedBilties: BiltyRecord[] = [];
    for (const b of bilties) {
      const bKey = getBiltyAttachmentKey(b);
      if (verifiedCleanKeys.has(bKey)) {
        const storedList = await idbGetAttachmentsByBiltyKey(bKey);
        const copy: BiltyRecord = {
          ...b,
          attachmentCount: storedList.length,
          updatedAt: new Date().toISOString()
        };
        delete copy.legalVault;
        updatedBilties.push(copy);

        // Strip `legalVault` from cloud biltiesDocs doc if signed in as owner
        if (uid && db && (typeof navigator === 'undefined' || navigator.onLine)) {
          try {
            const safeDocId = toSafeFirestoreDocId(bKey);
            const docRef = doc(db, 'users', uid, 'biltiesDocs', safeDocId);
            const cloudSnap = await getDoc(docRef).catch(() => null);
            if (cloudSnap && cloudSnap.exists()) {
              const cloudData = { ...(cloudSnap.data() as Record<string, unknown>) };
              if ('legalVault' in cloudData) {
                delete cloudData.legalVault;
              }
              cloudData.attachmentCount = storedList.length;
              cloudData.updatedAt = copy.updatedAt;
              await setDoc(docRef, cloudData);
            }
          } catch {
            // Will stay clean on next sync via writePerDocCollectionToFirestore
          }
        }
      } else {
        updatedBilties.push(b);
      }
    }

    setScopedItem('bilties', JSON.stringify(updatedBilties));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('driverdost:bilties_updated', { detail: updatedBilties }));
    }

    // Rewrite legacy `users/{uid}/collections/bilties` doc cleanly without `legalVault`
    if (uid && db && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const sanitizedList = updatedBilties.map((b) => {
          const copy = { ...b };
          delete copy.legalVault;
          return copy;
        });
        const legacyRef = doc(db, 'users', uid, 'collections', 'bilties');
        await setDoc(
          legacyRef,
          { items: sanitizedList, updatedAt: new Date().toISOString(), perDocSynced: true },
          { merge: true }
        );
      } catch {
        // ignore network failure
      }
    }
  }

  // Only mark migrated complete once ZERO unmigrated legacy vaults remain
  const stillRemaining = bilties.some(
    (b) => b.legalVault && !verifiedCleanKeys.has(getBiltyAttachmentKey(b))
  );
  if (!stillRemaining) {
    await idbOnlySet(migratedFlagKey, '1');
  }

  if (migratedAttachments > 0) {
    await logAttachmentActivity(
      'Attachments Migrated',
      `Moved ${migratedAttachments} attachment(s) from ${migratedBilties} document(s) into isolated 180-day storage.`
    );
  }

  return {
    migratedBilties,
    migratedAttachments,
    alreadyDone: false
  };
}
