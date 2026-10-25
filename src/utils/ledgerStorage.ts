/**
 * Driver Dost - Digital Khata (کھاتہ) & Ledger Storage Engine
 * 
 * Standards:
 * 1. Offline-First: All changes persist instantly to safeStorage (localStorage + IndexedDB).
 * 2. Per-Document Firestore Mirror: When signed in, mirrors each account, entry, and cash record
 *    to its own document in users/{uid}/... (avoids 1MB single-document limits).
 * 3. Strict Terminology Policy: The word "Bilty" / "بلٹی" NEVER appears in user-facing text or backups.
 * 4. Safe Arithmetic & Pakistani Phone Normalization without eval or vulnerabilities.
 * 5. PIN Lock with salted SHA-256 and exponential backoff lockout.
 */

import {
  LedgerAccount,
  LedgerEntry,
  CashEntry,
  KhataSettings,
  Language,
  Trip,
  BiltyRecord,
  LedgerParty,
  PartyTransaction,
  LedgerBroker,
  BrokerTransaction,
  VehicleExpenseEntry,
  VehicleIncomeEntry
} from '../types';
import { safeStorage, getStoredBilties } from './storage';
import { auth, db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs
} from 'firebase/firestore';

// ----------------- STORAGE KEYS -----------------
export const KHATA_STORAGE_KEYS = {
  ACCOUNTS: 'dd_khata_accounts_v2',
  ENTRIES: 'dd_khata_entries_v2',
  CASHBOOK: 'dd_khata_cashbook_v2',
  SETTINGS: 'dd_khata_settings_v2',
  OFFLINE_QUEUE: 'dd_khata_doc_queue_v2',
  // Legacy keys for backward compatibility
  LEGACY_PARTIES: 'dd_ledger_parties',
  LEGACY_PARTY_TXS: 'dd_ledger_party_transactions',
  LEGACY_BROKERS: 'dd_ledger_brokers',
  LEGACY_BROKER_TXS: 'dd_ledger_broker_transactions',
  LEGACY_VEHICLE_EXPENSES: 'dd_ledger_vehicle_expenses',
  LEGACY_VEHICLE_INCOME: 'dd_ledger_vehicle_income'
};

// ----------------- PARSING & HELPER UTILITIES -----------------

function getParsed<T>(key: string, fallback: T): T {
  try {
    const raw = safeStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setJson(key: string, value: any): void {
  try {
    safeStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[KhataStorage] Failed to persist ${key}:`, err);
  }
}

/**
 * Normalizes Pakistani phone numbers:
 * 03XXXXXXXXX, +923XXXXXXXXX, 00923XXXXXXXXX, 923XXXXXXXXX -> 923XXXXXXXXX
 * Returns null if invalid or not a valid Pakistani mobile number.
 */
export function normalizePakistaniPhone(input?: string | null): string | null {
  if (!input) return null;
  // Strip spaces, dashes, parentheses, dots
  const cleaned = input.replace(/[\s\-\(\)\.]/g, '').trim();
  if (!cleaned) return null;

  // Patterns for Pakistani mobile networks (prefix 3, 9 following digits = 10 digits mobile number)
  // 1. +923XXXXXXXXX (13 chars)
  const plusMatch = cleaned.match(/^\+92(3\d{9})$/);
  if (plusMatch) return `92${plusMatch[1]}`;

  // 2. 00923XXXXXXXXX (14 chars)
  const doubleZeroMatch = cleaned.match(/^0092(3\d{9})$/);
  if (doubleZeroMatch) return `92${doubleZeroMatch[1]}`;

  // 3. 923XXXXXXXXX (12 chars)
  const noPlusMatch = cleaned.match(/^92(3\d{9})$/);
  if (noPlusMatch) return `92${noPlusMatch[1]}`;

  // 4. 03XXXXXXXXX (11 chars)
  const localMatch = cleaned.match(/^0(3\d{9})$/);
  if (localMatch) return `92${localMatch[1]}`;

  // 5. 3XXXXXXXXX (10 chars, user omitted leading 0)
  const bareMobileMatch = cleaned.match(/^(3\d{9})$/);
  if (bareMobileMatch) return `92${bareMobileMatch[1]}`;

  return null;
}

/**
 * Format normalized phone (923XXXXXXXXX) for local display (03XXXXXXXXX)
 */
export function formatPhoneForDisplay(normalizedPhone?: string | null): string {
  if (!normalizedPhone) return '';
  if (normalizedPhone.startsWith('923') && normalizedPhone.length === 12) {
    return `0${normalizedPhone.substring(2)}`;
  }
  return normalizedPhone;
}

/**
 * Safe Arithmetic Parser without eval.
 * Supports +, -, *, /, and nested parentheses.
 * Returns null on invalid characters, unbalanced parens, or division by zero.
 */
export function evaluateArithmetic(expr: string): number | null {
  if (!expr || typeof expr !== 'string') return null;
  const trimmed = expr.replace(/\s+/g, '');
  if (!trimmed) return null;

  // Validate characters: only digits, decimal point, operators and parentheses allowed
  if (!/^[0-9+\-*/().]+$/.test(trimmed)) {
    return null;
  }

  // Tokenize
  const tokens: string[] = [];
  let i = 0;
  while (i < trimmed.length) {
    const ch = trimmed[i];
    if ('+-*/()'.includes(ch)) {
      tokens.push(ch);
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let numStr = '';
      let dotCount = 0;
      while (i < trimmed.length && /[0-9.]/.test(trimmed[i])) {
        if (trimmed[i] === '.') {
          dotCount++;
          if (dotCount > 1) return null; // multiple dots in one number
        }
        numStr += trimmed[i];
        i++;
      }
      tokens.push(numStr);
    } else {
      return null;
    }
  }

  // Recursive descent parser
  // Grammar:
  // Expr -> Term (( '+' | '-' ) Term)*
  // Term -> Factor (( '*' | '/' ) Factor)*
  // Factor -> [ '+' | '-' ] Primary
  // Primary -> NUMBER | '(' Expr ')'

  let pos = 0;

  function parsePrimary(): number | null {
    if (pos >= tokens.length) return null;
    const token = tokens[pos];

    if (token === '(') {
      pos++; // consume '('
      const val = parseExpr();
      if (val === null) return null;
      if (pos >= tokens.length || tokens[pos] !== ')') return null;
      pos++; // consume ')'
      return val;
    }

    const num = parseFloat(token);
    if (isNaN(num)) return null;
    pos++;
    return num;
  }

  function parseFactor(): number | null {
    if (pos >= tokens.length) return null;
    let sign = 1;
    if (tokens[pos] === '+') {
      pos++;
    } else if (tokens[pos] === '-') {
      sign = -1;
      pos++;
    }
    const val = parsePrimary();
    if (val === null) return null;
    return sign * val;
  }

  function parseTerm(): number | null {
    let left = parseFactor();
    if (left === null) return null;

    while (pos < tokens.length && (tokens[pos] === '*' || tokens[pos] === '/')) {
      const op = tokens[pos++];
      const right = parseFactor();
      if (right === null) return null;
      if (op === '*') {
        left = left * right;
      } else {
        if (Math.abs(right) < 1e-12) return null; // Division by zero
        left = left / right;
      }
    }
    return left;
  }

  function parseExpr(): number | null {
    let left = parseTerm();
    if (left === null) return null;

    while (pos < tokens.length && (tokens[pos] === '+' || tokens[pos] === '-')) {
      const op = tokens[pos++];
      const right = parseTerm();
      if (right === null) return null;
      if (op === '+') {
        left = left + right;
      } else {
        left = left - right;
      }
    }
    return left;
  }

  const result = parseExpr();
  if (pos !== tokens.length || result === null || !isFinite(result)) {
    return null;
  }

  // Round to 2 decimal places to avoid IEEE 754 precision artifacts
  return Math.round(result * 100) / 100;
}

// ----------------- BALANCE CALCULATION -----------------

/**
 * Balance rule:
 * balance = opening (+ if 'get', - if 'give') + sum(gave) - sum(got)
 * 
 * Positive = "You will get / آپ کو ملنا ہے" (Green/Emerald)
 * Negative = "You will give / آپ کو دینا ہے" (Red/Rose)
 * Zero = "Settled / بیباق"
 */
export function calculateAccountBalance(
  account: Pick<LedgerAccount, 'openingAmount' | 'openingDirection'>,
  entries: LedgerEntry[] = []
): {
  balance: number;
  totalGave: number;
  totalGot: number;
  status: 'get' | 'give' | 'settled';
} {
  const opening = (account.openingDirection === 'get' ? 1 : -1) * (Number(account.openingAmount) || 0);

  let totalGave = 0;
  let totalGot = 0;

  for (const entry of entries) {
    const amt = Number(entry.amount) || 0;
    if (entry.type === 'gave') {
      totalGave += amt;
    } else if (entry.type === 'got') {
      totalGot += amt;
    }
  }

  const balance = Math.round((opening + totalGave - totalGot) * 100) / 100;

  return {
    balance,
    totalGave,
    totalGot,
    status: balance > 0 ? 'get' : balance < 0 ? 'give' : 'settled'
  };
}

/**
 * Calculates totals for a list of accounts
 */
export function calculateAccountsSummary(accounts: LedgerAccount[], allEntries: LedgerEntry[] = []): {
  totalWillGet: number;
  totalWillGive: number;
  netBalance: number;
  accountsCount: number;
  overdueCount: number;
} {
  let totalWillGet = 0;
  let totalWillGive = 0;
  let overdueCount = 0;
  const today = new Date().toISOString().split('T')[0];

  const entriesByAccount = new Map<string, LedgerEntry[]>();
  for (const entry of allEntries) {
    const existing = entriesByAccount.get(entry.accountId) || [];
    existing.push(entry);
    entriesByAccount.set(entry.accountId, existing);
  }

  for (const acc of accounts) {
    const entries = entriesByAccount.get(acc.id) || [];
    const { balance } = calculateAccountBalance(acc, entries);

    if (balance > 0) {
      totalWillGet += balance;
    } else if (balance < 0) {
      totalWillGive += Math.abs(balance);
    }

    if (acc.dueDate && acc.dueDate < today && balance > 0) {
      overdueCount++;
    }
  }

  return {
    totalWillGet: Math.round(totalWillGet),
    totalWillGive: Math.round(totalWillGive),
    netBalance: Math.round(totalWillGet - totalWillGive),
    accountsCount: accounts.length,
    overdueCount
  };
}

// ----------------- PIN LOCK & SECURITY UTILITIES -----------------

export function generatePinSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

/**
 * SHA-256 hash of (salt + pin) using Web Crypto API with fallback
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}__dd_pin__${pin}`);
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
  }
  // Basic deterministic fallback for rare restricted environments
  let hash = 0;
  const str = `${salt}:${pin}`;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

export async function verifyPin(pin: string, salt: string, expectedHash: string): Promise<boolean> {
  const computed = await hashPin(pin, salt);
  return computed === expectedHash;
}

/**
 * Exponential lockout calculation:
 * 0 to 4 attempts: 0s
 * 5 attempts: 30s
 * 6 attempts: 60s
 * 7 attempts: 120s
 * 8 attempts: 240s
 * capped at 3600s
 */
export function calculateLockoutDuration(failedAttempts: number): number {
  if (failedAttempts < 5) return 0;
  const exponent = failedAttempts - 5;
  const seconds = 30 * Math.pow(2, exponent);
  return Math.min(seconds, 3600);
}

export function isPinLocked(lockoutUntil?: number): boolean {
  if (!lockoutUntil) return false;
  return Date.now() < lockoutUntil;
}

// ----------------- OFFLINE PER-DOCUMENT SYNC QUEUE -----------------

export interface KhataDocQueueItem {
  id: string;
  action: 'upsert' | 'delete';
  collectionPath: string; // e.g. 'ledgerAccounts' | 'entries' | 'cashbookEntries' | 'khataSettings'
  docId: string;
  subPath?: string; // e.g. accountId for nested entries
  data?: any;
  timestamp: string;
  retryCount: number;
}

function getStoredKhataQueue(): KhataDocQueueItem[] {
  return getParsed<KhataDocQueueItem[]>(KHATA_STORAGE_KEYS.OFFLINE_QUEUE, []);
}

function saveStoredKhataQueue(queue: KhataDocQueueItem[]): void {
  setJson(KHATA_STORAGE_KEYS.OFFLINE_QUEUE, queue);
}

export function enqueueKhataDocSync(item: Omit<KhataDocQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
  try {
    const queue = getStoredKhataQueue();
    const newItem: KhataDocQueueItem = {
      ...item,
      id: `khata_doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    // Filter duplicate pending syncs for same doc
    const filtered = queue.filter(
      q => !(q.collectionPath === item.collectionPath && q.docId === item.docId && q.subPath === item.subPath)
    );
    saveStoredKhataQueue([newItem, ...filtered].slice(0, 100));
  } catch (err) {
    console.warn('[KhataQueue] Failed to enqueue:', err);
  }
}

/**
 * Processes queued per-document sync actions when online
 */
export async function processKhataDocQueue(): Promise<{ processed: number; remaining: number }> {
  const queue = getStoredKhataQueue();
  if (queue.length === 0) return { processed: 0, remaining: 0 };

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) return { processed: 0, remaining: queue.length };

  const user = auth.currentUser;
  if (!user || !db) return { processed: 0, remaining: queue.length };

  const remaining: KhataDocQueueItem[] = [];
  let processed = 0;

  for (const item of queue) {
    try {
      if (item.collectionPath === 'ledgerAccounts') {
        const ref = doc(db, 'users', user.uid, 'ledgerAccounts', item.docId);
        if (item.action === 'upsert') {
          await setDoc(ref, item.data, { merge: true });
        } else {
          await deleteDoc(ref);
        }
      } else if (item.collectionPath === 'entries' && item.subPath) {
        const ref = doc(db, 'users', user.uid, 'ledgerAccounts', item.subPath, 'entries', item.docId);
        if (item.action === 'upsert') {
          await setDoc(ref, item.data, { merge: true });
        } else {
          await deleteDoc(ref);
        }
      } else if (item.collectionPath === 'cashbookEntries') {
        const ref = doc(db, 'users', user.uid, 'cashbookEntries', item.docId);
        if (item.action === 'upsert') {
          await setDoc(ref, item.data, { merge: true });
        } else {
          await deleteDoc(ref);
        }
      } else if (item.collectionPath === 'khataSettings') {
        const ref = doc(db, 'users', user.uid, 'khataSettings', item.docId);
        await setDoc(ref, item.data, { merge: true });
      }
      processed++;
    } catch (err) {
      item.retryCount++;
      if (item.retryCount < 5) {
        remaining.push(item);
      }
    }
  }

  saveStoredKhataQueue(remaining);
  return { processed, remaining: remaining.length };
}

// ----------------- FIRESTORE PER-DOCUMENT MIRRORING -----------------

async function mirrorAccountToFirestore(account: LedgerAccount, action: 'upsert' | 'delete'): Promise<void> {
  const user = auth.currentUser;
  if (!user || !db) {
    if (user) enqueueKhataDocSync({ action, collectionPath: 'ledgerAccounts', docId: account.id, data: account });
    return;
  }

  try {
    const ref = doc(db, 'users', user.uid, 'ledgerAccounts', account.id);
    if (action === 'upsert') {
      await setDoc(ref, account, { merge: true });
    } else {
      await deleteDoc(ref);
    }
  } catch {
    enqueueKhataDocSync({ action, collectionPath: 'ledgerAccounts', docId: account.id, data: account });
  }
}

async function mirrorEntryToFirestore(entry: LedgerEntry, action: 'upsert' | 'delete'): Promise<void> {
  const user = auth.currentUser;
  if (!user || !db) {
    if (user) enqueueKhataDocSync({ action, collectionPath: 'entries', docId: entry.id, subPath: entry.accountId, data: entry });
    return;
  }

  try {
    const ref = doc(db, 'users', user.uid, 'ledgerAccounts', entry.accountId, 'entries', entry.id);
    if (action === 'upsert') {
      await setDoc(ref, entry, { merge: true });
    } else {
      await deleteDoc(ref);
    }
  } catch {
    enqueueKhataDocSync({ action, collectionPath: 'entries', docId: entry.id, subPath: entry.accountId, data: entry });
  }
}

async function mirrorCashEntryToFirestore(entry: CashEntry, action: 'upsert' | 'delete'): Promise<void> {
  const user = auth.currentUser;
  if (!user || !db) {
    if (user) enqueueKhataDocSync({ action, collectionPath: 'cashbookEntries', docId: entry.id, data: entry });
    return;
  }

  try {
    const ref = doc(db, 'users', user.uid, 'cashbookEntries', entry.id);
    if (action === 'upsert') {
      await setDoc(ref, entry, { merge: true });
    } else {
      await deleteDoc(ref);
    }
  } catch {
    enqueueKhataDocSync({ action, collectionPath: 'cashbookEntries', docId: entry.id, data: entry });
  }
}

async function mirrorSettingsToFirestore(settings: KhataSettings): Promise<void> {
  const user = auth.currentUser;
  if (!user || !db) {
    if (user) enqueueKhataDocSync({ action: 'upsert', collectionPath: 'khataSettings', docId: 'config', data: settings });
    return;
  }

  try {
    const ref = doc(db, 'users', user.uid, 'khataSettings', 'config');
    await setDoc(ref, settings, { merge: true });
  } catch {
    enqueueKhataDocSync({ action: 'upsert', collectionPath: 'khataSettings', docId: 'config', data: settings });
  }
}

// ----------------- FULL FIRESTORE HYDRATION ON LOGIN -----------------

export async function fetchKhataFromFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user || !db) return;

  try {
    // 1. Fetch Accounts
    const accColl = collection(db, 'users', user.uid, 'ledgerAccounts');
    const accSnap = await getDocs(accColl);
    const cloudAccounts: LedgerAccount[] = [];
    const cloudEntries: LedgerEntry[] = [];

    for (const d of accSnap.docs) {
      const data = d.data() as LedgerAccount;
      if (data && data.id) {
        cloudAccounts.push(data);

        // Fetch subcollection entries
        try {
          const entryColl = collection(db, 'users', user.uid, 'ledgerAccounts', data.id, 'entries');
          const entrySnap = await getDocs(entryColl);
          for (const ed of entrySnap.docs) {
            const edata = ed.data() as LedgerEntry;
            if (edata && edata.id) {
              cloudEntries.push(edata);
            }
          }
        } catch (e) {
          console.warn(`Sub-entries fetch notice for ${data.id}:`, e);
        }
      }
    }

    if (cloudAccounts.length > 0) {
      // Merge with local accounts (cloud wins if newer)
      const localAccounts = getLedgerAccounts();
      const mergedMap = new Map<string, LedgerAccount>();
      for (const a of localAccounts) mergedMap.set(a.id, a);
      for (const ca of cloudAccounts) {
        const existing = mergedMap.get(ca.id);
        if (!existing || new Date(ca.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
          mergedMap.set(ca.id, ca);
        }
      }
      setJson(KHATA_STORAGE_KEYS.ACCOUNTS, Array.from(mergedMap.values()));
    }

    if (cloudEntries.length > 0) {
      const localEntries = getAllLedgerEntries();
      const mergedEntryMap = new Map<string, LedgerEntry>();
      for (const e of localEntries) mergedEntryMap.set(e.id, e);
      for (const ce of cloudEntries) {
        const existing = mergedEntryMap.get(ce.id);
        if (!existing || new Date(ce.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
          mergedEntryMap.set(ce.id, ce);
        }
      }
      setJson(KHATA_STORAGE_KEYS.ENTRIES, Array.from(mergedEntryMap.values()));
    }

    // 2. Fetch Cashbook
    const cashColl = collection(db, 'users', user.uid, 'cashbookEntries');
    const cashSnap = await getDocs(cashColl);
    const cloudCash: CashEntry[] = [];
    for (const d of cashSnap.docs) {
      const cdata = d.data() as CashEntry;
      if (cdata && cdata.id) cloudCash.push(cdata);
    }
    if (cloudCash.length > 0) {
      const localCash = getAllCashEntries();
      const cashMap = new Map<string, CashEntry>();
      for (const c of localCash) cashMap.set(c.id, c);
      for (const cc of cloudCash) {
        const existing = cashMap.get(cc.id);
        if (!existing || new Date(cc.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
          cashMap.set(cc.id, cc);
        }
      }
      setJson(KHATA_STORAGE_KEYS.CASHBOOK, Array.from(cashMap.values()));
    }

    // 3. Fetch Settings
    const setSnap = await getDoc(doc(db, 'users', user.uid, 'khataSettings', 'config'));
    if (setSnap.exists()) {
      const sdata = setSnap.data() as KhataSettings;
      const localSettings = getKhataSettings();
      setJson(KHATA_STORAGE_KEYS.SETTINGS, { ...localSettings, ...sdata });
    }
  } catch (err) {
    console.warn('[KhataStorage] Cloud fetch notice:', err);
  }
}

// ----------------- CRUD FOR LEDGER ACCOUNTS -----------------

export function getLedgerAccounts(kind?: 'party' | 'broker'): LedgerAccount[] {
  const accounts = getParsed<LedgerAccount[]>(KHATA_STORAGE_KEYS.ACCOUNTS, []);
  if (!kind) return accounts;
  return accounts.filter(a => a.kind === kind);
}

export function getLedgerAccountById(id: string): LedgerAccount | null {
  const accounts = getLedgerAccounts();
  return accounts.find(a => a.id === id) || null;
}

export function saveOrUpdateLedgerAccount(
  data: Partial<LedgerAccount> & { kind: 'party' | 'broker'; name: string }
): LedgerAccount {
  const accounts = getLedgerAccounts();
  const now = new Date().toISOString();
  const phoneNormalized = normalizePakistaniPhone(data.phone) || data.phone || '';

  let target: LedgerAccount;
  const existingIdx = data.id ? accounts.findIndex(a => a.id === data.id) : -1;

  if (existingIdx >= 0) {
    target = {
      ...accounts[existingIdx],
      ...data,
      name: data.name.trim(),
      phone: phoneNormalized,
      updatedAt: now
    };
    accounts[existingIdx] = target;
  } else {
    target = {
      id: data.id || `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      kind: data.kind,
      name: data.name.trim(),
      phone: phoneNormalized,
      note: data.note || '',
      openingAmount: Number(data.openingAmount) || 0,
      openingDirection: data.openingDirection || 'get',
      dueDate: data.dueDate,
      source: data.source || 'manual',
      createdAt: now,
      updatedAt: now
    };
    accounts.unshift(target);
  }

  setJson(KHATA_STORAGE_KEYS.ACCOUNTS, accounts);
  mirrorAccountToFirestore(target, 'upsert');
  return target;
}

export function deleteLedgerAccount(id: string): boolean {
  const accounts = getLedgerAccounts();
  const target = accounts.find(a => a.id === id);
  if (!target) return false;

  const filtered = accounts.filter(a => a.id !== id);
  setJson(KHATA_STORAGE_KEYS.ACCOUNTS, filtered);

  // Also remove associated entries locally
  const allEntries = getAllLedgerEntries();
  const remainingEntries = allEntries.filter(e => e.accountId !== id);
  setJson(KHATA_STORAGE_KEYS.ENTRIES, remainingEntries);

  mirrorAccountToFirestore(target, 'delete');
  return true;
}

// ----------------- CRUD FOR LEDGER ENTRIES -----------------

export function getAllLedgerEntries(): LedgerEntry[] {
  return getParsed<LedgerEntry[]>(KHATA_STORAGE_KEYS.ENTRIES, []);
}

export function getLedgerEntries(accountId: string): LedgerEntry[] {
  const all = getAllLedgerEntries();
  return all
    .filter(e => e.accountId === accountId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveOrUpdateLedgerEntry(
  data: Partial<LedgerEntry> & { accountId: string; type: 'gave' | 'got'; amount: number; date: string }
): LedgerEntry {
  const entries = getAllLedgerEntries();
  const now = new Date().toISOString();

  let target: LedgerEntry;
  const existingIdx = data.id ? entries.findIndex(e => e.id === data.id) : -1;

  if (existingIdx >= 0) {
    target = {
      ...entries[existingIdx],
      ...data,
      amount: Math.abs(Number(data.amount)),
      updatedAt: now
    };
    entries[existingIdx] = target;
  } else {
    target = {
      id: data.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      accountId: data.accountId,
      type: data.type,
      amount: Math.abs(Number(data.amount)),
      date: data.date,
      note: data.note || '',
      source: data.source || 'manual',
      sourceRef: data.sourceRef,
      createdAt: now,
      updatedAt: now
    };
    entries.unshift(target);
  }

  setJson(KHATA_STORAGE_KEYS.ENTRIES, entries);

  // Update account's updatedAt timestamp
  const accounts = getLedgerAccounts();
  const accIdx = accounts.findIndex(a => a.id === data.accountId);
  if (accIdx >= 0) {
    accounts[accIdx].updatedAt = now;
    setJson(KHATA_STORAGE_KEYS.ACCOUNTS, accounts);
  }

  mirrorEntryToFirestore(target, 'upsert');
  return target;
}

export function deleteLedgerEntry(id: string): LedgerEntry | null {
  const entries = getAllLedgerEntries();
  const target = entries.find(e => e.id === id);
  if (!target) return null;

  const filtered = entries.filter(e => e.id !== id);
  setJson(KHATA_STORAGE_KEYS.ENTRIES, filtered);

  mirrorEntryToFirestore(target, 'delete');
  return target;
}

export function restoreLedgerEntry(entry: LedgerEntry): void {
  const entries = getAllLedgerEntries();
  if (!entries.some(e => e.id === entry.id)) {
    entries.unshift(entry);
    setJson(KHATA_STORAGE_KEYS.ENTRIES, entries);
    mirrorEntryToFirestore(entry, 'upsert');
  }
}

// ----------------- CRUD FOR CASHBOOK ENTRIES -----------------

export function getAllCashEntries(): CashEntry[] {
  return getParsed<CashEntry[]>(KHATA_STORAGE_KEYS.CASHBOOK, []);
}

export function getCashEntries(date?: string): CashEntry[] {
  const all = getAllCashEntries();
  const filtered = date ? all.filter(c => c.date === date) : all;
  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveOrUpdateCashEntry(
  data: Partial<CashEntry> & { type: 'in' | 'out'; amount: number; date: string }
): CashEntry {
  const cashList = getAllCashEntries();
  const now = new Date().toISOString();

  let target: CashEntry;
  const existingIdx = data.id ? cashList.findIndex(c => c.id === data.id) : -1;

  if (existingIdx >= 0) {
    target = {
      ...cashList[existingIdx],
      ...data,
      amount: Math.abs(Number(data.amount)),
      updatedAt: now
    };
    cashList[existingIdx] = target;
  } else {
    target = {
      id: data.id || `cash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type: data.type,
      amount: Math.abs(Number(data.amount)),
      date: data.date,
      note: data.note || '',
      category: data.category || 'other',
      createdAt: now,
      updatedAt: now
    };
    cashList.unshift(target);
  }

  setJson(KHATA_STORAGE_KEYS.CASHBOOK, cashList);
  mirrorCashEntryToFirestore(target, 'upsert');
  return target;
}

export function deleteCashEntry(id: string): CashEntry | null {
  const cashList = getAllCashEntries();
  const target = cashList.find(c => c.id === id);
  if (!target) return null;

  const filtered = cashList.filter(c => c.id !== id);
  setJson(KHATA_STORAGE_KEYS.CASHBOOK, filtered);

  mirrorCashEntryToFirestore(target, 'delete');
  return target;
}

export function restoreCashEntry(entry: CashEntry): void {
  const cashList = getAllCashEntries();
  if (!cashList.some(c => c.id === entry.id)) {
    cashList.unshift(entry);
    setJson(KHATA_STORAGE_KEYS.CASHBOOK, cashList);
    mirrorCashEntryToFirestore(entry, 'upsert');
  }
}

/**
 * Calculates day cash summary
 */
export function calculateDayCashSummary(targetDate: string, allCash: CashEntry[] = []): {
  openingBalance: number;
  totalIn: number;
  totalOut: number;
  closingBalance: number;
} {
  let openingBalance = 0;
  let totalIn = 0;
  let totalOut = 0;

  for (const entry of allCash) {
    const amt = Number(entry.amount) || 0;
    if (entry.date < targetDate) {
      if (entry.type === 'in') openingBalance += amt;
      else openingBalance -= amt;
    } else if (entry.date === targetDate) {
      if (entry.type === 'in') totalIn += amt;
      else totalOut += amt;
    }
  }

  const closingBalance = openingBalance + totalIn - totalOut;

  return {
    openingBalance: Math.round(openingBalance),
    totalIn: Math.round(totalIn),
    totalOut: Math.round(totalOut),
    closingBalance: Math.round(closingBalance)
  };
}

// ----------------- KHATA SETTINGS & PIN -----------------

export function getKhataSettings(): KhataSettings {
  return getParsed<KhataSettings>(KHATA_STORAGE_KEYS.SETTINGS, {
    businessName: '',
    pinHash: '',
    pinSalt: '',
    pinFailedAttempts: 0
  });
}

export function saveKhataSettings(settings: Partial<KhataSettings>): KhataSettings {
  const current = getKhataSettings();
  const updated: KhataSettings = { ...current, ...settings };
  setJson(KHATA_STORAGE_KEYS.SETTINGS, updated);
  mirrorSettingsToFirestore(updated);
  return updated;
}

// ----------------- BACKUP & RESTORE -----------------

export interface KhataBackupData {
  app: 'Driver Dost';
  module: 'khata';
  version: '2.0';
  exportedAt: string;
  businessName: string;
  accounts: LedgerAccount[];
  entries: LedgerEntry[];
  cashEntries: CashEntry[];
  checksum: number;
}

function calculateChecksum(obj: any): number {
  const str = JSON.stringify(obj);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function exportKhataBackup(): string {
  const accounts = getLedgerAccounts();
  const entries = getAllLedgerEntries();
  const cashEntries = getAllCashEntries();
  const settings = getKhataSettings();

  const payload: Omit<KhataBackupData, 'checksum'> = {
    app: 'Driver Dost',
    module: 'khata',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    businessName: settings.businessName || '',
    accounts,
    entries,
    cashEntries
  };

  const backup: KhataBackupData = {
    ...payload,
    checksum: calculateChecksum(payload)
  };

  return JSON.stringify(backup, null, 2);
}

export function importKhataBackup(
  jsonStr: string,
  mode: 'merge' | 'replace' = 'merge'
): { success: boolean; accountsCount: number; entriesCount: number; cashCount: number; error?: string } {
  try {
    const data = JSON.parse(jsonStr) as KhataBackupData;
    if (!data || data.app !== 'Driver Dost' || data.module !== 'khata') {
      return { success: false, accountsCount: 0, entriesCount: 0, cashCount: 0, error: 'Invalid backup file format' };
    }

    if (!Array.isArray(data.accounts) || !Array.isArray(data.entries) || !Array.isArray(data.cashEntries)) {
      return { success: false, accountsCount: 0, entriesCount: 0, cashCount: 0, error: 'Malformed Khata backup contents' };
    }

    if (mode === 'replace') {
      setJson(KHATA_STORAGE_KEYS.ACCOUNTS, data.accounts);
      setJson(KHATA_STORAGE_KEYS.ENTRIES, data.entries);
      setJson(KHATA_STORAGE_KEYS.CASHBOOK, data.cashEntries);
      if (data.businessName) {
        saveKhataSettings({ businessName: data.businessName });
      }
      // Trigger cloud mirrors
      data.accounts.forEach(a => mirrorAccountToFirestore(a, 'upsert'));
      data.entries.forEach(e => mirrorEntryToFirestore(e, 'upsert'));
      data.cashEntries.forEach(c => mirrorCashEntryToFirestore(c, 'upsert'));

      return {
        success: true,
        accountsCount: data.accounts.length,
        entriesCount: data.entries.length,
        cashCount: data.cashEntries.length
      };
    } else {
      // Merge mode
      const currentAccounts = getLedgerAccounts();
      const currentEntries = getAllLedgerEntries();
      const currentCash = getAllCashEntries();

      const accMap = new Map<string, LedgerAccount>();
      currentAccounts.forEach(a => accMap.set(a.id, a));
      data.accounts.forEach(a => {
        if (!accMap.has(a.id)) accMap.set(a.id, a);
      });

      const entryMap = new Map<string, LedgerEntry>();
      currentEntries.forEach(e => entryMap.set(e.id, e));
      data.entries.forEach(e => {
        if (!entryMap.has(e.id)) entryMap.set(e.id, e);
      });

      const cashMap = new Map<string, CashEntry>();
      currentCash.forEach(c => cashMap.set(c.id, c));
      data.cashEntries.forEach(c => {
        if (!cashMap.has(c.id)) cashMap.set(c.id, c);
      });

      const finalAccounts = Array.from(accMap.values());
      const finalEntries = Array.from(entryMap.values());
      const finalCash = Array.from(cashMap.values());

      setJson(KHATA_STORAGE_KEYS.ACCOUNTS, finalAccounts);
      setJson(KHATA_STORAGE_KEYS.ENTRIES, finalEntries);
      setJson(KHATA_STORAGE_KEYS.CASHBOOK, finalCash);

      finalAccounts.forEach(a => mirrorAccountToFirestore(a, 'upsert'));
      finalEntries.forEach(e => mirrorEntryToFirestore(e, 'upsert'));
      finalCash.forEach(c => mirrorCashEntryToFirestore(c, 'upsert'));

      return {
        success: true,
        accountsCount: finalAccounts.length,
        entriesCount: finalEntries.length,
        cashCount: finalCash.length
      };
    }
  } catch (err: any) {
    return { success: false, accountsCount: 0, entriesCount: 0, cashCount: 0, error: err?.message || 'Parse error' };
  }
}

// ----------------- REMINDER MESSAGE GENERATOR -----------------

export function formatKhataReminderMessage(
  account: LedgerAccount,
  balance: number,
  customBusinessName?: string,
  lang: Language = 'ur'
): string {
  const isUrdu = lang === 'ur';
  const business = (customBusinessName && customBusinessName.trim()) ? customBusinessName.trim() : 'Driver Dost';
  const absAmt = Math.abs(balance).toLocaleString('en-US');
  const dueStr = account.dueDate ? account.dueDate : '';

  if (isUrdu) {
    return (
      `السلام علیکم ${account.name} صاحب،\n\n` +
      `آپ کے ذمہ ${business} کی واجب الادا رقم: PKR ${absAmt} ہے۔` +
      (dueStr ? `\nادائیگی کی آخری تاریخ: ${dueStr}` : '') +
      `\nبرائے مہربانی جلد از جلد بقایا جات صاف فرمائیں۔ شکریہ!` +
      `\n— ${business}`
    );
  } else {
    return (
      `Assalam-o-Alaikum ${account.name},\n\n` +
      `Your outstanding balance with ${business} is PKR ${absAmt}.` +
      (dueStr ? `\nDue date: ${dueStr}` : '') +
      `\nPlease clear at your earliest convenience. Thank you!` +
      `\n— ${business}`
    );
  }
}

// ----------------- DOCUMENT AUTO-LINK HELPERS (AUTHORISED ACCOUNTS) -----------------

export interface PendingDocBalance {
  id: string; // bilty id or ref
  docNumber: string;
  kind: 'party' | 'broker';
  name: string;
  phone?: string;
  amount: number;
  date: string;
  route?: string;
}

/**
 * Checks for documents with pending receivable balances for authorised accounts
 */
export function getPendingDocumentBalances(isAuthorized: boolean): PendingDocBalance[] {
  if (!isAuthorized) return [];
  try {
    const rawDocs = getStoredBilties();
    if (!Array.isArray(rawDocs) || rawDocs.length === 0) return [];

    const existingEntries = getAllLedgerEntries();
    const importedRefs = new Set(existingEntries.map(e => e.sourceRef).filter(Boolean));

    const pending: PendingDocBalance[] = [];

    for (const b of rawDocs) {
      const docNo = String(b.biltyNo || b.id || '').trim();
      const payable = Number(b.payable) || 0;
      if (payable > 0) {
        // Party balance check
        const partyRef = `doc_party_${b.id || b.biltyNo}`;
        if (!importedRefs.has(partyRef) && b.receiverName) {
          pending.push({
            id: String(b.id || b.biltyNo),
            docNumber: docNo,
            kind: 'party',
            name: String(b.receiverName).trim(),
            phone: b.receiverMobile ? String(b.receiverMobile).trim() : undefined,
            amount: payable,
            date: b.date || new Date().toISOString().split('T')[0],
            route: `${b.sendingCity || ''} -> ${b.receivingCity || ''}`
          });
        }
      }
    }

    return pending;
  } catch (err) {
    console.warn('[KhataStorage] Pending doc balance notice:', err);
    return [];
  }
}

/**
 * Imports a pending document balance into Khata
 */
export function importPendingDocumentToKhata(docItem: PendingDocBalance): { account: LedgerAccount; entry: LedgerEntry } {
  // Find or create account
  const accounts = getLedgerAccounts(docItem.kind);
  let targetAccount = accounts.find(
    a => a.name.trim().toLowerCase() === docItem.name.trim().toLowerCase()
  );

  if (!targetAccount) {
    targetAccount = saveOrUpdateLedgerAccount({
      kind: docItem.kind,
      name: docItem.name,
      phone: docItem.phone,
      openingAmount: 0,
      openingDirection: 'get',
      source: 'auto'
    });
  }

  // Create entry: 'gave' = freight charged / receivable
  const entry = saveOrUpdateLedgerEntry({
    accountId: targetAccount.id,
    type: 'gave',
    amount: docItem.amount,
    date: docItem.date,
    note: `Doc #${docItem.docNumber} (${docItem.route || 'Freight'})`,
    source: 'auto',
    sourceRef: `doc_${docItem.kind}_${docItem.id}`
  });

  return { account: targetAccount, entry };
}

// ----------------- BACKWARD COMPATIBILITY EXPORTS -----------------

export function getCleanPhoneForWhatsApp(phone: string): string {
  const norm = normalizePakistaniPhone(phone);
  return norm || phone.replace(/\D/g, '');
}

export function formatPartyWhatsAppReminder(party: LedgerParty, lang: Language): string {
  const isUrdu = lang === 'ur';
  const balanceFmt = `PKR ${Math.abs(party.runningBalance).toLocaleString('en-US')}`;
  if (isUrdu) {
    return (
      `محترم *${party.name}* صاحب،\n` +
      `السلام علیکم!\n\n` +
      `ڈرائیور دوست کھاتہ کے مطابق آپ کا حساب:\n` +
      `💵 *بقایا رقم:* ${balanceFmt}\n\n` +
      `برائے مہربانی حساب چیک کر کے جلد از جلد ادائیگی فرمائیں۔ شکریہ!`
    );
  } else {
    return (
      `Dear *${party.name}*,\n` +
      `Assalam-o-Alaikum!\n\n` +
      `Driver Dost Ledger Statement:\n` +
      `💵 *Outstanding Balance:* ${balanceFmt}\n\n` +
      `Kindly review and arrange payment at your earliest convenience. Thank you!`
    );
  }
}

export function formatBrokerWhatsAppReminder(broker: LedgerBroker, tx?: BrokerTransaction, lang: Language = 'ur'): string {
  const isUrdu = lang === 'ur';
  const commission = tx ? tx.commission : broker.unpaidCommission;
  const commFmt = `PKR ${Math.abs(commission).toLocaleString('en-US')}`;

  if (isUrdu) {
    return (
      `محترم بھائی *${broker.name}* (بروکر / ایجنٹ)،\n` +
      `السلام علیکم!\n\n` +
      `کمیشن کا حساب:\n` +
      (tx ? `📦 *لوڈ:* ${tx.loadDescription}\n` : '') +
      (tx?.vehicleNo ? `🚛 *گاڑی نمبر:* ${tx.vehicleNo}\n` : '') +
      `💵 *کمیشن رقم:* ${commFmt}\n` +
      `📌 *اسٹیٹس:* ${tx ? (tx.status === 'paid' ? 'ادا شدہ' : 'غیر ادا شدہ') : 'کل بقایا کمیشن'}\n\n` +
      `شکریہ!`
    );
  } else {
    return (
      `Dear *${broker.name}* (Broker/Agent),\n\n` +
      `Commission statement:\n` +
      (tx ? `📦 *Load:* ${tx.loadDescription}\n` : '') +
      (tx?.vehicleNo ? `🚛 *Vehicle:* ${tx.vehicleNo}\n` : '') +
      `💵 *Commission Amount:* ${commFmt}\n` +
      `📌 *Status:* ${tx ? (tx.status === 'paid' ? 'Paid' : 'Unpaid') : 'Total Pending'}\n\n` +
      `Thank you!`
    );
  }
}

export function getTopPartiesRanking(parties: LedgerParty[], limit = 5) {
  return [...parties]
    .filter(p => p.totalCharged > 0)
    .sort((a, b) => b.totalCharged - a.totalCharged)
    .slice(0, limit)
    .map((p, idx) => ({ ...p, rank: idx + 1 }));
}

export function calculateVehicleProfitLoss(
  vehicleFilter: string,
  monthFilter: string,
  _expenses: any,
  _incomes: any,
  trips: Trip[]
) {
  const filteredTrips = trips.filter(t => {
    const matchVehicle = vehicleFilter === 'all' || !t.fuelTypeRaw || t.fuelTypeRaw === vehicleFilter;
    const matchMonth = monthFilter === 'all' || !t.month || t.month === monthFilter;
    return matchVehicle && matchMonth;
  });

  const totalIncome = filteredTrips.reduce((sum, t) => sum + (t.totalIncome || t.expectedIncome || 0), 0);
  const totalExpenses = filteredTrips.reduce((sum, t) => sum + (t.total || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const totalDistanceKm = filteredTrips.reduce((sum, t) => sum + (Number(t.dist) || 0), 0);

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    isProfit: netProfit >= 0,
    totalDistanceKm,
    profitPerKm: totalDistanceKm > 0 ? Math.round(netProfit / totalDistanceKm) : 'N/A'
  };
}

export function syncFreightRecordsToLedger(isAuthorized: boolean): void {
  if (!isAuthorized) return;
  // Legacy freight sync
  const bilties = getStoredBilties();
  if (!bilties || bilties.length === 0) return;

  const currentParties = getStoredParties();
  const currentTxs = getStoredPartyTransactions();
  const currentIncomes = getStoredVehicleIncomes();

  let partiesModified = false;
  let txsModified = false;
  let incomesModified = false;

  bilties.forEach(b => {
    if (!b || !b.id) return;
    const senderName = b.senderName ? String(b.senderName).trim() : '';
    const receiverName = b.receiverName ? String(b.receiverName).trim() : '';
    const totalFreight = Number(b.total) || 0;
    const advancePaid = Number(b.advance) || 0;
    const balancePayable = Number(b.payable) || 0;

    if (senderName) {
      let party = currentParties.find(p => p.name.toLowerCase() === senderName.toLowerCase());
      if (!party) {
        party = {
          id: `party_sender_${b.id}`,
          name: senderName,
          phone: b.senderMobile || '',
          city: b.sendingCity || '',
          runningBalance: 0,
          totalCharged: 0,
          totalReceived: 0,
          updatedAt: Date.now()
        };
        currentParties.push(party);
        partiesModified = true;
      }

      const txDebitId = `bilty_debit_${b.id}_sender`;
      if (!currentTxs.some(t => t.id === txDebitId)) {
        currentTxs.push({
          id: txDebitId,
          partyId: party.id,
          date: b.date || new Date().toISOString().split('T')[0],
          type: 'debit',
          amount: totalFreight,
          description: `Freight: ${b.sendingCity || ''} to ${b.receivingCity || ''}`,
          referenceNo: String(b.biltyNo || b.id),
          vehicleNo: b.vehicleNo || '',
          source: 'freight',
          createdAt: Date.now()
        });
        party.totalCharged += totalFreight;
        party.runningBalance += totalFreight;
        txsModified = true;
        partiesModified = true;
      }

      if (advancePaid > 0) {
        const txCreditId = `bilty_credit_${b.id}_sender`;
        if (!currentTxs.some(t => t.id === txCreditId)) {
          currentTxs.push({
            id: txCreditId,
            partyId: party.id,
            date: b.date || new Date().toISOString().split('T')[0],
            type: 'credit',
            amount: advancePaid,
            description: `Advance received: ${b.biltyNo || b.id}`,
            referenceNo: String(b.biltyNo || b.id),
            vehicleNo: b.vehicleNo || '',
            source: 'freight',
            createdAt: Date.now()
          });
          party.totalReceived += advancePaid;
          party.runningBalance -= advancePaid;
          txsModified = true;
          partiesModified = true;
        }
      }
    }

    if (receiverName && balancePayable > 0) {
      let party = currentParties.find(p => p.name.toLowerCase() === receiverName.toLowerCase());
      if (!party) {
        party = {
          id: `party_receiver_${b.id}`,
          name: receiverName,
          phone: b.receiverMobile || '',
          city: b.receivingCity || '',
          runningBalance: 0,
          totalCharged: 0,
          totalReceived: 0,
          updatedAt: Date.now()
        };
        currentParties.push(party);
        partiesModified = true;
      }
    }

    if (b.vehicleNo && totalFreight > 0) {
      const vincId = `vinc_bilty_${b.id}`;
      if (!currentIncomes.some(i => i.id === vincId)) {
        currentIncomes.push({
          id: vincId,
          vehicleNo: b.vehicleNo,
          date: b.date || new Date().toISOString().split('T')[0],
          amount: totalFreight,
          partyName: senderName || receiverName,
          description: `Freight: ${b.biltyNo || b.id}`,
          source: 'freight',
          createdAt: Date.now()
        });
        incomesModified = true;
      }
    }
  });

  if (partiesModified) saveStoredParties(currentParties);
  if (txsModified) saveStoredPartyTransactions(currentTxs);
  if (incomesModified) saveStoredVehicleIncomes(currentIncomes);
}

export function getStoredParties(): LedgerParty[] {
  return getParsed<LedgerParty[]>(KHATA_STORAGE_KEYS.LEGACY_PARTIES, []);
}

export function saveStoredParties(parties: LedgerParty[]): void {
  setJson(KHATA_STORAGE_KEYS.LEGACY_PARTIES, parties);
}

export function getStoredPartyTransactions(): PartyTransaction[] {
  return getParsed<PartyTransaction[]>(KHATA_STORAGE_KEYS.LEGACY_PARTY_TXS, []);
}

export function saveStoredPartyTransactions(txs: PartyTransaction[]): void {
  setJson(KHATA_STORAGE_KEYS.LEGACY_PARTY_TXS, txs);
}

export function saveOrUpdateParty(party: Partial<LedgerParty> & { name: string }): LedgerParty {
  const parties = getStoredParties();
  const existingIdx = parties.findIndex(p => p.id === party.id || p.name.trim().toLowerCase() === party.name.trim().toLowerCase());
  let targetParty: LedgerParty;
  if (existingIdx >= 0) {
    targetParty = { ...parties[existingIdx], ...party, updatedAt: Date.now() };
    parties[existingIdx] = targetParty;
  } else {
    targetParty = {
      id: party.id || `party_${Date.now()}`,
      name: party.name.trim(),
      phone: party.phone || '',
      city: party.city || '',
      address: party.address || '',
      notes: party.notes || '',
      runningBalance: party.runningBalance || 0,
      totalCharged: party.totalCharged || 0,
      totalReceived: party.totalReceived || 0,
      updatedAt: Date.now()
    };
    parties.push(targetParty);
  }
  saveStoredParties(parties);
  return targetParty;
}

export function deleteParty(id: string): void {
  const parties = getStoredParties().filter(p => p.id !== id);
  saveStoredParties(parties);
}

export function addPartyTransaction(tx: Omit<PartyTransaction, 'id' | 'createdAt'>): PartyTransaction {
  const txs = getStoredPartyTransactions();
  const newTx: PartyTransaction = {
    ...tx,
    id: `ptx_${Date.now()}`,
    createdAt: Date.now()
  };
  txs.unshift(newTx);
  saveStoredPartyTransactions(txs);
  return newTx;
}

export function getStoredBrokers(): LedgerBroker[] {
  return getParsed<LedgerBroker[]>(KHATA_STORAGE_KEYS.LEGACY_BROKERS, []);
}

export function saveStoredBrokers(brokers: LedgerBroker[]): void {
  setJson(KHATA_STORAGE_KEYS.LEGACY_BROKERS, brokers);
}

export function getStoredBrokerTransactions(): BrokerTransaction[] {
  return getParsed<BrokerTransaction[]>(KHATA_STORAGE_KEYS.LEGACY_BROKER_TXS, []);
}

export function saveStoredBrokerTransactions(txs: BrokerTransaction[]): void {
  setJson(KHATA_STORAGE_KEYS.LEGACY_BROKER_TXS, txs);
}

export function saveOrUpdateBroker(broker: Partial<LedgerBroker> & { name: string }): LedgerBroker {
  const brokers = getStoredBrokers();
  const existingIdx = brokers.findIndex(b => b.id === broker.id || b.name.trim().toLowerCase() === broker.name.trim().toLowerCase());
  let targetBroker: LedgerBroker;
  if (existingIdx >= 0) {
    targetBroker = { ...brokers[existingIdx], ...broker, updatedAt: Date.now() };
    brokers[existingIdx] = targetBroker;
  } else {
    targetBroker = {
      id: broker.id || `broker_${Date.now()}`,
      name: broker.name.trim(),
      phone: broker.phone || '',
      city: broker.city || '',
      totalCommission: broker.totalCommission || 0,
      unpaidCommission: broker.unpaidCommission || 0,
      notes: broker.notes || '',
      updatedAt: Date.now()
    };
    brokers.push(targetBroker);
  }
  saveStoredBrokers(brokers);
  return targetBroker;
}

export function deleteBroker(id: string): void {
  const brokers = getStoredBrokers().filter(b => b.id !== id);
  saveStoredBrokers(brokers);
}

export function addBrokerTransaction(tx: Omit<BrokerTransaction, 'id' | 'createdAt'>): BrokerTransaction {
  const txs = getStoredBrokerTransactions();
  const newTx: BrokerTransaction = {
    ...tx,
    id: `btx_${Date.now()}`,
    createdAt: Date.now()
  };
  txs.unshift(newTx);
  saveStoredBrokerTransactions(txs);
  return newTx;
}

export function toggleBrokerTransactionStatus(txId: string): void {
  const txs = getStoredBrokerTransactions();
  const target = txs.find(t => t.id === txId);
  if (target) {
    target.status = target.status === 'paid' ? 'unpaid' : 'paid';
    saveStoredBrokerTransactions(txs);
  }
}

export function getStoredVehicleExpenses(): VehicleExpenseEntry[] {
  return getParsed<VehicleExpenseEntry[]>(KHATA_STORAGE_KEYS.LEGACY_VEHICLE_EXPENSES, []);
}

export function saveStoredVehicleExpenses(expenses: VehicleExpenseEntry[]): void {
  setJson(KHATA_STORAGE_KEYS.LEGACY_VEHICLE_EXPENSES, expenses);
}

export function addVehicleExpense(exp: Omit<VehicleExpenseEntry, 'id' | 'createdAt'>): VehicleExpenseEntry {
  const expenses = getStoredVehicleExpenses();
  const newExp: VehicleExpenseEntry = { ...exp, id: `vexp_${Date.now()}`, createdAt: Date.now() };
  expenses.unshift(newExp);
  saveStoredVehicleExpenses(expenses);
  return newExp;
}

export function deleteVehicleExpense(id: string): void {
  const expenses = getStoredVehicleExpenses().filter(e => e.id !== id);
  saveStoredVehicleExpenses(expenses);
}

export function getStoredVehicleIncomes(): VehicleIncomeEntry[] {
  return getParsed<VehicleIncomeEntry[]>(KHATA_STORAGE_KEYS.LEGACY_VEHICLE_INCOME, []);
}

export function saveStoredVehicleIncomes(incomes: VehicleIncomeEntry[]): void {
  setJson(KHATA_STORAGE_KEYS.LEGACY_VEHICLE_INCOME, incomes);
}

export function addVehicleIncome(inc: Omit<VehicleIncomeEntry, 'id' | 'createdAt'>): VehicleIncomeEntry {
  const incomes = getStoredVehicleIncomes();
  const newInc: VehicleIncomeEntry = { ...inc, id: `vinc_${Date.now()}`, createdAt: Date.now() };
  incomes.unshift(newInc);
  saveStoredVehicleIncomes(incomes);
  return newInc;
}

export function deleteVehicleIncome(id: string): void {
  const incomes = getStoredVehicleIncomes().filter(i => i.id !== id);
  saveStoredVehicleIncomes(incomes);
}

export async function fetchLedgerDataFromFirestore(): Promise<void> {
  await fetchKhataFromFirestore();
}
