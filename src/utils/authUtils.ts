/**
 * Driver Dost - Centralized Owner & Role Authorization Helpers
 *
 * Single source of truth for owner identification and document access checks,
 * eliminating scattered hardcoded owner email checks across components and storage.
 */

export const OWNER_EMAIL = 'warraichgoods43@gmail.com';
export const DEFAULT_AUTHORIZED_EMAILS: readonly string[] = [OWNER_EMAIL];

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

export function verifyOwnerOrStaffClaim(
  user?: AuthUserLike | null,
  allowedUIDs: string[] = [],
  allowedEmails: string[] = []
): boolean {
  if (!user) return false;
  if (isOwnerUser(user)) return true;
  if (user.uid && allowedUIDs.includes(user.uid)) return true;
  const email = normalizeEmail(user.email);
  if (email && allowedEmails.map(normalizeEmail).includes(email)) return true;
  return false;
}
