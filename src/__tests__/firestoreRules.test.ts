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

  it('should explicitly deny top-level bilties collection', () => {
    expect(rulesContent).toMatch(/match \/bilties\/\{biltyId\} \{\s*allow read, write: if false;\s*\}/);
  });

  it('should restrict publicBiltyVerifications writes to bilty-authorized users with non-PII field validation', () => {
    expect(rulesContent).toContain('match /publicBiltyVerifications/{docId}');
    expect(rulesContent).toContain('allow read: if true;');
    expect(rulesContent).toContain('allow create, update: if isBiltyAuthorized() && hasOnlyPublicBiltyFields();');
    expect(rulesContent).toContain('senderCnic');
    expect(rulesContent).toContain('senderMobile');
    expect(rulesContent).toContain('total');
    expect(rulesContent).toContain('payable');
  });

  it('should secure users collection so owner can read profiles and users can manage own profile without self-promotion', () => {
    expect(rulesContent).toContain('match /users/{userId}');
    expect(rulesContent).toContain('allow read: if isSignedIn() && (request.auth.uid == userId || isOwner());');
    expect(rulesContent).toContain('allow write: if isSignedIn() && request.auth.uid == userId && isNotSelfPromoting();');
  });

  it('should restrict access/biltyAccess to owner only', () => {
    expect(rulesContent).toContain('match /access/biltyAccess');
    expect(rulesContent).toContain('allow read, write: if isOwner();');
  });
});
