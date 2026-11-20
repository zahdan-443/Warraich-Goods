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
import { generateFullFleetBackup } from '../utils/backupService';
import {
  deleteLedgerAccount,
  fetchKhataFromFirestore,
  getAllCashEntries,
  getAllLedgerEntries,
  getLedgerAccounts,
  saveOrUpdateCashEntry,
  saveOrUpdateLedgerAccount,
  saveOrUpdateLedgerEntry
} from '../utils/ledgerStorage';
import { restoreFullBackupFromJson } from '../utils/storage';
import { runOneTimeV2ToV3Migration } from '../utils/storageCore';

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
});
