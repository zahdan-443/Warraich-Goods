# Firestore Security Rules RBAC Test Matrix (Section 7.6)

All 11 caller personas tested against all 10 resource categories in `firestore.rules`.
Automated structural + behavioral policy verification lives in:
- `src/__tests__/firestoreRules.test.ts`
- `scripts/test-firestore-rules-emulator.mjs`

## 1. Caller Personas
1. **Unauthenticated (`anon`)**
2. **Signed-in stranger (`stranger@gmail.com`)**
3. **Unverified email caller (`email_verified == false`)**
4. **Revoked staff (`status == 'revoked'` on branch A)**
5. **Paused branch staff (`branchActive == false` on branch A)**
6. **Branch A `viewer` (`viewAllBilties: true, viewBranchReports: true`)**
7. **Branch A `munshi` (`createBilty: true, viewAllBilties: true, editDeleteBilty: false`)**
8. **Branch A `accountant` (`viewAllBilties: true, khataAccess: true, viewBranchReports: true`)**
9. **Branch A `branch_manager` (`createBilty: true, editDeleteBilty: true, viewAllBilties: true, manageBranchStaff: false`)**
10. **Branch A `branch_owner` (`presetRole: 'branch_owner'`, non-creator)**
11. **App Creator (`warraichgoods43@gmail.com` with `email_verified == true`)**

---

## 2. Resource Category Permission Matrix

| Resource Category | Unauth / Stranger / Unverified | Revoked / Paused Branch | `viewer` (Branch A) | `munshi` (Branch A) | `accountant` (Branch A) | `branch_manager` (Branch A) | `branch_owner` (Branch A) | App Creator |
|---|---|---|---|---|---|---|---|---|
| **1. `branches/{branchId}`** | DENY | DENY | Read A only | Read A only | Read A only | Read A only | Read A; Update A contact fields ONLY (NO `ntn`, `companyHeader*`, `proprietorName*`, `branchCode`, `active`, `startingBiltySeq`, `ownerEmail`) | Full CRUD on all branches |
| **2. `branches/{branchId}/members/{emailKey}`** | DENY (stranger only sees own doc if exists via `get` or `collectionGroup`) | Own doc `get` / self `delete` only | Own doc `get` / self `delete` only | Own doc `get` / self `delete` only | Own doc `get` / self `delete` only | Own doc `get` / self `delete` only | Read/Write A staff (`munshi`/`manager`/`accountant`/`viewer`, `manageBranchStaff == false`); DENY editing self, granting `branch_owner`, or adding Creator email | Full CRUD except adding Creator email |
| **3. `branches/B/...` (Cross-Branch Isolation)** | DENY | DENY | DENY | DENY | DENY | DENY | DENY (Branch A owner strictly denied on Branch B) | ALLOW |
| **4. `branches/{branchId}/bilties/{docId}`** | DENY | DENY | Read A only (NO write/delete) | Read A; Create/Update A (NO delete) | Read A only (NO write/delete) | Read/Create/Update/Delete A | Read/Create/Update/Delete A | Full CRUD all branches |
| **5. `branches/{branchId}/counters/{bilty\|bill}`** | DENY | DENY | Read A only (NO write) | Read A; Monotonic `nextSeq` increment on `bilty` | Read A; Monotonic `nextSeq` increment on `bill` | Read A; Monotonic `nextSeq` increment on `bilty` & `bill` | Read A; Monotonic `nextSeq` increment (decrements/deletes DENIED) | Full CRUD |
| **6. `branches/{branchId}/adda_items/{itemId}`** | DENY | DENY | Read A only | Read/Create pending A; Update ONLY while `pending` (NO double-bill / NO delete paid) | Read A; Create/Update including `pending -> billed` & `paid`; Delete `pending` only | Read/Create/Update including `pending -> billed` & `paid`; Delete `pending` only | Read/Create/Update including `pending -> billed` & `paid`; Delete `pending` only | Full CRUD (`pending -> billed` still guarded) |
| **7. `branches/{branchId}/adda_bills/{billId}`** | DENY | DENY | Read A only (NO write) | Read A only (NO bill create/modify/delete) | Read/Create/Update A; Delete unpaid (`paidAmountPaisa == 0`) only | Read/Create/Update A; Delete unpaid (`paidAmountPaisa == 0`) only | Read/Create/Update A; Delete unpaid only (`paid` delete DENIED) | Read/Create/Update; Delete unpaid only (`paid` delete DENIED) |
| **8. `users/{uid}/biltyAttachments/{id}`** | DENY | DENY | DENY | DENY | DENY | DENY | DENY | Owner UID ONLY (`byteSize <= 409600`, `expireAtMs`, `legalHold`) |
| **9. `users/{uid}/...` (Personal Khata & Fleet)** | Own UID ONLY (`isNotSelfPromoting`) | Own UID ONLY | Own UID ONLY | Own UID ONLY | Own UID ONLY | Own UID ONLY | Own UID ONLY | Own UID ONLY |
| **10. `publicBiltyVerifications/{biltyNo}`** | `get`: ALLOW; `list`/write/delete: DENY | `get`: ALLOW; write/delete: DENY | `get`: ALLOW; `list`/write/delete: DENY | `get`: ALLOW; Create/Update A bilties (non-PII fields + matching `branchId` only); Delete: DENY | `get`: ALLOW; write/delete: DENY | `get`: ALLOW; Create/Update/Delete A bilties (matching `branchId` only) | `get`: ALLOW; Create/Update/Delete A bilties (matching `branchId` only) | `get` & `list` & all writes (non-PII enforced) |
| **Legacy `signedInDirectory` & `userBranchAccess`** | DENY | DENY | DENY | DENY | DENY | DENY | DENY | DENY (deleted from schema) |
