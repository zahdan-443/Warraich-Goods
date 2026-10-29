import { Language, AppNotification } from '../types';
import { getStoredFuelPrices } from './fuelPrice';
import { fetchActiveHazardReports } from './hazardReports';
import {
  sendSystemNotification,
  requestNotificationPermission,
  isNotificationSupported,
  getNotificationPermission
} from './notifications';
import { getStoredNotifications, saveStoredNotifications, safeStorage } from './storage';

export interface DailyDigestSettings {
  enabled: boolean;
  preferredCityUr: string;
  preferredCityEn: string;
  lastDigestDate: string | null; // e.g. "2026-10-10"
}

const SETTINGS_KEY = 'ah-daily-digest-settings';

const DEFAULT_SETTINGS: DailyDigestSettings = {
  enabled: true,
  preferredCityUr: 'سمندری',
  preferredCityEn: 'Samundri',
  lastDigestDate: null
};

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
      preferredCityUr: parsed.preferredCityUr || 'سمندری',
      preferredCityEn: parsed.preferredCityEn || 'Samundri',
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
 * Generates the text digest for today's fuel prices, weather, and road conditions.
 */
export async function buildDailyDigestContent(
  lang: Language = 'ur',
  cityName?: { ur: string; en: string },
  currentTemp?: string | number
): Promise<{ title: string; body: string; summaryShort: string }> {
  const isUrdu = lang === 'ur';
  const fuel = getStoredFuelPrices();
  
  // Format city name - Default to Samundri
  const city = cityName || { ur: 'سمندری', en: 'Samundri' };
  const targetCity = isUrdu ? city.ur : city.en;

  // Active hazard road reports
  let roadSummaryUr = 'تمام موٹرویز و ہائی ویز پر ٹریفک معمول کے مطابق';
  let roadSummaryEn = 'All Motorways & Highways clear';

  try {
    const reports = await fetchActiveHazardReports();
    if (reports && reports.length > 0) {
      const topHazard = reports[0];
      const hazardCity = topHazard.cityNear || targetCity;
      roadSummaryUr = `${hazardCity} پر ${topHazard.category === 'accident' ? 'حادثہ' : topHazard.category === 'flooding' ? 'پانی/دھند' : topHazard.category === 'closure' ? 'بندش' : 'احتیاط'}`;
      roadSummaryEn = `${hazardCity}: ${topHazard.category}`;
    }
  } catch {
    // offline or database unreachable
  }

  let resolvedTemp = currentTemp;
  if (!resolvedTemp) {
    try {
      const cachedWeatherStr = localStorage.getItem('wg_cached_highway_weather');
      if (cachedWeatherStr) {
        const cached = JSON.parse(cachedWeatherStr);
        if (cached?.data?.['samundri']?.temp) {
          resolvedTemp = cached.data['samundri'].temp;
        }
      }
    } catch {}
  }

  const tempStr = resolvedTemp ? `${resolvedTemp}°C` : 'معتدل';
  const tempStrEn = resolvedTemp ? `${resolvedTemp}°C` : 'Clear';

  const title = isUrdu
    ? '🚛 ڈرائیور دوست: روزانہ فیول، موسم اور روڈ الرٹ'
    : '🚛 Driver Dost: Daily Fuel, Weather & Road Digest';

  const body = isUrdu
    ? `⛽ ڈیزل: Rs. ${fuel.diesel} | پٹرول: Rs. ${fuel.petrol}\n🌤️ ${targetCity}: ${tempStr}\n🛣️ روڈ صورتحال: ${roadSummaryUr}`
    : `⛽ Diesel: Rs. ${fuel.diesel} | Petrol: Rs. ${fuel.petrol}\n🌤️ ${targetCity}: ${tempStrEn}\n🛣️ Road Advisory: ${roadSummaryEn}`;

  const summaryShort = isUrdu
    ? `ڈیزل Rs. ${fuel.diesel} • پٹرول Rs. ${fuel.petrol} • ${targetCity} ${tempStr}`
    : `Diesel Rs. ${fuel.diesel} • Petrol Rs. ${fuel.petrol} • ${targetCity}`;

  return { title, body, summaryShort };
}

/**
 * Resolves current phone location city or falls back to Samundri.
 */
async function resolvePhoneOrFallbackCity(defaultUr = 'سمندری', defaultEn = 'Samundri'): Promise<{ ur: string; en: string }> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return { ur: defaultUr, en: defaultEn };
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ ur: defaultUr, en: defaultEn });
    }, 2500);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        try {
          const { latitude, longitude } = pos.coords;
          // Approximate check for Samundri / Lahore / nearest Pakistani hub
          const dSmd = Math.hypot(latitude - 31.0632, longitude - 72.9602);
          const dLhr = Math.hypot(latitude - 31.5204, longitude - 74.3587);
          const dFsd = Math.hypot(latitude - 31.4504, longitude - 73.1350);
          const dIsb = Math.hypot(latitude - 33.6844, longitude - 73.0479);
          const dKhi = Math.hypot(latitude - 24.8607, longitude - 67.0011);
          const dMul = Math.hypot(latitude - 30.1575, longitude - 71.5249);

          const minD = Math.min(dSmd, dLhr, dFsd, dIsb, dKhi, dMul);
          if (minD === dSmd) resolve({ ur: 'سمندری', en: 'Samundri' });
          else if (minD === dFsd) resolve({ ur: 'فیصل آباد', en: 'Faisalabad' });
          else if (minD === dLhr) resolve({ ur: 'لاہور', en: 'Lahore' });
          else if (minD === dIsb) resolve({ ur: 'اسلام آباد', en: 'Islamabad' });
          else if (minD === dKhi) resolve({ ur: 'کراچی', en: 'Karachi' });
          else if (minD === dMul) resolve({ ur: 'ملتان', en: 'Multan' });
          else resolve({ ur: defaultUr, en: defaultEn });
        } catch {
          resolve({ ur: defaultUr, en: defaultEn });
        }
      },
      () => {
        clearTimeout(timer);
        resolve({ ur: defaultUr, en: defaultEn });
      },
      { timeout: 2500, maximumAge: 600000 }
    );
  });
}

/**
 * Dispatches the daily digest notification.
 * Respects Anti-Spam store policies:
 * - When force=false: only delivers once per calendar day.
 * - When force=true: triggers an immediate sample notification for user testing.
 */
export async function dispatchDailyDigestNotification(
  lang: Language = 'ur',
  force: boolean = false,
  cityContext?: { ur: string; en: string },
  currentTemp?: string | number
): Promise<{ success: boolean; reason?: string }> {
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

  // Resolve City: Context > Phone Geolocation > Default Samundri
  const targetCity = cityContext || await resolvePhoneOrFallbackCity(
    settings.preferredCityUr || 'سمندری',
    settings.preferredCityEn || 'Samundri'
  );

  const { title, body, summaryShort } = await buildDailyDigestContent(
    lang,
    targetCity,
    currentTemp
  );

  // Update last sent date immediately to prevent race conditions on app mount
  if (!force) {
    saveDailyDigestSettings({ lastDigestDate: todayStr });
  }

  // Send native system notification
  const sent = await sendSystemNotification(title, body, {
    tag: 'driver-dost-daily-digest', // Replaces previous day's notification in drawer
    silent: false,
    vibrate: [150, 100, 150]
  });

  // Store in-app notification record so it appears in the bell drawer
  try {
    const existing = getStoredNotifications();
    const newRecord: AppNotification = {
      id: Date.now(),
      title,
      message: summaryShort,
      time: lang === 'ur' ? 'آج کا الرٹ' : 'Today\'s Digest',
      unread: true,
      type: 'fuel'
    };
    saveStoredNotifications([newRecord, ...existing.slice(0, 29)]);
  } catch {
    // local storage error ignored
  }

  // Update last sent date
  saveDailyDigestSettings({ lastDigestDate: todayStr });

  return { success: sent, reason: sent ? 'delivered' : 'delivery_failed' };
}
