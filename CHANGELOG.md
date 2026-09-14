# Changelog

All notable changes to the "Driver Dost" transport & logistics application will be documented in this file.

## [1.0.3] - 2026-09-14
### Added
- **Third-Party Store Compliance**: Tailored release bundle for distribution on Uptodown, Palmstore, and independent Android app repositories alongside Google Web / PWA.
- **Public Privacy Policy Web Page**: Added accessible standalone `/privacy.html` policy document required for third-party Android store listings.
- **R8 / ProGuard Minification & Shrinking**: Enabled `minifyEnabled true` and `shrinkResources true` in `android/app/build.gradle` with custom rules in `proguard-rules.pro` protecting Capacitor plugins, WebView interfaces, Firebase auth/firestore SDK, and PDF/OCR engines.

### Changed
- **Digital Asset Links Standardization**: Retained exclusively the official native application package `com.punjabfreighthub.app` in `assetlinks.json`, eliminating redundant legacy webview/TWA entries.
- **Version Bump**: Incremented Android `versionCode` to `4` and `versionName` to `"1.0.3"`.
- **Permissions Audit**: Verified strictly required permissions (`INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`) for Pakistan motorway toll calculations, GPS live routing, and highway offline-sync.

### Fixed
- Verified error boundary resilience and zero store-specific branding across all calculators, bilty document creation, and vehicle fleet management modules.
