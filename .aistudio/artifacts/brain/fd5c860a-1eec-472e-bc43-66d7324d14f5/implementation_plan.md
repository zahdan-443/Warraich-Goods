# Palm Store & Dlightek Compliance (Docs 57 & 84) Complete Hardening Plan

A comprehensive, zero-defect hardening plan aligned with Transsion / Palm Store review specifications (**Doc 57: App Acceptance & Release Policy**) and security testing standards (**Doc 84: Security & Privacy Testing Standards**).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The plan has been thoroughly revised to incorporate all specific requirements from Dlightek Documentation (Docs 57 & 84) and your audit. Please review the updated specifications below.

- **Rule 2.6 & 2.3 (Permission-Feature Consistency)**: The Dashcam card is completely removed from the dashboard menu (`HomeView.tsx`), removed from active navigation tabs, and purged from `TermsModal.tsx` and `PrivacyPolicyModal.tsx`. The underlying implementation remains preserved in code without exposing undeclared permissions to store scanners.
- **Rule 1.8 (No Dynamic Code / WASM Downloads)**: Runtime fetching of worker, WebAssembly, and language data from `cdn.jsdelivr.net` / `tessdata.projectnaptha.com` is completely eliminated. All Tesseract OCR assets are bundled locally in `public/tesseract/` for 100% offline execution.
- **Rule 1.5 (No Silent Telemetry Uploads)**: Firestore `/crashReports` uploads are disabled by default. On-device diagnostics are stored locally only in `localStorage`. A visible, opt-in consent toggle is added to user Settings.
- **APK Bloat & Dead Code**: Unused `androidx.camera:*` native C++ libraries (4 ABIs) are removed from `android/app/build.gradle` (slashing APK size from ~32MB down to ~15MB). `scripts/sync-android-assets.js` and Gradle AAPT packaging rules ensure `server.cjs`, `sw.js`, `404.html`, `sitemap.xml`, and diagnostic screenshots never enter the APK.
- **Transsion / TECNO / Infinix WebView Support**: Added CSS fallbacks in `src/index.css` for `oklch`, `color-mix`, and `@property` to prevent visual distortion on older Android System WebViews (Chromium < 105), along with an alert guard in `index.html`.
- **Third-Party Data Leak Prevention**: External QR generation fallback to `api.qrserver.com` is completely replaced by the installed local `qrcode` engine.
- **Transparency & Disclosures**: Privacy Policy explicitly discloses exact location usage (OSRM route geometry, Open-Meteo corridor weather, local fuel prices) and guarantees zero data sales or background tracking. Removed suspicious `your-backend-api.com` placeholder from fuel widget.

---

## 1. Dlightek Review Standards (Docs 57 & 84) Alignment Matrix

| Dlightek Rule | Requirement | Our Technical Implementation |
|---|---|---|
| **Rule 2.6 & 2.3** | Listed functions must work; no dead UI without permissions | Hide Dashcam card in `HomeView.tsx`; remove from navigation; remove camera/mic clauses from Terms & Privacy. |
| **Rule 1.8** | No dynamic downloading of executable code, WASM, or scripts | Copy `worker.min.js`, `tesseract-core-simd.wasm.js`, and `eng.traineddata.gz` into `public/tesseract/`. Point `CameraOcrInput` to local relative paths. |
| **Rule 1.5** | No silent collection or transmission of device ID / telemetry | Disable automatic Firestore crash uploads; store diagnostics locally in `localStorage`; add explicit opt-in toggle in Settings. |
| **Data Leakage** | No transmission of sensitive document data to 3rd parties | Replace `api.qrserver.com` URL fallback in `biltyHelpers.ts` with local `QRCode.toDataURL()`. |
| **Doc 57 (App Health)** | Clean binary without orphaned C++ libs or bloated ABIs | Remove `androidx.camera:*` from `android/app/build.gradle`, saving ~15MB across arm64, armv7, x86, x86_64. |
| **Doc 57 (Clean Assets)**| APK assets must contain only client runtime files | Filter `server.cjs*`, `sw.js`, `404.html`, `sitemap.xml`, `robots.txt`, and screenshots out of `assets/public`. |
| **Doc 84 (Device Compatibility)** | App must render correctly on Transsion devices | Add standard hex/rgb color variable fallbacks in `src/index.css` to safeguard against older WebView CSS engines. |
| **Transparency** | Clear declaration of network endpoints and location | Disclose OSRM, Open-Meteo, and fuel station APIs in Privacy Policy; remove `your-backend-api.com` placeholder. |

---

## 2. High-Level Architecture & Asset Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                   OFFLINE SELF-CONTAINED ARCHITECTURE                  │
└────────────────────────────────────────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│   LOCAL OCR       │    │   LOCAL QR CODE   │    │  PRIVACY & LOGS   │
│ public/tesseract/ │    │ qrcode npm engine │    │ Default: Offline  │
│ - worker.min.js   │    │ - toDataURL()     │    │ - LocalStorage    │
│ - wasm.js / wasm  │    │ - No qrserver.com │    │ - Opt-in toggle   │
│ - traineddata.gz  │    │ - 100% On-Device  │    │ - No silent send  │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

---

## 3. Step-by-Step Implementation Execution Plan

### Step 1: Dashcam UI & Privacy Policy Cleanup (Rules 2.6 & 2.3)
1. **`src/components/views/HomeView.tsx`**:
   - Conditionally hide or remove the Dashcam card from the main dashboard grid.
2. **`src/App.tsx`**:
   - Remove `#dashcam` from public routing and navigation menu. Keep component code intact for future authorized releases.
3. **`src/components/TermsModal.tsx` & `src/components/PrivacyPolicyModal.tsx`**:
   - Remove references to dashcam video recording and microphone audio.
   - Declare camera usage strictly for local document image scanning (OCR).

### Step 2: 100% Bundled Offline OCR (Rule 1.8)
1. **Asset Staging**:
   - Create `public/tesseract/` directory.
   - Copy `worker.min.js` from `node_modules/tesseract.js/dist/`.
   - Copy `tesseract-core-simd.wasm.js` and `tesseract-core-simd.wasm` from `node_modules/tesseract.js-core/`.
   - Stage `eng.traineddata.gz` in `public/tesseract/lang-data/`.
2. **`src/components/CameraOcrInput.tsx`**:
   - Update `createWorker('eng')` to pass explicit local paths:
     ```typescript
     const worker = await createWorker('eng', 1, {
       workerPath: './tesseract/worker.min.js',
       corePath: './tesseract/tesseract-core-simd.wasm.js',
       langPath: './tesseract/lang-data',
       cacheMethod: 'none',
       gzip: true
     });
     ```
   - Zero runtime network requests to `cdn.jsdelivr.net` or `projectnaptha.com`.

### Step 3: Consent-Gated Crash Diagnostics (Rule 1.5)
1. **`src/utils/crashReportingService.ts`**:
   - Update `sendCrashReport()` to verify `localStorage.getItem('wg_crash_reports_consent') === 'true'`.
   - Default consent state is `false`.
   - When disabled, errors are recorded only in `localStorage` diagnostic snapshot.
2. **`src/components/SettingsModal.tsx` (or user profile view)**:
   - Provide a clear, localized toggle: "ایپ کی بہتری اور کریش رپورٹس (Anonymous Diagnostics)".
3. **`src/components/PrivacyPolicyModal.tsx`**:
   - Explicitly document the crash reporting mechanism, confirming it is voluntary and disabled by default.

### Step 4: Purge Web, Server, and Diagnostic Files from APK
1. **`scripts/sync-android-assets.js`**:
   - Expand `webOnlyOrRedundant` filter to remove:
     `server.cjs`, `server.cjs.map`, `sw.js`, `404.html`, `sitemap.xml`, `robots.txt`, `screenshot-desktop.png`, `screenshot-mobile.png`, `dashcam*`, and `assets/aistudio/*`.
2. **`.github/workflows/build-apk.yml`**:
   - Add explicit cleanup step immediately after `npx cap sync android` to ensure no stray files remain in `android/app/src/main/assets/public`.
3. **`android/app/build.gradle`**:
   - Update `aaptOptions.ignoreAssetsPattern` to reject `server.cjs*`, `sw.js`, `404.html`, `sitemap.xml`, `robots.txt`, and `*.map`.

### Step 5: Legacy Transsion WebView Compatibility & CSS Guards
1. **`src/index.css`**:
   - Provide standard hex/rgb fallback variables for primary theme colors (`#1a4d2e`, `#e8f5e9`, `#f4fbf4`, etc.) so that older Android WebViews without `oklch()` or `color-mix()` support render the UI with pristine contrast.
   - Remove the 9 external `cdn.jsdelivr.net` `@font-face` fallbacks, relying solely on local font files.
2. **`index.html`**:
   - Add a lightweight WebView compatibility check: if Android System WebView major version is detected under 105, display a non-blocking toast advising user to update Android System WebView.

### Step 6: Eliminate Third-Party QR Data Leak
1. **`src/utils/biltyHelpers.ts` & `src/components/PrintableBilty.tsx`**:
   - Remove `https://api.qrserver.com/v1/create-qr-code/?data=...`.
   - Use `QRCode.toDataURL(url, { errorCorrectionLevel: 'M', margin: 1 })` from the installed `qrcode` package.
   - Fall back to an inline SVG QR generator if needed, ensuring 100% client-side privacy.

### Step 7: Remove Unused CameraX Dependencies (APK Size Reduction)
1. **`android/app/build.gradle`**:
   - Remove lines 100-105:
     ```groovy
     implementation "androidx.camera:camera-core:${camerax_version}"
     implementation "androidx.camera:camera-camera2:${camerax_version}"
     implementation "androidx.camera:camera-lifecycle:${camerax_version}"
     implementation "androidx.camera:camera-video:${camerax_version}"
     ```
   - This prevents bundling ~15-20MB of C++ `.so` libraries across 4 ABIs and eliminates camera recording queries during Palm Store security scans.

### Step 8: Clean Suspicious Placeholder Endpoints
1. **`src/components/LiveFuelPriceWidget.tsx`**:
   - Replace `placeholder="https://your-backend-api.com/fuel"` with clean, localized placeholder text: `placeholder="https://... (اختیاری کسٹم فیڈ)"`.

### Step 9: Verification & Quality Assurance
1. Run automated test suite (`npm test`) to ensure all 156 unit tests pass.
2. Run TypeScript linting (`tsc --noEmit`).
3. Compile production web bundle (`npm run build`).
4. Audit `android/app/src/main/assets/public` directory to verify zero `server.cjs`, `sw.js`, or external references remain.
