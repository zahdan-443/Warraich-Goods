import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildUserAiContext, sendAiChatMessage } from '../utils/aiAdvisor';
import * as storage from '../utils/storage';

describe('Driver Dost AI Advisor & Data Isolation Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Strict User Context Isolation: Generates context strictly for active user scope', async () => {
    // Setup Mock Data for User A
    const mockTrips = [
      {
        id: 101,
        name: 'Lahore to Karachi',
        dist: 1250,
        fuelCost: 40000,
        netProfit: 35000,
        date: '2026-09-01'
      }
    ];
    const mockVehicles = [
      {
        id: 201,
        number: 'LES-9900',
        reg: 'LES-9900',
        type: 'Bedford Truck',
        driver: 'Ustad Aslam',
        mileage: 8.5,
        status: 'Active'
      }
    ];

    vi.spyOn(storage, 'getActiveUserScope').mockReturnValue('user_alpha_123');
    vi.spyOn(storage, 'getStoredTrips').mockReturnValue(mockTrips as any);
    vi.spyOn(storage, 'getStoredVehicles').mockReturnValue(mockVehicles as any);
    vi.spyOn(storage, 'getStoredBilties').mockReturnValue([]);
    vi.spyOn(storage, 'getStoredFuelLog').mockReturnValue([{ date: '01/09/2026', diesel: 285, petrol: 275 }] as any);
    vi.spyOn(storage, 'getStoredDrivers').mockReturnValue([]);

    const context = await buildUserAiContext('user_alpha@test.com');

    // Asserts
    expect(context).toContain('user_alpha@test.com');
    expect(context).toContain('Lahore to Karachi');
    expect(context).toContain('LES-9900');
    expect(context).toContain('Diesel: Rs 285/L');

    // Leakage Check: Ensure another user's data (e.g. user_beta) is never mentioned
    expect(context).not.toContain('user_beta');
    expect(context).not.toContain('Rawalpindi');
  });

  it('2. Rate Limit & Exponential Backoff: Handles 429 and returns friendly busy message', async () => {
    let callCount = 0;
    // Mock global fetch to return 429
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'RATE_LIMIT_EXCEEDED' })
      });
    });

    const result = await sendAiChatMessage({
      message: 'Mera trip hisaab btao',
      lang: 'ur',
      maxRetries: 1 // fast test
    });

    expect(callCount).toBe(2); // Initial attempt + 1 retry
    expect(result.isRateLimited).toBe(true);
    expect(result.reply).toContain('AI ابھی تھوڑا مصروف ہے');
  });

  it('3. Bilingual Friendly Response on Rate Limit in English', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: 'RATE_LIMIT_EXCEEDED' })
    });

    const result = await sendAiChatMessage({
      message: 'Calculate fuel',
      lang: 'en',
      maxRetries: 0
    });

    expect(result.isRateLimited).toBe(true);
    expect(result.reply).toBe('AI is currently busy, please try again in a little while.');
  });

  it('4. Successful Chat Response Parsing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ reply: 'محترم ڈرائیور دوست! آپ کے 1 محفوظ ٹرپ میں لاہور تا کراچی کا ڈیزل خرچہ 40,000 روپے ہے۔' })
    });

    const result = await sendAiChatMessage({
      message: 'Mera pichla trip btao',
      lang: 'ur'
    });

    expect(result.reply).toContain('محترم ڈرائیور دوست');
    expect(result.reply).toContain('40,000');
  });
});
