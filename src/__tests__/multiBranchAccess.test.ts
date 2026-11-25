import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  OWNER_EMAIL,
  EMPTY_BRANCH_PERMISSIONS,
  FULL_OWNER_PERMISSIONS,
  getPresetPermissions,
  normalizeBranchPermissions,
  filterStaffRosterExcludingCreator,
  resolveEffectivePermissions,
  hasAnyBiltyPermission
} from '../utils/authUtils';
import {
  DEFAULT_SAMUNDRI_BRANCH,
  setCachedBranches,
  getCachedBranches,
  getCachedBranchById,
  setActiveBranchId,
  getActiveBranchId,
  isUsingSharedBranchScope
} from '../utils/branchContext';
import {
  safeStorage,
  getActiveBiltyScope,
  getActiveKhataScope,
  getActiveUserScope
} from '../utils/storageCore';
import { formatBiltySeqNumber, getNextBiltyNo } from '../utils/storageSync';
import { saveStoredBilties, getStoredBilties } from '../utils/storage';
import { PrintableBilty } from '../components/PrintableBilty';
import type { BiltyRecord, BranchConfig, UserBranchAccess } from '../types';

function installMemoryLocalStorage() {
  const store = new Map<string, string>();
  const mockStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    }
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true
  });
}

const LAHORE_BRANCH: BranchConfig = {
  id: 'lahore_badami_bagh',
  nameUr: 'لاہور برانچ (بادامی باغ)',
  nameEn: 'Lahore Branch (Badami Bagh)',
  addressUr: 'بادامی باغ ٹرک اڈا، لاہور',
  addressEn: 'Badami Bagh Truck Stand, Lahore',
  phoneNumbers: '0301-1112233, 0321-4445566',
  ntn: '7779394-1',
  startingBiltySeq: 5001,
  ownerEmail: 'lhr.owner@gmail.com',
  isHeadOffice: false,
  active: true
};

describe('Multi-Branch & Multi-User Role System', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
    localStorage.clear();
    setActiveBranchId(null);
    setCachedBranches([DEFAULT_SAMUNDRI_BRANCH, LAHORE_BRANCH]);
  });

  it('provides preset role defaults and supports custom module toggles', () => {
    const munshiDefaults = getPresetPermissions('munshi');
    expect(munshiDefaults.createBilty).toBe(true);
    expect(munshiDefaults.editDeleteBilty).toBe(false);
    expect(munshiDefaults.manageBranchStaff).toBe(false);

    const customized = normalizeBranchPermissions(
      { ...munshiDefaults, fleetAccess: true, khataAccess: false },
      'munshi'
    );
    expect(customized.createBilty).toBe(true);
    expect(customized.fleetAccess).toBe(true);
    expect(customized.khataAccess).toBe(false);

    const branchOwnerPerms = getPresetPermissions('branch_owner');
    expect(branchOwnerPerms).toEqual(FULL_OWNER_PERMISSIONS);
  });

  it('strictly excludes App Creator email from branch rosters and signed-in directories', () => {
    const filtered = filterStaffRosterExcludingCreator([
      { email: OWNER_EMAIL, role: 'creator' },
      { email: '  WARRAICHGOODS43@GMAIL.COM ', role: 'creator' },
      { email: 'munshi@gmail.com', role: 'munshi' },
      { email: 'lhr.owner@gmail.com', role: 'branch_owner' }
    ]);

    expect(filtered.map(x => x.email)).toEqual(['munshi@gmail.com', 'lhr.owner@gmail.com']);
  });

  it('resolves effective permissions cleanly for App Creator, active staff, revoked staff, and inactive branches', () => {
    expect(resolveEffectivePermissions(OWNER_EMAIL, null, LAHORE_BRANCH)).toEqual(FULL_OWNER_PERMISSIONS);

    const activeAccess: UserBranchAccess = {
      email: 'munshi@gmail.com',
      branchId: LAHORE_BRANCH.id,
      presetRole: 'munshi',
      permissions: getPresetPermissions('munshi'),
      status: 'active',
      createdAt: '2026-11-23T00:00:00Z',
      updatedAt: '2026-11-23T00:00:00Z'
    };

    const resolvedActive = resolveEffectivePermissions('Munshi@Gmail.com', activeAccess, LAHORE_BRANCH);
    expect(resolvedActive.createBilty).toBe(true);
    expect(hasAnyBiltyPermission(resolvedActive)).toBe(true);

    // Revoked user loses all branch permissions immediately
    const revoked = resolveEffectivePermissions(
      'munshi@gmail.com',
      { ...activeAccess, status: 'revoked' },
      LAHORE_BRANCH
    );
    expect(revoked).toEqual(EMPTY_BRANCH_PERMISSIONS);
    expect(hasAnyBiltyPermission(revoked)).toBe(false);

    // Inactive branch suspends access cleanly
    const inactiveBranchAccess = resolveEffectivePermissions(
      'munshi@gmail.com',
      activeAccess,
      { ...LAHORE_BRANCH, active: false }
    );
    expect(inactiveBranchAccess).toEqual(EMPTY_BRANCH_PERMISSIONS);

    // Mismatched email never inherits access
    expect(resolveEffectivePermissions('other@gmail.com', activeAccess, LAHORE_BRANCH)).toEqual(
      EMPTY_BRANCH_PERMISSIONS
    );
  });

  it('isolates Bilty and Khata storage scopes per branch without affecting Guest or Samundri creator personal scope', () => {
    // Guest user with no active branch keeps personal guest scope
    expect(getActiveBranchId()).toBeNull();
    expect(isUsingSharedBranchScope(null)).toBe(false);
    expect(getActiveBiltyScope()).toBe(getActiveUserScope());
    expect(getActiveKhataScope()).toBe(getActiveUserScope());

    // App Creator on Samundri keeps personal scope for backward compatibility
    safeStorage.setItem('ah-gmail-user', OWNER_EMAIL);
    setActiveBranchId(DEFAULT_SAMUNDRI_BRANCH.id);
    expect(isUsingSharedBranchScope(OWNER_EMAIL)).toBe(false);

    // Branch staff on Lahore branch isolates Bilties under branch_lahore_badami_bagh while keeping Khata personal
    safeStorage.setItem('ah-gmail-user', 'lhr.owner@gmail.com');
    setActiveBranchId(LAHORE_BRANCH.id);
    expect(isUsingSharedBranchScope('lhr.owner@gmail.com')).toBe(true);
    expect(getActiveBiltyScope()).toBe(`branch_${LAHORE_BRANCH.id}`);
    expect(getActiveKhataScope()).toBe(getActiveUserScope());

    // Saving a bilty inside Lahore branch does not leak into Samundri or Guest
    const sampleBilty: BiltyRecord = {
      id: 1001,
      biltyNo: 'WG-5001',
      date: '2026-11-23',
      branch: LAHORE_BRANCH.id,
      branchId: LAHORE_BRANCH.id,
      senderName: 'Ali Traders',
      senderMobile: '03001112233',
      senderCnic: '35202-1234567-1',
      receiverName: 'Bilal Corp',
      receiverMobile: '03004445566',
      sendingCity: 'Lahore',
      receivingCity: 'Karachi',
      vehicleNo: 'LEC-9999',
      driverName: 'Akram',
      mobileNo: '03007778899',
      itemDescription: 'Electronics',
      qty: '10',
      weight: '500',
      total: 50000,
      advance: 20000,
      payable: 30000,
      createdAt: '2026-11-23T00:00:00Z'
    };
    saveStoredBilties([sampleBilty]);
    expect(getStoredBilties()).toHaveLength(1);

    setActiveBranchId(null);
    safeStorage.removeItem('ah-gmail-user');
    expect(getStoredBilties()).toHaveLength(0);
  });

  it('generates Bilty sequence numbers from each branch startingBiltySeq (including >9999)', () => {
    expect(formatBiltySeqNumber(5001)).toBe('WG-5001');
    expect(formatBiltySeqNumber(12005)).toBe('WG-12005');

    setActiveBranchId(LAHORE_BRANCH.id);
    const firstLhr = getNextBiltyNo(LAHORE_BRANCH);
    const secondLhr = getNextBiltyNo(LAHORE_BRANCH);
    expect(firstLhr).toBe('WG-5001');
    expect(secondLhr).toBe('WG-5002');

    const multanBranch: BranchConfig = {
      ...LAHORE_BRANCH,
      id: 'multan_office',
      nameUr: 'ملتان برانچ',
      nameEn: 'Multan Branch',
      startingBiltySeq: 12500
    };
    setCachedBranches([DEFAULT_SAMUNDRI_BRANCH, LAHORE_BRANCH, multanBranch]);
    expect(getCachedBranches().some(b => b.id === 'multan_office')).toBe(true);
    expect(getCachedBranchById('multan_office')?.startingBiltySeq).toBe(12500);

    setActiveBranchId(multanBranch.id);
    expect(getNextBiltyNo(multanBranch)).toBe('WG-12500');
    expect(getNextBiltyNo(multanBranch)).toBe('WG-12501');
  });

  it('renders branch address and phone numbers onto PrintableBilty while preserving official layout & visual structure', () => {
    const record: BiltyRecord = {
      id: 2001,
      biltyNo: 'WG-5001',
      date: '2026-11-23',
      branch: LAHORE_BRANCH.id,
      branchId: LAHORE_BRANCH.id,
      branchNameUr: LAHORE_BRANCH.nameUr,
      branchNameEn: LAHORE_BRANCH.nameEn,
      branchAddressUr: LAHORE_BRANCH.addressUr,
      branchAddressEn: LAHORE_BRANCH.addressEn,
      branchPhone: LAHORE_BRANCH.phoneNumbers,
      language: 'en',
      senderName: 'Al-Noor Mill',
      senderMobile: '0300-1234567',
      senderCnic: '35202-1234567-1',
      receiverName: 'Karachi Goods',
      receiverMobile: '0321-7654321',
      sendingCity: 'Lahore',
      receivingCity: 'Karachi',
      vehicleNo: 'LES-4401',
      driverName: 'Tariq Mahmood',
      mobileNo: '0300-9876543',
      itemDescription: 'Textile Bales',
      qty: '25',
      weight: '1200 kg',
      total: 45000,
      advance: 15000,
      payable: 30000,
      createdAt: '2026-11-23T00:00:00Z'
    };

    const htmlEn = renderToStaticMarkup(
      React.createElement(PrintableBilty, {
        record,
        branchConfig: LAHORE_BRANCH,
        language: 'en'
      })
    );

    expect(htmlEn).toContain('Badami Bagh Truck Stand, Lahore');
    expect(htmlEn).toContain('0301-1112233');
    expect(htmlEn).toContain('0321-4445566');
    // Unchanged layout structural markers
    expect(htmlEn).toContain('bilty-double-inner-frame');
    expect(htmlEn).toContain('pakistani-header-frame');
    expect(htmlEn).toContain('header-three-column-grid');
    expect(htmlEn).toContain('cargo-box-watermark');
    expect(htmlEn).toContain('qr-purpose-caption');

    const htmlUr = renderToStaticMarkup(
      React.createElement(PrintableBilty, {
        record: { ...record, language: 'ur' },
        branchConfig: LAHORE_BRANCH,
        language: 'ur'
      })
    );
    expect(htmlUr).toContain('بادامی باغ ٹرک اڈا، لاہور');
    expect(htmlUr).toContain('0301-1112233');
  });
});
