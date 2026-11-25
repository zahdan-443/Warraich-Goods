import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockState = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>();
  const getDocsLog: Array<{ kind: 'collection' | 'collectionGroup'; path: string }> = [];
  let failCollectionGroup = false;

  return {
    docs,
    getDocsLog,
    get failCollectionGroup() {
      return failCollectionGroup;
    },
    setFailCollectionGroup(v: boolean) {
      failCollectionGroup = v;
    },
    mockUser: {
      uid: 'khata_user_1',
      email: 'driver1@gmail.com'
    } as { uid: string; email: string } | null,
    reset() {
      docs.clear();
      getDocsLog.length = 0;
      failCollectionGroup = false;
      this.mockUser = {
        uid: 'khata_user_1',
        email: 'driver1@gmail.com'
      };
    }
  };
});

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
    collectionGroup: (_db: unknown, name: string) => ({
      __type: 'collGroup',
      groupName: name
    }),
    where: (field: string, op: string, value: unknown) => ({
      __type: 'where',
      field,
      op,
      value
    }),
    query: (target: Record<string, unknown>, ...constraints: Array<{ field?: string; value?: unknown }>) => ({
      ...target,
      constraints
    }),
    getDoc: async (ref: { path: string }) => {
      const val = mockState.docs.get(ref.path);
      return {
        exists: () => val !== undefined,
        id: ref.path.split('/').pop(),
        ref,
        data: () => val
      };
    },
    getDocs: async (target: {
      __type?: string;
      path?: string;
      groupName?: string;
      constraints?: Array<{ field?: string; value?: unknown }>;
    }) => {
      if (target.__type === 'collGroup' && target.groupName) {
        mockState.getDocsLog.push({ kind: 'collectionGroup', path: target.groupName });
        if (mockState.failCollectionGroup) {
          throw new Error('failed-precondition: index building');
        }
        const ownerConstraint = target.constraints?.find(c => c.field === 'ownerUid')?.value;
        const matched = Array.from(mockState.docs.entries())
          .filter(([p, d]) => {
            if (!p.includes(`/${target.groupName}/`)) return false;
            if (ownerConstraint !== undefined) return d.ownerUid === ownerConstraint;
            return true;
          })
          .map(([p, d]) => ({
            id: p.split('/').pop() || '',
            ref: { path: p },
            data: () => d
          }));
        return {
          docs: matched,
          empty: matched.length === 0,
          forEach: (cb: (doc: any) => void) => matched.forEach(cb)
        };
      }

      const targetPath = target.path || '';
      mockState.getDocsLog.push({ kind: 'collection', path: targetPath });
      const matched = Array.from(mockState.docs.entries())
        .filter(([p]) => {
          if (!p.startsWith(targetPath + '/')) return false;
          const rest = p.slice(targetPath.length + 1);
          return !rest.includes('/');
        })
        .map(([p, d]) => ({
          id: p.split('/').pop() || '',
          ref: { path: p },
          data: () => d
        }));
      return {
        docs: matched,
        empty: matched.length === 0,
        forEach: (cb: (doc: any) => void) => matched.forEach(cb)
      };
    },
    setDoc: async (ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) => {
      const prev = opts?.merge ? mockState.docs.get(ref.path) || {} : {};
      mockState.docs.set(ref.path, { ...prev, ...data });
    },
    deleteDoc: async (ref: { path: string }) => {
      mockState.docs.delete(ref.path);
    }
  };
});

vi.mock('../utils/firebase', () => ({
  db: { __mockDb: true },
  auth: {
    get currentUser() {
      return mockState.mockUser;
    }
  }
}));

import {
  fetchKhataFromFirestore,
  getAllLedgerEntries,
  getLedgerAccounts,
  saveOrUpdateLedgerEntry
} from '../utils/ledgerStorage';

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  const mockStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true
  });
}

describe('Step 7: Khata N+1 Elimination via ownerUid-scoped collectionGroup(entries)', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
    mockState.reset();
  });

  it('fetches 25 accounts and 50 entries using 1 collectionGroup query instead of 25 subcollection queries', async () => {
    const uid = 'khata_user_1';
    for (let i = 1; i <= 25; i++) {
      const accId = `acc_${i}`;
      mockState.docs.set(`users/${uid}/ledgerAccounts/${accId}`, {
        id: accId,
        kind: 'party',
        name: `Party ${i}`,
        openingAmount: 0,
        openingDirection: 'get',
        source: 'manual',
        createdAt: '2026-11-25T08:00:00Z',
        updatedAt: '2026-11-25T08:00:00Z'
      });

      for (let j = 1; j <= 2; j++) {
        const entryId = `entry_${i}_${j}`;
        mockState.docs.set(`users/${uid}/ledgerAccounts/${accId}/entries/${entryId}`, {
          id: entryId,
          accountId: accId,
          ownerUid: uid,
          type: 'gave',
          amount: 1000 * j,
          date: '2026-11-25',
          source: 'manual',
          createdAt: '2026-11-25T08:00:00Z',
          updatedAt: '2026-11-25T08:00:00Z'
        });
      }
    }

    // Seed another user's entry that MUST NOT leak into uid's result
    mockState.docs.set(`users/other_uid/ledgerAccounts/acc_x/entries/entry_other`, {
      id: 'entry_other',
      accountId: 'acc_x',
      ownerUid: 'other_uid',
      type: 'gave',
      amount: 99999,
      date: '2026-11-25',
      source: 'manual',
      createdAt: '2026-11-25T08:00:00Z',
      updatedAt: '2026-11-25T08:00:00Z'
    });

    await fetchKhataFromFirestore();

    expect(getLedgerAccounts().length).toBe(25);
    expect(getAllLedgerEntries().length).toBe(50);
    expect(getAllLedgerEntries().some(e => e.id === 'entry_other')).toBe(false);

    const subEntryQueries = mockState.getDocsLog.filter(
      q => q.kind === 'collection' && q.path.includes('/entries')
    );
    const cgQueries = mockState.getDocsLog.filter(
      q => q.kind === 'collectionGroup' && q.path === 'entries'
    );
    expect(cgQueries.length).toBe(1);
    expect(subEntryQueries.length).toBe(0);
  });

  it('stamps ownerUid on new/updated entries and falls back safely if collectionGroup fails', async () => {
    const saved = saveOrUpdateLedgerEntry({
      accountId: 'acc_1',
      type: 'got',
      amount: 2500,
      date: '2026-11-25',
      note: 'Cash'
    });
    expect(saved.ownerUid).toBe('khata_user_1');
    expect(mockState.docs.get(`users/khata_user_1/ledgerAccounts/acc_1/entries/${saved.id}`)?.ownerUid).toBe(
      'khata_user_1'
    );

    mockState.docs.set('users/khata_user_1/ledgerAccounts/acc_1', {
      id: 'acc_1',
      kind: 'party',
      name: 'Fallback Party',
      openingAmount: 0,
      openingDirection: 'get',
      source: 'manual',
      createdAt: '2026-11-25T08:00:00Z',
      updatedAt: '2026-11-25T08:00:00Z'
    });
    mockState.docs.set('users/khata_user_1/ledgerAccounts/acc_1/entries/e_cloud', {
      id: 'e_cloud',
      accountId: 'acc_1',
      type: 'gave',
      amount: 5000,
      date: '2026-11-25',
      source: 'manual',
      createdAt: '2026-11-25T08:00:00Z',
      updatedAt: '2026-11-25T09:00:00Z'
    });

    mockState.setFailCollectionGroup(true);
    await fetchKhataFromFirestore();

    const loaded = getAllLedgerEntries();
    expect(loaded.some(e => e.id === 'e_cloud')).toBe(true);
    // Legacy cloud entry discovered during fallback gets ownerUid stamped for next sync
    expect(mockState.docs.get('users/khata_user_1/ledgerAccounts/acc_1/entries/e_cloud')?.ownerUid).toBe(
      'khata_user_1'
    );
  });
});
