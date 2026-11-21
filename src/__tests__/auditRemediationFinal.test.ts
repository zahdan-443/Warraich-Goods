import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const testMockState = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  return {
    docs,
    isNative: false,
    mockUser: {
      uid: 'uid_owner_test',
      email: 'warraichgoods43@gmail.com'
    },
    reset() {
      docs.clear();
      testMockState.isNative = false;
      testMockState.mockUser = {
        uid: 'uid_owner_test',
        email: 'warraichgoods43@gmail.com'
      };
    }
  };
});

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: () => testMockState.isNative,
    getPlatform: () => (testMockState.isNative ? 'android' : 'web')
  }
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(async () => ({}))
  }
}));

vi.mock('firebase/firestore', () => {
  const pathOf = (segments: string[]) => segments.join('/');
  return {
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
      const val = testMockState.docs.get(ref.path);
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
      for (const [k, v] of testMockState.docs.entries()) {
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
        docs: matched,
        forEach: (cb: (d: (typeof matched)[number]) => void) => matched.forEach(cb)
      };
    },
    setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      const prev = opts?.merge ? testMockState.docs.get(ref.path) || {} : {};
      testMockState.docs.set(ref.path, { ...prev, ...data });
    },
    deleteDoc: async (ref: { path: string }) => {
      testMockState.docs.delete(ref.path);
    },
    writeBatch: () => {
      const ops: Array<() => void> = [];
      return {
        set: (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
          ops.push(() => {
            const prev = opts?.merge ? testMockState.docs.get(ref.path) || {} : {};
            testMockState.docs.set(ref.path, { ...prev, ...data });
          });
        },
        delete: (ref: { path: string }) => {
          ops.push(() => {
            testMockState.docs.delete(ref.path);
          });
        },
        commit: async () => {
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
    return { currentUser: testMockState.mockUser };
  },
  db: {},
  deleteFirebaseUserAccount: async () => {}
}));

import { ManageBiltyAccessModal } from '../components/ManageBiltyAccessModal';
import {
  buildPublicEmblemCandidates,
  LEGACY_ICON_FILE,
  LEGACY_OFFICIAL_EMBLEM_FILE,
  NEUTRAL_ICON_FILE,
  NEUTRAL_OFFICIAL_EMBLEM_FILE,
  PRIMARY_EMBLEM_FALLBACK_ORDER,
  resetEmblemResolverCacheForTests,
  resolvePublicEmblemUrl
} from '../utils/assetResolver';
import { PUBLIC_APP_SHARE_URL, resolvePublicAppShareUrl } from '../utils/externalLinks';
import { OFFICIAL_APP_BASE_URL, getBiltyVerificationUrl } from '../utils/biltyHelpers';
import { generateFullFleetBackup } from '../utils/backupService';
import {
  deleteLedgerAccount,
  enqueueKhataDocSync,
  fetchKhataFromFirestore,
  getAllCashEntries,
  getAllLedgerEntries,
  getKhataQueueStats,
  getLedgerAccounts,
  processKhataDocQueue,
  saveOrUpdateCashEntry,
  saveOrUpdateLedgerAccount,
  saveOrUpdateLedgerEntry
} from '../utils/ledgerStorage';
import { DEFAULT_COMPANY_PROFILE, restoreFullBackupFromJson } from '../utils/storage';
import { importGuestDataIntoScope, runOneTimeV2ToV3Migration } from '../utils/storageCore';
import {
  autoReconcileAllLocalToCloud,
  getStoredOfflineQueue,
  processOfflineQueue,
  saveStoredOfflineQueue,
  saveStoredTrips
} from '../utils/storageSync';

function setupBrowserEnv(loc?: Partial<Location>) {
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
      Object.keys(store).forEach(k => delete store[k]);
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
      pathname: '/',
      ...loc
    }
  };
  Object.defineProperty(globalThis, 'navigator', {
    value: { onLine: true, userAgent: 'vitest' },
    configurable: true
  });
}

describe('Final A-to-Z Audit Remediation Regressions', () => {
  beforeEach(() => {
    setupBrowserEnv();
    testMockState.reset();
    resetEmblemResolverCacheForTests();
    runOneTimeV2ToV3Migration('uid_owner_test');
  });

  it('renders ManageBiltyAccessModal cleanly across closed/open transitions without hook-order crashes and restricts access to Owner only', () => {
    const closedOwnerHtml = renderToStaticMarkup(
      React.createElement(ManageBiltyAccessModal, {
        isOpen: false,
        onClose: () => {},
        lang: 'en',
        currentUserUid: 'uid_owner_test',
        currentUserEmail: 'warraichgoods43@gmail.com'
      })
    );
    expect(closedOwnerHtml).toBe('');

    const openOwnerHtml = renderToStaticMarkup(
      React.createElement(ManageBiltyAccessModal, {
        isOpen: true,
        onClose: () => {},
        lang: 'en',
        currentUserUid: 'uid_owner_test',
        currentUserEmail: 'warraichgoods43@gmail.com'
      })
    );
    expect(openOwnerHtml).toContain('Owner Control');
    expect(openOwnerHtml).toContain('Business Reports');
    expect(openOwnerHtml).not.toContain('Staff Delegation');

    const openNonOwnerHtml = renderToStaticMarkup(
      React.createElement(ManageBiltyAccessModal, {
        isOpen: true,
        onClose: () => {},
        lang: 'en',
        currentUserUid: 'uid_guest_99',
        currentUserEmail: 'driver@example.com'
      })
    );
    expect(openNonOwnerHtml).toBe('');
  });

  it('includes v2 Khata ledger accounts, ledger entries, and cashbook entries in full backup & restore with merge/overwrite support', () => {
    const acc = saveOrUpdateLedgerAccount({
      kind: 'party',
      name: 'Samundri Traders',
      phone: '03005370443',
      openingAmount: 15000,
      openingDirection: 'get'
    });
    saveOrUpdateLedgerEntry({
      accountId: acc.id,
      date: '2026-11-20',
      type: 'gave',
      amount: 25000,
      note: 'Steel Coil Freight'
    });
    saveOrUpdateCashEntry({
      date: '2026-11-20',
      type: 'in',
      amount: 10000,
      category: 'Freight Receipt',
      note: 'Advance Cash'
    });

    const backup = generateFullFleetBackup();
    expect(backup.data.ledgerAccounts?.length).toBe(1);
    expect(backup.data.ledgerEntries?.length).toBe(1);
    expect(backup.data.cashbookEntries?.length).toBe(1);
    expect(backup.metadata.totalLedgerAccounts).toBe(1);
    expect(backup.metadata.totalLedgerEntries).toBe(1);
    expect(backup.metadata.totalCashbookEntries).toBe(1);

    const backupJson = JSON.stringify(backup);

    // Wipe local data, then overwrite restore
    globalThis.localStorage.clear();
    expect(getLedgerAccounts().length).toBe(0);

    const overwriteRes = restoreFullBackupFromJson(backupJson, 'overwrite');
    expect(overwriteRes.success).toBe(true);
    expect(getLedgerAccounts().map(a => a.name)).toContain('Samundri Traders');
    expect(getAllLedgerEntries().length).toBe(1);
    expect(getAllCashEntries().length).toBe(1);

    // Add a new local record and test merge preservation
    saveOrUpdateLedgerAccount({
      kind: 'broker',
      name: 'Okara Broker',
      phone: '03395370443',
      openingAmount: 0
    });
    const mergeRes = restoreFullBackupFromJson(backupJson, 'merge');
    expect(mergeRes.success).toBe(true);
    const mergedNames = getLedgerAccounts().map(a => a.name);
    expect(mergedNames).toContain('Samundri Traders');
    expect(mergedNames).toContain('Okara Broker');
  });

  it('propagates Khata deletion tombstones across devices during fetchKhataFromFirestore so deleted accounts do not resurrect', async () => {
    const acc = saveOrUpdateLedgerAccount({
      kind: 'party',
      name: 'Deleted Freight Party',
      phone: '03001112223',
      openingAmount: 5000
    });
    const staleTimestamp = new Date(Date.now() - 60_000).toISOString();

    // Put stale account doc on mocked Firestore, plus remote tombstone recorded at current time
    testMockState.docs.set(`users/uid_owner_test/ledgerAccounts/${acc.id}`, {
      ...acc,
      updatedAt: staleTimestamp
    });

    // Delete locally -> records tombstone and removes account locally
    deleteLedgerAccount(acc.id);
    expect(getLedgerAccounts().length).toBe(0);

    // Simulate second device with empty local tombstones fetching cloud khataSettings/config + stale ledgerAccounts doc
    testMockState.docs.set('users/uid_owner_test/khataSettings/config', {
      tombstones: {
        khata_ledgerAccounts: {
          [acc.id]: new Date(Date.now() + 5_000).toISOString()
        }
      }
    });

    await fetchKhataFromFirestore();
    expect(getLedgerAccounts().find(a => a.id === acc.id)).toBeUndefined();
  });

  it('resolves canonical HTTPS Share URL on Capacitor APK and localhost while preserving production HTTPS URL', () => {
    testMockState.isNative = true;
    setupBrowserEnv({ origin: 'https://localhost', hostname: 'localhost', protocol: 'https:', pathname: '/' });
    expect(resolvePublicAppShareUrl()).toBe(PUBLIC_APP_SHARE_URL);

    testMockState.isNative = false;
    setupBrowserEnv({ origin: 'http://127.0.0.1:3000', hostname: '127.0.0.1', protocol: 'http:', pathname: '/' });
    expect(resolvePublicAppShareUrl()).toBe(PUBLIC_APP_SHARE_URL);

    setupBrowserEnv({
      origin: 'https://zahdan-443.github.io',
      hostname: 'zahdan-443.github.io',
      protocol: 'https:',
      pathname: '/Warraich-Goods/'
    });
    expect(resolvePublicAppShareUrl()).toBe('https://zahdan-443.github.io/Warraich-Goods/');
  });

  it('resolves existing public emblem assets cleanly without nonexistent doc-* 404 candidates', async () => {
    const candidates = buildPublicEmblemCandidates('./');
    expect(candidates).toContain(`./${LEGACY_OFFICIAL_EMBLEM_FILE}`);
    expect(candidates).toContain(`./${LEGACY_ICON_FILE}`);
    expect(candidates.some(c => c.includes(NEUTRAL_OFFICIAL_EMBLEM_FILE) || c.includes(NEUTRAL_ICON_FILE))).toBe(false);
    expect(PRIMARY_EMBLEM_FALLBACK_ORDER[0]).toBe(`./${LEGACY_OFFICIAL_EMBLEM_FILE}`);

    const resolved = await resolvePublicEmblemUrl();
    expect(resolved).toBe(`./${LEGACY_OFFICIAL_EMBLEM_FILE}`);
  });

  it('enforces owner-only authorization in firestore.rules and zero forbidden terminology or raw browser dialogs', () => {
    const rootDir = process.cwd();
    const rules = fs.readFileSync(path.join(rootDir, 'firestore.rules'), 'utf8');
    expect(rules).toMatch(/function\s+isBiltyAuthorized\(\)\s*\{\s*return\s+isOwner\(\);\s*\}/);
    expect(rules).not.toContain('function isStaffAuthorized');
    expect(rules).toContain("match /accountDeletionRequests/{requestId}");
    expect(rules).toContain("request.resource.data.keys().hasAll(['userEmail', 'requestedAt', 'scheduledFor', 'status', 'referenceId'])");

    const sw = fs.readFileSync(path.join(rootDir, 'public/sw.js'), 'utf8');
    expect(sw.toLowerCase()).not.toContain('bilty');
    expect(sw).not.toContain('بلٹی');

    // Scan src/ (excluding __tests__) for raw window.alert / window.confirm / window.open
    const srcFiles: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.(ts|tsx)$/.test(entry.name)) {
          srcFiles.push(full);
        }
      }
    };
    walk(path.join(rootDir, 'src'));
    for (const filePath of srcFiles) {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      const codeOnly = rawContent
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      expect(codeOnly, `${path.relative(rootDir, filePath)} must not call window.alert/confirm/open`).not.toMatch(
        /\bwindow\.(alert|confirm|open)\s*\(/
      );
    }
  });

  it('uses canonical "نزد 466 چوک" instead of "نزدیک" across app defaults, UI, and public docs', () => {
    expect(DEFAULT_COMPANY_PROFILE.headOfficeUr).toContain('نزد 466 چوک');
    expect(DEFAULT_COMPANY_PROFILE.headOfficeUr).not.toContain('نزدیک');

    const rootDir = process.cwd();
    const scanDirs = [path.join(rootDir, 'src'), path.join(rootDir, 'public')];
    const extraFiles = ['index.html', 'README.md', 'CHANGELOG.md'].map(f => path.join(rootDir, f));
    const targets: string[] = [...extraFiles.filter(f => fs.existsSync(f))];
    const collectFiles = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__' && entry.name !== 'tesseract') collectFiles(full);
        } else if (/\.(ts|tsx|html|md|json|js)$/.test(entry.name)) {
          targets.push(full);
        }
      }
    };
    scanDirs.forEach(collectFiles);

    for (const filePath of targets) {
      const text = fs.readFileSync(filePath, 'utf8');
      expect(text, `${path.relative(rootDir, filePath)} must not contain نزدیک`).not.toContain('نزدیک');
    }
  });

  it('deletes uploaded offline queues, Khata queues, guest keys, pre-migration snapshots, and legacy duplicates from localStorage upon sync while retaining active scoped cache', async () => {
    const uid = 'uid_owner_test';

    // 1. Offline queue items + legacy queue keys + pre-migration snapshot + legacy duplicate key
    saveStoredTrips([
      {
        id: 501,
        name: 'Samundri -> Faisalabad',
        fuelType: 'Diesel',
        fuelTypeRaw: 'diesel',
        dist: 50,
        consumed: '12.50',
        fuelCost: 3500,
        toll: 0,
        loading: 0,
        driver: 0,
        other: 0,
        total: 3500,
        totalIncome: 12000,
        netProfit: 8500,
        isReturn: false,
        date: '2026-11-20',
        time: '10:00 AM',
        month: '2026-11'
      }
    ]);
    saveStoredOfflineQueue([
      {
        id: 9001,
        type: 'trip',
        data: { id: 501, name: 'Samundri -> Faisalabad' },
        timestamp: '10:00 AM',
        status: 'pending'
      }
    ]);
    globalThis.localStorage.setItem('ah-offline-queue', JSON.stringify([{ id: 1 }]));
    globalThis.localStorage.setItem('offline-queue', JSON.stringify([{ id: 2 }]));
    globalThis.localStorage.setItem(`wg_v3_premigration_snapshot_${uid}`, '{"capturedAt":"2026-11-20"}');
    globalThis.localStorage.setItem('ah-trips', JSON.stringify([{ id: 501 }]));

    // 2. Enqueue Khata doc sync item
    const acc = saveOrUpdateLedgerAccount({
      kind: 'party',
      name: 'Okara Mills',
      phone: '03005370443',
      openingAmount: 1000
    });
    enqueueKhataDocSync({
      action: 'upsert',
      collectionPath: 'ledgerAccounts',
      docId: acc.id,
      data: acc as unknown as Record<string, unknown>
    });
    expect(getKhataQueueStats().pendingCount).toBe(1);

    // Process queues directly first
    const offlineRes = await processOfflineQueue();
    expect(offlineRes).toEqual({
      processed: 1,
      remaining: 0,
      blocked: 0,
      errors: []
    });
    expect(globalThis.localStorage.getItem(`wg_v2_${uid}_offline-queue`)).toBeNull();
    expect(globalThis.localStorage.getItem('ah-offline-queue')).toBeNull();
    expect(globalThis.localStorage.getItem('offline-queue')).toBeNull();

    const khataRes = await processKhataDocQueue();
    expect(khataRes.processed).toBe(1);
    expect(khataRes.remaining).toBe(0);
    expect(globalThis.localStorage.getItem(`wg_v2_${uid}_dd_khata_doc_queue_v2`)).toBeNull();

    // Reconcile cleans up pre-migration snapshot & legacy ah-* duplicate keys, keeping active cache intact
    const reconcileRes = await autoReconcileAllLocalToCloud(uid);
    expect(reconcileRes.synced).toBe(true);
    expect(globalThis.localStorage.getItem(`wg_v3_premigration_snapshot_${uid}`)).toBeNull();
    expect(globalThis.localStorage.getItem('ah-trips')).toBeNull();
    expect(globalThis.localStorage.getItem(`wg_v2_${uid}_trips`)).not.toBeNull();

    // 3. Guest merge migrates queued action then completely deletes wg_v2_guest_* keys
    globalThis.localStorage.setItem(
      'wg_v2_guest_trips',
      JSON.stringify([
        {
          id: 777,
          name: 'Guest Local Trip',
          distance: 100,
          mileage: 5,
          fuelPrice: 280,
          fuelType: 'Diesel',
          toll: 0,
          otherExp: 0,
          freight: 20000,
          fuelCost: 5600,
          totalCost: 5600,
          netProfit: 14400,
          date: '2026-11-20',
          updatedAt: '2026-11-20T12:00:00.000Z'
        }
      ])
    );
    globalThis.localStorage.setItem(
      'wg_v2_guest_offline-queue',
      JSON.stringify([
        { id: 888, type: 'trip', data: { id: 777 }, timestamp: '12:00 PM', status: 'pending' }
      ])
    );

    const mergeOut = importGuestDataIntoScope(uid, 'merge');
    expect(mergeOut.mergedCount).toBe(1);
    expect(globalThis.localStorage.getItem('wg_v2_guest_trips')).toBeNull();
    expect(globalThis.localStorage.getItem('wg_v2_guest_offline-queue')).toBeNull();
    expect(getStoredOfflineQueue().length).toBe(1);

    await processOfflineQueue();
    expect(globalThis.localStorage.getItem(`wg_v2_${uid}_offline-queue`)).toBeNull();

    // Discard also deletes guest keys cleanly without leaving '[]'
    globalThis.localStorage.setItem('wg_v2_guest_vehicles', JSON.stringify([{ id: 1, reg: 'FSD-999' }]));
    importGuestDataIntoScope(uid, 'discard');
    expect(globalThis.localStorage.getItem('wg_v2_guest_vehicles')).toBeNull();
  });

  it('uses crisp Noto Naskh Arabic / Noto Sans Arabic without colliding Nastaleeq UI aliases or RTL letter-spacing', () => {
    const rootDir = process.cwd();
    const css = fs.readFileSync(path.join(rootDir, 'src/index.css'), 'utf8');
    const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const printable = fs.readFileSync(path.join(rootDir, 'src/components/PrintableBilty.tsx'), 'utf8');

    expect(html).toContain('Noto+Naskh+Arabic');
    expect(html).not.toContain('rel="preload" href="./fonts/PDMS_NastaliqNafees.ttf"');
    expect(css).not.toContain("font-family: 'Jameel Noori Nastaleeq'");
    expect(css).not.toContain("font-family: 'Alvi Lahori Nastaleeq'");
    expect(css).toContain('[dir="rtl"] *, body.urdu *, [lang="ur"], [lang="ur"] * {\n  letter-spacing: 0 !important;');
    expect(printable).toContain("'Noto Naskh Arabic', 'Noto Sans Arabic'");
  });

  it('keeps HomeView Owner panel simplified to action buttons only and routes BiltyView back steps without abruptly leaving to Dashboard', () => {
    const rootDir = process.cwd();
    const homeSrc = fs.readFileSync(path.join(rootDir, 'src/components/views/HomeView.tsx'), 'utf8');
    const appSrc = fs.readFileSync(path.join(rootDir, 'src/App.tsx'), 'utf8');
    const biltySrc = fs.readFileSync(path.join(rootDir, 'src/components/views/BiltyView.tsx'), 'utf8');

    expect(homeSrc).not.toContain('biltyOfficialIconData');
    expect(homeSrc).toContain('Simple Buttons Only (No Logo/Images)');
    expect(appSrc).toContain("new CustomEvent('app-back-button', { cancelable: true })");
    expect(biltySrc).toContain("window.addEventListener('app-back-button', handleBack)");
    expect(biltySrc).toContain('hasUnsavedCreateDraft');
    expect(biltySrc).toContain('showExitCreateConfirm');
  });

  it('uses canonical Urdu spelling وڑائچ گڈز ٹرانسپورٹ کمپنی across src and public with zero typo variants', () => {
    const rootDir = process.cwd();
    const scanDirs = [path.join(rootDir, 'src'), path.join(rootDir, 'public')];
    const extraFiles = ['index.html', 'README.md'].map(f => path.join(rootDir, f));
    const targets: string[] = [...extraFiles.filter(f => fs.existsSync(f))];
    const collectFiles = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== '__tests__' && entry.name !== 'tesseract') collectFiles(full);
        } else if (/\.(ts|tsx|html|md|json|js)$/.test(entry.name)) {
          targets.push(full);
        }
      }
    };
    scanDirs.forEach(collectFiles);

    const typoPattern = /وارائچ|وارڑائچ|ورائچ|وڑایچ/;
    for (const filePath of targets) {
      const text = fs.readFileSync(filePath, 'utf8');
      expect(text, `${path.relative(rootDir, filePath)} must use canonical وڑائچ spelling`).not.toMatch(typoPattern);
    }
  });

  it('points official company website and QR bilty verification URLs to https://warraichgoods.eu.cc', () => {
    expect(OFFICIAL_APP_BASE_URL).toBe('https://warraichgoods.eu.cc/');
    expect(getBiltyVerificationUrl('WG-1001')).toBe('https://warraichgoods.eu.cc/?page=verify&bilty=WG-1001');
  });
});
