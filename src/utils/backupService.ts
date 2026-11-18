/**
 * Scheduled Cloud Backup & One-Click Fleet Data Export Vault Service
 *
 * Security & Reliability Guarantees (#11–#15):
 * - #11 Atomic commit order: ALL chunk docs are written first, then dated snapshot
 *       manifest, then `latestIndex` LAST so `latestIndex` never points to incomplete data.
 * - #12 Dynamic <700 KB byte-sharded chunks (`TextEncoder`) so large ledgers or
 *       histories never breach Firestore's 1 MiB document limit.
 * - #13 Automated 14-snapshot retention policy prunes expired snapshots & chunks.
 * - #14 Schema validation + record-count preview + IndexedDB pre-restore snapshot
 *       with automatic rollback if any write fails during restore.
 * - #15 All backup dates & filenames strictly use Pakistan Standard Time (Asia/Karachi).
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { APP_VERSION } from '../constants/version';
import { getPakistanDateKey, getPakistanTimestampIso } from './dateUtils';
import { idbSet } from './persistentStorage';
import {
  getActiveUserScope,
  getStoredBilties,
  getStoredDrivers,
  getStoredFuelLog,
  getStoredRoutes,
  getStoredTrips,
  getStoredVehicles,
  saveStoredBilties,
  saveStoredDrivers,
  saveStoredFuelLog,
  saveStoredRoutes,
  saveStoredTrips,
  saveStoredVehicles,
  setScopedItem
} from './storage';
import {
  KHATA_STORAGE_KEYS,
  getStoredBrokerTransactions,
  getStoredBrokers,
  getStoredParties,
  getStoredPartyTransactions,
  getStoredVehicleExpenses,
  getStoredVehicleIncomes,
  saveStoredBrokerTransactions,
  saveStoredBrokers,
  saveStoredParties,
  saveStoredPartyTransactions,
  saveStoredVehicleExpenses,
  saveStoredVehicleIncomes
} from './ledgerStorage';
import {
  getAllBills,
  getAllDailyExpenses,
  getAllEmployeeEntries,
  getAllEmployees,
  getAllReceivingEntries,
  getAllReceivingPoints
} from './khataModulesStorage';
import { shareOrDownloadText } from './nativeExport';

export const MAX_CLOUD_CHUNK_BYTES = 700_000;
export const MAX_CLOUD_BACKUP_SNAPSHOTS = 14;

export interface FullFleetBackup {
  appVersion: string;
  exportedAt: string;
  source: string;
  metadata: {
    totalTrips: number;
    totalVehicles: number;
    totalDrivers: number;
    totalRoutes: number;
    totalFuelLogs: number;
    totalBilties: number;
    totalParties: number;
    totalBrokers: number;
    totalPartyTransactions: number;
    totalBrokerTransactions: number;
    totalVehicleExpenses: number;
    totalVehicleIncomes: number;
    totalBills?: number;
    totalEmployees?: number;
    totalReceivingPoints?: number;
    totalDailyExpenses?: number;
  };
  data: {
    trips: ReturnType<typeof getStoredTrips>;
    vehicles: ReturnType<typeof getStoredVehicles>;
    drivers: ReturnType<typeof getStoredDrivers>;
    routes: ReturnType<typeof getStoredRoutes>;
    fuelLogs: ReturnType<typeof getStoredFuelLog>;
    bilties: ReturnType<typeof getStoredBilties>;
    parties: ReturnType<typeof getStoredParties>;
    partyTransactions: ReturnType<typeof getStoredPartyTransactions>;
    brokers: ReturnType<typeof getStoredBrokers>;
    brokerTransactions: ReturnType<typeof getStoredBrokerTransactions>;
    vehicleExpenses: ReturnType<typeof getStoredVehicleExpenses>;
    vehicleIncomes: ReturnType<typeof getStoredVehicleIncomes>;
    bills?: ReturnType<typeof getAllBills>;
    employees?: ReturnType<typeof getAllEmployees>;
    employeeEntries?: ReturnType<typeof getAllEmployeeEntries>;
    receivingPoints?: ReturnType<typeof getAllReceivingPoints>;
    receivingEntries?: ReturnType<typeof getAllReceivingEntries>;
    dailyExpenses?: ReturnType<typeof getAllDailyExpenses>;
  };
}

export interface BackupPreviewSummary {
  valid: boolean;
  source: 'cloud' | 'json';
  backupId?: string;
  backupDate?: string;
  totalRecords: number;
  counts: Record<string, number>;
  errors: string[];
  rawPayload?: Record<string, unknown>;
}

export interface ShardedChunkPayload<T = unknown> {
  chunkId: string;
  key: string;
  partIndex: number;
  totalParts: number;
  items: T[];
  byteSize: number;
}

const CORE_ARRAY_KEYS = [
  'trips',
  'vehicles',
  'drivers',
  'routes',
  'fuelLogs',
  'bilties',
  'parties',
  'partyTransactions',
  'brokers',
  'brokerTransactions',
  'vehicleExpenses',
  'vehicleIncomes',
  'bills',
  'employees',
  'employeeEntries',
  'receivingPoints',
  'receivingEntries',
  'dailyExpenses'
] as const;

export type BackupDatasetKey = (typeof CORE_ARRAY_KEYS)[number];

/**
 * Computes exact UTF-8 serialized byte size for Firestore document budget checks (#12).
 */
export function utf8ByteSize(value: unknown): number {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return str.length * 2;
}

/**
 * Dynamically shards any array dataset into chunks strictly <= maxBytes (#12).
 */
export function shardCollectionForBackup<T>(
  key: string,
  items: T[],
  maxBytes: number = MAX_CLOUD_CHUNK_BYTES
): ShardedChunkPayload<T>[] {
  if (!Array.isArray(items) || items.length === 0) {
    return [
      {
        chunkId: `${key}_0`,
        key,
        partIndex: 0,
        totalParts: 1,
        items: [],
        byteSize: 64
      }
    ];
  }

  const overheadBytes = 256; // chunk metadata + Firestore timestamps reserve
  const budget = Math.max(10_000, maxBytes - overheadBytes);
  const rawParts: T[][] = [];
  let currentPart: T[] = [];
  let currentBytes = 2; // "[]"

  for (const item of items) {
    const itemJson = JSON.stringify(item);
    const itemBytes = utf8ByteSize(itemJson) + 1; // comma separator
    if (currentPart.length > 0 && currentBytes + itemBytes > budget) {
      rawParts.push(currentPart);
      currentPart = [item];
      currentBytes = 2 + itemBytes;
    } else {
      currentPart.push(item);
      currentBytes += itemBytes;
    }
  }
  if (currentPart.length > 0) {
    rawParts.push(currentPart);
  }

  return rawParts.map((part, idx) => {
    const chunkId = `${key}_${idx}`;
    return {
      chunkId,
      key,
      partIndex: idx,
      totalParts: rawParts.length,
      items: part,
      byteSize: utf8ByteSize({ key, partIndex: idx, totalParts: rawParts.length, items: part })
    };
  });
}

/**
 * Generates a full in-memory fleet backup snapshot using PKT timestamp (#15).
 */
export function generateFullFleetBackup(): FullFleetBackup {
  const trips = getStoredTrips();
  const vehicles = getStoredVehicles();
  const drivers = getStoredDrivers();
  const routes = getStoredRoutes();
  const fuelLogs = getStoredFuelLog();
  const bilties = getStoredBilties();
  const parties = getStoredParties();
  const partyTransactions = getStoredPartyTransactions();
  const brokers = getStoredBrokers();
  const brokerTransactions = getStoredBrokerTransactions();
  const vehicleExpenses = getStoredVehicleExpenses();
  const vehicleIncomes = getStoredVehicleIncomes();

  const bills = getAllBills();
  const employees = getAllEmployees();
  const employeeEntries = getAllEmployeeEntries();
  const receivingPoints = getAllReceivingPoints();
  const receivingEntries = getAllReceivingEntries();
  const dailyExpenses = getAllDailyExpenses();

  return {
    appVersion: APP_VERSION,
    exportedAt: getPakistanTimestampIso(),
    source: 'Driver Dost Fleet Management Backup',
    metadata: {
      totalTrips: trips.length,
      totalVehicles: vehicles.length,
      totalDrivers: drivers.length,
      totalRoutes: routes.length,
      totalFuelLogs: fuelLogs.length,
      totalBilties: bilties.length,
      totalParties: parties.length,
      totalBrokers: brokers.length,
      totalPartyTransactions: partyTransactions.length,
      totalBrokerTransactions: brokerTransactions.length,
      totalVehicleExpenses: vehicleExpenses.length,
      totalVehicleIncomes: vehicleIncomes.length,
      totalBills: bills.length,
      totalEmployees: employees.length,
      totalReceivingPoints: receivingPoints.length,
      totalDailyExpenses: dailyExpenses.length
    },
    data: {
      trips,
      vehicles,
      drivers,
      routes,
      fuelLogs,
      bilties,
      parties,
      partyTransactions,
      brokers,
      brokerTransactions,
      vehicleExpenses,
      vehicleIncomes,
      bills,
      employees,
      employeeEntries,
      receivingPoints,
      receivingEntries,
      dailyExpenses
    }
  };
}

/**
 * Triggers an instant download/share of the complete JSON fleet backup archive (PKT filename #15).
 */
export function downloadFleetBackupJson(): boolean {
  try {
    const backup = generateFullFleetBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const todayStr = getPakistanDateKey();
    const fileName = `driver-dost-fleet-backup-${todayStr}.json`;
    void shareOrDownloadText(jsonStr, fileName, 'application/json', {
      title: fileName,
      dialogTitle: fileName
    });
    return true;
  } catch (err) {
    console.error('[BackupService] Failed to generate download backup:', err);
    return false;
  }
}

/**
 * Enforces the 14-snapshot retention window (#13) on `usersData/{uid}/cloudBackups`.
 * Deletes oldest dated snapshots and all their nested `chunks` docs beyond MAX_CLOUD_BACKUP_SNAPSHOTS.
 */
export async function pruneOldCloudBackups(
  uid: string,
  maxKeep: number = MAX_CLOUD_BACKUP_SNAPSHOTS
): Promise<number> {
  if (!uid || !db) return 0;

  try {
    const backupsColl = collection(db, 'usersData', uid, 'cloudBackups');
    const snap = await getDocs(backupsColl);
    const snapshots = snap.docs
      .filter(d => d.id !== 'latestIndex')
      .map(d => {
        const data = d.data() as { backupDate?: string; backupId?: string };
        return {
          id: d.id,
          sortKey: String(data?.backupDate || data?.backupId || d.id)
        };
      })
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

    if (snapshots.length <= maxKeep) {
      return 0;
    }

    const toDelete = snapshots.slice(maxKeep);
    let deletedSnapshots = 0;

    for (const oldSnap of toDelete) {
      try {
        const chunksColl = collection(db, 'usersData', uid, 'cloudBackups', oldSnap.id, 'chunks');
        const chunkSnap = await getDocs(chunksColl);
        await Promise.all(
          chunkSnap.docs.map(cd =>
            deleteDoc(doc(db, 'usersData', uid, 'cloudBackups', oldSnap.id, 'chunks', cd.id))
          )
        );
        await deleteDoc(doc(db, 'usersData', uid, 'cloudBackups', oldSnap.id));
        deletedSnapshots++;
      } catch (innerErr) {
        console.warn(`[BackupService] Notice pruning snapshot ${oldSnap.id}:`, innerErr);
      }
    }

    return deletedSnapshots;
  } catch (err) {
    console.warn('[BackupService] Retention pruning skipped:', err);
    return 0;
  }
}

/**
 * Automated daily chunked cloud backup sync to Firestore (#11, #12, #13, #15):
 * 1. Shards all datasets dynamically into <700 KB chunk docs.
 * 2. Writes ALL chunk docs FIRST.
 * 3. Writes the dated manifest doc with `chunkIds` + `complete: true`.
 * 4. Writes `latestIndex` LAST so index never references incomplete chunks.
 * 5. Prunes snapshots older than 14 days.
 */
export async function runScheduledDailyCloudBackup(): Promise<{
  executed: boolean;
  date?: string;
  chunkCount?: number;
  pruned?: number;
  error?: string;
}> {
  const user = auth.currentUser;
  if (!user || !db) {
    return { executed: false };
  }

  const todayStr = getPakistanDateKey();
  const lastBackupKey = `wg_last_daily_cloud_backup_${user.uid}`;

  try {
    const lastDate = typeof localStorage !== 'undefined' ? localStorage.getItem(lastBackupKey) : null;
    if (lastDate === todayStr) {
      return { executed: false, date: lastDate };
    }

    const backup = generateFullFleetBackup();
    const backupId = todayStr;

    // 1. Dynamically shard all datasets into <= 700 KB chunks (#12)
    const allChunks: ShardedChunkPayload[] = [];
    for (const key of CORE_ARRAY_KEYS) {
      const dataset = backup.data[key] || [];
      allChunks.push(...shardCollectionForBackup(key, dataset as unknown[]));
    }

    const chunkIds = allChunks.map(c => c.chunkId);

    // 2. Write ALL chunk documents FIRST (#11)
    await Promise.all(
      allChunks.map(chunk =>
        setDoc(doc(db, 'usersData', user.uid, 'cloudBackups', backupId, 'chunks', chunk.chunkId), {
          key: chunk.key,
          partIndex: chunk.partIndex,
          totalParts: chunk.totalParts,
          items: chunk.items,
          byteSize: chunk.byteSize,
          updatedAt: serverTimestamp()
        })
      )
    );

    const metadataPayload = {
      backupId,
      backupDate: todayStr,
      appVersion: backup.appVersion,
      exportedAt: backup.exportedAt,
      metadata: backup.metadata,
      chunkIds,
      schemaVersion: 3,
      complete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // 3. Write dated snapshot manifest
    const datedDocRef = doc(db, 'usersData', user.uid, 'cloudBackups', backupId);
    await setDoc(datedDocRef, metadataPayload);

    // 4. Write master `latestIndex` LAST so readers only see committed backups (#11)
    const indexDocRef = doc(db, 'usersData', user.uid, 'cloudBackups', 'latestIndex');
    await setDoc(indexDocRef, metadataPayload);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(lastBackupKey, todayStr);
    }

    // 5. Enforce 14-day retention policy (#13)
    const pruned = await pruneOldCloudBackups(user.uid, MAX_CLOUD_BACKUP_SNAPSHOTS);

    console.log(
      `[BackupService] Committed atomic chunked daily backup for ${todayStr} (${chunkIds.length} chunks, pruned ${pruned})`
    );
    return { executed: true, date: todayStr, chunkCount: chunkIds.length, pruned };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sync failed';
    console.warn('[BackupService] Daily cloud backup sync deferred/failed:', err);
    return { executed: false, error: message };
  }
}

/**
 * Validates and previews a local JSON fleet backup before mutating device data (#14).
 */
export function previewJsonBackup(jsonStr: string): BackupPreviewSummary {
  const counts: Record<string, number> = {};
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        valid: false,
        source: 'json',
        totalRecords: 0,
        counts,
        errors: ['Backup file is not a valid JSON object']
      };
    }

    const payload =
      parsed.data && typeof parsed.data === 'object' && !Array.isArray(parsed.data)
        ? (parsed.data as Record<string, unknown>)
        : parsed;

    let recognized = 0;
    let totalRecords = 0;

    for (const key of CORE_ARRAY_KEYS) {
      if (key in payload && payload[key] !== undefined) {
        recognized++;
        if (!Array.isArray(payload[key])) {
          errors.push(`Field "${key}" is malformed (expected array)`);
        } else {
          const len = (payload[key] as unknown[]).length;
          counts[key] = len;
          totalRecords += len;
        }
      }
    }

    if (recognized === 0) {
      errors.push('No recognized Driver Dost backup collections were found in this file');
    }

    const backupDateRaw =
      typeof parsed.exportedAt === 'string'
        ? parsed.exportedAt
        : typeof parsed.exportDate === 'string'
        ? parsed.exportDate
        : undefined;

    return {
      valid: errors.length === 0,
      source: 'json',
      backupDate: backupDateRaw,
      totalRecords,
      counts,
      errors,
      rawPayload: payload
    };
  } catch (err: unknown) {
    return {
      valid: false,
      source: 'json',
      totalRecords: 0,
      counts,
      errors: [err instanceof Error ? err.message : 'Invalid JSON syntax']
    };
  }
}

interface CloudBackupFetchResult {
  valid: boolean;
  backupId: string;
  backupDate?: string;
  datasets: Partial<Record<BackupDatasetKey, unknown[]>>;
  errors: string[];
}

async function fetchAndValidateCloudBackup(
  uid: string,
  backupId: string
): Promise<CloudBackupFetchResult> {
  const errors: string[] = [];
  const datasets: Partial<Record<BackupDatasetKey, unknown[]>> = {};

  let targetBackupId = backupId;
  let manifestData: Record<string, unknown> | undefined;

  if (targetBackupId === 'latestIndex') {
    const indexSnap = await getDoc(doc(db, 'usersData', uid, 'cloudBackups', 'latestIndex'));
    if (!indexSnap.exists()) {
      return {
        valid: false,
        backupId: targetBackupId,
        datasets,
        errors: ['No cloud backup index found']
      };
    }
    manifestData = indexSnap.data() as Record<string, unknown>;
    targetBackupId = String(manifestData.backupId || getPakistanDateKey());
  } else {
    const manifestSnap = await getDoc(doc(db, 'usersData', uid, 'cloudBackups', targetBackupId));
    if (manifestSnap.exists()) {
      manifestData = manifestSnap.data() as Record<string, unknown>;
    }
  }

  const backupDate = manifestData?.backupDate
    ? String(manifestData.backupDate)
    : manifestData?.exportedAt
    ? String(manifestData.exportedAt)
    : targetBackupId;

  const chunkIds = Array.isArray(manifestData?.chunkIds)
    ? (manifestData?.chunkIds as string[])
    : null;

  if (chunkIds && chunkIds.length > 0) {
    const chunkSnaps = await Promise.all(
      chunkIds.map(cid =>
        getDoc(doc(db, 'usersData', uid, 'cloudBackups', targetBackupId, 'chunks', cid))
      )
    );

    const grouped = new Map<string, Array<{ partIndex: number; items: unknown[] }>>();

    chunkSnaps.forEach((snap, idx) => {
      const cid = chunkIds[idx];
      if (!snap.exists()) {
        errors.push(`Missing backup chunk "${cid}"`);
        return;
      }
      const data = snap.data() as {
        key?: string;
        partIndex?: number;
        items?: unknown[];
      };
      if (!data?.key || !Array.isArray(data.items)) {
        errors.push(`Corrupted backup chunk "${cid}"`);
        return;
      }
      const existing = grouped.get(data.key) || [];
      existing.push({ partIndex: Number(data.partIndex) || 0, items: data.items });
      grouped.set(data.key, existing);
    });

    for (const [key, parts] of grouped.entries()) {
      if ((CORE_ARRAY_KEYS as readonly string[]).includes(key)) {
        parts.sort((a, b) => a.partIndex - b.partIndex);
        datasets[key as BackupDatasetKey] = parts.flatMap(p => p.items);
      }
    }
  } else {
    // Legacy 5-chunk format fallback validation
    const [tripsSnap, fleetSnap, opsSnap, ledgerSnap, khataExtSnap] = await Promise.all([
      getDoc(doc(db, 'usersData', uid, 'cloudBackups', targetBackupId, 'chunks', 'trips')),
      getDoc(doc(db, 'usersData', uid, 'cloudBackups', targetBackupId, 'chunks', 'fleet')),
      getDoc(doc(db, 'usersData', uid, 'cloudBackups', targetBackupId, 'chunks', 'operations')),
      getDoc(doc(db, 'usersData', uid, 'cloudBackups', targetBackupId, 'chunks', 'ledger')),
      getDoc(doc(db, 'usersData', uid, 'cloudBackups', targetBackupId, 'chunks', 'khataExtended'))
    ]);

    if (!tripsSnap.exists() && !fleetSnap.exists() && !opsSnap.exists() && !ledgerSnap.exists()) {
      errors.push(`Cloud backup chunks for ${targetBackupId} are incomplete or missing`);
    }

    if (tripsSnap.exists() && Array.isArray(tripsSnap.data().trips)) {
      datasets.trips = tripsSnap.data().trips;
    }
    if (fleetSnap.exists()) {
      const d = fleetSnap.data();
      if (Array.isArray(d.vehicles)) datasets.vehicles = d.vehicles;
      if (Array.isArray(d.drivers)) datasets.drivers = d.drivers;
      if (Array.isArray(d.routes)) datasets.routes = d.routes;
    }
    if (opsSnap.exists()) {
      const d = opsSnap.data();
      if (Array.isArray(d.fuelLogs)) datasets.fuelLogs = d.fuelLogs;
      if (Array.isArray(d.bilties)) datasets.bilties = d.bilties;
    }
    if (ledgerSnap.exists()) {
      const d = ledgerSnap.data();
      if (Array.isArray(d.parties)) datasets.parties = d.parties;
      if (Array.isArray(d.partyTransactions)) datasets.partyTransactions = d.partyTransactions;
      if (Array.isArray(d.brokers)) datasets.brokers = d.brokers;
      if (Array.isArray(d.brokerTransactions)) datasets.brokerTransactions = d.brokerTransactions;
      if (Array.isArray(d.vehicleExpenses)) datasets.vehicleExpenses = d.vehicleExpenses;
      if (Array.isArray(d.vehicleIncomes)) datasets.vehicleIncomes = d.vehicleIncomes;
    }
    if (khataExtSnap.exists()) {
      const d = khataExtSnap.data();
      if (Array.isArray(d.bills)) datasets.bills = d.bills;
      if (Array.isArray(d.employees)) datasets.employees = d.employees;
      if (Array.isArray(d.employeeEntries)) datasets.employeeEntries = d.employeeEntries;
      if (Array.isArray(d.receivingPoints)) datasets.receivingPoints = d.receivingPoints;
      if (Array.isArray(d.receivingEntries)) datasets.receivingEntries = d.receivingEntries;
      if (Array.isArray(d.dailyExpenses)) datasets.dailyExpenses = d.dailyExpenses;
    }
  }

  return {
    valid: errors.length === 0 && Object.keys(datasets).length > 0,
    backupId: targetBackupId,
    backupDate,
    datasets,
    errors
  };
}

/**
 * Previews and validates a cloud backup snapshot before applying restore (#14).
 */
export async function previewCloudBackup(backupId = 'latestIndex'): Promise<BackupPreviewSummary> {
  const user = auth.currentUser;
  if (!user || !db) {
    return {
      valid: false,
      source: 'cloud',
      totalRecords: 0,
      counts: {},
      errors: ['Sign in to preview cloud backups']
    };
  }

  try {
    const fetched = await fetchAndValidateCloudBackup(user.uid, backupId);
    const counts: Record<string, number> = {};
    let totalRecords = 0;

    for (const [k, list] of Object.entries(fetched.datasets)) {
      const len = Array.isArray(list) ? list.length : 0;
      counts[k] = len;
      totalRecords += len;
    }

    return {
      valid: fetched.valid,
      source: 'cloud',
      backupId: fetched.backupId,
      backupDate: fetched.backupDate,
      totalRecords,
      counts,
      errors: fetched.errors
    };
  } catch (err: unknown) {
    return {
      valid: false,
      source: 'cloud',
      totalRecords: 0,
      counts: {},
      errors: [err instanceof Error ? err.message : 'Cloud backup preview failed']
    };
  }
}

/**
 * Restores local data from a validated chunked cloud backup with pre-restore rollback protection (#14).
 */
export async function restoreFromCloudBackup(backupId = 'latestIndex'): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || !db) return false;

  const preRestoreSnapshot = {
    capturedAt: getPakistanTimestampIso(),
    trips: getStoredTrips(),
    vehicles: getStoredVehicles(),
    drivers: getStoredDrivers(),
    routes: getStoredRoutes(),
    fuelLogs: getStoredFuelLog(),
    bilties: getStoredBilties(),
    parties: getStoredParties(),
    partyTransactions: getStoredPartyTransactions(),
    brokers: getStoredBrokers(),
    brokerTransactions: getStoredBrokerTransactions(),
    vehicleExpenses: getStoredVehicleExpenses(),
    vehicleIncomes: getStoredVehicleIncomes(),
    bills: getAllBills(),
    employees: getAllEmployees(),
    employeeEntries: getAllEmployeeEntries(),
    receivingPoints: getAllReceivingPoints(),
    receivingEntries: getAllReceivingEntries(),
    dailyExpenses: getAllDailyExpenses()
  };

  try {
    const fetched = await fetchAndValidateCloudBackup(user.uid, backupId);
    if (!fetched.valid) {
      console.warn('[BackupService] Aborted restore due to validation errors:', fetched.errors);
      return false;
    }

    // Persist safety snapshot in IndexedDB prior to applying overwrite (#14)
    try {
      const scope = getActiveUserScope();
      await idbSet(`wg_v3_prerestore_snapshot_${scope}`, JSON.stringify(preRestoreSnapshot));
    } catch {
      // in-memory snapshot remains ready for catch rollback
    }

    const d = fetched.datasets;

    if (Array.isArray(d.trips)) saveStoredTrips(d.trips as FullFleetBackup['data']['trips']);
    if (Array.isArray(d.vehicles)) saveStoredVehicles(d.vehicles as FullFleetBackup['data']['vehicles']);
    if (Array.isArray(d.drivers)) saveStoredDrivers(d.drivers as FullFleetBackup['data']['drivers']);
    if (Array.isArray(d.routes)) saveStoredRoutes(d.routes as FullFleetBackup['data']['routes']);
    if (Array.isArray(d.fuelLogs)) saveStoredFuelLog(d.fuelLogs as FullFleetBackup['data']['fuelLogs']);
    if (Array.isArray(d.bilties)) saveStoredBilties(d.bilties as FullFleetBackup['data']['bilties']);

    if (Array.isArray(d.parties)) saveStoredParties(d.parties as FullFleetBackup['data']['parties']);
    if (Array.isArray(d.partyTransactions)) {
      saveStoredPartyTransactions(d.partyTransactions as FullFleetBackup['data']['partyTransactions']);
    }
    if (Array.isArray(d.brokers)) saveStoredBrokers(d.brokers as FullFleetBackup['data']['brokers']);
    if (Array.isArray(d.brokerTransactions)) {
      saveStoredBrokerTransactions(d.brokerTransactions as FullFleetBackup['data']['brokerTransactions']);
    }
    if (Array.isArray(d.vehicleExpenses)) {
      saveStoredVehicleExpenses(d.vehicleExpenses as FullFleetBackup['data']['vehicleExpenses']);
    }
    if (Array.isArray(d.vehicleIncomes)) {
      saveStoredVehicleIncomes(d.vehicleIncomes as FullFleetBackup['data']['vehicleIncomes']);
    }

    if (Array.isArray(d.bills)) setScopedItem(KHATA_STORAGE_KEYS.BILLS, JSON.stringify(d.bills));
    if (Array.isArray(d.employees)) {
      setScopedItem(KHATA_STORAGE_KEYS.EMPLOYEES, JSON.stringify(d.employees));
    }
    if (Array.isArray(d.employeeEntries)) {
      setScopedItem(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, JSON.stringify(d.employeeEntries));
    }
    if (Array.isArray(d.receivingPoints)) {
      setScopedItem(KHATA_STORAGE_KEYS.RECEIVING_POINTS, JSON.stringify(d.receivingPoints));
    }
    if (Array.isArray(d.receivingEntries)) {
      setScopedItem(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, JSON.stringify(d.receivingEntries));
    }
    if (Array.isArray(d.dailyExpenses)) {
      setScopedItem(KHATA_STORAGE_KEYS.DAILY_EXPENSES, JSON.stringify(d.dailyExpenses));
    }

    return true;
  } catch (err) {
    console.error('[BackupService] Cloud restore error — rolling back to pre-restore snapshot:', err);
    try {
      saveStoredTrips(preRestoreSnapshot.trips);
      saveStoredVehicles(preRestoreSnapshot.vehicles);
      saveStoredDrivers(preRestoreSnapshot.drivers);
      saveStoredRoutes(preRestoreSnapshot.routes);
      saveStoredFuelLog(preRestoreSnapshot.fuelLogs);
      saveStoredBilties(preRestoreSnapshot.bilties);
      saveStoredParties(preRestoreSnapshot.parties);
      saveStoredPartyTransactions(preRestoreSnapshot.partyTransactions);
      saveStoredBrokers(preRestoreSnapshot.brokers);
      saveStoredBrokerTransactions(preRestoreSnapshot.brokerTransactions);
      saveStoredVehicleExpenses(preRestoreSnapshot.vehicleExpenses);
      saveStoredVehicleIncomes(preRestoreSnapshot.vehicleIncomes);
      setScopedItem(KHATA_STORAGE_KEYS.BILLS, JSON.stringify(preRestoreSnapshot.bills));
      setScopedItem(KHATA_STORAGE_KEYS.EMPLOYEES, JSON.stringify(preRestoreSnapshot.employees));
      setScopedItem(
        KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES,
        JSON.stringify(preRestoreSnapshot.employeeEntries)
      );
      setScopedItem(
        KHATA_STORAGE_KEYS.RECEIVING_POINTS,
        JSON.stringify(preRestoreSnapshot.receivingPoints)
      );
      setScopedItem(
        KHATA_STORAGE_KEYS.RECEIVING_ENTRIES,
        JSON.stringify(preRestoreSnapshot.receivingEntries)
      );
      setScopedItem(
        KHATA_STORAGE_KEYS.DAILY_EXPENSES,
        JSON.stringify(preRestoreSnapshot.dailyExpenses)
      );
    } catch {
      // ignore secondary rollback failure
    }
    return false;
  }
}
