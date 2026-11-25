/**
 * Isolated Adda / Branch Pending Freight, Pending Commission & Party Billing Storage
 *
 * STRICT DATA SOURCE-OF-TRUTH BOUNDARY INVARIANT:
 * - Adda & Party Billing (`wg_v3_adda_<branchId>_*`) lives strictly under `branches/{branchId}/`
 *   in Firestore (`adda_items`, `adda_bills`, `adda_parties` + transitional legacy read fallback
 *   from `addaPendingFreight`, `addaPendingCommissions`, `addaBills`).
 * - Personal Fleet & Khata (`dd_khata_*` in `ledgerStorage.ts`) lives strictly under `users/{uid}/`.
 * - These two engines NEVER read from or write to each other's stores.
 */

import * as firestoreModule from 'firebase/firestore';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import type {
  AddaBillItemSnapshot,
  AddaBillRecord,
  AddaPartyRecord,
  AddaPaymentEntry,
  AddaPendingCommission,
  AddaPendingFreight,
  AddaPendingStatus,
  BiltyRecord,
  BranchConfig,
  CompanyProfile
} from '../types';
import { DEFAULT_HEAD_OFFICE_BRANCH_ID } from './authUtils';
import { toWesternDigits } from './biltyHelpers';
import {
  DEFAULT_SAMUNDRI_BRANCH,
  clearLocalBranchAndAddaCaches,
  getCachedBranchById,
  setActiveBranchId
} from './branchContext';
import { fromPaisa, toPaisa } from './calculator';
import { auth, db } from './firebase';
import { getCachedCompanyProfile } from './storage';
import { safeStorage } from './storageCore';
import {
  OfflineBlockExhaustedError,
  allocateBranchBlockNumber,
  clampMutationIso,
  getLocalNumberBlock,
  isBranchSyncKilledRemotely,
  saveLocalNumberBlock
} from './storageSync';

export const ADDA_UPDATED_EVENT = 'driverdost:adda_updated';

export class AddaLifecycleError extends Error {
  readonly code:
    | 'INVALID_AMOUNT'
    | 'ALREADY_BILLED'
    | 'BILL_HAS_PAYMENTS'
    | 'BILTY_LOCKED_BY_BILL'
    | 'DOUBLE_SUBMIT'
    | 'NOT_FOUND';
  readonly messageEn: string;
  readonly messageUr: string;
  readonly billNumber?: string;

  constructor(
    code: AddaLifecycleError['code'],
    messageEn: string,
    messageUr: string,
    billNumber?: string
  ) {
    super(messageEn);
    this.name = 'AddaLifecycleError';
    this.code = code;
    this.messageEn = messageEn;
    this.messageUr = messageUr;
    this.billNumber = billNumber;
  }
}

function emitAddaUpdated(branchId: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADDA_UPDATED_EVENT, { detail: { branchId } }));
  }
}

export function resolveEffectiveAddaBranchId(activeBranch?: BranchConfig | null): string {
  const id = activeBranch?.id || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  return id === 'samundri' ? DEFAULT_HEAD_OFFICE_BRANCH_ID : id;
}

function normalizeAddaBranchId(branchId?: string): string {
  const clean = String(branchId || '').trim();
  if (!clean || clean === 'samundri') return DEFAULT_HEAD_OFFICE_BRANCH_ID;
  return clean;
}

function freightKey(branchId: string): string {
  return `wg_v3_adda_${branchId}_freight_pending`;
}

function commissionKey(branchId: string): string {
  return `wg_v3_adda_${branchId}_commission_pending`;
}

function billsKey(branchId: string): string {
  return `wg_v3_adda_${branchId}_bills`;
}

function partiesKey(branchId: string): string {
  return `wg_v3_adda_${branchId}_parties`;
}

function billSeqKey(branchId: string): string {
  return `wg_v3_adda_${branchId}_bill_seq`;
}

function tombstonesKey(branchId: string): string {
  return `wg_v3_adda_${branchId}_tombstones`;
}

interface AddaTombstones {
  freight: Record<string, string>;
  commission: Record<string, string>;
  bills: Record<string, string>;
  parties: Record<string, string>;
}

function readJsonArray<T>(key: string): T[] {
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T>(key: string, data: T[]): void {
  try {
    safeStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore storage quota errors
  }
}

function readTombstones(branchId: string): AddaTombstones {
  try {
    const raw = safeStorage.getItem(tombstonesKey(branchId));
    if (!raw) return { freight: {}, commission: {}, bills: {}, parties: {} };
    const parsed = JSON.parse(raw);
    return {
      freight: parsed?.freight && typeof parsed.freight === 'object' ? parsed.freight : {},
      commission: parsed?.commission && typeof parsed.commission === 'object' ? parsed.commission : {},
      bills: parsed?.bills && typeof parsed.bills === 'object' ? parsed.bills : {},
      parties: parsed?.parties && typeof parsed.parties === 'object' ? parsed.parties : {}
    };
  } catch {
    return { freight: {}, commission: {}, bills: {}, parties: {} };
  }
}

function writeTombstones(branchId: string, t: AddaTombstones): void {
  try {
    safeStorage.setItem(tombstonesKey(branchId), JSON.stringify(t));
  } catch {
    // ignore
  }
}

const ADDA_CURSOR_OVERLAP_MS = 120_000;
const ADDA_CURSOR_MAX_AGE_MS = 80 * 24 * 60 * 60 * 1000;
const ADDA_WEEKLY_DRIFT_MS = 7 * 24 * 60 * 60 * 1000;

function addaCursorKey(branchId: string): string {
  return `wg_v3_sync_cursor_branch_${branchId}_adda`;
}

function addaDriftKey(branchId: string): string {
  return `wg_v3_last_full_drift_branch_${branchId}_adda`;
}

function safeGetAddaFirestoreExport<T>(name: string): T | undefined {
  try {
    return (firestoreModule as unknown as Record<string, T | undefined>)[name];
  } catch {
    return undefined;
  }
}

function safeServerTimestamp(): unknown {
  const fn = safeGetAddaFirestoreExport<() => unknown>('serverTimestamp');
  return typeof fn === 'function' ? fn() : new Date().toISOString();
}

function isAddaPermissionDeniedError(err: unknown): boolean {
  const code =
    typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
  const msg = err instanceof Error ? err.message : String(err || '');
  return (
    code === 'permission-denied' ||
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('permission-denied')
  );
}

function stripCloudMetadata<T extends Record<string, unknown>>(docData: T): T {
  const clean = { ...docData };
  delete clean.serverUpdatedAt;
  delete clean._deleted;
  delete clean.deletedAt;
  delete clean._deletedAt;
  return clean;
}

function buildAddaIncrementalQuery(collRef: ReturnType<typeof collection>, sinceMs: number) {
  const qFn = safeGetAddaFirestoreExport<typeof firestoreModule.query>('query');
  const wFn = safeGetAddaFirestoreExport<typeof firestoreModule.where>('where');
  const Ts = safeGetAddaFirestoreExport<typeof firestoreModule.Timestamp>('Timestamp');
  if (typeof qFn === 'function' && typeof wFn === 'function' && Ts && typeof Ts.fromMillis === 'function') {
    return qFn(collRef, wFn('serverUpdatedAt', '>', Ts.fromMillis(sinceMs)));
  }
  return collRef;
}

type CanonicalAddaCollection = 'adda_items' | 'adda_bills' | 'adda_parties';

async function commitAddaSetBatch(
  entries: Array<{ coll: CanonicalAddaCollection; id: string; data: Record<string, unknown> }>,
  branchId: string
): Promise<void> {
  if (!db || entries.length === 0) return;
  const serverTs = safeServerTimestamp();
  const wbFn = safeGetAddaFirestoreExport<typeof firestoreModule.writeBatch>('writeBatch');
  if (typeof wbFn === 'function') {
    const batch = wbFn(db);
    for (const entry of entries) {
      batch.set(
        doc(db, 'branches', branchId, entry.coll, entry.id),
        { ...entry.data, serverUpdatedAt: serverTs },
        { merge: true }
      );
    }
    await batch.commit();
    return;
  }
  await Promise.all(
    entries.map(entry =>
      setDoc(
        doc(db, 'branches', branchId, entry.coll, entry.id),
        { ...entry.data, serverUpdatedAt: serverTs },
        { merge: true }
      )
    )
  );
}

function recordTombstone(
  branchId: string,
  bucket: keyof AddaTombstones,
  id: string
): void {
  const current = readTombstones(branchId);
  current[bucket][id] = clampMutationIso(new Date().toISOString());
  writeTombstones(branchId, current);
}

export function clearAddaTombstonesForIds(
  branchId: string,
  bucket: keyof AddaTombstones,
  ids: string[]
): void {
  if (!ids.length) return;
  const current = readTombstones(branchId);
  let changed = false;
  for (const id of ids) {
    if (current[bucket][id]) {
      delete current[bucket][id];
      changed = true;
    }
  }
  if (changed) {
    writeTombstones(branchId, current);
  }
}

function mergeByUpdatedAtLww<T extends { id: string; updatedAt?: string }>(
  localList: T[],
  remoteList: T[],
  tombstones: Record<string, string>
): T[] {
  const map = new Map<string, T>();
  for (const item of localList) {
    if (!item?.id) continue;
    const deletedAt = tombstones[item.id];
    if (deletedAt && deletedAt >= (item.updatedAt || '')) continue;
    map.set(item.id, item);
  }
  for (const item of remoteList) {
    if (!item?.id) continue;
    const deletedAt = tombstones[item.id];
    if (deletedAt && deletedAt >= (item.updatedAt || '')) continue;
    const existing = map.get(item.id);
    if (!existing || (item.updatedAt || '') >= (existing.updatedAt || '')) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
  );
}

// ---------------------------------------------------------------------------
// Integer Paisa Precision Helpers
// ---------------------------------------------------------------------------

function requirePositivePaisa(amount: unknown, labelEn: string, labelUr?: string): number {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) {
    throw new AddaLifecycleError(
      'INVALID_AMOUNT',
      `${labelEn} must be greater than zero.`,
      `${labelUr || labelEn} صفر سے زیادہ ہونا ضروری ہے۔`
    );
  }
  const paisa = toPaisa(num);
  if (!Number.isSafeInteger(paisa) || paisa <= 0) {
    throw new AddaLifecycleError(
      'INVALID_AMOUNT',
      `${labelEn} must be a valid positive amount.`,
      `${labelUr || labelEn} درست مثبت رقم ہونی چاہیے۔`
    );
  }
  return paisa;
}

function nonNegPaisa(amount: unknown): number {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return Math.max(0, toPaisa(num));
}

function getItemAmountPaisa(item: { amount?: number; amountPaisa?: number }): number {
  if (typeof item.amountPaisa === 'number' && Number.isFinite(item.amountPaisa) && item.amountPaisa >= 0) {
    return Math.round(item.amountPaisa);
  }
  return Math.max(0, toPaisa(Number(item.amount) || 0));
}

export function getBillTotalPaisa(bill: AddaBillRecord): number {
  if (typeof bill.totalAmountPaisa === 'number' && Number.isFinite(bill.totalAmountPaisa) && bill.totalAmountPaisa >= 0) {
    return Math.round(bill.totalAmountPaisa);
  }
  return Math.max(0, toPaisa(Number(bill.totalAmount) || 0));
}

export function computeBillPaymentHistoryPaisa(history?: AddaPaymentEntry[]): number {
  if (!Array.isArray(history) || history.length === 0) return 0;
  let total = 0;
  for (const entry of history) {
    if (!entry) continue;
    const p = Math.max(0, Math.round(Number(entry.amountPaisa) || 0));
    if (entry.kind === 'reversal') {
      total -= p;
    } else {
      total += p;
    }
  }
  return Math.max(0, total);
}

export function getBillPaidPaisa(bill: AddaBillRecord): number {
  if (Array.isArray(bill.paymentHistory) && bill.paymentHistory.length > 0) {
    return computeBillPaymentHistoryPaisa(bill.paymentHistory);
  }
  if (typeof bill.paidAmountPaisa === 'number' && Number.isFinite(bill.paidAmountPaisa) && bill.paidAmountPaisa >= 0) {
    return Math.round(bill.paidAmountPaisa);
  }
  if (typeof bill.paidAmount === 'number' && Number.isFinite(bill.paidAmount) && bill.paidAmount >= 0) {
    return Math.round(toPaisa(bill.paidAmount));
  }
  if (bill.status === 'paid') {
    return getBillTotalPaisa(bill);
  }
  return 0;
}

export function getBillRemainingPaisa(bill: AddaBillRecord): number {
  return Math.max(0, getBillTotalPaisa(bill) - getBillPaidPaisa(bill));
}

// ---------------------------------------------------------------------------
// Normalized Adda Party Registry (`branches/{branchId}/adda_parties`)
// ---------------------------------------------------------------------------

export function normalizePartyName(name: string): string {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function normalizePartyMobile(mobile?: string): string {
  const digits = toWesternDigits(String(mobile || '')).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0092') && digits.length >= 13) {
    return '0' + digits.slice(4, 14);
  }
  if (digits.startsWith('92') && digits.length >= 12) {
    return '0' + digits.slice(2, 12);
  }
  return digits.slice(0, 11);
}

export function computePartyMatchKey(name: string, mobile?: string): string {
  const nName = normalizePartyName(name) || 'unknown party';
  const nMob = normalizePartyMobile(mobile);
  return `${nName}::${nMob}`;
}

export function getAddaParties(branchId: string): AddaPartyRecord[] {
  const cleanBranch = normalizeAddaBranchId(branchId);
  return readJsonArray<AddaPartyRecord>(partiesKey(cleanBranch));
}

export function saveAddaPartiesList(branchId: string, list: AddaPartyRecord[]): void {
  const cleanBranch = normalizeAddaBranchId(branchId);
  writeJsonArray(partiesKey(cleanBranch), list);
  emitAddaUpdated(cleanBranch);
}

export function searchAddaParties(branchId: string, queryText: string): AddaPartyRecord[] {
  const q = normalizePartyName(queryText);
  const qMob = normalizePartyMobile(queryText);
  const list = getAddaParties(branchId);
  if (!q && !qMob) return list;
  return list.filter(
    p =>
      p.normalizedName.includes(q) ||
      (qMob && p.normalizedMobile.includes(qMob)) ||
      (p.mobile || '').includes(queryText.trim())
  );
}

export function findOrCreateAddaParty(
  branchId: string,
  input: { name: string; mobile?: string; city?: string }
): AddaPartyRecord {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const cleanName = String(input.name || '').trim() || 'Unknown Party';
  const normName = normalizePartyName(cleanName);
  const cleanMob = String(input.mobile || '').trim();
  const normMob = normalizePartyMobile(cleanMob);
  const parties = getAddaParties(cleanBranch);
  const nowIso = new Date().toISOString();

  // Exact match by name + mobile when mobile provided
  let match: AddaPartyRecord | undefined;
  if (normMob) {
    match = parties.find(p => p.normalizedName === normName && p.normalizedMobile === normMob);
    if (!match) {
      // Upgrade an existing mobile-less party record ONLY if unambiguous (at most 1 with same normalizedName & no mobile)
      const mobileLess = parties.filter(p => p.normalizedName === normName && !p.normalizedMobile);
      const hasDistinctMobileSameName = parties.some(
        p => p.normalizedName === normName && p.normalizedMobile && p.normalizedMobile !== normMob
      );
      if (mobileLess.length === 1 && !hasDistinctMobileSameName) {
        match = mobileLess[0];
      }
    }
  } else {
    // Missing mobile: match only if unambiguous single record or exact no-mobile record
    const sameName = parties.filter(p => p.normalizedName === normName);
    if (sameName.length === 1) {
      match = sameName[0];
    } else {
      match = sameName.find(p => !p.normalizedMobile);
    }
  }

  if (match) {
    const needsEnrich =
      (normMob && !match.normalizedMobile) ||
      (input.city && !match.city);
    if (needsEnrich) {
      const updated: AddaPartyRecord = {
        ...match,
        mobile: cleanMob || match.mobile,
        normalizedMobile: normMob || match.normalizedMobile,
        city: input.city?.trim() || match.city,
        updatedAt: nowIso
      };
      saveAddaPartiesList(
        cleanBranch,
        [updated, ...parties.filter(p => p.id !== updated.id)]
      );
      void pushAddaDocToFirestore(
        cleanBranch,
        'adda_parties',
        updated.id,
        updated as unknown as Record<string, unknown>
      );
      return updated;
    }
    return match;
  }

  const created: AddaPartyRecord = {
    id: `ap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    branchId: cleanBranch,
    name: cleanName,
    normalizedName: normName,
    mobile: cleanMob,
    normalizedMobile: normMob,
    ...(input.city?.trim() ? { city: input.city.trim() } : {}),
    createdAt: nowIso,
    updatedAt: nowIso
  };
  saveAddaPartiesList(cleanBranch, [created, ...parties]);
  void pushAddaDocToFirestore(
    cleanBranch,
    'adda_parties',
    created.id,
    created as unknown as Record<string, unknown>
  );
  return created;
}

// ---------------------------------------------------------------------------
// Live Company & Branch Snapshot Resolver (for Bilty & Adda Bills)
// ---------------------------------------------------------------------------

export interface ResolvedCompanyDisplay {
  nameUr: string;
  nameEn: string;
  proprietorUr: string;
  proprietorEn: string;
  addressUr: string;
  addressEn: string;
  phone: string;
  ntn: string;
  taglineUr: string;
}

export function resolveEffectiveCompanyDetails(
  branchConfig?: BranchConfig | null,
  companyProfile?: CompanyProfile | null
): ResolvedCompanyDisplay {
  const company = companyProfile || getCachedCompanyProfile();
  const branch =
    branchConfig ||
    getCachedBranchById(DEFAULT_HEAD_OFFICE_BRANCH_ID) ||
    DEFAULT_SAMUNDRI_BRANCH;

  const cleanUrCompany = (
    branch.companyHeaderUr ||
    company.nameUr ||
    'وڑائچ گڈز ٹرانسپورٹ کمپنی'
  )
    .replace(/\s*\(رجسٹرڈ\)\s*/g, '')
    .trim();

  const rawEnCompany = (
    branch.companyHeaderEn ||
    company.nameEn ||
    'WARRAICH GOODS TRANSPORT COMPANY'
  ).trim();

  const normalizedEnCompany =
    rawEnCompany.toLowerCase() === 'warraich goods transport co.'
      ? 'WARRAICH GOODS TRANSPORT COMPANY'
      : rawEnCompany.toUpperCase();

  return {
    nameUr: cleanUrCompany || 'وڑائچ گڈز ٹرانسپورٹ کمپنی',
    nameEn: normalizedEnCompany || 'WARRAICH GOODS TRANSPORT COMPANY',
    proprietorUr: (branch.proprietorNameUr || company.ownerName || 'زاہدان نصر وڑائچ').trim(),
    proprietorEn: (branch.proprietorNameEn || 'ZAHDAN NASAR WARRAICH').trim().toUpperCase(),
    addressUr: (branch.addressUr || company.headOfficeUr || DEFAULT_SAMUNDRI_BRANCH.addressUr).trim(),
    addressEn: (branch.addressEn || company.headOfficeEn || DEFAULT_SAMUNDRI_BRANCH.addressEn).trim(),
    phone: (branch.phoneNumbers || company.phoneNumbers || DEFAULT_SAMUNDRI_BRANCH.phoneNumbers).trim(),
    ntn: (branch.ntn || company.ntn || '7779394-1').trim(),
    taglineUr: (branch.taglineUr || company.taglineUr || '').trim()
  };
}

// ---------------------------------------------------------------------------
// Firestore Single-Doc Helper
// ---------------------------------------------------------------------------

async function pushAddaDocToFirestore(
  branchId: string,
  collName: CanonicalAddaCollection,
  docId: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!db || !auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  try {
    await setDoc(
      doc(db, 'branches', branchId, collName, docId),
      { ...payload, _deleted: false, deletedAt: null, serverUpdatedAt: safeServerTimestamp() },
      { merge: true }
    );
  } catch (err) {
    if (isAddaPermissionDeniedError(err)) {
      await clearLocalBranchAndAddaCaches({ preserveBranchesMetadata: true });
      setActiveBranchId(null);
      return;
    }
    console.warn(`[AddaBilling] Sync notice (${collName}/${docId}):`, err);
  }
}

async function deleteAddaDocFromFirestore(
  branchId: string,
  collName: CanonicalAddaCollection,
  docId: string
): Promise<void> {
  if (!db || !auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  try {
    const nowIso = clampMutationIso(new Date().toISOString());
    await setDoc(
      doc(db, 'branches', branchId, collName, docId),
      { id: docId, _deleted: true, deletedAt: nowIso, serverUpdatedAt: safeServerTimestamp() },
      { merge: true }
    ).catch(async () => {
      await deleteDoc(doc(db, 'branches', branchId, collName, docId));
    });
    const t = readTombstones(branchId);
    await setDoc(
      doc(db, 'branches', branchId, 'collections', 'tombstones'),
      { addaTombstones: t, serverUpdatedAt: safeServerTimestamp() },
      { merge: true }
    );
  } catch (err) {
    if (isAddaPermissionDeniedError(err)) {
      await clearLocalBranchAndAddaCaches({ preserveBranchesMetadata: true });
      setActiveBranchId(null);
      return;
    }
    console.warn(`[AddaBilling] Delete notice (${collName}/${docId}):`, err);
  }
}

// ---------------------------------------------------------------------------
// Freight Pending Operations (`branches/{branchId}/adda_items` kind: 'freight')
// ---------------------------------------------------------------------------

export function getAddaPendingFreight(branchId: string): AddaPendingFreight[] {
  const cleanBranch = normalizeAddaBranchId(branchId);
  return readJsonArray<AddaPendingFreight>(freightKey(cleanBranch));
}

export function saveAddaPendingFreightList(branchId: string, list: AddaPendingFreight[]): void {
  const cleanBranch = normalizeAddaBranchId(branchId);
  writeJsonArray(freightKey(cleanBranch), list);
  emitAddaUpdated(cleanBranch);
}

export interface UpsertAddaFreightInput {
  id?: string;
  branchId: string;
  biltyId?: number;
  biltyNo: string;
  date: string;
  vehicleNo?: string;
  route?: string;
  partyId?: string;
  partyName: string;
  partyMobile: string;
  amount: number;
  status?: AddaPendingStatus;
  billId?: string;
  billNumber?: string;
  notes?: string;
  createdByEmail?: string;
}

export function upsertAddaPendingFreight(input: UpsertAddaFreightInput): AddaPendingFreight {
  const branchId = normalizeAddaBranchId(input.branchId);
  const amountPaisa = requirePositivePaisa(input.amount, 'Pending freight amount', 'بقایا کرایہ رقم');
  const list = getAddaPendingFreight(branchId);
  const nowIso = new Date().toISOString();

  const existing =
    (input.id ? list.find(x => x.id === input.id) : undefined) ||
    (input.biltyId !== undefined
      ? list.find(x => x.biltyId === input.biltyId)
      : undefined) ||
    (input.biltyNo && input.biltyNo.trim().toUpperCase() !== 'MANUAL'
      ? list.find(
          x =>
            x.biltyNo &&
            input.biltyNo &&
            x.biltyNo.trim().toUpperCase() === input.biltyNo.trim().toUpperCase() &&
            x.biltyId === undefined
        )
      : undefined);

  if (existing && (existing.status === 'billed' || existing.status === 'paid')) {
    const prevAmountPaisa = getItemAmountPaisa(existing);
    const sameParty =
      normalizePartyName(existing.partyName) === normalizePartyName(input.partyName) &&
      normalizePartyMobile(existing.partyMobile) === normalizePartyMobile(input.partyMobile);
    if (prevAmountPaisa !== amountPaisa || !sameParty) {
      throw new AddaLifecycleError(
        'BILTY_LOCKED_BY_BILL',
        `This pending freight item is locked under ${existing.billNumber || 'a bill'} (${existing.status}).`,
        `یہ بقایا کرایہ ${existing.billNumber || 'بل'} میں شامل ہونے کی وجہ سے مقفل ہے۔`,
        existing.billNumber
      );
    }
  }

  const resolvedParty = findOrCreateAddaParty(branchId, {
    name: input.partyName,
    mobile: input.partyMobile
  });

  const id = existing?.id || input.id || `af_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: AddaPendingFreight = {
    id,
    branchId,
    ...(input.biltyId !== undefined ? { biltyId: input.biltyId } : existing?.biltyId !== undefined ? { biltyId: existing.biltyId } : {}),
    biltyNo: (input.biltyNo || existing?.biltyNo || 'MANUAL').trim(),
    date: input.date || existing?.date || new Date().toISOString().slice(0, 10),
    vehicleNo: input.vehicleNo?.trim() || existing?.vehicleNo,
    route: input.route?.trim() || existing?.route,
    partyId: input.partyId || resolvedParty.id,
    partyName: input.partyName.trim(),
    partyMobile: (input.partyMobile || resolvedParty.mobile || '').trim(),
    amount: fromPaisa(amountPaisa),
    amountPaisa,
    status: input.status || existing?.status || 'pending',
    ...(input.billId !== undefined ? { billId: input.billId } : existing?.billId ? { billId: existing.billId } : {}),
    ...(input.billNumber !== undefined
      ? { billNumber: input.billNumber }
      : existing?.billNumber
      ? { billNumber: existing.billNumber }
      : {}),
    notes: input.notes?.trim() ?? existing?.notes,
    createdByEmail: input.createdByEmail || existing?.createdByEmail || auth.currentUser?.email || undefined,
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso
  };

  const next = [record, ...list.filter(x => x.id !== id)];
  clearAddaTombstonesForIds(branchId, 'freight', [id]);
  saveAddaPendingFreightList(branchId, next);
  void pushAddaDocToFirestore(branchId, 'adda_items', id, {
    ...record,
    kind: 'freight'
  } as unknown as Record<string, unknown>);
  return record;
}

export function setAddaFreightStatus(
  branchId: string,
  id: string,
  status: AddaPendingStatus
): AddaPendingFreight | null {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const list = getAddaPendingFreight(cleanBranch);
  const target = list.find(x => x.id === id);
  if (!target) return null;
  if (target.status === 'billed' && status === 'pending') {
    throw new AddaLifecycleError(
      'ALREADY_BILLED',
      `Freight item belongs to ${target.billNumber || 'an active bill'}. Delete that unpaid bill to unbill it.`,
      `یہ کرایہ ${target.billNumber || 'بل'} میں شامل ہے۔ واپس پینڈنگ کرنے کے لیے غیر ادا شدہ بل حذف کریں۔`,
      target.billNumber
    );
  }
  const nowIso = new Date().toISOString();
  const amountPaisa = getItemAmountPaisa(target);
  const updated: AddaPendingFreight = {
    ...target,
    amount: fromPaisa(amountPaisa),
    amountPaisa,
    status,
    ...(status === 'pending' ? { billId: undefined, billNumber: undefined } : {}),
    updatedAt: nowIso
  };
  saveAddaPendingFreightList(
    cleanBranch,
    list.map(x => (x.id === id ? updated : x))
  );
  void pushAddaDocToFirestore(cleanBranch, 'adda_items', id, {
    ...updated,
    kind: 'freight'
  } as unknown as Record<string, unknown>);
  return updated;
}

export function deleteAddaPendingFreight(branchId: string, id: string): void {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const list = getAddaPendingFreight(cleanBranch);
  const target = list.find(x => x.id === id);
  if (target && (target.status === 'billed' || target.status === 'paid')) {
    throw new AddaLifecycleError(
      'BILTY_LOCKED_BY_BILL',
      `Cannot delete freight attached to ${target.billNumber || 'bill'} (${target.status}).`,
      `بل ${target.billNumber || ''} میں شامل کرایہ حذف نہیں کیا جا سکتا۔`,
      target.billNumber
    );
  }
  const next = list.filter(x => x.id !== id);
  recordTombstone(cleanBranch, 'freight', id);
  saveAddaPendingFreightList(cleanBranch, next);
  void deleteAddaDocFromFirestore(cleanBranch, 'adda_items', id);
}

// ---------------------------------------------------------------------------
// Commission Pending Operations (`branches/{branchId}/adda_items` kind: 'commission')
// ---------------------------------------------------------------------------

export function getAddaPendingCommissions(branchId: string): AddaPendingCommission[] {
  const cleanBranch = normalizeAddaBranchId(branchId);
  return readJsonArray<AddaPendingCommission>(commissionKey(cleanBranch));
}

export function saveAddaPendingCommissionsList(branchId: string, list: AddaPendingCommission[]): void {
  const cleanBranch = normalizeAddaBranchId(branchId);
  writeJsonArray(commissionKey(cleanBranch), list);
  emitAddaUpdated(cleanBranch);
}

export interface UpsertAddaCommissionInput {
  id?: string;
  branchId: string;
  biltyId?: number;
  biltyNo: string;
  date: string;
  vehicleNo?: string;
  route?: string;
  partyId?: string;
  fromWhomName: string;
  fromWhomMobile: string;
  amount: number;
  status?: AddaPendingStatus;
  billId?: string;
  billNumber?: string;
  notes?: string;
  createdByEmail?: string;
}

export function upsertAddaPendingCommission(
  input: UpsertAddaCommissionInput
): AddaPendingCommission {
  const branchId = normalizeAddaBranchId(input.branchId);
  const amountPaisa = requirePositivePaisa(input.amount, 'Pending commission amount', 'بقایا کمیشن رقم');
  const list = getAddaPendingCommissions(branchId);
  const nowIso = new Date().toISOString();

  const existing =
    (input.id ? list.find(x => x.id === input.id) : undefined) ||
    (input.biltyId !== undefined
      ? list.find(x => x.biltyId === input.biltyId)
      : undefined) ||
    (input.biltyNo && input.biltyNo.trim().toUpperCase() !== 'MANUAL'
      ? list.find(
          x =>
            x.biltyNo &&
            input.biltyNo &&
            x.biltyNo.trim().toUpperCase() === input.biltyNo.trim().toUpperCase() &&
            x.biltyId === undefined
        )
      : undefined);

  if (existing && (existing.status === 'billed' || existing.status === 'paid')) {
    const prevAmountPaisa = getItemAmountPaisa(existing);
    const sameParty =
      normalizePartyName(existing.fromWhomName) === normalizePartyName(input.fromWhomName) &&
      normalizePartyMobile(existing.fromWhomMobile) === normalizePartyMobile(input.fromWhomMobile);
    if (prevAmountPaisa !== amountPaisa || !sameParty) {
      throw new AddaLifecycleError(
        'BILTY_LOCKED_BY_BILL',
        `This pending commission item is locked under ${existing.billNumber || 'a bill'} (${existing.status}).`,
        `یہ بقایا کمیشن ${existing.billNumber || 'بل'} میں شامل ہونے کی وجہ سے مقفل ہے۔`,
        existing.billNumber
      );
    }
  }

  const resolvedParty = findOrCreateAddaParty(branchId, {
    name: input.fromWhomName,
    mobile: input.fromWhomMobile
  });

  const id = existing?.id || input.id || `ac_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: AddaPendingCommission = {
    id,
    branchId,
    ...(input.biltyId !== undefined ? { biltyId: input.biltyId } : existing?.biltyId !== undefined ? { biltyId: existing.biltyId } : {}),
    biltyNo: (input.biltyNo || existing?.biltyNo || 'MANUAL').trim(),
    date: input.date || existing?.date || new Date().toISOString().slice(0, 10),
    vehicleNo: input.vehicleNo?.trim() || existing?.vehicleNo,
    route: input.route?.trim() || existing?.route,
    partyId: input.partyId || resolvedParty.id,
    fromWhomName: input.fromWhomName.trim(),
    fromWhomMobile: (input.fromWhomMobile || resolvedParty.mobile || '').trim(),
    amount: fromPaisa(amountPaisa),
    amountPaisa,
    status: input.status || existing?.status || 'pending',
    ...(input.billId !== undefined ? { billId: input.billId } : existing?.billId ? { billId: existing.billId } : {}),
    ...(input.billNumber !== undefined
      ? { billNumber: input.billNumber }
      : existing?.billNumber
      ? { billNumber: existing.billNumber }
      : {}),
    notes: input.notes?.trim() ?? existing?.notes,
    createdByEmail: input.createdByEmail || existing?.createdByEmail || auth.currentUser?.email || undefined,
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso
  };

  const next = [record, ...list.filter(x => x.id !== id)];
  clearAddaTombstonesForIds(branchId, 'commission', [id]);
  saveAddaPendingCommissionsList(branchId, next);
  void pushAddaDocToFirestore(branchId, 'adda_items', id, {
    ...record,
    kind: 'commission'
  } as unknown as Record<string, unknown>);
  return record;
}

export function setAddaCommissionStatus(
  branchId: string,
  id: string,
  status: AddaPendingStatus
): AddaPendingCommission | null {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const list = getAddaPendingCommissions(cleanBranch);
  const target = list.find(x => x.id === id);
  if (!target) return null;
  if (target.status === 'billed' && status === 'pending') {
    throw new AddaLifecycleError(
      'ALREADY_BILLED',
      `Commission item belongs to ${target.billNumber || 'an active bill'}. Delete that unpaid bill to unbill it.`,
      `یہ کمیشن ${target.billNumber || 'بل'} میں شامل ہے۔ واپس پینڈنگ کرنے کے لیے غیر ادا شدہ بل حذف کریں۔`,
      target.billNumber
    );
  }
  const nowIso = new Date().toISOString();
  const amountPaisa = getItemAmountPaisa(target);
  const updated: AddaPendingCommission = {
    ...target,
    amount: fromPaisa(amountPaisa),
    amountPaisa,
    status,
    ...(status === 'pending' ? { billId: undefined, billNumber: undefined } : {}),
    updatedAt: nowIso
  };
  saveAddaPendingCommissionsList(
    cleanBranch,
    list.map(x => (x.id === id ? updated : x))
  );
  void pushAddaDocToFirestore(cleanBranch, 'adda_items', id, {
    ...updated,
    kind: 'commission'
  } as unknown as Record<string, unknown>);
  return updated;
}

export function deleteAddaPendingCommission(branchId: string, id: string): void {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const list = getAddaPendingCommissions(cleanBranch);
  const target = list.find(x => x.id === id);
  if (target && (target.status === 'billed' || target.status === 'paid')) {
    throw new AddaLifecycleError(
      'BILTY_LOCKED_BY_BILL',
      `Cannot delete commission attached to ${target.billNumber || 'bill'} (${target.status}).`,
      `بل ${target.billNumber || ''} میں شامل کمیشن حذف نہیں کیا جا سکتا۔`,
      target.billNumber
    );
  }
  const next = list.filter(x => x.id !== id);
  recordTombstone(cleanBranch, 'commission', id);
  saveAddaPendingCommissionsList(cleanBranch, next);
  void deleteAddaDocFromFirestore(cleanBranch, 'adda_items', id);
}

// ---------------------------------------------------------------------------
// Bilty <-> Adda Bidirectional Linking & Lifecycle Locks
// ---------------------------------------------------------------------------

export function findLinkedAddaItemsForBilty(
  branchId: string,
  bilty: Pick<BiltyRecord, 'id' | 'biltyNo' | 'pendingFreightId' | 'pendingCommissionId'>
): {
  freightItem?: AddaPendingFreight;
  commissionItem?: AddaPendingCommission;
} {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const freightList = getAddaPendingFreight(cleanBranch);
  const commissionList = getAddaPendingCommissions(cleanBranch);
  const normBiltyNo = String(bilty.biltyNo || '').trim().toUpperCase();

  const freightItem =
    (bilty.pendingFreightId ? freightList.find(f => f.id === bilty.pendingFreightId) : undefined) ||
    freightList.find(
      f =>
        (bilty.id !== undefined && f.biltyId === bilty.id) ||
        (normBiltyNo && f.biltyNo && f.biltyNo.trim().toUpperCase() === normBiltyNo)
    );

  const commissionItem =
    (bilty.pendingCommissionId ? commissionList.find(c => c.id === bilty.pendingCommissionId) : undefined) ||
    commissionList.find(
      c =>
        (bilty.id !== undefined && c.biltyId === bilty.id) ||
        (normBiltyNo && c.biltyNo && c.biltyNo.trim().toUpperCase() === normBiltyNo)
    );

  return { freightItem, commissionItem };
}

function getLockedBiltyBillNumber(
  branchId: string,
  bilty: Pick<BiltyRecord, 'id' | 'biltyNo' | 'pendingFreightId' | 'pendingCommissionId'>
): string | null {
  const { freightItem, commissionItem } = findLinkedAddaItemsForBilty(branchId, bilty);
  if (freightItem && (freightItem.status === 'billed' || freightItem.status === 'paid')) {
    return freightItem.billNumber || freightItem.billId || 'BILL';
  }
  if (commissionItem && (commissionItem.status === 'billed' || commissionItem.status === 'paid')) {
    return commissionItem.billNumber || commissionItem.billId || 'BILL';
  }
  return null;
}

/**
 * Blocks financial/route/party/vehicle edits to a Bilty when a linked Adda item
 * is already 'billed' or 'paid', while always permitting POD delivery updates,
 * legalHold changes, and attachmentCount updates.
 */
export function assertBiltyEditAllowedForAdda(prevBilty: BiltyRecord, nextBilty: BiltyRecord): void {
  const branchId = normalizeAddaBranchId(prevBilty.branchId || nextBilty.branchId);
  const lockedBill = getLockedBiltyBillNumber(branchId, prevBilty);
  if (!lockedBill) return;

  const coreChanged =
    prevBilty.biltyNo !== nextBilty.biltyNo ||
    Number(prevBilty.total || 0) !== Number(nextBilty.total || 0) ||
    Number(prevBilty.advance || 0) !== Number(nextBilty.advance || 0) ||
    Number(prevBilty.payable || 0) !== Number(nextBilty.payable || 0) ||
    (prevBilty.senderName || '') !== (nextBilty.senderName || '') ||
    (prevBilty.receiverName || '') !== (nextBilty.receiverName || '') ||
    (prevBilty.sendingCity || '') !== (nextBilty.sendingCity || '') ||
    (prevBilty.receivingCity || '') !== (nextBilty.receivingCity || '') ||
    (prevBilty.vehicleNo || '') !== (nextBilty.vehicleNo || '') ||
    (prevBilty.date || '') !== (nextBilty.date || '') ||
    (prevBilty.driverName || '') !== (nextBilty.driverName || '');

  if (coreChanged) {
    throw new AddaLifecycleError(
      'BILTY_LOCKED_BY_BILL',
      `This Bilty has items billed/paid on ${lockedBill}. Core fields cannot be modified (POD & Legal Hold remain editable).`,
      `اس بلٹی کا اندراج بل ${lockedBill} میں شامل/ادا شدہ ہے۔ بنیادی تفصیلات میں ترمیم نہیں ہو سکتی (صرف ڈیلیوری POD اور لیگل ہولڈ اپڈیٹ ہو سکتے ہیں)۔`,
      lockedBill
    );
  }
}

export function assertBiltyDeleteAllowedForAdda(bilty: BiltyRecord): void {
  const branchId = normalizeAddaBranchId(bilty.branchId);
  const lockedBill = getLockedBiltyBillNumber(branchId, bilty);
  if (lockedBill) {
    throw new AddaLifecycleError(
      'BILTY_LOCKED_BY_BILL',
      `Cannot delete Bilty #${bilty.biltyNo}: linked freight/commission is on ${lockedBill}. Delete/reverse the bill first.`,
      `بلٹی نمبر ${bilty.biltyNo} حذف نہیں ہو سکتی کیونکہ اس کا بقایا بل ${lockedBill} میں شامل ہے۔`,
      lockedBill
    );
  }
}

export interface SyncBiltyAddaInput {
  bilty: BiltyRecord;
  freightInput?: {
    enabled: boolean;
    partyName?: string;
    partyMobile?: string;
    amount?: number;
  };
  commissionInput?: {
    enabled: boolean;
    fromWhomName?: string;
    fromWhomMobile?: string;
    amount?: number;
  };
}

export function syncBiltyAddaLinks(input: SyncBiltyAddaInput): {
  pendingFreightId?: string;
  pendingCommissionId?: string;
} {
  const { bilty, freightInput, commissionInput } = input;
  const branchId = normalizeAddaBranchId(bilty.branchId);
  const routeText = `${bilty.sendingCity || '-'} -> ${bilty.receivingCity || '-'}`;
  const { freightItem: existingFreight, commissionItem: existingComm } =
    findLinkedAddaItemsForBilty(branchId, bilty);

  let pendingFreightId = existingFreight?.id || bilty.pendingFreightId;
  let pendingCommissionId = existingComm?.id || bilty.pendingCommissionId;

  if (freightInput) {
    if (freightInput.enabled) {
      const saved = upsertAddaPendingFreight({
        id: existingFreight?.id,
        branchId,
        biltyId: bilty.id,
        biltyNo: bilty.biltyNo,
        date: bilty.date,
        vehicleNo: bilty.vehicleNo,
        route: routeText,
        partyName: String(freightInput.partyName || '').trim(),
        partyMobile: String(freightInput.partyMobile || '').trim(),
        amount: Number(freightInput.amount || 0),
        createdByEmail: bilty.createdByEmail
      });
      pendingFreightId = saved.id;
    } else if (existingFreight) {
      if (existingFreight.status === 'billed' || existingFreight.status === 'paid') {
        throw new AddaLifecycleError(
          'BILTY_LOCKED_BY_BILL',
          `Cannot unlink pending freight: already included on ${existingFreight.billNumber || 'a bill'}.`,
          `بقایا کرایہ پہلے سے بل ${existingFreight.billNumber || ''} میں شامل ہے، ختم نہیں ہو سکتا۔`,
          existingFreight.billNumber
        );
      }
      deleteAddaPendingFreight(branchId, existingFreight.id);
      pendingFreightId = undefined;
    } else {
      pendingFreightId = undefined;
    }
  }

  if (commissionInput) {
    if (commissionInput.enabled) {
      const saved = upsertAddaPendingCommission({
        id: existingComm?.id,
        branchId,
        biltyId: bilty.id,
        biltyNo: bilty.biltyNo,
        date: bilty.date,
        vehicleNo: bilty.vehicleNo,
        route: routeText,
        fromWhomName: String(commissionInput.fromWhomName || '').trim(),
        fromWhomMobile: String(commissionInput.fromWhomMobile || '').trim(),
        amount: Number(commissionInput.amount || 0),
        createdByEmail: bilty.createdByEmail
      });
      pendingCommissionId = saved.id;
    } else if (existingComm) {
      if (existingComm.status === 'billed' || existingComm.status === 'paid') {
        throw new AddaLifecycleError(
          'BILTY_LOCKED_BY_BILL',
          `Cannot unlink pending commission: already included on ${existingComm.billNumber || 'a bill'}.`,
          `بقایا کمیشن پہلے سے بل ${existingComm.billNumber || ''} میں شامل ہے، ختم نہیں ہو سکتا۔`,
          existingComm.billNumber
        );
      }
      deleteAddaPendingCommission(branchId, existingComm.id);
      pendingCommissionId = undefined;
    } else {
      pendingCommissionId = undefined;
    }
  }

  return { pendingFreightId, pendingCommissionId };
}

export function syncBiltyDeleteAddaCleanup(bilty: BiltyRecord): void {
  assertBiltyDeleteAllowedForAdda(bilty);
  const branchId = normalizeAddaBranchId(bilty.branchId);
  const { freightItem, commissionItem } = findLinkedAddaItemsForBilty(branchId, bilty);
  if (freightItem && freightItem.status === 'pending') {
    deleteAddaPendingFreight(branchId, freightItem.id);
  }
  if (commissionItem && commissionItem.status === 'pending') {
    deleteAddaPendingCommission(branchId, commissionItem.id);
  }
}

// ---------------------------------------------------------------------------
// Party Grouping & Multi-Select Billing Workflow (Paisa-Exact)
// ---------------------------------------------------------------------------

export interface AddaPartyPendingGroup {
  partyKey: string;
  partyId?: string;
  partyName: string;
  partyMobile: string;
  freightItems: AddaPendingFreight[];
  commissionItems: AddaPendingCommission[];
  pendingFreightTotal: number;
  pendingCommissionTotal: number;
  totalPendingAmount: number;
}

export function getPartyPendingGroups(
  branchId: string,
  includeBilled = false
): AddaPartyPendingGroup[] {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const freight = getAddaPendingFreight(cleanBranch);
  const commissions = getAddaPendingCommissions(cleanBranch);
  const parties = getAddaParties(cleanBranch);
  const partyById = new Map(parties.map(p => [p.id, p]));

  const allowedStatuses: AddaPendingStatus[] = includeBilled ? ['pending', 'billed'] : ['pending'];
  type GroupAcc = {
    partyKey: string;
    partyId?: string;
    partyName: string;
    partyMobile: string;
    freightItems: AddaPendingFreight[];
    commissionItems: AddaPendingCommission[];
    freightPaisa: number;
    commPaisa: number;
  };
  const groups = new Map<string, GroupAcc>();

  const ensureGroup = (name: string, mobile: string, partyId?: string): GroupAcc => {
    const cleanName = name.trim() || 'Unknown Party';
    const cleanMob = mobile.trim();
    const resolvedById = partyId ? partyById.get(partyId) : undefined;
    const key = resolvedById
      ? computePartyMatchKey(resolvedById.name, resolvedById.mobile)
      : computePartyMatchKey(cleanName, cleanMob);

    let g = groups.get(key);
    if (!g) {
      g = {
        partyKey: key,
        partyId: resolvedById?.id || partyId,
        partyName: resolvedById?.name || cleanName,
        partyMobile: resolvedById?.mobile || cleanMob,
        freightItems: [],
        commissionItems: [],
        freightPaisa: 0,
        commPaisa: 0
      };
      groups.set(key, g);
    } else {
      if (!g.partyMobile && cleanMob) g.partyMobile = cleanMob;
      if (!g.partyId && (resolvedById?.id || partyId)) g.partyId = resolvedById?.id || partyId;
    }
    return g;
  };

  for (const item of freight) {
    if (!allowedStatuses.includes(item.status)) continue;
    const g = ensureGroup(item.partyName, item.partyMobile, item.partyId);
    g.freightItems.push(item);
    g.freightPaisa += getItemAmountPaisa(item);
  }

  for (const item of commissions) {
    if (!allowedStatuses.includes(item.status)) continue;
    const g = ensureGroup(item.fromWhomName, item.fromWhomMobile, item.partyId);
    g.commissionItems.push(item);
    g.commPaisa += getItemAmountPaisa(item);
  }

  return Array.from(groups.values())
    .map(g => {
      const totalPaisa = g.freightPaisa + g.commPaisa;
      return {
        partyKey: g.partyKey,
        partyId: g.partyId,
        partyName: g.partyName,
        partyMobile: g.partyMobile,
        freightItems: g.freightItems,
        commissionItems: g.commissionItems,
        pendingFreightTotal: fromPaisa(g.freightPaisa),
        pendingCommissionTotal: fromPaisa(g.commPaisa),
        totalPendingAmount: fromPaisa(totalPaisa)
      };
    })
    .sort((a, b) => toPaisa(b.totalPendingAmount) - toPaisa(a.totalPendingAmount));
}

// ---------------------------------------------------------------------------
// Adda Bills Operations (Pending -> Billed -> Partial -> Paid)
// ---------------------------------------------------------------------------

export function getAddaBills(branchId: string): AddaBillRecord[] {
  const cleanBranch = normalizeAddaBranchId(branchId);
  return readJsonArray<AddaBillRecord>(billsKey(cleanBranch));
}

export function saveAddaBillsList(branchId: string, list: AddaBillRecord[]): void {
  const cleanBranch = normalizeAddaBranchId(branchId);
  writeJsonArray(billsKey(cleanBranch), list);
  emitAddaUpdated(cleanBranch);
}

function getExistingBillSeqsAndMinStart(branchId: string): {
  existingSeqs: Set<number>;
  minStart: number;
} {
  const existing = getAddaBills(branchId);
  const existingSeqs = new Set<number>();
  let highest = 0;
  try {
    const saved = Number(safeStorage.getItem(billSeqKey(branchId)) || '0');
    if (Number.isFinite(saved) && saved > highest) highest = saved;
  } catch {}
  for (const b of existing) {
    const m = String(b.billNumber || '').match(/(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > 0) {
        existingSeqs.add(n);
        if (n > highest) highest = n;
      }
    }
  }
  return { existingSeqs, minStart: highest + 1 };
}

export function formatAddaBillNumber(seq: number): string {
  const safe = Math.max(1, Math.floor(Number(seq) || 1));
  return `BILL-${String(safe).padStart(3, '0')}`;
}

export function allocateNextAddaBillNumber(branchId: string): string {
  const cleanBranchId = normalizeAddaBranchId(branchId);
  const { existingSeqs, minStart } = getExistingBillSeqsAndMinStart(cleanBranchId);

  const localBlock = getLocalNumberBlock(cleanBranchId, 'bill');
  if (localBlock) {
    let candidate = Math.max(localBlock.nextSeq, localBlock.start, minStart);
    while (candidate <= localBlock.end && existingSeqs.has(candidate)) {
      candidate++;
    }
    if (candidate > localBlock.end) {
      throw new OfflineBlockExhaustedError('bill', cleanBranchId);
    }
    saveLocalNumberBlock({ ...localBlock, nextSeq: candidate + 1 });
    try {
      safeStorage.setItem(billSeqKey(cleanBranchId), String(candidate));
    } catch {}
    return formatAddaBillNumber(candidate);
  }

  let seq = minStart;
  while (existingSeqs.has(seq)) seq++;
  try {
    safeStorage.setItem(billSeqKey(cleanBranchId), String(seq));
  } catch {}
  return formatAddaBillNumber(seq);
}

export async function allocateNextAddaBillNumberAsync(branchId: string): Promise<string> {
  const cleanBranchId = normalizeAddaBranchId(branchId);
  const { existingSeqs, minStart } = getExistingBillSeqsAndMinStart(cleanBranchId);

  const blockRes = await allocateBranchBlockNumber({
    kind: 'bill',
    branchId: cleanBranchId,
    minStart,
    existingSeqs
  });

  if (blockRes.fromBlock && blockRes.seq >= minStart) {
    try {
      safeStorage.setItem(billSeqKey(cleanBranchId), String(blockRes.seq));
    } catch {}
    return formatAddaBillNumber(blockRes.seq);
  }

  let seq = minStart;
  while (existingSeqs.has(seq)) seq++;
  try {
    safeStorage.setItem(billSeqKey(cleanBranchId), String(seq));
  } catch {}
  return formatAddaBillNumber(seq);
}

export interface CreateAddaBillInput {
  branchId: string;
  partyId?: string;
  partyName: string;
  partyMobile?: string;
  date?: string;
  selectedFreightIds: string[];
  selectedCommissionIds: string[];
  extraCharges?: number;
  discount?: number;
  notes?: string;
  branchConfig?: BranchConfig | null;
  companyProfile?: CompanyProfile | null;
}

const activeBillSubmitLocks = new Set<string>();

function buildAddaBillRecordFromSelection(
  input: CreateAddaBillInput,
  billNumber: string,
  freightList: AddaPendingFreight[],
  commissionList: AddaPendingCommission[]
): {
  bill: AddaBillRecord;
  selectedFreight: AddaPendingFreight[];
  selectedCommission: AddaPendingCommission[];
} {
  const branchId = normalizeAddaBranchId(input.branchId);
  const selectedFreight = freightList.filter(f => input.selectedFreightIds.includes(f.id));
  const selectedCommission = commissionList.filter(c => input.selectedCommissionIds.includes(c.id));

  if (selectedFreight.length === 0 && selectedCommission.length === 0) {
    throw new AddaLifecycleError(
      'NOT_FOUND',
      'Select at least one pending freight or commission item to generate a bill.',
      'بل بنانے کے لیے کم از کم ایک پینڈنگ کرایہ یا کمیشن آئٹم منتخب کریں۔'
    );
  }

  const alreadyBilledFreight = selectedFreight.find(f => f.status !== 'pending');
  if (alreadyBilledFreight) {
    throw new AddaLifecycleError(
      'ALREADY_BILLED',
      `Freight item on ${alreadyBilledFreight.biltyNo} is already ${alreadyBilledFreight.status} (${alreadyBilledFreight.billNumber || ''}).`,
      `بلٹی ${alreadyBilledFreight.biltyNo} کا کرایہ پہلے ہی بل میں شامل یا ادا ہو چکا ہے۔`,
      alreadyBilledFreight.billNumber
    );
  }

  const alreadyBilledComm = selectedCommission.find(c => c.status !== 'pending');
  if (alreadyBilledComm) {
    throw new AddaLifecycleError(
      'ALREADY_BILLED',
      `Commission item on ${alreadyBilledComm.biltyNo} is already ${alreadyBilledComm.status} (${alreadyBilledComm.billNumber || ''}).`,
      `بلٹی ${alreadyBilledComm.biltyNo} کا کمیشن پہلے ہی بل میں شامل یا ادا ہو چکا ہے۔`,
      alreadyBilledComm.billNumber
    );
  }

  const partyRecord = findOrCreateAddaParty(branchId, {
    name: input.partyName,
    mobile: input.partyMobile
  });

  const billId = `ab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const nowIso = new Date().toISOString();
  const billDate = input.date || nowIso.slice(0, 10);

  const items: AddaBillItemSnapshot[] = [
    ...selectedFreight.map(f => {
      const amountPaisa = getItemAmountPaisa(f);
      return {
        itemId: f.id,
        itemType: 'freight' as const,
        biltyNo: f.biltyNo,
        date: f.date,
        vehicleNo: f.vehicleNo,
        route: f.route,
        description: `Freight${f.route ? ` (${f.route})` : ''}${f.notes ? ` - ${f.notes}` : ''}`,
        amount: fromPaisa(amountPaisa),
        amountPaisa
      };
    }),
    ...selectedCommission.map(c => {
      const amountPaisa = getItemAmountPaisa(c);
      return {
        itemId: c.id,
        itemType: 'commission' as const,
        biltyNo: c.biltyNo,
        date: c.date,
        vehicleNo: c.vehicleNo,
        route: c.route,
        description: `Commission${c.route ? ` (${c.route})` : ''}${c.notes ? ` - ${c.notes}` : ''}`,
        amount: fromPaisa(amountPaisa),
        amountPaisa
      };
    })
  ];

  const subtotalPaisa = items.reduce((sum, i) => sum + (i.amountPaisa || 0), 0);
  const extraChargesPaisa = nonNegPaisa(input.extraCharges);
  const discountPaisa = nonNegPaisa(input.discount);
  const totalAmountPaisa = Math.max(0, subtotalPaisa + extraChargesPaisa - discountPaisa);
  const resolvedCo = resolveEffectiveCompanyDetails(input.branchConfig, input.companyProfile);

  const bill: AddaBillRecord = {
    id: billId,
    branchId,
    billNumber,
    date: billDate,
    partyId: input.partyId || partyRecord.id,
    partyName: input.partyName.trim(),
    partyMobile: (input.partyMobile || partyRecord.mobile || '').trim() || undefined,
    items,
    subtotal: fromPaisa(subtotalPaisa),
    subtotalPaisa,
    extraCharges: fromPaisa(extraChargesPaisa),
    extraChargesPaisa,
    discount: fromPaisa(discountPaisa),
    discountPaisa,
    totalAmount: fromPaisa(totalAmountPaisa),
    totalAmountPaisa,
    paidAmount: 0,
    paidAmountPaisa: 0,
    paymentHistory: [],
    status: 'billed',
    notes: input.notes?.trim() || undefined,
    companySnapshot: {
      nameUr: resolvedCo.nameUr,
      nameEn: resolvedCo.nameEn,
      proprietorUr: resolvedCo.proprietorUr,
      proprietorEn: resolvedCo.proprietorEn,
      addressUr: resolvedCo.addressUr,
      addressEn: resolvedCo.addressEn,
      phone: resolvedCo.phone,
      ntn: resolvedCo.ntn
    },
    createdByEmail: auth.currentUser?.email || undefined,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  return { bill, selectedFreight, selectedCommission };
}

export function createAddaBillFromPendingItems(input: CreateAddaBillInput): AddaBillRecord {
  const branchId = normalizeAddaBranchId(input.branchId);
  const freightList = getAddaPendingFreight(branchId);
  const commissionList = getAddaPendingCommissions(branchId);

  const billNumber = allocateNextAddaBillNumber(branchId);
  const { bill, selectedFreight, selectedCommission } = buildAddaBillRecordFromSelection(
    input,
    billNumber,
    freightList,
    commissionList
  );

  const nowIso = bill.updatedAt;
  const fIds = new Set(selectedFreight.map(x => x.id));
  const cIds = new Set(selectedCommission.map(x => x.id));

  const nextFreight = freightList.map(f =>
    fIds.has(f.id) ? { ...f, status: 'billed' as const, billId: bill.id, billNumber, updatedAt: nowIso } : f
  );
  const nextCommissions = commissionList.map(c =>
    cIds.has(c.id) ? { ...c, status: 'billed' as const, billId: bill.id, billNumber, updatedAt: nowIso } : c
  );
  const nextBills = [bill, ...getAddaBills(branchId)];

  writeJsonArray(freightKey(branchId), nextFreight);
  writeJsonArray(commissionKey(branchId), nextCommissions);
  writeJsonArray(billsKey(branchId), nextBills);
  emitAddaUpdated(branchId);

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const entries = [
      { coll: 'adda_bills' as const, id: bill.id, data: bill as unknown as Record<string, unknown> },
      ...nextFreight
        .filter(x => fIds.has(x.id))
        .map(f => ({
          coll: 'adda_items' as const,
          id: f.id,
          data: { ...f, kind: 'freight' } as unknown as Record<string, unknown>
        })),
      ...nextCommissions
        .filter(x => cIds.has(x.id))
        .map(c => ({
          coll: 'adda_items' as const,
          id: c.id,
          data: { ...c, kind: 'commission' } as unknown as Record<string, unknown>
        }))
    ];
    void commitAddaSetBatch(entries, branchId).catch(err =>
      console.warn('[AddaBilling] Bill batch sync warning:', err)
    );
  }

  return bill;
}

/**
 * Atomic transactional bill creation with double-tap in-flight lock.
 * When signed-in & online with Firestore `runTransaction`, verifies live cloud item status == 'pending'
 * before committing `adda_bills` + `adda_items` atomically so two devices cannot bill the same item twice.
 */
export async function createAddaBillTransactional(input: CreateAddaBillInput): Promise<AddaBillRecord> {
  const branchId = normalizeAddaBranchId(input.branchId);
  const lockKey = `${branchId}::${[...input.selectedFreightIds].sort().join(',')}::${[
    ...input.selectedCommissionIds
  ]
    .sort()
    .join(',')}`;

  if (activeBillSubmitLocks.has(lockKey)) {
    throw new AddaLifecycleError(
      'DOUBLE_SUBMIT',
      'Bill generation is already in progress for these items.',
      'ان آئٹمز کا بل پہلے ہی تیار کیا جا رہا ہے۔'
    );
  }
  activeBillSubmitLocks.add(lockKey);

  try {
    const freightList = getAddaPendingFreight(branchId);
    const commissionList = getAddaPendingCommissions(branchId);
    const billNumber = await allocateNextAddaBillNumberAsync(branchId);

    const { bill, selectedFreight, selectedCommission } = buildAddaBillRecordFromSelection(
      input,
      billNumber,
      freightList,
      commissionList
    );

    const runTxFn = safeGetAddaFirestoreExport<typeof firestoreModule.runTransaction>('runTransaction');
    const canCloudTx =
      Boolean(db) &&
      Boolean(auth.currentUser) &&
      (typeof navigator === 'undefined' || navigator.onLine) &&
      typeof runTxFn === 'function';

    const nowIso = bill.updatedAt;
    const fIds = new Set(selectedFreight.map(x => x.id));
    const cIds = new Set(selectedCommission.map(x => x.id));

    const updatedFreightItems = selectedFreight.map(f => ({
      ...f,
      status: 'billed' as const,
      billId: bill.id,
      billNumber: bill.billNumber,
      updatedAt: nowIso
    }));
    const updatedCommItems = selectedCommission.map(c => ({
      ...c,
      status: 'billed' as const,
      billId: bill.id,
      billNumber: bill.billNumber,
      updatedAt: nowIso
    }));

    if (canCloudTx && db && runTxFn) {
      const serverTs = safeServerTimestamp();
      await runTxFn(db, async tx => {
        for (const item of [...selectedFreight, ...selectedCommission]) {
          const itemRef = doc(db!, 'branches', branchId, 'adda_items', item.id);
          const snap = await tx.get(itemRef);
          if (snap.exists()) {
            const remoteData = snap.data() as { status?: string; billNumber?: string };
            if (remoteData?.status && remoteData.status !== 'pending') {
              throw new AddaLifecycleError(
                'ALREADY_BILLED',
                `Item ${item.biltyNo} was already ${remoteData.status} on another device (${remoteData.billNumber || ''}).`,
                `آئٹم ${item.biltyNo} پہلے ہی دوسری ڈیوائس پر بل یا ادا ہو چکا ہے۔`,
                remoteData.billNumber
              );
            }
          }
        }

        tx.set(
          doc(db!, 'branches', branchId, 'adda_bills', bill.id),
          { ...bill, _deleted: false, deletedAt: null, serverUpdatedAt: serverTs },
          { merge: true }
        );
        for (const f of updatedFreightItems) {
          tx.set(
            doc(db!, 'branches', branchId, 'adda_items', f.id),
            { ...f, kind: 'freight', _deleted: false, deletedAt: null, serverUpdatedAt: serverTs },
            { merge: true }
          );
        }
        for (const c of updatedCommItems) {
          tx.set(
            doc(db!, 'branches', branchId, 'adda_items', c.id),
            { ...c, kind: 'commission', _deleted: false, deletedAt: null, serverUpdatedAt: serverTs },
            { merge: true }
          );
        }
      });
    }

    const nextFreight = freightList.map(f =>
      fIds.has(f.id) ? updatedFreightItems.find(u => u.id === f.id) || f : f
    );
    const nextCommissions = commissionList.map(c =>
      cIds.has(c.id) ? updatedCommItems.find(u => u.id === c.id) || c : c
    );
    const nextBills = [bill, ...getAddaBills(branchId)];

    writeJsonArray(freightKey(branchId), nextFreight);
    writeJsonArray(commissionKey(branchId), nextCommissions);
    writeJsonArray(billsKey(branchId), nextBills);
    emitAddaUpdated(branchId);

    return bill;
  } finally {
    activeBillSubmitLocks.delete(lockKey);
  }
}

export interface RecordAddaPaymentInput {
  amountRupees: number;
  idempotencyKey?: string;
  confirmOverpayment?: boolean;
  note?: string;
  recordedByName?: string;
}

export type RecordAddaPaymentResult =
  | { status: 'duplicate'; bill: AddaBillRecord }
  | { status: 'needs_overpayment_confirmation'; bill: AddaBillRecord; remainingPaisa: number; overpaymentPaisa: number }
  | { status: 'recorded'; bill: AddaBillRecord; paymentEntry: AddaPaymentEntry };

export function recordAddaBillPayment(
  branchId: string,
  billId: string,
  input: RecordAddaPaymentInput
): RecordAddaPaymentResult {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const bills = getAddaBills(cleanBranch);
  const target = bills.find(b => b.id === billId);
  if (!target) {
    throw new AddaLifecycleError('NOT_FOUND', 'Bill not found.', 'بل نہیں ملا۔');
  }

  const idemKey =
    input.idempotencyKey?.trim() || `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const existingHistory = Array.isArray(target.paymentHistory) ? [...target.paymentHistory] : [];
  if (existingHistory.some(p => p.idempotencyKey === idemKey)) {
    return { status: 'duplicate', bill: target };
  }

  const paymentPaisa = requirePositivePaisa(input.amountRupees, 'Payment amount', 'ادائیگی کی رقم');
  const totalPaisa = getBillTotalPaisa(target);
  const alreadyPaidPaisa = getBillPaidPaisa(target);
  const remainingPaisa = Math.max(0, totalPaisa - alreadyPaidPaisa);

  if (paymentPaisa > remainingPaisa && !input.confirmOverpayment) {
    return {
      status: 'needs_overpayment_confirmation',
      bill: target,
      remainingPaisa,
      overpaymentPaisa: paymentPaisa - remainingPaisa
    };
  }

  const nowIso = new Date().toISOString();
  const paymentEntry: AddaPaymentEntry = {
    id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    idempotencyKey: idemKey,
    amountPaisa: paymentPaisa,
    kind: 'payment',
    ...(input.note?.trim() ? { note: input.note.trim() } : {}),
    ...(input.recordedByName?.trim() ? { recordedByName: input.recordedByName.trim() } : {}),
    recordedAt: nowIso
  };

  // Seed legacy opening paid amount if historical paidAmount > 0 had no paymentHistory
  if (existingHistory.length === 0 && alreadyPaidPaisa > 0) {
    existingHistory.push({
      id: `pm_legacy_${target.id}`,
      idempotencyKey: `legacy_${target.id}`,
      amountPaisa: alreadyPaidPaisa,
      kind: 'payment',
      note: 'Prior recorded payment',
      recordedAt: target.paidAt || target.updatedAt || nowIso
    });
  }

  const nextHistory = [...existingHistory, paymentEntry];
  const nextPaidPaisa = computeBillPaymentHistoryPaisa(nextHistory);
  const nextStatus: AddaBillRecord['status'] =
    nextPaidPaisa >= totalPaisa ? 'paid' : nextPaidPaisa > 0 ? 'partial' : 'billed';

  const updatedBill: AddaBillRecord = {
    ...target,
    totalAmountPaisa: totalPaisa,
    totalAmount: fromPaisa(totalPaisa),
    paidAmountPaisa: nextPaidPaisa,
    paidAmount: fromPaisa(nextPaidPaisa),
    paymentHistory: nextHistory,
    status: nextStatus,
    ...(nextStatus === 'paid' ? { paidAt: nowIso } : { paidAt: undefined }),
    updatedAt: nowIso
  };

  const freightIds = new Set(target.items.filter(i => i.itemType === 'freight').map(i => i.itemId));
  const commissionIds = new Set(target.items.filter(i => i.itemType === 'commission').map(i => i.itemId));
  const freightList = getAddaPendingFreight(cleanBranch);
  const commissionList = getAddaPendingCommissions(cleanBranch);

  const itemNextStatus: AddaPendingStatus = nextStatus === 'paid' ? 'paid' : 'billed';
  const nextFreight = freightList.map(f =>
    freightIds.has(f.id) || f.billId === billId
      ? { ...f, status: itemNextStatus, updatedAt: nowIso }
      : f
  );
  const nextCommissions = commissionList.map(c =>
    commissionIds.has(c.id) || c.billId === billId
      ? { ...c, status: itemNextStatus, updatedAt: nowIso }
      : c
  );

  writeJsonArray(freightKey(cleanBranch), nextFreight);
  writeJsonArray(commissionKey(cleanBranch), nextCommissions);
  writeJsonArray(
    billsKey(cleanBranch),
    bills.map(b => (b.id === billId ? updatedBill : b))
  );
  emitAddaUpdated(cleanBranch);

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const entries = [
      { coll: 'adda_bills' as const, id: billId, data: updatedBill as unknown as Record<string, unknown> },
      ...nextFreight
        .filter(x => freightIds.has(x.id) || x.billId === billId)
        .map(f => ({
          coll: 'adda_items' as const,
          id: f.id,
          data: { ...f, kind: 'freight' } as unknown as Record<string, unknown>
        })),
      ...nextCommissions
        .filter(x => commissionIds.has(x.id) || x.billId === billId)
        .map(c => ({
          coll: 'adda_items' as const,
          id: c.id,
          data: { ...c, kind: 'commission' } as unknown as Record<string, unknown>
        }))
    ];
    void commitAddaSetBatch(entries, cleanBranch).catch(() => {});
  }

  return { status: 'recorded', bill: updatedBill, paymentEntry };
}

export function reverseAddaBillPayment(
  branchId: string,
  billId: string,
  paymentId: string,
  note?: string,
  recordedByName?: string
): AddaBillRecord {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const bills = getAddaBills(cleanBranch);
  const target = bills.find(b => b.id === billId);
  if (!target) {
    throw new AddaLifecycleError('NOT_FOUND', 'Bill not found.', 'بل نہیں ملا۔');
  }

  const history = Array.isArray(target.paymentHistory) ? [...target.paymentHistory] : [];
  const orig = history.find(p => p.id === paymentId && p.kind === 'payment');
  if (!orig) {
    throw new AddaLifecycleError('NOT_FOUND', 'Payment entry not found.', 'ادائیگی کا اندراج نہیں ملا۔');
  }

  const revIdemKey = `rev_${orig.id}`;
  if (history.some(p => p.kind === 'reversal' && p.idempotencyKey === revIdemKey)) {
    return target;
  }

  const nowIso = new Date().toISOString();
  const reversalEntry: AddaPaymentEntry = {
    id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    idempotencyKey: revIdemKey,
    amountPaisa: orig.amountPaisa,
    kind: 'reversal',
    note: note?.trim() || `Reversal of payment ${orig.id}`,
    ...(recordedByName?.trim() ? { recordedByName: recordedByName.trim() } : {}),
    recordedAt: nowIso
  };

  const nextHistory = [...history, reversalEntry];
  const totalPaisa = getBillTotalPaisa(target);
  const nextPaidPaisa = computeBillPaymentHistoryPaisa(nextHistory);
  const nextStatus: AddaBillRecord['status'] =
    nextPaidPaisa >= totalPaisa ? 'paid' : nextPaidPaisa > 0 ? 'partial' : 'billed';

  const updatedBill: AddaBillRecord = {
    ...target,
    totalAmountPaisa: totalPaisa,
    totalAmount: fromPaisa(totalPaisa),
    paidAmountPaisa: nextPaidPaisa,
    paidAmount: fromPaisa(nextPaidPaisa),
    paymentHistory: nextHistory,
    status: nextStatus,
    paidAt: nextStatus === 'paid' ? target.paidAt : undefined,
    updatedAt: nowIso
  };

  const freightIds = new Set(target.items.filter(i => i.itemType === 'freight').map(i => i.itemId));
  const commissionIds = new Set(target.items.filter(i => i.itemType === 'commission').map(i => i.itemId));
  const freightList = getAddaPendingFreight(cleanBranch);
  const commissionList = getAddaPendingCommissions(cleanBranch);
  const itemNextStatus: AddaPendingStatus = nextStatus === 'paid' ? 'paid' : 'billed';

  const nextFreight = freightList.map(f =>
    freightIds.has(f.id) || f.billId === billId
      ? { ...f, status: itemNextStatus, updatedAt: nowIso }
      : f
  );
  const nextCommissions = commissionList.map(c =>
    commissionIds.has(c.id) || c.billId === billId
      ? { ...c, status: itemNextStatus, updatedAt: nowIso }
      : c
  );

  writeJsonArray(freightKey(cleanBranch), nextFreight);
  writeJsonArray(commissionKey(cleanBranch), nextCommissions);
  writeJsonArray(
    billsKey(cleanBranch),
    bills.map(b => (b.id === billId ? updatedBill : b))
  );
  emitAddaUpdated(cleanBranch);

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const entries = [
      { coll: 'adda_bills' as const, id: billId, data: updatedBill as unknown as Record<string, unknown> },
      ...nextFreight
        .filter(x => freightIds.has(x.id) || x.billId === billId)
        .map(f => ({
          coll: 'adda_items' as const,
          id: f.id,
          data: { ...f, kind: 'freight' } as unknown as Record<string, unknown>
        })),
      ...nextCommissions
        .filter(x => commissionIds.has(x.id) || x.billId === billId)
        .map(c => ({
          coll: 'adda_items' as const,
          id: c.id,
          data: { ...c, kind: 'commission' } as unknown as Record<string, unknown>
        }))
    ];
    void commitAddaSetBatch(entries, cleanBranch).catch(() => {});
  }

  return updatedBill;
}

export function markAddaBillPaid(
  branchId: string,
  billId: string,
  recordedByName?: string
): AddaBillRecord | null {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const bills = getAddaBills(cleanBranch);
  const target = bills.find(b => b.id === billId);
  if (!target) return null;
  const remainingPaisa = getBillRemainingPaisa(target);
  if (remainingPaisa <= 0) return target;

  const res = recordAddaBillPayment(cleanBranch, billId, {
    amountRupees: fromPaisa(remainingPaisa),
    confirmOverpayment: true,
    idempotencyKey: `mark_paid_${billId}_${target.updatedAt}`,
    note: 'Full settlement',
    recordedByName
  });
  return res.bill;
}

export function deleteAddaBill(branchId: string, billId: string): void {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const bills = getAddaBills(cleanBranch);
  const target = bills.find(b => b.id === billId);
  const nowIso = new Date().toISOString();

  if (target && (target.status === 'paid' || getBillPaidPaisa(target) > 0)) {
    throw new AddaLifecycleError(
      'BILL_HAS_PAYMENTS',
      `Cannot delete ${target.billNumber}: payments have already been recorded. Reverse all payments first.`,
      `بل ${target.billNumber} پر ادائیگی درج ہو چکی ہے، اسے حذف نہیں کیا جا سکتا۔ پہلے تمام ادائیگیاں ریورس کریں۔`,
      target.billNumber
    );
  }

  // Revert linked items back to pending cleanly; NEVER decrement bill counter
  if (target) {
    const freightList = getAddaPendingFreight(cleanBranch);
    const commissionList = getAddaPendingCommissions(cleanBranch);
    const nextFreight = freightList.map(f =>
      f.billId === billId && f.status === 'billed'
        ? { ...f, status: 'pending' as const, billId: undefined, billNumber: undefined, updatedAt: nowIso }
        : f
    );
    const nextCommissions = commissionList.map(c =>
      c.billId === billId && c.status === 'billed'
        ? { ...c, status: 'pending' as const, billId: undefined, billNumber: undefined, updatedAt: nowIso }
        : c
    );
    writeJsonArray(freightKey(cleanBranch), nextFreight);
    writeJsonArray(commissionKey(cleanBranch), nextCommissions);

    if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
      const entries = [
        ...nextFreight
          .filter(x => x.updatedAt === nowIso)
          .map(f => ({
            coll: 'adda_items' as const,
            id: f.id,
            data: { ...f, kind: 'freight', billId: null, billNumber: null } as unknown as Record<string, unknown>
          })),
        ...nextCommissions
          .filter(x => x.updatedAt === nowIso)
          .map(c => ({
            coll: 'adda_items' as const,
            id: c.id,
            data: { ...c, kind: 'commission', billId: null, billNumber: null } as unknown as Record<string, unknown>
          }))
      ];
      void commitAddaSetBatch(entries, cleanBranch).catch(() => {});
    }
  }

  recordTombstone(cleanBranch, 'bills', billId);
  saveAddaBillsList(
    cleanBranch,
    bills.filter(b => b.id !== billId)
  );
  void deleteAddaDocFromFirestore(cleanBranch, 'adda_bills', billId);
}

// ---------------------------------------------------------------------------
// Cloud Synchronization (Canonical adda_items/adda_bills/adda_parties + Legacy Dual-Read)
// ---------------------------------------------------------------------------

export async function fetchAddaFromFirestore(
  branchId: string,
  options: { forceFullResync?: boolean; bypassKillSwitch?: boolean } = {}
): Promise<{
  freight: AddaPendingFreight[];
  commissions: AddaPendingCommission[];
  bills: AddaBillRecord[];
  parties: AddaPartyRecord[];
}> {
  const cleanBranch = normalizeAddaBranchId(branchId);
  const localFreight = getAddaPendingFreight(cleanBranch);
  const localCommissions = getAddaPendingCommissions(cleanBranch);
  const localBills = getAddaBills(cleanBranch);
  const localParties = getAddaParties(cleanBranch);

  if (!db || !auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return {
      freight: localFreight,
      commissions: localCommissions,
      bills: localBills,
      parties: localParties
    };
  }

  if (!options.bypassKillSwitch && (await isBranchSyncKilledRemotely())) {
    return {
      freight: localFreight,
      commissions: localCommissions,
      bills: localBills,
      parties: localParties
    };
  }

  try {
    const nowMs = Date.now();
    const cursorMs = Number(safeStorage.getItem(addaCursorKey(cleanBranch)) || '0') || 0;
    const lastDriftMs = Number(safeStorage.getItem(addaDriftKey(cleanBranch)) || '0') || 0;
    const hasLocalSeed =
      safeStorage.getItem(freightKey(cleanBranch)) !== null ||
      safeStorage.getItem(commissionKey(cleanBranch)) !== null ||
      safeStorage.getItem(billsKey(cleanBranch)) !== null;

    const cursorExpired = cursorMs > 0 && nowMs - cursorMs > ADDA_CURSOR_MAX_AGE_MS;
    const driftExpired = lastDriftMs <= 0 || nowMs - lastDriftMs > ADDA_WEEKLY_DRIFT_MS;
    const useIncremental =
      !options.forceFullResync &&
      cursorMs > 0 &&
      !cursorExpired &&
      !driftExpired &&
      hasLocalSeed;

    const sinceMs = Math.max(0, cursorMs - ADDA_CURSOR_OVERLAP_MS);

    const itemsColl = collection(db, 'branches', cleanBranch, 'adda_items');
    const billsColl = collection(db, 'branches', cleanBranch, 'adda_bills');
    const partiesColl = collection(db, 'branches', cleanBranch, 'adda_parties');

    const legacyFreightColl = collection(db, 'branches', cleanBranch, 'addaPendingFreight');
    const legacyCommColl = collection(db, 'branches', cleanBranch, 'addaPendingCommissions');
    const legacyBillsColl = collection(db, 'branches', cleanBranch, 'addaBills');

    const safeGet = async (qRef: ReturnType<typeof collection> | ReturnType<typeof buildAddaIncrementalQuery>) => {
      try {
        return await getDocs(qRef);
      } catch (err) {
        if (isAddaPermissionDeniedError(err)) throw err;
        return null;
      }
    };

    const localTombs = readTombstones(cleanBranch);
    const [
      tombSnap,
      itemsSnap,
      billsSnap,
      partiesSnap,
      legacyFreightSnap,
      legacyCommSnap,
      legacyBillsSnap
    ] = await Promise.all([
      getDoc(doc(db, 'branches', cleanBranch, 'collections', 'tombstones')).catch(err => {
        if (isAddaPermissionDeniedError(err)) throw err;
        return null;
      }),
      safeGet(useIncremental ? buildAddaIncrementalQuery(itemsColl, sinceMs) : itemsColl),
      safeGet(useIncremental ? buildAddaIncrementalQuery(billsColl, sinceMs) : billsColl),
      safeGet(useIncremental ? buildAddaIncrementalQuery(partiesColl, sinceMs) : partiesColl),
      safeGet(useIncremental ? buildAddaIncrementalQuery(legacyFreightColl, sinceMs) : legacyFreightColl),
      safeGet(useIncremental ? buildAddaIncrementalQuery(legacyCommColl, sinceMs) : legacyCommColl),
      safeGet(useIncremental ? buildAddaIncrementalQuery(legacyBillsColl, sinceMs) : legacyBillsColl)
    ]);

    const remoteTombs = (tombSnap && tombSnap.exists() ? tombSnap.data()?.addaTombstones : null) || {};
    const mergedTombs: AddaTombstones = {
      freight: { ...(remoteTombs.freight || {}), ...localTombs.freight },
      commission: { ...(remoteTombs.commission || {}), ...localTombs.commission },
      bills: { ...(remoteTombs.bills || {}), ...localTombs.bills },
      parties: { ...(remoteTombs.parties || {}), ...localTombs.parties }
    };

    const remoteFreight: AddaPendingFreight[] = [];
    const remoteComm: AddaPendingCommission[] = [];

    const ingestFreight = (rawData: Record<string, unknown>, docId: string) => {
      if (rawData?._deleted === true) {
        const idKey = String(rawData.id || docId);
        if (idKey) mergedTombs.freight[idKey] = String(rawData.deletedAt || new Date(nowMs).toISOString());
        return;
      }
      const clean = stripCloudMetadata(rawData) as unknown as AddaPendingFreight & { kind?: string };
      delete clean.kind;
      if (!clean.amountPaisa) clean.amountPaisa = toPaisa(Number(clean.amount) || 0);
      remoteFreight.push(clean);
    };

    const ingestComm = (rawData: Record<string, unknown>, docId: string) => {
      if (rawData?._deleted === true) {
        const idKey = String(rawData.id || docId);
        if (idKey) mergedTombs.commission[idKey] = String(rawData.deletedAt || new Date(nowMs).toISOString());
        return;
      }
      const clean = stripCloudMetadata(rawData) as unknown as AddaPendingCommission & { kind?: string };
      delete clean.kind;
      if (!clean.amountPaisa) clean.amountPaisa = toPaisa(Number(clean.amount) || 0);
      remoteComm.push(clean);
    };

    if (legacyFreightSnap) {
      legacyFreightSnap.forEach(d => ingestFreight(d.data() as Record<string, unknown>, d.id));
    }
    if (legacyCommSnap) {
      legacyCommSnap.forEach(d => ingestComm(d.data() as Record<string, unknown>, d.id));
    }
    if (itemsSnap) {
      itemsSnap.forEach(d => {
        const raw = d.data() as Record<string, unknown>;
        if (raw.kind === 'commission' || 'fromWhomName' in raw || String(d.id).startsWith('ac_')) {
          ingestComm(raw, d.id);
        } else {
          ingestFreight(raw, d.id);
        }
      });
    }

    const remoteBills: AddaBillRecord[] = [];
    const ingestBill = (rawData: Record<string, unknown>, docId: string) => {
      if (rawData?._deleted === true) {
        const idKey = String(rawData.id || docId);
        if (idKey) mergedTombs.bills[idKey] = String(rawData.deletedAt || new Date(nowMs).toISOString());
        return;
      }
      remoteBills.push(stripCloudMetadata(rawData) as unknown as AddaBillRecord);
    };
    if (legacyBillsSnap) {
      legacyBillsSnap.forEach(d => ingestBill(d.data() as Record<string, unknown>, d.id));
    }
    if (billsSnap) {
      billsSnap.forEach(d => ingestBill(d.data() as Record<string, unknown>, d.id));
    }

    const remoteParties: AddaPartyRecord[] = [];
    if (partiesSnap) {
      partiesSnap.forEach(d => {
        const raw = d.data() as Record<string, unknown>;
        if (raw?._deleted === true) {
          const idKey = String(raw.id || d.id);
          if (idKey) mergedTombs.parties[idKey] = String(raw.deletedAt || new Date(nowMs).toISOString());
        } else {
          remoteParties.push(stripCloudMetadata(raw) as unknown as AddaPartyRecord);
        }
      });
    }

    writeTombstones(cleanBranch, mergedTombs);

    const mergedFreight = mergeByUpdatedAtLww(localFreight, remoteFreight, mergedTombs.freight);
    const mergedComm = mergeByUpdatedAtLww(localCommissions, remoteComm, mergedTombs.commission);
    const mergedBills = mergeByUpdatedAtLww(localBills, remoteBills, mergedTombs.bills);
    const mergedParties = mergeByUpdatedAtLww(localParties, remoteParties, mergedTombs.parties);

    writeJsonArray(freightKey(cleanBranch), mergedFreight);
    writeJsonArray(commissionKey(cleanBranch), mergedComm);
    writeJsonArray(billsKey(cleanBranch), mergedBills);
    writeJsonArray(partiesKey(cleanBranch), mergedParties);
    safeStorage.setItem(addaCursorKey(cleanBranch), String(nowMs));
    if (!useIncremental) {
      safeStorage.setItem(addaDriftKey(cleanBranch), String(nowMs));
    }
    emitAddaUpdated(cleanBranch);

    return {
      freight: mergedFreight,
      commissions: mergedComm,
      bills: mergedBills,
      parties: mergedParties
    };
  } catch (err) {
    if (isAddaPermissionDeniedError(err)) {
      await clearLocalBranchAndAddaCaches({ preserveBranchesMetadata: true });
      setActiveBranchId(null);
      return { freight: [], commissions: [], bills: [], parties: [] };
    }
    console.warn('[AddaBilling] fetchAddaFromFirestore warning:', err);
    return {
      freight: localFreight,
      commissions: localCommissions,
      bills: localBills,
      parties: localParties
    };
  }
}
