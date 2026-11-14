/**
 * Centralized Pakistan Fuel Prices Utility (PSO / OGRA Official)
 * Keeps Trip Calculator, Live Fuel Monitor, and Fleet Accounts 100% in sync.
 */

export interface FuelPricesData {
  diesel: string;       // High Speed Diesel (HSD)
  petrol: string;       // Premier Motor Gasoline (PMG)
  hiOctane: string;     // Altron X 97 / Octane Plus
  ldo: string;          // Light Diesel Oil (LDO/LSD)
  kerosene: string;     // Kerosene Oil (SKO)
  effectiveDate: string;// Notification date e.g. "14-November-2026"
  lastUpdated: string;
  source: string;
  isFallback?: boolean;
}

export const CURRENT_OFFICIAL_BENCHMARK: FuelPricesData = {
  diesel: '360.00',
  petrol: '330.00',
  hiOctane: '375.00',
  ldo: '231.72',
  kerosene: '283.64',
  effectiveDate: '14-November-2026',
  lastUpdated: 'Official PSO / OGRA Notification',
  source: 'OGRA / PSO'
};

export const FUEL_CACHE_KEY = 'ah_fuel_prices_cache';
const FUEL_CACHE_VERSION = 2;
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Checks if a fuel rate falls within realistic Pakistan economic bounds (100 - 1000 PKR).
 * Prevents corrupt zero/NaN rates or extreme outliers without breaking when diesel drops below 340 PKR.
 */
export function isSaneFuelPrice(n: number): boolean {
  return typeof n === 'number' && !isNaN(n) && n >= 100 && n <= 1000;
}

function formatPrice(val: unknown): string {
  const num = Number(val);
  if (!isSaneFuelPrice(num)) return '';
  return num.toFixed(2);
}

/**
 * Normalizes ISO date "2026-11-14" or "November 14, 2026" -> "14-November-2026"
 */
export function formatEffectiveDate(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIdx = parseInt(isoMatch[2], 10) - 1;
    const day = isoMatch[3];
    const monthName = MONTH_NAMES[monthIdx];
    if (monthName) {
      return `${day}-${monthName}-${year}`;
    }
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = MONTH_NAMES[parsed.getMonth()];
    const y = parsed.getFullYear();
    if (m) return `${d}-${m}-${y}`;
  }
  return trimmed;
}

function parseSortableDate(raw: unknown): number {
  if (!raw || typeof raw !== 'string') return 0;
  const isoMatch = raw.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
  }
  const d = new Date(raw.trim());
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

interface ParsedProviderResult {
  diesel?: string;
  petrol?: string;
  hiOctane?: string;
  ldo?: string;
  kerosene?: string;
  effectiveDateRaw?: string;
  effectiveDateFormatted?: string;
  effectiveTimeMs: number;
  source: string;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store'
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const contentType = resp.headers?.get?.('content-type') || '';
    if (contentType && !contentType.toLowerCase().includes('json')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }
    return await resp.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export function parseEklitrePayload(data: any): ParsedProviderResult | null {
  const day = data?.day;
  const products = day?.products;
  if (!products || typeof products !== 'object') return null;

  const diesel = formatPrice(products.diesel?.pump_price);
  const petrol = formatPrice(products.petrol?.pump_price);
  const kerosene = formatPrice(products.kerosene?.pump_price);
  const ldo = formatPrice(products.light_diesel?.pump_price);
  const hiOctane = formatPrice(products.hi_octane?.pump_price || products.octane_plus?.pump_price);

  if (!diesel && !petrol) return null;

  const rawDate = String(day?.effective_date || '');
  return {
    diesel: diesel || undefined,
    petrol: petrol || undefined,
    hiOctane: hiOctane || undefined,
    ldo: ldo || undefined,
    kerosene: kerosene || undefined,
    effectiveDateRaw: rawDate,
    effectiveDateFormatted: formatEffectiveDate(rawDate),
    effectiveTimeMs: parseSortableDate(rawDate),
    source: 'OGRA / PSO (eklitre.pk)'
  };
}

export function parseAutoonesPayload(data: any): ParsedProviderResult | null {
  const prices = data?.prices;
  if (!Array.isArray(prices)) return null;

  const findPrice = (slugs: string[]) =>
    prices.find((p: any) => slugs.includes(String(p?.slug || p?.product || '').toLowerCase()));

  const dieselObj = findPrice(['diesel', 'hsd']);
  const petrolObj = findPrice(['petrol', 'pmg']);
  const octaneObj = findPrice(['octane_plus', 'hi_octane', 'hobc']);
  const keroObj = findPrice(['kerosene', 'sko']);
  const ldoObj = findPrice(['ldo', 'lsd', 'light_diesel']);

  const diesel = formatPrice(dieselObj?.price_pkr);
  const petrol = formatPrice(petrolObj?.price_pkr);
  const hiOctane = formatPrice(octaneObj?.price_pkr);
  const kerosene = formatPrice(keroObj?.price_pkr);
  const ldo = formatPrice(ldoObj?.price_pkr);

  if (!diesel && !petrol) return null;

  const rawDate = String(dieselObj?.effective_date || petrolObj?.effective_date || '');
  return {
    diesel: diesel || undefined,
    petrol: petrol || undefined,
    hiOctane: hiOctane || undefined,
    ldo: ldo || undefined,
    kerosene: kerosene || undefined,
    effectiveDateRaw: rawDate,
    effectiveDateFormatted: formatEffectiveDate(rawDate),
    effectiveTimeMs: parseSortableDate(rawDate),
    source: 'OGRA (api2.autoones.com)'
  };
}

function parseGenericOrCustomPayload(data: any, customUrl: string): ParsedProviderResult | null {
  if (!data || typeof data !== 'object') return null;
  if (data.day?.products) return parseEklitrePayload(data);
  if (Array.isArray(data.prices)) return parseAutoonesPayload(data);

  const diesel = formatPrice(data.diesel);
  const petrol = formatPrice(data.petrol);
  const hiOctane = formatPrice(data.hiOctane);
  const ldo = formatPrice(data.ldo);
  const kerosene = formatPrice(data.kerosene);

  if (!diesel && !petrol) return null;
  const rawDate = String(data.effectiveDate || data.effective_date || '');
  return {
    diesel: diesel || undefined,
    petrol: petrol || undefined,
    hiOctane: hiOctane || undefined,
    ldo: ldo || undefined,
    kerosene: kerosene || undefined,
    effectiveDateRaw: rawDate,
    effectiveDateFormatted: formatEffectiveDate(rawDate),
    effectiveTimeMs: parseSortableDate(rawDate),
    source: data.source || customUrl
  };
}

/**
 * Get stored fuel prices from localStorage or fallback to the latest verified benchmark.
 */
export function getStoredFuelPrices(): FuelPricesData {
  if (typeof localStorage === 'undefined') return CURRENT_OFFICIAL_BENCHMARK;

  try {
    const cachedStr = localStorage.getItem(FUEL_CACHE_KEY);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      const dNum = parseFloat(cached.diesel);
      // Invalidate if price is corrupt or outside sane economic bounds
      if (dNum && !isSaneFuelPrice(dNum)) {
        localStorage.removeItem(FUEL_CACHE_KEY);
        return CURRENT_OFFICIAL_BENCHMARK;
      }

      if (cached.diesel && cached.petrol) {
        return {
          diesel: String(cached.diesel),
          petrol: String(cached.petrol),
          hiOctane: cached.hiOctane ? String(cached.hiOctane) : CURRENT_OFFICIAL_BENCHMARK.hiOctane,
          ldo: cached.ldo ? String(cached.ldo) : CURRENT_OFFICIAL_BENCHMARK.ldo,
          kerosene: cached.kerosene ? String(cached.kerosene) : CURRENT_OFFICIAL_BENCHMARK.kerosene,
          effectiveDate: cached.effectiveDate || CURRENT_OFFICIAL_BENCHMARK.effectiveDate,
          lastUpdated: cached.lastUpdated || 'Cached',
          source: cached.source || CURRENT_OFFICIAL_BENCHMARK.source
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached fuel prices:', e);
  }

  return CURRENT_OFFICIAL_BENCHMARK;
}

function isCapacitorNativeRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).Capacitor ||
    window.location?.protocol === 'capacitor:' ||
    /;\s*wv|capacitor/i.test(navigator?.userAgent || '')
  );
}

/**
 * Fetch live prices from verified CORS-enabled Pakistan OGRA/PSO JSON APIs
 * (and optional custom URL / server proxy on web) and update cache & components.
 */
export async function fetchLiveFuelPrices(
  force = false,
  customApiUrl?: string
): Promise<FuelPricesData> {
  if (!force && !customApiUrl) {
    try {
      const cachedStr = localStorage.getItem(FUEL_CACHE_KEY);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        const dNum = parseFloat(cached.diesel);
        const isLegacyCache =
          !cached.cacheVersion ||
          cached.cacheVersion < FUEL_CACHE_VERSION ||
          String(cached.source || '').toLowerCase().includes('trackmate');

        if (
          !isLegacyCache &&
          dNum &&
          isSaneFuelPrice(dNum) &&
          cached.timestamp &&
          Date.now() - cached.timestamp < CACHE_TTL_MS
        ) {
          return getStoredFuelPrices();
        }
      }
    } catch {
      // proceed to live fetch
    }
  }

  try {
    const candidates: ParsedProviderResult[] = [];

    if (customApiUrl && customApiUrl.trim().startsWith('https://')) {
      try {
        const customData = await fetchJsonWithTimeout(customApiUrl.trim(), 8000);
        const parsedCustom = parseGenericOrCustomPayload(customData, customApiUrl.trim());
        if (parsedCustom) candidates.push(parsedCustom);
      } catch (err) {
        console.warn('Custom fuel API fetch error:', err);
      }
    }

    if (candidates.length === 0) {
      const requests: Array<Promise<ParsedProviderResult | null>> = [
        fetchJsonWithTimeout('https://eklitre.pk/v1/latest', 8000)
          .then(parseEklitrePayload)
          .catch(() => null),
        fetchJsonWithTimeout('https://api2.autoones.com/api/fuel-prices', 8000)
          .then(parseAutoonesPayload)
          .catch(() => null)
      ];

      if (!isCapacitorNativeRuntime() && typeof window !== 'undefined' && window.location?.origin?.startsWith('http')) {
        requests.push(
          fetchJsonWithTimeout(`${window.location.origin}/api/fuel-prices`, 6000)
            .then((d) => parseGenericOrCustomPayload(d, 'PSO POL Archives'))
            .catch(() => null)
        );
      }

      const settled = await Promise.all(requests);
      for (const item of settled) {
        if (item) candidates.push(item);
      }
    }

    if (candidates.length === 0) {
      throw new Error('All live fuel price providers unavailable');
    }

    // Sort candidates so the newest effective date comes first, preferring richer 4-product sources on ties
    candidates.sort((a, b) => {
      if (b.effectiveTimeMs !== a.effectiveTimeMs) {
        return b.effectiveTimeMs - a.effectiveTimeMs;
      }
      const score = (x: ParsedProviderResult) =>
        [x.diesel, x.petrol, x.ldo, x.kerosene, x.hiOctane].filter(Boolean).length;
      return score(b) - score(a);
    });

    const primary = candidates[0];
    const secondary = candidates[1];

    const result: FuelPricesData = {
      diesel: primary.diesel || secondary?.diesel || CURRENT_OFFICIAL_BENCHMARK.diesel,
      petrol: primary.petrol || secondary?.petrol || CURRENT_OFFICIAL_BENCHMARK.petrol,
      hiOctane: primary.hiOctane || secondary?.hiOctane || CURRENT_OFFICIAL_BENCHMARK.hiOctane,
      ldo: primary.ldo || secondary?.ldo || CURRENT_OFFICIAL_BENCHMARK.ldo,
      kerosene: primary.kerosene || secondary?.kerosene || CURRENT_OFFICIAL_BENCHMARK.kerosene,
      effectiveDate:
        primary.effectiveDateFormatted ||
        secondary?.effectiveDateFormatted ||
        CURRENT_OFFICIAL_BENCHMARK.effectiveDate,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: primary.source,
      isFallback: false
    };

    try {
      localStorage.setItem(
        FUEL_CACHE_KEY,
        JSON.stringify({
          ...result,
          cacheVersion: FUEL_CACHE_VERSION,
          timestamp: Date.now()
        })
      );
      window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: result }));
    } catch {
      // ignore storage issues
    }

    return result;
  } catch (error) {
    console.warn('Live fuel prices fetch error, using stored/benchmark fallback:', error);
    const fallback: FuelPricesData = {
      ...getStoredFuelPrices(),
      isFallback: true
    };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: fallback }));
    }
    return fallback;
  }
}
