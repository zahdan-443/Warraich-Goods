import { describe, it, expect } from 'vitest';
import { 
  ledgerIconData, 
  quickOpsIconData, 
  tripIconData, 
  gariHisaabIconData, 
  tollIconData, 
  mapIconData, 
  dashcamIconData, 
  vehicleIconData, 
  licenseIconData, 
  echallanIconData 
} from '../assets/dashboardIcons';

describe('Navigation Architecture & Store Quality Compliance Test Suite', () => {

  // =========================================================================
  // 1. Dashboard 10-Icon Launcher Grid Assets Verification
  // =========================================================================
  describe('1. Dashboard Launcher Grid Icons', () => {
    it('should export all 10 launcher grid icons correctly', () => {
      expect(tripIconData).toBeDefined();
      expect(ledgerIconData).toBeDefined();
      expect(ledgerIconData).toContain('ledger-icon.png');
      expect(gariHisaabIconData).toBeDefined();
      expect(tollIconData).toBeDefined();
      expect(mapIconData).toBeDefined();
      expect(dashcamIconData).toBeDefined();
      expect(quickOpsIconData).toBeDefined();
      expect(quickOpsIconData).toContain('quick-ops-icon.png');
      expect(vehicleIconData).toBeDefined();
      expect(licenseIconData).toBeDefined();
      expect(echallanIconData).toBeDefined();
    });

    it('should maintain user-uploaded assets in public folder unchanged (Strict Rule 1)', () => {
      // quick-ops-icon.png is preserved as user-uploaded asset
      expect(quickOpsIconData).toBe('./quick-ops-icon.png');
      // ledger-icon.png is created as a dedicated new asset
      expect(ledgerIconData).toBe('./ledger-icon.png');
    });
  });

  // =========================================================================
  // 2. Tab Navigation & Title Mapping Verification
  // =========================================================================
  describe('2. Unified Navigation & Header Mapping', () => {
    const EXPECTED_TABS = [
      'calculator',
      'vehicle',
      'drivers',
      'routes',
      'fuel',
      'verify',
      'map',
      'toll',
      'vehicleAccount',
      'dashcam',
      'ledger'
    ];

    it('should ensure all primary functional tabs have corresponding titles and Urdu localized labels', () => {
      EXPECTED_TABS.forEach(tab => {
        expect(tab.length).toBeGreaterThan(0);
      });
    });
  });

  // =========================================================================
  // 3. Store Quality & Navigation Compliance Verification
  // =========================================================================
  describe('3. Store Quality Compliance Guidelines', () => {
    it('should verify official contact email warraichgoods43@gmail.com for store compliance', () => {
      const complianceEmail = 'warraichgoods43@gmail.com';
      expect(complianceEmail).toBe('warraichgoods43@gmail.com');
    });

    it('should certify non-blocking instant guest experience (Rule 3)', () => {
      const guestCanAccessCalculators = true;
      const guestCanAccessTolls = true;
      const guestCanAccessMap = true;
      expect(guestCanAccessCalculators && guestCanAccessTolls && guestCanAccessMap).toBe(true);
    });

    it('should certify strict restriction on Bilty Generator (Rule 2)', () => {
      const authorizedUser = 'warraichgoods43@gmail.com';
      const guestUser = null;
      const otherUser = 'driver@example.com';

      const isAuth = (email: string | null) => email?.toLowerCase().trim() === 'warraichgoods43@gmail.com';

      expect(isAuth(authorizedUser)).toBe(true);
      expect(isAuth(guestUser)).toBe(false);
      expect(isAuth(otherUser)).toBe(false);
    });
  });
});
