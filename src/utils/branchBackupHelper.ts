import type {
  AddaBillRecord,
  AddaPendingCommission,
  AddaPendingFreight,
  BiltyRecord,
  BranchConfig
} from '../types';
import {
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  LEGACY_HEAD_OFFICE_BRANCH_ID,
  isOwnerEmail,
  normalizeEmail
} from './authUtils';
import {
  getActiveBranchId,
  getCachedBranchById,
  getCachedBranches,
  isUsingSharedBranchScope,
  setCachedBranches
} from './branchContext';
import { getCachedUserBranchAccess } from './branchService';
import { getScopedStorageKey } from './calculator';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { safeStorage } from './storageCore';
import {
  applyRestoredCollection,
  clampMutationIso,
  getEntitySyncKey,
  getStoredBilties,
  getTombstones,
  saveTombstones,
  syncToFirestore
} from './storageSync';
import {
  clearAddaTombstonesForIds,
  getAddaBills,
  getAddaPendingCommissions,
  getAddaPendingFreight,
  saveAddaBillsList,
  saveAddaPendingCommissionsList,
  saveAddaPendingFreightList
} from './addaBillingStorage';

export interface BranchBackupSlice {
  branchId?: string;
  config: BranchConfig;
  bilties: BiltyRecord[];
  addaFreight: AddaPendingFreight[];
  addaCommissions: AddaPendingCommission[];
  addaBills: AddaBillRecord[];
}

export interface BranchBackupAuthority {
  role: 'creator' | 'branch_owner' | 'none';
  allowAllBranches: boolean;
  allowedBranchId: string | null;
}

export function resolveBranchBackupAuthority(): BranchBackupAuthority {
  const email = auth.currentUser?.email || safeStorage.getItem('ah-gmail-user');
  if (isOwnerEmail(email)) {
    return { role: 'creator', allowAllBranches: true, allowedBranchId: null };
  }
  if (!email) {
    return { role: 'none', allowAllBranches: false, allowedBranchId: null };
  }

  const access = getCachedUserBranchAccess(email);
  const activeBranchId = getActiveBranchId();
  if (access && access.status === 'active') {
    const cleanBranchId =
      access.branchId === LEGACY_HEAD_OFFICE_BRANCH_ID
        ? DEFAULT_HEAD_OFFICE_BRANCH_ID
        : access.branchId;
    if (!activeBranchId || activeBranchId === cleanBranchId) {
      const branch = getCachedBranchById(cleanBranchId);
      const isBranchOwner =
        access.presetRole === 'branch_owner' ||
        (branch !== null && normalizeEmail(branch.ownerEmail) === normalizeEmail(email));
      if (isBranchOwner) {
        return {
          role: 'branch_owner',
          allowAllBranches: false,
          allowedBranchId: cleanBranchId
        };
      }
    }
  }

  return { role: 'none', allowAllBranches: false, allowedBranchId: null };
}

function stripLegalVaultFromBilties(bilties: BiltyRecord[]): BiltyRecord[] {
  return bilties.map(b => {
    if (!b || !('legalVault' in b)) return b;
    const copy = { ...b };
    delete copy.legalVault;
    return copy;
  });
}

function readBiltiesForSpecificBranch(
  branchId: string,
  authority: BranchBackupAuthority
): BiltyRecord[] {
  const cleanId =
    branchId === LEGACY_HEAD_OFFICE_BRANCH_ID ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  const email = auth.currentUser?.email || safeStorage.getItem('ah-gmail-user');
  if (
    cleanId === DEFAULT_HEAD_OFFICE_BRANCH_ID &&
    authority.role === 'creator' &&
    !isUsingSharedBranchScope(email)
  ) {
    return stripLegalVaultFromBilties(getStoredBilties());
  }

  try {
    const raw = safeStorage.getItem(getScopedStorageKey('bilties', `branch_${cleanId}`));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return stripLegalVaultFromBilties(parsed as BiltyRecord[]);
      }
    }
  } catch {
    // ignore parse error
  }

  if (getActiveBranchId() === cleanId) {
    return stripLegalVaultFromBilties(getStoredBilties());
  }
  return [];
}

/**
 * Collects branch configs, branch Bilties (never legalVault), and Adda records
 * scoped strictly by caller role:
 * - Creator -> all cached branches
 * - Active Branch Owner -> active branch ONLY
 * - Drivers / Guests / Non-owner staff -> empty map
 */
export function collectAuthorizedBranchBackups(): Record<string, BranchBackupSlice> {
  const authority = resolveBranchBackupAuthority();
  if (authority.role === 'none') {
    return {};
  }

  const cachedBranches = getCachedBranches();
  const targetBranches: BranchConfig[] = authority.allowAllBranches
    ? cachedBranches
    : cachedBranches.filter(b => b.id === authority.allowedBranchId);

  if (authority.role === 'branch_owner' && authority.allowedBranchId && targetBranches.length === 0) {
    const fallback = getCachedBranchById(authority.allowedBranchId);
    if (fallback) targetBranches.push(fallback);
  }

  const result: Record<string, BranchBackupSlice> = {};
  for (const branch of targetBranches) {
    if (!branch?.id) continue;
    const bId =
      branch.id === LEGACY_HEAD_OFFICE_BRANCH_ID ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branch.id;
    result[bId] = {
      branchId: bId,
      config: { ...branch, id: bId },
      bilties: readBiltiesForSpecificBranch(bId, authority),
      addaFreight: getAddaPendingFreight(bId),
      addaCommissions: getAddaPendingCommissions(bId),
      addaBills: getAddaBills(bId)
    };
  }
  return result;
}

function mergeByUpdatedAtLwwWithId<T extends { id?: string | number; updatedAt?: string; createdAt?: string }>(
  existing: T[],
  incoming: T[],
  mode: 'merge' | 'overwrite'
): T[] {
  if (mode === 'overwrite') return incoming;
  const map = new Map<string, T>();
  const getMs = (item: T) => {
    const raw = item.updatedAt || item.createdAt;
    if (!raw) return 0;
    const ms = new Date(String(raw)).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  };
  for (const item of existing) {
    if (item && item.id !== undefined) map.set(String(item.id), item);
  }
  for (const item of incoming) {
    if (!item || item.id === undefined) continue;
    const key = String(item.id);
    const prev = map.get(key);
    if (!prev || getMs(item) >= getMs(prev)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

export function normalizeBranchBackupsInput(
  raw: unknown
): Array<{ branchId: string; slice: BranchBackupSlice }> {
  if (!raw) return [];
  const entries: Array<{ branchId: string; slice: BranchBackupSlice }> = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const obj = item as Partial<BranchBackupSlice> & { branchId?: string };
      const rawId = String(obj.branchId || obj.config?.id || '').trim();
      if (!rawId) continue;
      const bId = rawId === LEGACY_HEAD_OFFICE_BRANCH_ID ? DEFAULT_HEAD_OFFICE_BRANCH_ID : rawId;
      entries.push({
        branchId: bId,
        slice: {
          branchId: bId,
          config: (obj.config || getCachedBranchById(bId) || { id: bId }) as BranchConfig,
          bilties: Array.isArray(obj.bilties) ? obj.bilties : [],
          addaFreight: Array.isArray(obj.addaFreight) ? obj.addaFreight : [],
          addaCommissions: Array.isArray(obj.addaCommissions) ? obj.addaCommissions : [],
          addaBills: Array.isArray(obj.addaBills) ? obj.addaBills : []
        }
      });
    }
    return entries;
  }

  if (typeof raw === 'object') {
    for (const [rawKey, val] of Object.entries(raw as Record<string, unknown>)) {
      if (!val || typeof val !== 'object') continue;
      const obj = val as Partial<BranchBackupSlice>;
      const bId = rawKey === LEGACY_HEAD_OFFICE_BRANCH_ID ? DEFAULT_HEAD_OFFICE_BRANCH_ID : rawKey;
      entries.push({
        branchId: bId,
        slice: {
          branchId: bId,
          config: (obj.config || getCachedBranchById(bId) || { id: bId }) as BranchConfig,
          bilties: Array.isArray(obj.bilties) ? obj.bilties : [],
          addaFreight: Array.isArray(obj.addaFreight) ? obj.addaFreight : [],
          addaCommissions: Array.isArray(obj.addaCommissions) ? obj.addaCommissions : [],
          addaBills: Array.isArray(obj.addaBills) ? obj.addaBills : []
        }
      });
    }
  }
  return entries;
}

/**
 * Restores authorized branch slices (`branchBackups`) cleanly with strict role gating:
 * - App Creator can restore any branch
 * - Active Branch Owner can restore ONLY their assigned branch
 * - Drivers, Guests, and other branch staff ignore `branchBackups` completely
 */
export function applyAuthorizedBranchBackups(
  rawBranchBackups: unknown,
  mode: 'merge' | 'overwrite' = 'merge'
): {
  restoredBranches: number;
  restoredRecords: number;
  skippedUnauthorizedBranches: number;
} {
  const entries = normalizeBranchBackupsInput(rawBranchBackups);
  if (entries.length === 0) {
    return { restoredBranches: 0, restoredRecords: 0, skippedUnauthorizedBranches: 0 };
  }

  const authority = resolveBranchBackupAuthority();
  if (authority.role === 'none') {
    return {
      restoredBranches: 0,
      restoredRecords: 0,
      skippedUnauthorizedBranches: entries.length
    };
  }

  const nowIso = clampMutationIso(new Date().toISOString());
  let restoredBranches = 0;
  let restoredRecords = 0;
  let skippedUnauthorizedBranches = 0;
  const updatedBranchConfigs = [...getCachedBranches()];

  for (const { branchId, slice } of entries) {
    if (!authority.allowAllBranches && authority.allowedBranchId !== branchId) {
      skippedUnauthorizedBranches++;
      continue;
    }

    if (slice.config && slice.config.id) {
      const idx = updatedBranchConfigs.findIndex(b => b.id === branchId);
      if (idx >= 0) {
        updatedBranchConfigs[idx] =
          authority.role === 'creator'
            ? { ...updatedBranchConfigs[idx], ...slice.config, id: branchId }
            : {
                ...updatedBranchConfigs[idx],
                nameUr: slice.config.nameUr || updatedBranchConfigs[idx].nameUr,
                nameEn: slice.config.nameEn || updatedBranchConfigs[idx].nameEn,
                addressUr: slice.config.addressUr || updatedBranchConfigs[idx].addressUr,
                addressEn: slice.config.addressEn || updatedBranchConfigs[idx].addressEn,
                phoneNumbers: slice.config.phoneNumbers || updatedBranchConfigs[idx].phoneNumbers
              };
      } else if (authority.role === 'creator') {
        updatedBranchConfigs.push({ ...slice.config, id: branchId });
      }
    }

    // 1. Restore Branch Bilties (and clear tombstones for restored Bilties)
    const incomingBilties = stripLegalVaultFromBilties(slice.bilties || []).filter(
      b => b && b.biltyNo
    );
    const email = auth.currentUser?.email || safeStorage.getItem('ah-gmail-user');
    if (
      branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID &&
      authority.role === 'creator' &&
      !isUsingSharedBranchScope(email)
    ) {
      applyRestoredCollection(
        'bilties',
        incomingBilties as unknown as Array<Record<string, unknown>>,
        mode
      );
      restoredRecords += incomingBilties.length;
    } else {
      const branchScope = `branch_${branchId}`;
      const branchBiltyKey = getScopedStorageKey('bilties', branchScope);
      let existingBranchBilties: Array<Record<string, unknown>> = [];
      try {
        const rawExisting = safeStorage.getItem(branchBiltyKey);
        if (rawExisting) {
          const parsed = JSON.parse(rawExisting);
          if (Array.isArray(parsed)) existingBranchBilties = parsed;
        }
      } catch {
        existingBranchBilties = [];
      }

      const tombstones = { ...getTombstones('bilties', branchScope) };
      const stampedIncoming = incomingBilties.map(b => {
        const rec = b as unknown as Record<string, unknown>;
        const syncKey = getEntitySyncKey('bilties', rec);
        delete tombstones[syncKey];
        if (rec.id !== undefined) delete tombstones[String(rec.id)];
        return { ...rec, branchId, updatedAt: nowIso };
      });
      saveTombstones('bilties', tombstones, branchScope);

      let mergedBilties: Array<Record<string, unknown>>;
      if (mode === 'overwrite') {
        mergedBilties = stampedIncoming;
      } else {
        const map = new Map<string, Record<string, unknown>>();
        for (const ex of existingBranchBilties) {
          map.set(getEntitySyncKey('bilties', ex), ex);
        }
        for (const inc of stampedIncoming) {
          map.set(getEntitySyncKey('bilties', inc), inc);
        }
        mergedBilties = Array.from(map.values());
      }
      safeStorage.setItem(branchBiltyKey, JSON.stringify(mergedBilties));
      if (getActiveBranchId() === branchId && db && auth.currentUser) {
        void syncToFirestore('bilties', mergedBilties, []);
      }
      restoredRecords += stampedIncoming.length;
    }

    // 2. Restore Adda Pending Freight, Commissions & Bills + clear Adda tombstones
    const existingFreight = getAddaPendingFreight(branchId);
    const stampedFreight = (slice.addaFreight || []).map(f => ({
      ...f,
      branchId,
      updatedAt: nowIso
    }));
    clearAddaTombstonesForIds(
      branchId,
      'freight',
      stampedFreight.map(f => f.id)
    );
    const finalFreight = mergeByUpdatedAtLwwWithId(existingFreight, stampedFreight, mode);
    saveAddaPendingFreightList(branchId, finalFreight);
    restoredRecords += stampedFreight.length;

    const existingComm = getAddaPendingCommissions(branchId);
    const stampedComm = (slice.addaCommissions || []).map(c => ({
      ...c,
      branchId,
      updatedAt: nowIso
    }));
    clearAddaTombstonesForIds(
      branchId,
      'commission',
      stampedComm.map(c => c.id)
    );
    const finalComm = mergeByUpdatedAtLwwWithId(existingComm, stampedComm, mode);
    saveAddaPendingCommissionsList(branchId, finalComm);
    restoredRecords += stampedComm.length;

    const existingBills = getAddaBills(branchId);
    const stampedBills = (slice.addaBills || []).map(b => ({
      ...b,
      branchId,
      updatedAt: nowIso
    }));
    clearAddaTombstonesForIds(
      branchId,
      'bills',
      stampedBills.map(b => b.id)
    );
    const finalBills = mergeByUpdatedAtLwwWithId(existingBills, stampedBills, mode);
    saveAddaBillsList(branchId, finalBills);
    restoredRecords += stampedBills.length;

    // Best-effort cloud sync for restored Adda docs to canonical collections when online & signed in
    if (db && auth.currentUser && (typeof navigator === 'undefined' || navigator.onLine)) {
      for (const f of finalFreight) {
        void setDoc(
          doc(db, 'branches', branchId, 'adda_items', f.id),
          { ...f, kind: 'freight', _deleted: false, deletedAt: null },
          { merge: true }
        ).catch(() => {});
      }
      for (const c of finalComm) {
        void setDoc(
          doc(db, 'branches', branchId, 'adda_items', c.id),
          { ...c, kind: 'commission', _deleted: false, deletedAt: null },
          { merge: true }
        ).catch(() => {});
      }
      for (const b of finalBills) {
        void setDoc(
          doc(db, 'branches', branchId, 'adda_bills', b.id),
          { ...b, _deleted: false, deletedAt: null },
          { merge: true }
        ).catch(() => {});
      }
    }

    restoredBranches++;
  }

  setCachedBranches(updatedBranchConfigs);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('driverdost:company_updated'));
    window.dispatchEvent(new CustomEvent('driverdost:storage_hydrated'));
  }

  return {
    restoredBranches,
    restoredRecords,
    skippedUnauthorizedBranches
  };
}
