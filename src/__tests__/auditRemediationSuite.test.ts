import { describe, it, expect, beforeEach, vi } from 'vitest';

const suiteMockState = vi.hoisted(() => ({
  docs: new Map<string, Record<string, unknown>>(),
  mockUser: null as null | { uid: string; email: string },
  notifyCalls: [] as Array<{ title: string; body?: string; tag?: string }>
}));

vi.mock('firebase/firestore', () => {
  const pathOf = (segments: string[]) => segments.join('/');
  return {
    doc: (_db: unknown, ...segments: string[]) => ({ __type: 'doc', path: pathOf(segments), id: segments[segments.length - 1] }),
    collection: (_db: unknown, ...segments: string[]) => ({ __type: 'coll', path: pathOf(segments) }),
    serverTimestamp: () => 'SERVER_TS',
    query: (target: unknown) => target,
    where: () => ({}),
    limit: () => ({}),
    getDoc: async (ref: { path: string }) => {
      const val = suiteMockState.docs.get(ref.path);
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
      for (const [k, v] of suiteMockState.docs.entries()) {
        if (k.startsWith(prefix)) {
          const rest = k.slice(prefix.length);
          if (!rest.includes('/')) {
            matched.push({ id: rest, ref: { path: k }, data: () => v });
          }
        }
      }
      return { docs: matched, forEach: (cb: (d: (typeof matched)[number]) => void) => matched.forEach(cb) };
    },
    setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      const prev = opts?.merge ? suiteMockState.docs.get(ref.path) || {} : {};
      suiteMockState.docs.set(ref.path, { ...prev, ...data });
    },
    deleteDoc: async (ref: { path: string }) => {
      suiteMockState.docs.delete(ref.path);
    },
    writeBatch: () => {
      const ops: Array<() => void> = [];
      return {
        set: (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
          ops.push(() => {
            const prev = opts?.merge ? suiteMockState.docs.get(ref.path) || {} : {};
            suiteMockState.docs.set(ref.path, { ...prev, ...data });
          });
        },
        delete: (ref: { path: string }) => {
          ops.push(() => {
            suiteMockState.docs.delete(ref.path);
          });
        },
        commit: async () => {
          ops.forEach((op) => op());
        }
      };
    },
    runTransaction: async () => 1001,
    onSnapshot: () => () => {}
  };
});

vi.mock('../utils/firebase', () => ({
  get auth() {
    return { currentUser: suiteMockState.mockUser };
  },
  db: {},
  deleteFirebaseUserAccount: async () => {}
}));

vi.mock('../utils/notifications', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/notifications')>();
  return {
    ...actual,
    sendSystemNotification: async (title: string, body?: string, options?: { tag?: string }) => {
      suiteMockState.notifyCalls.push({ title, body, tag: options?.tag });
      return true;
    }
  };
});

import {
  findNextAvailableBiltySeq,
  getStoredBilties,
  getStoredTrips,
  getTombstones,
  isEntityTombstoned,
  parseEntityMutationTimeMs,
  pruneTombstoneMap,
  resolveEntityLWW,
  saveStoredBilties,
  saveStoredTrips,
  saveTombstones
} from '../utils/storageSync';
import {
  inspectGuestScopeData,
  importGuestDataIntoScope,
  restoreFullBackupFromJson,
  requestAccountDeletion
} from '../utils/storage';
import { hasPreRestoreSnapshot, previewJsonBackup, undoLastRestore } from '../utils/backupService';
import { runOneTimeV2ToV3Migration, safeStorage } from '../utils/storageCore';
import { fetchOSRMRouteDistance } from '../utils/mapRoutes';
import { processExpiryNotifications, ExpiringDocumentItem } from '../utils/documentExpiry';

function setupEnv() {
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

describe('Audit Remediation Regression Suite (Phases 1–4)', () => {
  beforeEach(() => {
    setupEnv();
    suiteMockState.docs.clear();
    suiteMockState.mockUser = null;
    suiteMockState.notifyCalls = [];
    vi.restoreAllMocks();
  });

  it('ignores future business dates in LWW & tombstone resolution (mutation-only timestamps)', () => {
    const now = Date.now();
    const recordWithFutureDate = {
      id: 101,
      date: '2099-12-31',
      updatedAt: new Date(now - 60_000).toISOString()
    };
    const newerRecord = {
      id: 101,
      date: '2026-01-01',
      updatedAt: new Date(now).toISOString()
    };

    expect(parseEntityMutationTimeMs(recordWithFutureDate)).toBe(now - 60_000);
    const winner = resolveEntityLWW(recordWithFutureDate, newerRecord);
    expect(winner.date).toBe('2026-01-01');

    // A recent tombstone must suppress an old record even if business `date` is far in the future
    const deletedIso = new Date(now).toISOString();
    const tombstones = { '101': deletedIso };
    expect(isEntityTombstoned('trips', recordWithFutureDate, tombstones)).toBe(true);
  });

  it('caps tombstone maps cleanly at 500 entries keeping newest deletions', () => {
    const now = Date.now();
    const bloated: Record<string, string> = {};
    for (let i = 1; i <= 620; i++) {
      bloated[String(i)] = new Date(now - (700 - i) * 1000).toISOString();
    }
    const pruned = pruneTombstoneMap(bloated, now);
    expect(Object.keys(pruned)).toHaveLength(500);
    expect(pruned['620']).toBeDefined();
    expect(pruned['1']).toBeUndefined();
  });

  it('creates a pre-restore Undo snapshot and restores previous data cleanly via undoLastRestore()', async () => {
    const uid = 'uid_undo_test';
    suiteMockState.mockUser = { uid, email: 'driver@example.com' };
    runOneTimeV2ToV3Migration(uid);

    const originalTrip = {
      id: 1,
      name: 'Samundri to Lahore',
      fuelType: 'Diesel',
      fuelTypeRaw: 'diesel' as const,
      consumed: '15.0 L',
      isReturn: false,
      date: '2026-11-18',
      time: '09:00',
      month: 'Nov 2026',
      origin: 'Samundri',
      dest: 'Lahore',
      dist: 150,
      fuelCost: 5500,
      toll: 300,
      loading: 0,
      driver: 0,
      other: 0,
      total: 5800
    };
    saveStoredTrips([originalTrip]);

    const backupPayload = JSON.stringify({
      exportedAt: new Date().toISOString(),
      data: {
        trips: [
          {
            ...originalTrip,
            id: 2,
            name: 'Restored Multan Trip',
            updatedAt: new Date(Date.now() + 60_000).toISOString()
          }
        ]
      }
    });

    const preview = previewJsonBackup(backupPayload);
    expect(preview.valid).toBe(true);

    const restoredRes = await restoreFullBackupFromJson(backupPayload, 'overwrite');
    expect(restoredRes.success).toBe(true);
    expect(hasPreRestoreSnapshot()).toBe(true);
    expect(getStoredTrips()).toHaveLength(1);
    expect(getStoredTrips()[0].id).toBe(2);

    const undoRes = await undoLastRestore();
    expect(undoRes.success).toBe(true);
    expect(getStoredTrips()).toHaveLength(1);
    expect(getStoredTrips()[0].id).toBe(1);
    expect(getStoredTrips()[0].name).toBe('Samundri to Lahore');
  });

  it('keeps guest-mode data separate during v3 migration and imports explicitly only when requested', () => {
    // Seed guest trips directly before signing in
    runOneTimeV2ToV3Migration('guest');
    saveStoredTrips([
      {
        id: 88,
        name: 'Guest Mode Trip',
        fuelType: 'Diesel',
        fuelTypeRaw: 'diesel',
        consumed: '20.0 L',
        isReturn: false,
        date: '2026-11-18',
        time: '11:00',
        month: 'Nov 2026',
        origin: 'Samundri',
        dest: 'Faisalabad',
        dist: 45,
        fuelCost: 2000,
        toll: 0,
        loading: 0,
        driver: 0,
        other: 0,
        total: 2000
      }
    ]);

    const signedUid = 'uid_signed_guest_check';
    suiteMockState.mockUser = { uid: signedUid, email: 'user@example.com' };
    runOneTimeV2ToV3Migration(signedUid);

    // Must NOT silently absorb guest trips into signedUid scope
    expect(getStoredTrips()).toHaveLength(0);

    const guestSummary = inspectGuestScopeData();
    expect(guestSummary.hasGuestData).toBe(true);
    expect(guestSummary.counts.trips).toBe(1);

    // Explicit user approval merges guest trips cleanly into signedUid scope
    const importRes = importGuestDataIntoScope(signedUid, 'merge');
    expect(importRes.mergedCount).toBeGreaterThanOrEqual(1);
    expect(getStoredTrips()).toHaveLength(1);
    expect(getStoredTrips()[0].name).toBe('Guest Mode Trip');
  });

  it('wraps around WG-9999 safely to find free WG-xxxx bilty numbers without overwriting active ones', () => {
    saveStoredBilties([
      {
        id: 1,
        biltyNo: 'WG-9999',
        vehicleNo: 'LHR-1',
        date: '2026-11-19',
        driverName: 'Ali',
        mobileNo: '03001234567',
        sendingCity: 'Samundri',
        receivingCity: 'Lahore',
        senderName: 'A',
        senderMobile: '03001234567',
        receiverName: 'B',
        receiverMobile: '03007654321',
        senderCnic: '33100-1234567-1',
        qty: '10',
        itemDescription: 'Bags',
        weight: '500 kg',
        total: 10000,
        advance: 0,
        payable: 10000
      },
      {
        id: 2,
        biltyNo: 'WG-1001',
        vehicleNo: 'LHR-2',
        date: '2026-11-19',
        driverName: 'Umer',
        mobileNo: '03001234567',
        sendingCity: 'Samundri',
        receivingCity: 'Multan',
        senderName: 'C',
        senderMobile: '03001234567',
        receiverName: 'D',
        receiverMobile: '03007654321',
        senderCnic: '33100-1234567-2',
        qty: '5',
        itemDescription: 'Cartons',
        weight: '200 kg',
        total: 5000,
        advance: 0,
        payable: 5000
      }
    ]);

    // Continuing past 9999 advances cleanly to 10000 without wrapping around
    expect(findNextAvailableBiltySeq(10000)).toBe(10000);
    expect(getStoredBilties()).toHaveLength(2);
  });

  it('rejects authenticated account deletion requests when offline rather than returning false success', async () => {
    const uid = 'uid_offline_delete';
    suiteMockState.mockUser = { uid, email: 'offline@example.com' };
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false, userAgent: 'vitest' },
      configurable: true
    });

    const res = await requestAccountDeletion(uid, 'offline@example.com');
    expect(res.success).toBe(false);
    expect(res.message).toMatch(/internet/i);
  });

  it('caches OSRM route distances persistently for 30 days and serves cached values offline', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ routes: [{ distance: 152400 }] })
    }));
    vi.stubGlobal('fetch', fetchSpy);

    const firstKm = await fetchOSRMRouteDistance('Samundri', 'Lahore');
    expect(firstKm).toBe(152);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Reverse direction or repeat lookup must hit persistent cache without extra fetch
    const cachedReverse = await fetchOSRMRouteDistance('Lahore', 'Samundri');
    expect(cachedReverse).toBe(152);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('consolidates simultaneous expiring documents into one summary notification so none are dropped by throttle', async () => {
    const items: ExpiringDocumentItem[] = [
      {
        id: 'veh-1-reg',
        targetId: 1,
        type: 'vehicle_reg',
        titleEn: 'RC Expiry',
        titleUr: 'میعاد',
        docNameEn: 'Registration (RC)',
        docNameUr: 'رجسٹریشن',
        identifier: 'LHR-1111',
        expiryDateStr: '2026-11-18',
        daysLeft: -1,
        isExpired: true,
        urgency: 'critical',
        portalType: 'mtmis',
        portalNameEn: 'MTMIS',
        portalNameUr: 'ایم ٹی ایم آئی ایس',
        portalUrl: 'https://mtmis.excise.punjab.gov.pk/',
        inAppSubSection: 'vehicle'
      },
      {
        id: 'drv-2-license',
        targetId: 2,
        type: 'driver_license',
        titleEn: 'License Expiry',
        titleUr: 'لائسنس',
        docNameEn: 'HTV Driving License',
        docNameUr: 'لائسنس',
        identifier: 'Driver Ali',
        expiryDateStr: '2026-11-23',
        daysLeft: 4,
        isExpired: false,
        urgency: 'critical',
        portalType: 'dlims',
        portalNameEn: 'DLIMS',
        portalNameUr: 'ڈی ایل آئی ایم ایس',
        portalUrl: 'https://dlims.punjab.gov.pk/',
        inAppSubSection: 'license'
      }
    ];

    await processExpiryNotifications(items, 'en');
    expect(suiteMockState.notifyCalls).toHaveLength(1);
    expect(suiteMockState.notifyCalls[0].title).toContain('2 Document Expiry Alerts');
    expect(safeStorage.getItem(`ah-notified-veh-1-reg-expired-${new Date().toISOString().split('T')[0]}`)).toBe('true');
    expect(safeStorage.getItem(`ah-notified-drv-2-license-7-${new Date().toISOString().split('T')[0]}`)).toBe('true');
  });
});
