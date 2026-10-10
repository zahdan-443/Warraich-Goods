import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDailyDigestSettings,
  saveDailyDigestSettings,
  buildDailyDigestContent,
  dispatchDailyDigestNotification
} from '../utils/dailyDigestNotification';
import { safeStorage } from '../utils/storage';

describe('dailyDigestNotification', () => {
  beforeEach(() => {
    safeStorage.removeItem('ah-daily-digest-settings');
    vi.restoreAllMocks();
  });

  it('should return default settings when nothing is stored', () => {
    const settings = getDailyDigestSettings();
    expect(settings.enabled).toBe(true);
    expect(settings.preferredCityUr).toBe('لاہور');
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
    const content = await buildDailyDigestContent('ur', { ur: 'لاہور', en: 'Lahore' }, 26);
    expect(content.title).toContain('ڈرائیور دوست');
    expect(content.body).toContain('ڈیزل');
    expect(content.body).toContain('پٹرول');
    expect(content.body).toContain('لاہور');
    expect(content.body).toContain('26°C');
  });

  it('should build English daily digest content', async () => {
    const content = await buildDailyDigestContent('en', { ur: 'کراچی', en: 'Karachi' }, 30);
    expect(content.title).toContain('Driver Dost');
    expect(content.body).toContain('Diesel');
    expect(content.body).toContain('Petrol');
    expect(content.body).toContain('Karachi');
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
});
