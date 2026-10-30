# Driver Dost: System Optimization, PWA Installation & Theme Refresh

Deliver a comprehensive update to Driver Dost focusing on high-contrast Charcoal & Emerald Slate visual design, streamlined single-line route controls in MapView, automated NHA 2026 toll calculation defaulting to Category 4, restoration of Chrome PWA menu installation, unified `WG-1001` Bilty numbering, and resolving side-menu cloud sync permissions and timeout failures.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following technical and UX choices were confirmed by the user during Phase 1:
> - **Color Scheme**: Charcoal and Emerald Slate with high-contrast text (`#121316` background, `#10b981` emerald accents, `#f8fafc` crisp text).
> - **Toll Plaza Rates**: Fully automated background sync with latest NHA 2026 schedule without manual refresh or swap buttons.
> - **Bilty Number Sequence**: Monotonic sequential numbering starting at **`WG-1001`** across online and offline modes, backed by atomic Firestore counter synchronization.
> - **Vehicle Selection**: Default vehicle category in Toll Plaza changed to **Category 4** (`Cat-4`).

---

## 1. Overview & Core Concept

- **What It Does**: Enhances the transport workflow for Pakistani fleet owners and commercial drivers with immediate, touch-first route planning, accurate toll computations, seamless PWA installation from Chrome, robust offline-to-cloud synchronization without permission errors, and an ergonomic Charcoal & Emerald Slate UI.
- **Target Audience**: Pakistani commercial transport drivers, dispatchers, and fleet owners operating across national motorways (M-1 to M-16) and highways.
- **Key Value**: Eradicates offline sync flakiness, eliminates confusing rate-refresh steps, guarantees strict non-colliding `WG-1001` document numbering, and provides daylight and night-driving legibility.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Map & Corridor Weather Navigation**:
   - User opens the Map view and sees origin and destination selectors unified cleanly on **one single horizontal row** (`From [City] ➔ To [City]`), saving screen height and eliminating multi-line form clutter.
   - Live weather corridor updates automatically for relevant cities along the route.

2. **Toll Plaza Calculator**:
   - User views the toll calculator with **Category 4 (Cat-4)** selected by default.
   - Manual "ریٹ ریفرش" (Rate Refresh) and "روٹ الٹیں" (Swap Route) buttons are removed.
   - NHA 2026 rates sync transparently in the background, rendering toll estimates immediately without extra clicks.

3. **Bilty Creation & Number Allocation**:
   - When generating a document (online or offline), the app allocates the next number starting from **`WG-1001`** (`WG-1001`, `WG-1002`, `WG-1003`).
   - When switching from offline to online, numbers maintain their sequence, and the cloud counter advances atomically.

4. **PWA Installation**:
   - Chrome browser users can tap the browser menu (3 dots) and immediately see the native **"Install app" / "Install Driver Dost"** option.

5. **Cloud Sync & Side Menu Diagnostics**:
   - In the side menu, triggering sync or background auto-sync completes without permission errors or premature 3-second timeouts.

### Visual Identity & Theme (Charcoal & Emerald Slate)

```
[ PALETTE SPECIFICATION: CHARCOAL & EMERALD SLATE ]

Dark Canvas:      #121316  (Deep Slate Charcoal)
Card / Surface:   #1a1c22  (Elevated Charcoal Card)
Card Inset:       #22252c  (Secondary Input Container)
Emerald Accent:   #10b981  (Primary Interactive Accent)
Emerald Highlight:#34d399  (High-Visibility Urgency & Badges)
Emerald Glow:     #064e3b  (Rich Badge Background)
Text Primary:     #f8fafc  (Slate Pure White - High Contrast)
Text Secondary:   #cbd5e1  (Light Slate - Subtitles & Labels)
Border Subtle:    #2d313b  (High-Contrast Container Outlines)
```

- **Legibility Overhaul**: Eliminates light text on light backgrounds (as seen in `VehicleAccountView` Section 1) and dark-on-dark unreadable inputs, strictly adhering to WCAG AAA contrast for outdoor cab environments.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Single-Line Map Route Inputs**:
  - *Chosen Approach*: Place origin and destination in a compact flex/grid container side-by-side with a central directional arrow.
  - *Why*: Reduces vertical thumb footprint by ~60px, bringing the interactive weather advisory and route checkpoints directly into the viewport without scrolling.
  
- **Decision 2: Automated Background Toll Sync & Category 4 Default**:
  - *Chosen Approach*: Automatically check and update NHA 2026 rates on view mount; set default class to `Cat-4`. Remove manual buttons.
  - *Why*: Commercial drivers rarely need to manually trigger rate syncs; automated background loading ensures the latest data is always active with zero friction.

- **Decision 3: PWA Manifest Display Mode**:
  - *Chosen Approach*: Change `"display": "standalone"` in `public/manifest.json`.
  - *Why*: Setting display to `"browser"` in an earlier turn caused Chrome to suppress PWA installability. `"standalone"` preserves phone status bar visibility (via `fitsSystemWindows` / theme-color) while re-enabling Chrome's browser menu install button.

- **Decision 4: Atomic Sequential Bilty Numbering (`WG-1001`)**:
  - *Chosen Approach*: Single unified sequence format `WG-XXXX` (starting at 1001). Online transactions increment Firestore `counters/biltyCounter`. Offline generation reads local max sequence + 1. Upon cloud synchronization, the cloud counter is advanced to `Math.max(cloudCounter, localMax)` to prevent collisions.
  - *Why*: Satisfies user requirement for clean sequential numbers without erratic offline random hashes, while remaining collision-safe across devices.

- **Decision 5: Fix Cloud Sync Permissions & Timeout Flakes**:
  - *Chosen Approach*:
    1. Update `firestore.rules` and `extractPublicBiltyVerification` so public verification documents allow POD status fields without triggering `permission-denied`.
    2. Guard offline queue settings actions to only run if authenticated user is the verified owner.
    3. Increase Firestore network timeout from 3000ms to 8000ms with jittered retry to accommodate cellular mobile latency in Pakistan.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DRIVER DOST APP                                │
├───────────────────────────────────┬────────────────────────────────────┤
│           UI Views                │           Core Engines             │
│                                   │                                    │
│  ┌─────────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ MapView                     │  │  │ PWA Engine (manifest.json)   │  │
│  │ • 1-Line Origin ➔ Dest      │  │  │ • display: standalone        │  │
│  │ • Weather Corridor Filter   │  │  │ • Chrome Menu Installable    │  │
│  └─────────────────────────────┘  │  └──────────────────────────────┘  │
│                                   │                                    │
│  ┌─────────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ TollPlazaView               │  │  │ Bilty Sequence Engine        │  │
│  │ • Default Category 4        │  │  │ • Start WG-1001              │  │
│  │ • Auto NHA 2026 sync        │  │  │ • Atomic Firestore Counter   │  │
│  │ • Removed Refresh/Swap btns │  │  │ • Local Monotonic Fallback   │  │
│  └─────────────────────────────┘  │  └──────────────────────────────┘  │
│                                   │                                    │
│  ┌─────────────────────────────┐  │  ┌──────────────────────────────┐  │
│  │ Charcoal & Emerald Slate    │  │  │ Cloud Sync & Offline Queue   │  │
│  │ • High-Contrast Tokens      │  │  │ • 8s network timeout         │  │
│  │ • Fixed Invisible Sections  │  │  │ • Public Bilty Schema Fix    │  │
│  └─────────────────────────────┘  │  │ • Protected Owner Settings   │  │
│                                   │  └──────────────────────────────┘  │
└───────────────────────────────────┴────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │            FIRESTORE & BACKEND PERSISTENCE             │
        │ • /counters/biltyCounter (atomic sequence)            │
        │ • /users/{uid}/collections/* (private isolated data)  │
        │ • /publicBiltyVerifications/* (public QR tracking)    │
        │ • /settings/companyProfile (owner-only settings)      │
        └────────────────────────────────────────────────────────┘
```

### Data Model & State Changes

1. **Bilty Number Allocation (`src/utils/storage.ts`)**:
   - Format: `WG-${seq}` (starting at 1001).
   - Baseline sequence: 1001.
   - Firestore doc: `counters/biltyCounter` storing `{ currentValue: number, updatedAt: string }`.

2. **Offline Queue Sync Resilience (`src/utils/storage.ts`)**:
   - `withTimeout` default increased from 3000ms to 8000ms.
   - `processOfflineQueue`:
     - Checks user auth before firing subcollection updates.
     - Ignores or safely logs permission conflicts without leaving permanent hanging queue counters.
     - Accurately strips disallowed fields before saving to `publicBiltyVerifications`.

3. **PWA Configuration (`public/manifest.json`)**:
   - `"display": "standalone"`
   - `"display_override": ["standalone", "minimal-ui"]`
   - Keeps all user-uploaded icons and assets intact.

---

## 5. Verification Plan

1. **Automated Unit Tests**:
   - Run `npm test` across all Vitest suites (ensuring `storage.test.ts`, `biltySecurity.test.ts`, `tollMatrix.test.ts` pass).
2. **PWA Validation**:
   - Verify `manifest.json` schema and inspect service worker registration.
3. **TypeScript & Build Verification**:
   - Run `npm run lint` and `npm run build` (`compile_applet`) to ensure clean compilation.
4. **Manual Flow Checks**:
   - Test MapView single-line selector layout.
   - Verify TollPlazaView Category 4 default and absence of refresh/swap buttons.
   - Verify Bilty sequence generator produces `WG-1001` upwards.
   - Test sync queue resilience and high-contrast dark theme readability.
