/**
 * Driver Dost - Lightweight Active Branch Context & Branch Metadata Cache
 *
 * Kept intentionally free of Firebase/storageSync imports to prevent circular dependencies
 * across storageCore, storageSync, ledgerStorage, and branchService.
 */

import type { BranchConfig } from '../types';
import { DEFAULT_HEAD_OFFICE_BRANCH_ID, isOwnerEmail } from './authUtils';
import { safeStorage } from './storageCore';

export const DEFAULT_SAMUNDRI_BRANCH: BranchConfig = {
  id: DEFAULT_HEAD_OFFICE_BRANCH_ID,
  nameUr: 'سمندری (ہیڈ آفس)',
  nameEn: 'Samundri (Head Office)',
  addressUr: 'اوکاڑہ بائی پاس، نزد 466 چوک، سمندری',
  addressEn: 'Okara Bypass, Near 466 Chock, Samundri',
  phoneNumbers: '0300-5370443, 0339-5370443',
  ntn: '7779394-1',
  startingBiltySeq: 1001,
  isHeadOffice: true,
  active: true
};

const BRANCHES_CACHE_KEY = 'wg_branches_cache_v1';
const ACTIVE_BRANCH_KEY = 'wg_active_branch_id_v1';

let inMemoryActiveBranchId: string | null = null;

export function getCachedBranches(): BranchConfig[] {
  try {
    const raw = safeStorage.getItem(BRANCHES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasSamundri = parsed.some((b: BranchConfig) => b?.id === DEFAULT_HEAD_OFFICE_BRANCH_ID);
        return hasSamundri ? parsed : [DEFAULT_SAMUNDRI_BRANCH, ...parsed];
      }
    }
  } catch {
    // ignore parse errors
  }
  return [DEFAULT_SAMUNDRI_BRANCH];
}

export function setCachedBranches(branches: BranchConfig[]): void {
  const map = new Map<string, BranchConfig>();
  map.set(DEFAULT_HEAD_OFFICE_BRANCH_ID, DEFAULT_SAMUNDRI_BRANCH);
  for (const b of branches) {
    if (b && b.id) {
      map.set(b.id, {
        ...b,
        startingBiltySeq: Math.max(1001, Number(b.startingBiltySeq) || 1001)
      });
    }
  }
  try {
    safeStorage.setItem(BRANCHES_CACHE_KEY, JSON.stringify(Array.from(map.values())));
  } catch {
    // ignore
  }
}

export function getCachedBranchById(branchId?: string | null): BranchConfig | null {
  if (!branchId) return null;
  const list = getCachedBranches();
  return list.find(b => b.id === branchId) || (branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID ? DEFAULT_SAMUNDRI_BRANCH : null);
}

export function getActiveBranchId(): string | null {
  if (inMemoryActiveBranchId !== null) {
    return inMemoryActiveBranchId;
  }
  try {
    const raw = safeStorage.getItem(ACTIVE_BRANCH_KEY);
    inMemoryActiveBranchId = raw && raw.trim() ? raw.trim() : null;
  } catch {
    inMemoryActiveBranchId = null;
  }
  return inMemoryActiveBranchId;
}

export function setActiveBranchId(branchId: string | null): void {
  const clean = branchId && branchId.trim() ? branchId.trim() : null;
  inMemoryActiveBranchId = clean;
  try {
    if (clean) {
      safeStorage.setItem(ACTIVE_BRANCH_KEY, clean);
    } else {
      safeStorage.removeItem(ACTIVE_BRANCH_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Determines whether the current session should isolate Bilty / Khata storage into
 * `branch_<branchId>` instead of the personal `users/{uid}` scope.
 * - Guests / regular drivers (`activeBranchId === null`): personal scope (`false`).
 * - App Creator on Samundri Head Office: keeps existing `users/{ownerUid}` local & cloud scope (`false`),
 *   while mirroring Samundri updates to `/branches/samundri` when online.
 * - App Creator switched to another branch (`branchId !== 'samundri'`): branch scope (`true`).
 * - Branch Owners / Staff assigned to ANY branch (including `samundri`): branch scope (`true`).
 */
export function isUsingSharedBranchScope(userEmail?: string | null): boolean {
  const branchId = getActiveBranchId();
  if (!branchId) return false;
  const email = userEmail ?? safeStorage.getItem('ah-gmail-user');
  if (isOwnerEmail(email) && branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID) {
    return false;
  }
  return true;
}
