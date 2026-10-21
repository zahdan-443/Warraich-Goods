# Ledger (حساب کتاب) Feature Implementation Plan

## Overview
A complete financial ledger system for Pakistani transport & logistics operators, seamlessly integrating Party Ledgers, Broker Ledgers, Vehicle Profit & Loss analytics, Trip Cost Calculator profitability previews, WhatsApp payment reminders, Direct Calling, Receipt OCR, and safe Firestore/offline synchronization with strict Bilty access control.

---

## 1. Planned Files to Create & Edit

### Files to Create:
1. **`src/utils/ledgerStorage.ts`**:
   - Core data operations, offline local caching (IndexedDB/safeStorage fallback), and Firestore sync for `users/{uid}/ledgerParties`, `ledgerBrokers`, `vehicleExpenses`, and `vehicleIncome`.
   - Deterministic transaction ID generation to eliminate duplicate entries during synchronization.
   - Bilty linking: Automatic linking of consignor and consignee party transactions from Bilty records (total freight, advance, payable balance) only when `isBiltyAuthorized()` is true.
   - Unauthorized user boundary: 100% silent omission of Bilty-sourced data with zero references to "Bilty" in labels or text.
   - Financial aggregators: Running balances, Top Parties ranking by volume, and Vehicle Profit/Loss with profit per KM (or "N/A" for zero distance).
   - WhatsApp message formatter in bilingual Urdu & English with invoice breakdown and direct call link builder.

2. **`src/components/views/LedgerView.tsx`**:
   - Main Ledger screen with 3 sub-tabs:
     - **Party Ledger (کھاتہ پارٹی)**: Parties list, running balances, Top Parties ranking cards, transaction history (Debit/Credit), manual entry modal, direct call button (`tel:`), WhatsApp payment reminder sheet.
     - **Broker Ledger (بروکر کھاتہ)**: Broker profiles, commission tracking, load/reference notes, paid/unpaid status toggle, manual entries, direct call, WhatsApp reminder.
     - **Vehicle Profit/Loss (گاڑی نفع و نقصان)**: Vehicle selector, custom date ranges (Today, This Week, This Month, Custom Date Range), aggregate income, fuel/toll expenses, net profit/loss with Green/Red indicators, Profit per KM calculation (with "N/A" for 0 km), and receipt scanning.

### Files to Edit:
1. **`src/types.ts`**:
   - Add `'ledger'` to `ActiveTab`.
   - Define TypeScript interfaces: `LedgerParty`, `PartyTransaction`, `LedgerBroker`, `BrokerTransaction`, `VehicleExpenseEntry`, `VehicleIncomeEntry`, `LedgerDateRange`.
2. **`src/components/Navigation.tsx`**:
   - Add the Ledger item with book/receipt icon (`BookOpen` / `ReceiptText`) with bilingual Urdu "حساب کتاب" and English "Ledger".
3. **`src/components/views/HomeView.tsx`**:
   - Add a high-visibility Ledger shortcut card in the Home quick actions grid.
4. **`src/components/views/TripCostView.tsx`**:
   - Add optional "Expected Freight Income" (متوقع کرایہ آمدن) input in PKR.
   - Add real-time "Trip Profitability Preview" before saving:
     - Expected Income
     - Total Expenses (Fuel + Toll + Loading + Driver + Other)
     - Net Profit / Loss (Green badge for profit, Red badge for loss)
     - Profit per KM (PKR / KM, or "N/A" when distance is 0)
5. **`src/components/CameraOcrInput.tsx`**:
   - Add `mode='receipt'` / `'expense'` support to extract numeric amounts and currency totals from paper receipts, fuel chits, and workshop bills using Tesseract OCR.
6. **`src/App.tsx`**:
   - Register the active tab `'ledger'`, pass required state props (`user`, `isBiltyAuthorized`, `trips`, `vehicles`, `lang`), and handle navigation.
7. **`firestore.rules`**:
   - Add user-scoped authorization rules for `ledgerParties`, `ledgerBrokers`, `vehicleExpenses`, and `vehicleIncome`.

---

## 2. Priority Implementation Phases

### Phase 1: Profit per KM & Trip Profitability Preview
- Enhance `TripCostView.tsx` with optional expected freight income field.
- Render live Net Profit/Loss and Profit per KM badge preview before saving the trip.
- Handle zero-distance cases by displaying "N/A".

### Phase 2: WhatsApp & Direct Call Reminders
- Add instant WhatsApp payment reminder generators in `ledgerStorage.ts` for both Party and Broker ledgers.
- Pre-fill professional bilingual messages with party name, pending balance in PKR, invoice reference, and transport company signature.
- Add one-tap `tel:` direct call buttons for party and broker mobile numbers.

### Phase 3: Top Parties Ranking
- Calculate aggregate charged transaction volume across all party records.
- Display Top 5 Parties podium/ranking cards on the Party Ledger dashboard with total volume and balance indicators.

### Phase 4: Receipt OCR Integration
- Enhance `CameraOcrInput.tsx` with expense/receipt recognition logic.
- Integrate OCR into manual expense entries in Vehicle Profit/Loss and Party Ledger, allowing drivers to scan receipts and prefill the amount before saving.

### Phase 5: Base Ledger, Bilty Integration & Firestore Sync
- Implement Party Ledger & Broker Ledger full CRUD (add, edit, transaction history, running balance).
- Connect Bilty auto-linking strictly for users where `isBiltyAuthorized()` is true, ensuring zero mentions of "Bilty" for unauthorized users.
- Connect Firestore sync (`users/{uid}/...`) with offline IndexedDB fallback.

---

## 3. Verification & Quality Assurance
- Automated tests in `src/__tests__/ledger.test.ts` verifying:
  - Profit per KM calculation and zero distance "N/A" handling.
  - WhatsApp reminder text generation.
  - Top Parties ranking logic.
  - Bilty data isolation (no bilty data or labels for unauthorized users).
  - Storage and deterministic deduplication.
- Run `npm run lint` (`tsc --noEmit`) and `npm run test` (Vitest).
- Run `compile_applet` to confirm successful production compilation.
