/**
 * Centralized Pakistan Fuel Prices Utility (PSO / OGRA Official)
 * Keeps Trip Calculator, Live Fuel Monitor, and Fleet Accounts 100% in sync.
 * Includes staleness tracking (> 7 days), last-known-good offline preservation,
 * VITE_FUEL_API_URL override support, and manual pump-rate overrides.
 */

import { daysSinceDateKey, getPakistanDateKey } from './dateUtils';

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
  isManualOverride?: boolean;
  isStale?: boolean;
  stalenessDays?: number;
}

export const CURRENT_OFFICIAL_BENCHMARK: FuelPricesData = {
  diesel: '346.00',
  petrol: '313.00',
  hiOctane: '375.00',
  ldo: '220.28',
  kerosene: '273.22',
  effectiveDate: '27-November-2026',
  lastUpdated: 'Official PSO / OGRA Notification',
  source: 'OGRA / PSO'
};

export const FUEL_CACHE_KEY = 'ah_fuel_prices_cache';
export const MANUAL_FUEL_OVERRIDE_KEY = 'ah_fuel_prices_manual_override';
export const STALE_FUEL_THRESHOLD_DAYS = 7;

const FUEL_CACHE_VERSION = 3;
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

export function resolveCustomFuelApiUrl(rawUrl?: unknown): string {
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return '';
  return trimmed;
}

export const DEFAULT_CUSTOM_FUEL_API_URL: string = resolveCustomFuelApiUrl(
  typeof import.meta !== 'undefined' ? import.meta.env?.VITE_FUEL_API_URL : ''
);

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Checks if a fuel rate falls within realistic Pakistan economic bounds (100 - 1000 PKR).
 * Prevents corrupt zero/NaN rates or extreme outliers without breaking when diesel drops below 340 PKR.
 */
export function isSaneFuelPrice(n: number): boolean {
  return typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n) && n >= 100 && n <= 1000;
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
  if (!Number.isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = MONTH_NAMES[parsed.getMonth()];
    const y = parsed.getFullYear();
    if (m) return `${d}-${m}-${y}`;
  }
  return trimmed;
}

function effectiveDateToIsoKey(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const namedMatch = trimmed.match(/^(\d{1,2})-([A-Za-z]+)-(\d{4})$/);
  if (namedMatch) {
    const day = namedMatch[1].padStart(2, '0');
    const monthIdx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === namedMatch[2].toLowerCase());
    if (monthIdx >= 0) {
      return `${namedMatch[3]}-${String(monthIdx + 1).padStart(2, '0')}-${day}`;
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return getPakistanDateKey(parsed);
  }
  return '';
}

function parseSortableDate(raw: unknown): number {
  const isoKey = effectiveDateToIsoKey(raw);
  if (isoKey) {
    const [y, m, d] = isoKey.split('-').map(Number);
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(d)) {
      return Date.UTC(y, m - 1, d);
    }
  }
  return 0;
}

export function computeFuelStaleness(
  effectiveDate?: string,
  cachedTimestamp?: number,
  referenceDate?: Date
): { stalenessDays: number; isStale: boolean } {
  const isoKey = effectiveDateToIsoKey(effectiveDate);
  if (isoKey) {
    const days = daysSinceDateKey(isoKey, referenceDate);
    if (Number.isFinite(days)) {
      return {
        stalenessDays: days,
        isStale: days > STALE_FUEL_THRESHOLD_DAYS
      };
    }
  }
  if (typeof cachedTimestamp === 'number' && Number.isFinite(cachedTimestamp) && cachedTimestamp > 0) {
    const nowMs = referenceDate ? referenceDate.getTime() : Date.now();
    const days = Math.max(0, Math.floor((nowMs - cachedTimestamp) / (24 * 60 * 60 * 1000)));
    return {
      stalenessDays: days,
      isStale: days > STALE_FUEL_THRESHOLD_DAYS
    };
  }
  return { stalenessDays: 0, isStale: false };
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

interface EklitreProductEntry {
  pump_price?: unknown;
}

interface EklitrePayload {
  day?: {
    effective_date?: unknown;
    products?: {
      diesel?: EklitreProductEntry;
      petrol?: EklitreProductEntry;
      kerosene?: EklitreProductEntry;
      light_diesel?: EklitreProductEntry;
      hi_octane?: EklitreProductEntry;
      octane_plus?: EklitreProductEntry;
    };
  };
}

interface AutoonesPriceItem {
  slug?: unknown;
  product?: unknown;
  price_pkr?: unknown;
  effective_date?: unknown;
}

interface AutoonesPayload {
  prices?: AutoonesPriceItem[];
}

interface CachedFuelRecord extends FuelPricesData {
  cacheVersion?: number;
  timestamp?: number;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 8000): Promise<unknown> {
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

export function parseEklitrePayload(data: unknown): ParsedProviderResult | null {
  const payload = data as EklitrePayload | null;
  const day = payload?.day;
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

export function parseAutoonesPayload(data: unknown): ParsedProviderResult | null {
  const payload = data as AutoonesPayload | null;
  const prices = payload?.prices;
  if (!Array.isArray(prices)) return null;

  const findPrice = (slugs: string[]) =>
    prices.find((p) => slugs.includes(String(p?.slug || p?.product || '').toLowerCase()));

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

function parseGenericOrCustomPayload(data: unknown, customUrl: string): ParsedProviderResult | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as Record<string, unknown>;
  if (record.day && typeof record.day === 'object' && (record.day as Record<string, unknown>).products) {
    return parseEklitrePayload(data);
  }
  if (Array.isArray(record.prices)) {
    return parseAutoonesPayload(data);
  }

  const diesel = formatPrice(record.diesel);
  const petrol = formatPrice(record.petrol);
  const hiOctane = formatPrice(record.hiOctane);
  const ldo = formatPrice(record.ldo);
  const kerosene = formatPrice(record.kerosene);

  if (!diesel && !petrol) return null;
  const rawDate = String(record.effectiveDate || record.effective_date || '');
  return {
    diesel: diesel || undefined,
    petrol: petrol || undefined,
    hiOctane: hiOctane || undefined,
    ldo: ldo || undefined,
    kerosene: kerosene || undefined,
    effectiveDateRaw: rawDate,
    effectiveDateFormatted: formatEffectiveDate(rawDate),
    effectiveTimeMs: parseSortableDate(rawDate),
    source: typeof record.source === 'string' && record.source.trim() ? record.source : customUrl
  };
}

export function getManualFuelOverride(): FuelPricesData | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MANUAL_FUEL_OVERRIDE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedFuelRecord>;
    const dieselNum = parseFloat(String(parsed.diesel || ''));
    const petrolNum = parseFloat(String(parsed.petrol || ''));
    if (!isSaneFuelPrice(dieselNum) || !isSaneFuelPrice(petrolNum)) {
      localStorage.removeItem(MANUAL_FUEL_OVERRIDE_KEY);
      return null;
    }
    return {
      diesel: dieselNum.toFixed(2),
      petrol: petrolNum.toFixed(2),
      hiOctane: isSaneFuelPrice(Number(parsed.hiOctane)) ? Number(parsed.hiOctane).toFixed(2) : CURRENT_OFFICIAL_BENCHMARK.hiOctane,
      ldo: isSaneFuelPrice(Number(parsed.ldo)) ? Number(parsed.ldo).toFixed(2) : CURRENT_OFFICIAL_BENCHMARK.ldo,
      kerosene: isSaneFuelPrice(Number(parsed.kerosene)) ? Number(parsed.kerosene).toFixed(2) : CURRENT_OFFICIAL_BENCHMARK.kerosene,
      effectiveDate: parsed.effectiveDate || formatEffectiveDate(getPakistanDateKey()),
      lastUpdated: parsed.lastUpdated || 'Manual Pump Override',
      source: 'Manual Pump Rate Override',
      isFallback: false,
      isManualOverride: true,
      isStale: false,
      stalenessDays: 0
    };
  } catch {
    return null;
  }
}

export function setManualFuelPrices(input: {
  diesel: number | string;
  petrol: number | string;
  hiOctane?: number | string;
  ldo?: number | string;
  kerosene?: number | string;
}): FuelPricesData {
  const dieselNum = typeof input.diesel === 'number' ? input.diesel : parseFloat(String(input.diesel || '').trim());
  const petrolNum = typeof input.petrol === 'number' ? input.petrol : parseFloat(String(input.petrol || '').trim());
  if (!isSaneFuelPrice(dieselNum) || !isSaneFuelPrice(petrolNum)) {
    throw new Error('Fuel prices must be valid PKR rates between 100 and 1000 per liter.');
  }

  const base = getStoredFuelPricesWithoutOverride();
  const hiOctaneNum = input.hiOctane !== undefined ? Number(input.hiOctane) : Number(base.hiOctane);
  const ldoNum = input.ldo !== undefined ? Number(input.ldo) : Number(base.ldo);
  const keroseneNum = input.kerosene !== undefined ? Number(input.kerosene) : Number(base.kerosene);

  const overrideData: FuelPricesData = {
    diesel: dieselNum.toFixed(2),
    petrol: petrolNum.toFixed(2),
    hiOctane: isSaneFuelPrice(hiOctaneNum) ? hiOctaneNum.toFixed(2) : CURRENT_OFFICIAL_BENCHMARK.hiOctane,
    ldo: isSaneFuelPrice(ldoNum) ? ldoNum.toFixed(2) : CURRENT_OFFICIAL_BENCHMARK.ldo,
    kerosene: isSaneFuelPrice(keroseneNum) ? keroseneNum.toFixed(2) : CURRENT_OFFICIAL_BENCHMARK.kerosene,
    effectiveDate: formatEffectiveDate(getPakistanDateKey()),
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'Manual Pump Rate Override',
    isFallback: false,
    isManualOverride: true,
    isStale: false,
    stalenessDays: 0
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(
      MANUAL_FUEL_OVERRIDE_KEY,
      JSON.stringify({
        ...overrideData,
        timestamp: Date.now()
      })
    );
  }
  if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: overrideData }));
  }
  return overrideData;
}

export function clearManualFuelPrices(): FuelPricesData {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(MANUAL_FUEL_OVERRIDE_KEY);
  }
  const current = getStoredFuelPricesWithoutOverride();
  if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: current }));
  }
  return current;
}

function getStoredFuelPricesWithoutOverride(): FuelPricesData {
  if (typeof localStorage === 'undefined') {
    const { stalenessDays, isStale } = computeFuelStaleness(CURRENT_OFFICIAL_BENCHMARK.effectiveDate);
    return { ...CURRENT_OFFICIAL_BENCHMARK, isManualOverride: false, stalenessDays, isStale };
  }

  try {
    const cachedStr = localStorage.getItem(FUEL_CACHE_KEY);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr) as CachedFuelRecord;
      const dNum = parseFloat(cached.diesel);
      // Invalidate if price is corrupt or outside sane economic bounds
      if (dNum && !isSaneFuelPrice(dNum)) {
        localStorage.removeItem(FUEL_CACHE_KEY);
        const { stalenessDays, isStale } = computeFuelStaleness(CURRENT_OFFICIAL_BENCHMARK.effectiveDate);
        return { ...CURRENT_OFFICIAL_BENCHMARK, isManualOverride: false, stalenessDays, isStale };
      }

      if (cached.diesel && cached.petrol) {
        const effDate = cached.effectiveDate || CURRENT_OFFICIAL_BENCHMARK.effectiveDate;
        const { stalenessDays, isStale } = computeFuelStaleness(effDate, cached.timestamp);
        return {
          diesel: String(cached.diesel),
          petrol: String(cached.petrol),
          hiOctane: cached.hiOctane ? String(cached.hiOctane) : CURRENT_OFFICIAL_BENCHMARK.hiOctane,
          ldo: cached.ldo ? String(cached.ldo) : CURRENT_OFFICIAL_BENCHMARK.ldo,
          kerosene: cached.kerosene ? String(cached.kerosene) : CURRENT_OFFICIAL_BENCHMARK.kerosene,
          effectiveDate: effDate,
          lastUpdated: cached.lastUpdated || 'Cached',
          source: cached.source || CURRENT_OFFICIAL_BENCHMARK.source,
          isManualOverride: false,
          stalenessDays,
          isStale
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached fuel prices:', e);
  }

  const { stalenessDays, isStale } = computeFuelStaleness(CURRENT_OFFICIAL_BENCHMARK.effectiveDate);
  return { ...CURRENT_OFFICIAL_BENCHMARK, isManualOverride: false, stalenessDays, isStale };
}

/**
 * Get stored fuel prices (respecting active manual pump override first,
 * otherwise cached last-known-good values or official benchmark with staleness metrics).
 */
export function getStoredFuelPrices(): FuelPricesData {
  const manual = getManualFuelOverride();
  if (manual) return manual;
  return getStoredFuelPricesWithoutOverride();
}

function isCapacitorNativeRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as Window & { Capacitor?: unknown };
  return Boolean(
    win.Capacitor ||
    window.location?.protocol === 'capacitor:' ||
    /;\s*wv|capacitor/i.test(navigator?.userAgent || '')
  );
}

/**
 * Fetch live prices from verified CORS-enabled Pakistan OGRA/PSO JSON APIs
 * (plus optional custom URL / VITE_FUEL_API_URL / server proxy) and update cache & components.
 * Preserves last-known-good cache cleanly if providers fail.
 */
export async function fetchLiveFuelPrices(
  force = false,
  customApiUrl?: string
): Promise<FuelPricesData> {
  const manual = getManualFuelOverride();
  if (manual && !force) {
    return manual;
  }

  const effectiveCustomUrl = (customApiUrl || DEFAULT_CUSTOM_FUEL_API_URL || '').trim();

  if (!force && !effectiveCustomUrl && typeof localStorage !== 'undefined') {
    try {
      const cachedStr = localStorage.getItem(FUEL_CACHE_KEY);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr) as CachedFuelRecord;
        const dNum = parseFloat(cached.diesel);
        const benchmarkTimeMs = parseSortableDate(CURRENT_OFFICIAL_BENCHMARK.effectiveDate);
        const cachedEffectiveTimeMs = parseSortableDate(cached.effectiveDate);
        const isLegacyCache =
          !cached.cacheVersion ||
          cached.cacheVersion < FUEL_CACHE_VERSION ||
          (benchmarkTimeMs > 0 && cachedEffectiveTimeMs > 0 && cachedEffectiveTimeMs < benchmarkTimeMs) ||
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

    if (effectiveCustomUrl.startsWith('https://')) {
      try {
        const customData = await fetchJsonWithTimeout(effectiveCustomUrl, 8000);
        const parsedCustom = parseGenericOrCustomPayload(customData, effectiveCustomUrl);
        if (parsedCustom) candidates.push(parsedCustom);
      } catch (err) {
        console.warn('Custom fuel API fetch error:', err);
      }
    }

    if (candidates.length === 0) {
      const fetchEklitreLatest = async (): Promise<ParsedProviderResult | null> => {
        try {
          const v2Data = await fetchJsonWithTimeout('https://eklitre.pk/v2/latest', 8000);
          const parsedV2 = parseEklitrePayload(v2Data);
          if (parsedV2) return parsedV2;
        } catch {
          // fallback to v1 if v2 fails transiently
        }
        try {
          const v1Data = await fetchJsonWithTimeout('https://eklitre.pk/v1/latest', 8000);
          return parseEklitrePayload(v1Data);
        } catch {
          return null;
        }
      };

      const requests: Array<Promise<ParsedProviderResult | null>> = [
        fetchEklitreLatest(),
        fetchJsonWithTimeout('https://api2.autoones.com/api/fuel-prices', 8000)
          .then(parseAutoonesPayload)
          .catch(() => null)
      ];

      if (
        !isCapacitorNativeRuntime() &&
        typeof window !== 'undefined' &&
        window.location?.origin?.startsWith('http') &&
        !/github\.io$/i.test(window.location.hostname || '')
      ) {
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

    const effectiveDate =
      primary.effectiveDateFormatted ||
      secondary?.effectiveDateFormatted ||
      CURRENT_OFFICIAL_BENCHMARK.effectiveDate;
    const { stalenessDays, isStale } = computeFuelStaleness(effectiveDate, Date.now());

    const result: FuelPricesData = {
      diesel: primary.diesel || secondary?.diesel || CURRENT_OFFICIAL_BENCHMARK.diesel,
      petrol: primary.petrol || secondary?.petrol || CURRENT_OFFICIAL_BENCHMARK.petrol,
      hiOctane: primary.hiOctane || secondary?.hiOctane || CURRENT_OFFICIAL_BENCHMARK.hiOctane,
      ldo: primary.ldo || secondary?.ldo || CURRENT_OFFICIAL_BENCHMARK.ldo,
      kerosene: primary.kerosene || secondary?.kerosene || CURRENT_OFFICIAL_BENCHMARK.kerosene,
      effectiveDate,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: primary.source,
      isFallback: false,
      isManualOverride: false,
      stalenessDays,
      isStale
    };

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          FUEL_CACHE_KEY,
          JSON.stringify({
            ...result,
            cacheVersion: FUEL_CACHE_VERSION,
            timestamp: Date.now()
          })
        );
      }
      if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
        window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: result }));
      }
    } catch {
      // ignore storage issues
    }

    // Keep manual pump override active for display/calculations if user explicitly set one
    if (manual) {
      return manual;
    }

    return result;
  } catch (error) {
    console.warn('Live fuel prices fetch error, using stored/benchmark fallback:', error);
    const stored = getStoredFuelPrices();
    const fallback: FuelPricesData = {
      ...stored,
      isFallback: !stored.isManualOverride
    };
    if (typeof window !== 'undefined' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: fallback }));
    }
    return fallback;
  }
}
