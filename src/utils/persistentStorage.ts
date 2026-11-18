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
const DB_VERSION = 1;
const STORE_NAME = 'driver_dost_store';
const HYDRATION_TOMBSTONES_KEY = 'wg_v3_deleted_keys';

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase | null> | null = null;

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
 */
export async function hydrateStorageFromIndexedDB(
  onHydrated?: (count: number) => void
): Promise<void> {
  try {
    const deletedKeys = loadLocalDeletedKeySet();
    const entries = await idbGetAllEntries();
    let hydratedCount = 0;
    const staleIdbKeysToPurge: string[] = [];

    for (const [key, val] of Object.entries(entries)) {
      if (key === HYDRATION_TOMBSTONES_KEY) continue;
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
