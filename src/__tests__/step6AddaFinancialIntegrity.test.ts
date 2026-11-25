import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockState = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  return {
    docs,
    mockUser: {
      uid: 'branch_owner_uid_1',
      email: 'owner@branch1.test'
    } as { uid: string; email: string } | null,
    reset() {
      docs.clear();
      this.mockUser = {
        uid: 'branch_owner_uid_1',
        email: 'owner@branch1.test'
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
    query: (target: unknown) => target,
    where: () => ({}),
    orderBy: () => ({}),
    limit: () => ({}),
    getDoc: async (ref: { path: string }) => {
      const val = mockState.docs.get(ref.path);
      return {
        exists: () => val !== undefined,
        id: ref.path.split('/').pop(),
        ref,
        data: () => val
      };
    },
    getDocs: async (ref: { path?: string }) => {
      const targetPath = ref.path || '';
      const matched = Array.from(mockState.docs.entries())
        .filter(([p]) => p.startsWith(targetPath + '/'))
        .map(([p, d]) => ({
          id: p.split('/').pop() || '',
          ref: { path: p },
          data: () => d
        }));
      return {
        docs: matched,
        empty: matched.length === 0,
        forEach: (cb: (doc: any) => void) => matched.forEach(cb)
      };
    },
    setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      const prev = opts?.merge ? mockState.docs.get(ref.path) || {} : {};
      mockState.docs.set(ref.path, { ...prev, ...data });
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
            mockState.docs.set(ref.path, { ...prev, ...data });
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
        mockState.docs.set(w.path, { ...prev, ...w.data });
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
  AddaLifecycleError,
  assertBiltyDeleteAllowedForAdda,
  assertBiltyEditAllowedForAdda,
  computePartyMatchKey,
  createAddaBillTransactional,
  deleteAddaBill,
  getAddaBills,
  getAddaParties,
  getAddaPendingCommissions,
  getAddaPendingFreight,
  getBillPaidPaisa,
  getBillRemainingPaisa,
  recordAddaBillPayment,
  reverseAddaBillPayment,
  syncBiltyAddaLinks,
  syncBiltyDeleteAddaCleanup,
  upsertAddaPendingCommission,
  upsertAddaPendingFreight
} from '../utils/addaBillingStorage';
import { fromPaisa, toPaisa } from '../utils/calculator';
import { KHATA_STORAGE_KEYS } from '../utils/ledgerStorage';
import type { BiltyRecord } from '../types';

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

function makeBilty(overrides: Partial<BiltyRecord> = {}): BiltyRecord {
  return {
    id: 101,
    branchId: 'lahore_branch',
    branch: 'lahore_branch',
    biltyNo: 'WG-LHR-1001',
    date: '2026-11-25',
    senderName: 'Al-Noor Traders',
    senderMobile: '03001112233',
    senderCnic: '33100-0000000-1',
    receiverName: 'Madina Mills',
    receiverMobile: '03002223344',
    sendingCity: 'Samundri',
    receivingCity: 'Lahore',
    vehicleNo: 'LHR-5511',
    driverName: 'Akram',
    mobileNo: '03001112233',
    qty: '20',
    itemDescription: 'Sugar bags',
    weight: '1000',
    total: 45000,
    advance: 0,
    payable: 45000,
    isDelivered: false,
    createdAt: '2026-11-25T08:00:00Z',
    ...overrides
  };
}

describe('Step 6: Adda Financial Integrity, Paisa Math, Parties & Atomic Billing', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
    Object.defineProperty(globalThis, 'navigator', {
      value: { ...(globalThis.navigator || {}), onLine: true },
      configurable: true,
      writable: true
    });
    mockState.reset();
  });

  it('uses integer paisa arithmetic without float drift and rejects zero/negative amounts', () => {
    // Classic JS float hazard: 100.1 + 200.2 = 300.30000000000004
    const f1 = upsertAddaPendingFreight({
      branchId: 'head',
      biltyNo: 'WG-1001',
      date: '2026-11-25',
      partyName: 'Crescent Logistics',
      partyMobile: '03001234567',
      amount: 100.1
    });
    const c1 = upsertAddaPendingCommission({
      branchId: 'head',
      biltyNo: 'WG-1001',
      date: '2026-11-25',
      fromWhomName: 'Crescent Logistics',
      fromWhomMobile: '03001234567',
      amount: 200.2
    });

    expect(f1.amountPaisa).toBe(10010);
    expect(c1.amountPaisa).toBe(20020);
    expect(fromPaisa(f1.amountPaisa! + c1.amountPaisa!)).toBe(300.3);

    expect(() =>
      upsertAddaPendingFreight({
        branchId: 'head',
        biltyNo: 'WG-1002',
        date: '2026-11-25',
        partyName: 'Zero Co',
        partyMobile: '03001111111',
        amount: 0
      })
    ).toThrow(AddaLifecycleError);

    expect(() =>
      upsertAddaPendingCommission({
        branchId: 'head',
        biltyNo: 'WG-1003',
        date: '2026-11-25',
        fromWhomName: 'Negative Co',
        fromWhomMobile: '03001111111',
        amount: -500
      })
    ).toThrow(AddaLifecycleError);
  });

  it('distinguishes identical party names with different mobiles while unifying phone format variants', () => {
    const f1 = upsertAddaPendingFreight({
      branchId: 'lahore_branch',
      biltyNo: 'WG-LHR-1001',
      date: '2026-11-25',
      partyName: '  Al-Noor   Transport ',
      partyMobile: '0300-1111111',
      amount: 5000
    });
    const f2 = upsertAddaPendingFreight({
      branchId: 'lahore_branch',
      biltyNo: 'WG-LHR-1002',
      date: '2026-11-25',
      partyName: 'al-noor transport',
      partyMobile: '+92 300 1111111',
      amount: 7000
    });
    const f3 = upsertAddaPendingFreight({
      branchId: 'lahore_branch',
      biltyNo: 'WG-LHR-1003',
      date: '2026-11-25',
      partyName: 'Al-Noor Transport',
      partyMobile: '0321-9999999',
      amount: 9000
    });

    expect(f1.partyId).toBe(f2.partyId);
    expect(f3.partyId).not.toBe(f1.partyId);
    expect(computePartyMatchKey('Al-Noor Transport', '03001111111')).toBe(
      computePartyMatchKey('al-noor  transport', '+92-300-1111111')
    );
    expect(computePartyMatchKey('Al-Noor Transport', '03001111111')).not.toBe(
      computePartyMatchKey('Al-Noor Transport', '03219999999')
    );

    const parties = getAddaParties('lahore_branch');
    expect(parties.length).toBe(2);
  });

  it('prevents concurrent double-billing via Firestore transaction + double-submit lock', async () => {
    const f = upsertAddaPendingFreight({
      branchId: 'lahore_branch',
      biltyNo: 'WG-LHR-1001',
      date: '2026-11-25',
      partyName: 'Madina Traders',
      partyMobile: '03005554444',
      amount: 12000
    });

    // Simulate another device already billing the cloud document before local device submits
    mockState.docs.set(`branches/lahore_branch/adda_items/${f.id}`, {
      ...f,
      kind: 'freight',
      status: 'billed',
      billNumber: 'BILL-099'
    });

    await expect(
      createAddaBillTransactional({
        branchId: 'lahore_branch',
        partyId: f.partyId,
        partyName: f.partyName,
        partyMobile: f.partyMobile,
        selectedFreightIds: [f.id],
        selectedCommissionIds: []
      })
    ).rejects.toMatchObject({ code: 'ALREADY_BILLED' });

    // Restore cloud item to 'pending' and verify winner succeeds while immediate second call fails
    mockState.docs.set(`branches/lahore_branch/adda_items/${f.id}`, {
      ...f,
      kind: 'freight',
      status: 'pending'
    });

    const bill = await createAddaBillTransactional({
      branchId: 'lahore_branch',
      partyId: f.partyId,
      partyName: f.partyName,
      partyMobile: f.partyMobile,
      selectedFreightIds: [f.id],
      selectedCommissionIds: []
    });
    expect(bill.status).toBe('billed');
    expect(bill.totalAmountPaisa).toBe(toPaisa(12000));

    await expect(
      createAddaBillTransactional({
        branchId: 'lahore_branch',
        partyId: f.partyId,
        partyName: f.partyName,
        partyMobile: f.partyMobile,
        selectedFreightIds: [f.id],
        selectedCommissionIds: []
      })
    ).rejects.toMatchObject({ code: 'ALREADY_BILLED' });
  });

  it('supports partial settlements, idempotency keys, overpayment confirmation, reversal & delete gating', async () => {
    const f = upsertAddaPendingFreight({
      branchId: 'lahore_branch',
      biltyNo: 'WG-LHR-1005',
      date: '2026-11-25',
      partyName: 'Sitara Mills',
      partyMobile: '03017778888',
      amount: 10000
    });
    const bill = await createAddaBillTransactional({
      branchId: 'lahore_branch',
      partyId: f.partyId,
      partyName: f.partyName,
      partyMobile: f.partyMobile,
      selectedFreightIds: [f.id],
      selectedCommissionIds: []
    });

    // 1. Partial payment
    const p1 = recordAddaBillPayment('lahore_branch', bill.id, {
      amountRupees: 4000,
      idempotencyKey: 'idem_1',
      note: 'Cash installment'
    });
    expect(p1.status).toBe('recorded');
    expect(p1.bill.status).toBe('partial');
    expect(getBillPaidPaisa(p1.bill)).toBe(toPaisa(4000));
    expect(getBillRemainingPaisa(p1.bill)).toBe(toPaisa(6000));
    expect(getAddaPendingFreight('lahore_branch').find(x => x.id === f.id)?.status).toBe('billed');

    // 2. Duplicate idempotency key does NOT double-credit
    const dup = recordAddaBillPayment('lahore_branch', bill.id, {
      amountRupees: 4000,
      idempotencyKey: 'idem_1'
    });
    expect(dup.status).toBe('duplicate');
    expect(getBillPaidPaisa(dup.bill)).toBe(toPaisa(4000));

    // 3. Cannot delete a bill that has recorded payments
    expect(() => deleteAddaBill('lahore_branch', bill.id)).toThrow(AddaLifecycleError);

    // 4. Overpayment asks for confirmation first, then succeeds when confirmed
    const overPrompt = recordAddaBillPayment('lahore_branch', bill.id, {
      amountRupees: 7000,
      idempotencyKey: 'idem_2'
    });
    expect(overPrompt.status).toBe('needs_overpayment_confirmation');
    if (overPrompt.status === 'needs_overpayment_confirmation') {
      expect(overPrompt.remainingPaisa).toBe(toPaisa(6000));
      expect(overPrompt.overpaymentPaisa).toBe(toPaisa(1000));
    }

    const overOk = recordAddaBillPayment('lahore_branch', bill.id, {
      amountRupees: 7000,
      idempotencyKey: 'idem_2',
      confirmOverpayment: true
    });
    expect(overOk.status).toBe('recorded');
    expect(overOk.bill.status).toBe('paid');
    expect(getAddaPendingFreight('lahore_branch').find(x => x.id === f.id)?.status).toBe('paid');

    // 5. Reverse both payments -> bill returns to 'billed', freight returns to 'billed', and delete becomes allowed
    const firstPayId = p1.status === 'recorded' ? p1.paymentEntry.id : '';
    const secondPayId = overOk.status === 'recorded' ? overOk.paymentEntry.id : '';
    const afterRev1 = reverseAddaBillPayment('lahore_branch', bill.id, secondPayId);
    expect(afterRev1.status).toBe('partial');
    expect(getAddaPendingFreight('lahore_branch').find(x => x.id === f.id)?.status).toBe('billed');

    const afterRev2 = reverseAddaBillPayment('lahore_branch', bill.id, firstPayId);
    expect(afterRev2.status).toBe('billed');
    expect(getBillPaidPaisa(afterRev2)).toBe(0);

    // 6. Now bill deletion is permitted and reverts linked item back to 'pending' (while keeping counters monotonically ascending)
    const billSeqBefore = bill.billNumber;
    deleteAddaBill('lahore_branch', bill.id);
    expect(getAddaBills('lahore_branch').length).toBe(0);
    expect(getAddaPendingFreight('lahore_branch').find(x => x.id === f.id)?.status).toBe('pending');
    expect(billSeqBefore).toBe('BILL-001');
  });

  it('binds Bilty edits & deletes to linked Adda status while allowing POD/legalHold/attachment updates and preserving Khata isolation', async () => {
    const bilty = makeBilty({ id: 505, biltyNo: 'WG-LHR-1050', total: 45000 });
    const links = syncBiltyAddaLinks({
      bilty,
      freightInput: { enabled: true, partyName: 'Al-Noor Traders', partyMobile: '03001112233', amount: 45000 },
      commissionInput: { enabled: true, fromWhomName: 'Agent X', fromWhomMobile: '03214445555', amount: 1500 }
    });
    const linkedBilty: BiltyRecord = { ...bilty, ...links };

    // Pending Bilty edit allowed
    expect(() =>
      assertBiltyEditAllowedForAdda(linkedBilty, { ...linkedBilty, total: 50000, payable: 50000 })
    ).not.toThrow();

    // Bill the freight item
    await createAddaBillTransactional({
      branchId: 'lahore_branch',
      partyName: 'Al-Noor Traders',
      partyMobile: '03001112233',
      selectedFreightIds: [links.pendingFreightId!],
      selectedCommissionIds: []
    });

    // Core edit & delete MUST be blocked now
    expect(() =>
      assertBiltyEditAllowedForAdda(linkedBilty, { ...linkedBilty, total: 50000, payable: 50000 })
    ).toThrow(AddaLifecycleError);
    expect(() => assertBiltyDeleteAllowedForAdda(linkedBilty)).toThrow(AddaLifecycleError);

    // POD delivery / legalHold / attachmentCount updates remain ALLOWED
    expect(() =>
      assertBiltyEditAllowedForAdda(linkedBilty, {
        ...linkedBilty,
        isDelivered: true,
        legalHold: true,
        attachmentCount: 2
      })
    ).not.toThrow();

    // Unbilled Bilty cleanup removes pending Adda items cleanly
    const unbilledBilty = makeBilty({ id: 606, biltyNo: 'WG-LHR-1060' });
    const unbilledLinks = syncBiltyAddaLinks({
      bilty: unbilledBilty,
      freightInput: { enabled: true, partyName: 'Quick Party', partyMobile: '03009990000', amount: 5000 }
    });
    const fullUnbilled = { ...unbilledBilty, ...unbilledLinks };
    expect(getAddaPendingFreight('lahore_branch').some(x => x.id === unbilledLinks.pendingFreightId)).toBe(true);
    syncBiltyDeleteAddaCleanup(fullUnbilled);
    expect(getAddaPendingFreight('lahore_branch').some(x => x.id === unbilledLinks.pendingFreightId)).toBe(false);

    // Strict isolation from Khata Ledger storage
    expect(localStorage.getItem(KHATA_STORAGE_KEYS.ACCOUNTS)).toBeNull();
    expect(localStorage.getItem(KHATA_STORAGE_KEYS.ENTRIES)).toBeNull();
    expect(localStorage.getItem(KHATA_STORAGE_KEYS.BILLS)).toBeNull();
  });
});
