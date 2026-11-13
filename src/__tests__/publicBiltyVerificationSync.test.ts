import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BiltyRecord } from '../types';

const mockDoc = vi.fn((_db: any, ...segments: string[]) => ({
  path: segments.join('/')
}));
const mockSetDoc = vi.fn(async (..._args: any[]) => undefined);
const mockDeleteDoc = vi.fn(async (..._args: any[]) => undefined);
const mockGetDoc = vi.fn(async (..._args: any[]) => ({ exists: () => false, data: () => undefined }));

vi.mock('firebase/firestore', () => ({
  doc: (_db: any, ...segments: string[]) => mockDoc(_db, ...segments),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  runTransaction: vi.fn(),
  onSnapshot: vi.fn()
}));

vi.mock('../utils/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'owner-uid',
      email: 'warraichgoods43@gmail.com'
    }
  },
  db: { __mockDb: true },
  deleteFirebaseUserAccount: vi.fn()
}));

describe('Public Bilty Verification Lifecycle (Create, Update, Delete)', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(store).forEach((k) => delete store[k]);
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
    } as any;
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      configurable: true
    });
  });

  it('writes sanitized 8-field copy to publicBiltyVerifications/{UPPERCASE_BILTY_NO} when saving', async () => {
    const { syncPublicBiltyVerification } = await import('../utils/storage');

    const bilty: BiltyRecord = {
      id: 101,
      biltyNo: 'wgt-99214',
      date: '2026-11-13',
      sendingCity: 'Lahore',
      receivingCity: 'Karachi',
      itemDescription: 'Cotton Bales',
      qty: '40 Bales',
      weight: '8000 kg',
      vehicleNo: 'LES-20-4124',
      senderName: 'Secret Sender',
      senderCnic: '35201-9999999-1',
      senderMobile: '03001112223',
      receiverName: 'Secret Receiver',
      receiverMobile: '03219998887',
      driverName: 'Secret Driver',
      mobileNo: '03451234567',
      total: 120000,
      advance: 40000,
      payable: 80000
    };

    const result = await syncPublicBiltyVerification(bilty);
    expect(result).toBe(true);

    expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'publicBiltyVerifications', 'WGT-99214');
    expect(mockSetDoc).toHaveBeenCalledTimes(1);

    const writtenPayload = mockSetDoc.mock.calls[0]?.[1];
    expect(writtenPayload).toEqual({
      biltyNo: 'WGT-99214',
      biltyDate: '2026-11-13',
      origin: 'Lahore',
      destination: 'Karachi',
      goodsDescription: 'Cotton Bales',
      weightOrQty: '40 Bales / 8000 kg',
      vehicleNo: 'LES-20-4124',
      status: 'In Transit'
    });
    expect(Object.keys(writtenPayload).sort()).toEqual([
      'biltyDate',
      'biltyNo',
      'destination',
      'goodsDescription',
      'origin',
      'status',
      'vehicleNo',
      'weightOrQty'
    ]);
  });

  it('updates sanitized copy when bilty changes and deletes it when bilty is deleted via saveStoredBilties', async () => {
    const { saveStoredBilties } = await import('../utils/storage');

    const initial: BiltyRecord = {
      id: 202,
      biltyNo: 'wgt-99214',
      date: '2026-11-13',
      sendingCity: 'Lahore',
      receivingCity: 'Multan',
      itemDescription: 'Wheat',
      qty: '50 Bags',
      weight: '2500 kg',
      vehicleNo: 'FSD-1111',
      driverName: 'Driver X',
      mobileNo: '03001111111',
      senderName: 'Sender X',
      senderCnic: '35201-1111111-1',
      senderMobile: '03002222222',
      receiverName: 'Receiver X',
      receiverMobile: '03003333333',
      total: 50000,
      advance: 0,
      payable: 50000
    };

    saveStoredBilties([initial]);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: 'publicBiltyVerifications/WGT-99214' },
      expect.objectContaining({
        biltyNo: 'WGT-99214',
        destination: 'Multan',
        status: 'In Transit'
      })
    );

    vi.clearAllMocks();

    const edited: BiltyRecord = {
      ...initial,
      receivingCity: 'Islamabad',
      isDelivered: true
    };
    saveStoredBilties([edited]);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockSetDoc).toHaveBeenCalledWith(
      { path: 'publicBiltyVerifications/WGT-99214' },
      expect.objectContaining({
        biltyNo: 'WGT-99214',
        destination: 'Islamabad',
        status: 'Delivered'
      })
    );

    vi.clearAllMocks();

    saveStoredBilties([]);
    await new Promise((r) => setTimeout(r, 10));

    expect(mockDeleteDoc).toHaveBeenCalledWith({
      path: 'publicBiltyVerifications/WGT-99214'
    });
  });

  it('deletes public verification doc and clears pending offline queue items in deletePublicBiltyVerification', async () => {
    const { enqueueOfflineAction, deletePublicBiltyVerification, getStoredOfflineQueue } = await import('../utils/storage');

    enqueueOfflineAction('public_bilty', {
      biltyNo: 'WGT-99214',
      biltyDate: '2026-11-13',
      origin: 'Lahore',
      destination: 'Karachi',
      goodsDescription: 'Rice',
      weightOrQty: '100 Bags',
      vehicleNo: 'LES-1234',
      status: 'In Transit'
    });
    expect(getStoredOfflineQueue().some((q) => q.data?.biltyNo === 'WGT-99214')).toBe(true);

    const ok = await deletePublicBiltyVerification('wgt-99214');
    expect(ok).toBe(true);
    expect(mockDeleteDoc).toHaveBeenCalledWith({
      path: 'publicBiltyVerifications/WGT-99214'
    });
    expect(getStoredOfflineQueue().some((q) => q.data?.biltyNo === 'WGT-99214')).toBe(false);
  });
});
