/**
 * Driver Dost - Multi-Branch & Role-Based Staff Access Service
 *
 * Manages:
 * - Branch definitions (address, phone numbers, starting Bilty number, owner Gmail)
 * - Staff assignments & preset/custom module permissions per branch
 * - Signed-in Gmail user directory (strictly excluding App Creator from other branches)
 * - Real-time access resolution & immediate revocation support
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import type {
  BranchConfig,
  BranchPermissions,
  BranchPresetRole,
  BranchStaffMember,
  UserBranchAccess
} from '../types';
import { auth, db } from './firebase';
import {
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  filterStaffRosterExcludingCreator,
  getPresetPermissions,
  isOwnerEmail,
  normalizeBranchPermissions,
  normalizeEmail
} from './authUtils';
import {
  DEFAULT_SAMUNDRI_BRANCH,
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

export interface SignedInDirectoryEntry {
  email: string;
  uid?: string;
  displayName?: string;
  lastLogin?: string;
}

const USER_ACCESS_CACHE_PREFIX = 'wg_user_branch_access_v1_';
const BRANCH_STAFF_CACHE_PREFIX = 'wg_branch_staff_v1_';
const SIGNED_IN_DIR_CACHE_KEY = 'wg_signed_in_directory_v1';

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

export function getCachedUserBranchAccess(email?: string | null): UserBranchAccess | null {
  const clean = normalizeEmail(email);
  if (!clean || isOwnerEmail(clean)) return null;
  try {
    const raw = safeStorage.getItem(`${USER_ACCESS_CACHE_PREFIX}${clean}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserBranchAccess;
    return parsed && parsed.branchId ? parsed : null;
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
  try {
    const raw = safeStorage.getItem(`${BRANCH_STAFF_CACHE_PREFIX}${branchId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? filterStaffRosterExcludingCreator(parsed) : [];
  } catch {
    return [];
  }
}

function setCachedBranchStaff(branchId: string, staff: BranchStaffMember[]): void {
  const filtered = filterStaffRosterExcludingCreator(staff);
  try {
    safeStorage.setItem(`${BRANCH_STAFF_CACHE_PREFIX}${branchId}`, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

/**
 * Ensures the Samundri Head Office branch document exists in Firestore for the App Owner.
 */
export async function ensureSamundriBranchInFirestore(): Promise<void> {
  if (!db || !auth.currentUser || !isOwnerEmail(auth.currentUser.email)) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const ref = doc(db, 'branches', DEFAULT_HEAD_OFFICE_BRANCH_ID);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const nowIso = new Date().toISOString();
      await setDoc(
        ref,
        {
          ...DEFAULT_SAMUNDRI_BRANCH,
          createdBy: normalizeEmail(auth.currentUser.email),
          createdAt: nowIso,
          updatedAt: nowIso
        },
        { merge: true }
      );
    }
  } catch (err) {
    logBranchFirestoreWarning(err, BranchFirestoreOp.WRITE, `branches/${DEFAULT_HEAD_OFFICE_BRANCH_ID}`);
  }
}

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
        if (data && (data.id || d.id)) {
          list.push({
            ...data,
            id: data.id || d.id,
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
  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const snap = await getDoc(doc(db, 'branches', branchId));
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
      logBranchFirestoreWarning(err, BranchFirestoreOp.GET, `branches/${branchId}`);
    }
  }
  return getCachedBranchById(branchId);
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
    throw new Error('Only the App Owner can create or modify branches.');
  }

  const nowIso = new Date().toISOString();
  const branchId = (input.id && input.id.trim()) || slugifyBranchId(input.nameEn || input.nameUr);
  const existing = getCachedBranchById(branchId);
  const ownerEmailClean = normalizeEmail(input.ownerEmail);
  // App Creator is never listed as a branch staff member inside other branches
  const effectiveOwnerEmail =
    ownerEmailClean && !isOwnerEmail(ownerEmailClean) ? ownerEmailClean : undefined;

  const startingSeq = Math.max(1001, Math.min(999999, Math.floor(Number(input.startingBiltySeq) || 1001)));
  const cleanOwnerDisplayName = (input.ownerDisplayName ?? existing?.ownerDisplayName ?? '').trim();

  const branchDoc: BranchConfig = {
    id: branchId,
    nameUr: (input.nameUr || '').trim() || input.nameEn.trim(),
    nameEn: (input.nameEn || '').trim() || input.nameUr.trim(),
    addressUr: (input.addressUr || '').trim(),
    addressEn: (input.addressEn || '').trim(),
    phoneNumbers: (input.phoneNumbers || '').trim(),
    ntn: (input.ntn ?? existing?.ntn ?? DEFAULT_SAMUNDRI_BRANCH.ntn ?? '7779394-1').trim(),
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
    isHeadOffice: branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID || Boolean(input.isHeadOffice),
    active: input.active !== false,
    ...(effectiveOwnerEmail ? { ownerEmail: effectiveOwnerEmail } : {}),
    ...(cleanOwnerDisplayName ? { ownerDisplayName: cleanOwnerDisplayName } : {}),
    createdBy: existing?.createdBy || callerEmail,
    createdAt: existing?.createdAt || nowIso,
    updatedAt: nowIso
  };

  // Update local cache immediately
  const merged = [...getCachedBranches().filter(b => b.id !== branchId), branchDoc];
  setCachedBranches(merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('driverdost:company_updated', { detail: branchDoc }));
  }

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const path = `branches/${branchId}`;
    try {
      await setDoc(doc(db, 'branches', branchId), branchDoc, { merge: false });

      // Seed branch counter if not already initialized
      const counterId =
        branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID ? 'biltyCounter' : `branch_${branchId}_bilty`;
      const counterRef = doc(db, 'counters', counterId);
      const counterSnap = await getDoc(counterRef);
      if (!counterSnap.exists()) {
        const seedVal = Math.max(0, startingSeq - 1);
        await setDoc(
          counterRef,
          {
            currentValue: seedVal,
            value: seedVal,
            updatedAt: nowIso
          },
          { merge: true }
        );
      }

      // If a Branch Owner email is assigned, automatically grant them branch_owner staff access
      if (effectiveOwnerEmail) {
        await upsertBranchStaffMember({
          branch: branchDoc,
          email: effectiveOwnerEmail,
          displayName: cleanOwnerDisplayName || undefined,
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
 * Updates branch-level Company Details (Header Name, Proprietor, NTN, Address, Phones)
 * used live on Printed Bilties & Adda Bills.
 * Allowed for App Creator on any branch OR Branch Owner on their own branch.
 */
export async function saveBranchCompanyDetails(
  branchId: string,
  details: BranchCompanyDetailsPatch
): Promise<BranchConfig> {
  const callerEmail = normalizeEmail(auth.currentUser?.email);
  const existing = getCachedBranchById(branchId) || DEFAULT_SAMUNDRI_BRANCH;
  const cachedAccess = getCachedUserBranchAccess(callerEmail);
  const isBranchOwnerCaller =
    Boolean(callerEmail) &&
    (normalizeEmail(existing.ownerEmail) === callerEmail ||
      (cachedAccess?.branchId === branchId &&
        cachedAccess?.status === 'active' &&
        cachedAccess?.presetRole === 'branch_owner'));

  if (!isOwnerEmail(callerEmail) && !isBranchOwnerCaller) {
    throw new Error('Only the Branch Owner or App Creator can edit company details.');
  }

  const nowIso = new Date().toISOString();
  const safePatch: BranchCompanyDetailsPatch & { updatedAt: string } = {
    nameUr: (details.nameUr ?? existing.nameUr).trim() || existing.nameUr,
    nameEn: (details.nameEn ?? existing.nameEn).trim() || existing.nameEn,
    addressUr: (details.addressUr ?? existing.addressUr).trim(),
    addressEn: (details.addressEn ?? existing.addressEn).trim(),
    phoneNumbers: (details.phoneNumbers ?? existing.phoneNumbers).trim(),
    ntn: (details.ntn ?? existing.ntn ?? '7779394-1').trim(),
    companyHeaderUr: (details.companyHeaderUr ?? existing.companyHeaderUr ?? '').trim(),
    companyHeaderEn: (details.companyHeaderEn ?? existing.companyHeaderEn ?? '').trim(),
    proprietorNameUr: (details.proprietorNameUr ?? existing.proprietorNameUr ?? '').trim(),
    proprietorNameEn: (details.proprietorNameEn ?? existing.proprietorNameEn ?? '').trim(),
    taglineUr: (details.taglineUr ?? existing.taglineUr ?? '').trim(),
    updatedAt: nowIso
  };

  const updatedBranch: BranchConfig = {
    ...existing,
    ...safePatch
  };

  const merged = [...getCachedBranches().filter(b => b.id !== branchId), updatedBranch];
  setCachedBranches(merged);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('driverdost:company_updated', { detail: updatedBranch }));
  }

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const path = `branches/${branchId}`;
    try {
      await setDoc(doc(db, 'branches', branchId), safePatch, { merge: true });
    } catch (err) {
      throwBranchFirestoreError(err, BranchFirestoreOp.UPDATE, path);
    }
  }

  return updatedBranch;
}

export async function toggleBranchActive(branchId: string, active: boolean): Promise<void> {
  const existing = getCachedBranchById(branchId);
  if (!existing) return;
  await saveBranchConfig({
    ...existing,
    active
  });
}

// ---------------------------------------------------------------------------
// Branch Staff & User Access Registry
// ---------------------------------------------------------------------------

export async function fetchBranchStaff(branchId: string): Promise<BranchStaffMember[]> {
  if (!branchId) return [];
  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const snap = await getDocs(collection(db, 'branches', branchId, 'staff'));
      const list: BranchStaffMember[] = [];
      snap.forEach(d => {
        const data = d.data() as BranchStaffMember;
        if (data && data.email && !isOwnerEmail(data.email)) {
          list.push({
            ...data,
            email: normalizeEmail(data.email),
            permissions: normalizeBranchPermissions(data.permissions, data.presetRole)
          });
        }
      });
      setCachedBranchStaff(branchId, list);
      return list;
    } catch (err) {
      logBranchFirestoreWarning(err, BranchFirestoreOp.LIST, `branches/${branchId}/staff`);
    }
  }
  return getCachedBranchStaff(branchId);
}

export function subscribeToBranchStaff(
  branchId: string,
  onUpdate: (staff: BranchStaffMember[]) => void
): Unsubscribe {
  if (!db || !auth.currentUser || !branchId) return () => {};
  return onSnapshot(
    collection(db, 'branches', branchId, 'staff'),
    snap => {
      const list: BranchStaffMember[] = [];
      snap.forEach(d => {
        const data = d.data() as BranchStaffMember;
        if (data && data.email && !isOwnerEmail(data.email)) {
          list.push({
            ...data,
            email: normalizeEmail(data.email),
            permissions: normalizeBranchPermissions(data.permissions, data.presetRole)
          });
        }
      });
      setCachedBranchStaff(branchId, list);
      onUpdate(list);
    },
    err => {
      logBranchFirestoreWarning(err, BranchFirestoreOp.LIST, `branches/${branchId}/staff`);
    }
  );
}

export interface UpsertStaffInput {
  branch: BranchConfig;
  email: string;
  displayName?: string;
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
  const nowIso = new Date().toISOString();
  const existingList = getCachedBranchStaff(input.branch.id);
  const prev = existingList.find(s => normalizeEmail(s.email) === emailLower);

  const member: BranchStaffMember = {
    email: emailLower,
    ...(input.uid || prev?.uid ? { uid: input.uid || prev?.uid } : {}),
    displayName: (input.displayName ?? prev?.displayName ?? emailLower.split('@')[0]).trim(),
    branchId: input.branch.id,
    branchNameUr: input.branch.nameUr,
    branchNameEn: input.branch.nameEn,
    ...(input.branch.ownerEmail ? { branchOwnerEmail: normalizeEmail(input.branch.ownerEmail) } : {}),
    presetRole: input.presetRole,
    permissions: normalizeBranchPermissions(input.permissions, input.presetRole),
    status: input.status || 'active',
    addedBy: callerEmail || prev?.addedBy || 'owner',
    createdAt: prev?.createdAt || nowIso,
    updatedAt: nowIso
  };

  // Update local cache
  const nextList = [member, ...existingList.filter(s => normalizeEmail(s.email) !== emailLower)];
  setCachedBranchStaff(input.branch.id, nextList);

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const staffPath = `branches/${input.branch.id}/staff/${emailLower}`;
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'branches', input.branch.id, 'staff', emailLower), member);
      batch.set(doc(db, 'userBranchAccess', emailLower), member);
      await batch.commit();
    } catch (err) {
      throwBranchFirestoreError(err, BranchFirestoreOp.WRITE, staffPath);
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
    uid: target.uid,
    presetRole: target.presetRole,
    permissions: target.permissions,
    status
  });
}

export async function removeBranchStaffMember(branchId: string, email: string): Promise<void> {
  const emailLower = normalizeEmail(email);
  if (!emailLower || isOwnerEmail(emailLower)) return;

  const existing = getCachedBranchStaff(branchId);
  setCachedBranchStaff(
    branchId,
    existing.filter(s => normalizeEmail(s.email) !== emailLower)
  );

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    const staffPath = `branches/${branchId}/staff/${emailLower}`;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'branches', branchId, 'staff', emailLower));
      batch.delete(doc(db, 'userBranchAccess', emailLower));
      await batch.commit();
    } catch (err) {
      // Fallback to sequential delete if batch fails on missing userBranchAccess
      try {
        await deleteDoc(doc(db, 'branches', branchId, 'staff', emailLower));
        await deleteDoc(doc(db, 'userBranchAccess', emailLower)).catch(() => {});
      } catch (innerErr) {
        throwBranchFirestoreError(innerErr, BranchFirestoreOp.DELETE, staffPath);
      }
      logBranchFirestoreWarning(err, BranchFirestoreOp.DELETE, staffPath);
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

  return onSnapshot(
    doc(db, 'userBranchAccess', emailLower),
    async snap => {
      if (!snap.exists()) {
        setCachedUserBranchAccess(emailLower, null);
        onUpdate(null, null);
        return;
      }
      const data = snap.data() as UserBranchAccess;
      const normalized: UserBranchAccess = {
        ...data,
        email: normalizeEmail(data.email || emailLower),
        permissions: normalizeBranchPermissions(data.permissions, data.presetRole)
      };
      setCachedUserBranchAccess(emailLower, normalized);
      const branch = await fetchBranchById(normalized.branchId);
      onUpdate(normalized, branch);
    },
    err => {
      logBranchFirestoreWarning(err, BranchFirestoreOp.GET, `userBranchAccess/${emailLower}`);
    }
  );
}

// ---------------------------------------------------------------------------
// Signed-In Gmail Directory (Strictly Excludes App Creator)
// ---------------------------------------------------------------------------

export async function recordSignedInDirectoryUser(entry: {
  uid: string;
  email: string;
  displayName?: string;
}): Promise<void> {
  const emailLower = normalizeEmail(entry.email);
  if (!emailLower || isOwnerEmail(emailLower)) return;
  if (!db || !auth.currentUser || (typeof navigator !== 'undefined' && !navigator.onLine)) return;

  const payload: SignedInDirectoryEntry = {
    email: emailLower,
    uid: entry.uid,
    displayName: (entry.displayName || emailLower.split('@')[0]).trim().slice(0, 100),
    lastLogin: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'signedInDirectory', emailLower), payload, { merge: true });
  } catch (err) {
    logBranchFirestoreWarning(err, BranchFirestoreOp.WRITE, `signedInDirectory/${emailLower}`);
  }
}

export async function fetchSignedInDirectoryUsers(): Promise<SignedInDirectoryEntry[]> {
  let cached: SignedInDirectoryEntry[] = [];
  try {
    const raw = safeStorage.getItem(SIGNED_IN_DIR_CACHE_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch {
    cached = [];
  }

  if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
    try {
      const snap = await getDocs(collection(db, 'signedInDirectory'));
      const list: SignedInDirectoryEntry[] = [];
      snap.forEach(d => {
        const data = d.data() as SignedInDirectoryEntry;
        if (data && data.email && !isOwnerEmail(data.email)) {
          list.push({
            email: normalizeEmail(data.email),
            uid: data.uid,
            displayName: data.displayName,
            lastLogin: data.lastLogin
          });
        }
      });
      list.sort((a, b) => String(b.lastLogin || '').localeCompare(String(a.lastLogin || '')));
      try {
        safeStorage.setItem(SIGNED_IN_DIR_CACHE_KEY, JSON.stringify(list));
      } catch {}
      return list;
    } catch (err) {
      logBranchFirestoreWarning(err, BranchFirestoreOp.LIST, 'signedInDirectory');
    }
  }

  return filterStaffRosterExcludingCreator(cached);
}
