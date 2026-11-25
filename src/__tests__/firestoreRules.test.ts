import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Firestore Rules Security Audit & Multi-Branch RBAC Matrix', () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  it('should exist, define version 2 rules, and enforce default-deny catch-all', () => {
    expect(rulesContent).toContain("rules_version = '2';");
    expect(rulesContent).toContain('service cloud.firestore');
    expect(rulesContent).toMatch(/match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/);
  });

  it('should verify owner email AND email_verified status on caller claims', () => {
    expect(rulesContent).toContain("callerEmailLower() == 'warraichgoods43@gmail.com'");
    expect(rulesContent).toContain("'email_verified' in request.auth.token");
    expect(rulesContent).toContain('function isVerifiedCaller()');
  });

  it('should eliminate signedInDirectory and legacy userBranchAccess in favor of single-get branches/{branchId}/members/{emailKey}', () => {
    expect(rulesContent).not.toContain('match /signedInDirectory/');
    expect(rulesContent).not.toContain('match /userBranchAccess/');
    expect(rulesContent).not.toContain('function isStaffAuthorized(');

    expect(rulesContent).toContain('function getMemberPath(branchId, emailKey)');
    expect(rulesContent).toContain('branches/$(branchId)/members/$(emailKey)');
    expect(rulesContent).toContain('match /members/{emailKey}');
    expect(rulesContent).toContain('match /{path=**}/members/{emailKey}');
    expect(rulesContent).toContain("emailKey != 'warraichgoods43@gmail.com'");
  });

  it('should prevent self-escalation, Branch Owner assigning branch_owner/manageBranchStaff, and lock legal branch fields', () => {
    // Non-creator Branch Owner cannot mutate legal or ownership keys
    expect(rulesContent).toContain("'branchCode'");
    expect(rulesContent).toContain("'ntn'");
    expect(rulesContent).toContain("'companyHeaderUr'");
    expect(rulesContent).toContain("'companyHeaderEn'");
    expect(rulesContent).toContain("'proprietorNameUr'");
    expect(rulesContent).toContain("'proprietorNameEn'");
    expect(rulesContent).toContain("'startingBiltySeq'");
    expect(rulesContent).toContain("'ownerEmail'");

    // Non-creator Branch Owner cannot edit self or grant branch_owner / manageBranchStaff
    expect(rulesContent).toContain('emailKey != callerEmailLower()');
    expect(rulesContent).toContain('permissions.manageBranchStaff == false');
  });

  it('should enforce branch-scoped counters, Adda financial transition guards, and non-paid bill delete lock', () => {
    expect(rulesContent).toContain('match /counters/{counterId}');
    expect(rulesContent).toContain("counterId in ['bilty', 'bill']");
    expect(rulesContent).toContain('request.resource.data.nextSeq > resource.data.nextSeq');

    expect(rulesContent).toContain('match /adda_items/{itemId}');
    expect(rulesContent).toContain('function isValidAddaItemUpdate(branchId)');
    expect(rulesContent).toContain("resource.data.status != 'paid'");
    expect(rulesContent).toContain("resource.data.status != 'billed'");

    expect(rulesContent).toContain('match /adda_bills/{billId}');
    expect(rulesContent).toContain('resource.data.paidAmountPaisa == 0');
    expect(rulesContent).toContain('match /adda_parties/{partyId}');
  });

  it('should keep personal Khata isolated under users/{uid} and creator attachments strictly Creator-only', () => {
    expect(rulesContent).toContain('match /biltyAttachments/{attachmentId}');
    expect(rulesContent).toContain('allow read, delete: if isOwner() && request.auth.uid == userId;');
    expect(rulesContent).toContain('request.resource.data.byteSize <= 409600');
    expect(rulesContent).toContain('subcollection[0] != \'biltyAttachments\'');
  });

  it('should explicitly deny top-level bilties collection and scope publicBiltyVerifications by branchId (#23)', () => {
    expect(rulesContent).toMatch(/match \/bilties\/\{biltyId\} \{\s*allow read, write: if false;\s*\}/);
    expect(rulesContent).toContain('match /publicBiltyVerifications/{docId}');
    expect(rulesContent).toContain('allow get: if true;');
    expect(rulesContent).toContain('allow list: if isOwner();');
    expect(rulesContent).not.toMatch(/match \/publicBiltyVerifications\/\{docId\} \{[^}]*allow read: if true;/);
    expect(rulesContent).toContain('docId == docId.upper()');
    expect(rulesContent).toContain('request.resource.data.biltyNo == docId');
    expect(rulesContent).toContain('hasBranchBiltyWrite(request.resource.data.branchId)');
    expect(rulesContent).toContain('hasBranchBiltyWrite(resource.data.branchId)');
    expect(rulesContent).toContain('hasBranchBiltyDelete(resource.data.branchId)');

    // Required sanitized fields & forbidden PII/financial keys
    expect(rulesContent).toContain("'biltyNo', 'biltyDate', 'origin', 'destination'");
    expect(rulesContent).toContain("'goodsDescription', 'weightOrQty', 'vehicleNo', 'status'");
    expect(rulesContent).toContain('senderCnic');
    expect(rulesContent).toContain('senderMobile');
    expect(rulesContent).toContain('driverName');
    expect(rulesContent).toContain('paymentStatus');
    expect(rulesContent).toContain('freight');
  });

  it('should enforce strict schema, GPS bounding, and atomic +1 unique-UID flagging on hazardReports (#24)', () => {
    expect(rulesContent).toContain('match /hazardReports/{reportId}');
    expect(rulesContent).toContain('function isValidHazardFlagUpdate()');
    expect(rulesContent).toContain('nextFlags == prevFlags + 1');
    expect(rulesContent).toContain('!(request.auth.uid in resource.data.flaggedBy)');
    expect(rulesContent).toContain('allow update: if isValidHazardFlagUpdate();');
  });

  it('should require authenticated userUid match on crashReports and validate accountDeletionRequests (#25, #18)', () => {
    expect(rulesContent).toContain('match /crashReports/{reportId}');
    expect(rulesContent).toContain('request.resource.data.userUid == request.auth.uid');
    expect(rulesContent).toContain('match /accountDeletionRequests/{requestId}');
    expect(rulesContent).toContain('match /activityLog/{logId}');
  });
});
