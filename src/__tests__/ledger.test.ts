import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateAccountBalance,
  calculateAccountsSummary,
  normalizePakistaniPhone,
  formatPhoneForDisplay,
  evaluateArithmetic,
  generatePinSalt,
  hashPin,
  verifyPin,
  calculateLockoutDuration,
  isPinLocked,
  formatKhataReminderMessage,
  formatAccountStatementWhatsAppMessage,
  calculateDayCashSummary,
  exportKhataBackup,
  importKhataBackup,
  getLedgerAccounts,
  saveOrUpdateLedgerAccount,
  getLedgerEntries,
  saveOrUpdateLedgerEntry,
  deleteLedgerEntry,
  restoreLedgerEntry,
  saveOrUpdateCashEntry,
  getCashEntries,
  calculateVehicleProfitLoss,
  formatPartyWhatsAppReminder,
  formatBrokerWhatsAppReminder,
  getCleanPhoneForWhatsApp,
  getTopPartiesRanking,
  syncFreightRecordsToLedger,
  getStoredParties,
  getStoredPartyTransactions,
  getStoredVehicleIncomes
} from '../utils/ledgerStorage';
import { LedgerAccount, LedgerEntry, CashEntry, Trip } from '../types';
import * as storageModule from '../utils/storage';

describe('Digital Khata (کھاتہ) Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    [
      'dd_khata_accounts_v2',
      'dd_khata_entries_v2',
      'dd_khata_cashbook_v2',
      'dd_khata_settings_v2',
      'dd_ledger_parties',
      'dd_ledger_party_transactions',
      'dd_ledger_brokers',
      'dd_ledger_broker_transactions',
      'dd_ledger_vehicle_expenses',
      'dd_ledger_vehicle_income'
    ].forEach(k => storageModule.safeStorage.removeItem(k));
  });

  describe('1. Balance Calculation Formula (Party & Broker)', () => {
    it('calculates party balance correctly for openingDirection "get" (Receivable)', () => {
      const account: Pick<LedgerAccount, 'openingAmount' | 'openingDirection'> = {
        openingAmount: 5000,
        openingDirection: 'get'
      };
      const entries: LedgerEntry[] = [
        {
          id: 'e1',
          accountId: 'acc1',
          type: 'gave',
          amount: 2000,
          date: '2026-10-20',
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'e2',
          accountId: 'acc1',
          type: 'got',
          amount: 1500,
          date: '2026-10-21',
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        }
      ];

      // balance = +5000 + 2000 - 1500 = 5500
      const res = calculateAccountBalance(account, entries);
      expect(res.balance).toBe(5500);
      expect(res.totalGave).toBe(2000);
      expect(res.totalGot).toBe(1500);
      expect(res.status).toBe('get');
    });

    it('calculates party balance correctly for openingDirection "give" (Payable / Advance)', () => {
      const account: Pick<LedgerAccount, 'openingAmount' | 'openingDirection'> = {
        openingAmount: 3000,
        openingDirection: 'give'
      };
      const entries: LedgerEntry[] = [
        {
          id: 'e1',
          accountId: 'acc2',
          type: 'gave',
          amount: 1000,
          date: '2026-10-20',
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'e2',
          accountId: 'acc2',
          type: 'got',
          amount: 4000,
          date: '2026-10-21',
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        }
      ];

      // balance = -3000 + 1000 - 4000 = -6000
      const res = calculateAccountBalance(account, entries);
      expect(res.balance).toBe(-6000);
      expect(res.status).toBe('give');
    });

    it('calculates broker balance correctly when commission is due', () => {
      const brokerAccount: Pick<LedgerAccount, 'openingAmount' | 'openingDirection'> = {
        openingAmount: 0,
        openingDirection: 'give'
      };
      const entries: LedgerEntry[] = [
        {
          id: 'e1',
          accountId: 'b1',
          type: 'gave', // Paid
          amount: 5000,
          date: '2026-10-20',
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'e2',
          accountId: 'b1',
          type: 'got', // Commission due
          amount: 8000,
          date: '2026-10-22',
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        }
      ];

      // balance = 0 + 5000 - 8000 = -3000 (We owe broker 3,000 commission)
      const res = calculateAccountBalance(brokerAccount, entries);
      expect(res.balance).toBe(-3000);
      expect(res.status).toBe('give');
    });

    it('identifies settled account when balance is exactly 0', () => {
      const account: Pick<LedgerAccount, 'openingAmount' | 'openingDirection'> = {
        openingAmount: 10000,
        openingDirection: 'get'
      };
      const entries: LedgerEntry[] = [
        {
          id: 'e1',
          accountId: 'acc3',
          type: 'got',
          amount: 10000,
          date: '2026-10-22',
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        }
      ];

      const res = calculateAccountBalance(account, entries);
      expect(res.balance).toBe(0);
      expect(res.status).toBe('settled');
    });

    it('summarizes multiple accounts correctly', () => {
      const accounts: LedgerAccount[] = [
        {
          id: 'a1',
          kind: 'party',
          name: 'Party One',
          openingAmount: 10000,
          openingDirection: 'get',
          dueDate: '2020-01-01', // overdue
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'a2',
          kind: 'party',
          name: 'Party Two',
          openingAmount: 4000,
          openingDirection: 'give',
          source: 'manual',
          createdAt: '',
          updatedAt: ''
        }
      ];

      const summary = calculateAccountsSummary(accounts, []);
      expect(summary.totalWillGet).toBe(10000);
      expect(summary.totalWillGive).toBe(4000);
      expect(summary.netBalance).toBe(6000);
      expect(summary.overdueCount).toBe(1);
    });
  });

  describe('2. Pakistani Phone Normalization', () => {
    it('normalizes 03XXXXXXXXX to 923XXXXXXXXX', () => {
      expect(normalizePakistaniPhone('03001234567')).toBe('923001234567');
      expect(normalizePakistaniPhone('0321 7654321')).toBe('923217654321');
      expect(normalizePakistaniPhone('0345-9876543')).toBe('923459876543');
    });

    it('normalizes +923XXXXXXXXX to 923XXXXXXXXX', () => {
      expect(normalizePakistaniPhone('+923001234567')).toBe('923001234567');
      expect(normalizePakistaniPhone('+92 333 1122334')).toBe('923331122334');
    });

    it('normalizes 00923XXXXXXXXX to 923XXXXXXXXX', () => {
      expect(normalizePakistaniPhone('00923001234567')).toBe('923001234567');
    });

    it('normalizes 923XXXXXXXXX without plus to 923XXXXXXXXX', () => {
      expect(normalizePakistaniPhone('923001234567')).toBe('923001234567');
    });

    it('normalizes bare 10-digit 3XXXXXXXXX to 923XXXXXXXXX', () => {
      expect(normalizePakistaniPhone('3001234567')).toBe('923001234567');
    });

    it('returns null for invalid, non-Pakistani or malformed phone numbers', () => {
      expect(normalizePakistaniPhone('04235890000')).toBeNull(); // Lahore landline
      expect(normalizePakistaniPhone('12345')).toBeNull(); // too short
      expect(normalizePakistaniPhone('+14155552671')).toBeNull(); // US number
      expect(normalizePakistaniPhone('abc03001234567')).toBeNull();
      expect(normalizePakistaniPhone('')).toBeNull();
      expect(normalizePakistaniPhone(null)).toBeNull();
      expect(normalizePakistaniPhone(undefined)).toBeNull();
    });

    it('formats normalized phone for local UI display (03XXXXXXXXX)', () => {
      expect(formatPhoneForDisplay('923001234567')).toBe('03001234567');
    });
  });

  describe('3. Safe Arithmetic Parser without eval', () => {
    it('evaluates basic arithmetic expressions with operator precedence', () => {
      // 500 + 250 * 2 = 1000 (multiplication before addition)
      expect(evaluateArithmetic('500+250*2')).toBe(1000);
      expect(evaluateArithmetic('500 + 250 * 2')).toBe(1000);
      expect(evaluateArithmetic('100 - 20 * 3')).toBe(40);
    });

    it('handles parentheses correctly', () => {
      expect(evaluateArithmetic('(1000 - 200) / 4')).toBe(200);
      expect(evaluateArithmetic('((50 + 50) * 2) + 50')).toBe(250);
    });

    it('handles decimals and unary signs', () => {
      expect(evaluateArithmetic('1200 + 350.5')).toBe(1550.5);
      expect(evaluateArithmetic('+500 + 200')).toBe(700);
      expect(evaluateArithmetic('-50 + 100')).toBe(50);
    });

    it('returns null for division by zero', () => {
      expect(evaluateArithmetic('100 / 0')).toBeNull();
      expect(evaluateArithmetic('(500 + 100) / (10 - 10)')).toBeNull();
    });

    it('returns null for syntax errors, malicious inputs or invalid characters', () => {
      expect(evaluateArithmetic('500 + * 2')).toBeNull();
      expect(evaluateArithmetic('(500 + 200')).toBeNull(); // unclosed paren
      expect(evaluateArithmetic('alert(1)')).toBeNull(); // code injection attempt
      expect(evaluateArithmetic('500; drop table')).toBeNull();
      expect(evaluateArithmetic('')).toBeNull();
      expect(evaluateArithmetic('   ')).toBeNull();
    });
  });

  describe('4. PIN Hashing & Lockout Timing', () => {
    it('generates random salt and hashes PIN consistently', async () => {
      const salt = generatePinSalt();
      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(5);

      const hash1 = await hashPin('1234', salt);
      const hash2 = await hashPin('1234', salt);
      expect(hash1).toBe(hash2);

      const isMatch = await verifyPin('1234', salt, hash1);
      expect(isMatch).toBe(true);

      const isWrong = await verifyPin('9999', salt, hash1);
      expect(isWrong).toBe(false);
    });

    it('computes exponential lockout duration according to policy', () => {
      // 0-4 attempts -> 0s
      expect(calculateLockoutDuration(0)).toBe(0);
      expect(calculateLockoutDuration(3)).toBe(0);
      expect(calculateLockoutDuration(4)).toBe(0);

      // 5 attempts -> 30s
      expect(calculateLockoutDuration(5)).toBe(30);

      // 6 attempts -> 60s
      expect(calculateLockoutDuration(6)).toBe(60);

      // 7 attempts -> 120s
      expect(calculateLockoutDuration(7)).toBe(120);

      // 8 attempts -> 240s
      expect(calculateLockoutDuration(8)).toBe(240);

      // Capped at 3600s
      expect(calculateLockoutDuration(20)).toBe(3600);
    });

    it('checks PIN locked state accurately based on timestamp', () => {
      const future = Date.now() + 15000;
      const past = Date.now() - 5000;

      expect(isPinLocked(future)).toBe(true);
      expect(isPinLocked(past)).toBe(false);
      expect(isPinLocked(undefined)).toBe(false);
    });
  });

  describe('5. Reminder Message Formatting (No Bilty / No Warraich Goods)', () => {
    it('generates friendly Urdu reminder without restricted terms', () => {
      const account: LedgerAccount = {
        id: 'acc_test',
        kind: 'party',
        name: 'Bashir Ahmed',
        openingAmount: 15000,
        openingDirection: 'get',
        dueDate: '2026-11-01',
        source: 'manual',
        createdAt: '',
        updatedAt: ''
      };

      const msg = formatKhataReminderMessage(account, 15000, 'Al-Rehman Goods', 'ur');
      expect(msg).toContain('Bashir Ahmed');
      expect(msg).toContain('15,000');
      expect(msg).toContain('Al-Rehman Goods');
      expect(msg).toContain('2026-11-01');
      // Ensure strict policies
      expect(msg.toLowerCase()).not.toContain('bilty');
      expect(msg).not.toContain('بلٹی');
      expect(msg.toLowerCase()).not.toContain('warraich goods');
    });

    it('generates friendly English reminder with default "Driver Dost" when no business name', () => {
      const account: LedgerAccount = {
        id: 'acc_test2',
        kind: 'broker',
        name: 'Rashid Broker',
        openingAmount: 5000,
        openingDirection: 'get',
        source: 'manual',
        createdAt: '',
        updatedAt: ''
      };

      const msg = formatKhataReminderMessage(account, 5000, undefined, 'en');
      expect(msg).toContain('Rashid Broker');
      expect(msg).toContain('5,000');
      expect(msg).toContain('Driver Dost');
      expect(msg.toLowerCase()).not.toContain('bilty');
      expect(msg.toLowerCase()).not.toContain('warraich goods');
    });
  });

  describe('6. Unified Ledger & Account Retrieval', () => {
    it('retrieves all parties and brokers together in unified list when no kind specified', () => {
      saveOrUpdateLedgerAccount({
        kind: 'party',
        name: 'Alpha Traders',
        openingAmount: 10000,
        openingDirection: 'get'
      });

      saveOrUpdateLedgerAccount({
        kind: 'broker',
        name: 'Beta Commission Agent',
        openingAmount: 2000,
        openingDirection: 'give'
      });

      const allAccounts = getLedgerAccounts();
      expect(allAccounts.length).toBe(2);
      expect(allAccounts.some(a => a.name === 'Alpha Traders')).toBe(true);
      expect(allAccounts.some(a => a.name === 'Beta Commission Agent')).toBe(true);

      const summary = calculateAccountsSummary(allAccounts, []);
      expect(summary.totalWillGet).toBe(10000);
      expect(summary.totalWillGive).toBe(2000);
      expect(summary.netBalance).toBe(8000);
    });

    it('saves and updates accounts and entries in local storage', () => {
      const acc = saveOrUpdateLedgerAccount({
        kind: 'party',
        name: 'Tariq Textiles',
        phone: '03001234567',
        openingAmount: 20000,
        openingDirection: 'get'
      });

      expect(acc.id).toBeDefined();
      expect(acc.name).toBe('Tariq Textiles');
      expect(acc.phone).toBe('923001234567');

      const accounts = getLedgerAccounts();
      expect(accounts.length).toBe(1);

      const entry = saveOrUpdateLedgerEntry({
        accountId: acc.id,
        type: 'got',
        amount: 5000,
        date: '2026-10-25',
        note: 'Advance bank transfer'
      });

      expect(entry.id).toBeDefined();
      const entries = getLedgerEntries(acc.id);
      expect(entries.length).toBe(1);

      // Delete with 5-second undo simulation
      const deleted = deleteLedgerEntry(entry.id);
      expect(deleted?.id).toBe(entry.id);
      expect(getLedgerEntries(acc.id).length).toBe(0);

      // Restore via undo
      restoreLedgerEntry(deleted!);
      expect(getLedgerEntries(acc.id).length).toBe(1);
    });
  });

  describe('7. Cashbook Day Summary (Gari Hisab - Roznamcha)', () => {
    it('calculates opening balance, in, out, and closing balance correctly for a date', () => {
      const cashList: CashEntry[] = [
        {
          id: 'c1',
          type: 'in',
          amount: 50000,
          date: '2026-10-20',
          category: 'advance',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'c2',
          type: 'out',
          amount: 15000,
          date: '2026-10-20',
          category: 'fuel',
          createdAt: '',
          updatedAt: ''
        },
        // Today is 2026-10-21
        {
          id: 'c3',
          type: 'in',
          amount: 20000,
          date: '2026-10-21',
          category: 'advance',
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'c4',
          type: 'out',
          amount: 8000,
          date: '2026-10-21',
          category: 'toll',
          createdAt: '',
          updatedAt: ''
        }
      ];

      const summary = calculateDayCashSummary('2026-10-21', cashList);
      // Opening = 50000 - 15000 = 35000
      expect(summary.openingBalance).toBe(35000);
      expect(summary.totalIn).toBe(20000);
      expect(summary.totalOut).toBe(8000);
      // Closing = 35000 + 20000 - 8000 = 47000
      expect(summary.closingBalance).toBe(47000);
    });
  });

  describe('8. Backup Export & Import', () => {
    it('exports and imports backup with validation and merge support', () => {
      const acc = saveOrUpdateLedgerAccount({
        kind: 'party',
        name: 'Export Test Party',
        openingAmount: 12000,
        openingDirection: 'get'
      });
      saveOrUpdateLedgerEntry({
        accountId: acc.id,
        type: 'gave',
        amount: 3000,
        date: '2026-10-25'
      });
      saveOrUpdateCashEntry({
        type: 'in',
        amount: 10000,
        date: '2026-10-25',
        category: 'advance'
      });

      const backupStr = exportKhataBackup();
      expect(backupStr).toContain('Driver Dost');
      expect(backupStr).toContain('Export Test Party');
      expect(backupStr.toLowerCase()).not.toContain('bilty');
      expect(backupStr).not.toContain('بلٹی');

      // Clear storage
      storageModule.safeStorage.removeItem('dd_khata_accounts_v2');
      storageModule.safeStorage.removeItem('dd_khata_entries_v2');
      storageModule.safeStorage.removeItem('dd_khata_cashbook_v2');
      expect(getLedgerAccounts().length).toBe(0);

      // Import back
      const importRes = importKhataBackup(backupStr, 'replace');
      expect(importRes.success).toBe(true);
      expect(importRes.accountsCount).toBe(1);
      expect(importRes.entriesCount).toBe(1);
      expect(importRes.cashCount).toBe(1);
      expect(getLedgerAccounts().length).toBe(1);
      expect(getLedgerAccounts()[0].name).toBe('Export Test Party');
    });
  });

  describe('9. Legacy Compatibility Suites', () => {
    it('preserves calculateVehicleProfitLoss', () => {
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
      expect(res.netProfit).toBe(10000);
      expect(res.isProfit).toBe(true);
      expect(res.profitPerKm).toBe(50);
      expect(res.dieselCost).toBe(8000);
      expect(res.tollCost).toBe(1500);
      expect(res.driverCost).toBe(1000);
      expect(res.tripsCount).toBe(1);

      // Test vehicle specific filter
      const resVeh = calculateVehicleProfitLoss('LHR-7860', 'all', undefined, undefined, [
        ...mockTrips,
        {
          id: 2,
          name: 'گاڑی حساب (LHR-7860)',
          vehicleNo: 'LHR-7860',
          fuelType: 'Diesel',
          fuelTypeRaw: 'diesel',
          dist: 100,
          consumed: '25L',
          fuelCost: 5000,
          toll: 500,
          loading: 0,
          driver: 1000,
          other: 0,
          total: 6500,
          date: '2026-10-16',
          time: '11:00 AM',
          month: 'Oct 26',
          totalIncome: 12000,
          netProfit: 5500,
          isReturn: false
        } as any
      ]);
      expect(resVeh.tripsCount).toBe(1);
      expect(resVeh.totalIncome).toBe(12000);
      expect(resVeh.totalExpenses).toBe(6500);
      expect(resVeh.netProfit).toBe(5500);
    });

    it('ranks parties descending by volume in getTopPartiesRanking', () => {
      const parties = [
        { id: '1', name: 'Alpha Traders', runningBalance: 10000, totalCharged: 50000, totalReceived: 40000, updatedAt: 1 },
        { id: '2', name: 'Beta Mills', runningBalance: 5000, totalCharged: 200000, totalReceived: 195000, updatedAt: 1 }
      ];
      const ranked = getTopPartiesRanking(parties as any, 5);
      expect(ranked[0].name).toBe('Beta Mills');
    });

    it('isolates freight documents based on authorization', () => {
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

      syncFreightRecordsToLedger(false);
      expect(getStoredParties().find(p => p.name === 'Classified Consignor')).toBeUndefined();

      syncFreightRecordsToLedger(true);
      expect(getStoredParties().some(p => p.name === 'Classified Consignor')).toBe(true);
    });
  });

  describe('10. WhatsApp Ledger Statement & Payment Reminders', () => {
    it('formats WhatsApp account statement correctly in Urdu without forbidden terms', () => {
      const account: LedgerAccount = {
        id: 'acc-wa-1',
        kind: 'party',
        name: 'چوہدری طارق گڈز',
        phone: '03001234567',
        openingAmount: 50000,
        openingDirection: 'get',
        dueDate: '2026-11-05',
        source: 'manual',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01'
      };

      const entries: LedgerEntry[] = [
        {
          id: 'ent-1',
          accountId: 'acc-wa-1',
          type: 'got',
          amount: 20000,
          date: '2026-10-10',
          note: 'بینک ٹرانسفر',
          source: 'manual',
          createdAt: '2026-10-10',
          updatedAt: '2026-10-10'
        }
      ];

      const statement = formatAccountStatementWhatsAppMessage(
        account,
        entries,
        'وارڑائچ لاجسٹکس',
        'ur'
      );

      expect(statement).toContain('کھاتہ اسٹیٹمنٹ');
      expect(statement).toContain('چوہدری طارق گڈز');
      expect(statement).toContain('وارڑائچ لاجسٹکس');
      expect(statement).toContain('03001234567');
      expect(statement).toContain('30,000'); // 50,000 - 20,000 = 30,000
      expect(statement).toContain('واجب الوصول');
      expect(statement).toContain('بینک ٹرانسفر');
      // Must not leak or contain forbidden terminology
      expect(statement.toLowerCase()).not.toContain('bilty');
      expect(statement).not.toContain('بلٹی');
    });

    it('formats WhatsApp account statement correctly in English for payable balance', () => {
      const account: LedgerAccount = {
        id: 'acc-wa-2',
        kind: 'broker',
        name: 'Lahore Freight Brokers',
        phone: '923219876543',
        openingAmount: 15000,
        openingDirection: 'give',
        source: 'manual',
        createdAt: '2026-10-01',
        updatedAt: '2026-10-01'
      };

      const statement = formatAccountStatementWhatsAppMessage(
        account,
        [],
        'Driver Dost Transport',
        'en'
      );

      expect(statement).toContain('ACCOUNT STATEMENT');
      expect(statement).toContain('Lahore Freight Brokers');
      expect(statement).toContain('03219876543');
      expect(statement).toContain('Payable');
      expect(statement).toContain('15,000');
    });
  });
});
