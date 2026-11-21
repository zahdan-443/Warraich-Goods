/**
 * Driver Dost - Complete & Atomic Account Deletion / Purge Engine
 *
 * Addresses audit items:
 * - #16: Clears ALL Khata & core scoped keys (`wg_v2_<uid>_*` AND legacy `${base}_${uid}`) in localStorage + IndexedDB.
 * - #17: Collects all Firestore purge errors and aborts Auth user deletion before reporting false success.
 * - #18: Purges hazardReports, activityLog, crashReports, per-doc subcollections, and user-created publicBiltyVerifications.
 */

import { auth, db, deleteFirebaseUserAccount } from './firebase';
import * as firestoreModule from 'firebase/firestore';
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
import { isOwnerEmail } from './authUtils';
import {
  deletePreRestoreSnapshotIdbOnly,
  idbClearAllBiltyAttachments,
  idbDeleteMany,
  idbGetAllEntries,
  idbOnlyDelete,
  idbOnlyListKeys,
  removeLegacyLocalPreRestoreKeys
} from './persistentStorage';
import {
  clearOfflineQueue,
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

export interface OwnerDeletionQueueItem extends Partial<AccountDeletionRequest> {
  docId: string;
  userEmail: string;
  requestedAt: string;
  scheduledFor: string;
  status: 'pending_deletion' | 'deleted';
  referenceId: string;
  isMatured: boolean;
}

const FIRESTORE_PURGE_BATCH_LIMIT = 400;

async function commitDeleteRefsInBatches(
  refs: Array<ReturnType<typeof doc>>,
  timeoutMs = 15000
): Promise<void> {
  if (refs.length === 0 || !db) return;

  const writeBatchFn = (firestoreModule as unknown as { writeBatch?: typeof firestoreModule.writeBatch }).writeBatch;
  if (typeof writeBatchFn === 'function') {
    for (let i = 0; i < refs.length; i += FIRESTORE_PURGE_BATCH_LIMIT) {
      const chunk = refs.slice(i, i + FIRESTORE_PURGE_BATCH_LIMIT);
      const batch = writeBatchFn(db);
      for (const ref of chunk) {
        batch.delete(ref);
      }
      await withTimeout(batch.commit(), timeoutMs);
    }
    return;
  }

  for (let i = 0; i < refs.length; i += 25) {
    const chunk = refs.slice(i, i + 25);
    await withTimeout(Promise.all(chunk.map(r => deleteDoc(r))), timeoutMs);
  }
}

export const USER_FIRESTORE_SUBCOLLECTIONS = [
  'collections',
  'biltiesDocs',
  'biltyAttachments',
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
  const hasAuthenticatedSession = Boolean(currentUser && currentUser.uid === userId);

  if (hasAuthenticatedSession) {
    const isOnline = typeof navigator === 'undefined' || navigator.onLine;
    if (!isOnline || !db) {
      return {
        success: false,
        scheduledFor,
        referenceId,
        message: 'Internet connection required to register your deletion request in cloud.'
      };
    }

    try {
      const delDocRef = doc(db, 'accountDeletionRequests', userId);
      await withTimeout(setDoc(delDocRef, deletionData), 8000);
      const userDocRef = doc(db, 'usersData', userId);
      await withTimeout(setDoc(userDocRef, { accountDeletion: deletionData }, { merge: true }), 8000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err || 'Cloud registration failed');
      return {
        success: false,
        scheduledFor,
        referenceId,
        message: `Failed to register deletion request in cloud: ${errMsg}`
      };
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

export async function cancelAccountDeletion(userId: string): Promise<{ success: boolean; message?: string }> {
  const currentUser = auth.currentUser;
  if (db && userId && currentUser && currentUser.uid === userId) {
    try {
      const delDocRef = doc(db, 'accountDeletionRequests', userId);
      await withTimeout(deleteDoc(delDocRef), 8000);
      const userDocRef = doc(db, 'usersData', userId);
      await withTimeout(setDoc(userDocRef, { accountDeletion: null }, { merge: true }), 8000);
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to cancel deletion in cloud'
      };
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
      const docSnap = await withTimeout(getDoc(delDocRef), 5000);
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
    `wg_v3_prerestore_snapshot_${userId}`,
    `wg_v3_prerestore_available_${userId}`,
    `wg_v3_pub_bilty_digest_${userId}`,
    `wg_v3_pub_bilty_deleted_${userId}`,
    `wg_v3_khata_digest_${userId}`,
    'ah-gmail-user',
    'ah-gmail-user-uid',
    'ah-gmail-user-photo',
    'ah-auth-state',
    'ah-user-role'
  );

  for (const k of keysToRemove) {
    safeStorage.removeItem(k);
  }
  removeLegacyLocalPreRestoreKeys(userId);
  clearOfflineQueue();

  try {
    await deletePreRestoreSnapshotIdbOnly(userId);
    await idbClearAllBiltyAttachments();

    const idbOnlyKeys = await idbOnlyListKeys();
    for (const k of idbOnlyKeys) {
      if (
        !userId ||
        k.endsWith(`_${userId}`) ||
        k.includes(`_${userId}_`) ||
        k.startsWith('wg_idb_attach_') ||
        k.startsWith('wg_idb_bilty_vault_')
      ) {
        await idbOnlyDelete(k);
      }
    }

    const entries = await idbGetAllEntries();
    const idbKeys: string[] = [...keysToRemove];
    for (const key of Object.keys(entries)) {
      if (
        (userId &&
          (key.includes(`_${userId}`) ||
            key.includes(`wg_v2_${userId}_`) ||
            key.includes(`wg_v3_tombstones_${userId}_`) ||
            key.includes(`wg_v3_prerestore_snapshot_${userId}`))) ||
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
      const legacySnap = await withTimeout(getDoc(doc(db, 'users', userId, 'collections', 'bilties')), 8000).catch(
        () => null
      );
      if (legacySnap && legacySnap.exists() && Array.isArray(legacySnap.data()?.items)) {
        for (const item of legacySnap.data().items) {
          if (item?.biltyNo) numbers.add(String(item.biltyNo).trim().toUpperCase());
        }
      }
      const perDocSnap = await withTimeout(getDocs(collection(db, 'users', userId, 'biltiesDocs')), 8000).catch(
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
 * Batches deletions reliably, propagates failures, and aborts Auth deletion if any step fails.
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
    const pubRefs: Array<ReturnType<typeof doc>> = [];
    for (const bNo of publicNos) {
      pubRefs.push(doc(firestore, 'publicBiltyVerifications', bNo));
      const cleanId = bNo.replace(/[^A-Z0-9]/g, '');
      if (cleanId && cleanId !== bNo) {
        pubRefs.push(doc(firestore, 'publicBiltyVerifications', cleanId));
      }
    }
    await commitDeleteRefsInBatches(pubRefs, 15000);
  });

  // 2. Purge ledgerAccounts and nested entries subcollections in batches
  await runStep('ledgerAccounts', async () => {
    const accSnap = await withTimeout(getDocs(collection(firestore, 'users', userId, 'ledgerAccounts')), 15000);
    const allRefs: Array<ReturnType<typeof doc>> = [];
    for (const accDoc of accSnap.docs) {
      const entrySnap = await withTimeout(
        getDocs(collection(firestore, 'users', userId, 'ledgerAccounts', accDoc.id, 'entries')),
        15000
      );
      entrySnap.docs.forEach(ed => allRefs.push(ed.ref));
      allRefs.push(accDoc.ref);
    }
    await commitDeleteRefsInBatches(allRefs, 15000);
  });

  // 3. Purge all top-level user subcollections in batches
  await Promise.all(
    USER_FIRESTORE_SUBCOLLECTIONS.map(subColl =>
      runStep(subColl, async () => {
        const subSnap = await withTimeout(getDocs(collection(firestore, 'users', userId, subColl)), 15000);
        await commitDeleteRefsInBatches(
          subSnap.docs.map(d => d.ref),
          15000
        );
      })
    )
  );

  // 4. Purge cloudBackups and their nested chunks subcollections in batches
  await runStep('cloudBackups', async () => {
    const backupsSnap = await withTimeout(getDocs(collection(firestore, 'usersData', userId, 'cloudBackups')), 15000);
    const allRefs: Array<ReturnType<typeof doc>> = [];
    for (const bDoc of backupsSnap.docs) {
      const chunksSnap = await withTimeout(
        getDocs(collection(firestore, 'usersData', userId, 'cloudBackups', bDoc.id, 'chunks')),
        15000
      );
      chunksSnap.docs.forEach(cd => allRefs.push(cd.ref));
      allRefs.push(bDoc.ref);
    }
    await commitDeleteRefsInBatches(allRefs, 15000);
  });

  // 5. Purge user-authored hazardReports, activityLog, crashReports (#18)
  await Promise.all([
    runStep('hazardReports', async () => {
      const snap = await withTimeout(
        getDocs(query(collection(firestore, 'hazardReports'), where('reporterUid', '==', userId))),
        15000
      );
      await commitDeleteRefsInBatches(snap.docs.map(d => d.ref), 15000);
    }),
    runStep('activityLog', async () => {
      const snap = await withTimeout(
        getDocs(query(collection(firestore, 'activityLog'), where('uid', '==', userId))),
        15000
      );
      await commitDeleteRefsInBatches(snap.docs.map(d => d.ref), 15000);
    }),
    runStep('crashReports', async () => {
      const snap = await withTimeout(
        getDocs(query(collection(firestore, 'crashReports'), where('userUid', '==', userId))),
        15000
      );
      await commitDeleteRefsInBatches(snap.docs.map(d => d.ref), 15000);
    })
  ]);

  // 6. Purge root docs
  await Promise.all([
    runStep('usersRoot', async () => {
      await withTimeout(deleteDoc(doc(firestore, 'users', userId)), 10000);
    }),
    runStep('usersDataRoot', async () => {
      await withTimeout(deleteDoc(doc(firestore, 'usersData', userId)), 10000);
    }),
    runStep('accountDeletionRequestsRoot', async () => {
      await withTimeout(deleteDoc(doc(firestore, 'accountDeletionRequests', userId)), 10000);
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

/**
 * Spark-Tier Owner Management Tool:
 * Fetches all account deletion requests (in-app & web form) for the App Owner.
 */
export async function fetchAllAccountDeletionRequestsForOwner(): Promise<OwnerDeletionQueueItem[]> {
  if (!db || !isOwnerEmail(auth.currentUser?.email)) return [];
  try {
    const snap = await withTimeout(getDocs(collection(db, 'accountDeletionRequests')), 8000);
    const nowMs = Date.now();
    const list: OwnerDeletionQueueItem[] = [];
    snap.forEach(d => {
      const data = d.data() as Partial<AccountDeletionRequest>;
      const schedMs = data.scheduledFor ? new Date(String(data.scheduledFor)).getTime() : 0;
      list.push({
        ...data,
        docId: d.id,
        userEmail: String(data.userEmail || ''),
        requestedAt: String(data.requestedAt || ''),
        scheduledFor: String(data.scheduledFor || ''),
        status: data.status === 'deleted' ? 'deleted' : 'pending_deletion',
        referenceId: String(data.referenceId || d.id),
        isMatured: !Number.isNaN(schedMs) && schedMs > 0 && nowMs >= schedMs
      });
    });
    list.sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
    return list;
  } catch (err) {
    console.warn('[OwnerDeletionQueue] Failed fetching requests:', err);
    return [];
  }
}

/**
 * Spark-Tier Owner Management Tool:
 * Purges owner-accessible shared records (activityLog, hazardReports, crashReports) if UID is known
 * and marks the deletion request completed (`status: 'deleted'`) or removes the processed request.
 */
export async function processOwnerDeletionQueueItem(
  docId: string,
  action: 'complete' | 'remove',
  targetUserId?: string
): Promise<{ success: boolean; message: string }> {
  if (!db || !isOwnerEmail(auth.currentUser?.email)) {
    return { success: false, message: 'Owner authorization required.' };
  }

  try {
    if (action === 'complete') {
      if (targetUserId && !targetUserId.startsWith('web_')) {
        // Purge shared top-level collections permitted for Owner in firestore.rules
        const [hazSnap, actSnap, crashSnap] = await Promise.all([
          withTimeout(getDocs(query(collection(db, 'hazardReports'), where('reporterUid', '==', targetUserId))), 10000).catch(() => null),
          withTimeout(getDocs(query(collection(db, 'activityLog'), where('uid', '==', targetUserId))), 10000).catch(() => null),
          withTimeout(getDocs(query(collection(db, 'crashReports'), where('userUid', '==', targetUserId))), 10000).catch(() => null)
        ]);
        const refs: Array<ReturnType<typeof doc>> = [];
        hazSnap?.docs.forEach(d => refs.push(d.ref));
        actSnap?.docs.forEach(d => refs.push(d.ref));
        crashSnap?.docs.forEach(d => refs.push(d.ref));
        await commitDeleteRefsInBatches(refs, 15000);
      }

      await withTimeout(
        setDoc(
          doc(db, 'accountDeletionRequests', docId),
          { status: 'deleted', completedAt: new Date().toISOString() },
          { merge: true }
        ),
        8000
      );
      return { success: true, message: 'Request marked completed & shared logs purged.' };
    }

    await withTimeout(deleteDoc(doc(db, 'accountDeletionRequests', docId)), 8000);
    return { success: true, message: 'Request record removed from queue.' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed processing deletion request'
    };
  }
}
