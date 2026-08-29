import { describe, it, expect, vi } from 'vitest';
import {
  calculateFuelCost,
  calculateRoundTrip,
  validateBiltyFreight,
  validateBiltyFinancials,
  validateFinancialNumber,
  validateTripFinancials,
  validateVehicleAccountFinancials,
  formatPKR,
  isBiltyNumberUnique,
  checkUserPermissions,
  executeQueueProcessing,
  verifyFirestoreDataIsolation,
  getStorageScope,
  getScopedStorageKey,
  OWNER_EMAIL,
  maskCNIC,
  maskPhoneNumber,
  anonymizePersonName,
  sanitizeBiltyRecord,
  sanitizeDriverRecord,
  sanitizeTripRecord
} from '../utils/calculator';
import {
  getStoredTrips,
  getStoredVehicles,
  getStoredDrivers,
  DEFAULT_COMPANY_PROFILE,
  logError,
  getErrorLogs,
  clearErrorLogs,
  getSyncStatus
} from '../utils/storage';
import { escapeHtml, sanitizeHtml } from '../utils/pdfHelper';
import { OfflineAction } from '../types';

describe('Warraich Goods Logistics & Security Test Suite', () => {

  // =========================================================================
  // 1. Fuel Cost Calculation Tests
  // =========================================================================
  describe('1. Fuel Cost Calculation', () => {
    it('should accurately calculate fuel consumption and cost for a standard one-way trip', () => {
      // Distance: 1250 km, Mileage: 9 km/L, Fuel Price: PKR 290/L
      const result = calculateFuelCost(1250, 9, 290, false);
      expect(result.totalDist).toBe(1250);
      expect(result.consumedLiters).toBe(138.89);
      expect(result.fuelCost).toBe(40278);
    });

    it('should double distance and calculate correct cost for return trips', () => {
      // Return trip of 500 km each way (Total 1000 km), Mileage: 10 km/L, Diesel: PKR 280/L
      const result = calculateFuelCost(500, 10, 280, true);
      expect(result.totalDist).toBe(1000);
      expect(result.consumedLiters).toBe(100);
      expect(result.fuelCost).toBe(28000);
    });

    it('should safely return zero for invalid or zero inputs without crashing', () => {
      expect(calculateFuelCost(0, 9, 290)).toEqual({ totalDist: 0, consumedLiters: 0, fuelCost: 0 });
      expect(calculateFuelCost(500, 0, 290)).toEqual({ totalDist: 0, consumedLiters: 0, fuelCost: 0 });
      expect(calculateFuelCost(500, 10, -50)).toEqual({ totalDist: 0, consumedLiters: 0, fuelCost: 0 });
    });
  });

  // =========================================================================
  // 2. Round Trip Calculation Tests
  // =========================================================================
  describe('2. Round Trip Calculation', () => {
    it('should correctly double distance, double tolls, and aggregate all transport expenses', () => {
      // One-way: 300 km, Mileage: 10 km/L, Fuel: 290/L, Toll: 1000, Loading: 2000, Driver: 3000, Other: 500
      const result = calculateRoundTrip(300, 10, 290, 1000, 2000, 3000, 500);

      expect(result.roundTripDist).toBe(600);
      expect(result.consumedLiters).toBe(60);
      expect(result.fuelCost).toBe(17400); // 60 * 290
      expect(result.totalToll).toBe(2000); // 1000 * 2
      expect(result.totalExpense).toBe(17400 + 2000 + 2000 + 3000 + 500); // 24900
    });

    it('should handle zero tolls and miscellaneous expenses gracefully', () => {
      const result = calculateRoundTrip(250, 12.5, 280, 0, 0, 0, 0);
      expect(result.roundTripDist).toBe(500);
      expect(result.consumedLiters).toBe(40);
      expect(result.fuelCost).toBe(11200);
      expect(result.totalToll).toBe(0);
      expect(result.totalExpense).toBe(11200);
    });
  });

  // =========================================================================
  // 3. Advance / Total Freight Validation Tests
  // =========================================================================
  describe('3. Advance / Total Validation', () => {
    it('should validate and calculate correct remaining payable balance when advance is less than total', () => {
      const validation = validateBiltyFreight(55000, 20000);
      expect(validation.isValid).toBe(true);
      expect(validation.total).toBe(55000);
      expect(validation.advance).toBe(20000);
      expect(validation.payable).toBe(35000);
      expect(validation.error).toBeUndefined();
    });

    it('should permit full advance payment resulting in zero payable balance', () => {
      const validation = validateBiltyFreight(40000, 40000);
      expect(validation.isValid).toBe(true);
      expect(validation.payable).toBe(0);
    });

    it('should reject advance payments that exceed the total freight amount', () => {
      const validation = validateBiltyFreight(30000, 35000);
      expect(validation.isValid).toBe(false);
      expect(validation.payable).toBe(0);
      expect(validation.error).toContain('Advance payment cannot exceed total freight');
    });

    it('should handle zero advance gracefully', () => {
      const validation = validateBiltyFreight(45000, 0);
      expect(validation.isValid).toBe(true);
      expect(validation.payable).toBe(45000);
    });
  });

  // =========================================================================
  // 4. Bilty Number Uniqueness Tests
  // =========================================================================
  describe('4. Bilty Number Uniqueness', () => {
    const existing = [
      { biltyNo: 'AH-0001' },
      { biltyNo: 'AH-0002' },
      { biltyNo: 'AH-0003' }
    ];

    it('should confirm uniqueness for a new non-existing Bilty number', () => {
      expect(isBiltyNumberUnique('AH-0004', existing)).toBe(true);
      expect(isBiltyNumberUnique('AH-9999', existing)).toBe(true);
    });

    it('should detect and reject duplicate Bilty numbers (case-insensitive)', () => {
      expect(isBiltyNumberUnique('AH-0001', existing)).toBe(false);
      expect(isBiltyNumberUnique('ah-0002', existing)).toBe(false);
      expect(isBiltyNumberUnique(' AH-0003 ', existing)).toBe(false);
    });

    it('should reject empty or null Bilty numbers', () => {
      expect(isBiltyNumberUnique('', existing)).toBe(false);
      expect(isBiltyNumberUnique('   ', existing)).toBe(false);
      expect(isBiltyNumberUnique(null as any, existing)).toBe(false);
    });
  });

  // =========================================================================
  // 5. Role / Access Permissions Tests
  // =========================================================================
  describe('5. Role / Access Permissions', () => {
    it('should grant full owner access to the authenticated App Owner email', () => {
      const perms = checkUserPermissions({
        email: OWNER_EMAIL,
        role: 'owner'
      });

      expect(perms.isOwner).toBe(true);
      expect(perms.canAccessBilty).toBe(true);
      expect(perms.canEditCompanyProfile).toBe(true);
      expect(perms.canManageAccess).toBe(true);
    });

    it('should restrict Bilty access and company settings for standard guest/drivers', () => {
      const perms = checkUserPermissions({
        email: 'driver123@gmail.com',
        role: 'driver',
        uid: 'driver_uid_1',
        allowedUIDs: [],
        allowedEmails: []
      });

      expect(perms.isOwner).toBe(false);
      expect(perms.canAccessBilty).toBe(false);
      expect(perms.canEditCompanyProfile).toBe(false);
      expect(perms.canManageAccess).toBe(false);
      expect(perms.canManageFleet).toBe(true);
    });

    it('should grant Bilty access to drivers whose UID is explicitly allowed', () => {
      const perms = checkUserPermissions({
        email: 'staff@example.com',
        role: 'driver',
        uid: 'special_driver_uid',
        allowedUIDs: ['special_driver_uid'],
        allowedEmails: []
      });

      expect(perms.isOwner).toBe(false);
      expect(perms.canAccessBilty).toBe(true);
      expect(perms.canEditCompanyProfile).toBe(false);
    });

    it('should grant Bilty access to drivers whose Email is explicitly allowed', () => {
      const perms = checkUserPermissions({
        email: 'manager.liaquat@gmail.com',
        role: 'driver',
        uid: 'random_uid',
        allowedUIDs: [],
        allowedEmails: ['manager.liaquat@gmail.com']
      });

      expect(perms.isOwner).toBe(false);
      expect(perms.canAccessBilty).toBe(true);
      expect(perms.canEditCompanyProfile).toBe(false);
    });
  });

  // =========================================================================
  // 6. Offline Queue Retry & Processing Tests
  // =========================================================================
  describe('6. Offline Queue Retry Mechanism', () => {
    it('should retain queue when offline without executing sync', async () => {
      const queue: OfflineAction[] = [
        { id: 1, type: 'trip', data: { name: 'Trip 1' }, timestamp: '2026-08-26T12:00:00Z', retryCount: 0 }
      ];
      const mockSync = vi.fn().mockResolvedValue(true);

      const result = await executeQueueProcessing(queue, false, mockSync);
      expect(result.processedActions.length).toBe(0);
      expect(result.remainingQueue.length).toBe(1);
      expect(mockSync).not.toHaveBeenCalled();
    });

    it('should process all actions and clear queue when online and sync succeeds', async () => {
      const queue: OfflineAction[] = [
        { id: 1, type: 'trip', data: { name: 'Trip 1' }, timestamp: '2026-08-26T12:00:00Z', retryCount: 0 },
        { id: 2, type: 'vehicle', data: { reg: 'LHR-7860' }, timestamp: '2026-08-26T12:05:00Z', retryCount: 0 }
      ];
      const mockSync = vi.fn().mockResolvedValue(true);

      const result = await executeQueueProcessing(queue, true, mockSync);
      expect(result.processedActions.length).toBe(2);
      expect(result.remainingQueue.length).toBe(0);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
    });

    it('should increment retry count on failure and cap retries at 5', async () => {
      const queue: OfflineAction[] = [
        { id: 'act_1', type: 'trip', data: { name: 'Failing Trip' }, timestamp: '2026-08-26T12:00:00Z', retryCount: 2 },
        { id: 'act_2', type: 'bilty', data: { no: 'AH-0099' }, timestamp: '2026-08-26T12:01:00Z', retryCount: 5 }
      ];
      const mockSync = vi.fn().mockResolvedValue(false);

      const result = await executeQueueProcessing(queue, true, mockSync);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(2);
      expect(result.remainingQueue.find(a => a.id === 'act_1')?.retryCount).toBe(3);
      expect(result.remainingQueue.find(a => a.id === 'act_2')).toBeUndefined();
    });
  });

  // =========================================================================
  // 7. Firestore Data Isolation Tests
  // =========================================================================
  describe('7. Firestore Data Isolation', () => {
    const userA = 'user_alpha_123';
    const userB = 'user_beta_456';

    it('should allow user access to their own isolated collections and root document', () => {
      expect(verifyFirestoreDataIsolation(userA, `users/${userA}`).isAllowed).toBe(true);
      expect(verifyFirestoreDataIsolation(userA, `users/${userA}/collections/trips`).isAllowed).toBe(true);
      expect(verifyFirestoreDataIsolation(userA, `users/${userA}/collections/bilties`).isAllowed).toBe(true);
      expect(verifyFirestoreDataIsolation(userA, `usersData/${userA}`).isAllowed).toBe(true);
    });

    it('should strictly block attempted access to another users collection path', () => {
      const attempt1 = verifyFirestoreDataIsolation(userA, `users/${userB}/collections/trips`);
      expect(attempt1.isAllowed).toBe(false);
      expect(attempt1.reason).toContain('cross-tenant data access');

      const attempt2 = verifyFirestoreDataIsolation(userA, `usersData/${userB}`);
      expect(attempt2.isAllowed).toBe(false);
      expect(attempt2.reason).toContain('cross-tenant data access');
    });

    it('should reject unauthenticated access to private paths', () => {
      const result = verifyFirestoreDataIsolation('', `users/${userA}/collections/trips`);
      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('Unauthenticated');
    });
  });

  // =========================================================================
  // 8. Phase 2: User-Scoped Storage Keys & Isolation
  // =========================================================================
  describe('8. User-Scoped Storage Keys & Data Isolation', () => {
    it('should produce guest scope when unauthenticated', () => {
      expect(getStorageScope(null)).toBe('guest');
      expect(getScopedStorageKey('trips', 'guest')).toBe('wg_v2_guest_trips');
      expect(getScopedStorageKey('vehicles', 'guest')).toBe('wg_v2_guest_vehicles');
    });

    it('should generate isolated scoped key for authenticated user UID', () => {
      const fakeUser = { uid: 'firebase_user_786', email: 'driver@wg.com' } as any;
      const scope = getStorageScope(fakeUser);
      expect(scope).toBe('firebase_user_786');
      expect(getScopedStorageKey('trips', scope)).toBe('wg_v2_firebase_user_786_trips');
      expect(getScopedStorageKey('bilties', scope)).toBe('wg_v2_firebase_user_786_bilties');
    });

    it('should support email sanitized scope fallback', () => {
      const scope = getStorageScope(null, 'test.driver@gmail.com');
      expect(scope).toBe('test_driver_gmail_com');
      expect(getScopedStorageKey('fuel', scope)).toBe('wg_v2_test_driver_gmail_com_fuel');
    });
  });

  // =========================================================================
  // 9. Phase 2: Comprehensive Financial Validation
  // =========================================================================
  describe('9. Financial Validation Engine', () => {
    it('should validate financial numbers and enforce bounds', () => {
      expect(validateFinancialNumber('25000', 'Amount').isValid).toBe(true);
      expect(validateFinancialNumber('25000', 'Amount').value).toBe(25000);
      expect(validateFinancialNumber('-100', 'Amount').isValid).toBe(false);
      expect(validateFinancialNumber('invalid_str', 'Amount').isValid).toBe(false);
      expect(validateFinancialNumber('0', 'Rate', { allowZero: false }).isValid).toBe(false);
      expect(validateFinancialNumber('0', 'Rate', { allowZero: true }).isValid).toBe(true);
    });

    it('should compute complete Bilty financials including labour, commission and payable balance', () => {
      const bFin = validateBiltyFinancials({
        baseFreight: 60000,
        advance: 20000,
        laborCharges: 2500,
        commission: 1500
      });
      expect(bFin.isValid).toBe(true);
      expect(bFin.totalFreight).toBe(61000); // 60000 + 2500 - 1500
      expect(bFin.advance).toBe(20000);
      expect(bFin.payable).toBe(41000); // 61000 - 20000
      expect(bFin.breakdown.labor).toBe(2500);
      expect(bFin.breakdown.commission).toBe(1500);
    });

    it('should compute Vehicle Account financials with multiple incomes and expenses', () => {
      const incomes = [
        { id: '1', label: 'Going Trip', amount: 75000 },
        { id: '2', label: 'Return Trip', amount: 65000 }
      ];
      const expenses = {
        diesel: 45000,
        toll: 6000,
        challan: 1000,
        rotiKharcha: 3500,
        chowkidara: 500,
        gariKaam: 8000,
        driverCommission: 12000,
        customTotal: 2000
      };

      const result = validateVehicleAccountFinancials(incomes, expenses);
      expect(result.isValid).toBe(true);
      expect(result.totalIncome).toBe(140000);
      expect(result.totalExpense).toBe(45000 + 6000 + 1000 + 3500 + 500 + 8000 + 12000 + 2000); // 78000
      expect(result.netProfit).toBe(62000); // 140000 - 78000
    });

    it('should format Pakistani Rupee amounts cleanly', () => {
      expect(formatPKR(25000)).toBe('Rs 25,000');
      expect(formatPKR(1500000)).toBe('Rs 1,500,000');
    });
  });

  // =========================================================================
  // 10. Phase 2: Personal Demo Data Cleansing Verification
  // =========================================================================
  describe('10. Personal Demo Data Cleansing', () => {
    it('should ensure initial trips and vehicles start clean for new users', () => {
      expect(getStoredTrips()).toEqual([]);
      expect(getStoredVehicles()).toEqual([]);
      expect(getStoredDrivers()).toEqual([]);
    });

    it('should maintain authoritative official company identity', () => {
      expect(DEFAULT_COMPANY_PROFILE.ownerName).toBe('زاہدان نصر وڑائچ');
      expect(DEFAULT_COMPANY_PROFILE.ntn).toBe('7779394-1');
      expect(DEFAULT_COMPANY_PROFILE.headOfficeUr).toContain('سمندری، فیصل آباد');
    });
  });

  // =========================================================================
  // 11. Phase 3: Export Privacy Controls & Data Masking
  // =========================================================================
  describe('11. Export Privacy Controls & Data Masking', () => {
    it('should properly mask CNIC numbers for public export', () => {
      expect(maskCNIC('35201-1234567-1')).toBe('35201-******7-1');
      expect(maskCNIC('33100-9876543-2')).toBe('33100-******3-2');
      expect(maskCNIC('')).toBe('');
    });

    it('should properly mask phone numbers when privacy is enabled', () => {
      expect(maskPhoneNumber('03005370443')).toBe('0300-***0443');
      expect(maskPhoneNumber('03331234567')).toBe('0333-***4567');
      expect(maskPhoneNumber('')).toBe('');
    });

    it('should anonymize customer and driver names when requested', () => {
      expect(anonymizePersonName('Muhammad Ali')).toBe('M. A***');
      expect(anonymizePersonName('Tariq')).toBe('T***');
      expect(anonymizePersonName('')).toBe('');
    });

    it('should sanitize Bilty records according to granular privacy options', () => {
      const mockBilty = {
        id: 1,
        biltyNo: 'WG-1001',
        senderName: 'Ali Khan',
        receiverName: 'Usman Ghani',
        senderCnic: '35201-1234567-1',
        senderMobile: '03001234567',
        receiverMobile: '03217654321',
        total: 50000,
        advance: 15000,
        payable: 35000
      };

      // 1. With CNIC masking enabled and phone masking enabled
      const sanitized = sanitizeBiltyRecord(mockBilty, {
        maskCnic: true,
        maskPhone: true,
        includeFinancials: true,
        anonymizeNames: true
      });

      expect(sanitized.biltyNo).toBe('WG-1001');
      expect(sanitized.senderName).toBe('A. K***');
      expect(sanitized.senderCnic).toBe('35201-******7-1');
      expect(sanitized.senderMobile).toBe('0300-***4567');
      expect(sanitized.total).toBe(50000);

      // 2. With Financials Hidden
      const hiddenFin = sanitizeBiltyRecord(mockBilty, {
        includeFinancials: false
      });
      expect(hiddenFin.total).toBe('[HIDDEN]');
      expect(hiddenFin.payable).toBe('[HIDDEN]');
    });

    it('should sanitize Driver and Trip records according to privacy options', () => {
      const mockDriver = {
        id: 1,
        name: 'Rashid Khan',
        phone: '03007654321',
        cnic: '33100-1122334-5',
        license: 'PB-12345'
      };
      const sanitizedDriver = sanitizeDriverRecord(mockDriver, {
        maskCnic: true,
        maskPhone: true,
        anonymizeNames: true
      });
      expect(sanitizedDriver.name).toBe('R. K***');
      expect(sanitizedDriver.phone).toBe('0300-***4321');
      expect(sanitizedDriver.cnic).toBe('33100-******4-5');
      expect(sanitizedDriver.license).toBe('LIC-*****');

      const mockTrip = {
        id: 1,
        name: 'Lahore to Karachi',
        fuelCost: 45000,
        toll: 5000,
        total: 55000
      };
      const sanitizedTrip = sanitizeTripRecord(mockTrip, { includeFinancials: false });
      expect(sanitizedTrip.fuelCost).toBe('[HIDDEN]');
      expect(sanitizedTrip.total).toBe('[HIDDEN]');
    });
  });

  // =========================================================================
  // 12. Phase 3: Error Telemetry Logging & Sync Status
  // =========================================================================
  describe('12. Error Telemetry Logging & Sync Status', () => {
    it('should record, retrieve, and clear error logs', () => {
      clearErrorLogs();
      expect(getErrorLogs()).toEqual([]);

      logError('Network Test', new Error('Simulated network timeout'), { code: 504 });
      const logs = getErrorLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('Network Test');
      expect(logs[0].error).toContain('Simulated network timeout');

      clearErrorLogs();
      expect(getErrorLogs()).toEqual([]);
    });

    it('should provide comprehensive sync status information', () => {
      const status = getSyncStatus();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('pendingCount');
      expect(status).toHaveProperty('lastSyncTime');
      expect(status).toHaveProperty('errorsList');
    });
  });

  // =========================================================================
  // 13. DOM-based XSS Prevention & HTML Sanitization
  // =========================================================================
  describe('13. DOM-based XSS Prevention & HTML Sanitization', () => {
    it('should safely escape malicious characters from user input strings', () => {
      const maliciousInput = '<script>alert("XSS")</script>&<img src=x onerror=alert(1)>';
      const escaped = escapeHtml(maliciousInput);
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('</script>');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&quot;');
    });

    it('should sanitize injected HTML using DOMPurify', () => {
      const dangerousHtml = '<div onclick="alert(1)">Hello <script>evil()</script><img src="x" onerror="evil()" /></div>';
      const clean = sanitizeHtml(dangerousHtml);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('onclick');
      expect(clean).toContain('Hello');
    });

    it('should handle null or undefined safely in escapeHtml', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(12345)).toBe('12345');
    });
  });

});
