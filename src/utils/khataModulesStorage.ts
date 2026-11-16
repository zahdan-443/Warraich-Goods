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
import { getScopedItem, safeStorage, setScopedItem } from './storage';
import {
  KHATA_STORAGE_KEYS,
  calculateAccountBalance,
  deleteCashEntry,
  formatPhoneForDisplay,
  getAllCashEntries,
  getAllLedgerEntries,
  getLedgerAccounts,
  mirrorFlatKhataDocToFirestore,
  normalizePakistaniPhone,
  saveOrUpdateCashEntry,
  saveOrUpdateLedgerAccount,
  saveOrUpdateLedgerEntry
} from './ledgerStorage';

// ----------------- INTERNAL SCOPED JSON HELPERS -----------------

function readCollection<T>(key: string): T[] {
  try {
    const raw = getScopedItem(key);
    if (!raw) {
      const legacy = safeStorage.getItem(key);
      if (legacy !== null) {
        setScopedItem(key, legacy);
        const parsed = JSON.parse(legacy);
        return Array.isArray(parsed) ? parsed : [];
      }
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
  return new Date().toISOString().split('T')[0];
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
  let subtotal = 0;
  for (const item of lineItems) {
    const qty = Math.max(0, Number(item.qty) || 0);
    const rate = Math.max(0, Number(item.rate) || 0);
    const lineAmt = qty > 0 && rate > 0 ? qty * rate : Math.max(0, Number(item.amount) || 0);
    subtotal += lineAmt;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const safeExtra = Math.max(0, Number(extraCharges) || 0);
  const safeDiscount = Math.max(0, Number(discount) || 0);
  const safeAdvance = Math.max(0, Number(advance) || 0);

  const total = Math.max(0, Math.round((subtotal + safeExtra - safeDiscount) * 100) / 100);
  const balance = Math.max(0, Math.round((total - safeAdvance) * 100) / 100);

  let status: KhataBillStatus = 'unpaid';
  if (total === 0 || balance === 0) {
    status = 'paid';
  } else if (safeAdvance > 0 && balance > 0) {
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

  writeCollection(KHATA_STORAGE_KEYS.BILLS, bills);
  mirrorFlatKhataDocToFirestore('khataBills', target, 'upsert');
  return target;
}

export function deleteBill(id: string): boolean {
  const bills = readCollection<KhataBill>(KHATA_STORAGE_KEYS.BILLS);
  const target = bills.find(b => b.id === id);
  if (!target) return false;
  const remaining = bills.filter(b => b.id !== id);
  writeCollection(KHATA_STORAGE_KEYS.BILLS, remaining);
  mirrorFlatKhataDocToFirestore('khataBills', target, 'delete');
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

  writeCollection(KHATA_STORAGE_KEYS.EMPLOYEES, list);
  mirrorFlatKhataDocToFirestore('khataEmployees', target, 'upsert');
  return target;
}

export function deleteEmployee(id: string): boolean {
  const list = readCollection<KhataEmployee>(KHATA_STORAGE_KEYS.EMPLOYEES);
  const target = list.find(e => e.id === id);
  if (!target) return false;

  writeCollection(KHATA_STORAGE_KEYS.EMPLOYEES, list.filter(e => e.id !== id));
  mirrorFlatKhataDocToFirestore('khataEmployees', target, 'delete');

  const allEntries = readCollection<KhataEmployeeEntry>(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES);
  const toDelete = allEntries.filter(en => en.employeeId === id);
  writeCollection(
    KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES,
    allEntries.filter(en => en.employeeId !== id)
  );
  toDelete.forEach(en => mirrorFlatKhataDocToFirestore('khataEmployeeEntries', en, 'delete'));
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
      amount: Math.abs(Number(data.amount)),
      updatedAt: now
    };
    list[existingIdx] = target;
  } else {
    target = {
      id: data.id || `emp_ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      employeeId: data.employeeId,
      date: data.date || getTodayIsoDate(),
      type: data.type,
      amount: Math.abs(Number(data.amount)),
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };
    list.unshift(target);
  }

  writeCollection(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, list);
  mirrorFlatKhataDocToFirestore('khataEmployeeEntries', target, 'upsert');
  return target;
}

export function deleteEmployeeEntry(id: string): boolean {
  const list = readCollection<KhataEmployeeEntry>(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES);
  const target = list.find(e => e.id === id);
  if (!target) return false;
  writeCollection(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, list.filter(e => e.id !== id));
  mirrorFlatKhataDocToFirestore('khataEmployeeEntries', target, 'delete');
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
  netBalance: number; // + payable to employee, - advance recoverable
  status: 'payable' | 'advance_recoverable' | 'settled';
}

export function isEmployeeCreditType(type: KhataEmployeeEntry['type']): boolean {
  return type === 'salary_due' || type === 'bonus' || type === 'trip_allowance';
}

export function calculateEmployeeLedgerSummary(entries: KhataEmployeeEntry[] = []): EmployeeLedgerSummary {
  let totalSalaryDue = 0;
  let totalBonus = 0;
  let totalTripAllowance = 0;
  let totalAdvance = 0;
  let totalSalaryPaid = 0;
  let totalDeduction = 0;

  for (const e of entries) {
    const amt = Math.max(0, Number(e.amount) || 0);
    switch (e.type) {
      case 'salary_due':
        totalSalaryDue += amt;
        break;
      case 'bonus':
        totalBonus += amt;
        break;
      case 'trip_allowance':
        totalTripAllowance += amt;
        break;
      case 'advance':
        totalAdvance += amt;
        break;
      case 'salary_paid':
        totalSalaryPaid += amt;
        break;
      case 'deduction':
        totalDeduction += amt;
        break;
    }
  }

  const totalEarned = totalSalaryDue + totalBonus + totalTripAllowance;
  const totalPaidAndDeducted = totalAdvance + totalSalaryPaid + totalDeduction;
  const netBalance = Math.round((totalEarned - totalPaidAndDeducted) * 100) / 100;

  return {
    totalSalaryDue: Math.round(totalSalaryDue),
    totalBonus: Math.round(totalBonus),
    totalTripAllowance: Math.round(totalTripAllowance),
    totalEarned: Math.round(totalEarned),
    totalAdvance: Math.round(totalAdvance),
    totalSalaryPaid: Math.round(totalSalaryPaid),
    totalDeduction: Math.round(totalDeduction),
    totalPaidAndDeducted: Math.round(totalPaidAndDeducted),
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

  writeCollection(KHATA_STORAGE_KEYS.RECEIVING_POINTS, list);
  mirrorFlatKhataDocToFirestore('khataReceivingPoints', target, 'upsert');
  return target;
}

export function deleteReceivingPoint(id: string): boolean {
  const list = readCollection<KhataReceivingPoint>(KHATA_STORAGE_KEYS.RECEIVING_POINTS);
  const target = list.find(p => p.id === id);
  if (!target) return false;

  writeCollection(KHATA_STORAGE_KEYS.RECEIVING_POINTS, list.filter(p => p.id !== id));
  mirrorFlatKhataDocToFirestore('khataReceivingPoints', target, 'delete');

  const allEntries = readCollection<KhataReceivingEntry>(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES);
  const toDelete = allEntries.filter(e => e.pointId === id);
  writeCollection(
    KHATA_STORAGE_KEYS.RECEIVING_ENTRIES,
    allEntries.filter(e => e.pointId !== id)
  );
  toDelete.forEach(e => mirrorFlatKhataDocToFirestore('khataReceivingEntries', e, 'delete'));
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
      amount: Math.abs(Number(data.amount)),
      updatedAt: now
    };
    list[existingIdx] = target;
  } else {
    target = {
      id: data.id || `rp_ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      pointId: data.pointId,
      date: data.date || getTodayIsoDate(),
      type: data.type,
      amount: Math.abs(Number(data.amount)),
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now
    };
    list.unshift(target);
  }

  writeCollection(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, list);
  mirrorFlatKhataDocToFirestore('khataReceivingEntries', target, 'upsert');
  return target;
}

export function deleteReceivingEntry(id: string): boolean {
  const list = readCollection<KhataReceivingEntry>(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES);
  const target = list.find(e => e.id === id);
  if (!target) return false;
  writeCollection(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, list.filter(e => e.id !== id));
  mirrorFlatKhataDocToFirestore('khataReceivingEntries', target, 'delete');
  return true;
}

export function calculateReceivingPointSummary(entries: KhataReceivingEntry[] = []): {
  totalReceived: number;
  totalPaid: number;
  pendingBalance: number;
} {
  let totalReceived = 0;
  let totalPaid = 0;
  for (const e of entries) {
    const amt = Math.max(0, Number(e.amount) || 0);
    if (e.type === 'received') totalReceived += amt;
    else if (e.type === 'paid') totalPaid += amt;
  }
  return {
    totalReceived: Math.round(totalReceived),
    totalPaid: Math.round(totalPaid),
    pendingBalance: Math.round(totalReceived - totalPaid)
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

  writeCollection(KHATA_STORAGE_KEYS.DAILY_EXPENSES, list);
  mirrorFlatKhataDocToFirestore('khataDailyExpenses', target, 'upsert');
  return target;
}

export function deleteDailyExpense(id: string): boolean {
  const list = readCollection<KhataDailyExpense>(KHATA_STORAGE_KEYS.DAILY_EXPENSES);
  const target = list.find(e => e.id === id);
  if (!target) return false;

  writeCollection(KHATA_STORAGE_KEYS.DAILY_EXPENSES, list.filter(e => e.id !== id));
  mirrorFlatKhataDocToFirestore('khataDailyExpenses', target, 'delete');

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
  const ref = new Date(`${referenceDate}T00:00:00Z`);
  const weekStartObj = new Date(ref);
  weekStartObj.setUTCDate(ref.getUTCDate() - 6);
  const weekStart = weekStartObj.toISOString().split('T')[0];
  const monthPrefix = referenceDate.slice(0, 7); // YYYY-MM

  let dailyTotal = 0;
  let weeklyTotal = 0;
  let monthlyTotal = 0;

  const byCategory: Record<KhataExpenseCategory, number> = {
    fuel: 0,
    toll: 0,
    meals: 0,
    repair: 0,
    parking: 0,
    fine: 0,
    other: 0
  };

  for (const exp of expenses) {
    const amt = Math.max(0, Number(exp.amount) || 0);
    if (exp.date === referenceDate) dailyTotal += amt;
    if (exp.date >= weekStart && exp.date <= referenceDate) weeklyTotal += amt;
    if (exp.date.startsWith(monthPrefix)) {
      monthlyTotal += amt;
      const cat = exp.category in byCategory ? exp.category : 'other';
      byCategory[cat] += amt;
    }
  }

  return {
    dailyTotal: Math.round(dailyTotal),
    weeklyTotal: Math.round(weeklyTotal),
    monthlyTotal: Math.round(monthlyTotal),
    byCategory
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
    const ref = new Date(`${referenceDate}T00:00:00Z`);
    ref.setUTCDate(ref.getUTCDate() - 6);
    return { startDate: ref.toISOString().split('T')[0], endDate: referenceDate };
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

  // 1. Income vs Expenses vs Net (no double counting)
  const cashInTotal = rangeCashIn.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const billsCollectedTotal = rangeBills.reduce((s, b) => s + (Number(b.advance) || 0), 0);
  const tripsIncomeTotal = rangeTrips.reduce(
    (s, t) => s + (Number(t.totalIncome ?? t.expectedIncome ?? 0) || 0),
    0
  );

  const dailyExpensesTotal = rangeDailyExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const manualCashOutTotal = rangeNonDupCashOut.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const employeeSalaryPaidTotal = rangeEmpEntries
    .filter(e => e.type === 'salary_paid' || e.type === 'advance')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const tripsExpenseTotal = rangeTrips.reduce((s, t) => s + (Number(t.total) || 0), 0);

  const totalIncome = Math.round(cashInTotal + tripsIncomeTotal + billsCollectedTotal);
  const totalExpenses = Math.round(
    dailyExpensesTotal + manualCashOutTotal + employeeSalaryPaidTotal + tripsExpenseTotal
  );
  const netProfit = totalIncome - totalExpenses;

  // 2. Party Receivable / Payable & 3. Broker Commission Due
  let totalReceivable = 0;
  let totalPayable = 0;
  let partyCount = 0;

  let totalCommissionDue = 0;
  let totalPaidToBrokers = 0;
  let brokerCount = 0;

  for (const acc of accounts) {
    const accEntries = ledgerEntries.filter(e => e.accountId === acc.id);
    if (acc.kind === 'party') {
      partyCount++;
      const { balance } = calculateAccountBalance(acc, accEntries);
      if (balance > 0) totalReceivable += balance;
      else if (balance < 0) totalPayable += Math.abs(balance);
    } else if (acc.kind === 'broker') {
      brokerCount++;
      const { balance, totalGave } = calculateAccountBalance(acc, accEntries);
      totalPaidToBrokers += totalGave;
      if (balance < 0) totalCommissionDue += Math.abs(balance);
    }
  }

  // 4. Vehicle-wise Profit/Loss
  const vehicleMap = new Map<
    string,
    { income: number; expenses: number; tripsCount: number; dailyExpensesCount: number }
  >();

  const ensureVehicle = (regRaw?: string) => {
    const reg = (regRaw || '').trim().toUpperCase();
    if (!reg) return null;
    if (!vehicleMap.has(reg)) {
      vehicleMap.set(reg, { income: 0, expenses: 0, tripsCount: 0, dailyExpensesCount: 0 });
    }
    return vehicleMap.get(reg)!;
  };

  for (const t of rangeTrips) {
    const reg = (t as any).vehicleNo || (t.name?.match(/\(([^)]+)\)/)?.[1]) || t.name || 'General';
    const bucket = ensureVehicle(reg);
    if (bucket) {
      bucket.income += Number(t.totalIncome ?? t.expectedIncome ?? 0) || 0;
      bucket.expenses += Number(t.total) || 0;
      bucket.tripsCount++;
    }
  }

  for (const d of rangeDailyExpenses) {
    if (!d.vehicleNo) continue;
    const bucket = ensureVehicle(d.vehicleNo);
    if (bucket) {
      bucket.expenses += Number(d.amount) || 0;
      bucket.dailyExpensesCount++;
    }
  }

  for (const c of rangeNonDupCashOut) {
    if (!c.vehicleNo) continue;
    const bucket = ensureVehicle(c.vehicleNo);
    if (bucket) {
      bucket.expenses += Number(c.amount) || 0;
    }
  }

  for (const b of rangeBills) {
    if (!b.vehicleNo) continue;
    const bucket = ensureVehicle(b.vehicleNo);
    if (bucket) {
      bucket.income += Number(b.total) || 0;
    }
  }

  const vehicleProfitLoss = Array.from(vehicleMap.entries())
    .map(([vehicleNo, v]) => ({
      vehicleNo,
      income: Math.round(v.income),
      expenses: Math.round(v.expenses),
      netProfit: Math.round(v.income - v.expenses),
      tripsCount: v.tripsCount,
      dailyExpensesCount: v.dailyExpensesCount
    }))
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
  const totalRpReceived = pointsBreakdown.reduce((s, p) => s + p.received, 0);
  const totalRpPaid = pointsBreakdown.reduce((s, p) => s + p.paid, 0);

  // 7. Bills Summary (in range)
  const billsSummary = {
    totalCount: rangeBills.length,
    totalBilled: Math.round(rangeBills.reduce((s, b) => s + (Number(b.total) || 0), 0)),
    totalCollected: Math.round(rangeBills.reduce((s, b) => s + (Number(b.advance) || 0), 0)),
    totalPendingBalance: Math.round(rangeBills.reduce((s, b) => s + (Number(b.balance) || 0), 0)),
    unpaidCount: rangeBills.filter(b => b.status === 'unpaid').length,
    partialCount: rangeBills.filter(b => b.status === 'partial').length,
    paidCount: rangeBills.filter(b => b.status === 'paid').length
  };

  // 8. Expenses by Category (dailyExpenses + non-duplicated CashOut)
  const catTotals = new Map<string, number>();
  for (const e of rangeDailyExpenses) {
    const k = e.category || 'other';
    catTotals.set(k, (catTotals.get(k) || 0) + (Number(e.amount) || 0));
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
    catTotals.set(k, (catTotals.get(k) || 0) + (Number(c.amount) || 0));
  }

  const catGrandTotal = Array.from(catTotals.values()).reduce((s, v) => s + v, 0);
  const catItems = Array.from(catTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
      percentage: catGrandTotal > 0 ? Math.round((amount / catGrandTotal) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    startDate,
    endDate,
    incomeVsExpense: {
      totalIncome,
      totalExpenses,
      netProfit,
      cashInTotal: Math.round(cashInTotal),
      billsCollectedTotal: Math.round(billsCollectedTotal),
      tripsIncomeTotal: Math.round(tripsIncomeTotal),
      dailyExpensesTotal: Math.round(dailyExpensesTotal),
      manualCashOutTotal: Math.round(manualCashOutTotal),
      employeeSalaryPaidTotal: Math.round(employeeSalaryPaidTotal),
      tripsExpenseTotal: Math.round(tripsExpenseTotal)
    },
    partyReceivablePayable: {
      totalReceivable: Math.round(totalReceivable),
      totalPayable: Math.round(totalPayable),
      netBalance: Math.round(totalReceivable - totalPayable),
      partyCount
    },
    brokerCommissionDue: {
      totalCommissionDue: Math.round(totalCommissionDue),
      totalPaidToBrokers: Math.round(totalPaidToBrokers),
      brokerCount
    },
    vehicleProfitLoss,
    employeeSummary,
    receivingPointsSummary: {
      totalReceived: totalRpReceived,
      totalPaid: totalRpPaid,
      totalPending: totalRpReceived - totalRpPaid,
      pointsCount: receivingPoints.length,
      pointsBreakdown
    },
    billsSummary,
    expensesByCategory: {
      total: Math.round(catGrandTotal),
      items: catItems
    }
  };
}
