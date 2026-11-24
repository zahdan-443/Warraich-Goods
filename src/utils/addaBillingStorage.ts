/**
 * Isolated Adda / Branch Pending Freight, Pending Commission & Party Billing Storage
 *
 * STRICT ISOLATION INVARIANT:
 * - Never writes to or reads from main Dashboard Ledger (`dd_khata_*` / `ledgerStorage.ts`).
 * - Scoped strictly per branchId (`wg_v3_adda_<branchId>_*`) and synced to Firestore under
 *   `branches/{branchId}/addaPendingFreight`, `branches/{branchId}/addaPendingCommissions`,
 *   and `branches/{branchId}/addaBills`.
 */

import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import type {
  AddaBillItemSnapshot,
  AddaBillRecord,
  AddaPendingCommission,
  AddaPendingFreight,
  AddaPendingStatus,
  BranchConfig,
  CompanyProfile
} from '../types';
import { DEFAULT_HEAD_OFFICE_BRANCH_ID } from './authUtils';
import { DEFAULT_SAMUNDRI_BRANCH, getCachedBranchById } from './branchContext';
import { auth, db } from './firebase';
import { getCachedCompanyProfile } from './storage';
import { safeStorage } from './storageCore';

export const ADDA_UPDATED_EVENT = 'driverdost:adda_updated';

function emitAddaUpdated(branchId: string): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADDA_UPDATED_EVENT, { detail: { branchId } }));
  }
}

export function resolveEffectiveAddaBranchId(activeBranch?: BranchConfig | null): string {
  return activeBranch?.id || DEFAULT_HEAD_OFFICE_BRANCH_ID;
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
    if (!raw) return { freight: {}, commission: {}, bills: {} };
    const parsed = JSON.parse(raw);
    return {
      freight: parsed?.freight && typeof parsed.freight === 'object' ? parsed.freight : {},
      commission: parsed?.commission && typeof parsed.commission === 'object' ? parsed.commission : {},
      bills: parsed?.bills && typeof parsed.bills === 'object' ? parsed.bills : {}
    };
  } catch {
    return { freight: {}, commission: {}, bills: {} };
  }
}

function writeTombstones(branchId: string, t: AddaTombstones): void {
  try {
    safeStorage.setItem(tombstonesKey(branchId), JSON.stringify(t));
  } catch {
    // ignore
  }
}

function recordTombstone(
  branchId: string,
  bucket: keyof AddaTombstones,
  id: string
): void {
  const current = readTombstones(branchId);
  current[bucket][id] = new Date().toISOString();
  writeTombstones(branchId, current);
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
  collName: 'addaPendingFreight' | 'addaPendingCommissions' | 'addaBills',
  docId: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!db || !auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  try {
    await setDoc(doc(db, 'branches', branchId, collName, docId), payload, { merge: true });
  } catch (err) {
    console.warn(`[AddaBilling] Sync notice (${collName}/${docId}):`, err);
  }
}

async function deleteAddaDocFromFirestore(
  branchId: string,
  collName: 'addaPendingFreight' | 'addaPendingCommissions' | 'addaBills',
  docId: string
): Promise<void> {
  if (!db || !auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) return;
  try {
    await deleteDoc(doc(db, 'branches', branchId, collName, docId));
    const t = readTombstones(branchId);
    await setDoc(
      doc(db, 'branches', branchId, 'collections', 'tombstones'),
      { addaTombstones: t },
      { merge: true }
    );
  } catch (err) {
    console.warn(`[AddaBilling] Delete notice (${collName}/${docId}):`, err);
  }
}

// ---------------------------------------------------------------------------
// Freight Pending Operations
// ---------------------------------------------------------------------------

export function getAddaPendingFreight(branchId: string): AddaPendingFreight[] {
  return readJsonArray<AddaPendingFreight>(freightKey(branchId));
}

export function saveAddaPendingFreightList(branchId: string, list: AddaPendingFreight[]): void {
  writeJsonArray(freightKey(branchId), list);
  emitAddaUpdated(branchId);
}

export interface UpsertAddaFreightInput {
  id?: string;
  branchId: string;
  biltyId?: number;
  biltyNo: string;
  date: string;
  vehicleNo?: string;
  route?: string;
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
  const branchId = input.branchId || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  const list = getAddaPendingFreight(branchId);
  const nowIso = new Date().toISOString();

  const existing =
    (input.id ? list.find(x => x.id === input.id) : undefined) ||
    (input.biltyId !== undefined
      ? list.find(x => x.biltyId === input.biltyId)
      : undefined) ||
    (input.biltyNo
      ? list.find(
          x =>
            x.biltyNo &&
            input.biltyNo &&
            x.biltyNo.trim().toUpperCase() === input.biltyNo.trim().toUpperCase() &&
            x.biltyId === undefined
        )
      : undefined);

  const id = existing?.id || input.id || `af_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: AddaPendingFreight = {
    id,
    branchId,
    ...(input.biltyId !== undefined ? { biltyId: input.biltyId } : existing?.biltyId !== undefined ? { biltyId: existing.biltyId } : {}),
    biltyNo: (input.biltyNo || existing?.biltyNo || 'MANUAL').trim(),
    date: input.date || existing?.date || new Date().toISOString().slice(0, 10),
    vehicleNo: input.vehicleNo?.trim() || existing?.vehicleNo,
    route: input.route?.trim() || existing?.route,
    partyName: input.partyName.trim(),
    partyMobile: (input.partyMobile || '').trim(),
    amount: Math.max(0, Number(input.amount) || 0),
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
  saveAddaPendingFreightList(branchId, next);
  void pushAddaDocToFirestore(branchId, 'addaPendingFreight', id, record as unknown as Record<string, unknown>);
  return record;
}

export function setAddaFreightStatus(
  branchId: string,
  id: string,
  status: AddaPendingStatus
): AddaPendingFreight | null {
  const list = getAddaPendingFreight(branchId);
  const target = list.find(x => x.id === id);
  if (!target) return null;
  const nowIso = new Date().toISOString();
  const updated: AddaPendingFreight = {
    ...target,
    status,
    ...(status === 'pending' ? { billId: undefined, billNumber: undefined } : {}),
    updatedAt: nowIso
  };
  saveAddaPendingFreightList(
    branchId,
    list.map(x => (x.id === id ? updated : x))
  );
  void pushAddaDocToFirestore(branchId, 'addaPendingFreight', id, updated as unknown as Record<string, unknown>);
  return updated;
}

export function deleteAddaPendingFreight(branchId: string, id: string): void {
  const list = getAddaPendingFreight(branchId);
  const next = list.filter(x => x.id !== id);
  recordTombstone(branchId, 'freight', id);
  saveAddaPendingFreightList(branchId, next);
  void deleteAddaDocFromFirestore(branchId, 'addaPendingFreight', id);
}

// ---------------------------------------------------------------------------
// Commission Pending Operations
// ---------------------------------------------------------------------------

export function getAddaPendingCommissions(branchId: string): AddaPendingCommission[] {
  return readJsonArray<AddaPendingCommission>(commissionKey(branchId));
}

export function saveAddaPendingCommissionsList(branchId: string, list: AddaPendingCommission[]): void {
  writeJsonArray(commissionKey(branchId), list);
  emitAddaUpdated(branchId);
}

export interface UpsertAddaCommissionInput {
  id?: string;
  branchId: string;
  biltyId?: number;
  biltyNo: string;
  date: string;
  vehicleNo?: string;
  route?: string;
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
  const branchId = input.branchId || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  const list = getAddaPendingCommissions(branchId);
  const nowIso = new Date().toISOString();

  const existing =
    (input.id ? list.find(x => x.id === input.id) : undefined) ||
    (input.biltyId !== undefined
      ? list.find(x => x.biltyId === input.biltyId)
      : undefined);

  const id = existing?.id || input.id || `ac_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const record: AddaPendingCommission = {
    id,
    branchId,
    ...(input.biltyId !== undefined ? { biltyId: input.biltyId } : existing?.biltyId !== undefined ? { biltyId: existing.biltyId } : {}),
    biltyNo: (input.biltyNo || existing?.biltyNo || 'MANUAL').trim(),
    date: input.date || existing?.date || new Date().toISOString().slice(0, 10),
    vehicleNo: input.vehicleNo?.trim() || existing?.vehicleNo,
    route: input.route?.trim() || existing?.route,
    fromWhomName: input.fromWhomName.trim(),
    fromWhomMobile: (input.fromWhomMobile || '').trim(),
    amount: Math.max(0, Number(input.amount) || 0),
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
  saveAddaPendingCommissionsList(branchId, next);
  void pushAddaDocToFirestore(branchId, 'addaPendingCommissions', id, record as unknown as Record<string, unknown>);
  return record;
}

export function setAddaCommissionStatus(
  branchId: string,
  id: string,
  status: AddaPendingStatus
): AddaPendingCommission | null {
  const list = getAddaPendingCommissions(branchId);
  const target = list.find(x => x.id === id);
  if (!target) return null;
  const nowIso = new Date().toISOString();
  const updated: AddaPendingCommission = {
    ...target,
    status,
    ...(status === 'pending' ? { billId: undefined, billNumber: undefined } : {}),
    updatedAt: nowIso
  };
  saveAddaPendingCommissionsList(
    branchId,
    list.map(x => (x.id === id ? updated : x))
  );
  void pushAddaDocToFirestore(branchId, 'addaPendingCommissions', id, updated as unknown as Record<string, unknown>);
  return updated;
}

export function deleteAddaPendingCommission(branchId: string, id: string): void {
  const list = getAddaPendingCommissions(branchId);
  const next = list.filter(x => x.id !== id);
  recordTombstone(branchId, 'commission', id);
  saveAddaPendingCommissionsList(branchId, next);
  void deleteAddaDocFromFirestore(branchId, 'addaPendingCommissions', id);
}

// ---------------------------------------------------------------------------
// Party Grouping & Multi-Select Billing Workflow
// ---------------------------------------------------------------------------

export interface AddaPartyPendingGroup {
  partyKey: string;
  partyName: string;
  partyMobile: string;
  freightItems: AddaPendingFreight[];
  commissionItems: AddaPendingCommission[];
  pendingFreightTotal: number;
  pendingCommissionTotal: number;
  totalPendingAmount: number;
}

function normalizePartyKey(name: string): string {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function getPartyPendingGroups(
  branchId: string,
  includeBilled = false
): AddaPartyPendingGroup[] {
  const freight = getAddaPendingFreight(branchId);
  const commissions = getAddaPendingCommissions(branchId);

  const allowedStatuses: AddaPendingStatus[] = includeBilled ? ['pending', 'billed'] : ['pending'];
  const groups = new Map<string, AddaPartyPendingGroup>();

  const ensureGroup = (name: string, mobile: string): AddaPartyPendingGroup => {
    const cleanName = name.trim() || 'Unknown Party';
    const key = normalizePartyKey(cleanName);
    let g = groups.get(key);
    if (!g) {
      g = {
        partyKey: key,
        partyName: cleanName,
        partyMobile: mobile.trim(),
        freightItems: [],
        commissionItems: [],
        pendingFreightTotal: 0,
        pendingCommissionTotal: 0,
        totalPendingAmount: 0
      };
      groups.set(key, g);
    } else if (!g.partyMobile && mobile.trim()) {
      g.partyMobile = mobile.trim();
    }
    return g;
  };

  for (const item of freight) {
    if (!allowedStatuses.includes(item.status)) continue;
    const g = ensureGroup(item.partyName, item.partyMobile);
    g.freightItems.push(item);
    g.pendingFreightTotal += Number(item.amount) || 0;
  }

  for (const item of commissions) {
    if (!allowedStatuses.includes(item.status)) continue;
    const g = ensureGroup(item.fromWhomName, item.fromWhomMobile);
    g.commissionItems.push(item);
    g.pendingCommissionTotal += Number(item.amount) || 0;
  }

  for (const g of groups.values()) {
    g.totalPendingAmount = g.pendingFreightTotal + g.pendingCommissionTotal;
  }

  return Array.from(groups.values()).sort((a, b) => b.totalPendingAmount - a.totalPendingAmount);
}

// ---------------------------------------------------------------------------
// Adda Bills Operations (Pending -> Billed -> Paid)
// ---------------------------------------------------------------------------

export function getAddaBills(branchId: string): AddaBillRecord[] {
  return readJsonArray<AddaBillRecord>(billsKey(branchId));
}

function saveAddaBillsList(branchId: string, list: AddaBillRecord[]): void {
  writeJsonArray(billsKey(branchId), list);
  emitAddaUpdated(branchId);
}

export function allocateNextAddaBillNumber(branchId: string): string {
  const existing = getAddaBills(branchId);
  let seq = 1;
  try {
    const saved = Number(safeStorage.getItem(billSeqKey(branchId)) || '0');
    if (saved > 0) seq = saved + 1;
  } catch {}
  for (const b of existing) {
    const m = String(b.billNumber || '').match(/(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= seq) seq = n + 1;
    }
  }
  try {
    safeStorage.setItem(billSeqKey(branchId), String(seq));
  } catch {}
  return `BILL-${String(seq).padStart(3, '0')}`;
}

export interface CreateAddaBillInput {
  branchId: string;
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

export function createAddaBillFromPendingItems(input: CreateAddaBillInput): AddaBillRecord {
  const branchId = input.branchId || DEFAULT_HEAD_OFFICE_BRANCH_ID;
  const freightList = getAddaPendingFreight(branchId);
  const commissionList = getAddaPendingCommissions(branchId);

  const selectedFreight = freightList.filter(f => input.selectedFreightIds.includes(f.id));
  const selectedCommission = commissionList.filter(c => input.selectedCommissionIds.includes(c.id));

  if (selectedFreight.length === 0 && selectedCommission.length === 0) {
    throw new Error('Select at least one pending freight or commission item to generate a bill.');
  }

  const billId = `ab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const billNumber = allocateNextAddaBillNumber(branchId);
  const nowIso = new Date().toISOString();
  const billDate = input.date || nowIso.slice(0, 10);

  const items: AddaBillItemSnapshot[] = [
    ...selectedFreight.map(f => ({
      itemId: f.id,
      itemType: 'freight' as const,
      biltyNo: f.biltyNo,
      date: f.date,
      vehicleNo: f.vehicleNo,
      route: f.route,
      description: `Freight${f.route ? ` (${f.route})` : ''}${f.notes ? ` - ${f.notes}` : ''}`,
      amount: Math.max(0, Number(f.amount) || 0)
    })),
    ...selectedCommission.map(c => ({
      itemId: c.id,
      itemType: 'commission' as const,
      biltyNo: c.biltyNo,
      date: c.date,
      vehicleNo: c.vehicleNo,
      route: c.route,
      description: `Commission${c.route ? ` (${c.route})` : ''}${c.notes ? ` - ${c.notes}` : ''}`,
      amount: Math.max(0, Number(c.amount) || 0)
    }))
  ];

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  const extraCharges = Math.max(0, Number(input.extraCharges) || 0);
  const discount = Math.max(0, Number(input.discount) || 0);
  const totalAmount = Math.max(0, subtotal + extraCharges - discount);

  const resolvedCo = resolveEffectiveCompanyDetails(input.branchConfig, input.companyProfile);

  const bill: AddaBillRecord = {
    id: billId,
    branchId,
    billNumber,
    date: billDate,
    partyName: input.partyName.trim(),
    partyMobile: input.partyMobile?.trim() || undefined,
    items,
    subtotal,
    extraCharges,
    discount,
    totalAmount,
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

  // Mark selected items as 'billed' atomically
  const nextFreight = freightList.map(f =>
    input.selectedFreightIds.includes(f.id)
      ? { ...f, status: 'billed' as const, billId, billNumber, updatedAt: nowIso }
      : f
  );
  const nextCommissions = commissionList.map(c =>
    input.selectedCommissionIds.includes(c.id)
      ? { ...c, status: 'billed' as const, billId, billNumber, updatedAt: nowIso }
      : c
  );
  const nextBills = [bill, ...getAddaBills(branchId)];

  writeJsonArray(freightKey(branchId), nextFreight);
  writeJsonArray(commissionKey(branchId), nextCommissions);
  writeJsonArray(billsKey(branchId), nextBills);
  emitAddaUpdated(branchId);

  // Sync batch to Firestore
  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'branches', branchId, 'addaBills', billId), bill, { merge: true });
      for (const f of nextFreight.filter(x => input.selectedFreightIds.includes(x.id))) {
        batch.set(doc(db, 'branches', branchId, 'addaPendingFreight', f.id), f, { merge: true });
      }
      for (const c of nextCommissions.filter(x => input.selectedCommissionIds.includes(x.id))) {
        batch.set(doc(db, 'branches', branchId, 'addaPendingCommissions', c.id), c, { merge: true });
      }
      void batch.commit().catch(err => console.warn('[AddaBilling] Bill batch sync warning:', err));
    } catch (err) {
      console.warn('[AddaBilling] Bill batch init warning:', err);
    }
  }

  return bill;
}

export function markAddaBillPaid(branchId: string, billId: string): AddaBillRecord | null {
  const bills = getAddaBills(branchId);
  const target = bills.find(b => b.id === billId);
  if (!target) return null;

  const nowIso = new Date().toISOString();
  const updatedBill: AddaBillRecord = {
    ...target,
    status: 'paid',
    paidAt: nowIso,
    updatedAt: nowIso
  };

  const freightIds = new Set(target.items.filter(i => i.itemType === 'freight').map(i => i.itemId));
  const commissionIds = new Set(target.items.filter(i => i.itemType === 'commission').map(i => i.itemId));

  const freightList = getAddaPendingFreight(branchId);
  const commissionList = getAddaPendingCommissions(branchId);

  const nextFreight = freightList.map(f =>
    freightIds.has(f.id) || f.billId === billId
      ? { ...f, status: 'paid' as const, updatedAt: nowIso }
      : f
  );
  const nextCommissions = commissionList.map(c =>
    commissionIds.has(c.id) || c.billId === billId
      ? { ...c, status: 'paid' as const, updatedAt: nowIso }
      : c
  );

  writeJsonArray(freightKey(branchId), nextFreight);
  writeJsonArray(commissionKey(branchId), nextCommissions);
  writeJsonArray(
    billsKey(branchId),
    bills.map(b => (b.id === billId ? updatedBill : b))
  );
  emitAddaUpdated(branchId);

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'branches', branchId, 'addaBills', billId), updatedBill, { merge: true });
      for (const f of nextFreight.filter(x => freightIds.has(x.id) || x.billId === billId)) {
        batch.set(doc(db, 'branches', branchId, 'addaPendingFreight', f.id), f, { merge: true });
      }
      for (const c of nextCommissions.filter(x => commissionIds.has(x.id) || x.billId === billId)) {
        batch.set(doc(db, 'branches', branchId, 'addaPendingCommissions', c.id), c, { merge: true });
      }
      void batch.commit().catch(() => {});
    } catch {}
  }

  return updatedBill;
}

export function deleteAddaBill(branchId: string, billId: string): void {
  const bills = getAddaBills(branchId);
  const target = bills.find(b => b.id === billId);
  const nowIso = new Date().toISOString();

  // Revert linked items back to pending if they were only 'billed' under this bill
  if (target) {
    const freightList = getAddaPendingFreight(branchId);
    const commissionList = getAddaPendingCommissions(branchId);
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
    writeJsonArray(freightKey(branchId), nextFreight);
    writeJsonArray(commissionKey(branchId), nextCommissions);

    if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
      try {
        const batch = writeBatch(db);
        for (const f of nextFreight.filter(x => x.updatedAt === nowIso)) {
          batch.set(doc(db, 'branches', branchId, 'addaPendingFreight', f.id), f, { merge: true });
        }
        for (const c of nextCommissions.filter(x => x.updatedAt === nowIso)) {
          batch.set(doc(db, 'branches', branchId, 'addaPendingCommissions', c.id), c, { merge: true });
        }
        void batch.commit().catch(() => {});
      } catch {}
    }
  }

  recordTombstone(branchId, 'bills', billId);
  saveAddaBillsList(
    branchId,
    bills.filter(b => b.id !== billId)
  );
  void deleteAddaDocFromFirestore(branchId, 'addaBills', billId);
}

// ---------------------------------------------------------------------------
// Cloud Synchronization (LWW Merge)
// ---------------------------------------------------------------------------

export async function fetchAddaFromFirestore(branchId: string): Promise<{
  freight: AddaPendingFreight[];
  commissions: AddaPendingCommission[];
  bills: AddaBillRecord[];
}> {
  const localFreight = getAddaPendingFreight(branchId);
  const localCommissions = getAddaPendingCommissions(branchId);
  const localBills = getAddaBills(branchId);

  if (!db || !auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return { freight: localFreight, commissions: localCommissions, bills: localBills };
  }

  try {
    const localTombs = readTombstones(branchId);
    const [tombSnap, freightSnap, commSnap, billsSnap] = await Promise.all([
      getDoc(doc(db, 'branches', branchId, 'collections', 'tombstones')).catch(() => null),
      getDocs(collection(db, 'branches', branchId, 'addaPendingFreight')),
      getDocs(collection(db, 'branches', branchId, 'addaPendingCommissions')),
      getDocs(collection(db, 'branches', branchId, 'addaBills'))
    ]);

    const remoteTombs = (tombSnap && tombSnap.exists() ? tombSnap.data()?.addaTombstones : null) || {};
    const mergedTombs: AddaTombstones = {
      freight: { ...(remoteTombs.freight || {}), ...localTombs.freight },
      commission: { ...(remoteTombs.commission || {}), ...localTombs.commission },
      bills: { ...(remoteTombs.bills || {}), ...localTombs.bills }
    };
    writeTombstones(branchId, mergedTombs);

    const remoteFreight: AddaPendingFreight[] = [];
    freightSnap.forEach(d => remoteFreight.push(d.data() as AddaPendingFreight));
    const remoteComm: AddaPendingCommission[] = [];
    commSnap.forEach(d => remoteComm.push(d.data() as AddaPendingCommission));
    const remoteBills: AddaBillRecord[] = [];
    billsSnap.forEach(d => remoteBills.push(d.data() as AddaBillRecord));

    const mergedFreight = mergeByUpdatedAtLww(localFreight, remoteFreight, mergedTombs.freight);
    const mergedComm = mergeByUpdatedAtLww(localCommissions, remoteComm, mergedTombs.commission);
    const mergedBills = mergeByUpdatedAtLww(localBills, remoteBills, mergedTombs.bills);

    writeJsonArray(freightKey(branchId), mergedFreight);
    writeJsonArray(commissionKey(branchId), mergedComm);
    writeJsonArray(billsKey(branchId), mergedBills);
    emitAddaUpdated(branchId);

    return {
      freight: mergedFreight,
      commissions: mergedComm,
      bills: mergedBills
    };
  } catch (err) {
    console.warn('[AddaBilling] fetchAddaFromFirestore warning:', err);
    return { freight: localFreight, commissions: localCommissions, bills: localBills };
  }
}
