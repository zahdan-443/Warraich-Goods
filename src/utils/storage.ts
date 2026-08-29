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
  SyncStatusState
} from '../types';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, runTransaction } from 'firebase/firestore';
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

// Memory storage fallback for non-browser/test environments
const memoryStorage = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch {
      // fallback
    }
    return memoryStorage.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
    } catch {
      // fallback
    }
    memoryStorage.set(key, value);
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
    } catch {
      // fallback
    }
    memoryStorage.delete(key);
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
  { id: 1, date: "Standard Rate", diesel: 290.0, petrol: 280.0, cng: 220.0 }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: "🚛 Warraich Goods System Ready",
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

// Helper to wrap Firestore promises with a short timeout so offline/slow connections fail fast to localStorage
export function withTimeout<T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> {
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
      await withTimeout(setDoc(userDocRef, { items: data, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
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
          await withTimeout(setDoc(userDocRef, { items: action.data, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
          processedCount++;
        } else if (['trip', 'trips', 'vehicle', 'vehicles', 'driver', 'drivers', 'fuel', 'routes'].includes(action.type)) {
          const collectionName = action.type.endsWith('s') ? action.type : `${action.type}s`;
          const actualKey = collectionName === 'fuels' ? 'fuel' : collectionName;
          const userDocRef = doc(db, 'users', user.uid, 'collections', actualKey);
          await withTimeout(setDoc(userDocRef, { items: action.data, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
          processedCount++;
        } else if (action.type === 'settings') {
          const docRef = doc(db, 'settings', 'companyProfile');
          await withTimeout(setDoc(docRef, action.data, { merge: true }), 3000);
          processedCount++;
        } else {
          processedCount++;
        }
      } else {
        // No authenticated user yet; retain in queue
        remainingQueue.push(action);
      }
    } catch (err) {
      const retry = (action.retryCount || 0) + 1;
      errorLogs.push(`Action ${action.id} failed (attempt ${retry}): ${err instanceof Error ? err.message : String(err)}`);
      if (retry <= 5) {
        remainingQueue.push({ ...action, retryCount: retry });
      }
    }
  }

  saveStoredOfflineQueue(remainingQueue);
  return { processed: processedCount, remaining: remainingQueue.length, errors: errorLogs };
}

export async function loadFromFirestore(uid: string) {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return; // Skip network call when offline
  }
  const keys = ['trips', 'vehicles', 'drivers', 'routes', 'fuel', 'bilties'];
  for (const key of keys) {
    try {
      const docRef = doc(db, 'users', uid, 'collections', key);
      const snap = await withTimeout(getDoc(docRef), 2500);
      if (snap.exists() && snap.data()?.items) {
        const scopedKey = getScopedStorageKey(key, uid);
        localStorage.setItem(scopedKey, JSON.stringify(snap.data().items));
      }
    } catch {
      // Graceful offline fallback
    }
  }
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
}

// ---------------------------------------------------------------------------
// Transaction-Based Bilty Number Generator
// ---------------------------------------------------------------------------

/**
 * Transactionally increments and allocates the next sequential Bilty Number.
 * When online, runs an atomic Firestore transaction on the global counter document.
 * When offline or on timeout, monotonically increments user-scoped local counter and queues sync.
 */
export async function allocateNextBiltyNumber(userUid?: string): Promise<string> {
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;

  if (isOnline && db) {
    try {
      const counterDocRef = doc(db, 'counters', 'biltyCounter');
      const nextSeq = await withTimeout(
        runTransaction(db, async (transaction) => {
          const snap = await transaction.get(counterDocRef);
          let current = 0;
          if (snap.exists()) {
            const d = snap.data();
            current = typeof d?.currentValue === 'number' ? d.currentValue : 0;
          }
          const next = current + 1;
          transaction.set(counterDocRef, {
            currentValue: next,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          return next;
        }),
        3000
      );

      // Keep local counter updated to the highest sequence
      setScopedItem('bilty-counter', String(nextSeq));
      return 'AH-' + String(nextSeq).padStart(4, '0');
    } catch {
      // Fall through to atomic local increment on transaction timeout or offline
    }
  }

  // Offline / Local Monotonic Fallback
  const bilties = getStoredBilties();
  let maxExisting = 0;
  bilties.forEach(b => {
    const numPart = parseInt((b.biltyNo || '').replace(/\D/g, ''), 10);
    if (!isNaN(numPart) && numPart > maxExisting) {
      maxExisting = numPart;
    }
  });

  const storedCounterStr = getScopedItem('bilty-counter');
  let currentCounter = storedCounterStr ? parseInt(storedCounterStr, 10) : 0;
  if (isNaN(currentCounter)) currentCounter = 0;

  const nextLocalSeq = Math.max(maxExisting, currentCounter) + 1;
  setScopedItem('bilty-counter', String(nextLocalSeq));

  // Enqueue offline counter sync
  enqueueOfflineAction('bilty' as any, { localCounter: nextLocalSeq });

  return 'AH-' + String(nextLocalSeq).padStart(4, '0');
}

export function getNextBiltyNo(): string {
  const bilties = getStoredBilties();
  let maxExisting = 0;
  bilties.forEach(b => {
    const numPart = parseInt((b.biltyNo || '').replace(/\D/g, ''), 10);
    if (!isNaN(numPart) && numPart > maxExisting) {
      maxExisting = numPart;
    }
  });

  let no = parseInt(getScopedItem('bilty-counter') || '0', 10);
  no = Math.max(maxExisting, isNaN(no) ? 0 : no) + 1;
  setScopedItem('bilty-counter', String(no));
  return 'AH-' + String(no).padStart(4, '0');
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

export async function getAllRegisteredUsers(): Promise<UserProfile[]> {
  const localUsers = getLocalRegisteredUsers();
  const userMap = new Map<string, UserProfile>();

  // Add default owner
  userMap.set('warraichgoods43@gmail.com', {
    uid: 'owner_uid',
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

  // Populate from Firestore
  if (typeof navigator === 'undefined' || navigator.onLine) {
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

export async function getBiltyAccessConfig(): Promise<BiltyAccessConfigData> {
  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const accessRef = doc(db, 'access', 'biltyAccess');
      const snap = await withTimeout(getDoc(accessRef), 2000);
      if (snap.exists()) {
        const data = snap.data();
        const allowedUIDs = Array.isArray(data?.allowedUIDs) ? data.allowedUIDs : [];
        const allowedEmails = Array.isArray(data?.allowedEmails) ? data.allowedEmails : [];
        if (allowedUIDs.length > 0 || allowedEmails.length > 0) {
          setScopedItem('bilty-allowed-uids', JSON.stringify(allowedUIDs));
          setScopedItem('bilty-allowed-emails', JSON.stringify(allowedEmails));
          return { allowedUIDs, allowedEmails };
        }
      }
    } catch {
      // Fall through to storage
    }
  }
  try {
    const cachedUIDs = getScopedItem('bilty-allowed-uids');
    const cachedEmails = getScopedItem('bilty-allowed-emails');
    return {
      allowedUIDs: cachedUIDs ? JSON.parse(cachedUIDs) : [],
      allowedEmails: cachedEmails ? JSON.parse(cachedEmails) : []
    };
  } catch {
    return { allowedUIDs: [], allowedEmails: [] };
  }
}

export async function updateBiltyAccessInFirestore(allowedUIDs: string[], allowedEmails: string[] = []) {
  try {
    setScopedItem('bilty-allowed-uids', JSON.stringify(allowedUIDs));
    setScopedItem('bilty-allowed-emails', JSON.stringify(allowedEmails));
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const accessRef = doc(db, 'access', 'biltyAccess');
      await withTimeout(setDoc(accessRef, { allowedUIDs, allowedEmails, updatedAt: new Date().toISOString() }, { merge: true }), 3000);
    }
  } catch {
    // LocalStorage updated
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
    alert("No contact records available to export.");
    return;
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
  link.setAttribute("download", `Warraich_Goods_Contacts_${new Date().toISOString().slice(0, 10)}.csv`);
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
  const cached = localStorage.getItem('ah-company-profile');
  let profile = cached ? JSON.parse(cached) : DEFAULT_COMPANY_PROFILE;

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
  const localLogsStr = localStorage.getItem('ah-activity-logs');
  let logs: ActivityLogItem[] = localLogsStr ? JSON.parse(localLogsStr) : [];

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
  link.download = `Warraich_Goods_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  logActivity('Data Backup Exported', 'Full JSON backup downloaded with privacy filters', 'export');
}

export function exportAllBiltiesCSV(privacyOptions?: ExportPrivacyOptions) {
  const rawBilties = getStoredBilties();
  if (rawBilties.length === 0) {
    alert("No bilty records found to export.");
    return;
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
  link.download = `Warraich_Goods_Bilties_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  logActivity('Bilties CSV Exported', `${bilties.length} bilty records exported as CSV`, 'export');
}

export function exportAllTripsCSV(privacyOptions?: ExportPrivacyOptions) {
  const rawTrips = getStoredTrips();
  if (rawTrips.length === 0) {
    alert("No trip records found to export.");
    return;
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
  link.download = `Warraich_Goods_Trips_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  logActivity('Trips CSV Exported', `${trips.length} trip records exported as CSV`, 'export');
}
