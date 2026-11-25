/**
 * Driver Dost - Lightweight Active Branch Context & Branch Metadata Cache
 *
 * Kept intentionally free of Firebase/storageSync imports to prevent circular dependencies
 * across storageCore, storageSync, ledgerStorage, and branchService.
 */

import type { BranchConfig } from '../types';
import {
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  LEGACY_HEAD_OFFICE_BRANCH_ID,
  isHeadOfficeBranchId,
  isOwnerEmail
} from './authUtils';
import { safeStorage } from './storageCore';

export const DEFAULT_HEAD_OFFICE_BRANCH: BranchConfig = {
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

/** Backwards-compatible alias for Head Office default config */
export const DEFAULT_SAMUNDRI_BRANCH = DEFAULT_HEAD_OFFICE_BRANCH;

const BRANCHES_CACHE_KEY = 'wg_branches_cache_v1';
const ACTIVE_BRANCH_KEY = 'wg_active_branch_id_v1';

let inMemoryActiveBranchId: string | null = null;

function normalizeCachedBranchRecord(raw: BranchConfig): BranchConfig {
  const canonicalId = raw.id === LEGACY_HEAD_OFFICE_BRANCH_ID ? DEFAULT_HEAD_OFFICE_BRANCH_ID : raw.id;
  return {
    ...raw,
    id: canonicalId,
    isHeadOffice: canonicalId === DEFAULT_HEAD_OFFICE_BRANCH_ID || Boolean(raw.isHeadOffice),
    startingBiltySeq: Math.max(1001, Number(raw.startingBiltySeq) || 1001)
  };
}

export function getCachedBranches(): BranchConfig[] {
  try {
    const raw = safeStorage.getItem(BRANCHES_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed
          .filter((b): b is BranchConfig => Boolean(b && b.id))
          .map(normalizeCachedBranchRecord);
        const deduped = new Map<string, BranchConfig>();
        for (const b of normalized) {
          deduped.set(b.id, b);
        }
        if (!deduped.has(DEFAULT_HEAD_OFFICE_BRANCH_ID)) {
          deduped.set(DEFAULT_HEAD_OFFICE_BRANCH_ID, DEFAULT_HEAD_OFFICE_BRANCH);
        }
        return Array.from(deduped.values());
      }
    }
  } catch {
    // ignore parse errors
  }
  return [DEFAULT_HEAD_OFFICE_BRANCH];
}

export function setCachedBranches(branches: BranchConfig[]): void {
  const map = new Map<string, BranchConfig>();
  map.set(DEFAULT_HEAD_OFFICE_BRANCH_ID, DEFAULT_HEAD_OFFICE_BRANCH);
  for (const b of branches) {
    if (b && b.id) {
      const normalized = normalizeCachedBranchRecord(b);
      map.set(normalized.id, normalized);
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
  const canonical = isHeadOfficeBranchId(branchId) ? DEFAULT_HEAD_OFFICE_BRANCH_ID : branchId;
  const list = getCachedBranches();
  return list.find(b => b.id === canonical) || (canonical === DEFAULT_HEAD_OFFICE_BRANCH_ID ? DEFAULT_HEAD_OFFICE_BRANCH : null);
}

export function getActiveBranchId(): string | null {
  if (inMemoryActiveBranchId !== null) {
    return inMemoryActiveBranchId;
  }
  try {
    const raw = safeStorage.getItem(ACTIVE_BRANCH_KEY);
    const trimmed = raw && raw.trim() ? raw.trim() : null;
    inMemoryActiveBranchId = trimmed === LEGACY_HEAD_OFFICE_BRANCH_ID ? DEFAULT_HEAD_OFFICE_BRANCH_ID : trimmed;
  } catch {
    inMemoryActiveBranchId = null;
  }
  return inMemoryActiveBranchId;
}

export function setActiveBranchId(branchId: string | null): void {
  const trimmed = branchId && branchId.trim() ? branchId.trim() : null;
  const clean = trimmed === LEGACY_HEAD_OFFICE_BRANCH_ID ? DEFAULT_HEAD_OFFICE_BRANCH_ID : trimmed;
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
 * Determines whether the current session should isolate Bilty / Adda storage into
 * `branch_<branchId>` instead of the personal `users/{uid}` scope.
 * - Guests / regular drivers (`activeBranchId === null`): personal scope (`false`).
 * - App Creator on Head Office (`head`): stays backward-compatible unless branch scope is explicitly active.
 * - App Creator switched to another branch: branch scope (`true`).
 * - Branch Owners / Staff assigned to ANY branch (including `head`): branch scope (`true`).
 */
export function isUsingSharedBranchScope(userEmail?: string | null): boolean {
  const branchId = getActiveBranchId();
  if (!branchId) return false;
  const email = userEmail ?? safeStorage.getItem('ah-gmail-user');
  if (isOwnerEmail(email) && isHeadOfficeBranchId(branchId)) {
    return false;
  }
  return true;
}

function isBranchOrAddaStorageKey(key: string, preserveBranchesMetadata: boolean): boolean {
  if (!key) return false;
  if (!preserveBranchesMetadata && key === BRANCHES_CACHE_KEY) return true;
  if (key === ACTIVE_BRANCH_KEY) return true;
  return (
    key.startsWith('wg_v2_branch_') ||
    key.startsWith('wg_v3_tombstones_branch_') ||
    key.startsWith('wg_v3_sync_cursor_branch_') ||
    key.startsWith('wg_v3_last_full_drift_branch_') ||
    key.startsWith('wg_v3_migrated_branch_') ||
    key.startsWith('wg_v3_premigration_snapshot_branch_') ||
    key.startsWith('wg_v3_adda_') ||
    key.startsWith('wg_branch_staff_v1_') ||
    key.startsWith('wg_user_branch_access_v1_') ||
    key.startsWith('wg_offline_block_bilty_') ||
    key.startsWith('wg_offline_block_bill_')
  );
}

/**
 * Synchronously clears all branch-scoped Bilty, Adda, staff roster, cursor, and offline-block keys
 * from in-memory state and localStorage, preserving personal `wg_v2_<uid>_*` and `wg_v2_guest_*` data intact.
 */
export function clearLocalBranchAndAddaCachesSync(
  options: { preserveBranchesMetadata?: boolean } = {}
): string[] {
  const preserveBranchesMetadata = Boolean(options.preserveBranchesMetadata);
  inMemoryActiveBranchId = null;
  const removedKeys: string[] = [];

  try {
    if (typeof localStorage !== 'undefined') {
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) allKeys.push(k);
      }
      for (const key of allKeys) {
        if (isBranchOrAddaStorageKey(key, preserveBranchesMetadata)) {
          safeStorage.removeItem(key);
          removedKeys.push(key);
        }
      }
    }
  } catch {
    // ignore
  }

  // Ensure explicit core keys are removed even in memory-only environments
  safeStorage.removeItem(ACTIVE_BRANCH_KEY);
  if (!preserveBranchesMetadata) {
    safeStorage.removeItem(BRANCHES_CACHE_KEY);
  }
  return removedKeys;
}

/**
 * Full async wipe of branch & Adda caches across both localStorage and IndexedDB.
 * Invoked on sign-out, branch access revocation, `permission-denied`, and staff account deletion.
 */
export async function clearLocalBranchAndAddaCaches(
  options: { preserveBranchesMetadata?: boolean } = {}
): Promise<void> {
  const preserveBranchesMetadata = Boolean(options.preserveBranchesMetadata);
  const removedLocal = clearLocalBranchAndAddaCachesSync(options);

  try {
    const { idbDeleteMany, idbGetAllEntries, idbOnlyDelete, idbOnlyListKeys } = await import(
      './persistentStorage'
    );
    const idbKeys = new Set<string>(removedLocal);
    const entries = await idbGetAllEntries();
    for (const k of Object.keys(entries)) {
      if (isBranchOrAddaStorageKey(k, preserveBranchesMetadata)) {
        idbKeys.add(k);
      }
    }
    if (idbKeys.size > 0) {
      await idbDeleteMany(Array.from(idbKeys));
    }

    const idbOnlyKeys = await idbOnlyListKeys();
    for (const k of idbOnlyKeys) {
      if (
        k.includes('_branch_') ||
        k.includes('adda') ||
        (!preserveBranchesMetadata && k.includes('branches'))
      ) {
        await idbOnlyDelete(k);
      }
    }
  } catch {
    // non-fatal IDB cleanup notice
  }
}
