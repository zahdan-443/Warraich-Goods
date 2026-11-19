// OpenStreetMap / OSRM Free Route Distance Calculator for Pakistan Cities & Tehsils
import { PAKISTAN_CITIES_MASTER, MasterCity } from './pakistanCitiesData';

export interface CityCoords {
  id?: string;
  nameUr: string;
  nameEn: string;
  province?: string;
  district?: string;
  isTehsil?: boolean;
  lat: number;
  lng: number;
}

// Full comprehensive list of Pakistan's major cities and tehsils
// Note: nameUr is pure Urdu text without repeated English in parentheses
export const PAKISTAN_CITIES: CityCoords[] = PAKISTAN_CITIES_MASTER.map((m: MasterCity) => ({
  id: m.id,
  nameUr: m.nameUr,
  nameEn: m.nameEn,
  province: m.provinceEn,
  district: m.districtEn,
  isTehsil: m.isTehsil,
  lat: m.lat,
  lng: m.lng,
}));

// Fallback Haversine formula distance calculation
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  // Multiply by road routing factor (typically ~1.25x in Pakistan highway routes)
  return Math.round(straightKm * 1.25);
}

// Flexible city finder supporting pure English name, pure Urdu name, or legacy combined string
export function findPakistanCity(query: string): CityCoords | undefined {
  if (!query) return undefined;
  const qClean = query.trim().toLowerCase();
  return PAKISTAN_CITIES.find(
    (c) =>
      c.nameEn.toLowerCase() === qClean ||
      c.nameUr === query.trim() ||
      (c.id && c.id.toLowerCase() === qClean) ||
      qClean.includes(c.nameEn.toLowerCase()) ||
      query.includes(c.nameUr)
  );
}

const OSRM_DIST_CACHE_KEY = 'wg_osrm_distance_cache_v1';
const OSRM_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const OSRM_MAX_CACHED_PAIRS = 250;

interface CachedRouteDistEntry {
  km: number;
  ts: number;
}

function getRouteCacheKey(c1: CityCoords, c2: CityCoords): string {
  const k1 = (c1.id || c1.nameEn).toLowerCase().trim();
  const k2 = (c2.id || c2.nameEn).toLowerCase().trim();
  return k1 < k2 ? `${k1}__${k2}` : `${k2}__${k1}`;
}

function readCachedRouteDistance(key: string): number | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(OSRM_DIST_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, CachedRouteDistEntry>;
    const hit = parsed[key];
    if (hit && typeof hit.km === 'number' && Number.isFinite(hit.km) && Date.now() - hit.ts < OSRM_CACHE_TTL_MS) {
      return hit.km;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

function writeCachedRouteDistance(key: string, km: number): void {
  try {
    if (typeof localStorage === 'undefined' || !Number.isFinite(km) || km <= 0) return;
    const raw = localStorage.getItem(OSRM_DIST_CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, CachedRouteDistEntry>) : {};
    const now = Date.now();
    parsed[key] = { km, ts: now };

    const entries = Object.entries(parsed).filter(([, v]) => v && now - v.ts < OSRM_CACHE_TTL_MS);
    if (entries.length > OSRM_MAX_CACHED_PAIRS) {
      entries.sort((a, b) => b[1].ts - a[1].ts);
      entries.length = OSRM_MAX_CACHED_PAIRS;
    }
    localStorage.setItem(OSRM_DIST_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Get road driving distance using free OpenStreetMap OSRM API with 30-day local cache & Haversine fallback
 */
export async function fetchOSRMRouteDistance(
  originName: string,
  destName: string
): Promise<number | null> {
  if (!originName || !destName || originName.trim().toLowerCase() === destName.trim().toLowerCase()) return 0;

  const originCity = findPakistanCity(originName);
  const destCity = findPakistanCity(destName);

  if (!originCity || !destCity) return null;

  const pairKey = getRouteCacheKey(originCity, destCity);
  const cachedKm = readCachedRouteDistance(pairKey);
  if (cachedKm !== null) {
    return cachedKm;
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCity.lng},${originCity.lat};${destCity.lng},${destCity.lat}?overview=false`;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 4000) : null;
    try {
      const res = await fetch(url, { signal: controller ? controller.signal : undefined });
      if (timeoutId) clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.routes && data.routes.length > 0 && data.routes[0].distance) {
          const km = Math.round(data.routes[0].distance / 1000);
          writeCachedRouteDistance(pairKey, km);
          return km;
        }
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  } catch (e) {
    console.warn('OSRM API fetch error or timeout, falling back to Haversine road estimation:', e);
  }

  // Fallback to Haversine road estimation
  return calculateHaversineDistanceKm(originCity.lat, originCity.lng, destCity.lat, destCity.lng);
}
