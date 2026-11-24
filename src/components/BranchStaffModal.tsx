import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Edit3,
  KeyRound,
  Mail,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X
} from 'lucide-react';
import type {
  BranchConfig,
  BranchPermissions,
  BranchPresetRole,
  BranchStaffMember,
  Language
} from '../types';
import {
  PRESET_ROLE_LABELS,
  filterStaffRosterExcludingCreator,
  getPresetPermissions,
  isOwnerEmail,
  normalizeEmail
} from '../utils/authUtils';
import {
  SignedInDirectoryEntry,
  fetchBranchStaff,
  fetchSignedInDirectoryUsers,
  getCachedBranchStaff,
  removeBranchStaffMember,
  setBranchStaffStatus,
  subscribeToBranchStaff,
  upsertBranchStaffMember
} from '../utils/branchService';
import { ConfirmDialog } from './ConfirmDialog';

interface BranchStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  branch: BranchConfig | null;
  currentUserEmail?: string | null;
  canManageStaff: boolean;
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

export const BranchStaffModal: React.FC<BranchStaffModalProps> = ({
  isOpen,
  onClose,
  lang,
  branch,
  currentUserEmail,
  canManageStaff
}) => {
  const isUr = lang === 'ur';
  const [staff, setStaff] = useState<BranchStaffMember[]>([]);
  const [directoryUsers, setDirectoryUsers] = useState<SignedInDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Add / Edit Form State
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [presetRole, setPresetRole] = useState<BranchPresetRole>('munshi');
  const [permissions, setPermissions] = useState<BranchPermissions>(() =>
    getPresetPermissions('munshi')
  );
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [pendingDeleteMember, setPendingDeleteMember] = useState<BranchStaffMember | null>(null);

  useEffect(() => {
    if (!isOpen || !branch || !canManageStaff) return;

    setStaff(getCachedBranchStaff(branch.id));
    setLoading(true);

    void Promise.all([
      fetchBranchStaff(branch.id).then(list => setStaff(filterStaffRosterExcludingCreator(list))),
      fetchSignedInDirectoryUsers().then(users =>
        setDirectoryUsers(filterStaffRosterExcludingCreator(users))
      )
    ]).finally(() => setLoading(false));

    const unsub = subscribeToBranchStaff(branch.id, list => {
      setStaff(filterStaffRosterExcludingCreator(list));
    });

    return () => {
      unsub();
    };
  }, [isOpen, branch?.id, canManageStaff]);

  useEffect(() => {
    if (!isOpen || !canManageStaff) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pendingDeleteMember) onClose();
    };
    const onBack = () => {
      if (!pendingDeleteMember) onClose();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('app-back-button', onBack);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('app-back-button', onBack);
    };
  }, [isOpen, canManageStaff, pendingDeleteMember, onClose]);

  if (!isOpen || !branch || !canManageStaff) {
    return null;
  }

  const callerEmailClean = normalizeEmail(currentUserEmail);

  const resetForm = () => {
    setEmailInput('');
    setNameInput('');
    setPresetRole('munshi');
    setPermissions(getPresetPermissions('munshi'));
    setEditingEmail(null);
  };

  const handleRoleChange = (role: BranchPresetRole) => {
    setPresetRole(role);
    setPermissions(getPresetPermissions(role));
  };

  const togglePermission = (key: keyof BranchPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuickPickEmail = (entry: SignedInDirectoryEntry) => {
    setEmailInput(entry.email);
    if (!nameInput && entry.displayName) {
      setNameInput(entry.displayName);
    }
  };

  const handleEditMember = (member: BranchStaffMember) => {
    setEditingEmail(member.email);
    setEmailInput(member.email);
    setNameInput(member.displayName || '');
    setPresetRole(member.presetRole);
    setPermissions({ ...member.permissions });
    setStatusMsg(null);
  };

  const handleSubmitStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = normalizeEmail(emailInput);
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatusMsg({
        text: isUr ? 'درست Gmail ای میل درج کریں۔' : 'Please enter a valid Gmail address.',
        ok: false
      });
      return;
    }
    if (isOwnerEmail(cleanEmail)) {
      setStatusMsg({
        text: isUr ? 'یہ ای میل اسٹاف لسٹ میں شامل نہیں کی جا سکتی۔' : 'This email cannot be added to branch staff.',
        ok: false
      });
      return;
    }

    setSaving(true);
    setStatusMsg(null);
    try {
      const matchedDir = directoryUsers.find(u => normalizeEmail(u.email) === cleanEmail);
      await upsertBranchStaffMember({
        branch,
        email: cleanEmail,
        displayName: nameInput.trim() || matchedDir?.displayName || cleanEmail.split('@')[0],
        uid: matchedDir?.uid,
        presetRole,
        permissions,
        status: 'active'
      });
      const updated = await fetchBranchStaff(branch.id);
      setStaff(filterStaffRosterExcludingCreator(updated));
      setStatusMsg({
        text: isUr
          ? `${cleanEmail} کو برانچ اسٹاف میں محفوظ کر دیا گیا۔`
          : `Saved ${cleanEmail} to branch staff.`,
        ok: true
      });
      resetForm();
    } catch (err) {
      setStatusMsg({
        text: err instanceof Error ? err.message : 'Failed to save staff member',
        ok: false
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAccess = async (member: BranchStaffMember) => {
    if (normalizeEmail(member.email) === callerEmailClean) return;
    const nextStatus = member.status === 'active' ? 'revoked' : 'active';
    setSaving(true);
    setStatusMsg(null);
    try {
      await setBranchStaffStatus(branch, member.email, nextStatus);
      const updated = await fetchBranchStaff(branch.id);
      setStaff(filterStaffRosterExcludingCreator(updated));
      setStatusMsg({
        text:
          nextStatus === 'active'
            ? isUr
              ? `${member.email} کی رسائی بحال کر دی گئی۔`
              : `Access granted for ${member.email}.`
            : isUr
            ? `${member.email} کی رسائی معطل کر دی گئی۔`
            : `Access revoked for ${member.email}.`,
        ok: true
      });
    } catch (err) {
      setStatusMsg({
        text: err instanceof Error ? err.message : 'Failed updating status',
        ok: false
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteMember) return;
    const targetEmail = pendingDeleteMember.email;
    setPendingDeleteMember(null);
    setSaving(true);
    try {
      await removeBranchStaffMember(branch.id, targetEmail);
      const updated = await fetchBranchStaff(branch.id);
      setStaff(filterStaffRosterExcludingCreator(updated));
      setStatusMsg({
        text: isUr ? `${targetEmail} کو اسٹاف سے ہٹا دیا گیا۔` : `Removed ${targetEmail} from branch.`,
        ok: true
      });
    } catch (err) {
      setStatusMsg({
        text: err instanceof Error ? err.message : 'Failed removing staff member',
        ok: false
      });
    } finally {
      setSaving(false);
    }
  };

  const visibleStaff = filterStaffRosterExcludingCreator(staff);
  const availableDirectory = filterStaffRosterExcludingCreator(directoryUsers);

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-2xl w-full p-4 sm:p-6 shadow-2xl border border-[#ecece0] dark:border-slate-700 max-h-[90vh] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#ecece0] dark:border-slate-700 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1a477a] text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#1a477a] dark:text-slate-100">
                {isUr ? 'برانچ اسٹاف اور رولز مینجمنٹ' : 'Branch Staff & Role Access'}
              </h2>
              <p className="text-xs text-[#6b6b55] dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{isUr ? branch.nameUr : branch.nameEn}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[#f0f0e4] dark:bg-slate-800 hover:bg-[#5a5a40] hover:text-white rounded-full text-[#5a5a40] dark:text-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {statusMsg && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                statusMsg.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {statusMsg.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Signed-in Gmail Directory Quick Picker */}
          {availableDirectory.length > 0 && (
            <div className="p-3 bg-[#fdfbf7] dark:bg-slate-800/60 border border-[#ecece0] dark:border-slate-700 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#4a4a35] dark:text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#8b9d77]" />
                  {isUr
                    ? 'سائن ان شدہ جی میل اکاؤنٹس (منتخب کرنے کیلئے کلک کریں)'
                    : 'Signed-in Gmail Accounts (Click to select)'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    void fetchSignedInDirectoryUsers().then(u =>
                      setDirectoryUsers(filterStaffRosterExcludingCreator(u))
                    )
                  }
                  className="text-[10px] font-bold text-[#1a477a] dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  {isUr ? 'تازہ کریں' : 'Refresh'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {availableDirectory.map(entry => (
                  <button
                    key={entry.email}
                    type="button"
                    onClick={() => handleQuickPickEmail(entry)}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#d6c3b0] dark:border-slate-600 text-[11px] font-mono text-[#1a477a] dark:text-slate-200 hover:bg-[#1a477a] hover:text-white transition-colors cursor-pointer"
                  >
                    {entry.email}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add / Edit Form */}
          <form
            onSubmit={handleSubmitStaff}
            className="p-4 bg-[#fdfbf7] dark:bg-slate-800/50 border border-[#ecece0] dark:border-slate-700 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#4a4a35] dark:text-slate-100 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#8b9d77]" />
                <span>
                  {editingEmail
                    ? isUr
                      ? `ترمیم: ${editingEmail}`
                      : `Editing: ${editingEmail}`
                    : isUr
                    ? 'نیا اسٹاف ممبر شامل کریں'
                    : 'Add Staff Member by Gmail'}
                </span>
              </h3>
              {editingEmail && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  {isUr ? 'منسوخ' : 'Cancel Edit'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-[#6b6b55] dark:text-slate-400 mb-1">
                  {isUr ? 'اسٹاف جی میل *' : 'Staff Gmail *'}
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  disabled={Boolean(editingEmail)}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="staff@gmail.com"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#d6c3b0] dark:border-slate-600 rounded-xl font-mono focus:outline-none focus:border-[#1a477a] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6b6b55] dark:text-slate-400 mb-1">
                  {isUr ? 'شخص کا نام (خوش آمدید نوٹ کیلئے) *' : 'Assigned Person Name (Welcome Note) *'}
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder={isUr ? 'مثلاً علی خان' : 'e.g. Ali Khan'}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-[#d6c3b0] dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#1a477a]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#6b6b55] dark:text-slate-400 mb-1">
                  {isUr ? 'پری سیٹ رول' : 'Preset Role'}
                </label>
                <select
                  value={presetRole}
                  onChange={e => handleRoleChange(e.target.value as BranchPresetRole)}
                  className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-900 border border-[#d6c3b0] dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#1a477a]"
                >
                  {(editingEmail && presetRole === 'branch_owner'
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

            {/* Custom Module Toggles */}
            <div className="pt-1">
              <div className="text-[10px] font-bold text-[#6b6b55] dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                <span>{isUr ? 'ماڈیول اختیارات (حسب ضرورت آن/آف کریں)' : 'Module Permissions (Custom Toggles)'}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PERMISSION_KEYS.map(perm => (
                  <label
                    key={perm.key}
                    className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-[#ecece0] dark:border-slate-700 rounded-xl cursor-pointer text-xs"
                  >
                    <span className="font-medium text-[#3b3b2b] dark:text-slate-200">
                      {isUr ? perm.ur : perm.en}
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(permissions[perm.key])}
                      onChange={() => togglePermission(perm.key)}
                      className="w-4 h-4 accent-[#1a477a] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#1a477a] hover:bg-[#13355c] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {saving
                    ? isUr
                      ? 'محفوظ ہو رہا ہے...'
                      : 'Saving...'
                    : editingEmail
                    ? isUr
                      ? 'تبدیلیاں محفوظ کریں'
                      : 'Update Role & Access'
                    : isUr
                    ? 'اسٹاف شامل کریں و رسائی دیں'
                    : 'Add Staff & Grant Access'}
                </span>
              </button>
            </div>
          </form>

          {/* Current Branch Staff Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#4a4a35] dark:text-slate-200">
                {isUr ? `برانچ اسٹاف فہرست (${visibleStaff.length})` : `Branch Staff List (${visibleStaff.length})`}
              </h3>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-[#8e8e75]">
                {isUr ? 'لوڈ ہو رہا ہے...' : 'Loading staff roster...'}
              </div>
            ) : visibleStaff.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8e8e75] bg-[#fdfbf7] dark:bg-slate-800/40 rounded-2xl border border-dashed border-[#ecece0] dark:border-slate-700">
                {isUr
                  ? 'اس برانچ میں ابھی کوئی اسٹاف شامل نہیں۔ اوپر سے Gmail شامل کریں۔'
                  : 'No staff members assigned yet. Add a signed-in Gmail above.'}
              </div>
            ) : (
              <div className="space-y-2">
                {visibleStaff.map(member => {
                  const isActive = member.status === 'active';
                  const isSelf = normalizeEmail(member.email) === callerEmailClean;
                  const roleLabel =
                    PRESET_ROLE_LABELS[member.presetRole] || PRESET_ROLE_LABELS.viewer;
                  return (
                    <div
                      key={member.email}
                      className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isActive
                          ? 'bg-white dark:bg-slate-800 border-[#ecece0] dark:border-slate-700'
                          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#1a477a] dark:text-slate-100">
                            {member.displayName || member.email.split('@')[0]}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-300 text-[10px] font-bold">
                            {isUr ? roleLabel.ur : roleLabel.en}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isActive ? <ShieldCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {isActive
                              ? isUr
                                ? 'فعال رسائی'
                                : 'Active'
                              : isUr
                              ? 'رسائی معطل'
                              : 'Revoked'}
                          </span>
                        </div>
                        <div dir="ltr" className="text-[11px] font-mono text-[#6b6b55] dark:text-slate-400 truncate">
                          {member.email}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleEditMember(member)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#f0f0e4] hover:bg-[#e2e2d2] text-[#4a4a35] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isUr ? 'ترمیم' : 'Edit'}</span>
                        </button>

                        {!isSelf && (
                          <>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void handleToggleAccess(member)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
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
                              disabled={saving}
                              onClick={() => setPendingDeleteMember(member)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{isUr ? 'حذف' : 'Remove'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#ecece0] dark:border-slate-700 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#4a4a35] text-white rounded-xl text-xs font-bold hover:bg-[#383827] cursor-pointer"
          >
            {isUr ? 'بند کریں' : 'Close'}
          </button>
        </div>

        <ConfirmDialog
          isOpen={Boolean(pendingDeleteMember)}
          lang={lang}
          variant="danger"
          title={isUr ? 'اسٹاف ممبر ہٹائیں' : 'Remove Staff Member'}
          message={
            isUr
              ? `کیا آپ ${pendingDeleteMember?.email} کو اس برانچ کے اسٹاف سے مستقل طور پر ہٹانا چاہتے ہیں؟`
              : `Remove ${pendingDeleteMember?.email} permanently from this branch?`
          }
          confirmLabel={isUr ? 'جی ہاں، ہٹائیں' : 'Remove'}
          onCancel={() => setPendingDeleteMember(null)}
          onConfirm={() => void handleConfirmDelete()}
        />
      </div>
    </div>
  );
};
