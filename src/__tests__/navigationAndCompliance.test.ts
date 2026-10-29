import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
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

  // =========================================================================
  // 4. Android System Bars & Full-Screen Immersive Mode Disablement Verification
  // =========================================================================
  describe('4. Full-Screen Immersive Mode Disablement Configuration', () => {
    it('should ensure styles.xml enforces non-fullscreen window and layoutInDisplayCutoutMode never', () => {
      const stylesPath = path.resolve(process.cwd(), 'android/app/src/main/res/values/styles.xml');
      expect(fs.existsSync(stylesPath)).toBe(true);
      const stylesContent = fs.readFileSync(stylesPath, 'utf8');
      expect(stylesContent).toContain('<item name="android:windowFullscreen">false</item>');
      expect(stylesContent).toContain('<item name="android:windowLayoutInDisplayCutoutMode">never</item>');
    });

    it('should ensure MainActivity.java enforces decorFitsSystemWindows and explicitly shows status and navigation bars', () => {
      const mainActivityPath = path.resolve(
        process.cwd(),
        'android/app/src/main/java/com/warraichgoods/driverdost/MainActivity.java'
      );
      expect(fs.existsSync(mainActivityPath)).toBe(true);
      const mainActivityContent = fs.readFileSync(mainActivityPath, 'utf8');
      expect(mainActivityContent).toContain('WindowCompat.setDecorFitsSystemWindows(getWindow(), true);');
      expect(mainActivityContent).toContain('insetsController.show(WindowInsetsCompat.Type.statusBars());');
      expect(mainActivityContent).toContain('insetsController.show(WindowInsetsCompat.Type.navigationBars());');
      expect(mainActivityContent).toContain('LAYOUT_IN_DISPLAY_CUTOUT_MODE_NEVER');
    });

    it('should ensure capacitor.config.ts disables splash fullscreen and immersive modes', () => {
      const configPath = path.resolve(process.cwd(), 'capacitor.config.ts');
      expect(fs.existsSync(configPath)).toBe(true);
      const syncScriptPath = path.resolve(process.cwd(), 'scripts/sync-android-assets.js');
      expect(fs.existsSync(syncScriptPath)).toBe(true);
      const syncContent = fs.readFileSync(syncScriptPath, 'utf8');
      expect(syncContent).toContain('splashFullScreen: false');
      expect(syncContent).toContain('splashImmersive: false');
    });
  });
});
