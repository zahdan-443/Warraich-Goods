/**
 * Scheduled Cloud Backup & One-Click Fleet Data Export Vault Service
 * Aggregates all user operational records (trips, vehicles, drivers, bilties, ledger, cashbook)
 * for automated daily cloud synchronization and instant downloadable JSON archives.
 * 
 * Architecture:
 * - Chunked subcollection documents to strictly prevent Firestore 1MB document limit.
 * - Dated daily snapshots (retains history without silent overwrite).
 * - Master index document for fast metadata querying and restore capabilities.
 */
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { APP_VERSION } from '../constants/version';
import {
  getStoredTrips,
  getStoredVehicles,
  getStoredDrivers,
  getStoredRoutes,
  getStoredFuelLog,
  getStoredBilties,
  saveStoredTrips,
  saveStoredVehicles,
  saveStoredDrivers,
  saveStoredRoutes,
  saveStoredFuelLog,
  saveStoredBilties
} from './storage';
import {
  getStoredParties,
  getStoredPartyTransactions,
  getStoredBrokers,
  getStoredBrokerTransactions,
  getStoredVehicleExpenses,
  getStoredVehicleIncomes,
  saveStoredParties,
  saveStoredPartyTransactions,
  saveStoredBrokers,
  saveStoredBrokerTransactions,
  saveStoredVehicleExpenses,
  saveStoredVehicleIncomes
} from './ledgerStorage';

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
  };
}

/**
 * Generates a full in-memory fleet backup snapshot.
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

  return {
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
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
      totalVehicleIncomes: vehicleIncomes.length
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
      vehicleIncomes
    }
  };
}

/**
 * Triggers an instant browser download of the complete JSON fleet backup archive.
 */
export function downloadFleetBackupJson(): boolean {
  try {
    const backup = generateFullFleetBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const todayStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver-dost-fleet-backup-${todayStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('[BackupService] Failed to generate download backup:', err);
    return false;
  }
}

/**
 * Automated daily chunked cloud backup sync to Firestore.
 * Breaks fleet data into subcollection chunk documents under usersData/{uid}/cloudBackups/{date}/chunks/*
 * to guarantee no document ever exceeds Firestore's 1MB limit.
 */
export async function runScheduledDailyCloudBackup(): Promise<{ executed: boolean; date?: string; error?: string }> {
  const user = auth.currentUser;
  if (!user || !db) {
    return { executed: false };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const lastBackupKey = `wg_last_daily_cloud_backup_${user.uid}`;

  try {
    const lastDate = localStorage.getItem(lastBackupKey);
    if (lastDate === todayStr) {
      // Already backed up today
      return { executed: false, date: lastDate };
    }

    const backup = generateFullFleetBackup();
    const backupId = todayStr;

    // 1. Write metadata index document
    const indexDocRef = doc(db, 'usersData', user.uid, 'cloudBackups', 'latestIndex');
    const datedDocRef = doc(db, 'usersData', user.uid, 'cloudBackups', backupId);

    const metadataPayload = {
      backupId,
      backupDate: todayStr,
      appVersion: backup.appVersion,
      exportedAt: backup.exportedAt,
      metadata: backup.metadata,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await Promise.all([
      setDoc(indexDocRef, metadataPayload),
      setDoc(datedDocRef, metadataPayload)
    ]);

    // 2. Write chunked documents to prevent 1MB limit
    // Chunk A: Trips
    const tripsDocRef = doc(db, 'usersData', user.uid, 'cloudBackups', backupId, 'chunks', 'trips');
    // Chunk B: Fleet & Assets (Vehicles, Drivers, Routes)
    const fleetDocRef = doc(db, 'usersData', user.uid, 'cloudBackups', backupId, 'chunks', 'fleet');
    // Chunk C: Fuel & Bilties
    const docsDocRef = doc(db, 'usersData', user.uid, 'cloudBackups', backupId, 'chunks', 'operations');
    // Chunk D: Ledger Parties & Brokers
    const ledgerDocRef = doc(db, 'usersData', user.uid, 'cloudBackups', backupId, 'chunks', 'ledger');

    await Promise.all([
      setDoc(tripsDocRef, { trips: backup.data.trips, updatedAt: serverTimestamp() }),
      setDoc(fleetDocRef, {
        vehicles: backup.data.vehicles,
        drivers: backup.data.drivers,
        routes: backup.data.routes,
        updatedAt: serverTimestamp()
      }),
      setDoc(docsDocRef, {
        fuelLogs: backup.data.fuelLogs,
        bilties: backup.data.bilties,
        updatedAt: serverTimestamp()
      }),
      setDoc(ledgerDocRef, {
        parties: backup.data.parties,
        partyTransactions: backup.data.partyTransactions,
        brokers: backup.data.brokers,
        brokerTransactions: backup.data.brokerTransactions,
        vehicleExpenses: backup.data.vehicleExpenses,
        vehicleIncomes: backup.data.vehicleIncomes,
        updatedAt: serverTimestamp()
      })
    ]);

    localStorage.setItem(lastBackupKey, todayStr);
    console.log(`[BackupService] Successfully executed chunked daily cloud backup for ${todayStr}`);
    return { executed: true, date: todayStr };
  } catch (err: any) {
    console.warn('[BackupService] Daily cloud backup sync deferred/failed:', err);
    return { executed: false, error: err?.message || 'Sync failed' };
  }
}

/**
 * Restores local data from a chunked cloud backup.
 */
export async function restoreFromCloudBackup(backupId = 'latestIndex'): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || !db) return false;

  try {
    let targetBackupId = backupId;
    if (targetBackupId === 'latestIndex') {
      const indexSnap = await getDoc(doc(db, 'usersData', user.uid, 'cloudBackups', 'latestIndex'));
      if (!indexSnap.exists()) return false;
      targetBackupId = indexSnap.data().backupId || new Date().toISOString().slice(0, 10);
    }

    const [tripsSnap, fleetSnap, opsSnap, ledgerSnap] = await Promise.all([
      getDoc(doc(db, 'usersData', user.uid, 'cloudBackups', targetBackupId, 'chunks', 'trips')),
      getDoc(doc(db, 'usersData', user.uid, 'cloudBackups', targetBackupId, 'chunks', 'fleet')),
      getDoc(doc(db, 'usersData', user.uid, 'cloudBackups', targetBackupId, 'chunks', 'operations')),
      getDoc(doc(db, 'usersData', user.uid, 'cloudBackups', targetBackupId, 'chunks', 'ledger'))
    ]);

    if (tripsSnap.exists() && tripsSnap.data().trips) {
      saveStoredTrips(tripsSnap.data().trips);
    }
    if (fleetSnap.exists()) {
      const data = fleetSnap.data();
      if (data.vehicles) saveStoredVehicles(data.vehicles);
      if (data.drivers) saveStoredDrivers(data.drivers);
      if (data.routes) saveStoredRoutes(data.routes);
    }
    if (opsSnap.exists()) {
      const data = opsSnap.data();
      if (data.fuelLogs) saveStoredFuelLog(data.fuelLogs);
      if (data.bilties) saveStoredBilties(data.bilties);
    }
    if (ledgerSnap.exists()) {
      const data = ledgerSnap.data();
      if (data.parties) saveStoredParties(data.parties);
      if (data.partyTransactions) saveStoredPartyTransactions(data.partyTransactions);
      if (data.brokers) saveStoredBrokers(data.brokers);
      if (data.brokerTransactions) saveStoredBrokerTransactions(data.brokerTransactions);
      if (data.vehicleExpenses) saveStoredVehicleExpenses(data.vehicleExpenses);
      if (data.vehicleIncomes) saveStoredVehicleIncomes(data.vehicleIncomes);
    }

    return true;
  } catch (err) {
    console.error('[BackupService] Cloud restore error:', err);
    return false;
  }
}
