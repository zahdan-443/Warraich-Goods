# Production-Ready Store Certification & Architecture Hardening — Implementation Plan

A comprehensive engineering plan to prepare **Driver Dost / Warraich Goods Logistics** for seamless certification and deployment on the **Google Play Store** and **Palm Store**, strictly preserving all existing features, offline-first reliability, and the Urdu RTL interface.

---

## User Review & Confirmed Architectural Directives

> [!IMPORTANT]
> The following architectural decisions were selected during Phase 1 clarification:
> 1. **Government Verification Tools (MTMIS, DLIMS, Safe City)**:
>    - **Direct Portal Launcher Only with External Redirect**: Completely remove all hardcoded, mock, or simulated verification statuses ("verified", "clear", "فارمیٹ و کلیئرنس درست").
>    - The app will validate user input formatting, copy the registration/license to clipboard with 1-tap feedback, display official government disclaimers, and open the official provincial web portal (`https://mtmis.punjab.gov.pk/`, `https://dlims.punjab.gov.pk/`, etc.) in the user's browser.
> 2. **Account Deletion Architecture**:
>    - **30-Day Scheduled Grace Period**: When a user requests account deletion in-app, their cloud profile is flagged with `deletionRequestedAt: ISOString` and `deletionScheduledFor: ISOString (+30 days)`.
>    - Local device cache is cleared, and the session is terminated. If the user signs in again within the 30-day window, they are offered an immediate "Cancel Deletion & Restore Account" prompt.
>    - Once 30 days lapse, their cloud profile and associated user data in `/usersData/{userId}` and `/users/{userId}/**` are permanently purged without affecting any other user records.
>    - Provide a dedicated, publicly accessible external deletion-request webpage at `/public/delete-account.html` satisfying Google Play Data Safety policy requirements.
> 3. **Android SDK & Store Target**:
>    - **CompileSdk 36 & TargetSdk 36**: Upgrade Android build variables to API level 36 (Android 16 ready).
>    - Maintain persistent visibility of Android system status and navigation bars throughout the application viewport.
> 4. **Bilty Privacy & Zero-Tracking Rules**:
>    - Strictly forbid all financial values (`total`, `advance`, `payable`, `freight`) and PII (`senderCnic`, `receiverCnic`, `senderMobile`, `receiverMobile`, `mobileNo`) in public verification documents and on the QR page.
>    - Completely remove shipment-tracking indicators ("In Transit", "Delivery", "Delivered", POD confirmation modal) from the verification page, maintaining it strictly as a Bilty verification system.

---

## 1. Executive Summary & Production Readiness Scope

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   STORE COMPLIANCE & HARDENING SCOPE                        │
├────────────────────────────────┬────────────────────────────────────────────┤
│ 1. Firebase & Cloud Sync       │ • Enforce strict per-user data isolation   │
│                                │ • Fix offline queue retry & permissions    │
│                                │ • Atomic online counter allocation         │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 2. Public Bilty Verification   │ • Allow safe fields only (no PII/finances) │
│                                │ • Remove tracking badges & POD modal       │
│                                │ • Direct official portal launcher only     │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 3. Android & Store Compliance  │ • compileSdk 36 & targetSdk 36             │
│                                │ • Visible status and navigation bars       │
│                                │ • Audit permissions & release AAB/APK      │
├────────────────────────────────┼────────────────────────────────────────────┤
│ 4. Privacy & Account Deletion  │ • In-app deletion with 30-day grace period │
│                                │ • Public /delete-account.html webpage      │
│                                │ • Synchronized privacy policy terms        │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

## 2. Technical Architecture & Component Plans

### Area 1: Firebase & Cloud Sync Hardening

#### A. Strict Per-User Data Isolation
- **Rule**: Every user's private records (trips, vehicle expenses, toll logs, offline transactions, ledger khata) reside exclusively under `/usersData/{userId}` and `/users/{userId}/**`.
- **Firestore Security**:
  ```cel
  match /usersData/{userId} {
    allow read, write: if isSignedIn() && request.auth.uid == userId;
  }
  match /users/{userId}/{document=**} {
    allow read, write: if isSignedIn() && request.auth.uid == userId;
  }
  ```
- **Local Isolation**: Namespace local device storage keys with the authenticated user ID (`user_${uid}_...`) to prevent data contamination if multiple users log in on the same shared device.

#### B. Offline Queue & Bilty Allocation Error Resolution
- **Issue**: Actions failing with `Missing or insufficient permissions` (such as unauthenticated writes or invalid counter updates) spam retries, showing error notifications in the cloud sync status bar.
- **Resolution**:
  - In `src/utils/storage.ts`:
    1. Validate authentication status before attempting authenticated Firestore writes.
    2. Sanitize any public bilty payloads via `extractPublicBiltyVerification` before enqueueing or dispatching to `publicBiltyVerifications`.
    3. After 2 consecutive permission-denied or auth failures, discard the invalid action or move it to a dead-letter quarantine instead of retrying indefinitely.
    4. Ensure failed writes are never marked as synced, and provide a clean "Clear Error" action that resets `ah-last-sync-error`.
    5. In `allocateNextBiltyNumber()`, ensure atomic online allocation checks if the user is authenticated; if offline or unauthenticated, allocate from local sequence with clear offline indicator without triggering Firestore security faults.

---

### Area 2: Secure Public Bilty Verification & Cleanup

#### A. Public Verification Document Schema
- **Allowed Fields (Public Only)**:
  `biltyNo`, `date`, `senderName`, `receiverName`, `senderAddress`, `receiverAddress`, `sendingCity`, `receivingCity`, `vehicleNo`, `driverName`, `itemDescription`, `weight`, `qty`, `branch`, `paymentStatus` ('paid' | 'topay'), `verifiedPublicly`, `createdAt`, `updatedAt`, `id`.
- **Strictly Prohibited & Stripped**:
  `total`, `advance`, `payable`, `freight`, `senderCnic`, `receiverCnic`, `senderMobile`, `receiverMobile`, `mobileNo`, `isDelivered`, `podConfirmation`.

#### B. Verification Component Refinement (`VerifyView.tsx` & `BiltyVerificationCard.tsx`)
- Remove the shipment tracking bar ("روانہ ہوچکی", "راستے میں", "پہنچ گئی / ڈیلیورڈ") and proof-of-delivery (POD) receiver photo modal.
- Display all authorized non-financial details: consignor/consignee names, addresses, origin/destination, goods description, weight, quantity, vehicle number, driver name, and payment status (paid / to-pay).
- Maintain 24/7 Helpline buttons (`0300-5370443`, `0339-5370443`), WhatsApp share, copy link, and QR scanning without breaking the canonical URL structure (`https://zahdan-443.github.io/Warraichgoodstransportcompany/?page=verify&bilty={BILTY_NUMBER}`).

#### C. Removal of Misleading Government Verification
- In `VerifyView.tsx`, remove mock/simulated MTMIS, DLIMS, and PSCA Safe City verification tables (`INITIAL_AUDIT_RECORDS` and fake clearance badges).
- Replace with an **Official Verification Portal Launcher**:
  - Validates vehicle registration number or driving license format.
  - One-tap button copies registration number to clipboard.
  - Direct redirect button opens the official portal:
    - **MTMIS Punjab**: `https://mtmis.punjab.gov.pk/`
    - **DLIMS Punjab**: `https://dlims.punjab.gov.pk/`
    - **Sindh Excise (MTMIS)**: `https://excise.gos.pk/`
    - **KPK Excise**: `https://kpexcise.gov.pk/`
    - **PSCA Safe City e-Challan**: `https://echallan.psca.gop.pk/`
  - Explicit disclaimer in Urdu: *"یہ ایپ براہ راست سرکاری پورٹل فراہم کرتی ہے۔ سرکاری تصدیق متعلقہ پورٹل پر دیکھی جا سکتی ہے۔"*

---

### Area 3: Android SDK 36, Store Compatibility & Release Automation

#### A. SDK Configuration
- Update `android/variables.gradle`:
  ```groovy
  ext {
      minSdkVersion = 24
      compileSdkVersion = 36
      targetSdkVersion = 36
      androidxActivityVersion = '1.9.0'
      androidxAppCompatVersion = '1.7.0'
      androidxCoreVersion = '1.13.1'
  }
  ```
- Verify `android/app/build.gradle` consumes `compileSdkVersion` and `targetSdkVersion` smoothly.

#### B. System Status and Navigation Bars
- Ensure Android status bar and navigation bar remain visible across all device form factors.
- In `android/app/src/main/java/.../MainActivity.java`, enforce standard window insets without immersive fullscreen hiding.
- Ensure viewport meta tag in `index.html` uses `viewport-fit=cover` with CSS safe-area insets (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).

#### C. Android Permissions Audit
- Inspect `android/app/src/main/AndroidManifest.xml`:
  - Retain: `CAMERA` (for QR scanner & vehicle inspection), `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` (for GPS route navigation & nearby stations), `POST_NOTIFICATIONS` (for Android 13+ status bar notifications), `INTERNET` / `ACCESS_NETWORK_STATE`.
  - Remove: `SCHEDULE_EXACT_ALARM` or `USE_EXACT_ALARM` unless strictly required, to prevent Google Play policy rejection.
  - Review foreground service types: ensure proper `foregroundServiceType` (e.g. `location` or `dataSync`) is specified if any foreground service is defined.

#### D. Release Workflow Security
- Review `.github/workflows/build-apk.yml`:
  - **Never generate temporary release keystores** for production release builds.
  - For `release` builds, require repository secrets:
    - `ANDROID_KEYSTORE_BASE64`
    - `ANDROID_KEYSTORE_PASSWORD`
    - `ANDROID_KEY_ALIAS`
    - `ANDROID_KEY_PASSWORD`
  - If secrets are absent on release branches/tags, abort the release job with a clear configuration instruction rather than signing with an untrusted debug key.
  - Add Gradle target `./gradlew bundleRelease` to generate `.aab` (Android App Bundle) required by Google Play Store alongside `.apk`.

---

### Area 4: Account Deletion Flow & Privacy Policy Compliance

#### A. In-App Deletion with 30-Day Grace Period
1. In `src/components/UserProfileModal.tsx` (or settings sheet):
   - Add a clearly labeled danger-zone button: **"اکاؤنٹ ڈیلیٹ کی درخواست" (Request Account Deletion)**.
   - Present a 2-step confirmation modal detailing:
     - 30-day scheduled grace period before permanent deletion.
     - What data will be deleted (profile, cloud trip logs, vehicle accounts, ledger khata).
     - Ability to log back in within 30 days to cancel the request.
2. Cloud Storage Implementation:
   - Call `requestAccountDeletion(userId)` in `src/utils/storage.ts`:
     - Sets `deletionRequestedAt: new Date().toISOString()`, `deletionScheduledFor: new Date(Date.now() + 30 * 86400000).toISOString()`, `status: 'pending_deletion'` on the user's profile document.
     - Clears local device authentication state and cached records.
   - On subsequent sign-in:
     - If the account has `status: 'pending_deletion'`, prompt the user: *"آپ کا اکاؤنٹ ڈیلیٹ ہونے کے عمل میں ہے۔ کیا آپ ڈیلیشن منسوخ کرکے بحال کرنا چاہتے ہیں؟"*.
     - Calling `cancelAccountDeletion(userId)` clears the deletion markers and restores normal status.

#### B. Public Deletion-Request Webpage (`/public/delete-account.html`)
- Google Play Store requires a publicly accessible URL where users can request account and data deletion outside the mobile app.
- Create `/public/delete-account.html`:
  - Responsive, bilingual (English & Urdu) standalone HTML page.
  - Outlines the data retention policy, the 30-day grace period, and specific data elements deleted.
  - Includes a simple request form (email, reason) and direct email contact (`warraichgoods43@gmail.com`) with instant submission guidance.

#### C. Privacy Policy Synchronization
- Update `/public/privacy.html` and in-app `PrivacyPolicyModal.tsx`:
  - Detail strict user data isolation (each user accesses only their own private records).
  - Explicitly list the public non-sensitive fields in public Bilty verification documents and certify that no financial or PII data is ever exposed publicly.
  - Explain the 30-day account deletion grace period and user rights.

---

## 3. Testing, Verification & Validation Plan

1. **Unit & Integration Tests (`npm run test`)**:
   - `src/__tests__/deepAuditFixes.test.ts`: Verify `extractPublicBiltyVerification` includes non-financial details and excludes all PII and monetary fields.
   - `src/__tests__/firestoreRules.test.ts`: Validate Firestore rule assertions for user isolation, public verifications, and owner access.
   - Add new tests in `src/__tests__/accountDeletion.test.ts`: Test deletion request timestamp calculation (+30 days), cancellation logic, and queue sanitation.
2. **Type Checking & Linting**:
   - Run `npx tsc --noEmit` and `npm run lint` to guarantee zero syntax or import errors.
3. **Applet Compilation**:
   - Run `compile_applet` to confirm seamless Vite build and asset packaging.
4. **Android Build Validation**:
   - Verify Gradle build configs parse `compileSdkVersion = 36` and `targetSdkVersion = 36` cleanly.

---

## 4. Execution Sequence

```
Step 1: Android Gradle Upgrade (API 36) & Manifest Audit
  └── Update variables.gradle, verify permissions, retain system bars

Step 2: GitHub Actions Release Workflow Hardening
  └── Disallow temporary keystore generation, add bundleRelease (.aab)

Step 3: Verification Portal Direct Launcher Implementation
  └── Replace simulated government checks with official portal redirect in VerifyView.tsx

Step 4: Account Deletion Implementation (In-App + Public Webpage)
  └── Add storage functions, in-app UI modal, and create public/delete-account.html

Step 5: Privacy Policy Synchronization
  └── Align public/privacy.html and in-app PrivacyPolicyModal with actual practices

Step 6: Automated Testing & Compilation
  └── Run Vitest test suite, lint_applet, and compile_applet
```

Please review this implementation plan. Once confirmed, implementation will begin immediately.
