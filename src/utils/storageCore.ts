/**
 * Driver Dost - Low-Level Safe Storage, Scoping & One-Time v2->v3 Migration Engine
 *
 * Addresses audit items:
 * - #4: getScopedItem never treats '[]' as empty after one-time migration and never refills from guest/legacy/other emails.
 * - #5: safeStorage.removeItem deletes ONLY the exact key (zero wildcard endsWith/startsWith deletion).
 * - #6: IndexedDB deletes use idbDelete + hydration tombstones so deleted data cannot resurrect on restart.
 * - #7: Eliminates continuous hardcoded owner & legacy shadow copies while running a safe one-time migration.
 */

import { auth } from './firebase';
import { getStorageScope, getScopedStorageKey } from './calculator';
import { isOwnerEmail } from './authUtils';
import {
  clearKeyDeletedForHydration,
  idbDelete,
  idbSet
} from './persistentStorage';

const memoryStorage = new Map<string, string>();
const failedLocalStorageKeys = new Set<string>();

export const V3_MIGRATION_FLAG_PREFIX = 'wg_v3_migrated_';

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
        // Only fall back to memoryStorage if localStorage explicitly failed a write for this key
        return failedLocalStorageKeys.has(key) ? (memoryStorage.get(key) ?? null) : null;
      }
    } catch {
      // fallback to memory when localStorage throws (e.g. restricted webview)
    }
    return memoryStorage.get(key) ?? null;
  },

  setItem: (key: string, value: string): void => {
    memoryStorage.set(key, value);
    clearKeyDeletedForHydration(key);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        failedLocalStorageKeys.delete(key);
      }
    } catch (e) {
      failedLocalStorageKeys.add(key);
      console.warn('LocalStorage quota limit reached; saved safely in memory and IndexedDB:', e);
    }

    if (typeof window !== 'undefined') {
      idbSet(key, value).catch(() => {});
    }
  },

  removeItem: (key: string): void => {
    memoryStorage.delete(key);
    failedLocalStorageKeys.delete(key);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }

    if (typeof window !== 'undefined') {
      idbDelete(key).catch(() => {});
    }
  }
};

/**
 * Returns the active user scope (UID, local email identifier, or 'guest').
 */
export function getActiveUserScope(): string {
  const user = auth.currentUser;
  const localEmail = safeStorage.getItem('ah-gmail-user');
  return getStorageScope(user, localEmail);
}

const ARRAY_COLLECTION_KEYS = ['bilties', 'trips', 'vehicles', 'drivers', 'fuel', 'routes'] as const;
const SCALAR_SCOPED_KEYS = [
  'user-role',
  'notifs',
  'bilty-allowed-uids',
  'bilty-allowed-emails',
  'bilty-counter'
] as const;

export const KHATA_BASE_KEYS = [
  'dd_khata_accounts_v2',
  'dd_khata_entries_v2',
  'dd_khata_cashbook_v2',
  'dd_khata_settings_v2',
  'dd_khata_doc_queue_v2',
  'dd_khata_bills_v2',
  'dd_khata_employees_v2',
  'dd_khata_employee_entries_v2',
  'dd_khata_receiving_points_v2',
  'dd_khata_receiving_entries_v2',
  'dd_khata_daily_expenses_v2',
  'dd_ledger_parties',
  'dd_ledger_party_transactions',
  'dd_ledger_brokers',
  'dd_ledger_broker_transactions',
  'dd_ledger_vehicle_expenses',
  'dd_ledger_vehicle_income'
] as const;

const BRANCH_SCOPED_KEY_SET = new Set<string>([
  'bilties',
  'bilty-counter',
  ...KHATA_BASE_KEYS
]);

export function isBranchScopedKey(baseKey: string): boolean {
  return BRANCH_SCOPED_KEY_SET.has(baseKey);
}

export function getEffectiveScopeForKey(baseKey: string): string {
  if (isBranchScopedKey(baseKey)) {
    const branchId = safeStorage.getItem('wg_active_branch_id_v1');
    const localEmail = safeStorage.getItem('ah-gmail-user');
    if (branchId && branchId.trim() && !(isOwnerEmail(localEmail) && branchId.trim() === 'samundri')) {
      return `branch_${branchId.trim()}`;
    }
  }
  return getActiveUserScope();
}

export function getActiveBiltyScope(): string {
  return getEffectiveScopeForKey('bilties');
}

export function getActiveKhataScope(): string {
  return getEffectiveScopeForKey('dd_khata_accounts_v2');
}

function hasNonEmptyArrayJson(raw: string | null): boolean {
  if (!raw || raw === '[]') return false;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/**
 * Idempotent one-time v2 -> v3 migration per scope.
 * Migrates any pre-existing legacy/email-scoped data into `wg_v2_<scope>_*` ONCE,
 * WITHOUT silently absorbing separate Guest-mode records (`wg_v2_guest_*`) into authenticated accounts.
 * Captures a safety pre-migration snapshot before writing target keys,
 * then sets `wg_v3_migrated_<scope> = '1'` so subsequent empty lists (`[]`) are respected.
 */
export function runOneTimeV2ToV3Migration(scope: string = getActiveUserScope()): void {
  const flagKey = `${V3_MIGRATION_FLAG_PREFIX}${scope}`;
  if (safeStorage.getItem(flagKey) === '1') {
    return;
  }

  const localEmail = safeStorage.getItem('ah-gmail-user');
  const emailScope = localEmail ? localEmail.replace(/[^a-zA-Z0-9_]/g, '_') : null;

  // Snapshot existing pre-migration data once before overwriting/migrating
  const snapshotKey = `wg_v3_premigration_snapshot_${scope}`;
  if (!safeStorage.getItem(snapshotKey)) {
    try {
      const preExisting: Record<string, string> = {};
      for (const baseKey of ARRAY_COLLECTION_KEYS) {
        const t = safeStorage.getItem(getScopedStorageKey(baseKey, scope));
        if (t !== null) preExisting[baseKey] = t;
      }
      if (Object.keys(preExisting).length > 0) {
        safeStorage.setItem(snapshotKey, JSON.stringify({ capturedAt: new Date().toISOString(), keys: preExisting }));
      }
    } catch {
      // non-fatal
    }
  }

  // 1. Core array collections (explicitly exclude wg_v2_guest_* so sign-in prompts user instead)
  for (const baseKey of ARRAY_COLLECTION_KEYS) {
    const targetKey = getScopedStorageKey(baseKey, scope);
    const existing = safeStorage.getItem(targetKey);
    // Only populate if the user's scoped key does not exist at all yet
    if (existing !== null) continue;

    const candidates = [
      emailScope && emailScope !== scope ? getScopedStorageKey(baseKey, emailScope) : null,
      `ah-${baseKey}`,
      `ah-${baseKey}-data`,
      baseKey
    ].filter((k): k is string => Boolean(k && k !== targetKey));

    for (const candKey of candidates) {
      const candVal = safeStorage.getItem(candKey);
      if (hasNonEmptyArrayJson(candVal)) {
        safeStorage.setItem(targetKey, candVal!);
        break;
      }
    }
  }

  // 2. Scalar scoped settings & counters
  for (const baseKey of SCALAR_SCOPED_KEYS) {
    const targetKey = getScopedStorageKey(baseKey, scope);
    if (safeStorage.getItem(targetKey) !== null) continue;

    const candidates = [
      emailScope && emailScope !== scope ? getScopedStorageKey(baseKey, emailScope) : null,
      `ah-${baseKey}`,
      `ah-${baseKey}-data`,
      baseKey
    ].filter((k): k is string => Boolean(k && k !== targetKey));

    for (const candKey of candidates) {
      const candVal = safeStorage.getItem(candKey);
      if (candVal !== null && candVal !== '' && candVal !== '[]') {
        safeStorage.setItem(targetKey, candVal);
        break;
      }
    }
  }

  // 3. Khata collections (migrate legacy `${baseKey}_${uid}` or unscoped baseKey once)
  for (const baseKey of KHATA_BASE_KEYS) {
    const targetKey = getScopedStorageKey(baseKey, scope);
    if (safeStorage.getItem(targetKey) !== null) continue;

    const candidates = [
      scope !== 'guest' ? `${baseKey}_${scope}` : null,
      baseKey
    ].filter((k): k is string => Boolean(k && k !== targetKey));

    for (const candKey of candidates) {
      const candVal = safeStorage.getItem(candKey);
      if (candVal !== null && candVal !== '' && candVal !== '[]') {
        safeStorage.setItem(targetKey, candVal);
        break;
      }
    }
  }

  safeStorage.setItem(flagKey, '1');
}

export interface GuestScopeSummary {
  hasGuestData: boolean;
  totalRecords: number;
  counts: {
    trips: number;
    vehicles: number;
    drivers: number;
    routes: number;
    fuel: number;
    documents: number;
    khata: number;
  };
}

function readJsonArraySafe(raw: string | null): Array<Record<string, unknown>> {
  if (!raw || raw === '[]') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Array<Record<string, unknown>>) : [];
  } catch {
    return [];
  }
}

/**
 * Inspects un-migrated Guest-mode (`wg_v2_guest_*`) records present on this device.
 */
export function inspectGuestScopeData(): GuestScopeSummary {
  const trips = readJsonArraySafe(safeStorage.getItem(getScopedStorageKey('trips', 'guest'))).length;
  const vehicles = readJsonArraySafe(safeStorage.getItem(getScopedStorageKey('vehicles', 'guest'))).length;
  const drivers = readJsonArraySafe(safeStorage.getItem(getScopedStorageKey('drivers', 'guest'))).length;
  const routes = readJsonArraySafe(safeStorage.getItem(getScopedStorageKey('routes', 'guest'))).length;
  const fuel = readJsonArraySafe(safeStorage.getItem(getScopedStorageKey('fuel', 'guest'))).length;
  const documents = readJsonArraySafe(safeStorage.getItem(getScopedStorageKey('bilties', 'guest'))).length;

  let khata = 0;
  for (const kKey of KHATA_BASE_KEYS) {
    if (kKey === 'dd_khata_settings_v2') continue;
    khata += readJsonArraySafe(safeStorage.getItem(getScopedStorageKey(kKey, 'guest'))).length;
  }

  const totalRecords = trips + vehicles + drivers + routes + fuel + documents + khata;
  return {
    hasGuestData: totalRecords > 0,
    totalRecords,
    counts: { trips, vehicles, drivers, routes, fuel, documents, khata }
  };
}

function getMergeItemKey(item: Record<string, unknown>): string {
  if (item.id !== undefined && item.id !== null) return `id:${String(item.id)}`;
  if (item.biltyNo) return `b:${String(item.biltyNo).toUpperCase()}`;
  if (item.reg) return `r:${String(item.reg).toUpperCase()}`;
  return JSON.stringify(item);
}

/**
 * Explicitly merges or discards Guest-mode (`wg_v2_guest_*`) records for a signed-in user scope.
 * Never runs silently — invoked only after explicit user consent in GuestImportPromptModal.
 */
export function importGuestDataIntoScope(
  targetScope: string,
  action: 'merge' | 'discard'
): { mergedCount: number } {
  if (!targetScope || targetScope === 'guest') {
    return { mergedCount: 0 };
  }

  runOneTimeV2ToV3Migration(targetScope);
  let mergedCount = 0;
  const nowIso = new Date().toISOString();

  if (action === 'merge') {
    for (const baseKey of ARRAY_COLLECTION_KEYS) {
      const guestKey = getScopedStorageKey(baseKey, 'guest');
      const guestItems = readJsonArraySafe(safeStorage.getItem(guestKey));
      if (guestItems.length === 0) {
        safeStorage.removeItem(guestKey);
        continue;
      }

      const targetKey = getScopedStorageKey(baseKey, targetScope);
      const targetItems = readJsonArraySafe(safeStorage.getItem(targetKey));
      const existingKeys = new Set(targetItems.map(getMergeItemKey));

      const added: Array<Record<string, unknown>> = [];
      for (const item of guestItems) {
        if (!item || typeof item !== 'object') continue;
        const k = getMergeItemKey(item);
        if (!existingKeys.has(k)) {
          existingKeys.add(k);
          added.push({
            ...item,
            updatedAt: item.updatedAt || nowIso,
            createdAt: item.createdAt || nowIso
          });
        }
      }

      if (added.length > 0) {
        safeStorage.setItem(targetKey, JSON.stringify([...targetItems, ...added]));
        mergedCount += added.length;
      }
      safeStorage.removeItem(guestKey);
    }

    // Move any pending guest offline queue items into signed-in scope so sync uploads and deletes them cleanly
    const guestQueueKey = getScopedStorageKey('offline-queue', 'guest');
    const guestQueue = readJsonArraySafe(safeStorage.getItem(guestQueueKey));
    if (guestQueue.length > 0) {
      const targetQueueKey = getScopedStorageKey('offline-queue', targetScope);
      const targetQueue = readJsonArraySafe(safeStorage.getItem(targetQueueKey));
      const existingIds = new Set(targetQueue.map(q => String(q?.id ?? getMergeItemKey(q))));
      const extraQueue = guestQueue.filter(q => q && typeof q === 'object' && !existingIds.has(String(q.id ?? getMergeItemKey(q))));
      if (extraQueue.length > 0) {
        safeStorage.setItem(targetQueueKey, JSON.stringify([...targetQueue, ...extraQueue]));
      }
    }
    safeStorage.removeItem(guestQueueKey);

    for (const kKey of KHATA_BASE_KEYS) {
      const guestKey = getScopedStorageKey(kKey, 'guest');
      const guestRaw = safeStorage.getItem(guestKey);
      if (!guestRaw || guestRaw === '[]') {
        safeStorage.removeItem(guestKey);
        continue;
      }

      const targetKey = getScopedStorageKey(kKey, targetScope);
      if (kKey === 'dd_khata_settings_v2') {
        if (!safeStorage.getItem(targetKey)) {
          safeStorage.setItem(targetKey, guestRaw);
        }
        safeStorage.removeItem(guestKey);
        continue;
      }

      const guestArr = readJsonArraySafe(guestRaw);
      if (guestArr.length === 0) {
        safeStorage.removeItem(guestKey);
        continue;
      }
      const targetArr = readJsonArraySafe(safeStorage.getItem(targetKey));
      const existingKeys = new Set(targetArr.map(getMergeItemKey));
      const added = guestArr.filter(it => it && typeof it === 'object' && !existingKeys.has(getMergeItemKey(it)));
      if (added.length > 0) {
        safeStorage.setItem(targetKey, JSON.stringify([...targetArr, ...added]));
        mergedCount += added.length;
      }
      safeStorage.removeItem(guestKey);
    }
  } else {
    // Discard all guest storage keys cleanly
    for (const baseKey of ARRAY_COLLECTION_KEYS) {
      safeStorage.removeItem(getScopedStorageKey(baseKey, 'guest'));
    }
    for (const kKey of KHATA_BASE_KEYS) {
      safeStorage.removeItem(getScopedStorageKey(kKey, 'guest'));
    }
  }

  for (const scalarKey of SCALAR_SCOPED_KEYS) {
    safeStorage.removeItem(getScopedStorageKey(scalarKey, 'guest'));
  }
  safeStorage.removeItem(`${V3_MIGRATION_FLAG_PREFIX}guest`);
  safeStorage.removeItem('wg_v3_premigration_snapshot_guest');
  safeStorage.removeItem(`wg_v3_guest_import_deferred_${targetScope}`);
  return { mergedCount };
}

/**
 * Removes staging pre-migration snapshots and legacy duplicated localStorage keys
 * after a signed-in scope has cleanly migrated and uploaded to Firestore.
 */
export function cleanupUploadedLegacyAndStagingKeys(targetScope: string): string[] {
  if (!targetScope || targetScope === 'guest') return [];
  const removed: string[] = [];
  const tryRemove = (k: string | null) => {
    if (!k) return;
    if (safeStorage.getItem(k) !== null) {
      safeStorage.removeItem(k);
      removed.push(k);
    }
  };

  tryRemove(`wg_v3_premigration_snapshot_${targetScope}`);
  tryRemove('wg_v3_premigration_snapshot_guest');

  // Remove stale guest offline queue if guest scope has no pending records left
  if (!inspectGuestScopeData().hasGuestData) {
    tryRemove(getScopedStorageKey('offline-queue', 'guest'));
  }

  if (safeStorage.getItem(`${V3_MIGRATION_FLAG_PREFIX}${targetScope}`) === '1') {
    const localEmail = safeStorage.getItem('ah-gmail-user');
    const emailScope = localEmail ? localEmail.replace(/[^a-zA-Z0-9_]/g, '_') : null;

    for (const baseKey of [...ARRAY_COLLECTION_KEYS, ...SCALAR_SCOPED_KEYS]) {
      tryRemove(`ah-${baseKey}`);
      tryRemove(`ah-${baseKey}-data`);
      tryRemove(baseKey);
      if (emailScope && emailScope !== targetScope) {
        tryRemove(getScopedStorageKey(baseKey, emailScope));
      }
    }
    tryRemove('ah-driver-dost-counter');

    for (const kKey of KHATA_BASE_KEYS) {
      tryRemove(`${kKey}_${targetScope}`);
      tryRemove(kKey);
      if (emailScope && emailScope !== targetScope) {
        tryRemove(getScopedStorageKey(kKey, emailScope));
      }
    }
  }

  return removed;
}

/**
 * Strictly scoped read (#4):
 * - Runs one-time v2->v3 migration if this scope has not yet upgraded.
 * - Reads ONLY `wg_v2_<scope>_<baseKey>`.
 * - Never treats `'[]'` as missing and never refills from guest/legacy/other emails.
 */
export function getScopedItem(baseKey: string): string | null {
  const scope = getEffectiveScopeForKey(baseKey);
  runOneTimeV2ToV3Migration(scope);
  const scopedKey = getScopedStorageKey(baseKey, scope);
  return safeStorage.getItem(scopedKey);
}

/**
 * Writes data strictly to the active user/branch-scoped storage key.
 */
export function setScopedItem(baseKey: string, value: string): void {
  const scope = getEffectiveScopeForKey(baseKey);
  runOneTimeV2ToV3Migration(scope);
  const scopedKey = getScopedStorageKey(baseKey, scope);
  safeStorage.setItem(scopedKey, value);
}

/**
 * Explicitly clears a key across the active scope (plus its legacy aliases when requested).
 */
export function removeScopedItem(baseKey: string, includeLegacyAliases = true): void {
  const scope = getEffectiveScopeForKey(baseKey);
  safeStorage.removeItem(getScopedStorageKey(baseKey, scope));
  if (includeLegacyAliases) {
    safeStorage.removeItem(`${baseKey}_${scope}`);
    safeStorage.removeItem(baseKey);
    safeStorage.removeItem(`ah-${baseKey}`);
    safeStorage.removeItem(`ah-${baseKey}-data`);
  }
}
