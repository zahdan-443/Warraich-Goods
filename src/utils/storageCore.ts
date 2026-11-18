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
 * Migrates any pre-existing legacy/guest/email-scoped data into `wg_v2_<scope>_*` ONCE,
 * then sets `wg_v3_migrated_<scope> = '1'` so subsequent empty lists (`[]`) are respected.
 */
export function runOneTimeV2ToV3Migration(scope: string = getActiveUserScope()): void {
  const flagKey = `${V3_MIGRATION_FLAG_PREFIX}${scope}`;
  if (safeStorage.getItem(flagKey) === '1') {
    return;
  }

  const localEmail = safeStorage.getItem('ah-gmail-user');
  const emailScope = localEmail ? localEmail.replace(/[^a-zA-Z0-9_]/g, '_') : null;

  // 1. Core array collections
  for (const baseKey of ARRAY_COLLECTION_KEYS) {
    const targetKey = getScopedStorageKey(baseKey, scope);
    const existing = safeStorage.getItem(targetKey);
    // Only populate if the user's scoped key does not exist at all yet
    if (existing !== null) continue;

    const candidates = [
      emailScope && emailScope !== scope ? getScopedStorageKey(baseKey, emailScope) : null,
      scope !== 'guest' ? getScopedStorageKey(baseKey, 'guest') : null,
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
      scope !== 'guest' ? getScopedStorageKey(baseKey, 'guest') : null,
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

  // 3. Khata collections (migrate legacy `${baseKey}_${uid}`, guest, or unscoped baseKey once)
  for (const baseKey of KHATA_BASE_KEYS) {
    const targetKey = getScopedStorageKey(baseKey, scope);
    if (safeStorage.getItem(targetKey) !== null) continue;

    const candidates = [
      scope !== 'guest' ? `${baseKey}_${scope}` : null,
      scope !== 'guest' ? getScopedStorageKey(baseKey, 'guest') : null,
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

/**
 * Strictly scoped read (#4):
 * - Runs one-time v2->v3 migration if this scope has not yet upgraded.
 * - Reads ONLY `wg_v2_<scope>_<baseKey>`.
 * - Never treats `'[]'` as missing and never refills from guest/legacy/other emails.
 */
export function getScopedItem(baseKey: string): string | null {
  const scope = getActiveUserScope();
  runOneTimeV2ToV3Migration(scope);
  const scopedKey = getScopedStorageKey(baseKey, scope);
  return safeStorage.getItem(scopedKey);
}

/**
 * Writes data strictly to the active user-scoped storage key.
 */
export function setScopedItem(baseKey: string, value: string): void {
  const scope = getActiveUserScope();
  runOneTimeV2ToV3Migration(scope);
  const scopedKey = getScopedStorageKey(baseKey, scope);
  safeStorage.setItem(scopedKey, value);
}

/**
 * Explicitly clears a key across the active scope (plus its legacy aliases when requested).
 */
export function removeScopedItem(baseKey: string, includeLegacyAliases = true): void {
  const scope = getActiveUserScope();
  safeStorage.removeItem(getScopedStorageKey(baseKey, scope));
  if (includeLegacyAliases) {
    safeStorage.removeItem(`${baseKey}_${scope}`);
    safeStorage.removeItem(baseKey);
    safeStorage.removeItem(`ah-${baseKey}`);
    safeStorage.removeItem(`ah-${baseKey}-data`);
  }
}
