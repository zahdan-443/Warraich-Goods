/**
 * Scheduled Cloud Backup & One-Click Fleet Data Export Vault Service
 * Aggregates all user operational records (trips, vehicles, drivers, bilties, ledger, cashbook)
 * for automated daily cloud synchronization and instant downloadable JSON archives.
 */
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { APP_VERSION } from '../constants/version';
import {
  getStoredTrips,
  getStoredVehicles,
  getStoredDrivers,
  getStoredRoutes,
  getStoredFuelLog,
  getStoredBilties
} from './storage';
import {
  getStoredParties,
  getStoredPartyTransactions,
  getStoredBrokers,
  getStoredBrokerTransactions,
  getStoredVehicleExpenses,
  getStoredVehicleIncomes
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
 * Automated daily cloud backup sync to Firestore under usersData/{uid}/backups/latest.
 * Ensures data is backed up once per calendar day when the app is active and online.
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
    const backupDocRef = doc(db, 'usersData', user.uid, 'backups', 'latest');

    await setDoc(backupDocRef, {
      ...backup,
      createdAt: serverTimestamp(),
      backupDate: todayStr
    });

    localStorage.setItem(lastBackupKey, todayStr);
    console.log(`[BackupService] Successfully executed daily cloud backup for ${todayStr}`);
    return { executed: true, date: todayStr };
  } catch (err: any) {
    console.warn('[BackupService] Daily cloud backup sync deferred/failed:', err);
    return { executed: false, error: err?.message || 'Sync failed' };
  }
}
