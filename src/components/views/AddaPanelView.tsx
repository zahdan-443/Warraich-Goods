import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CheckCircle2,
  Coins,
  Download,
  Edit3,
  FileCheck2,
  FileText,
  KeyRound,
  Mail,
  Plus,
  Printer,
  Receipt,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X
} from 'lucide-react';
import type {
  ActiveTab,
  AddaBillRecord,
  AddaPendingCommission,
  AddaPendingFreight,
  AddaPendingStatus,
  BiltyRecord,
  BranchConfig,
  BranchPermissions,
  BranchPresetRole,
  BranchStaffMember,
  CompanyProfile,
  Language,
  UserBranchAccess
} from '../../types';
import {
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  PRESET_ROLE_LABELS,
  filterStaffRosterExcludingCreator,
  getPresetPermissions,
  isOwnerEmail,
  normalizeEmail
} from '../../utils/authUtils';
import {
  ADDA_UPDATED_EVENT,
  createAddaBillFromPendingItems,
  deleteAddaBill,
  deleteAddaPendingCommission,
  deleteAddaPendingFreight,
  fetchAddaFromFirestore,
  getAddaBills,
  getAddaPendingCommissions,
  getAddaPendingFreight,
  getPartyPendingGroups,
  markAddaBillPaid,
  resolveEffectiveCompanyDetails,
  setAddaCommissionStatus,
  setAddaFreightStatus,
  upsertAddaPendingCommission,
  upsertAddaPendingFreight
} from '../../utils/addaBillingStorage';
import {
  SignedInDirectoryEntry,
  fetchBranchStaff,
  fetchSignedInDirectoryUsers,
  getCachedBranchStaff,
  removeBranchStaffMember,
  saveBranchCompanyDetails,
  setBranchStaffStatus,
  subscribeToBranchStaff,
  upsertBranchStaffMember
} from '../../utils/branchService';
import { saveCompanyProfileInFirestore } from '../../utils/storage';
import { generatePdfFromElement, sharePdfFileOrWhatsApp } from '../../utils/pdfHelper';
import { shareOrDownloadBlob, shareOrDownloadText } from '../../utils/nativeExport';
import { openWhatsAppMessage } from '../../utils/externalLinks';
import { PrintableAddaBill, formatAddaBillWhatsAppText } from '../PrintableAddaBill';
import { OwnerBranchesPanel } from '../OwnerBranchesPanel';
import { ConfirmDialog } from '../ConfirmDialog';

export type AddaSubModule =
  | 'hub'
  | 'commission'
  | 'freight'
  | 'bill'
  | 'staff'
  | 'company'
  | 'branches'
  | 'report';

interface AddaPanelViewProps {
  lang: Language;
  bilties: BiltyRecord[];
  activeBranch: BranchConfig | null;
  branches?: BranchConfig[];
  branchPermissions: BranchPermissions;
  userEmail?: string | null;
  userBranchAccess?: UserBranchAccess | null;
  companyProfile?: CompanyProfile | null;
  onNavigate: (tab: ActiveTab, subSection?: string) => void;
  onSelectBranch?: (branchId: string) => void;
  onBranchesUpdated?: (branches: BranchConfig[]) => void;
  onOpenBiltyAccess?: () => void;
}

const ASSIGNABLE_ROLES: BranchPresetRole[] = [
  'branch_manager',
  'munshi',
  'accountant',
  'viewer'
];

const PERMISSION_KEYS: Array<{
  key: keyof BranchPermissions;
  ur: string;
  en: string;
}> = [
  { key: 'createBilty', ur: 'بلٹی بنائیں', en: 'Create Bilty' },
  { key: 'editDeleteBilty', ur: 'بلٹی ترمیم/حذف', en: 'Edit / Delete Bilty' },
  { key: 'viewAllBilties', ur: 'تمام برانچ بلٹیاں دیکھیں', en: 'View All Bilties' },
  { key: 'khataAccess', ur: 'کھاتہ و لیجر رسائی', en: 'Khata & Ledger Access' },
  { key: 'fleetAccess', ur: 'فلیٹ، گاڑیاں و اخراجات', en: 'Fleet & Expenses' },
  { key: 'viewBranchReports', ur: 'برانچ رپورٹس دیکھیں', en: 'Branch Reports' },
  { key: 'manageBranchStaff', ur: 'برانچ اسٹاف مینیج کریں', en: 'Manage Branch Staff' }
];

const fmtNum = (n: number) => Math.max(0, Math.round(Number(n) || 0)).toLocaleString('en-US');

export const AddaPanelView: React.FC<AddaPanelViewProps> = ({
  lang,
  bilties,
  activeBranch,
  branches = [],
  branchPermissions,
  userEmail,
  userBranchAccess,
  companyProfile,
  onNavigate,
  onSelectBranch,
  onBranchesUpdated,
  onOpenBiltyAccess
}) => {
  const isUr = lang === 'ur';
  const isCreator = isOwnerEmail(userEmail);
  const callerCleanEmail = normalizeEmail(userEmail);
  const branchId = activeBranch?.id || DEFAULT_HEAD_OFFICE_BRANCH_ID;

  const isBranchOwnerUser = useMemo(() => {
    if (isCreator) return true;
    if (!callerCleanEmail || !activeBranch) return false;
    if (normalizeEmail(activeBranch.ownerEmail) === callerCleanEmail) return true;
    return (
      userBranchAccess?.branchId === activeBranch.id &&
      userBranchAccess?.status === 'active' &&
      userBranchAccess?.presetRole === 'branch_owner'
    );
  }, [isCreator, callerCleanEmail, activeBranch, userBranchAccess]);

  const canManageStaff = isCreator || isBranchOwnerUser || Boolean(branchPermissions.manageBranchStaff);
  const canEditCompany = isCreator || isBranchOwnerUser;
  const canViewAllBilties = isCreator || Boolean(branchPermissions.viewAllBilties);
  const canSearchBilties =
    canViewAllBilties || Boolean(branchPermissions.createBilty || branchPermissions.editDeleteBilty);

  const [subModule, setSubModule] = useState<AddaSubModule>('hub');
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  // Isolated Adda data states
  const [freightItems, setFreightItems] = useState<AddaPendingFreight[]>(() =>
    getAddaPendingFreight(branchId)
  );
  const [commissionItems, setCommissionItems] = useState<AddaPendingCommission[]>(() =>
    getAddaPendingCommissions(branchId)
  );
  const [addaBills, setAddaBills] = useState<AddaBillRecord[]>(() => getAddaBills(branchId));
  const [syncingAdda, setSyncingAdda] = useState(false);

  const reloadAddaData = () => {
    setFreightItems(getAddaPendingFreight(branchId));
    setCommissionItems(getAddaPendingCommissions(branchId));
    setAddaBills(getAddaBills(branchId));
  };

  useEffect(() => {
    reloadAddaData();
    setSyncingAdda(true);
    void fetchAddaFromFirestore(branchId)
      .then(() => reloadAddaData())
      .finally(() => setSyncingAdda(false));

    const onUpdated = (ev: Event) => {
      const detail = (ev as CustomEvent<{ branchId?: string }>)?.detail;
      if (!detail?.branchId || detail.branchId === branchId) {
        reloadAddaData();
      }
    };
    window.addEventListener(ADDA_UPDATED_EVENT, onUpdated);
    return () => window.removeEventListener(ADDA_UPDATED_EVENT, onUpdated);
  }, [branchId]);

  // Android / browser hardware back returns from sub-module to hub
  useEffect(() => {
    if (subModule === 'hub') return;
    const onBack = (e: Event) => {
      e.preventDefault();
      setSubModule('hub');
      setNotice(null);
    };
    window.addEventListener('app-back-button', onBack);
    return () => window.removeEventListener('app-back-button', onBack);
  }, [subModule]);

  // -------------------------------------------------------------------------
  // 2 & 3. Freight & Commission Pending Filters + Manual Entry States
  // -------------------------------------------------------------------------
  const [freightStatusFilter, setFreightStatusFilter] = useState<'all' | AddaPendingStatus>('pending');
  const [freightSearch, setFreightSearch] = useState('');
  const [showAddFreight, setShowAddFreight] = useState(false);
  const [mfParty, setMfParty] = useState('');
  const [mfMobile, setMfMobile] = useState('');
  const [mfBiltyNo, setMfBiltyNo] = useState('');
  const [mfDate, setMfDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mfVehicle, setMfVehicle] = useState('');
  const [mfRoute, setMfRoute] = useState('');
  const [mfAmount, setMfAmount] = useState('');
  const [mfNotes, setMfNotes] = useState('');

  const [commStatusFilter, setCommStatusFilter] = useState<'all' | AddaPendingStatus>('pending');
  const [commSearch, setCommSearch] = useState('');
  const [showAddComm, setShowAddComm] = useState(false);
  const [mcParty, setMcParty] = useState('');
  const [mcMobile, setMcMobile] = useState('');
  const [mcBiltyNo, setMcBiltyNo] = useState('');
  const [mcDate, setMcDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mcVehicle, setMcVehicle] = useState('');
  const [mcRoute, setMcRoute] = useState('');
  const [mcAmount, setMcAmount] = useState('');
  const [mcNotes, setMcNotes] = useState('');

  // Pending item delete confirmation
  const [pendingDeleteItem, setPendingDeleteItem] = useState<{
    kind: 'freight' | 'commission' | 'bill';
    id: string;
    label: string;
  } | null>(null);

  // -------------------------------------------------------------------------
  // 4. Create New Bill State (All | Freight | Commission filter + Multi-Select)
  // -------------------------------------------------------------------------
  const [billViewMode, setBillViewMode] = useState<'generate' | 'saved'>('generate');
  const [selectedPartyKey, setSelectedPartyKey] = useState<string | null>(null);
  const [partyBillFilter, setPartyBillFilter] = useState<'all' | 'freight' | 'commission'>('all');
  const [selectedFreightIds, setSelectedFreightIds] = useState<string[]>([]);
  const [selectedCommissionIds, setSelectedCommissionIds] = useState<string[]>([]);
  const [billExtraCharges, setBillExtraCharges] = useState('');
  const [billDiscount, setBillDiscount] = useState('');
  const [billNotes, setBillNotes] = useState('');
  const [billSearchQuery, setBillSearchQuery] = useState('');
  const [savedBillsFilter, setSavedBillsFilter] = useState<'all' | 'billed' | 'paid'>('all');
  const [previewBill, setPreviewBill] = useState<AddaBillRecord | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const partyGroups = useMemo(() => {
    void freightItems;
    void commissionItems;
    return getPartyPendingGroups(branchId, false);
  }, [branchId, freightItems, commissionItems]);

  const activePartyGroup = useMemo(
    () => partyGroups.find(g => g.partyKey === selectedPartyKey) || null,
    [partyGroups, selectedPartyKey]
  );

  const openPartyForBilling = (partyKey: string, initialType: 'all' | 'freight' | 'commission' = 'all') => {
    const grp = partyGroups.find(g => g.partyKey === partyKey);
    setSelectedPartyKey(partyKey);
    setPartyBillFilter(initialType);
    if (grp) {
      setSelectedFreightIds(
        initialType === 'commission' ? [] : grp.freightItems.map(f => f.id)
      );
      setSelectedCommissionIds(
        initialType === 'freight' ? [] : grp.commissionItems.map(c => c.id)
      );
    } else {
      setSelectedFreightIds([]);
      setSelectedCommissionIds([]);
    }
    setBillExtraCharges('');
    setBillDiscount('');
    setBillNotes('');
    setBillViewMode('generate');
    setSubModule('bill');
  };

  // -------------------------------------------------------------------------
  // 5. Branch Staff Management State
  // -------------------------------------------------------------------------
  const [staffList, setStaffList] = useState<BranchStaffMember[]>(() => getCachedBranchStaff(branchId));
  const [directoryUsers, setDirectoryUsers] = useState<SignedInDirectoryEntry[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [staffEmailInput, setStaffEmailInput] = useState('');
  const [staffNameInput, setStaffNameInput] = useState('');
  const [staffRoleInput, setStaffRoleInput] = useState<BranchPresetRole>('munshi');
  const [staffPermsInput, setStaffPermsInput] = useState<BranchPermissions>(() =>
    getPresetPermissions('munshi')
  );
  const [editingStaffEmail, setEditingStaffEmail] = useState<string | null>(null);
  const [pendingDeleteStaff, setPendingDeleteStaff] = useState<BranchStaffMember | null>(null);

  useEffect(() => {
    if (subModule !== 'staff') return;
    setLoadingStaff(true);
    setStaffList(getCachedBranchStaff(branchId));
    void Promise.all([
      fetchBranchStaff(branchId).then(l => setStaffList(filterStaffRosterExcludingCreator(l))),
      canManageStaff
        ? fetchSignedInDirectoryUsers().then(u =>
            setDirectoryUsers(filterStaffRosterExcludingCreator(u))
          )
        : Promise.resolve()
    ]).finally(() => setLoadingStaff(false));

    const unsub = subscribeToBranchStaff(branchId, list => {
      setStaffList(filterStaffRosterExcludingCreator(list));
    });
    return () => unsub();
  }, [subModule, branchId, canManageStaff]);

  // -------------------------------------------------------------------------
  // 6. Edit / Modify Company Details State
  // -------------------------------------------------------------------------
  const resolvedCo = useMemo(
    () => resolveEffectiveCompanyDetails(activeBranch, companyProfile),
    [activeBranch, companyProfile]
  );

  const [coNameUr, setCoNameUr] = useState('');
  const [coNameEn, setCoNameEn] = useState('');
  const [coHeaderUr, setCoHeaderUr] = useState('');
  const [coHeaderEn, setCoHeaderEn] = useState('');
  const [coPropUr, setCoPropUr] = useState('');
  const [coPropEn, setCoPropEn] = useState('');
  const [coAddressUr, setCoAddressUr] = useState('');
  const [coAddressEn, setCoAddressEn] = useState('');
  const [coPhones, setCoPhones] = useState('');
  const [coNtn, setCoNtn] = useState('');
  const [coTaglineUr, setCoTaglineUr] = useState('');
  const [applyToGlobalCompany, setApplyToGlobalCompany] = useState(
    branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID
  );
  const [savingCompany, setSavingCompany] = useState(false);

  useEffect(() => {
    setCoNameUr(activeBranch?.nameUr || '');
    setCoNameEn(activeBranch?.nameEn || '');
    setCoHeaderUr(activeBranch?.companyHeaderUr || resolvedCo.nameUr);
    setCoHeaderEn(activeBranch?.companyHeaderEn || resolvedCo.nameEn);
    setCoPropUr(activeBranch?.proprietorNameUr || resolvedCo.proprietorUr);
    setCoPropEn(activeBranch?.proprietorNameEn || resolvedCo.proprietorEn);
    setCoAddressUr(activeBranch?.addressUr || resolvedCo.addressUr);
    setCoAddressEn(activeBranch?.addressEn || resolvedCo.addressEn);
    setCoPhones(activeBranch?.phoneNumbers || resolvedCo.phone);
    setCoNtn(activeBranch?.ntn || resolvedCo.ntn);
    setCoTaglineUr(activeBranch?.taglineUr || resolvedCo.taglineUr || '');
    setApplyToGlobalCompany(branchId === DEFAULT_HEAD_OFFICE_BRANCH_ID);
  }, [branchId, activeBranch, resolvedCo]);

  // -------------------------------------------------------------------------
  // 8. Isolated Business Report State
  // -------------------------------------------------------------------------
  const [reportMonth, setReportMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [reportAllTime, setReportAllTime] = useState(false);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleSaveManualFreight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfParty.trim() || !(Number(mfAmount) > 0)) {
      setNotice({
        text: isUr ? 'پارٹی کا نام اور درست رقم درج کریں۔' : 'Party name and valid freight amount required.',
        ok: false
      });
      return;
    }
    upsertAddaPendingFreight({
      branchId,
      biltyNo: mfBiltyNo.trim() || 'MANUAL',
      date: mfDate,
      vehicleNo: mfVehicle.trim() || undefined,
      route: mfRoute.trim() || undefined,
      partyName: mfParty.trim(),
      partyMobile: mfMobile.trim(),
      amount: Math.max(0, Number(mfAmount) || 0),
      notes: mfNotes.trim() || undefined
    });
    setMfParty('');
    setMfMobile('');
    setMfBiltyNo('');
    setMfVehicle('');
    setMfRoute('');
    setMfAmount('');
    setMfNotes('');
    setShowAddFreight(false);
    setNotice({
      text: isUr ? 'بقایا کرایہ (Freight Pending) شامل کر دیا گیا۔' : 'Pending freight added.',
      ok: true
    });
  };

  const handleSaveManualCommission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcParty.trim() || !(Number(mcAmount) > 0)) {
      setNotice({
        text: isUr ? 'وصولی والے کا نام اور کمیشن رقم درج کریں۔' : 'Payee name and valid commission amount required.',
        ok: false
      });
      return;
    }
    upsertAddaPendingCommission({
      branchId,
      biltyNo: mcBiltyNo.trim() || 'MANUAL',
      date: mcDate,
      vehicleNo: mcVehicle.trim() || undefined,
      route: mcRoute.trim() || undefined,
      fromWhomName: mcParty.trim(),
      fromWhomMobile: mcMobile.trim(),
      amount: Math.max(0, Number(mcAmount) || 0),
      notes: mcNotes.trim() || undefined
    });
    setMcParty('');
    setMcMobile('');
    setMcBiltyNo('');
    setMcVehicle('');
    setMcRoute('');
    setMcAmount('');
    setMcNotes('');
    setShowAddComm(false);
    setNotice({
      text: isUr ? 'بقایا کمیشن (Commission Pending) شامل کر دیا گیا۔' : 'Pending commission added.',
      ok: true
    });
  };

  const handleGenerateBill = () => {
    if (!activePartyGroup) return;
    if (selectedFreightIds.length === 0 && selectedCommissionIds.length === 0) {
      setNotice({
        text: isUr ? 'کم از کم ایک کرایہ یا کمیشن آئٹم منتخب کریں۔' : 'Select at least one pending item.',
        ok: false
      });
      return;
    }
    try {
      const created = createAddaBillFromPendingItems({
        branchId,
        partyName: activePartyGroup.partyName,
        partyMobile: activePartyGroup.partyMobile,
        selectedFreightIds,
        selectedCommissionIds,
        extraCharges: Math.max(0, Number(billExtraCharges) || 0),
        discount: Math.max(0, Number(billDiscount) || 0),
        notes: billNotes.trim() || undefined,
        branchConfig: activeBranch,
        companyProfile
      });
      setPreviewBill(created);
      setSelectedPartyKey(null);
      setSelectedFreightIds([]);
      setSelectedCommissionIds([]);
      setBillViewMode('saved');
      setNotice({
        text: isUr
          ? `بل ${created.billNumber} کامیابی سے تیار ہو گیا (آئٹمز "بل شدہ" ہو گئے)۔`
          : `Bill ${created.billNumber} generated (items marked Billed).`,
        ok: true
      });
    } catch (err) {
      setNotice({
        text: err instanceof Error ? err.message : 'Failed creating bill',
        ok: false
      });
    }
  };

  const handleExportBillPdf = async (bill: AddaBillRecord) => {
    const el = document.getElementById('printable-adda-bill-dom');
    if (!el) return;
    setExportingPdf(true);
    try {
      const { pdfBlob } = await generatePdfFromElement(el);
      const fileName = `Bill_${bill.billNumber}_${bill.partyName.replace(/\s+/g, '_')}.pdf`;
      await shareOrDownloadBlob(pdfBlob, fileName, {
        title: `${bill.billNumber} - ${bill.partyName}`,
        dialogTitle: fileName
      });
    } catch (err) {
      setNotice({
        text: err instanceof Error ? err.message : 'PDF export failed',
        ok: false
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const handleShareBillWhatsApp = async (bill: AddaBillRecord) => {
    const textSummary = formatAddaBillWhatsAppText(bill, lang, activeBranch, companyProfile);
    const el = document.getElementById('printable-adda-bill-dom');
    if (el) {
      setExportingPdf(true);
      try {
        const { pdfBlob } = await generatePdfFromElement(el);
        const fileName = `Bill_${bill.billNumber}.pdf`;
        await sharePdfFileOrWhatsApp({
          pdfBlob,
          fileName,
          title: `${bill.billNumber} - ${bill.partyName}`,
          textSummary,
          lang
        });
        return;
      } catch {
        // Fallback to plain WhatsApp summary
      } finally {
        setExportingPdf(false);
      }
    }
    openWhatsAppMessage(textSummary);
  };

  const handlePrintBill = (bill: AddaBillRecord) => {
    setPreviewBill(bill);
    setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print();
      }
    }, 200);
  };

  const handleSaveStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranch || !canManageStaff) return;
    const cleanEmail = normalizeEmail(staffEmailInput);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setNotice({
        text: isUr ? 'درست Gmail ای میل درج کریں۔' : 'Please enter a valid Gmail address.',
        ok: false
      });
      return;
    }
    if (isOwnerEmail(cleanEmail)) {
      setNotice({
        text: isUr
          ? 'ایپ کریئیٹر کو برانچ اسٹاف لسٹ میں شامل نہیں کیا جاتا۔'
          : 'App Creator cannot be added to branch staff rosters.',
        ok: false
      });
      return;
    }

    setSavingStaff(true);
    setNotice(null);
    try {
      const matchedDir = directoryUsers.find(u => normalizeEmail(u.email) === cleanEmail);
      await upsertBranchStaffMember({
        branch: activeBranch,
        email: cleanEmail,
        displayName: staffNameInput.trim() || matchedDir?.displayName || cleanEmail.split('@')[0],
        uid: matchedDir?.uid,
        presetRole: staffRoleInput,
        permissions: staffPermsInput,
        status: 'active'
      });
      const updated = await fetchBranchStaff(activeBranch.id);
      setStaffList(filterStaffRosterExcludingCreator(updated));
      setStaffEmailInput('');
      setStaffNameInput('');
      setStaffRoleInput('munshi');
      setStaffPermsInput(getPresetPermissions('munshi'));
      setEditingStaffEmail(null);
      setNotice({
        text: isUr ? `${cleanEmail} کا اسٹاف ریکارڈ محفوظ ہو گیا۔` : `Saved staff access for ${cleanEmail}.`,
        ok: true
      });
    } catch (err) {
      setNotice({
        text: err instanceof Error ? err.message : 'Failed saving staff',
        ok: false
      });
    } finally {
      setSavingStaff(false);
    }
  };

  const handleSaveCompanyDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditCompany) return;
    setSavingCompany(true);
    setNotice(null);
    try {
      await saveBranchCompanyDetails(branchId, {
        nameUr: coNameUr.trim() || activeBranch?.nameUr,
        nameEn: coNameEn.trim() || activeBranch?.nameEn,
        companyHeaderUr: coHeaderUr.trim(),
        companyHeaderEn: coHeaderEn.trim(),
        proprietorNameUr: coPropUr.trim(),
        proprietorNameEn: coPropEn.trim(),
        addressUr: coAddressUr.trim(),
        addressEn: coAddressEn.trim(),
        phoneNumbers: coPhones.trim(),
        ntn: coNtn.trim() || '7779394-1',
        taglineUr: coTaglineUr.trim()
      });

      if (isCreator && applyToGlobalCompany) {
        await saveCompanyProfileInFirestore({
          nameUr: coHeaderUr.trim() || 'وڑائچ گڈز ٹرانسپورٹ کمپنی',
          nameEn: coHeaderEn.trim() || 'WARRAICH GOODS TRANSPORT COMPANY',
          ownerName: coPropUr.trim() || 'زاہدان نصر وڑائچ',
          phoneNumbers: coPhones.trim(),
          headOfficeUr: coAddressUr.trim(),
          headOfficeEn: coAddressEn.trim(),
          ntn: coNtn.trim() || '7779394-1',
          taglineUr: coTaglineUr.trim()
        });
      }

      setNotice({
        text: isUr
          ? 'کمپنی و برانچ تفصیلات محفوظ ہو گئیں — اب بلٹی اور بل دونوں پر یہی تفصیلات پرنٹ ہوں گی۔'
          : 'Company details updated — changes immediately reflect on all Printed Bilties & Bills.',
        ok: true
      });
    } catch (err) {
      setNotice({
        text: err instanceof Error ? err.message : 'Failed updating company details',
        ok: false
      });
    } finally {
      setSavingCompany(false);
    }
  };

  // -------------------------------------------------------------------------
  // Filtered Collections
  // -------------------------------------------------------------------------
  const filteredFreight = useMemo(() => {
    const q = freightSearch.trim().toLowerCase();
    return freightItems.filter(item => {
      if (freightStatusFilter !== 'all' && item.status !== freightStatusFilter) return false;
      if (!q) return true;
      return (
        item.partyName.toLowerCase().includes(q) ||
        item.partyMobile.toLowerCase().includes(q) ||
        item.biltyNo.toLowerCase().includes(q) ||
        (item.vehicleNo || '').toLowerCase().includes(q)
      );
    });
  }, [freightItems, freightStatusFilter, freightSearch]);

  const filteredCommissions = useMemo(() => {
    const q = commStatusFilter === 'all' ? commSearch.trim().toLowerCase() : commSearch.trim().toLowerCase();
    return commissionItems.filter(item => {
      if (commStatusFilter !== 'all' && item.status !== commStatusFilter) return false;
      if (!q) return true;
      return (
        item.fromWhomName.toLowerCase().includes(q) ||
        item.fromWhomMobile.toLowerCase().includes(q) ||
        item.biltyNo.toLowerCase().includes(q) ||
        (item.vehicleNo || '').toLowerCase().includes(q)
      );
    });
  }, [commissionItems, commStatusFilter, commSearch]);

  const filteredPartyGroups = useMemo(() => {
    const q = billSearchQuery.trim().toLowerCase();
    return partyGroups.filter(g => {
      if (!q) return true;
      return g.partyName.toLowerCase().includes(q) || g.partyMobile.toLowerCase().includes(q);
    });
  }, [partyGroups, billSearchQuery]);

  const filteredSavedBills = useMemo(() => {
    const q = billSearchQuery.trim().toLowerCase();
    return addaBills.filter(b => {
      if (savedBillsFilter !== 'all' && b.status !== savedBillsFilter) return false;
      if (!q) return true;
      return (
        b.billNumber.toLowerCase().includes(q) ||
        b.partyName.toLowerCase().includes(q) ||
        (b.partyMobile || '').toLowerCase().includes(q)
      );
    });
  }, [addaBills, savedBillsFilter, billSearchQuery]);

  // Isolated Adda Report Analytics
  const reportSummary = useMemo(() => {
    const inPeriod = (dateStr?: string) => {
      if (reportAllTime) return true;
      return String(dateStr || '').startsWith(reportMonth);
    };

    const branchBilties = bilties.filter(
      b => (b.branchId || b.branch || DEFAULT_HEAD_OFFICE_BRANCH_ID) === branchId && inPeriod(b.date)
    );
    const totalBiltyFreight = branchBilties.reduce((s, b) => s + (Number(b.total) || 0), 0);

    const periodFreight = freightItems.filter(f => inPeriod(f.date));
    const freightPendingAmt = periodFreight
      .filter(f => f.status === 'pending')
      .reduce((s, f) => s + f.amount, 0);
    const freightBilledAmt = periodFreight
      .filter(f => f.status === 'billed')
      .reduce((s, f) => s + f.amount, 0);
    const freightPaidAmt = periodFreight
      .filter(f => f.status === 'paid')
      .reduce((s, f) => s + f.amount, 0);

    const periodComm = commissionItems.filter(c => inPeriod(c.date));
    const commPendingAmt = periodComm
      .filter(c => c.status === 'pending')
      .reduce((s, c) => s + c.amount, 0);
    const commBilledAmt = periodComm
      .filter(c => c.status === 'billed')
      .reduce((s, c) => s + c.amount, 0);
    const commPaidAmt = periodComm
      .filter(c => c.status === 'paid')
      .reduce((s, c) => s + c.amount, 0);

    const periodBills = addaBills.filter(b => inPeriod(b.date));
    const billsBilledTotal = periodBills
      .filter(b => b.status === 'billed')
      .reduce((s, b) => s + b.totalAmount, 0);
    const billsPaidTotal = periodBills
      .filter(b => b.status === 'paid')
      .reduce((s, b) => s + b.totalAmount, 0);

    return {
      biltyCount: branchBilties.length,
      totalBiltyFreight,
      freightPendingAmt,
      freightBilledAmt,
      freightPaidAmt,
      commPendingAmt,
      commBilledAmt,
      commPaidAmt,
      billsCount: periodBills.length,
      billsBilledTotal,
      billsPaidTotal
    };
  }, [bilties, branchId, freightItems, commissionItems, addaBills, reportMonth, reportAllTime]);

  const exportAddaReportCsv = () => {
    const lines = [
      ['Type', 'Status', 'Date', 'Bilty/Bill No', 'Party Name', 'Mobile', 'Amount (Rs)', 'Notes'].join(','),
      ...freightItems.map(f =>
        [
          'Freight',
          f.status,
          f.date,
          `"${f.biltyNo}"`,
          `"${f.partyName.replace(/"/g, '""')}"`,
          `"${f.partyMobile}"`,
          f.amount,
          `"${(f.notes || '').replace(/"/g, '""')}"`
        ].join(',')
      ),
      ...commissionItems.map(c =>
        [
          'Commission',
          c.status,
          c.date,
          `"${c.biltyNo}"`,
          `"${c.fromWhomName.replace(/"/g, '""')}"`,
          `"${c.fromWhomMobile}"`,
          c.amount,
          `"${(c.notes || '').replace(/"/g, '""')}"`
        ].join(',')
      ),
      ...addaBills.map(b =>
        [
          'Bill',
          b.status,
          b.date,
          `"${b.billNumber}"`,
          `"${b.partyName.replace(/"/g, '""')}"`,
          `"${b.partyMobile || ''}"`,
          b.totalAmount,
          `"${(b.notes || '').replace(/"/g, '""')}"`
        ].join(',')
      )
    ].join('\n');

    void shareOrDownloadText(
      lines,
      `Adda_Report_${branchId}_${reportAllTime ? 'AllTime' : reportMonth}.csv`,
      'text/csv;charset=utf-8;',
      { title: 'Adda Business Report CSV' }
    );
  };

  // Summary badge counts for Hub buttons
  const pendingCommTotal = useMemo(
    () => commissionItems.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0),
    [commissionItems]
  );
  const pendingCommCount = useMemo(
    () => commissionItems.filter(c => c.status === 'pending').length,
    [commissionItems]
  );
  const pendingFreightTotal = useMemo(
    () => freightItems.filter(f => f.status === 'pending').reduce((s, f) => s + f.amount, 0),
    [freightItems]
  );
  const pendingFreightCount = useMemo(
    () => freightItems.filter(f => f.status === 'pending').length,
    [freightItems]
  );
  const branchBiltyCount = useMemo(
    () =>
      bilties.filter(b => (b.branchId || b.branch || DEFAULT_HEAD_OFFICE_BRANCH_ID) === branchId)
        .length,
    [bilties, branchId]
  );

  // Selected party bill calculation
  const selectedBillSubtotal = useMemo(() => {
    if (!activePartyGroup) return 0;
    const fSum = activePartyGroup.freightItems
      .filter(f => selectedFreightIds.includes(f.id))
      .reduce((s, f) => s + f.amount, 0);
    const cSum = activePartyGroup.commissionItems
      .filter(c => selectedCommissionIds.includes(c.id))
      .reduce((s, c) => s + c.amount, 0);
    return fSum + cSum;
  }, [activePartyGroup, selectedFreightIds, selectedCommissionIds]);

  const selectedBillGrandTotal = Math.max(
    0,
    selectedBillSubtotal +
      (Math.max(0, Number(billExtraCharges) || 0) - Math.max(0, Number(billDiscount) || 0))
  );

  const visibleDirectory = filterStaffRosterExcludingCreator(directoryUsers);
  const visibleStaffList = filterStaffRosterExcludingCreator(staffList);

  const statusBadge = (status: AddaPendingStatus) => {
    if (status === 'paid') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold">
          {isUr ? 'ادا شدہ (Paid)' : 'Paid'}
        </span>
      );
    }
    if (status === 'billed') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 text-[10px] font-bold">
          {isUr ? 'بل شدہ (Billed)' : 'Billed'}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
        {isUr ? 'بقایا (Pending)' : 'Pending'}
      </span>
    );
  };

  return (
    <div
      className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-20 space-y-5 animate-in fade-in duration-200"
      dir={isUr ? 'rtl' : 'ltr'}
    >
      {/* Top Adda / Branch Control Header */}
      <div className="bg-gradient-to-br from-[#0f2942] via-[#133556] to-[#1a477a] text-white rounded-3xl p-4 sm:p-5 border border-amber-400/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400/20 text-amber-200 border border-amber-300/30 text-[11px] font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>{isUr ? activeBranch?.nameUr || 'سمندری ہیڈ آفس' : activeBranch?.nameEn || 'Samundri Head Office'}</span>
            </span>
            {syncingAdda && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-200">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>{isUr ? 'ہم آہنگ ہو رہا ہے' : 'Syncing'}</span>
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold font-serif tracking-tight">
            {isUr ? resolvedCo.nameUr : resolvedCo.nameEn}
          </h1>
          <p className="text-xs text-sky-100/90 flex items-center gap-2 flex-wrap">
            <span>{isUr ? resolvedCo.addressUr : resolvedCo.addressEn}</span>
            <span className="opacity-50">•</span>
            <span dir="ltr" className="font-mono">{resolvedCo.phone}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isCreator && branches.length > 0 && onSelectBranch && (
            <select
              value={branchId}
              onChange={e => onSelectBranch(e.target.value)}
              aria-label={isUr ? 'برانچ تبدیل کریں' : 'Switch Active Branch'}
              className="px-3 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id} className="text-slate-900">
                  {isUr ? b.nameUr : b.nameEn}
                </option>
              ))}
            </select>
          )}

          {subModule !== 'hub' ? (
            <button
              type="button"
              onClick={() => {
                setSubModule('hub');
                setNotice(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0f2942] text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className={`w-4 h-4 ${isUr ? 'rotate-180' : ''}`} />
              <span>{isUr ? 'اڈا پینل مینو' : 'Adda Panel Menu'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className={`w-4 h-4 ${isUr ? 'rotate-180' : ''}`} />
              <span>{isUr ? 'ڈیش بورڈ' : 'Dashboard'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Banner */}
      {notice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
            notice.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.ok ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-700" />
            )}
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* HUB VIEW — 8 ADDA / OWNER / BRANCH PANEL BUTTONS                    */}
      {/* =================================================================== */}
      {subModule === 'hub' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. See all bilty */}
            <button
              type="button"
              disabled={!canSearchBilties}
              onClick={() => onNavigate('bilty', canViewAllBilties ? 'all' : 'search')}
              className="group text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#e4e1cf] dark:border-slate-700 hover:border-[#1a477a] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-[#1a477a]/10 text-[#1a477a] dark:text-sky-300 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                  {branchBiltyCount}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black text-[#1a477a] dark:text-slate-100">
                  {isUr ? '1. تمام بلٹیاں دیکھیں' : '1. See All Bilty'}
                </h2>
                <p className="text-[11px] text-[#6b6b55] dark:text-slate-400 mt-0.5">
                  {isUr ? 'برانچ کی تمام بلٹیاں اور سرچ' : 'Browse, print, PDF & search bilties'}
                </p>
              </div>
            </button>

            {/* 2. Commission pending */}
            <button
              type="button"
              onClick={() => {
                setSubModule('commission');
                setNotice(null);
              }}
              className="group text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-800/60 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                  {pendingCommCount} • Rs {fmtNum(pendingCommTotal)}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black text-amber-950 dark:text-amber-300">
                  {isUr ? '2. کمیشن پینڈنگ (بقایا کمیشن)' : '2. Commission Pending'}
                </h2>
                <p className="text-[11px] text-[#6b6b55] dark:text-slate-400 mt-0.5">
                  {isUr ? 'وصول ہونے والا کمیشن اور موبائل نمبرز' : 'Track pending commissions to collect'}
                </p>
              </div>
            </button>

            {/* 3. Freight pending */}
            <button
              type="button"
              onClick={() => {
                setSubModule('freight');
                setNotice(null);
              }}
              className="group text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-200 dark:border-sky-800/60 hover:border-sky-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 text-[10px] font-mono font-bold">
                  {pendingFreightCount} • Rs {fmtNum(pendingFreightTotal)}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black text-sky-950 dark:text-sky-300">
                  {isUr ? '3. کرایہ پینڈنگ (بقایا کرایہ)' : '3. Freight Pending'}
                </h2>
                <p className="text-[11px] text-[#6b6b55] dark:text-slate-400 mt-0.5">
                  {isUr ? 'پارٹی / کمپنی سے وصول طلب کرایہ' : 'Track pending freight receivable by party'}
                </p>
              </div>
            </button>

            {/* 4. Create new bill */}
            <button
              type="button"
              onClick={() => {
                setSubModule('bill');
                setNotice(null);
              }}
              className="group text-start p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border-2 border-emerald-300 dark:border-emerald-700 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-mono font-bold">
                  {partyGroups.length} {isUr ? 'پارٹیاں' : 'Parties'} • {addaBills.length} {isUr ? 'بل' : 'Bills'}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                  {isUr ? '4. نیا بل بنائیں (Create New Bill)' : '4. Create New Bill'}
                </h2>
                <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 mt-0.5">
                  {isUr
                    ? 'پارٹی منتخب کر کے کرایہ/کمیشن بل بنائیں و شیئر کریں'
                    : 'Select party items, filter type & share PDF/WhatsApp'}
                </p>
              </div>
            </button>

            {/* 5. Branch Staff, Roles & Access & View All Staff */}
            <button
              type="button"
              onClick={() => {
                setSubModule('staff');
                setNotice(null);
              }}
              className="group text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#e4e1cf] dark:border-slate-700 hover:border-[#1a477a] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[10px] font-mono font-bold">
                  {visibleStaffList.length}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black text-[#1a477a] dark:text-slate-100">
                  {isUr ? '5. برانچ اسٹاف، رولز و تمام اسٹاف' : '5. Branch Staff, Roles & View All Staff'}
                </h2>
                <p className="text-[11px] text-[#6b6b55] dark:text-slate-400 mt-0.5">
                  {canManageStaff
                    ? isUr
                      ? 'اسٹاف شامل کریں، رول و نام تفویض کریں یا معطل کریں'
                      : 'Assign names, roles, permissions & view all staff'
                    : isUr
                    ? 'برانچ اسٹاف کی مکمل فہرست دیکھیں'
                    : 'View complete branch staff roster'}
                </p>
              </div>
            </button>

            {/* 6. Edit/Modify Company Details */}
            <button
              type="button"
              onClick={() => {
                setSubModule('company');
                setNotice(null);
              }}
              className="group text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#e4e1cf] dark:border-slate-700 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                  NTN: {resolvedCo.ntn}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black text-[#1a477a] dark:text-slate-100">
                  {isUr ? '6. کمپنی تفصیلات میں ترمیم' : '6. Edit / Modify Company Details'}
                </h2>
                <p className="text-[11px] text-[#6b6b55] dark:text-slate-400 mt-0.5">
                  {isUr
                    ? 'نام، پتہ، فون و این ٹی این (بل اور بلٹی پر لاگو)'
                    : 'Update header, address & phones on Bills & Bilties'}
                </p>
              </div>
            </button>

            {/* 7. Branches, Branch Owners & Staff Roles (Creator ONLY) */}
            {isCreator && (
              <button
                type="button"
                onClick={() => {
                  setSubModule('branches');
                  setNotice(null);
                }}
                className="group text-start p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-300 dark:border-amber-700 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-bold">
                    {branches.length} {isUr ? 'برانچز' : 'Branches'}
                  </span>
                </div>
                <div>
                  <h2 className="text-sm font-black text-amber-950 dark:text-amber-200">
                    {isUr ? '7. برانچز، برانچ آنرز و رولز' : '7. Branches, Branch Owners & Staff Roles'}
                  </h2>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 mt-0.5">
                    {isUr ? 'صرف کریئیٹر: نئی برانچ و آنرز کنٹرول' : 'Creator-Only: Create branches, owners & global roles'}
                  </p>
                </div>
              </button>
            )}

            {/* 8. Business report */}
            <button
              type="button"
              onClick={() => {
                setSubModule('report');
                setNotice(null);
              }}
              className="group text-start p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#e4e1cf] dark:border-slate-700 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold">
                  CSV
                </span>
              </div>
              <div>
                <h2 className="text-sm font-black text-[#1a477a] dark:text-slate-100">
                  {isUr ? '8. بزنس رپورٹ (اڈا)' : '8. Business Report'}
                </h2>
                <p className="text-[11px] text-[#6b6b55] dark:text-slate-400 mt-0.5">
                  {isUr
                    ? 'بلٹیاں، بقایا کرایہ، کمیشن اور بل کی رپورٹ'
                    : 'Isolated Adda revenue, pending freight/commission & bills'}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODULE 2: COMMISSION PENDING                                        */}
      {/* =================================================================== */}
      {subModule === 'commission' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-[#ecece0] dark:border-slate-700 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecece0] dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f2942] dark:text-slate-100 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                <span>{isUr ? 'کمیشن پینڈنگ (بقایا کمیشن ریکارڈ)' : 'Commission Pending Ledger'}</span>
              </h2>
              <p className="text-xs text-[#6b6b55] dark:text-slate-400">
                {isUr
                  ? 'یہ ریکارڈ صرف اڈا پینل تک محدود ہے (مین ڈیش بورڈ کھاتہ سے الگ)۔'
                  : 'Strictly isolated inside Adda Panel (separate from main Dashboard Ledger).'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddComm(v => !v)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isUr ? 'نیا بقایا کمیشن شامل کریں' : 'Add Pending Commission'}</span>
            </button>
          </div>

          {showAddComm && (
            <form
              onSubmit={handleSaveManualCommission}
              className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'کس سے وصول کرنا ہے (نام) *' : 'From Whom (Name) *'}
                </label>
                <input
                  type="text"
                  required
                  value={mcParty}
                  onChange={e => setMcParty(e.target.value)}
                  placeholder={isUr ? 'پارٹی / ایجنٹ / ڈرائیور نام' : 'Name'}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'موبائل نمبر' : 'Mobile Number'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={mcMobile}
                  onChange={e => setMcMobile(e.target.value)}
                  placeholder="0300-0000000"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'کمیشن رقم (روپے) *' : 'Commission Amount (Rs) *'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  dir="ltr"
                  value={mcAmount}
                  onChange={e => setMcAmount(e.target.value)}
                  placeholder="2500"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'بلٹی نمبر (اختیاری)' : 'Bilty No (Optional)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={mcBiltyNo}
                  onChange={e => setMcBiltyNo(e.target.value)}
                  placeholder="WG-1001"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">{isUr ? 'تاریخ' : 'Date'}</label>
                <input
                  type="date"
                  dir="ltr"
                  value={mcDate}
                  onChange={e => setMcDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'گاڑی / روٹ / تفصیل' : 'Vehicle / Route / Notes'}
                </label>
                <input
                  type="text"
                  value={mcNotes}
                  onChange={e => setMcNotes(e.target.value)}
                  placeholder={isUr ? 'مختصر تفصیل' : 'Short notes'}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddComm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold cursor-pointer"
                >
                  {isUr ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold cursor-pointer"
                >
                  {isUr ? 'محفوظ کریں' : 'Save Commission'}
                </button>
              </div>
            </form>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {(['pending', 'billed', 'paid', 'all'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCommStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    commStatusFilter === st
                      ? 'bg-[#0f2942] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st === 'pending'
                    ? isUr
                      ? 'بقایا (Pending)'
                      : 'Pending'
                    : st === 'billed'
                    ? isUr
                      ? 'بل شدہ (Billed)'
                      : 'Billed'
                    : st === 'paid'
                    ? isUr
                      ? 'وصول شدہ (Paid)'
                      : 'Paid'
                    : isUr
                    ? 'تمام'
                    : 'All'}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={commSearch}
                onChange={e => setCommSearch(e.target.value)}
                placeholder={isUr ? 'نام، موبائل یا بلٹی نمبر تلاش کریں' : 'Search name, mobile, bilty no...'}
                className="w-full ps-8 pe-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {filteredCommissions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300">
              {isUr ? 'اس فلٹر میں کوئی کمیشن ریکارڈ موجود نہیں۔' : 'No commission entries match this filter.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredCommissions.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-amber-200/80 dark:border-slate-700 bg-[#fdfbf7] dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#0f2942] text-white">
                        {item.biltyNo}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.fromWhomName}
                      </span>
                      {statusBadge(item.status)}
                      {item.billNumber && (
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {item.billNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                      <span dir="ltr" className="font-mono">
                        📞 {item.fromWhomMobile || '—'}
                      </span>
                      <span>•</span>
                      <span dir="ltr" className="font-mono">
                        {item.date}
                      </span>
                      {item.route && (
                        <>
                          <span>•</span>
                          <span>{item.route}</span>
                        </>
                      )}
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <span className="font-mono font-black text-base text-amber-800 dark:text-amber-300 px-2">
                      Rs {fmtNum(item.amount)}
                    </span>

                    {item.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() =>
                          openPartyForBilling(
                            item.fromWhomName.trim().toLowerCase().replace(/\s+/g, ' '),
                            'commission'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{isUr ? 'بل بنائیں' : 'Create Bill'}</span>
                      </button>
                    )}

                    {item.status !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddaCommissionStatus(branchId, item.id, 'paid');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isUr ? 'وصول ہو گیا' : 'Mark Paid'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPendingDeleteItem({
                          kind: 'commission',
                          id: item.id,
                          label: `${item.biltyNo} - ${item.fromWhomName}`
                        })
                      }
                      className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer"
                      title={isUr ? 'حذف کریں' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODULE 3: FREIGHT PENDING                                           */}
      {/* =================================================================== */}
      {subModule === 'freight' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-[#ecece0] dark:border-slate-700 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecece0] dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f2942] dark:text-slate-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-sky-600" />
                <span>{isUr ? 'کرایہ پینڈنگ (بقایا کرایہ ریکارڈ)' : 'Freight Pending Ledger'}</span>
              </h2>
              <p className="text-xs text-[#6b6b55] dark:text-slate-400">
                {isUr
                  ? 'یہ ریکارڈ صرف اڈا پینل تک محدود ہے (مین ڈیش بورڈ کھاتہ سے الگ)۔'
                  : 'Strictly isolated inside Adda Panel (separate from main Dashboard Ledger).'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddFreight(v => !v)}
              className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isUr ? 'نیا بقایا کرایہ شامل کریں' : 'Add Pending Freight'}</span>
            </button>
          </div>

          {showAddFreight && (
            <form
              onSubmit={handleSaveManualFreight}
              className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'کمپنی / پارٹی / کرایہ دار نام *' : 'Company / Payee Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={mfParty}
                  onChange={e => setMfParty(e.target.value)}
                  placeholder={isUr ? 'پارٹی یا کمپنی نام' : 'Party / Company Name'}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'موبائل نمبر' : 'Mobile Number'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={mfMobile}
                  onChange={e => setMfMobile(e.target.value)}
                  placeholder="0300-0000000"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'بقایا کرایہ (روپے) *' : 'Freight Amount (Rs) *'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  dir="ltr"
                  value={mfAmount}
                  onChange={e => setMfAmount(e.target.value)}
                  placeholder="25000"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'بلٹی نمبر (اختیاری)' : 'Bilty No (Optional)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={mfBiltyNo}
                  onChange={e => setMfBiltyNo(e.target.value)}
                  placeholder="WG-1001"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">{isUr ? 'تاریخ' : 'Date'}</label>
                <input
                  type="date"
                  dir="ltr"
                  value={mfDate}
                  onChange={e => setMfDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1">
                  {isUr ? 'روٹ / نوٹ' : 'Route / Notes'}
                </label>
                <input
                  type="text"
                  value={mfNotes}
                  onChange={e => setMfNotes(e.target.value)}
                  placeholder={isUr ? 'سمندری تا لاہور' : 'Route or remarks'}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-300"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFreight(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold cursor-pointer"
                >
                  {isUr ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-700 text-white font-bold cursor-pointer"
                >
                  {isUr ? 'محفوظ کریں' : 'Save Freight'}
                </button>
              </div>
            </form>
          )}

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {(['pending', 'billed', 'paid', 'all'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFreightStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                    freightStatusFilter === st
                      ? 'bg-[#0f2942] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {st === 'pending'
                    ? isUr
                      ? 'بقایا (Pending)'
                      : 'Pending'
                    : st === 'billed'
                    ? isUr
                      ? 'بل شدہ (Billed)'
                      : 'Billed'
                    : st === 'paid'
                    ? isUr
                      ? 'وصول شدہ (Paid)'
                      : 'Paid'
                    : isUr
                    ? 'تمام'
                    : 'All'}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={freightSearch}
                onChange={e => setFreightSearch(e.target.value)}
                placeholder={isUr ? 'پارٹی، موبائل یا بلٹی نمبر تلاش کریں' : 'Search party, mobile, bilty no...'}
                className="w-full ps-8 pe-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {filteredFreight.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300">
              {isUr ? 'اس فلٹر میں کوئی بقایا کرایہ موجود نہیں۔' : 'No freight entries match this filter.'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFreight.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-sky-200/80 dark:border-slate-700 bg-[#fdfbf7] dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#0f2942] text-white">
                        {item.biltyNo}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.partyName}
                      </span>
                      {statusBadge(item.status)}
                      {item.billNumber && (
                        <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {item.billNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                      <span dir="ltr" className="font-mono">
                        📞 {item.partyMobile || '—'}
                      </span>
                      <span>•</span>
                      <span dir="ltr" className="font-mono">
                        {item.date}
                      </span>
                      {item.route && (
                        <>
                          <span>•</span>
                          <span>{item.route}</span>
                        </>
                      )}
                      {item.notes && (
                        <>
                          <span>•</span>
                          <span className="italic">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <span className="font-mono font-black text-base text-sky-800 dark:text-sky-300 px-2">
                      Rs {fmtNum(item.amount)}
                    </span>

                    {item.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() =>
                          openPartyForBilling(
                            item.partyName.trim().toLowerCase().replace(/\s+/g, ' '),
                            'freight'
                          )
                        }
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{isUr ? 'بل بنائیں' : 'Create Bill'}</span>
                      </button>
                    )}

                    {item.status !== 'paid' && (
                      <button
                        type="button"
                        onClick={() => setAddaFreightStatus(branchId, item.id, 'paid')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isUr ? 'وصول ہو گیا' : 'Mark Paid'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setPendingDeleteItem({
                          kind: 'freight',
                          id: item.id,
                          label: `${item.biltyNo} - ${item.partyName}`
                        })
                      }
                      className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer"
                      title={isUr ? 'حذف کریں' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODULE 4: CREATE NEW BILL (ALL | FREIGHT | COMMISSION + MULTI-SEL)  */}
      {/* =================================================================== */}
      {subModule === 'bill' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-[#ecece0] dark:border-slate-700 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecece0] dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f2942] dark:text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <span>{isUr ? 'نیا بل بنائیں و پرنٹ / شیئر کریں' : 'Create New Bill & Saved Bills'}</span>
              </h2>
              <p className="text-xs text-[#6b6b55] dark:text-slate-400">
                {isUr
                  ? 'کسی بھی پارٹی پر کلک کریں، کرایہ / کمیشن فلٹر سے آئٹمز منتخب کر کے بل تیار کریں۔'
                  : 'Click a party to view pending Freight/Commission items, custom-select, and generate/share bill.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setBillViewMode('generate');
                  setPreviewBill(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  billViewMode === 'generate'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {isUr ? 'بل بنائیں (پارٹی لسٹ)' : `Generate Bill (${partyGroups.length})`}
              </button>
              <button
                type="button"
                onClick={() => setBillViewMode('saved')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  billViewMode === 'saved'
                    ? 'bg-[#0f2942] text-white'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {isUr ? `محفوظ بلز (${addaBills.length})` : `Saved Bills (${addaBills.length})`}
              </button>
            </div>
          </div>

          {/* Search input for Parties / Saved Bills */}
          {!activePartyGroup && !previewBill && (
            <div className="relative max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3" />
              <input
                type="text"
                value={billSearchQuery}
                onChange={e => setBillSearchQuery(e.target.value)}
                placeholder={isUr ? 'پارٹی نام، موبائل یا بل نمبر تلاش کریں' : 'Search party, mobile, bill no...'}
                className="w-full ps-8 pe-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          )}

          {/* SUB-VIEW A: PARTY SELECTION & MULTI-SELECT BILL BUILDER */}
          {billViewMode === 'generate' && !previewBill && (
            <>
              {!activePartyGroup ? (
                filteredPartyGroups.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300">
                    {isUr
                      ? 'ابھی کسی پارٹی کا کرایہ یا کمیشن پینڈنگ نہیں ہے۔ بلٹی بناتے وقت یا پینڈنگ لسٹ سے اندراج شامل کریں۔'
                      : 'No parties with pending Freight or Commission right now.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredPartyGroups.map(grp => (
                      <button
                        key={grp.partyKey}
                        type="button"
                        onClick={() => openPartyForBilling(grp.partyKey, 'all')}
                        className="text-start p-4 rounded-2xl border-2 border-emerald-200 dark:border-slate-700 bg-[#fdfbf7] dark:bg-slate-800/60 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-sm text-[#0f2942] dark:text-slate-100">
                              {grp.partyName}
                            </div>
                            <div dir="ltr" className="text-[11px] font-mono text-slate-500">
                              📞 {grp.partyMobile || '—'}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-mono text-xs font-black">
                            Rs {fmtNum(grp.totalPendingAmount)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900">
                            {isUr ? 'کرایہ:' : 'Freight:'} {grp.freightItems.length} (Rs {fmtNum(grp.pendingFreightTotal)})
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                            {isUr ? 'کمیشن:' : 'Comm:'} {grp.commissionItems.length} (Rs {fmtNum(grp.pendingCommissionTotal)})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-[#0f2942] dark:text-slate-100">
                        {activePartyGroup.partyName}{' '}
                        {activePartyGroup.partyMobile ? `(${activePartyGroup.partyMobile})` : ''}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {isUr ? 'کل بقایا:' : 'Total Pending:'} Rs {fmtNum(activePartyGroup.totalPendingAmount)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPartyKey(null)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold cursor-pointer"
                    >
                      {isUr ? '← پارٹیاں تبدیل کریں' : '← Back to Parties'}
                    </button>
                  </div>

                  {/* Segmented Filter: All | Freight | Commission */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      {(
                        [
                          { key: 'all', ur: 'تمام (All)', en: 'All' },
                          { key: 'freight', ur: 'صرف کرایہ (Freight)', en: 'Freight' },
                          { key: 'commission', ur: 'صرف کمیشن (Commission)', en: 'Commission' }
                        ] as const
                      ).map(tab => (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setPartyBillFilter(tab.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            partyBillFilter === tab.key
                              ? 'bg-[#0f2942] text-white'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isUr ? tab.ur : tab.en}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (partyBillFilter !== 'commission') {
                            setSelectedFreightIds(activePartyGroup.freightItems.map(f => f.id));
                          }
                          if (partyBillFilter !== 'freight') {
                            setSelectedCommissionIds(activePartyGroup.commissionItems.map(c => c.id));
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 cursor-pointer"
                      >
                        {isUr ? 'تمام منتخب کریں' : 'Select All'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFreightIds([]);
                          setSelectedCommissionIds([]);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 cursor-pointer"
                      >
                        {isUr ? 'صاف کریں' : 'Clear'}
                      </button>
                    </div>
                  </div>

                  {/* Multi-select item list */}
                  <div className="space-y-2">
                    {partyBillFilter !== 'commission' &&
                      activePartyGroup.freightItems.map(f => {
                        const checked = selectedFreightIds.includes(f.id);
                        return (
                          <label
                            key={f.id}
                            className={`flex items-center justify-between gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                              checked
                                ? 'bg-sky-50 border-sky-400 dark:bg-sky-950/30'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedFreightIds(prev =>
                                    prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]
                                  )
                                }
                                className="w-4 h-4 accent-[#0f2942]"
                              />
                              <div>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                  <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 text-[10px]">
                                    {isUr ? 'کرایہ' : 'Freight'}
                                  </span>
                                  <span className="font-mono text-[#0f2942] dark:text-sky-200">{f.biltyNo}</span>
                                  <span className="text-slate-500 font-mono">{f.date}</span>
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                                  {f.vehicleNo ? `[${f.vehicleNo}] ` : ''}
                                  {f.route || f.notes || (isUr ? 'بقایا کرایہ بلٹی' : 'Pending freight')}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono font-black text-sm text-sky-900 dark:text-sky-300">
                              Rs {fmtNum(f.amount)}
                            </span>
                          </label>
                        );
                      })}

                    {partyBillFilter !== 'freight' &&
                      activePartyGroup.commissionItems.map(c => {
                        const checked = selectedCommissionIds.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`flex items-center justify-between gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                              checked
                                ? 'bg-amber-50 border-amber-400 dark:bg-amber-950/30'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedCommissionIds(prev =>
                                    prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                                  )
                                }
                                className="w-4 h-4 accent-[#0f2942]"
                              />
                              <div>
                                <div className="flex items-center gap-2 text-xs font-bold">
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px]">
                                    {isUr ? 'کمیشن' : 'Commission'}
                                  </span>
                                  <span className="font-mono text-[#0f2942] dark:text-amber-200">{c.biltyNo}</span>
                                  <span className="text-slate-500 font-mono">{c.date}</span>
                                </div>
                                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                                  {c.vehicleNo ? `[${c.vehicleNo}] ` : ''}
                                  {c.route || c.notes || (isUr ? 'بقایا کمیشن بلٹی' : 'Pending commission')}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono font-black text-sm text-amber-900 dark:text-amber-300">
                              Rs {fmtNum(c.amount)}
                            </span>
                          </label>
                        );
                      })}
                  </div>

                  {/* Extras & Generate Action */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold mb-1">
                          {isUr ? 'اضافی چارجز (روپے)' : 'Extra Charges (Rs)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          dir="ltr"
                          value={billExtraCharges}
                          onChange={e => setBillExtraCharges(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">
                          {isUr ? 'رعایت / ڈسکاؤنٹ (روپے)' : 'Discount (Rs)'}
                        </label>
                        <input
                          type="number"
                          min={0}
                          dir="ltr"
                          value={billDiscount}
                          onChange={e => setBillDiscount(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold mb-1">{isUr ? 'نوٹ' : 'Bill Note'}</label>
                        <input
                          type="text"
                          value={billNotes}
                          onChange={e => setBillNotes(e.target.value)}
                          placeholder={isUr ? 'ادائیگی کی شرائط یا نوٹ' : 'Optional note'}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                      <div className="text-sm font-black text-[#0f2942] dark:text-slate-100">
                        {isUr ? 'کل بل رقم:' : 'Grand Total:'}{' '}
                        <span className="font-mono text-emerald-700 dark:text-emerald-400">
                          Rs {fmtNum(selectedBillGrandTotal)}
                        </span>{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({selectedFreightIds.length + selectedCommissionIds.length}{' '}
                          {isUr ? 'منتخب آئٹمز' : 'selected items'})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateBill}
                        className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>{isUr ? 'بل محفوظ کریں اور دیکھیں' : 'Generate Bill & Preview'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* SUB-VIEW B: SAVED BILLS & BILL PREVIEW */}
          {(billViewMode === 'saved' || Boolean(previewBill)) && (
            <div className="space-y-4">
              {previewBill ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setPreviewBill(null)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold cursor-pointer"
                    >
                      {isUr ? '← تمام بلز پر واپس' : '← All Saved Bills'}
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {previewBill.status !== 'paid' && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = markAddaBillPaid(branchId, previewBill.id);
                            if (updated) setPreviewBill(updated);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isUr ? 'ادا شدہ مارک کریں (Mark Paid)' : 'Mark Paid'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={exportingPdf}
                        onClick={() => void handleExportBillPdf(previewBill)}
                        className="px-3 py-1.5 rounded-xl bg-[#0f2942] text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{isUr ? 'پی ڈی ایف ڈاؤن لوڈ' : 'Download PDF'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrintBill(previewBill)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isUr ? 'پرنٹ' : 'Print'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={exportingPdf}
                        onClick={() => void handleShareBillWhatsApp(previewBill)}
                        className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{isUr ? 'واٹس ایپ شیئر' : 'Share WhatsApp'}</span>
                      </button>
                    </div>
                  </div>

                  <PrintableAddaBill
                    bill={previewBill}
                    lang={lang}
                    branchConfig={activeBranch}
                    companyProfile={companyProfile}
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'billed', 'paid'] as const).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSavedBillsFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                          savedBillsFilter === st
                            ? 'bg-[#0f2942] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {st === 'all'
                          ? isUr
                            ? 'تمام بلز'
                            : 'All'
                          : st === 'billed'
                          ? isUr
                            ? 'بل جاری / بقایا (Unpaid)'
                            : 'Billed (Unpaid)'
                          : isUr
                          ? 'وصول شدہ (Paid)'
                          : 'Paid'}
                      </button>
                    ))}
                  </div>

                  {filteredSavedBills.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300">
                      {isUr ? 'کوئی محفوظ شدہ بل موجود نہیں۔' : 'No saved Adda bills found.'}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredSavedBills.map(b => (
                        <div
                          key={b.id}
                          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[#fdfbf7] dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-[#0f2942] text-white">
                                {b.billNumber}
                              </span>
                              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                {b.partyName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  b.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}
                              >
                                {b.status === 'paid'
                                  ? isUr
                                    ? 'ادا شدہ (Paid)'
                                    : 'Paid'
                                  : isUr
                                  ? 'بل جاری (Billed)'
                                  : 'Billed'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
                              <span dir="ltr" className="font-mono">
                                {b.date}
                              </span>
                              <span>•</span>
                              <span>
                                {b.items.length} {isUr ? 'آئٹمز' : 'items'}
                              </span>
                              {b.partyMobile && (
                                <>
                                  <span>•</span>
                                  <span dir="ltr" className="font-mono">
                                    📞 {b.partyMobile}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap shrink-0">
                            <span className="font-mono font-black text-base text-emerald-800 dark:text-emerald-300 px-2">
                              Rs {fmtNum(b.totalAmount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setPreviewBill(b)}
                              className="px-3 py-1.5 rounded-xl bg-[#0f2942] text-white text-[11px] font-bold cursor-pointer"
                            >
                              {isUr ? 'دیکھیں / شیئر' : 'View / Share'}
                            </button>
                            {b.status !== 'paid' && (
                              <button
                                type="button"
                                onClick={() => markAddaBillPaid(branchId, b.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold cursor-pointer"
                              >
                                {isUr ? 'وصول ہو گیا' : 'Mark Paid'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setPendingDeleteItem({
                                  kind: 'bill',
                                  id: b.id,
                                  label: `${b.billNumber} (${b.partyName})`
                                })
                              }
                              className="p-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer"
                              title={isUr ? 'حذف کریں' : 'Delete Bill'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODULE 5: BRANCH STAFF, ROLES & ACCESS & VIEW ALL STAFF             */}
      {/* =================================================================== */}
      {subModule === 'staff' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-[#ecece0] dark:border-slate-700 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecece0] dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f2942] dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-700" />
                <span>
                  {isUr
                    ? 'برانچ اسٹاف، رولز اور رسائی — مکمل فہرست'
                    : 'Branch Staff, Roles & Access — View All Staff'}
                </span>
              </h2>
              <p className="text-xs text-[#6b6b55] dark:text-slate-400">
                {isUr
                  ? 'صارف پہلے Gmail سے سائن ان کرے؛ یہاں اس کا نام (خوش آمدید نوٹ کیلئے)، رول اور ماڈیول اختیارات سیٹ کریں۔'
                  : 'Assign each Gmail user their Person Name (displayed on Welcome Note), Preset Role & custom permissions.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoadingStaff(true);
                void fetchBranchStaff(branchId)
                  .then(l => setStaffList(filterStaffRosterExcludingCreator(l)))
                  .finally(() => setLoadingStaff(false));
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStaff ? 'animate-spin' : ''}`} />
              <span>{isUr ? 'تازہ کریں' : 'Refresh'}</span>
            </button>
          </div>

          {canManageStaff && (
            <>
              {visibleDirectory.length > 0 && (
                <div className="p-3 bg-[#fdfbf7] dark:bg-slate-800/60 border border-[#ecece0] dark:border-slate-700 rounded-2xl space-y-2">
                  <div className="text-[11px] font-bold text-[#4a4a35] dark:text-slate-200 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>
                      {isUr
                        ? 'سائن ان شدہ جی میل اکاؤنٹس (منتخب کرنے کیلئے کلک کریں):'
                        : 'Signed-in Gmail Accounts (Click to select):'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {visibleDirectory.map(u => (
                      <button
                        key={u.email}
                        type="button"
                        onClick={() => {
                          setStaffEmailInput(u.email);
                          if (!staffNameInput && u.displayName) setStaffNameInput(u.displayName);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-[#d6c3b0] text-[11px] font-mono text-[#1a477a] dark:text-sky-300 hover:bg-[#1a477a] hover:text-white transition-colors cursor-pointer"
                      >
                        {u.email}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSaveStaffSubmit}
                className="p-4 bg-[#fdfbf7] dark:bg-slate-800/50 border border-[#ecece0] dark:border-slate-700 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#1a477a] dark:text-sky-200 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {editingStaffEmail
                        ? isUr
                          ? `ترمیم: ${editingStaffEmail}`
                          : `Editing: ${editingStaffEmail}`
                        : isUr
                        ? 'نیا اسٹاف ممبر شامل کریں'
                        : 'Add Staff Member & Set Assigned Name'}
                    </span>
                  </h3>
                  {editingStaffEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStaffEmail(null);
                        setStaffEmailInput('');
                        setStaffNameInput('');
                        setStaffRoleInput('munshi');
                        setStaffPermsInput(getPresetPermissions('munshi'));
                      }}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      {isUr ? 'منسوخ' : 'Cancel'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                      {isUr ? 'اسٹاف جی میل *' : 'Staff Gmail *'}
                    </label>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      disabled={Boolean(editingStaffEmail)}
                      value={staffEmailInput}
                      onChange={e => setStaffEmailInput(e.target.value)}
                      placeholder="staff@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                      {isUr ? 'شخص کا نام (خوش آمدید نوٹ کیلئے) *' : 'Assigned Person Name (Welcome Note) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={staffNameInput}
                      onChange={e => setStaffNameInput(e.target.value)}
                      placeholder={isUr ? 'مثلاً علی خان' : 'e.g. Ali Khan'}
                      className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                      {isUr ? 'پری سیٹ رول' : 'Preset Role'}
                    </label>
                    <select
                      value={staffRoleInput}
                      onChange={e => {
                        const r = e.target.value as BranchPresetRole;
                        setStaffRoleInput(r);
                        setStaffPermsInput(getPresetPermissions(r));
                      }}
                      className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl font-bold"
                    >
                      {(isCreator || (editingStaffEmail && staffRoleInput === 'branch_owner')
                        ? (['branch_owner', ...ASSIGNABLE_ROLES] as BranchPresetRole[])
                        : ASSIGNABLE_ROLES
                      ).map(r => (
                        <option key={r} value={r}>
                          {isUr ? PRESET_ROLE_LABELS[r].ur : PRESET_ROLE_LABELS[r].en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#5a5a40] mb-1.5 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    <span>{isUr ? 'ماڈیول اختیارات (آن/آف)' : 'Module Permissions (Custom Toggles)'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {PERMISSION_KEYS.map(perm => (
                      <label
                        key={perm.key}
                        className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-[#ecece0] rounded-xl cursor-pointer"
                      >
                        <span className="font-medium text-[#3b3b2b]">
                          {isUr ? perm.ur : perm.en}
                        </span>
                        <input
                          type="checkbox"
                          checked={Boolean(staffPermsInput[perm.key])}
                          onChange={() =>
                            setStaffPermsInput(prev => ({ ...prev, [perm.key]: !prev[perm.key] }))
                          }
                          className="w-4 h-4 accent-[#1a477a] cursor-pointer"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingStaff}
                    className="px-5 py-2 bg-[#1a477a] hover:bg-[#13355c] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    {savingStaff
                      ? isUr
                        ? 'محفوظ ہو رہا ہے...'
                        : 'Saving...'
                      : editingStaffEmail
                      ? isUr
                        ? 'تبدیلیاں محفوظ کریں'
                        : 'Update Role & Access'
                      : isUr
                      ? 'اسٹاف کو رسائی دیں'
                      : 'Add Staff & Grant Access'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* View All Staff List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#4a4a35] dark:text-slate-200">
              {isUr
                ? `برانچ کے تمام اسٹاف اراکین (${visibleStaffList.length})`
                : `All Staff in This Branch (${visibleStaffList.length})`}
            </h3>
            {visibleStaffList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                {isUr ? 'اس برانچ میں ابھی کوئی اسٹاف شامل نہیں۔' : 'No staff members assigned to this branch yet.'}
              </div>
            ) : (
              <div className="space-y-2">
                {visibleStaffList.map(member => {
                  const isActive = member.status === 'active';
                  const isSelf = normalizeEmail(member.email) === callerCleanEmail;
                  const roleLabel = PRESET_ROLE_LABELS[member.presetRole] || PRESET_ROLE_LABELS.viewer;
                  return (
                    <div
                      key={member.email}
                      className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isActive ? 'bg-white border-[#ecece0]' : 'bg-rose-50/70 border-rose-200'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#1a477a]">
                            {member.displayName || member.email.split('@')[0]}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            {isUr ? roleLabel.ur : roleLabel.en}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                              isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isActive ? <ShieldCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {isActive ? (isUr ? 'فعال' : 'Active') : isUr ? 'منسوخ' : 'Revoked'}
                          </span>
                        </div>
                        <div dir="ltr" className="text-[11px] font-mono text-[#6b6b55] truncate">
                          {member.email}
                        </div>
                      </div>

                      {canManageStaff && (
                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStaffEmail(member.email);
                              setStaffEmailInput(member.email);
                              setStaffNameInput(member.displayName || '');
                              setStaffRoleInput(member.presetRole);
                              setStaffPermsInput({ ...member.permissions });
                            }}
                            className="px-2.5 py-1 rounded-xl bg-[#f0f0e4] hover:bg-[#e2e2d2] text-[#4a4a35] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{isUr ? 'ترمیم' : 'Edit'}</span>
                          </button>

                          {!isSelf && (
                            <>
                              <button
                                type="button"
                                disabled={savingStaff}
                                onClick={async () => {
                                  if (!activeBranch) return;
                                  const nextStatus = isActive ? 'revoked' : 'active';
                                  setSavingStaff(true);
                                  try {
                                    await setBranchStaffStatus(activeBranch, member.email, nextStatus);
                                    const updated = await fetchBranchStaff(activeBranch.id);
                                    setStaffList(filterStaffRosterExcludingCreator(updated));
                                  } finally {
                                    setSavingStaff(false);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                                  isActive
                                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                                }`}
                              >
                                {isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                <span>
                                  {isActive
                                    ? isUr
                                      ? 'رسائی منسوخ'
                                      : 'Revoke'
                                    : isUr
                                    ? 'رسائی دیں'
                                    : 'Give Access'}
                                </span>
                              </button>
                              <button
                                type="button"
                                disabled={savingStaff}
                                onClick={() => setPendingDeleteStaff(member)}
                                className="px-2.5 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{isUr ? 'حذف' : 'Remove'}</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODULE 6: EDIT / MODIFY COMPANY DETAILS                             */}
      {/* =================================================================== */}
      {subModule === 'company' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-[#ecece0] dark:border-slate-700 shadow-xs">
          <div className="border-b border-[#ecece0] dark:border-slate-700 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0f2942] dark:text-slate-100 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-rose-700" />
              <span>
                {isUr
                  ? 'کمپنی تفصیلات میں ترمیم (بل اور بلٹی پر لاگو)'
                  : 'Edit / Modify Company Details (Reflected on Bilty & Bills)'}
              </span>
            </h2>
            <p className="text-xs text-[#6b6b55] dark:text-slate-400 mt-0.5">
              {canEditCompany
                ? isUr
                  ? 'یہاں کی گئی تمام تبدیلیاں فوری طور پر پرنٹ ہونے والی بلٹی اور بل دونوں پر نظر آئیں گی۔'
                  : 'Edits saved here automatically reflect on all Printed Bilties and Adda Bills for this branch.'
                : isUr
                ? 'صرف برانچ آنر یا ایپ کریئیٹر کمپنی تفصیلات میں ترمیم کر سکتے ہیں۔'
                : 'Only the Branch Owner or App Creator can edit company details.'}
            </p>
          </div>

          <form onSubmit={handleSaveCompanyDetailsSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'کمپنی ہیڈر نام (اردو)' : 'Company Header Name (Urdu)'}
                </label>
                <input
                  type="text"
                  disabled={!canEditCompany}
                  value={coHeaderUr}
                  onChange={e => setCoHeaderUr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'کمپنی ہیڈر نام (انگریزی)' : 'Company Header Name (English)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!canEditCompany}
                  value={coHeaderEn}
                  onChange={e => setCoHeaderEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'برانچ کا نام (اردو)' : 'Branch Name (Urdu)'}
                </label>
                <input
                  type="text"
                  disabled={!canEditCompany}
                  value={coNameUr}
                  onChange={e => setCoNameUr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'برانچ کا نام (انگریزی)' : 'Branch Name (English)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!canEditCompany}
                  value={coNameEn}
                  onChange={e => setCoNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'پروپرائیٹر کا نام (اردو)' : 'Proprietor Name (Urdu)'}
                </label>
                <input
                  type="text"
                  disabled={!canEditCompany}
                  value={coPropUr}
                  onChange={e => setCoPropUr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'پروپرائیٹر کا نام (انگریزی)' : 'Proprietor Name (English)'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!canEditCompany}
                  value={coPropEn}
                  onChange={e => setCoPropEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'برانچ پتہ (اردو) *' : 'Address (Urdu) *'}
                </label>
                <input
                  type="text"
                  required
                  disabled={!canEditCompany}
                  value={coAddressUr}
                  onChange={e => setCoAddressUr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'برانچ پتہ (انگریزی) *' : 'Address (English) *'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  disabled={!canEditCompany}
                  value={coAddressEn}
                  onChange={e => setCoAddressEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'فون نمبرز *' : 'Phone Numbers *'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  disabled={!canEditCompany}
                  value={coPhones}
                  onChange={e => setCoPhones(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] font-mono disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'این ٹی این نمبر (NTN)' : 'NTN Number'}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!canEditCompany}
                  value={coNtn}
                  onChange={e => setCoNtn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] font-mono disabled:opacity-70"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                  {isUr ? 'ٹیگ لائن (اختیاری)' : 'Company Tagline (Optional)'}
                </label>
                <input
                  type="text"
                  disabled={!canEditCompany}
                  value={coTaglineUr}
                  onChange={e => setCoTaglineUr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-[#fdfbf7] disabled:opacity-70"
                />
              </div>
            </div>

            {isCreator && canEditCompany && (
              <label className="flex items-center gap-2 text-xs font-bold text-[#0f2942] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={applyToGlobalCompany}
                  onChange={e => setApplyToGlobalCompany(e.target.checked)}
                  className="w-4 h-4 accent-[#0f2942]"
                />
                <span>
                  {isUr
                    ? 'گلوبل کمپنی پروفائل (ہیڈ آفس ڈیفالٹ) پر بھی محفوظ کریں'
                    : 'Also save to Global Company Profile defaults'}
                </span>
              </label>
            )}

            {canEditCompany && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingCompany}
                  className="px-6 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#1a477a] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingCompany
                    ? isUr
                      ? 'محفوظ ہو رہا ہے...'
                      : 'Saving...'
                    : isUr
                    ? 'تفصیلات محفوظ کریں'
                    : 'Save Company Details'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODULE 7: BRANCHES, BRANCH OWNERS & STAFF ROLES (CREATOR ONLY)      */}
      {/* =================================================================== */}
      {subModule === 'branches' && isCreator && (
        <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-[#ecece0] dark:border-slate-700 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ecece0] pb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#0f2942] dark:text-slate-100">
              {isUr
                ? 'برانچز، برانچ آنرز اور عالمی رولز (صرف کریئیٹر)'
                : 'Branches, Branch Owners & Staff Roles (Creator Only)'}
            </h2>
            {onOpenBiltyAccess && (
              <button
                type="button"
                onClick={onOpenBiltyAccess}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold cursor-pointer"
              >
                {isUr ? 'آڈٹ لاگز، ٹول ریٹس و بیک اپ کھولیں' : 'Open Owner Security & Backups'}
              </button>
            )}
          </div>

          <OwnerBranchesPanel
            lang={lang}
            activeBranchId={branchId}
            onSelectActiveBranch={onSelectBranch}
            onBranchesUpdated={onBranchesUpdated}
          />
        </div>
      )}

      {/* =================================================================== */}
      {/* MODULE 8: BUSINESS REPORT (ISOLATED ADDA ANALYTICS)                 */}
      {/* =================================================================== */}
      {subModule === 'report' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-[#ecece0] dark:border-slate-700 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ecece0] dark:border-slate-700 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0f2942] dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <span>{isUr ? 'اڈا بزنس رپورٹ' : 'Adda Business Report'}</span>
              </h2>
              <p className="text-xs text-[#6b6b55] dark:text-slate-400">
                {isUr
                  ? 'برانچ کی بلٹیاں، بقایا کرایہ، کمیشن اور جاری شدہ بلز کا مکمل حساب'
                  : 'Complete summary of branch Bilties, Pending Freight/Commission & Adda Bills'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportAllTime}
                  onChange={e => setReportAllTime(e.target.checked)}
                  className="accent-[#0f2942]"
                />
                <span>{isUr ? 'مکمل تاریخ (All Time)' : 'All Time'}</span>
              </label>

              {!reportAllTime && (
                <input
                  type="month"
                  dir="ltr"
                  value={reportMonth}
                  onChange={e => setReportMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
              )}

              <button
                type="button"
                onClick={exportAddaReportCsv}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isUr ? 'CSV ڈاؤن لوڈ' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-1">
              <div className="text-[11px] font-bold text-slate-500">
                {isUr ? 'جاری بلٹیاں (کل کرایہ)' : 'Issued Bilties (Total Value)'}
              </div>
              <div className="text-lg font-black text-[#0f2942] font-mono">
                {reportSummary.biltyCount} • Rs {fmtNum(reportSummary.totalBiltyFreight)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
              <div className="text-[11px] font-bold text-sky-900">
                {isUr ? 'بقایا کرایہ (Pending / Billed)' : 'Pending / Billed Freight'}
              </div>
              <div className="text-lg font-black text-sky-900 font-mono">
                Rs {fmtNum(reportSummary.freightPendingAmt + reportSummary.freightBilledAmt)}
              </div>
              <div className="text-[10px] text-sky-700">
                {isUr ? 'وصول شدہ:' : 'Collected:'} Rs {fmtNum(reportSummary.freightPaidAmt)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="text-[11px] font-bold text-amber-900">
                {isUr ? 'بقایا کمیشن (Pending / Billed)' : 'Pending / Billed Commission'}
              </div>
              <div className="text-lg font-black text-amber-900 font-mono">
                Rs {fmtNum(reportSummary.commPendingAmt + reportSummary.commBilledAmt)}
              </div>
              <div className="text-[10px] text-amber-700">
                {isUr ? 'وصول شدہ:' : 'Collected:'} Rs {fmtNum(reportSummary.commPaidAmt)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="text-[11px] font-bold text-emerald-900">
                {isUr ? `تیار شدہ بلز (${reportSummary.billsCount})` : `Adda Bills (${reportSummary.billsCount})`}
              </div>
              <div className="text-lg font-black text-emerald-900 font-mono">
                Rs {fmtNum(reportSummary.billsPaidTotal)} {isUr ? 'وصول' : 'Paid'}
              </div>
              <div className="text-[10px] text-emerald-700">
                {isUr ? 'بقایا بلز:' : 'Unpaid Bills:'} Rs {fmtNum(reportSummary.billsBilledTotal)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteItem)}
        lang={lang}
        variant="danger"
        title={isUr ? 'ریکارڈ حذف کریں' : 'Delete Record'}
        message={
          isUr
            ? `کیا آپ "${pendingDeleteItem?.label || ''}" کو مستقل طور پر حذف کرنا چاہتے ہیں؟ (اگر یہ ان پیڈ بل ہے تو اس کے آئٹمز واپس پینڈنگ لسٹ میں چلے جائیں گے)`
            : `Delete "${pendingDeleteItem?.label || ''}"? (If deleting an unpaid bill, linked items revert back to pending.)`
        }
        confirmLabel={isUr ? 'جی ہاں، حذف کریں' : 'Delete'}
        onCancel={() => setPendingDeleteItem(null)}
        onConfirm={() => {
          if (!pendingDeleteItem) return;
          if (pendingDeleteItem.kind === 'freight') {
            deleteAddaPendingFreight(branchId, pendingDeleteItem.id);
          } else if (pendingDeleteItem.kind === 'commission') {
            deleteAddaPendingCommission(branchId, pendingDeleteItem.id);
          } else {
            deleteAddaBill(branchId, pendingDeleteItem.id);
            if (previewBill?.id === pendingDeleteItem.id) setPreviewBill(null);
          }
          setPendingDeleteItem(null);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingDeleteStaff)}
        lang={lang}
        variant="danger"
        title={isUr ? 'اسٹاف ممبر ہٹائیں' : 'Remove Staff Member'}
        message={
          isUr
            ? `کیا آپ ${pendingDeleteStaff?.email} کو برانچ سے مستقل طور پر ہٹانا چاہتے ہیں؟`
            : `Remove ${pendingDeleteStaff?.email} permanently from this branch?`
        }
        confirmLabel={isUr ? 'جی ہاں، ہٹائیں' : 'Remove'}
        onCancel={() => setPendingDeleteStaff(null)}
        onConfirm={async () => {
          if (!pendingDeleteStaff || !activeBranch) return;
          const targetEmail = pendingDeleteStaff.email;
          setPendingDeleteStaff(null);
          setSavingStaff(true);
          try {
            await removeBranchStaffMember(activeBranch.id, targetEmail);
            const updated = await fetchBranchStaff(activeBranch.id);
            setStaffList(filterStaffRosterExcludingCreator(updated));
          } finally {
            setSavingStaff(false);
          }
        }}
      />
    </div>
  );
};
