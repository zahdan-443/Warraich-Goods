import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as fs from 'fs';
import * as path from 'path';

const mockFirebase = vi.hoisted(() => ({
  currentUser: {
    uid: 'uid_creator',
    email: 'warraichgoods43@gmail.com',
    displayName: 'Zahdan Nasar'
  } as { uid: string; email: string; displayName?: string } | null
}));

vi.mock('../utils/firebase', () => ({
  get auth() {
    return { currentUser: mockFirebase.currentUser };
  },
  db: null,
  deleteFirebaseUserAccount: async () => {}
}));

import {
  OWNER_EMAIL,
  FULL_OWNER_PERMISSIONS,
  formatSalutationGreeting,
  getPresetPermissions
} from '../utils/authUtils';
import {
  DEFAULT_SAMUNDRI_BRANCH,
  setActiveBranchId,
  setCachedBranches
} from '../utils/branchContext';
import {
  createAddaBillFromPendingItems,
  deleteAddaBill,
  getAddaBills,
  getAddaPendingCommissions,
  getAddaPendingFreight,
  getPartyPendingGroups,
  markAddaBillPaid,
  upsertAddaPendingCommission,
  upsertAddaPendingFreight
} from '../utils/addaBillingStorage';
import { saveBranchCompanyDetails } from '../utils/branchService';
import {
  getAllCashEntries,
  getAllLedgerEntries,
  getLedgerAccounts
} from '../utils/ledgerStorage';
import { PrintableBilty } from '../components/PrintableBilty';
import { PrintableAddaBill, formatAddaBillWhatsAppText } from '../components/PrintableAddaBill';
import { HomeView } from '../components/views/HomeView';
import { BiltyAllRecordsTab } from '../components/views/bilty/BiltyAllRecordsTab';
import { AddaPanelView } from '../components/views/AddaPanelView';
import { BiltyLegalVaultModal } from '../components/BiltyLegalVaultModal';
import type { BiltyAttachmentRecord, BiltyRecord, BranchConfig, UserBranchAccess } from '../types';

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

const MULTAN_BRANCH: BranchConfig = {
  id: 'multan_adda',
  nameUr: 'ملتان برانچ',
  nameEn: 'Multan Branch',
  addressUr: 'وہاڑی چوک، ملتان',
  addressEn: 'Vehari Chowk, Multan',
  phoneNumbers: '0300-8889991',
  ntn: '7779394-1',
  startingBiltySeq: 3001,
  ownerEmail: 'multan.owner@gmail.com',
  ownerDisplayName: 'Hamza Warraich',
  isHeadOffice: false,
  active: true
};

describe('Adda Panel, Isolated Pending Billing, Welcome Note & Attachment Gating', () => {
  beforeEach(() => {
    installMemoryLocalStorage();
    localStorage.clear();
    mockFirebase.currentUser = {
      uid: 'uid_creator',
      email: OWNER_EMAIL,
      displayName: 'Zahdan Nasar Warraich'
    };
    setCachedBranches([DEFAULT_SAMUNDRI_BRANCH, MULTAN_BRANCH]);
    setActiveBranchId(MULTAN_BRANCH.id);
  });

  it('strictly isolates Adda Pending Freight, Pending Commission & Bills from Main Dashboard Ledger', () => {
    const f1 = upsertAddaPendingFreight({
      branchId: MULTAN_BRANCH.id,
      biltyId: 101,
      biltyNo: 'WG-3001',
      date: '2026-11-24',
      vehicleNo: 'MNA-4455',
      route: 'Multan -> Karachi',
      partyName: 'Rehman Textile Mills',
      partyMobile: '0300-1234567',
      amount: 45000
    });

    const f2 = upsertAddaPendingFreight({
      branchId: MULTAN_BRANCH.id,
      biltyId: 102,
      biltyNo: 'WG-3002',
      date: '2026-11-24',
      vehicleNo: 'MNA-8877',
      route: 'Multan -> Lahore',
      partyName: 'Rehman Textile Mills',
      partyMobile: '0300-1234567',
      amount: 20000
    });

    const c1 = upsertAddaPendingCommission({
      branchId: MULTAN_BRANCH.id,
      biltyId: 101,
      biltyNo: 'WG-3001',
      date: '2026-11-24',
      vehicleNo: 'MNA-4455',
      route: 'Multan -> Karachi',
      fromWhomName: 'Rehman Textile Mills',
      fromWhomMobile: '0300-1234567',
      amount: 3500
    });

    // Main Dashboard Ledger must remain 100% untouched / empty
    expect(getLedgerAccounts()).toHaveLength(0);
    expect(getAllLedgerEntries()).toHaveLength(0);
    expect(getAllCashEntries()).toHaveLength(0);

    // Party grouping aggregates both pending freight and pending commission
    const groups = getPartyPendingGroups(MULTAN_BRANCH.id);
    expect(groups).toHaveLength(1);
    expect(groups[0].freightItems).toHaveLength(2);
    expect(groups[0].commissionItems).toHaveLength(1);
    expect(groups[0].pendingFreightTotal).toBe(65000);
    expect(groups[0].pendingCommissionTotal).toBe(3500);
    expect(groups[0].totalPendingAmount).toBe(68500);

    // Custom selection: pick f1 + c1 (leave f2 pending!)
    const bill = createAddaBillFromPendingItems({
      branchId: MULTAN_BRANCH.id,
      partyName: 'Rehman Textile Mills',
      partyMobile: '0300-1234567',
      selectedFreightIds: [f1.id],
      selectedCommissionIds: [c1.id],
      extraCharges: 500,
      discount: 0,
      branchConfig: MULTAN_BRANCH
    });

    expect(bill.billNumber).toBe('BILL-001');
    expect(bill.totalAmount).toBe(49000); // 45000 + 3500 + 500
    expect(bill.status).toBe('billed');

    // Verify statuses: f1 & c1 are now 'billed', f2 stays 'pending'
    const freightAfterBill = getAddaPendingFreight(MULTAN_BRANCH.id);
    expect(freightAfterBill.find(x => x.id === f1.id)?.status).toBe('billed');
    expect(freightAfterBill.find(x => x.id === f2.id)?.status).toBe('pending');
    expect(getAddaPendingCommissions(MULTAN_BRANCH.id).find(x => x.id === c1.id)?.status).toBe('billed');

    // Still zero contamination in main dashboard Khata
    expect(getLedgerAccounts()).toHaveLength(0);
    expect(getAllCashEntries()).toHaveLength(0);

    // Marking Bill Paid moves Bill + f1 + c1 to 'paid'
    const paidBill = markAddaBillPaid(MULTAN_BRANCH.id, bill.id);
    expect(paidBill?.status).toBe('paid');
    expect(getAddaPendingFreight(MULTAN_BRANCH.id).find(x => x.id === f1.id)?.status).toBe('paid');
    expect(getAddaPendingCommissions(MULTAN_BRANCH.id).find(x => x.id === c1.id)?.status).toBe('paid');

    // Deleting an unpaid bill reverts linked 'billed' items back to 'pending'
    const bill2 = createAddaBillFromPendingItems({
      branchId: MULTAN_BRANCH.id,
      partyName: 'Rehman Textile Mills',
      selectedFreightIds: [f2.id],
      selectedCommissionIds: [],
      branchConfig: MULTAN_BRANCH
    });
    expect(getAddaPendingFreight(MULTAN_BRANCH.id).find(x => x.id === f2.id)?.status).toBe('billed');
    deleteAddaBill(MULTAN_BRANCH.id, bill2.id);
    expect(getAddaPendingFreight(MULTAN_BRANCH.id).find(x => x.id === f2.id)?.status).toBe('pending');
    expect(getAddaBills(MULTAN_BRANCH.id)).toHaveLength(1);
  });

  it('reflects live edited branch Company Details on both Printed Bilty & Adda Bill and locks legal fields for non-Creator Branch Owners', async () => {
    const updatedBranch = await saveBranchCompanyDetails(MULTAN_BRANCH.id, {
      companyHeaderEn: 'WARRAICH MULTAN LOGISTICS',
      companyHeaderUr: 'وڑائچ ملتان لاجسٹکس',
      proprietorNameEn: 'HAMZA WARRAICH',
      proprietorNameUr: 'حمزہ وڑائچ',
      addressEn: 'New Truck Adda, Northern Bypass, Multan',
      addressUr: 'نیو ٹرک اڈا، ناردرن بائی پاس، ملتان',
      phoneNumbers: '0300-7771122',
      ntn: '8889990-2'
    });

    // Non-creator Branch Owner updates contact address/phone cleanly, while legal NTN/headers remain locked
    mockFirebase.currentUser = {
      uid: 'uid_multan_owner',
      email: 'multan.owner@gmail.com',
      displayName: 'Hamza Warraich'
    };
    const branchOwnerEdit = await saveBranchCompanyDetails(MULTAN_BRANCH.id, {
      addressEn: 'Gate 4, Northern Bypass, Multan',
      addressUr: 'گیٹ 4، ناردرن بائی پاس، ملتان',
      phoneNumbers: '0300-5556677',
      ntn: '0000000-0',
      companyHeaderEn: 'HIJACKED NAME',
      proprietorNameEn: 'HIJACKED PROPRIETOR'
    });
    expect(branchOwnerEdit.addressEn).toBe('Gate 4, Northern Bypass, Multan');
    expect(branchOwnerEdit.phoneNumbers).toBe('0300-5556677');
    expect(branchOwnerEdit.ntn).toBe('8889990-2');
    expect(branchOwnerEdit.companyHeaderEn).toBe('WARRAICH MULTAN LOGISTICS');
    expect(branchOwnerEdit.proprietorNameEn).toBe('HAMZA WARRAICH');

    mockFirebase.currentUser = {
      uid: 'uid_creator',
      email: OWNER_EMAIL,
      displayName: 'Zahdan Nasar Warraich'
    };

    const bilty: BiltyRecord = {
      id: 3001,
      biltyNo: 'WG-3001',
      date: '2026-11-24',
      branch: MULTAN_BRANCH.id,
      branchId: MULTAN_BRANCH.id,
      language: 'en',
      senderName: 'Alpha Mills',
      senderMobile: '0300-1111111',
      senderCnic: '36302-1234567-1',
      receiverName: 'Beta Traders',
      receiverMobile: '0321-2222222',
      sendingCity: 'Multan',
      receivingCity: 'Karachi',
      vehicleNo: 'MNA-1234',
      driverName: 'Sajid',
      mobileNo: '0300-9999999',
      itemDescription: 'Bags',
      qty: '50',
      weight: '2000',
      total: 35000,
      advance: 0,
      payable: 35000,
      createdAt: '2026-11-24T00:00:00Z'
    };

    const biltyHtml = renderToStaticMarkup(
      React.createElement(PrintableBilty, {
        record: bilty,
        branchConfig: branchOwnerEdit,
        language: 'en'
      })
    );
    expect(biltyHtml).toContain('WARRAICH MULTAN LOGISTICS');
    expect(biltyHtml).toContain('HAMZA WARRAICH');
    expect(biltyHtml).toContain('Gate 4, Northern Bypass, Multan');
    expect(biltyHtml).toContain('0300-5556677');
    expect(biltyHtml).toContain('8889990-2');

    const freight = upsertAddaPendingFreight({
      branchId: MULTAN_BRANCH.id,
      biltyNo: 'WG-3001',
      date: '2026-11-24',
      partyName: 'Alpha Mills',
      partyMobile: '0300-1111111',
      amount: 35000
    });
    const bill = createAddaBillFromPendingItems({
      branchId: MULTAN_BRANCH.id,
      partyName: 'Alpha Mills',
      partyMobile: '0300-1111111',
      selectedFreightIds: [freight.id],
      selectedCommissionIds: [],
      branchConfig: updatedBranch
    });

    const billHtml = renderToStaticMarkup(
      React.createElement(PrintableAddaBill, {
        bill,
        lang: 'en',
        branchConfig: branchOwnerEdit
      })
    );
    expect(billHtml).toContain('WARRAICH MULTAN LOGISTICS');
    expect(billHtml).toContain('Gate 4, Northern Bypass, Multan');
    expect(billHtml).toContain('0300-5556677');
    expect(billHtml).toContain('NTN: 8889990-2');

    const waText = formatAddaBillWhatsAppText(bill, 'en', updatedBranch);
    expect(waText).toContain('WARRAICH MULTAN LOGISTICS');
    expect(waText).toContain('BILL-001');
  });

  it('renders HomeView Owner/Branch banner with Company Name, assigned Welcome Note, and strictly 2 buttons (and hides Bilty from guests)', () => {
    const branchAccess: UserBranchAccess = {
      email: 'multan.owner@gmail.com',
      displayName: 'Hamza Warraich',
      branchId: MULTAN_BRANCH.id,
      presetRole: 'branch_owner',
      permissions: getPresetPermissions('branch_owner'),
      status: 'active',
      createdAt: '2026-11-24T00:00:00Z',
      updatedAt: '2026-11-24T00:00:00Z'
    };

    const htmlEn = renderToStaticMarkup(
      React.createElement(HomeView, {
        lang: 'en',
        trips: [],
        vehicles: [],
        drivers: [],
        bilties: [],
        userEmail: 'multan.owner@gmail.com',
        userDisplayName: 'Google Fallback Name',
        userBranchAccess: branchAccess,
        isBiltyAuthorized: true,
        onNavigate: () => {},
        activeBranch: MULTAN_BRANCH,
        branchPermissions: getPresetPermissions('branch_owner')
      })
    );

    expect(htmlEn).toContain('Welcome Mr Hamza Warraich');
    expect(htmlEn).toContain('Adda / Owner Panel');
    expect(htmlEn).toContain('Create New Bilty');
    // Does not leak creator email into branch staff UI
    expect(htmlEn).not.toContain('warraichgoods43@gmail.com');

    // Guest view hides Owner Panel & all 'Bilty' terms
    const guestHtml = renderToStaticMarkup(
      React.createElement(HomeView, {
        lang: 'en',
        trips: [],
        vehicles: [],
        drivers: [],
        bilties: [],
        userEmail: null,
        isBiltyAuthorized: false,
        onNavigate: () => {},
        activeBranch: null,
        canManageBranchStaff: false
      })
    );
    expect(guestHtml).not.toContain('Adda / Owner Panel');
    expect(guestHtml).not.toContain('Create New Bilty');
    expect(guestHtml.toLowerCase()).not.toContain('bilty');
  });

  it('enforces Creator-only attachment controls in BiltyAllRecordsTab & BiltyView and Creator-only Branch button in AddaPanelView', () => {
    const sampleBilty: BiltyRecord = {
      id: 4001,
      biltyNo: 'WG-3001',
      date: '2026-11-24',
      branch: MULTAN_BRANCH.id,
      branchId: MULTAN_BRANCH.id,
      senderName: 'Alpha Mills',
      senderMobile: '0300-1111111',
      senderCnic: '',
      receiverName: 'Beta Traders',
      receiverMobile: '0321-2222222',
      sendingCity: 'Multan',
      receivingCity: 'Karachi',
      vehicleNo: 'MNA-1234',
      driverName: 'Sajid',
      mobileNo: '0300-9999999',
      itemDescription: 'Cargo',
      qty: '10',
      weight: '500',
      total: 15000,
      advance: 0,
      payable: 15000,
      attachmentCount: 2,
      createdAt: '2026-11-24T00:00:00Z'
    };

    const nonCreatorHtml = renderToStaticMarkup(
      React.createElement(BiltyAllRecordsTab, {
        isUrdu: false,
        bilties: [sampleBilty],
        filteredBilties: [sampleBilty],
        dispatchStats: { count: 1, deliveredCount: 0 },
        branchAddress: 'Vehari Chowk, Multan',
        canCreate: true,
        canEditDelete: true,
        canManageAttachments: false,
        allFilterQuery: '',
        deliveryFilter: 'all',
        sortBy: 'newest',
        onChangeFilterQuery: () => {},
        onChangeDeliveryFilter: () => {},
        onChangeSortBy: () => {},
        onExportCsv: () => {},
        onNavigateToCreate: () => {},
        onResetFilters: () => {},
        onInspectBilty: () => {},
        onPrintBilty: () => {},
        onDownloadPdf: () => {},
        onShareWhatsApp: () => {},
        onOpenVault: () => {},
        onEditBilty: () => {},
        onDownloadZip: () => {}
      })
    );
    expect(nonCreatorHtml).not.toContain('title="Legal Vault"');
    expect(nonCreatorHtml).not.toContain('title="Download ZIP Vault"');

    const creatorHtml = renderToStaticMarkup(
      React.createElement(BiltyAllRecordsTab, {
        isUrdu: false,
        bilties: [sampleBilty],
        filteredBilties: [sampleBilty],
        dispatchStats: { count: 1, deliveredCount: 0 },
        branchAddress: 'Vehari Chowk, Multan',
        canCreate: true,
        canEditDelete: true,
        canManageAttachments: true,
        allFilterQuery: '',
        deliveryFilter: 'all',
        sortBy: 'newest',
        onChangeFilterQuery: () => {},
        onChangeDeliveryFilter: () => {},
        onChangeSortBy: () => {},
        onExportCsv: () => {},
        onNavigateToCreate: () => {},
        onResetFilters: () => {},
        onInspectBilty: () => {},
        onPrintBilty: () => {},
        onDownloadPdf: () => {},
        onShareWhatsApp: () => {},
        onOpenVault: () => {},
        onEditBilty: () => {},
        onDownloadZip: () => {}
      })
    );
    expect(creatorHtml).toContain('title="Legal Vault"');
    expect(creatorHtml).toContain('title="Download ZIP Vault"');

    // AddaPanelView hides Button #7 (Branches, Branch Owners & Staff Roles) from non-Creator Branch Owner
    const branchOwnerAddaHtml = renderToStaticMarkup(
      React.createElement(AddaPanelView, {
        lang: 'en',
        bilties: [sampleBilty],
        activeBranch: MULTAN_BRANCH,
        branches: [MULTAN_BRANCH],
        branchPermissions: getPresetPermissions('branch_owner'),
        userEmail: 'multan.owner@gmail.com',
        onNavigate: () => {}
      })
    );
    expect(branchOwnerAddaHtml).toContain('1. See All Bilty');
    expect(branchOwnerAddaHtml).toContain('2. Commission Pending');
    expect(branchOwnerAddaHtml).toContain('3. Freight Pending');
    expect(branchOwnerAddaHtml).toContain('4. Create New Bill');
    expect(branchOwnerAddaHtml).toContain('5. Branch Staff, Roles &amp; View All Staff');
    expect(branchOwnerAddaHtml).toContain('6. Edit / Modify Company Details');
    expect(branchOwnerAddaHtml).not.toContain('7. Branches, Branch Owners &amp; Staff Roles');
    expect(branchOwnerAddaHtml).toContain('8. Business Report');

    // Creator sees Button #7 inside AddaPanelView
    const creatorAddaHtml = renderToStaticMarkup(
      React.createElement(AddaPanelView, {
        lang: 'en',
        bilties: [sampleBilty],
        activeBranch: MULTAN_BRANCH,
        branches: [DEFAULT_SAMUNDRI_BRANCH, MULTAN_BRANCH],
        branchPermissions: FULL_OWNER_PERMISSIONS,
        userEmail: OWNER_EMAIL,
        onNavigate: () => {}
      })
    );
    expect(creatorAddaHtml).toContain('7. Branches, Branch Owners &amp; Staff Roles');

    // Source verification: BiltyView gates legalVault drafts & ZIP export behind isCreatorUser
    const biltyViewSrc = fs.readFileSync(
      path.resolve(__dirname, '../components/views/BiltyView.tsx'),
      'utf8'
    );
    expect(biltyViewSrc).toContain('const isCreatorUser = isOwnerEmail(currentUserEmail);');
    expect(biltyViewSrc).toContain('{isCreatorUser && (');
    expect(biltyViewSrc).toContain('{isCreatorUser && vaultModalBilty && (');
    expect(biltyViewSrc).toContain('canManageAttachments={isCreatorUser}');
    expect(biltyViewSrc).toContain('syncBiltyAddaLinks');
    expect(biltyViewSrc).toContain('assertBiltyEditAllowedForAdda');
  });

  it('supports Mr/Ms/none salutations, renders signed-in no-access Copy Email card only for authenticated non-branch users, and shows Vault quota/Not-backed-up indicators', () => {
    expect(formatSalutationGreeting('en', 'Sara Khan', 'Ms')).toBe('Welcome Ms Sara Khan');
    expect(formatSalutationGreeting('en', 'Hamza Ali', 'none')).toBe('Welcome Hamza Ali');
    expect(formatSalutationGreeting('en', 'Hamza Ali', undefined)).toBe('Welcome Mr Hamza Ali');
    expect(formatSalutationGreeting('ur', 'سارہ خان', 'Ms')).toBe('خوش آمدید محترمہ سارہ خان');
    expect(formatSalutationGreeting('ur', 'حمزہ علی', 'none')).toBe('خوش آمدید حمزہ علی');

    const noAccessHtml = renderToStaticMarkup(
      React.createElement(HomeView, {
        lang: 'en',
        trips: [],
        vehicles: [],
        drivers: [],
        bilties: [],
        authInitialized: true,
        userEmail: 'ali.k.dot@gmail.com',
        userBranchAccess: null,
        isBiltyAuthorized: false,
        canManageBranchStaff: false,
        onNavigate: () => {},
        activeBranch: null
      })
    );
    expect(noAccessHtml).toContain('data-testid="home-no-access-card"');
    expect(noAccessHtml).toContain('data-testid="copy-my-email-btn"');
    expect(noAccessHtml).toContain('ali.k.dot@gmail.com');
    expect(noAccessHtml).toContain('Copy my email');
    expect(noAccessHtml.toLowerCase()).not.toContain('bilty');

    // Revoked user also sees revoked status + exact email copy button
    const revokedHtml = renderToStaticMarkup(
      React.createElement(HomeView, {
        lang: 'en',
        trips: [],
        vehicles: [],
        drivers: [],
        bilties: [],
        authInitialized: true,
        userEmail: 'ali.k.dot@gmail.com',
        userBranchAccess: {
          email: 'ali.k.dot@gmail.com',
          branchId: MULTAN_BRANCH.id,
          presetRole: 'munshi',
          permissions: getPresetPermissions('munshi'),
          status: 'revoked',
          createdAt: '2026-11-24T00:00:00Z',
          updatedAt: '2026-11-24T00:00:00Z'
        },
        isBiltyAuthorized: false,
        canManageBranchStaff: false,
        onNavigate: () => {},
        activeBranch: MULTAN_BRANCH
      })
    );
    expect(revokedHtml).toContain('Branch Access Revoked');
    expect(revokedHtml).toContain('data-testid="copy-my-email-btn"');

    // Guest never sees the no-access card
    const guestHtml = renderToStaticMarkup(
      React.createElement(HomeView, {
        lang: 'en',
        trips: [],
        vehicles: [],
        drivers: [],
        bilties: [],
        authInitialized: true,
        userEmail: null,
        isBiltyAuthorized: false,
        canManageBranchStaff: false,
        onNavigate: () => {},
        activeBranch: null
      })
    );
    expect(guestHtml).not.toContain('data-testid="home-no-access-card"');

    // BiltyLegalVaultModal shows 70%+ quota meter and Not backed up badges on audio/local-only records
    const sampleAudio: BiltyAttachmentRecord = {
      id: 'att_audio_1',
      biltyKey: 'WG-3001',
      biltyNo: 'WG-3001',
      slot: 'voiceNote',
      kind: 'audio',
      isIdCard: false,
      name: 'Driver Confirmation',
      mimeType: 'audio/webm',
      dataUrl: 'data:audio/webm;base64,AAAA',
      byteSize: 24576,
      duration: 18,
      createdAt: '2026-11-24T00:00:00Z',
      createdAtMs: Date.now(),
      updatedAt: '2026-11-24T00:00:00Z',
      expireAtMs: Date.now() + 180 * 86_400_000,
      expireAtIso: '2027-05-24T00:00:00Z',
      legalHold: false,
      localOnly: true,
      localOnlyReason: 'audio_local_only'
    };

    const sampleBilty: BiltyRecord = {
      id: 3001,
      biltyNo: 'WG-3001',
      date: '2026-11-24',
      vehicleNo: 'MNA-1234',
      driverName: 'Sajid',
      mobileNo: '0300-9999999',
      sendingCity: 'Multan',
      receivingCity: 'Karachi',
      senderName: 'Alpha Mills',
      senderMobile: '0300-1111111',
      senderCnic: '',
      receiverName: 'Beta Traders',
      receiverMobile: '0321-2222222',
      qty: '10',
      itemDescription: 'Cargo',
      weight: '500',
      total: 15000,
      advance: 0,
      payable: 15000,
      createdAt: '2026-11-24T00:00:00Z'
    };

    const vaultHtml = renderToStaticMarkup(
      React.createElement(BiltyLegalVaultModal, {
        isOpen: true,
        onClose: () => {},
        bilty: sampleBilty,
        initialAttachments: [sampleAudio],
        initialStorageStats: {
          totalCount: 12,
          cloudBackedCount: 11,
          localOnlyCount: 1,
          totalBytes: 800 * 1024 * 1024,
          cloudBytes: 760 * 1024 * 1024,
          cloudQuotaBytes: 1024 * 1024 * 1024,
          usedMb: 760,
          quotaMb: 1024,
          usageRatio: 0.742,
          warningLevel: 'warn70'
        }
      })
    );
    expect(vaultHtml).toContain('data-testid="vault-quota-meter"');
    expect(vaultHtml).toContain('70%+ Quota Used');
    expect(vaultHtml).toContain('Not backed up (صرف فون پر)');
  });
});
