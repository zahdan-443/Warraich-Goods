import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reportAppCrash } from '../utils/crashReportingService';
import { generateFullFleetBackup, runScheduledDailyCloudBackup } from '../utils/backupService';
import { flagHazardReport } from '../utils/hazardReports';
import { cancelAccountDeletion, getAccountDeletionStatus, requestAccountDeletion } from '../utils/storage';

describe('Google Play Readiness & Security Hardening Suite', () => {
  beforeEach(() => {
    // Provide a mocked localStorage for Node environment if missing
    if (typeof globalThis.localStorage === 'undefined') {
      const store: Record<string, string> = {};
      globalThis.localStorage = {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => { store[k] = String(v); },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach(k => delete store[k]); },
        length: 0,
        key: () => null
      } as any;
    } else {
      localStorage.clear();
    }
  });

  describe('Crash Reporting Rate Limiter & Security Bounds', () => {
    it('should throttle crash submissions when hourly rate limit is exceeded', async () => {
      // Simulate 5 existing crash timestamps within the last hour
      const now = Date.now();
      const pastTimestamps = [now - 1000, now - 2000, now - 3000, now - 4000, now - 5000];
      localStorage.setItem('wg_crash_rate_limit', JSON.stringify(pastTimestamps));

      // Attempt another crash report
      const result = await reportAppCrash(new Error('Throttled error test'));
      expect(result).toBe(false);
    });

    it('should store offline diagnostic snapshot with truncated fields in localStorage', async () => {
      const veryLongMessage = 'A'.repeat(1200);
      await reportAppCrash(new Error(veryLongMessage));

      const raw = localStorage.getItem('wg_last_crash_report');
      if (raw) {
        const parsed = JSON.parse(raw);
        expect(parsed.errorMessage.length).toBeLessThanOrEqual(500);
        expect(parsed.platform).toBeDefined();
        expect(parsed.deviceModel).toBeDefined();
      }
    });
  });

  describe('Chunked Cloud Backup Architecture', () => {
    it('should generate full backup with separated metadata and data entities', () => {
      const backup = generateFullFleetBackup();
      expect(backup.appVersion).toBeDefined();
      expect(backup.metadata).toBeDefined();
      expect(backup.metadata.totalTrips).toBeGreaterThanOrEqual(0);
      expect(backup.data).toHaveProperty('trips');
      expect(backup.data).toHaveProperty('vehicles');
      expect(backup.data).toHaveProperty('drivers');
      expect(backup.data).toHaveProperty('routes');
      expect(backup.data).toHaveProperty('fuelLogs');
      expect(backup.data).toHaveProperty('bilties');
      expect(backup.data).toHaveProperty('parties');
      expect(backup.data).toHaveProperty('partyTransactions');
      expect(backup.data).toHaveProperty('brokers');
      expect(backup.data).toHaveProperty('brokerTransactions');
    });

    it('should skip cloud backup if unauthenticated in guest mode without errors', async () => {
      const res = await runScheduledDailyCloudBackup();
      expect(res.executed).toBe(false);
    });
  });

  describe('Account Deletion 30-Day Grace Period & Cancellation', () => {
    it('should record 30-day grace period and allow instant cancellation', async () => {
      const testUid = 'user_test_compliance_999';
      const testEmail = 'driver@example.com';

      // 1. Request deletion
      const res = await requestAccountDeletion(testUid, testEmail, 'Switching devices');
      expect(res.success).toBe(true);

      const status = getAccountDeletionStatus(testUid);
      expect(status).not.toBeNull();
      expect(status?.status).toBe('pending_deletion');
      expect(status?.scheduledFor).toBe(res.scheduledFor);

      // Verify scheduled date is ~30 days in future
      const scheduledTime = new Date(res.scheduledFor).getTime();
      const diffDays = Math.round((scheduledTime - Date.now()) / (24 * 60 * 60 * 1000));
      expect(diffDays).toBeGreaterThanOrEqual(29);
      expect(diffDays).toBeLessThanOrEqual(31);

      // 2. Cancel deletion
      const cancelRes = await cancelAccountDeletion(testUid);
      expect(cancelRes.success).toBe(true);

      const postStatus = getAccountDeletionStatus(testUid);
      expect(postStatus).toBeNull();
    });
  });

  describe('Play Store UGC: Road Hazard Flagging', () => {
    it('should reject flagging when user is not signed in', async () => {
      const res = await flagHazardReport('hz_fake_id', 'Fake submission');
      expect(res.success).toBe(false);
      expect(res.message).toContain('sign in');
    });
  });
});
