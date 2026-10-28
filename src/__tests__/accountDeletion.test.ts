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
});
