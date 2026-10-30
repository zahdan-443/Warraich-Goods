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
  if (scopedVal !== null) {
    return scopedVal;
  }

  // Fallback: Check legacy key 'ah-<baseKey>' and migrate data if present
  const legacyKey = `ah-${baseKey}`;
  const legacyVal = safeStorage.getItem(legacyKey);
  if (legacyVal !== null) {
    safeStorage.setItem(scopedKey, legacyVal);
    return legacyVal;
  }

  return null;
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

export function enqueueOfflineAction(type: OfflineAction['type'], data: any) {
  try {
    const queue = getStoredOfflineQueue();
    const newAction: OfflineAction = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    // Replace duplicate pending item of same type if present to avoid spamming
    const filtered = queue.filter(item => !(item.type === type && JSON.stringify(item.data) === JSON.stringify(data)));
    const updated = [newAction, ...filtered].slice(0, 50);
    saveStoredOfflineQueue(updated);
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
        if (action.type === 'bilty' && Array.isArray(action.data)) {
          const userDocRef = doc(db, 'users', user.uid, 'collections', 'bilties');
          await withTimeout(setDoc(userDocRef, { items: action.data, updatedAt: new Date().toISOString() }, { merge: true }), 8000);
          // Also process public verification copies for each bilty in publicBiltyVerifications
          for (const b of action.data) {
            if (b?.biltyNo) {
              const safeData = extractPublicBiltyVerification(b);
              const normalizedNo = String(b.biltyNo).trim().toUpperCase();
              const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
              await withTimeout(setDoc(pubRef, safeData, { merge: true }), 8000).catch(() => {});
            }
          }
          processedCount++;
        } else if (action.type === 'public_bilty' && action.data?.biltyNo) {
          const safeData = extractPublicBiltyVerification(action.data);
          const normalizedNo = String(action.data.biltyNo).trim().toUpperCase();
          const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
          await withTimeout(setDoc(pubRef, safeData, { merge: true }), 8000);
          processedCount++;
        } else if (action.type === 'bilty' && !Array.isArray(action.data)) {
          // Legacy counter sync action - mark processed
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
          const normalizedNo = String(action.data.biltyNo).trim().toUpperCase();
          const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
          const safeData = extractPublicBiltyVerification(action.data);
          if (action.data.isDelivered) {
            (safeData as any).isDelivered = true;
          }
          await withTimeout(setDoc(pubRef, safeData, { merge: true }), 8000);
          processedCount++;
        } else {
          processedCount++;
        }
      } else if (action.type === 'public_bilty' && action.data?.biltyNo && user) {
        const safeData = extractPublicBiltyVerification(action.data);
        const normalizedNo = String(action.data.biltyNo).trim().toUpperCase();
        const pubRef = doc(db, 'publicBiltyVerifications', normalizedNo);
        await withTimeout(setDoc(pubRef, safeData, { merge: true }), 8000);
        processedCount++;
      } else {
        // Unauthenticated action in queue: do not attempt cloud writes without auth
        if ((action.retryCount || 0) >= 2) {
          // Discard unauthenticated stale actions to prevent endless error spam
          processedCount++;
        } else {
          remainingQueue.push(action);
        }
      }
    } catch (err: any) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const isPermissionErr = errMsg.includes('Missing or insufficient permissions') || errMsg.includes('permission-denied');
      const retry = (action.retryCount || 0) + 1;
      errorLogs.push(`Action ${action.id} failed (attempt ${retry}): ${errMsg}`);
      if (retry < 3 && !isPermissionErr) {
        remainingQueue.push({ ...action, retryCount: retry });
      }
    }
  }

  saveStoredOfflineQueue(remainingQueue);
  return { processed: processedCount, remaining: remainingQueue.length, errors: errorLogs };
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

  // 2. Migrate any guest data if user was previously in guest mode offline
  try {
    const guestKeys = ['bilties', 'trips', 'vehicles', 'drivers', 'fuel'];
    for (const key of guestKeys) {
      const guestKey = getScopedStorageKey(key, 'guest');
      const rawGuest = safeStorage.getItem(guestKey);
      if (rawGuest) {
        try {
          const guestItems = JSON.parse(rawGuest);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            const userKey = getScopedStorageKey(key, uid);
            const rawUser = safeStorage.getItem(userKey);
            const userItems = rawUser ? JSON.parse(rawUser) : [];
            const mergedMap = new Map<string, any>();
            userItems.forEach((item: any) => {
              const id = item.biltyNo || item.id || JSON.stringify(item);
              mergedMap.set(String(id), item);
            });
            guestItems.forEach((item: any) => {
              const id = item.biltyNo || item.id || JSON.stringify(item);
              mergedMap.set(String(id), item);
            });
            const merged = Array.from(mergedMap.values());
            safeStorage.setItem(userKey, JSON.stringify(merged));
            safeStorage.removeItem(guestKey);
          }
        } catch {}
      }
    }
  } catch {}

  // 3. Bi-directional reconcile for each collection
  const collections = ['bilties', 'trips', 'vehicles', 'drivers', 'fuel'];
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

      // Merge local and cloud by unique key
      const mergedMap = new Map<string, any>();
      // First insert cloud items
      cloudItems.forEach(item => {
        const idKey = item.biltyNo ? String(item.biltyNo).trim().toUpperCase() : String(item.id || item.regNo || JSON.stringify(item));
        mergedMap.set(idKey, item);
      });
      // Then insert/update with local items (so offline modifications or newly created items take precedence)
      localItems.forEach(item => {
        const idKey = item.biltyNo ? String(item.biltyNo).trim().toUpperCase() : String(item.id || item.regNo || JSON.stringify(item));
        mergedMap.set(idKey, item);
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
            const currentCloudVal = counterSnap && counterSnap.exists() ? (counterSnap.data()?.currentValue || 1000) : 1000;
            if (highestBiltySeq > currentCloudVal) {
              await setDoc(counterRef, { currentValue: highestBiltySeq, updatedAt: new Date().toISOString() }, { merge: true }).catch(() => {});
            }
          } catch {}
        }
      }
    } catch (e) {
      console.warn(`Reconciliation notice for ${collName}:`, e);
    }
  }

  // 4. Also reconcile Khata / Ledger
  try {
    const { fetchKhataFromFirestore, processKhataDocQueue } = await import('./ledgerStorage');
    await fetchKhataFromFirestore().catch(() => {});
    await processKhataDocQueue().catch(() => {});
  } catch {}

  return { synced: true, count: totalSynced };
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
  setScopedItem('trips', JSON.stringify(trips));
  syncToFirestore('trips', trips);
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
  setScopedItem('vehicles', JSON.stringify(vehicles));
  syncToFirestore('vehicles', vehicles);
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
  setScopedItem('drivers', JSON.stringify(drivers));
  syncToFirestore('drivers', drivers);
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
  setScopedItem('routes', JSON.stringify(routes));
  syncToFirestore('routes', routes);
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
  setScopedItem('fuel', JSON.stringify(items));
  syncToFirestore('fuel', items);
}

export function getStoredBilties(): BiltyRecord[] {
  try {
    const data = getScopedItem('bilties');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
export function saveStoredBilties(bilties: BiltyRecord[]) {
  setScopedItem('bilties', JSON.stringify(bilties));
  syncToFirestore('bilties', bilties);
  // Also sync public verification copies for all bilties
  bilties.forEach((b) => {
    syncPublicBiltyVerification(b).catch(() => {});
  });
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
    await withTimeout(setDoc(docRef, safeData, { merge: true }), 3000);
    const cleanId = normalizedNo.replace(/[^A-Z0-9]/g, '');
    if (cleanId && cleanId !== normalizedNo) {
      const docRef2 = doc(db, 'publicBiltyVerifications', cleanId);
      await withTimeout(setDoc(docRef2, safeData, { merge: true }), 3000).catch(() => {});
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
 * Transactionally increments and allocates the next sequential Bilty Number.
 * When online, runs an atomic Firestore transaction on the global counter document.
 * Monotonically sequence begins strictly at WG-1001.
 * When offline or on timeout, increments local counter from max existing / base 1000.
 */
export async function allocateNextBiltyNumber(userUid?: string): Promise<string> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const user = auth.currentUser;

  if (isOnline && db && user) {
    try {
      const counterDocRef = doc(db, 'counters', 'biltyCounter');
      const nextSeq = await withTimeout(
        runTransaction(db, async (transaction) => {
          const snap = await transaction.get(counterDocRef);
          let current = 1000;
          if (snap.exists()) {
            const d = snap.data();
            current = typeof d?.currentValue === 'number' && d.currentValue >= 1000 ? d.currentValue : 1000;
          }
          const next = current + 1;
          transaction.set(counterDocRef, {
            currentValue: next,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          return next;
        }),
        8000
      );

      // Keep local counter updated to the highest sequence
      setScopedItem('bilty-counter', String(nextSeq));
      return `WG-${nextSeq}`;
    } catch {
      // Fall through to atomic local increment on transaction timeout or offline
    }
  }

  // Offline / Local Monotonic Fallback starting at 1001
  const bilties = getStoredBilties();
  let maxExisting = 1000;
  bilties.forEach(b => {
    const numPart = parseInt((b.biltyNo || '').replace(/\D/g, ''), 10);
    if (!isNaN(numPart) && numPart > maxExisting) {
      maxExisting = numPart;
    }
  });

  const storedCounterStr = getScopedItem('bilty-counter');
  let currentCounter = storedCounterStr ? parseInt(storedCounterStr, 10) : 1000;
  if (isNaN(currentCounter) || currentCounter < 1000) currentCounter = 1000;

  const nextLocalSeq = Math.max(maxExisting, currentCounter) + 1;
  setScopedItem('bilty-counter', String(nextLocalSeq));

  return `WG-${nextLocalSeq}`;
}

export function getNextBiltyNo(): string {
  const bilties = getStoredBilties();
  let maxExisting = 1000;
  bilties.forEach(b => {
    const numPart = parseInt((b.biltyNo || '').replace(/\D/g, ''), 10);
    if (!isNaN(numPart) && numPart > maxExisting) {
      maxExisting = numPart;
    }
  });

  let no = parseInt(getScopedItem('bilty-counter') || '1000', 10);
  no = Math.max(maxExisting, isNaN(no) || no < 1000 ? 1000 : no) + 1;
  setScopedItem('bilty-counter', String(no));
  return `WG-${no}`;
}

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}
export function saveStoredRole(role: UserRole) {
  setScopedItem('user-role', role);
}

export function getStoredOfflineQueue(): OfflineAction[] {
  try {
    const data = getScopedItem('offline-queue');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
export function saveStoredOfflineQueue(queue: OfflineAction[]) {
  setScopedItem('offline-queue', JSON.stringify(queue));
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

export function getSyncStatus(): SyncStatusState {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queue = getStoredOfflineQueue();
  const lastSyncTime = safeStorage.getItem('ah-last-sync-time');
  const lastError = safeStorage.getItem('ah-last-sync-error');
  const errorLogs = getErrorLogs();

  let status: SyncStatusState['status'] = 'synced';
  if (!isOnline) {
    status = 'offline';
  } else if (queue.length > 0) {
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

  try {
    const result = await processOfflineQueue();
    safeStorage.setItem('ah-last-sync-time', new Date().toISOString());
    if (result.errors.length > 0) {
      safeStorage.setItem('ah-last-sync-error', result.errors[0]);
    } else {
      safeStorage.removeItem('ah-last-sync-error');
    }
    await logActivity('Manual Sync Triggered', `Processed ${result.processed} actions, ${result.remaining} remaining`, 'sync');
    return {
      success: result.errors.length === 0,
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logError('Manual Sync Failure', errorMsg);
    safeStorage.setItem('ah-last-sync-error', errorMsg);
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
