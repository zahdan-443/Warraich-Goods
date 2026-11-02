# Play Store Policy Compliance, Crash Diagnostics & Scheduled Backup Plan

Comprehensive roadmap to guarantee Google Play Store review approval by eliminating government impersonation risks (U-03), installing an automated device crash reporting engine (Crashlytics alternative logging to Firestore with hardware metadata), and establishing automated daily Firestore backup sync alongside a one-click full backup download for the fleet owner.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during Phase 1 interactive clarification:
>
> - **Play Store Policy & Government Disclaimers (U-03)**: Display prominent, high-contrast compliance banners on all verification and portal screens with explicit non-affiliation declarations and verified official source URLs (MTMIS, DLIMS, PSCA).
> - **Crash Diagnostics Engine**: Automated device crash reporting directly to Firestore (`/crashReports`), capturing error stack traces, Android/browser device model, OS version, and network status with local loop-throttling.
> - **Data Backup & Export Strategy**: Automated daily cloud snapshot sync combined with an instant one-click full JSON backup vault for the fleet owner (`warraichgoods43@gmail.com`).
> - **Asset Preservation**: Keep existing user media assets intact and adhere to strict access controls for owner freight documents.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PLAY STORE COMPLIANCE & RELIABILITY ROADMAP                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
[ 1. PLAY STORE COMPLIANCE ]   [ 2. CRASH DIAGNOSTICS ]       [ 3. BACKUP & EXPORT VAULT ]
• High-contrast disclaimer     • Global error & promise hook  • Daily automated cloud snapshot
• Explicit non-gov statement   • Device model & OS metadata   • One-click full JSON export
• Direct official portal links • Rate-limited Firestore write • Owner-only archive download
• Prominent permission prompts • Owner live crash dashboard   • Instant disaster recovery
     │                                 │                                 │
     └─────────────────────────────────┴─────────────────────────────────┘
```

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Google Play Store Government Apps Policy Compliance (U-03)**:
     - Upgrades vehicle verification, driving licence lookup, and traffic challan screens (`VerifyView.tsx`) with bold, high-contrast disclaimer banners.
     - Formally states in prominent typography: *"Driver Dost is an independent fleet logistics tool developed by Warraich Goods Transport Company. It is NOT affiliated with, authorized by, or an official representative of the Government of Pakistan, Punjab Police, PSCA, MTMIS, or DLIMS."*
     - Provides clear, labeled external links directly to the official provincial portals (`mtmis.excise.punjab.gov.pk`, `dlims.punjab.gov.pk`, `echallan.psca.gop.pk`).
     - Adds clear runtime permission rationale banners before requesting Camera, Microphone, or GPS access, ensuring zero compliance surprises during Play Store review.
  2. **Automated Device Crash Diagnostics Engine**:
     - Introduces `crashReportingService.ts` to capture unhandled runtime exceptions, React component errors, and failed network calls.
     - Records device details: Device model / User-Agent, Android version, screen dimensions, online/offline status, app version (`1.2.1`), and anonymized user ID.
     - Stores reports into a dedicated, hardened Firestore collection (`/crashReports/{reportId}`) with strict loop prevention (max 1 report per error signature per session).
     - Provides an Owner Crash Diagnostics panel inside the Owner Command Center to inspect crash frequency and debug specific phone models.
  3. **Automated Scheduled Backup & One-Click Export Vault**:
     - Implements a scheduled daily snapshot routine that automatically aggregates trips, vehicles, drivers, fuel logs, and ledger records into `usersData/{uid}/backups/latest`.
     - Equips the fleet owner with a dedicated "ڈیٹا بیک اپ و ڈاؤن لوڈ" (Export & Backup Vault) button that generates and downloads a full timestamped JSON archive (`driver-dost-backup-YYYY-MM-DD.json`) with zero data loss.

- **Target Audience**: Pakistani commercial truckers, fleet managers, Warraich Goods Transport operations, and Google Play Store review engineers.

- **Key Value**: 100% Google Play Store policy approval without rejection risks, immediate visibility into field crashes on diverse driver smartphones, and ironclad data protection against cloud or hardware failure.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Driver Checking Challans or DLIMS*:
     - User navigates to Verify -> Vehicle / Licence / Challan.
     - At the very top, a high-contrast amber/slate notice displays: an official shield badge, the independent transport company statement, and a verified link to the official government portal.
     - User understands clearly that Driver Dost is a private helper tool that redirects to the government website for official records.
  2. *App Crash or Error in the Field*:
     - If an unhandled exception or plugin crash occurs on a driver's phone, the app boundary displays a polite recovery prompt (*"ایپ میں عارضی مسئلہ آیا ہے - ڈیٹا محفوظ ہے"*).
     - In the background, error telemetry with device model and stack trace is quietly transmitted to Firestore `/crashReports`.
  3. *Owner Exporting Fleet Backup*:
     - Authorized owner opens the Owner Menu / Settings and clicks *"مکمل ڈیٹا ڈاؤن لوڈ کریں"*.
     - The app packages all database documents and local records into a clean JSON file and triggers an instant browser download.

- **Visual Identity & Theme**:
  - Disclaimer Banner: High-contrast amber/slate container (`bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200`) with high readability.
  - Zero disruption: All existing home tiles, quick-ops layouts, and navigation tabs remain visually identical.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Prominent In-App Banner vs Hidden Footer Note**:
  - *Chosen Approach*: Place a high-contrast disclaimer card with official source links directly on verification screens above the input forms, plus links in the Privacy Policy and About modal.
  - *Why*: Google Play policy explicitly requires government disclosures to be prominent and conspicuous to users before interaction, not buried in footer links.
- **Decision 2: Firestore Crash Reporting vs Native SDK Overhead**:
  - *Chosen Approach*: Build a lightweight Firestore-backed crash telemetry service with device metadata and loop throttling.
  - *Why*: Works identically across both Web (PWA) and Capacitor Android builds without complex Gradle binary conflicts, giving the fleet owner an instant in-app dashboard to review crashes without opening Firebase Console.
- **Decision 3: Dual Backup Architecture (Automated Cloud Snapshot + Local File Export)**:
  - *Chosen Approach*: Automate daily cloud sync snapshots in Firestore under `usersData/{uid}/backups/latest` and provide a one-click local file download.
  - *Why*: Protects users who lose their physical device (cloud sync) while giving the owner independent offline sovereignty over all company business records (JSON file export).

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TECHNICAL DATA & FLOW ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────────┘

 [ Client App & Crash Boundaries ]
        │
        ├── [ VerifyView.tsx ] ─────────> High-contrast Play Store Disclaimer Banner
        │                                 & Official Portal Attribution Links
        │
        ├── [ crashReportingService.ts ]
        │       ├── Window 'error' & 'unhandledrejection' Listeners
        │       ├── React ErrorBoundary Integration
        │       ├── Device Hardware Metadata (Navigator, OS, Screen, Platform)
        │       └── In-Memory Throttle (1 event / signature / 10 min)
        │               │
        │               ▼
        │       [ Firestore: /crashReports/{reportId} ]
        │               ▲ (Owner-only Read & Purge)
        │
        └── [ backupService.ts ]
                ├── Daily Cloud Snapshot Schedule (usersData/{uid}/backups/latest)
                └── One-Click JSON Vault Generator (Client Download)
```

### Component & File Mapping

| Module / Area | Target Files | Key Changes |
|---|---|---|
| **Play Store Disclaimer Banners** | `src/components/views/VerifyView.tsx` | Replace low-contrast notes with high-contrast, prominent disclaimer cards with verified official source links for MTMIS, DLIMS, and PSCA. |
| **Permissions Rationale** | `src/components/views/DashcamView.tsx`, `src/components/views/NavigationView.tsx` | Add clear pre-permission disclosure modals explaining why Camera, Audio, or GPS is needed before requesting Android system dialogs. |
| **Crash Reporting Service** | `src/utils/crashReportingService.ts`, `src/components/ErrorBoundary.tsx` | Capture global runtime errors, device specs (OS, screen, userAgent), throttle spam, and write to Firestore `/crashReports`. |
| **Firestore Security Rules** | `firestore.rules`, `firebase-blueprint.json` | Add `/crashReports/{id}` schema: signed-in users can `create` with valid fields; `read`/`delete` strictly restricted to `isOwner()`. |
| **Data Backup & Export Service** | `src/utils/backupService.ts`, `src/components/BiltyLegalVaultModal.tsx` | Implement scheduled cloud sync snapshot and one-click JSON fleet archive download for authorized owner. |
| **Unit Tests** | `src/__tests__/crashAndCompliance.test.ts` | Verify disclaimer text, crash report payload formatting, and backup JSON serialization. |

---

## 5. Verification & Testing Plan

1. **Play Store Compliance Verification**:
   - Inspect all 3 verification sections (Vehicle, License, Challan) in light and dark mode; confirm disclaimer text and external official links are prominent, legible, and functional.
   - Confirm privacy policy and terms modal explicitly reference the independent entity status.
2. **Crash Diagnostics Testing**:
   - Trigger a simulated test exception and verify payload format in `crashReportingService.ts`.
   - Verify that duplicate errors within the throttle window are suppressed.
   - Verify Firestore rules enforce that non-owners cannot read or delete crash reports.
3. **Backup & Export Testing**:
   - Trigger the one-click backup generator; verify exported JSON contains valid trips, vehicles, drivers, and bilty records without data corruption.
   - Verify daily snapshot updates timestamp in `usersData/{uid}/backups/latest`.
4. **Build & Automated Testing**:
   - Run vitest test suite ensuring all tests pass.
   - Run `compile_applet` and `lint_applet` to confirm zero TypeScript compilation or linting errors.
