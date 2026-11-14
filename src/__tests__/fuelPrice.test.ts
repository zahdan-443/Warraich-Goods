import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  fetchLiveFuelPrices,
  getStoredFuelPrices,
  FUEL_CACHE_KEY,
  CURRENT_OFFICIAL_BENCHMARK,
  parseEklitrePayload,
  parseAutoonesPayload,
  formatEffectiveDate
} from '../utils/fuelPrice';

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
    } as any;
    (globalThis as any).window = {
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
    }) as any;

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
    }) as any;

    const live = await fetchLiveFuelPrices(true);
    expect(live.isFallback).toBe(false);
    expect(live.diesel).toBe('360.00');
    expect(live.petrol).toBe('330.00');
    expect(live.effectiveDate).toBe('14-November-2026');
    expect(live.source).toContain('autoones');
  });

  it('returns fallback benchmark with isFallback=true when offline', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('Network error');
    }) as any;

    const result = await fetchLiveFuelPrices(true);
    expect(result.isFallback).toBe(true);
    expect(result.diesel).toBe(CURRENT_OFFICIAL_BENCHMARK.diesel);
    expect(result.effectiveDate).toBe(CURRENT_OFFICIAL_BENCHMARK.effectiveDate);
  });
});
