/**
 * Driver Dost - Multi-Branch & Role-Based Staff Access Service
 *
 * Manages:
 * - Branch definitions (immutable branchCode, address, phones, starting Bilty seq, owner Gmail)
 * - Staff membership (`branches/{branchId}/members/{emailKey}`), salutation & permissions
 * - Creator-locked legal identity vs Branch Owner editable profile details
 * - Real-time self-access resolution via collectionGroup('members') without any public user directory
 */

import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  Unsubscribe,
  where,
  writeBatch
} from 'firebase/firestore';
import type {
  BranchConfig,
  BranchPermissions,
  BranchPresetRole,
  BranchSalutation,
  BranchStaffMember,
  UserBranchAccess
} from '../types';
import { auth, db } from './firebase';
import {
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  LEGACY_HEAD_OFFICE_BRANCH_ID,
  filterStaffRosterExcludingCreator,
  getPresetPermissions,
  isHeadOfficeBranchId,
  isOwnerEmail,
  normalizeBranchPermissions,
  normalizeEmail,
  normalizeSalutation
} from './authUtils';
import {
  DEFAULT_HEAD_OFFICE_BRANCH,
  getCachedBranchById,
  getCachedBranches,
  setCachedBranches
} from './branchContext';
import { safeStorage } from './storageCore';

export enum BranchFirestoreOp {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface BranchFirestoreErrorInfo {
  error: string;
  operationType: BranchFirestoreOp;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function buildFirestoreErrorInfo(
  error: unknown,
  operationType: BranchFirestoreOp,
  path: string | null
): BranchFirestoreErrorInfo {
  return {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified
    }
  };
}

function logBranchFirestoreWarning(
  error: unknown,
  operationType: BranchFirestoreOp,
  path: string | null
): void {
  const info = buildFirestoreErrorInfo(error, operationType, path);
  console.warn('[BranchService] Firestore notice:', JSON.stringify(info));
}

function throwBranchFirestoreError(
  error: unknown,
  operationType: BranchFirestoreOp,
  path: string | null
): never {
  const info = buildFirestoreErrorInfo(error, operationType, path);
  console.error('[BranchService] Firestore Error:', JSON.stringify(info));
  throw new Error(JSON.stringify(info));
}

const USER_ACCESS_CACHE_PREFIX = 'wg_user_branch_access_v1_';
const BRANCH_STAFF_CACHE_PREFIX = 'wg_branch_staff_v1_';
const LEGACY_SIGNED_IN_DIR_CACHE_KEY = 'wg_signed_in_directory_v1';

// Clean up any legacy cached directory blob
try {
  safeStorage.removeItem(LEGACY_SIGNED_IN_DIR_CACHE_KEY);
} catch {
  // ignore
}

export function slugifyBranchId(nameEn: string): string {
  const clean = String(nameEn || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
  const suffix = Math.random().toString(36).slice(2, 6);
  return clean ? `${clean}_${suffix}` : `branch_${Date.now()}`;
}

export function normalizeBranchCode(raw?: string | null): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);
}

export function suggestBranchCode(nameEn: string, existingCodes: string[]): string {
  const letters = normalizeBranchCode(
    String(nameEn || '')
      .replace(/[^A-Za-z]/g, '')
  );
  const words = String(nameEn || '')
    .trim()
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);
  let base = '';
  if (words.length >= 2) {
    base = words.map(w => w[0]).join('').replace(/[^A-Z]/g, '').slice(0, 3);
  }
  if (base.length < 2) {
    base = letters.slice(0, 3);
  }
  if (base.length < 2) {
    base = 'BR';
  }
  const taken = new Set(existingCodes.map(c => normalizeBranchCode(c)).filter(Boolean));
  if (!taken.has(base)) return base;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefix2 = base.slice(0, 2);
  for (const ch of alphabet) {
    const candidate = `${prefix2}${ch}`;
    if (!taken.has(candidate)) return candidate;
  }
  return base;
}

export function getCachedUserBranchAccess(email?: string | null): UserBranchAccess | null {
  const clean = normalizeEmail(email);
  if (!clean || isOwnerEmail(clean)) return null;
  try {
    const raw = safeStorage.getItem(`${USER_ACCESS_CACHE_PREFIX}${clean}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserBranchAccess;
    if (!parsed || !parsed.branchId) return null;
    return {
      ...parsed,
      branchId:
        parsed.branchId === LEGACY_HEAD_OFFICE_BRANCH_ID
          ? DEFAULT_HEAD_OFFICE_BRANCH_ID
          : parsed.branchId,
      salutation: normalizeSalutation(parsed.salutation)
    };
  } catch {
    return null;
  }
}

export function setCachedUserBranchAccess(email: string, access: UserBranchAccess | null): void {
  const clean = normalizeEmail(email);
  if (!clean || isOwnerEmail(clean)) return;
  try {
    if (access) {
      safeStorage.setItem(`${USER_ACCESS_CACHE_PREFIX}${clean}`, JSON.stringify(access));
    } else {
      safeStorage.removeItem(`${USER_ACCESS_CACHE_PREFIX}${clean}`);
    }
  } catch {
    // ignore
  }
}

export function getCachedBranchStaff(branchId: string): BranchStaffMember[] {
  const canonical = isHeadOfficeBranchId(branchId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  try {
    const raw =
      safeStorage.getItem(`${BRANCH_STAFF_CACHE_PREFIX}${canonical}`) ||
      (canonical === DEFAULT_HEAD_OFFICE_BRANCH_ID
        ? safeStorage.getItem(`${BRANCH_STAFF_CACHE_PREFIX}${LEGACY_HEAD_OFFICE_BRANCH_ID}`)
        : null);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? filterStaffRosterExcludingCreator(parsed).map(m => ({
          ...m,
          salutation: normalizeSalutation(m.salutation)
        }))
      : [];
  } catch {
    return [];
  }
}

function setCachedBranchStaff(branchId: string, staff: BranchStaffMember[]): void {
  const canonical = isHeadOfficeBranchId(branchId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  const filtered = filterStaffRosterExcludingCreator(staff).map(m => ({
    ...m,
    branchId: canonical,
    salutation: normalizeSalutation(m.salutation)
  }));
  try {
    safeStorage.setItem(`${BRANCH_STAFF_CACHE_PREFIX}${canonical}`, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Ensures the canonical Head Office branch (`branches/head`) exists in Firestore for the App Creator.
 */
export async function ensureHeadOfficeBranchInFirestore(): Promise<void> {
  if (!db || !auth.currentUser || !isOwnerEmail(auth.currentUser.email)) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const headRef = doc(db, 'branches', DEFAULT_HEAD_OFFICE_BRANCH_ID);
  try {
    const snap = await getDoc(headRef);
    if (!snap.exists()) {
      // Carry over custom Head Office profile fields if legacy branches/samundri exists
      let seedProfile: BranchConfig = DEFAULT_HEAD_OFFICE_BRANCH;
      try {
        const legacySnap = await getDoc(doc(db, 'branches', LEGACY_HEAD_OFFICE_BRANCH_ID));
        if (legacySnap.exists()) {
          const legacyData = legacySnap.data() as BranchConfig;
          seedProfile = {
            ...DEFAULT_HEAD_OFFICE_BRANCH,
            ...legacyData,
            id: DEFAULT_HEAD_OFFICE_BRANCH_ID,
            isHeadOffice: true
          };
        }
      } catch {
        // non-fatal legacy lookup
      }

      const nowIso = new Date().toISOString();
      await setDoc(
        headRef,
        {
          ...seedProfile,
          id: DEFAULT_HEAD_OFFICE_BRANCH_ID,
          isHeadOffice: true,
          createdBy: normalizeEmail(auth.currentUser.email),
          createdAt: seedProfile.createdAt || nowIso,
          updatedAt: nowIso
        },
        { merge: true }
      );
    }
  } catch (err) {
    logBranchFirestoreWarning(err, BranchFirestoreOp.WRITE, `branches/${DEFAULT_HEAD_OFFICE_BRANCH_ID}`);
  }
}

/** Backwards-compatible alias */
export const ensureSamundriBranchInFirestore = ensureHeadOfficeBranchInFirestore;

export async function fetchAllBranches(): Promise<BranchConfig[]> {
  if (!db || !auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return getCachedBranches();
  }

  try {
    if (isOwnerEmail(auth.currentUser.email)) {
      const snap = await getDocs(collection(db, 'branches'));
      const list: BranchConfig[] = [];
      snap.forEach(d => {
        const data = d.data() as BranchConfig;
        const docId = d.id;
        // Skip legacy samundri shadow if head exists
        if (docId === LEGACY_HEAD_OFFICE_BRANCH_ID) return;
        if (data && (data.id || docId)) {
          list.push({
            ...data,
            id: data.id || docId,
            startingBiltySeq: Math.max(1001, Number(data.startingBiltySeq) || 1001)
          });
        }
      });
      setCachedBranches(list);
      return getCachedBranches();
    }

    const email = normalizeEmail(auth.currentUser.email);
    const access = getCachedUserBranchAccess(email);
    if (access?.branchId) {
      const bSnap = await getDoc(doc(db, 'branches', access.branchId));
      if (bSnap.exists()) {
        const data = bSnap.data() as BranchConfig;
        const normalized: BranchConfig = {
          ...data,
          id: data.id || bSnap.id,
          startingBiltySeq: Math.max(1001, Number(data.startingBiltySeq) || 1001)
        };
        const existing = getCachedBranches().filter(b => b.id !== normalized.id);
        setCachedBranches([...existing, normalized]);
      }
    }
  } catch (err) {
    logBranchFirestoreWarning(err, BranchFirestoreOp.LIST, 'branches');
  }
  return getCachedBranches();
}

export async function fetchBranchById(branchId: string): Promise<BranchConfig | null> {
  if (!branchId) return null;
  const canonical = isHeadOfficeBranchId(branchId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const snap = await getDoc(doc(db, 'branches', canonical));
      if (snap.exists()) {
        const data = snap.data() as BranchConfig;
        const normalized: BranchConfig = {
          ...data,
          id: data.id || snap.id,
          startingBiltySeq: Math.max(1001, Number(data.startingBiltySeq) || 1001)
        };
        const existing = getCachedBranches().filter(b => b.id !== normalized.id);
        setCachedBranches([...existing, normalized]);
        return normalized;
      }
    } catch (err) {
      logBranchFirestoreWarning(err, BranchFirestoreOp.GET, `branches/${canonical}`);
    }
  }
  return getCachedBranchById(canonical);
}

export function subscribeToBranchesForOwner(
  onUpdate: (branches: BranchConfig[]) => void
): Unsubscribe {
  if (!db || !auth.currentUser || !isOwnerEmail(auth.currentUser.email)) {
    return () => {};
  }
  return onSnapshot(
    collection(db, 'branches'),
    snap => {
      const list: BranchConfig[] = [];
      snap.forEach(d => {
        if (d.id === LEGACY_HEAD_OFFICE_BRANCH_ID) return;
        const data = d.data() as BranchConfig;
        if (data && (data.id || d.id)) {
          list.push({
            ...data,
            id: data.id || d.id,
            startingBiltySeq: Math.max(1001, Number(data.startingBiltySeq) || 1001)
          });
        }
      });
      setCachedBranches(list);
      onUpdate(getCachedBranches());
    },
    err => {
      logBranchFirestoreWarning(err, BranchFirestoreOp.LIST, 'branches');
    }
  );
}

export async function saveBranchConfig(
  input: Omit<BranchConfig, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<BranchConfig> {
  const callerEmail = normalizeEmail(auth.currentUser?.email);
  if (!isOwnerEmail(callerEmail)) {
    throw new Error('Only the App Creator can create or modify branches.');
  }

  const nowIso = new Date().toISOString();
  const rawId = (input.id && input.id.trim()) || slugifyBranchId(input.nameEn || input.nameUr);
  const branchId = isHeadOfficeBranchId(rawId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : rawId;
  const isHead = branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID;
  const existing = getCachedBranchById(branchId);
  const ownerEmailClean = normalizeEmail(input.ownerEmail);
  const effectiveOwnerEmail =
    ownerEmailClean && !isOwnerEmail(ownerEmailClean) ? ownerEmailClean : undefined;

  // Immutable 2-3 uppercase letter branch code for non-Head branches
  let resolvedBranchCode: string | undefined = existing?.branchCode;
  if (!isHead && !resolvedBranchCode) {
    const requested = normalizeBranchCode(input.branchCode);
    const otherCodes = getCachedBranches()
      .filter(b => b.id !== branchId)
      .map(b => normalizeBranchCode(b.branchCode))
      .filter(Boolean);
    if (requested.length >= 2 && requested.length <= 3) {
      if (otherCodes.includes(requested)) {
        throw new Error(`Branch code "${requested}" is already used by another branch.`);
      }
      resolvedBranchCode = requested;
    } else if (input.branchCode && input.branchCode.trim()) {
      throw new Error('Branch code must be 2 to 3 uppercase letters (e.g. LHR, MLT).');
    } else {
      resolvedBranchCode = suggestBranchCode(input.nameEn || input.nameUr, otherCodes);
    }
  }

  const startingSeq = Math.max(1001, Math.min(999999, Math.floor(Number(input.startingBiltySeq) || 1001)));
  const cleanOwnerDisplayName = (input.ownerDisplayName ?? existing?.ownerDisplayName ?? '').trim();

  const branchDoc: BranchConfig = {
    id: branchId,
    ...(!isHead && resolvedBranchCode ? { branchCode: resolvedBranchCode } : {}),
    nameUr: (input.nameUr || '').trim() || input.nameEn.trim(),
    nameEn: (input.nameEn || '').trim() || input.nameUr.trim(),
    addressUr: (input.addressUr || '').trim(),
    addressEn: (input.addressEn || '').trim(),
    phoneNumbers: (input.phoneNumbers || '').trim(),
    ntn: (input.ntn ?? existing?.ntn ?? DEFAULT_HEAD_OFFICE_BRANCH.ntn ?? '7779394-1').trim(),
    ...(input.companyHeaderUr !== undefined
      ? { companyHeaderUr: input.companyHeaderUr.trim() }
      : existing?.companyHeaderUr
      ? { companyHeaderUr: existing.companyHeaderUr }
      : {}),
    ...(input.companyHeaderEn !== undefined
      ? { companyHeaderEn: input.companyHeaderEn.trim() }
      : existing?.companyHeaderEn
      ? { companyHeaderEn: existing.companyHeaderEn }
      : {}),
    ...(input.proprietorNameUr !== undefined
      ? { proprietorNameUr: input.proprietorNameUr.trim() }
      : existing?.proprietorNameUr
      ? { proprietorNameUr: existing.proprietorNameUr }
      : {}),
    ...(input.proprietorNameEn !== undefined
      ? { proprietorNameEn: input.proprietorNameEn.trim() }
      : existing?.proprietorNameEn
      ? { proprietorNameEn: existing.proprietorNameEn }
      : {}),
    ...(input.taglineUr !== undefined
      ? { taglineUr: input.taglineUr.trim() }
      : existing?.taglineUr
      ? { taglineUr: existing.taglineUr }
      : {}),
    startingBiltySeq: startingSeq,
    isHeadOffice: isHead || Boolean(input.isHeadOffice),
    active: input.active !== false,
    ...(effectiveOwnerEmail ? { ownerEmail: effectiveOwnerEmail } : {}),
    ...(cleanOwnerDisplayName ? { ownerDisplayName: cleanOwnerDisplayName } : {}),
    createdBy: existing?.createdBy || callerEmail,
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso
  };

  const merged = [...getCachedBranches().filter(b => b.id !== branchId), branchDoc];
  setCachedBranches(merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('driverdost:company_updated', { detail: branchDoc }));
  }

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const path = `branches/${branchId}`;
    try {
      await setDoc(doc(db, 'branches', branchId), branchDoc, { merge: false });

      // Seed branch-scoped counters if not initialized yet
      const biltyCounterRef = doc(db, 'branches', branchId, 'counters', 'bilty');
      const biltyCounterSnap = await getDoc(biltyCounterRef).catch(() => null);
      if (biltyCounterSnap && !biltyCounterSnap.exists()) {
        const seedVal = Math.max(1000, startingSeq - 1);
        await setDoc(biltyCounterRef, {
          branchId,
          nextSeq: seedVal + 1,
          currentValue: seedVal,
          value: seedVal,
          updatedAt: nowIso
        });
      }

      const billCounterRef = doc(db, 'branches', branchId, 'counters', 'bill');
      const billCounterSnap = await getDoc(billCounterRef).catch(() => null);
      if (billCounterSnap && !billCounterSnap.exists()) {
        await setDoc(billCounterRef, {
          branchId,
          nextSeq: 101,
          currentValue: 100,
          value: 100,
          updatedAt: nowIso
        });
      }

      // If Branch Owner changed or was assigned, sync their membership record cleanly
      if (effectiveOwnerEmail) {
        await upsertBranchStaffMember({
          branch: branchDoc,
          email: effectiveOwnerEmail,
          displayName: cleanOwnerDisplayName || undefined,
          salutation: 'Mr',
          presetRole: 'branch_owner',
          permissions: getPresetPermissions('branch_owner'),
          status: 'active'
        });
      }
    } catch (err) {
      throwBranchFirestoreError(err, BranchFirestoreOp.WRITE, path);
    }
  }

  return branchDoc;
}

export interface BranchCompanyDetailsPatch {
  nameUr?: string;
  nameEn?: string;
  addressUr?: string;
  addressEn?: string;
  phoneNumbers?: string;
  ntn?: string;
  companyHeaderUr?: string;
  companyHeaderEn?: string;
  proprietorNameUr?: string;
  proprietorNameEn?: string;
  taglineUr?: string;
}

/**
 * Updates branch-level contact & display details.
 * Legal fields (`ntn`, legal company headers, proprietor name, tagline) are strictly editable ONLY by App Creator;
 * non-creator Branch Owners may update ONLY branch display name, address, and phone numbers.
 */
export async function saveBranchCompanyDetails(
  branchId: string,
  details: BranchCompanyDetailsPatch
): Promise<BranchConfig> {
  const canonical = isHeadOfficeBranchId(branchId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  const callerEmail = normalizeEmail(auth.currentUser?.email);
  const existing = getCachedBranchById(canonical) || DEFAULT_HEAD_OFFICE_BRANCH;
  const isCreatorCaller = isOwnerEmail(callerEmail);
  const cachedAccess = getCachedUserBranchAccess(callerEmail);
  const isBranchOwnerCaller =
    Boolean(callerEmail) &&
    (normalizeEmail(existing.ownerEmail) === callerEmail ||
      (cachedAccess?.branchId === canonical &&
        cachedAccess?.status === 'active' &&
        cachedAccess?.presetRole === 'branch_owner'));

  if (!isCreatorCaller && !isBranchOwnerCaller) {
    throw new Error('Only the Branch Owner or App Creator can edit branch details.');
  }

  const nowIso = new Date().toISOString();
  const branchEditablePatch: Partial<BranchConfig> & { updatedAt: string } = {
    nameUr: (details.nameUr ?? existing.nameUr).trim() || existing.nameUr,
    nameEn: (details.nameEn ?? existing.nameEn).trim() || existing.nameEn,
    addressUr: (details.addressUr ?? existing.addressUr).trim(),
    addressEn: (details.addressEn ?? existing.addressEn).trim(),
    phoneNumbers: (details.phoneNumbers ?? existing.phoneNumbers).trim(),
    updatedAt: nowIso
  };

  // Legal fields strictly preserved for non-creators; only App Creator may write them
  const firestorePatch: Partial<BranchConfig> & { updatedAt: string } = isCreatorCaller
    ? {
        ...branchEditablePatch,
        ntn: (details.ntn ?? existing.ntn ?? '7779394-1').trim(),
        companyHeaderUr: (details.companyHeaderUr ?? existing.companyHeaderUr ?? '').trim(),
        companyHeaderEn: (details.companyHeaderEn ?? existing.companyHeaderEn ?? '').trim(),
        proprietorNameUr: (details.proprietorNameUr ?? existing.proprietorNameUr ?? '').trim(),
        proprietorNameEn: (details.proprietorNameEn ?? existing.proprietorNameEn ?? '').trim(),
        taglineUr: (details.taglineUr ?? existing.taglineUr ?? '').trim()
      }
    : branchEditablePatch;

  const updatedBranch: BranchConfig = {
    ...existing,
    ...firestorePatch
  };

  const merged = [...getCachedBranches().filter(b => b.id !== canonical), updatedBranch];
  setCachedBranches(merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('driverdost:company_updated', { detail: updatedBranch }));
  }

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const path = `branches/${canonical}`;
    try {
      await setDoc(doc(db, 'branches', canonical), firestorePatch, { merge: true });
    } catch (err) {
      throwBranchFirestoreError(err, BranchFirestoreOp.UPDATE, path);
    }
  }

  return updatedBranch;
}

export async function toggleBranchActive(branchId: string, active: boolean): Promise<void> {
  const existing = getCachedBranchById(branchId);
  if (!existing) return;
  const saved = await saveBranchConfig({
    ...existing,
    active
  });

  // Keep branchActive mirror on members docs in sync so single-get() rules react immediately
  if (db && auth.currentUser && isOwnerEmail(auth.currentUser.email)) {
    try {
      const memSnap = await getDocs(collection(db, 'branches', saved.id, 'members'));
      if (!memSnap.empty) {
        const batch = writeBatch(db);
        const nowIso = new Date().toISOString();
        memSnap.forEach(d => {
          batch.set(d.ref, { branchActive: active, updatedAt: nowIso }, { merge: true });
        });
        await batch.commit();
      }
    } catch (err) {
      logBranchFirestoreWarning(err, BranchFirestoreOp.UPDATE, `branches/${saved.id}/members`);
    }
  }
}

// ---------------------------------------------------------------------------
// Branch Staff Membership Registry (`branches/{branchId}/members/{emailKey}`)
// ---------------------------------------------------------------------------

export async function fetchBranchStaff(branchId: string): Promise<BranchStaffMember[]> {
  const canonical = isHeadOfficeBranchId(branchId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  if (!canonical) return [];
  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const snap = await getDocs(collection(db, 'branches', canonical, 'members'));
      const list: BranchStaffMember[] = [];
      snap.forEach(d => {
        const data = d.data() as BranchStaffMember;
        if (data && data.email && !isOwnerEmail(data.email)) {
          list.push({
            ...data,
            email: normalizeEmail(data.email),
            salutation: normalizeSalutation(data.salutation),
            permissions: normalizeBranchPermissions(data.permissions, data.presetRole)
          });
        }
      });
      setCachedBranchStaff(canonical, list);
      return list;
    } catch (err) {
      logBranchFirestoreWarning(err, BranchFirestoreOp.LIST, `branches/${canonical}/members`);
    }
  }
  return getCachedBranchStaff(canonical);
}

export function subscribeToBranchStaff(
  branchId: string,
  onUpdate: (staff: BranchStaffMember[]) => void
): Unsubscribe {
  const canonical = isHeadOfficeBranchId(branchId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  if (!db || !auth.currentUser || !canonical) return () => {};
  return onSnapshot(
    collection(db, 'branches', canonical, 'members'),
    snap => {
      const list: BranchStaffMember[] = [];
      snap.forEach(d => {
        const data = d.data() as BranchStaffMember;
        if (data && data.email && !isOwnerEmail(data.email)) {
          list.push({
            ...data,
            email: normalizeEmail(data.email),
            salutation: normalizeSalutation(data.salutation),
            permissions: normalizeBranchPermissions(data.permissions, data.presetRole)
          });
        }
      });
      setCachedBranchStaff(canonical, list);
      onUpdate(list);
    },
    err => {
      logBranchFirestoreWarning(err, BranchFirestoreOp.LIST, `branches/${canonical}/members`);
    }
  );
}

export interface UpsertStaffInput {
  branch: BranchConfig;
  email: string;
  displayName?: string;
  salutation?: BranchSalutation;
  uid?: string;
  presetRole: BranchPresetRole;
  permissions: BranchPermissions;
  status?: 'active' | 'revoked';
}

export async function upsertBranchStaffMember(input: UpsertStaffInput): Promise<BranchStaffMember> {
  const emailLower = normalizeEmail(input.email);
  if (!emailLower || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    throw new Error('Please enter a valid Gmail / email address.');
  }
  if (isOwnerEmail(emailLower)) {
    throw new Error('App Creator cannot be added to branch staff rosters.');
  }

  const callerEmail = normalizeEmail(auth.currentUser?.email);
  const callerIsCreator = isOwnerEmail(callerEmail);
  const canonicalBranchId = isHeadOfficeBranchId(input.branch.id)
    ? DEFAULT_HEAD_OFFICE_BRANCH_ID
    : input.branch.id;

  if (!callerIsCreator && input.presetRole === 'branch_owner') {
    throw new Error('Only the App Creator can assign the Branch Owner role.');
  }
  if (!callerIsCreator && emailLower === callerEmail) {
    throw new Error('You cannot modify your own branch membership permissions.');
  }

  const sanitizedPermissions = normalizeBranchPermissions(input.permissions, input.presetRole);
  if (!callerIsCreator) {
    sanitizedPermissions.manageBranchStaff = false;
  }

  const nowIso = new Date().toISOString();
  const existingList = getCachedBranchStaff(canonicalBranchId);
  const prev = existingList.find(s => normalizeEmail(s.email) === emailLower);

  const member: BranchStaffMember = {
    email: emailLower,
    ...(input.uid || prev?.uid ? { uid: input.uid || prev?.uid } : {}),
    displayName: (input.displayName ?? prev?.displayName ?? emailLower.split('@')[0]).trim(),
    salutation: normalizeSalutation(input.salutation ?? prev?.salutation),
    branchId: canonicalBranchId,
    ...(input.branch.branchCode ? { branchCode: input.branch.branchCode } : {}),
    branchNameUr: input.branch.nameUr,
    branchNameEn: input.branch.nameEn,
    ...(input.branch.ownerEmail ? { branchOwnerEmail: normalizeEmail(input.branch.ownerEmail) } : {}),
    branchActive: input.branch.active !== false,
    presetRole: input.presetRole,
    permissions: sanitizedPermissions,
    status: input.status || 'active',
    addedBy: callerEmail || prev?.addedBy || 'owner',
    createdAt: prev?.createdAt || nowIso,
    updatedAt: nowIso
  };

  const nextList = [member, ...existingList.filter(s => normalizeEmail(s.email) !== emailLower)];
  setCachedBranchStaff(canonicalBranchId, nextList);

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const memberPath = `branches/${canonicalBranchId}/members/${emailLower}`;
    try {
      await setDoc(doc(db, 'branches', canonicalBranchId, 'members', emailLower), member, { merge: false });
    } catch (err) {
      throwBranchFirestoreError(err, BranchFirestoreOp.WRITE, memberPath);
    }
  }

  return member;
}

export async function setBranchStaffStatus(
  branch: BranchConfig,
  email: string,
  status: 'active' | 'revoked'
): Promise<BranchStaffMember | null> {
  const emailLower = normalizeEmail(email);
  if (!emailLower || isOwnerEmail(emailLower)) return null;
  const list = getCachedBranchStaff(branch.id);
  const target = list.find(s => normalizeEmail(s.email) === emailLower);
  if (!target) return null;

  return upsertBranchStaffMember({
    branch,
    email: target.email,
    displayName: target.displayName,
    salutation: target.salutation,
    uid: target.uid,
    presetRole: target.presetRole,
    permissions: target.permissions,
    status
  });
}

export async function removeBranchStaffMember(branchId: string, email: string): Promise<void> {
  const emailLower = normalizeEmail(email);
  if (!emailLower || isOwnerEmail(emailLower)) return;
  const canonical = isHeadOfficeBranchId(branchId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;

  const existing = getCachedBranchStaff(canonical);
  setCachedBranchStaff(
    canonical,
    existing.filter(s => normalizeEmail(s.email) !== emailLower)
  );

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const memberPath = `branches/${canonical}/members/${emailLower}`;
    try {
      await deleteDoc(doc(db, 'branches', canonical, 'members', emailLower));
    } catch (err) {
      throwBranchFirestoreError(err, BranchFirestoreOp.DELETE, memberPath);
    }
  }
}

export function subscribeToUserBranchAccess(
  email: string,
  onUpdate: (access: UserBranchAccess | null, branch: BranchConfig | null) => void
): Unsubscribe {
  const emailLower = normalizeEmail(email);
  if (!emailLower || isOwnerEmail(emailLower) || !db || !auth.currentUser) {
    return () => {};
  }

  const membersQuery = query(
    collectionGroup(db, 'members'),
    where('email', '==', emailLower)
  );

  return onSnapshot(
    membersQuery,
    async snap => {
      if (snap.empty) {
        setCachedUserBranchAccess(emailLower, null);
        onUpdate(null, null);
        return;
      }

      // Prefer an active membership if multiple exist, otherwise surface revoked doc
      const docs = snap.docs.map(d => d.data() as UserBranchAccess);
      const chosen =
        docs.find(d => d.status === 'active' && d.branchActive !== false) ||
        docs[0];

      const normalized: UserBranchAccess = {
        ...chosen,
        email: normalizeEmail(chosen.email || emailLower),
        salutation: normalizeSalutation(chosen.salutation),
        branchId:
          chosen.branchId === LEGACY_HEAD_OFFICE_BRANCH_ID
            ? DEFAULT_HEAD_OFFICE_BRANCH_ID
            : chosen.branchId,
        permissions: normalizeBranchPermissions(chosen.permissions, chosen.presetRole)
      };
      setCachedUserBranchAccess(emailLower, normalized);
      const branch =
        normalized.status === 'active' && normalized.branchActive !== false
          ? await fetchBranchById(normalized.branchId)
          : null;
      onUpdate(normalized, branch);
    },
    err => {
      logBranchFirestoreWarning(err, BranchFirestoreOp.GET, `members/${emailLower}`);
    }
  );
}
