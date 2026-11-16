import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateBillTotals,
  calculateEmployeeLedgerSummary,
  calculateReceivingPointSummary,
  calculateReportsHubAnalytics,
  createBillDraftFromBilty,
  deleteDailyExpense,
  getAllBills,
  getAllDailyExpenses,
  getDateRangeBounds,
  getNextBillNumber,
  receiveBillPayment,
  saveOrUpdateBill,
  saveOrUpdateDailyExpense,
  saveOrUpdateEmployee,
  saveOrUpdateEmployeeEntry,
  saveOrUpdateReceivingEntry,
  saveOrUpdateReceivingPoint
} from '../utils/khataModulesStorage';
import {
  KHATA_STORAGE_KEYS,
  calculateAccountBalance,
  exportKhataBackup,
  getAllCashEntries,
  getAllLedgerEntries,
  getLedgerAccounts,
  importKhataBackup,
  saveOrUpdateCashEntry,
  saveOrUpdateLedgerAccount,
  saveOrUpdateLedgerEntry
} from '../utils/ledgerStorage';
import { safeStorage } from '../utils/storage';
import { BiltyRecord, Trip } from '../types';

describe('Khata v1.3.0 Expansion Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.values(KHATA_STORAGE_KEYS).forEach(k => safeStorage.removeItem(k));
  });

  describe('1. Bills Calculations, Payment Posting & Authorization Gate', () => {
    it('calculates subtotal, total, balance, and unpaid/partial/paid statuses accurately', () => {
      const items = [
        { qty: 2, rate: 15000, amount: 30000 },
        { qty: 1, rate: 5000, amount: 5000 }
      ];

      const unpaid = calculateBillTotals(items, 2000, 1000, 0);
      expect(unpaid.subtotal).toBe(35000);
      expect(unpaid.total).toBe(36000);
      expect(unpaid.balance).toBe(36000);
      expect(unpaid.status).toBe('unpaid');

      const partial = calculateBillTotals(items, 2000, 1000, 10000);
      expect(partial.balance).toBe(26000);
      expect(partial.status).toBe('partial');

      const paid = calculateBillTotals(items, 2000, 1000, 40000);
      expect(paid.balance).toBe(0);
      expect(paid.status).toBe('paid');
    });

    it('increments sequential bill numbers safely', () => {
      expect(getNextBillNumber([])).toBe('BILL-0001');
      const b1 = saveOrUpdateBill({
        date: '2026-11-15',
        partyName: 'Al-Noor Traders',
        lineItems: [{ id: '1', description: 'Lahore-Karachi', qty: 1, rate: 50000, amount: 50000 }]
      });
      expect(b1.billNumber).toBe('BILL-0001');
      expect(getNextBillNumber(getAllBills())).toBe('BILL-0002');
    });

    it('posts payment to party ledger account when receiveBillPayment is called', () => {
      const party = saveOrUpdateLedgerAccount({
        kind: 'party',
        name: 'Faisalabad Cotton Mills',
        phone: '03001234567',
        openingAmount: 50000,
        openingDirection: 'get'
      });

      const bill = saveOrUpdateBill({
        date: '2026-11-15',
        partyId: party.id,
        partyName: party.name,
        partyPhone: party.phone,
        lineItems: [{ id: 'l1', description: 'Freight Load', qty: 1, rate: 40000, amount: 40000 }],
        advance: 10000
      });
      expect(bill.balance).toBe(30000);
      expect(bill.status).toBe('partial');

      const paymentRes = receiveBillPayment(bill.id, 30000, '2026-11-15', 'Bank transfer');
      expect(paymentRes).not.toBeNull();
      expect(paymentRes!.bill.status).toBe('paid');
      expect(paymentRes!.bill.balance).toBe(0);
      expect(paymentRes!.entry.type).toBe('got');
      expect(paymentRes!.entry.amount).toBe(30000);

      const entries = getAllLedgerEntries().filter(e => e.accountId === party.id);
      const { balance } = calculateAccountBalance(party, entries);
      expect(balance).toBe(20000); // 50000 opening - 30000 got
    });

    it('gates createBillDraftFromBilty strictly behind authorization flag', () => {
      const sampleDoc: BiltyRecord = {
        id: 101,
        biltyNo: 'WGT-1001',
        date: '2026-11-15',
        vehicleNo: 'LHR-7860',
        driverName: 'Aslam',
        mobileNo: '03001112222',
        sendingCity: 'Kamalia',
        receivingCity: 'Karachi',
        senderName: 'Mian Goods',
        senderMobile: '03001112222',
        receiverName: 'Karachi Traders',
        receiverMobile: '03219998888',
        senderCnic: '',
        qty: '50',
        itemDescription: 'Textile',
        weight: '5000 kg',
        total: 85000,
        advance: 25000,
        payable: 60000
      };

      expect(createBillDraftFromBilty(sampleDoc, false)).toBeNull();
      const draft = createBillDraftFromBilty(sampleDoc, true);
      expect(draft).not.toBeNull();
      expect(draft!.partyName).toBe('Karachi Traders');
      expect(draft!.lineItems[0].amount).toBe(85000);
      expect(draft!.advance).toBe(25000);
    });
  });

  describe('2. Employee Salary & Advance Ledger', () => {
    it('computes salary due, bonus, trip allowance, advance, paid and net balance', () => {
      const emp = saveOrUpdateEmployee({
        name: 'Ustad Tariq',
        role: 'driver',
        phone: '03009876543',
        payBasis: 'monthly',
        rateAmount: 45000,
        joiningDate: '2026-01-01',
        active: true
      });
      expect((emp as any).cnic).toBeUndefined();

      saveOrUpdateEmployeeEntry({ employeeId: emp.id, date: '2026-11-01', type: 'salary_due', amount: 45000 });
      saveOrUpdateEmployeeEntry({ employeeId: emp.id, date: '2026-11-03', type: 'bonus', amount: 5000 });
      saveOrUpdateEmployeeEntry({ employeeId: emp.id, date: '2026-11-05', type: 'trip_allowance', amount: 3000 });
      saveOrUpdateEmployeeEntry({ employeeId: emp.id, date: '2026-11-07', type: 'advance', amount: 12000 });
      saveOrUpdateEmployeeEntry({ employeeId: emp.id, date: '2026-11-10', type: 'salary_paid', amount: 30000 });
      saveOrUpdateEmployeeEntry({ employeeId: emp.id, date: '2026-11-12', type: 'deduction', amount: 1000 });

      const summary = calculateEmployeeLedgerSummary(
        calculateEmployeeLedgerSummary([]).totalEarned === 0
          ? getLedgerAccounts().length >= 0
            ? (awaitImportHelper(emp.id))
            : []
          : []
      );
      expect(summary.totalEarned).toBe(53000);
      expect(summary.totalPaidAndDeducted).toBe(43000);
      expect(summary.netBalance).toBe(10000);
      expect(summary.status).toBe('payable');
    });
  });

  describe('3. Receiving Points Balance', () => {
    it('tracks received vs paid and pending balance accurately', () => {
      const pt = saveOrUpdateReceivingPoint({
        name: 'Badami Bagh Adda',
        city: 'Lahore',
        contactPerson: 'Haji Akram',
        phone: '03005554444',
        notes: 'Gate 3'
      });

      const e1 = saveOrUpdateReceivingEntry({ pointId: pt.id, date: '2026-11-10', type: 'received', amount: 60000 });
      const e2 = saveOrUpdateReceivingEntry({ pointId: pt.id, date: '2026-11-12', type: 'paid', amount: 22000 });

      const summary = calculateReceivingPointSummary([e1, e2]);
      expect(summary.totalReceived).toBe(60000);
      expect(summary.totalPaid).toBe(22000);
      expect(summary.pendingBalance).toBe(38000);
    });
  });

  describe('4. Daily Expenses 1:1 Sync & Reports Hub Anti-Double-Counting', () => {
    it('syncs daily expense to Cashbook 1:1, deletes both, and prevents double counting in Reports Hub', () => {
      const exp = saveOrUpdateDailyExpense({
        date: '2026-11-15',
        category: 'fuel',
        amount: 15000,
        vehicleNo: 'LHR-7860',
        notes: 'PSO Diesel'
      });

      // Verify 1 linked cashbook entry was created
      const cashEntries = getAllCashEntries();
      expect(cashEntries.length).toBe(1);
      expect(cashEntries[0].sourceModule).toBe('daily_expense');
      expect(cashEntries[0].linkedExpenseId).toBe(exp.id);
      expect(cashEntries[0].amount).toBe(15000);

      // Update daily expense amount -> should update linked cash entry in-place
      saveOrUpdateDailyExpense({
        id: exp.id,
        date: '2026-11-15',
        category: 'fuel',
        amount: 18500,
        vehicleNo: 'LHR-7860',
        notes: 'PSO Diesel updated'
      });
      expect(getAllCashEntries().length).toBe(1);
      expect(getAllCashEntries()[0].amount).toBe(18500);

      // Add a separate manual Cashbook entry (not daily_expense) and Cash In
      saveOrUpdateCashEntry({
        type: 'out',
        amount: 2500,
        date: '2026-11-15',
        category: 'toll',
        note: 'M2 Toll'
      });
      saveOrUpdateCashEntry({
        type: 'in',
        amount: 50000,
        date: '2026-11-15',
        category: 'advance',
        note: 'Cash received'
      });

      // Analytics should count 18500 once (NOT 18500 + 18500) + 2500 = 21000 expenses
      const report = calculateReportsHubAnalytics({
        startDate: '2026-11-01',
        endDate: '2026-11-30'
      });
      expect(report.incomeVsExpense.dailyExpensesTotal).toBe(18500);
      expect(report.incomeVsExpense.manualCashOutTotal).toBe(2500);
      expect(report.incomeVsExpense.totalExpenses).toBe(21000);
      expect(report.incomeVsExpense.totalIncome).toBe(50000);
      expect(report.incomeVsExpense.netProfit).toBe(29000);

      // Vehicle P&L should also NOT double count 18500
      const vehRow = report.vehicleProfitLoss.find(v => v.vehicleNo === 'LHR-7860');
      expect(vehRow).toBeDefined();
      expect(vehRow!.expenses).toBe(18500);

      // Delete daily expense -> deletes linked cash entry cleanly
      deleteDailyExpense(exp.id);
      expect(getAllDailyExpenses().length).toBe(0);
      expect(getAllCashEntries().filter(c => c.id === exp.linkedCashEntryId).length).toBe(0);
    });

    it('computes all 8 Reports Hub dimensions and date presets cleanly', () => {
      expect(getDateRangeBounds('today', undefined, undefined, '2026-11-15')).toEqual({
        startDate: '2026-11-15',
        endDate: '2026-11-15'
      });
      expect(getDateRangeBounds('week', undefined, undefined, '2026-11-15')).toEqual({
        startDate: '2026-11-09',
        endDate: '2026-11-15'
      });
      expect(getDateRangeBounds('month', undefined, undefined, '2026-11-15')).toEqual({
        startDate: '2026-11-01',
        endDate: '2026-11-15'
      });
      expect(getDateRangeBounds('custom', '2026-11-10', '2026-11-02')).toEqual({
        startDate: '2026-11-02',
        endDate: '2026-11-10'
      });

      const broker = saveOrUpdateLedgerAccount({
        kind: 'broker',
        name: 'Bilal Broker',
        openingAmount: 15000,
        openingDirection: 'give'
      });
      saveOrUpdateLedgerEntry({
        accountId: broker.id,
        type: 'gave',
        amount: 5000,
        date: '2026-11-15'
      });

      const sampleTrip: Trip = {
        id: 1,
        name: 'Lahore-Multan (LHR-7860)',
        fuelType: 'Diesel',
        fuelTypeRaw: 'diesel',
        dist: 350,
        consumed: '87.5 L',
        fuelCost: 23625,
        toll: 2500,
        loading: 0,
        driver: 0,
        other: 0,
        total: 26125,
        totalIncome: 65000,
        isReturn: false,
        date: '2026-11-15',
        time: '12:00',
        month: '2026-11'
      };

      const analytics = calculateReportsHubAnalytics({
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        trips: [sampleTrip]
      });

      expect(analytics.brokerCommissionDue.totalCommissionDue).toBe(10000);
      expect(analytics.brokerCommissionDue.totalPaidToBrokers).toBe(5000);
      expect(analytics.vehicleProfitLoss[0].vehicleNo).toBe('LHR-7860');
      expect(analytics.vehicleProfitLoss[0].netProfit).toBe(65000 - 26125);
    });
  });

  describe('5. v3 Backup Export / Restore & Public Terminology Compliance', () => {
    it('exports and imports all v1.3.0 Khata collections without restricted words', () => {
      saveOrUpdateBill({
        date: '2026-11-15',
        partyName: 'Test Cargo Co',
        lineItems: [{ id: '1', description: 'Load', qty: 1, rate: 25000, amount: 25000 }]
      });
      saveOrUpdateEmployee({
        name: 'Imran Munshi',
        role: 'munshi',
        payBasis: 'monthly',
        rateAmount: 35000,
        joiningDate: '2026-05-01',
        active: true
      });
      saveOrUpdateReceivingPoint({
        name: 'Korangi Depot',
        city: 'Karachi'
      });

      const json = exportKhataBackup();
      expect(json.toLowerCase()).not.toContain('bilty');
      expect(json).not.toContain('بلٹی');

      const parsed = JSON.parse(json);
      expect(parsed.version).toBe('3.0');
      expect(parsed.schemaVersion).toBe(3);
      expect(parsed.bills.length).toBe(1);
      expect(parsed.employees.length).toBe(1);
      expect(parsed.receivingPoints.length).toBe(1);

      // Wipe and restore
      Object.values(KHATA_STORAGE_KEYS).forEach(k => safeStorage.removeItem(k));
      expect(getAllBills().length).toBe(0);

      const res = importKhataBackup(json);
      expect(res.success).toBe(true);
      expect(res.billsCount).toBe(1);
      expect(res.employeesCount).toBe(1);
      expect(res.receivingPointsCount).toBe(1);
      expect(getAllBills().length).toBe(1);
      expect(getAllBills()[0].partyName).toBe('Test Cargo Co');
    });
  });
});

import { getEmployeeEntries } from '../utils/khataModulesStorage';
function awaitImportHelper(empId: string) {
  return getEmployeeEntries(empId);
}
