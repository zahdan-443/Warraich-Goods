import { describe, it, expect, beforeEach } from 'vitest';
import { getDeviceDiagnostics, reportAppCrash } from '../utils/crashReportingService';
import { generateFullFleetBackup } from '../utils/backupService';
import * as fs from 'fs';
import * as path from 'path';

describe('Play Store Compliance, Crash Telemetry & Backup Test Suite', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Play Store Government Non-Affiliation Compliance (U-03)', () => {
    const verifyPath = path.resolve(__dirname, '../components/views/VerifyView.tsx');
    const verifyContent = fs.readFileSync(verifyPath, 'utf8');

    it('should contain prominent non-government entity declaration', () => {
      expect(verifyContent).toContain('Non-Government Entity Declaration');
      expect(verifyContent).toContain('غیر سرکاری نجی پلیٹ فارم');
      expect(verifyContent).toContain('Warraich Goods Transport Company');
    });

    it('should link directly to official government portal URLs', () => {
      expect(verifyContent).toContain('mtmis.excise.punjab.gov.pk');
      expect(verifyContent).toContain('dlims.punjab.gov.pk');
      expect(verifyContent).toContain('echallan.psca.gop.pk');
    });

    it('should have non-government disclosure in About Us modal', () => {
      const aboutPath = path.resolve(__dirname, '../components/AboutUsModal.tsx');
      const aboutContent = fs.readFileSync(aboutPath, 'utf8');
      expect(aboutContent).toContain('Non-Government Entity Declaration');
      expect(aboutContent).toContain('سرکاری عدم الحاق کا اعلان');
    });
  });

  describe('Automated Crash Reporting & Diagnostics Service', () => {
    it('should extract device diagnostics metadata', () => {
      const diag = getDeviceDiagnostics();
      expect(diag).toHaveProperty('platform');
      expect(diag).toHaveProperty('deviceModel');
      expect(diag).toHaveProperty('online');
      expect(typeof diag.platform).toBe('string');
      expect(typeof diag.deviceModel).toBe('string');
    });

    it('should throttle identical crashes within 5 minutes', async () => {
      const testErr = new Error('Test Crash Failure');
      // First report should attempt processing without crashing
      const r1 = await reportAppCrash(testErr);
      // Second identical report should be throttled
      const r2 = await reportAppCrash(testErr);
      expect(r2).toBe(false);
    });
  });

  describe('Fleet Backup & Scheduled Snapshot Service', () => {
    it('should generate complete fleet backup structure with metadata and datasets', () => {
      const backup = generateFullFleetBackup();
      expect(backup).toHaveProperty('appVersion');
      expect(backup).toHaveProperty('exportedAt');
      expect(backup).toHaveProperty('metadata');
      expect(backup).toHaveProperty('data');

      // Verify all essential operational datasets are included
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
      expect(backup.data).toHaveProperty('vehicleExpenses');
      expect(backup.data).toHaveProperty('vehicleIncomes');
    });
  });
});
