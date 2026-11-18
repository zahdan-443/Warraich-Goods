import { describe, it, expect, beforeEach, vi } from 'vitest';

const backupMockState = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  const writeSequence: string[] = [];

  return {
    docs,
    writeSequence,
    mockUser: {
      uid: 'uid_backup_1',
      email: 'warraichgoods43@gmail.com'
    },
    reset() {
      docs.clear();
      writeSequence.length = 0;
    }
  };
});

vi.mock('firebase/firestore', () => {
  const pathOf = (segments: string[]) => segments.join('/');
  return {
    doc: (_db: unknown, ...segments: string[]) => ({ __type: 'doc', path: pathOf(segments), id: segments[segments.length - 1] }),
    collection: (_db: unknown, ...segments: string[]) => ({ __type: 'coll', path: pathOf(segments) }),
    serverTimestamp: () => 'SERVER_TS',
    getDoc: async (ref: { path: string }) => {
      const val = backupMockState.docs.get(ref.path);
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
      for (const [k, v] of backupMockState.docs.entries()) {
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
      const prev = opts?.merge ? backupMockState.docs.get(ref.path) || {} : {};
      backupMockState.docs.set(ref.path, { ...prev, ...data });
      backupMockState.writeSequence.push(ref.path);
    },
    deleteDoc: async (ref: { path: string }) => {
      backupMockState.docs.delete(ref.path);
    },
    runTransaction: async () => 1001,
    onSnapshot: () => () => {}
  };
});

vi.mock('../utils/firebase', () => ({
  get auth() {
    return { currentUser: backupMockState.mockUser };
  },
  db: {},
  deleteFirebaseUserAccount: async () => {}
}));

import {
  MAX_CLOUD_BACKUP_SNAPSHOTS,
  MAX_CLOUD_CHUNK_BYTES,
  previewCloudBackup,
  previewJsonBackup,
  pruneOldCloudBackups,
  restoreFromCloudBackup,
  runScheduledDailyCloudBackup,
  shardCollectionForBackup,
  utf8ByteSize
} from '../utils/backupService';
import { getPakistanDateKey, getPakistanTimestampIso } from '../utils/dateUtils';
import {
  calculateFuelCost,
  calculateRoundTrip,
  fromPaisa,
  subtractRupees,
  sumRupees,
  toPaisa,
  validateBiltyFinancials,
  validateFinancialNumber
} from '../utils/calculator';
import { getStoredTrips, saveStoredTrips } from '../utils/storageSync';
import { runOneTimeV2ToV3Migration } from '../utils/storageCore';

function setupBrowserEnv() {
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

describe('Backup Integrity, PKT Dates & Strict Financial Math (#11–#15, #19–#22)', () => {
  beforeEach(() => {
    setupBrowserEnv();
    backupMockState.reset();
    runOneTimeV2ToV3Migration('uid_backup_1');
  });

  it('#15: uses Pakistan Standard Time (UTC+05:00 Asia/Karachi) rather than UTC across midnight', () => {
    // 20:00 UTC on Nov 18 is 01:00 AM PKT on Nov 19!
    const utcNight = new Date('2026-11-18T20:00:00.000Z');
    expect(getPakistanDateKey(utcNight)).toBe('2026-11-19');
    expect(getPakistanTimestampIso(utcNight)).toBe('2026-11-19T01:00:00.000+05:00');
  });

  it('#12: shards oversized ledgers strictly <= MAX_CLOUD_CHUNK_BYTES (700 KB)', () => {
    const entries = Array.from({ length: 800 }, (_, i) => ({
      id: `ent_${i}`,
      note: 'N'.repeat(1200),
      amount: 1000 + i
    }));
    const chunks = shardCollectionForBackup('parties', entries);
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) {
      expect(chunk.byteSize).toBeLessThanOrEqual(MAX_CLOUD_CHUNK_BYTES);
      expect(utf8ByteSize(chunk.items)).toBeLessThan(MAX_CLOUD_CHUNK_BYTES);
    }
    expect(chunks.flatMap((c) => c.items)).toHaveLength(800);
  });

  it('#11: writes ALL chunks first, then dated snapshot doc, then latestIndex LAST', async () => {
    saveStoredTrips([{
      id: 1,
      name: 'Samundri to Lahore',
      fuelType: 'Diesel',
      fuelTypeRaw: 'diesel',
      consumed: '17.0 L',
      isReturn: false,
      date: '2026-11-18',
      time: '10:00',
      month: 'Nov 2026',
      origin: 'Samundri',
      dest: 'Lahore',
      dist: 150,
      fuelCost: 6000,
      toll: 300,
      loading: 0,
      driver: 0,
      other: 0,
      total: 6300
    }]);
    const res = await runScheduledDailyCloudBackup();
    expect(res.executed).toBe(true);
    expect((res.chunkCount || 0) > 0).toBe(true);

    const uid = 'uid_backup_1';
    const seq = backupMockState.writeSequence;
    const todayKey = getPakistanDateKey();
    const datedPath = `usersData/${uid}/cloudBackups/${todayKey}`;
    const latestPath = `usersData/${uid}/cloudBackups/latestIndex`;

    const latestIdx = seq.indexOf(latestPath);
    const datedIdx = seq.indexOf(datedPath);
    const lastChunkIdx = Math.max(
      ...seq
        .map((p, idx) => (p.includes('/chunks/') ? idx : -1))
        .filter((i) => i >= 0)
    );

    expect(lastChunkIdx).toBeGreaterThan(-1);
    expect(datedIdx).toBeGreaterThan(lastChunkIdx);
    expect(latestIdx).toBeGreaterThan(datedIdx);
  });

  it('#13: prunes snapshots beyond 14-snapshot retention limit including nested chunks', async () => {
    const uid = 'uid_backup_1';
    for (let day = 1; day <= 17; day++) {
      const id = `2026-11-${String(day).padStart(2, '0')}`;
      backupMockState.docs.set(`usersData/${uid}/cloudBackups/${id}`, {
        backupId: id,
        backupDate: id
      });
      backupMockState.docs.set(`usersData/${uid}/cloudBackups/${id}/chunks/trips_0`, {
        key: 'trips',
        partIndex: 0,
        items: []
      });
    }

    const prunedCount = await pruneOldCloudBackups(uid, MAX_CLOUD_BACKUP_SNAPSHOTS);
    expect(prunedCount).toBe(3);
    expect(backupMockState.docs.has(`usersData/${uid}/cloudBackups/2026-11-01`)).toBe(false);
    expect(backupMockState.docs.has(`usersData/${uid}/cloudBackups/2026-11-01/chunks/trips_0`)).toBe(false);
    expect(backupMockState.docs.has(`usersData/${uid}/cloudBackups/2026-11-17`)).toBe(true);
  });

  it('#14: validates backup preview payloads and aborts incomplete cloud restores without corrupting local data', async () => {
    const validPreview = previewJsonBackup(JSON.stringify({ exportedAt: '2026-11-18', data: { trips: [{ id: 1 }] } }));
    expect(validPreview.valid).toBe(true);
    expect(validPreview.totalRecords).toBe(1);

    const corruptPreview = previewJsonBackup('{"bad": ');
    expect(corruptPreview.valid).toBe(false);

    // Seed local trip that must remain intact when cloud backup is missing chunks
    saveStoredTrips([{
      id: 44,
      name: 'Samundri to Multan',
      fuelType: 'Diesel',
      fuelTypeRaw: 'diesel',
      consumed: '22.0 L',
      isReturn: false,
      date: '2026-11-18',
      time: '12:00',
      month: 'Nov 2026',
      origin: 'Samundri',
      dest: 'Multan',
      dist: 210,
      fuelCost: 8000,
      toll: 500,
      loading: 0,
      driver: 0,
      other: 0,
      total: 8500
    }]);

    const uid = 'uid_backup_1';
    backupMockState.docs.set(`usersData/${uid}/cloudBackups/latestIndex`, {
      backupId: '2026-11-18',
      chunkIds: ['trips_0', 'missing_chunk_1']
    });
    backupMockState.docs.set(`usersData/${uid}/cloudBackups/2026-11-18/chunks/trips_0`, {
      key: 'trips',
      partIndex: 0,
      items: []
    });

    const cloudPreview = await previewCloudBackup('latestIndex');
    expect(cloudPreview.valid).toBe(false);
    expect(cloudPreview.errors[0]).toContain('missing_chunk_1');

    const restored = await restoreFromCloudBackup('latestIndex');
    expect(restored).toBe(false);
    // Original local trip preserved intact
    expect(getStoredTrips()).toHaveLength(1);
    expect(getStoredTrips()[0].id).toBe(44);
  });

  it('#19 + #20: rejects lenient/partial strings and validates commission <= subtotal & base > 0', () => {
    expect(validateFinancialNumber('12abc', 'Freight').isValid).toBe(false);
    expect(validateFinancialNumber('1.2.3', 'Freight').isValid).toBe(false);
    expect(validateFinancialNumber('50 000', 'Freight').isValid).toBe(false);
    expect(validateFinancialNumber(-50, 'Freight').isValid).toBe(false);
    expect(validateFinancialNumber('50,000', 'Freight').value).toBe(50000);

    // Base freight 0 must fail (#20)
    const zeroBase = validateBiltyFinancials({ baseFreight: 0, advance: 0 });
    expect(zeroBase.isValid).toBe(false);

    // Commission > subtotal must fail (#20)
    const overCommission = validateBiltyFinancials({
      baseFreight: 5000,
      laborCharges: 500,
      commission: 6000,
      advance: 0
    });
    expect(overCommission.isValid).toBe(false);
    expect(overCommission.error).toContain('Commission cannot exceed');

    const validFin = validateBiltyFinancials({
      baseFreight: 10000,
      laborCharges: 1000,
      commission: 1500,
      advance: 3500
    });
    expect(validFin.isValid).toBe(true);
    expect(validFin.totalFreight).toBe(9500);
    expect(validFin.payable).toBe(6000);
  });

  it('#21 + #22: eliminates NaN in fuel calculations and eliminates IEEE-754 float drift via paisa math', () => {
    expect(calculateFuelCost(Number.NaN, 5, 360).fuelCost).toBe(0);
    expect(calculateFuelCost(200, Number.NaN, 360).fuelCost).toBe(0);
    expect(calculateFuelCost(200, 5, Number.NaN).fuelCost).toBe(0);

    const rt = calculateRoundTrip(Number.NaN, 4, Number.NaN, 500, Number.NaN, 1000, 0);
    expect(Number.isNaN(rt.totalExpense)).toBe(false);
    expect(rt.totalExpense).toBe(2000);

    // 0.1 + 0.2 exact via paisa math (#22)
    expect(sumRupees(0.1, 0.2)).toBe(0.3);
    expect(subtractRupees(100.3, 0.1)).toBe(100.2);
    expect(toPaisa(123.45)).toBe(12345);
    expect(fromPaisa(12345)).toBe(123.45);
  });
});
