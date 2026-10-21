import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateVehicleProfitLoss,
  formatPartyWhatsAppReminder,
  formatBrokerWhatsAppReminder,
  getCleanPhoneForWhatsApp,
  getTopPartiesRanking,
  syncFreightRecordsToLedger,
  getStoredParties,
  saveStoredParties,
  getStoredPartyTransactions,
  saveStoredPartyTransactions,
  getStoredVehicleIncomes,
  saveStoredVehicleIncomes,
  saveOrUpdateParty,
  addPartyTransaction
} from '../utils/ledgerStorage';
import { LedgerParty, PartyTransaction, LedgerBroker, BrokerTransaction, Trip, BiltyRecord } from '../types';
import * as storageModule from '../utils/storage';

describe('Financial Ledger (حساب کتاب) Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    [
      'dd_ledger_parties',
      'dd_ledger_party_transactions',
      'dd_ledger_brokers',
      'dd_ledger_broker_transactions',
      'dd_ledger_vehicle_expenses',
      'dd_ledger_vehicle_income'
    ].forEach(k => storageModule.safeStorage.removeItem(k));
  });

  describe('Vehicle Profit/Loss & Profit Per KM', () => {
    it('calculates net profit and profit per KM correctly for positive distance', () => {
      const mockTrips: Trip[] = [
        {
          id: 1,
          name: 'Samundri to Lahore',
          fuelType: 'Diesel',
          fuelTypeRaw: 'diesel',
          dist: 200,
          consumed: '28.5',
          fuelCost: 8000,
          toll: 1500,
          loading: 500,
          driver: 1000,
          other: 0,
          total: 11000,
          date: '2026-10-15',
          time: '10:00 AM',
          month: 'Oct 26',
          expectedIncome: 21000,
          totalIncome: 21000,
          netProfit: 10000,
          isReturn: false
        }
      ];

      const res = calculateVehicleProfitLoss('all', 'all', undefined, undefined, mockTrips);
      expect(res.totalIncome).toBe(21000);
      expect(res.totalExpenses).toBe(11000);
      expect(res.netProfit).toBe(10000);
      expect(res.isProfit).toBe(true);
      expect(res.totalDistanceKm).toBe(200);
      // Profit per KM = 10000 / 200 = 50
      expect(res.profitPerKm).toBe(50);
    });

    it('returns "N/A" for profit per KM when total distance is zero', () => {
      const mockTrips: Trip[] = [
        {
          id: 2,
          name: 'Yard Maintenance',
          fuelType: 'Diesel',
          fuelTypeRaw: 'diesel',
          dist: 0,
          consumed: '0',
          fuelCost: 2000,
          toll: 0,
          loading: 0,
          driver: 0,
          other: 500,
          total: 2500,
          date: '2026-10-16',
          time: '02:00 PM',
          month: 'Oct 26',
          expectedIncome: 5000,
          totalIncome: 5000,
          netProfit: 2500,
          isReturn: false
        }
      ];

      const res = calculateVehicleProfitLoss('all', 'all', undefined, undefined, mockTrips);
      expect(res.totalDistanceKm).toBe(0);
      expect(res.profitPerKm).toBe('N/A');
    });

    it('correctly flags negative net profit as loss', () => {
      const mockTrips: Trip[] = [
        {
          id: 3,
          name: 'Empty Return',
          fuelType: 'Diesel',
          fuelTypeRaw: 'diesel',
          dist: 100,
          consumed: '15',
          fuelCost: 5000,
          toll: 1000,
          loading: 0,
          driver: 500,
          other: 0,
          total: 6500,
          date: '2026-10-17',
          time: '04:00 PM',
          month: 'Oct 26',
          expectedIncome: 4000,
          totalIncome: 4000,
          isReturn: false
        }
      ];

      const res = calculateVehicleProfitLoss('all', 'all', undefined, undefined, mockTrips);
      expect(res.totalIncome).toBe(4000);
      expect(res.totalExpenses).toBe(6500);
      expect(res.netProfit).toBe(-2500);
      expect(res.isProfit).toBe(false);
      expect(res.profitPerKm).toBe(-25);
    });
  });

  describe('WhatsApp Reminder Message Generators & Phone Formatter', () => {
    it('formats party reminder in Urdu with outstanding receivable balance', () => {
      const party: LedgerParty = {
        id: 'p1',
        name: 'Haji Aslam & Sons',
        phone: '03001234567',
        city: 'Faisalabad',
        runningBalance: 45000,
        totalCharged: 120000,
        totalReceived: 75000,
        updatedAt: Date.now()
      };

      const msg = formatPartyWhatsAppReminder(party, 'ur');
      expect(msg).toContain('Haji Aslam & Sons');
      expect(msg).toContain('45,000');
      expect(msg).toContain('وارائچ گڈز ٹرانسپورٹ کمپنی');
    });

    it('formats party reminder in English', () => {
      const party: LedgerParty = {
        id: 'p2',
        name: 'Sitara Chemicals',
        phone: '03217654321',
        city: 'Lahore',
        runningBalance: 85000,
        totalCharged: 250000,
        totalReceived: 165000,
        updatedAt: Date.now()
      };

      const msg = formatPartyWhatsAppReminder(party, 'en');
      expect(msg).toContain('Sitara Chemicals');
      expect(msg).toContain('85,000');
      expect(msg).toContain('Warraich Goods Transport Company');
    });

    it('formats broker reminder with commission details', () => {
      const broker: LedgerBroker = {
        id: 'b1',
        name: 'Malik Tariq Broker',
        phone: '03009876543',
        city: 'Karachi',
        totalCommission: 15000,
        unpaidCommission: 5000,
        updatedAt: Date.now()
      };

      const tx: BrokerTransaction = {
        id: 'tx1',
        brokerId: 'b1',
        date: '2026-10-18',
        loadDescription: 'Textile Yarn 20 Tons',
        vehicleNo: 'LHR-7860',
        freightAmount: 180000,
        commission: 5000,
        status: 'unpaid',
        createdAt: Date.now()
      };

      const msgUr = formatBrokerWhatsAppReminder(broker, tx, 'ur');
      expect(msgUr).toContain('Malik Tariq Broker');
      expect(msgUr).toContain('Textile Yarn 20 Tons');
      expect(msgUr).toContain('5,000');
      expect(msgUr).toContain('LHR-7860');

      const msgEn = formatBrokerWhatsAppReminder(broker, tx, 'en');
      expect(msgEn).toContain('Malik Tariq Broker');
      expect(msgEn).toContain('5,000');
    });

    it('cleans Pakistani phone numbers to international WhatsApp format', () => {
      expect(getCleanPhoneForWhatsApp('0300 1234567')).toBe('923001234567');
      expect(getCleanPhoneForWhatsApp('+92-300-1234567')).toBe('923001234567');
      expect(getCleanPhoneForWhatsApp('0321-7654321')).toBe('923217654321');
    });
  });

  describe('Top Parties Ranking', () => {
    it('ranks parties in descending order by total charged transaction volume', () => {
      const parties: LedgerParty[] = [
        { id: '1', name: 'Alpha Traders', runningBalance: 10000, totalCharged: 50000, totalReceived: 40000, updatedAt: 1 },
        { id: '2', name: 'Beta Mills', runningBalance: 5000, totalCharged: 200000, totalReceived: 195000, updatedAt: 1 },
        { id: '3', name: 'Gamma Logistics', runningBalance: 0, totalCharged: 120000, totalReceived: 120000, updatedAt: 1 },
        { id: '4', name: 'Delta Packages', runningBalance: 0, totalCharged: 0, totalReceived: 0, updatedAt: 1 }
      ];

      const ranked = getTopPartiesRanking(parties, 5);
      expect(ranked).toHaveLength(3); // only parties with totalCharged > 0
      expect(ranked[0].name).toBe('Beta Mills');
      expect(ranked[0].rank).toBe(1);
      expect(ranked[1].name).toBe('Gamma Logistics');
      expect(ranked[1].rank).toBe(2);
      expect(ranked[2].name).toBe('Alpha Traders');
      expect(ranked[2].rank).toBe(3);
    });
  });

  describe('Bilty Isolation and Access Control Policy', () => {
    it('silently ignores Bilty records if isBiltyAuthorized is false', () => {
      const sampleBilty: any = {
        id: 99,
        biltyNo: 'B-99',
        senderName: 'Classified Consignor',
        receiverName: 'Confidential Consignee',
        total: 95000,
        advance: 20000,
        payable: 75000,
        vehicleNo: 'LHR-9999'
      };

      vi.spyOn(storageModule, 'getStoredBilties').mockReturnValue([sampleBilty]);

      // Call with unauthorized flag
      syncFreightRecordsToLedger(false);

      const parties = getStoredParties();
      const partyTxs = getStoredPartyTransactions();
      const vehicleIncomes = getStoredVehicleIncomes();

      expect(parties.find(p => p.name === 'Classified Consignor')).toBeUndefined();
      expect(partyTxs.some(t => t.id.includes('99'))).toBe(false);
      expect(vehicleIncomes.some(v => v.id.includes('99'))).toBe(false);
    });

    it('links freight parties and vehicle income when isBiltyAuthorized is true without duplicates', () => {
      const sampleBilty: any = {
        id: 101,
        biltyNo: 'B-101',
        senderName: 'Millat Tractors',
        senderMobile: '03001112233',
        receiverName: 'Agri World Multan',
        receiverMobile: '03004445566',
        total: 80000,
        advance: 30000,
        payable: 50000,
        sendingCity: 'Lahore',
        receivingCity: 'Multan',
        vehicleNo: 'FD-5500',
        date: '2026-10-19'
      };

      vi.spyOn(storageModule, 'getStoredBilties').mockReturnValue([sampleBilty]);

      // First sync
      syncFreightRecordsToLedger(true);

      const parties1 = getStoredParties();
      const txs1 = getStoredPartyTransactions();
      const incomes1 = getStoredVehicleIncomes();

      expect(parties1.some(p => p.name === 'Millat Tractors')).toBe(true);
      expect(parties1.some(p => p.name === 'Agri World Multan')).toBe(true);
      expect(txs1.some(t => t.id === 'bilty_debit_101_sender')).toBe(true);
      expect(incomes1.some(i => i.id === 'vinc_bilty_101')).toBe(true);

      const countTxsBefore = txs1.length;
      const countIncomesBefore = incomes1.length;

      // Repeat sync (must be idempotent & avoid duplicate entries)
      syncFreightRecordsToLedger(true);

      const txs2 = getStoredPartyTransactions();
      const incomes2 = getStoredVehicleIncomes();

      expect(txs2.length).toBe(countTxsBefore);
      expect(incomes2.length).toBe(countIncomesBefore);
    });
  });
});
