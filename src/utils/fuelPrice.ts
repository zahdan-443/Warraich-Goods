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
  effectiveDate: string;// Notification date e.g. "04-September-2026"
  lastUpdated: string;
  source: string;
}

export const CURRENT_OFFICIAL_BENCHMARK: FuelPricesData = {
  diesel: '374.31',
  petrol: '349.00',
  hiOctane: '375.00',
  ldo: '199.98',
  kerosene: '289.95',
  effectiveDate: '04-September-2026',
  lastUpdated: 'Official PSO / OGRA Notification',
  source: 'OGRA / PSO'
};

export const FUEL_CACHE_KEY = 'ah_fuel_prices_cache';
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Get stored fuel prices from localStorage or fallback to the latest verified benchmark.
 */
export function getStoredFuelPrices(): FuelPricesData {
  if (typeof window === 'undefined') return CURRENT_OFFICIAL_BENCHMARK;

  try {
    const cachedStr = localStorage.getItem(FUEL_CACHE_KEY);
    if (cachedStr) {
      const cached = JSON.parse(cachedStr);
      // If cache has old obsolete rates like 311.47 or 298.50, invalidate it immediately
      const dNum = parseFloat(cached.diesel);
      if (dNum && dNum < 340) {
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
          source: cached.source || 'PSO / OGRA'
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached fuel prices:', e);
  }

  return CURRENT_OFFICIAL_BENCHMARK;
}

/**
 * Fetch live prices from public API and update cache & components.
 */
export async function fetchLiveFuelPrices(force = false): Promise<FuelPricesData> {
  if (!force) {
    try {
      const cachedStr = localStorage.getItem(FUEL_CACHE_KEY);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        const dNum = parseFloat(cached.diesel);
        if (dNum && dNum >= 340 && cached.timestamp && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
          return getStoredFuelPrices();
        }
      }
    } catch {
      // proceed to live fetch
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://fuel.trackmate.page/api/prices', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    let fetchedDiesel = '';
    let fetchedPetrol = '';
    let fetchedOctane = '';
    let fetchedKerosene = '';
    let fetchedLdo = '';
    let effectiveDate = '';

    if (Array.isArray(data.prices)) {
      const hsdObj = data.prices.find((p: any) => p.product === 'hsd' || p.product === 'diesel');
      const petrolObj = data.prices.find((p: any) => p.product === 'petrol');
      const octaneObj = data.prices.find((p: any) => p.product === 'octane_plus' || p.product === 'hi_octane');
      const keroObj = data.prices.find((p: any) => p.product === 'kerosene');
      const lsdObj = data.prices.find((p: any) => p.product === 'lsd' || p.product === 'ldo');

      if (hsdObj?.price_pkr) fetchedDiesel = String(hsdObj.price_pkr);
      if (petrolObj?.price_pkr) fetchedPetrol = String(petrolObj.price_pkr);
      if (octaneObj?.price_pkr) fetchedOctane = String(octaneObj.price_pkr);
      if (keroObj?.price_pkr) fetchedKerosene = String(keroObj.price_pkr);
      if (lsdObj?.price_pkr) fetchedLdo = String(lsdObj.price_pkr);

      if (hsdObj?.effective_date) effectiveDate = String(hsdObj.effective_date);
    }

    const result: FuelPricesData = {
      diesel: fetchedDiesel || CURRENT_OFFICIAL_BENCHMARK.diesel,
      petrol: fetchedPetrol || CURRENT_OFFICIAL_BENCHMARK.petrol,
      hiOctane: fetchedOctane || CURRENT_OFFICIAL_BENCHMARK.hiOctane,
      ldo: fetchedLdo || CURRENT_OFFICIAL_BENCHMARK.ldo,
      kerosene: fetchedKerosene || CURRENT_OFFICIAL_BENCHMARK.kerosene,
      effectiveDate: effectiveDate || CURRENT_OFFICIAL_BENCHMARK.effectiveDate,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Live PSO / OGRA API'
    };

    try {
      localStorage.setItem(FUEL_CACHE_KEY, JSON.stringify({
        ...result,
        timestamp: Date.now()
      }));
      window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: result }));
    } catch {
      // ignore storage issues
    }

    return result;
  } catch (error) {
    console.warn('Live fuel prices fetch error, using latest official benchmark:', error);
    const fallback = CURRENT_OFFICIAL_BENCHMARK;
    try {
      localStorage.setItem(FUEL_CACHE_KEY, JSON.stringify({
        ...fallback,
        timestamp: Date.now()
      }));
      window.dispatchEvent(new CustomEvent('fuelPricesUpdated', { detail: fallback }));
    } catch {
      // ignore
    }
    return fallback;
  }
}
