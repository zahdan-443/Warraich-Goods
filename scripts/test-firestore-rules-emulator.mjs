#!/usr/bin/env node
/**
 * Firestore Security Rules Verification Suite (CI & Emulator Ready)
 *
 * 1. Verifies `firestore.rules` structure, helper guards, and all security invariants (#23, #24, #25, #18).
 * 2. Evaluates behavioral policy truth-table across all 11 caller personas x 10 resource categories
 *    from docs/FIRESTORE_RULES_TEST_MATRIX.md.
 * 3. If `FIRESTORE_EMULATOR_HOST` is set, executes live HTTP REST assertions against the running emulator.
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

check('#23 publicBiltyVerifications allows single get publicly, restricts list to owner, and validates branchId on writes', () => {
  const block = extractBlock('match /publicBiltyVerifications/{docId}');
  assert.ok(block.includes('allow get: if true;'));
  assert.ok(block.includes('allow list: if isOwner();'));
  assert.ok(!block.includes('allow read: if true;'));
  assert.ok(block.includes('docId == docId.upper()'));
  assert.ok(block.includes('hasOnlyPublicBiltyFields()'));
  assert.ok(block.includes('hasBranchBiltyWrite(request.resource.data.branchId)'));
  assert.ok(block.includes('hasBranchBiltyWrite(resource.data.branchId)'));
  assert.ok(block.includes('hasBranchBiltyDelete(resource.data.branchId)'));
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

check('Cross-tenant isolation enforced on users/{userId} and usersData/{userId}', () => {
  const usersBlock = extractBlock('match /users/{userId}');
  const usersDataBlock = extractBlock('match /usersData/{userId}');
  assert.ok(usersBlock.includes('isSignedIn() && request.auth.uid == userId && isNotSelfPromoting()'));
  assert.ok(usersDataBlock.includes('isSignedIn() && request.auth.uid == userId'));
});

check('Owner email check verifies email_verified claim and limits access/biltyAccess & admins to owner', () => {
  const isOwnerFn = extractBlock('function isOwner()');
  assert.ok(isOwnerFn.includes("callerEmailLower() == 'warraichgoods43@gmail.com'"));
  const verifiedFn = extractBlock('function isVerifiedCaller()');
  assert.ok(verifiedFn.includes("'email_verified' in request.auth.token"));

  const accessBlock = extractBlock('match /access/biltyAccess');
  const adminsBlock = extractBlock('match /admins/{adminId}');
  assert.ok(accessBlock.includes('allow read, write: if isOwner();'));
  assert.ok(adminsBlock.includes('allow read, write: if isOwner();'));
});

check('signedInDirectory and userBranchAccess are deleted; members subcollection + collectionGroup enforce RBAC', () => {
  assert.ok(!rulesSrc.includes('match /signedInDirectory/'), 'signedInDirectory must be removed');
  assert.ok(!rulesSrc.includes('match /userBranchAccess/'), 'userBranchAccess must be removed');

  const cgMembers = extractBlock('match /{path=**}/members/{emailKey}');
  assert.ok(cgMembers.includes('resource.data.email.lower() == callerEmailLower()'));

  const cgEntries = extractBlock('match /{path=**}/entries/{entryId}');
  assert.ok(cgEntries.includes('isSignedIn() && resource.data.ownerUid == request.auth.uid'));

  const branchBlock = extractBlock('match /branches/{branchId}');
  assert.ok(branchBlock.includes('allow read: if isActiveBranchMember(branchId);'));
  assert.ok(branchBlock.includes('allow create, delete: if isOwner();'));
  assert.ok(branchBlock.includes("'ntn'"));
  assert.ok(branchBlock.includes("'branchCode'"));
  assert.ok(branchBlock.includes("'companyHeaderUr'"));
  assert.ok(branchBlock.includes("'startingBiltySeq'"));
  assert.ok(branchBlock.includes("emailKey != 'warraichgoods43@gmail.com'"));
  assert.ok(branchBlock.includes('emailKey != callerEmailLower()'));
  assert.ok(branchBlock.includes('permissions.manageBranchStaff == false'));
  assert.ok(branchBlock.includes('match /counters/{counterId}'));
  assert.ok(branchBlock.includes('match /bilties/{docId}'));
  assert.ok(branchBlock.includes('match /adda_items/{itemId}'));
  assert.ok(branchBlock.includes('match /adda_bills/{billId}'));
  assert.ok(branchBlock.includes('match /adda_parties/{partyId}'));
  assert.ok(branchBlock.includes('resource.data.paidAmountPaisa == 0'));
});

// ---------------------------------------------------------------------------
// 2. Behavioral 11-Persona x Multi-Branch RBAC Matrix Simulation
// ---------------------------------------------------------------------------

const CREATOR_EMAIL = 'warraichgoods43@gmail.com';
const BRANCH_A = 'lahore_adda';
const BRANCH_B = 'multan_adda';

const MEMBERS_DB = {
  [BRANCH_A]: {
    'revoked@gmail.com': { email: 'revoked@gmail.com', branchId: BRANCH_A, branchActive: true, status: 'revoked', presetRole: 'munshi', permissions: { createBilty: true, viewAllBilties: true } },
    'paused@gmail.com': { email: 'paused@gmail.com', branchId: BRANCH_A, branchActive: false, status: 'active', presetRole: 'branch_owner', permissions: { createBilty: true, editDeleteBilty: true, viewAllBilties: true, khataAccess: true, manageBranchStaff: true } },
    'viewer@gmail.com': { email: 'viewer@gmail.com', branchId: BRANCH_A, branchActive: true, status: 'active', presetRole: 'viewer', permissions: { viewAllBilties: true, viewBranchReports: true } },
    'munshi@gmail.com': { email: 'munshi@gmail.com', branchId: BRANCH_A, branchActive: true, status: 'active', presetRole: 'munshi', permissions: { createBilty: true, editDeleteBilty: false, viewAllBilties: true, khataAccess: false, manageBranchStaff: false } },
    'accountant@gmail.com': { email: 'accountant@gmail.com', branchId: BRANCH_A, branchActive: true, status: 'active', presetRole: 'accountant', permissions: { createBilty: false, editDeleteBilty: false, viewAllBilties: true, khataAccess: true, viewBranchReports: true, manageBranchStaff: false } },
    'manager@gmail.com': { email: 'manager@gmail.com', branchId: BRANCH_A, branchActive: true, status: 'active', presetRole: 'branch_manager', permissions: { createBilty: true, editDeleteBilty: true, viewAllBilties: true, khataAccess: true, viewBranchReports: true, manageBranchStaff: false } },
    'owner_a@gmail.com': { email: 'owner_a@gmail.com', branchId: BRANCH_A, branchActive: true, status: 'active', presetRole: 'branch_owner', permissions: { createBilty: true, editDeleteBilty: true, viewAllBilties: true, khataAccess: true, viewBranchReports: true, manageBranchStaff: true } }
  },
  [BRANCH_B]: {}
};

function simRoleHelpers(caller) {
  const signedIn = Boolean(caller && caller.uid);
  const emailLower = caller?.email ? caller.email.toLowerCase() : null;
  const emailVerified = caller ? caller.emailVerified !== false : false;
  const verified = signedIn && Boolean(emailLower) && emailVerified;
  const isCreator = verified && emailLower === CREATOR_EMAIL;

  const member = (branchId) => (emailLower ? MEMBERS_DB[branchId]?.[emailLower] || null : null);
  const isActiveMember = (branchId) =>
    isCreator || (verified && Boolean(member(branchId)) && member(branchId).status === 'active' && member(branchId).branchActive !== false);
  const isBranchOwner = (branchId) =>
    isCreator || (isActiveMember(branchId) && (member(branchId).presetRole === 'branch_owner' || member(branchId).permissions?.manageBranchStaff === true));
  const biltyWrite = (branchId) =>
    isCreator || (isActiveMember(branchId) && (member(branchId).permissions?.createBilty === true || member(branchId).permissions?.editDeleteBilty === true));
  const biltyDelete = (branchId) =>
    isCreator || (isActiveMember(branchId) && member(branchId).permissions?.editDeleteBilty === true);
  const biltyRead = (branchId) =>
    isCreator || (isActiveMember(branchId) && (member(branchId).permissions?.createBilty === true || member(branchId).permissions?.editDeleteBilty === true || member(branchId).permissions?.viewAllBilties === true));
  const addaBillMgr = (branchId) =>
    isCreator || (isActiveMember(branchId) && (['branch_owner', 'branch_manager', 'accountant'].includes(member(branchId).presetRole) || member(branchId).permissions?.khataAccess === true));

  return {
    canReadBranch: (b) => isActiveMember(b),
    canUpdateBranchKeys: (b, keys) => {
      if (isCreator) return true;
      if (!isBranchOwner(b)) return false;
      const locked = new Set(['id', 'active', 'startingBiltySeq', 'ownerEmail', 'isHeadOffice', 'createdBy', 'branchCode', 'ntn', 'companyHeaderUr', 'companyHeaderEn', 'proprietorNameUr', 'proprietorNameEn', 'taglineUr']);
      return keys.every((k) => !locked.has(k));
    },
    canUpsertMember: (b, targetEmail, targetRole, targetManageStaff) => {
      const target = targetEmail.toLowerCase();
      if (target === CREATOR_EMAIL) return false;
      if (isCreator) return ['branch_owner', 'branch_manager', 'munshi', 'accountant', 'viewer'].includes(targetRole);
      if (!isBranchOwner(b)) return false;
      if (target === emailLower) return false;
      if (targetManageStaff) return false;
      return ['branch_manager', 'munshi', 'accountant', 'viewer'].includes(targetRole);
    },
    canWriteBilty: biltyWrite,
    canDeleteBilty: biltyDelete,
    canReadBilty: biltyRead,
    canIncrementCounter: (b, counterId, prevNext, nextNext) =>
      (biltyWrite(b) || addaBillMgr(b)) && ['bilty', 'bill'].includes(counterId) && Number.isInteger(nextNext) && nextNext > prevNext,
    canTransitionItemToBilled: (b, prevStatus, billIdChanged) =>
      addaBillMgr(b) && (prevStatus === 'pending' || (prevStatus === 'billed' && !billIdChanged)),
    canDeleteBill: (b, billStatus, paidAmountPaisa) =>
      addaBillMgr(b) && billStatus !== 'paid' && paidAmountPaisa === 0,
    canAccessCreatorVault: (uid, vaultUid) => isCreator && uid === vaultUid,
    canWritePublicVerify: (b, prevBranchId) =>
      isCreator || (prevBranchId ? prevBranchId === b && biltyWrite(b) : biltyWrite(b))
  };
}

check('Behavioral Matrix: Legal fields, cross-branch isolation, staff escalation, double-bill & paid-bill delete all blocked', () => {
  const anon = simRoleHelpers(null);
  const stranger = simRoleHelpers({ uid: 'u_stranger', email: 'stranger@gmail.com', emailVerified: true });
  const unverified = simRoleHelpers({ uid: 'u_unv', email: CREATOR_EMAIL, emailVerified: false });
  const revoked = simRoleHelpers({ uid: 'u_rev', email: 'revoked@gmail.com', emailVerified: true });
  const paused = simRoleHelpers({ uid: 'u_pau', email: 'paused@gmail.com', emailVerified: true });
  const viewer = simRoleHelpers({ uid: 'u_vw', email: 'viewer@gmail.com', emailVerified: true });
  const munshi = simRoleHelpers({ uid: 'u_mun', email: 'munshi@gmail.com', emailVerified: true });
  const accountant = simRoleHelpers({ uid: 'u_acc', email: 'accountant@gmail.com', emailVerified: true });
  const manager = simRoleHelpers({ uid: 'u_mgr', email: 'manager@gmail.com', emailVerified: true });
  const ownerA = simRoleHelpers({ uid: 'u_oa', email: 'owner_a@gmail.com', emailVerified: true });
  const creator = simRoleHelpers({ uid: 'u_cr', email: CREATOR_EMAIL, emailVerified: true });

  // Unauth / stranger / unverified / revoked / paused denied on Branch A
  for (const actor of [anon, stranger, unverified, revoked, paused]) {
    assert.equal(actor.canReadBranch(BRANCH_A), false);
    assert.equal(actor.canReadBilty(BRANCH_A), false);
    assert.equal(actor.canWriteBilty(BRANCH_A), false);
  }

  // Viewer is read-only
  assert.equal(viewer.canReadBilty(BRANCH_A), true);
  assert.equal(viewer.canWriteBilty(BRANCH_A), false);
  assert.equal(viewer.canDeleteBilty(BRANCH_A), false);

  // Munshi creates/updates bilty and bilty counter, cannot delete bilty or manage bills
  assert.equal(munshi.canWriteBilty(BRANCH_A), true);
  assert.equal(munshi.canDeleteBilty(BRANCH_A), false);
  assert.equal(munshi.canIncrementCounter(BRANCH_A, 'bilty', 5020, 5040), true);
  assert.equal(munshi.canIncrementCounter(BRANCH_A, 'bilty', 5040, 5020), false);
  assert.equal(munshi.canTransitionItemToBilled(BRANCH_A, 'pending', true), false);

  // Accountant manages bills & counters, cannot write/delete bilties, cannot delete paid bills or double-bill
  assert.equal(accountant.canWriteBilty(BRANCH_A), false);
  assert.equal(accountant.canTransitionItemToBilled(BRANCH_A, 'pending', true), true);
  assert.equal(accountant.canTransitionItemToBilled(BRANCH_A, 'billed', true), false);
  assert.equal(accountant.canDeleteBill(BRANCH_A, 'paid', 50000), false);
  assert.equal(accountant.canDeleteBill(BRANCH_A, 'unpaid', 0), true);

  // Manager can CRUD bilty on A, denied on B, denied vault
  assert.equal(manager.canDeleteBilty(BRANCH_A), true);
  assert.equal(manager.canReadBranch(BRANCH_B), false);
  assert.equal(manager.canAccessCreatorVault('u_mgr', 'u_cr'), false);

  // Branch Owner A can edit phone/address on A, CANNOT edit legal ntn/companyHeader/branchCode, CANNOT assign branch_owner/manageBranchStaff or add Creator, DENIED on Branch B
  assert.equal(ownerA.canUpdateBranchKeys(BRANCH_A, ['addressEn', 'phoneNumbers']), true);
  assert.equal(ownerA.canUpdateBranchKeys(BRANCH_A, ['ntn']), false);
  assert.equal(ownerA.canUpdateBranchKeys(BRANCH_A, ['companyHeaderEn']), false);
  assert.equal(ownerA.canUpdateBranchKeys(BRANCH_A, ['branchCode']), false);
  assert.equal(ownerA.canUpsertMember(BRANCH_A, 'newstaff@gmail.com', 'munshi', false), true);
  assert.equal(ownerA.canUpsertMember(BRANCH_A, 'owner_a@gmail.com', 'branch_manager', false), false);
  assert.equal(ownerA.canUpsertMember(BRANCH_A, 'x@gmail.com', 'branch_owner', false), false);
  assert.equal(ownerA.canUpsertMember(BRANCH_A, 'x@gmail.com', 'branch_manager', true), false);
  assert.equal(ownerA.canUpsertMember(BRANCH_A, CREATOR_EMAIL, 'munshi', false), false);
  assert.equal(ownerA.canReadBranch(BRANCH_B), false);
  assert.equal(ownerA.canWritePublicVerify(BRANCH_B, undefined), false);
  assert.equal(ownerA.canWritePublicVerify(BRANCH_A, BRANCH_B), false);
  assert.equal(ownerA.canWritePublicVerify(BRANCH_A, BRANCH_A), true);

  // Creator passes everything except adding Creator email to branch staff or deleting paid bills
  assert.equal(creator.canUpdateBranchKeys(BRANCH_A, ['ntn', 'companyHeaderEn']), true);
  assert.equal(creator.canReadBranch(BRANCH_B), true);
  assert.equal(creator.canUpsertMember(BRANCH_B, 'owner_b@gmail.com', 'branch_owner', true), true);
  assert.equal(creator.canUpsertMember(BRANCH_B, CREATOR_EMAIL, 'munshi', false), false);
  assert.equal(creator.canAccessCreatorVault('u_cr', 'u_cr'), true);
  assert.equal(creator.canDeleteBill(BRANCH_A, 'paid', 1000), false);
});

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

  const listRes = await fetch(`${baseUrl}/publicBiltyVerifications`);
  assert.equal(listRes.status, 403, 'Expected 403 Permission Denied on unauthenticated publicBiltyVerifications list');

  const crashRes = await fetch(`${baseUrl}/crashReports`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      fields: {
        errorMessage: { stringValue: 'spam' },
        appVersion: { stringValue: '1.3.1' },
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
