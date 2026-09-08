import { describe, it, expect, vi } from 'vitest';
import { safeStorage, getStoredTrips, getStoredCompanyProfile } from '../utils/storage';
import { getStoredFuelPrices } from '../utils/fuelPrice';
import { getStoredTollRates } from '../utils/tollMatrix';

describe('Error Stability & Corrupted Storage Recovery', () => {
  it('safeStorage handles invalid or corrupted JSON in localStorage gracefully without crashing', () => {
    // Inject corrupt JSON into storage keys
    safeStorage.setItem('ah-trips', 'CORRUPTED_NON_JSON_DATA_{{');
    safeStorage.setItem('ah-company-profile', 'INVALID_JSON');
    safeStorage.setItem('ah_fuel_prices_cache', 'BROKEN_JSON');
    safeStorage.setItem('ah-toll-rates', 'MALFORMED_JSON');

    // Should return fallback defaults instead of throwing uncaught SyntaxError
    expect(getStoredTrips()).toBeDefined();
    expect(Array.isArray(getStoredTrips())).toBe(true);

    expect(getStoredFuelPrices()).toBeDefined();
    expect(getStoredFuelPrices().diesel).toBeDefined();

    return getStoredCompanyProfile().then((profile) => {
      expect(profile).toBeDefined();
      expect(profile.nameEn).toBeDefined();
    });
  });

  it('getStoredTollRates handles corrupted JSON safely', async () => {
    safeStorage.setItem('ah-toll-rates', '{bad_json');
    const rates = await getStoredTollRates();
    expect(rates).toBeDefined();
    expect(rates.motorways).toBeDefined();
  });
});
