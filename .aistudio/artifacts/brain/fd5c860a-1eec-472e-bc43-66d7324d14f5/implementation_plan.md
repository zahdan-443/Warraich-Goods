# System Refinements, UI/UX Simplification & Store Reliability — Implementation Plan

## Completed Tasks
- [x] Android SDK 36 (`compileSdk 36`, `targetSdk 36`, NDK 27.2.12479018, AGP 8.7.2).
- [x] Fullscreen status bar & navigation bar visibility fixed for Android and Web (`fitsSystemWindows: true`).
- [x] Streamlined 3-option theme selector: Phone Default (System), Light Theme, Dark Theme.
- [x] Weather page route corridor filtering (only stops strictly situated on selected route sequence).
- [x] Shortcut sub-tab bar removed from 3 government verification pages (direct portal launcher).
- [x] Default weather notification location set to Samundri (`31.0637, 72.9544`).
- [x] Weather CORS fetch error resolved via server-side proxy route `/api/weather` and cache headers removal.
- [x] **Theme Color Correction (from 3 User Screenshots)**:
  - Fixed white-on-white text in `VehicleAccountView` Section 1 ("حاصل شدہ آمدن و کرایہ جات").
  - Fixed dark text on dark buttons in `ViewHeader` back button and language toggle.
  - Fixed unreadable pale mint `RouteWeatherAdvisoryBanner` in dark mode with high-contrast surfaces and text.
  - Fixed From & To city search dropdowns (`Samundri`, `Karachi`) dark text on dark container.
  - Fixed weather station card metric pills (Visibility, Wind, Humidity) contrast in dark mode.
  - Fixed Owner Command Center card in `HomeView` with dark metallic gold gradients, high-contrast badges, and readable KPI pills.
- [x] **Toll Plaza Page Optimization**:
  - Removed top header card (`روٹ و کوریڈور ٹول ٹیکس کیلکولیٹر / 2026 NHA / پاکستان کی تمام موٹرویز`).
  - Merged sync rates button into primary calculator row alongside swap button, maximizing screen space and bringing rates into view immediately.
- [x] **Automated Offline-to-Cloud Sync Engine**:
  - Implemented `autoReconcileAllLocalToCloud` with bidirectional merging of bilties, trips, vehicles, drivers, fuel logs, and khata/cashbook.
  - Automatically migrates offline guest data upon user login.
  - Auto-triggers reconciliation on app launch, network connection (`online` event), and login, ensuring no device-created data is lost.
- [x] Verification: All 121 unit/integration tests passing; TypeScript and Vite build compile cleanly.
