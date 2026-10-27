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
    expect(rulesContent).toContain("request.auth.token.email == 'warraichgoods43@gmail.com'");
    expect(rulesContent).toContain("'email_verified' in request.auth.token");
    expect(rulesContent).toContain('request.auth.token.email_verified == true');
  });

  it('should harden isBiltyAuthorized with isStaffAuthorized checking list types and email verification', () => {
    expect(rulesContent).toContain('function isStaffAuthorized(data)');
    expect(rulesContent).toContain('data.allowedUIDs is list');
    expect(rulesContent).toContain('data.allowedEmails is list');
    expect(rulesContent).toContain('request.auth.token.email_verified == true');
    expect(rulesContent).toContain('function isBiltyAuthorized()');
  });

  it('should explicitly deny top-level bilties collection', () => {
    expect(rulesContent).toMatch(/match \/bilties\/\{biltyId\} \{\s*allow read, write: if false;\s*\}/);
  });

  it('should restrict publicBiltyVerifications writes to bilty-authorized users with strict non-PII whitelist', () => {
    expect(rulesContent).toContain('match /publicBiltyVerifications/{docId}');
    expect(rulesContent).toContain('allow read: if true;');
    expect(rulesContent).toContain('allow create, update: if isBiltyAuthorized() && hasOnlyPublicBiltyFields();');
    expect(rulesContent).toContain('allow delete: if isOwner();');
    
    // Explicit forbidden keys in defense-in-depth guard
    expect(rulesContent).toContain('senderCnic');
    expect(rulesContent).toContain('senderMobile');
    expect(rulesContent).toContain('total');
    expect(rulesContent).toContain('payable');
    expect(rulesContent).toContain('driverName');
    expect(rulesContent).toContain('senderName');
    expect(rulesContent).toContain('receiverName');
  });

  it('should secure users collection so owner can read profiles and users can manage own profile without self-promotion', () => {
    expect(rulesContent).toContain('match /users/{userId}');
    expect(rulesContent).toContain('allow read: if isSignedIn() && (request.auth.uid == userId || isOwner());');
    expect(rulesContent).toContain('allow write: if isSignedIn() && request.auth.uid == userId && isNotSelfPromoting();');
    expect(rulesContent).toContain('match /{subcollection=**} {');
    expect(rulesContent).toContain('allow read, write: if isSignedIn() && request.auth.uid == userId;');
  });

  it('should restrict access/biltyAccess and admins to owner only', () => {
    expect(rulesContent).toContain('match /access/biltyAccess');
    expect(rulesContent).toContain('allow read, write: if isOwner();');
    expect(rulesContent).toContain('match /admins/{adminId}');
  });

  it('should restrict counters collection to authorized bilty operations', () => {
    expect(rulesContent).toContain('match /counters/{counterId}');
    expect(rulesContent).toContain('allow read, write: if isBiltyAuthorized();');
  });
});
