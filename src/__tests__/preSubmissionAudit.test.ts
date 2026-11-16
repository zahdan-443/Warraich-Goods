import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const mocks = vi.hoisted(() => ({
  isNativePlatform: vi.fn(() => false),
  writeFile: vi.fn(async ({ path: p }: { path: string }) => ({ uri: `file:///cache/${p}` })),
  share: vi.fn(async () => ({ activityType: 'test' })),
  authObj: { currentUser: null as any },
  deleteFirebaseUserAccount: vi.fn(async () => {})
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: mocks.isNativePlatform
  }
}));

vi.mock('@capacitor/filesystem', () => ({
  Directory: { Cache: 'CACHE', Documents: 'DOCUMENTS' },
  Filesystem: {
    writeFile: mocks.writeFile
  }
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: mocks.share
  }
}));

vi.mock('../utils/firebase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/firebase')>();
  return {
    ...actual,
    auth: mocks.authObj,
    deleteFirebaseUserAccount: mocks.deleteFirebaseUserAccount
  };
});

describe('Pre-Submission APK Audit & Security Hardening Suite', () => {
  const origDocument = globalThis.document;
  const origURL = globalThis.URL;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNativePlatform.mockReturnValue(false);
    mocks.authObj.currentUser = null;

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

  afterEach(() => {
    if (origDocument === undefined) {
      delete (globalThis as any).document;
    } else {
      globalThis.document = origDocument;
    }
    globalThis.URL = origURL;
  });

  describe('Native Capacitor Export & Browser Fallback (nativeExport.ts)', () => {
    it('routes native Android/iOS exports through Filesystem.writeFile(Cache) and Share.share without DOM anchor hacks', async () => {
      mocks.isNativePlatform.mockReturnValue(true);
      const { shareOrDownloadText } = await import('../utils/nativeExport');

      const result = await shareOrDownloadText(
        'col1,col2\nval1,val2',
        'fleet backup!2026.csv',
        'text/csv;charset=utf-8;',
        { title: 'Export Fleet CSV' }
      );

      expect(result).toBe('shared');
      expect(mocks.writeFile).toHaveBeenCalledTimes(1);
      expect(mocks.writeFile).toHaveBeenCalledWith(
        expect.objectContaining({
          path: 'fleet_backup_2026.csv',
          directory: 'CACHE'
        })
      );
      expect(mocks.share).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Export Fleet CSV',
          url: 'file:///cache/fleet_backup_2026.csv'
        })
      );
    });

    it('returns cancelled cleanly if native Share sheet is dismissed with AbortError', async () => {
      mocks.isNativePlatform.mockReturnValue(true);
      const abortErr = new Error('Share canceled by user');
      abortErr.name = 'AbortError';
      mocks.share.mockRejectedValueOnce(abortErr);

      const { shareOrDownloadText } = await import('../utils/nativeExport');
      const result = await shareOrDownloadText('{"ok":true}', 'backup.json', 'application/json');

      expect(result).toBe('cancelled');
    });

    it('falls back to browser Blob download on desktop web', async () => {
      mocks.isNativePlatform.mockReturnValue(false);
      const clickSpy = vi.fn();
      const appendSpy = vi.fn();
      const removeSpy = vi.fn();
      const fakeLink = { href: '', download: '', style: { display: '' }, click: clickSpy };

      (globalThis as any).document = {
        createElement: vi.fn(() => fakeLink),
        body: { appendChild: appendSpy, removeChild: removeSpy }
      };
      const createObjectURL = vi.fn(() => 'blob:mock-url-1');
      const revokeObjectURL = vi.fn();
      (globalThis as any).URL = { createObjectURL, revokeObjectURL };

      const { shareOrDownloadBlob } = await import('../utils/nativeExport');
      const result = await shareOrDownloadBlob(new Blob(['hello'], { type: 'text/plain' }), 'test.txt', {
        preferDownloadOnDesktop: true
      });

      expect(result).toBe('downloaded');
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(fakeLink.download).toBe('test.txt');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(appendSpy).toHaveBeenCalledWith(fakeLink);
      expect(removeSpy).toHaveBeenCalledWith(fakeLink);
    });
  });

  describe('Immediate Account Deletion Recent-Login Guard & Subcollection Coverage', () => {
    it('exports comprehensive user Firestore subcollections for complete purge', async () => {
      const { USER_FIRESTORE_SUBCOLLECTIONS } = await import('../utils/storage');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('collections');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('cashbookEntries');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('khataSettings');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('khataBills');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('khataEmployees');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('khataEmployeeEntries');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('khataReceivingPoints');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('khataReceivingEntries');
      expect(USER_FIRESTORE_SUBCOLLECTIONS).toContain('khataDailyExpenses');
    });

    it('rejects stale sessions with AUTH_REQUIRES_RECENT_LOGIN BEFORE wiping local or cloud data', async () => {
      const uid = 'uid_stale_test_001';
      mocks.authObj.currentUser = {
        uid,
        metadata: {
          // 20 minutes ago (> 4.5 minute guard)
          lastSignInTime: new Date(Date.now() - 20 * 60 * 1000).toUTCString()
        }
      };

      const { executeImmediateAccountDeletion, safeStorage } = await import('../utils/storage');
      safeStorage.setItem(`ah-deletion-${uid}`, JSON.stringify({ userId: uid, status: 'pending_deletion' }));
      safeStorage.setItem(`dd_khata_bills_v2_${uid}`, JSON.stringify([{ id: 'b1' }]));

      const res = await executeImmediateAccountDeletion(uid);

      expect(res.success).toBe(false);
      expect(res.message).toBe('AUTH_REQUIRES_RECENT_LOGIN');
      expect(mocks.deleteFirebaseUserAccount).not.toHaveBeenCalled();
      // Local data MUST remain intact because deletion failed re-auth check
      expect(safeStorage.getItem(`ah-deletion-${uid}`)).not.toBeNull();
      expect(safeStorage.getItem(`dd_khata_bills_v2_${uid}`)).not.toBeNull();
    });

    it('proceeds and purges scoped Khata & auth storage when session sign-in is fresh', async () => {
      const uid = 'uid_fresh_test_002';
      mocks.authObj.currentUser = {
        uid,
        metadata: {
          lastSignInTime: new Date(Date.now() - 30 * 1000).toUTCString()
        }
      };

      const { executeImmediateAccountDeletion, safeStorage } = await import('../utils/storage');
      safeStorage.setItem(`ah-deletion-${uid}`, JSON.stringify({ userId: uid, status: 'pending_deletion' }));
      safeStorage.setItem(`dd_khata_bills_v2_${uid}`, JSON.stringify([{ id: 'b1' }]));
      safeStorage.setItem(`dd_khata_daily_expenses_v2_${uid}`, JSON.stringify([{ id: 'e1' }]));
      safeStorage.setItem('ah-gmail-user-uid', uid);

      const res = await executeImmediateAccountDeletion(uid);

      expect(res.success).toBe(true);
      expect(mocks.deleteFirebaseUserAccount).toHaveBeenCalledTimes(1);
      expect(safeStorage.getItem(`ah-deletion-${uid}`)).toBeNull();
      expect(safeStorage.getItem(`dd_khata_bills_v2_${uid}`)).toBeNull();
      expect(safeStorage.getItem(`dd_khata_daily_expenses_v2_${uid}`)).toBeNull();
      expect(safeStorage.getItem('ah-gmail-user-uid')).toBeNull();
    });
  });

  describe('Palm Store Compliance, Terminology & Firestore Rules Hardening', () => {
    const root = path.resolve(__dirname, '../..');

    it('keeps AndroidManifest.xml unchanged with exact baseline SHA-256', () => {
      const manifestPath = path.join(root, 'android/app/src/main/AndroidManifest.xml');
      const buf = fs.readFileSync(manifestPath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      expect(hash).toBe('eb265574e07cf003dd8ed2ac83d94c9521a2e64418236b0d48d2a2e400adb944');
    });

    it('removes public referenceId read bypass on accountDeletionRequests and hardens activityLog validation', () => {
      const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
      expect(rules).not.toContain('resource.data.referenceId != null');
      expect(rules).toContain("request.resource.data.uid == request.auth.uid");
      expect(rules).toContain("request.resource.data.category in ['auth', 'bilty', 'settings', 'fleet', 'export', 'error', 'sync']");
    });

    it('handles Firestore 401/403 privacy protection gracefully in public/delete-account.html', () => {
      const html = fs.readFileSync(path.join(root, 'public/delete-account.html'), 'utf8');
      expect(html).toContain('privacyProtected');
      expect(html).toContain('res.status === 403 || res.status === 401');
    });

    it('ensures public-facing verification UI copy avoids restricted Bilty terminology', () => {
      const verifySrc = fs.readFileSync(path.join(root, 'src/components/views/VerifyView.tsx'), 'utf8');
      const cardSrc = fs.readFileSync(path.join(root, 'src/components/views/BiltyVerificationCard.tsx'), 'utf8');
      const appSrc = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');

      // Check rendered user-facing UI strings (ignoring internal TS type/variable/URL query identifiers)
      expect(cardSrc).not.toContain('بلٹی');
      expect(cardSrc).not.toMatch(/\bBilty\s+(?:No|Date|Verification|Document)\b/i);
      expect(cardSrc).toContain('VERIFIED OFFICIAL DOCUMENT');
      expect(cardSrc).toContain('Document No');

      expect(verifySrc).not.toContain('بلٹی');
      const verifyUiLines = verifySrc
        .split('\n')
        .filter((line) => !line.includes('console.warn') && !line.includes('console.error') && !line.trim().startsWith('import '))
        .join('\n');
      expect(verifyUiLines).not.toMatch(/['"`>][^'"`\n<]*\bBilty\s+(?:No|Number|Verification|QR|Record|Lookup)\b[^'"`\n<]*['"`<]/i);
      expect(verifySrc).toContain('Document Verification');
      expect(appSrc).toContain("subtitle: 'Vehicles, Licenses, Challans & Document QR'");
    });
  });
});
