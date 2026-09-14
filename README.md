Driver Dost — Road Freight & Fleet Management App
Driver Dost is a bilingual (Urdu & English) web and mobile application built for Warraich Goods Transport Company to digitize and manage day-to-day road freight and fleet operations in Pakistan. It is deployed as a Progressive Web App (installable on Android/desktop) and also packaged as a native Android app via Capacitor.
Core Purpose
The app replaces manual paper-based logistics record-keeping (bilty slips, trip cost sheets, toll receipts, vehicle logs) with a structured digital system, while remaining fully usable offline in the field.
Key Features
Bilty (Consignment Note) Generator — create, print, and share professional cargo receipts with company branding, with role-based access control over who can generate them.
Trip Cost Calculator — computes freight cost estimates based on route, distance, and toll charges.
Toll Estimation — built-in toll-rate matrix for Pakistani highways/motorways.
Fleet & Vehicle Management — tracks vehicles, transporters/drivers, and vehicle-wise account/expense history.
Fuel Log Tracking — records fuel expenses per vehicle/trip.
PDF Export & WhatsApp Sharing — trip cost sheets, vehicle accounts, and receipts can be exported as PDFs and shared directly via WhatsApp.
Bilingual UI (Urdu/English) with full right-to-left (RTL) layout support for Urdu — designed for a local Pakistani trucking/transport audience.
Guest Mode — the app is usable immediately without requiring sign-in, lowering the barrier for non-technical drivers/staff.
Google Sign-In (Firebase Authentication) — for authenticated roles (Owner/Driver) with cloud data sync.
Offline-First Architecture — a service worker and local data queue allow uninterrupted use without internet, syncing to the cloud (Firebase/Firestore) once connectivity returns.
Privacy-Conscious Data Export — includes masking utilities for sensitive fields (CNIC, phone numbers, personal names) when exporting or sharing data externally.
Owner Control Panel — a dedicated admin area for the business owner to manage bilty access permissions, view business reports, and configure toll rates.
Technical Stack
Built with React 19 + TypeScript + Vite, styled with Tailwind CSS, backed by Firebase (Authentication + Firestore), wrapped as a native Android app using Capacitor, and deployed as a static site via GitHub Pages with automated CI/CD (GitHub Actions).
Roadmap
Currently in progress: an in-app "Driver Dost AI" advisor — a conversational assistant (powered by the Gemini API) that will answer freight-cost, bilty, and route-related questions using the signed-in user's own trip and vehicle data.
