import { describe, it, expect, beforeEach } from 'vitest';
import { extractPublicBiltyVerification, getBiltyAccessConfig } from '../utils/storage';
import { validateVehicleAccountFinancials, formatSafeCurrencyPKR, formatPKR } from '../utils/calculator';
import { getBiltyVerificationUrl } from '../utils/biltyHelpers';
import { BiltyRecord } from '../types';

describe('Deep Audit Fixes Verification Suite', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Public Bilty Verification Privacy & QR URL', () => {
    it('should extract full public bilty verification fields for complete QR document verification', () => {
      const fullBilty: BiltyRecord = {
        id: 12345,
        biltyNo: 'AH-2026-0001',
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

      // Verify all fields are present for full document authenticity verification
      expect(publicVerification.biltyNo).toBe('AH-2026-0001');
      expect(publicVerification.vehicleNo).toBe('LES-1234');
      expect(publicVerification.sendingCity).toBe('Lahore');
      expect(publicVerification.receivingCity).toBe('Karachi');
      expect(publicVerification.itemDescription).toBe('Rice');
      expect(publicVerification.qty).toBe('100 Bags');
      expect(publicVerification.weight).toBe('5000 kg');
      expect(publicVerification.verifiedPublicly).toBe(true);

      // Verify party details and financial fields are included for complete document matching
      expect(publicVerification.senderName).toBe('Warraich Traders');
      expect(publicVerification.receiverName).toBe('Karachi Wholesale');
      expect(publicVerification.total).toBe(150000);
      expect(publicVerification.advance).toBe(50000);
      expect(publicVerification.payable).toBe(100000);
      expect(publicVerification.senderCnic).toBe('35201-1234567-1');
      expect(publicVerification.senderMobile).toBe('03009876543');
      expect(publicVerification.receiverMobile).toBe('03331112223');
      expect(publicVerification.mobileNo).toBe('03001234567');
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
});
