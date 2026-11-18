import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Firestore Rules Security Audit & Structure', () => {
  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  it('should exist and define version 2 rules', () => {
    expect(rulesContent).toContain("rules_version = '2';");
    expect(rulesContent).toContain('service cloud.firestore');
  });

  it('should verify owner email AND email_verified status', () => {
    expect(rulesContent).toContain("request.auth.token.email.lower() == 'warraichgoods43@gmail.com'");
    expect(rulesContent).toContain("'email_verified' in request.auth.token");
  });

  it('should harden isBiltyAuthorized with isStaffAuthorized checking list types and email verification', () => {
    expect(rulesContent).toContain('function isStaffAuthorized(accessDoc)');
    expect(rulesContent).not.toContain('function isStaffAuthorized(data)');
    expect(rulesContent).toContain('accessDoc.allowedUIDs is list');
    expect(rulesContent).toContain('accessDoc.allowedEmails is list');
    expect(rulesContent).toContain('function isBiltyAuthorized()');
  });

  it('should explicitly deny top-level bilties collection', () => {
    expect(rulesContent).toMatch(/match \/bilties\/\{biltyId\} \{\s*allow read, write: if false;\s*\}/);
  });

  it('should restrict publicBiltyVerifications to single-doc get only publicly and list only for authorized accounts (#23)', () => {
    expect(rulesContent).toContain('match /publicBiltyVerifications/{docId}');
    expect(rulesContent).toContain('allow get: if true;');
    expect(rulesContent).toContain('allow list: if isBiltyAuthorized();');
    expect(rulesContent).not.toMatch(/match \/publicBiltyVerifications\/\{docId\} \{[^}]*allow read: if true;/);
    expect(rulesContent).toContain('allow create, update: if isBiltyAuthorized()');
    expect(rulesContent).toContain('docId == docId.upper()');
    expect(rulesContent).toContain('request.resource.data.biltyNo == docId');
    expect(rulesContent).toContain('allow delete: if isBiltyAuthorized();');

    // Explicit 8 allowed sanitized fields
    expect(rulesContent).toContain("'biltyNo', 'biltyDate', 'origin', 'destination'");
    expect(rulesContent).toContain("'goodsDescription', 'weightOrQty', 'vehicleNo', 'status'");

    // Explicit forbidden keys in defense-in-depth guard
    expect(rulesContent).toContain('senderCnic');
    expect(rulesContent).toContain('senderMobile');
    expect(rulesContent).toContain('driverName');
    expect(rulesContent).toContain('paymentStatus');
    expect(rulesContent).toContain('total');
    expect(rulesContent).toContain('payable');
    expect(rulesContent).toContain('freight');
  });

  it('should secure users and usersData collections and enforce strict user data isolation', () => {
    expect(rulesContent).toContain('match /usersData/{userId}');
    expect(rulesContent).toContain('match /users/{userId}');
    expect(rulesContent).toContain('allow read, write: if isSignedIn() && request.auth.uid == userId && isNotSelfPromoting();');
    expect(rulesContent).toContain('match /{subcollection=**} {');
    expect(rulesContent).toContain('allow read, write: if isSignedIn() && request.auth.uid == userId;');
  });

  it('should restrict access/biltyAccess and admins to owner only', () => {
    expect(rulesContent).toContain('match /access/biltyAccess');
    expect(rulesContent).toContain('allow read, write: if isOwner();');
    expect(rulesContent).toContain('match /admins/{adminId}');
  });

  it('should allow counters collection only to authorized bilty accounts with strict integer check', () => {
    expect(rulesContent).toContain('match /counters/{counterId}');
    expect(rulesContent).toContain('allow read: if isSignedIn();');
    expect(rulesContent).toContain('allow write: if isBiltyAuthorized()');
    expect(rulesContent).toContain("request.resource.data.keys().hasOnly(['currentValue', 'value', 'updatedAt'])");
  });

  it('should enforce strict schema, GPS bounding, and atomic +1 unique-UID flagging on hazardReports (#24)', () => {
    expect(rulesContent).toContain('match /hazardReports/{reportId}');
    expect(rulesContent).toContain('allow read: if isSignedIn();');
    expect(rulesContent).toContain('request.resource.data.reporterUid == request.auth.uid');
    expect(rulesContent).toContain('request.resource.data.lat >= 23.0 && request.resource.data.lat <= 38.0');
    expect(rulesContent).toContain('request.resource.data.lng >= 60.0 && request.resource.data.lng <= 78.0');
    expect(rulesContent).toContain('request.resource.data.createdAt == request.time;');
    expect(rulesContent).toContain('function isValidHazardFlagUpdate()');
    expect(rulesContent).toContain('nextFlags == prevFlags + 1');
    expect(rulesContent).toContain('!(request.auth.uid in resource.data.flaggedBy)');
    expect(rulesContent).toContain('allow update: if isValidHazardFlagUpdate();');
  });

  it('should require authenticated userUid match on crashReports and validate accountDeletionRequests (#25, #18)', () => {
    expect(rulesContent).toContain('match /crashReports/{reportId}');
    expect(rulesContent).toContain('allow create: if isSignedIn() &&');
    expect(rulesContent).toContain('request.resource.data.userUid == request.auth.uid');
    expect(rulesContent).toContain('allow delete: if isOwner() || (isSignedIn() && resource.data.userUid == request.auth.uid);');

    expect(rulesContent).toContain('match /accountDeletionRequests/{requestId}');
    expect(rulesContent).toContain("request.resource.data.userEmail.matches('^[^@\\\\s]+@[^@\\\\s]+\\\\.[^@\\\\s]+$')");
    expect(rulesContent).toContain("request.resource.data.requestedAt.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}.*$')");

    expect(rulesContent).toContain('match /activityLog/{logId}');
    expect(rulesContent).toContain('allow delete: if isOwner() || (isSignedIn() && resource.data.uid == request.auth.uid);');
  });
});
