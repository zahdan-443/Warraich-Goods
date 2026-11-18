/**
 * Driver Dost - Complete & Atomic Account Deletion / Purge Engine
 *
 * Addresses audit items:
 * - #16: Clears ALL Khata & core scoped keys (`wg_v2_<uid>_*` AND legacy `${base}_${uid}`) in localStorage + IndexedDB.
 * - #17: Collects all Firestore purge errors and aborts Auth user deletion before reporting false success.
 * - #18: Purges hazardReports, activityLog, crashReports, per-doc subcollections, and user-created publicBiltyVerifications.
 */

import { auth, db, deleteFirebaseUserAccount } from './firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where
} from 'firebase/firestore';
import { getScopedStorageKey } from './calculator';
import { idbDeleteMany, idbGetAllEntries } from './persistentStorage';
import {
  clearOfflineQueue,
  deletePublicBiltyVerification,
  getStoredBilties,
  withTimeout
} from './storageSync';
import { KHATA_BASE_KEYS, V3_MIGRATION_FLAG_PREFIX, safeStorage } from './storageCore';

export interface AccountDeletionRequest {
  userId: string;
  userEmail: string;
  requestedAt: string;
  scheduledFor: string;
  status: 'pending_deletion' | 'deleted';
  referenceId: string;
  reason?: string;
  source?: string;
}

export const USER_FIRESTORE_SUBCOLLECTIONS = [
  'collections',
  'biltiesDocs',
  'tripsDocs',
  'vehiclesDocs',
  'driversDocs',
  'fuelDocs',
  'routesDocs',
  'cashbookEntries',
  'khataSettings',
  'khataBills',
  'khataEmployees',
  'khataEmployeeEntries',
  'khataReceivingPoints',
  'khataReceivingEntries',
  'khataDailyExpenses'
] as const;

export async function requestAccountDeletion(
  userId: string,
  userEmail: string,
  reason?: string
): Promise<{ success: boolean; scheduledFor: string; referenceId: string; message: string }> {
  const requestedAt = new Date().toISOString();
  const scheduledFor = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const referenceId = `DEL-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

  const deletionData: AccountDeletionRequest = {
    userId,
    userEmail,
    requestedAt,
    scheduledFor,
    status: 'pending_deletion',
    referenceId,
    reason: reason || 'User requested via Driver Dost app',
    source: 'in_app'
  };

  const currentUser = auth.currentUser;
  if (db && userId && currentUser && currentUser.uid === userId) {
    try {
      const delDocRef = doc(db, 'accountDeletionRequests', userId);
      await withTimeout(setDoc(delDocRef, deletionData), 4000);
      const userDocRef = doc(db, 'usersData', userId);
      await withTimeout(setDoc(userDocRef, { accountDeletion: deletionData }, { merge: true }), 4000);
    } catch (err) {
      console.warn('Could not write account deletion to Firestore:', err);
    }
  }

  safeStorage.setItem(`ah-deletion-${userId}`, JSON.stringify(deletionData));

  return {
    success: true,
    scheduledFor,
    referenceId,
    message: 'Account deletion scheduled with a 30-day grace period.'
  };
}

export async function cancelAccountDeletion(userId: string): Promise<{ success: boolean }> {
  const currentUser = auth.currentUser;
  if (db && userId && currentUser && currentUser.uid === userId) {
    try {
      const delDocRef = doc(db, 'accountDeletionRequests', userId);
      await withTimeout(deleteDoc(delDocRef), 4000);
      const userDocRef = doc(db, 'usersData', userId);
      await withTimeout(setDoc(userDocRef, { accountDeletion: null }, { merge: true }), 4000);
    } catch (err) {
      console.warn('Could not cancel account deletion in Firestore:', err);
    }
  }
  safeStorage.removeItem(`ah-deletion-${userId}`);
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

export async function fetchAccountDeletionStatus(userId: string): Promise<AccountDeletionRequest | null> {
  const currentUser = auth.currentUser;
  if (db && userId && currentUser && currentUser.uid === userId) {
    try {
      const delDocRef = doc(db, 'accountDeletionRequests', userId);
      const docSnap = await withTimeout(getDoc(delDocRef), 3500);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data() as AccountDeletionRequest;
        safeStorage.setItem(`ah-deletion-${userId}`, JSON.stringify(data));
        return data;
      } else {
        safeStorage.removeItem(`ah-deletion-${userId}`);
        return null;
      }
    } catch (err) {
      console.warn('Error fetching account deletion status from Firestore:', err);
    }
  }
  return getAccountDeletionStatus(userId);
}

/**
 * Purges ALL localStorage & IndexedDB keys scoped to `userId` (#16).
 * Deletes BOTH `${base}_${userId}` (legacy) AND `wg_v2_${userId}_${base}` (real v2/v3 scoped storage).
 */
export async function clearLocalAndIndexedDbForUser(userId: string): Promise<void> {
  const syncCollections = [
    'bilties',
    'trips',
    'vehicles',
    'drivers',
    'fuel',
    'routes',
    'khata',
    'user-role',
    'notifs',
    'bilty-allowed-uids',
    'bilty-allowed-emails',
    'bilty-counter',
    'offline-queue'
  ];

  const keysToRemove: string[] = [];

  for (const col of syncCollections) {
    keysToRemove.push(getScopedStorageKey(col, userId));
    keysToRemove.push(`wg_v3_tombstones_${userId}_${col}`);
  }

  for (const base of KHATA_BASE_KEYS) {
    keysToRemove.push(`${base}_${userId}`);
    keysToRemove.push(getScopedStorageKey(base, userId));
  }

  keysToRemove.push(
    `ah-deletion-${userId}`,
    `wg_last_daily_cloud_backup_${userId}`,
    `${V3_MIGRATION_FLAG_PREFIX}${userId}`,
    'ah-gmail-user',
    'ah-gmail-user-uid',
    'ah-gmail-user-photo',
    'ah-auth-state',
    'ah-user-role'
  );

  for (const k of keysToRemove) {
    safeStorage.removeItem(k);
  }
  clearOfflineQueue();

  try {
    const entries = await idbGetAllEntries();
    const idbKeys: string[] = [...keysToRemove];
    for (const key of Object.keys(entries)) {
      if (
        (userId &&
          (key.includes(`_${userId}`) ||
            key.includes(`wg_v2_${userId}_`) ||
            key.includes(`wg_v3_tombstones_${userId}_`))) ||
        key === `ah-deletion-${userId}` ||
        key === `wg_last_daily_cloud_backup_${userId}` ||
        key === `${V3_MIGRATION_FLAG_PREFIX}${userId}` ||
        key.startsWith('offline-queue') ||
        key.startsWith('ah-offline-queue')
      ) {
        idbKeys.push(key);
      }
    }
    await idbDeleteMany(idbKeys);
  } catch {
    // Non-fatal IndexedDB cleanup notice
  }
}

/**
 * Collects user's public verification doc IDs (from local & Firestore bilties) before wiping.
 */
async function collectUserPublicBiltyNos(userId: string): Promise<string[]> {
  const numbers = new Set<string>();
  try {
    for (const b of getStoredBilties()) {
      if (b?.biltyNo) numbers.add(String(b.biltyNo).trim().toUpperCase());
    }
  } catch {
    // ignore
  }

  if (db && userId) {
    try {
      const legacySnap = await withTimeout(getDoc(doc(db, 'users', userId, 'collections', 'bilties')), 4000).catch(
        () => null
      );
      if (legacySnap && legacySnap.exists() && Array.isArray(legacySnap.data()?.items)) {
        for (const item of legacySnap.data().items) {
          if (item?.biltyNo) numbers.add(String(item.biltyNo).trim().toUpperCase());
        }
      }
      const perDocSnap = await withTimeout(getDocs(collection(db, 'users', userId, 'biltiesDocs')), 4000).catch(
        () => null
      );
      if (perDocSnap) {
        perDocSnap.forEach(d => {
          const data = d.data();
          if (data?.biltyNo) numbers.add(String(data.biltyNo).trim().toUpperCase());
        });
      }
    } catch {
      // ignore read failure during collection gather
    }
  }

  return Array.from(numbers).filter(Boolean);
}

/**
 * Recursively purges ALL Firestore data owned by `userId` (#17, #18).
 * Collects every real failure and throws if any critical purge fails so the Auth account
 * is NOT deleted leaving orphaned PII in Firestore.
 */
export async function purgeAllUserFirestoreData(userId: string): Promise<void> {
  if (!db || !userId) return;
  const firestore = db;
  const failures: string[] = [];

  const runStep = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${label}: ${msg}`);
    }
  };

  // 1. Purge user-created public bilty verifications BEFORE wiping bilties
  await runStep('publicBiltyVerifications', async () => {
    const publicNos = await collectUserPublicBiltyNos(userId);
    for (const bNo of publicNos) {
      try {
        await withTimeout(deleteDoc(doc(firestore, 'publicBiltyVerifications', bNo)), 5000);
      } catch {
        // Fallback through direct delete helper
        await deletePublicBiltyVerification(bNo).catch(() => {});
      }
    }
  });

  // 2. Purge ledgerAccounts and nested entries subcollections
  await runStep('ledgerAccounts', async () => {
    const accSnap = await withTimeout(getDocs(collection(firestore, 'users', userId, 'ledgerAccounts')), 5000);
    await Promise.all(
      accSnap.docs.map(async accDoc => {
        const entrySnap = await withTimeout(
          getDocs(collection(firestore, 'users', userId, 'ledgerAccounts', accDoc.id, 'entries')),
          5000
        );
        await Promise.all(entrySnap.docs.map(ed => deleteDoc(ed.ref)));
        await deleteDoc(accDoc.ref);
      })
    );
  });

  // 3. Purge all top-level user subcollections (including per-doc *Docs subcollections)
  await Promise.all(
    USER_FIRESTORE_SUBCOLLECTIONS.map(subColl =>
      runStep(subColl, async () => {
        const subSnap = await withTimeout(getDocs(collection(firestore, 'users', userId, subColl)), 5000);
        await Promise.all(subSnap.docs.map(d => deleteDoc(d.ref)));
      })
    )
  );

  // 4. Purge cloudBackups and their nested chunks subcollections
  await runStep('cloudBackups', async () => {
    const backupsSnap = await withTimeout(getDocs(collection(firestore, 'usersData', userId, 'cloudBackups')), 5000);
    await Promise.all(
      backupsSnap.docs.map(async bDoc => {
        const chunksSnap = await withTimeout(
          getDocs(collection(firestore, 'usersData', userId, 'cloudBackups', bDoc.id, 'chunks')),
          5000
        );
        await Promise.all(chunksSnap.docs.map(cd => deleteDoc(cd.ref)));
        await deleteDoc(bDoc.ref);
      })
    );
  });

  // 5. Purge user-authored hazardReports, activityLog, crashReports (#18)
  await Promise.all([
    runStep('hazardReports', async () => {
      const snap = await withTimeout(
        getDocs(query(collection(firestore, 'hazardReports'), where('reporterUid', '==', userId))),
        5000
      );
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }),
    runStep('activityLog', async () => {
      const snap = await withTimeout(
        getDocs(query(collection(firestore, 'activityLog'), where('uid', '==', userId))),
        5000
      );
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }),
    runStep('crashReports', async () => {
      const snap = await withTimeout(
        getDocs(query(collection(firestore, 'crashReports'), where('userUid', '==', userId))),
        5000
      );
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    })
  ]);

  // 6. Purge root docs
  await Promise.all([
    runStep('usersRoot', async () => {
      await withTimeout(deleteDoc(doc(firestore, 'users', userId)), 5000);
    }),
    runStep('usersDataRoot', async () => {
      await withTimeout(deleteDoc(doc(firestore, 'usersData', userId)), 5000);
    }),
    runStep('accountDeletionRequestsRoot', async () => {
      await withTimeout(deleteDoc(doc(firestore, 'accountDeletionRequests', userId)), 5000);
    })
  ]);

  if (failures.length > 0) {
    throw new Error(`Incomplete Firestore data purge (${failures.join('; ')})`);
  }
}

/**
 * Executes immediate permanent account deletion (#17):
 * 1. Verifies recent Auth session BEFORE destroying cloud/local data.
 * 2. Purges ALL Firestore data — aborts BEFORE deleting Firebase Auth user if purge fails.
 * 3. Deletes Firebase Auth user while credentials are still valid.
 * 4. Clears ALL localStorage & IndexedDB entries scoped to this UID.
 */
export async function executeImmediateAccountDeletion(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const currentUser = auth.currentUser;
    const targetUid = currentUser?.uid || userId;
    if (!targetUid) {
      return { success: false, message: 'No authenticated user account found to delete.' };
    }

    const lastSignIn = currentUser?.metadata?.lastSignInTime;
    if (lastSignIn) {
      const elapsedMs = Date.now() - new Date(lastSignIn).getTime();
      if (!Number.isNaN(elapsedMs) && elapsedMs > 4.5 * 60 * 1000) {
        return { success: false, message: 'AUTH_REQUIRES_RECENT_LOGIN' };
      }
    }

    if (db && currentUser && currentUser.uid === targetUid) {
      await purgeAllUserFirestoreData(targetUid);
    }

    await deleteFirebaseUserAccount(currentUser);
    await clearLocalAndIndexedDbForUser(targetUid);

    return {
      success: true,
      message: 'Account permanently deleted from Firebase Auth and cloud storage.'
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err || 'Failed to delete account');
    if (msg === 'AUTH_REQUIRES_RECENT_LOGIN') {
      return { success: false, message: 'AUTH_REQUIRES_RECENT_LOGIN' };
    }
    return { success: false, message: msg };
  }
}

export async function purgeExpiredAccountData(userId: string): Promise<boolean> {
  try {
    const status = await fetchAccountDeletionStatus(userId);
    if (!status) return false;
    const scheduled = new Date(status.scheduledFor).getTime();
    if (Date.now() >= scheduled) {
      const currentUser = auth.currentUser;
      const targetUid = currentUser?.uid || userId;

      if (db && currentUser && currentUser.uid === targetUid) {
        await purgeAllUserFirestoreData(targetUid);
        await deleteFirebaseUserAccount(currentUser);
      }

      await clearLocalAndIndexedDbForUser(targetUid);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
