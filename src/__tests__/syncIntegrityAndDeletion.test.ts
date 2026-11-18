import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockState = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  const writeLog: Array<{ path: string; data: unknown }> = [];
  const deleteLog: string[] = [];
  const failDeletePaths = new Set<string>();
  const permissionDeniedPaths = new Set<string>();
  const failNetworkPaths = new Set<string>();
  let authDeletedCount = 0;

  return {
    docs,
    writeLog,
    deleteLog,
    failDeletePaths,
    permissionDeniedPaths,
    failNetworkPaths,
    mockUser: {
      uid: 'uid_test_123',
      email: 'warraichgoods43@gmail.com',
      metadata: { lastSignInTime: new Date().toISOString() }
    } as { uid: string; email: string; metadata?: { lastSignInTime?: string } } | null,
    get authDeletedCount() {
      return authDeletedCount;
    },
    incAuthDeleted() {
      authDeletedCount++;
    },
    reset() {
      docs.clear();
      writeLog.length = 0;
      deleteLog.length = 0;
      failDeletePaths.clear();
      permissionDeniedPaths.clear();
      failNetworkPaths.clear();
      authDeletedCount = 0;
      this.mockUser = {
        uid: 'uid_test_123',
        email: 'warraichgoods43@gmail.com',
        metadata: { lastSignInTime: new Date().toISOString() }
      };
    }
  };
});

vi.mock('firebase/firestore', () => {
  const pathOf = (segments: string[]) => segments.join('/');
  return {
    doc: (_db: unknown, ...segments: string[]) => ({ __type: 'doc', path: pathOf(segments), id: segments[segments.length - 1] }),
    collection: (_db: unknown, ...segments: string[]) => ({ __type: 'coll', path: pathOf(segments) }),
    query: (collRef: { path: string }) => ({ __type: 'query', path: collRef.path }),
    where: () => ({ __type: 'where' }),
    serverTimestamp: () => 'SERVER_TS',
    getDoc: async (ref: { path: string }) => {
      const val = mockState.docs.get(ref.path);
      return {
        exists: () => val !== undefined,
        id: ref.path.split('/').pop(),
        ref,
        data: () => val
      };
    },
    getDocs: async (ref: { path: string }) => {
      const prefix = `${ref.path}/`;
      const matched: Array<{ id: string; ref: { path: string }; data: () => Record<string, unknown> }> = [];
      for (const [k, v] of mockState.docs.entries()) {
        if (k.startsWith(prefix)) {
          const rest = k.slice(prefix.length);
          if (!rest.includes('/')) {
            matched.push({
              id: rest,
              ref: { path: k },
              data: () => v
            });
          }
        }
      }
      return { docs: matched, forEach: (cb: (d: (typeof matched)[number]) => void) => matched.forEach(cb) };
    },
    setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      for (const prefix of mockState.permissionDeniedPaths) {
        if (ref.path.startsWith(prefix)) {
          const err = new Error('Missing or insufficient permissions') as Error & { code?: string };
          err.code = 'permission-denied';
          throw err;
        }
      }
      for (const prefix of mockState.failNetworkPaths) {
        if (ref.path.startsWith(prefix)) {
          throw new Error('Simulated network failure');
        }
      }
      const prev = opts?.merge ? mockState.docs.get(ref.path) || {} : {};
      const next = { ...prev, ...data };
      mockState.docs.set(ref.path, next);
      mockState.writeLog.push({ path: ref.path, data: next });
    },
    deleteDoc: async (ref: { path: string }) => {
      for (const prefix of mockState.failDeletePaths) {
        if (ref.path.startsWith(prefix)) {
          throw new Error(`Simulated deleteDoc failure on ${ref.path}`);
        }
      }
      mockState.docs.delete(ref.path);
      mockState.deleteLog.push(ref.path);
    },
    runTransaction: async (_db: unknown, fn: (t: unknown) => Promise<unknown>) =>
      fn({
        get: async (ref: { path: string }) => ({
          exists: () => mockState.docs.has(ref.path),
          data: () => mockState.docs.get(ref.path)
        }),
        set: (ref: { path: string }, data: Record<string, unknown>) => {
          mockState.docs.set(ref.path, data);
        }
      }),
    onSnapshot: () => () => {}
  };
});

vi.mock('../utils/firebase', () => ({
  get auth() {
    return { currentUser: mockState.mockUser };
  },
  db: {},
  deleteFirebaseUserAccount: async () => {
    mockState.incAuthDeleted();
  }
}));

import {
  getScopedItem,
  runOneTimeV2ToV3Migration,
  safeStorage,
  setScopedItem
} from '../utils/storageCore';
import {
  TOMBSTONE_TTL_DAYS,
  autoReconcileAllLocalToCloud,
  enqueueOfflineAction,
  getStoredBilties,
  getStoredOfflineQueue,
  getTombstones,
  isEntityTombstoned,
  processOfflineQueue,
  pruneTombstoneMap,
  recordCollectionMutations,
  saveStoredBilties,
  syncPublicBiltyVerification
} from '../utils/storageSync';
import {
  clearLocalAndIndexedDbForUser,
  executeImmediateAccountDeletion,
  purgeAllUserFirestoreData
} from '../utils/accountDeletion';
import {
  hydrateStorageFromIndexedDB,
  markKeyDeletedForHydration
} from '../utils/persistentStorage';
import { KHATA_STORAGE_KEYS } from '../utils/ledgerStorage';
import { getScopedStorageKey } from '../utils/calculator';
import type { BiltyRecord } from '../types';

function setupMockLocalStorage(): Record<string, string> {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
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

describe('Sync Integrity, Tombstones, Storage Isolation & Account Purge (#1–#10, #16–#18)', () => {
  let rawStore: Record<string, string>;

  beforeEach(() => {
    rawStore = setupMockLocalStorage();
    mockState.reset();
  });

  it('#1 + #2: records tombstones when deleting items (including last item) and never resurrects from stale cloud docs', async () => {
    const scope = 'uid_test_123';
    runOneTimeV2ToV3Migration(scope);

    const trip1 = { id: 101, from: 'Samundri', to: 'Karachi', dist: 1100, fuelCost: 40000, updatedAt: '2026-11-18T10:00:00.000Z' };
    const trip2 = { id: 102, from: 'Lahore', to: 'Multan', dist: 340, fuelCost: 15000, updatedAt: '2026-11-18T10:01:00.000Z' };
    setScopedItem('trips', JSON.stringify([trip1, trip2]));

    // Delete trip2 and simulate another device still holding trip2 in cloud legacy doc
    mockState.docs.set(`users/${scope}/collections/trips`, {
      items: [trip1, trip2],
      updatedAt: '2026-11-18T10:01:00.000Z'
    });

    const delTime = '2026-11-18T10:05:00.000Z';
    recordCollectionMutations('trips', [trip1, trip2], [trip1], delTime);
    setScopedItem('trips', JSON.stringify([trip1]));

    await autoReconcileAllLocalToCloud(scope);
    const afterFirstReconcile = JSON.parse(getScopedItem('trips') || '[]');
    expect(afterFirstReconcile).toHaveLength(1);
    expect(afterFirstReconcile[0].id).toBe(101);

    // Now delete the LAST remaining item (trip1) -> must push empty state [] cleanly (#2)
    recordCollectionMutations('trips', [trip1], [], '2026-11-18T10:06:00.000Z');
    setScopedItem('trips', '[]');
    await autoReconcileAllLocalToCloud(scope);

    const afterLastDelete = JSON.parse(getScopedItem('trips') || '[]');
    expect(afterLastDelete).toEqual([]);
    const cloudLegacy = mockState.docs.get(`users/${scope}/collections/trips`) as { items: unknown[] };
    expect(cloudLegacy.items).toEqual([]);
  });

  it('#1: prunes expired tombstones beyond 90 days and allows genuinely newer recreations to win', () => {
    const oldTs = new Date(Date.now() - (TOMBSTONE_TTL_DAYS + 5) * 24 * 60 * 60 * 1000).toISOString();
    const freshTs = new Date().toISOString();
    const pruned = pruneTombstoneMap({ oldKey: oldTs, freshKey: freshTs });
    expect(pruned.oldKey).toBeUndefined();
    expect(pruned.freshKey).toBe(freshTs);

    expect(
      isEntityTombstoned(
        'bilties',
        { biltyNo: 'WG-1001', updatedAt: '2026-11-18T09:00:00.000Z' },
        { 'WG-1001': '2026-11-18T10:00:00.000Z' }
      )
    ).toBe(true);

    // Item updated strictly AFTER deletion must survive
    expect(
      isEntityTombstoned(
        'bilties',
        { biltyNo: 'WG-1001', updatedAt: '2026-11-18T11:00:00.000Z' },
        { 'WG-1001': '2026-11-18T10:00:00.000Z' }
      )
    ).toBe(false);
  });

  it('#3 + #7: deletes publicBiltyVerifications for deleted bilty and writes zero shadow owner/legacy keys', async () => {
    const scope = 'uid_test_123';
    const sampleBilty: BiltyRecord = {
      id: 5001,
      biltyNo: 'WG-5001',
      vehicleNo: 'LHR-5001',
      date: '18 Nov, 2026',
      driverName: 'Tariq',
      mobileNo: '0300-1234567',
      sendingCity: 'Samundri',
      receivingCity: 'Karachi',
      senderName: 'Sender',
      senderMobile: '0300-1111111',
      receiverName: 'Receiver',
      receiverMobile: '0321-2222222',
      senderCnic: '33301-1234567-1',
      qty: '50',
      itemDescription: 'Grain',
      weight: '2000',
      total: 30000,
      advance: 0,
      payable: 30000,
      updatedAt: '2026-11-18T10:00:00.000Z'
    };

    saveStoredBilties([sampleBilty]);
    await new Promise((r) => setTimeout(r, 10));

    // Must not write hardcoded owner email or ah-bilties shadow keys (#7)
    expect(rawStore['wg_v2_warraichgoods43_gmail_com_bilties']).toBeUndefined();
    expect(rawStore['ah-bilties']).toBeUndefined();
    expect(getStoredBilties()).toHaveLength(1);
    expect(mockState.docs.has('publicBiltyVerifications/WG-5001')).toBe(true);

    // Delete bilty -> removes public verification and blocks recreation via tombstone
    saveStoredBilties([]);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockState.deleteLog).toContain('publicBiltyVerifications/WG-5001');
    const recreatedPublic = await syncPublicBiltyVerification(sampleBilty);
    expect(recreatedPublic).toBe(false);
    expect(mockState.docs.has('publicBiltyVerifications/WG-5001')).toBe(false);
    expect(getTombstones('bilties', scope)['WG-5001']).toBeTruthy();
  });

  it('#4: getScopedItem respects empty [] after one-time migration and never refills from guest/legacy keys', () => {
    const scope = 'uid_test_123';
    rawStore[getScopedStorageKey('trips', 'guest')] = JSON.stringify([{ id: 99, from: 'Guest', to: 'City', dist: 100 }]);
    rawStore['ah-trips'] = JSON.stringify([{ id: 88, from: 'Legacy', to: 'City', dist: 200 }]);

    // Run initial migration then explicitly clear trips to '[]'
    runOneTimeV2ToV3Migration(scope);
    setScopedItem('trips', '[]');

    const loaded = getScopedItem('trips');
    expect(loaded).toBe('[]');
  });

  it('#5 + #6: safeStorage.removeItem deletes ONLY exact keys and IDB hydration respects deleted-key tombstones', async () => {
    rawStore['trips'] = '["a"]';
    rawStore['my_trips'] = '["keep_me"]';
    rawStore['trips_backup'] = '["keep_me_too"]';

    safeStorage.removeItem('trips');
    expect(rawStore['trips']).toBeUndefined();
    expect(rawStore['my_trips']).toBe('["keep_me"]');
    expect(rawStore['trips_backup']).toBe('["keep_me_too"]');

    // Mark a key as deleted for hydration -> deleted registry must track it cleanly
    markKeyDeletedForHydration('wg_v2_uid_test_123_trips');
    expect(JSON.parse(rawStore['wg_v3_deleted_keys'] || '[]')).toContain('wg_v2_uid_test_123_trips');
    await expect(hydrateStorageFromIndexedDB()).resolves.toBeUndefined();
  });

  it('#8: shards collections per document under users/{uid}/{coll}Docs/{docId} and skips oversized legacy array', async () => {
    const scope = 'uid_test_123';
    runOneTimeV2ToV3Migration(scope);

    // Create 120 heavy bilties (>600KB total) to trigger per-doc mode marker in legacy doc
    const heavyText = 'X'.repeat(6000);
    const manyBilties = Array.from({ length: 120 }, (_, i) => ({
      id: 7000 + i,
      biltyNo: `WG-${7000 + i}`,
      itemDescription: heavyText,
      updatedAt: '2026-11-18T12:00:00.000Z'
    }));
    setScopedItem('bilties', JSON.stringify(manyBilties));

    await autoReconcileAllLocalToCloud(scope);

    // Per-document writes exist in biltiesDocs
    expect(mockState.docs.has(`users/${scope}/biltiesDocs/WG-7000`)).toBe(true);
    expect(mockState.docs.has(`users/${scope}/biltiesDocs/WG-7119`)).toBe(true);
    const legacyMarker = mockState.docs.get(`users/${scope}/collections/bilties`) as {
      migratedToPerDoc?: boolean;
      itemsCount?: number;
      items?: unknown[];
    };
    expect(legacyMarker.migratedToPerDoc).toBe(true);
    expect(legacyMarker.itemsCount).toBe(120);
    expect(legacyMarker.items).toEqual([]);
  });

  it('#9 + #10: offline queue retains >30 items across >3 retries with exponential backoff and isolates permission-denied as blocked', async () => {
    const scope = 'uid_test_123';

    // Enqueue 35 distinct vehicles/custom actions -> nothing truncated (#9)
    for (let i = 0; i < 35; i++) {
      enqueueOfflineAction('pod_confirmation', { biltyNo: `WG-Q${i}`, vehicleNo: `V-${i}` });
    }
    expect(getStoredOfflineQueue().length).toBe(35);

    // Simulate permission-denied on publicBiltyVerifications (#10)
    mockState.permissionDeniedPaths.add('publicBiltyVerifications');
    const blockedRes = await processOfflineQueue();
    expect(blockedRes.processed).toBe(0);
    expect(blockedRes.blocked).toBe(35);
    expect(blockedRes.remaining).toBe(35);
    expect(getStoredOfflineQueue().every((q) => q.status === 'blocked')).toBe(true);

    // Test retry count > 3 with transient network error -> still retained with backoff (#9)
    mockState.reset();
    rawStore[getScopedStorageKey('offline-queue', scope)] = JSON.stringify([
      {
        id: 'act_retry',
        type: 'public_bilty',
        data: { biltyNo: 'WG-RETRY-1', vehicleNo: 'LHR-1' },
        timestamp: '2026-11-18T10:00:00.000Z',
        retryCount: 4,
        status: 'retrying'
      }
    ]);
    mockState.failNetworkPaths.add('publicBiltyVerifications');

    const retryRes = await processOfflineQueue();
    expect(retryRes.processed).toBe(0);
    expect(retryRes.remaining).toBe(1);
    const savedQueue = getStoredOfflineQueue();
    expect(savedQueue[0].retryCount).toBe(5);
    expect(savedQueue[0].status).toBe('retrying');
    expect(savedQueue[0].nextRetryAt).toBeGreaterThan(Date.now());
  });

  it('#16 + #17 + #18: account deletion removes ALL wg_v2_<uid>_* Khata keys, aborts Auth delete on Firestore purge error, and purges secondary collections', async () => {
    const uid = 'uid_test_123';

    // Populate both real v2/v3 scoped keys and legacy keys
    rawStore[getScopedStorageKey(KHATA_STORAGE_KEYS.ACCOUNTS, uid)] = '[{"id":"acc1"}]';
    rawStore[getScopedStorageKey(KHATA_STORAGE_KEYS.ENTRIES, uid)] = '[{"id":"ent1"}]';
    rawStore[`${KHATA_STORAGE_KEYS.CASHBOOK}_${uid}`] = '[{"id":"cash1"}]';
    rawStore[getScopedStorageKey('bilties', uid)] = JSON.stringify([{ id: 1, biltyNo: 'WG-DEL-1' }]);

    await clearLocalAndIndexedDbForUser(uid);
    expect(rawStore[getScopedStorageKey(KHATA_STORAGE_KEYS.ACCOUNTS, uid)]).toBeUndefined();
    expect(rawStore[getScopedStorageKey(KHATA_STORAGE_KEYS.ENTRIES, uid)]).toBeUndefined();
    expect(rawStore[`${KHATA_STORAGE_KEYS.CASHBOOK}_${uid}`]).toBeUndefined();
    expect(rawStore[getScopedStorageKey('bilties', uid)]).toBeUndefined();

    // Seed Firestore docs across collections including #18 secondary collections
    mockState.docs.set(`users/${uid}`, { email: 'user@example.com' });
    mockState.docs.set(`users/${uid}/biltiesDocs/WG-DEL-1`, { biltyNo: 'WG-DEL-1' });
    mockState.docs.set('publicBiltyVerifications/WG-DEL-1', { biltyNo: 'WG-DEL-1' });
    mockState.docs.set('hazardReports/haz1', { reporterUid: uid });
    mockState.docs.set('activityLog/log1', { uid });
    mockState.docs.set('crashReports/cr1', { userUid: uid });

    // #17: Simulate Firestore purge failure -> MUST abort before calling deleteFirebaseUserAccount!
    mockState.failDeletePaths.add('hazardReports/haz1');
    const aborted = await executeImmediateAccountDeletion(uid);
    expect(aborted.success).toBe(false);
    expect(aborted.message).toContain('Incomplete Firestore data purge');
    expect(mockState.authDeletedCount).toBe(0);

    // Clear failure -> purge succeeds & deletes all collections (#18) + Auth user
    mockState.failDeletePaths.clear();
    await purgeAllUserFirestoreData(uid);
    expect(mockState.docs.has('hazardReports/haz1')).toBe(false);
    expect(mockState.docs.has('activityLog/log1')).toBe(false);
    expect(mockState.docs.has('crashReports/cr1')).toBe(false);
    expect(mockState.docs.has('publicBiltyVerifications/WG-DEL-1')).toBe(false);
    expect(mockState.docs.has(`users/${uid}/biltiesDocs/WG-DEL-1`)).toBe(false);

    const ok = await executeImmediateAccountDeletion(uid);
    expect(ok.success).toBe(true);
    expect(mockState.authDeletedCount).toBe(1);
  });
});
