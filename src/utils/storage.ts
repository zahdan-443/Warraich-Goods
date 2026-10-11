export function restoreFullBackupFromJson(jsonString: string): { success: boolean; message: string; count: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid backup file format', count: 0 };
    }
    let restoredCount = 0;
    if (Array.isArray(data.bilties) && data.bilties.length > 0) {
      const existing = getStoredBilties();
      const map = new Map<string, BiltyRecord>();
      existing.forEach(b => { if (b.biltyNo) map.set(b.biltyNo, b); });
      data.bilties.forEach((b: BiltyRecord) => {
        if (b.biltyNo) {
          map.set(b.biltyNo, b);
          restoredCount++;
        }
      });
      const merged = Array.from(map.values());
      setScopedItem('bilties', JSON.stringify(merged));
      saveStoredBilties(merged);
    }
    if (Array.isArray(data.trips) && data.trips.length > 0) {
      const trips = data.trips as Trip[];
      setScopedItem('trips', JSON.stringify(trips));
      saveStoredTrips(trips);
    }
    if (Array.isArray(data.vehicles) && data.vehicles.length > 0) {
      const vehicles = data.vehicles as Vehicle[];
      setScopedItem('vehicles', JSON.stringify(vehicles));
      saveStoredVehicles(vehicles);
    }
    if (data.company) {
      safeStorage.setItem('ah-company-profile', JSON.stringify(data.company));
    }
    logActivity('Backup Restored', `Restored ${restoredCount} bilty records from backup`, 'settings');
    return { success: true, message: 'Backup successfully restored!', count: restoredCount };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to restore backup', count: 0 };
  }
}
