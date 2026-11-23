import { Capacitor } from '@capacitor/core';
import { Language, AppNotification } from '../types';
import { getStoredFuelPrices } from './fuelPrice';
import {
  calculateDistanceKm,
  fetchActiveHazardReports,
  findNearestCity,
  HAZARD_CATEGORIES,
  HazardReport
} from './hazardReports';
import {
  sendSystemNotification,
  requestNotificationPermission,
  isNotificationSupported,
  getNotificationPermission
} from './notifications';
import { PAKISTAN_CITIES_MASTER, MasterCity } from './pakistanCitiesData';
import { getStoredNotifications, saveStoredNotifications, safeStorage } from './storage';

export interface DailyDigestSettings {
  enabled: boolean;
  preferredCityUr: string;
  preferredCityEn: string;
  lastDigestDate: string | null; // e.g. "2026-10-10"
}

export interface ResolvedNotificationLocation {
  source: 'gps' | 'default';
  cityId: string;
  cityUr: string;
  cityEn: string;
  lat: number;
  lng: number;
  highways: string[];
  distanceKm?: number;
  updatedAt?: number;
}

export interface DecodedWeatherStatus {
  temp: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  visibilityKm: number;
  precipitationMm: number;
  weatherCode: number;
  conditionUr: string;
  conditionEn: string;
  iconType: 'sun' | 'cloud' | 'rain' | 'fog' | 'wind';
  safetyLevel: 'safe' | 'caution' | 'alert';
  fogWarning: boolean;
  rainWarning: boolean;
  windWarning: boolean;
  roadStatusUr: string;
  roadStatusEn: string;
}

export const SAMUNDRI_DEFAULT_CITY: ResolvedNotificationLocation = {
  source: 'default',
  cityId: 'samundri',
  cityUr: 'سمندری',
  cityEn: 'Samundri',
  lat: 31.0632,
  lng: 72.9602,
  highways: ['M-4 Interchange', 'Samundri-Gojra Rd', 'Rajana Rd']
};

export const GPS_COORDS_STORAGE_KEY = 'wg_last_gps_coords';
export const NOTIFICATIONS_UPDATED_EVENT = 'wg_notifications_updated';
export const NOTIFICATION_LOCATION_UPDATED_EVENT = 'wg_notification_location_updated';

const SETTINGS_KEY = 'ah-daily-digest-settings';
const LAST_LOCATION_ADVISORY_KEY = 'wg_last_location_advisory';
const NEARBY_HAZARD_RADIUS_KM = 90;
const GPS_CACHE_MAX_AGE_MS = 30 * 60 * 1000;

const DEFAULT_SETTINGS: DailyDigestSettings = {
  enabled: true,
  preferredCityUr: SAMUNDRI_DEFAULT_CITY.cityUr,
  preferredCityEn: SAMUNDRI_DEFAULT_CITY.cityEn,
  lastDigestDate: null
};

function emitNotificationsUpdated(): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
  }
}

function findMasterCityByNameOrId(cityIdOrName?: string): MasterCity | undefined {
  if (!cityIdOrName) return undefined;
  const q = cityIdOrName.trim().toLowerCase();
  return PAKISTAN_CITIES_MASTER.find(
    (c) =>
      c.id.toLowerCase() === q ||
      c.nameEn.toLowerCase() === q ||
      c.nameUr.trim() === cityIdOrName.trim()
  );
}

/**
 * Retrieve user settings for the daily digest notification.
 */
export function getDailyDigestSettings(): DailyDigestSettings {
  try {
    const raw = safeStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled ?? true,
      preferredCityUr: parsed.preferredCityUr || SAMUNDRI_DEFAULT_CITY.cityUr,
      preferredCityEn: parsed.preferredCityEn || SAMUNDRI_DEFAULT_CITY.cityEn,
      lastDigestDate: parsed.lastDigestDate || null
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Persist user settings for the daily digest notification.
 */
export function saveDailyDigestSettings(settings: Partial<DailyDigestSettings>): DailyDigestSettings {
  const current = getDailyDigestSettings();
  const updated: DailyDigestSettings = { ...current, ...settings };
  try {
    safeStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch {
    // storage unavailable
  }
  return updated;
}

/**
 * Resolves a coordinate pair to the nearest Pakistani city/tehsil in PAKISTAN_CITIES_MASTER,
 * falling back to Samundri if registry lookup fails.
 */
export function resolveLocationFromCoords(lat: number, lng: number): ResolvedNotificationLocation {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ...SAMUNDRI_DEFAULT_CITY };
  }

  const nearest = findNearestCity(lat, lng);
  if (!nearest) {
    return { ...SAMUNDRI_DEFAULT_CITY, source: 'gps', lat, lng, updatedAt: Date.now() };
  }

  const matchedMaster = findMasterCityByNameOrId(nearest.nameEn);
  return {
    source: 'gps',
    cityId: matchedMaster?.id || nearest.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    cityUr: matchedMaster?.nameUr || nearest.nameUr,
    cityEn: matchedMaster?.nameEn || nearest.nameEn,
    lat,
    lng,
    highways: matchedMaster?.highways?.length
      ? matchedMaster.highways
      : [...SAMUNDRI_DEFAULT_CITY.highways],
    distanceKm: nearest.distanceKm,
    updatedAt: Date.now()
  };
}

/**
 * Persists fresh mobile GPS coordinates and emits location update event.
 */
export function saveLastGpsLocation(coords: { lat: number; lng: number }): ResolvedNotificationLocation {
  const resolved = resolveLocationFromCoords(coords.lat, coords.lng);
  try {
    safeStorage.setItem(GPS_COORDS_STORAGE_KEY, JSON.stringify(resolved));
  } catch {
    // ignore storage errors
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_LOCATION_UPDATED_EVENT, { detail: resolved }));
  }
  return resolved;
}

export function clearCachedGpsLocation(): void {
  try {
    safeStorage.removeItem(GPS_COORDS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Returns recently cached GPS location if still fresh; otherwise returns null.
 */
export function getCachedGpsLocation(maxAgeMs: number = GPS_CACHE_MAX_AGE_MS): ResolvedNotificationLocation | null {
  try {
    const raw = safeStorage.getItem(GPS_COORDS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ResolvedNotificationLocation>;
    if (
      parsed.source !== 'gps' ||
      !Number.isFinite(parsed.lat) ||
      !Number.isFinite(parsed.lng) ||
      !parsed.cityEn ||
      !parsed.cityUr
    ) {
      return null;
    }
    if (typeof parsed.updatedAt === 'number' && Date.now() - parsed.updatedAt > maxAgeMs) {
      return null;
    }
    const master = findMasterCityByNameOrId(parsed.cityId || parsed.cityEn);
    return {
      source: 'gps',
      cityId: parsed.cityId || master?.id || 'gps-location',
      cityUr: parsed.cityUr,
      cityEn: parsed.cityEn,
      lat: Number(parsed.lat),
      lng: Number(parsed.lng),
      highways: Array.isArray(parsed.highways) && parsed.highways.length
        ? parsed.highways
        : (master?.highways || SAMUNDRI_DEFAULT_CITY.highways),
      distanceKm: parsed.distanceKm,
      updatedAt: parsed.updatedAt
    };
  } catch {
    return null;
  }
}

/**
 * Synchronously reads the active notification location preview (GPS if cached & valid, else Samundri).
 */
export function getActiveNotificationLocationPreview(): ResolvedNotificationLocation {
  const cachedGps = getCachedGpsLocation(24 * 60 * 60 * 1000);
  if (cachedGps) return cachedGps;
  return { ...SAMUNDRI_DEFAULT_CITY };
}

/**
 * Resolves live mobile GPS location when available; defaults cleanly to Samundri whenever
 * mobile GPS/location is denied, unavailable, unsupported, or timed out.
 */
export async function resolveNotificationLocation(
  options: { passiveOnly?: boolean } = {}
): Promise<ResolvedNotificationLocation> {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.geolocation) {
    return { ...SAMUNDRI_DEFAULT_CITY };
  }

  // Check Permissions API when present to prevent unsolicited OS prompts during passive mount
  let permState: PermissionState | 'unknown' = 'unknown';
  try {
    if (navigator.permissions && typeof navigator.permissions.query === 'function') {
      const permStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      permState = permStatus?.state || 'unknown';
    }
  } catch {
    permState = 'unknown';
  }

  if (permState === 'denied') {
    clearCachedGpsLocation();
    return { ...SAMUNDRI_DEFAULT_CITY };
  }

  if (options.passiveOnly && permState === 'prompt') {
    // Do not trigger an unsolicited permission dialog on cold launch; use fresh cached GPS if user opted in earlier, else Samundri
    let gpsOptedIn = false;
    try {
      gpsOptedIn = safeStorage.getItem('wg_gps_weather_enabled') === 'true';
    } catch {
      gpsOptedIn = false;
    }
    if (gpsOptedIn) {
      const cached = getCachedGpsLocation();
      if (cached) return cached;
    }
    return { ...SAMUNDRI_DEFAULT_CITY };
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (loc: ResolvedNotificationLocation) => {
      if (settled) return;
      settled = true;
      resolve(loc);
    };

    const timer = setTimeout(() => {
      const cached = getCachedGpsLocation();
      finish(cached || { ...SAMUNDRI_DEFAULT_CITY });
    }, 3000);

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          try {
            const { latitude, longitude } = pos.coords;
            const resolved = saveLastGpsLocation({ lat: latitude, lng: longitude });
            finish(resolved);
          } catch {
            finish({ ...SAMUNDRI_DEFAULT_CITY });
          }
        },
        (err) => {
          clearTimeout(timer);
          // Code 1 = PERMISSION_DENIED -> strict fallback to Samundri
          if (err && err.code === 1) {
            clearCachedGpsLocation();
            finish({ ...SAMUNDRI_DEFAULT_CITY });
            return;
          }
          const cached = getCachedGpsLocation();
          finish(cached || { ...SAMUNDRI_DEFAULT_CITY });
        },
        { enableHighAccuracy: false, timeout: 2800, maximumAge: 300000 }
      );
    } catch {
      clearTimeout(timer);
      finish({ ...SAMUNDRI_DEFAULT_CITY });
    }
  });
}

/**
 * Decodes Open-Meteo current weather values into localized weather + motorway driving status.
 */
export function decodeWeatherAndMotorway(input: {
  temperature_2m?: number;
  apparent_temperature?: number;
  relative_humidity_2m?: number;
  wind_speed_10m?: number;
  visibility?: number;
  precipitation?: number;
  weather_code?: number;
}): DecodedWeatherStatus {
  const temp = Math.round(input.temperature_2m ?? 26);
  const apparentTemp = Math.round(input.apparent_temperature ?? temp);
  const humidity = Math.round(input.relative_humidity_2m ?? 48);
  const windSpeed = Math.round(input.wind_speed_10m ?? 12);
  const rawVisMeters = input.visibility ?? 10000;
  const visibilityKm = Math.round((rawVisMeters / 1000) * 10) / 10;
  const precipitationMm = Math.round((input.precipitation ?? 0) * 10) / 10;
  const weatherCode = input.weather_code ?? 0;

  let conditionEn = 'Clear & Sunny';
  let conditionUr = 'صاف و خوشگوار';
  let iconType: DecodedWeatherStatus['iconType'] = 'sun';
  let safetyLevel: DecodedWeatherStatus['safetyLevel'] = 'safe';
  let fogWarning = false;
  let rainWarning = false;
  let windWarning = false;
  let roadStatusEn = 'Motorway Clear · Normal Traffic';
  let roadStatusUr = 'موٹروے و ہائی وے صاف · ٹریفک معمول کے مطابق';

  if (weatherCode === 0 || weatherCode === 1) {
    conditionEn = 'Clear & Sunny';
    conditionUr = 'صاف و خوشگوار';
    iconType = 'sun';
  } else if (weatherCode === 2 || weatherCode === 3) {
    conditionEn = 'Partly Cloudy';
    conditionUr = 'جزوی طور پر ابر آلود';
    iconType = 'cloud';
  } else if (weatherCode === 45 || weatherCode === 48 || visibilityKm < 1.2) {
    fogWarning = true;
    iconType = 'fog';
    if (visibilityKm < 0.5) {
      conditionEn = 'Dense Fog';
      conditionUr = 'شدید دھند (کم حدِ نگاہ)';
      safetyLevel = 'alert';
      roadStatusEn = `Dense Fog (Vis ${visibilityKm} km) · Use Fog Lights & Reduce Speed`;
      roadStatusUr = `شدید دھند (حدِ نگاہ ${visibilityKm} کلومیٹر) · فوگ لائٹس آن اور رفتار آہستہ رکھیں`;
    } else {
      conditionEn = 'Smog / Fog';
      conditionUr = 'دھند و اسموگ';
      safetyLevel = 'caution';
      roadStatusEn = `Fog Advisory (Vis ${visibilityKm} km) · Maintain Safe Distance`;
      roadStatusUr = `دھند الرٹ (حدِ نگاہ ${visibilityKm} کلومیٹر) · اگلی گاڑی سے فاصلہ رکھیں`;
    }
  } else if (weatherCode >= 51 && weatherCode <= 67) {
    rainWarning = true;
    iconType = 'rain';
    safetyLevel = 'caution';
    conditionEn = 'Rain Showers';
    conditionUr = 'ہلکی تا درمیانی بارش';
    roadStatusEn = 'Wet Motorway Surface · Risk of Skidding';
    roadStatusUr = 'بارش کے باعث سڑک پر پھسلن، اچانک بریک سے بچیں';
  } else if (weatherCode >= 71 && weatherCode <= 77) {
    iconType = 'cloud';
    safetyLevel = 'alert';
    conditionEn = 'Snow / Frost';
    conditionUr = 'برف باری / شدید سردی';
    roadStatusEn = 'Snow/Ice Alert · Drive Slow with Caution';
    roadStatusUr = 'برف باری الرٹ · انتہائی احتیاط سے ڈرائیونگ کریں';
  } else if (weatherCode >= 80 && weatherCode <= 99) {
    rainWarning = true;
    iconType = 'rain';
    safetyLevel = 'alert';
    conditionEn = 'Heavy Rain / Thunderstorm';
    conditionUr = 'تیز بارش و طوفان';
    roadStatusEn = 'Storm & Waterlogging Risk · Reduce Motorway Speed';
    roadStatusUr = 'طوفانی بارش و پانی جمع ہونے کا خدشہ · رفتار کم رکھیں';
  }

  if (windSpeed > 40) {
    windWarning = true;
    iconType = 'wind';
    if (safetyLevel === 'safe') safetyLevel = 'caution';
    roadStatusEn = fogWarning || rainWarning
      ? `${roadStatusEn} · Strong Crosswinds (${windSpeed} km/h)`
      : `High Crosswinds (${windSpeed} km/h) on Open Highway`;
    roadStatusUr = fogWarning || rainWarning
      ? `${roadStatusUr} · تیز کراس ونڈز (${windSpeed} km/h)`
      : `کھلی موٹروے پر تیز ہوائیں (${windSpeed} km/h) · احتیاط کریں`;
  }

  return {
    temp,
    apparentTemp,
    humidity,
    windSpeed,
    visibilityKm,
    precipitationMm,
    weatherCode,
    conditionUr,
    conditionEn,
    iconType,
    safetyLevel,
    fogWarning,
    rainWarning,
    windWarning,
    roadStatusUr,
    roadStatusEn
  };
}

function readCachedWeatherForLocation(location: ResolvedNotificationLocation): DecodedWeatherStatus | null {
  try {
    const homeCacheRaw = safeStorage.getItem('wg_home_weather_cache');
    if (homeCacheRaw) {
      const parsed = JSON.parse(homeCacheRaw);
      const isFresh = typeof parsed?.timestamp === 'number' && Date.now() - parsed.timestamp < 45 * 60 * 1000;
      const d = parsed?.data;
      if (isFresh && d && (parsed.cityId === location.cityId || d.cityNameEn?.toLowerCase() === location.cityEn.toLowerCase())) {
        return decodeWeatherAndMotorway({
          temperature_2m: d.temp,
          apparent_temperature: d.feelsLike ?? d.temp,
          relative_humidity_2m: d.humidity,
          wind_speed_10m: d.windSpeed,
          visibility: typeof d.visibilityKm === 'number' ? d.visibilityKm * 1000 : 10000,
          weather_code: d.iconType === 'fog' ? 45 : d.iconType === 'rain' ? 61 : d.iconType === 'cloud' ? 2 : 0
        });
      }
    }

    const highwayCacheRaw = safeStorage.getItem('wg_cached_highway_weather');
    if (highwayCacheRaw) {
      const parsed = JSON.parse(highwayCacheRaw);
      const isFresh = typeof parsed?.timestamp === 'number' && Date.now() - parsed.timestamp < 45 * 60 * 1000;
      const cityEntry = parsed?.data?.[location.cityId];
      if (isFresh && cityEntry && typeof cityEntry.temp === 'number') {
        return decodeWeatherAndMotorway({
          temperature_2m: cityEntry.temp,
          apparent_temperature: cityEntry.apparentTemp ?? cityEntry.temp,
          relative_humidity_2m: cityEntry.humidity,
          wind_speed_10m: cityEntry.windSpeed,
          visibility: typeof cityEntry.visibilityKm === 'number' ? cityEntry.visibilityKm * 1000 : 10000,
          precipitation: cityEntry.precipitationMm,
          weather_code: cityEntry.weatherCode ?? 0
        });
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Fetches live weather for coordinates (using cache if fresh, then /api/weather or Open-Meteo).
 */
export async function fetchLiveWeatherForPoint(
  lat: number,
  lng: number,
  cityId?: string
): Promise<DecodedWeatherStatus | null> {
  if (cityId) {
    const cached = readCachedWeatherForLocation({
      ...SAMUNDRI_DEFAULT_CITY,
      cityId,
      cityEn: cityId,
      lat,
      lng
    });
    if (cached) return cached;
  }

  let json: any = null;
  if (!Capacitor.isNativePlatform()) {
    try {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const tid = ctrl ? setTimeout(() => ctrl.abort(), 3500) : null;
      try {
        const resp = await fetch(`/api/weather?latitude=${lat}&longitude=${lng}`, {
          signal: ctrl?.signal
        });
        if (resp.ok) json = await resp.json();
      } finally {
        if (tid) clearTimeout(tid);
      }
    } catch {
      // proxy unavailable, fall through to direct
    }
  }

  if (!json) {
    try {
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const tid = ctrl ? setTimeout(() => ctrl.abort(), 4500) : null;
      try {
        const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility&timezone=Asia%2FKarachi`;
        const resp = await fetch(directUrl, { signal: ctrl?.signal });
        if (resp.ok) json = await resp.json();
      } finally {
        if (tid) clearTimeout(tid);
      }
    } catch {
      return null;
    }
  }

  const current = json?.current;
  if (!current || typeof current.temperature_2m !== 'number') return null;
  return decodeWeatherAndMotorway(current);
}

/**
 * Filters active road/motorway hazard reports near a location (default 90km radius)
 * and sorts nearest-first.
 */
export function findNearestHazardForLocation(
  reports: HazardReport[],
  lat: number,
  lng: number,
  radiusKm: number = NEARBY_HAZARD_RADIUS_KM
): { report: HazardReport; distanceKm: number } | null {
  if (!reports || reports.length === 0) return null;

  let nearest: { report: HazardReport; distanceKm: number } | null = null;
  for (const r of reports) {
    if (!Number.isFinite(r.lat) || !Number.isFinite(r.lng)) continue;
    const dist = calculateDistanceKm(lat, lng, r.lat, r.lng);
    if (dist <= radiusKm && (!nearest || dist < nearest.distanceKm)) {
      nearest = { report: r, distanceKm: dist };
    }
  }
  return nearest;
}

/**
 * Generates localized Urdu and English weather & motorway summaries anchored to resolved location.
 */
export function buildLocationWeatherAndMotorwaySummary(
  location: ResolvedNotificationLocation,
  weather: DecodedWeatherStatus | null,
  reports: HazardReport[]
): {
  corridorEn: string;
  corridorUr: string;
  roadSummaryUr: string;
  roadSummaryEn: string;
  nearestHazard: { report: HazardReport; distanceKm: number } | null;
} {
  const corridorEn = location.highways?.[0] || 'Highway Corridor';
  const corridorUr = corridorEn
    .replace('Interchange', 'انٹرچینج')
    .replace('Rd', 'روڈ');

  const nearestHazard = findNearestHazardForLocation(reports, location.lat, location.lng);

  let roadSummaryUr = `${corridorUr} اور قریبی موٹرویز پر ٹریفک معمول کے مطابق`;
  let roadSummaryEn = `${corridorEn} & nearby motorways clear`;

  if (nearestHazard) {
    const meta = HAZARD_CATEGORIES[nearestHazard.report.category];
    const cityNearMaster = findMasterCityByNameOrId(nearestHazard.report.cityNear);
    const hazardCityEn = nearestHazard.report.cityNear || location.cityEn;
    const hazardCityUr = cityNearMaster?.nameUr || location.cityUr;
    const dist = Math.round(nearestHazard.distanceKm);
    roadSummaryUr = `${corridorUr} الرٹ: ${hazardCityUr} (${dist} کلومیٹر) پر ${meta?.labelUr || 'احتیاط'}`;
    roadSummaryEn = `${corridorEn} Alert: ${meta?.labelEn || 'Hazard'} near ${hazardCityEn} (${dist} km)`;
  } else if (weather && (weather.fogWarning || weather.rainWarning || weather.windWarning || weather.safetyLevel !== 'safe')) {
    roadSummaryUr = `${corridorUr}: ${weather.roadStatusUr}`;
    roadSummaryEn = `${corridorEn}: ${weather.roadStatusEn}`;
  }

  return {
    corridorEn,
    corridorUr,
    roadSummaryUr,
    roadSummaryEn,
    nearestHazard
  };
}

/**
 * Generates the text digest for today's fuel prices, location-aware weather, and motorway conditions.
 */
export async function buildDailyDigestContent(
  lang: Language = 'ur',
  cityName?: { ur: string; en: string },
  currentTemp?: string | number,
  options?: {
    location?: ResolvedNotificationLocation;
    weather?: DecodedWeatherStatus | null;
    skipNetworkWeather?: boolean;
  }
): Promise<{
  title: string;
  body: string;
  summaryShort: string;
  location: ResolvedNotificationLocation;
  weather: DecodedWeatherStatus | null;
}> {
  const isUrdu = lang === 'ur';
  const fuel = getStoredFuelPrices();

  // Resolve location: explicit options.location > cityName context > cached GPS/Samundri default
  let location: ResolvedNotificationLocation = options?.location
    ? options.location
    : cityName
    ? (() => {
        const matched = findMasterCityByNameOrId(cityName.en) || findMasterCityByNameOrId(cityName.ur);
        return matched
          ? {
              source: 'gps' as const,
              cityId: matched.id,
              cityUr: cityName.ur,
              cityEn: cityName.en,
              lat: matched.lat,
              lng: matched.lng,
              highways: matched.highways
            }
          : {
              ...SAMUNDRI_DEFAULT_CITY,
              cityUr: cityName.ur,
              cityEn: cityName.en
            };
      })()
    : getActiveNotificationLocationPreview();

  const targetCityUr = location.cityUr;
  const targetCityEn = location.cityEn;
  const targetCity = isUrdu ? targetCityUr : targetCityEn;

  // Weather: explicit > cached > live Open-Meteo (unless currentTemp explicitly passed without requesting live fetch)
  let weather: DecodedWeatherStatus | null = options?.weather ?? readCachedWeatherForLocation(location);
  if (!weather && currentTemp === undefined && !options?.skipNetworkWeather) {
    weather = await fetchLiveWeatherForPoint(location.lat, location.lng, location.cityId);
  }

  // Active hazard road reports (filtered by proximity to resolved location)
  let reports: HazardReport[] = [];
  try {
    reports = await fetchActiveHazardReports();
  } catch {
    reports = [];
  }

  const { roadSummaryUr, roadSummaryEn } = buildLocationWeatherAndMotorwaySummary(
    location,
    weather,
    reports
  );

  const resolvedTemp = currentTemp !== undefined && currentTemp !== null && currentTemp !== ''
    ? currentTemp
    : weather?.temp;

  const tempStrUr = resolvedTemp !== undefined
    ? `${resolvedTemp}°C${weather ? ` (${weather.conditionUr})` : ''}`
    : (weather ? weather.conditionUr : 'معتدل');
  const tempStrEn = resolvedTemp !== undefined
    ? `${resolvedTemp}°C${weather ? ` (${weather.conditionEn})` : ''}`
    : (weather ? weather.conditionEn : 'Clear');

  const locationTagUr = location.source === 'gps' ? `${targetCityUr} (لائیو لوکیشن)` : targetCityUr;
  const locationTagEn = location.source === 'gps' ? `${targetCityEn} (GPS)` : `${targetCityEn} (Default)`;

  const title = isUrdu
    ? `🚛 ڈرائیور دوست (${targetCityUr}): فیول، موسم و موٹروے الرٹ`
    : `🚛 Driver Dost (${targetCityEn}): Fuel, Weather & Motorway`;

  const body = isUrdu
    ? `⛽ ڈیزل: Rs. ${fuel.diesel} | پٹرول: Rs. ${fuel.petrol}\n🌤️ ${locationTagUr}: ${tempStrUr}\n🛣️ موٹروے/روڈ: ${roadSummaryUr}`
    : `⛽ Diesel: Rs. ${fuel.diesel} | Petrol: Rs. ${fuel.petrol}\n🌤️ ${locationTagEn}: ${tempStrEn}\n🛣️ Motorway: ${roadSummaryEn}`;

  const summaryShort = isUrdu
    ? `${targetCity}: ${tempStrUr} • ${roadSummaryUr} • ڈیزل Rs. ${fuel.diesel}`
    : `${targetCity}: ${tempStrEn} • ${roadSummaryEn} • Diesel Rs. ${fuel.diesel}`;

  return { title, body, summaryShort, location, weather };
}

/**
 * Checks weather severity or nearby motorway hazards (<= 90 km) for the resolved location
 * and dispatches a dedicated localized Urdu/English Weather & Motorway alert when needed.
 */
export async function checkAndDispatchLocationAdvisory(
  lang: Language = 'ur',
  location?: ResolvedNotificationLocation,
  weatherInput?: DecodedWeatherStatus | null,
  reportsInput?: HazardReport[],
  options: { force?: boolean; bypassThrottle?: boolean } = {}
): Promise<{ dispatched: boolean; reason: string; location: ResolvedNotificationLocation }> {
  const resolvedLoc = location || await resolveNotificationLocation({ passiveOnly: !options.force });
  const weather = weatherInput !== undefined
    ? weatherInput
    : (readCachedWeatherForLocation(resolvedLoc) || await fetchLiveWeatherForPoint(resolvedLoc.lat, resolvedLoc.lng, resolvedLoc.cityId));

  let reports = reportsInput;
  if (!reports) {
    try {
      reports = await fetchActiveHazardReports();
    } catch {
      reports = [];
    }
  }

  const { corridorEn, corridorUr, roadSummaryUr, roadSummaryEn, nearestHazard } =
    buildLocationWeatherAndMotorwaySummary(resolvedLoc, weather, reports);

  const hasSevereWeather = Boolean(
    weather && (weather.fogWarning || weather.rainWarning || weather.windWarning || weather.safetyLevel !== 'safe')
  );
  const hasNearbyHazard = Boolean(nearestHazard);

  if (!hasSevereWeather && !hasNearbyHazard && !options.force) {
    return { dispatched: false, reason: 'conditions_normal', location: resolvedLoc };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const conditionKey = hasNearbyHazard
    ? `hazard-${nearestHazard!.report.category}`
    : weather?.fogWarning
    ? 'fog'
    : weather?.rainWarning
    ? 'rain'
    : weather?.windWarning
    ? 'wind'
    : 'status';
  const advisoryKey = `${resolvedLoc.cityId}_${conditionKey}_${todayStr}`;

  if (!options.force) {
    try {
      if (safeStorage.getItem(LAST_LOCATION_ADVISORY_KEY) === advisoryKey) {
        return { dispatched: false, reason: 'already_sent_for_condition', location: resolvedLoc };
      }
    } catch {
      // ignore
    }
  }

  if (!isNotificationSupported()) {
    return { dispatched: false, reason: 'unsupported', location: resolvedLoc };
  }

  const perm = await getNotificationPermission();
  if (perm !== 'granted' && !options.force) {
    return { dispatched: false, reason: 'permission_not_granted', location: resolvedLoc };
  }

  const isUrdu = lang === 'ur';
  const cityLabel = isUrdu ? resolvedLoc.cityUr : resolvedLoc.cityEn;
  const tempBadge = weather ? `${weather.temp}°C` : '';

  const title = isUrdu
    ? (hasSevereWeather || hasNearbyHazard
        ? `⚠️ موسم و موٹروے الرٹ: ${cityLabel} (${corridorUr})`
        : `🛣️ لائیو موسم و موٹروے اسٹیٹس: ${cityLabel}`)
    : (hasSevereWeather || hasNearbyHazard
        ? `⚠️ Weather & Motorway Alert: ${cityLabel} (${corridorEn})`
        : `🛣️ Live Weather & Motorway Status: ${cityLabel}`);

  const message = isUrdu
    ? `${cityLabel}${tempBadge ? ` (${tempBadge} · ${weather?.conditionUr})` : ''} — ${roadSummaryUr}`
    : `${cityLabel}${tempBadge ? ` (${tempBadge} · ${weather?.conditionEn})` : ''} — ${roadSummaryEn}`;

  let sent = false;
  if (perm === 'granted') {
    sent = await sendSystemNotification(title, message, {
      tag: `driver-dost-loc-advisory-${resolvedLoc.cityId}`,
      silent: false,
      bypassThrottle: Boolean(options.bypassThrottle || options.force),
      vibrate: [150, 80, 150]
    });
  }

  if (!options.force) {
    try {
      safeStorage.setItem(LAST_LOCATION_ADVISORY_KEY, advisoryKey);
    } catch {
      // ignore
    }
  }

  try {
    const existing = getStoredNotifications();
    const record: AppNotification = {
      id: Date.now(),
      title,
      message,
      time: isUrdu
        ? (resolvedLoc.source === 'gps' ? `📍 ${resolvedLoc.cityUr} (GPS)` : `📍 ${resolvedLoc.cityUr} (ڈیفالٹ)`)
        : (resolvedLoc.source === 'gps' ? `📍 ${resolvedLoc.cityEn} (GPS)` : `📍 ${resolvedLoc.cityEn} (Default)`),
      unread: true,
      type: 'system'
    };
    saveStoredNotifications([record, ...existing.slice(0, 29)]);
    emitNotificationsUpdated();
  } catch {
    // ignore storage errors
  }

  return {
    dispatched: sent || true,
    reason: sent ? 'delivered' : 'logged_in_app',
    location: resolvedLoc
  };
}

/**
 * Dispatches the daily digest notification using mobile GPS location when available,
 * defaulting to Samundri when location/GPS is unavailable.
 * Respects Anti-Spam store policies:
 * - When force=false: only delivers once per calendar day.
 * - When force=true: triggers an immediate notification for user testing/refresh.
 */
export async function dispatchDailyDigestNotification(
  lang: Language = 'ur',
  force: boolean = false,
  cityContext?: { ur: string; en: string },
  currentTemp?: string | number
): Promise<{ success: boolean; reason?: string; location?: ResolvedNotificationLocation }> {
  const settings = getDailyDigestSettings();

  // If disabled by user preference and not forced test
  if (!settings.enabled && !force) {
    return { success: false, reason: 'disabled_by_user' };
  }

  // Get today's local date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Anti-Spam protection: Check if already sent today
  if (!force && settings.lastDigestDate === todayStr) {
    return { success: false, reason: 'already_sent_today' };
  }

  // Check notification support & permission
  if (!isNotificationSupported()) {
    return { success: false, reason: 'unsupported' };
  }

  let perm = await getNotificationPermission();
  if (perm !== 'granted') {
    if (force) {
      perm = await requestNotificationPermission();
      if (perm !== 'granted') {
        return { success: false, reason: 'permission_denied' };
      }
    } else {
      return { success: false, reason: 'permission_not_granted' };
    }
  }

  // Resolve City: Explicit Context > Live Mobile GPS Location > Samundri Default
  let resolvedLocation: ResolvedNotificationLocation;
  if (cityContext) {
    const matched = findMasterCityByNameOrId(cityContext.en) || findMasterCityByNameOrId(cityContext.ur);
    resolvedLocation = matched
      ? {
          source: 'gps',
          cityId: matched.id,
          cityUr: cityContext.ur,
          cityEn: cityContext.en,
          lat: matched.lat,
          lng: matched.lng,
          highways: matched.highways
        }
      : {
          ...SAMUNDRI_DEFAULT_CITY,
          cityUr: cityContext.ur,
          cityEn: cityContext.en
        };
  } else {
    resolvedLocation = await resolveNotificationLocation({ passiveOnly: !force });
  }

  const { title, body, summaryShort, weather } = await buildDailyDigestContent(
    lang,
    { ur: resolvedLocation.cityUr, en: resolvedLocation.cityEn },
    currentTemp,
    { location: resolvedLocation }
  );

  // Update last sent date immediately to prevent race conditions on app mount
  if (!force) {
    saveDailyDigestSettings({ lastDigestDate: todayStr });
  }

  // Send native system notification
  const sent = await sendSystemNotification(title, body, {
    tag: 'driver-dost-daily-digest',
    silent: false,
    renotify: force,
    bypassThrottle: force,
    vibrate: [150, 100, 150]
  });

  // Store in-app notification record so it appears in the bell drawer immediately
  try {
    const existing = getStoredNotifications();
    const newRecord: AppNotification = {
      id: Date.now(),
      title,
      message: summaryShort,
      time: lang === 'ur'
        ? (resolvedLocation.source === 'gps' ? `📍 ${resolvedLocation.cityUr} · GPS` : `📍 سمندری · ڈیفالٹ`)
        : (resolvedLocation.source === 'gps' ? `📍 ${resolvedLocation.cityEn} · GPS` : `📍 Samundri · Default`),
      unread: true,
      type: 'fuel'
    };
    saveStoredNotifications([newRecord, ...existing.slice(0, 29)]);
    emitNotificationsUpdated();
  } catch {
    // local storage error ignored
  }

  // Also check severe weather / nearby motorway hazards if conditions warrant (non-forced to avoid double test toast)
  if (!force && weather) {
    await checkAndDispatchLocationAdvisory(lang, resolvedLocation, weather, undefined, { force: false }).catch(() => {});
  }

  saveDailyDigestSettings({ lastDigestDate: todayStr });

  return { success: sent, reason: sent ? 'delivered' : 'delivery_failed', location: resolvedLocation };
}
