/**
 * Driver Dost - Unified Scoped Storage & Cloud Sync Facade (#35)
 *
 * Modularized into:
 * - `./storageCore`: exact key storage (`safeStorage`), IndexedDB hydration guard, v2->v3 migration
 * - `./storageSync`: tombstone reconciliation, per-doc Firestore sync, infinite backoff queue, blocked status
 * - `./accountDeletion`: full local/IDB & Firestore recursive purge with error propagation
 */

import {
  ActivityLogItem,
  AppNotification,
  BiltyRecord,
  CompanyProfile,
  ContactItem,
  ExportPrivacyOptions,
  UserProfile,
  UserRole
} from '../types';
import { auth, db } from './firebase';
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import {
  anonymizePersonName,
  maskCNIC,
  maskPhoneNumber,
  sanitizeBiltyRecord,
  sanitizeDriverRecord,
  sanitizeTripRecord
} from './calculator';
import { DEFAULT_AUTHORIZED_EMAILS, OWNER_EMAIL, isOwnerEmail, normalizeEmail } from './authUtils';
import { getPakistanDateKey } from './dateUtils';
import { shareOrDownloadText } from './nativeExport';
import {
  GuestScopeSummary,
  V3_MIGRATION_FLAG_PREFIX,
  getActiveUserScope,
  getScopedItem,
  importGuestDataIntoScope,
  inspectGuestScopeData,
  cleanupUploadedLegacyAndStagingKeys,
  removeScopedItem,
  runOneTimeV2ToV3Migration,
  safeStorage,
  setScopedItem
} from './storageCore';
import {
  BiltyAccessConfigData,
  PublicBiltyVerification,
  SYNC_COLLECTION_TO_DOC_SUBCOLL,
  SyncCollectionName,
  TOMBSTONE_TTL_DAYS,
  TombstoneMap,
  allocateNextBiltyNumber,
  applyRestoredCollection,
  autoReconcileAllLocalToCloud,
  checkBiltyNoConflict,
  clearErrorLogs,
  clearOfflineQueue,
  confirmBiltyDelivery,
  deletePublicBiltyVerification,
  enqueueOfflineAction,
  extractPublicBiltyVerification,
  findNextAvailableBiltySeq,
  getBiltyAccessConfig,
  getErrorLogs,
  getNextBiltyNo,
  getStoredBilties,
  getStoredDrivers,
  getStoredFuelLog,
  getStoredHighestBiltySeq,
  getStoredOfflineQueue,
  getStoredRoutes,
  getStoredTrips,
  getStoredVehicles,
  getSyncStatus,
  getTombstones,
  initAmbientSyncEngine,
  isEntityTombstoned,
  loadFromFirestore,
  mergeTombstoneMaps,
  normalizeBiltyConfig,
  notifySyncListeners,
  persistBiltyCounterLocally,
  processOfflineQueue,
  pruneTombstoneMap,
  recordCollectionMutations,
  resolveEntityLWW,
  saveStoredBilties,
  saveStoredDrivers,
  saveStoredFuelLog,
  saveStoredOfflineQueue,
  saveStoredRoutes,
  saveStoredTrips,
  saveStoredVehicles,
  saveTombstones,
  scheduleAmbientSync,
  subscribeToBiltyAccess,
  subscribeToSyncEvents,
  syncPublicBiltyVerification,
  syncToFirestore,
  triggerManualSync,
  updateBiltyAccessInFirestore,
  withTimeout
} from './storageSync';
import {
  AccountDeletionRequest,
  USER_FIRESTORE_SUBCOLLECTIONS,
  cancelAccountDeletion,
  clearLocalAndIndexedDbForUser,
  executeImmediateAccountDeletion,
  fetchAccountDeletionStatus,
  getAccountDeletionStatus,
  purgeAllUserFirestoreData,
  purgeExpiredAccountData,
  requestAccountDeletion
} from './accountDeletion';

// Re-export modularized APIs for seamless compatibility
export {
  DEFAULT_AUTHORIZED_EMAILS,
  SYNC_COLLECTION_TO_DOC_SUBCOLL,
  TOMBSTONE_TTL_DAYS,
  USER_FIRESTORE_SUBCOLLECTIONS,
  V3_MIGRATION_FLAG_PREFIX,
  allocateNextBiltyNumber,
  applyRestoredCollection,
  autoReconcileAllLocalToCloud,
  cancelAccountDeletion,
  checkBiltyNoConflict,
  clearErrorLogs,
  clearLocalAndIndexedDbForUser,
  clearOfflineQueue,
  confirmBiltyDelivery,
  deletePublicBiltyVerification,
  enqueueOfflineAction,
  executeImmediateAccountDeletion,
  extractPublicBiltyVerification,
  fetchAccountDeletionStatus,
  findNextAvailableBiltySeq,
  getAccountDeletionStatus,
  getActiveUserScope,
  getBiltyAccessConfig,
  getErrorLogs,
  getNextBiltyNo,
  getScopedItem,
  getStoredBilties,
  getStoredDrivers,
  getStoredFuelLog,
  getStoredHighestBiltySeq,
  getStoredOfflineQueue,
  getStoredRoutes,
  getStoredTrips,
  getStoredVehicles,
  getSyncStatus,
  getTombstones,
  importGuestDataIntoScope,
  initAmbientSyncEngine,
  inspectGuestScopeData,
  isEntityTombstoned,
  loadFromFirestore,
  mergeTombstoneMaps,
  normalizeBiltyConfig,
  notifySyncListeners,
  persistBiltyCounterLocally,
  processOfflineQueue,
  pruneTombstoneMap,
  purgeAllUserFirestoreData,
  purgeExpiredAccountData,
  recordCollectionMutations,
  cleanupUploadedLegacyAndStagingKeys,
  removeScopedItem,
  requestAccountDeletion,
  resolveEntityLWW,
  runOneTimeV2ToV3Migration,
  safeStorage,
  saveStoredBilties,
  saveStoredDrivers,
  saveStoredFuelLog,
  saveStoredOfflineQueue,
  saveStoredRoutes,
  saveStoredTrips,
  saveStoredVehicles,
  saveTombstones,
  scheduleAmbientSync,
  setScopedItem,
  subscribeToBiltyAccess,
  subscribeToSyncEvents,
  syncPublicBiltyVerification,
  syncToFirestore,
  triggerManualSync,
  updateBiltyAccessInFirestore,
  withTimeout
};
export type {
  AccountDeletionRequest,
  BiltyAccessConfigData,
  GuestScopeSummary,
  PublicBiltyVerification,
  SyncCollectionName,
  TombstoneMap
};

// Re-export `publishExistingBiltiesToPublicVerifications` locally below (avoid circular ref if needed)
export async function publishExistingBiltiesToPublicVerifications(): Promise<{
  total: number;
  published: number;
  errors: string[];
}> {
  const bilties = getStoredBilties();
  let publishedCount = 0;
  const errors: string[] = [];

  for (const b of bilties) {
    if (b.biltyNo) {
      try {
        const success = await syncPublicBiltyVerification(b);
        if (success) publishedCount++;
      } catch (err: unknown) {
        errors.push(`Bilty ${b.biltyNo}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  return { total: bilties.length, published: publishedCount, errors };
}

// ---------------------------------------------------------------------------
// Role & Notification Preferences
// ---------------------------------------------------------------------------

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 1,
    title: '🚛 Driver Dost System Ready',
    message: 'Offline-first cloud database and fleet management initialized.',
    time: 'Just now',
    unread: true,
    type: 'system'
  }
];

export function getStoredRole(): UserRole {
  return (getScopedItem('user-role') as UserRole) || 'driver';
}

export function saveStoredRole(role: UserRole): void {
  setScopedItem('user-role', role);
}

export function getStoredNotifications(): AppNotification[] {
  try {
    const data = getScopedItem('notifs');
    return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredNotifications(notifs: AppNotification[]): void {
  setScopedItem('notifs', JSON.stringify(notifs));
}

// ---------------------------------------------------------------------------
// Registered Users Directory
// ---------------------------------------------------------------------------

export function getLocalRegisteredUsers(): UserProfile[] {
  try {
    const raw = safeStorage.getItem('ah-registered-users-list');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalRegisteredUsers(users: UserProfile[]): void {
  try {
    safeStorage.setItem('ah-registered-users-list', JSON.stringify(users));
  } catch {
    // ignore
  }
}

export async function saveUserProfileInFirestore(profile: UserProfile): Promise<void> {
  try {
    const existing = getLocalRegisteredUsers();
    const cleanEmail = normalizeEmail(profile.email);
    const filtered = existing.filter(
      u => normalizeEmail(u.email) !== cleanEmail && u.uid !== profile.uid
    );
    const updated: UserProfile = {
      ...profile,
      email: cleanEmail || profile.email,
      lastLogin: profile.lastLogin || new Date().toISOString()
    };
    filtered.unshift(updated);
    saveLocalRegisteredUsers(filtered);
  } catch (err) {
    console.warn('Error caching user locally:', err);
  }

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const userKey =
        profile.uid || (profile.email ? profile.email.replace(/[.@]/g, '_') : `user_${Date.now()}`);
      const userRef = doc(db, 'users', userKey);
      await withTimeout(
        setDoc(
          userRef,
          {
            ...profile,
            lastLogin: new Date().toISOString()
          },
          { merge: true }
        ),
        2500
      );
    } catch {
      // Graceful offline fallback
    }
  }
}

export async function getAllRegisteredUsers(): Promise<UserProfile[]> {
  const localUsers = getLocalRegisteredUsers();
  const userMap = new Map<string, UserProfile>();

  userMap.set(OWNER_EMAIL, {
    uid: 'owner_uid_warraich',
    name: 'زاہدان نصر وڑائچ (آنر)',
    email: OWNER_EMAIL,
    role: 'owner',
    lastLogin: new Date().toISOString()
  });

  localUsers.forEach(u => {
    const key = normalizeEmail(u.email) || u.uid || '';
    if (key) {
      userMap.set(key, u);
    }
  });

  if (isOwnerEmail(auth.currentUser?.email) && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const usersRef = collection(db, 'users');
      const snap = await withTimeout(getDocs(usersRef), 2500);
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data && (data.uid || data.email)) {
          const email = normalizeEmail(String(data.email || ''));
          const key = email || String(data.uid);
          if (key) {
            userMap.set(key, {
              uid: String(data.uid || key),
              name: String(data.name || email || 'User'),
              email,
              role: (data.role as UserRole) || 'driver',
              lastLogin: data.lastLogin ? String(data.lastLogin) : undefined
            });
          }
        }
      });
    } catch {
      // Offline fallback
    }
  }

  const cachedEmailsStr = getScopedItem('bilty-allowed-emails');
  if (cachedEmailsStr) {
    try {
      const emails: string[] = JSON.parse(cachedEmailsStr);
      emails.forEach(e => {
        const clean = normalizeEmail(e);
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

// ---------------------------------------------------------------------------
// Error & Activity Logs
// ---------------------------------------------------------------------------

export function logError(action: string, error: unknown, context?: unknown): void {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const errorItem = {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

  void logActivity(`Error: ${action}`, errorMsg, 'error');
}

export async function logActivity(
  action: string,
  details: string,
  category: 'auth' | 'bilty' | 'settings' | 'fleet' | 'export' | 'error' | 'sync' = 'bilty'
): Promise<void> {
  const user = auth.currentUser;
  const newLog: ActivityLogItem = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    uid: user?.uid || 'anonymous',
    email: user?.email || safeStorage.getItem('ah-gmail-user') || 'system',
    action,
    details,
    category
  };

  try {
    const localLogsStr = safeStorage.getItem('ah-activity-logs');
    const localLogs: ActivityLogItem[] = localLogsStr ? JSON.parse(localLogsStr) : [];
    const updated = [newLog, ...localLogs].slice(0, 100);
    safeStorage.setItem('ah-activity-logs', JSON.stringify(updated));
  } catch {
    // Ignore local buffer error
  }

  if (typeof navigator !== 'undefined' && navigator.onLine && user && db) {
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
    const localLogsStr = safeStorage.getItem('ah-activity-logs');
    if (localLogsStr) {
      logs = JSON.parse(localLogsStr);
    }
  } catch {
    logs = [];
  }

  if ((typeof navigator === 'undefined' || navigator.onLine) && db && auth.currentUser) {
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
        safeStorage.setItem('ah-activity-logs', JSON.stringify(logs));
      }
    } catch {
      // Fallback to local
    }
  }
  return logs;
}

// ---------------------------------------------------------------------------
// Contacts & CSV/JSON Exporters (PKT Dates #15)
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
        name: sanitized.name || d.name,
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

export function exportContactsCSV(privacyOptions?: ExportPrivacyOptions): boolean {
  const contacts = getContactList(privacyOptions);
  if (contacts.length === 0) {
    console.warn('No contact records available to export.');
    return false;
  }

  let csvContent = '\uFEFFName,Phone Number,Type,Last Used Date\n';

  contacts.forEach(c => {
    const nameSanitized = `"${c.name.replace(/"/g, '""')}"`;
    const phoneSanitized = `"${c.phone.replace(/"/g, '""')}"`;
    const typeSanitized = `"${c.type}"`;
    const dateSanitized = `"${c.lastUsed}"`;
    csvContent += `${nameSanitized},${phoneSanitized},${typeSanitized},${dateSanitized}\n`;
  });

  const fileName = `Driver_Dost_Contacts_${getPakistanDateKey()}.csv`;
  void shareOrDownloadText(csvContent, fileName, 'text/csv;charset=utf-8;', {
    title: fileName,
    dialogTitle: fileName
  });
  return true;
}

// ---------------------------------------------------------------------------
// Company Profile & Settings
// ---------------------------------------------------------------------------

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  nameUr: 'وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)',
  nameEn: 'Warraich Goods Transport Co.',
  ownerName: 'زاہدان نصر وڑائچ',
  phoneNumbers: '0300-5370443, 0339-5370443',
  headOfficeUr: 'اوکاڑہ بائی پاس، نزد 466 چوک، سمندری، فیصل آباد',
  headOfficeEn: 'Okara Bypass, Near 466 Chock, Samundri, Faisalabad',
  ntn: '7779394-1',
  taglineUr: 'ملک بھر میں ہر قسم کے سامان کی محفوظ اور قابل اعتماد ٹرانسپورٹ سروس'
};

export async function getStoredCompanyProfile(): Promise<CompanyProfile> {
  let profile = DEFAULT_COMPANY_PROFILE;
  try {
    const cached = safeStorage.getItem('ah-company-profile');
    if (cached) {
      profile = { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(cached) };
    }
  } catch {
    profile = DEFAULT_COMPANY_PROFILE;
  }

  if ((typeof navigator === 'undefined' || navigator.onLine) && db) {
    try {
      const docRef = doc(db, 'settings', 'companyProfile');
      const snap = await withTimeout(getDoc(docRef), 2000);
      if (snap.exists()) {
        profile = { ...DEFAULT_COMPANY_PROFILE, ...snap.data() };
        safeStorage.setItem('ah-company-profile', JSON.stringify(profile));
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

export async function saveCompanyProfileInFirestore(profile: CompanyProfile): Promise<void> {
  const updatedProfile: CompanyProfile = {
    ...profile,
    updatedAt: new Date().toISOString()
  };
  safeStorage.setItem('ah-company-profile', JSON.stringify(updatedProfile));
  if (typeof navigator !== 'undefined' && navigator.onLine && db) {
    try {
      const docRef = doc(db, 'settings', 'companyProfile');
      await withTimeout(setDoc(docRef, updatedProfile, { merge: true }), 3000);
    } catch (err) {
      console.warn('Failed saving company profile to Firestore:', err);
      logError('Save Company Profile', err);
    }
  }
  await logActivity(
    'Company Profile Updated',
    `Profile details updated for ${profile.nameUr || profile.nameEn}`,
    'settings'
  );
}

// ---------------------------------------------------------------------------
// Business Data Exporters & Safe Validated Restore (#14, #15)
// ---------------------------------------------------------------------------

export function exportAllBusinessDataJSON(privacyOptions?: ExportPrivacyOptions): void {
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
  const fileName = `Driver_Dost_FullBackup_${getPakistanDateKey()}.json`;
  void shareOrDownloadText(jsonStr, fileName, 'application/json', {
    title: fileName,
    dialogTitle: fileName
  });
  void logActivity('Data Backup Exported', 'Full JSON backup downloaded with privacy filters', 'export');
}

export const exportFullLocalBackup = exportAllBusinessDataJSON;

export function exportAllBiltiesCSV(privacyOptions?: ExportPrivacyOptions): boolean {
  const rawBilties = getStoredBilties();
  if (rawBilties.length === 0) {
    console.warn('No bilty records found to export.');
    return false;
  }

  const bilties = rawBilties.map(b => sanitizeBiltyRecord(b, privacyOptions));
  let csv =
    '\uFEFFBilty No,Date,Vehicle No,Driver Name,Mobile,Sender (Consignor),Sender Mobile,Sender CNIC,Receiver (Consignee),Receiver Mobile,From City,To City,Item,Qty,Weight,Total Freight,Advance,Payable\n';

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
    ]
      .map(val => `"${String(val ?? '').replace(/"/g, '""')}"`)
      .join(',');
    csv += row + '\n';
  });

  const fileName = `Driver_Dost_Bilties_${getPakistanDateKey()}.csv`;
  void shareOrDownloadText(csv, fileName, 'text/csv;charset=utf-8;', {
    title: fileName,
    dialogTitle: fileName
  });
  void logActivity('Bilties CSV Exported', `${bilties.length} bilty records exported as CSV`, 'export');
  return true;
}

export function exportAllTripsCSV(privacyOptions?: ExportPrivacyOptions): boolean {
  const rawTrips = getStoredTrips();
  if (rawTrips.length === 0) {
    console.warn('No trip records found to export.');
    return false;
  }

  const trips = rawTrips.map(t => sanitizeTripRecord(t, privacyOptions));
  let csv =
    '\uFEFFTrip ID,Trip Name,Date,Month,Distance (km),Fuel Type,Fuel Cost,Tolls,Loading,Driver Kharcha,Other,Total Expense\n';

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
    ]
      .map(val => `"${String(val ?? '').replace(/"/g, '""')}"`)
      .join(',');
    csv += row + '\n';
  });

  const fileName = `Driver_Dost_Trips_${getPakistanDateKey()}.csv`;
  void shareOrDownloadText(csv, fileName, 'text/csv;charset=utf-8;', {
    title: fileName,
    dialogTitle: fileName
  });
  void logActivity('Trips CSV Exported', `${trips.length} trip records exported as CSV`, 'export');
  return true;
}

/**
 * Schema-validated, snapshot-protected JSON restore (#14).
 * Supports both FullFleetBackup ({ metadata, data: { ... } }) and legacy flat JSON backups.
 */
function readScopedJsonArray<T = Record<string, unknown>>(baseKey: string): T[] {
  try {
    const raw = getScopedItem(baseKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function mergeJsonItemsById(
  localItems: Array<Record<string, unknown>>,
  incomingItems: Array<Record<string, unknown>>,
  mode: 'merge' | 'overwrite'
): Array<Record<string, unknown>> {
  if (mode === 'overwrite') return incomingItems;
  const map = new Map<string, Record<string, unknown>>();
  const noIdItems: Array<Record<string, unknown>> = [];

  const getTs = (item: Record<string, unknown>): number => {
    const raw = item.updatedAt ?? item.createdAt;
    if (typeof raw === 'number') return raw;
    if (!raw) return 0;
    const ms = new Date(String(raw)).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };

  for (const item of localItems) {
    if (item && item.id) map.set(String(item.id), item);
    else if (item) noIdItems.push(item);
  }
  for (const item of incomingItems) {
    if (item && item.id) {
      const idKey = String(item.id);
      const existing = map.get(idKey);
      if (!existing || getTs(item) >= getTs(existing)) {
        map.set(idKey, item);
      }
    } else if (item) {
      noIdItems.push(item);
    }
  }
  return [...Array.from(map.values()), ...noIdItems];
}

function restoreKhataScopedCollection(
  storageKey: string,
  collectionPath: string,
  incomingItems: Array<Record<string, unknown>>,
  mode: 'merge' | 'overwrite',
  scope: string
): number {
  const nowIso = new Date().toISOString();
  const prevItems = readScopedJsonArray<Record<string, unknown>>(storageKey);
  const tombKey = `khata_${collectionPath}`;
  const currentTombstones = { ...getTombstones(tombKey, scope) };

  const stampedIncoming = incomingItems
    .filter(item => item && typeof item === 'object' && item.id)
    .map(item => {
      const id = String(item.id);
      delete currentTombstones[id];
      return {
        ...item,
        id,
        updatedAt: nowIso
      };
    });

  if (mode === 'overwrite') {
    const incomingIds = new Set(stampedIncoming.map(i => String(i.id)));
    for (const prev of prevItems) {
      if (prev?.id && !incomingIds.has(String(prev.id))) {
        currentTombstones[String(prev.id)] = nowIso;
      }
    }
  }

  saveTombstones(tombKey, currentTombstones, scope);
  const finalItems =
    mode === 'overwrite' ? stampedIncoming : mergeJsonItemsById(prevItems, stampedIncoming, 'merge');
  setScopedItem(storageKey, JSON.stringify(finalItems));
  return stampedIncoming.length;
}

export function restoreFullBackupFromJson(
  jsonString: string,
  mode: 'merge' | 'overwrite' = 'merge'
): { success: boolean; message: string; count: number } {
  const scope = getActiveUserScope();
  const snapshot = {
    capturedAt: new Date().toISOString(),
    bilties: getStoredBilties(),
    trips: getStoredTrips(),
    vehicles: getStoredVehicles(),
    drivers: getStoredDrivers(),
    routes: getStoredRoutes(),
    fuelLogs: getStoredFuelLog(),
    parties: readScopedJsonArray('dd_ledger_parties'),
    partyTransactions: readScopedJsonArray('dd_ledger_party_transactions'),
    brokers: readScopedJsonArray('dd_ledger_brokers'),
    brokerTransactions: readScopedJsonArray('dd_ledger_broker_transactions'),
    vehicleExpenses: readScopedJsonArray('dd_ledger_vehicle_expenses'),
    vehicleIncomes: readScopedJsonArray('dd_ledger_vehicle_income'),
    ledgerAccounts: readScopedJsonArray('dd_khata_accounts_v2'),
    ledgerEntries: readScopedJsonArray('dd_khata_entries_v2'),
    cashbookEntries: readScopedJsonArray('dd_khata_cashbook_v2'),
    bills: readScopedJsonArray('dd_khata_bills_v2'),
    employees: readScopedJsonArray('dd_khata_employees_v2'),
    employeeEntries: readScopedJsonArray('dd_khata_employee_entries_v2'),
    receivingPoints: readScopedJsonArray('dd_khata_receiving_points_v2'),
    receivingEntries: readScopedJsonArray('dd_khata_receiving_entries_v2'),
    dailyExpenses: readScopedJsonArray('dd_khata_daily_expenses_v2'),
    company: getCachedCompanyProfile()
  };

  try {
    const rawParsed = JSON.parse(jsonString) as Record<string, unknown>;
    if (!rawParsed || typeof rawParsed !== 'object' || Array.isArray(rawParsed)) {
      return { success: false, message: 'Invalid backup file format', count: 0 };
    }

    const payload =
      rawParsed.data && typeof rawParsed.data === 'object' && !Array.isArray(rawParsed.data)
        ? (rawParsed.data as Record<string, unknown>)
        : rawParsed;

    const recognizedKeys = [
      'bilties',
      'trips',
      'vehicles',
      'drivers',
      'routes',
      'fuelLogs',
      'company',
      'parties',
      'partyTransactions',
      'brokers',
      'brokerTransactions',
      'vehicleExpenses',
      'vehicleIncomes',
      'ledgerAccounts',
      'ledgerEntries',
      'cashbookEntries',
      'bills',
      'employees',
      'employeeEntries',
      'receivingPoints',
      'receivingEntries',
      'dailyExpenses'
    ];
    const hasRecognized = recognizedKeys.some(k => k in payload);
    if (!hasRecognized) {
      return { success: false, message: 'Unrecognized backup structure: no valid collections found', count: 0 };
    }

    const arrayKeysToValidate = [
      'bilties',
      'trips',
      'vehicles',
      'drivers',
      'routes',
      'fuelLogs',
      'parties',
      'partyTransactions',
      'brokers',
      'brokerTransactions',
      'vehicleExpenses',
      'vehicleIncomes',
      'ledgerAccounts',
      'ledgerEntries',
      'cashbookEntries',
      'bills',
      'employees',
      'employeeEntries',
      'receivingPoints',
      'receivingEntries',
      'dailyExpenses'
    ];

    // Validate array types cleanly before applying any write
    for (const arrKey of arrayKeysToValidate) {
      if (arrKey in payload && payload[arrKey] !== undefined && !Array.isArray(payload[arrKey])) {
        return { success: false, message: `Malformed backup field "${arrKey}": expected list`, count: 0 };
      }
    }

    // Save Undo Restore pre-snapshot before modifying local data
    try {
      const snapStr = JSON.stringify(snapshot);
      safeStorage.setItem(`wg_v3_prerestore_snapshot_${scope}`, snapStr);
      safeStorage.setItem(`wg_v3_prerestore_available_${scope}`, snapshot.capturedAt);
    } catch {
      // ignore quota issues on secondary fallback
    }

    let restoredCount = 0;

    if (Array.isArray(payload.bilties)) {
      const incomingBilties = (payload.bilties as Array<Record<string, unknown>>).filter(
        b => b && b.biltyNo
      );
      applyRestoredCollection('bilties', incomingBilties, mode);
      restoredCount += incomingBilties.length;
    }

    if (Array.isArray(payload.trips)) {
      const incomingTrips = payload.trips as Array<Record<string, unknown>>;
      applyRestoredCollection('trips', incomingTrips, mode);
      restoredCount += incomingTrips.length;
    }

    if (Array.isArray(payload.vehicles)) {
      const incomingVehicles = payload.vehicles as Array<Record<string, unknown>>;
      applyRestoredCollection('vehicles', incomingVehicles, mode);
      restoredCount += incomingVehicles.length;
    }

    if (Array.isArray(payload.drivers)) {
      const incomingDrivers = payload.drivers as Array<Record<string, unknown>>;
      applyRestoredCollection('drivers', incomingDrivers, mode);
      restoredCount += incomingDrivers.length;
    }

    if (Array.isArray(payload.routes)) {
      const incomingRoutes = payload.routes as Array<Record<string, unknown>>;
      applyRestoredCollection('routes', incomingRoutes, mode);
      restoredCount += incomingRoutes.length;
    }

    if (Array.isArray(payload.fuelLogs)) {
      const incomingFuel = payload.fuelLogs as Array<Record<string, unknown>>;
      applyRestoredCollection('fuel', incomingFuel, mode);
      restoredCount += incomingFuel.length;
    }

    const legacyScopedMappings: Array<{ payloadKey: string; storageKey: string; existing: Array<Record<string, unknown>> }> = [
      { payloadKey: 'parties', storageKey: 'dd_ledger_parties', existing: snapshot.parties },
      { payloadKey: 'partyTransactions', storageKey: 'dd_ledger_party_transactions', existing: snapshot.partyTransactions },
      { payloadKey: 'brokers', storageKey: 'dd_ledger_brokers', existing: snapshot.brokers },
      { payloadKey: 'brokerTransactions', storageKey: 'dd_ledger_broker_transactions', existing: snapshot.brokerTransactions },
      { payloadKey: 'vehicleExpenses', storageKey: 'dd_ledger_vehicle_expenses', existing: snapshot.vehicleExpenses },
      { payloadKey: 'vehicleIncomes', storageKey: 'dd_ledger_vehicle_income', existing: snapshot.vehicleIncomes }
    ];

    for (const mapping of legacyScopedMappings) {
      if (Array.isArray(payload[mapping.payloadKey])) {
        const incoming = (payload[mapping.payloadKey] as Array<Record<string, unknown>>).filter(
          item => item && typeof item === 'object'
        );
        const merged = mergeJsonItemsById(mapping.existing, incoming, mode);
        setScopedItem(mapping.storageKey, JSON.stringify(merged));
        restoredCount += incoming.length;
      }
    }

    const khataMappings: Array<{ payloadKey: string; storageKey: string; collectionPath: string }> = [
      { payloadKey: 'ledgerAccounts', storageKey: 'dd_khata_accounts_v2', collectionPath: 'ledgerAccounts' },
      { payloadKey: 'ledgerEntries', storageKey: 'dd_khata_entries_v2', collectionPath: 'entries' },
      { payloadKey: 'cashbookEntries', storageKey: 'dd_khata_cashbook_v2', collectionPath: 'cashbookEntries' },
      { payloadKey: 'bills', storageKey: 'dd_khata_bills_v2', collectionPath: 'khataBills' },
      { payloadKey: 'employees', storageKey: 'dd_khata_employees_v2', collectionPath: 'khataEmployees' },
      { payloadKey: 'employeeEntries', storageKey: 'dd_khata_employee_entries_v2', collectionPath: 'khataEmployeeEntries' },
      { payloadKey: 'receivingPoints', storageKey: 'dd_khata_receiving_points_v2', collectionPath: 'khataReceivingPoints' },
      { payloadKey: 'receivingEntries', storageKey: 'dd_khata_receiving_entries_v2', collectionPath: 'khataReceivingEntries' },
      { payloadKey: 'dailyExpenses', storageKey: 'dd_khata_daily_expenses_v2', collectionPath: 'khataDailyExpenses' }
    ];

    for (const km of khataMappings) {
      if (Array.isArray(payload[km.payloadKey])) {
        const incoming = payload[km.payloadKey] as Array<Record<string, unknown>>;
        restoredCount += restoreKhataScopedCollection(km.storageKey, km.collectionPath, incoming, mode, scope);
      }
    }

    if (payload.company && typeof payload.company === 'object') {
      safeStorage.setItem('ah-company-profile', JSON.stringify(payload.company));
    }

    void logActivity('Backup Restored', `Restored ${restoredCount} records from backup (${mode})`, 'settings');
    return { success: true, message: 'Backup successfully restored!', count: restoredCount };
  } catch (err: unknown) {
    // Roll back pre-restore state on failure
    try {
      applyRestoredCollection('bilties', snapshot.bilties as unknown as Array<Record<string, unknown>>, 'overwrite');
      applyRestoredCollection('trips', snapshot.trips as unknown as Array<Record<string, unknown>>, 'overwrite');
      applyRestoredCollection('vehicles', snapshot.vehicles as unknown as Array<Record<string, unknown>>, 'overwrite');
      applyRestoredCollection('drivers', snapshot.drivers as unknown as Array<Record<string, unknown>>, 'overwrite');
      applyRestoredCollection('routes', snapshot.routes as unknown as Array<Record<string, unknown>>, 'overwrite');
      applyRestoredCollection('fuel', snapshot.fuelLogs as unknown as Array<Record<string, unknown>>, 'overwrite');
      setScopedItem('dd_ledger_parties', JSON.stringify(snapshot.parties));
      setScopedItem('dd_ledger_party_transactions', JSON.stringify(snapshot.partyTransactions));
      setScopedItem('dd_ledger_brokers', JSON.stringify(snapshot.brokers));
      setScopedItem('dd_ledger_broker_transactions', JSON.stringify(snapshot.brokerTransactions));
      setScopedItem('dd_ledger_vehicle_expenses', JSON.stringify(snapshot.vehicleExpenses));
      setScopedItem('dd_ledger_vehicle_income', JSON.stringify(snapshot.vehicleIncomes));
      setScopedItem('dd_khata_accounts_v2', JSON.stringify(snapshot.ledgerAccounts));
      setScopedItem('dd_khata_entries_v2', JSON.stringify(snapshot.ledgerEntries));
      setScopedItem('dd_khata_cashbook_v2', JSON.stringify(snapshot.cashbookEntries));
      setScopedItem('dd_khata_bills_v2', JSON.stringify(snapshot.bills));
      setScopedItem('dd_khata_employees_v2', JSON.stringify(snapshot.employees));
      setScopedItem('dd_khata_employee_entries_v2', JSON.stringify(snapshot.employeeEntries));
      setScopedItem('dd_khata_receiving_points_v2', JSON.stringify(snapshot.receivingPoints));
      setScopedItem('dd_khata_receiving_entries_v2', JSON.stringify(snapshot.receivingEntries));
      setScopedItem('dd_khata_daily_expenses_v2', JSON.stringify(snapshot.dailyExpenses));
      safeStorage.setItem('ah-company-profile', JSON.stringify(snapshot.company));
    } catch {
      // ignore rollback error
    }
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to restore backup',
      count: 0
    };
  }
}

export { maskCNIC, maskPhoneNumber, anonymizePersonName };
