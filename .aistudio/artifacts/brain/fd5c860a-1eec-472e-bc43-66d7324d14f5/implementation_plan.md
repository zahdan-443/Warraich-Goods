# Production Hardening & Store Compliance Implementation Plan

Driver Dost transport and logistics platform comprehensive hardening plan covering 30-day account deletion with sign-in restore banner, Firebase multi-tenant security rules audit, automatic background cloud synchronization, APK hygiene, and Android build stability.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were clarified and confirmed with the user in Phase 1:
> - **Account Deletion Handling**: When a user with a pending deletion signs in, display a top alert banner with a 1-click **"Cancel Deletion & Restore Account"** button rather than auto-canceling or hard locking.
> - **Cloud Synchronization**: Operate as **automatic background synchronization only**, seamlessly syncing offline transactions to Firestore whenever connectivity is restored.
> - **APK Build Variant**: Target **Store Release APK only** (`assembleStoreRelease`) in the GitHub Actions CI workflow to ensure a fast, lean, store-compliant release.
> - **Feature Scope (User Note)**: Strictly do NOT add shipment tracking. Maintain and polish the **Digital Bilty Creation & Online Verification System**.

---

## 1. Overview & Core Concept

Driver Dost is a bilingual (Urdu & English) transport operations, goods receipts, vehicle expense ledger, and toll calculation application tailored for Pakistani freight corridors and fleet operators. This iteration delivers complete operational compliance, robust data security, and APK build stability across all supported Android platforms.

### Target Audience & Persona
- **Transport Fleet Owners & Branch Managers**: Managing digital goods receipts, vehicle khata ledgers, and official verification links.
- **Freight Truck Drivers**: Working offline on highways in guest mode or authenticated driver accounts with automatic background sync and zero blocking login modals.

---

## 2. Key Architecture & Workflows

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DRIVER DOST CLIENT ENGINE                       │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Guest Mode / Offline │  │  Authenticated   │  │ Account Deletion │  │
│  │ Local Storage & IDB  │  │ User State (Auth)│  │ Banner & Restore │  │
│  └──────────┬───────────┘  └─────────┬────────┘  └────────┬─────────┘  │
│             │                        │                    │            │
│             ▼                        ▼                    ▼            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │           Ambient Background Sync Queue (Auto-Sync)              │  │
│  │     - Network state listener (online / offline transition)       │  │
│  │     - Last-Write-Wins (LWW) conflict resolver                    │  │
│  │     - Queue flusher: pending offline edits -> Firestore          │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │
                                       ▼ (HTTPS / Firestore SDK)
┌────────────────────────────────────────────────────────────────────────┐
│                     FIRESTORE SECURITY & ISOLATION                     │
│                                                                        │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │ usersData/{userId}           │    │ accountDeletionRequests/     │  │
│  │  - Strict userId matching    │    │  {userId}                    │  │
│  │  - Zero cross-tenant leakage │    │  - 30-day grace period track │  │
│  └──────────────────────────────┘    └──────────────────────────────┘  │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │ publicBiltyVerifications/    │    │ access/biltyAccess & admins/ │  │
│  │  - Whitelisted non-PII only  │    │  - Strictly Owner access only│  │
│  │  - No CNICs, phones, charges │    │                               │  │
│  └──────────────────────────────┘    └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Implementation Modules

### Module 1: Complete Account Deletion System (30-Day Grace Period & Restore Banner)
- **Request Flow**: User accesses Account Deletion in Settings -> Confirmation modal explains 30-day grace period -> Document created in Firestore `accountDeletionRequests/{userId}` with:
  - `userId`: string
  - `userEmail`: string
  - `requestedAt`: timestamp
  - `scheduledPurgeAt`: timestamp (+30 days)
  - `status`: 'pending'
- **Sign-In Banner & Restoration**:
  - When user signs in, if a pending deletion request exists in `accountDeletionRequests/{userId}`, a prominent top alert banner appears:
    - Urdu: *"آپ کے اکاؤنٹ کو ڈیلیٹ کرنے کی درخواست زیرِ عمل ہے۔ 30 دن کی مہلت کے بعد اکاؤنٹ مستقل حذف ہو جائے گا۔"*
    - English: *"Your account is scheduled for deletion on [Date]. You can cancel this request anytime during the grace period."*
    - Single-click action button: **"Cancel Deletion & Restore Account"** / **"درخواست منسوخ کریں اور اکاؤنٹ بحال رکھیں"**.
  - Clicking the button deletes the document from `accountDeletionRequests/{userId}` and restores normal account status immediately.
- **Permanent Purge Execution**:
  - Verification logic to purge user-isolated subcollections (`users/{userId}` and `usersData/{userId}`) once `scheduledPurgeAt` has passed.

### Module 2: Firebase Security Rules Audit & Multi-Tenant Data Protection
- **User Isolation**:
  - `usersData/{userId}` and `users/{userId}` strictly restricted to `request.auth.uid == userId`.
  - Non-owner users cannot query or list other users' documents, trips, fuel entries, ledgers, or profile data.
- **Master Authorization & Management**:
  - Master access controls (`access/biltyAccess`, `admins/{adminId}`, `settings/{settingId}`) strictly restricted to the verified Fleet Owner (`warraichgoods43@gmail.com`).
- **Public Verification Hardening**:
  - `publicBiltyVerifications/{docId}`: Read allowed for QR code verification, but security rules strictly enforce a whitelist of non-sensitive fields (`biltyNo`, `date`, `senderName`, `receiverName`, `vehicleNo`, `driverName`, `itemDescription`, `weight`, `qty`, `branch`).
  - Strictly **forbidden** fields (CNIC, phone numbers, freight price, advance, balance, charges, driver phone) are blocked by security rules from ever being written to public verification records.

### Module 3: Automatic Background Cloud Synchronization
- **Zero-Friction Ambient Sync**:
  - Operates automatically in the background without requiring manual "Sync Now" clicks.
  - Network listener detects when the device comes online and drains the offline queue automatically.
  - Conflict resolution uses timestamp-based Last-Write-Wins (LWW) to merge offline edits with cloud records safely.
  - Poison-pill protection: skips any unauthorized cloud writes for guest or non-owner restricted paths so the queue never gets stuck.

### Module 4: Android Build & GitHub Actions CI Fixes
- **Root Cause of Previous Failures**:
  1. `setup-java v4` deprecation notice -> already resolved with `actions/setup-java@v5` in `.github/workflows/build-apk.yml`.
  2. `npm ci` lockfile mismatch (`@types/jszip`, `jszip`, etc.) -> sync `package-lock.json` and use `npm install --legacy-peer-deps --no-audit --no-fund` in CI.
  3. `checkReleaseAarMetadata` failed -> resolved by setting `compileSdkVersion = 35` and enforcing `subprojects { project.plugins.withId('com.android.library') { android { compileSdk = 35 } } }` so all Capacitor plugins compile against Android 35 SDK.
  4. Building `assembleStoreRelease` specifically targets the lean `store` flavor, completely bypassing CameraX and camera dependencies.
- **APK Asset Hygiene & CI Verification**:
  - Decoupled `npm run build` keeps `server.cjs` out of the client assets.
  - Automated CI step runs `unzip -l` on the APK to verify zero web server files (`server.cjs`, `sw.js`, `404.html`, `sitemap.xml`, screenshots, `.map` files) and zero third-party domain string leaks (`cdn.jsdelivr.net`, `api.qrserver.com`, `your-backend-api.com`).

### Module 5: Transsion & Store Compatibility (No Shipment Tracking)
- **Store Flavor Isolation**: Zero CAMERA, zero RECORD_AUDIO, and zero foreground service permissions in `store` flavor.
- **Offline Tesseract 7**: Complete local WebAssembly core variants bundled with absolute URLs.
- **CSS Transpilation**: Lightning CSS transforms `oklch(` to RGB fallbacks targeting Chrome 80+.
- **Scope Compliance**: Strictly maintain the Digital Bilty Creation & Online Verification System with zero shipment tracking features.

---

## 4. Verification & Testing Strategy

1. **Unit Testing**: Run `vitest` covering all 15 test suites (account deletion, ambient sync, Firestore rules, navigation, error boundary).
2. **Account Deletion Flow Test**: Test scheduling a deletion request, verifying the 30-day grace period timestamp, and testing the single-click cancellation banner upon sign-in.
3. **Security Rules Test**: Verify Firestore rules structure ensuring tenant isolation and forbidden field blocking.
4. **Asset Hygiene Test**: Validate packaged assets have 0 forbidden files and 0 third-party string leaks.
5. **Compilation & Linting**: Run `compile_applet` and `lint_applet` to ensure error-free builds.
