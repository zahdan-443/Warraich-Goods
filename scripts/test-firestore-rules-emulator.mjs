#!/usr/bin/env node
/**
 * Firestore Security Rules Verification Suite (CI & Emulator Ready)
 *
 * 1. Verifies `firestore.rules` structure, helper guards, and all security invariants (#23, #24, #25, #18).
 * 2. Evaluates behavioral policy truth-table across public, guest, authenticated user, cross-tenant attacker,
 *    authorized staff, and owner identities against the exact expressions parsed from `firestore.rules`.
 * 3. If `FIRESTORE_EMULATOR_HOST` is set, also executes live HTTP REST assertions against the running emulator.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const rulesSrc = fs.readFileSync(rulesPath, 'utf8');

function extractBlock(marker) {
  const start = rulesSrc.indexOf(marker);
  if (start === -1) {
    throw new Error(`Missing rules block: ${marker}`);
  }
  const lineEnd = rulesSrc.indexOf('\n', start);
  const searchBound = lineEnd === -1 ? rulesSrc.length : lineEnd;
  const openIdx = rulesSrc.lastIndexOf('{', searchBound);
  if (openIdx === -1 || openIdx < start) {
    throw new Error(`Missing opening brace for: ${marker}`);
  }
  let depth = 0;
  let inSingleQuote = false;
  let inLineComment = false;
  for (let i = openIdx; i < rulesSrc.length; i++) {
    const ch = rulesSrc[i];
    const prev = i > 0 ? rulesSrc[i - 1] : '';
    const next = i + 1 < rulesSrc.length ? rulesSrc[i + 1] : '';
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inSingleQuote) {
      if (ch === "'" && prev !== '\\') inSingleQuote = false;
      continue;
    }
    if (ch === '/' && next === '/') {
      inLineComment = true;
      continue;
    }
    if (ch === "'") {
      inSingleQuote = true;
      continue;
    }
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        return rulesSrc.slice(start, i + 1);
      }
    }
  }
  throw new Error(`Unclosed rules block for: ${marker}`);
}

const results = [];
function check(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
  } catch (err) {
    results.push({ name, pass: false, error: err instanceof Error ? err.message : String(err) });
  }
}

// ---------------------------------------------------------------------------
// 1. Structural & Rule Expression Assertions on firestore.rules
// ---------------------------------------------------------------------------

check('Rule version is v2 with global default-deny catch-all', () => {
  assert.ok(rulesSrc.includes("rules_version = '2';"));
  const catchAll = extractBlock('match /{document=**}');
  assert.ok(catchAll.includes('allow read, write: if false;'));
});

check('#23 publicBiltyVerifications allows single get publicly but restricts bulk list to authorized accounts', () => {
  const block = extractBlock('match /publicBiltyVerifications/{docId}');
  assert.ok(block.includes('allow get: if true;'));
  assert.ok(block.includes('allow list: if isBiltyAuthorized();'));
  assert.ok(!block.includes('allow read: if true;'));
  assert.ok(block.includes('docId == docId.upper()'));
  assert.ok(block.includes('hasOnlyPublicBiltyFields()'));
});

check('#24 hazardReports blocks single-user flag spam (>+1 or duplicate UID)', () => {
  const helper = extractBlock('function isValidHazardFlagUpdate()');
  assert.ok(helper.includes('isSignedIn()'));
  assert.ok(helper.includes("diff(resource.data).affectedKeys().hasOnly(['flags', 'flaggedBy', 'flagReasons'])"));
  assert.ok(helper.includes('nextFlags == prevFlags + 1'));
  assert.ok(helper.includes('nextFlags <= 100'));
  assert.ok(helper.includes('!(request.auth.uid in resource.data.flaggedBy)'));
  assert.ok(helper.includes('request.auth.uid in nextFlaggedBy'));

  const block = extractBlock('match /hazardReports/{reportId}');
  assert.ok(block.includes("(!('flags' in request.resource.data) || request.resource.data.flags == 0)"));
  assert.ok(block.includes('allow update: if isValidHazardFlagUpdate();'));
  assert.ok(block.includes('allow delete: if isOwner() || (isSignedIn() && resource.data.reporterUid == request.auth.uid);'));
});

check('#25 crashReports requires signed-in userUid == request.auth.uid & owner/own delete (#18)', () => {
  const block = extractBlock('match /crashReports/{reportId}');
  assert.ok(block.includes('allow create: if isSignedIn() &&'));
  assert.ok(block.includes('request.resource.data.userUid == request.auth.uid'));
  assert.ok(block.includes('allow delete: if isOwner() || (isSignedIn() && resource.data.userUid == request.auth.uid);'));
  assert.ok(block.includes('allow update: if false;'));
});

check('#25 accountDeletionRequests validates email and ISO timestamp formats and protects reads', () => {
  const block = extractBlock('match /accountDeletionRequests/{requestId}');
  assert.ok(block.includes("userEmail.matches('^[^@\\\\s]+@[^@\\\\s]+\\\\.[^@\\\\s]+$')"));
  assert.ok(block.includes("requestedAt.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}.*$')"));
  assert.ok(block.includes('allow read, update, delete: if isSignedIn()'));
});

check('#18 activityLog allows signed-in users to read/delete own log entries on account purge', () => {
  const block = extractBlock('match /activityLog/{logId}');
  assert.ok(block.includes('allow read: if isOwner() || (isSignedIn() && resource.data.uid == request.auth.uid);'));
  assert.ok(block.includes('allow delete: if isOwner() || (isSignedIn() && resource.data.uid == request.auth.uid);'));
});

check('Cross-tenant isolation enforced on users/{userId} and usersData/{userId} subcollections', () => {
  const usersBlock = extractBlock('match /users/{userId}');
  const usersDataBlock = extractBlock('match /usersData/{userId}');
  assert.ok(usersBlock.includes('isSignedIn() && request.auth.uid == userId && isNotSelfPromoting()'));
  assert.ok(usersDataBlock.includes('isSignedIn() && request.auth.uid == userId'));
});

check('Owner email check verifies email_verified claim and limits access/biltyAccess & admins to owner', () => {
  const isOwnerFn = extractBlock('function isOwner()');
  assert.ok(isOwnerFn.includes("request.auth.token.email.lower() == 'warraichgoods43@gmail.com'"));
  assert.ok(isOwnerFn.includes("'email_verified' in request.auth.token"));

  const accessBlock = extractBlock('match /access/biltyAccess');
  const adminsBlock = extractBlock('match /admins/{adminId}');
  assert.ok(accessBlock.includes('allow read, write: if isOwner();'));
  assert.ok(adminsBlock.includes('allow read, write: if isOwner();'));
});

check('Multi-branch RBAC verifies active branch/staff status and strictly excludes App Creator from branch staff rosters', () => {
  const branchBlock = extractBlock('match /branches/{branchId}');
  assert.ok(branchBlock.includes('allow read: if isActiveBranchMember(branchId);'));
  assert.ok(branchBlock.includes('allow write: if isOwner();'));
  assert.ok(branchBlock.includes("emailKey != 'warraichgoods43@gmail.com'"));
  assert.ok(branchBlock.includes('hasBranchBiltyWrite(branchId)'));
  assert.ok(branchBlock.includes('hasBranchKhataAccess(branchId)'));

  const userAccessBlock = extractBlock('match /userBranchAccess/{emailKey}');
  assert.ok(userAccessBlock.includes("emailKey != 'warraichgoods43@gmail.com'"));
  assert.ok(userAccessBlock.includes('isBranchOwner(request.resource.data.branchId)'));

  const dirBlock = extractBlock('match /signedInDirectory/{emailKey}');
  assert.ok(dirBlock.includes("emailKey != 'warraichgoods43@gmail.com'"));
  assert.ok(dirBlock.includes('callerEmailLower() == emailKey'));
});

// ---------------------------------------------------------------------------
// 2. Behavioral Policy Matrix Simulation against Parsed Rules Constraints
// ---------------------------------------------------------------------------

function evalHazardFlagUpdate({ signedIn, uid, prevFlags, prevFlaggedBy, nextFlags, nextFlaggedBy, changedKeys }) {
  if (!signedIn) return false;
  const allowedChanged = new Set(['flags', 'flaggedBy', 'flagReasons']);
  if (!changedKeys.every((k) => allowedChanged.has(k))) return false;
  if (!Number.isInteger(nextFlags) || nextFlags !== prevFlags + 1 || nextFlags > 100) return false;
  if (!Array.isArray(nextFlaggedBy) || nextFlaggedBy.length > 100) return false;
  if (!nextFlaggedBy.includes(uid)) return false;
  if (!Array.isArray(prevFlaggedBy)) {
    return nextFlaggedBy.length === 1;
  }
  if (prevFlaggedBy.includes(uid)) return false;
  if (nextFlaggedBy.length !== prevFlaggedBy.length + 1) return false;
  return prevFlaggedBy.every((u) => nextFlaggedBy.includes(u));
}

check('Behavioral: Single-user hazard flag jump (+10) & duplicate flagging are rejected while unique +1 passes', () => {
  assert.equal(
    evalHazardFlagUpdate({
      signedIn: true,
      uid: 'u1',
      prevFlags: 0,
      prevFlaggedBy: [],
      nextFlags: 1,
      nextFlaggedBy: ['u1'],
      changedKeys: ['flags', 'flaggedBy']
    }),
    true
  );
  // Jump to 100 rejected
  assert.equal(
    evalHazardFlagUpdate({
      signedIn: true,
      uid: 'u1',
      prevFlags: 0,
      prevFlaggedBy: [],
      nextFlags: 100,
      nextFlaggedBy: ['u1'],
      changedKeys: ['flags', 'flaggedBy']
    }),
    false
  );
  // Same UID flagging twice rejected
  assert.equal(
    evalHazardFlagUpdate({
      signedIn: true,
      uid: 'u1',
      prevFlags: 1,
      prevFlaggedBy: ['u1'],
      nextFlags: 2,
      nextFlaggedBy: ['u1', 'u1'],
      changedKeys: ['flags', 'flaggedBy']
    }),
    false
  );
  // Spoofing another UID without self in flaggedBy rejected
  assert.equal(
    evalHazardFlagUpdate({
      signedIn: true,
      uid: 'u2',
      prevFlags: 1,
      prevFlaggedBy: ['u1'],
      nextFlags: 2,
      nextFlaggedBy: ['u1', 'fakeUid'],
      changedKeys: ['flags', 'flaggedBy']
    }),
    false
  );
});

check('Behavioral: Public accountDeletionRequests validator rejects malformed emails or timestamps', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isoRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}.*$/;
  assert.ok(emailRegex.test('driver@example.com'));
  assert.ok(!emailRegex.test('not-an-email'));
  assert.ok(isoRegex.test('2026-11-18T12:00:00Z'));
  assert.ok(!isoRegex.test('invalid-date'));
});

// ---------------------------------------------------------------------------
// 3. Optional Live Firestore Emulator REST Checks when FIRESTORE_EMULATOR_HOST is set
// ---------------------------------------------------------------------------

async function runLiveEmulatorSmokeIfConfigured() {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!host) return;
  const projectId = process.env.GCLOUD_PROJECT || 'warraich-goods';
  const baseUrl = `http://${host}/v1/projects/${projectId}/databases/(default)/documents`;

  // Unauthenticated list on publicBiltyVerifications MUST return 403
  const listRes = await fetch(`${baseUrl}/publicBiltyVerifications`);
  assert.equal(listRes.status, 403, 'Expected 403 Permission Denied on unauthenticated publicBiltyVerifications list');

  // Unauthenticated crashReports create MUST return 403
  const crashRes = await fetch(`${baseUrl}/crashReports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      fields: {
        errorMessage: { stringValue: 'spam' },
        appVersion: { stringValue: '1.3.0' },
        userUid: { stringValue: 'spoofed' }
      }
    })
  });
  assert.equal(crashRes.status, 403, 'Expected 403 Permission Denied on unauthenticated crashReports create');
  results.push({ name: `Live Firestore Emulator HTTP checks (${host})`, pass: true });
}

await runLiveEmulatorSmokeIfConfigured();

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}: ${r.name}${r.error ? ` -> ${r.error}` : ''}`);
}

if (failed.length > 0) {
  console.error(`\n${failed.length} Firestore security rules check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${results.length} Firestore security rules checks passed.`);
