import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SAMUNDRI_DEFAULT_CITY,
  getDailyDigestSettings,
  saveDailyDigestSettings,
  buildDailyDigestContent,
  dispatchDailyDigestNotification,
  resolveLocationFromCoords,
  resolveNotificationLocation,
  decodeWeatherAndMotorway,
  buildLocationWeatherAndMotorwaySummary,
  checkAndDispatchLocationAdvisory,
  clearCachedGpsLocation
} from '../utils/dailyDigestNotification';
import * as hazardReportsModule from '../utils/hazardReports';
import * as notificationsModule from '../utils/notifications';
import { safeStorage } from '../utils/storage';

describe('dailyDigestNotification', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    safeStorage.removeItem('ah-daily-digest-settings');
    safeStorage.removeItem('wg_last_location_advisory');
    clearCachedGpsLocation();
    vi.restoreAllMocks();
  });

  it('should return default settings when nothing is stored', () => {
    const settings = getDailyDigestSettings();
    expect(settings.enabled).toBe(true);
    expect(settings.preferredCityUr).toBe('سمندری');
    expect(settings.preferredCityEn).toBe('Samundri');
    expect(settings.lastDigestDate).toBeNull();
  });

  it('should update and persist settings', () => {
    const updated = saveDailyDigestSettings({
      enabled: false,
      preferredCityUr: 'فیصل آباد'
    });
    expect(updated.enabled).toBe(false);
    expect(updated.preferredCityUr).toBe('فیصل آباد');

    const retrieved = getDailyDigestSettings();
    expect(retrieved.enabled).toBe(false);
    expect(retrieved.preferredCityUr).toBe('فیصل آباد');
  });

  it('should build Urdu daily digest content containing fuel prices and road condition', async () => {
    vi.spyOn(hazardReportsModule, 'fetchActiveHazardReports').mockResolvedValue([]);
    const content = await buildDailyDigestContent('ur', { ur: 'لاہور', en: 'Lahore' }, 26, {
      skipNetworkWeather: true
    });
    expect(content.title).toContain('ڈرائیور دوست');
    expect(content.body).toContain('ڈیزل');
    expect(content.body).toContain('پٹرول');
    expect(content.body).toContain('لاہور');
    expect(content.body).toContain('26°C');
    expect(content.body).not.toMatch(/بلٹی|bilty/i);
  });

  it('should build English daily digest content', async () => {
    vi.spyOn(hazardReportsModule, 'fetchActiveHazardReports').mockResolvedValue([]);
    const content = await buildDailyDigestContent('en', { ur: 'کراچی', en: 'Karachi' }, 30, {
      skipNetworkWeather: true
    });
    expect(content.title).toContain('Driver Dost');
    expect(content.body).toContain('Diesel');
    expect(content.body).toContain('Petrol');
    expect(content.body).toContain('Karachi');
    expect(content.body).toContain('30°C');
    expect(content.body).not.toMatch(/بلٹی|bilty/i);
  });

  it('should respect anti-spam and not re-dispatch on the same day when force is false', async () => {
    const todayStr = new Date().toISOString().split('T')[0];
    saveDailyDigestSettings({ lastDigestDate: todayStr, enabled: true });

    const result = await dispatchDailyDigestNotification('ur', false);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('already_sent_today');
  });

  it('should respect user disable preference', async () => {
    saveDailyDigestSettings({ enabled: false, lastDigestDate: null });

    const result = await dispatchDailyDigestNotification('ur', false);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('disabled_by_user');
  });

  it('should resolve GPS coordinates across Pakistan cities and highways', () => {
    const lahore = resolveLocationFromCoords(31.5204, 74.3587);
    expect(lahore.cityEn).toBe('Lahore');
    expect(lahore.cityUr).toBe('لاہور');
    expect(lahore.highways).toContain('M-2');

    const okara = resolveLocationFromCoords(30.809, 73.446);
    expect(okara.cityEn).toBe('Okara');
    expect(okara.cityUr).toBe('اوکاڑہ');
    expect(okara.highways[0]).toContain('N-5');
  });

  it('should resolve live mobile GPS location when available and fall back to Samundri when denied or unavailable', async () => {
    vi.stubGlobal('window', { dispatchEvent: vi.fn() });

    // 1. Live GPS available (Multan)
    const getCurrentPosition = vi.fn((success) => {
      success({ coords: { latitude: 30.1575, longitude: 71.5249 } });
    });
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition },
      permissions: undefined
    });

    const gpsLoc = await resolveNotificationLocation({ passiveOnly: false });
    expect(gpsLoc.source).toBe('gps');
    expect(gpsLoc.cityEn).toBe('Multan');
    expect(gpsLoc.cityUr).toBe('ملتان');
    expect(gpsLoc.highways).toContain('M-4');

    // 2. GPS Permission denied -> default Samundri
    const deniedPosition = vi.fn((_success, error) => {
      error({ code: 1, message: 'User denied Geolocation' });
    });
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: deniedPosition },
      permissions: undefined
    });

    const fallbackLoc = await resolveNotificationLocation({ passiveOnly: false });
    expect(fallbackLoc.source).toBe('default');
    expect(fallbackLoc.cityEn).toBe(SAMUNDRI_DEFAULT_CITY.cityEn);
    expect(fallbackLoc.cityUr).toBe(SAMUNDRI_DEFAULT_CITY.cityUr);
    expect(fallbackLoc.highways).toContain('M-4 Interchange');

    // 3. Geolocation unsupported -> default Samundri
    vi.stubGlobal('navigator', {
      geolocation: undefined,
      permissions: undefined
    });
    const unsupportedLoc = await resolveNotificationLocation({ passiveOnly: false });
    expect(unsupportedLoc.source).toBe('default');
    expect(unsupportedLoc.cityEn).toBe('Samundri');
    expect(unsupportedLoc.cityUr).toBe('سمندری');
  });

  it('should filter motorway hazards by proximity (ignoring distant cities and highlighting nearby hazards)', () => {
    const karachiHazard = {
      id: 'hz-khi',
      category: 'closure' as const,
      lat: 24.8607,
      lng: 67.0011,
      cityNear: 'Karachi',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
      reporterUid: 'u1'
    };

    const faisalabadHazard = {
      id: 'hz-fsd',
      category: 'accident' as const,
      lat: 31.4504,
      lng: 73.135,
      cityNear: 'Faisalabad',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
      reporterUid: 'u2'
    };

    // Samundri user should ignore Karachi (~880 km away)
    const distantOnly = buildLocationWeatherAndMotorwaySummary(
      SAMUNDRI_DEFAULT_CITY,
      decodeWeatherAndMotorway({ temperature_2m: 28, weather_code: 0, visibility: 10000 }),
      [karachiHazard]
    );
    expect(distantOnly.nearestHazard).toBeNull();
    expect(distantOnly.roadSummaryEn).toContain('M-4 Interchange');
    expect(distantOnly.roadSummaryEn).toContain('clear');

    // Samundri user should detect Faisalabad (~46 km away)
    const withNearby = buildLocationWeatherAndMotorwaySummary(
      SAMUNDRI_DEFAULT_CITY,
      decodeWeatherAndMotorway({ temperature_2m: 28, weather_code: 0, visibility: 10000 }),
      [karachiHazard, faisalabadHazard]
    );
    expect(withNearby.nearestHazard).not.toBeNull();
    expect(withNearby.roadSummaryEn).toContain('Faisalabad');
    expect(withNearby.roadSummaryUr).toContain('فیصل آباد');
  });

  it('should decode dense fog and thunderstorm into bilingual weather & motorway alerts', async () => {
    const fogWeather = decodeWeatherAndMotorway({
      temperature_2m: 9,
      weather_code: 45,
      visibility: 300,
      wind_speed_10m: 8
    });
    expect(fogWeather.fogWarning).toBe(true);
    expect(fogWeather.safetyLevel).toBe('alert');
    expect(fogWeather.roadStatusEn).toContain('Fog Lights');
    expect(fogWeather.roadStatusUr).toContain('فوگ لائٹس');

    vi.spyOn(notificationsModule, 'isNotificationSupported').mockReturnValue(true);
    vi.spyOn(notificationsModule, 'getNotificationPermission').mockResolvedValue('granted');
    const sendSpy = vi.spyOn(notificationsModule, 'sendSystemNotification').mockResolvedValue(true);

    const urResult = await checkAndDispatchLocationAdvisory('ur', SAMUNDRI_DEFAULT_CITY, fogWeather, [], {
      force: true
    });
    expect(urResult.dispatched).toBe(true);
    expect(sendSpy).toHaveBeenCalledWith(
      expect.stringContaining('سمندری'),
      expect.stringContaining('شدید دھند'),
      expect.any(Object)
    );

    const enResult = await checkAndDispatchLocationAdvisory(
      'en',
      resolveLocationFromCoords(31.5204, 74.3587),
      fogWeather,
      [],
      { force: true }
    );
    expect(enResult.dispatched).toBe(true);
    expect(sendSpy).toHaveBeenLastCalledWith(
      expect.stringContaining('Lahore'),
      expect.stringContaining('Dense Fog'),
      expect.any(Object)
    );
  });
});
