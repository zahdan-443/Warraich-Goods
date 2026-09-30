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

/**
 * Get road driving distance using free OpenStreetMap OSRM API with Haversine fallback
 */
export async function fetchOSRMRouteDistance(
  originName: string,
  destName: string
): Promise<number | null> {
  if (!originName || !destName || originName.trim().toLowerCase() === destName.trim().toLowerCase()) return 0;

  const originCity = findPakistanCity(originName);
  const destCity = findPakistanCity(destName);

  if (!originCity || !destCity) return null;

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
          const meters = data.routes[0].distance;
          return Math.round(meters / 1000);
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
