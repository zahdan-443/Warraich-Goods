# Driver Dost

**Driver Dost** is a free, bilingual (Urdu / English) road-freight and fleet utility app for drivers, truck owners and transport managers in Pakistan. It helps you plan trips, estimate fuel and toll costs, keep fleet records and stay informed about weather and road conditions, and it keeps working when the network does not.

Published by **Warraich Goods Transport Company**, Samundri, Punjab, Pakistan.

- Android package: `com.warraichgoods.driverdost`
- Web app: <https://zahdan-443.github.io/Warraich-Goods/>
- Privacy Policy: [`public/privacy.html`](public/privacy.html)
- Terms & Conditions: [`public/terms.html`](public/terms.html)

> Driver Dost is an independent, privately owned app. It is **not** a government app and is not affiliated with any government body.

## Features

| Area | What you get |
|---|---|
| Trip planning | Fuel and trip-cost calculator, return-trip option, extra route costs, PKR breakdown |
| Tolls and routes | Motorway/highway toll estimates, route comparison where more than one real route exists |
| Weather and fuel | Weather along your route with cargo-risk advisory, reference fuel rates |
| Navigation | Live GPS navigation help (foreground only, opt-in) |
| Road hazards | Driver-reported hazards (checkpoint, flooding, accident, closure, traffic) that expire after 24 hours |
| Fleet records | Vehicles, drivers, fuel log, per-vehicle expenses |
| Reminders | Document expiry reminders (registration, permit, fitness, licence) at 30 / 15 / 7 days |
| Dashcam | Optional, manual-start recording with a persistent notification; clips stay on your device |
| Documents | OCR scanning, PDF export, WhatsApp sharing, export with CNIC/phone masking |
| Government links | Quick links to the MTMIS, DLIMS and e-challan portals (third-party sites) |
| Languages | Urdu and English with full right-to-left layout |
| Offline-first | Works without internet; data syncs when you are back online and signed in |
| Guest mode | Use the core tools immediately, no sign-in required |

## Permissions

| Permission | Why |
|---|---|
| Internet / network state | Weather, routing, fuel rates, optional cloud sync |
| Location (foreground only) | Navigation, nearby weather/tolls, hazard reports. Never tracked in the background. Optional: you can pick cities manually |
| Camera | Document scanning (OCR) and the optional dashcam |
| Microphone | Dashcam audio only |
| Notifications | Optional daily digest and document-expiry reminders |

## Privacy at a glance

- Guest mode: records stay on your device.
- Signed in with Google: records sync to your private account on Google Firebase.
- Dashcam recordings never leave your device.
- Third-party services that receive coordinates or requests: Open-Meteo (weather) and OSRM (routing).
- No ads, no data selling. Full details are in the [Privacy Policy](public/privacy.html).

## Restricted business modules

Some business modules are restricted to accounts authorised by the owner and are not part of the public feature set. They may be offered as a paid service in future. Core everyday tools are intended to stay free. See section 12 of the [Terms](public/terms.html).

## Roadmap

- Business ledger: party and broker accounts, per-vehicle profit and loss
- Maintenance reminders alongside document expiry
- Receipt scanning for vehicle expenses

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS, Firebase (Authentication + Firestore), Capacitor 8 (Android), Vitest. Web build is deployed to GitHub Pages; the Android APK is built with GitHub Actions.

## Development

Requirements: **Node.js 22 or newer** (required by the Capacitor CLI).

```bash
npm ci
cp .env.example .env     # then fill in your Firebase web config
npm run dev              # local dev server
npm run validate         # type-check + tests
npm run pipeline         # lint + test + production build
```

Environment variables (`.env`, and GitHub repository secrets for CI):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID   # optional
```

The app stops with a clear console error if a required variable is missing. Firebase web keys are not secret, but Firestore security rules (`firestore.rules`) must stay deployed and restrictive.

## Android release build

The **Android APK Build & Release** workflow (`.github/workflows/build-apk.yml`) builds a signed release APK. Add these repository secrets first:

```
ANDROID_KEYSTORE_BASE64     # base64 of your release .jks, single line, no spaces
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
```

The version is read from `package.json` (`version`); `versionCode` is derived from it. To release, change only that one field. **Keep your keystore and its passwords backed up in more than one safe place.** If it is lost, existing installs cannot be updated.

After a build, check the fingerprint printed in the workflow log and register it (SHA-1 and SHA-256) in the Firebase console for `com.warraichgoods.driverdost`.

## Support

Email: warraichgoods43@gmail.com
Phone: +92 300 5370443
Address: Near General Bus Stand, Samundri, Faisalabad, Punjab, Pakistan

## Copyright

© 2026 Warraich Goods Transport Company. All rights reserved. See the Terms & Conditions for the licence to use the app.
