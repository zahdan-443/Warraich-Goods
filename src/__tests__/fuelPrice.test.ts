import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  fetchLiveFuelPrices,
  getStoredFuelPrices,
  FUEL_CACHE_KEY,
  MANUAL_FUEL_OVERRIDE_KEY,
  CURRENT_OFFICIAL_BENCHMARK,
  parseEklitrePayload,
  parseAutoonesPayload,
  formatEffectiveDate,
  setManualFuelPrices,
  getManualFuelOverride,
  clearManualFuelPrices,
  computeFuelStaleness,
  resolveCustomFuelApiUrl,
  DEFAULT_CUSTOM_FUEL_API_URL
} from '../utils/fuelPrice';
import { appCheck, resolveOptionalAppCheckSiteKey } from '../utils/firebase';

describe('Live Pakistan Fuel Prices Multi-Provider Sync', () => {
  const store: Record<string, string> = {};
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
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
      dispatchEvent: vi.fn(),
      location: { origin: 'https://localhost', protocol: 'https:' }
    };
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('formats ISO effective dates to DD-Month-YYYY', () => {
    expect(formatEffectiveDate('2026-11-14')).toBe('14-November-2026');
    expect(formatEffectiveDate('2026-09-04')).toBe('04-September-2026');
  });

  it('parses eklitre.pk and api2.autoones.com JSON payloads accurately', () => {
    const ek = parseEklitrePayload({
      day: {
        effective_date: '2026-11-14',
        products: {
          petrol: { pump_price: 330 },
          diesel: { pump_price: 360 },
          kerosene: { pump_price: 283.64 },
          light_diesel: { pump_price: 231.72 }
        }
      }
    });
    expect(ek).toMatchObject({
      diesel: '360.00',
      petrol: '330.00',
      kerosene: '283.64',
      ldo: '231.72',
      effectiveDateFormatted: '14-November-2026'
    });

    const ao = parseAutoonesPayload({
      prices: [
        { slug: 'petrol', price_pkr: 330, effective_date: '2026-11-14' },
        { slug: 'diesel', price_pkr: 360, effective_date: '2026-11-14' }
      ]
    });
    expect(ao).toMatchObject({
      diesel: '360.00',
      petrol: '330.00',
      effectiveDateFormatted: '14-November-2026'
    });
  });

  it('bypasses stale Nov 4 trackmate cache and updates to live prices from eklitre/autoones', async () => {
    localStorage.setItem(
      FUEL_CACHE_KEY,
      JSON.stringify({
        diesel: '374.31',
        petrol: '349.00',
        effectiveDate: '04-November-2026',
        source: 'fuel.trackmate.page (PSO/OGRA Rates)',
        timestamp: Date.now()
      })
    );

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('eklitre.pk')) {
        return new Response(
          JSON.stringify({
            day: {
              effective_date: '2026-11-14',
              products: {
                petrol: { pump_price: 330.0 },
                diesel: { pump_price: 360.0 },
                kerosene: { pump_price: 283.64 },
                light_diesel: { pump_price: 231.72 }
              }
            }
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      return new Response('Not found', { status: 404 });
    }) as unknown as typeof fetch;

    const live = await fetchLiveFuelPrices(false);
    expect(live.isFallback).toBe(false);
    expect(live.diesel).toBe('360.00');
    expect(live.petrol).toBe('330.00');
    expect(live.ldo).toBe('231.72');
    expect(live.kerosene).toBe('283.64');
    expect(live.effectiveDate).toBe('14-November-2026');

    const persisted = getStoredFuelPrices();
    expect(persisted.effectiveDate).toBe('14-November-2026');
    expect(persisted.diesel).toBe('360.00');
  });

  it('falls back cleanly to api2.autoones.com when eklitre.pk fails or returns HTML', async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('eklitre.pk')) {
        return new Response('<html>Parking</html>', {
          status: 200,
          headers: { 'content-type': 'text/html' }
        });
      }
      if (url.includes('autoones.com')) {
        return new Response(
          JSON.stringify({
            prices: [
              { slug: 'petrol', price_pkr: 330, effective_date: '2026-11-14' },
              { slug: 'diesel', price_pkr: 360, effective_date: '2026-11-14' }
            ]
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      return new Response('Not found', { status: 404 });
    }) as unknown as typeof fetch;

    const live = await fetchLiveFuelPrices(true);
    expect(live.isFallback).toBe(false);
    expect(live.diesel).toBe('360.00');
    expect(live.petrol).toBe('330.00');
    expect(live.effectiveDate).toBe('14-November-2026');
    expect(live.source).toContain('autoones');
  });

  it('returns fallback benchmark with isFallback=true when offline and no cache exists', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('Network error');
    }) as unknown as typeof fetch;

    const result = await fetchLiveFuelPrices(true);
    expect(result.isFallback).toBe(true);
    expect(result.diesel).toBe(CURRENT_OFFICIAL_BENCHMARK.diesel);
    expect(result.effectiveDate).toBe(CURRENT_OFFICIAL_BENCHMARK.effectiveDate);
  });

  it('preserves last-known-good cached fuel prices when network goes offline (#33)', async () => {
    localStorage.setItem(
      FUEL_CACHE_KEY,
      JSON.stringify({
        diesel: '365.50',
        petrol: '334.25',
        effectiveDate: '16-November-2026',
        source: 'OGRA / PSO (eklitre.pk)',
        cacheVersion: 2,
        timestamp: Date.now()
      })
    );
    globalThis.fetch = vi.fn(async () => {
      throw new Error('Offline');
    }) as unknown as typeof fetch;

    const result = await fetchLiveFuelPrices(true);
    expect(result.isFallback).toBe(true);
    expect(result.diesel).toBe('365.50');
    expect(result.petrol).toBe('334.25');
  });

  it('supports manual pump rate overrides and clean reset back to cached/official rates (#33)', () => {
    const manual = setManualFuelPrices({ diesel: 372.5, petrol: 341 });
    expect(manual.isManualOverride).toBe(true);
    expect(manual.diesel).toBe('372.50');
    expect(manual.petrol).toBe('341.00');
    expect(getManualFuelOverride()?.diesel).toBe('372.50');
    expect(getStoredFuelPrices().isManualOverride).toBe(true);
    expect(localStorage.getItem(MANUAL_FUEL_OVERRIDE_KEY)).toBeTruthy();

    expect(() => setManualFuelPrices({ diesel: 10, petrol: 340 })).toThrow();

    const reset = clearManualFuelPrices();
    expect(reset.isManualOverride).toBe(false);
    expect(getManualFuelOverride()).toBeNull();
  });

  it('detects stale fuel prices when age exceeds 7 days (#33)', () => {
    const refDate = new Date('2026-11-25T10:00:00Z');
    const fresh = computeFuelStaleness('22-November-2026', undefined, refDate);
    expect(fresh.isStale).toBe(false);
    expect(fresh.stalenessDays).toBe(3);

    const stale = computeFuelStaleness('10-November-2026', undefined, refDate);
    expect(stale.isStale).toBe(true);
    expect(stale.stalenessDays).toBe(15);
  });

  it('supports custom VITE_FUEL_API_URL provider when passed to fetchLiveFuelPrices (#33)', async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === 'https://custom-fuel.example.com/latest.json') {
        return new Response(
          JSON.stringify({
            diesel: 358.5,
            petrol: 329.0,
            effectiveDate: '2026-11-18',
            source: 'Custom Fleet Feed'
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      return new Response('Not found', { status: 404 });
    }) as unknown as typeof fetch;

    const live = await fetchLiveFuelPrices(true, 'https://custom-fuel.example.com/latest.json');
    expect(live.isFallback).toBe(false);
    expect(live.diesel).toBe('358.50');
    expect(live.petrol).toBe('329.00');
    expect(live.source).toBe('Custom Fleet Feed');
  });

  it('uses built-in fuel sources when VITE_FUEL_API_URL is empty or unset', async () => {
    expect(DEFAULT_CUSTOM_FUEL_API_URL).toBe('');
    expect(resolveCustomFuelApiUrl(undefined)).toBe('');
    expect(resolveCustomFuelApiUrl('')).toBe('');
    expect(resolveCustomFuelApiUrl('   ')).toBe('');
    expect(resolveCustomFuelApiUrl('undefined')).toBe('');

    const fetchedUrls: string[] = [];
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      fetchedUrls.push(url);
      if (url.includes('eklitre.pk')) {
        return new Response(
          JSON.stringify({
            day: {
              effective_date: '2026-11-18',
              products: { petrol: { pump_price: 330 }, diesel: { pump_price: 360 } }
            }
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      return new Response('Not found', { status: 404 });
    }) as unknown as typeof fetch;

    const live = await fetchLiveFuelPrices(true, '   ');
    expect(live.isFallback).toBe(false);
    expect(live.diesel).toBe('360.00');
    expect(fetchedUrls.some((u) => u.includes('eklitre.pk'))).toBe(true);
  });

  it('skips Firebase App Check initialization when VITE_FIREBASE_APPCHECK_SITE_KEY is empty or missing', () => {
    expect(resolveOptionalAppCheckSiteKey(undefined)).toBeNull();
    expect(resolveOptionalAppCheckSiteKey('')).toBeNull();
    expect(resolveOptionalAppCheckSiteKey('   ')).toBeNull();
    expect(resolveOptionalAppCheckSiteKey('undefined')).toBeNull();
    expect(resolveOptionalAppCheckSiteKey('null')).toBeNull();
    expect(appCheck).toBeNull();
  });
});
