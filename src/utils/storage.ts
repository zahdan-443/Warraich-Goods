import {
  BiltyRecord,
  ContactItem,
  Driver,
  FuelLogItem,
  RoutePreset,
  Trip,
  UserProfile,
  UserRole,
  Vehicle,
  AppNotification,
  OfflineAction,
  CompanyProfile,
  ActivityLogItem,
  ExportPrivacyOptions,
  SyncStatusState,
  PodConfirmation
} from '../types';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, runTransaction, onSnapshot, Unsubscribe } from 'firebase/firestore';
import {
  getStorageScope,
  getScopedStorageKey,
  isBiltyNumberUnique,
  maskCNIC,
  maskPhoneNumber,
  anonymizePersonName,
  sanitizeBiltyRecord,
  sanitizeDriverRecord,
  sanitizeTripRecord
} from './calculator';
import { idbSet, idbDelete } from './persistentStorage';

// Memory storage fallback for non-browser/test environments or quota exceeded
const memoryStorage = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // fallback to memory
    }
    return memoryStorage.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    // Keep in-memory mirror
    memoryStorage.set(key, value);

    // Save to localStorage if possible
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('LocalStorage quota limit reached; saved safely in memory and IndexedDB:', e);
    }

    // Persist to IndexedDB (supports gigabytes of offline storage)
    if (typeof window !== 'undefined') {
      idbSet(key, value).catch(() => {});
    }
  },
  removeItem: (key: string): void => {
    memoryStorage.delete(key);
    // Also delete any scoped variants of this key (e.g. wg_v2_<scope>_<key>, ah-<key>, <key>__*)
    for (const k of Array.from(memoryStorage.keys())) {
      if (k === key || k.endsWith(`_${key}`) || k.startsWith(`${key}__`) || k === `ah-${key}`) {
        memoryStorage.delete(k);
      }
    }
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const lKey = localStorage.key(i);
          if (lKey && (lKey === key || lKey.endsWith(`_${key}`) || lKey.startsWith(`${key}__`) || lKey === `ah-${key}`)) {
            localStorage.removeItem(lKey);
          }
        }
      }
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      idbDelete(key).catch(() => {});
    }
  }
};

// Clean initial application defaults — zero mock personal data, phone numbers, or fake CNICs
const INITIAL_TRIPS: Trip[] = [];
const INITIAL_VEHICLES: Vehicle[] = [];
const INITIAL_DRIVERS: Driver[] = [];

const INITIAL_ROUTES: RoutePreset[] = [
  { id: 1, from: "Lahore", to: "Karachi Port", dist: 1250, toll: 4800 },
  { id: 2, from: "Faisalabad", to: "Rawalpindi", dist: 285, toll: 950 },
  { id: 3, from: "Multan", to: "Lahore", dist: 340, toll: 1100 },
  { id: 4, from: "Sialkot", to: "Islamabad Dryport", dist: 230, toll: 750 }
];

const INITIAL_FUEL: FuelLogItem[] = [
  { id: 1, date: "09 Sep 2026", diesel: 290.0, petrol: 280.0, cng: 220.0 },
  { id: 2, date: "01 Sep 2026", diesel: 288.5, petrol: 279.0, cng: 220.0 },
  { id: 3, date: "15 Aug 2026", diesel: 285.0, petrol: 275.0, cng: 215.0 }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: "🚛 Driver Dost System Ready",
    message: "Offline-first cloud database and fleet management initialized.",
    time: "Just now",
    unread: true,
    type: "system"
  }
];

// ---------------------------------------------------------------------------
// User-Scoped Storage Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the active user scope (UID, local email identifier, or 'guest')
 */
export function getActiveUserScope(): string {
  const user = auth.currentUser;
  const localEmail = safeStorage.getItem('ah-gmail-user');
  return getStorageScope(user, localEmail);
}

/**
 * Reads from user-scoped storage key with automatic backward-compatibility migration
 */
export function getScopedItem(baseKey: string): string | null {
  const scope = getActiveUserScope();
  const scopedKey = getScopedStorageKey(baseKey, scope);
  
  const scopedVal = safeStorage.getItem(scopedKey);
  // If valid non-empty data is already present in the scoped key, return it directly
  if (scopedVal !== null && scopedVal !== '[]') {
    return scopedVal;
  }

  // Fallback 1: Check owner / fallback email scope if active scope is a UID
  const localEmail = safeStorage.getItem('ah-gmail-user');
  if (localEmail) {
    const emailScope = localEmail.replace(/[^a-zA-Z0-9_]/g, '_');
    if (emailScope !== scope) {
      const emailKey = getScopedStorageKey(baseKey, emailScope);
      const emailVal = safeStorage.getItem(emailKey);
      if (emailVal !== null && emailVal !== '[]') {
        safeStorage.setItem(scopedKey, emailVal);
        return emailVal;
      }
    }
  }

  // Fallback 2: Check guest scope if current scope is authenticated
  if (scope !== 'guest') {
    const guestKey = getScopedStorageKey(baseKey, 'guest');
    const guestVal = safeStorage.getItem(guestKey);
    if (guestVal !== null && guestVal !== '[]') {
      safeStorage.setItem(scopedKey, guestVal);
      return guestVal;
    }
  }

  // Fallback 3: Check legacy key 'ah-<baseKey>'
  const legacyKey = `ah-${baseKey}`;
  const legacyVal = safeStorage.getItem(legacyKey);
  if (legacyVal !== null && legacyVal !== '[]') {
    safeStorage.setItem(scopedKey, legacyVal);
    return legacyVal;
  }

  // Fallback 4: Check legacy backup key 'ah-<baseKey>-data'
  const legacyDataKey = `ah-${baseKey}-data`;
  const legacyDataVal = safeStorage.getItem(legacyDataKey);
  if (legacyDataVal !== null && legacyDataVal !== '[]') {
    safeStorage.setItem(scopedKey, legacyDataVal);
    return legacyDataVal;
  }

  // Fallback 5: Check plain key '<baseKey>'
  const plainVal = safeStorage.getItem(baseKey);
  if (plainVal !== null && plainVal !== '[]') {
    safeStorage.setItem(scopedKey, plainVal);
    return plainVal;
  }

  return scopedVal;
}

/**
 * Writes data into user-scoped storage key
 */
export function setScopedItem(baseKey: string, value: string): void {
  const scope = getActiveUserScope();
  const scopedKey = getScopedStorageKey(baseKey, scope);
  safeStorage.setItem(scopedKey, value);
}

/**
 * Removes data from user-scoped storage key and legacy fallback keys
 */
export function removeScopedItem(baseKey: string): void {
  const scope = getActiveUserScope();
  const scopedKey = getScopedStorageKey(baseKey, scope);
  safeStorage.removeItem(scopedKey);
  safeStorage.removeItem(baseKey);
}

// ---------------------------------------------------------------------------
// Offline Queue Helpers & Real Firestore Synchronization
// ---------------------------------------------------------------------------

/**
 * Deterministic Timestamp-Based Last-Write-Wins (LWW) Conflict Resolver
 * Compares updatedAt / createdAt ISO strings; retains whichever version is genuinely newer.
 * Preserves local edits safely when equal or newer, or incorporates newer cloud changes.
 */
export function resolveEntityLWW<T extends Record<string, any>>(local: T, cloud: T): T {
  const parseTime = (val: any) => {
    if (!val) return 0;
    const t = new Date(val).getTime();
    return isNaN(t) ? 0 : t;
  };
  const localTime = Math.max(parseTime(local.updatedAt), parseTime(local.createdAt), parseTime(local.date));
  const cloudTime = Math.max(parseTime(cloud.updatedAt), parseTime(cloud.createdAt), parseTime(cloud.date));
  return localTime >= cloudTime ? local : cloud;
}

export function enqueueOfflineAction(type: OfflineAction['type'], data: any) {
  try {
    const user = auth.currentUser;
    const isOwner = user?.email?.toLowerCase().trim() === 'warraichgoods43@gmail.com';
    // Prevent poison pills: do not enqueue owner-only cloud writes for non-owner users
    if ((type === 'bilty' || type === 'bilties' || type === 'public_bilty' || type === 'settings') && !isOwner) {
      return;
    }

    const queue = getStoredOfflineQueue();
    const newAction: OfflineAction = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    // Replace redundant duplicate items:
    // Full collection syncs (bilties, trips, vehicles, drivers, fuel, routes) only need the newest snapshot
    // Public bilty actions are deduplicated by biltyNo
    const filtered = queue.filter(item => {
      if (item.type !== type) return true;
      if (type === 'bilties' || type === 'bilty') return false;
      if (['trips', 'vehicles', 'drivers', 'fuel', 'routes', 'settings'].includes(type)) return false;
      if (type === 'public_bilty' && item.data?.biltyNo && data?.biltyNo) {
        return String(item.data.biltyNo).trim().toUpperCase() !== String(data.biltyNo).trim().toUpperCase();
      }
      return JSON.stringify(item.data) !== JSON.stringify(data);
    });
    const updated = [newAction, ...filtered].slice(0, 30);
    saveStoredOfflineQueue(updated);
    notifySyncListeners();
  } catch (e) {
    console.warn("Error enqueuing offline action:", e);
  }
}

// Helper to wrap Firestore promises with a generous timeout so offline/slow connections fail gracefully to localStorage
export function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Firestore operation timed out (offline)')), timeoutMs)
    )
  ]);
}

// Real Firestore sync helper with automatic offline fallback
export async function syncToFirestore<T>(key: string, data: T): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    enqueueOfflineAction(key as any, data);
    return false;
  }
  try {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid, 'collections', key);
      await withTimeout(setDoc(userDocRef, { items: data, updatedAt: new Date().toISOString() }, { merge: true }), 8000);
      return true;
    }
    return false;
  } catch {
    enqueueOfflineAction(key as any, data);
    return false;
  }
}

/**
 * Genuine Offline Queue Processor & Retry Mechanism
 * Processes all pending local actions and pushes them to Firestore when network is available.
 */
export async function processOfflineQueue(): Promise<{ processed: number; remaining: number; errors: string[] }> {
  const queue = getStoredOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, remaining: 0, errors: [] };
  }

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { processed: 0, remaining: queue.length, errors: ['Device is offline'] };
  }

  const user = auth.currentUser;
  const remainingQueue: OfflineAction[] = [];
  let processedCount = 0;
  const errorLogs: string[] = [];

  for (const action of queue) {
    try {
      if (user && action.type) {
        if ((action.type === 'bilty' || action.type === 'bilties') && Array.isArray(action.data)) {
          const userDocRef = doc(db, 'users', user.uid, 'collections', 'bilties');
          await withTimeout(setDoc(userDocRef, { items: action.data, updatedAt: new Date().toISOString() }, { merge: true }), 8000);
          // Also process public verification copies for each bilty in publicBiltyVerifications
          for (const b of action.data) {
            if (b?.biltyNo) {
              try {
                const safeData = extractPublicBiltyVerification(b);
                const normalizedNo = String(b.biltyNo).trim().toUpperCase();
                const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
                await withTimeout(setDoc(pubRef, safeData, { merge: true }), 8000);
              } catch (pubErr) {
                console.warn('Public bilty verification update note:', pubErr);
              }
            }
          }
          processedCount++;
        } else if (action.type === 'public_bilty' && action.data?.biltyNo) {
          try {
            const safeData = extractPublicBiltyVerification(action.data);
            const normalizedNo = String(action.data.biltyNo).trim().toUpperCase();
            const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
            await withTimeout(setDoc(pubRef, safeData, { merge: true }), 8000);
          } catch (pubErr) {
            console.warn('Public bilty direct write note:', pubErr);
          }
          processedCount++;
        } else if ((action.type === 'bilty' || action.type === 'bilties') && !Array.isArray(action.data)) {
          // Single bilty item or legacy sync action
          if (action.data?.biltyNo) {
            try {
              const safeData = extractPublicBiltyVerification(action.data);
              const normalizedNo = String(action.data.biltyNo).trim().toUpperCase();
              const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
              await withTimeout(setDoc(pubRef, safeData, { merge: true }), 8000);
            } catch (pubErr) {
              console.warn('Single public bilty write note:', pubErr);
            }
          }
          processedCount++;
        } else if (['trip', 'trips', 'vehicle', 'vehicles', 'driver', 'drivers', 'fuel', 'routes'].includes(action.type)) {
          const collectionName = action.type.endsWith('s') ? action.type : `${action.type}s`;
          const actualKey = collectionName === 'fuels' ? 'fuel' : collectionName;
          const userDocRef = doc(db, 'users', user.uid, 'collections', actualKey);
          await withTimeout(setDoc(userDocRef, { items: action.data, updatedAt: new Date().toISOString() }, { merge: true }), 8000);
          processedCount++;
        } else if (action.type === 'settings') {
          // Company settings write requires authenticated owner
          if (user.email?.toLowerCase().trim() === 'warraichgoods43@gmail.com') {
            const docRef = doc(db, 'settings', 'companyProfile');
            await withTimeout(setDoc(docRef, action.data, { merge: true }), 8000);
          }
          processedCount++;
        } else if (action.type === 'pod_confirmation' && action.data?.biltyNo) {
          try {
            const normalizedNo = String(action.data.biltyNo).trim().toUpperCase();
            const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
            const safeData = extractPublicBiltyVerification(action.data);
            if (action.data.isDelivered) {
              (safeData as any).isDelivered = true;
            }
            await withTimeout(setDoc(pubRef, safeData, { merge: true }), 8000);
          } catch (pubErr) {
            console.warn('POD public confirmation write note:', pubErr);
          }
          processedCount++;
        } else {
          processedCount++;
        }
      } else {
        // User not logged in (Guest Mode): Keep actions safe in local queue without failing or error spam
        remainingQueue.push(action);
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isPermissionErr = errMsg.includes('Missing or insufficient permissions') || errMsg.includes('permission-denied');
      const retry = (action.retryCount || 0) + 1;
      
      if (!isPermissionErr) {
        errorLogs.push(`Sync paused (attempt ${retry}): Network timeout, queued for retry`);
        if (retry < 3) {
          remainingQueue.push({ ...action, retryCount: retry });
        }
      } else {
        // If an action encounters permission denial, local data is already securely saved on the device.
        // Retire it immediately to prevent infinite queue accumulation and error banners.
        console.warn(`[Sync] Safely retired permission-restricted offline action: ${action.id || action.type}`);
        processedCount++;
      }
    }
  }

  saveStoredOfflineQueue(remainingQueue);
  return { processed: processedCount, remaining: remainingQueue.length, errors: errorLogs };
}

export function clearOfflineQueue(): void {
  saveStoredOfflineQueue([]);
  safeStorage.removeItem('ah-last-sync-error');
  notifySyncListeners();
}

/**
 * Bi-directional Reconciliation & Auto-Sync Engine
 * Guarantees that any record created offline (bilties, trips, vehicles, drivers, fuel logs, khata)
 * is merged with cloud records without data loss, and pushed to Firestore automatically when online.
 */
export async function autoReconcileAllLocalToCloud(targetUid?: string): Promise<{ synced: boolean; count: number }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline || !db) return { synced: false, count: 0 };

  const user = auth.currentUser;
  const uid = targetUid || user?.uid;
  if (!uid) return { synced: false, count: 0 };

  let totalSynced = 0;

  // 1. Process offline action queue first
  await processOfflineQueue().catch(() => {});

  // 2. Migrate any guest or offline data across scopes if user was previously unauthenticated
  try {
    const syncCollections = ['bilties', 'trips', 'vehicles', 'drivers', 'fuel', 'routes'];
    const localEmail = safeStorage.getItem('ah-gmail-user');
    const emailScope = localEmail ? localEmail.replace(/[^a-zA-Z0-9_]/g, '_') : null;

    for (const key of syncCollections) {
      const userKey = getScopedStorageKey(key, uid);
      const rawUser = safeStorage.getItem(userKey);
      const userItems = rawUser ? JSON.parse(rawUser) : [];
      const mergedMap = new Map<string, any>();
      
      userItems.forEach((item: any) => {
        const id = item.biltyNo || item.id || JSON.stringify(item);
        mergedMap.set(String(id), item);
      });

      const candidateKeysToMigrate = [
        getScopedStorageKey(key, 'guest'),
        getScopedStorageKey(key, 'warraichgoods43_gmail_com'),
        emailScope && emailScope !== uid ? getScopedStorageKey(key, emailScope) : null,
        `ah-${key}`,
        `ah-${key}-data`,
        key
      ].filter((k): k is string => Boolean(k && k !== userKey));

      for (const candKey of candidateKeysToMigrate) {
        const raw = safeStorage.getItem(candKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                const id = item.biltyNo || item.id || JSON.stringify(item);
                if (mergedMap.has(String(id))) {
                  mergedMap.set(String(id), resolveEntityLWW(item, mergedMap.get(String(id))));
                } else {
                  mergedMap.set(String(id), item);
                }
              });
            }
          } catch {}
        }
      }

      const merged = Array.from(mergedMap.values());
      if (merged.length > 0) {
        safeStorage.setItem(userKey, JSON.stringify(merged));
        if (key === 'bilties') {
          safeStorage.setItem('wg_v2_warraichgoods43_gmail_com_bilties', JSON.stringify(merged));
          safeStorage.setItem('ah-bilties', JSON.stringify(merged));
          safeStorage.setItem('ah-bilties-data', JSON.stringify(merged));
        }
      }
    }

    // Also migrate guest khata keys
    const khataGuestKeys = ['dd_khata_accounts_v2', 'dd_khata_entries_v2', 'dd_khata_cashbook_v2'];
    for (const kKey of khataGuestKeys) {
      const gKey = `${kKey}_guest`;
      const gData = safeStorage.getItem(gKey);
      if (gData) {
        const uKey = `${kKey}_${uid}`;
        if (!safeStorage.getItem(uKey)) {
          safeStorage.setItem(uKey, gData);
        }
        safeStorage.removeItem(gKey);
      }
    }
  } catch {}

  // 3. Bi-directional reconcile for each collection
  const collections = ['bilties', 'trips', 'vehicles', 'drivers', 'fuel', 'routes'];
  let syncErrors = 0;
  for (const collName of collections) {
    try {
      const scopedKey = getScopedStorageKey(collName, uid);
      const rawLocal = safeStorage.getItem(scopedKey);
      const localItems: any[] = rawLocal ? JSON.parse(rawLocal) : [];

      const docRef = doc(db, 'users', uid, 'collections', collName);
      const snap = await withTimeout(getDoc(docRef), 8000).catch(() => null);

      const cloudItems: any[] = (snap && snap.exists() && Array.isArray(snap.data()?.items)) 
        ? snap.data().items 
        : [];

      // Merge local and cloud by unique key using Timestamp-Based Last-Write-Wins (LWW)
      const mergedMap = new Map<string, any>();
      // First insert cloud items
      cloudItems.forEach(item => {
        const idKey = item.biltyNo ? String(item.biltyNo).trim().toUpperCase() : String(item.id || item.regNo || JSON.stringify(item));
        mergedMap.set(idKey, item);
      });
      // Then merge local items using LWW (if item already exists, pick the newer timestamp)
      localItems.forEach(item => {
        const idKey = item.biltyNo ? String(item.biltyNo).trim().toUpperCase() : String(item.id || item.regNo || JSON.stringify(item));
        if (mergedMap.has(idKey)) {
          const cloudItem = mergedMap.get(idKey);
          mergedMap.set(idKey, resolveEntityLWW(item, cloudItem));
        } else {
          mergedMap.set(idKey, item);
        }
      });

      const mergedList = Array.from(mergedMap.values());

      // Save reconciled list to local storage
      safeStorage.setItem(scopedKey, JSON.stringify(mergedList));

      // Push reconciled list to Firestore
      if (mergedList.length > 0) {
        await withTimeout(
          setDoc(docRef, { items: mergedList, updatedAt: new Date().toISOString() }, { merge: true }),
          8000
        );
        totalSynced += mergedList.length;

        // If bilties, also ensure public verification documents are synced and sync global counter
        if (collName === 'bilties') {
          let highestBiltySeq = 1000;
          for (const b of mergedList) {
            if (b?.biltyNo) {
              await syncPublicBiltyVerification(b).catch(() => {});
              const numPart = parseInt(String(b.biltyNo).replace(/\D/g, ''), 10);
              if (!isNaN(numPart) && numPart > highestBiltySeq) {
                highestBiltySeq = numPart;
              }
            }
          }
          // Coordinate global counter with Firestore atomically
          try {
            const counterRef = doc(db, 'counters', 'biltyCounter');
            const counterSnap = await withTimeout(getDoc(counterRef), 5000).catch(() => null);
            const currentCloudVal = counterSnap && counterSnap.exists() ? (counterSnap.data()?.currentValue ?? counterSnap.data()?.value ?? 1000) : 1000;
            if (highestBiltySeq > currentCloudVal) {
              await setDoc(counterRef, { currentValue: highestBiltySeq, value: highestBiltySeq, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
            }
          } catch {}
        }
      }
    } catch (e) {
      syncErrors++;
      console.warn(`Reconciliation notice for ${collName}:`, e);
    }
  }

  // 4. Also reconcile Khata / Ledger
  try {
    const { fetchKhataFromFirestore, syncAllKhataToFirestore, processKhataDocQueue } = await import('./ledgerStorage');
    await syncAllKhataToFirestore().catch(() => {});
    await fetchKhataFromFirestore().catch(() => {});
    await processKhataDocQueue().catch(() => {});
  } catch (kErr) {
    console.warn('[KhataSync] reconciliation notice:', kErr);
  }

  safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
  if (syncErrors === 0) {
    safeStorage.removeItem('ah-last-sync-error');
    clearOfflineQueue();
  }
  notifySyncListeners();

  return { synced: syncErrors === 0, count: totalSynced };
}

export async function loadFromFirestore(uid: string) {
  return autoReconcileAllLocalToCloud(uid);
}

// ---------------------------------------------------------------------------
// Scoped Entities Getters & Setters
// ---------------------------------------------------------------------------

export function getStoredTrips(): Trip[] {
  try {
    const data = getScopedItem('trips');
    return data ? JSON.parse(data) : INITIAL_TRIPS;
  } catch {
    return INITIAL_TRIPS;
  }
}
export function saveStoredTrips(trips: Trip[]) {
  const stamped = trips.map(t => ({
    ...t,
    updatedAt: (t as any).updatedAt || new Date().toISOString()
  }));
  setScopedItem('trips', JSON.stringify(stamped));
  syncToFirestore('trips', stamped);
  scheduleAmbientSync();
}

export function getStoredVehicles(): Vehicle[] {
  try {
    const data = getScopedItem('vehicles');
    return data ? JSON.parse(data) : INITIAL_VEHICLES;
  } catch {
    return INITIAL_VEHICLES;
  }
}
export function saveStoredVehicles(vehicles: Vehicle[]) {
  const stamped = vehicles.map(v => ({
    ...v,
    updatedAt: (v as any).updatedAt || new Date().toISOString()
  }));
  setScopedItem('vehicles', JSON.stringify(stamped));
  syncToFirestore('vehicles', stamped);
  scheduleAmbientSync();
}

export function getStoredDrivers(): Driver[] {
  try {
    const data = getScopedItem('drivers');
    return data ? JSON.parse(data) : INITIAL_DRIVERS;
  } catch {
    return INITIAL_DRIVERS;
  }
}
export function saveStoredDrivers(drivers: Driver[]) {
  const stamped = drivers.map(d => ({
    ...d,
    updatedAt: (d as any).updatedAt || new Date().toISOString()
  }));
  setScopedItem('drivers', JSON.stringify(stamped));
  syncToFirestore('drivers', stamped);
  scheduleAmbientSync();
}

export function getStoredRoutes(): RoutePreset[] {
  try {
    const data = getScopedItem('routes');
    return data ? JSON.parse(data) : INITIAL_ROUTES;
  } catch {
    return INITIAL_ROUTES;
  }
}
export function saveStoredRoutes(routes: RoutePreset[]) {
  const stamped = routes.map(r => ({
    ...r,
    updatedAt: (r as any).updatedAt || new Date().toISOString()
  }));
  setScopedItem('routes', JSON.stringify(stamped));
  syncToFirestore('routes', stamped);
  scheduleAmbientSync();
}

export function getStoredFuelLog(): FuelLogItem[] {
  try {
    const data = getScopedItem('fuel');
    return data ? JSON.parse(data) : INITIAL_FUEL;
  } catch {
    return INITIAL_FUEL;
  }
}
export function saveStoredFuelLog(items: FuelLogItem[]) {
  const stamped = items.map(f => ({
    ...f,
    updatedAt: (f as any).updatedAt || new Date().toISOString()
  }));
  setScopedItem('fuel', JSON.stringify(stamped));
  syncToFirestore('fuel', stamped);
  scheduleAmbientSync();
}

export function getStoredBilties(): BiltyRecord[] {
  try {
    const activeScope = getActiveUserScope();
    const candidateKeys = [
      getScopedStorageKey('bilties', activeScope),
      'wg_v2_warraichgoods43_gmail_com_bilties',
      'wg_v2_guest_bilties',
      'ah-bilties',
      'ah-bilties-data',
      'bilties'
    ];

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (
            k &&
            (k.endsWith('_bilties') || k === 'ah-bilties' || k === 'ah-bilties-data') &&
            !candidateKeys.includes(k) &&
            !k.includes('access') &&
            !k.includes('counter') &&
            !k.includes('branch') &&
            !k.includes('lang')
          ) {
            candidateKeys.push(k);
          }
        }
      } catch {}
    }

    const candidateRecords: BiltyRecord[] = [];

    for (const key of candidateKeys) {
      const raw = safeStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item && (item.biltyNo || item.id)) {
                candidateRecords.push(item);
              }
            }
          }
        } catch {}
      }
    }

    // Also scan offline queue actions to recover any bilties that were queued
    try {
      const queueRaw = safeStorage.getItem('offline-queue') || safeStorage.getItem('ah-offline-queue') || safeStorage.getItem(getScopedStorageKey('offline-queue', activeScope));
      if (queueRaw) {
        const queueParsed = JSON.parse(queueRaw);
        if (Array.isArray(queueParsed)) {
          for (const qItem of queueParsed) {
            if ((qItem?.type === 'bilty' || qItem?.type === 'bilties') && Array.isArray(qItem.data)) {
              for (const item of qItem.data) {
                if (item && (item.biltyNo || item.id)) {
                  candidateRecords.push(item);
                }
              }
            } else if ((qItem?.type === 'public_bilty' || qItem?.type === 'bilty') && qItem?.data) {
              if (qItem.data.biltyNo || qItem.data.id) {
                candidateRecords.push(qItem.data);
              }
            }
          }
        }
      }
    } catch {}

    // Deduplicate genuinely identical records (same id OR exact same cargo/parties/vehicle details)
    const deduped: BiltyRecord[] = [];
    for (const item of candidateRecords) {
      const matchIndex = deduped.findIndex(existing => {
        if (existing.id && item.id && String(existing.id) === String(item.id)) return true;
        const sameVeh = (existing.vehicleNo || '').trim().toUpperCase() === (item.vehicleNo || '').trim().toUpperCase();
        const sameDate = (existing.date || '').trim() === (item.date || '').trim();
        const sameSender = (existing.senderName || '').trim().toLowerCase() === (item.senderName || '').trim().toLowerCase();
        const sameReceiver = (existing.receiverName || '').trim().toLowerCase() === (item.receiverName || '').trim().toLowerCase();
        const sameTotal = Number(existing.total || 0) === Number(item.total || 0);
        const hasVeh = !!(existing.vehicleNo || '').trim();
        return sameVeh && sameDate && sameSender && sameReceiver && sameTotal && hasVeh;
      });

      if (matchIndex >= 0) {
        deduped[matchIndex] = resolveEntityLWW(item, deduped[matchIndex]);
      } else {
        deduped.push({ ...item });
      }
    }

    // Sort chronologically oldest first for stable sequential numbering
    deduped.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

    // Resolve duplicate biltyNo (fixes previous issue where multiple distinct creations got stuck on WG-1001)
    const usedNumbers = new Set<string>();
    let highestSequence = 1000;
    const finalRecords: BiltyRecord[] = [];

    for (const rec of deduped) {
      let bNo = rec.biltyNo ? String(rec.biltyNo).trim().toUpperCase() : '';
      if (!bNo || usedNumbers.has(bNo)) {
        // Colliding biltyNo on distinct record! Assign next unique sequential number
        highestSequence = Math.max(highestSequence, 1000) + 1;
        bNo = `WG-${String(highestSequence).padStart(4, '0')}`;
      } else {
        const rawDigits = bNo.replace(/\D/g, '');
        const numPart = parseInt(rawDigits.length > 4 ? rawDigits.slice(-4) : rawDigits, 10);
        if (!isNaN(numPart) && numPart >= 1000 && numPart <= 9999) {
          highestSequence = Math.max(highestSequence, numPart);
        }
      }
      usedNumbers.add(bNo);
      finalRecords.push({ ...rec, biltyNo: bNo });
    }

    // Mirror highest sequence to all counter storage keys
    if (highestSequence > 1000) {
      persistBiltyCounterLocally(highestSequence);
    }

    // Sort newest first for presentation
    finalRecords.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));

    // Ensure active scoped key and primary backup keys are synchronized
    if (finalRecords.length > 0) {
      const activeScopedKey = getScopedStorageKey('bilties', activeScope);
      const serialized = JSON.stringify(finalRecords);
      safeStorage.setItem(activeScopedKey, serialized);
      safeStorage.setItem('wg_v2_warraichgoods43_gmail_com_bilties', serialized);
      safeStorage.setItem('ah-bilties', serialized);
      safeStorage.setItem('ah-bilties-data', serialized);
    }

    return finalRecords;
  } catch {
    return [];
  }
}

export function saveStoredBilties(bilties: BiltyRecord[]) {
  const stamped = bilties.map(b => ({
    ...b,
    updatedAt: b.updatedAt || new Date().toISOString()
  }));

  // Save to active scope
  setScopedItem('bilties', JSON.stringify(stamped));

  // Guarantee persistent storage under owner and legacy backup keys so it can never be lost on auth switch
  safeStorage.setItem('wg_v2_warraichgoods43_gmail_com_bilties', JSON.stringify(stamped));
  safeStorage.setItem('ah-bilties', JSON.stringify(stamped));
  safeStorage.setItem('ah-bilties-data', JSON.stringify(stamped));

  syncToFirestore('bilties', stamped);
  scheduleAmbientSync();

  // Also sync public verification copies for all bilties
  stamped.forEach((b) => {
    syncPublicBiltyVerification(b).catch(() => {});
  });

  // Notify active components immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('driverdost:bilties_updated', { detail: stamped }));
  }
}

/**
 * Public Verification Safe Document
 * Includes: biltyNo, date, senderName, receiverName, sendingCity, receivingCity, vehicleNo, driverName, itemDescription, weight, qty, paymentStatus, branch.
 * Strictly EXCLUDES: CNICs, phone numbers, freight total, advance, payable, delivery tracking status.
 */
export interface PublicBiltyVerification {
  biltyNo: string;
  date: string;
  sendingCity: string;
  receivingCity: string;
  senderName?: string;
  receiverName?: string;
  senderAddress?: string;
  receiverAddress?: string;
  vehicleNo?: string;
  driverName?: string;
  itemDescription: string;
  weight?: string;
  qty?: string;
  paymentStatus?: 'paid' | 'topay';
  branch?: 'samundri' | 'kamalia';
  verifiedPublicly: true;
  ownerUid?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Extracts only safe, non-PII, non-financial fields from a Bilty record for public verification
 */
export function extractPublicBiltyVerification(bilty: Partial<BiltyRecord>): PublicBiltyVerification {
  const normalizedNo = bilty.biltyNo ? String(bilty.biltyNo).trim().toUpperCase() : '';

  let paymentStatus: 'paid' | 'topay' | undefined = undefined;
  if (bilty.payable !== undefined || bilty.total !== undefined) {
    const payNum = Number(bilty.payable) || 0;
    const totNum = Number(bilty.total) || 0;
    if (payNum <= 0 && totNum > 0) {
      paymentStatus = 'paid';
    } else if (payNum > 0) {
      paymentStatus = 'topay';
    }
  }

  const result: PublicBiltyVerification = {
    biltyNo: normalizedNo,
    date: bilty.date || '',
    sendingCity: bilty.sendingCity || '',
    receivingCity: bilty.receivingCity || '',
    itemDescription: bilty.itemDescription || '',
    verifiedPublicly: true,
    createdAt: new Date().toISOString()
  };

  if (auth.currentUser?.uid) {
    result.ownerUid = auth.currentUser.uid;
  } else if ((bilty as any)?.ownerUid) {
    result.ownerUid = (bilty as any).ownerUid;
  }

  const sName = (bilty.senderName || bilty.consignor || '').trim();
  if (sName) result.senderName = sName;

  const rName = (bilty.receiverName || bilty.consignee || '').trim();
  if (rName) result.receiverName = rName;

  if (bilty.vehicleNo && bilty.vehicleNo.trim()) {
    result.vehicleNo = bilty.vehicleNo.trim();
  }
  if (bilty.driverName && bilty.driverName.trim()) {
    result.driverName = bilty.driverName.trim();
  }
  if (bilty.weight && String(bilty.weight).trim()) {
    result.weight = String(bilty.weight).trim();
  }
  if (bilty.qty && String(bilty.qty).trim()) {
    result.qty = String(bilty.qty).trim();
  }
  if (bilty.branch === 'samundri' || bilty.branch === 'kamalia') {
    result.branch = bilty.branch;
  }
  if (paymentStatus) {
    result.paymentStatus = paymentStatus;
  }

  return result;
}

/**
 * Confirms Digital Proof of Delivery (POD) for a Bilty.
 * Writes podConfirmation to Firestore (both public verification and private copy)
 * and updates local device cache. If offline, safely enqueues the action.
 */
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

  // 1. Update local storage if present on this device
  try {
    const stored = getStoredBilties();
    const cleanBiltyNo = String(bilty.biltyNo || '').trim().toUpperCase();
    const updated = stored.map(b => {
      if (String(b.biltyNo).trim().toUpperCase() === cleanBiltyNo || String(b.id) === String(bilty.id)) {
        return {
          ...b,
          podConfirmation,
          isDelivered: true,
          receivedBy: trimmedName
        };
      }
      return b;
    });
    if (stored.some(b => String(b.biltyNo).trim().toUpperCase() === cleanBiltyNo || String(b.id) === String(bilty.id))) {
      setScopedItem('bilties', JSON.stringify(updated));
      syncToFirestore('bilties', updated).catch(() => {});
    }
  } catch (err) {
    console.warn('Local bilty POD update notice:', err);
  }

  // 2. Prepare payload for public & cloud sync
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const publicPayload = {
    biltyNo: bilty.biltyNo,
    isDelivered: true,
    verifiedPublicly: true,
    updatedAt: confirmedAt
  };

  if (!isOnline || !db) {
    enqueueOfflineAction('pod_confirmation', publicPayload);
    return { success: true, offlineQueued: true, podConfirmation };
  }

  try {
    const normalizedNo = String(bilty.biltyNo).trim().toUpperCase();
    const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
    await withTimeout(setDoc(pubRef, publicPayload, { merge: true }), 4000);

    const cleanAlpha = normalizedNo.replace(/[^A-Z0-9]/g, '');
    if (cleanAlpha && cleanAlpha !== normalizedNo) {
      const pubRef2 = doc(db, 'publicBiltyVerifications', cleanAlpha);
      await withTimeout(setDoc(pubRef2, publicPayload, { merge: true }), 4000).catch(() => {});
    }

    // If current signed-in user has this in their private collection, update that too
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid, 'collections', 'bilties');
      const snap = await withTimeout(getDoc(userDocRef), 3000).catch(() => null);
      if (snap && snap.exists()) {
        const d = snap.data();
        if (Array.isArray(d?.items)) {
          const items = d.items.map((item: BiltyRecord) => {
            if (String(item.biltyNo).trim().toUpperCase() === normalizedNo || String(item.id) === String(bilty.id)) {
              return {
                ...item,
                podConfirmation,
                isDelivered: true,
                receivedBy: trimmedName
              };
            }
            return item;
          });
          await setDoc(userDocRef, { items, updatedAt: confirmedAt }, { merge: true }).catch(() => {});
        }
      }
    }

    return { success: true, offlineQueued: false, podConfirmation };
  } catch (err) {
    console.warn('POD direct write timed out or failed, enqueuing offline action:', err);
    enqueueOfflineAction('pod_confirmation', publicPayload);
    return { success: true, offlineQueued: true, podConfirmation };
  }
}

/**
 * Writes a public verification copy to Firestore at top-level publicBiltyVerifications/{biltyNo}
 * Online: writes directly with timeout. Offline: enqueues action for retry.
 */
export async function syncPublicBiltyVerification(bilty: BiltyRecord): Promise<boolean> {
  if (!bilty.biltyNo) return false;
  const user = auth.currentUser;
  // Public verification records in Firestore require an authenticated user
  if (!user) return false;

  const safeData = extractPublicBiltyVerification(bilty);
  const normalizedNo = bilty.biltyNo.trim().toUpperCase();

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline || !db) {
    enqueueOfflineAction('public_bilty', safeData);
    return false;
  }

  try {
    const docRef = doc(db, 'publicBiltyVerifications', normalizedNo);
    await withTimeout(setDoc(docRef, safeData, { merge: true }), 8000);
    const cleanId = normalizedNo.replace(/[^A-Z0-9]/g, '');
    if (cleanId && cleanId !== normalizedNo) {
      const docRef2 = doc(db, 'publicBiltyVerifications', cleanId);
      await withTimeout(setDoc(docRef2, safeData, { merge: true }), 8000).catch(() => {});
    }
    return true;
  } catch {
    enqueueOfflineAction('public_bilty', safeData);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Transaction-Based Bilty Number Generator
// ---------------------------------------------------------------------------

/**
 * Persists the latest Bilty counter across all candidate scopes, global keys, and legacy fallbacks.
 */
export function persistBiltyCounterLocally(seq: number): void {
  const str = String(seq);
  safeStorage.setItem('wg_bilty_counter', str);
  safeStorage.setItem('ah-bilty-counter', str);
  safeStorage.setItem('bilty-counter', str);
  safeStorage.setItem('wg_v2_warraichgoods43_gmail_com_bilty-counter', str);
  setScopedItem('bilty-counter', str);
}

/**
 * Scans all persistent storage keys, active bilties, and offline queues to find the
 * absolute highest allocated sequence number (guaranteeing monotonic increment from WG-1001).
 */
export function getStoredHighestBiltySeq(): number {
  let highest = 1000;

  // 1. Scan candidate counter storage keys
  const activeScope = getActiveUserScope();
  const counterKeys = [
    'wg_bilty_counter',
    'ah-bilty-counter',
    'bilty-counter',
    getScopedStorageKey('bilty-counter', activeScope),
    'wg_v2_warraichgoods43_gmail_com_bilty-counter',
    'wg_v2_guest_bilty-counter'
  ];
  for (const k of counterKeys) {
    const val = safeStorage.getItem(k);
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 1000 && parsed <= 9999 && parsed > highest) {
        highest = parsed;
      }
    }
  }

  // 2. Scan all stored bilties directly
  const rawCandidateKeys = [
    getScopedStorageKey('bilties', activeScope),
    'wg_v2_warraichgoods43_gmail_com_bilties',
    'wg_v2_guest_bilties',
    'ah-bilties',
    'ah-bilties-data',
    'bilties'
  ];
  for (const k of rawCandidateKeys) {
    const raw = safeStorage.getItem(k);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item?.biltyNo) {
              const rawDigits = String(item.biltyNo).replace(/\D/g, '');
              const numPart = parseInt(rawDigits.length > 4 ? rawDigits.slice(-4) : rawDigits, 10);
              if (!isNaN(numPart) && numPart >= 1000 && numPart <= 9999 && numPart > highest) {
                highest = numPart;
              }
            }
          }
        }
      } catch {}
    }
  }

  return highest;
}

/**
 * Transactionally increments and allocates the next sequential Bilty Number.
 * When online, runs an atomic Firestore transaction on the global counter document.
 * Monotonically sequence begins strictly at WG-1001 and increments sequentially.
 * When offline or on timeout, increments local counter from max existing / base 1000.
 */
export async function allocateNextBiltyNumber(userUid?: string): Promise<string> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const user = auth.currentUser;
  const baseline = getStoredHighestBiltySeq();

  if (isOnline && db && user) {
    try {
      const counterDocRef = doc(db, 'counters', 'biltyCounter');
      const nextSeq = await withTimeout(
        runTransaction(db, async (transaction) => {
          const snap = await transaction.get(counterDocRef);
          let cloudCurrent = 1000;
          if (snap.exists()) {
            const d = snap.data();
            const rawVal = d?.currentValue ?? d?.value;
            const parsed = typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal || ''), 10);
            if (!isNaN(parsed) && parsed >= 1000 && parsed <= 9999) {
              cloudCurrent = parsed;
            }
          }
          // Strictly greater than both cloudCurrent and local baseline
          let next = Math.max(cloudCurrent, baseline) + 1;
          if (next > 9999) {
            next = 1001; // Wrap around safely to keep strictly 4 digits
          }
          transaction.set(counterDocRef, {
            currentValue: next,
            value: next,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          return next;
        }),
        8000
      );

      // Keep local counter updated to the highest sequence across all scopes
      persistBiltyCounterLocally(nextSeq);
      return `WG-${String(nextSeq).padStart(4, '0')}`;
    } catch (err) {
      console.warn('Firestore counter transaction error, falling back to local monotonic sequence:', err);
    }
  }

  // Offline / Local Monotonic Fallback starting strictly after baseline
  let nextLocalSeq = baseline + 1;
  if (nextLocalSeq > 9999) {
    nextLocalSeq = 1001; // Strictly maintain 4-digit ceiling
  }
  persistBiltyCounterLocally(nextLocalSeq);

  return `WG-${String(nextLocalSeq).padStart(4, '0')}`;
}

export function getNextBiltyNo(): string {
  const baseline = getStoredHighestBiltySeq();
  let nextNo = baseline + 1;
  if (nextNo > 9999) nextNo = 1001;
  persistBiltyCounterLocally(nextNo);
  return `WG-${String(nextNo).padStart(4, '0')}`;
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const activeScope = getActiveUserScope();
    const candidateKeys = [
      getScopedStorageKey('offline-queue', activeScope),
      'wg_v2_warraichgoods43_gmail_com_offline-queue',
      'wg_v2_guest_offline-queue',
      'ah-offline-queue',
      'offline-queue'
    ];
    for (const k of candidateKeys) {
      const data = safeStorage.getItem(k);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  const activeScope = getActiveUserScope();
  const serialized = JSON.stringify(queue);
  setScopedItem('offline-queue', serialized);
  safeStorage.setItem('ah-offline-queue', serialized);
  safeStorage.setItem('wg_v2_warraichgoods43_gmail_com_offline-queue', serialized);
  if (queue.length === 0) {
    safeStorage.removeItem('offline-queue');
    safeStorage.removeItem('ah-offline-queue');
    safeStorage.removeItem('wg_v2_warraichgoods43_gmail_com_offline-queue');
    safeStorage.removeItem(getScopedStorageKey('offline-queue', activeScope));
    safeStorage.removeItem(getScopedStorageKey('offline-queue', 'guest'));
  }
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}
export function saveStoredNotifications(notifs: AppNotification[]) {
  setScopedItem('notifs', JSON.stringify(notifs));
}

// ---------------------------------------------------------------------------
// User Profile & Bilty Access Management
// ---------------------------------------------------------------------------

export function getLocalRegisteredUsers(): UserProfile[] {
  try {
    const raw = safeStorage.getItem('ah-registered-users-list');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRegisteredUsers(users: UserProfile[]) {
  try {
    safeStorage.setItem('ah-registered-users-list', JSON.stringify(users));
  } catch {
    // ignore
  }
}

export async function saveUserProfileInFirestore(profile: UserProfile) {
  // Always update local persistent registry
  try {
    const existing = getLocalRegisteredUsers();
    const cleanEmail = (profile.email || '').toLowerCase().trim();
    const filtered = existing.filter(u => 
      (u.email && cleanEmail && u.email.toLowerCase().trim() !== cleanEmail) &&
      (u.uid !== profile.uid)
    );
    const updated: UserProfile = {
      ...profile,
      email: cleanEmail || profile.email,
      lastLogin: profile.lastLogin || new Date().toISOString()
    };
    filtered.unshift(updated);
    saveLocalRegisteredUsers(filtered);
  } catch (err) {
    console.warn("Error caching user locally:", err);
  }

  // Also update Firestore
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const userKey = profile.uid || (profile.email ? profile.email.replace(/[.@]/g, '_') : `user_${Date.now()}`);
      const userRef = doc(db, 'users', userKey);
      await withTimeout(setDoc(userRef, {
        ...profile,
        lastLogin: new Date().toISOString()
      }, { merge: true }), 2500);
    } catch {
      // Graceful offline fallback
    }
  }
}

export const DEFAULT_AUTHORIZED_EMAILS = [
  'warraichgoods43@gmail.com'
];

export async function getAllRegisteredUsers(): Promise<UserProfile[]> {
  const localUsers = getLocalRegisteredUsers();
  const userMap = new Map<string, UserProfile>();

  // Add default owner account
  userMap.set('warraichgoods43@gmail.com', {
    uid: 'owner_uid_warraich',
    name: 'زاہدان نصر وڑائچ (آنر)',
    email: 'warraichgoods43@gmail.com',
    role: 'owner',
    lastLogin: new Date().toISOString()
  });

  // Populate from local storage
  localUsers.forEach(u => {
    const key = (u.email || u.uid || '').toLowerCase().trim();
    if (key) {
      userMap.set(key, u);
    }
  });

  // Populate from Firestore: Strictly confidential - only Fleet Owner warraichgoods43@gmail.com
  if (isCurrentOwner() && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const usersRef = collection(db, 'users');
      const snap = await Promise.race([
        getDocs(usersRef),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
      ]);
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data && (data.uid || data.email)) {
          const email = (data.email || '').toLowerCase().trim();
          const key = email || data.uid;
          if (key) {
            userMap.set(key, {
              uid: data.uid || key,
              name: data.name || email || 'User',
              email: email,
              role: data.role || 'driver',
              lastLogin: data.lastLogin
            });
          }
        }
      });
    } catch {
      // Offline fallback
    }
  }

  // Also check allowed emails from bilty access to make sure they are visible
  const cachedEmailsStr = getScopedItem('bilty-allowed-emails');
  if (cachedEmailsStr) {
    try {
      const emails: string[] = JSON.parse(cachedEmailsStr);
      emails.forEach(e => {
        const clean = e.toLowerCase().trim();
        if (clean && !userMap.has(clean)) {
          userMap.set(clean, {
            uid: `email_${clean.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: clean.split('@')[0],
            email: clean,
            role: 'driver'
          });
        }
      });
    } catch {
      // ignore
    }
  }

  const list = Array.from(userMap.values());
  saveLocalRegisteredUsers(list);
  return list;
}

export interface BiltyAccessConfigData {
  allowedUIDs: string[];
  allowedEmails: string[];
}

// Helper to verify if the currently authenticated Firebase user is the App Owner
const isCurrentOwner = (): boolean => {
  try {
    const email = auth.currentUser?.email?.toLowerCase().trim();
    return email === 'warraichgoods43@gmail.com';
  } catch {
    return false;
  }
};

export function normalizeBiltyConfig(data: any): BiltyAccessConfigData {
  const allowedUIDs: string[] = Array.isArray(data?.allowedUIDs) 
    ? data.allowedUIDs.filter((id: unknown): id is string => typeof id === 'string' && id.trim().length > 0)
    : [];
  const rawEmails = Array.isArray(data?.allowedEmails) ? data.allowedEmails.filter(Boolean) : [];
  const mergedEmails = [...DEFAULT_AUTHORIZED_EMAILS, ...rawEmails];
  const allowedEmails: string[] = Array.from(new Set(mergedEmails.map((e: unknown) => String(e).toLowerCase().trim())));
  return { allowedUIDs, allowedEmails };
}

export async function getBiltyAccessConfig(): Promise<BiltyAccessConfigData> {
  // Confidential: Remote Firestore access/biltyAccess is strictly restricted to warraichgoods43@gmail.com
  if (isCurrentOwner() && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const accessRef = doc(db, 'access', 'biltyAccess');
      const snap = await withTimeout(getDoc(accessRef), 3000);
      if (snap.exists()) {
        const config = normalizeBiltyConfig(snap.data());
        setScopedItem('bilty-allowed-uids', JSON.stringify(config.allowedUIDs));
        setScopedItem('bilty-allowed-emails', JSON.stringify(config.allowedEmails));
        safeStorage.setItem('wg_global_bilty_allowed_uids', JSON.stringify(config.allowedUIDs));
        safeStorage.setItem('wg_global_bilty_allowed_emails', JSON.stringify(config.allowedEmails));
        safeStorage.setItem('ah-bilty-allowed-emails', JSON.stringify(config.allowedEmails));
        safeStorage.setItem('ah-bilty-allowed-uids', JSON.stringify(config.allowedUIDs));
        return config;
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (err?.code !== 'permission-denied' && !msg.includes('insufficient permissions')) {
        console.warn("Could not fetch remote bilty access config, using local cache:", err);
      }
    }
  }
  try {
    const cachedUIDs = safeStorage.getItem('wg_global_bilty_allowed_uids') || safeStorage.getItem('ah-bilty-allowed-uids') || getScopedItem('bilty-allowed-uids');
    const cachedEmails = safeStorage.getItem('wg_global_bilty_allowed_emails') || safeStorage.getItem('ah-bilty-allowed-emails') || getScopedItem('bilty-allowed-emails');
    const parsedUIDs = cachedUIDs ? JSON.parse(cachedUIDs) : [];
    const parsedEmails = cachedEmails ? JSON.parse(cachedEmails) : [];
    const mergedEmails = Array.from(new Set([...DEFAULT_AUTHORIZED_EMAILS, ...parsedEmails].map((e: string) => String(e).toLowerCase().trim())));
    return {
      allowedUIDs: parsedUIDs,
      allowedEmails: mergedEmails
    };
  } catch {
    return { allowedUIDs: [], allowedEmails: [...DEFAULT_AUTHORIZED_EMAILS] };
  }
}

/**
 * Real-time listener for Bilty access changes in Firestore
 * Strictly active ONLY for the App Owner (warraichgoods43@gmail.com)
 */
export function subscribeToBiltyAccess(
  onUpdate: (config: BiltyAccessConfigData) => void
): Unsubscribe {
  // Non-owners must never subscribe to confidential bilty access rules
  if (!isCurrentOwner()) {
    return () => {};
  }
  try {
    const accessRef = doc(db, 'access', 'biltyAccess');
    return onSnapshot(
      accessRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const config = normalizeBiltyConfig(docSnap.data());
          setScopedItem('bilty-allowed-uids', JSON.stringify(config.allowedUIDs));
          setScopedItem('bilty-allowed-emails', JSON.stringify(config.allowedEmails));
          safeStorage.setItem('wg_global_bilty_allowed_uids', JSON.stringify(config.allowedUIDs));
          safeStorage.setItem('wg_global_bilty_allowed_emails', JSON.stringify(config.allowedEmails));
          safeStorage.setItem('ah-bilty-allowed-emails', JSON.stringify(config.allowedEmails));
          safeStorage.setItem('ah-bilty-allowed-uids', JSON.stringify(config.allowedUIDs));
          onUpdate(config);
        }
      },
      (err) => {
        const msg = err?.message || '';
        // Suppress permission-denied warnings gracefully
        if (err?.code !== 'permission-denied' && !msg.includes('insufficient permissions')) {
          console.warn('Bilty access real-time subscription error:', err);
        }
      }
    );
  } catch (err) {
    return () => {};
  }
}

export async function updateBiltyAccessInFirestore(allowedUIDs: string[], allowedEmails: string[] = []) {
  if (!isCurrentOwner()) {
    console.warn("Unauthorized attempt to update bilty access configuration.");
    return;
  }
  const cleanUIDs = Array.from(new Set(allowedUIDs.filter(Boolean)));
  const cleanEmails = Array.from(new Set(allowedEmails.filter(Boolean).map(e => e.toLowerCase().trim())));
  
  try {
    setScopedItem('bilty-allowed-uids', JSON.stringify(cleanUIDs));
    setScopedItem('bilty-allowed-emails', JSON.stringify(cleanEmails));
    safeStorage.setItem('wg_global_bilty_allowed_uids', JSON.stringify(cleanUIDs));
    safeStorage.setItem('wg_global_bilty_allowed_emails', JSON.stringify(cleanEmails));
    safeStorage.setItem('ah-bilty-allowed-emails', JSON.stringify(cleanEmails));
    safeStorage.setItem('ah-bilty-allowed-uids', JSON.stringify(cleanUIDs));
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const accessRef = doc(db, 'access', 'biltyAccess');
      await withTimeout(setDoc(accessRef, { 
        allowedUIDs: cleanUIDs, 
        allowedEmails: cleanEmails, 
        updatedAt: new Date().toISOString() 
      }, { merge: true }), 3000);
    }
  } catch (err) {
    console.warn("Failed saving bilty access to firestore:", err);
  }
}

// ---------------------------------------------------------------------------
// Error Telemetry & Sync Status Management
// ---------------------------------------------------------------------------

export function logError(action: string, error: any, context?: any) {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorItem = {
    id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    action,
    error: errorMsg,
    context: context ? JSON.stringify(context) : undefined
  };

  try {
    const existingStr = safeStorage.getItem('ah-error-logs');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    const updated = [errorItem, ...existing].slice(0, 50);
    safeStorage.setItem('ah-error-logs', JSON.stringify(updated));
  } catch {
    // Ignore local storage error
  }

  logActivity(`Error: ${action}`, errorMsg, 'error');
}

export function getErrorLogs(): Array<{ id: string; timestamp: string; action: string; error: string; context?: string }> {
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
// Zero-Button Ambient Synchronization Engine
// ---------------------------------------------------------------------------

type SyncListener = () => void;
const syncListeners = new Set<SyncListener>();

export function subscribeToSyncEvents(listener: SyncListener): () => void {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

export function notifySyncListeners() {
  syncListeners.forEach(fn => {
    try { fn(); } catch {}
  });
}

let ambientSyncTimer: any = null;
let isReconcilingAmbient = false;

/**
 * Debounced Ambient Sync Dispatcher
 * Automatically triggered on every entity mutation (trips, vehicles, drivers, fuel, etc.)
 * or upon network reconnection. Ensures zero need for a manual "Sync Now" button.
 */
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

    isReconcilingAmbient = true;
    notifySyncListeners();

    try {
      const user = auth.currentUser;
      if (user) {
        await processOfflineQueue();
        await autoReconcileAllLocalToCloud(user.uid);
      } else {
        // Guest mode: ensure queue is clean and local records are uncorrupted
        clearOfflineQueue();
        clearErrorLogs();
      }
      safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
      safeStorage.removeItem('ah-last-sync-error');
    } catch (e) {
      console.warn('[AmbientSync] silent pass note:', e);
    } finally {
      isReconcilingAmbient = false;
      notifySyncListeners();
    }
  }, delayMs);
}

let ambientEngineInitialized = false;

/**
 * Initializes automatic ambient synchronization listeners for network and document lifecycle.
 * Listens to 'online', 'offline', 'visibilitychange', and 'focus'.
 */
export function initAmbientSyncEngine(): () => void {
  if (ambientEngineInitialized || typeof window === 'undefined') return () => {};
  ambientEngineInitialized = true;

  const handleOnline = () => {
    scheduleAmbientSync(100);
  };

  const handleOffline = () => {
    notifySyncListeners();
  };

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      scheduleAmbientSync(200);
    }
  };

  const handleFocus = () => {
    scheduleAmbientSync(200);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('focus', handleFocus);

  // Periodic heartbeat sweep (every 4 minutes) when online and active
  const sweepInterval = setInterval(() => {
    if (typeof navigator !== 'undefined' && navigator.onLine && document.visibilityState === 'visible') {
      scheduleAmbientSync(100);
    }
  }, 4 * 60 * 1000);

  // Initial immediate background check
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
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (isReconcilingAmbient) {
    status = 'syncing';
  } else if (lastError) {
    status = 'error';
  }

  return {
    status,
    pendingCount: queue.length,
    lastSyncTime,
    lastError,
    errorsList: errorLogs.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      message: `${e.action}: ${e.error}`
    }))
  };
}

export async function triggerManualSync(): Promise<{ success: boolean; processed: number; remaining: number; errors: string[] }> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    return { success: false, processed: 0, remaining: getStoredOfflineQueue().length, errors: ['Device is currently offline'] };
  }

  const user = auth.currentUser;
  if (!user) {
    // Guest Mode: All local data is 100% safe in device storage.
    clearOfflineQueue();
    clearErrorLogs();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    safeStorage.removeItem('ah-last-sync-error');
    notifySyncListeners();
    return {
      success: true,
      processed: 0,
      remaining: 0,
      errors: []
    };
  }

  try {
    const result = await processOfflineQueue();
    const reconcileRes = await autoReconcileAllLocalToCloud(user.uid).catch(() => ({ synced: false, count: 0 }));
    const totalProcessed = result.processed + reconcileRes.count;

    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0 && result.remaining > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    notifySyncListeners();
    await logActivity('Ambient Sync Refreshed', `Processed ${totalProcessed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.remaining === 0 || result.errors.length === 0,
      processed: totalProcessed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Sync Engine Notice', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
    notifySyncListeners();
    return {
      success: false,
      processed: 0,
      remaining: getStoredOfflineQueue().length,
      errors: [errorMsg]
    };
  }
}

// ---------------------------------------------------------------------------
// Customer & Driver Contacts + CSV Exporter (with Privacy Controls)
// ---------------------------------------------------------------------------

export function getContactList(privacyOptions?: ExportPrivacyOptions): ContactItem[] {
  const bilties = getStoredBilties();
  const drivers = getStoredDrivers();
  const map = new Map<string, ContactItem>();

  drivers.forEach(d => {
    if (d.name) {
      const sanitized = sanitizeDriverRecord(d, privacyOptions);
      const key = d.name.toLowerCase().trim();
      map.set(key, {
        name: sanitized.name,
        phone: sanitized.phone || '',
        type: 'Driver',
        lastUsed: 'Active'
      });
    }
  });

  bilties.forEach(b => {
    const sanitized = sanitizeBiltyRecord(b, privacyOptions);
    const items = [
      { name: sanitized.senderName, phone: sanitized.senderMobile, type: 'Customer' as const, date: sanitized.date },
      { name: sanitized.receiverName, phone: sanitized.receiverMobile, type: 'Customer' as const, date: sanitized.date },
      { name: sanitized.consignor, phone: sanitized.senderMobile, type: 'Customer' as const, date: sanitized.date },
      { name: sanitized.consignee, phone: sanitized.receiverMobile, type: 'Customer' as const, date: sanitized.date },
      { name: sanitized.driverName, phone: sanitized.mobileNo, type: 'Driver' as const, date: sanitized.date }
    ];

    items.forEach(item => {
      if (item.name && item.name.trim().length > 1) {
        const key = item.name.toLowerCase().trim();
        const existing = map.get(key);
        if (!existing) {
          map.set(key, {
            name: item.name.trim(),
            phone: item.phone || '',
            type: item.type,
            lastUsed: item.date || 'Recent'
          });
        } else if (item.phone && !existing.phone) {
          existing.phone = item.phone;
        }
      }
    });
  });

  return Array.from(map.values());
}

export function exportContactsCSV(privacyOptions?: ExportPrivacyOptions) {
  const contacts = getContactList(privacyOptions);
  if (contacts.length === 0) {
    console.warn("No contact records available to export.");
    return false;
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
  csvContent += "Name,Phone Number,Type,Last Used Date\n";

  contacts.forEach(c => {
    const nameSanitized = `"${c.name.replace(/"/g, '""')}"`;
    const phoneSanitized = `"${c.phone.replace(/"/g, '""')}"`;
    const typeSanitized = `"${c.type}"`;
    const dateSanitized = `"${c.lastUsed}"`;
    csvContent += `${nameSanitized},${phoneSanitized},${typeSanitized},${dateSanitized}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Driver_Dost_Contacts_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ---------------------------------------------------------------------------
// Company Profile & Settings Management
// ---------------------------------------------------------------------------

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  nameUr: "وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)",
  nameEn: "Warraich Goods Transport Co.",
  ownerName: "زاہدان نصر وڑائچ",
  phoneNumbers: "0300-5370443, 0339-5370443",
  headOfficeUr: "سمندری، فیصل آباد، پنجاب، پاکستان",
  headOfficeEn: "Samundri, Faisalabad, Punjab, Pakistan",
  ntn: "7779394-1",
  taglineUr: "ملک بھر میں ہر قسم کے سامان کی محفوظ اور قابل اعتماد ٹرانسپورٹ سروس"
};

export async function getStoredCompanyProfile(): Promise<CompanyProfile> {
  let profile = DEFAULT_COMPANY_PROFILE;
  try {
    const cached = localStorage.getItem('ah-company-profile');
    if (cached) {
      profile = { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(cached) };
    }
  } catch {
    profile = DEFAULT_COMPANY_PROFILE;
  }

  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const docRef = doc(db, 'settings', 'companyProfile');
      const snap = await withTimeout(getDoc(docRef), 2000);
      if (snap.exists()) {
        profile = { ...DEFAULT_COMPANY_PROFILE, ...snap.data() };
        localStorage.setItem('ah-company-profile', JSON.stringify(profile));
      }
    } catch {
      // Return cached/default on network fail
    }
  }
  return profile;
}

export function getCachedCompanyProfile(): CompanyProfile {
  try {
    const cached = safeStorage.getItem('ah-company-profile');
    return cached ? { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(cached) } : DEFAULT_COMPANY_PROFILE;
  } catch {
    return DEFAULT_COMPANY_PROFILE;
  }
}

export async function saveCompanyProfileInFirestore(profile: CompanyProfile) {
  const updatedProfile: CompanyProfile = {
    ...profile,
    updatedAt: new Date().toISOString()
  };
  safeStorage.setItem('ah-company-profile', JSON.stringify(updatedProfile));
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const docRef = doc(db, 'settings', 'companyProfile');
      await withTimeout(setDoc(docRef, updatedProfile, { merge: true }), 3000);
    } catch (err) {
      console.warn("Failed saving company profile to Firestore:", err);
      logError("Save Company Profile", err);
    }
  }
  await logActivity(
    'Company Profile Updated',
    `Profile details updated for ${profile.nameUr || profile.nameEn}`,
    'settings'
  );
}

// ---------------------------------------------------------------------------
// System Activity Log
// ---------------------------------------------------------------------------

export async function logActivity(
  action: string,
  details: string,
  category: 'auth' | 'bilty' | 'settings' | 'fleet' | 'export' | 'error' | 'sync' = 'bilty'
) {
  const user = auth.currentUser;
  const newLog: ActivityLogItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    uid: user?.uid || 'anonymous',
    email: user?.email || safeStorage.getItem('ah-gmail-user') || 'system',
    action,
    details,
    category
  };

  // Local storage recent buffer
  try {
    const localLogsStr = safeStorage.getItem('ah-activity-logs');
    const localLogs: ActivityLogItem[] = localLogsStr ? JSON.parse(localLogsStr) : [];
    const updated = [newLog, ...localLogs].slice(0, 100);
    safeStorage.setItem('ah-activity-logs', JSON.stringify(updated));
  } catch {
    // Ignore local buffer error
  }

  // Firestore sync
  if (typeof navigator !== 'undefined' && navigator.onLine && user) {
    try {
      const logCol = collection(db, 'activityLog');
      await withTimeout(addDoc(logCol, newLog), 2000);
    } catch {
      // Offline fallback
    }
  }
}

export async function getActivityLogs(): Promise<ActivityLogItem[]> {
  let logs: ActivityLogItem[] = [];
  try {
    const localLogsStr = localStorage.getItem('ah-activity-logs');
    if (localLogsStr) {
      logs = JSON.parse(localLogsStr);
    }
  } catch {
    logs = [];
  }

  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const logCol = collection(db, 'activityLog');
      const snap = await withTimeout(getDocs(logCol), 2500);
      const remoteLogs: ActivityLogItem[] = [];
      snap.forEach(d => {
        const item = d.data() as ActivityLogItem;
        if (item && item.action) {
          remoteLogs.push({ ...item, id: item.id || d.id });
        }
      });
      if (remoteLogs.length > 0) {
        remoteLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        logs = remoteLogs.slice(0, 100);
        localStorage.setItem('ah-activity-logs', JSON.stringify(logs));
      }
    } catch {
      // Fallback to local
    }
  }
  return logs;
}

// ---------------------------------------------------------------------------
// Business Data Exporters (JSON & CSV with Privacy Controls)
// ---------------------------------------------------------------------------

export function exportAllBusinessDataJSON(privacyOptions?: ExportPrivacyOptions) {
  const rawBilties = getStoredBilties();
  const rawTrips = getStoredTrips();
  const rawDrivers = getStoredDrivers();

  const sanitizedBilties = rawBilties.map(b => sanitizeBiltyRecord(b, privacyOptions));
  const sanitizedTrips = rawTrips.map(t => sanitizeTripRecord(t, privacyOptions));
  const sanitizedDrivers = rawDrivers.map(d => sanitizeDriverRecord(d, privacyOptions));

  const data = {
    exportDate: new Date().toISOString(),
    privacySettings: {
      maskedCnic: privacyOptions?.maskCnic ?? true,
      maskedPhone: privacyOptions?.maskPhone ?? false,
      anonymizedNames: privacyOptions?.anonymizeNames ?? false,
      includedFinancials: privacyOptions?.includeFinancials ?? true
    },
    company: getCachedCompanyProfile(),
    bilties: sanitizedBilties,
    trips: sanitizedTrips,
    vehicles: getStoredVehicles(),
    drivers: sanitizedDrivers,
    routes: getStoredRoutes(),
    fuelLogs: getStoredFuelLog(),
    contacts: getContactList(privacyOptions)
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Driver_Dost_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  logActivity('Data Backup Exported', 'Full JSON backup downloaded with privacy filters', 'export');
}

export const exportFullLocalBackup = exportAllBusinessDataJSON;

export function exportAllBiltiesCSV(privacyOptions?: ExportPrivacyOptions) {
  const rawBilties = getStoredBilties();
  if (rawBilties.length === 0) {
    console.warn("No bilty records found to export.");
    return false;
  }

  const bilties = rawBilties.map(b => sanitizeBiltyRecord(b, privacyOptions));

  let csv = "data:text/csv;charset=utf-8,\uFEFF";
  csv += "Bilty No,Date,Vehicle No,Driver Name,Mobile,Sender (Consignor),Sender Mobile,Sender CNIC,Receiver (Consignee),Receiver Mobile,From City,To City,Item,Qty,Weight,Total Freight,Advance,Payable\n";

  bilties.forEach(b => {
    const row = [
      b.biltyNo,
      b.date || '',
      b.vehicleNo || '',
      b.driverName || '',
      b.mobileNo || '',
      b.senderName || b.consignor || '',
      b.senderMobile || '',
      b.senderCnic || '',
      b.receiverName || b.consignee || '',
      b.receiverMobile || '',
      b.sendingCity || '',
      b.receivingCity || '',
      b.itemDescription || '',
      b.qty || '',
      b.weight || '',
      b.total,
      b.advance,
      b.payable
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    csv += row + "\n";
  });

  const encodedUri = encodeURI(csv);
  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = `Driver_Dost_Bilties_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  logActivity('Bilties CSV Exported', `${bilties.length} bilty records exported as CSV`, 'export');
  return true;
}

export function exportAllTripsCSV(privacyOptions?: ExportPrivacyOptions) {
  const rawTrips = getStoredTrips();
  if (rawTrips.length === 0) {
    console.warn("No trip records found to export.");
    return false;
  }

  const trips = rawTrips.map(t => sanitizeTripRecord(t, privacyOptions));

  let csv = "data:text/csv;charset=utf-8,\uFEFF";
  csv += "Trip ID,Trip Name,Date,Month,Distance (km),Fuel Type,Fuel Cost,Tolls,Loading,Driver Kharcha,Other,Total Expense\n";

  trips.forEach(t => {
    const row = [
      t.id,
      t.name,
      t.date,
      t.month,
      t.dist,
      t.fuelType,
      t.fuelCost,
      t.toll,
      t.loading,
      t.driver,
      t.other,
      t.total
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    csv += row + "\n";
  });

  const encodedUri = encodeURI(csv);
  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = `Driver_Dost_Trips_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  logActivity('Trips CSV Exported', `${trips.length} trip records exported as CSV`, 'export');
}

export function restoreFullBackupFromJson(jsonString: string): { success: boolean; message: string; count: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file format', count: 0 };
    }
    let restoredCount = 0;
    if (Array.isArray(data.bilties) && data.bilties.length > 0) {
      const existing = getStoredBilties();
      const map = new Map<string, BiltyRecord>();
      existing.forEach(b => { if (b.biltyNo) map.set(b.biltyNo, b); });
      data.bilties.forEach((b: BiltyRecord) => {
        if (b.biltyNo) {
          map.set(b.biltyNo, b);
          restoredCount++;
        }
      });
      safeStorage.setItem('ah-bilties-data', JSON.stringify(Array.from(map.values())));
    }
    if (Array.isArray(data.trips) && data.trips.length > 0) {
      safeStorage.setItem('ah-trips-data', JSON.stringify(data.trips));
    }
    if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
      safeStorage.setItem('ah-vehicles-data', JSON.stringify(data.vehicles));
    }
    if (data.company) {
      safeStorage.setItem('ah-company-profile', JSON.stringify(data.company));
    }
    logActivity('Backup Restored', `Restored ${restoredCount} bilty records from backup`, 'settings');
    return { success: true, message: 'Backup successfully restored!', count: restoredCount };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to restore backup', count: 0 };
  }
}

/**
 * Safe Migration Helper: Publishes existing private bilties to publicBiltyVerifications.
 * Reads existing stored bilties, extracts only non-PII, non-financial fields using
 * extractPublicBiltyVerification, and uploads them to publicBiltyVerifications/{biltyNo}.
 * Does NOT alter or delete production private bilties or bulk-modify existing private documents.
 */
export async function publishExistingBiltiesToPublicVerifications(): Promise<{ total: number; published: number; errors: string[] }> {
  const bilties = getStoredBilties();
  let publishedCount = 0;
  const errors: string[] = [];

  for (const b of bilties) {
    if (b.biltyNo) {
      try {
        const success = await syncPublicBiltyVerification(b);
        if (success) publishedCount++;
      } catch (err: any) {
        errors.push(`Bilty ${b.biltyNo}: ${err?.message || String(err)}`);
      }
    }
  }

  return { total: bilties.length, published: publishedCount, errors };
}

/**
 * Account Deletion Model (Google Play Store 30-Day Grace Period Compliance)
 */
export interface AccountDeletionRequest {
  userId: string;
  userEmail: string;
  requestedAt: string;
  scheduledFor: string;
  status: 'pending_deletion';
  reason?: string;
}

export async function requestAccountDeletion(
  userId: string,
  userEmail: string,
  reason?: string
): Promise<{ success: boolean; scheduledFor: string; message: string }> {
  const requestedAt = new Date().toISOString();
  const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const deletionData: AccountDeletionRequest = {
    userId,
    userEmail,
    requestedAt,
    scheduledFor,
    status: 'pending_deletion',
    reason: reason || 'User requested via Driver Dost app'
  };

  const currentUser = auth.currentUser;
  if (db && userId && currentUser && currentUser.uid === userId) {
    try {
      const userDocRef = doc(db, 'usersData', userId);
      await withTimeout(setDoc(userDocRef, { accountDeletion: deletionData }, { merge: true }), 4000);
    } catch (err) {
      console.warn('Could not write account deletion to Firestore:', err);
    }
  }

  safeStorage.setItem(`ah-deletion-${userId}`, JSON.stringify(deletionData));
  logActivity('Account Deletion Requested', `Scheduled for purge on ${scheduledFor.slice(0, 10)} (30-day grace period)`, 'settings');

  return {
    success: true,
    scheduledFor,
    message: 'Account deletion scheduled with a 30-day grace period.'
  };
}

export async function cancelAccountDeletion(userId: string): Promise<{ success: boolean }> {
  const currentUser = auth.currentUser;
  if (db && userId && currentUser && currentUser.uid === userId) {
    try {
      const userDocRef = doc(db, 'usersData', userId);
      await withTimeout(setDoc(userDocRef, { accountDeletion: null }, { merge: true }), 4000);
    } catch (err) {
      console.warn('Could not cancel account deletion in Firestore:', err);
    }
  }
  safeStorage.removeItem(`ah-deletion-${userId}`);
  logActivity('Account Deletion Cancelled', `Account restored by user ${userId}`, 'settings');
  return { success: true };
}

export function getAccountDeletionStatus(userId: string): AccountDeletionRequest | null {
  try {
    const raw = safeStorage.getItem(`ah-deletion-${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}
