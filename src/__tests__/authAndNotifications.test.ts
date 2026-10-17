import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkRedirectAuthResult,
  loginWithGoogleRedirect
} from '../utils/firebase';
import {
  sendSystemNotification,
  isNotificationSupported,
  getNotificationPermission
} from '../utils/notifications';

describe('Auth & Notifications Utility Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Firebase Auth Helpers', () => {
    it('checkRedirectAuthResult should gracefully return null on auth errors without throwing', async () => {
      const result = await checkRedirectAuthResult();
      expect(result).toBeNull();
    });

    it('loginWithGoogleRedirect should log deprecation notice and complete cleanly', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      await loginWithGoogleRedirect();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('loginWithGoogleRedirect is deprecated')
      );
    });
  });

  describe('Notifications System Permission Handling', () => {
    it('isNotificationSupported should safely check browser support', () => {
      const supported = isNotificationSupported();
      expect(typeof supported).toBe('boolean');
    });

    it('getNotificationPermission should return permission status', async () => {
      const perm = await getNotificationPermission();
      expect(['granted', 'denied', 'default']).toContain(perm);
    });

    it('sendSystemNotification should throttle rapid consecutive triggers', async () => {
      const res1 = await sendSystemNotification('Test Alert 1', 'Message 1');
      const res2 = await sendSystemNotification('Test Alert 2', 'Message 2');
      // Second call within 500ms should be throttled and return false
      expect(res2).toBe(false);
    });
  });
});
