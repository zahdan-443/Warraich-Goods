import { BiltyRecord, OfflineAction, UserRole } from '../types';

export const OWNER_EMAIL = 'warraichgoods43@gmail.com';

/**
 * Storage Scope Helper
 * Computes isolated scope identifier for localStorage keys (UID or 'guest').
 */
export function getStorageScope(currentUser?: { uid?: string | null; email?: string | null } | null, localFallbackUser?: string | null): string {
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

/**
 * Financial Number Validator
 * Ensures numeric value is valid, non-negative, finite, and rounded to proper decimal places.
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

  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));

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
    value: Number(num.toFixed(2))
  };
}

/**
 * Fuel Cost Calculation
 * Computes consumed liters and total fuel cost based on distance, mileage, price per liter, and round-trip status.
 */
export function calculateFuelCost(
  dist: number,
  mileage: number,
  pricePerLiter: number,
  isReturn: boolean = false
): { totalDist: number; consumedLiters: number; fuelCost: number } {
  if (dist <= 0 || mileage <= 0 || pricePerLiter <= 0) {
    return { totalDist: 0, consumedLiters: 0, fuelCost: 0 };
  }

  const totalDist = isReturn ? dist * 2 : dist;
  const consumedLiters = Number((totalDist / mileage).toFixed(2));
  const fuelCost = Math.round(consumedLiters * pricePerLiter);

  return { totalDist, consumedLiters, fuelCost };
}

/**
 * Round Trip Calculation
 * Doubles distance, doubles toll charges (if applicable), and computes complete round-trip expenses.
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
  const roundTripDist = Math.max(0, oneWayDist) * 2;
  const consumedLiters = mileage > 0 ? Number((roundTripDist / mileage).toFixed(2)) : 0;
  const fuelCost = Math.round(consumedLiters * Math.max(0, pricePerLiter));
  const totalToll = Math.max(0, oneWayToll) * 2;
  const totalExpense = fuelCost + totalToll + Math.max(0, loading) + Math.max(0, driverKharcha) + Math.max(0, other);

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
 * Enforces that advance payment cannot be negative and cannot exceed total freight.
 * Computes the remaining payable balance.
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
  if (!advanceVal.isValid) return { isValid: false, total: totalVal.value, advance: 0, payable: totalVal.value, error: advanceVal.error };

  const total = totalVal.value;
  const advance = advanceVal.value;

  if (advance > total) {
    return {
      isValid: false,
      total,
      advance,
      payable: 0,
      error: 'Advance payment cannot exceed total freight amount (پیشگی رقم کل کرائے سے زیادہ نہیں ہو سکتی)'
    };
  }

  const payable = Number((total - advance).toFixed(2));
  return {
    isValid: true,
    total,
    advance,
    payable
  };
}

/**
 * Extended Bilty Financials Validation with Surcharges & Commissions
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
  const base = validateFinancialNumber(params.baseFreight, 'Base Freight');
  const adv = validateFinancialNumber(params.advance, 'Advance');
  const labor = validateFinancialNumber(params.laborCharges || 0, 'Labor Charges');
  const detention = validateFinancialNumber(params.detentionCharges || 0, 'Detention');
  const cartage = validateFinancialNumber(params.cartageCharges || 0, 'Cartage');
  const commission = validateFinancialNumber(params.commission || 0, 'Commission');

  if (!base.isValid) return { isValid: false, totalFreight: 0, advance: 0, payable: 0, breakdown: { base: 0, labor: 0, detention: 0, cartage: 0, commission: 0 }, error: base.error };
  if (!adv.isValid) return { isValid: false, totalFreight: base.value, advance: 0, payable: base.value, breakdown: { base: base.value, labor: 0, detention: 0, cartage: 0, commission: 0 }, error: adv.error };

  const subTotal = base.value + labor.value + detention.value + cartage.value;
  const totalFreight = Math.max(0, subTotal - commission.value);

  if (adv.value > totalFreight) {
    return {
      isValid: false,
      totalFreight,
      advance: adv.value,
      payable: 0,
      breakdown: {
        base: base.value,
        labor: labor.value,
        detention: detention.value,
        cartage: cartage.value,
        commission: commission.value
      },
      error: 'Advance payment cannot exceed computed total freight'
    };
  }

  const payable = Number((totalFreight - adv.value).toFixed(2));
  return {
    isValid: true,
    totalFreight,
    advance: adv.value,
    payable,
    breakdown: {
      base: base.value,
      labor: labor.value,
      detention: detention.value,
      cartage: cartage.value,
      commission: commission.value
    }
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

  const computedTotal = Math.round(fc.value + tl.value + ld.value + dr.value + ot.value);
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
  let totalIncome = 0;
  for (const inc of incomes) {
    const v = validateFinancialNumber(inc.amount, 'Income Entry');
    if (!v.isValid) return { isValid: false, totalIncome: 0, totalExpense: 0, netProfit: 0, error: v.error };
    totalIncome += v.value;
  }

  const dieselV = validateFinancialNumber(expenses.diesel, 'Diesel');
  const tollV = validateFinancialNumber(expenses.toll, 'Toll');
  const challanV = validateFinancialNumber(expenses.challan, 'Challan');
  const rotiV = validateFinancialNumber(expenses.rotiKharcha, 'Roti Kharcha');
  const chowkV = validateFinancialNumber(expenses.chowkidara, 'Chowkidara');
  const kaamV = validateFinancialNumber(expenses.gariKaam, 'Gari Kaam');
  const commV = validateFinancialNumber(expenses.driverCommission, 'Driver Commission');
  const customV = validateFinancialNumber(expenses.customTotal || 0, 'Custom Expenses');

  if (!dieselV.isValid || !tollV.isValid || !challanV.isValid || !rotiV.isValid || !chowkV.isValid || !kaamV.isValid || !commV.isValid || !customV.isValid) {
    return {
      isValid: false,
      totalIncome: 0,
      totalExpense: 0,
      netProfit: 0,
      error: 'Invalid financial amount in vehicle account expenses'
    };
  }

  const totalExpense = dieselV.value + tollV.value + challanV.value + rotiV.value + chowkV.value + kaamV.value + commV.value + customV.value;
  const netProfit = totalIncome - totalExpense;

  return {
    isValid: true,
    totalIncome: Number(totalIncome.toFixed(2)),
    totalExpense: Number(totalExpense.toFixed(2)),
    netProfit: Number(netProfit.toFixed(2))
  };
}

/**
 * Currency Formatter
 */
export function formatSafeCurrencyPKR(amount: number): string {
  if (!Number.isFinite(amount) || isNaN(amount)) return 'PKR 0';
  return 'PKR ' + Math.round(amount).toLocaleString('en-PK');
}

export function formatPKR(amount: number): string {
  if (!Number.isFinite(amount) || isNaN(amount)) return 'Rs 0';
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
 * Role & Access Permissions Check
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
  const email = (params.email || '').toLowerCase().trim();
  const isOwner = email === OWNER_EMAIL.toLowerCase() || params.role === 'owner';

  const allowedUIDs = params.allowedUIDs || [];
  const allowedEmails = (params.allowedEmails || []).map(e => e.toLowerCase().trim());

  const isUidAllowed = params.uid ? allowedUIDs.includes(params.uid) : false;
  const isEmailAllowed = email ? allowedEmails.includes(email) : false;

  const canAccessBilty = isOwner || isUidAllowed || isEmailAllowed;
  const canEditCompanyProfile = isOwner;
  const canManageAccess = isOwner;
  const canManageFleet = true;

  return {
    isOwner,
    canAccessBilty,
    canEditCompanyProfile,
    canManageFleet,
    canManageAccess
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

  const userNestedPrefix = `users/${authenticatedUid}/collections/`;
  const userRootPrefix = `users/${authenticatedUid}`;
  const userDataPrefix = `usersData/${authenticatedUid}`;

  if (
    targetDocumentPath.startsWith(userNestedPrefix) ||
    targetDocumentPath === userRootPrefix ||
    targetDocumentPath === userDataPrefix
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

/**
 * Mask CNIC for privacy (e.g. 35201-1234567-1 -> 35201-*****67-1)
 */
export function maskCNIC(cnic?: string): string {
  if (!cnic || typeof cnic !== 'string') return '';
  const trimmed = cnic.trim();
  if (trimmed.length < 9) return '*****';
  // Keep first 5 and last 3 characters
  const start = trimmed.slice(0, 5);
  const end = trimmed.slice(-3);
  return `${start}-******${end}`;
}

/**
 * Mask Phone Number for privacy (e.g. 03001234567 -> 0300-***4567)
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone || typeof phone !== 'string') return '';
  const clean = phone.trim();
  if (clean.length < 7) return '03**-*******';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}-***${suffix}`;
}

/**
 * Anonymize Person Name for public reports (e.g. Muhammad Ali -> M. A***)
 */
export function anonymizePersonName(name?: string): string {
  if (!name || typeof name !== 'string') return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const p = parts[0];
    return p.length > 2 ? `${p[0]}***` : `${p[0]}*`;
  }
  return parts.map((p, idx) => (idx === 0 ? `${p[0]}.` : `${p[0]}***`)).join(' ');
}

/**
 * Sanitize Bilty record based on selected privacy options
 */
export function sanitizeBiltyRecord(bilty: any, options: {
  maskCnic?: boolean;
  maskPhone?: boolean;
  includeFinancials?: boolean;
  anonymizeNames?: boolean;
} = {}): any {
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

/**
 * Sanitize Driver record based on selected privacy options
 */
export function sanitizeDriverRecord(driver: any, options: {
  maskCnic?: boolean;
  maskPhone?: boolean;
  anonymizeNames?: boolean;
} = {}): any {
  const { maskCnic = true, maskPhone = false, anonymizeNames = false } = options;
  return {
    ...driver,
    name: anonymizeNames ? anonymizePersonName(driver.name) : driver.name,
    phone: maskPhone ? maskPhoneNumber(driver.phone) : driver.phone,
    cnic: maskCnic ? maskCNIC(driver.cnic) : driver.cnic,
    license: maskCnic ? 'LIC-*****' : driver.license
  };
}

/**
 * Sanitize Trip record based on selected privacy options
 */
export function sanitizeTripRecord(trip: any, options: {
  includeFinancials?: boolean;
} = {}): any {
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
