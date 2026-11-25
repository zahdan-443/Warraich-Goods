import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockState = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  const writeLog: Array<{ path: string; data: unknown }> = [];
  let txCount = 0;

  return {
    docs,
    writeLog,
    get txCount() {
      return txCount;
    },
    incTx() {
      txCount++;
    },
    mockUser: {
      uid: 'staff_uid_1',
      email: 'staff@lahore.test',
      metadata: { lastSignInTime: new Date().toISOString() }
    } as { uid: string; email: string; metadata?: { lastSignInTime?: string } } | null,
    reset() {
      docs.clear();
      writeLog.length = 0;
      txCount = 0;
      this.mockUser = {
        uid: 'staff_uid_1',
        email: 'staff@lahore.test',
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
    getDoc: async (ref: { path: string }) => {
      const val = mockState.docs.get(ref.path);
      return {
        exists: () => val !== undefined,
        id: ref.path.split('/').pop(),
        ref,
        data: () => val
      };
    },
    getDocs: async (refOrQuery: { path?: string; ref?: { path?: string } }) => {
      const targetPath = refOrQuery.path || refOrQuery.ref?.path || '';
      const matched = Array.from(mockState.docs.entries())
        .filter(([p]) => p.startsWith(targetPath + '/'))
        .map(([p, d]) => ({
          id: p.split('/').pop() || '',
          ref: { path: p },
          data: () => d
        }));
      return { docs: matched, empty: matched.length === 0, forEach: (cb: (doc: any) => void) => matched.forEach(cb) };
    },
    setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      const prev = opts?.merge ? mockState.docs.get(ref.path) || {} : {};
      const next = { ...prev, ...data };
      mockState.docs.set(ref.path, next);
      mockState.writeLog.push({ path: ref.path, data: next });
    },
    deleteDoc: async (ref: { path: string }) => {
      mockState.docs.delete(ref.path);
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
          });
        },
        commit: async () => {
          ops.forEach(fn => fn());
        }
      };
    },
    runTransaction: async (_db: unknown, cb: (tx: any) => Promise<unknown>) => {
      mockState.incTx();
      const pendingWrites: Array<{ path: string; data: Record<string, unknown>; merge?: boolean }> = [];
      const tx = {
        get: async (ref: { path: string }) => {
          const val = mockState.docs.get(ref.path);
          return {
            exists: () => val !== undefined,
            id: ref.path.split('/').pop(),
            ref,
            data: () => val
          };
        },
        set: (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
          pendingWrites.push({ path: ref.path, data, merge: opts?.merge });
        }
      };
      const result = await cb(tx);
      for (const w of pendingWrites) {
        const prev = w.merge ? mockState.docs.get(w.path) || {} : {};
        const next = { ...prev, ...w.data };
        mockState.docs.set(w.path, next);
        mockState.writeLog.push({ path: w.path, data: next });
      }
      return result;
    }
  };
});

vi.mock('../utils/firebase', () => ({
  db: { __mockDb: true },
  auth: {
    get currentUser() {
      return mockState.mockUser;
    }
  }
}));

import {
  BRANCH_NUMBER_BLOCK_LOW_WATER,
  BRANCH_NUMBER_BLOCK_SIZE,
  OfflineBlockExhaustedError,
  allocateNextBiltyNumber,
  buildPublicBiltyCloudPayload,
  getLocalNumberBlock,
  getRemainingBlockCount,
  getStoredBilties,
  parseBiltySeqDigits,
  reserveNextNumberBlockTransaction,
  resolveBiltyNumberConflict,
  saveStoredBilties
} from '../utils/storage';
import {
  BILTY_BRANCHES,
  buildBiltyVerificationCandidates,
  formatStrictBiltyNumber,
  getBiltyVerificationUrl,
  isValidBiltyVerifyFormat
} from '../utils/biltyHelpers';
import { setActiveBranchId, setCachedBranches } from '../utils/branchContext';
import {
  allocateNextAddaBillNumber,
  allocateNextAddaBillNumberAsync,
  deleteAddaBill,
  getAddaBills,
  saveAddaBillsList
} from '../utils/addaBillingStorage';
import type { BiltyRecord, BranchConfig } from '../types';

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  const mockStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true
  });
}

const LAHORE_BRANCH: BranchConfig = {
  id: 'lahore_01',
  branchCode: 'LHR',
  nameUr: 'لاہور برانچ',
  nameEn: 'Lahore Branch',
  addressUr: 'بادامی باغ لاہور',
  addressEn: 'Badami Bagh, Lahore',
  phoneNumbers: '0300-1112233',
  ntn: '7779394-1',
  ownerEmail: 'lhr@owner.test',
  startingBiltySeq: 1001,
  active: true,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z'
};

describe('Step 5: Sequential Numbering, Offline 20-Block Reservation, 5+ Digits, Branch Codes & Conflicts', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
    mockState.reset();
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true, userAgent: 'vitest' },
      configurable: true
    });
    setActiveBranchId('head');
    setCachedBranches([LAHORE_BRANCH]);
  });

  it('supports 5+ digits, branch codes (WG-LHR-1001), Urdu numerals, and public verification candidates', () => {
    expect(formatStrictBiltyNumber('10000')).toBe('WG-10000');
    expect(formatStrictBiltyNumber('۱۰۵۲۳')).toBe('WG-10523');
    expect(formatStrictBiltyNumber('1001', 'LHR')).toBe('WG-LHR-1001');
    expect(formatStrictBiltyNumber('10001', 'LHR')).toBe('WG-LHR-10001');
    expect(parseBiltySeqDigits('WG-LHR-10542')).toBe(10542);

    expect(isValidBiltyVerifyFormat('WG-10001')).toBe(true);
    expect(isValidBiltyVerifyFormat('WG-LHR-1001')).toBe(true);
    expect(isValidBiltyVerifyFormat('WG-LHR-10001')).toBe(true);
    expect(isValidBiltyVerifyFormat('۱۰۵۰')).toBe(true);

    const candidates = buildBiltyVerificationCandidates('LHR-1001');
    expect(candidates).toContain('WG-LHR-1001');
    expect(getBiltyVerificationUrl('WG-LHR-10001')).toBe(
      'https://warraichgoods.eu.cc/?page=verify&bilty=WG-LHR-10001'
    );
    expect(BILTY_BRANCHES.head.nameEn).toContain('Samundri');
    expect(BILTY_BRANCHES.samundri.id).toBe('samundri');
  });

  it('reserves disjoint 20-number blocks for two offline devices via Firestore transaction counter', async () => {
    setActiveBranchId(LAHORE_BRANCH.id);

    // Device 1 online reserves block [1001..1020]
    const dev1Num = await allocateNextBiltyNumber(undefined, LAHORE_BRANCH);
    expect(dev1Num).toBe('WG-LHR-1001');
    const dev1Block = getLocalNumberBlock(LAHORE_BRANCH.id, 'bilty');
    expect(dev1Block?.start).toBe(1001);
    expect(dev1Block?.end).toBe(1020);
    expect(dev1Block?.nextSeq).toBe(1002);

    // Verify counter doc writes strictly the whitelisted 5 fields
    const counterDoc = mockState.docs.get(`branches/${LAHORE_BRANCH.id}/counters/bilty`) as Record<string, unknown>;
    expect(counterDoc).toBeDefined();
    expect(Object.keys(counterDoc).sort()).toEqual([
      'branchId',
      'currentValue',
      'nextSeq',
      'updatedAt',
      'value'
    ]);
    expect(counterDoc.nextSeq).toBe(1021);

    // Simulate Device 2 (fresh device localStorage, same Firestore branch)
    installMemoryLocalStorage();
    setCachedBranches([LAHORE_BRANCH]);
    setActiveBranchId(LAHORE_BRANCH.id);

    const dev2Num = await allocateNextBiltyNumber(undefined, LAHORE_BRANCH);
    expect(dev2Num).toBe('WG-LHR-1021');
    const dev2Block = getLocalNumberBlock(LAHORE_BRANCH.id, 'bilty');
    expect(dev2Block?.start).toBe(1021);
    expect(dev2Block?.end).toBe(1040);

    // Go offline on Device 2 and allocate remaining 19 numbers offline with zero collisions
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: false, userAgent: 'vitest' },
      configurable: true
    });
    const issuedOffline: string[] = [dev2Num];
    for (let i = 0; i < BRANCH_NUMBER_BLOCK_SIZE - 1; i++) {
      issuedOffline.push(await allocateNextBiltyNumber(undefined, LAHORE_BRANCH));
    }
    expect(issuedOffline[issuedOffline.length - 1]).toBe('WG-LHR-1040');
    expect(getRemainingBlockCount(LAHORE_BRANCH.id, 'bilty')).toBe(0);

    // 21st allocation offline MUST throw OfflineBlockExhaustedError (refuse issuing)
    await expect(allocateNextBiltyNumber(undefined, LAHORE_BRANCH)).rejects.toBeInstanceOf(
      OfflineBlockExhaustedError
    );

    // Coming back online reserves fresh block [1041..1060] seamlessly
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true, userAgent: 'vitest' },
      configurable: true
    });
    const postReconnect = await allocateNextBiltyNumber(undefined, LAHORE_BRANCH);
    expect(postReconnect).toBe('WG-LHR-1041');
  });

  it('triggers background refill when remaining block numbers drop below low-water mark (< 5)', async () => {
    setActiveBranchId(LAHORE_BRANCH.id);
    await reserveNextNumberBlockTransaction(LAHORE_BRANCH.id, 'bilty', 1001);
    const txBefore = mockState.txCount;

    // Consume until remaining drops below BRANCH_NUMBER_BLOCK_LOW_WATER (5)
    for (let i = 0; i < BRANCH_NUMBER_BLOCK_SIZE - BRANCH_NUMBER_BLOCK_LOW_WATER + 1; i++) {
      await allocateNextBiltyNumber(undefined, LAHORE_BRANCH);
    }

    // Flush microtasks for background reservation
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(mockState.txCount).toBeGreaterThan(txBefore);
    const refreshedBlock = getLocalNumberBlock(LAHORE_BRANCH.id, 'bilty');
    expect(refreshedBlock?.end).toBe(1040);
  });

  it('preserves duplicate colliding bilty records without silent renumbering and resolves on explicit action', async () => {
    setActiveBranchId(LAHORE_BRANCH.id);
    const recA: BiltyRecord = {
      id: 10001,
      branchId: LAHORE_BRANCH.id,
      biltyNo: 'WG-LHR-1001',
      vehicleNo: 'LHR-111',
      date: '2026-11-20',
      driverName: 'Ali',
      mobileNo: '0300-1111111',
      sendingCity: 'Lahore',
      receivingCity: 'Multan',
      senderName: 'Party One',
      senderMobile: '0300-1111111',
      receiverName: 'Party Two',
      receiverMobile: '0300-2222222',
      senderCnic: '35201-1234567-1',
      qty: '10',
      itemDescription: 'Cotton',
      weight: '500',
      total: 15000,
      advance: 0,
      payable: 15000
    };
    const recB: BiltyRecord = {
      ...recA,
      id: 10002,
      vehicleNo: 'LHR-222',
      senderName: 'Different Party',
      receiverName: 'Different Receiver',
      total: 22000,
      payable: 22000
    };

    saveStoredBilties([recA, recB]);
    const flagged = getStoredBilties();
    expect(flagged).toHaveLength(2);
    expect(flagged.every(b => b.biltyNo === 'WG-LHR-1001')).toBe(true);
    expect(flagged.every(b => b.numberConflict === true)).toBe(true);

    const resolvedList = await resolveBiltyNumberConflict(10002, LAHORE_BRANCH);
    expect(resolvedList).toHaveLength(2);
    expect(resolvedList.every(b => !b.numberConflict)).toBe(true);
    const resolvedNumbers = new Set(resolvedList.map(b => b.biltyNo));
    expect(resolvedNumbers.size).toBe(2);
    expect(resolvedNumbers.has('WG-LHR-1001')).toBe(true);
  });

  it('builds public verification payload with branchId and biltyId while excluding all PII', () => {
    const payload = buildPublicBiltyCloudPayload({
      id: 999,
      branchId: LAHORE_BRANCH.id,
      biltyNo: 'WG-LHR-10001',
      date: '2026-11-20',
      sendingCity: 'Lahore',
      receivingCity: 'Karachi',
      itemDescription: 'Electronics',
      qty: '20 Boxes',
      weight: '1200 kg',
      vehicleNo: 'LES-5555',
      senderName: 'Secret Sender',
      senderMobile: '0300-9998887',
      senderCnic: '35202-1234567-1',
      total: 50000
    });

    expect(payload.biltyNo).toBe('WG-LHR-10001');
    expect(payload.branchId).toBe(LAHORE_BRANCH.id);
    expect(payload.biltyId).toBe(999);
    const rawPayload = payload as unknown as Record<string, unknown>;
    expect(rawPayload.senderName).toBeUndefined();
    expect(rawPayload.senderCnic).toBeUndefined();
    expect(rawPayload.total).toBeUndefined();
  });

  it('reserves Adda bill numbers via counters/bill 20-block and never reuses deleted bill numbers', async () => {
    setActiveBranchId(LAHORE_BRANCH.id);

    const b1 = await allocateNextAddaBillNumberAsync(LAHORE_BRANCH.id);
    const b2 = await allocateNextAddaBillNumberAsync(LAHORE_BRANCH.id);
    expect(b1).toBe('BILL-001');
    expect(b2).toBe('BILL-002');

    const billCounterDoc = mockState.docs.get(`branches/${LAHORE_BRANCH.id}/counters/bill`) as Record<string, unknown>;
    expect(billCounterDoc?.nextSeq).toBe(21);

    // Save BILL-002 then delete it; next bill must be BILL-003, never reusing BILL-002
    saveAddaBillsList(LAHORE_BRANCH.id, [
      {
        id: 'bill_2',
        branchId: LAHORE_BRANCH.id,
        billNumber: 'BILL-002',
        date: '2026-11-20',
        partyName: 'Test Party',
        items: [],
        subtotal: 5000,
        extraCharges: 0,
        discount: 0,
        totalAmount: 5000,
        status: 'billed',
        companySnapshot: {
          nameUr: 'U',
          nameEn: 'E',
          proprietorUr: 'PU',
          proprietorEn: 'PE',
          addressUr: 'AU',
          addressEn: 'AE',
          phone: '0300',
          ntn: '123'
        },
        createdAt: '2026-11-20T00:00:00Z',
        updatedAt: '2026-11-20T00:00:00Z'
      }
    ]);
    deleteAddaBill(LAHORE_BRANCH.id, 'bill_2');
    expect(getAddaBills(LAHORE_BRANCH.id)).toHaveLength(0);

    const b3 = allocateNextAddaBillNumber(LAHORE_BRANCH.id);
    expect(b3).toBe('BILL-003');
  });
});
