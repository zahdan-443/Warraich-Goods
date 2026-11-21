/**
 * Driver Dost - High Performance Persistent Storage & IndexedDB Engine
 *
 * Guarantees:
 * 1. Persistent Storage Mode (`navigator.storage.persist()`).
 * 2. Extended Quota via native IndexedDB.
 * 3. Hydration Tombstone Registry (`wg_v3_deleted_keys`): deleted keys are NEVER
 *    resurrected from stale IndexedDB copies on app restart (#6).
 */

const DB_NAME = 'driver_dost_persistent_db';
const DB_VERSION = 2;
const STORE_NAME = 'driver_dost_store';
export const BILTY_ATTACHMENTS_STORE = 'bilty_attachments';
const HYDRATION_TOMBSTONES_KEY = 'wg_v3_deleted_keys';
export const IDB_ONLY_KEY_PREFIX = 'wg_idb_';
export const PRE_RESTORE_SNAPSHOT_TTL_DAYS = 7;
export const PRE_RESTORE_SNAPSHOT_PREFIX = `${IDB_ONLY_KEY_PREFIX}prerestore_v1_`;

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase | null> | null = null;

// Node/Vitest or non-IDB fallback maps (never mirrored to localStorage)
const fallbackIdbOnlyMap = new Map<string, string>();
const fallbackAttachmentMap = new Map<string, Record<string, unknown>>();

// Synchronous availability cache for pre-restore snapshots (populated by IDB writes/startup prune)
const preRestoreAvailabilityCache = new Map<string, number>();

// In-memory cache of keys explicitly deleted so IDB hydration skips them even if async IDB delete lags
const deletedKeySet = new Set<string>();

function loadLocalDeletedKeySet(): Set<string> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(HYDRATION_TOMBSTONES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const k of parsed) {
            if (typeof k === 'string') deletedKeySet.add(k);
          }
        }
      }
    }
  } catch {
    // ignore
  }
  return deletedKeySet;
}

function persistLocalDeletedKeySet(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Keep last 500 deleted key markers so this list never grows unbounded
      const list = Array.from(deletedKeySet).slice(-500);
      window.localStorage.setItem(HYDRATION_TOMBSTONES_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

export function markKeyDeletedForHydration(key: string): void {
  if (!key || key === HYDRATION_TOMBSTONES_KEY) return;
  loadLocalDeletedKeySet();
  deletedKeySet.add(key);
  persistLocalDeletedKeySet();
}

export function clearKeyDeletedForHydration(key: string): void {
  if (!key || key === HYDRATION_TOMBSTONES_KEY) return;
  loadLocalDeletedKeySet();
  if (deletedKeySet.delete(key)) {
    persistLocalDeletedKeySet();
  }
}

export function getIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
        if (!db.objectStoreNames.contains(BILTY_ATTACHMENTS_STORE)) {
          const attStore = db.createObjectStore(BILTY_ATTACHMENTS_STORE, { keyPath: 'id' });
          attStore.createIndex('by_biltyKey', 'biltyKey', { unique: false });
          attStore.createIndex('by_expireAtMs', 'expireAtMs', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        resolve(dbInstance);
      };

      request.onerror = (e) => {
        console.warn('Driver Dost IndexedDB open notice:', e);
        resolve(null);
      };
    } catch (err) {
      console.warn('Driver Dost IndexedDB init caught:', err);
      resolve(null);
    }
  });

  return dbInitPromise;
}

export async function idbSet(key: string, value: string): Promise<boolean> {
  clearKeyDeletedForHydration(key);
  try {
    const db = await getIndexedDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await getIndexedDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(typeof request.result === 'string' ? request.result : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbDelete(key: string): Promise<boolean> {
  markKeyDeletedForHydration(key);
  try {
    const db = await getIndexedDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function idbDeleteMany(keys: string[]): Promise<number> {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
  uniqueKeys.forEach(markKeyDeletedForHydration);
  if (uniqueKeys.length === 0) return 0;

  try {
    const db = await getIndexedDB();
    if (!db) return 0;

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      let count = 0;

      for (const key of uniqueKeys) {
        try {
          store.delete(key);
          count++;
        } catch {
          // ignore individual failure
        }
      }

      transaction.oncomplete = () => resolve(count);
      transaction.onerror = () => resolve(count);
      transaction.onabort = () => resolve(count);
    });
  } catch {
    return 0;
  }
}

export async function idbGetAllEntries(): Promise<Record<string, string>> {
  try {
    const db = await getIndexedDB();
    if (!db) return {};

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const results: Record<string, string> = {};

      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (typeof cursor.key === 'string' && typeof cursor.value === 'string') {
            results[cursor.key] = cursor.value;
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => resolve(results);
    });
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// IDB-Only KV Helpers (NEVER hydrated to or read from localStorage)
// ---------------------------------------------------------------------------

export async function idbOnlySet(key: string, value: string): Promise<boolean> {
  try {
    const db = await getIndexedDB();
    if (!db) {
      fallbackIdbOnlyMap.set(key, value);
      return true;
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => {
        fallbackIdbOnlyMap.set(key, value);
        resolve(false);
      };
    });
  } catch {
    fallbackIdbOnlyMap.set(key, value);
    return false;
  }
}

export async function idbOnlyGet(key: string): Promise<string | null> {
  try {
    const db = await getIndexedDB();
    if (!db) {
      return fallbackIdbOnlyMap.get(key) ?? null;
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(typeof request.result === 'string' ? request.result : null);
      };
      request.onerror = () => resolve(fallbackIdbOnlyMap.get(key) ?? null);
    });
  } catch {
    return fallbackIdbOnlyMap.get(key) ?? null;
  }
}

export async function idbOnlyDelete(key: string): Promise<boolean> {
  fallbackIdbOnlyMap.delete(key);
  try {
    const db = await getIndexedDB();
    if (!db) {
      return true;
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function idbOnlyListKeys(prefix = IDB_ONLY_KEY_PREFIX): Promise<string[]> {
  try {
    const db = await getIndexedDB();
    if (!db) {
      return Array.from(fallbackIdbOnlyMap.keys()).filter((k) => k.startsWith(prefix));
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const keys: string[] = [];

      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (typeof cursor.key === 'string' && cursor.key.startsWith(prefix)) {
            keys.push(cursor.key);
          }
          cursor.continue();
        } else {
          resolve(keys);
        }
      };
      request.onerror = () => resolve(keys);
    });
  } catch {
    return Array.from(fallbackIdbOnlyMap.keys()).filter((k) => k.startsWith(prefix));
  }
}

// ---------------------------------------------------------------------------
// Dedicated Bilty Attachments IndexedDB Object Store Helpers
// ---------------------------------------------------------------------------

export async function idbPutBiltyAttachment<T extends { id: string }>(record: T): Promise<boolean> {
  try {
    const db = await getIndexedDB();
    if (!db) {
      fallbackAttachmentMap.set(record.id, { ...record });
      return true;
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([BILTY_ATTACHMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(BILTY_ATTACHMENTS_STORE);
      const request = store.put(record);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    fallbackAttachmentMap.set(record.id, { ...record });
    return false;
  }
}

export async function idbGetBiltyAttachment<T = Record<string, unknown>>(id: string): Promise<T | null> {
  try {
    const db = await getIndexedDB();
    if (!db) {
      return (fallbackAttachmentMap.get(id) as T | undefined) ?? null;
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([BILTY_ATTACHMENTS_STORE], 'readonly');
      const store = transaction.objectStore(BILTY_ATTACHMENTS_STORE);
      const request = store.get(id);
      request.onsuccess = () => resolve((request.result as T | undefined) ?? null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return (fallbackAttachmentMap.get(id) as T | undefined) ?? null;
  }
}

export async function idbGetAttachmentsByBiltyKey<T = Record<string, unknown>>(biltyKey: string): Promise<T[]> {
  try {
    const db = await getIndexedDB();
    if (!db) {
      const list: T[] = [];
      for (const item of fallbackAttachmentMap.values()) {
        if (item.biltyKey === biltyKey) list.push(item as unknown as T);
      }
      return list;
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([BILTY_ATTACHMENTS_STORE], 'readonly');
      const store = transaction.objectStore(BILTY_ATTACHMENTS_STORE);
      const index = store.index('by_biltyKey');
      const request = index.getAll(biltyKey);
      request.onsuccess = () => resolve(Array.isArray(request.result) ? (request.result as T[]) : []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function idbGetAllBiltyAttachments<T = Record<string, unknown>>(): Promise<T[]> {
  try {
    const db = await getIndexedDB();
    if (!db) {
      return Array.from(fallbackAttachmentMap.values()) as unknown as T[];
    }

    return new Promise((resolve) => {
      const transaction = db.transaction([BILTY_ATTACHMENTS_STORE], 'readonly');
      const store = transaction.objectStore(BILTY_ATTACHMENTS_STORE);
      const request = store.getAll();
      request.onsuccess = () => resolve(Array.isArray(request.result) ? (request.result as T[]) : []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function idbDeleteBiltyAttachment(id: string): Promise<boolean> {
  fallbackAttachmentMap.delete(id);
  try {
    const db = await getIndexedDB();
    if (!db) return true;

    return new Promise((resolve) => {
      const transaction = db.transaction([BILTY_ATTACHMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(BILTY_ATTACHMENTS_STORE);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function idbDeleteAttachmentsByBiltyKey(biltyKey: string): Promise<string[]> {
  const existing = await idbGetAttachmentsByBiltyKey<{ id: string }>(biltyKey);
  const deletedIds: string[] = [];
  for (const item of existing) {
    if (item?.id) {
      await idbDeleteBiltyAttachment(item.id);
      deletedIds.push(item.id);
    }
  }
  return deletedIds;
}

export async function idbClearAllBiltyAttachments(): Promise<void> {
  fallbackAttachmentMap.clear();
  try {
    const db = await getIndexedDB();
    if (!db) return;

    await new Promise<void>((resolve) => {
      const transaction = db.transaction([BILTY_ATTACHMENTS_STORE], 'readwrite');
      const store = transaction.objectStore(BILTY_ATTACHMENTS_STORE);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// IDB-Only Pre-Restore Undo Snapshot (7-Day Auto-Expiry, NEVER in localStorage)
// ---------------------------------------------------------------------------

interface StoredPreRestoreWrapper {
  savedAtMs: number;
  expiresAtMs: number;
  snapshot: Record<string, unknown>;
}

export function removeLegacyLocalPreRestoreKeys(scope?: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    if (scope) {
      window.localStorage.removeItem(`wg_v3_prerestore_snapshot_${scope}`);
      window.localStorage.removeItem(`wg_v3_prerestore_available_${scope}`);
      return;
    }
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith('wg_v3_prerestore_snapshot_') || k.startsWith('wg_v3_prerestore_available_'))) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export async function savePreRestoreSnapshotIdbOnly(
  scope: string,
  snapshot: Record<string, unknown>,
  nowMs = Date.now()
): Promise<void> {
  const expiresAtMs = nowMs + PRE_RESTORE_SNAPSHOT_TTL_DAYS * 86_400_000;
  const wrapper: StoredPreRestoreWrapper = {
    savedAtMs: nowMs,
    expiresAtMs,
    snapshot
  };
  removeLegacyLocalPreRestoreKeys(scope);
  preRestoreAvailabilityCache.set(scope, expiresAtMs);
  await idbOnlySet(`${PRE_RESTORE_SNAPSHOT_PREFIX}${scope}`, JSON.stringify(wrapper));
}

export async function loadPreRestoreSnapshotIdbOnly(
  scope: string,
  nowMs = Date.now()
): Promise<Record<string, unknown> | null> {
  const key = `${PRE_RESTORE_SNAPSHOT_PREFIX}${scope}`;
  let raw = await idbOnlyGet(key);

  // Seamless one-time read if a legacy IDB copy still existed before migration
  if (!raw) {
    raw = await idbGet(`wg_v3_prerestore_snapshot_${scope}`).catch(() => null);
  }
  if (!raw) {
    preRestoreAvailabilityCache.delete(scope);
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredPreRestoreWrapper> & Record<string, unknown>;
    if (parsed && typeof parsed.expiresAtMs === 'number' && parsed.snapshot && typeof parsed.snapshot === 'object') {
      if (parsed.expiresAtMs <= nowMs) {
        await deletePreRestoreSnapshotIdbOnly(scope);
        return null;
      }
      preRestoreAvailabilityCache.set(scope, parsed.expiresAtMs);
      return parsed.snapshot as Record<string, unknown>;
    }
    // Legacy unwrapped snapshot: enforce TTL via capturedAt
    const capturedMs = parsed?.capturedAt ? new Date(String(parsed.capturedAt)).getTime() : 0;
    const ttlMs = PRE_RESTORE_SNAPSHOT_TTL_DAYS * 86_400_000;
    if (capturedMs > 0 && nowMs - capturedMs > ttlMs) {
      await deletePreRestoreSnapshotIdbOnly(scope);
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    await deletePreRestoreSnapshotIdbOnly(scope);
    return null;
  }
}

export async function deletePreRestoreSnapshotIdbOnly(scope: string): Promise<void> {
  preRestoreAvailabilityCache.delete(scope);
  removeLegacyLocalPreRestoreKeys(scope);
  await idbOnlyDelete(`${PRE_RESTORE_SNAPSHOT_PREFIX}${scope}`);
  await idbDelete(`wg_v3_prerestore_snapshot_${scope}`).catch(() => {});
}

export async function hasPreRestoreSnapshotIdbOnly(scope: string, nowMs = Date.now()): Promise<boolean> {
  const snap = await loadPreRestoreSnapshotIdbOnly(scope, nowMs);
  return snap !== null;
}

export function hasPreRestoreSnapshotCached(scope: string, nowMs = Date.now()): boolean {
  const exp = preRestoreAvailabilityCache.get(scope);
  if (typeof exp !== 'number') return false;
  if (exp <= nowMs) {
    preRestoreAvailabilityCache.delete(scope);
    return false;
  }
  return true;
}

export async function pruneExpiredPreRestoreSnapshotsIdbOnly(nowMs = Date.now()): Promise<number> {
  removeLegacyLocalPreRestoreKeys();
  const keys = await idbOnlyListKeys(PRE_RESTORE_SNAPSHOT_PREFIX);
  let removed = 0;
  for (const key of keys) {
    const scope = key.slice(PRE_RESTORE_SNAPSHOT_PREFIX.length);
    const snap = await loadPreRestoreSnapshotIdbOnly(scope, nowMs);
    if (!snap) removed++;
  }
  return removed;
}

export async function requestPersistentStorage(): Promise<{
  persisted: boolean;
  quotaMB: number;
  usageMB: number;
  percentUsed: number;
}> {
  let isPersisted = false;
  let quotaMB = 0;
  let usageMB = 0;
  let percentUsed = 0;

  try {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (typeof navigator.storage.persist === 'function') {
        isPersisted = await navigator.storage.persist();
      } else if (typeof navigator.storage.persisted === 'function') {
        isPersisted = await navigator.storage.persisted();
      }

      if (typeof navigator.storage.estimate === 'function') {
        const estimate = await navigator.storage.estimate();
        const quotaBytes = estimate.quota || 0;
        const usageBytes = estimate.usage || 0;

        quotaMB = Math.round((quotaBytes / (1024 * 1024)) * 10) / 10;
        usageMB = Math.round((usageBytes / (1024 * 1024)) * 100) / 100;
        percentUsed = quotaBytes > 0 ? Math.round((usageBytes / quotaBytes) * 1000) / 10 : 0;
      }
    }
  } catch (err) {
    console.warn('Storage persistence request notice:', err);
  }

  return {
    persisted: isPersisted,
    quotaMB,
    usageMB,
    percentUsed
  };
}

/**
 * Hydrates missing localStorage items from IndexedDB on startup,
 * while strictly respecting deleted key tombstones and purging stale IDB copies.
 * Keys prefixed with `wg_idb_` (IDB-only snapshots/queues/migration flags) are NEVER written to localStorage.
 */
export async function hydrateStorageFromIndexedDB(
  onHydrated?: (count: number) => void
): Promise<void> {
  try {
    removeLegacyLocalPreRestoreKeys();
    const deletedKeys = loadLocalDeletedKeySet();
    const entries = await idbGetAllEntries();
    let hydratedCount = 0;
    const staleIdbKeysToPurge: string[] = [];

    for (const [key, val] of Object.entries(entries)) {
      if (key === HYDRATION_TOMBSTONES_KEY) continue;
      if (key.startsWith(IDB_ONLY_KEY_PREFIX)) {
        if (key.startsWith(PRE_RESTORE_SNAPSHOT_PREFIX)) {
          const scope = key.slice(PRE_RESTORE_SNAPSHOT_PREFIX.length);
          void loadPreRestoreSnapshotIdbOnly(scope);
        }
        continue;
      }
      if (deletedKeys.has(key)) {
        staleIdbKeysToPurge.push(key);
        continue;
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const current = window.localStorage.getItem(key);
          if (current === null && val) {
            window.localStorage.setItem(key, val);
            hydratedCount++;
          }
        } catch {
          // localStorage might be full; IndexedDB holds it safely
        }
      }
    }

    if (staleIdbKeysToPurge.length > 0) {
      void idbDeleteMany(staleIdbKeysToPurge);
    }

    if (onHydrated && hydratedCount > 0) {
      onHydrated(hydratedCount);
    }
  } catch (err) {
    console.warn('Storage hydration notice:', err);
  }
}
