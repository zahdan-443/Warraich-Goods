# Implementation Plan: Google Play Readiness & Security Hardening

Address the latest audit findings and user selections to protect against public leaks, ensure Google Play policy compliance, prevent Firestore Denial-of-Wallet vulnerabilities, and eliminate the 1MB backup document limit.

---

## 1. Public Leak Remediation & Repository Hygiene
- **Delete Leak Directory**:
  - Completely remove `/public/assets/aistudio` and all its sensitive contents (audit PDF, docx, screenshots, zip).
  - Note: User-uploaded core branding images in `/public` root will be preserved untouched in compliance with Rule 1.
- **Update `.gitignore`**:
  - Add explicit rules ignoring `public/assets/aistudio/`, `*.pdf`, `*.docx`, `*.zip` to prevent accidental commits or uploads.

---

## 2. Play Store Policy: 30-Day Account Deletion Grace Period & Cancellation
- **Grace Period Workflow**:
  - In `src/components/AccountDeletionModal.tsx` & `src/utils/storage.ts`:
    - When user confirms deletion, create an account deletion request in Firestore:
      `accountDeletionRequests/{uid}` with `scheduledDeletionAt = now + 30 days`, `requestedAt = now`, `status = "pending"`.
    - Set local state and inform the user that their account is scheduled for deletion on `<date> (30 days)`.
    - Provide an explicit "Cancel Account Deletion" button on app load/login if an active deletion request exists.
    - If user clicks "Cancel Deletion Request", immediately update status to `"cancelled"` and remove the pending flag.
- **Update `public/delete-account.html`**:
  - Update public account deletion web page to detail the 30-day grace period, how to cancel before expiry, and the direct contact (`warraichgoods43@gmail.com`).

---

## 3. CrashReports Security Hardening & Spam Throttling
- **Firestore Rules Hardening (`firestore.rules`)**:
  - Allow unauthenticated and authenticated users to submit crash reports, but enforce strict character length and timestamp validation:
    - `request.resource.data.errorMessage is string && request.resource.data.errorMessage.size() <= 500`
    - `(!('stack' in request.resource.data) || (request.resource.data.stack is string && request.resource.data.stack.size() <= 1000))`
    - `(!('componentStack' in request.resource.data) || (request.resource.data.componentStack is string && request.resource.data.componentStack.size() <= 500))`
    - `(!('deviceModel' in request.resource.data) || (request.resource.data.deviceModel is string && request.resource.data.deviceModel.size() <= 100))`
    - `request.resource.data.createdAt == request.time`
  - Restrict `read`, `update`, and `delete` permissions strictly to the authenticated app owner (`warraichgoods43@gmail.com`).
- **Client-Side Throttling (`src/utils/crashReportingService.ts`)**:
  - Enforce a local rate limit (max 5 crash logs per hour per device) using in-memory and local storage counters, preventing infinite error loop spam from racking up Firestore write operations.

---

## 4. Chunked Cloud Backup (Fixing Firestore 1MB Document Limit)
- **Problem**: Storing all trips, documents, ledger items, and vehicle data in a single document `backups/latest` risks silent failure as soon as total payload exceeds Firestore's 1MB limit.
- **Solution (`src/utils/backupService.ts`)**:
  - Split backup payload across individual sub-collection documents:
    - `usersData/{uid}/cloudBackups/{backupId}/chunks/trips`
    - `usersData/{uid}/cloudBackups/{backupId}/chunks/documents`
    - `usersData/{uid}/cloudBackups/{backupId}/chunks/ledger`
    - `usersData/{uid}/cloudBackups/{backupId}/chunks/vehicles`
  - Store a lightweight index document `usersData/{uid}/cloudBackups/latestIndex` containing:
    - `backupId`, `createdAt`, total item counts, backup size summary.
  - Update `restoreFromCloudBackup` to fetch all available entity chunks and reconstruct the complete local store.

---

## 5. Play Store UGC Policy: In-App Hazard Report Flagging
- **Add Flag / Report Button**:
  - Google Play policy requires user-generated content (like road hazard reports) to have an in-app reporting/flagging mechanism for abusive, inaccurate, or spam content.
  - In `src/components/views/HazardReportingModal.tsx` and `src/components/views/MapView.tsx`:
    - Add a "Flag Inaccurate / Inappropriate" (غیر مناسب رپورٹ) button on individual hazard pins/cards.
    - Increment flag count and store flagged reasons in Firestore hazard report doc.
    - Automatically hide hazards if flagged by multiple users until owner review.

---

## 6. Privacy Policy & Data Safety Form Synchronization
- **Update `public/privacy.html` & In-App Privacy Modal**:
  - Add explicit diagnostic telemetry disclosure:
    - "App Stability & Diagnostics: Device model, operating system version, app version, error messages, and crash stack traces are collected anonymously to diagnose app crashes and enhance stability."
  - Add cloud backup retention details:
    - 30-day retention and deletion grace period for user data.
  - Disclose Google Fonts runtime network requests.

---

## 7. Android Build & Security Configuration
- **Fail Release Build on Missing Signing Secrets (`android/app/build.gradle`)**:
  - In `signingConfigs.release`, check if keystore file exists and passwords are provided. If missing during release assembly, fail fast with a descriptive error instead of silently building an unsigned or test-signed APK.
- **Narrow FileProvider Path (`android/app/src/main/res/xml/file_paths.xml`)**:
  - Remove `<external-path name="my_images" path="." />` (which flags warnings on Google Play Console for over-permissioned external storage access).
  - Restrict strictly to app-specific file paths (`<files-path>` and `<cache-path>`).

---

## 8. Verification & Test Plan
- Run `npm test` across all Vitest suites to ensure 100% test pass rate.
- Add tests for chunked backup logic, rate-limited crash reporting, and account deletion grace period.
- Run `lint_applet` and `compile_applet` to verify clean build without TypeScript or Vite errors.
