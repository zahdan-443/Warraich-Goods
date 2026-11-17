# Project Guidelines & Persistent Rules

## 1. Public Assets & Image Upload Policy (Strict Rule)
- **Do NOT edit, modify, replace, overwrite, or delete** any PNG or media files uploaded by the user from GitHub or file explorer into the `/public` directory.
- All user-uploaded PNG assets in `/public` are considered permanent and authoritative.
- Never treat user-provided `/public` image assets as file differences to be overwritten during code generation or GitHub sync.

## 2. Bilty Generator Access Control
- The Bilty Generator feature, navigation button, and creation tabs are strictly restricted and must only be visible and accessible to the authenticated App Owner (`warraichgoods43@gmail.com`).
- For guests and all other users, keep the Bilty creation interfaces hidden and protected.

## 3. Instant Guest Mode & Non-Blocking Experience
- The app must open directly and immediately without forcing blocking login popups or modal gates.
- All core trip calculation, toll, and log tools must work seamlessly in guest mode using local device storage.
- Sign-in should strictly occur on-demand when the user clicks the "Sign In" button.

## 4. Notifications & System Status Bar
- Maintain native device status bar and notification panel push alerts via Service Worker and Notifications API for all important transport operations (saved trips, vehicles, fuel logs, etc.).

## 5. Public-Facing Terminology Policy (Strict Rule)
- The word "Bilty" (and Urdu "بلٹی") must never appear in any public-facing text shown to regular users: README, public/*.html, public/manifest.json, index.html, store text, CHANGELOG.
- It may exist only in source code paths that are already restricted to the authorised owner account.
- Use neutral words like "documents" or "authorised business accounts" instead.

## 6. Project Memory & Current Status Snapshot (Updated: 2026-11-17)

### Application & Deployment
- **App Name / Version**: Driver Dost (`driver-dost` v`1.3.0`), Android `applicationId: com.warraichgoods.driverdost` (`versionCode: 10300`).
- **Tech Stack**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Express (`server.ts`), Capacitor 8 (`store` and `full` flavors), Firebase v12 (Auth + Firestore with `memoryLocalCache`), `jsPDF`, `qrcode`, `jsQR`, `Leaflet`, `Tesseract.js`.
- **Live URLs**:
  - Driver Dost App (this repo): `https://zahdan-443.github.io/Warraich-Goods/`
  - Public Company Verification Site (separate GitHub repo): `https://zahdan-443.github.io/Warraichgoodstransportcompany/?page=verify&bilty={BILTY_NO}`

### Company Identity & Owner Control
- **Company**: Warraich Goods Transport Company (`وڑائچ گڈز ٹرانسپورٹ کمپنی`), Proprietor: `Zahdan Nasar Warraich` (`پروپرائیٹر: زاہدان نصر وڑائچ`), NTN: `7779394-1`, Registered mark `®`.
- **Branch**: Samundri Head Office ONLY — `Okara Bypass, Near 466 Chock, Samundri` (`اوکاڑہ بائی پاس، نزدیک 466 چوک، سمندری`), Phone: `0300-5370443, 0339-5370443` (Kamalia branch deleted).
- **Authorised Owner Email**: `warraichgoods43@gmail.com`.

### Implemented Program Modules
- **Core Fleet & Guest Mode**: Home Hub, Trip Cost Calculator, Live PK Fuel Prices & Logs, Vehicles & Drivers (with local document expiry reminders), Routes, Toll Plaza Calculator, GPS Navigation & Hazard Reports, Government Verification Hub (`VerifyView` for MTMIS / DLIMS / PSCA Safe City / QR Lookup).
- **Khata Expansion (5 Modules)**: Party Ledger, Bills & Invoices, Employees & Salary Ledger, Receiving Points, Daily Expenses, and Reports Hub with local PDF exports & WhatsApp summaries.
- **Owner-Only Bilty Generator (`BiltyView` + `PrintableBilty`)**:
  - Opens directly to language selection (`ur` / `en`).
  - A4 Print Layout (`794x1120px`) on clean white card with Navy Blue (`#0f2942`), Gold (`#d97706`), and Emerald (`#065f46`) accents, double outer border, Pakistani ornamental header frame (`pakistani-header-frame`), 3-edge left company emblem, top-right NTN stamp, Nastaleeq font stack (`font-weight: 400` in `@font-face`), soft pastel row tints, 6% opacity logo watermark inside `Nature of Goods` only, enlarged cargo text, clean quantity box (without `Pkgs / Bags` label), top `Freight` row + conditional bottom summary, bold highlighted legal `Remarks` and `Terms & Conditions`, and `88x88` QR aligned with Driver Signature + bottom verification caption.

### Firebase & Verification Status
- **Primary Firebase Project**: `warraich-goods` (`WARRAICH_GOODS_CONFIG` in `src/utils/firebaseConfig.ts`; fallback built-in for GitHub Pages and Android).
- **Firestore Rules (`firestore.rules`)**: Published to Firebase Console; uses non-reserved parameter `accessDoc` in `isStaffAuthorized(accessDoc)` and `payload` in `hasOnlyPublicBiltyFields()`. Public QR records store ONLY 8 non-PII, non-financial fields under `publicBiltyVerifications/{UPPERCASE_BILTY_NO}`.
- **External Website Verification Note**: `Warraichgoodstransportcompany` reads its 6 `VITE_FIREBASE_*` keys strictly from its own GitHub **Repository secrets** at build time and requires a manual **Run workflow** (or new push) after secrets are added before live QR verification resolves.

### Release & Verification Invariants
- Never modify `android/app/src/main/AndroidManifest.xml` (verified baseline SHA-256: `eb265574e07cf003dd8ed2ac83d94c9521a2e64418236b0d48d2a2e400adb944`) or `/public/*.png`.
- Verification commands: `npm run lint` (`tsc --noEmit`), `npm run test` (`21` files / `194` tests), `VITE_STORE_BUILD=true npm run build && node scripts/verify-khata-release.mjs`.


