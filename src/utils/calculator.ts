import { BiltyRecord, Driver, OfflineAction, Trip, UserRole } from '../types';
import { OWNER_EMAIL, isOwnerEmail, verifyOwnerOrStaffClaim } from './authUtils';

export { OWNER_EMAIL };

/**
 * Storage Scope Helper
 * Computes isolated scope identifier for localStorage keys (UID or 'guest').
 */
export function getStorageScope(
  currentUser?: { uid?: string | null; email?: string | null } | null,
  localFallbackUser?: string | null
): string {
  if (currentUser?.uid) {
    return currentUser.uid;
  }
  if (localFallbackUser) {
    return localFallbackUser.replace(/[^a-zA-Z0-9_]/g, '_');
  }
  return 'guest';
}

/**
 * Scoped Local Storage Key Generator
 */
export function getScopedStorageKey(baseKey: string, scope: string = 'guest'): string {
  return `wg_v2_${scope}_${baseKey}`;
}

// ---------------------------------------------------------------------------
// Integer Paisa Precision Helpers (#22)
// ---------------------------------------------------------------------------

/**
 * Converts a rupee number into integer paisa (1 PKR = 100 paisa)
 * to eliminate IEEE-754 floating-point drift (e.g. 0.1 + 0.2 = 0.30000000000000004).
 */
export function toPaisa(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

/**
 * Converts integer paisa back to a rounded 2-decimal rupee number.
 */
export function fromPaisa(paisa: number): number {
  if (!Number.isFinite(paisa)) return 0;
  return Math.round(paisa) / 100;
}

export function sumRupees(...amounts: number[]): number {
  let totalPaisa = 0;
  for (const a of amounts) {
    totalPaisa += toPaisa(Number.isFinite(a) ? a : 0);
  }
  return fromPaisa(totalPaisa);
}

export function subtractRupees(a: number, b: number): number {
  return fromPaisa(toPaisa(a) - toPaisa(b));
}

export function multiplyRupees(qty: number, rate: number): number {
  if (!Number.isFinite(qty) || !Number.isFinite(rate)) return 0;
  return fromPaisa(Math.round(qty * toPaisa(rate)));
}

function safeFiniteNonNeg(val: unknown): number {
  const num = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return num;
}

/**
 * Strict Financial Number Validator (#19)
 * Accepts only valid decimal strings (optional commas) or finite numbers.
 * Rejects partial parses ('12abc', '1.2.3', '50 000') and non-finite values.
 */
export function validateFinancialNumber(
  val: unknown,
  fieldName: string = 'Amount',
  options: { allowZero?: boolean; max?: number } = { allowZero: true, max: 100000000 }
): { isValid: boolean; value: number; error?: string } {
  if (val === null || val === undefined || val === '') {
    return {
      isValid: Boolean(options.allowZero),
      value: 0,
      error: options.allowZero ? undefined : `${fieldName} is required`
    };
  }

  let num: number;
  if (typeof val === 'number') {
    num = val;
  } else if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '') {
      return {
        isValid: Boolean(options.allowZero),
        value: 0,
        error: options.allowZero ? undefined : `${fieldName} is required`
      };
    }
    const withoutCommas = trimmed.replace(/,/g, '');
    if (!/^-?\d+(?:\.\d+)?$/.test(withoutCommas)) {
      return {
        isValid: false,
        value: 0,
        error: `${fieldName} must be a valid number (درست رقم درج کریں)`
      };
    }
    num = Number(withoutCommas);
  } else {
    return {
      isValid: false,
      value: 0,
      error: `${fieldName} must be a valid number (درست رقم درج کریں)`
    };
  }

  if (!Number.isFinite(num) || Number.isNaN(num)) {
    return {
      isValid: false,
      value: 0,
      error: `${fieldName} must be a valid number (درست رقم درج کریں)`
    };
  }

  if (num < 0) {
    return {
      isValid: false,
      value: 0,
      error: `${fieldName} cannot be negative (منفی رقم کی اجازت نہیں ہے)`
    };
  }

  if (!options.allowZero && num === 0) {
    return {
      isValid: false,
      value: 0,
      error: `${fieldName} must be greater than zero`
    };
  }

  if (options.max !== undefined && num > options.max) {
    return {
      isValid: false,
      value: num,
      error: `${fieldName} exceeds maximum allowable limit of ${options.max}`
    };
  }

  return {
    isValid: true,
    value: fromPaisa(toPaisa(num))
  };
}

/**
 * Fuel Cost Calculation (#21)
 * Safely handles NaN, Infinity, or non-positive inputs by returning 0.
 */
export function calculateFuelCost(
  dist: number,
  mileage: number,
  pricePerLiter: number,
  isReturn: boolean = false
): { totalDist: number; consumedLiters: number; fuelCost: number } {
  if (
    !Number.isFinite(dist) ||
    !Number.isFinite(mileage) ||
    !Number.isFinite(pricePerLiter) ||
    dist <= 0 ||
    mileage <= 0 ||
    pricePerLiter <= 0
  ) {
    return { totalDist: 0, consumedLiters: 0, fuelCost: 0 };
  }

  const totalDist = isReturn ? dist * 2 : dist;
  const consumedLiters = Number((totalDist / mileage).toFixed(2));
  const fuelCost = Math.round(consumedLiters * pricePerLiter);

  return {
    totalDist,
    consumedLiters: Number.isFinite(consumedLiters) ? consumedLiters : 0,
    fuelCost: Number.isFinite(fuelCost) ? fuelCost : 0
  };
}

/**
 * Round Trip Calculation (#21)
 * Guards all inputs against NaN / Infinity before doubling distance and tolls.
 */
export function calculateRoundTrip(
  oneWayDist: number,
  mileage: number,
  pricePerLiter: number,
  oneWayToll: number,
  loading: number = 0,
  driverKharcha: number = 0,
  other: number = 0
): {
  roundTripDist: number;
  consumedLiters: number;
  fuelCost: number;
  totalToll: number;
  totalExpense: number;
} {
  const safeDist = safeFiniteNonNeg(oneWayDist);
  const safeMileage = safeFiniteNonNeg(mileage);
  const safePrice = safeFiniteNonNeg(pricePerLiter);
  const safeToll = safeFiniteNonNeg(oneWayToll);
  const safeLoading = safeFiniteNonNeg(loading);
  const safeDriver = safeFiniteNonNeg(driverKharcha);
  const safeOther = safeFiniteNonNeg(other);

  const roundTripDist = safeDist * 2;
  const consumedLiters = safeMileage > 0 ? Number((roundTripDist / safeMileage).toFixed(2)) : 0;
  const fuelCost = Math.round(consumedLiters * safePrice);
  const totalToll = safeToll * 2;
  const totalExpense = Math.round(
    sumRupees(fuelCost, totalToll, safeLoading, safeDriver, safeOther)
  );

  return {
    roundTripDist,
    consumedLiters,
    fuelCost,
    totalToll,
    totalExpense
  };
}

/**
 * Advance / Total Freight Validation
 * Uses integer paisa math and checks advance <= total.
 */
export function validateBiltyFreight(
  totalFreight: number,
  advancePaid: number
): {
  isValid: boolean;
  total: number;
  advance: number;
  payable: number;
  error?: string;
} {
  const totalVal = validateFinancialNumber(totalFreight, 'Total Freight', { allowZero: true });
  const advanceVal = validateFinancialNumber(advancePaid, 'Advance Paid', { allowZero: true });

  if (!totalVal.isValid) return { isValid: false, total: 0, advance: 0, payable: 0, error: totalVal.error };
  if (!advanceVal.isValid) {
    return { isValid: false, total: totalVal.value, advance: 0, payable: totalVal.value, error: advanceVal.error };
  }

  const totalPaisa = toPaisa(totalVal.value);
  const advancePaisa = toPaisa(advanceVal.value);

  if (advancePaisa > totalPaisa) {
    return {
      isValid: false,
      total: totalVal.value,
      advance: advanceVal.value,
      payable: 0,
      error: 'Advance payment cannot exceed total freight amount (پیشگی رقم کل کرائے سے زیادہ نہیں ہو سکتی)'
    };
  }

  const payable = fromPaisa(totalPaisa - advancePaisa);
  return {
    isValid: true,
    total: totalVal.value,
    advance: advanceVal.value,
    payable
  };
}

/**
 * Extended Freight Financials Validation (#20, #22)
 * - Base freight must be greater than zero.
 * - Commission cannot exceed subtotal freight (base + labor + detention + cartage).
 * - Uses integer paisa math for zero rounding drift.
 */
export function validateBiltyFinancials(params: {
  baseFreight: number;
  advance: number;
  laborCharges?: number;
  detentionCharges?: number;
  cartageCharges?: number;
  commission?: number;
}): {
  isValid: boolean;
  totalFreight: number;
  advance: number;
  payable: number;
  breakdown: {
    base: number;
    labor: number;
    detention: number;
    cartage: number;
    commission: number;
  };
  error?: string;
} {
  const emptyBreakdown = { base: 0, labor: 0, detention: 0, cartage: 0, commission: 0 };
  const base = validateFinancialNumber(params.baseFreight, 'Base Freight', { allowZero: false });
  if (!base.isValid) {
    return { isValid: false, totalFreight: 0, advance: 0, payable: 0, breakdown: emptyBreakdown, error: base.error };
  }

  const adv = validateFinancialNumber(params.advance, 'Advance');
  const labor = validateFinancialNumber(params.laborCharges ?? 0, 'Labor Charges');
  const detention = validateFinancialNumber(params.detentionCharges ?? 0, 'Detention');
  const cartage = validateFinancialNumber(params.cartageCharges ?? 0, 'Cartage');
  const commission = validateFinancialNumber(params.commission ?? 0, 'Commission');

  const breakdown = {
    base: base.value,
    labor: labor.value,
    detention: detention.value,
    cartage: cartage.value,
    commission: commission.value
  };

  for (const field of [adv, labor, detention, cartage, commission]) {
    if (!field.isValid) {
      return {
        isValid: false,
        totalFreight: base.value,
        advance: 0,
        payable: base.value,
        breakdown,
        error: field.error
      };
    }
  }

  const subTotalPaisa =
    toPaisa(base.value) + toPaisa(labor.value) + toPaisa(detention.value) + toPaisa(cartage.value);
  const commissionPaisa = toPaisa(commission.value);

  if (commissionPaisa > subTotalPaisa) {
    return {
      isValid: false,
      totalFreight: fromPaisa(subTotalPaisa),
      advance: adv.value,
      payable: 0,
      breakdown,
      error: 'Commission cannot exceed subtotal freight (کمیشن کل کرائے سے زیادہ نہیں ہو سکتا)'
    };
  }

  const totalPaisa = subTotalPaisa - commissionPaisa;
  const totalFreight = fromPaisa(totalPaisa);
  const advPaisa = toPaisa(adv.value);

  if (advPaisa > totalPaisa) {
    return {
      isValid: false,
      totalFreight,
      advance: adv.value,
      payable: 0,
      breakdown,
      error: 'Advance payment cannot exceed computed total freight'
    };
  }

  const payable = fromPaisa(totalPaisa - advPaisa);
  return {
    isValid: true,
    totalFreight,
    advance: adv.value,
    payable,
    breakdown
  };
}

/**
 * Trip Expense Financials Reconciliation Validator
 */
export function validateTripFinancials(trip: {
  dist: number;
  fuelCost: number;
  toll: number;
  loading: number;
  driver: number;
  other: number;
  total?: number;
}): { isValid: boolean; computedTotal: number; matchesExpected: boolean; error?: string } {
  const d = validateFinancialNumber(trip.dist, 'Distance');
  const fc = validateFinancialNumber(trip.fuelCost, 'Fuel Cost');
  const tl = validateFinancialNumber(trip.toll, 'Tolls');
  const ld = validateFinancialNumber(trip.loading, 'Loading');
  const dr = validateFinancialNumber(trip.driver, 'Driver Kharcha');
  const ot = validateFinancialNumber(trip.other, 'Other Expense');

  if (!d.isValid || !fc.isValid || !tl.isValid || !ld.isValid || !dr.isValid || !ot.isValid) {
    return {
      isValid: false,
      computedTotal: 0,
      matchesExpected: false,
      error: 'Invalid financial number in trip expense breakdown'
    };
  }

  const computedTotal = Math.round(sumRupees(fc.value, tl.value, ld.value, dr.value, ot.value));
  const matchesExpected = trip.total !== undefined ? Math.abs(trip.total - computedTotal) <= 1 : true;

  return {
    isValid: true,
    computedTotal,
    matchesExpected
  };
}

/**
 * Vehicle Account Ledger Calculations & Financial Validator
 */
export function validateVehicleAccountFinancials(
  incomes: Array<{ amount: number }>,
  expenses: {
    diesel: number;
    toll: number;
    challan: number;
    rotiKharcha: number;
    chowkidara: number;
    gariKaam: number;
    driverCommission: number;
    customTotal?: number;
  }
): {
  isValid: boolean;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  error?: string;
} {
  let totalIncomePaisa = 0;
  for (const inc of incomes) {
    const v = validateFinancialNumber(inc.amount, 'Income Entry');
    if (!v.isValid) return { isValid: false, totalIncome: 0, totalExpense: 0, netProfit: 0, error: v.error };
    totalIncomePaisa += toPaisa(v.value);
  }

  const dieselV = validateFinancialNumber(expenses.diesel, 'Diesel');
  const tollV = validateFinancialNumber(expenses.toll, 'Toll');
  const challanV = validateFinancialNumber(expenses.challan, 'Challan');
  const rotiV = validateFinancialNumber(expenses.rotiKharcha, 'Roti Kharcha');
  const chowkV = validateFinancialNumber(expenses.chowkidara, 'Chowkidara');
  const kaamV = validateFinancialNumber(expenses.gariKaam, 'Gari Kaam');
  const commV = validateFinancialNumber(expenses.driverCommission, 'Driver Commission');
  const customV = validateFinancialNumber(expenses.customTotal ?? 0, 'Custom Expenses');

  if (
    !dieselV.isValid ||
    !tollV.isValid ||
    !challanV.isValid ||
    !rotiV.isValid ||
    !chowkV.isValid ||
    !kaamV.isValid ||
    !commV.isValid ||
    !customV.isValid
  ) {
    return {
      isValid: false,
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      error: 'Invalid financial amount in vehicle account expenses'
    };
  }

  const totalExpensePaisa =
    toPaisa(dieselV.value) +
    toPaisa(tollV.value) +
    toPaisa(challanV.value) +
    toPaisa(rotiV.value) +
    toPaisa(chowkV.value) +
    toPaisa(kaamV.value) +
    toPaisa(commV.value) +
    toPaisa(customV.value);

  const netProfitPaisa = totalIncomePaisa - totalExpensePaisa;

  return {
    isValid: true,
    totalIncome: fromPaisa(totalIncomePaisa),
    totalExpense: fromPaisa(totalExpensePaisa),
    netProfit: fromPaisa(netProfitPaisa)
  };
}

/**
 * Currency Formatter
 */
export function formatSafeCurrencyPKR(amount: number): string {
  if (!Number.isFinite(amount) || Number.isNaN(amount)) return 'PKR 0';
  return 'PKR ' + Math.round(amount).toLocaleString('en-PK');
}

export function formatPKR(amount: number): string {
  if (!Number.isFinite(amount) || Number.isNaN(amount)) return 'Rs 0';
  return 'Rs ' + Math.round(amount).toLocaleString('en-US');
}

/**
 * Bilty Number Uniqueness & Format Validation
 */
export function isBiltyNumberUnique(
  biltyNo: string,
  existingBilties: Array<{ biltyNo?: string }>
): boolean {
  if (!biltyNo || typeof biltyNo !== 'string') return false;
  const trimmed = biltyNo.trim().toUpperCase();
  if (!trimmed) return false;

  return !existingBilties.some(b => (b.biltyNo || '').trim().toUpperCase() === trimmed);
}

/**
 * Role & Access Permissions Check (#28)
 */
export function checkUserPermissions(params: {
  role?: UserRole | string;
  email?: string | null;
  uid?: string | null;
  allowedUIDs?: string[];
  allowedEmails?: string[];
}): {
  isOwner: boolean;
  canAccessBilty: boolean;
  canEditCompanyProfile: boolean;
  canManageFleet: boolean;
  canManageAccess: boolean;
} {
  const isOwner = isOwnerEmail(params.email) || params.role === 'owner';
  const canAccessBilty =
    isOwner ||
    verifyOwnerOrStaffClaim(
      { uid: params.uid, email: params.email, role: params.role },
      params.allowedUIDs || [],
      params.allowedEmails || []
    );

  return {
    isOwner,
    canAccessBilty,
    canEditCompanyProfile: isOwner,
    canManageFleet: true,
    canManageAccess: isOwner
  };
}

/**
 * Offline Queue Processing & Retry Evaluator
 */
export async function executeQueueProcessing(
  queue: OfflineAction[],
  isOnline: boolean,
  syncHandler: (action: OfflineAction) => Promise<boolean>
): Promise<{
  processedActions: OfflineAction[];
  remainingQueue: OfflineAction[];
  successCount: number;
  failureCount: number;
}> {
  if (!isOnline || queue.length === 0) {
    return {
      processedActions: [],
      remainingQueue: queue,
      successCount: 0,
      failureCount: 0
    };
  }

  const processedActions: OfflineAction[] = [];
  const remainingQueue: OfflineAction[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const action of queue) {
    try {
      const success = await syncHandler(action);
      if (success) {
        processedActions.push(action);
        successCount++;
      } else {
        const retries = (action.retryCount || 0) + 1;
        failureCount++;
        if (retries <= 5) {
          remainingQueue.push({ ...action, retryCount: retries });
        }
      }
    } catch {
      const retries = (action.retryCount || 0) + 1;
      failureCount++;
      if (retries <= 5) {
        remainingQueue.push({ ...action, retryCount: retries });
      }
    }
  }

  return {
    processedActions,
    remainingQueue,
    successCount,
    failureCount
  };
}

/**
 * Firestore Data Isolation Verifier
 */
export function verifyFirestoreDataIsolation(
  authenticatedUid: string,
  targetDocumentPath: string
): { isAllowed: boolean; reason: string } {
  if (!authenticatedUid) {
    return { isAllowed: false, reason: 'Unauthenticated user cannot access private collections' };
  }

  const userNestedPrefix = `users/${authenticatedUid}/`;
  const userRootPrefix = `users/${authenticatedUid}`;
  const userDataPrefix = `usersData/${authenticatedUid}`;

  if (
    targetDocumentPath.startsWith(userNestedPrefix) ||
    targetDocumentPath === userRootPrefix ||
    targetDocumentPath === userDataPrefix ||
    targetDocumentPath.startsWith(`${userDataPrefix}/`)
  ) {
    return { isAllowed: true, reason: 'Path matches authenticated user isolated boundary' };
  }

  if (targetDocumentPath.startsWith('users/') && !targetDocumentPath.startsWith(`users/${authenticatedUid}`)) {
    return { isAllowed: false, reason: 'Security violation: Attempted cross-tenant data access' };
  }

  if (targetDocumentPath.startsWith('usersData/') && !targetDocumentPath.startsWith(`usersData/${authenticatedUid}`)) {
    return { isAllowed: false, reason: 'Security violation: Attempted cross-tenant data access' };
  }

  return { isAllowed: true, reason: 'Public or shared collection path' };
}

// ---------------------------------------------------------------------------
// Export Privacy Controls & Data Masking Helpers
// ---------------------------------------------------------------------------

export function maskCNIC(cnic?: string): string {
  if (!cnic || typeof cnic !== 'string') return '';
  const trimmed = cnic.trim();
  if (trimmed.length < 9) return '*****';
  const start = trimmed.slice(0, 5);
  const end = trimmed.slice(-3);
  return `${start}-******${end}`;
}

export function maskPhoneNumber(phone?: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const clean = phone.trim();
  if (clean.length < 7) return '03**-*******';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}-***${suffix}`;
}

export function anonymizePersonName(name?: string): string {
  if (!name || typeof name !== 'string') return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const p = parts[0];
    return p.length > 2 ? `${p[0]}***` : `${p[0]}*`;
  }
  return parts.map((p, idx) => (idx === 0 ? `${p[0]}.` : `${p[0]}***`)).join(' ');
}

export interface PrivacyExportOptions {
  maskCnic?: boolean;
  maskPhone?: boolean;
  includeFinancials?: boolean;
  anonymizeNames?: boolean;
}

export type SanitizedBiltyRecord = Omit<Partial<BiltyRecord>, 'total' | 'advance' | 'payable'> & {
  total?: number | string;
  advance?: number | string;
  payable?: number | string;
};

export function sanitizeBiltyRecord(
  bilty: Partial<BiltyRecord>,
  options: PrivacyExportOptions = {}
): SanitizedBiltyRecord {
  const {
    maskCnic = true,
    maskPhone = false,
    includeFinancials = true,
    anonymizeNames = false
  } = options;

  return {
    ...bilty,
    senderName: anonymizeNames ? anonymizePersonName(bilty.senderName) : bilty.senderName,
    receiverName: anonymizeNames ? anonymizePersonName(bilty.receiverName) : bilty.receiverName,
    driverName: anonymizeNames ? anonymizePersonName(bilty.driverName) : bilty.driverName,
    consignor: anonymizeNames ? anonymizePersonName(bilty.consignor) : bilty.consignor,
    consignee: anonymizeNames ? anonymizePersonName(bilty.consignee) : bilty.consignee,
    senderCnic: maskCnic ? maskCNIC(bilty.senderCnic) : bilty.senderCnic,
    senderMobile: maskPhone ? maskPhoneNumber(bilty.senderMobile) : bilty.senderMobile,
    receiverMobile: maskPhone ? maskPhoneNumber(bilty.receiverMobile) : bilty.receiverMobile,
    mobileNo: maskPhone ? maskPhoneNumber(bilty.mobileNo) : bilty.mobileNo,
    total: includeFinancials ? bilty.total : '[HIDDEN]',
    advance: includeFinancials ? bilty.advance : '[HIDDEN]',
    payable: includeFinancials ? bilty.payable : '[HIDDEN]'
  };
}

export function sanitizeDriverRecord(
  driver: Partial<Driver>,
  options: PrivacyExportOptions = {}
): Partial<Driver> {
  const { maskCnic = true, maskPhone = false, anonymizeNames = false } = options;
  return {
    ...driver,
    name: anonymizeNames ? anonymizePersonName(driver.name) : driver.name,
    phone: maskPhone ? maskPhoneNumber(driver.phone) : driver.phone,
    cnic: maskCnic ? maskCNIC(driver.cnic) : driver.cnic,
    license: maskCnic ? 'LIC-*****' : driver.license
  };
}

export type SanitizedTripRecord = Omit<
  Partial<Trip>,
  'fuelCost' | 'toll' | 'loading' | 'driver' | 'other' | 'total' | 'totalIncome' | 'netProfit'
> & {
  fuelCost?: number | string;
  toll?: number | string;
  loading?: number | string;
  driver?: number | string;
  other?: number | string;
  total?: number | string;
  totalIncome?: number | string;
  netProfit?: number | string;
};

export function sanitizeTripRecord(
  trip: Partial<Trip>,
  options: PrivacyExportOptions = {}
): SanitizedTripRecord {
  const { includeFinancials = true } = options;
  return {
    ...trip,
    fuelCost: includeFinancials ? trip.fuelCost : '[HIDDEN]',
    toll: includeFinancials ? trip.toll : '[HIDDEN]',
    loading: includeFinancials ? trip.loading : '[HIDDEN]',
    driver: includeFinancials ? trip.driver : '[HIDDEN]',
    other: includeFinancials ? trip.other : '[HIDDEN]',
    total: includeFinancials ? trip.total : '[HIDDEN]',
    totalIncome: includeFinancials ? trip.totalIncome : '[HIDDEN]',
    netProfit: includeFinancials ? trip.netProfit : '[HIDDEN]'
  };
}
