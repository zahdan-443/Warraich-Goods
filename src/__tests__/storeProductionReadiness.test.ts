import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractPublicBiltyVerification,
  deleteUserAccountAndCloudData,
  processOfflineQueue,
  getStoredOfflineQueue,
  saveStoredOfflineQueue
} from '../utils/storage';
import { verifyFirestoreDataIsolation, isBiltyNumberUnique } from '../utils/calculator';
import { BiltyRecord } from '../types';

describe('Store Production Readiness & Security Compliance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Public Bilty Verification Privacy Sanitization', () => {
    it('strictly strips all PII, CNICs, phone numbers, party names, financials, and delivery status', () => {
      const sensitiveBilty: BiltyRecord = {
        id: 101,
        biltyNo: 'AH-2026-0042',
        date: '2026-10-24',
        sendingCity: 'Samundri',
        receivingCity: 'Karachi',
        senderName: 'Muhammad Ali',
        senderMobile: '03001234567',
        senderCnic: '35201-1234567-1',
        receiverName: 'Tariq Goods',
        receiverMobile: '03217654321',
        driverName: 'Riaz Driver',
        mobileNo: '03339988776',
        itemDescription: 'Cotton Bales',
        qty: '50',
        weight: '2500 kg',
        vehicleNo: 'LES-20-4124',
        total: 150000,
        advance: 50000,
        payable: 100000,
        isDelivered: true,
        podConfirmation: {
          receiverName: 'Tariq Receiver',
          confirmedAt: '2026-10-24T12:00:00Z',
          photoUrl: 'https://example.com/pod.png',
          status: 'delivered'
        }
      };

      const sanitized = extractPublicBiltyVerification(sensitiveBilty);

      // Verify safe allowed fields exist
      expect(sanitized.biltyNo).toBe('AH-2026-0042');
      expect(sanitized.date).toBe('2026-10-24');
      expect(sanitized.sendingCity).toBe('Samundri');
      expect(sanitized.receivingCity).toBe('Karachi');
      expect(sanitized.itemDescription).toBe('Cotton Bales');
      expect(sanitized.qty).toBe('50');
      expect(sanitized.weight).toBe('2500 kg');
      expect(sanitized.vehicleNo).toBe('LES-20-4124');
      expect(sanitized.verifiedPublicly).toBe(true);

      // Verify forbidden PII & financial fields do NOT exist
      const objKeys = Object.keys(sanitized);
      const forbidden = [
        'senderName', 'senderMobile', 'senderCnic',
        'receiverName', 'receiverMobile', 'receiverCnic',
        'driverName', 'mobileNo', 'consignor', 'consignee',
        'total', 'advance', 'payable', 'freight',
        'isDelivered', 'podConfirmation', 'receivedBy'
      ];

      forbidden.forEach(key => {
        expect(objKeys).not.toContain(key);
      });
    });
  });

  describe('2. User Data Isolation & Firestore Rules Validation', () => {
    it('allows access to user isolated paths for authenticated user', () => {
      const res = verifyFirestoreDataIsolation('user_abc123', 'users/user_abc123/collections/trips');
      expect(res.isAllowed).toBe(true);
    });

    it('denies cross-tenant data access to other users collections', () => {
      const res = verifyFirestoreDataIsolation('user_abc123', 'users/user_xyz789/collections/trips');
      expect(res.isAllowed).toBe(false);
      expect(res.reason).toContain('Security violation');
    });

    it('denies cross-tenant data access to other usersData root documents', () => {
      const res = verifyFirestoreDataIsolation('user_abc123', 'usersData/user_xyz789');
      expect(res.isAllowed).toBe(false);
      expect(res.reason).toContain('Security violation');
    });
  });

  describe('3. Offline Queue Retention', () => {
    it('retains un-synced offline actions in queue until authenticated/processed', async () => {
      saveStoredOfflineQueue([
        {
          id: 'test_action_1',
          type: 'trip',
          data: { name: 'Test Trip' },
          timestamp: new Date().toISOString(),
          retryCount: 0
        }
      ]);

      await processOfflineQueue();

      const remaining = getStoredOfflineQueue();
      expect(remaining.length).toBe(1);
      expect(remaining[0].id).toBe('test_action_1');
    });
  });

  describe('4. Bilty Allocation & Uniqueness', () => {
    it('detects duplicate bilty numbers accurately', () => {
      const existing = [{ biltyNo: 'AH-0001' }, { biltyNo: 'AH-0002' }];
      expect(isBiltyNumberUnique('AH-0001', existing)).toBe(false);
      expect(isBiltyNumberUnique('AH-0003', existing)).toBe(true);
    });
  });

  describe('5. Account Deletion', () => {
    it('handles unauthenticated account deletion attempt gracefully', async () => {
      const res = await deleteUserAccountAndCloudData();
      expect(res.success).toBe(false);
      expect(res.message).toContain('No authenticated user');
    });
  });
});
