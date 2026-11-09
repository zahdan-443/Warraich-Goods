# Production Hardening & Store Compliance Implementation Plan

Driver Dost transport and logistics platform comprehensive hardening plan covering 30-day account deletion with sign-in restore banner, Firebase multi-tenant security rules audit, automatic background cloud synchronization, APK hygiene, and Android build stability.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Account Deletion Handling**: When a user with a pending deletion signs in, display a top alert banner with a 1-click **"Cancel Deletion & Restore Account"** button rather than auto-canceling or hard locking.
> - **Cloud Synchronization**: Operate as **automatic background synchronization only**, seamlessly syncing offline transactions to Firestore whenever connectivity is restored.
> - **APK Build Variant**: Target **Store Release APK only** (`assembleStoreRelease`) in the GitHub Actions CI workflow to ensure a fast, lean, store-compliant release.
> - **Feature Scope**: Strictly do NOT add shipment tracking. Maintain and polish the **Digital Bilty Creation & Online Verification System**.

---

## Completed Store Build Fixes (v1.2.4)

### 1. Voice Notes Gating (Store Flavor)
- In the store build (`VITE_STORE_BUILD=true`), the microphone recording button is hidden and direct `getUserMedia`/`MediaRecorder` execution is prevented.
- Kept only "upload audio file" (`<input type="file" accept="audio/*">`) for document dispatch audio attachments.
- Disclosed in Privacy Policy that the application does not request microphone permissions in the store build.

### 2. Dashcam Elimination in Store Distribution
- Decoupled `DashcamView` and `dashcamService` via build-time regex aliases in `vite.config.ts`, mapping them to ultra-lightweight stubs during `VITE_STORE_BUILD=true`.
- Zero `DashcamView-*.js` chunks are generated in production web assets.
- If `#dashcam` is targeted, navigation automatically redirects to `#home`.
- The Android `store` flavor's `DashcamPlugin.kt` stub requests zero permissions (`CAMERA`, `RECORD_AUDIO`) and contains zero native CameraX code paths.

### 3. Tesseract Assets Optimization & Offline Validation
- Cleaned `/public/tesseract/` to retain strictly:
  - `tesseract-core-lstm.wasm.js`
  - `tesseract-core-simd-lstm.wasm.js`
  - `tesseract-core-relaxedsimd-lstm.wasm.js`
  - `worker.min.js`
  - `lang-data/eng.traineddata.gz`
- Deleted all raw redundant `*.wasm` binaries and non-LSTM cores, reducing asset weight by over 30MB.
- Configured offline OCR in `CameraOcrInput.tsx` resolving paths from `document.baseURI` with zero external CDN dependencies.

### 4. Font Bundle Pruning (< 25MB Target)
- Deleted heavy unneeded font files (`JameelNooriNastaleeq.woff` - 6.8MB and `AlviLahoriNastaleeq.woff2` - 5.0MB).
- Aliased Urdu calligraphy font-families in `src/index.css` directly to bundled `PDMS_NastaliqNafees.ttf` (142KB) and `Akbar.woff` (67KB). Total font directory footprint is now only ~209KB, guaranteeing an APK size well under 25MB.

### 5. Chrome 100-110 WebView Translucent Overlays Compatibility
- Enhanced `scripts/transform-css-compat.js` with solid `rgba(...)` fallbacks for all Tailwind 4 `color-mix(in oklab, var(--color-X) Y%, transparent)` and `currentcolor` declarations.
- Older Android System WebViews (Chromium 100-110) now render solid/translucent fallbacks cleanly without dropping styles.

### 6. Privacy Policy Disclosures
- Added the mandatory disclosure to both `src/components/PrivacyPolicyModal.tsx` and `public/privacy.html`:
  > *"RECEIVE_BOOT_COMPLETED and WAKE_LOCK are used only to restore local reminders after reboot."*
- Removed dashcam references from public privacy and terms pages.

### 7. Version Bump to 1.2.4
- Synchronized version across:
  - `package.json`: `1.2.4`
  - `android/app/build.gradle`: `1.2.4` (computed `versionCode 9`)
  - `src/constants/version.ts`: `APP_VERSION = '1.2.4'`, `APP_VERSION_CODE = 9`
  - `CHANGELOG.md`: Added release notes for `[1.2.4] - 2026-11-09`.

### 8. Terminology & Policy Hygiene
- Completely removed all instances of deprecated terms ("Call recording", "کال ریکارڈنگ") in favor of "Voice Note / Audio Note".
- Verified zero occurrences of restricted terms ("Bilty" / "بلٹی") in all public-facing docs (`README.md`, `public/*.html`, `public/manifest.json`, `index.html`, `CHANGELOG.md`).
- Passed all 157 Vitest unit tests, clean TypeScript compilation, and linting.
