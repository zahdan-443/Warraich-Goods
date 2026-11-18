/**
 * Driver Dost - Khata v1.3.0 Expansion Storage & Analytics Engine
 *
 * Modules:
 * 1. Bills (Invoice creation, line items, status, party ledger payment posting, authorised doc import)
 * 2. Employees (Drivers/Munshis/Helpers master + salary/advance/allowance ledger)
 * 3. Receiving Points (Depots/Addas master + received/paid/pending ledger)
 * 4. Daily Expenses (7 categories + optional vehicle, synced 1:1 with Cashbook without double counting)
 * 5. Reports Hub (Date-range analytics across all 8 business dimensions without double counting)
 *
 * Strict compliance:
 * - Zero occurrences of restricted terminology in user-facing/backup text
 * - Zero CNIC/government ID fields stored in these modules
 * - Offline-first scoped localStorage + IndexedDB via safeStorage + per-doc Firestore mirror & queue
 */

import {
  BiltyRecord,
  CashEntry,
  KhataBill,
  KhataBillLineItem,
  KhataBillStatus,
  KhataDailyExpense,
  KhataEmployee,
  KhataEmployeeEntry,
  KhataExpenseCategory,
  KhataReceivingEntry,
  KhataReceivingPoint,
  Language,
  LedgerAccount,
  LedgerEntry,
  Trip
} from '../types';
import { getScopedItem, setScopedItem } from './storage';
import { fromPaisa, multiplyRupees, toPaisa } from './calculator';
import { getPakistanDateKey, shiftDateKey } from './dateUtils';
import {
  KHATA_STORAGE_KEYS,
  calculateAccountBalance,
  clearKhataDeletionTombstone,
  deleteCashEntry,
  formatPhoneForDisplay,
  getAllCashEntries,
  getAllLedgerEntries,
  getLedgerAccounts,
  mirrorFlatKhataDocToFirestore,
  normalizePakistaniPhone,
  recordKhataDeletionTombstone,
  saveOrUpdateCashEntry,
  saveOrUpdateLedgerAccount,
  saveOrUpdateLedgerEntry
} from './ledgerStorage';

// ----------------- INTERNAL SCOPED JSON HELPERS -----------------

function readCollection<T>(key: string): T[] {
  try {
    const raw = getScopedItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection<T>(key: string, items: T[]): void {
  try {
    setScopedItem(key, JSON.stringify(items));
  } catch (err) {
    console.warn(`[KhataModules] Failed to persist ${key}:`, err);
  }
}

export function getTodayIsoDate(): string {
  return getPakistanDateKey();
}

// =========================================================================
// 1. BILLS (بل بنانا اور ریکارڈ)
// =========================================================================

export function calculateBillTotals(
  lineItems: Array<Pick<KhataBillLineItem, 'qty' | 'rate' | 'amount'>>,
  extraCharges = 0,
  discount = 0,
  advance = 0
): {
  subtotal: number;
  total: number;
  balance: number;
  status: KhataBillStatus;
} {
  let subtotalPaisa = 0;
  for (const item of lineItems) {
    const qty = Math.max(0, Number(item.qty) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    const lineAmt = qty > 0 && rate > 0 ? multiplyRupees(qty, rate) : Math.max(0, Number(item.amount) || 0);
    subtotalPaisa += toPaisa(lineAmt);
  }

  const subtotal = fromPaisa(subtotalPaisa);
  const safeExtraPaisa = Math.max(0, toPaisa(Number(extraCharges) || 0));
  const safeDiscountPaisa = Math.max(0, toPaisa(Number(discount) || 0));
  const safeAdvancePaisa = Math.max(0, toPaisa(Number(advance) || 0));

  const totalPaisa = Math.max(0, subtotalPaisa + safeExtraPaisa - safeDiscountPaisa);
  const balancePaisa = Math.max(0, totalPaisa - safeAdvancePaisa);

  const total = fromPaisa(totalPaisa);
  const balance = fromPaisa(balancePaisa);

  let status: KhataBillStatus = 'unpaid';
  if (totalPaisa === 0 || balancePaisa === 0) {
    status = 'paid';
  } else if (safeAdvancePaisa > 0 && balancePaisa > 0) {
    status = 'partial';
  }

  return { subtotal, total, balance, status };
}

export function getAllBills(): KhataBill[] {
  return readCollection<KhataBill>(KHATA_STORAGE_KEYS.BILLS).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getNextBillNumber(existingBills: KhataBill[] = getAllBills()): string {
  let maxSeq = 0;
  for (const b of existingBills) {
    const match = String(b.billNumber || '').match(/(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > maxSeq) maxSeq = n;
    }
  }
  const next = maxSeq + 1;
  return `BILL-${String(next).padStart(4, '0')}`;
}

export function saveOrUpdateBill(
  data: Partial<KhataBill> & {
    partyName: string;
    date: string;
    lineItems: KhataBillLineItem[];
  }
): KhataBill {
  const bills = readCollection<KhataBill>(KHATA_STORAGE_KEYS.BILLS);
  const now = new Date().toISOString();

  const normalizedItems: KhataBillLineItem[] = data.lineItems.map((item, idx) => {
    const qty = Math.max(0, Number(item.qty) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    const amount = qty > 0 && rate > 0
      ? Math.round(qty * rate * 100) / 100
      : Math.max(0, Math.round((Number(item.amount) || 0) * 100) / 100);
    return {
      id: item.id || `line_${Date.now()}_${idx}`,
      description: String(item.description || '').trim(),
      qty,
      rate,
      amount
    };
  });

  const extraCharges = Math.max(0, Number(data.extraCharges) || 0);
  const discount = Math.max(0, Number(data.discount) || 0);
  const advance = Math.max(0, Number(data.advance) || 0);
  const { subtotal, total, balance, status } = calculateBillTotals(
    normalizedItems,
    extraCharges,
    discount,
    advance
  );

  const normalizedPhone = normalizePakistaniPhone(data.partyPhone) || data.partyPhone?.trim() || '';
  const existingIdx = data.id ? bills.findIndex(b => b.id === data.id) : -1;

  let target: KhataBill;
  if (existingIdx >= 0) {
    target = {
      ...bills[existingIdx],
      ...data,
      partyName: data.partyName.trim(),
      partyPhone: normalizedPhone,
      lineItems: normalizedItems,
      extraCharges,
      discount,
      advance,
      subtotal,
      total,
      balance,
      status,
      updatedAt: now
    };
    bills[existingIdx] = target;
  } else {
    target = {
      id: data.id || `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      billNumber: data.billNumber?.trim() || getNextBillNumber(bills),
      date: data.date || getTodayIsoDate(),
      partyId: data.partyId || undefined,
      partyName: data.partyName.trim(),
      partyPhone: normalizedPhone,
      vehicleNo: data.vehicleNo?.trim() || undefined,
      lineItems: normalizedItems,
      extraCharges,
      discount,
      advance,
      subtotal,
      total,
      balance,
      status,
      notes: data.notes?.trim() || '',
      linkedDocId: data.linkedDocId,
      linkedDocNo: data.linkedDocNo,
      createdAt: now,
      updatedAt: now
    };
    bills.unshift(target);
  }

  clearKhataDeletionTombstone('khataBills', target.id);
  writeCollection(KHATA_STORAGE_KEYS.BILLS, bills);
  void mirrorFlatKhataDocToFirestore('khataBills', target as unknown as { id: string }, 'upsert');
  return target;
}

export function deleteBill(id: string): boolean {
  const bills = readCollection<KhataBill>(KHATA_STORAGE_KEYS.BILLS);
  const target = bills.find(b => b.id === id);
  if (!target) return false;
  const remaining = bills.filter(b => b.id !== id);
  writeCollection(KHATA_STORAGE_KEYS.BILLS, remaining);
  recordKhataDeletionTombstone('khataBills', id);
  void mirrorFlatKhataDocToFirestore('khataBills', target as unknown as { id: string }, 'delete');
  return true;
}

/**
 * Receives a payment against an existing bill AND posts a 'got' entry
 * directly to the party's Khata ledger (matching or auto-creating the party).
 */
export function receiveBillPayment(
  billId: string,
  paymentAmount: number,
  paymentDate: string = getTodayIsoDate(),
  note?: string
): { bill: KhataBill; account: LedgerAccount; entry: LedgerEntry } | null {
  const amt = Math.abs(Number(paymentAmount) || 0);
  if (amt <= 0) return null;

  const bills = readCollection<KhataBill>(KHATA_STORAGE_KEYS.BILLS);
  const bill = bills.find(b => b.id === billId);
  if (!bill) return null;

  // 1. Find or create party LedgerAccount
  const partyAccounts = getLedgerAccounts('party');
  let targetAccount = bill.partyId
    ? getLedgerAccounts().find(a => a.id === bill.partyId) || null
    : null;

  if (!targetAccount) {
    targetAccount =
      partyAccounts.find(
        a => a.name.trim().toLowerCase() === bill.partyName.trim().toLowerCase()
      ) || null;
  }

  if (!targetAccount) {
    targetAccount = saveOrUpdateLedgerAccount({
      kind: 'party',
      name: bill.partyName,
      phone: bill.partyPhone,
      openingAmount: 0,
      openingDirection: 'get',
      source: 'auto'
    });
  }

  // 2. Post 'got' payment entry in party Khata
  const entryNote = note?.trim()
    ? `${bill.billNumber}: ${note.trim()}`
    : `Bill Payment (${bill.billNumber})`;

  const entry = saveOrUpdateLedgerEntry({
    accountId: targetAccount.id,
    type: 'got',
    amount: amt,
    date: paymentDate,
    note: entryNote,
    source: 'auto',
    sourceRef: `bill_${bill.id}`
  });

  // 3. Update bill advance/balance/status
  const updatedBill = saveOrUpdateBill({
    ...bill,
    partyId: targetAccount.id,
    advance: Math.round((Number(bill.advance) + amt) * 100) / 100
  });

  return { bill: updatedBill, account: targetAccount, entry };
}

/**
 * Builds an unsaved bill draft from an authorised freight document.
 * Strictly guarded by isAuthorized so regular users can never invoke it.
 */
export function createBillDraftFromBilty(
  record: BiltyRecord,
  isAuthorized: boolean
): Omit<KhataBill, 'id' | 'billNumber' | 'subtotal' | 'total' | 'balance' | 'status' | 'createdAt' | 'updatedAt'> | null {
  if (!isAuthorized || !record) return null;

  const partyName = (record.receiverName || record.senderName || 'Freight Client').trim();
  const partyPhone = record.receiverMobile || record.senderMobile || '';
  const routeDesc = `${record.sendingCity || ''} -> ${record.receivingCity || ''}`.trim();
  const goodsDesc = record.itemDescription ? ` (${record.itemDescription})` : '';
  const description = `Freight Doc ${record.biltyNo}${routeDesc ? `: ${routeDesc}` : ''}${goodsDesc}`;
  const freightTotal = Math.max(0, Number(record.total) || 0);
  const advanceAmt = Math.max(0, Number(record.advance) || 0);

  return {
    date: record.date || getTodayIsoDate(),
    partyName,
    partyPhone,
    vehicleNo: record.vehicleNo || '',
    lineItems: [
      {
        id: `line_${Date.now()}_0`,
        description,
        qty: 1,
        rate: freightTotal,
        amount: freightTotal
      }
    ],
    extraCharges: 0,
    discount: 0,
    advance: advanceAmt,
    notes: record.weight ? `Weight: ${record.weight}` : '',
    linkedDocId: String(record.id),
    linkedDocNo: record.biltyNo
  };
}

export function formatBillWhatsAppMessage(
  bill: KhataBill,
  businessName?: string,
  lang: Language = 'ur'
): string {
  const isUrdu = lang === 'ur';
  const biz = businessName?.trim() ? businessName.trim() : 'Driver Dost';
  const itemsText = bill.lineItems
    .map((it, idx) => `${idx + 1}. ${it.description} (${it.qty} x ${it.rate}) = PKR ${it.amount.toLocaleString('en-US')}`)
    .join('\n');

  if (isUrdu) {
    return (
      `🧾 *بل / انوائس (${bill.billNumber})*\n` +
      `🏢 ${biz}\n` +
      `📅 تاریخ: ${bill.date}\n` +
      `👤 پارٹی: *${bill.partyName}*\n` +
      (bill.vehicleNo ? `🚛 گاڑی: ${bill.vehicleNo}\n` : '') +
      `--------------------------------\n` +
      `${itemsText}\n` +
      `--------------------------------\n` +
      (bill.extraCharges > 0 ? `اضافی چارجز: PKR ${bill.extraCharges.toLocaleString('en-US')}\n` : '') +
      (bill.discount > 0 ? `رعایت: PKR ${bill.discount.toLocaleString('en-US')}\n` : '') +
      `کل بل: PKR ${bill.total.toLocaleString('en-US')}\n` +
      `وصول شدہ: PKR ${bill.advance.toLocaleString('en-US')}\n` +
      `💰 *بقایا رقم: PKR ${bill.balance.toLocaleString('en-US')}*\n` +
      `— ${biz}`
    );
  }

  return (
    `🧾 *BILL / INVOICE (${bill.billNumber})*\n` +
    `🏢 ${biz}\n` +
    `📅 Date: ${bill.date}\n` +
    `👤 Party: *${bill.partyName}*\n` +
    (bill.vehicleNo ? `🚛 Vehicle: ${bill.vehicleNo}\n` : '') +
    `--------------------------------\n` +
    `${itemsText}\n` +
    `--------------------------------\n` +
    (bill.extraCharges > 0 ? `Extra Charges: PKR ${bill.extraCharges.toLocaleString('en-US')}\n` : '') +
    (bill.discount > 0 ? `Discount: PKR ${bill.discount.toLocaleString('en-US')}\n` : '') +
    `Total Amount: PKR ${bill.total.toLocaleString('en-US')}\n` +
    `Paid / Advance: PKR ${bill.advance.toLocaleString('en-US')}\n` +
    `💰 *Balance Due: PKR ${bill.balance.toLocaleString('en-US')}*\n` +
    `— ${biz}`
  );
}

// =========================================================================
// 2. EMPLOYEES (ملازمین) & SALARY LEDGER
// =========================================================================

export function getAllEmployees(): KhataEmployee[] {
  return readCollection<KhataEmployee>(KHATA_STORAGE_KEYS.EMPLOYEES).sort(
    (a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name)
  );
}

export function saveOrUpdateEmployee(
  data: Partial<KhataEmployee> & { name: string }
): KhataEmployee {
  const list = readCollection<KhataEmployee>(KHATA_STORAGE_KEYS.EMPLOYEES);
  const now = new Date().toISOString();
  const normalizedPhone = normalizePakistaniPhone(data.phone) || data.phone?.trim() || '';
  const existingIdx = data.id ? list.findIndex(e => e.id === data.id) : -1;

  let target: KhataEmployee;
  if (existingIdx >= 0) {
    target = {
      ...list[existingIdx],
      ...data,
      name: data.name.trim(),
      phone: normalizedPhone,
      rateAmount: Math.max(0, Number(data.rateAmount ?? list[existingIdx].rateAmount) || 0),
      updatedAt: now
    };
    list[existingIdx] = target;
  } else {
    target = {
      id: data.id || `emp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      role: data.role || 'driver',
      phone: normalizedPhone,
      payBasis: data.payBasis || 'monthly',
      rateAmount: Math.max(0, Number(data.rateAmount) || 0),
      joiningDate: data.joiningDate || getTodayIsoDate(),
      active: data.active !== undefined ? Boolean(data.active) : true,
      linkedDriverId: data.linkedDriverId,
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };
    list.unshift(target);
  }

  clearKhataDeletionTombstone('khataEmployees', target.id);
  writeCollection(KHATA_STORAGE_KEYS.EMPLOYEES, list);
  void mirrorFlatKhataDocToFirestore('khataEmployees', target as unknown as { id: string }, 'upsert');
  return target;
}

export function deleteEmployee(id: string): boolean {
  const list = readCollection<KhataEmployee>(KHATA_STORAGE_KEYS.EMPLOYEES);
  const target = list.find(e => e.id === id);
  if (!target) return false;

  writeCollection(KHATA_STORAGE_KEYS.EMPLOYEES, list.filter(e => e.id !== id));
  recordKhataDeletionTombstone('khataEmployees', id);
  void mirrorFlatKhataDocToFirestore('khataEmployees', target as unknown as { id: string }, 'delete');

  const allEntries = readCollection<KhataEmployeeEntry>(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES);
  const toDelete = allEntries.filter(en => en.employeeId === id);
  writeCollection(
    KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES,
    allEntries.filter(en => en.employeeId !== id)
  );
  toDelete.forEach(en => {
    recordKhataDeletionTombstone('khataEmployeeEntries', en.id);
    void mirrorFlatKhataDocToFirestore('khataEmployeeEntries', en as unknown as { id: string }, 'delete');
  });
  return true;
}

export function getAllEmployeeEntries(): KhataEmployeeEntry[] {
  return readCollection<KhataEmployeeEntry>(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getEmployeeEntries(employeeId: string): KhataEmployeeEntry[] {
  return getAllEmployeeEntries().filter(e => e.employeeId === employeeId);
}

export function saveOrUpdateEmployeeEntry(
  data: Partial<KhataEmployeeEntry> & {
    employeeId: string;
    type: KhataEmployeeEntry['type'];
    amount: number;
    date: string;
  }
): KhataEmployeeEntry {
  const list = readCollection<KhataEmployeeEntry>(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES);
  const now = new Date().toISOString();
  const existingIdx = data.id ? list.findIndex(e => e.id === data.id) : -1;

  let target: KhataEmployeeEntry;
  if (existingIdx >= 0) {
    target = {
      ...list[existingIdx],
      ...data,
      amount: Math.abs(fromPaisa(toPaisa(Number(data.amount) || 0))),
      updatedAt: now
    };
    list[existingIdx] = target;
  } else {
    target = {
      id: data.id || `emp_ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      employeeId: data.employeeId,
      date: data.date || getTodayIsoDate(),
      type: data.type,
      amount: Math.abs(fromPaisa(toPaisa(Number(data.amount) || 0))),
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };
    list.unshift(target);
  }

  clearKhataDeletionTombstone('khataEmployeeEntries', target.id);
  writeCollection(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, list);
  void mirrorFlatKhataDocToFirestore('khataEmployeeEntries', target as unknown as { id: string }, 'upsert');
  return target;
}

export function deleteEmployeeEntry(id: string): boolean {
  const list = readCollection<KhataEmployeeEntry>(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES);
  const target = list.find(e => e.id === id);
  if (!target) return false;
  writeCollection(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, list.filter(e => e.id !== id));
  recordKhataDeletionTombstone('khataEmployeeEntries', id);
  void mirrorFlatKhataDocToFirestore('khataEmployeeEntries', target as unknown as { id: string }, 'delete');
  return true;
}

export interface EmployeeLedgerSummary {
  totalSalaryDue: number;
  totalBonus: number;
  totalTripAllowance: number;
  totalEarned: number;
  totalAdvance: number;
  totalSalaryPaid: number;
  totalDeduction: number;
  totalPaidAndDeducted: number;
  netBalance: number;
  status: 'payable' | 'advance_recoverable' | 'settled';
}

export function isEmployeeCreditType(type: KhataEmployeeEntry['type']): boolean {
  return type === 'salary_due' || type === 'bonus' || type === 'trip_allowance';
}

export function calculateEmployeeLedgerSummary(entries: KhataEmployeeEntry[] = []): EmployeeLedgerSummary {
  let totalSalaryDuePaisa = 0;
  let totalBonusPaisa = 0;
  let totalTripAllowancePaisa = 0;
  let totalAdvancePaisa = 0;
  let totalSalaryPaidPaisa = 0;
  let totalDeductionPaisa = 0;

  for (const e of entries) {
    const amtPaisa = Math.max(0, toPaisa(Number(e.amount) || 0));
    switch (e.type) {
      case 'salary_due':
        totalSalaryDuePaisa += amtPaisa;
        break;
      case 'bonus':
        totalBonusPaisa += amtPaisa;
        break;
      case 'trip_allowance':
        totalTripAllowancePaisa += amtPaisa;
        break;
      case 'advance':
        totalAdvancePaisa += amtPaisa;
        break;
      case 'salary_paid':
        totalSalaryPaidPaisa += amtPaisa;
        break;
      case 'deduction':
        totalDeductionPaisa += amtPaisa;
        break;
    }
  }

  const totalEarnedPaisa = totalSalaryDuePaisa + totalBonusPaisa + totalTripAllowancePaisa;
  const totalPaidAndDeductedPaisa = totalAdvancePaisa + totalSalaryPaidPaisa + totalDeductionPaisa;
  const netBalance = fromPaisa(totalEarnedPaisa - totalPaidAndDeductedPaisa);

  return {
    totalSalaryDue: fromPaisa(totalSalaryDuePaisa),
    totalBonus: fromPaisa(totalBonusPaisa),
    totalTripAllowance: fromPaisa(totalTripAllowancePaisa),
    totalEarned: fromPaisa(totalEarnedPaisa),
    totalAdvance: fromPaisa(totalAdvancePaisa),
    totalSalaryPaid: fromPaisa(totalSalaryPaidPaisa),
    totalDeduction: fromPaisa(totalDeductionPaisa),
    totalPaidAndDeducted: fromPaisa(totalPaidAndDeductedPaisa),
    netBalance,
    status: netBalance > 0 ? 'payable' : netBalance < 0 ? 'advance_recoverable' : 'settled'
  };
}

export function formatEmployeeStatementWhatsApp(
  employee: KhataEmployee,
  entries: KhataEmployeeEntry[],
  businessName?: string,
  lang: Language = 'ur'
): string {
  const isUrdu = lang === 'ur';
  const biz = businessName?.trim() ? businessName.trim() : 'Driver Dost';
  const summary = calculateEmployeeLedgerSummary(entries);
  const balAbs = Math.abs(summary.netBalance).toLocaleString('en-US');

  if (isUrdu) {
    const balLine =
      summary.netBalance > 0
        ? `واجب الادا تنخواہ (ملازم کو دینی ہے): PKR ${balAbs}`
        : summary.netBalance < 0
        ? `ایڈوانس بقایا (واپس لینا ہے): PKR ${balAbs}`
        : `حساب برابر (صفر بقایا)`;

    return (
      `👷 *ملازم تنخواہ کھاتہ اسٹیٹمنٹ*\n` +
      `🏢 ${biz}\n` +
      `👤 نام: *${employee.name}* (${employee.role})\n` +
      (employee.phone ? `📞 فون: ${formatPhoneForDisplay(employee.phone)}\n` : '') +
      `--------------------------------\n` +
      `کل کمائی / تنخواہ و الاؤنس: PKR ${summary.totalEarned.toLocaleString('en-US')}\n` +
      `کل ادائیگی / ایڈوانس / کٹوتی: PKR ${summary.totalPaidAndDeducted.toLocaleString('en-US')}\n` +
      `💰 *${balLine}*\n` +
      `— ${biz}`
    );
  }

  const balLine =
    summary.netBalance > 0
      ? `Net Salary Payable: PKR ${balAbs}`
      : summary.netBalance < 0
      ? `Advance Recoverable: PKR ${balAbs}`
      : `Settled (Zero Balance)`;

  return (
    `👷 *EMPLOYEE SALARY STATEMENT*\n` +
    `🏢 ${biz}\n` +
    `👤 Name: *${employee.name}* (${employee.role})\n` +
    (employee.phone ? `📞 Phone: ${formatPhoneForDisplay(employee.phone)}\n` : '') +
    `--------------------------------\n` +
    `Total Earned (Salary + Bonus + Allowance): PKR ${summary.totalEarned.toLocaleString('en-US')}\n` +
    `Total Paid / Advance / Deduction: PKR ${summary.totalPaidAndDeducted.toLocaleString('en-US')}\n` +
    `💰 *${balLine}*\n` +
    `— ${biz}`
  );
}

// =========================================================================
// 3. RECEIVING POINTS (ریسیونگ پوائنٹ)
// =========================================================================

export function getAllReceivingPoints(): KhataReceivingPoint[] {
  return readCollection<KhataReceivingPoint>(KHATA_STORAGE_KEYS.RECEIVING_POINTS).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function saveOrUpdateReceivingPoint(
  data: Partial<KhataReceivingPoint> & { name: string; city: string }
): KhataReceivingPoint {
  const list = readCollection<KhataReceivingPoint>(KHATA_STORAGE_KEYS.RECEIVING_POINTS);
  const now = new Date().toISOString();
  const normalizedPhone = normalizePakistaniPhone(data.phone) || data.phone?.trim() || '';
  const existingIdx = data.id ? list.findIndex(p => p.id === data.id) : -1;

  let target: KhataReceivingPoint;
  if (existingIdx >= 0) {
    target = {
      ...list[existingIdx],
      ...data,
      name: data.name.trim(),
      city: data.city.trim(),
      contactPerson: data.contactPerson?.trim() || '',
      phone: normalizedPhone,
      notes: data.notes?.trim() || '',
      updatedAt: now
    };
    list[existingIdx] = target;
  } else {
    target = {
      id: data.id || `rp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      city: data.city.trim(),
      contactPerson: data.contactPerson?.trim() || '',
      phone: normalizedPhone,
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };
    list.unshift(target);
  }

  clearKhataDeletionTombstone('khataReceivingPoints', target.id);
  writeCollection(KHATA_STORAGE_KEYS.RECEIVING_POINTS, list);
  void mirrorFlatKhataDocToFirestore('khataReceivingPoints', target as unknown as { id: string }, 'upsert');
  return target;
}

export function deleteReceivingPoint(id: string): boolean {
  const list = readCollection<KhataReceivingPoint>(KHATA_STORAGE_KEYS.RECEIVING_POINTS);
  const target = list.find(p => p.id === id);
  if (!target) return false;

  writeCollection(KHATA_STORAGE_KEYS.RECEIVING_POINTS, list.filter(p => p.id !== id));
  recordKhataDeletionTombstone('khataReceivingPoints', id);
  void mirrorFlatKhataDocToFirestore('khataReceivingPoints', target as unknown as { id: string }, 'delete');

  const allEntries = readCollection<KhataReceivingEntry>(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES);
  const toDelete = allEntries.filter(e => e.pointId === id);
  writeCollection(
    KHATA_STORAGE_KEYS.RECEIVING_ENTRIES,
    allEntries.filter(e => e.pointId !== id)
  );
  toDelete.forEach(e => {
    recordKhataDeletionTombstone('khataReceivingEntries', e.id);
    void mirrorFlatKhataDocToFirestore('khataReceivingEntries', e as unknown as { id: string }, 'delete');
  });
  return true;
}

export function getAllReceivingEntries(): KhataReceivingEntry[] {
  return readCollection<KhataReceivingEntry>(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getReceivingEntries(pointId: string): KhataReceivingEntry[] {
  return getAllReceivingEntries().filter(e => e.pointId === pointId);
}

export function saveOrUpdateReceivingEntry(
  data: Partial<KhataReceivingEntry> & {
    pointId: string;
    type: KhataReceivingEntry['type'];
    amount: number;
    date: string;
  }
): KhataReceivingEntry {
  const list = readCollection<KhataReceivingEntry>(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES);
  const now = new Date().toISOString();
  const existingIdx = data.id ? list.findIndex(e => e.id === data.id) : -1;

  let target: KhataReceivingEntry;
  if (existingIdx >= 0) {
    target = {
      ...list[existingIdx],
      ...data,
      amount: Math.abs(fromPaisa(toPaisa(Number(data.amount) || 0))),
      updatedAt: now
    };
    list[existingIdx] = target;
  } else {
    target = {
      id: data.id || `rp_ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pointId: data.pointId,
      date: data.date || getTodayIsoDate(),
      type: data.type,
      amount: Math.abs(fromPaisa(toPaisa(Number(data.amount) || 0))),
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };
    list.unshift(target);
  }

  clearKhataDeletionTombstone('khataReceivingEntries', target.id);
  writeCollection(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, list);
  void mirrorFlatKhataDocToFirestore('khataReceivingEntries', target as unknown as { id: string }, 'upsert');
  return target;
}

export function deleteReceivingEntry(id: string): boolean {
  const list = readCollection<KhataReceivingEntry>(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES);
  const target = list.find(e => e.id === id);
  if (!target) return false;
  writeCollection(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, list.filter(e => e.id !== id));
  recordKhataDeletionTombstone('khataReceivingEntries', id);
  void mirrorFlatKhataDocToFirestore('khataReceivingEntries', target as unknown as { id: string }, 'delete');
  return true;
}

export function calculateReceivingPointSummary(entries: KhataReceivingEntry[] = []): {
  totalReceived: number;
  totalPaid: number;
  pendingBalance: number;
} {
  let totalReceivedPaisa = 0;
  let totalPaidPaisa = 0;
  for (const e of entries) {
    const amtPaisa = Math.max(0, toPaisa(Number(e.amount) || 0));
    if (e.type === 'received') totalReceivedPaisa += amtPaisa;
    else if (e.type === 'paid') totalPaidPaisa += amtPaisa;
  }
  return {
    totalReceived: fromPaisa(totalReceivedPaisa),
    totalPaid: fromPaisa(totalPaidPaisa),
    pendingBalance: fromPaisa(totalReceivedPaisa - totalPaidPaisa)
  };
}

export function formatReceivingPointWhatsApp(
  point: KhataReceivingPoint,
  entries: KhataReceivingEntry[],
  businessName?: string,
  lang: Language = 'ur'
): string {
  const isUrdu = lang === 'ur';
  const biz = businessName?.trim() ? businessName.trim() : 'Driver Dost';
  const summary = calculateReceivingPointSummary(entries);
  if (isUrdu) {
    return (
      `📍 *ریسیونگ پوائنٹ کھاتہ (${point.name})*\n` +
      `🏙️ شہر: ${point.city}\n` +
      (point.contactPerson ? `👤 رابطہ: ${point.contactPerson}\n` : '') +
      `--------------------------------\n` +
      `کل وصولی / بلڈ: PKR ${summary.totalReceived.toLocaleString('en-US')}\n` +
      `کل ادائیگی: PKR ${summary.totalPaid.toLocaleString('en-US')}\n` +
      `💰 *بقایا پینڈنگ بیلنس: PKR ${summary.pendingBalance.toLocaleString('en-US')}*\n` +
      `— ${biz}`
    );
  }
  return (
    `📍 *RECEIVING POINT STATEMENT (${point.name})*\n` +
    `🏙️ City: ${point.city}\n` +
    (point.contactPerson ? `👤 Contact: ${point.contactPerson}\n` : '') +
    `--------------------------------\n` +
    `Total Received / Billed: PKR ${summary.totalReceived.toLocaleString('en-US')}\n` +
    `Total Paid / Remitted: PKR ${summary.totalPaid.toLocaleString('en-US')}\n` +
    `💰 *Pending Balance: PKR ${summary.pendingBalance.toLocaleString('en-US')}*\n` +
    `— ${biz}`
  );
}

// =========================================================================
// 4. DAILY EXPENSES (روزمرہ اخراجات) + CASHBOOK ANTI-DOUBLE-COUNT SYNC
// =========================================================================

export function mapExpenseCategoryToCashCategory(cat: KhataExpenseCategory): CashEntry['category'] {
  switch (cat) {
    case 'fuel':
      return 'fuel';
    case 'toll':
      return 'toll';
    case 'meals':
      return 'food';
    case 'repair':
      return 'maintenance';
    case 'parking':
      return 'parking';
    case 'fine':
      return 'challan';
    default:
      return 'other';
  }
}

export function getAllDailyExpenses(): KhataDailyExpense[] {
  return readCollection<KhataDailyExpense>(KHATA_STORAGE_KEYS.DAILY_EXPENSES).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveOrUpdateDailyExpense(
  data: Partial<KhataDailyExpense> & {
    date: string;
    category: KhataExpenseCategory;
    amount: number;
  }
): KhataDailyExpense {
  const list = readCollection<KhataDailyExpense>(KHATA_STORAGE_KEYS.DAILY_EXPENSES);
  const now = new Date().toISOString();
  const existingIdx = data.id ? list.findIndex(e => e.id === data.id) : -1;
  const existing = existingIdx >= 0 ? list[existingIdx] : undefined;

  const expenseId = existing?.id || data.id || `dexp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cashEntryId = existing?.linkedCashEntryId || `cash_${expenseId}`;
  const cleanAmount = Math.abs(Number(data.amount) || 0);
  const cleanVehicle = data.vehicleNo?.trim() || undefined;
  const cleanNotes = data.notes?.trim() || '';

  // Mirror single CashEntry ('out') in Cashbook without double counting
  const cashNotePrefix = cleanVehicle ? `[${cleanVehicle}] ` : '';
  const cashEntry = saveOrUpdateCashEntry(
    {
      id: cashEntryId,
      type: 'out',
      amount: cleanAmount,
      date: data.date || getTodayIsoDate(),
      category: mapExpenseCategoryToCashCategory(data.category),
      vehicleNo: cleanVehicle,
      note: cleanNotes ? `${cashNotePrefix}${cleanNotes}` : `${cashNotePrefix}${data.category}`,
      sourceModule: 'daily_expense',
      linkedExpenseId: expenseId
    },
    { skipExpenseSync: true }
  );

  const target: KhataDailyExpense = {
    id: expenseId,
    date: data.date || getTodayIsoDate(),
    category: data.category,
    amount: cleanAmount,
    vehicleNo: cleanVehicle,
    notes: cleanNotes,
    linkedCashEntryId: cashEntry.id,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  if (existingIdx >= 0) {
    list[existingIdx] = target;
  } else {
    list.unshift(target);
  }

  clearKhataDeletionTombstone('khataDailyExpenses', target.id);
  writeCollection(KHATA_STORAGE_KEYS.DAILY_EXPENSES, list);
  void mirrorFlatKhataDocToFirestore('khataDailyExpenses', target as unknown as { id: string }, 'upsert');
  return target;
}

export function deleteDailyExpense(id: string): boolean {
  const list = readCollection<KhataDailyExpense>(KHATA_STORAGE_KEYS.DAILY_EXPENSES);
  const target = list.find(e => e.id === id);
  if (!target) return false;

  writeCollection(KHATA_STORAGE_KEYS.DAILY_EXPENSES, list.filter(e => e.id !== id));
  recordKhataDeletionTombstone('khataDailyExpenses', id);
  void mirrorFlatKhataDocToFirestore('khataDailyExpenses', target as unknown as { id: string }, 'delete');

  if (target.linkedCashEntryId) {
    deleteCashEntry(target.linkedCashEntryId, { skipExpenseSync: true });
  }
  return true;
}

export function getDailyExpensesPeriodTotals(
  expenses: KhataDailyExpense[],
  referenceDate: string = getTodayIsoDate()
): {
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  byCategory: Record<KhataExpenseCategory, number>;
} {
  const weekStart = shiftDateKey(referenceDate, -6);
  const monthPrefix = referenceDate.slice(0, 7); // YYYY-MM

  let dailyTotalPaisa = 0;
  let weeklyTotalPaisa = 0;
  let monthlyTotalPaisa = 0;

  const byCategoryPaisa: Record<KhataExpenseCategory, number> = {
    fuel: 0,
    toll: 0,
    meals: 0,
    repair: 0,
    parking: 0,
    fine: 0,
    other: 0
  };

  for (const exp of expenses) {
    const amtPaisa = Math.max(0, toPaisa(Number(exp.amount) || 0));
    if (exp.date === referenceDate) dailyTotalPaisa += amtPaisa;
    if (exp.date >= weekStart && exp.date <= referenceDate) weeklyTotalPaisa += amtPaisa;
    if (exp.date.startsWith(monthPrefix)) {
      monthlyTotalPaisa += amtPaisa;
      const cat = exp.category in byCategoryPaisa ? exp.category : 'other';
      byCategoryPaisa[cat] += amtPaisa;
    }
  }

  return {
    dailyTotal: fromPaisa(dailyTotalPaisa),
    weeklyTotal: fromPaisa(weeklyTotalPaisa),
    monthlyTotal: fromPaisa(monthlyTotalPaisa),
    byCategory: {
      fuel: fromPaisa(byCategoryPaisa.fuel),
      toll: fromPaisa(byCategoryPaisa.toll),
      meals: fromPaisa(byCategoryPaisa.meals),
      repair: fromPaisa(byCategoryPaisa.repair),
      parking: fromPaisa(byCategoryPaisa.parking),
      fine: fromPaisa(byCategoryPaisa.fine),
      other: fromPaisa(byCategoryPaisa.other)
    }
  };
}

// =========================================================================
// 5. REPORTS HUB (رپورٹس)
// =========================================================================

export type ReportDatePreset = 'today' | 'week' | 'month' | 'custom';

export function getDateRangeBounds(
  preset: ReportDatePreset,
  customStart?: string,
  customEnd?: string,
  referenceDate: string = getTodayIsoDate()
): { startDate: string; endDate: string } {
  if (preset === 'custom') {
    const start = customStart || referenceDate;
    const end = customEnd || referenceDate;
    return start <= end ? { startDate: start, endDate: end } : { startDate: end, endDate: start };
  }
  if (preset === 'today') {
    return { startDate: referenceDate, endDate: referenceDate };
  }
  if (preset === 'week') {
    return { startDate: shiftDateKey(referenceDate, -6), endDate: referenceDate };
  }
  // month
  const monthStart = `${referenceDate.slice(0, 7)}-01`;
  return { startDate: monthStart, endDate: referenceDate };
}

export interface ReportsHubAnalytics {
  startDate: string;
  endDate: string;
  incomeVsExpense: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    cashInTotal: number;
    billsCollectedTotal: number;
    tripsIncomeTotal: number;
    dailyExpensesTotal: number;
    manualCashOutTotal: number;
    employeeSalaryPaidTotal: number;
    tripsExpenseTotal: number;
  };
  partyReceivablePayable: {
    totalReceivable: number;
    totalPayable: number;
    netBalance: number;
    partyCount: number;
  };
  brokerCommissionDue: {
    totalCommissionDue: number;
    totalPaidToBrokers: number;
    brokerCount: number;
  };
  vehicleProfitLoss: Array<{
    vehicleNo: string;
    income: number;
    expenses: number;
    netProfit: number;
    tripsCount: number;
    dailyExpensesCount: number;
  }>;
  employeeSummary: {
    totalSalaryDue: number;
    totalAdvance: number;
    totalSalaryPaid: number;
    totalDeduction: number;
    totalBonus: number;
    totalTripAllowance: number;
    netPayableToEmployees: number;
    activeEmployeesCount: number;
  };
  receivingPointsSummary: {
    totalReceived: number;
    totalPaid: number;
    totalPending: number;
    pointsCount: number;
    pointsBreakdown: Array<{
      id: string;
      name: string;
      city: string;
      received: number;
      paid: number;
      pending: number;
    }>;
  };
  billsSummary: {
    totalCount: number;
    totalBilled: number;
    totalCollected: number;
    totalPendingBalance: number;
    unpaidCount: number;
    partialCount: number;
    paidCount: number;
  };
  expensesByCategory: {
    total: number;
    items: Array<{ category: string; amount: number; percentage: number }>;
  };
}

function isInDateRange(dateStr: string | undefined, startDate: string, endDate: string): boolean {
  if (!dateStr) return false;
  const iso = dateStr.slice(0, 10);
  return iso >= startDate && iso <= endDate;
}

export interface ReportsHubInput {
  startDate: string;
  endDate: string;
  accounts?: LedgerAccount[];
  ledgerEntries?: LedgerEntry[];
  cashEntries?: CashEntry[];
  bills?: KhataBill[];
  employees?: KhataEmployee[];
  employeeEntries?: KhataEmployeeEntry[];
  receivingPoints?: KhataReceivingPoint[];
  receivingEntries?: KhataReceivingEntry[];
  dailyExpenses?: KhataDailyExpense[];
  trips?: Trip[];
}

export function calculateReportsHubAnalytics(input: ReportsHubInput): ReportsHubAnalytics {
  const { startDate, endDate } = input;
  const accounts = input.accounts ?? getLedgerAccounts();
  const ledgerEntries = input.ledgerEntries ?? getAllLedgerEntries();
  const cashEntries = input.cashEntries ?? getAllCashEntries();
  const bills = input.bills ?? getAllBills();
  const employees = input.employees ?? getAllEmployees();
  const employeeEntries = input.employeeEntries ?? getAllEmployeeEntries();
  const receivingPoints = input.receivingPoints ?? getAllReceivingPoints();
  const receivingEntries = input.receivingEntries ?? getAllReceivingEntries();
  const dailyExpenses = input.dailyExpenses ?? getAllDailyExpenses();
  const trips = input.trips ?? [];

  // Deduplicate Daily Expenses <-> Cashbook entries
  const dailyExpenseIds = new Set(dailyExpenses.map(e => e.id));
  const dailyExpenseCashIds = new Set(dailyExpenses.map(e => e.linkedCashEntryId).filter(Boolean) as string[]);

  const rangeDailyExpenses = dailyExpenses.filter(e => isInDateRange(e.date, startDate, endDate));
  const rangeCashEntries = cashEntries.filter(c => isInDateRange(c.date, startDate, endDate));
  const rangeNonDupCashOut = rangeCashEntries.filter(
    c =>
      c.type === 'out' &&
      c.sourceModule !== 'daily_expense' &&
      !dailyExpenseCashIds.has(c.id) &&
      (!c.linkedExpenseId || !dailyExpenseIds.has(c.linkedExpenseId))
  );
  const rangeCashIn = rangeCashEntries.filter(c => c.type === 'in');
  const rangeBills = bills.filter(b => isInDateRange(b.date, startDate, endDate));
  const rangeEmpEntries = employeeEntries.filter(e => isInDateRange(e.date, startDate, endDate));
  const rangeRpEntries = receivingEntries.filter(e => isInDateRange(e.date, startDate, endDate));
  const rangeTrips = trips.filter(t => isInDateRange(t.date, startDate, endDate));

  // 1. Income vs Expenses vs Net (no double counting, integer paisa precision #22)
  const cashInTotalPaisa = rangeCashIn.reduce((s, c) => s + toPaisa(Number(c.amount) || 0), 0);
  const billsCollectedTotalPaisa = rangeBills.reduce((s, b) => s + toPaisa(Number(b.advance) || 0), 0);
  const tripsIncomeTotalPaisa = rangeTrips.reduce(
    (s, t) => s + toPaisa(Number(t.totalIncome ?? t.expectedIncome ?? 0) || 0),
    0
  );

  const dailyExpensesTotalPaisa = rangeDailyExpenses.reduce((s, e) => s + toPaisa(Number(e.amount) || 0), 0);
  const manualCashOutTotalPaisa = rangeNonDupCashOut.reduce((s, c) => s + toPaisa(Number(c.amount) || 0), 0);
  const employeeSalaryPaidTotalPaisa = rangeEmpEntries
    .filter(e => e.type === 'salary_paid' || e.type === 'advance')
    .reduce((s, e) => s + toPaisa(Number(e.amount) || 0), 0);
  const tripsExpenseTotalPaisa = rangeTrips.reduce((s, t) => s + toPaisa(Number(t.total) || 0), 0);

  const totalIncomePaisa = cashInTotalPaisa + tripsIncomeTotalPaisa + billsCollectedTotalPaisa;
  const totalExpensesPaisa =
    dailyExpensesTotalPaisa + manualCashOutTotalPaisa + employeeSalaryPaidTotalPaisa + tripsExpenseTotalPaisa;
  const totalIncome = Math.round(fromPaisa(totalIncomePaisa));
  const totalExpenses = Math.round(fromPaisa(totalExpensesPaisa));
  const netProfit = totalIncome - totalExpenses;

  // 2. Party Receivable / Payable & 3. Broker Commission Due
  let totalReceivablePaisa = 0;
  let totalPayablePaisa = 0;
  let partyCount = 0;

  let totalCommissionDuePaisa = 0;
  let totalPaidToBrokersPaisa = 0;
  let brokerCount = 0;

  for (const acc of accounts) {
    const accEntries = ledgerEntries.filter(e => e.accountId === acc.id);
    if (acc.kind === 'party') {
      partyCount++;
      const { balance } = calculateAccountBalance(acc, accEntries);
      if (balance > 0) totalReceivablePaisa += toPaisa(balance);
      else if (balance < 0) totalPayablePaisa += toPaisa(Math.abs(balance));
    } else if (acc.kind === 'broker') {
      brokerCount++;
      const { balance, totalGave } = calculateAccountBalance(acc, accEntries);
      totalPaidToBrokersPaisa += toPaisa(totalGave);
      if (balance < 0) totalCommissionDuePaisa += toPaisa(Math.abs(balance));
    }
  }

  // 4. Vehicle-wise Profit/Loss (integer paisa accumulation)
  const vehicleMap = new Map<
    string,
    { incomePaisa: number; expensesPaisa: number; tripsCount: number; dailyExpensesCount: number }
  >();

  const ensureVehicle = (regRaw?: string) => {
    const reg = (regRaw || '').trim().toUpperCase();
    if (!reg) return null;
    if (!vehicleMap.has(reg)) {
      vehicleMap.set(reg, { incomePaisa: 0, expensesPaisa: 0, tripsCount: 0, dailyExpensesCount: 0 });
    }
    return vehicleMap.get(reg)!;
  };

  for (const t of rangeTrips) {
    const reg = t.vehicleNo || (t.name?.match(/\(([^)]+)\)/)?.[1]) || t.name || 'General';
    const bucket = ensureVehicle(reg);
    if (bucket) {
      bucket.incomePaisa += toPaisa(Number(t.totalIncome ?? t.expectedIncome ?? 0) || 0);
      bucket.expensesPaisa += toPaisa(Number(t.total) || 0);
      bucket.tripsCount++;
    }
  }

  for (const d of rangeDailyExpenses) {
    if (!d.vehicleNo) continue;
    const bucket = ensureVehicle(d.vehicleNo);
    if (bucket) {
      bucket.expensesPaisa += toPaisa(Number(d.amount) || 0);
      bucket.dailyExpensesCount++;
    }
  }

  for (const c of rangeNonDupCashOut) {
    if (!c.vehicleNo) continue;
    const bucket = ensureVehicle(c.vehicleNo);
    if (bucket) {
      bucket.expensesPaisa += toPaisa(Number(c.amount) || 0);
    }
  }

  for (const b of rangeBills) {
    if (!b.vehicleNo) continue;
    const bucket = ensureVehicle(b.vehicleNo);
    if (bucket) {
      bucket.incomePaisa += toPaisa(Number(b.total) || 0);
    }
  }

  const vehicleProfitLoss = Array.from(vehicleMap.entries())
    .map(([vehicleNo, v]) => {
      const income = Math.round(fromPaisa(v.incomePaisa));
      const expenses = Math.round(fromPaisa(v.expensesPaisa));
      return {
        vehicleNo,
        income,
        expenses,
        netProfit: income - expenses,
        tripsCount: v.tripsCount,
        dailyExpensesCount: v.dailyExpensesCount
      };
    })
    .sort((a, b) => b.netProfit - a.netProfit);

  // 5. Employee Salary / Advances (for range)
  const empRangeSummary = calculateEmployeeLedgerSummary(rangeEmpEntries);
  const employeeSummary = {
    totalSalaryDue: empRangeSummary.totalSalaryDue,
    totalAdvance: empRangeSummary.totalAdvance,
    totalSalaryPaid: empRangeSummary.totalSalaryPaid,
    totalDeduction: empRangeSummary.totalDeduction,
    totalBonus: empRangeSummary.totalBonus,
    totalTripAllowance: empRangeSummary.totalTripAllowance,
    netPayableToEmployees: empRangeSummary.netBalance,
    activeEmployeesCount: employees.filter(e => e.active).length
  };

  // 6. Receiving Point Balances (in range)
  const pointsBreakdown = receivingPoints.map(pt => {
    const ptEntries = rangeRpEntries.filter(e => e.pointId === pt.id);
    const sum = calculateReceivingPointSummary(ptEntries);
    return {
      id: pt.id,
      name: pt.name,
      city: pt.city,
      received: sum.totalReceived,
      paid: sum.totalPaid,
      pending: sum.pendingBalance
    };
  });
  const totalRpReceived = fromPaisa(pointsBreakdown.reduce((s, p) => s + toPaisa(p.received), 0));
  const totalRpPaid = fromPaisa(pointsBreakdown.reduce((s, p) => s + toPaisa(p.paid), 0));

  // 7. Bills Summary (in range)
  const billsSummary = {
    totalCount: rangeBills.length,
    totalBilled: Math.round(fromPaisa(rangeBills.reduce((s, b) => s + toPaisa(Number(b.total) || 0), 0))),
    totalCollected: Math.round(fromPaisa(rangeBills.reduce((s, b) => s + toPaisa(Number(b.advance) || 0), 0))),
    totalPendingBalance: Math.round(fromPaisa(rangeBills.reduce((s, b) => s + toPaisa(Number(b.balance) || 0), 0))),
    unpaidCount: rangeBills.filter(b => b.status === 'unpaid').length,
    partialCount: rangeBills.filter(b => b.status === 'partial').length,
    paidCount: rangeBills.filter(b => b.status === 'paid').length
  };

  // 8. Expenses by Category (dailyExpenses + non-duplicated CashOut)
  const catTotalsPaisa = new Map<string, number>();
  for (const e of rangeDailyExpenses) {
    const k = e.category || 'other';
    catTotalsPaisa.set(k, (catTotalsPaisa.get(k) || 0) + toPaisa(Number(e.amount) || 0));
  }
  for (const c of rangeNonDupCashOut) {
    const k =
      c.category === 'food'
        ? 'meals'
        : c.category === 'maintenance'
        ? 'repair'
        : c.category === 'challan'
        ? 'fine'
        : c.category || 'other';
    catTotalsPaisa.set(k, (catTotalsPaisa.get(k) || 0) + toPaisa(Number(c.amount) || 0));
  }

  const catGrandTotalPaisa = Array.from(catTotalsPaisa.values()).reduce((s, v) => s + v, 0);
  const catItems = Array.from(catTotalsPaisa.entries())
    .map(([category, amountPaisa]) => ({
      category,
      amount: Math.round(fromPaisa(amountPaisa)),
      percentage: catGrandTotalPaisa > 0 ? Math.round((amountPaisa / catGrandTotalPaisa) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    startDate,
    endDate,
    incomeVsExpense: {
      totalIncome,
      totalExpenses,
      netProfit,
      cashInTotal: Math.round(fromPaisa(cashInTotalPaisa)),
      billsCollectedTotal: Math.round(fromPaisa(billsCollectedTotalPaisa)),
      tripsIncomeTotal: Math.round(fromPaisa(tripsIncomeTotalPaisa)),
      dailyExpensesTotal: Math.round(fromPaisa(dailyExpensesTotalPaisa)),
      manualCashOutTotal: Math.round(fromPaisa(manualCashOutTotalPaisa)),
      employeeSalaryPaidTotal: Math.round(fromPaisa(employeeSalaryPaidTotalPaisa)),
      tripsExpenseTotal: Math.round(fromPaisa(tripsExpenseTotalPaisa))
    },
    partyReceivablePayable: {
      totalReceivable: Math.round(fromPaisa(totalReceivablePaisa)),
      totalPayable: Math.round(fromPaisa(totalPayablePaisa)),
      netBalance: Math.round(fromPaisa(totalReceivablePaisa - totalPayablePaisa)),
      partyCount
    },
    brokerCommissionDue: {
      totalCommissionDue: Math.round(fromPaisa(totalCommissionDuePaisa)),
      totalPaidToBrokers: Math.round(fromPaisa(totalPaidToBrokersPaisa)),
      brokerCount
    },
    vehicleProfitLoss,
    employeeSummary,
    receivingPointsSummary: {
      totalReceived: totalRpReceived,
      totalPaid: totalRpPaid,
      totalPending: fromPaisa(toPaisa(totalRpReceived) - toPaisa(totalRpPaid)),
      pointsCount: receivingPoints.length,
      pointsBreakdown
    },
    billsSummary,
    expensesByCategory: {
      total: Math.round(fromPaisa(catGrandTotalPaisa)),
      items: catItems
    }
  };
}
