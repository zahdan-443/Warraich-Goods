import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  return {
    docs,
    batchCommitCount: 0,
    batchWriteOps: 0,
    batchDeleteOps: 0,
    directSetDocCount: 0,
    failNextAttachmentWriteId: null as string | null,
    sharedBlobs: [] as Array<{ filename: string; size: number }>,
    mockUser: {
      uid: 'uid_owner_test',
      email: 'warraichgoods43@gmail.com'
    },
    reset() {
      docs.clear();
      mockState.batchCommitCount = 0;
      mockState.batchWriteOps = 0;
      mockState.batchDeleteOps = 0;
      mockState.directSetDocCount = 0;
      mockState.failNextAttachmentWriteId = null;
      mockState.sharedBlobs = [];
      mockState.mockUser = {
        uid: 'uid_owner_test',
        email: 'warraichgoods43@gmail.com'
      };
    }
  };
});

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => false,
    getPlatform: () => 'web'
  }
}));

vi.mock('../utils/nativeExport', () => ({
  shareOrDownloadBlob: vi.fn(async (blob: Blob, filename: string) => {
    mockState.sharedBlobs.push({ filename, size: blob.size });
    return { shared: false, downloaded: true };
  })
}));

vi.mock('firebase/firestore', () => {
  const pathOf = (segments: string[]) => segments.join('/');
  class MockTimestamp {
    private readonly ms: number;
    constructor(ms: number) {
      this.ms = ms;
    }
    toMillis() {
      return this.ms;
    }
    static fromMillis(ms: number) {
      return new MockTimestamp(ms);
    }
  }
  return {
    Timestamp: MockTimestamp,
    doc: (_db: unknown, ...segments: string[]) => ({
      __type: 'doc',
      path: pathOf(segments),
      id: segments[segments.length - 1]
    }),
    collection: (_db: unknown, ...segments: string[]) => ({
      __type: 'coll',
      path: pathOf(segments)
    }),
    serverTimestamp: () => 'SERVER_TS',
    query: (ref: unknown) => ref,
    orderBy: () => ({}),
    limit: () => ({}),
    where: () => ({}),
    getDoc: async (ref: { path: string }) => {
      const val = mockState.docs.get(ref.path);
      return {
        exists: () => val !== undefined,
        id: ref.path.split('/').pop(),
        ref,
        data: () => val
      };
    },
    getDocs: async (ref: { path: string }) => {
      const prefix = `${ref.path}/`;
      const matched: Array<{ id: string; ref: { path: string }; data: () => Record<string, unknown> }> = [];
      for (const [k, v] of mockState.docs.entries()) {
        if (k.startsWith(prefix)) {
          const rest = k.slice(prefix.length);
          if (!rest.includes('/')) {
            matched.push({
              id: rest,
              ref: { path: k },
              data: () => v
            });
          }
        }
      }
      return {
        empty: matched.length === 0,
        docs: matched,
        forEach: (cb: (d: (typeof matched)[number]) => void) => matched.forEach(cb)
      };
    },
    setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      if (
        mockState.failNextAttachmentWriteId &&
        ref.path.includes(`/biltyAttachments/${mockState.failNextAttachmentWriteId}`)
      ) {
        mockState.failNextAttachmentWriteId = null;
        throw new Error('Simulated single-attachment network failure');
      }
      mockState.directSetDocCount++;
      const prev = opts?.merge ? mockState.docs.get(ref.path) || {} : {};
      mockState.docs.set(ref.path, { ...prev, ...data });
    },
    deleteDoc: async (ref: { path: string }) => {
      mockState.docs.delete(ref.path);
    },
    writeBatch: () => {
      const ops: Array<() => void> = [];
      return {
        set: (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
          ops.push(() => {
            mockState.batchWriteOps++;
            const prev = opts?.merge ? mockState.docs.get(ref.path) || {} : {};
            mockState.docs.set(ref.path, { ...prev, ...data });
          });
        },
        delete: (ref: { path: string }) => {
          ops.push(() => {
            mockState.batchDeleteOps++;
            mockState.docs.delete(ref.path);
          });
        },
        commit: async () => {
          mockState.batchCommitCount++;
          for (const fn of ops) fn();
        }
      };
    },
    runTransaction: async () => 1001,
    onSnapshot: () => () => {}
  };
});

vi.mock('../utils/firebase', () => ({
  get auth() {
    return { currentUser: mockState.mockUser };
  },
  db: {},
  deleteFirebaseUserAccount: async () => {}
}));

import {
  ATTACHMENT_AUDIO_HARD_CAP_BYTES,
  ATTACHMENT_CLOUD_QUOTA_BYTES,
  ATTACHMENT_HARD_CAP_BYTES,
  ATTACHMENT_RETENTION_DAYS,
  BILTY_VAULT_MIGRATED_PREFIX,
  BILTY_VAULT_PRE_MIGRATION_PREFIX,
  DEFAULT_MAX_ID_IMAGES_PER_DOC,
  LEGAL_HOLD_FAR_FUTURE_YEARS,
  deleteAllAttachmentsForBilty,
  exportAttachmentsZipBundle,
  flushBiltyAttachmentSyncQueue,
  getAllBiltyAttachments,
  getAttachmentsForBilty,
  getBiltyAttachmentStorageStats,
  getExpiringBiltyAttachmentsSummary,
  migrateLegacyBiltyLegalVaults,
  runDailyBiltyAttachmentCleanup,
  saveBiltyAttachment,
  setBiltyLegalHold,
  validateAudioAttachmentDataUrl
} from '../utils/biltyAttachments';
import {
  deletePreRestoreSnapshotIdbOnly,
  hasPreRestoreSnapshotIdbOnly,
  idbClearAllBiltyAttachments,
  idbOnlyDelete,
  idbOnlyListKeys,
  loadPreRestoreSnapshotIdbOnly,
  pruneExpiredPreRestoreSnapshotsIdbOnly,
  savePreRestoreSnapshotIdbOnly
} from '../utils/persistentStorage';
import { clearLocalAndIndexedDbForUser, purgeAllUserFirestoreData } from '../utils/accountDeletion';
import { generateFullFleetBackup, hasPreRestoreSnapshotAsync, undoLastRestore } from '../utils/backupService';
import {
  exportKhataBackup,
  fetchKhataFromFirestore,
  getAllCashEntries,
  getAllLedgerEntries,
  getLedgerAccounts,
  importKhataBackup,
  saveOrUpdateCashEntry,
  saveOrUpdateLedgerAccount,
  saveOrUpdateLedgerEntry,
  validateKhataBackupPayload,
  waitForPendingKhataImportSync
} from '../utils/ledgerStorage';
import { runOneTimeV2ToV3Migration, setScopedItem, getScopedItem } from '../utils/storageCore';
import type { BiltyRecord } from '../types';

function setupBrowserEnv() {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, val: string) => {
      store[key] = String(val);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (i: number) => Object.keys(store)[i] || null,
    get length() {
      return Object.keys(store).length;
    }
  } as unknown as Storage;

  (globalThis as unknown as { window: unknown }).window = {
    localStorage: globalThis.localStorage,
    dispatchEvent: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    location: {
      origin: 'https://localhost',
      protocol: 'https:',
      hostname: 'localhost',
      pathname: '/'
    }
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true, userAgent: 'vitest' },
    configurable: true
  });
}

function makeSmallJpegDataUrl(sizeBytes = 1024): string {
  const b64Len = Math.ceil(sizeBytes / 3) * 4;
  const body = 'A'.repeat(b64Len);
  return `data:image/jpeg;base64,${body}`;
}

function makeBilty(overrides: Partial<BiltyRecord> = {}): BiltyRecord {
  return {
    id: 1001,
    biltyNo: 'WG-1001',
    date: '2026-11-20',
    vehicleNo: 'LES-1234',
    driverName: 'Muhammad Ali',
    mobileNo: '03005370443',
    sendingCity: 'Samundri',
    receivingCity: 'Karachi',
    senderName: 'Samundri Mills',
    senderMobile: '03001112223',
    senderCnic: '33100-1234567-1',
    receiverName: 'Karachi Traders',
    receiverMobile: '03395370443',
    qty: '100',
    itemDescription: 'Cotton Bales',
    weight: '5 Tons',
    total: 50000,
    advance: 10000,
    payable: 40000,
    branch: 'samundri',
    createdAt: '2026-11-20T10:00:00.000Z',
    ...overrides
  };
}

describe('Bilty Attachment Isolation, Khata Tombstone Import & Hygiene Regressions', () => {
  beforeEach(async () => {
    setupBrowserEnv();
    mockState.reset();
    await idbClearAllBiltyAttachments();
    const idbKeys = await idbOnlyListKeys('');
    for (const k of idbKeys) {
      await idbOnlyDelete(k);
    }
    await deletePreRestoreSnapshotIdbOnly('uid_owner_test');
    runOneTimeV2ToV3Migration('uid_owner_test');
  });

  // =========================================================================
  // Workstream 1: Bilty Attachment Isolation, Limits, 180-Day Retention & Migration
  // =========================================================================

  it('stores bilty attachments strictly in IndexedDB & users/{uid}/biltyAttachments (never localStorage or BiltyRecord) and enforces limits', async () => {
    expect(DEFAULT_MAX_ID_IMAGES_PER_DOC).toBe(2);
    expect(ATTACHMENT_RETENTION_DAYS).toBe(180);
    expect(ATTACHMENT_HARD_CAP_BYTES).toBe(400 * 1024);

    const bilty = makeBilty();
    setScopedItem('bilties', JSON.stringify([bilty]));

    // Save 2 ID-card photos (allowed up to DEFAULT_MAX_ID_IMAGES_PER_DOC = 2)
    const id1 = await saveBiltyAttachment(bilty, {
      slot: 'driverCnic',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(2048),
      createdAtMs: 1_700_000_000_000
    });
    const id2 = await saveBiltyAttachment(bilty, {
      slot: 'senderCnic',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(2048),
      createdAtMs: 1_700_000_000_000
    });

    // 3rd ID-card slot blocked by DEFAULT_MAX_ID_IMAGES_PER_DOC
    await expect(
      saveBiltyAttachment(bilty, {
        slot: 'receiverCnic',
        kind: 'image',
        dataUrl: makeSmallJpegDataUrl(2048)
      })
    ).rejects.toThrow(/Maximum 2 ID-card images/i);

    // Non-ID legal document & audio still allowed (while obeying 400 KB hard cap)
    const docAtt = await saveBiltyAttachment(bilty, {
      slot: 'legalDoc',
      kind: 'image',
      name: 'Toll Slip',
      dataUrl: makeSmallJpegDataUrl(1536)
    });

    // Oversized (>400 KB) rejected
    await expect(
      saveBiltyAttachment(bilty, {
        slot: 'vehiclePhoto',
        kind: 'image',
        dataUrl: makeSmallJpegDataUrl(450 * 1024)
      })
    ).rejects.toThrow(/exceeds the 400 KB hard cap/i);

    // Allow queued async cloud writes to settle
    await new Promise((r) => setTimeout(r, 15));

    // Verify localStorage BiltyRecord contains NO base64/legalVault payloads, only attachmentCount
    const rawLocalBilties = JSON.parse(getScopedItem('bilties') || '[]') as BiltyRecord[];
    expect(rawLocalBilties[0].legalVault).toBeUndefined();
    expect(rawLocalBilties[0].attachmentCount).toBe(3);
    for (let i = 0; i < globalThis.localStorage.length; i++) {
      const k = globalThis.localStorage.key(i) || '';
      const v = globalThis.localStorage.getItem(k) || '';
      expect(v).not.toContain('data:image/jpeg;base64,AAAA');
    }

    // Verify Firestore owner subcollection documents exist under users/{uid}/biltyAttachments
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${id1.id}`)).toBeDefined();
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${id2.id}`)).toBeDefined();
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${docAtt.id}`)).toBeDefined();

    // Verify expireAtMs = createdAtMs + 180 days
    expect(id1.expireAtMs).toBe(1_700_000_000_000 + 180 * 86_400_000);
  });

  it('isolates single-attachment sync failures and retries safely without blocking other records', async () => {
    const b1 = makeBilty({ id: 2001, biltyNo: 'WG-2001' });
    const b2 = makeBilty({ id: 2002, biltyNo: 'WG-2002' });
    setScopedItem('bilties', JSON.stringify([b1, b2]));

    mockState.failNextAttachmentWriteId = 'WG-2001__driverCnic';

    const failingAtt = await saveBiltyAttachment(b1, {
      slot: 'driverCnic',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(1024)
    });
    const healthyAtt = await saveBiltyAttachment(b2, {
      slot: 'driverCnic',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(1024)
    });

    await new Promise((r) => setTimeout(r, 20));

    // WG-2002 synced immediately even though WG-2001 failed on attempt #1
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${healthyAtt.id}`)).toBeDefined();
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${failingAtt.id}`)).toBeUndefined();

    // Queue flush retries WG-2001 cleanly once transient error clears
    const flushed = await flushBiltyAttachmentSyncQueue('uid_owner_test');
    expect(flushed.synced).toBeGreaterThanOrEqual(1);
    expect(flushed.remaining).toBe(0);
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${failingAtt.id}`)).toBeDefined();
  });

  it('enforces 180-day auto-retention cleanup (with Legal Hold +50y exemption, 7-day warning + ZIP export, and cascade delete)', async () => {
    const baseMs = 1_700_000_000_000;
    const biltyExpired = makeBilty({ id: 3001, biltyNo: 'WG-3001' });
    const biltyHold = makeBilty({ id: 3002, biltyNo: 'WG-3002', legalHold: true });
    const biltyExpiringSoon = makeBilty({ id: 3003, biltyNo: 'WG-3003' });
    setScopedItem('bilties', JSON.stringify([biltyExpired, biltyHold, biltyExpiringSoon]));

    const aExpired = await saveBiltyAttachment(biltyExpired, {
      slot: 'driverCnic',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(1024),
      createdAtMs: baseMs
    });
    const aHold = await saveBiltyAttachment(biltyHold, {
      slot: 'senderCnic',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(1024),
      createdAtMs: baseMs
    });
    // Created 176 days before checkMs -> 4 days left (within 7-day warning banner!)
    const checkNowMs = baseMs + 185 * 86_400_000;
    const soonCreatedMs = checkNowMs - 176 * 86_400_000;
    const aSoon = await saveBiltyAttachment(biltyExpiringSoon, {
      slot: 'driverLicense',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(1024),
      createdAtMs: soonCreatedMs
    });
    await new Promise((r) => setTimeout(r, 20));

    // Legal hold pushed expireAt +50 years
    expect(aHold.expireAtMs).toBe(baseMs + LEGAL_HOLD_FAR_FUTURE_YEARS * 365 * 86_400_000);

    // Toggle legal hold off -> resets expireAt back to +180 days, then back on
    const unheld = await setBiltyLegalHold(biltyHold, false);
    expect(unheld[0].expireAtMs).toBe(baseMs + 180 * 86_400_000);
    const reheld = await setBiltyLegalHold(biltyHold, true);
    expect(reheld[0].expireAtMs).toBe(baseMs + LEGAL_HOLD_FAR_FUTURE_YEARS * 365 * 86_400_000);
    await new Promise((r) => setTimeout(r, 15));

    // Run daily cleanup at baseMs + 185 days
    const cleanupRes = await runDailyBiltyAttachmentCleanup('uid_owner_test', { nowMs: checkNowMs });
    expect(cleanupRes.executed).toBe(true);
    expect(cleanupRes.deletedCount).toBe(1);
    expect(cleanupRes.skippedHoldCount).toBe(1);

    // Expired doc deleted from BOTH IndexedDB & Firestore
    expect((await getAttachmentsForBilty(biltyExpired)).length).toBe(0);
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${aExpired.id}`)).toBeUndefined();

    // Hold & soon-to-expire docs retained
    expect((await getAttachmentsForBilty(biltyHold)).length).toBe(1);
    expect((await getAttachmentsForBilty(biltyExpiringSoon)).length).toBe(1);

    // Daily throttle prevents re-running same day unless force: true
    const secondRunSameDay = await runDailyBiltyAttachmentCleanup('uid_owner_test', { nowMs: checkNowMs + 60_000 });
    expect(secondRunSameDay.executed).toBe(false);

    // 7-day expiring summary finds aSoon
    const summary = await getExpiringBiltyAttachmentsSummary(7, checkNowMs);
    expect(summary.count).toBe(1);
    expect(summary.attachments[0].id).toBe(aSoon.id);

    // Export ZIP bundle succeeds
    const zipRes = await exportAttachmentsZipBundle(summary.attachments);
    expect(zipRes.error).toBeUndefined();
    expect(zipRes.success).toBe(true);
    expect(zipRes.count).toBe(1);
    expect(mockState.sharedBlobs.length).toBe(1);
    expect(mockState.sharedBlobs[0].size).toBeGreaterThan(50);

    // Cascade delete when deleting a bilty removes all its attachments in IDB & Firestore
    await deleteAllAttachmentsForBilty(biltyExpiringSoon, 'uid_owner_test');
    expect((await getAttachmentsForBilty(biltyExpiringSoon)).length).toBe(0);
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${aSoon.id}`)).toBeUndefined();
  });

  it('migrates legacy BiltyRecord.legalVault idempotently without dropping >2 legacy photos and strips legacy fields from local, cloud docs & backup chunks', async () => {
    const legacyBilty: BiltyRecord = makeBilty({
      id: 4001,
      biltyNo: 'WG-4001',
      legalVault: {
        driverCnic: makeSmallJpegDataUrl(1024),
        senderCnic: makeSmallJpegDataUrl(1024),
        receiverCnic: makeSmallJpegDataUrl(1024),
        driverLicense: makeSmallJpegDataUrl(1024), // 4 legacy ID photos must ALL be preserved!
        driverPhoto: makeSmallJpegDataUrl(1024),
        recordings: [
          {
            id: 'rec_1',
            name: 'Driver Confirmation',
            dataUrl: 'data:audio/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQRChYECGFOAZwH/////////',
            duration: 4,
            createdAt: '2026-11-20T10:05:00.000Z'
          }
        ],
        updatedAt: '2026-11-20T10:05:00.000Z'
      }
    });

    setScopedItem('bilties', JSON.stringify([legacyBilty]));
    mockState.docs.set('users/uid_owner_test/biltiesDocs/WG-4001', { ...legacyBilty });
    mockState.docs.set('users/uid_owner_test/collections/bilties', { items: [legacyBilty] });

    const mig1 = await migrateLegacyBiltyLegalVaults('uid_owner_test');
    expect(mig1.alreadyDone).toBe(false);
    expect(mig1.migratedBilties).toBe(1);
    expect(mig1.migratedAttachments).toBe(6);

    // All 6 legacy items (including all 4 ID-card photos) are in IndexedDB
    const storedAtts = await getAttachmentsForBilty(legacyBilty);
    expect(storedAtts.length).toBe(6);

    // Pre-migration snapshot was recorded in IDB before stripping
    const preSnapKeys = await idbOnlyListKeys(BILTY_VAULT_PRE_MIGRATION_PREFIX);
    expect(preSnapKeys.length).toBe(1);

    // legalVault is stripped locally, in biltiesDocs, collections/bilties, AND full backups
    const migratedBilties = JSON.parse(getScopedItem('bilties') || '[]') as BiltyRecord[];
    expect(migratedBilties[0].legalVault).toBeUndefined();
    expect(migratedBilties[0].attachmentCount).toBe(6);

    const cloudDoc = mockState.docs.get('users/uid_owner_test/biltiesDocs/WG-4001');
    expect(cloudDoc?.legalVault).toBeUndefined();
    expect(cloudDoc?.attachmentCount).toBe(6);

    const legacyCollDoc = mockState.docs.get('users/uid_owner_test/collections/bilties') as {
      items?: BiltyRecord[];
    };
    expect(legacyCollDoc?.items?.[0]?.legalVault).toBeUndefined();

    const backup = generateFullFleetBackup();
    expect(backup.data.bilties[0].legalVault).toBeUndefined();

    // Idempotent 2nd run does not duplicate or overwrite existing attachments
    const mig2 = await migrateLegacyBiltyLegalVaults('uid_owner_test');
    expect(mig2.alreadyDone).toBe(true);
    expect(mig2.migratedAttachments).toBe(0);
    expect((await getAttachmentsForBilty(legacyBilty)).length).toBe(6);
    const doneKeys = await idbOnlyListKeys(BILTY_VAULT_MIGRATED_PREFIX);
    expect(doneKeys.length).toBe(1);
  });

  it('purges biltyAttachments Firestore subcollection and IndexedDB store on account deletion and documents bilty system retention in privacy policy', async () => {
    const bilty = makeBilty({ id: 5001, biltyNo: 'WG-5001' });
    setScopedItem('bilties', JSON.stringify([bilty]));
    await saveBiltyAttachment(bilty, {
      slot: 'driverCnic',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(1024)
    });
    await new Promise((r) => setTimeout(r, 15));

    expect((await getAllBiltyAttachments()).length).toBe(1);
    expect(
      Array.from(mockState.docs.keys()).some((k) => k.startsWith('users/uid_owner_test/biltyAttachments/'))
    ).toBe(true);

    await purgeAllUserFirestoreData('uid_owner_test');
    await clearLocalAndIndexedDbForUser('uid_owner_test');

    expect((await getAllBiltyAttachments()).length).toBe(0);
    expect(
      Array.from(mockState.docs.keys()).some((k) => k.startsWith('users/uid_owner_test/biltyAttachments/'))
    ).toBe(false);

    const rootDir = process.cwd();
    const privacyHtml = fs.readFileSync(path.join(rootDir, 'public/privacy.html'), 'utf8');
    const privacyModal = fs.readFileSync(path.join(rootDir, 'src/components/PrivacyPolicyModal.tsx'), 'utf8');
    expect(privacyHtml.toLowerCase()).toContain('bilty');
    expect(privacyHtml).toMatch(/180\s*days|6\s*months/i);
    expect(privacyModal.toLowerCase()).toContain('bilty');
    expect(privacyModal).toMatch(/180\s*days|6\s*months/i);

    const rules = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');
    expect(rules).toContain('match /biltyAttachments/{attachmentId}');
    expect(rules).toContain('isOwner()');
    expect(rules).toContain('409600');
  });

  it('enforces 600 KB local-only audio caps (never uploaded to Firestore) and 70%/85%/100% cloud quota fallback', async () => {
    expect(ATTACHMENT_AUDIO_HARD_CAP_BYTES).toBe(600 * 1024);
    expect(ATTACHMENT_CLOUD_QUOTA_BYTES).toBe(1024 * 1024 * 1024);

    const bilty = makeBilty({ id: 6001, biltyNo: 'WG-6001' });
    setScopedItem('bilties', JSON.stringify([bilty]));

    // <= 600 KB audio saves strictly locally and NEVER touches Firestore
    const smallAudioUrl = `data:audio/webm;base64,${'A'.repeat(Math.ceil((500 * 1024) / 3) * 4)}`;
    expect(validateAudioAttachmentDataUrl(smallAudioUrl).byteSize).toBeGreaterThan(450 * 1024);
    const savedAudio = await saveBiltyAttachment(bilty, {
      slot: 'voiceNote',
      kind: 'audio',
      name: 'Driver_Confirm',
      dataUrl: smallAudioUrl,
      duration: 45
    });
    expect(savedAudio.localOnly).toBe(true);
    expect(savedAudio.localOnlyReason).toBe('audio_local_only');

    // > 600 KB audio is strictly rejected
    const oversizedAudioUrl = `data:audio/webm;base64,${'A'.repeat(Math.ceil((620 * 1024) / 3) * 4)}`;
    expect(() => validateAudioAttachmentDataUrl(oversizedAudioUrl)).toThrow(/600 KB/i);
    await expect(
      saveBiltyAttachment(bilty, {
        slot: 'voiceNote',
        kind: 'audio',
        dataUrl: oversizedAudioUrl
      })
    ).rejects.toThrow(/600 KB/i);

    await flushBiltyAttachmentSyncQueue('uid_owner_test');
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${savedAudio.id}`)).toBeUndefined();

    // Save 75 KB image (counts toward cloud quota; audio does NOT count toward cloud quota)
    const img1 = await saveBiltyAttachment(
      bilty,
      {
        slot: 'driverCnic',
        kind: 'image',
        dataUrl: makeSmallJpegDataUrl(75 * 1024)
      }
    );
    expect(img1.localOnly).toBeUndefined();

    const stats70 = await getBiltyAttachmentStorageStats(100 * 1024);
    expect(stats70.cloudBackedCount).toBe(1);
    expect(stats70.localOnlyCount).toBe(1);
    expect(stats70.warningLevel).toBe('warn70');

    const stats85 = await getBiltyAttachmentStorageStats(85 * 1024);
    expect(stats85.warningLevel).toBe('urgent85');

    // Saving a new image that pushes cloudBytes above quotaLimitBytes falls back cleanly to localOnly
    const imgQuotaFallback = await saveBiltyAttachment(bilty, {
      slot: 'vehiclePhoto',
      kind: 'image',
      dataUrl: makeSmallJpegDataUrl(30 * 1024),
      quotaLimitBytes: 100 * 1024
    });
    expect(imgQuotaFallback.localOnly).toBe(true);
    expect(imgQuotaFallback.localOnlyReason).toBe('quota_exceeded');

    await new Promise((r) => setTimeout(r, 15));
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${img1.id}`)).toBeDefined();
    expect(mockState.docs.get(`users/uid_owner_test/biltyAttachments/${imgQuotaFallback.id}`)).toBeUndefined();
  });

  // =========================================================================
  // Workstream 2: Tombstone-Aware, Validated, Batched Khata JSON Import
  // =========================================================================

  it('validates Khata JSON backups (rejects bad checksum, finite/date errors, >15 MB; allows legacy backups with no checksum)', () => {
    const acc = saveOrUpdateLedgerAccount({
      kind: 'party',
      name: 'Samundri Party',
      phone: '03005370443',
      openingAmount: 5000,
      openingDirection: 'get'
    });
    saveOrUpdateLedgerEntry({
      accountId: acc.id,
      date: '2026-11-20',
      type: 'gave',
      amount: 12000,
      note: 'Freight'
    });

    const exportedJson = exportKhataBackup();
    const parsed = JSON.parse(exportedJson) as Record<string, unknown>;
    expect(typeof parsed.checksum).toBe('number');

    // Valid checksum passes
    expect(validateKhataBackupPayload(exportedJson).valid).toBe(true);

    // Corrupted numeric checksum & non-numeric checksum are both REJECTED
    const tamperedNumeric = { ...parsed, checksum: Number(parsed.checksum) + 12345 };
    const tamperedNumericRes = validateKhataBackupPayload(JSON.stringify(tamperedNumeric));
    expect(tamperedNumericRes.valid).toBe(false);
    expect(tamperedNumericRes.error).toMatch(/checksum mismatch/i);

    const tamperedBadType = { ...parsed, checksum: 'bad_checksum_0000' };
    expect(validateKhataBackupPayload(JSON.stringify(tamperedBadType)).valid).toBe(false);

    // Legacy backup WITHOUT checksum field is ALLOWED
    const legacy = { ...parsed };
    delete legacy.checksum;
    expect(validateKhataBackupPayload(JSON.stringify(legacy)).valid).toBe(true);

    // Non-finite amount rejected
    const badAmt = {
      ...legacy,
      entries: [{ id: 'e_bad', accountId: acc.id, date: '2026-11-20', type: 'gave', amount: null }]
    };
    const badAmtRes = validateKhataBackupPayload(JSON.stringify(badAmt));
    expect(badAmtRes.valid).toBe(false);
    expect(badAmtRes.error).toMatch(/amount/i);

    // Insane date rejected
    const badDate = {
      ...legacy,
      entries: [{ id: 'e_bad', accountId: acc.id, date: '2026-99-99', type: 'gave', amount: 500 }]
    };
    const badDateRes = validateKhataBackupPayload(JSON.stringify(badDate));
    expect(badDateRes.valid).toBe(false);
    expect(badDateRes.error).toMatch(/date/i);
  });

  it('routes Khata import through tombstone-aware restore, prevents replace-mode cloud resurrection, batches Firestore ops, and writes 7-day IDB-only undo snapshot', async () => {
    const keptAcc = saveOrUpdateLedgerAccount({
      kind: 'party',
      name: 'Exported Party',
      phone: '03005370443',
      openingAmount: 2000
    });
    const backupJson = exportKhataBackup();

    // Now add a local-only account & cash entry that ALSO exist in cloud
    const localOnlyAcc = saveOrUpdateLedgerAccount({
      kind: 'party',
      name: 'Local Only To Be Replaced',
      phone: '03009998887',
      openingAmount: 9000
    });
    saveOrUpdateCashEntry({
      date: '2026-11-21',
      type: 'in',
      amount: 4500,
      category: 'Freight',
      note: 'Cash before replace'
    });
    const staleCloudTs = new Date(Date.now() - 60_000).toISOString();
    mockState.docs.set(`users/uid_owner_test/ledgerAccounts/${localOnlyAcc.id}`, {
      ...localOnlyAcc,
      updatedAt: staleCloudTs
    });

    mockState.batchCommitCount = 0;
    mockState.directSetDocCount = 0;

    // Import in 'replace' mode
    const importRes = importKhataBackup(backupJson, 'replace');
    expect(importRes.success).toBe(true);
    await waitForPendingKhataImportSync();

    // Replaced localOnlyAcc must NOT exist locally, and cloud mirror must use writeBatch (not per-item setDoc!)
    expect(getLedgerAccounts().map((a) => a.id)).toEqual([keptAcc.id]);
    expect(mockState.batchCommitCount).toBeGreaterThanOrEqual(1);
    expect(mockState.directSetDocCount).toBe(0);
    expect(mockState.batchDeleteOps).toBeGreaterThanOrEqual(2); // localOnlyAcc + pre-replace cash entry deleted in batch

    // Stale cloud copy re-injected -> fetchKhataFromFirestore must NOT resurrect localOnlyAcc thanks to tombstones!
    mockState.docs.set(`users/uid_owner_test/ledgerAccounts/${localOnlyAcc.id}`, {
      ...localOnlyAcc,
      updatedAt: staleCloudTs
    });
    await fetchKhataFromFirestore();
    expect(getLedgerAccounts().some((a) => a.id === localOnlyAcc.id)).toBe(false);

    // Pre-restore Undo snapshot must exist in IDB ONLY (never localStorage) and restore pre-replace state cleanly
    for (let i = 0; i < globalThis.localStorage.length; i++) {
      const k = globalThis.localStorage.key(i) || '';
      expect(k.startsWith('wg_v3_prerestore_snapshot_')).toBe(false);
    }
    expect(await hasPreRestoreSnapshotAsync()).toBe(true);

    const undoRes = await undoLastRestore();
    expect(undoRes.success).toBe(true);
    expect(getLedgerAccounts().some((a) => a.id === localOnlyAcc.id)).toBe(true);
    expect(getAllCashEntries().length).toBe(1);
    expect(getAllLedgerEntries().length).toBe(0);
  });

  // =========================================================================
  // Workstream 3: Pre-Restore IDB 7-Day Expiry & Error Handler Hygiene
  // =========================================================================

  it('stores pre-restore Undo snapshots exclusively in IndexedDB and auto-expires them after 7 days', async () => {
    const now = 1_700_000_000_000;
    await savePreRestoreSnapshotIdbOnly('uid_owner_test', { trips: [{ id: 1 }] }, now);

    // Strictly absent from localStorage
    expect(globalThis.localStorage.getItem('wg_v3_prerestore_snapshot_uid_owner_test')).toBeNull();
    expect(globalThis.localStorage.getItem('wg_v3_prerestore_available_uid_owner_test')).toBeNull();

    // Available at Day 6
    expect(await hasPreRestoreSnapshotIdbOnly('uid_owner_test', now + 6 * 86_400_000)).toBe(true);
    expect(await loadPreRestoreSnapshotIdbOnly('uid_owner_test', now + 6 * 86_400_000)).toEqual({
      trips: [{ id: 1 }]
    });

    // Expired & pruned cleanly at Day 8 (> 7 days)
    const pruned = await pruneExpiredPreRestoreSnapshotsIdbOnly(now + 8 * 86_400_000);
    expect(pruned).toBe(1);
    expect(await hasPreRestoreSnapshotIdbOnly('uid_owner_test', now + 8 * 86_400_000)).toBe(false);
  });

  it('suppresses only harmless ResizeObserver loop errors in src/main.tsx and index.html without swallowing no-filename errors', () => {
    const rootDir = process.cwd();
    const mainTsx = fs.readFileSync(path.join(rootDir, 'src/main.tsx'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

    expect(mainTsx).toContain('ResizeObserver loop');
    expect(mainTsx).not.toContain('!event.filename && !event.lineno');
    expect(mainTsx).not.toContain("'Script error'");

    expect(indexHtml).toContain('ResizeObserver loop');
    expect(indexHtml).not.toContain('!e.filename && !e.lineno');
  });
});
