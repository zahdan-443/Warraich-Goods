import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatBiltyMobile, formatStrictBiltyNumber } from '../utils/biltyHelpers';
import { getNextBiltyNo, saveStoredBilties, setScopedItem } from '../utils/storage';
import { generateBiltyLegalZip, downloadBiltyLegalZip } from '../utils/zipHelper';
import type { BiltyRecord } from '../types';

describe('Bilty Mobile Phone Formatting', () => {
  it('formats plain 11 digit numbers with hyphen after 4-digit operator code', () => {
    expect(formatBiltyMobile('03001234567')).toBe('0300-1234567');
    expect(formatBiltyMobile('03123456789')).toBe('0312-3456789');
  });

  it('normalizes slashes and irregular symbols to standard hyphen', () => {
    expect(formatBiltyMobile('0300/1234567')).toBe('0300-1234567');
    expect(formatBiltyMobile('0300-1234567')).toBe('0300-1234567');
    expect(formatBiltyMobile('0300 1234567')).toBe('0300-1234567');
  });

  it('handles partial typing correctly', () => {
    expect(formatBiltyMobile('0300')).toBe('0300');
    expect(formatBiltyMobile('03001')).toBe('0300-1');
    expect(formatBiltyMobile('03')).toBe('03');
    expect(formatBiltyMobile('')).toBe('');
  });

  it('caps number at 11 digits (4 operator + 7 subscriber)', () => {
    expect(formatBiltyMobile('0300123456789999')).toBe('0300-1234567');
  });
});

describe('Strict 4-Digit Bilty Number Ceiling (WG-XXXX)', () => {
  it('formats numeric and string bilty numbers strictly into 4 digits', () => {
    expect(formatStrictBiltyNumber('1001')).toBe('WG-1001');
    expect(formatStrictBiltyNumber('WG-1001')).toBe('WG-1001');
    expect(formatStrictBiltyNumber('WG-9999')).toBe('WG-9999');
  });

  it('clamps numbers smaller than 4 digits to 4 zero-padded digits', () => {
    expect(formatStrictBiltyNumber('WG-42')).toBe('WG-0042');
    expect(formatStrictBiltyNumber('5')).toBe('WG-0005');
  });

  it('clamps numbers larger than 4 digits to the last 4 digits (max 4 digits)', () => {
    expect(formatStrictBiltyNumber('WG-12345')).toBe('WG-2345');
    expect(formatStrictBiltyNumber('WG-100000')).toBe('WG-0000');
  });

  const createMockBilty = (biltyNo: string): BiltyRecord => ({
    id: Date.now(),
    biltyNo,
    date: '2026-11-01',
    driverName: 'Test Driver',
    mobileNo: '0300-1112233',
    senderName: 'Sender Co',
    senderMobile: '0300-1111222',
    receiverName: 'Receiver Co',
    receiverMobile: '0321-9999888',
    senderCnic: '33301-1234567-1',
    sendingCity: 'Samundri',
    receivingCity: 'Lahore',
    vehicleNo: 'ABC-123',
    total: 5000,
    advance: 0,
    payable: 5000,
    qty: '10',
    itemDescription: 'Goods',
    weight: '100'
  });

  it('getNextBiltyNo produces numbers strictly within WG-1001 to WG-9999 range', () => {
    const list: BiltyRecord[] = [createMockBilty('WG-1001')];
    saveStoredBilties(list);
    setScopedItem('bilty-counter', '1001');
    const nextNo = getNextBiltyNo();
    expect(nextNo).toMatch(/^WG-\d{4}$/);
    expect(nextNo).toBe('WG-1002');
  });

  it('cycles back to 4 digits if existing counter reaches WG-9999', () => {
    const list: BiltyRecord[] = [createMockBilty('WG-9999')];
    saveStoredBilties(list);
    setScopedItem('bilty-counter', '9999');
    const nextNo = getNextBiltyNo();
    expect(nextNo).toBe('WG-1001');
  });
});

describe('Legal Vault ZIP Package Generation', () => {
  let originalDocument: any;
  let originalCreateObjectURL: any;
  let originalRevokeObjectURL: any;

  beforeEach(() => {
    originalDocument = (globalThis as any).document;
    originalCreateObjectURL = (globalThis as any).URL?.createObjectURL;
    originalRevokeObjectURL = (globalThis as any).URL?.revokeObjectURL;

    if (!globalThis.URL) {
      (globalThis as any).URL = {};
    }
    (globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    (globalThis as any).URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    (globalThis as any).document = originalDocument;
    if (originalCreateObjectURL) {
      (globalThis as any).URL.createObjectURL = originalCreateObjectURL;
    }
    if (originalRevokeObjectURL) {
      (globalThis as any).URL.revokeObjectURL = originalRevokeObjectURL;
    }
    vi.restoreAllMocks();
  });

  it('generates ZIP blob containing summary and attached media', async () => {
    const sampleBilty: BiltyRecord = {
      id: 1050,
      biltyNo: 'WG-1050',
      date: '2026-11-01',
      senderName: 'Tariq Goods',
      senderMobile: '0300-1111222',
      receiverName: 'Karachi Traders',
      receiverMobile: '0321-9999888',
      senderCnic: '33301-1234567-1',
      sendingCity: 'Samundri',
      receivingCity: 'Karachi',
      vehicleNo: 'TL-999',
      driverName: 'Muhammad Aslam',
      mobileNo: '0301-4445556',
      total: 85000,
      advance: 25000,
      payable: 60000,
      qty: '200',
      weight: '5000',
      itemDescription: 'Cotton Bales',
      legalVault: {
        driverPhoto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        recordings: [
          {
            id: 'rec-1',
            name: 'Sender Confirmation Call',
            dataUrl: 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQ8=',
            createdAt: '2026-11-01T12:00:00Z',
            duration: 12
          }
        ]
      }
    };

    const zipBlob = await generateBiltyLegalZip({ record: sampleBilty });
    expect(zipBlob).toBeDefined();
    expect(zipBlob.size).toBeGreaterThan(0);
  });

  it('downloads ZIP file via DOM anchor trigger', async () => {
    let clicked = false;
    let assignedDownload = '';

    (globalThis as any).document = {
      createElement: vi.fn((tag: string) => {
        if (tag === 'a') {
          const el = {
            href: '',
            get download() {
              return assignedDownload;
            },
            set download(val: string) {
              assignedDownload = val;
            },
            click: vi.fn(() => {
              clicked = true;
            })
          };
          return el;
        }
        return {};
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };

    const sampleBilty: BiltyRecord = {
      id: 1051,
      biltyNo: 'WG-1050',
      date: '2026-11-01',
      senderName: 'Tariq Goods',
      senderMobile: '0300-1111222',
      receiverName: 'Karachi Traders',
      receiverMobile: '0321-9999888',
      senderCnic: '33301-1234567-1',
      sendingCity: 'Samundri',
      receivingCity: 'Karachi',
      vehicleNo: 'TL-999',
      driverName: 'Muhammad Aslam',
      mobileNo: '0301-4445556',
      total: 50000,
      advance: 0,
      payable: 50000,
      qty: '50',
      weight: '1000',
      itemDescription: 'General'
    };

    await downloadBiltyLegalZip(sampleBilty);
    expect(clicked).toBe(true);
    expect(assignedDownload).toBe('Bilty_WG-1050_Legal_Vault.zip');
  });
});
