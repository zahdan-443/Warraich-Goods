/**
 * Driver Dost - Centralized Owner & Role Authorization Helpers
 *
 * Single source of truth for owner identification and document access checks,
 * eliminating scattered hardcoded owner email checks across components and storage.
 */

import type {
  BranchConfig,
  BranchPermissions,
  BranchPresetRole,
  UserBranchAccess
} from '../types';

export const OWNER_EMAIL = 'warraichgoods43@gmail.com';
export const DEFAULT_AUTHORIZED_EMAILS: readonly string[] = [OWNER_EMAIL];
export const DEFAULT_HEAD_OFFICE_BRANCH_ID = 'samundri';

export const EMPTY_BRANCH_PERMISSIONS: BranchPermissions = {
  createBilty: false,
  editDeleteBilty: false,
  viewAllBilties: false,
  khataAccess: false,
  fleetAccess: false,
  viewBranchReports: false,
  manageBranchStaff: false
};

export const FULL_OWNER_PERMISSIONS: BranchPermissions = {
  createBilty: true,
  editDeleteBilty: true,
  viewAllBilties: true,
  khataAccess: true,
  fleetAccess: true,
  viewBranchReports: true,
  manageBranchStaff: true
};

export const PRESET_ROLE_PERMISSIONS: Record<BranchPresetRole, BranchPermissions> = {
  branch_owner: {
    createBilty: true,
    editDeleteBilty: true,
    viewAllBilties: true,
    khataAccess: true,
    fleetAccess: true,
    viewBranchReports: true,
    manageBranchStaff: true
  },
  branch_manager: {
    createBilty: true,
    editDeleteBilty: true,
    viewAllBilties: true,
    khataAccess: true,
    fleetAccess: true,
    viewBranchReports: true,
    manageBranchStaff: false
  },
  munshi: {
    createBilty: true,
    editDeleteBilty: false,
    viewAllBilties: true,
    khataAccess: true,
    fleetAccess: false,
    viewBranchReports: false,
    manageBranchStaff: false
  },
  accountant: {
    createBilty: false,
    editDeleteBilty: false,
    viewAllBilties: true,
    khataAccess: true,
    fleetAccess: false,
    viewBranchReports: true,
    manageBranchStaff: false
  },
  viewer: {
    createBilty: false,
    editDeleteBilty: false,
    viewAllBilties: true,
    khataAccess: false,
    fleetAccess: false,
    viewBranchReports: true,
    manageBranchStaff: false
  }
};

export const PRESET_ROLE_LABELS: Record<BranchPresetRole, { en: string; ur: string }> = {
  branch_owner: { en: 'Branch Owner', ur: 'برانچ مالک' },
  branch_manager: { en: 'Branch Manager', ur: 'برانچ منیجر' },
  munshi: { en: 'Munshi / Clerk', ur: 'منشی / کلرک' },
  accountant: { en: 'Accountant', ur: 'اکاؤنٹنٹ' },
  viewer: { en: 'Viewer (Read-Only)', ur: 'صرف دیکھنے والا' }
};

export interface AuthUserLike {
  uid?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  role?: string | null;
}

export function normalizeEmail(email?: string | null): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isOwnerEmail(email?: string | null): boolean {
  return normalizeEmail(email) === OWNER_EMAIL;
}

export function isOwnerUser(user?: AuthUserLike | null): boolean {
  if (!user) return false;
  if (isOwnerEmail(user.email)) return true;
  return user.role === 'owner';
}

export function verifyEmailVerifiedOwner(user?: AuthUserLike | null): boolean {
  if (!user) return false;
  if (!isOwnerEmail(user.email)) return false;
  return user.emailVerified !== false;
}

export function getPresetPermissions(role: BranchPresetRole): BranchPermissions {
  return { ...(PRESET_ROLE_PERMISSIONS[role] || PRESET_ROLE_PERMISSIONS.viewer) };
}

export function normalizeBranchPermissions(
  raw?: Partial<BranchPermissions> | null,
  fallbackRole: BranchPresetRole = 'viewer'
): BranchPermissions {
  const base = getPresetPermissions(fallbackRole);
  if (!raw || typeof raw !== 'object') return base;
  return {
    createBilty: typeof raw.createBilty === 'boolean' ? raw.createBilty : base.createBilty,
    editDeleteBilty: typeof raw.editDeleteBilty === 'boolean' ? raw.editDeleteBilty : base.editDeleteBilty,
    viewAllBilties: typeof raw.viewAllBilties === 'boolean' ? raw.viewAllBilties : base.viewAllBilties,
    khataAccess: typeof raw.khataAccess === 'boolean' ? raw.khataAccess : base.khataAccess,
    fleetAccess: typeof raw.fleetAccess === 'boolean' ? raw.fleetAccess : base.fleetAccess,
    viewBranchReports: typeof raw.viewBranchReports === 'boolean' ? raw.viewBranchReports : base.viewBranchReports,
    manageBranchStaff: typeof raw.manageBranchStaff === 'boolean' ? raw.manageBranchStaff : base.manageBranchStaff
  };
}

/**
 * Strictly excludes the App Creator (warraichgoods43@gmail.com) from other branches'
 * visible staff rosters and selectable user lists so the creator's role never leaks
 * or appears inside other branches.
 */
export function filterStaffRosterExcludingCreator<T extends { email?: string | null }>(
  items: T[]
): T[] {
  return items.filter(item => !isOwnerEmail(item?.email));
}

export function resolveEffectivePermissions(
  userEmail?: string | null,
  access?: UserBranchAccess | null,
  branch?: BranchConfig | null
): BranchPermissions {
  if (isOwnerEmail(userEmail)) {
    return { ...FULL_OWNER_PERMISSIONS };
  }
  if (!access || access.status !== 'active') {
    return { ...EMPTY_BRANCH_PERMISSIONS };
  }
  if (branch && branch.active === false) {
    return { ...EMPTY_BRANCH_PERMISSIONS };
  }
  const normalizedUser = normalizeEmail(userEmail);
  if (!normalizedUser || normalizeEmail(access.email) !== normalizedUser) {
    return { ...EMPTY_BRANCH_PERMISSIONS };
  }
  return normalizeBranchPermissions(access.permissions, access.presetRole);
}

export function hasAnyBiltyPermission(perms?: Partial<BranchPermissions> | null): boolean {
  if (!perms) return false;
  return Boolean(perms.createBilty || perms.editDeleteBilty || perms.viewAllBilties);
}

export function verifyOwnerOrStaffClaim(
  user?: AuthUserLike | null,
  allowedUIDs: string[] = [],
  allowedEmails: string[] = [],
  branchAccess?: UserBranchAccess | null,
  branch?: BranchConfig | null
): boolean {
  if (!user) return false;
  if (isOwnerUser(user)) return true;
  if (branchAccess) {
    const perms = resolveEffectivePermissions(user.email, branchAccess, branch);
    if (hasAnyBiltyPermission(perms)) return true;
  }
  if (user.uid && allowedUIDs.includes(user.uid)) return true;
  const email = normalizeEmail(user.email);
  if (email && allowedEmails.map(normalizeEmail).includes(email)) return true;
  return false;
}
