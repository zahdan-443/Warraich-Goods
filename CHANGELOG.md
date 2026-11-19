# Changelog

All notable changes to the "Driver Dost" transport & logistics application will be documented in this file.

## [1.3.1] - 2026-11-19
### Security & Reliability
- **Sync & Restore Hardening**: Switched cloud conflict resolution to strict mutation-only timestamps (`updatedAt`/`deletedAt`/`createdAt`) so future business dates never resurrect deleted items, bounded local deletion tombstones (`500` per collection), enforced offline-queue tombstone filtering, added delta checksum caching on public verification syncs, chunked large Firestore batch commits (`<= 450` writes/batch), added single-flight locking + remote sync kill-switch support, and upgraded backup restore with pre-restore Undo snapshots and explicit Merge vs Snapshot Replace modes.
- **Guest Mode & Document Sequence Integrity**: Added a non-blocking prompt on sign-in before importing existing guest-mode device records (`Merge`, `Keep Separate`, or `Discard`), and hardened sequential document numbering against cross-device collisions.
- **Account Deletion Reliability & Spark Queue**: Fixed offline deletion requests silently reporting success on failure, propagated partial cloud cleanup failures accurately, unified Samundri Head Office disclosures, and added an owner-only 30-day account deletion cleanup queue.
- **Financial Input Hardening**: Replaced silent fallback defaults with strict validation on trip calculations, routes, invoices, expenses, salaries, and receiving-point ledgers.
- **Android API 36, Dashcam & Native Exports**: Upgraded Android `compileSdk`/`targetSdk` to API 36 (AGP `8.9.1`) and `androidx.credentials` to `1.3.0`, added soft-keyboard IME insets in `MainActivity`, confined dashcam file operations and `FileProvider` cache sharing to `dashcam/` and `exports/`, deferred WakeLock until active recording after free-space (`>= 200MB`) verification, consolidated due/expiry notifications, and routed PDF downloads through native share/export.
- **PWA, Map Caching, Hazard Privacy & Server Hardening**: Automated build-time Service Worker cache versioning, isolated standalone legal HTML pages from SPA shell cache, added 30-day persistent OSRM distance caching, bounded hazard queries with 3-decimal (~110m) coordinate precision, added CSP in `index.html`, and bounded CORS + rate limiting + LRU weather caching in `server.ts`.

## [1.3.0] - 2026-11-15
### Added
- **Khata Expansion (5 Business Modules)**:
  - **Bills & Invoices**: Auto bill numbering, multi-line items, discounts, advances, balance/status tracking (`unpaid`/`partial`/`paid`), local jsPDF export, WhatsApp share, direct `"Receive Payment"` posting into Party Ledger, and authorised freight document import for authorised accounts.
  - **Employees & Salary Ledger**: Master records for drivers/munshis/helpers (no government ID collection), monthly/per-trip rates, salary/advance/bonus/deduction/allowance ledger, running balance, and local PDF statements.
  - **Receiving Points**: Depot/adda profiles and pending balance ledger with local PDF statements and optional link inside freight forms.
  - **Daily Expenses**: Quick-add 7 expense categories with optional vehicle tagging, daily/weekly/monthly totals, and 1:1 Cashbook synchronization without double counting.
  - **Reports Hub**: Date-range presets (`Today`, `Week`, `Month`, `Custom`) across 8 analytics cards with local PDF export and WhatsApp summary share.
- **Privacy & Compliance Disclosures**: Updated bilingual Privacy Policy & Terms covering billing, employee salary entries, receiving points, and daily expenses stored solely on user device/private cloud account.

### Changed
- **Version Bump**: Bumped app version to `1.3.0` (`versionCode 10300`).

## [1.2.4] - 2026-11-09
### Added
- **Optimized Font Bundle**: Streamlined typography bundle to ultra-compact native fonts, reducing package size well below 25MB while preserving full bilingual calligraphy support.
- **Enhanced WebView Color Fallbacks**: Added solid `rgba()` fallbacks for translucent UI overlays across all components for seamless rendering on Chromium 100-110 WebViews.
- **Explicit Boot & Reminder Disclosure**: Added specific Privacy Policy disclosures clarifying that `RECEIVE_BOOT_COMPLETED` and `WAKE_LOCK` are used exclusively to restore local reminders after device reboot.

### Changed
- **Store Audio Policy Compliance**: Gated voice recording in store distribution to file-upload-only mode, eliminating microphone access requirements and completely purging deprecated recording terminology.
- **Store Dashcam Isolation**: Fully decoupled dashcam modules and routes from store distribution bundles via build-time tree-shaking and dynamic import gating.
- **Tesseract Storage Optimization**: Pruned redundant raw WebAssembly and non-LSTM binary cores from offline OCR assets, reducing engine footprint by over 30MB.
- **Version Bump**: Bumped app version to `1.2.4` (`versionCode 9`).

## [1.2.3] - 2026-11-07
### Added
- **Product Flavors Architecture**: Introduced dual build flavors (`store` and `full`). The `store` distribution completely omits camera and microphone permissions, native CameraX dependencies, and background recording services for strict store catalog compliance.
- **Offline OCR Engine**: Bundled complete local WebAssembly core variants (standard, SIMD, LSTM) and language data for offline transport document and receipt scanning with zero external network calls.
- **CSS Compatibility Post-Processing**: Integrated automated Lightning CSS transformation targeting Chrome 80+ to eliminate modern CSS color syntax discrepancies on older Android System WebViews.

### Changed
- **Asset Hygiene & Decoupled Builds**: Separated mobile client asset builds from server runtime compilation, strictly purging server files, sourcemaps, and web-only scripts from mobile APK packages.
- **Privacy Hardening**: Enhanced anonymous crash diagnostics with voluntary user consent toggle (default OFF) and purged user IDs and URLs from error telemetry.
- **Third-Party Sanitization**: Completely eliminated third-party fallback dependencies in favor of native offline QR generation and local asset hosting.
- **Version Bump**: Bumped app version to `1.2.3` (`versionCode 8`).

## [1.2.1] - 2026-10-24
### Fixed
- **Google Sign-In**: Google Sign-In on Android now uses the native flow.

### Changed
- **App Layout & Configuration**: Full-screen layout, single applicationId (`com.warraichgoods.driverdost`) with one release keystore, CI now verifies the built APK signature, R8 rules for unused sign-in providers.

### Documentation
- **Legal & Docs**: New Terms & Conditions, Privacy Policy and README.

## [1.2.0] - 2026-10-05
### Added
- **Transport Dashcam**: Integrated background camera recording engine with unified audio/video capture, custom CameraLifecycleOwner decoupled from UI lifecycle, and power-efficient screen lock recording.
- **Dashcam Video Sharing**: Added video clip sharing action supporting WhatsApp, Gmail, Bluetooth, and native Android sharing sheet via FileProvider (`content://` URI) with temporary read permissions.
- **Weather Advisory**: Real-time road and weather advisory alerts for transport drivers across major freight corridors.
- **Delivery Confirmation**: Delivery confirmation with receiver name and optional photo.
- **Document Expiry Reminders**: Automatic tracking and notifications for vehicle fitness, driving license, route permits, and token tax.
- **Route Comparison & Hazard Alerts**: Route comparison where more than one route exists and road hazard alerts.
- **Privacy Policy Update**: Bilingual English & Urdu disclosure of dashcam permissions, local storage policy, driver deletion control, and in-vehicle audio recording consent responsibility.

### Changed
- **Version Bump**: Bumped app version to `1.2.0` (`versionCode 6`, `versionName "1.2.0"`).
- **FileProvider Configuration**: Added `dashcam_videos` and `external_files` `<external-files-path>` mappings in `file_paths.xml` for secure media sharing.

## [1.1.0] - 2026-09-17
### Added
- **Document Verification Portal**: Document verification links for authorised accounts.
- **Offline Document Number Collision Handling**: Resilient sequence resolution avoiding overlapping document IDs during offline freight dispatch.
- **Hardened ProGuard & R8 Rules**: Explicit keep rules for `@capacitor/filesystem`, `io.ionic.libs`, and Capacitor plugin annotations to prevent runtime reflection stripping.

### Changed
- **Version Bump**: Bumped to `versionName "1.1.0"` and `versionCode 5` for Palm Store and Uptodown store resubmission.
- **Firestore Security Rules**: Hardened document read/write authorization and access control policies.
- **Data Safety**: Set allowBackup to false in Android manifest to protect sensitive freight and financial logs on shared devices.
- **Branding Polish**: Removed misleading placeholder status badges and cleaned up all typography and branding elements.

### Removed
- **Unused AI Advisor**: Removed non-functional experimental AI advisor backend routes and unneeded `@google/genai` dependency to streamline package weight.

## [1.0.3] - 2026-09-14
### Added
- **Third-Party Store Compliance**: Tailored release bundle for distribution on Uptodown, Palmstore, and independent Android app repositories alongside Google Web / PWA.
- **Public Privacy Policy Web Page**: Added accessible standalone `/privacy.html` policy document required for third-party Android store listings.
- **R8 / ProGuard Minification & Shrinking**: Enabled `minifyEnabled true` and `shrinkResources true` in `android/app/build.gradle` with custom rules in `proguard-rules.pro` protecting Capacitor plugins, WebView interfaces, Firebase auth/firestore SDK, and PDF/OCR engines.

### Changed
- **Digital Asset Links Standardization**: Retained exclusively the official native application package `com.warraichgoods.driverdost` in `assetlinks.json`, eliminating redundant legacy webview/TWA entries.
- **Version Bump**: Incremented Android `versionCode` to `4` and `versionName` to `"1.0.3"`.
- **Permissions Audit**: Verified strictly required permissions (`INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`) for Pakistan motorway toll calculations, GPS live routing, and highway offline-sync.

### Fixed
- Verified error boundary resilience and zero store-specific branding across all calculators, document creation, and vehicle fleet management modules.
