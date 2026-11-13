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
    expect(rulesContent).toContain('function isStaffAuthorized(data)');
    expect(rulesContent).toContain('data.allowedUIDs is list');
    expect(rulesContent).toContain('data.allowedEmails is list');
    expect(rulesContent).toContain('function isBiltyAuthorized()');
  });

  it('should explicitly deny top-level bilties collection', () => {
    expect(rulesContent).toMatch(/match \/bilties\/\{biltyId\} \{\s*allow read, write: if false;\s*\}/);
  });

  it('should restrict publicBiltyVerifications writes to authorized accounts with strict 8-field whitelist and uppercase docId check', () => {
    expect(rulesContent).toContain('match /publicBiltyVerifications/{docId}');
    expect(rulesContent).toContain('allow read: if true;');
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

  it('should secure users collection and enforce strict user data isolation', () => {
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

  it('should enforce strict schema and GPS bounding on hazardReports', () => {
    expect(rulesContent).toContain('match /hazardReports/{reportId}');
    expect(rulesContent).toContain('allow read: if isSignedIn();');
    expect(rulesContent).toContain('request.resource.data.reporterUid == request.auth.uid');
    expect(rulesContent).toContain('request.resource.data.lat >= 23.0 && request.resource.data.lat <= 38.0');
    expect(rulesContent).toContain('request.resource.data.lng >= 60.0 && request.resource.data.lng <= 78.0');
    expect(rulesContent).toContain('request.resource.data.createdAt == request.time;');
    expect(rulesContent).toContain('allow update: if false;');
  });
});
