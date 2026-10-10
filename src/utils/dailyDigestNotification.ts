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
  preferredCityUr: 'لاہور',
  preferredCityEn: 'Lahore',
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
      preferredCityUr: parsed.preferredCityUr || 'لاہور',
      preferredCityEn: parsed.preferredCityEn || 'Lahore',
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
  
  // Format city name
  const city = cityName || { ur: 'لاہور', en: 'Lahore' };
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

  const tempStr = currentTemp ? `${currentTemp}°C` : 'معتدل';
  const tempStrEn = currentTemp ? `${currentTemp}°C` : 'Clear';

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

  let perm = getNotificationPermission();
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

  const { title, body, summaryShort } = await buildDailyDigestContent(
    lang,
    cityContext || { ur: settings.preferredCityUr, en: settings.preferredCityEn },
    currentTemp
  );

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
