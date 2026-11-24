import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit3,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  Plus,
  Power,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX
} from 'lucide-react';
import type {
  BranchConfig,
  BranchPermissions,
  BranchPresetRole,
  BranchStaffMember,
  Language
} from '../types';
import {
  DEFAULT_HEAD_OFFICE_BRANCH_ID,
  PRESET_ROLE_LABELS,
  filterStaffRosterExcludingCreator,
  getPresetPermissions,
  isOwnerEmail,
  normalizeEmail
} from '../utils/authUtils';
import { getCachedBranches } from '../utils/branchContext';
import {
  SignedInDirectoryEntry,
  ensureSamundriBranchInFirestore,
  fetchAllBranches,
  fetchBranchStaff,
  fetchSignedInDirectoryUsers,
  getCachedBranchStaff,
  removeBranchStaffMember,
  saveBranchConfig,
  setBranchStaffStatus,
  subscribeToBranchStaff,
  toggleBranchActive,
  upsertBranchStaffMember
} from '../utils/branchService';
import { ConfirmDialog } from './ConfirmDialog';

interface OwnerBranchesPanelProps {
  lang: Language;
  activeBranchId?: string | null;
  onSelectActiveBranch?: (branchId: string) => void;
  onBranchesUpdated?: (branches: BranchConfig[]) => void;
}

const ALL_PRESET_ROLES: BranchPresetRole[] = [
  'branch_owner',
  'branch_manager',
  'munshi',
  'accountant',
  'viewer'
];

const MODULE_PERMISSION_FIELDS: Array<{
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

export const OwnerBranchesPanel: React.FC<OwnerBranchesPanelProps> = ({
  lang,
  activeBranchId,
  onSelectActiveBranch,
  onBranchesUpdated
}) => {
  const isUr = lang === 'ur';

  const [branches, setBranches] = useState<BranchConfig[]>(() => getCachedBranches());
  const [selectedStaffBranchId, setSelectedStaffBranchId] = useState<string>(
    activeBranchId || DEFAULT_HEAD_OFFICE_BRANCH_ID
  );
  const [staffList, setStaffList] = useState<BranchStaffMember[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<SignedInDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [savingStaff, setSavingStaff] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null);

  // Branch Create / Edit Form
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState('');
  const [nameUr, setNameUr] = useState('');
  const [addressUr, setAddressUr] = useState('');
  const [addressEn, setAddressEn] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [startingBiltySeq, setStartingBiltySeq] = useState<number>(2001);
  const [branchOwnerEmail, setBranchOwnerEmail] = useState('');
  const [branchActive, setBranchActive] = useState(true);

  // Staff Form
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');
  const [presetRole, setPresetRole] = useState<BranchPresetRole>('munshi');
  const [permissions, setPermissions] = useState<BranchPermissions>(() =>
    getPresetPermissions('munshi')
  );
  const [editingStaffEmail, setEditingStaffEmail] = useState<string | null>(null);
  const [pendingDeleteStaff, setPendingDeleteStaff] = useState<BranchStaffMember | null>(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      await ensureSamundriBranchInFirestore();
      const [fetchedBranches, dirUsers] = await Promise.all([
        fetchAllBranches(),
        fetchSignedInDirectoryUsers()
      ]);
      setBranches(fetchedBranches);
      onBranchesUpdated?.(fetchedBranches);
      setDirectoryUsers(filterStaffRosterExcludingCreator(dirUsers));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    if (!selectedStaffBranchId) return;
    setStaffList(getCachedBranchStaff(selectedStaffBranchId));
    void fetchBranchStaff(selectedStaffBranchId).then(list =>
      setStaffList(filterStaffRosterExcludingCreator(list))
    );
    const unsub = subscribeToBranchStaff(selectedStaffBranchId, list => {
      setStaffList(filterStaffRosterExcludingCreator(list));
    });
    return () => unsub();
  }, [selectedStaffBranchId]);

  const resetBranchForm = () => {
    setEditingBranchId(null);
    setNameEn('');
    setNameUr('');
    setAddressUr('');
    setAddressEn('');
    setPhoneNumbers('');
    setStartingBiltySeq(2001);
    setBranchOwnerEmail('');
    setBranchActive(true);
  };

  const handleEditBranch = (b: BranchConfig) => {
    setEditingBranchId(b.id);
    setNameEn(b.nameEn);
    setNameUr(b.nameUr);
    setAddressUr(b.addressUr);
    setAddressEn(b.addressEn);
    setPhoneNumbers(b.phoneNumbers);
    setStartingBiltySeq(b.startingBiltySeq || 1001);
    setBranchOwnerEmail(b.ownerEmail && !isOwnerEmail(b.ownerEmail) ? b.ownerEmail : '');
    setBranchActive(b.active !== false);
    setFeedback(null);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameUr.trim()) {
      setFeedback({
        text: isUr ? 'برانچ کا نام درج کریں۔' : 'Branch name is required.',
        ok: false
      });
      return;
    }
    if (!addressUr.trim() && !addressEn.trim()) {
      setFeedback({
        text: isUr ? 'برانچ کا پتہ درج کریں (بلٹی پر پرنٹ ہوگا)۔' : 'Branch address is required for printed Bilty.',
        ok: false
      });
      return;
    }
    if (!phoneNumbers.trim()) {
      setFeedback({
        text: isUr ? 'برانچ کا فون نمبر درج کریں۔' : 'Branch phone number(s) required for printed Bilty.',
        ok: false
      });
      return;
    }
    const cleanOwner = normalizeEmail(branchOwnerEmail);
    if (cleanOwner && isOwnerEmail(cleanOwner)) {
      setFeedback({
        text: isUr
          ? 'ایپ کریئیٹر ای میل برانچ اسٹاف یا ذیلی آنر میں درج نہیں کی جا سکتی۔'
          : 'App Creator email is not added to sub-branch staff lists.',
        ok: false
      });
      return;
    }

    setSavingBranch(true);
    setFeedback(null);
    try {
      const saved = await saveBranchConfig({
        ...(editingBranchId ? { id: editingBranchId } : {}),
        nameEn: nameEn.trim() || nameUr.trim(),
        nameUr: nameUr.trim() || nameEn.trim(),
        addressUr: addressUr.trim() || addressEn.trim(),
        addressEn: addressEn.trim() || addressUr.trim(),
        phoneNumbers: phoneNumbers.trim(),
        ntn: '7779394-1',
        startingBiltySeq: Math.max(1001, Number(startingBiltySeq) || 1001),
        ownerEmail: cleanOwner || undefined,
        active: branchActive
      });
      const updated = await fetchAllBranches();
      setBranches(updated);
      onBranchesUpdated?.(updated);
      setSelectedStaffBranchId(saved.id);
      setFeedback({
        text: isUr
          ? `برانچ "${saved.nameUr}" کامیابی سے محفوظ ہو گئی۔`
          : `Branch "${saved.nameEn}" saved successfully.`,
        ok: true
      });
      resetBranchForm();
    } catch (err) {
      setFeedback({
        text: err instanceof Error ? err.message : 'Failed saving branch',
        ok: false
      });
    } finally {
      setSavingBranch(false);
    }
  };

  const handleToggleBranch = async (b: BranchConfig) => {
    if (b.id === DEFAULT_HEAD_OFFICE_BRANCH_ID) return;
    setSavingBranch(true);
    try {
      await toggleBranchActive(b.id, b.active === false);
      const updated = await fetchAllBranches();
      setBranches(updated);
      onBranchesUpdated?.(updated);
    } finally {
      setSavingBranch(false);
    }
  };

  const resetStaffForm = () => {
    setStaffEmail('');
    setStaffName('');
    setPresetRole('munshi');
    setPermissions(getPresetPermissions('munshi'));
    setEditingStaffEmail(null);
  };

  const handleSelectRole = (role: BranchPresetRole) => {
    setPresetRole(role);
    setPermissions(getPresetPermissions(role));
  };

  const handleEditStaff = (member: BranchStaffMember) => {
    setEditingStaffEmail(member.email);
    setStaffEmail(member.email);
    setStaffName(member.displayName || '');
    setPresetRole(member.presetRole);
    setPermissions({ ...member.permissions });
    setFeedback(null);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetBranch = branches.find(b => b.id === selectedStaffBranchId);
    if (!targetBranch) return;
    const cleanEmail = normalizeEmail(staffEmail);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFeedback({
        text: isUr ? 'درست Gmail ای میل درج کریں۔' : 'Please enter a valid Gmail address.',
        ok: false
      });
      return;
    }
    if (isOwnerEmail(cleanEmail)) {
      setFeedback({
        text: isUr
          ? 'ایپ کریئیٹر کو برانچ اسٹاف لسٹ میں شامل نہیں کیا جاتا۔'
          : 'App Creator is kept private and excluded from branch staff lists.',
        ok: false
      });
      return;
    }

    setSavingStaff(true);
    setFeedback(null);
    try {
      const matchedDir = directoryUsers.find(u => normalizeEmail(u.email) === cleanEmail);
      await upsertBranchStaffMember({
        branch: targetBranch,
        email: cleanEmail,
        displayName: staffName.trim() || matchedDir?.displayName || cleanEmail.split('@')[0],
        uid: matchedDir?.uid,
        presetRole,
        permissions,
        status: 'active'
      });
      const updatedStaff = await fetchBranchStaff(targetBranch.id);
      setStaffList(filterStaffRosterExcludingCreator(updatedStaff));
      setFeedback({
        text: isUr
          ? `${cleanEmail} کو "${targetBranch.nameUr}" میں رسائی دے دی گئی۔`
          : `Saved access for ${cleanEmail} on "${targetBranch.nameEn}".`,
        ok: true
      });
      resetStaffForm();
    } catch (err) {
      setFeedback({
        text: err instanceof Error ? err.message : 'Failed saving staff access',
        ok: false
      });
    } finally {
      setSavingStaff(false);
    }
  };

  const handleToggleStaffStatus = async (member: BranchStaffMember) => {
    const targetBranch = branches.find(b => b.id === selectedStaffBranchId);
    if (!targetBranch) return;
    const nextStatus = member.status === 'active' ? 'revoked' : 'active';
    setSavingStaff(true);
    try {
      await setBranchStaffStatus(targetBranch, member.email, nextStatus);
      const updated = await fetchBranchStaff(targetBranch.id);
      setStaffList(filterStaffRosterExcludingCreator(updated));
      setFeedback({
        text:
          nextStatus === 'active'
            ? isUr
              ? `${member.email} کو رسائی دوبارہ دے دی گئی۔`
              : `Restored access for ${member.email}.`
            : isUr
            ? `${member.email} کی رسائی منسوخ کر دی گئی۔`
            : `Revoked access for ${member.email}.`,
        ok: true
      });
    } finally {
      setSavingStaff(false);
    }
  };

  const handleConfirmDeleteStaff = async () => {
    if (!pendingDeleteStaff) return;
    const targetEmail = pendingDeleteStaff.email;
    const branchId = pendingDeleteStaff.branchId;
    setPendingDeleteStaff(null);
    setSavingStaff(true);
    try {
      await removeBranchStaffMember(branchId, targetEmail);
      const updated = await fetchBranchStaff(branchId);
      setStaffList(filterStaffRosterExcludingCreator(updated));
      setFeedback({
        text: isUr ? `${targetEmail} کو ہٹا دیا گیا۔` : `Removed ${targetEmail} cleanly.`,
        ok: true
      });
    } finally {
      setSavingStaff(false);
    }
  };

  const selectedBranchObj =
    branches.find(b => b.id === selectedStaffBranchId) || branches[0] || null;
  const visibleDirectory = filterStaffRosterExcludingCreator(directoryUsers);
  const visibleStaff = filterStaffRosterExcludingCreator(staffList);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="p-3.5 bg-emerald-50/75 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold">
            {isUr
              ? 'ملٹی برانچ و اسٹاف کنٹرول (بغیر کوڈنگ)'
              : 'Branches, Branch Owners & Staff Roles'}
          </h3>
          <p className="text-[11px] text-emerald-900 mt-0.5">
            {isUr
              ? 'نئی برانچ بنائیں، برانچ کا پتہ، فون نمبر اور بلٹی کا ابتدائی نمبر سیٹ کریں۔ صارف پہلے Gmail سے سائن ان کرے، پھر یہاں سے اس کا رول اور اختیارات سیٹ کریں۔'
              : 'Create branches with custom Bilty address, phones, and starting Bilty number. Signed-in Gmail users appear automatically for one-click role assignment.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadAll()}
          className="px-3 py-1.5 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[11px] font-bold text-emerald-900 flex items-center gap-1 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isUr ? 'تازہ کریں' : 'Refresh'}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            feedback.ok
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* SECTION A: Existing Branches List */}
      <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3">
        <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
          <h4 className="font-bold text-xs text-[#4a4a35] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#1a477a]" />
            <span>{isUr ? `رجسٹرڈ برانچز (${branches.length})` : `Company Branches (${branches.length})`}</span>
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {branches.map(b => {
            const isSelected = (activeBranchId || DEFAULT_HEAD_OFFICE_BRANCH_ID) === b.id;
            const isHead = b.id === DEFAULT_HEAD_OFFICE_BRANCH_ID;
            return (
              <div
                key={b.id}
                className={`p-3 rounded-2xl border space-y-2 ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-400'
                    : 'bg-white border-[#ecece0]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-xs text-[#1a477a] flex items-center gap-1.5 flex-wrap">
                      <span>{isUr ? b.nameUr : b.nameEn}</span>
                      {isHead && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">
                          HQ
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          b.active !== false
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.active !== false ? (isUr ? 'فعال' : 'Active') : isUr ? 'بند' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#6b6b55] mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0 text-amber-700" />
                      <span className="line-clamp-1">{isUr ? b.addressUr : b.addressEn}</span>
                    </div>
                    <div dir="ltr" className="text-[10px] font-mono text-[#6b6b55] mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 shrink-0 text-emerald-700" />
                      <span>{b.phoneNumbers}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-[#1a477a]/10 text-[#1a477a] text-[10px] font-mono font-bold shrink-0">
                    #{b.startingBiltySeq || 1001}+
                  </span>
                </div>

                {b.ownerEmail && !isOwnerEmail(b.ownerEmail) && (
                  <div className="text-[10px] font-mono text-[#4a4a35] bg-[#f8f6ef] px-2 py-1 rounded-lg">
                    {isUr ? 'برانچ آنر:' : 'Branch Owner:'} {b.ownerEmail}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {onSelectActiveBranch && (
                    <button
                      type="button"
                      onClick={() => onSelectActiveBranch(b.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#1a477a]/10 hover:bg-[#1a477a]/20 text-[#1a477a]'
                      }`}
                    >
                      {isSelected
                        ? isUr
                          ? 'موجودہ فعال برانچ'
                          : 'Active Branch'
                        : isUr
                        ? 'اس برانچ میں جائیں'
                        : 'Switch Branch'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleEditBranch(b)}
                    className="px-2.5 py-1 rounded-xl bg-[#f0f0e4] hover:bg-[#e2e2d2] text-[#4a4a35] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isUr ? 'ترمیم' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStaffBranchId(b.id)}
                    className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Users className="w-3 h-3" />
                    <span>{isUr ? 'اسٹاف دیکھیں' : 'View Staff'}</span>
                  </button>

                  {!isHead && (
                    <button
                      type="button"
                      disabled={savingBranch}
                      onClick={() => void handleToggleBranch(b)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Power className="w-3 h-3" />
                      <span>{b.active !== false ? (isUr ? 'بند' : 'Pause') : isUr ? 'چلائیں' : 'Enable'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION B: Add / Edit Branch Form */}
      <form
        onSubmit={handleSaveBranch}
        className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3"
      >
        <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
          <h4 className="font-bold text-xs text-[#4a4a35] flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-700" />
            <span>
              {editingBranchId
                ? isUr
                  ? `برانچ ترمیم (${editingBranchId})`
                  : `Edit Branch (${editingBranchId})`
                : isUr
                ? 'نئی برانچ شامل کریں'
                : 'Add New Branch'}
            </span>
          </h4>
          {editingBranchId && (
            <button
              type="button"
              onClick={resetBranchForm}
              className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
            >
              {isUr ? 'منسوخ کریں' : 'Cancel Edit'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
              {isUr ? 'برانچ کا نام (انگریزی) *' : 'Branch Name (English) *'}
            </label>
            <input
              type="text"
              required
              value={nameEn}
              onChange={e => setNameEn(e.target.value)}
              placeholder="Lahore Branch"
              dir="ltr"
              className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl focus:outline-none focus:border-[#1a477a]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
              {isUr ? 'برانچ کا نام (اردو) *' : 'Branch Name (Urdu) *'}
            </label>
            <input
              type="text"
              required
              value={nameUr}
              onChange={e => setNameUr(e.target.value)}
              placeholder="لاہور برانچ"
              className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl focus:outline-none focus:border-[#1a477a]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
              {isUr ? 'برانچ پتہ (اردو - بلٹی پر پرنٹ ہوگا) *' : 'Branch Address (Urdu - Printed on Bilty) *'}
            </label>
            <input
              type="text"
              required
              value={addressUr}
              onChange={e => setAddressUr(e.target.value)}
              placeholder="بند روڈ، ٹرک اڈا، لاہور"
              className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl focus:outline-none focus:border-[#1a477a]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
              {isUr ? 'برانچ پتہ (انگریزی - بلٹی پر پرنٹ ہوگا) *' : 'Branch Address (English - Printed on Bilty) *'}
            </label>
            <input
              type="text"
              required
              value={addressEn}
              onChange={e => setAddressEn(e.target.value)}
              placeholder="Band Road, Truck Stand, Lahore"
              dir="ltr"
              className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl focus:outline-none focus:border-[#1a477a]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
              {isUr ? 'برانچ فون نمبرز (کوما سے الگ) *' : 'Branch Phone Numbers (comma separated) *'}
            </label>
            <input
              type="text"
              required
              value={phoneNumbers}
              onChange={e => setPhoneNumbers(e.target.value)}
              placeholder="0300-1112233, 0321-4445566"
              dir="ltr"
              className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl font-mono focus:outline-none focus:border-[#1a477a]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
              {isUr ? 'ابتدائی بلٹی نمبر (کم از کم 1001) *' : 'Starting Bilty Number (min 1001) *'}
            </label>
            <input
              type="number"
              min={1001}
              max={999999}
              required
              value={startingBiltySeq}
              onChange={e => setStartingBiltySeq(Math.max(1001, parseInt(e.target.value, 10) || 1001))}
              dir="ltr"
              className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl font-mono focus:outline-none focus:border-[#1a477a]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
              {isUr ? 'برانچ آنر جی میل (اختیاری)' : 'Assigned Branch Owner Gmail (Optional)'}
            </label>
            <input
              type="email"
              value={branchOwnerEmail}
              onChange={e => setBranchOwnerEmail(e.target.value)}
              placeholder="branchowner@gmail.com"
              dir="ltr"
              className="w-full px-3 py-2 bg-white border border-[#d6c3b0] rounded-xl font-mono focus:outline-none focus:border-[#1a477a]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs font-bold text-[#4a4a35] cursor-pointer">
            <input
              type="checkbox"
              checked={branchActive}
              onChange={e => setBranchActive(e.target.checked)}
              className="w-4 h-4 accent-emerald-700"
            />
            <span>{isUr ? 'برانچ فعال ہے' : 'Branch Active'}</span>
          </label>

          <button
            type="submit"
            disabled={savingBranch}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
          >
            {savingBranch
              ? isUr
                ? 'محفوظ ہو رہا ہے...'
                : 'Saving...'
              : editingBranchId
              ? isUr
                ? 'برانچ محفوظ کریں'
                : 'Save Branch Changes'
              : isUr
              ? 'نئی برانچ شامل کریں'
              : 'Create Branch'}
          </button>
        </div>
      </form>

      {/* SECTION C: Staff & Permissions Manager per Branch */}
      <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ecece0] pb-2">
          <h4 className="font-bold text-xs text-[#4a4a35] flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-[#1a477a]" />
            <span>{isUr ? 'برانچ اسٹاف، رولز اور اختیارات' : 'Branch Staff, Roles & Access'}</span>
          </h4>

          <select
            value={selectedStaffBranchId}
            onChange={e => {
              setSelectedStaffBranchId(e.target.value);
              resetStaffForm();
            }}
            className="text-xs font-bold px-3 py-1.5 bg-white border border-[#d6c3b0] rounded-xl focus:outline-none focus:border-[#1a477a]"
          >
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {isUr ? b.nameUr : b.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Signed-In Gmail Directory Chips */}
        {visibleDirectory.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[#6b6b55] flex items-center gap-1">
              <Mail className="w-3 h-3 text-emerald-700" />
              <span>
                {isUr
                  ? 'سائن ان شدہ جی میل اکاؤنٹس (منتخب کرنے کیلئے کلک کریں):'
                  : 'Signed-in Gmail Accounts (Click to select):'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {visibleDirectory.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => {
                    setStaffEmail(u.email);
                    if (!staffName && u.displayName) setStaffName(u.displayName);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#d6c3b0] text-[11px] font-mono text-[#1a477a] hover:bg-[#1a477a] hover:text-white transition-colors cursor-pointer"
                >
                  {u.email}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSaveStaff} className="space-y-3 bg-white p-3.5 rounded-2xl border border-[#ecece0]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1a477a]">
              {editingStaffEmail
                ? isUr
                  ? `اسٹاف رول ترمیم: ${editingStaffEmail}`
                  : `Editing Role: ${editingStaffEmail}`
                : isUr
                ? `"${selectedBranchObj?.nameUr || ''}" میں اسٹاف شامل کریں`
                : `Add Staff to "${selectedBranchObj?.nameEn || ''}"`}
            </span>
            {editingStaffEmail && (
              <button
                type="button"
                onClick={resetStaffForm}
                className="text-[11px] font-bold text-rose-700 hover:underline cursor-pointer"
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
                disabled={Boolean(editingStaffEmail)}
                value={staffEmail}
                onChange={e => setStaffEmail(e.target.value)}
                placeholder="user@gmail.com"
                dir="ltr"
                className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#d6c3b0] rounded-xl font-mono focus:outline-none focus:border-[#1a477a] disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                {isUr ? 'نام (اختیاری)' : 'Display Name (Optional)'}
              </label>
              <input
                type="text"
                value={staffName}
                onChange={e => setStaffName(e.target.value)}
                placeholder={isUr ? 'نام لکھیں' : 'Staff Name'}
                className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#d6c3b0] rounded-xl focus:outline-none focus:border-[#1a477a]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#5a5a40] mb-1">
                {isUr ? 'پری سیٹ رول' : 'Preset Role'}
              </label>
              <select
                value={presetRole}
                onChange={e => handleSelectRole(e.target.value as BranchPresetRole)}
                className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#d6c3b0] rounded-xl font-bold focus:outline-none focus:border-[#1a477a]"
              >
                {ALL_PRESET_ROLES.map(r => (
                  <option key={r} value={r}>
                    {isUr ? PRESET_ROLE_LABELS[r].ur : PRESET_ROLE_LABELS[r].en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-[#5a5a40] flex items-center gap-1">
              <KeyRound className="w-3 h-3" />
              <span>{isUr ? 'ماڈیول اختیارات (حسب ضرورت آن/آف کریں)' : 'Custom Module Toggles'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {MODULE_PERMISSION_FIELDS.map(perm => (
                <label
                  key={perm.key}
                  className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl cursor-pointer text-xs"
                >
                  <span className="font-medium text-[#3b3b2b]">
                    {isUr ? perm.ur : perm.en}
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(permissions[perm.key])}
                    onChange={() =>
                      setPermissions(prev => ({ ...prev, [perm.key]: !prev[perm.key] }))
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
              className="px-5 py-2 bg-[#1a477a] hover:bg-[#13355c] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {savingStaff
                ? isUr
                  ? 'محفوظ ہو رہا ہے...'
                  : 'Saving...'
                : editingStaffEmail
                ? isUr
                  ? 'رول و رسائی محفوظ کریں'
                  : 'Update Role & Access'
                : isUr
                ? 'اسٹاف کو رسائی دیں'
                : 'Give Access'}
            </button>
          </div>
        </form>

        {/* Staff List for Selected Branch */}
        <div className="space-y-2">
          {visibleStaff.length === 0 ? (
            <div className="p-5 text-center text-xs text-[#8e8e75] bg-white rounded-2xl border border-dashed border-[#ecece0]">
              {isUr
                ? 'اس برانچ میں ابھی کوئی اسٹاف شامل نہیں۔'
                : 'No staff assigned to this branch yet.'}
            </div>
          ) : (
            visibleStaff.map(member => {
              const isActive = member.status === 'active';
              const roleLabel =
                PRESET_ROLE_LABELS[member.presetRole] || PRESET_ROLE_LABELS.viewer;
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

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleEditStaff(member)}
                      className="px-2.5 py-1 rounded-xl bg-[#f0f0e4] hover:bg-[#e2e2d2] text-[#4a4a35] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isUr ? 'ترمیم' : 'Edit Role'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={savingStaff}
                      onClick={() => void handleToggleStaffStatus(member)}
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
                            : 'Revoke Access'
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
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
        onConfirm={() => void handleConfirmDeleteStaff()}
      />
    </div>
  );
};
