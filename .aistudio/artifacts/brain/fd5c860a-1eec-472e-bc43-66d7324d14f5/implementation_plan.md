# Bilty System Comprehensive Legal Vault & Production Refinements

Enterprise-grade enhancements for the Bilty (Consignment Note) system: secure legal attachments vault (driver, vehicle, sender, receiver photos, CNICs, and call recordings), full ZIP package download, direct PDF file dispatch for WhatsApp sharing, Urdu RTL phone number separator auto-formatting, offline PDF layout overwrite protection, and strict 4-digit Bilty numbering (WG-XXXX).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been confirmed by the user:

- **Confirmed Decision 1 (Legal Vault ZIP Contents)**: When generating the Bilty archive ZIP, the package will bundle the official high-resolution Bilty PDF together with all uploaded legal documents: Driver Photo, Driver License, Driver CNIC, Vehicle Photo, Sender CNIC, Sender Photo, Receiver CNIC, Receiver Photo, and audio Call Recordings.
- **Confirmed Decision 2 (WhatsApp PDF File Sharing)**: On the Bilty generation and preview pages, clicking "Share in WhatsApp" will dispatch the generated PDF directly as an attached document file using the native device Web Share API and Capacitor Share engine, completely eliminating raw text-only links.
- **Confirmed Decision 3 (Offline Legal Attachments)**: All legal photos and call recordings can be captured or uploaded offline, cached securely in device local storage, and automatically synced to Cloud Firestore when network connectivity is established.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       BILTY ENHANCEMENT ARCHITECTURE                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     ▼                                 ▼                                 ▼
[ 1. LEGAL ATTACHMENTS VAULT ]   [ 2. WHATSAPP PDF DISPATCH ]    [ 3. NUMBER & LAYOUT FIXES ]
• Driver Photo, License, CNIC    • Direct PDF file share         • Auto slash after 4 digits
• Vehicle (Gari) Photo           • Web Share / Capacitor Share   • RTL BiDi unicode-bidi isolate
• Sender / Receiver Photo & CNIC • Zero text-only regression     • Fix offline text collision
• Call Audio Recordings (Voice)  • A4 print-ready output         • WG-XXXX (strict 4 digits)
• Kept hidden from Bilty receipt • Instant one-click share       • Website verification sync
     │                                 │                                 │
     └─────────────────────────────────┼─────────────────────────────────┘
                                       │
     ┌─────────────────────────────────┴─────────────────────────────────┐
     ▼                                                                   ▼
[ 4. ZIP ARCHIVE GENERATOR (JSZip) ]              [ 5. CLOUD & OFFLINE PERSISTENCE ]
• Bilty PDF + All Attached Files                  • Local device IndexedDB/localStorage
• Organized folder structure inside ZIP           • Background cloud synchronization
• Download per Bilty on demand                    • Accessible only to authorized owner
```

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Legal Attachments Vault**: Enables optional upload during Bilty creation and post-creation editing of critical compliance assets: Driver Photo, Driver License, Driver CNIC, Vehicle Photo, Sender Photo, Sender CNIC, Receiver Photo, Receiver CNIC, and audio Call Recordings.
  2. **Zero Receipt Bleed**: Keeps all legal and audio attachments strictly in the backend vault for dispute resolution, ensuring the printable/shareable Bilty document remains clean and uncluttered.
  3. **ZIP Download**: Allows the authorized owner to download a complete `.zip` archive per Bilty containing the generated PDF along with all attached photos and audio recordings.
  4. **Direct WhatsApp PDF Sharing**: Fixes WhatsApp sharing so it sends the actual `.pdf` document file directly into WhatsApp rather than converting to plain text.
  5. **Auto Phone Separator & RTL Fix**: Automatically places a separator (`-`) after the 4-digit mobile network operator code (e.g., `0300-1234567`) and enforces bidirectional isolation (`unicode-bidi: isolate; direction: ltr;`) so the slash/dash never jumps or renders backwards in Urdu RTL prints.
  6. **Offline PDF Overwrite Fix**: Fixes the offline layout rendering where party names and numbers overlapped existing text by standardizing container flex sizing, explicit line-heights, and offline font metrics.
  7. **Strict 4-Digit Bilty Ceiling**: Restricts Bilty numbers strictly to `WG-` followed by exactly 4 digits (e.g., `WG-1001` to `WG-9999`) across both online transactions and offline counters for consistent website verification.

- **Target Audience**: Warraich Goods Transport Company fleet managers, booking clerks, and authorized company owners managing intercity logistics.

- **Key Value**: Comprehensive legal protection against cargo disputes, seamless WhatsApp document sharing for customers, and error-free Urdu typography.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Bilty Creation Flow*:
     - The user enters vehicle, driver, route, sender, receiver, and cargo details.
     - Mobile numbers auto-format smoothly as the user types (4 operator digits + separator + 7 subscriber digits).
     - An optional "Legal Evidence & Attachments" collapsible card allows quick attachment of photos (Driver, License, CNIC, Vehicle, Sender, Receiver) and call recordings (or in-app audio recorder/file upload).
     - Upon creation, a 4-digit number (e.g. `WG-1045`) is allocated.
  2. *Post-Creation Vault Management*:
     - In "All Bilties" or Bilty Details view, an "Attachments & Legal Vault" button lets the owner add, view, or replace documents at any time.
  3. *ZIP Archive Export*:
     - In the Bilty preview/card, clicking "Download Vault (ZIP)" triggers client-side ZIP packaging containing `Bilty_WG-1045.pdf` and all related media with descriptive filenames (`Driver_Photo.jpg`, `Driver_CNIC.jpg`, `Call_Recording_1.mp3`, etc.).
  4. *Direct WhatsApp PDF Share*:
     - Clicking "Share in WhatsApp" renders the high-fidelity PDF and immediately opens the native device share sheet targeting WhatsApp with the PDF file attached.

- **Visual Identity & Theme**:
  - Consistent with Driver Dost's industrial palette: Deep Navy Slate (`#0f2942`), Gold Ochre (`#f59e0b`), Warm Cream canvas (`#fdfbf7`), and Emerald accents.
  - Urdu typography uses Nastaleeq fonts with strict `dir="rtl"` layout, while phone numbers and numbers use JetBrains Mono with explicit LTR overrides.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side JSZip Packaging**:
  - *Chosen Approach*: Use `jszip` for in-browser and on-device compression of the Bilty PDF, images, and audio files.
  - *Why*: Instant generation with zero server processing latency, works 100% offline, and does not consume Cloud Function quotas.
- **Decision 2: Phone Number BiDi Isolation**:
  - *Chosen Approach*: Auto-format phone input on change to `03XX-XXXXXXX` and render in prints inside `<span dir="ltr" style="direction: ltr; unicode-bidi: isolate; display: inline-block;">`.
  - *Why*: Resolves the Arabic/Urdu Bidirectional text engine glitch where hyphens or slashes get flipped to the end of the string.
- **Decision 3: Strict 4-Digit Number Space (WG-1001 to WG-9999)**:
  - *Chosen Approach*: Constrain online Firestore atomic transactions and offline monotonic fallback sequence strictly between 1001 and 9999.
  - *Why*: Aligns with physical receipt books and guarantees seamless lookup on the company verification website (`zahdan-443.github.io`).

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA MODEL & PIPELINE                              │
└─────────────────────────────────────────────────────────────────────────────┘

 [ BiltyRecord ]
 ├── id, biltyNo (WG-XXXX strictly 4 digits)
 ├── vehicleNo, driverName, mobileNo
 ├── senderName, senderMobile (03XX-XXXXXXX), senderCnic
 ├── receiverName, receiverMobile (03XX-XXXXXXX)
 ├── freight financials (total, advance, payable)
 └── legalVault?: {
       driverPhoto?: string (base64 / storage URL)
       driverLicense?: string
       driverCnic?: string
       vehiclePhoto?: string
       senderCnic?: string
       senderPhoto?: string
       receiverCnic?: string
       receiverPhoto?: string
       callRecordings?: Array<{ id: string; name: string; url: string; date: string }>
     }
          │
          ├──> PrintableBilty.tsx (Excludes legalVault; renders only official receipt)
          ├──> WhatsApp Dispatch (Shares generated PDF file directly via Web Share API)
          ├──> Legal Vault Modal (Allows view/edit/upload anytime)
          └──> JSZip Bundler (Exports Bilty_WG-XXXX.pdf + all vault media into a .zip)
```

### State & Handler Mapping
1. `formatPakistaniMobile(val: string)`: Sanitizes input to digits only, auto-inserts separator after first 4 digits, caps at 11 digits (`03XX-XXXXXXX`).
2. `allocateNextBiltyNumber()`: Formats counter strictly as `WG-${String(nextVal).padStart(4, '0')}` clamped to 4 digits.
3. `handleWhatsAppShare(record)`: Generates PDF blob, constructs `new File([pdfBlob], 'Bilty_WG-XXXX.pdf', { type: 'application/pdf' })`, and calls `navigator.share({ files: [pdfFile], title: ... })` or Capacitor Share.
4. `downloadBiltyLegalZip(record)`: Instantiates JSZip, adds `Bilty_${record.biltyNo}.pdf`, iterates `record.legalVault`, converts images/audio to blobs, adds them with clear names, and triggers `saveAs` / download.
