import { describe, it, expect, beforeEach } from 'vitest';
import { extractPublicBiltyVerification, getBiltyAccessConfig } from '../utils/storage';
import { validateVehicleAccountFinancials, formatSafeCurrencyPKR, formatPKR } from '../utils/calculator';
import { getBiltyVerificationUrl } from '../utils/biltyHelpers';
import { BiltyRecord } from '../types';

describe('Deep Audit Fixes Verification Suite', () => {
  const store: Record<string, string> = {};
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = String(val); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (i: number) => Object.keys(store)[i] || null,
      get length() { return Object.keys(store).length; }
    } as any;
  }

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Public Bilty Verification Privacy & QR URL', () => {
    it('should extract public bilty verification with ONLY the 8 sanitized fields and uppercase biltyNo', () => {
      const fullBilty: BiltyRecord = {
        id: 12345,
        biltyNo: 'wgt-99214',
        vehicleNo: 'LES-1234',
        driverName: 'Muhammad Ali',
        mobileNo: '03001234567',
        senderName: 'Warraich Traders',
        senderMobile: '03009876543',
        senderCnic: '35201-1234567-1',
        receiverName: 'Karachi Wholesale',
        receiverMobile: '03331112223',
        sendingCity: 'Lahore',
        receivingCity: 'Karachi',
        qty: '100 Bags',
        itemDescription: 'Rice',
        weight: '5000 kg',
        total: 150000,
        advance: 50000,
        payable: 100000,
        date: '2026-03-30'
      };

      const publicVerification = extractPublicBiltyVerification(fullBilty);

      expect(Object.keys(publicVerification).sort()).toEqual([
        'biltyDate',
        'biltyNo',
        'destination',
        'goodsDescription',
        'origin',
        'status',
        'vehicleNo',
        'weightOrQty'
      ]);

      expect(publicVerification.biltyNo).toBe('WGT-99214');
      expect(publicVerification.biltyDate).toBe('2026-03-30');
      expect(publicVerification.origin).toBe('Lahore');
      expect(publicVerification.destination).toBe('Karachi');
      expect(publicVerification.goodsDescription).toBe('Rice');
      expect(publicVerification.weightOrQty).toBe('100 Bags / 5000 kg');
      expect(publicVerification.vehicleNo).toBe('LES-1234');
      expect(publicVerification.status).toBe('Verified');

      const deliveredVerification = extractPublicBiltyVerification({
        ...fullBilty,
        isDelivered: true
      });
      expect(deliveredVerification.status).toBe('Verified');

      // Verify that CNICs, phone numbers, freight amounts, payment, driver details, and party names DO NOT exist
      expect((publicVerification as any).total).toBeUndefined();
      expect((publicVerification as any).advance).toBeUndefined();
      expect((publicVerification as any).payable).toBeUndefined();
      expect((publicVerification as any).freight).toBeUndefined();
      expect((publicVerification as any).paymentStatus).toBeUndefined();
      expect((publicVerification as any).senderCnic).toBeUndefined();
      expect((publicVerification as any).senderMobile).toBeUndefined();
      expect((publicVerification as any).receiverMobile).toBeUndefined();
      expect((publicVerification as any).mobileNo).toBeUndefined();
      expect((publicVerification as any).driverName).toBeUndefined();
      expect((publicVerification as any).senderName).toBeUndefined();
      expect((publicVerification as any).receiverName).toBeUndefined();
    });

    it('should generate official verification QR URL without vdata or financial tokens', () => {
      const url = getBiltyVerificationUrl('AH-2026-0001');
      expect(url).toBe('https://zahdan-443.github.io/Warraichgoodstransportcompany/?page=verify&bilty=AH-2026-0001');
      expect(url).not.toContain('vdata');
    });
  });

  describe('Non-Owner Bilty Access Control Guard', () => {
    it('should return default allowed owner email when unauthenticated or non-owner without error', async () => {
      const config = await getBiltyAccessConfig();
      expect(config.allowedEmails).toContain('warraichgoods43@gmail.com');
      expect(Array.isArray(config.allowedUIDs)).toBe(true);
    });
  });

  describe('Vehicle Account Financial Calculation & PKR Formatting', () => {
    it('should correctly sum vehicle incomes and expenses without NaN', () => {
      const incomes = [{ amount: 200000 }, { amount: 50000 }];
      const expenses = {
        diesel: 80000,
        toll: 12000,
        challan: 2000,
        rotiKharcha: 5000,
        chowkidara: 1000,
        gariKaam: 15000,
        driverCommission: 10000,
        customTotal: 5000
      };

      const result = validateVehicleAccountFinancials(incomes, expenses);

      expect(result.isValid).toBe(true);
      expect(result.totalIncome).toBe(250000);
      expect(result.totalExpense).toBe(130000);
      expect(result.netProfit).toBe(120000);
    });

    it('should format PKR currency safely for NaN and undefined inputs', () => {
      expect(formatSafeCurrencyPKR(150000)).toBe('PKR 150,000');
      expect(formatSafeCurrencyPKR(NaN)).toBe('PKR 0');
      expect(formatPKR(2500)).toBe('Rs 2,500');
      expect(formatPKR(NaN)).toBe('Rs 0');
    });
  });

  describe('Bilty Sequential WG-1001 Allocation', () => {
    it('should allocate next Bilty number strictly starting from WG-1001', async () => {
      const { allocateNextBiltyNumber, getNextBiltyNo } = await import('../utils/storage');
      const num1 = getNextBiltyNo();
      expect(num1).toBe('WG-1001');

      const num2 = await allocateNextBiltyNumber();
      expect(num2).toBe('WG-1002');

      const num3 = getNextBiltyNo();
      expect(num3).toBe('WG-1003');
    });

    it('should disambiguate colliding duplicate WG-1001 records and preserve both', async () => {
      const { getStoredBilties, safeStorage } = await import('../utils/storage');
      const mockRecord1 = {
        id: 1730000001,
        biltyNo: 'WG-1001',
        vehicleNo: 'LHR-1111',
        senderName: 'Sender A',
        receiverName: 'Receiver A',
        itemDescription: 'Cotton Bales',
        total: 50000
      };
      const mockRecord2 = {
        id: 1730000002,
        biltyNo: 'WG-1001', // Colliding number from previous bug
        vehicleNo: 'FSD-2222',
        senderName: 'Sender B',
        receiverName: 'Receiver B',
        itemDescription: 'Textile Yarn',
        total: 75000
      };

      safeStorage.setItem('ah-bilties', JSON.stringify([mockRecord1, mockRecord2]));
      const restored = getStoredBilties();
      expect(restored.length).toBe(2);
      const numbers = restored.map(b => b.biltyNo);
      expect(numbers).toContain('WG-1001');
      expect(numbers).toContain('WG-1002');
    });
  });

  describe('Fuel Price Logic & Sanity Bounds (Audit Fix B-01 & B-02)', () => {
    it('should accept diesel prices below 340 if within sane economic bounds (100 - 1000 PKR)', async () => {
      const { isSaneFuelPrice, getStoredFuelPrices, FUEL_CACHE_KEY } = await import('../utils/fuelPrice');
      
      expect(isSaneFuelPrice(320)).toBe(true);
      expect(isSaneFuelPrice(374.31)).toBe(true);
      expect(isSaneFuelPrice(99)).toBe(false);
      expect(isSaneFuelPrice(1200)).toBe(false);
      expect(isSaneFuelPrice(NaN)).toBe(false);

      // Verify that storing a valid price under 340 (e.g. 320) is preserved and not discarded
      localStorage.setItem(FUEL_CACHE_KEY, JSON.stringify({
        diesel: '320.00',
        petrol: '310.00',
        hiOctane: '350.00',
        ldo: '190.00',
        kerosene: '270.00',
        effectiveDate: '01-October-2026',
        lastUpdated: '01:00 AM',
        source: 'fuel.trackmate.page',
        timestamp: Date.now()
      }));

      const stored = getStoredFuelPrices();
      expect(stored.diesel).toBe('320.00');
      expect(stored.petrol).toBe('310.00');
    });
  });
});
