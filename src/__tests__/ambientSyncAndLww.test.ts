import { describe, it, expect, beforeEach } from 'vitest';
import { 
  resolveEntityLWW, 
  enqueueOfflineAction, 
  getStoredOfflineQueue, 
  saveStoredOfflineQueue,
  getSyncStatus,
  subscribeToSyncEvents,
  notifySyncListeners
} from '../utils/storage';

describe('Ambient Sync & Last-Write-Wins (LWW) Conflict Engine', () => {
  const store: Record<string, string> = {};
  if (typeof globalThis.localStorage === 'undefined') {
    globalThis.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => { store[key] = String(val); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (i: number) => Object.keys(store)[i] || null,
      get length() { return Object.keys(store).length; }
    } as any;
  }

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    saveStoredOfflineQueue([]);
  });

  describe('resolveEntityLWW (Conflict Resolution)', () => {
    it('should select local record when local updatedAt is newer than cloud', () => {
      const localRecord = {
        id: 101,
        name: 'Lahore to Karachi (Local Edit)',
        updatedAt: '2026-11-03T10:00:00.000Z'
      };
      const cloudRecord = {
        id: 101,
        name: 'Lahore to Karachi (Old Cloud)',
        updatedAt: '2026-11-03T08:00:00.000Z'
      };

      const resolved = resolveEntityLWW(localRecord, cloudRecord);
      expect(resolved.name).toBe('Lahore to Karachi (Local Edit)');
      expect(resolved.updatedAt).toBe('2026-11-03T10:00:00.000Z');
    });

    it('should select cloud record when cloud updatedAt is newer than local stale edit', () => {
      const localRecord = {
        id: 102,
        regNo: 'LES-1234',
        model: 'Hino 2020',
        updatedAt: '2026-11-01T12:00:00.000Z'
      };
      const cloudRecord = {
        id: 102,
        regNo: 'LES-1234',
        model: 'Hino 2024 Updated from Phone B',
        updatedAt: '2026-11-02T15:00:00.000Z'
      };

      const resolved = resolveEntityLWW(localRecord, cloudRecord);
      expect(resolved.model).toBe('Hino 2024 Updated from Phone B');
    });

    it('should fall back gracefully to createdAt or date when updatedAt is omitted', () => {
      const localItem = {
        id: 103,
        date: '2026-11-03',
        fuelCost: 15000
      };
      const cloudItem = {
        id: 103,
        date: '2026-11-01',
        fuelCost: 12000
      };

      const resolved = resolveEntityLWW(localItem, cloudItem);
      expect(resolved.fuelCost).toBe(15000);
    });

    it('should retain local edits when timestamps are identical', () => {
      const sameTime = '2026-11-03T12:00:00.000Z';
      const local = { id: 104, val: 'local-version', updatedAt: sameTime };
      const cloud = { id: 104, val: 'cloud-version', updatedAt: sameTime };

      const resolved = resolveEntityLWW(local, cloud);
      expect(resolved.val).toBe('local-version');
    });
  });

  describe('Ingestion Poison-Pill Prevention', () => {
    it('should block non-owner accounts from enqueuing restricted cloud writes', () => {
      // Simulate guest / non-owner
      enqueueOfflineAction('bilty', { biltyNo: 'WG-9999' });
      enqueueOfflineAction('settings', { nameEn: 'Hack Corp' });

      const queue = getStoredOfflineQueue();
      // Should not contain bilty or settings actions
      expect(queue.some(q => q.type === 'bilty')).toBe(false);
      expect(queue.some(q => q.type === 'settings')).toBe(false);
    });

    it('should allow regular fleet operations to enqueue normally offline', () => {
      enqueueOfflineAction('trip', { id: 1, name: 'Sialkot to Rawalpindi' });
      const queue = getStoredOfflineQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].type).toBe('trip');
    });
  });

  describe('Ambient Sync State & Notification Subscription', () => {
    it('should notify subscribers when sync events trigger', () => {
      let notified = false;
      const unsubscribe = subscribeToSyncEvents(() => {
        notified = true;
      });

      notifySyncListeners();
      expect(notified).toBe(true);

      notified = false;
      unsubscribe();
      notifySyncListeners();
      expect(notified).toBe(false);
    });

    it('should report correct status based on network state without requiring manual button', () => {
      const status = getSyncStatus();
      expect(['synced', 'offline', 'syncing', 'error']).toContain(status.status);
      expect(typeof status.pendingCount).toBe('number');
    });
  });
});
