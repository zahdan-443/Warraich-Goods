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
import {
  getScopedItem,
  getStoredBilties,
  setScopedItem
} from './storage';
import { getActiveKhataScope, removeScopedItem, safeStorage } from './storageCore';
import { savePreRestoreSnapshotIdbOnly } from './persistentStorage';
import {
  getTombstones,
  mergeTombstoneMaps,
  notifySyncListeners,
  saveTombstones,
  TombstoneMap
} from './storageSync';
import { fromPaisa, toPaisa } from './calculator';
import { getPakistanDateKey } from './dateUtils';
import { auth, db } from './firebase';
import * as firestoreModule from 'firebase/firestore';
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
  // v1.3.0 Khata Expansion Keys
  BILLS: 'dd_khata_bills_v2',
  EMPLOYEES: 'dd_khata_employees_v2',
  EMPLOYEE_ENTRIES: 'dd_khata_employee_entries_v2',
  RECEIVING_POINTS: 'dd_khata_receiving_points_v2',
  RECEIVING_ENTRIES: 'dd_khata_receiving_entries_v2',
  DAILY_EXPENSES: 'dd_khata_daily_expenses_v2',
  // Legacy keys for backward compatibility
  LEGACY_PARTIES: 'dd_ledger_parties',
  LEGACY_PARTY_TXS: 'dd_ledger_party_transactions',
  LEGACY_BROKERS: 'dd_ledger_brokers',
  LEGACY_BROKER_TXS: 'dd_ledger_broker_transactions',
  LEGACY_VEHICLE_EXPENSES: 'dd_ledger_vehicle_expenses',
  LEGACY_VEHICLE_INCOME: 'dd_ledger_vehicle_income'
};

// ----------------- PARSING & HELPER UTILITIES -----------------

/**
 * Strict scoped reader (#4): v2->v3 migration in storageCore runs once on scope switch;
 * never falls back to unscoped keys afterward so deleted/emptied stores cannot refill.
 */
function getParsed<T>(key: string, fallback: T): T {
  try {
    const raw = getScopedItem(key);
    if (raw === null || raw === '') {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setJson(key: string, value: unknown): void {
  try {
    setScopedItem(key, JSON.stringify(value));
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
 * Balance rule (integer paisa precision #22):
 * balance = opening (+ if 'get', - if 'give') + sum(gave) - sum(got)
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
  const openingPaisa =
    (account.openingDirection === 'get' ? 1 : -1) * toPaisa(Number(account.openingAmount) || 0);

  let totalGavePaisa = 0;
  let totalGotPaisa = 0;

  for (const entry of entries) {
    const amtPaisa = toPaisa(Number(entry.amount) || 0);
    if (entry.type === 'gave') {
      totalGavePaisa += amtPaisa;
    } else if (entry.type === 'got') {
      totalGotPaisa += amtPaisa;
    }
  }

  const balance = fromPaisa(openingPaisa + totalGavePaisa - totalGotPaisa);

  return {
    balance,
    totalGave: fromPaisa(totalGavePaisa),
    totalGot: fromPaisa(totalGotPaisa),
    status: balance > 0 ? 'get' : balance < 0 ? 'give' : 'settled'
  };
}

/**
 * Calculates totals for a list of accounts using integer paisa & PKT dates (#15, #22)
 */
export function calculateAccountsSummary(accounts: LedgerAccount[], allEntries: LedgerEntry[] = []): {
  totalWillGet: number;
  totalWillGive: number;
  netBalance: number;
  accountsCount: number;
  overdueCount: number;
} {
  let totalWillGetPaisa = 0;
  let totalWillGivePaisa = 0;
  let overdueCount = 0;
  const today = getPakistanDateKey();

  const entriesByAccount = new Map<string, LedgerEntry[]>();
  for (const entry of allEntries) {
    const existing = entriesByAccount.get(entry.accountId) || [];
    existing.push(entry);
    entriesByAccount.set(entry.accountId, existing);
  }

  for (const acc of accounts) {
    const entries = entriesByAccount.get(acc.id) || [];
    const { balance } = calculateAccountBalance(acc, entries);
    const balPaisa = toPaisa(balance);

    if (balPaisa > 0) {
      totalWillGetPaisa += balPaisa;
    } else if (balPaisa < 0) {
      totalWillGivePaisa += Math.abs(balPaisa);
    }

    if (acc.dueDate && acc.dueDate < today && balPaisa > 0) {
      overdueCount++;
    }
  }

  const totalWillGet = fromPaisa(totalWillGetPaisa);
  const totalWillGive = fromPaisa(totalWillGivePaisa);
  const netBalance = fromPaisa(totalWillGetPaisa - totalWillGivePaisa);

  return {
    totalWillGet,
    totalWillGive,
    netBalance,
    accountsCount: accounts.length,
    overdueCount
  };
}

// ----------------- PIN LOCK & SECURITY UTILITIES (#27 PBKDF2-HMAC-SHA256) -----------------

export const PIN_PBKDF2_PREFIX = 'v2_pbkdf2:';
const PIN_PBKDF2_ITERATIONS = 100_000;

export function generatePinSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now()}_${Math.random().toString(36).substring(2)}`;
}

// Pure-JS SHA-256 + HMAC-SHA-256 + PBKDF2 fallback producing identical output to Web Crypto
const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

function sha256BytesPure(msg: Uint8Array): Uint8Array {
  const bitLen = msg.length * 8;
  const paddedLen = Math.ceil((msg.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(msg);
  padded[msg.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

function hmacSha256Pure(key: Uint8Array, data: Uint8Array): Uint8Array {
  const blockSize = 64;
  const normKey = key.length > blockSize ? sha256BytesPure(key) : key;
  const ipad = new Uint8Array(blockSize + data.length);
  const opad = new Uint8Array(blockSize + 32);

  for (let i = 0; i < blockSize; i++) {
    const kb = i < normKey.length ? normKey[i] : 0;
    ipad[i] = kb ^ 0x36;
    opad[i] = kb ^ 0x5c;
  }
  ipad.set(data, blockSize);
  const inner = sha256BytesPure(ipad);
  opad.set(inner, blockSize);
  return sha256BytesPure(opad);
}

function pbkdf2Sha256HexPure(password: string, saltStr: string, iterations: number): string {
  const enc = new TextEncoder();
  const pwd = enc.encode(password);
  const saltBytes = enc.encode(saltStr);
  const block1Input = new Uint8Array(saltBytes.length + 4);
  block1Input.set(saltBytes);
  block1Input[saltBytes.length] = 0;
  block1Input[saltBytes.length + 1] = 0;
  block1Input[saltBytes.length + 2] = 0;
  block1Input[saltBytes.length + 3] = 1;

  let u = hmacSha256Pure(pwd, block1Input);
  const dk = new Uint8Array(u);
  for (let i = 1; i < iterations; i++) {
    u = hmacSha256Pure(pwd, u);
    for (let j = 0; j < 32; j++) {
      dk[j] ^= u[j];
    }
  }
  return Array.from(dk, b => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeHexEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

async function computeLegacySha256Pin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}__dd_pin__${pin}`);
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, '0')).join('');
  }
  return Array.from(sha256BytesPure(data), b => b.toString(16).padStart(2, '0')).join('');
}

function computeLegacyDJBHash(pin: string, salt: string): string {
  let hash = 0;
  const str = `${salt}:${pin}`;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

/**
 * PBKDF2-HMAC-SHA256 (100,000 iterations) PIN key derivation (#27).
 * Uses Web Crypto `deriveBits` when available, with an identical pure-JS HMAC-SHA-256 fallback.
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const pepperedSalt = `${salt}__dd_pin_v2__`;
  if (
    typeof crypto !== 'undefined' &&
    crypto.subtle &&
    typeof crypto.subtle.importKey === 'function' &&
    typeof crypto.subtle.deriveBits === 'function'
  ) {
    try {
      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(pin),
        'PBKDF2',
        false,
        ['deriveBits']
      );
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: enc.encode(pepperedSalt),
          iterations: PIN_PBKDF2_ITERATIONS,
          hash: 'SHA-256'
        },
        keyMaterial,
        256
      );
      const hex = Array.from(new Uint8Array(derivedBits), b => b.toString(16).padStart(2, '0')).join('');
      return `${PIN_PBKDF2_PREFIX}${hex}`;
    } catch {
      // Fall through to pure-JS PBKDF2 producing exact same format
    }
  }
  const pureHex = pbkdf2Sha256HexPure(pin, pepperedSalt, PIN_PBKDF2_ITERATIONS);
  return `${PIN_PBKDF2_PREFIX}${pureHex}`;
}

export function needsPinHashUpgrade(storedHash?: string | null): boolean {
  if (!storedHash) return false;
  return !storedHash.startsWith(PIN_PBKDF2_PREFIX);
}

/**
 * Verifies PIN against v2 PBKDF2 hashes AND legacy SHA-256 / DJB hashes transparently (#27).
 */
export async function verifyPin(pin: string, salt: string, expectedHash: string): Promise<boolean> {
  if (!expectedHash) return false;

  if (expectedHash.startsWith(PIN_PBKDF2_PREFIX)) {
    const computed = await hashPin(pin, salt);
    return constantTimeHexEqual(computed, expectedHash);
  }

  if (expectedHash.startsWith('hash_')) {
    return constantTimeHexEqual(computeLegacyDJBHash(pin, salt), expectedHash);
  }

  // Legacy SHA-256 64-char hex hash
  const legacySha = await computeLegacySha256Pin(pin, salt);
  return constantTimeHexEqual(legacySha, expectedHash);
}

/**
 * Exponential lockout calculation:
 * 0 to 4 attempts: 0s, 5: 30s, 6: 60s, 7: 120s, 8: 240s (capped at 3600s)
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

// ----------------- KHATA TOMBSTONES & OFFLINE PER-DOCUMENT SYNC QUEUE (#1, #9, #10) -----------------

export interface KhataDocQueueItem {
  id: string;
  action: 'upsert' | 'delete';
  collectionPath: string;
  docId: string;
  subPath?: string;
  data?: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
  status?: 'pending' | 'retrying' | 'blocked';
  lastError?: string;
  nextRetryAt?: number;
}

function isPermissionDeniedSyncError(err: unknown): boolean {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
  const msg = err instanceof Error ? err.message : String(err || '');
  return (
    code === 'permission-denied' ||
    msg.includes('Missing or insufficient permissions') ||
    msg.includes('permission-denied')
  );
}

function computeKhataBackoffMs(retryCount: number): number {
  const exp = Math.min(Math.max(retryCount, 1), 8);
  return Math.min(2000 * Math.pow(2, exp - 1), 5 * 60 * 1000);
}

function getKhataCloudRoot(uid: string): readonly ['users', string] {
  return ['users', uid] as const;
}

function getKhataDigestScope(uid: string): string {
  return uid;
}

export function recordKhataDeletionTombstone(
  collectionPath: string,
  docId: string,
  timestampIso: string = new Date().toISOString()
): void {
  const scope = getActiveKhataScope();
  const key = `khata_${collectionPath}`;
  const map = getTombstones(key, scope);
  map[docId] = timestampIso;
  saveTombstones(key, map, scope);
}

export function clearKhataDeletionTombstone(collectionPath: string, docId: string): void {
  const scope = getActiveKhataScope();
  const key = `khata_${collectionPath}`;
  const map = getTombstones(key, scope);
  if (map[docId]) {
    delete map[docId];
    saveTombstones(key, map, scope);
  }
}

export function isKhataDocTombstoned(
  collectionPath: string,
  docId: string,
  cloudUpdatedAt?: string
): boolean {
  const scope = getActiveKhataScope();
  const map: TombstoneMap = getTombstones(`khata_${collectionPath}`, scope);
  const deletedAt = map[docId];
  if (!deletedAt) return false;
  const delMs = new Date(deletedAt).getTime();
  if (Number.isNaN(delMs)) return false;
  const entityMs = cloudUpdatedAt ? new Date(cloudUpdatedAt).getTime() : 0;
  return delMs >= (Number.isNaN(entityMs) ? 0 : entityMs);
}

function getStoredKhataQueue(): KhataDocQueueItem[] {
  return getParsed<KhataDocQueueItem[]>(KHATA_STORAGE_KEYS.OFFLINE_QUEUE, []);
}

function saveStoredKhataQueue(queue: KhataDocQueueItem[]): void {
  if (queue.length === 0) {
    removeScopedItem(KHATA_STORAGE_KEYS.OFFLINE_QUEUE);
  } else {
    setJson(KHATA_STORAGE_KEYS.OFFLINE_QUEUE, queue);
  }
  notifySyncListeners();
}

export function getKhataQueueStats(): {
  pendingCount: number;
  blockedCount: number;
  items: KhataDocQueueItem[];
} {
  const items = getStoredKhataQueue();
  const blockedCount = items.filter(i => i.status === 'blocked').length;
  return {
    pendingCount: items.length - blockedCount,
    blockedCount,
    items
  };
}

export function enqueueKhataDocSync(
  item: Omit<KhataDocQueueItem, 'id' | 'timestamp' | 'retryCount'>
): void {
  try {
    const queue = getStoredKhataQueue();
    const newItem: KhataDocQueueItem = {
      ...item,
      id: `khata_doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending'
    };

    const filtered = queue.filter(
      q => !(q.collectionPath === item.collectionPath && q.docId === item.docId && q.subPath === item.subPath)
    );
    // Do NOT silently drop overflowed offline mutations (#9)
    saveStoredKhataQueue([newItem, ...filtered]);
  } catch (err) {
    console.warn('[KhataQueue] Failed to enqueue:', err);
  }
}

const KHATA_FLAT_COLLECTIONS = [
  'khataBills',
  'khataEmployees',
  'khataEmployeeEntries',
  'khataReceivingPoints',
  'khataReceivingEntries',
  'khataDailyExpenses'
] as const;

/**
 * Processes queued per-document sync actions when online (#9, #10):
 * - Preserves all failed items with exponential backoff (never drops after 5 retries).
 * - Separates permission-denied failures as `blocked` rather than counting them as processed.
 */
export async function processKhataDocQueue(): Promise<{
  processed: number;
  remaining: number;
  blocked: number;
}> {
  const queue = getStoredKhataQueue();
  if (queue.length === 0) return { processed: 0, remaining: 0, blocked: 0 };

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (!isOnline) {
    const blockedCount = queue.filter(i => i.status === 'blocked').length;
    return { processed: 0, remaining: queue.length, blocked: blockedCount };
  }

  const user = auth.currentUser;
  if (!user || !db) {
    const blockedCount = queue.filter(i => i.status === 'blocked').length;
    return { processed: 0, remaining: queue.length, blocked: blockedCount };
  }

  const remaining: KhataDocQueueItem[] = [];
  let processed = 0;
  let blocked = 0;
  const now = Date.now();

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    if (item.nextRetryAt && item.nextRetryAt > now && item.status !== 'blocked') {
      remaining.push(item);
      continue;
    }

    const root = getKhataCloudRoot(user.uid);
    try {
      if (item.collectionPath === 'ledgerAccounts') {
        const ref = doc(db, root[0], root[1], 'ledgerAccounts', item.docId);
        if (item.action === 'upsert') {
          await setDoc(ref, item.data || {}, { merge: true });
        } else {
          await deleteDoc(ref);
        }
      } else if (item.collectionPath === 'entries' && item.subPath) {
        const ref = doc(db, root[0], root[1], 'ledgerAccounts', item.subPath, 'entries', item.docId);
        if (item.action === 'upsert') {
          await setDoc(ref, { ...(item.data || {}), ownerUid: user.uid }, { merge: true });
        } else {
          await deleteDoc(ref);
        }
      } else if (item.collectionPath === 'cashbookEntries') {
        const ref = doc(db, root[0], root[1], 'cashbookEntries', item.docId);
        if (item.action === 'upsert') {
          await setDoc(ref, item.data || {}, { merge: true });
        } else {
          await deleteDoc(ref);
        }
      } else if ((KHATA_FLAT_COLLECTIONS as readonly string[]).includes(item.collectionPath)) {
        const ref = doc(db, root[0], root[1], item.collectionPath, item.docId);
        if (item.action === 'upsert') {
          await setDoc(ref, item.data || {}, { merge: true });
        } else {
          await deleteDoc(ref);
        }
      } else if (item.collectionPath === 'khataSettings') {
        const ref = doc(db, root[0], root[1], 'khataSettings', item.docId);
        await setDoc(ref, item.data || {}, { merge: true });
      }
      processed++;
      // Immediately delete this uploaded item from localStorage queue
      saveStoredKhataQueue([...remaining, ...queue.slice(i + 1)]);
    } catch (err: unknown) {
      const nextRetryCount = (item.retryCount || 0) + 1;
      const permDenied = isPermissionDeniedSyncError(err);
      if (permDenied) blocked++;
      remaining.push({
        ...item,
        retryCount: nextRetryCount,
        status: permDenied ? 'blocked' : 'retrying',
        lastError: err instanceof Error ? err.message : String(err || 'Sync failed'),
        nextRetryAt: permDenied ? undefined : now + computeKhataBackoffMs(nextRetryCount)
      });
    }
  }

  saveStoredKhataQueue(remaining);
  return { processed, remaining: remaining.length, blocked };
}

// ----------------- FIRESTORE PER-DOCUMENT MIRRORING -----------------

async function mirrorAccountToFirestore(account: LedgerAccount, action: 'upsert' | 'delete'): Promise<void> {
  const user = auth.currentUser;
  const payload = account as unknown as Record<string, unknown>;
  if (!user || !db) {
    if (user) enqueueKhataDocSync({ action, collectionPath: 'ledgerAccounts', docId: account.id, data: payload });
    return;
  }

  const root = getKhataCloudRoot(user.uid);
  try {
    const ref = doc(db, root[0], root[1], 'ledgerAccounts', account.id);
    if (action === 'upsert') {
      await setDoc(ref, payload, { merge: true });
    } else {
      await deleteDoc(ref);
    }
  } catch (err: unknown) {
    enqueueKhataDocSync({
      action,
      collectionPath: 'ledgerAccounts',
      docId: account.id,
      data: payload,
      status: isPermissionDeniedSyncError(err) ? 'blocked' : 'pending',
      lastError: err instanceof Error ? err.message : undefined
    });
  }
}

async function mirrorEntryToFirestore(entry: LedgerEntry, action: 'upsert' | 'delete'): Promise<void> {
  const user = auth.currentUser;
  const payload = {
    ...(entry as unknown as Record<string, unknown>),
    ...(user?.uid ? { ownerUid: user.uid } : {})
  };
  if (!user || !db) {
    if (user) enqueueKhataDocSync({ action, collectionPath: 'entries', docId: entry.id, subPath: entry.accountId, data: payload });
    return;
  }

  const root = getKhataCloudRoot(user.uid);
  try {
    const ref = doc(db, root[0], root[1], 'ledgerAccounts', entry.accountId, 'entries', entry.id);
    if (action === 'upsert') {
      await setDoc(ref, payload, { merge: true });
    } else {
      await deleteDoc(ref);
    }
  } catch (err: unknown) {
    enqueueKhataDocSync({
      action,
      collectionPath: 'entries',
      docId: entry.id,
      subPath: entry.accountId,
      data: payload,
      status: isPermissionDeniedSyncError(err) ? 'blocked' : 'pending',
      lastError: err instanceof Error ? err.message : undefined
    });
  }
}

async function mirrorCashEntryToFirestore(entry: CashEntry, action: 'upsert' | 'delete'): Promise<void> {
  const user = auth.currentUser;
  const payload = entry as unknown as Record<string, unknown>;
  if (!user || !db) {
    if (user) enqueueKhataDocSync({ action, collectionPath: 'cashbookEntries', docId: entry.id, data: payload });
    return;
  }

  const root = getKhataCloudRoot(user.uid);
  try {
    const ref = doc(db, root[0], root[1], 'cashbookEntries', entry.id);
    if (action === 'upsert') {
      await setDoc(ref, payload, { merge: true });
    } else {
      await deleteDoc(ref);
    }
  } catch (err: unknown) {
    enqueueKhataDocSync({
      action,
      collectionPath: 'cashbookEntries',
      docId: entry.id,
      data: payload,
      status: isPermissionDeniedSyncError(err) ? 'blocked' : 'pending',
      lastError: err instanceof Error ? err.message : undefined
    });
  }
}

async function mirrorSettingsToFirestore(settings: KhataSettings): Promise<void> {
  const user = auth.currentUser;
  const payload = settings as unknown as Record<string, unknown>;
  if (!user || !db) {
    if (user) enqueueKhataDocSync({ action: 'upsert', collectionPath: 'khataSettings', docId: 'config', data: payload });
    return;
  }

  const root = getKhataCloudRoot(user.uid);
  try {
    const ref = doc(db, root[0], root[1], 'khataSettings', 'config');
    await setDoc(ref, payload, { merge: true });
  } catch (err: unknown) {
    enqueueKhataDocSync({
      action: 'upsert',
      collectionPath: 'khataSettings',
      docId: 'config',
      data: payload,
      status: isPermissionDeniedSyncError(err) ? 'blocked' : 'pending',
      lastError: err instanceof Error ? err.message : undefined
    });
  }
}

function collectAllKhataTombstones(scope: string = getActiveKhataScope()): Record<string, TombstoneMap> {
  const keys = [
    'khata_ledgerAccounts',
    'khata_entries',
    'khata_cashbookEntries',
    ...KHATA_FLAT_COLLECTIONS.map(c => `khata_${c}`)
  ];
  const result: Record<string, TombstoneMap> = {};
  for (const k of keys) {
    const map = getTombstones(k, scope);
    if (Object.keys(map).length > 0) {
      result[k] = map;
    }
  }
  return result;
}

async function mirrorKhataTombstonesToFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;
  const tombstones = collectAllKhataTombstones(getActiveKhataScope());
  const payload: Record<string, unknown> = { tombstones, schemaVersion: 3 };
  if (!db) {
    enqueueKhataDocSync({ action: 'upsert', collectionPath: 'khataSettings', docId: 'config', data: payload });
    return;
  }
  const root = getKhataCloudRoot(user.uid);
  try {
    const ref = doc(db, root[0], root[1], 'khataSettings', 'config');
    await setDoc(ref, payload, { merge: true });
  } catch (err: unknown) {
    enqueueKhataDocSync({
      action: 'upsert',
      collectionPath: 'khataSettings',
      docId: 'config',
      data: payload,
      status: isPermissionDeniedSyncError(err) ? 'blocked' : 'pending',
      lastError: err instanceof Error ? err.message : undefined
    });
  }
}

export async function mirrorFlatKhataDocToFirestore(
  collectionPath: (typeof KHATA_FLAT_COLLECTIONS)[number],
  docData: { id: string; [key: string]: unknown },
  action: 'upsert' | 'delete'
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !db) {
    if (user) {
      enqueueKhataDocSync({ action, collectionPath, docId: docData.id, data: docData });
      if (action === 'delete') void mirrorKhataTombstonesToFirestore();
    }
    return;
  }

  const root = getKhataCloudRoot(user.uid);
  try {
    const ref = doc(db, root[0], root[1], collectionPath, docData.id);
    if (action === 'upsert') {
      await setDoc(ref, docData, { merge: true });
    } else {
      await deleteDoc(ref);
      void mirrorKhataTombstonesToFirestore();
    }
  } catch (err: unknown) {
    enqueueKhataDocSync({
      action,
      collectionPath,
      docId: docData.id,
      data: docData,
      status: isPermissionDeniedSyncError(err) ? 'blocked' : 'pending',
      lastError: err instanceof Error ? err.message : undefined
    });
    if (action === 'delete') void mirrorKhataTombstonesToFirestore();
  }
}

const FLAT_KEY_TO_COLLECTION: Array<{ key: string; coll: (typeof KHATA_FLAT_COLLECTIONS)[number] }> = [
  { key: KHATA_STORAGE_KEYS.BILLS, coll: 'khataBills' },
  { key: KHATA_STORAGE_KEYS.EMPLOYEES, coll: 'khataEmployees' },
  { key: KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, coll: 'khataEmployeeEntries' },
  { key: KHATA_STORAGE_KEYS.RECEIVING_POINTS, coll: 'khataReceivingPoints' },
  { key: KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, coll: 'khataReceivingEntries' },
  { key: KHATA_STORAGE_KEYS.DAILY_EXPENSES, coll: 'khataDailyExpenses' }
];

// ----------------- FULL FIRESTORE HYDRATION ON LOGIN -----------------

export async function fetchKhataFromFirestore(): Promise<void> {
  const user = auth.currentUser;
  if (!user || !db) return;

  const root = getKhataCloudRoot(user.uid);
  try {
    // 0. Fetch Settings & Tombstones FIRST so deleted records never resurrect during collection merge
    try {
      const setSnap = await getDoc(doc(db, root[0], root[1], 'khataSettings', 'config'));
      if (setSnap.exists()) {
        const rawData = setSnap.data() as KhataSettings & { tombstones?: Record<string, TombstoneMap> };
        const { tombstones: remoteTombstones, ...settingsOnly } = rawData;
        if (remoteTombstones && typeof remoteTombstones === 'object') {
          const scope = getActiveKhataScope();
          for (const [collKey, cloudMap] of Object.entries(remoteTombstones)) {
            const normKey = collKey.startsWith('khata_') ? collKey : `khata_${collKey}`;
            const mergedMap = mergeTombstoneMaps(getTombstones(normKey, scope), cloudMap || {});
            saveTombstones(normKey, mergedMap, scope);
          }
        }
        const localSettings = getKhataSettings();
        setJson(KHATA_STORAGE_KEYS.SETTINGS, { ...localSettings, ...settingsOnly });
      }
    } catch (e) {
      console.warn('[KhataStorage] Settings/tombstones pre-fetch notice:', e);
    }

    // 1. Fetch Accounts
    const accColl = collection(db, root[0], root[1], 'ledgerAccounts');
    const accSnap = await getDocs(accColl);
    const cloudAccounts: LedgerAccount[] = [];
    const cloudEntries: LedgerEntry[] = [];

    for (const d of accSnap.docs) {
      const data = d.data() as LedgerAccount;
      if (data && data.id) {
        cloudAccounts.push(data);
      }
    }

    // 1b. Fetch all ledger entries in a single ownerUid-scoped collectionGroup query (eliminates N+1 loop)
    const collectionGroupFn = (
      firestoreModule as unknown as { collectionGroup?: typeof firestoreModule.collectionGroup }
    ).collectionGroup;
    const queryFn = (firestoreModule as unknown as { query?: typeof firestoreModule.query }).query;
    const whereFn = (firestoreModule as unknown as { where?: typeof firestoreModule.where }).where;

    const uidBackfillKey = `wg_v3_khata_entries_uid_migrated_${user.uid}`;
    let fetchedViaCollectionGroup = false;

    if (
      typeof collectionGroupFn === 'function' &&
      typeof queryFn === 'function' &&
      typeof whereFn === 'function'
    ) {
      try {
        const cgQuery = queryFn(collectionGroupFn(db, 'entries'), whereFn('ownerUid', '==', user.uid));
        const cgSnap = await getDocs(cgQuery);
        for (const ed of cgSnap.docs) {
          const edata = ed.data() as LedgerEntry;
          if (edata && edata.id) {
            cloudEntries.push(edata);
          }
        }
        fetchedViaCollectionGroup = true;
        if (cgSnap.docs.length > 0) {
          try {
            safeStorage.setItem(uidBackfillKey, '1');
          } catch {}
        }
      } catch (e) {
        console.warn('[KhataStorage] collectionGroup(entries) query fallback notice:', e);
      }
    }

    const needsOneTimeLegacyCheck =
      fetchedViaCollectionGroup &&
      cloudEntries.length === 0 &&
      cloudAccounts.length > 0 &&
      !safeStorage.getItem(uidBackfillKey);

    if (!fetchedViaCollectionGroup || needsOneTimeLegacyCheck) {
      for (const acc of cloudAccounts) {
        try {
          const entryColl = collection(db, root[0], root[1], 'ledgerAccounts', acc.id, 'entries');
          const entrySnap = await getDocs(entryColl);
          for (const ed of entrySnap.docs) {
            const edata = ed.data() as LedgerEntry;
            if (edata && edata.id) {
              if (!edata.ownerUid) {
                const stamped: LedgerEntry = { ...edata, ownerUid: user.uid };
                cloudEntries.push(stamped);
                void setDoc(
                  doc(db, root[0], root[1], 'ledgerAccounts', acc.id, 'entries', edata.id),
                  { ownerUid: user.uid },
                  { merge: true }
                ).catch(() => {});
              } else {
                cloudEntries.push(edata);
              }
            }
          }
        } catch (e) {
          console.warn(`Sub-entries fetch notice for ${acc.id}:`, e);
        }
      }
      if (needsOneTimeLegacyCheck) {
        try {
          safeStorage.setItem(uidBackfillKey, '1');
        } catch {}
      }
    }

    // Always reconcile local accounts against tombstones & merge cloud accounts
    {
      const rawLocalAccounts = getLedgerAccounts();
      const prunedLocal = rawLocalAccounts.filter(a => !isKhataDocTombstoned('ledgerAccounts', a.id, a.updatedAt));
      const mergedMap = new Map<string, LedgerAccount>();
      for (const a of prunedLocal) mergedMap.set(a.id, a);
      for (const ca of cloudAccounts) {
        if (isKhataDocTombstoned('ledgerAccounts', ca.id, ca.updatedAt)) continue;
        const existing = mergedMap.get(ca.id);
        if (!existing || new Date(ca.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
          mergedMap.set(ca.id, ca);
        }
      }
      if (cloudAccounts.length > 0 || prunedLocal.length !== rawLocalAccounts.length) {
        setJson(KHATA_STORAGE_KEYS.ACCOUNTS, Array.from(mergedMap.values()));
      }
    }

    // Always reconcile local ledger entries against tombstones & merge cloud entries
    {
      const rawLocalEntries = getAllLedgerEntries();
      const prunedLocalEntries = rawLocalEntries.filter(
        e => !isKhataDocTombstoned('entries', e.id, e.updatedAt) && !isKhataDocTombstoned('ledgerAccounts', e.accountId, e.updatedAt)
      );
      const mergedEntryMap = new Map<string, LedgerEntry>();
      for (const e of prunedLocalEntries) mergedEntryMap.set(e.id, e);
      for (const ce of cloudEntries) {
        if (isKhataDocTombstoned('entries', ce.id, ce.updatedAt) || isKhataDocTombstoned('ledgerAccounts', ce.accountId, ce.updatedAt)) {
          continue;
        }
        const existing = mergedEntryMap.get(ce.id);
        if (!existing || new Date(ce.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
          mergedEntryMap.set(ce.id, ce);
        }
      }
      if (cloudEntries.length > 0 || prunedLocalEntries.length !== rawLocalEntries.length) {
        setJson(KHATA_STORAGE_KEYS.ENTRIES, Array.from(mergedEntryMap.values()));
      }
    }

    // 2. Fetch Cashbook
    const cashColl = collection(db, root[0], root[1], 'cashbookEntries');
    const cashSnap = await getDocs(cashColl);
    const cloudCash: CashEntry[] = [];
    for (const d of cashSnap.docs) {
      const cdata = d.data() as CashEntry;
      if (cdata && cdata.id) cloudCash.push(cdata);
    }
    {
      const rawLocalCash = getAllCashEntries();
      const prunedLocalCash = rawLocalCash.filter(c => !isKhataDocTombstoned('cashbookEntries', c.id, c.updatedAt));
      const cashMap = new Map<string, CashEntry>();
      for (const c of prunedLocalCash) cashMap.set(c.id, c);
      for (const cc of cloudCash) {
        if (isKhataDocTombstoned('cashbookEntries', cc.id, cc.updatedAt)) continue;
        const existing = cashMap.get(cc.id);
        if (!existing || new Date(cc.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
          cashMap.set(cc.id, cc);
        }
      }
      if (cloudCash.length > 0 || prunedLocalCash.length !== rawLocalCash.length) {
        setJson(KHATA_STORAGE_KEYS.CASHBOOK, Array.from(cashMap.values()));
      }
    }

    // 3. Fetch v1.3.0 Khata Expansion Collections
    for (const { key, coll } of FLAT_KEY_TO_COLLECTION) {
      try {
        const collRef = collection(db, root[0], root[1], coll);
        const snap = await getDocs(collRef);
        const cloudItems: Array<{ id: string; updatedAt?: string }> = [];
        for (const d of snap.docs) {
          const item = d.data() as { id: string; updatedAt?: string };
          if (item && item.id) cloudItems.push(item);
        }
        const rawLocalItems = getParsed<Array<{ id: string; updatedAt?: string }>>(key, []);
        const prunedLocalItems = rawLocalItems.filter(li => !isKhataDocTombstoned(coll, li.id, li.updatedAt));
        const merged = new Map<string, { id: string; updatedAt?: string }>();
        for (const li of prunedLocalItems) merged.set(li.id, li);
        for (const ci of cloudItems) {
          if (isKhataDocTombstoned(coll, ci.id, ci.updatedAt)) continue;
          const existing = merged.get(ci.id);
          const ciTime = ci.updatedAt ? new Date(ci.updatedAt).getTime() : 0;
          const exTime = existing?.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
          if (!existing || ciTime >= exTime) {
            merged.set(ci.id, ci);
          }
        }
        if (cloudItems.length > 0 || prunedLocalItems.length !== rawLocalItems.length) {
          setJson(key, Array.from(merged.values()));
        }
      } catch (e) {
        console.warn(`[KhataStorage] Fetch notice for ${coll}:`, e);
      }
    }
  } catch (err) {
    console.warn('[KhataStorage] Cloud fetch notice:', err);
  }
}

/**
 * Restores a Khata collection cleanly: clears deletion tombstones for restored IDs,
 * re-stamps updatedAt, supports merge vs overwrite, and triggers immediate cloud sync.
 */
export function restoreKhataCollection<T extends { id: string; updatedAt?: string }>(
  storageKey: string,
  collectionPath: string,
  incomingItems: T[],
  mode: 'merge' | 'overwrite' = 'merge'
): T[] {
  const nowIso = new Date().toISOString();
  const prevItems = getParsed<T[]>(storageKey, []);
  const stampedIncoming = incomingItems
    .filter(item => item && item.id)
    .map(item => {
      clearKhataDeletionTombstone(collectionPath, item.id);
      return {
        ...item,
        updatedAt: nowIso
      };
    });

  let finalItems: T[];
  if (mode === 'overwrite') {
    const incomingIds = new Set(stampedIncoming.map(i => i.id));
    for (const prev of prevItems) {
      if (prev?.id && !incomingIds.has(prev.id)) {
        recordKhataDeletionTombstone(collectionPath, prev.id, nowIso);
      }
    }
    finalItems = stampedIncoming;
  } else {
    const map = new Map<string, T>();
    for (const prev of prevItems) {
      if (prev?.id) map.set(prev.id, prev);
    }
    for (const item of stampedIncoming) {
      const existing = map.get(item.id);
      if (!existing) {
        map.set(item.id, item);
      } else {
        const exMs = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const inMs = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
        map.set(item.id, exMs > inMs ? existing : item);
      }
    }
    finalItems = Array.from(map.values());
  }

  setJson(storageKey, finalItems);
  return finalItems;
}

function getKhataSyncDigest(uid: string): Record<string, string> {
  try {
    const raw = safeStorage.getItem(`wg_v3_khata_digest_${uid}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function saveKhataSyncDigest(uid: string, map: Record<string, string>): void {
  safeStorage.setItem(`wg_v3_khata_digest_${uid}`, JSON.stringify(map));
}

/**
 * Pushes changed Khata documents, cashbook records, v1.3.0 collections, and settings to Firestore in batches.
 */
export async function syncAllKhataToFirestore(): Promise<{ pushedAccounts: number; pushedEntries: number; pushedCash: number }> {
  const user = auth.currentUser;
  if (!user || !db) return { pushedAccounts: 0, pushedEntries: 0, pushedCash: 0 };

  const accounts = getLedgerAccounts();
  const entries = getAllLedgerEntries();
  const cashEntries = getAllCashEntries();
  const settings = getKhataSettings();

  const root = getKhataCloudRoot(user.uid);
  const digestScope = getKhataDigestScope(user.uid);
  const digestCache = getKhataSyncDigest(digestScope);
  const nextDigest: Record<string, string> = { ...digestCache };

  type PendingOp = {
    pathKey: string;
    digest: string;
    ref: ReturnType<typeof doc>;
    data: Record<string, unknown>;
    kind: 'account' | 'entry' | 'cash' | 'other';
  };
  const ops: PendingOp[] = [];

  const confirmedSyncedPaths = new Set<string>();

  const settingsPayload = {
    ...settings,
    tombstones: collectAllKhataTombstones(getActiveKhataScope()),
    schemaVersion: 3
  };
  const settingsDigest = JSON.stringify(settingsPayload);
  if (digestCache['khataSettings/config'] !== settingsDigest) {
    ops.push({
      pathKey: 'khataSettings/config',
      digest: settingsDigest,
      ref: doc(db, root[0], root[1], 'khataSettings', 'config'),
      data: settingsPayload,
      kind: 'other'
    });
  } else {
    confirmedSyncedPaths.add('khataSettings/config');
  }

  for (const acc of accounts) {
    const pathKey = `ledgerAccounts/${acc.id}`;
    const d = JSON.stringify(acc);
    if (digestCache[pathKey] !== d) {
      ops.push({
        pathKey,
        digest: d,
        ref: doc(db, root[0], root[1], 'ledgerAccounts', acc.id),
        data: acc as unknown as Record<string, unknown>,
        kind: 'account'
      });
    } else {
      confirmedSyncedPaths.add(pathKey);
    }
  }

  for (const entry of entries) {
    const pathKey = `ledgerAccounts/${entry.accountId}/entries/${entry.id}`;
    const stampedEntry = entry.ownerUid === user.uid ? entry : { ...entry, ownerUid: user.uid };
    const d = JSON.stringify(stampedEntry);
    if (digestCache[pathKey] !== d) {
      ops.push({
        pathKey,
        digest: d,
        ref: doc(db, root[0], root[1], 'ledgerAccounts', entry.accountId, 'entries', entry.id),
        data: stampedEntry as unknown as Record<string, unknown>,
        kind: 'entry'
      });
    } else {
      confirmedSyncedPaths.add(pathKey);
    }
  }

  for (const cash of cashEntries) {
    const pathKey = `cashbookEntries/${cash.id}`;
    const d = JSON.stringify(cash);
    if (digestCache[pathKey] !== d) {
      ops.push({
        pathKey,
        digest: d,
        ref: doc(db, root[0], root[1], 'cashbookEntries', cash.id),
        data: cash as unknown as Record<string, unknown>,
        kind: 'cash'
      });
    } else {
      confirmedSyncedPaths.add(pathKey);
    }
  }

  for (const { key, coll } of FLAT_KEY_TO_COLLECTION) {
    const items = getParsed<Array<{ id: string; updatedAt?: string }>>(key, []);
    for (const item of items) {
      if (!item?.id) continue;
      const pathKey = `${coll}/${item.id}`;
      const d = JSON.stringify(item);
      if (digestCache[pathKey] !== d) {
        ops.push({
          pathKey,
          digest: d,
          ref: doc(db, root[0], root[1], coll, item.id),
          data: item as unknown as Record<string, unknown>,
          kind: 'other'
        });
      } else {
        confirmedSyncedPaths.add(pathKey);
      }
    }
  }

  let pushedAccounts = 0;
  let pushedEntries = 0;
  let pushedCash = 0;

  if (ops.length > 0) {
    const writeBatchFn = (firestoreModule as unknown as { writeBatch?: typeof firestoreModule.writeBatch }).writeBatch;
    if (typeof writeBatchFn === 'function') {
      for (let i = 0; i < ops.length; i += 400) {
        const chunk = ops.slice(i, i + 400);
        try {
          const batch = writeBatchFn(db);
          for (const op of chunk) {
            batch.set(op.ref, op.data, { merge: true });
          }
          await batch.commit();
          for (const op of chunk) {
            nextDigest[op.pathKey] = op.digest;
            confirmedSyncedPaths.add(op.pathKey);
            if (op.kind === 'account') pushedAccounts++;
            else if (op.kind === 'entry') pushedEntries++;
            else if (op.kind === 'cash') pushedCash++;
          }
        } catch {
          for (const op of chunk) {
            try {
              await setDoc(op.ref, op.data, { merge: true });
              nextDigest[op.pathKey] = op.digest;
              confirmedSyncedPaths.add(op.pathKey);
              if (op.kind === 'account') pushedAccounts++;
              else if (op.kind === 'entry') pushedEntries++;
              else if (op.kind === 'cash') pushedCash++;
            } catch {}
          }
        }
      }
    } else {
      for (const op of ops) {
        try {
          await setDoc(op.ref, op.data, { merge: true });
          nextDigest[op.pathKey] = op.digest;
          confirmedSyncedPaths.add(op.pathKey);
          if (op.kind === 'account') pushedAccounts++;
          else if (op.kind === 'entry') pushedEntries++;
          else if (op.kind === 'cash') pushedCash++;
        } catch {}
      }
    }

    saveKhataSyncDigest(digestScope, nextDigest);
  }

  // Delete queued upsert items from localStorage that are confirmed synced
  const queued = getStoredKhataQueue();
  if (queued.length > 0) {
    const remainingQueue = queued.filter(q => {
      if (q.status === 'blocked' || q.action !== 'upsert') return true;
      const qPath =
        q.collectionPath === 'entries' && q.subPath
          ? `ledgerAccounts/${q.subPath}/entries/${q.docId}`
          : `${q.collectionPath}/${q.docId}`;
      return !confirmedSyncedPaths.has(qPath);
    });
    if (remainingQueue.length !== queued.length) {
      saveStoredKhataQueue(remainingQueue);
    }
  }

  return { pushedAccounts, pushedEntries, pushedCash };
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

  clearKhataDeletionTombstone('ledgerAccounts', target.id);
  setJson(KHATA_STORAGE_KEYS.ACCOUNTS, accounts);
  void mirrorAccountToFirestore(target, 'upsert');
  return target;
}

export function deleteLedgerAccount(id: string): boolean {
  const accounts = getLedgerAccounts();
  const target = accounts.find(a => a.id === id);
  if (!target) return false;

  const filtered = accounts.filter(a => a.id !== id);
  setJson(KHATA_STORAGE_KEYS.ACCOUNTS, filtered);
  recordKhataDeletionTombstone('ledgerAccounts', id);

  // Also remove associated entries locally & record tombstones
  const allEntries = getAllLedgerEntries();
  const removedEntries = allEntries.filter(e => e.accountId === id);
  const remainingEntries = allEntries.filter(e => e.accountId !== id);
  setJson(KHATA_STORAGE_KEYS.ENTRIES, remainingEntries);
  removedEntries.forEach(en => {
    recordKhataDeletionTombstone('entries', en.id);
    void mirrorEntryToFirestore(en, 'delete');
  });

  void mirrorAccountToFirestore(target, 'delete');
  void mirrorKhataTombstonesToFirestore();
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

  const currentUid = auth.currentUser?.uid;
  let target: LedgerEntry;
  const existingIdx = data.id ? entries.findIndex(e => e.id === data.id) : -1;

  if (existingIdx >= 0) {
    target = {
      ...entries[existingIdx],
      ...data,
      ...(currentUid ? { ownerUid: currentUid } : {}),
      amount: Math.abs(fromPaisa(toPaisa(Number(data.amount) || 0))),
      updatedAt: now
    };
    entries[existingIdx] = target;
  } else {
    target = {
      id: data.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      accountId: data.accountId,
      ...(currentUid ? { ownerUid: currentUid } : {}),
      type: data.type,
      amount: Math.abs(fromPaisa(toPaisa(Number(data.amount) || 0))),
      date: data.date,
      note: data.note || '',
      source: data.source || 'manual',
      sourceRef: data.sourceRef,
      createdAt: now,
      updatedAt: now
    };
    entries.unshift(target);
  }

  clearKhataDeletionTombstone('entries', target.id);
  setJson(KHATA_STORAGE_KEYS.ENTRIES, entries);

  // Update account's updatedAt timestamp and mirror to cloud
  const accounts = getLedgerAccounts();
  const accIdx = accounts.findIndex(a => a.id === data.accountId);
  if (accIdx >= 0) {
    accounts[accIdx].updatedAt = now;
    setJson(KHATA_STORAGE_KEYS.ACCOUNTS, accounts);
    void mirrorAccountToFirestore(accounts[accIdx], 'upsert');
  }

  void mirrorEntryToFirestore(target, 'upsert');
  return target;
}

export function deleteLedgerEntry(id: string): LedgerEntry | null {
  const entries = getAllLedgerEntries();
  const target = entries.find(e => e.id === id);
  if (!target) return null;

  const filtered = entries.filter(e => e.id !== id);
  setJson(KHATA_STORAGE_KEYS.ENTRIES, filtered);
  recordKhataDeletionTombstone('entries', id);

  void mirrorEntryToFirestore(target, 'delete');
  void mirrorKhataTombstonesToFirestore();
  return target;
}

export function restoreLedgerEntry(entry: LedgerEntry): void {
  const entries = getAllLedgerEntries();
  if (!entries.some(e => e.id === entry.id)) {
    const restored = { ...entry, updatedAt: new Date().toISOString() };
    entries.unshift(restored);
    clearKhataDeletionTombstone('entries', restored.id);
    setJson(KHATA_STORAGE_KEYS.ENTRIES, entries);
    void mirrorEntryToFirestore(restored, 'upsert');
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

function mapCashCatToDailyCat(cat?: string): string {
  switch (cat) {
    case 'fuel': return 'fuel';
    case 'toll': return 'toll';
    case 'food':
    case 'meals': return 'meals';
    case 'maintenance':
    case 'repair': return 'repair';
    case 'parking': return 'parking';
    case 'challan':
    case 'fine': return 'fine';
    default: return 'other';
  }
}

export function saveOrUpdateCashEntry(
  data: Partial<CashEntry> & { type: 'in' | 'out'; amount: number; date: string },
  options?: { skipExpenseSync?: boolean }
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
      vehicleNo: data.vehicleNo || undefined,
      sourceModule: data.sourceModule || 'manual',
      linkedExpenseId: data.linkedExpenseId || undefined,
      createdAt: now,
      updatedAt: now
    };
    cashList.unshift(target);
  }

  clearKhataDeletionTombstone('cashbookEntries', target.id);
  setJson(KHATA_STORAGE_KEYS.CASHBOOK, cashList);
  void mirrorCashEntryToFirestore(target, 'upsert');

  // Bi-directional sync with Daily Expenses if this CashEntry is linked to a daily expense
  if (!options?.skipExpenseSync && (target.linkedExpenseId || target.sourceModule === 'daily_expense')) {
    const expenses = getParsed<Array<{ id: string; linkedCashEntryId?: string; notes?: string }>>(
      KHATA_STORAGE_KEYS.DAILY_EXPENSES,
      []
    );
    const expIdx = expenses.findIndex(
      e => e.id === target.linkedExpenseId || e.linkedCashEntryId === target.id
    );
    if (expIdx >= 0) {
      if (target.type === 'in') {
        const removed = expenses[expIdx];
        const nextExps = expenses.filter((_, i) => i !== expIdx);
        setJson(KHATA_STORAGE_KEYS.DAILY_EXPENSES, nextExps);
        recordKhataDeletionTombstone('khataDailyExpenses', removed.id);
        void mirrorFlatKhataDocToFirestore('khataDailyExpenses', removed, 'delete');
      } else {
        const updatedExp = {
          ...expenses[expIdx],
          date: target.date,
          amount: target.amount,
          category: mapCashCatToDailyCat(target.category),
          vehicleNo: target.vehicleNo,
          notes: target.note || expenses[expIdx].notes || '',
          updatedAt: now
        };
        expenses[expIdx] = updatedExp;
        setJson(KHATA_STORAGE_KEYS.DAILY_EXPENSES, expenses);
        void mirrorFlatKhataDocToFirestore('khataDailyExpenses', updatedExp, 'upsert');
      }
    }
  }

  return target;
}

export function deleteCashEntry(id: string, options?: { skipExpenseSync?: boolean }): CashEntry | null {
  const cashList = getAllCashEntries();
  const target = cashList.find(c => c.id === id);
  if (!target) return null;

  const filtered = cashList.filter(c => c.id !== id);
  setJson(KHATA_STORAGE_KEYS.CASHBOOK, filtered);
  recordKhataDeletionTombstone('cashbookEntries', id);

  void mirrorCashEntryToFirestore(target, 'delete');
  void mirrorKhataTombstonesToFirestore();

  if (!options?.skipExpenseSync && (target.linkedExpenseId || target.sourceModule === 'daily_expense')) {
    const expenses = getParsed<Array<{ id: string; linkedCashEntryId?: string }>>(
      KHATA_STORAGE_KEYS.DAILY_EXPENSES,
      []
    );
    const linked = expenses.find(
      e => e.id === target.linkedExpenseId || e.linkedCashEntryId === target.id
    );
    if (linked) {
      const nextExps = expenses.filter(e => e.id !== linked.id);
      setJson(KHATA_STORAGE_KEYS.DAILY_EXPENSES, nextExps);
      recordKhataDeletionTombstone('khataDailyExpenses', linked.id);
      void mirrorFlatKhataDocToFirestore('khataDailyExpenses', linked, 'delete');
    }
  }

  return target;
}

export function restoreCashEntry(entry: CashEntry): void {
  const cashList = getAllCashEntries();
  if (!cashList.some(c => c.id === entry.id)) {
    const restored = { ...entry, updatedAt: new Date().toISOString() };
    cashList.unshift(restored);
    clearKhataDeletionTombstone('cashbookEntries', restored.id);
    setJson(KHATA_STORAGE_KEYS.CASHBOOK, cashList);
    void mirrorCashEntryToFirestore(restored, 'upsert');
  }
}

/**
 * Calculates day cash summary with integer paisa precision (#22)
 */
export function calculateDayCashSummary(targetDate: string, allCash: CashEntry[] = []): {
  openingBalance: number;
  totalIn: number;
  totalOut: number;
  closingBalance: number;
} {
  let openingBalancePaisa = 0;
  let totalInPaisa = 0;
  let totalOutPaisa = 0;

  for (const entry of allCash) {
    const amtPaisa = toPaisa(Number(entry.amount) || 0);
    if (entry.date < targetDate) {
      if (entry.type === 'in') openingBalancePaisa += amtPaisa;
      else openingBalancePaisa -= amtPaisa;
    } else if (entry.date === targetDate) {
      if (entry.type === 'in') totalInPaisa += amtPaisa;
      else totalOutPaisa += amtPaisa;
    }
  }

  const closingBalancePaisa = openingBalancePaisa + totalInPaisa - totalOutPaisa;

  return {
    openingBalance: fromPaisa(openingBalancePaisa),
    totalIn: fromPaisa(totalInPaisa),
    totalOut: fromPaisa(totalOutPaisa),
    closingBalance: fromPaisa(closingBalancePaisa)
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
  version: '2.0' | '3.0';
  schemaVersion?: number;
  exportedAt: string;
  businessName: string;
  accounts: LedgerAccount[];
  entries: LedgerEntry[];
  cashEntries: CashEntry[];
  bills?: any[];
  employees?: any[];
  employeeEntries?: any[];
  receivingPoints?: any[];
  receivingEntries?: any[];
  dailyExpenses?: any[];
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
  const bills = getParsed<any[]>(KHATA_STORAGE_KEYS.BILLS, []);
  const employees = getParsed<any[]>(KHATA_STORAGE_KEYS.EMPLOYEES, []);
  const employeeEntries = getParsed<any[]>(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, []);
  const receivingPoints = getParsed<any[]>(KHATA_STORAGE_KEYS.RECEIVING_POINTS, []);
  const receivingEntries = getParsed<any[]>(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, []);
  const dailyExpenses = getParsed<any[]>(KHATA_STORAGE_KEYS.DAILY_EXPENSES, []);

  const payload: Omit<KhataBackupData, 'checksum'> = {
    app: 'Driver Dost',
    module: 'khata',
    version: '3.0',
    schemaVersion: 3,
    exportedAt: new Date().toISOString(),
    businessName: settings.businessName || '',
    accounts,
    entries,
    cashEntries,
    bills,
    employees,
    employeeEntries,
    receivingPoints,
    receivingEntries,
    dailyExpenses
  };

  const backup: KhataBackupData = {
    ...payload,
    checksum: calculateChecksum(payload)
  };

  return JSON.stringify(backup, null, 2);
}

export const MAX_KHATA_BACKUP_BYTES = 15 * 1024 * 1024; // 15 MB hard import limit

const AMOUNT_FIELD_KEYS = [
  'openingAmount',
  'amount',
  'totalAmount',
  'paidAmount',
  'salary',
  'basicSalary',
  'monthlySalary',
  'rate',
  'freight',
  'advance',
  'balance'
] as const;

const DATE_FIELD_KEYS = ['date', 'dueDate', 'paymentDate', 'createdAt', 'updatedAt'] as const;

export function isValidSaneDateString(raw: unknown): boolean {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;

  const ymdMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);
    if (year < 1970 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return false;
    }
    const check = new Date(Date.UTC(year, month - 1, day));
    return (
      check.getUTCFullYear() === year &&
      check.getUTCMonth() + 1 === month &&
      check.getUTCDate() === day
    );
  }

  const ms = Date.parse(trimmed);
  if (Number.isNaN(ms)) return false;
  const year = new Date(ms).getUTCFullYear();
  return year >= 1970 && year <= 2100;
}

export interface KhataBackupValidationResult {
  valid: boolean;
  data?: KhataBackupData;
  error?: string;
}

function verifyKhataChecksumIfPresent(data: KhataBackupData): { ok: boolean; error?: string } {
  const record = data as unknown as Record<string, unknown>;
  if (!('checksum' in record) || record.checksum === undefined) {
    // Allow legacy backups with no checksum field
    return { ok: true };
  }
  if (typeof record.checksum !== 'number' || !Number.isFinite(record.checksum)) {
    return { ok: false, error: 'Invalid backup checksum format' };
  }

  const { checksum: providedChecksum, ...restWithoutChecksum } = record;
  if (calculateChecksum(restWithoutChecksum) === providedChecksum) {
    return { ok: true };
  }

  // Canonical field-order match matching exportKhataBackup()
  const canonicalPayload: Record<string, unknown> = {
    app: record.app,
    module: record.module,
    version: record.version
  };
  if (record.schemaVersion !== undefined) canonicalPayload.schemaVersion = record.schemaVersion;
  canonicalPayload.exportedAt = record.exportedAt;
  canonicalPayload.businessName = record.businessName;
  canonicalPayload.accounts = record.accounts;
  canonicalPayload.entries = record.entries;
  canonicalPayload.cashEntries = record.cashEntries;
  if (record.bills !== undefined) canonicalPayload.bills = record.bills;
  if (record.employees !== undefined) canonicalPayload.employees = record.employees;
  if (record.employeeEntries !== undefined) canonicalPayload.employeeEntries = record.employeeEntries;
  if (record.receivingPoints !== undefined) canonicalPayload.receivingPoints = record.receivingPoints;
  if (record.receivingEntries !== undefined) canonicalPayload.receivingEntries = record.receivingEntries;
  if (record.dailyExpenses !== undefined) canonicalPayload.dailyExpenses = record.dailyExpenses;

  if (calculateChecksum(canonicalPayload) === providedChecksum) {
    return { ok: true };
  }

  return { ok: false, error: 'Backup checksum mismatch — file may be corrupted or tampered with' };
}

function validateKhataArrayItems(
  items: unknown[],
  collectionLabel: string,
  requireAmountAndDate: boolean
): string | null {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return `Invalid item in ${collectionLabel} at index ${i}`;
    }
    const obj = item as Record<string, unknown>;
    if (typeof obj.id !== 'string' || !obj.id.trim()) {
      return `Missing or invalid id in ${collectionLabel} at index ${i}`;
    }
    if (requireAmountAndDate) {
      if (typeof obj.amount !== 'number' || !Number.isFinite(obj.amount)) {
        return `Invalid amount in ${collectionLabel} (${obj.id})`;
      }
      if (!isValidSaneDateString(obj.date)) {
        return `Invalid date in ${collectionLabel} (${obj.id})`;
      }
    }
    for (const key of AMOUNT_FIELD_KEYS) {
      if (key in obj && obj[key] !== undefined) {
        if (typeof obj[key] !== 'number' || !Number.isFinite(obj[key])) {
          return `Non-finite or invalid ${key} in ${collectionLabel} (${obj.id})`;
        }
      }
    }
    for (const dKey of DATE_FIELD_KEYS) {
      if (dKey in obj && obj[dKey] !== undefined && obj[dKey] !== '') {
        if (!isValidSaneDateString(obj[dKey])) {
          return `Invalid ${dKey} in ${collectionLabel} (${obj.id})`;
        }
      }
    }
  }
  return null;
}

export function validateKhataBackupPayload(jsonStr: string): KhataBackupValidationResult {
  if (typeof jsonStr !== 'string' || !jsonStr.trim()) {
    return { valid: false, error: 'Empty backup file' };
  }

  const byteLen =
    typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(jsonStr).length : jsonStr.length * 2;
  if (byteLen > MAX_KHATA_BACKUP_BYTES) {
    return {
      valid: false,
      error: `Backup exceeds ${Math.round(MAX_KHATA_BACKUP_BYTES / (1024 * 1024))} MB size limit`
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonStr);
  } catch {
    return { valid: false, error: 'Failed to parse JSON backup' };
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'Invalid backup file format' };
  }

  const data = raw as KhataBackupData;
  if (data.app !== 'Driver Dost' || data.module !== 'khata') {
    return { valid: false, error: 'Invalid backup file format' };
  }

  if (!Array.isArray(data.accounts) || !Array.isArray(data.entries) || !Array.isArray(data.cashEntries)) {
    return { valid: false, error: 'Malformed Khata backup contents' };
  }

  const optionalArrayFields = [
    'bills',
    'employees',
    'employeeEntries',
    'receivingPoints',
    'receivingEntries',
    'dailyExpenses'
  ] as const;
  for (const field of optionalArrayFields) {
    const val = (data as unknown as Record<string, unknown>)[field];
    if (val !== undefined && !Array.isArray(val)) {
      return { valid: false, error: `Malformed "${field}" collection in backup` };
    }
  }

  const checksumCheck = verifyKhataChecksumIfPresent(data);
  if (!checksumCheck.ok) {
    return { valid: false, error: checksumCheck.error };
  }

  const itemChecks: Array<[unknown[], string, boolean]> = [
    [data.accounts, 'accounts', false],
    [data.entries, 'entries', true],
    [data.cashEntries, 'cashEntries', true],
    ...(Array.isArray(data.bills) ? [[data.bills, 'bills', false] as [unknown[], string, boolean]] : []),
    ...(Array.isArray(data.employees) ? [[data.employees, 'employees', false] as [unknown[], string, boolean]] : []),
    ...(Array.isArray(data.employeeEntries)
      ? [[data.employeeEntries, 'employeeEntries', false] as [unknown[], string, boolean]]
      : []),
    ...(Array.isArray(data.receivingPoints)
      ? [[data.receivingPoints, 'receivingPoints', false] as [unknown[], string, boolean]]
      : []),
    ...(Array.isArray(data.receivingEntries)
      ? [[data.receivingEntries, 'receivingEntries', false] as [unknown[], string, boolean]]
      : []),
    ...(Array.isArray(data.dailyExpenses)
      ? [[data.dailyExpenses, 'dailyExpenses', false] as [unknown[], string, boolean]]
      : [])
  ];

  for (const [list, label, requireAmountAndDate] of itemChecks) {
    const err = validateKhataArrayItems(list, label, requireAmountAndDate);
    if (err) {
      return { valid: false, error: err };
    }
  }

  return { valid: true, data };
}

interface KhataRestoreBatchOp {
  action: 'upsert' | 'delete';
  collectionPath: string;
  docId: string;
  subPath?: string;
  pathKey: string;
  ref: ReturnType<typeof doc>;
  data?: Record<string, unknown>;
  digest?: string;
}

let pendingKhataImportSyncPromise: Promise<void> = Promise.resolve();

export function waitForPendingKhataImportSync(): Promise<void> {
  return pendingKhataImportSyncPromise;
}

async function commitKhataRestoreBatches(
  uid: string,
  ops: KhataRestoreBatchOp[]
): Promise<void> {
  if (ops.length === 0) return;

  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  const queueBatchOps = (failedOps: KhataRestoreBatchOp[], permDenied = false) => {
    try {
      const queue = getStoredKhataQueue();
      const map = new Map<string, KhataDocQueueItem>();
      for (const existing of queue) {
        const k = `${existing.collectionPath}:${existing.subPath || ''}:${existing.docId}`;
        map.set(k, existing);
      }
      const nowIso = new Date().toISOString();
      for (const op of failedOps) {
        const k = `${op.collectionPath}:${op.subPath || ''}:${op.docId}`;
        map.set(k, {
          id: `khata_batch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          action: op.action,
          collectionPath: op.collectionPath,
          docId: op.docId,
          subPath: op.subPath,
          data: op.data,
          timestamp: nowIso,
          retryCount: 0,
          status: permDenied ? 'blocked' : 'pending'
        });
      }
      saveStoredKhataQueue(Array.from(map.values()));
    } catch (err) {
      console.warn('[KhataImport] Queue fallback notice:', err);
    }
  };

  if (!db || !isOnline) {
    queueBatchOps(ops);
    return;
  }

  const writeBatchFn = (firestoreModule as unknown as {
    writeBatch?: typeof firestoreModule.writeBatch;
  }).writeBatch;
  const digestCache = getKhataSyncDigest(uid);
  const nextDigest: Record<string, string> = { ...digestCache };
  let digestDirty = false;
  const failedOps: KhataRestoreBatchOp[] = [];
  let hadPermError = false;

  for (let i = 0; i < ops.length; i += 400) {
    const chunk = ops.slice(i, i + 400);
    try {
      if (typeof writeBatchFn === 'function') {
        const batch = writeBatchFn(db);
        for (const op of chunk) {
          if (op.action === 'upsert') {
            batch.set(op.ref, op.data || {}, { merge: true });
          } else {
            batch.delete(op.ref);
          }
        }
        await batch.commit();
      } else {
        for (const op of chunk) {
          if (op.action === 'upsert') {
            await setDoc(op.ref, op.data || {}, { merge: true });
          } else {
            await deleteDoc(op.ref);
          }
        }
      }
      for (const op of chunk) {
        if (op.action === 'upsert' && op.digest) {
          nextDigest[op.pathKey] = op.digest;
          digestDirty = true;
        } else if (op.action === 'delete' && nextDigest[op.pathKey]) {
          delete nextDigest[op.pathKey];
          digestDirty = true;
        }
      }
    } catch (err) {
      if (isPermissionDeniedSyncError(err)) hadPermError = true;
      failedOps.push(...chunk);
    }
  }

  if (digestDirty) {
    saveKhataSyncDigest(uid, nextDigest);
  }
  if (failedOps.length > 0) {
    queueBatchOps(failedOps, hadPermError);
  }
}

export function importKhataBackup(
  jsonStr: string,
  mode: 'merge' | 'replace' = 'merge'
): {
  success: boolean;
  accountsCount: number;
  entriesCount: number;
  cashCount: number;
  billsCount?: number;
  employeesCount?: number;
  employeeEntriesCount?: number;
  receivingPointsCount?: number;
  receivingEntriesCount?: number;
  dailyExpensesCount?: number;
  error?: string;
} {
  try {
    const validation = validateKhataBackupPayload(jsonStr);
    if (!validation.valid || !validation.data) {
      return {
        success: false,
        accountsCount: 0,
        entriesCount: 0,
        cashCount: 0,
        error: validation.error || 'Invalid backup file format'
      };
    }

    const data = validation.data;
    const scope = getActiveKhataScope();
    const restoreMode: 'merge' | 'overwrite' = mode === 'replace' ? 'overwrite' : 'merge';

    // Capture current state for both pre-restore Undo snapshot (IDB-only 7-day TTL) & replace-mode cloud deletes
    const prevAccounts = getLedgerAccounts();
    const prevEntries = getAllLedgerEntries();
    const prevCash = getAllCashEntries();
    const prevBills = getParsed<Array<{ id: string; updatedAt?: string }>>(KHATA_STORAGE_KEYS.BILLS, []);
    const prevEmployees = getParsed<Array<{ id: string; updatedAt?: string }>>(KHATA_STORAGE_KEYS.EMPLOYEES, []);
    const prevEmpEntries = getParsed<Array<{ id: string; updatedAt?: string }>>(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, []);
    const prevPoints = getParsed<Array<{ id: string; updatedAt?: string }>>(KHATA_STORAGE_KEYS.RECEIVING_POINTS, []);
    const prevPointEntries = getParsed<Array<{ id: string; updatedAt?: string }>>(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, []);
    const prevExpenses = getParsed<Array<{ id: string; updatedAt?: string }>>(KHATA_STORAGE_KEYS.DAILY_EXPENSES, []);

    void savePreRestoreSnapshotIdbOnly(scope, {
      capturedAt: new Date().toISOString(),
      source: 'khata-json-import',
      ledgerAccounts: prevAccounts,
      ledgerEntries: prevEntries,
      cashbookEntries: prevCash,
      bills: prevBills,
      employees: prevEmployees,
      employeeEntries: prevEmpEntries,
      receivingPoints: prevPoints,
      receivingEntries: prevPointEntries,
      dailyExpenses: prevExpenses
    });

    const incomingBills = Array.isArray(data.bills) ? (data.bills as Array<{ id: string; updatedAt?: string }>) : [];
    const incomingEmployees = Array.isArray(data.employees) ? (data.employees as Array<{ id: string; updatedAt?: string }>) : [];
    const incomingEmpEntries = Array.isArray(data.employeeEntries) ? (data.employeeEntries as Array<{ id: string; updatedAt?: string }>) : [];
    const incomingPoints = Array.isArray(data.receivingPoints) ? (data.receivingPoints as Array<{ id: string; updatedAt?: string }>) : [];
    const incomingPointEntries = Array.isArray(data.receivingEntries) ? (data.receivingEntries as Array<{ id: string; updatedAt?: string }>) : [];
    const incomingExpenses = Array.isArray(data.dailyExpenses) ? (data.dailyExpenses as Array<{ id: string; updatedAt?: string }>) : [];

    // Tombstone-aware restore (clears restored tombstones, re-stamps updatedAt, tombstones deleted items in 'replace' mode)
    const finalAccounts = restoreKhataCollection<LedgerAccount>(
      KHATA_STORAGE_KEYS.ACCOUNTS,
      'ledgerAccounts',
      data.accounts,
      restoreMode
    );
    const finalEntries = restoreKhataCollection<LedgerEntry>(
      KHATA_STORAGE_KEYS.ENTRIES,
      'entries',
      data.entries,
      restoreMode
    );
    const finalCash = restoreKhataCollection<CashEntry>(
      KHATA_STORAGE_KEYS.CASHBOOK,
      'cashbookEntries',
      data.cashEntries,
      restoreMode
    );

    const hasExpansion = data.version === '3.0';
    const shouldWriteExpansion = (arr: unknown) =>
      restoreMode === 'merge' || hasExpansion || Array.isArray(arr);

    const finalBills = shouldWriteExpansion(data.bills)
      ? restoreKhataCollection(KHATA_STORAGE_KEYS.BILLS, 'khataBills', incomingBills, restoreMode)
      : prevBills;
    const finalEmployees = shouldWriteExpansion(data.employees)
      ? restoreKhataCollection(KHATA_STORAGE_KEYS.EMPLOYEES, 'khataEmployees', incomingEmployees, restoreMode)
      : prevEmployees;
    const finalEmpEntries = shouldWriteExpansion(data.employeeEntries)
      ? restoreKhataCollection(KHATA_STORAGE_KEYS.EMPLOYEE_ENTRIES, 'khataEmployeeEntries', incomingEmpEntries, restoreMode)
      : prevEmpEntries;
    const finalPoints = shouldWriteExpansion(data.receivingPoints)
      ? restoreKhataCollection(KHATA_STORAGE_KEYS.RECEIVING_POINTS, 'khataReceivingPoints', incomingPoints, restoreMode)
      : prevPoints;
    const finalPointEntries = shouldWriteExpansion(data.receivingEntries)
      ? restoreKhataCollection(KHATA_STORAGE_KEYS.RECEIVING_ENTRIES, 'khataReceivingEntries', incomingPointEntries, restoreMode)
      : prevPointEntries;
    const finalExpenses = shouldWriteExpansion(data.dailyExpenses)
      ? restoreKhataCollection(KHATA_STORAGE_KEYS.DAILY_EXPENSES, 'khataDailyExpenses', incomingExpenses, restoreMode)
      : prevExpenses;

    if (mode === 'replace' && data.businessName) {
      const currentSettings = getKhataSettings();
      setJson(KHATA_STORAGE_KEYS.SETTINGS, {
        ...currentSettings,
        businessName: data.businessName,
        schemaVersion: 3
      });
    }

    // Build batched Firestore commit (single writeBatch pipeline instead of N individual writes)
    const user = auth.currentUser;
    if (user && db) {
      const root = getKhataCloudRoot(user.uid);
      const digestScope = getKhataDigestScope(user.uid);
      const batchOps: KhataRestoreBatchOp[] = [];

      const settingsPayload = {
        ...getKhataSettings(),
        tombstones: collectAllKhataTombstones(scope),
        schemaVersion: 3
      };
      batchOps.push({
        action: 'upsert',
        collectionPath: 'khataSettings',
        docId: 'config',
        pathKey: 'khataSettings/config',
        ref: doc(db, root[0], root[1], 'khataSettings', 'config'),
        data: settingsPayload as unknown as Record<string, unknown>,
        digest: JSON.stringify(settingsPayload)
      });

      const addUpserts = (
        coll: string,
        items: Array<{ id: string }>,
        getSubPath?: (item: any) => string
      ) => {
        for (const item of items) {
          if (!item?.id) continue;
          const sub = getSubPath ? getSubPath(item) : undefined;
          const ref = sub
            ? doc(db, root[0], root[1], 'ledgerAccounts', sub, 'entries', item.id)
            : doc(db, root[0], root[1], coll, item.id);
          const pathKey = sub ? `ledgerAccounts/${sub}/entries/${item.id}` : `${coll}/${item.id}`;
          const payloadData =
            coll === 'entries'
              ? { ...(item as unknown as Record<string, unknown>), ownerUid: user.uid }
              : (item as unknown as Record<string, unknown>);
          batchOps.push({
            action: 'upsert',
            collectionPath: coll,
            docId: item.id,
            subPath: sub,
            pathKey,
            ref,
            data: payloadData,
            digest: JSON.stringify(payloadData)
          });
        }
      };

      const addReplaceDeletes = (
        coll: string,
        prevItems: Array<{ id: string }>,
        finalItems: Array<{ id: string }>,
        getSubPath?: (item: any) => string
      ) => {
        if (restoreMode !== 'overwrite') return;
        const keptIds = new Set(finalItems.map(i => i.id));
        for (const prev of prevItems) {
          if (!prev?.id || keptIds.has(prev.id)) continue;
          const sub = getSubPath ? getSubPath(prev) : undefined;
          const ref = sub
            ? doc(db, root[0], root[1], 'ledgerAccounts', sub, 'entries', prev.id)
            : doc(db, root[0], root[1], coll, prev.id);
          const pathKey = sub ? `ledgerAccounts/${sub}/entries/${prev.id}` : `${coll}/${prev.id}`;
          batchOps.push({
            action: 'delete',
            collectionPath: coll,
            docId: prev.id,
            subPath: sub,
            pathKey,
            ref
          });
        }
      };

      addUpserts('ledgerAccounts', finalAccounts);
      addUpserts('entries', finalEntries, (e: LedgerEntry) => e.accountId);
      addUpserts('cashbookEntries', finalCash);
      if (shouldWriteExpansion(data.bills)) addUpserts('khataBills', finalBills);
      if (shouldWriteExpansion(data.employees)) addUpserts('khataEmployees', finalEmployees);
      if (shouldWriteExpansion(data.employeeEntries)) addUpserts('khataEmployeeEntries', finalEmpEntries);
      if (shouldWriteExpansion(data.receivingPoints)) addUpserts('khataReceivingPoints', finalPoints);
      if (shouldWriteExpansion(data.receivingEntries)) addUpserts('khataReceivingEntries', finalPointEntries);
      if (shouldWriteExpansion(data.dailyExpenses)) addUpserts('khataDailyExpenses', finalExpenses);

      addReplaceDeletes('ledgerAccounts', prevAccounts, finalAccounts);
      addReplaceDeletes('entries', prevEntries, finalEntries, (e: LedgerEntry) => e.accountId);
      addReplaceDeletes('cashbookEntries', prevCash, finalCash);
      if (shouldWriteExpansion(data.bills)) addReplaceDeletes('khataBills', prevBills, finalBills);
      if (shouldWriteExpansion(data.employees)) addReplaceDeletes('khataEmployees', prevEmployees, finalEmployees);
      if (shouldWriteExpansion(data.employeeEntries)) {
        addReplaceDeletes('khataEmployeeEntries', prevEmpEntries, finalEmpEntries);
      }
      if (shouldWriteExpansion(data.receivingPoints)) {
        addReplaceDeletes('khataReceivingPoints', prevPoints, finalPoints);
      }
      if (shouldWriteExpansion(data.receivingEntries)) {
        addReplaceDeletes('khataReceivingEntries', prevPointEntries, finalPointEntries);
      }
      if (shouldWriteExpansion(data.dailyExpenses)) {
        addReplaceDeletes('khataDailyExpenses', prevExpenses, finalExpenses);
      }

      pendingKhataImportSyncPromise = commitKhataRestoreBatches(digestScope, batchOps).catch(() => {});
    }

    return {
      success: true,
      accountsCount: finalAccounts.length,
      entriesCount: finalEntries.length,
      cashCount: finalCash.length,
      billsCount: finalBills.length,
      employeesCount: finalEmployees.length,
      employeeEntriesCount: finalEmpEntries.length,
      receivingPointsCount: finalPoints.length,
      receivingEntriesCount: finalPointEntries.length,
      dailyExpensesCount: finalExpenses.length
    };
  } catch (err: any) {
    return {
      success: false,
      accountsCount: 0,
      entriesCount: 0,
      cashCount: 0,
      error: err?.message || 'Parse error'
    };
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

export function formatAccountStatementWhatsAppMessage(
  account: LedgerAccount,
  entries: LedgerEntry[],
  customBusinessName?: string,
  lang: Language = 'ur'
): string {
  const isUrdu = lang === 'ur';
  const business = (customBusinessName && customBusinessName.trim()) ? customBusinessName.trim() : 'وڑائچ گڈز ٹرانسپورٹ کمپنی';
  const { balance, totalGave, totalGot } = calculateAccountBalance(account, entries);
  const cleanPhone = normalizePakistaniPhone(account.phone);
  const displayPhone = formatPhoneForDisplay(cleanPhone || account.phone);
  const todayStr = new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const kindLabel = account.kind === 'broker'
    ? (isUrdu ? 'بروکر / کمیشن ایجنٹ' : 'Broker / Agent')
    : (isUrdu ? 'کسٹمر / پارٹی' : 'Customer / Party');

  let balanceText = '';
  if (balance > 0) {
    balanceText = isUrdu
      ? `بقایا واجب الوصول (آپ نے وصول کرنا ہے): PKR ${balance.toLocaleString('en-US')}`
      : `Outstanding Balance (Receivable): PKR ${balance.toLocaleString('en-US')}`;
  } else if (balance < 0) {
    balanceText = isUrdu
      ? `بقایا واجب الادا (آپ نے ادا کرنا ہے): PKR ${Math.abs(balance).toLocaleString('en-US')}`
      : `Outstanding Balance (Payable): PKR ${Math.abs(balance).toLocaleString('en-US')}`;
  } else {
    balanceText = isUrdu ? `حساب بالکل کلیئر ہے (صفر بقایا)` : `Account is fully settled (Zero Balance)`;
  }

  // Sorted recent entries (latest 5)
  const sortedEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  let txListText = '';
  if (sortedEntries.length > 0) {
    txListText = sortedEntries
      .map((e, idx) => {
        const typeLabel = e.type === 'gave'
          ? (isUrdu ? 'دیا' : 'Gave')
          : (isUrdu ? 'ملا' : 'Got');
        const noteStr = e.note ? ` - ${e.note}` : '';
        return `${idx + 1}. ${e.date} | ${typeLabel}: PKR ${e.amount.toLocaleString('en-US')}${noteStr}`;
      })
      .join('\n');
  }

  if (isUrdu) {
    return (
      `📋 *کھاتہ اسٹیٹمنٹ / اکاؤنٹ تفصیل*\n` +
      `🏢 *${business}*\n` +
      `📅 تاریخ: ${todayStr}\n\n` +
      `👤 کھاتہ دار: *${account.name}* (${kindLabel})\n` +
      (displayPhone ? `📞 فون: ${displayPhone}\n` : '') +
      (account.dueDate ? `⏳ آخری تاریخ ادائیگی: ${account.dueDate}\n` : '') +
      `--------------------------------\n` +
      `💰 *${balanceText}*\n` +
      `--------------------------------\n` +
      `کل دیا: PKR ${totalGave.toLocaleString('en-US')}\n` +
      `کل وصولی: PKR ${totalGot.toLocaleString('en-US')}\n` +
      (txListText ? `\n📝 *حالیہ 5 ٹرانزیکشنز:*\n${txListText}\n` : '') +
      `\n🙏 برائے مہربانی اپنا کھاتہ چیک فرمائیں۔ کسی بھی فرق کی صورت میں رابطہ کریں۔ شکریہ!` +
      `\n— ${business}`
    );
  } else {
    return (
      `📋 *ACCOUNT STATEMENT*\n` +
      `🏢 *${business}*\n` +
      `📅 Date: ${todayStr}\n\n` +
      `👤 Account: *${account.name}* (${kindLabel})\n` +
      (displayPhone ? `📞 Phone: ${displayPhone}\n` : '') +
      (account.dueDate ? `⏳ Due Date: ${account.dueDate}\n` : '') +
      `--------------------------------\n` +
      `💰 *${balanceText}*\n` +
      `--------------------------------\n` +
      `Total Gave: PKR ${totalGave.toLocaleString('en-US')}\n` +
      `Total Got: PKR ${totalGot.toLocaleString('en-US')}\n` +
      (txListText ? `\n📝 *Recent 5 Transactions:*\n${txListText}\n` : '') +
      `\n🙏 Please review and confirm your statement. Thank you!` +
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
            date: b.date || getPakistanDateKey(),
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
  const filterUpper = vehicleFilter ? vehicleFilter.toLowerCase() : 'all';
  const vLower = filterUpper;
  const filteredTrips = trips.filter(t => {
    const matchVehicle =
      vLower === 'all' ||
      t.vehicleNo?.toLowerCase() === vLower ||
      t.name?.toLowerCase().includes(vLower) ||
      !t.fuelTypeRaw ||
      t.fuelTypeRaw === vehicleFilter;
    const matchMonth = monthFilter === 'all' || !t.month || t.month === monthFilter;
    return matchVehicle && matchMonth;
  });

  const totalIncome = filteredTrips.reduce((sum, t) => sum + (t.totalIncome || t.expectedIncome || 0), 0);
  const totalExpenses = filteredTrips.reduce((sum, t) => sum + (t.total || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const totalDistanceKm = filteredTrips.reduce((sum, t) => sum + (Number(t.dist) || 0), 0);

  const dieselCost = filteredTrips.reduce((sum, t) => sum + (Number(t.fuelCost) || 0), 0);
  const tollCost = filteredTrips.reduce((sum, t) => sum + (Number(t.toll) || 0), 0);
  const driverCost = filteredTrips.reduce((sum, t) => sum + (Number(t.driver) || 0), 0);
  const otherCost = filteredTrips.reduce(
    (sum, t) => sum + ((Number(t.loading) || 0) + (Number(t.other) || 0)),
    0
  );

  return {
    totalIncome,
    totalExpenses,
    netProfit,
    isProfit: netProfit >= 0,
    totalDistanceKm,
    profitPerKm: totalDistanceKm > 0 ? Math.round(netProfit / totalDistanceKm) : 'N/A',
    tripsCount: filteredTrips.length,
    filteredTrips,
    dieselCost,
    tollCost,
    driverCost,
    otherCost
  };
}

export function syncFreightRecordsToLedger(isAuthorized: boolean): void {
  if (!isAuthorized) return;
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
          date: b.date || getPakistanDateKey(),
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
            date: b.date || getPakistanDateKey(),
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
          date: b.date || getPakistanDateKey(),
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
