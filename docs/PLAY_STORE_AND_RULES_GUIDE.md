# Play Console Data Safety, Reviewer Access, Spark TTL & External Verification Site Guide

Reference guide covering external console steps outside the app repository.

---

## 1. Google Play Data Safety Form Answers

Keep these aligned with `public/privacy.html` and in-app Privacy Policy:

- **Does your app collect or share any required user data types?** **Yes** (only when user signs in with Google or submits optional reports; Guest mode is 100% local).
- **Is all user data collected by your app encrypted in transit?** **Yes** (HTTPS / TLS via Google Firebase & external APIs).
- **Do you provide a way for users to request that their data is deleted?** **Yes** — inside Settings (`Account Deletion`) and at `delete-account.html`.
- **Data types collected (App Functionality / Account Management):**
  - **Personal info -> Name & Email address**: Collected, **Optional** (only upon Google Sign-In and branch staff authorization; salutation & display name stored for authorized branch access).
  - **Financial / Business logs -> Purchase / Ledger / Freight receipts**: Collected when signed in for Firebase cloud sync (Trips, Fleet, Personal Khata, and Branch Bilties/Adda Bills). Not shared with third parties.
  - **Photos & Audio (App Functionality, Optional, Creator-Only)**: ID-card / document photos and short voice notes (`<= 600 KB`, `<= 90s`) optionally attached by the App Owner only. Stored isolated under `users/{creatorUid}/biltyAttachments` (excluded from public links, staff access, and cloud backups) and automatically deleted after **180 days (6 months)** unless marked Legal Hold.
  - **Approximate Location (3-decimal precision / ~110 m)**: Used on-demand for routing/weather/hazard reports; **ephemeral / not sold**, never tracked in background.
  - **App info & performance -> Crash logs**: **Optional / Disabled by default** (sent only if the user explicitly opts in via Settings).
- **Data Sharing**: **No data is sold or shared with advertisers or third-party data brokers.**

---

## 2. Google Play App Access / Reviewer Notes

Because multi-branch dispatch screens sit behind Google Sign-In + allowlisted branch access, reviewers will otherwise only see Guest mode tools (Trip Cost, Fleet, Routes, Tolls, Khata) and the no-access diagnostic screen after Google login.

1. **Create a Demo Reviewer Google Account** (e.g., `reviewer.driverdost@gmail.com` or your Play review test Gmail) and sign in once or capture its exact Gmail address.
2. Open the App Creator panel -> **Branches -> Demo Branch** (or a non-sensitive test branch) -> **Staff List**.
3. Add the exact reviewer Gmail with:
   - **Assigned Name**: `Play Reviewer` (`Salutation: Mr`)
   - **Preset Role**: `Viewer (Read-Only)` (`viewAllBilties: true`, `viewBranchReports: true`, `createBilty: false`, `manageBranchStaff: false`).
   - Seed 2–3 non-sensitive sample Bilties (using dummy names like `"Demo Traders"`, no real CNICs or phones) and 1 sample Pending Freight + Bill in that demo branch.
   - Note: `Viewer` never sees attachments (`Creator-only`) and cannot mutate records or access staff lists.
4. **Paste into Play Console -> App Content -> App Access -> Instructions**:
   > *"Core Trip Cost Calculator, Fleet Directory, Routes, Toll Calculator, Personal Khata Ledger, and Public QR Verification work immediately without login in Guest mode. To inspect the authenticated multi-branch viewer portal, tap Sign In with Google using the provided demo reviewer credentials (added as Read-Only Viewer on a demo branch). Bilty attachment uploads and cross-branch admin controls are intentionally restricted exclusively to the Company Creator account."*

---

## 3. Spark Plan Firestore TTL Setup (`expireAt`)

Firestore **Time-to-Live (TTL)** works on the **Spark (free) tier** (TTL deletions count toward the free 20,000 deletes/day limit).

1. Every attachment document in `users/{creatorUid}/biltyAttachments/{id}` stores `expireAt` as a native **Firestore `Timestamp`** (`createdAt + 180 days`, pushed `+50 years` when `legalHold: true`).
2. In **Firebase Console -> Firestore Database -> Time-to-live (TTL)**:
   - Click **Create policy**.
   - **Collection group**: `biltyAttachments`
   - **Timestamp field**: `expireAt`
   - Click **Create**.
3. Once active (may take up to 24 hours for GCP index build), Firestore deletes expired attachment documents automatically as a server-side safety net alongside the app's once-daily cleanup.

---

## 4. External Verification Website (`https://warraichgoods.eu.cc`) Update Snippet

Because the external verification site lives in its own repository (`Warraichgoodstransportcompany`), apply these two updates there so QR scans and manual lookups support both 5+ digit Head Office Bilty numbers (`WG-10000+`) and branch-coded numbers (`WG-<CODE>-<SEQ>`):

```js
// 1. Accepted Bilty number format parser (supports Head Office 4+ digits & Branch 2-3 letter codes)
export function normalizePublicBiltyInput(raw) {
  const cleaned = String(raw || '').trim().toUpperCase();
  const match = cleaned.match(/^WG-(?:([A-Z]{2,3})-)?(\d{4,})$/);
  if (!match) return null;
  return match[1] ? `WG-${match[1]}-${match[2]}` : `WG-${match[2]}`;
}

// 2. Single-document public lookup (exact document ID match)
import { doc, getDoc } from 'firebase/firestore';

export async function lookupPublicBilty(db, rawInput) {
  const docId = normalizePublicBiltyInput(rawInput);
  if (!docId) throw new Error('Invalid Bilty format. Expected WG-1001 or WG-LHR-1001');

  const snap = await getDoc(doc(db, 'publicBiltyVerifications', docId));
  if (!snap.exists()) return null;

  // Render strictly the 8 public non-PII fields; safely ignore optional branchId/biltyId metadata
  const data = snap.data();
  return {
    biltyNo: data.biltyNo,
    biltyDate: data.biltyDate,
    origin: data.origin,
    destination: data.destination,
    goodsDescription: data.goodsDescription,
    weightOrQty: data.weightOrQty,
    vehicleNo: data.vehicleNo,
    status: data.status
  };
}
```
