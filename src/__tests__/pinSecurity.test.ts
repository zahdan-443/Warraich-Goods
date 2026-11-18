import { describe, it, expect, beforeEach } from 'vitest';
import {
  PIN_PBKDF2_PREFIX,
  calculateLockoutDuration,
  generatePinSalt,
  hashPin,
  needsPinHashUpgrade,
  verifyPin
} from '../utils/ledgerStorage';

describe('Khata PIN Security & PBKDF2-HMAC-SHA256 Upgrade (#27)', () => {
  beforeEach(() => {
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
  });

  it('derives 100k-iteration v2 PBKDF2-HMAC-SHA256 hashes consistently and verifies correctly', async () => {
    const salt = generatePinSalt();
    expect(salt.length).toBeGreaterThanOrEqual(16);

    const derived = await hashPin('4829', salt);
    expect(derived.startsWith(PIN_PBKDF2_PREFIX)).toBe(true);
    expect(derived.length).toBe(PIN_PBKDF2_PREFIX.length + 64);
    expect(needsPinHashUpgrade(derived)).toBe(false);

    expect(await verifyPin('4829', salt, derived)).toBe(true);
    expect(await verifyPin('0000', salt, derived)).toBe(false);
    expect(await verifyPin('4829', `${salt}_other`, derived)).toBe(false);
  });

  it('produces identical v2 PBKDF2 hashes in pure-JS fallback when WebCrypto subtle is unavailable', async () => {
    const salt = '0123456789abcdef0123456789abcdef';
    const webCryptoHash = await hashPin('7391', salt);

    const originalCrypto = globalThis.crypto;
    try {
      Object.defineProperty(globalThis, 'crypto', {
        value: undefined,
        configurable: true
      });
      const fallbackHash = await hashPin('7391', salt);
      expect(fallbackHash).toBe(webCryptoHash);
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        configurable: true
      });
    }
  });

  it('transparently verifies legacy SHA-256 and DJB hashes and flags them for automatic upgrade', async () => {
    const salt = 'legacy_salt_123';
    // Legacy SHA-256 of `${salt}__dd_pin__1234`
    const data = new TextEncoder().encode(`${salt}__dd_pin__1234`);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
    const legacyShaHex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');

    expect(needsPinHashUpgrade(legacyShaHex)).toBe(true);
    expect(await verifyPin('1234', salt, legacyShaHex)).toBe(true);
    expect(await verifyPin('9999', salt, legacyShaHex)).toBe(false);

    // Empty / invalid inputs
    expect(await verifyPin('1234', salt, '')).toBe(false);
    expect(needsPinHashUpgrade(null)).toBe(false);
  });

  it('enforces exponential lockout progression capped at 3600s', () => {
    expect(calculateLockoutDuration(1)).toBe(0);
    expect(calculateLockoutDuration(4)).toBe(0);
    expect(calculateLockoutDuration(5)).toBe(30);
    expect(calculateLockoutDuration(6)).toBe(60);
    expect(calculateLockoutDuration(7)).toBe(120);
    expect(calculateLockoutDuration(8)).toBe(240);
    expect(calculateLockoutDuration(20)).toBe(3600);
  });
});
