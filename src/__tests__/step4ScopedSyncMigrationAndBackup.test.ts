import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockState = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  const writeLog: Array<{ path: string; data: unknown }> = [];
  const deleteLog: string[] = [];
  const getDocsLog: Array<{ path: string; hasIncrementalFilter: boolean }> = [];
  const permissionDeniedPaths = new Set<string>();
  const idbSnapshots = new Map<string, unknown>();

  return {
    docs,
    writeLog,
    deleteLog,
    getDocsLog,
    permissionDeniedPaths,
    idbSnapshots,
    mockUser: {
      uid: 'creator_uid_1',
      email: 'warraichgoods43@gmail.com',
      metadata: { lastSignInTime: new Date().toISOString() }
    } as { uid: string; email: string; metadata?: { lastSignInTime?: string } } | null,
    reset() {
      docs.clear();
      writeLog.length = 0;
      deleteLog.length = 0;
      getDocsLog.length = 0;
      permissionDeniedPaths.clear();
      idbSnapshots.clear();
      this.mockUser = {
        uid: 'creator_uid_1',
        email: 'warraichgoods43@gmail.com',
        metadata: { lastSignInTime: new Date().toISOString() }
      };
    }
  };
});

vi.mock('firebase/firestore', () => {
  const pathOf = (segments: string[]) => segments.join('/');
  return {
    Timestamp: {
      fromMillis: (ms: number) => ({ __type: 'Timestamp', ms, toMillis: () => ms })
    },
    serverTimestamp: () => 'SERVER_TS',
    doc: (_db: unknown, ...segments: string[]) => ({
      __type: 'doc',
      path: pathOf(segments),
      id: segments[segments.length - 1]
    }),
    collection: (_db: unknown, ...segments: string[]) => ({
      __type: 'coll',
      path: pathOf(segments)
    }),
    collectionGroup: (_db: unknown, name: string) => ({
      __type: 'collGroup',
      name
    }),
    where: (field: string, op: string, value: unknown) => ({ __type: 'where', field, op, value }),
    query: (ref: { __type: string; path?: string; name?: string }, ...clauses: Array<{ field?: string; value?: unknown }>) => ({
      __type: 'query',
      ref,
      path: ref.path,
      clauses
    }),
    getDoc: async (ref: { path: string }) => {
      for (const prefix of mockState.permissionDeniedPaths) {
        if (ref.path.startsWith(prefix)) {
          const err = new Error('Missing or insufficient permissions') as Error & { code?: string };
          err.code = 'permission-denied';
          throw err;
        }
      }
      const val = mockState.docs.get(ref.path);
      return {
        exists: () => val !== undefined,
        id: ref.path.split('/').pop(),
        ref,
        data: () => val
      };
    },
    getDocs: async (refOrQuery: {
      __type?: string;
      path?: string;
      ref?: { __type: string; path?: string; name?: string };
      clauses?: Array<{ field?: string; op?: string; value?: unknown }>;
    }) => {
      const targetPath = refOrQuery.path || refOrQuery.ref?.path || '';
      for (const prefix of mockState.permissionDeniedPaths) {
        if (targetPath.startsWith(prefix)) {
          const err = new Error('Missing or insufficient permissions') as Error & { code?: string };
          err.code = 'permission-denied';
          throw err;
        }
      }
      const clauses = Array.isArray(refOrQuery.clauses) ? refOrQuery.clauses : [];
      mockState.getDocsLog.push({
        path: targetPath || `group:${refOrQuery.ref?.name || ''}`,
        hasIncrementalFilter: clauses.some(c => c.field === 'serverUpdatedAt')
      });

      const matched: Array<{ id: string; ref: { path: string }; data: () => Record<string, unknown> }> = [];
      if (refOrQuery.ref?.__type === 'collGroup') {
        const groupName = refOrQuery.ref.name;
        const emailClause = clauses.find(c => c.field === 'email');
        for (const [k, v] of mockState.docs.entries()) {
          const parts = k.split('/');
          if (parts.length >= 2 && parts[parts.length - 2] === groupName) {
            if (!emailClause || v.email === emailClause.value) {
              matched.push({ id: parts[parts.length - 1], ref: { path: k }, data: () => v });
            }
          }
        }
      } else {
        const prefix = `${targetPath}/`;
        for (const [k, v] of mockState.docs.entries()) {
          if (k.startsWith(prefix)) {
            const rest = k.slice(prefix.length);
            if (!rest.includes('/')) {
              matched.push({ id: rest, ref: { path: k }, data: () => v });
            }
          }
        }
      }
      return {
        docs: matched,
        empty: matched.length === 0,
        size: matched.length,
        forEach: (cb: (d: (typeof matched)[number]) => void) => matched.forEach(cb)
      };
    },
    setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      for (const prefix of mockState.permissionDeniedPaths) {
        if (ref.path.startsWith(prefix)) {
          const err = new Error('Missing or insufficient permissions') as Error & { code?: string };
          err.code = 'permission-denied';
          throw err;
        }
      }
      const prev = opts?.merge ? mockState.docs.get(ref.path) || {} : {};
      const next = { ...prev, ...data };
      mockState.docs.set(ref.path, next);
      mockState.writeLog.push({ path: ref.path, data: next });
    },
    deleteDoc: async (ref: { path: string }) => {
      mockState.docs.delete(ref.path);
      mockState.deleteLog.push(ref.path);
    },
    writeBatch: () => {
      const ops: Array<() => void> = [];
      return {
        set: (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
          ops.push(() => {
            const prev = opts?.merge ? mockState.docs.get(ref.path) || {} : {};
            const next = { ...prev, ...data };
            mockState.docs.set(ref.path, next);
            mockState.writeLog.push({ path: ref.path, data: next });
          });
        },
        delete: (ref: { path: string }) => {
          ops.push(() => {
            mockState.docs.delete(ref.path);
            mockState.deleteLog.push(ref.path);
          });
        },
        commit: async () => {
          for (const op of ops) op();
        }
      };
    }
  };
});

vi.mock('../utils/firebase', () => ({
  get auth() {
    return { currentUser: mockState.mockUser };
  },
  db: {},
  deleteFirebaseUserAccount: async () => {}
}));

vi.mock('../utils/persistentStorage', async importOriginal => {
  const actual = await importOriginal<typeof import('../utils/persistentStorage')>();
  return {
    ...actual,
    savePreRestoreSnapshotIdbOnly: async (scope: string, snapshot: unknown) => {
      mockState.idbSnapshots.set(scope, snapshot);
    }
  };
});

import {
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  FULL_OWNER_PERMISSIONS,
  OWNER_EMAIL,
  getPresetPermissions
} from '../utils/authUtils';
import {
  DEFAULT_SAMUNDRI_BRANCH,
  clearLocalBranchAndAddaCaches,
  getActiveBranchId,
  setActiveBranchId,
  setCachedBranches
} from '../utils/branchContext';
import { getScopedStorageKey } from '../utils/calculator';
import { purgeAllUserFirestoreData } from '../utils/accountDeletion';
import {
  getAddaBills,
  getAddaPendingFreight,
  saveAddaBillsList,
  saveAddaPendingFreightList
} from '../utils/addaBillingStorage';
import {
  applyAuthorizedBranchBackups,
  collectAuthorizedBranchBackups
} from '../utils/branchBackupHelper';
import { restoreFullBackupFromJson } from '../utils/storage';
import {
  runOneTimeV2ToV3Migration,
  safeStorage,
  setScopedItem
} from '../utils/storageCore';
import {
  autoReconcileAllLocalToCloud,
  clampMutationIso,
  clampMutationMs,
  getSyncCursorState,
  loadBranchBiltiesFromFirestore,
  migrateHeadOfficeToBranchesHead,
  resetRemoteSyncKillSwitchCacheForTests,
  saveSyncCursorState,
  triggerFullResync
} from '../utils/storageSync';
import type { BiltyRecord, BranchConfig } from '../types';

function setupMemoryStorage(): Record<string, string> {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach(k => delete store[k]);
    },
    key: (i: number) => Object.keys(store)[i] || null,
    get length() {
      return Object.keys(store).length;
    }
  } as unknown as Storage;
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: globalThis.localStorage,
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    location: { origin: 'https://localhost', protocol: 'https:' }
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true, userAgent: 'vitest' },
    configurable: true
  });
  return store;
}

const LAHORE_BRANCH: BranchConfig = {
  id: 'lahore_badami',
  nameUr: 'لاہور برانچ',
  nameEn: 'Lahore Branch',
  addressUr: 'بادامی باغ لاہور',
  addressEn: 'Badami Bagh Lahore',
  phoneNumbers: '0301-1112233',
  ntn: '7779394-1',
  startingBiltySeq: 5001,
  ownerEmail: 'lhr.owner@gmail.com',
  isHeadOffice: false,
  active: true
};

describe('Step 4: Scoped Sync Engine, Incremental Cursors, Head Migration, Wipe-on-Revoke & Multi-Branch Backup', () => {
  let rawStore: Record<string, string>;

  beforeEach(() => {
    rawStore = setupMemoryStorage();
    mockState.reset();
    resetRemoteSyncKillSwitchCacheForTests();
    setActiveBranchId(null);
    setCachedBranches([DEFAULT_SAMUNDRI_BRANCH, LAHORE_BRANCH]);
  });

  it('uses incremental serverUpdatedAt cursor after initial sync, resets stale >80d cursor, clamps future skew, and supports triggerFullResync', async () => {
    const uid = 'creator_uid_1';
    runOneTimeV2ToV3Migration(uid);
    safeStorage.setItem('ah-gmail-user', OWNER_EMAIL);

    const trip = {
      id: 11,
      from: 'Samundri',
      to: 'Lahore',
      dist: 200,
      fuelCost: 12000,
      updatedAt: new Date(Date.now() - 60_000).toISOString()
    };
    setScopedItem('trips', JSON.stringify([trip]));

    // 1. Initial reconcile -> full read (no incremental filter yet) and records cursor
    await autoReconcileAllLocalToCloud(uid);
    expect(mockState.getDocsLog.some(l => l.path === `users/${uid}/tripsDocs` && !l.hasIncrementalFilter)).toBe(true);
    const savedCursor = getSyncCursorState(`user_${uid}`, 'trips');
    expect(savedCursor.cursorMs).toBeGreaterThan(0);

    // 2. Idle second reconcile -> uses incremental cursor query AND avoids redundant legacy rewrites
    mockState.writeLog.length = 0;
    mockState.getDocsLog.length = 0;
    await autoReconcileAllLocalToCloud(uid);
    expect(mockState.getDocsLog.some(l => l.path === `users/${uid}/tripsDocs` && l.hasIncrementalFilter)).toBe(true);
    const legacyTripWrites = mockState.writeLog.filter(w => w.path === `users/${uid}/collections/trips`);
    expect(legacyTripWrites.length).toBe(0);

    // 3. Stale cursor (>80 days old) forces full drift check without incremental filter
    const olderThan80Days = Date.now() - 85 * 24 * 60 * 60 * 1000;
    saveSyncCursorState(`user_${uid}`, 'trips', {
      cursorMs: olderThan80Days,
      lastPushedMs: olderThan80Days,
      lastFullDriftMs: Date.now()
    });
    mockState.getDocsLog.length = 0;
    await autoReconcileAllLocalToCloud(uid);
    expect(mockState.getDocsLog.some(l => l.path === `users/${uid}/tripsDocs` && !l.hasIncrementalFilter)).toBe(true);

    // 4. Future-clock skew > +60s is clamped
    const now = 1_795_600_000_000;
    const oneDayAhead = now + 24 * 60 * 60 * 1000;
    expect(clampMutationMs(oneDayAhead, now)).toBe(now + 60_000);
    expect(new Date(clampMutationIso(new Date(oneDayAhead).toISOString(), now)).getTime()).toBe(now + 60_000);

    // 5. triggerFullResync clears cursors and runs full non-incremental scan
    mockState.getDocsLog.length = 0;
    await triggerFullResync();
    expect(mockState.getDocsLog.some(l => l.path === `users/${uid}/tripsDocs` && !l.hasIncrementalFilter)).toBe(true);
  });

  it('migrates Creator personal Bilties and legacy branches/samundri into branches/head idempotently with digest check and 30-day source retention', async () => {
    const uid = 'creator_uid_1';
    safeStorage.setItem('ah-gmail-user', OWNER_EMAIL);

    // Seed source docs in users/{uid} AND branches/samundri
    mockState.docs.set(`users/${uid}/biltiesDocs/WG-1001`, {
      id: 1,
      biltyNo: 'WG-1001',
      total: 35000,
      updatedAt: '2026-11-20T10:00:00.000Z'
    });
    mockState.docs.set('branches/samundri', {
      id: 'samundri',
      nameEn: 'Head Office',
      active: true
    });
    mockState.docs.set('branches/samundri/bilties/WG-1002', {
      id: 2,
      biltyNo: 'WG-1002',
      total: 15000,
      updatedAt: '2026-11-21T10:00:00.000Z'
    });
    mockState.docs.set('branches/samundri/addaPendingFreight/fr_1', {
      id: 'fr_1',
      amount: 15000,
      status: 'pending'
    });

    // Respect remote branch sync kill-switch first
    mockState.docs.set('settings/syncConfig', { disableBranchSync: true });
    resetRemoteSyncKillSwitchCacheForTests();
    const blocked = await migrateHeadOfficeToBranchesHead(uid);
    expect(blocked.migrated).toBe(false);
    expect(blocked.skippedReason).toBe('branch_sync_disabled');

    // Clear kill-switch -> execute real migration
    mockState.docs.set('settings/syncConfig', { disableBranchSync: false });
    resetRemoteSyncKillSwitchCacheForTests();
    const res1 = await migrateHeadOfficeToBranchesHead(uid);
    expect(res1.migrated).toBe(true);
    expect(res1.copiedBilties).toBe(2);
    expect(res1.totalFreight).toBe(50000);
    expect(mockState.docs.has('branches/head/bilties/WG-1001')).toBe(true);
    expect(mockState.docs.has('branches/head/bilties/WG-1002')).toBe(true);
    expect(mockState.docs.has('branches/head/addaPendingFreight/fr_1')).toBe(true);
    expect(mockState.idbSnapshots.has(`head_migration_${uid}`)).toBe(true);

    // Source docs MUST remain completely untouched for 30-day fallback retention
    expect(mockState.docs.has(`users/${uid}/biltiesDocs/WG-1001`)).toBe(true);
    expect(mockState.docs.has('branches/samundri/bilties/WG-1002')).toBe(true);

    // Second run is idempotent without overwriting or re-copying
    const res2 = await migrateHeadOfficeToBranchesHead(uid);
    expect(res2.migrated).toBe(true);
    expect(res2.skippedReason).toBe('already_migrated');
    expect(res2.copiedBilties).toBe(0);
  });

  it('wipes local branch/Adda caches cleanly on clearLocalBranchAndAddaCaches, permission-denied, and preserves personal scope & shared docs on staff account purge', async () => {
    const staffUid = 'staff_uid_99';
    const staffEmail = 'ali.munshi@gmail.com';
    mockState.mockUser = { uid: staffUid, email: staffEmail };
    safeStorage.setItem('ah-gmail-user', staffEmail);
    setActiveBranchId(LAHORE_BRANCH.id);

    // Populate branch + Adda + cursor + offline-block keys alongside personal + guest keys
    rawStore[getScopedStorageKey('bilties', `branch_${LAHORE_BRANCH.id}`)] = JSON.stringify([{ id: 1, biltyNo: 'WG-5001' }]);
    rawStore[`wg_v3_adda_${LAHORE_BRANCH.id}_freight_pending`] = JSON.stringify([{ id: 'fr_9' }]);
    rawStore[`wg_v3_sync_cursor_branch_${LAHORE_BRANCH.id}_bilties`] = JSON.stringify({ cursorMs: 1234 });
    rawStore[`wg_offline_block_bilty_${LAHORE_BRANCH.id}`] = JSON.stringify({ start: 5001 });
    rawStore[getScopedStorageKey('trips', staffUid)] = JSON.stringify([{ id: 77, from: 'A', to: 'B' }]);
    rawStore[getScopedStorageKey('trips', 'guest')] = JSON.stringify([{ id: 88, from: 'G', to: 'H' }]);

    await clearLocalBranchAndAddaCaches();
    expect(rawStore[getScopedStorageKey('bilties', `branch_${LAHORE_BRANCH.id}`)]).toBeUndefined();
    expect(rawStore[`wg_v3_adda_${LAHORE_BRANCH.id}_freight_pending`]).toBeUndefined();
    expect(rawStore[`wg_v3_sync_cursor_branch_${LAHORE_BRANCH.id}_bilties`]).toBeUndefined();
    expect(rawStore[`wg_offline_block_bilty_${LAHORE_BRANCH.id}`]).toBeUndefined();
    expect(rawStore[getScopedStorageKey('trips', staffUid)]).toBeDefined();
    expect(rawStore[getScopedStorageKey('trips', 'guest')]).toBeDefined();

    // permission-denied while pulling branch Bilties resets activeBranchId & wipes branch caches
    setActiveBranchId(LAHORE_BRANCH.id);
    rawStore[getScopedStorageKey('bilties', `branch_${LAHORE_BRANCH.id}`)] = JSON.stringify([{ id: 1, biltyNo: 'WG-5001' }]);
    mockState.permissionDeniedPaths.add(`branches/${LAHORE_BRANCH.id}`);
    await loadBranchBiltiesFromFirestore(LAHORE_BRANCH.id);
    expect(getActiveBranchId()).toBeNull();
    expect(rawStore[getScopedStorageKey('bilties', `branch_${LAHORE_BRANCH.id}`)]).toBeUndefined();

    // Staff account deletion deletes membership doc while keeping shared branch Bilty & Adda intact
    mockState.permissionDeniedPaths.clear();
    mockState.docs.set(`branches/${LAHORE_BRANCH.id}/members/${staffEmail}`, { email: staffEmail, status: 'active' });
    mockState.docs.set(`branches/${LAHORE_BRANCH.id}/bilties/WG-5001`, { id: 1, biltyNo: 'WG-5001' });
    mockState.docs.set(`branches/${LAHORE_BRANCH.id}/addaPendingFreight/fr_9`, { id: 'fr_9', amount: 5000 });
    await purgeAllUserFirestoreData(staffUid);
    expect(mockState.docs.has(`branches/${LAHORE_BRANCH.id}/members/${staffEmail}`)).toBe(false);
    expect(mockState.docs.has(`branches/${LAHORE_BRANCH.id}/bilties/WG-5001`)).toBe(true);
    expect(mockState.docs.has(`branches/${LAHORE_BRANCH.id}/addaPendingFreight/fr_9`)).toBe(true);
  });

  it('enforces role-scoped multi-branch backup & restore (Creator all, Branch Owner own branch only, Staff/Guest skipped) and strips legalVault', async () => {
    const sampleHeadBilty: BiltyRecord = {
      id: 1,
      biltyNo: 'WG-1001',
      date: '2026-11-24',
      branchId: DEFAULT_HEAD_OFFICE_BRANCH_ID,
      senderName: 'Alpha',
      senderMobile: '03001111111',
      senderCnic: '33301-1234567-1',
      receiverName: 'Beta',
      receiverMobile: '03002222222',
      sendingCity: 'Samundri',
      receivingCity: 'Karachi',
      vehicleNo: 'FSB-111',
      driverName: 'Akram',
      mobileNo: '03003333333',
      itemDescription: 'Grain',
      qty: '10',
      weight: '500kg',
      total: 25000,
      advance: 5000,
      payable: 20000,
      createdAt: '2026-11-24T00:00:00Z',
      legalVault: { driverPhoto: 'data:image/jpeg;base64,secret_cnic_1' }
    };
    const sampleLhrBilty: BiltyRecord = {
      ...sampleHeadBilty,
      id: 2,
      biltyNo: 'WG-5001',
      branchId: LAHORE_BRANCH.id,
      legalVault: undefined
    };

    // Seed Creator personal/head Bilties + Lahore branch Bilties + Adda Freight
    safeStorage.setItem('ah-gmail-user', OWNER_EMAIL);
    rawStore[getScopedStorageKey('bilties', 'creator_uid_1')] = JSON.stringify([sampleHeadBilty]);
    rawStore[getScopedStorageKey('bilties', `branch_${LAHORE_BRANCH.id}`)] = JSON.stringify([sampleLhrBilty]);
    saveAddaPendingFreightList(LAHORE_BRANCH.id, [
      {
        id: 'fr_lhr_1',
        branchId: LAHORE_BRANCH.id,
        biltyNo: 'WG-5001',
        partyName: 'Lahore Traders',
        partyMobile: '03011234567',
        amount: 12000,
        status: 'pending',
        date: '2026-11-24',
        createdAt: '2026-11-24T00:00:00Z',
        updatedAt: '2026-11-24T00:00:00Z'
      }
    ]);
    saveAddaBillsList(LAHORE_BRANCH.id, []);

    // Creator export collects BOTH head and lahore_badami, with legalVault stripped
    const creatorBackups = collectAuthorizedBranchBackups();
    expect(Object.keys(creatorBackups).sort()).toEqual(['head', LAHORE_BRANCH.id].sort());
    expect(creatorBackups.head.bilties[0].legalVault).toBeUndefined();
    expect(creatorBackups[LAHORE_BRANCH.id].addaFreight).toHaveLength(1);

    const exportJson = JSON.stringify({ branchBackups: creatorBackups });

    // Branch Owner (Lahore) sees/restores ONLY lahore_badami, ignoring head
    mockState.mockUser = { uid: 'lhr_owner_uid', email: 'lhr.owner@gmail.com' };
    safeStorage.setItem('ah-gmail-user', 'lhr.owner@gmail.com');
    setActiveBranchId(LAHORE_BRANCH.id);
    safeStorage.setItem(
      'wg_user_branch_access_v1_lhr.owner@gmail.com',
      JSON.stringify({
        email: 'lhr.owner@gmail.com',
        branchId: LAHORE_BRANCH.id,
        presetRole: 'branch_owner',
        permissions: FULL_OWNER_PERMISSIONS,
        status: 'active'
      })
    );

    const ownerCollected = collectAuthorizedBranchBackups();
    expect(Object.keys(ownerCollected)).toEqual([LAHORE_BRANCH.id]);

    // Clear Lahore Adda locally and restore as Branch Owner -> head skipped, lahore_badami restored
    saveAddaPendingFreightList(LAHORE_BRANCH.id, []);
    const ownerRestore = applyAuthorizedBranchBackups(creatorBackups, 'overwrite');
    expect(ownerRestore.restoredBranches).toBe(1);
    expect(ownerRestore.skippedUnauthorizedBranches).toBe(1);
    expect(getAddaPendingFreight(LAHORE_BRANCH.id)).toHaveLength(1);
    expect(getAddaBills(LAHORE_BRANCH.id)).toEqual([]);

    // Regular Munshi / Guest ignores branchBackups inside restoreFullBackupFromJson
    mockState.mockUser = { uid: 'munshi_uid', email: 'munshi@gmail.com' };
    safeStorage.setItem('ah-gmail-user', 'munshi@gmail.com');
    safeStorage.setItem(
      'wg_user_branch_access_v1_munshi@gmail.com',
      JSON.stringify({
        email: 'munshi@gmail.com',
        branchId: LAHORE_BRANCH.id,
        presetRole: 'munshi',
        permissions: getPresetPermissions('munshi'),
        status: 'active'
      })
    );
    saveAddaPendingFreightList(LAHORE_BRANCH.id, []);
    const munshiRestore = await restoreFullBackupFromJson(exportJson);
    expect(munshiRestore.success).toBe(true);
    expect(getAddaPendingFreight(LAHORE_BRANCH.id)).toHaveLength(0);
  });
});
