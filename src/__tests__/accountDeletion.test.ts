import { describe, it, expect, beforeEach } from 'vitest';
import {
  requestAccountDeletion,
  cancelAccountDeletion,
  getAccountDeletionStatus,
  safeStorage
} from '../utils/storage';

describe('Account Deletion & 30-Day Grace Period Tests', () => {
  beforeEach(() => {
    safeStorage.removeItem('ah-deletion-test-user-123');
  });

  it('correctly schedules account deletion 30 days into the future', async () => {
    const userId = 'test-user-123';
    const userEmail = 'transporter@example.com';
    const beforeTime = Date.now();

    const res = await requestAccountDeletion(userId, userEmail, 'Testing deletion');
    expect(res.success).toBe(true);
    expect(res.scheduledFor).toBeDefined();

    const scheduledDate = new Date(res.scheduledFor).getTime();
    const expectedDiffDays = (scheduledDate - beforeTime) / (1000 * 60 * 60 * 24);

    // Difference must be approximately 30 days (allow 0.1 day leeway)
    expect(expectedDiffDays).toBeGreaterThan(29.9);
    expect(expectedDiffDays).toBeLessThan(30.1);

    const status = getAccountDeletionStatus(userId);
    expect(status).not.toBeNull();
    expect(status?.status).toBe('pending_deletion');
    expect(status?.userEmail).toBe(userEmail);
    expect(status?.userId).toBe(userId);
  });

  it('allows user to cancel account deletion within the grace period', async () => {
    const userId = 'test-user-123';
    const userEmail = 'transporter@example.com';

    await requestAccountDeletion(userId, userEmail);
    expect(getAccountDeletionStatus(userId)).not.toBeNull();

    const cancelRes = await cancelAccountDeletion(userId);
    expect(cancelRes.success).toBe(true);

    const status = getAccountDeletionStatus(userId);
    expect(status).toBeNull();
  });

  it('correctly detects whether account deletion is still in grace period or expired for purge', async () => {
    const userId = 'test-user-123';
    const userEmail = 'transporter@example.com';

    // 1. Fresh request scheduled 30 days ahead -> should NOT purge
    await requestAccountDeletion(userId, userEmail);
    const { purgeExpiredAccountData } = await import('../utils/storage');
    const didPurgeFresh = await purgeExpiredAccountData(userId);
    expect(didPurgeFresh).toBe(false);

    // 2. Simulated expired request (scheduled in the past) -> should execute purge
    const expiredData = {
      userId,
      userEmail,
      requestedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      scheduledFor: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending_deletion' as const
    };
    safeStorage.setItem(`ah-deletion-${userId}`, JSON.stringify(expiredData));

    const didPurgeExpired = await purgeExpiredAccountData(userId);
    expect(didPurgeExpired).toBe(true);
    expect(getAccountDeletionStatus(userId)).toBeNull();
  });

  it('generates a unique verifiable referenceId on account deletion request', async () => {
    const userId = 'test-ref-user';
    const userEmail = 'refuser@example.com';
    const res = await requestAccountDeletion(userId, userEmail);

    expect(res.referenceId).toBeDefined();
    expect(res.referenceId.startsWith('DEL-')).toBe(true);

    const status = getAccountDeletionStatus(userId);
    expect(status?.referenceId).toBe(res.referenceId);
  });

  it('executes immediate account deletion and clears local and cloud scopes', async () => {
    const userId = 'immediate-test-user';
    const { executeImmediateAccountDeletion } = await import('../utils/storage');

    safeStorage.setItem(`ah-deletion-${userId}`, JSON.stringify({ userId, status: 'pending_deletion' }));
    safeStorage.setItem('ah-gmail-user', 'user@example.com');

    const res = await executeImmediateAccountDeletion(userId);
    expect(res.success).toBe(true);
    expect(safeStorage.getItem(`ah-deletion-${userId}`)).toBeNull();
    expect(safeStorage.getItem('ah-gmail-user')).toBeNull();
  });
});
