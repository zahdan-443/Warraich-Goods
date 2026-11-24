import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Crown,
  BarChart3,
  Activity,
  RotateCcw,
  Calendar,
  CheckCircle2,
  Milestone,
  Save,
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  Building2,
  Trash2,
  AlertTriangle,
  FileArchive,
  Loader2
} from 'lucide-react';
import {
  Language,
  ActivityLogItem,
  BiltyAttachmentRecord,
  BiltyRecord,
  BranchConfig,
  Trip,
  TollRatesConfig,
  CompanyProfile
} from '../types';
import {
  getActivityLogs,
  logActivity,
  getStoredBilties,
  getStoredTrips,
  exportAllBiltiesCSV,
  exportAllTripsCSV,
  exportFullLocalBackup,
  restoreFullBackupFromJson,
  getStoredCompanyProfile,
  saveCompanyProfileInFirestore,
  DEFAULT_COMPANY_PROFILE
} from '../utils/storage';
import {
  getStoredTollRates,
  saveTollRatesInFirestore,
  resetTollRatesToDefault,
  DEFAULT_TOLL_RATES
} from '../utils/tollMatrix';
import { OWNER_EMAIL, isOwnerEmail } from '../utils/authUtils';
import { getPakistanMonthKey } from '../utils/dateUtils';
import {
  BackupPreviewSummary,
  hasPreRestoreSnapshot,
  hasPreRestoreSnapshotAsync,
  previewCloudBackup,
  previewJsonBackup,
  restoreFromCloudBackup,
  undoLastRestore
} from '../utils/backupService';
import {
  OwnerDeletionQueueItem,
  fetchAllAccountDeletionRequestsForOwner,
  processOwnerDeletionQueueItem
} from '../utils/accountDeletion';
import {
  exportAttachmentsZipBundle,
  getExpiringBiltyAttachmentsSummary
} from '../utils/biltyAttachments';
import { BackupRestoreConfirmModal } from './BackupRestoreConfirmModal';
import { ConfirmDialog } from './ConfirmDialog';
import { OwnerBranchesPanel } from './OwnerBranchesPanel';

interface ManageBiltyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentUserUid?: string | null;
  currentUserEmail?: string | null;
  onUpdated?: (config: { allowedUIDs: string[]; allowedEmails: string[] }) => void;
  activeBranchId?: string | null;
  onSelectActiveBranch?: (branchId: string) => void;
  onBranchesUpdated?: (branches: BranchConfig[]) => void;
}

type PanelTab = 'reports' | 'branches' | 'backup' | 'tollRates' | 'logs' | 'deletions';

export const ManageBiltyAccessModal: React.FC<ManageBiltyAccessModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentUserEmail,
  activeBranchId,
  onSelectActiveBranch,
  onBranchesUpdated
}) => {
  const isOwner = isOwnerEmail(currentUserEmail);

  const [activeTab, setActiveTab] = useState<PanelTab>('reports');

  // Toll Rates State
  const [tollRates, setTollRates] = useState<TollRatesConfig>(DEFAULT_TOLL_RATES);
  const [savingTollRates, setSavingTollRates] = useState(false);
  const [tollSuccessMsg, setTollSuccessMsg] = useState(false);
  const [showResetTollConfirm, setShowResetTollConfirm] = useState(false);

  // Business Reports State
  const [bilties, setBilties] = useState<BiltyRecord[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getPakistanMonthKey());

  // Backup, Settings & Payment Accounts State
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ msg: string; success: boolean } | null>(null);
  const [pendingRestorePreview, setPendingRestorePreview] = useState<BackupPreviewSummary | null>(null);
  const [pendingRestoreJson, setPendingRestoreJson] = useState<string | null>(null);
  const [confirmingRestore, setConfirmingRestore] = useState(false);
  const [undoAvailable, setUndoAvailable] = useState(false);
  const [undoingRestore, setUndoingRestore] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Activity Logs State
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<string>('all');

  // Spark-Tier Owner Account Deletion Queue State
  const [deletionQueue, setDeletionQueue] = useState<OwnerDeletionQueueItem[]>([]);
  const [loadingDeletions, setLoadingDeletions] = useState(false);
  const [processingDeletionId, setProcessingDeletionId] = useState<string | null>(null);
  const [deletionStatusMsg, setDeletionStatusMsg] = useState<{ msg: string; success: boolean } | null>(null);

  // 7-Day Expiring Attachments Warning State (placed strictly before conditional return)
  const [expiringAttachments, setExpiringAttachments] = useState<BiltyAttachmentRecord[]>([]);
  const [exportingExpiringZip, setExportingExpiringZip] = useState(false);
  const [expiringBannerMsg, setExpiringBannerMsg] = useState<string | null>(null);

  const loadDeletionQueueData = async () => {
    setLoadingDeletions(true);
    try {
      const items = await fetchAllAccountDeletionRequestsForOwner();
      setDeletionQueue(items);
    } catch (err) {
      console.warn('Failed loading deletion queue:', err);
    } finally {
      setLoadingDeletions(false);
    }
  };

  const loadLogsData = async () => {
    setLoadingLogs(true);
    try {
      const fetchedLogs = await getActivityLogs();
      setLogs(fetchedLogs);
    } catch (err) {
      console.warn('Failed loading activity logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadInitialData = async () => {
    if (!isOwner) return;

    // Load Toll Rates
    try {
      const rates = await getStoredTollRates();
      setTollRates(rates);
    } catch (err) {
      console.warn('Failed loading toll rates:', err);
    }

    // Load Company & Branch Profile
    try {
      const prof = await getStoredCompanyProfile();
      setCompanyProfile(prof);
    } catch (err) {
      console.warn('Failed loading company profile:', err);
    }

    // Load Operational Data for Reports
    setBilties(getStoredBilties());
    setTrips(getStoredTrips());
    setUndoAvailable(hasPreRestoreSnapshot());
    hasPreRestoreSnapshotAsync().then(setUndoAvailable).catch(() => {});
    getExpiringBiltyAttachmentsSummary()
      .then((summary) => setExpiringAttachments(summary.attachments))
      .catch(() => {});

    // Load Activity Logs & Account Deletion Queue
    loadLogsData();
    loadDeletionQueueData();
  };

  useEffect(() => {
    if (isOpen && isOwner) {
      void loadInitialData();
    }
  }, [isOpen, isOwner]);

  useEffect(() => {
    if (!isOpen || !isOwner) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showResetTollConfirm && !pendingRestorePreview) {
        onClose();
      }
    };
    const handleBackButton = () => {
      if (!showResetTollConfirm && !pendingRestorePreview) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('app-back-button', handleBackButton);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('app-back-button', handleBackButton);
    };
  }, [isOpen, isOwner, showResetTollConfirm, pendingRestorePreview, onClose]);

  // Strictly block and hide confidential owner admin panel from non-owners
  if (!isOpen || !isOwner) {
    return null;
  }


  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await saveCompanyProfileInFirestore(companyProfile);
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3000);
      await logActivity('Company Profile Updated', 'Updated branch contacts & online payment details', 'settings');
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const preview = previewJsonBackup(content);
      setPendingRestoreJson(content);
      setPendingRestorePreview(preview);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpenCloudRestorePreview = async () => {
    const preview = await previewCloudBackup('latestIndex');
    setPendingRestoreJson(null);
    setPendingRestorePreview(preview);
  };

  const handleConfirmPendingRestore = async (mode: 'merge' | 'overwrite') => {
    if (!pendingRestorePreview || !pendingRestorePreview.valid) return;
    setConfirmingRestore(true);
    try {
      if (pendingRestorePreview.source === 'json' && pendingRestoreJson) {
        const res = restoreFullBackupFromJson(pendingRestoreJson, mode);
        if (res.success) {
          setRestoreStatus({ msg: `${res.message} (${res.count} records)`, success: true });
          setBilties(getStoredBilties());
          setTrips(getStoredTrips());
          setUndoAvailable(true);
          hasPreRestoreSnapshotAsync().then(setUndoAvailable).catch(() => {});
        } else {
          setRestoreStatus({ msg: res.message, success: false });
        }
      } else if (pendingRestorePreview.source === 'cloud') {
        const ok = await restoreFromCloudBackup(pendingRestorePreview.backupId || 'latestIndex', mode);
        if (ok) {
          setRestoreStatus({
            msg: `Cloud backup restored (${pendingRestorePreview.totalRecords} records, mode: ${mode})`,
            success: true
          });
          setBilties(getStoredBilties());
          setTrips(getStoredTrips());
          setUndoAvailable(true);
          hasPreRestoreSnapshotAsync().then(setUndoAvailable).catch(() => {});
        } else {
          setRestoreStatus({ msg: 'Cloud backup restore failed — rolled back safely', success: false });
        }
      }
    } finally {
      setConfirmingRestore(false);
      setPendingRestorePreview(null);
      setPendingRestoreJson(null);
    }
  };

  const handleUndoLastRestore = async () => {
    setUndoingRestore(true);
    try {
      const res = await undoLastRestore();
      setRestoreStatus({ msg: res.message, success: res.success });
      if (res.success) {
        setBilties(getStoredBilties());
        setTrips(getStoredTrips());
        setUndoAvailable(false);
        hasPreRestoreSnapshotAsync().then(setUndoAvailable).catch(() => {});
      }
    } finally {
      setUndoingRestore(false);
    }
  };

  const handleExportExpiringAttachmentsZip = async () => {
    if (exportingExpiringZip || expiringAttachments.length === 0) return;
    setExportingExpiringZip(true);
    setExpiringBannerMsg(null);
    try {
      const res = await exportAttachmentsZipBundle(expiringAttachments);
      if (res.success) {
        setExpiringBannerMsg(
          lang === 'ur'
            ? `${res.count} منسلکات کی ZIP کاپی محفوظ ہو گئی۔`
            : `Exported ${res.count} expiring attachment(s) as ZIP.`
        );
      } else {
        setExpiringBannerMsg(res.error || 'ZIP export failed');
      }
    } finally {
      setExportingExpiringZip(false);
    }
  };

  const handleProcessDeletionItem = async (
    item: OwnerDeletionQueueItem,
    action: 'complete' | 'remove'
  ) => {
    setProcessingDeletionId(item.docId);
    setDeletionStatusMsg(null);
    try {
      const res = await processOwnerDeletionQueueItem(item.docId, action, item.userId);
      setDeletionStatusMsg({ msg: res.message, success: res.success });
      if (res.success) {
        await logActivity(
          action === 'complete' ? 'Account Deletion Completed' : 'Deletion Request Removed',
          `${item.userEmail || item.referenceId} (${item.docId})`,
          'auth'
        );
        await loadDeletionQueueData();
      }
    } finally {
      setProcessingDeletionId(null);
    }
  };

  // --- TOLL RATES HANDLERS ---
  const handleSaveTollRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTollRates(true);
    try {
      await saveTollRatesInFirestore(tollRates);
      setTollSuccessMsg(true);
      setTimeout(() => setTollSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save toll rates:', err);
    } finally {
      setSavingTollRates(false);
    }
  };

  const handleConfirmResetTollRates = async () => {
    setShowResetTollConfirm(false);
    const def = await resetTollRatesToDefault();
    setTollRates(def);
    setTollSuccessMsg(true);
    setTimeout(() => setTollSuccessMsg(false), 3000);
  };

  // --- BUSINESS REPORTS CALCULATIONS ---
  const filteredBilties = bilties.filter(b => {
    if (!selectedMonth) return true;
    if (!b.date) return true;
    const lowerDate = b.date.toLowerCase();
    const [selYear, selMonthNum] = selectedMonth.split('-');
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const targetMonthName = monthNames[parseInt(selMonthNum, 10) - 1];
    return lowerDate.includes(selYear) && (lowerDate.includes(targetMonthName) || lowerDate.includes(`-${selMonthNum}-`));
  });

  const totalBiltiesCount = filteredBilties.length;
  const totalFreightRevenue = filteredBilties.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  const totalAdvanceCollected = filteredBilties.reduce((sum, b) => sum + (Number(b.advance) || 0), 0);
  const totalOutstandingPayable = filteredBilties.reduce((sum, b) => sum + (Number(b.payable) || 0), 0);

  const filteredTrips = trips.filter(t => {
    if (!selectedMonth) return true;
    const [selYear, selMonthNum] = selectedMonth.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const targetMonthName = monthNames[parseInt(selMonthNum, 10) - 1];
    return (t.date && t.date.includes(selYear) && t.date.includes(targetMonthName)) || (t.month && t.month.includes(targetMonthName));
  });

  const totalFuelAndTripExpense = filteredTrips.reduce((sum, t) => sum + (Number(t.total) || 0), 0);
  const estimatedNetMargin = totalFreightRevenue - totalFuelAndTripExpense;

  // Filtered Activity Logs
  const filteredLogs = logs.filter(l => {
    if (logFilter === 'all') return true;
    return l.category === logFilter;
  });

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] max-w-3xl w-full p-4 sm:p-7 shadow-2xl border border-[#ecece0] dark:border-slate-700 max-h-[92vh] flex flex-col space-y-4 text-right dir-rtl">
        
        {/* Top Header */}
        <header className="flex justify-between items-center border-b border-[#ecece0] dark:border-slate-700 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#b58b28] to-amber-400 text-white flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#4a4a35] dark:text-slate-100">
                  {lang === 'ur' ? 'آنر کنٹرول پینل (وڑائچ گڈز ایڈمن)' : 'Owner Control Panel'}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-700 font-mono">
                  {OWNER_EMAIL}
                </span>
              </div>
              <p className="text-xs text-[#8e8e75] dark:text-slate-400 mt-0.5 font-sans">
                {lang === 'ur'
                  ? 'ماہانہ کاروباری رپورٹس، کلاؤڈ بیک اپ، ٹول ریٹس اور آڈٹ کنٹرول (صرف مالک کے لیے)'
                  : 'Monthly business reports, encrypted backups, motorway toll tariffs & owner logs'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 bg-[#f0f0e4] dark:bg-slate-800 hover:bg-[#5a5a40] hover:text-white rounded-full text-[#5a5a40] dark:text-slate-200 transition-all cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Clean, Focused Owner Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-[#ecece0] dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] dark:bg-slate-800 text-[#5a5a40] dark:text-slate-200 hover:bg-[#f0f0e4] dark:hover:bg-slate-700 border border-[#ecece0] dark:border-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'ur' ? 'ماہانہ رپورٹ و حساب' : 'Business Reports'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branches')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'branches'
                ? 'bg-[#1a477a] text-white shadow-xs'
                : 'bg-[#fdfbf7] dark:bg-slate-800 text-[#5a5a40] dark:text-slate-200 hover:bg-[#f0f0e4] dark:hover:bg-slate-700 border border-[#ecece0] dark:border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'ur' ? 'برانچز و اسٹاف' : 'Branches & Access'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] dark:bg-slate-800 text-[#5a5a40] dark:text-slate-200 hover:bg-[#f0f0e4] dark:hover:bg-slate-700 border border-[#ecece0] dark:border-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{lang === 'ur' ? 'بیک اپ، ایکسل و برانچز' : 'Backup & Settings'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tollRates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tollRates'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] dark:bg-slate-800 text-[#5a5a40] dark:text-slate-200 hover:bg-[#f0f0e4] dark:hover:bg-slate-700 border border-[#ecece0] dark:border-slate-700'
            }`}
          >
            <Milestone className="w-4 h-4" />
            <span>{lang === 'ur' ? 'موٹروے ٹول ریٹس' : 'Motorway Toll Rates'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] dark:bg-slate-800 text-[#5a5a40] dark:text-slate-200 hover:bg-[#f0f0e4] dark:hover:bg-slate-700 border border-[#ecece0] dark:border-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{lang === 'ur' ? 'سسٹم آڈٹ لاگ' : 'Activity Logs'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('deletions');
              loadDeletionQueueData();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'deletions'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-[#fdfbf7] dark:bg-slate-800 text-[#5a5a40] dark:text-slate-200 hover:bg-[#f0f0e4] dark:hover:bg-slate-700 border border-[#ecece0] dark:border-slate-700'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{lang === 'ur' ? 'اکاؤنٹ ڈیلیٹ قطار' : 'Deletion Queue'}</span>
            {deletionQueue.some(d => d.status === 'pending_deletion') && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-mono font-bold">
                {deletionQueue.filter(d => d.status === 'pending_deletion').length}
              </span>
            )}
          </button>
        </div>

        {/* Gentle 7-Day Expiring Attachments Warning Banner */}
        {(expiringAttachments.length > 0 || expiringBannerMsg) && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                {expiringAttachments.length > 0 && (
                  <div className="font-bold">
                    {expiringAttachments.length} attachments will be deleted soon
                    {lang === 'ur' && (
                      <span className="block text-[11px] font-medium text-amber-800">
                        {expiringAttachments.length} دستاویزات آئندہ 7 دن میں 6 ماہ کی مدت پوری ہونے پر خودکار حذف ہو جائیں گی (محفوظ رکھنے کے لیے ZIP ڈاؤن لوڈ کریں یا Legal Hold لگائیں)۔
                      </span>
                    )}
                  </div>
                )}
                {expiringBannerMsg && (
                  <div className="text-[11px] font-bold text-emerald-800 mt-0.5">{expiringBannerMsg}</div>
                )}
              </div>
            </div>
            {expiringAttachments.length > 0 && (
              <button
                type="button"
                onClick={() => void handleExportExpiringAttachmentsZip()}
                disabled={exportingExpiringZip}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {exportingExpiringZip ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileArchive className="w-3.5 h-3.5" />
                )}
                <span>Export ZIP</span>
              </button>
            )}
          </div>
        )}

        {/* Tab Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[350px]">

          {/* TAB 1: BUSINESS & MONTHLY FINANCIAL REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {/* Month Selector Bar */}
              <div className="flex items-center justify-between p-3 bg-[#fdfbf7] border border-[#ecece0] rounded-2xl">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#8b9d77]" />
                  <span className="text-xs font-bold text-[#4a4a35]">
                    {lang === 'ur' ? 'رپورٹ کا مہینہ منتخب کریں:' : 'Select Month Filter:'}
                  </span>
                </div>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 bg-white border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                />
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                <div className="p-3 rounded-2xl bg-white border border-[#ecece0] shadow-2xs">
                  <span className="text-[10px] text-[#8e8e75] block font-medium">{lang === 'ur' ? 'کل بلٹیاں' : 'Total Bilties'}</span>
                  <span className="text-base font-bold font-mono text-[#4a4a35] mt-0.5 block">{totalBiltiesCount}</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] text-emerald-800 block font-medium">{lang === 'ur' ? 'کل کرایہ (آمدن)' : 'Freight Revenue'}</span>
                  <span className="text-base font-bold font-mono text-emerald-900 mt-0.5 block">
                    Rs {totalFreightRevenue.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-2xs">
                  <span className="text-[10px] text-blue-800 block font-medium">{lang === 'ur' ? 'ایڈوانس وصولی' : 'Advance Paid'}</span>
                  <span className="text-base font-bold font-mono text-blue-900 mt-0.5 block">
                    Rs {totalAdvanceCollected.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-2xs">
                  <span className="text-[10px] text-amber-800 block font-medium">{lang === 'ur' ? 'بقایا جات' : 'Outstanding'}</span>
                  <span className="text-base font-bold font-mono text-amber-900 mt-0.5 block">
                    Rs {totalOutstandingPayable.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-red-50/80 border border-red-200 shadow-2xs">
                  <span className="text-[10px] text-red-800 block font-medium">{lang === 'ur' ? 'سفری و ایندھن خرچ' : 'Trip Expenses'}</span>
                  <span className="text-base font-bold font-mono text-red-900 mt-0.5 block">
                    Rs {totalFuelAndTripExpense.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 shadow-2xs">
                  <span className="text-[10px] text-purple-800 block font-medium">{lang === 'ur' ? 'خالص مارجن' : 'Est. Margin'}</span>
                  <span className={`text-base font-bold font-mono mt-0.5 block ${estimatedNetMargin >= 0 ? 'text-purple-900' : 'text-red-600'}`}>
                    Rs {estimatedNetMargin.toLocaleString('en-US')}
                  </span>
                </div>
              </div>

              {/* Monthly Bilties Table */}
              <div className="bg-white border border-[#ecece0] rounded-2xl overflow-hidden shadow-2xs">
                <div className="p-3 bg-[#fdfbf7] border-b border-[#ecece0] flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xs text-[#4a4a35]">
                    {lang === 'ur' ? 'اس مہینے کی تمام بلٹیوں کی تفصیل' : 'Monthly Bilties Ledger'}
                  </h3>
                  <span className="text-[10px] font-mono text-[#8e8e75]">
                    {filteredBilties.length} {lang === 'ur' ? 'ریکارڈز' : 'records'}
                  </span>
                </div>

                <div className="max-h-[220px] overflow-y-auto">
                  {filteredBilties.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#8e8e75] italic">
                      {lang === 'ur' ? 'اس مہینے کا کوئی بلٹی ریکارڈ موجود نہیں۔' : 'No bilty records found for selected month.'}
                    </div>
                  ) : (
                    <table className="w-full text-right text-xs border-collapse">
                      <thead className="bg-[#f0f0e4]/60 text-[10px] font-bold text-[#5a5a40] sticky top-0">
                        <tr>
                          <th className="p-2 border-b border-[#ecece0]">بلٹی نمبر</th>
                          <th className="p-2 border-b border-[#ecece0]">تاریخ</th>
                          <th className="p-2 border-b border-[#ecece0]">گاڑی</th>
                          <th className="p-2 border-b border-[#ecece0]">روٹ</th>
                          <th className="p-2 border-b border-[#ecece0]">کنسائنر</th>
                          <th className="p-2 border-b border-[#ecece0]">کل کرایہ</th>
                          <th className="p-2 border-b border-[#ecece0]">بقایا</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#ecece0]">
                        {filteredBilties.map((b) => (
                          <tr key={b.id} className="hover:bg-[#fdfbf7] transition-colors font-sans">
                            <td className="p-2 font-mono font-bold text-[#1e3a68]">{b.biltyNo}</td>
                            <td className="p-2 font-mono text-[11px] text-[#8e8e75]">{b.date}</td>
                            <td className="p-2 font-mono font-bold text-[#4a4a35]">{b.vehicleNo}</td>
                            <td className="p-2 text-[#6b6b55]">{b.sendingCity} ➔ {b.receivingCity}</td>
                            <td className="p-2 truncate max-w-[120px]">{b.senderName || b.consignor || '-'}</td>
                            <td className="p-2 font-mono font-bold text-emerald-800">Rs {b.total?.toLocaleString('en-US') || 0}</td>
                            <td className="p-2 font-mono font-bold text-amber-800">Rs {b.payable?.toLocaleString('en-US') || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BRANCHES, ROLES & STAFF ACCESS */}
          {activeTab === 'branches' && (
            <OwnerBranchesPanel
              lang={lang}
              activeBranchId={activeBranchId}
              onSelectActiveBranch={branchId => {
                onSelectActiveBranch?.(branchId);
                setBilties(getStoredBilties());
              }}
              onBranchesUpdated={onBranchesUpdated}
            />
          )}

          {/* TAB 3: BACKUP, EXCEL EXPORT & COMPANY PROFILE */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">
                    {lang === 'ur' ? 'ڈیٹا بیک اپ، ایکسل رپورٹس اور کمپنی پروفائل' : 'Data Backup, Excel Exports & Company Setup'}
                  </h3>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {lang === 'ur' 
                      ? '1-کلک میں تمام بلٹیوں کا ایکسل ڈاؤن لوڈ کریں، فون یا کلاؤڈ کا مکمل بیک اپ محفوظ کریں یا بحال کریں۔'
                      : 'Download all bilties as Excel/CSV, generate complete system backups, or restore data.'}
                  </p>
                </div>
                <Database className="w-7 h-7 text-emerald-600 shrink-0" />
              </div>

              {restoreStatus && (
                <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                  restoreStatus.success ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-rose-100 border-rose-300 text-rose-900'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{restoreStatus.msg}</span>
                </div>
              )}

              {/* SECTION 1: 1-Click Excel / CSV Exports */}
              <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-xs text-[#4a4a35]">
                      {lang === 'ur' ? 'ایکسل (CSV) شیٹس ڈاؤن لوڈ کریں' : 'Instant Excel (CSV) Exports'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#8e8e75]">
                    {bilties.length} Bilties · {trips.length} Trips
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => exportAllBiltiesCSV()}
                    className="p-3 bg-white hover:bg-emerald-50/60 border border-[#ecece0] hover:border-emerald-300 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#4a4a35] group-hover:text-emerald-900">
                        {lang === 'ur' ? 'تمام بلٹیوں کا ایکسل لیجر' : 'Export All Bilties (Excel)'}
                      </div>
                      <div className="text-[10px] text-[#8e8e75] mt-0.5">
                        {lang === 'ur' ? 'تاریخ، گاڑیاں، فریقین اور مکمل رقوم' : 'Complete financial & dispatch ledger'}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-emerald-700 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => exportAllTripsCSV()}
                    className="p-3 bg-white hover:bg-emerald-50/60 border border-[#ecece0] hover:border-emerald-300 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#4a4a35] group-hover:text-emerald-900">
                        {lang === 'ur' ? 'تمام ٹرپس و اخراجات ایکسل' : 'Export All Trips (Excel)'}
                      </div>
                      <div className="text-[10px] text-[#8e8e75] mt-0.5">
                        {lang === 'ur' ? 'ڈیزل، ٹول ٹیکس اور ڈرائیور خرچے' : 'Fuel, tolls & driver trip log'}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-emerald-700 shrink-0" />
                  </button>
                </div>
              </div>

              {/* SECTION 2: Full System Backup & Restore */}
              <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-700" />
                    <h4 className="font-bold text-xs text-[#4a4a35]">
                      {lang === 'ur' ? 'مکمل سسٹم بیک اپ و ڈیٹا بحالی' : 'Full Backup & Restore (JSON)'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-[#8e8e75]">
                    Offline & Cloud
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => exportFullLocalBackup()}
                    className="p-3 bg-white hover:bg-amber-50/60 border border-[#ecece0] hover:border-amber-300 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#4a4a35] group-hover:text-amber-900">
                        {lang === 'ur' ? 'سسٹم بیک اپ ڈاؤن لوڈ کریں' : 'Download Full System Backup'}
                      </div>
                      <div className="text-[10px] text-[#8e8e75] mt-0.5">
                        {lang === 'ur' ? 'سنگل محفوظ فائل برائے کمپیوٹر یا نیا فون' : 'All bilties, trips & settings in 1 file'}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-amber-700 shrink-0" />
                  </button>

                  <div>
                    <input
                      type="file"
                      ref={backupInputRef}
                      accept=".json"
                      onChange={handleRestoreFile}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => backupInputRef.current?.click()}
                      className="w-full p-3 bg-white hover:bg-amber-50/60 border border-[#ecece0] hover:border-amber-300 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#4a4a35] group-hover:text-amber-900">
                          {lang === 'ur' ? 'بیک اپ فائل سے ڈیٹا بحال کریں' : 'Restore from Backup File'}
                        </div>
                        <div className="text-[10px] text-[#8e8e75] mt-0.5">
                          {lang === 'ur' ? 'پہلے سے ڈاؤن لوڈ کی گئی فائل منتخب کریں' : 'Select .json backup file to import'}
                        </div>
                      </div>
                      <Upload className="w-4 h-4 text-amber-700 shrink-0" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenCloudRestorePreview}
                    className="sm:col-span-2 p-3 bg-white hover:bg-emerald-50/60 border border-[#ecece0] hover:border-emerald-300 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#4a4a35] group-hover:text-emerald-900">
                        {lang === 'ur' ? 'کلاؤڈ سنیپ شاٹ سے بحال کریں' : 'Restore from Cloud Snapshot'}
                      </div>
                      <div className="text-[10px] text-[#8e8e75] mt-0.5">
                        {lang === 'ur' ? 'تازہ ترین فائر بیس بیک اپ چیک اور بحال کریں' : 'Preview and restore latest verified Firebase backup'}
                      </div>
                    </div>
                    <Database className="w-4 h-4 text-emerald-700 shrink-0" />
                  </button>

                  {undoAvailable && (
                    <button
                      type="button"
                      disabled={undoingRestore}
                      onClick={handleUndoLastRestore}
                      className="sm:col-span-2 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-right transition-all cursor-pointer flex items-center justify-between group shadow-2xs disabled:opacity-50"
                    >
                      <div>
                        <div className="font-bold text-xs text-amber-950">
                          {lang === 'ur' ? 'آخری بحالی واپس لیں (Undo Restore)' : 'Undo Last Restore (Rollback)'}
                        </div>
                        <div className="text-[10px] text-amber-800 mt-0.5">
                          {lang === 'ur'
                            ? 'بیک اپ بحالی سے فوراً پہلے والا ڈیٹا دوبارہ لوڈ کریں'
                            : 'Restore the snapshot captured right before your previous backup import'}
                        </div>
                      </div>
                      <RotateCcw className="w-4 h-4 text-amber-800 shrink-0" />
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION 3: Warraich Goods Branches & Online Payment Details */}
              <form onSubmit={handleSaveCompanyProfile} className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3">
                <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-bold text-xs text-[#4a4a35]">
                      {lang === 'ur' ? 'وڑائچ گڈز برانچز و کسٹمر آن لائن پیمنٹ سیٹ اپ' : 'Branches & Online Payment Details'}
                    </h4>
                  </div>
                  {profileSuccessMsg && (
                    <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      {lang === 'ur' ? 'کامیابی سے محفوظ ہو گیا!' : 'Saved Successfully!'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#4a4a35]">
                      {lang === 'ur' ? 'رابطہ فون نمبرز:' : 'Contact Phone Numbers:'}
                    </label>
                    <input
                      type="text"
                      value={companyProfile.phoneNumbers || ''}
                      onChange={(e) => setCompanyProfile(prev => ({ ...prev, phoneNumbers: e.target.value }))}
                      placeholder="0300-5370443, 0339-5370443"
                      className="w-full px-3 py-2 bg-white border border-[#ecece0] rounded-xl focus:border-[#8b9d77] outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#4a4a35]">
                      {lang === 'ur' ? 'ہیڈ آفس پتہ (سمندری):' : 'Samundri Head Office:'}
                    </label>
                    <input
                      type="text"
                      value={companyProfile.headOfficeUr || ''}
                      onChange={(e) => setCompanyProfile(prev => ({ ...prev, headOfficeUr: e.target.value }))}
                      placeholder="اوکاڑہ بائی پاس، نزد 466 چوک، سمندری"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#ecece0] dark:border-slate-700 rounded-xl focus:border-[#8b9d77] outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#4a4a35]">
                      {lang === 'ur' ? 'آن لائن ایزی پیسہ اکاؤنٹ نمبر:' : 'EasyPaisa Account Number:'}
                    </label>
                    <input
                      type="text"
                      value={companyProfile.phoneNumbers?.split(',')?.[0] || '0300-5370443'}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 border border-[#ecece0] rounded-xl text-[#6b6b55] font-mono cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#4a4a35]">
                      {lang === 'ur' ? 'این ٹی این (NTN) رجسٹرڈ نمبر:' : 'NTN Registration Number:'}
                    </label>
                    <input
                      type="text"
                      value={companyProfile.ntn || ''}
                      onChange={(e) => setCompanyProfile(prev => ({ ...prev, ntn: e.target.value }))}
                      placeholder="7779394-1"
                      className="w-full px-3 py-2 bg-white border border-[#ecece0] rounded-xl focus:border-[#8b9d77] outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 bg-[#4a5e38] text-white hover:bg-[#3d4e2e] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingProfile ? (lang === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...') : (lang === 'ur' ? 'کمپنی سیٹنگز محفوظ کریں' : 'Save Company Details')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: TOLL RATES & MOTORWAY TARIFFS */}
          {activeTab === 'tollRates' && (
            <form onSubmit={handleSaveTollRates} className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{lang === 'ur' ? 'این ایچ اے موٹروے و ہائی وے ٹول ریٹس شیڈول' : 'NHA Motorway & Highway Toll Schedule'}</h3>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {lang === 'ur'
                      ? 'یہ ریٹس ڈیش بورڈ ٹول کیلکولیٹر میں خودکار طور پر لاگو ہوں گے اور آف لائن بھی کام کریں گے۔'
                      : 'Updated rates apply immediately to the Dashboard Toll Calculator and are cached offline across all devices.'}
                  </p>
                </div>
                <Milestone className="w-7 h-7 text-emerald-600 shrink-0" />
              </div>

              {tollSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{lang === 'ur' ? 'ٹول ٹیکس ریٹس کامیابی سے محفوظ اور کلاؤڈ پر اپڈیٹ ہو گئے!' : 'Toll rates saved and synced to cloud successfully!'}</span>
                </div>
              )}

              {/* Grid of Motorway Tariff Cards */}
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                
                {/* M2 Lahore - Islamabad (Per KM Rate) */}
                <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
                    <span className="font-serif font-bold text-xs text-[#4a4a35]">
                      {tollRates.motorways.M2?.name || 'M2 (Lahore – Islamabad)'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#8b9d77]/20 text-[#4a4a35] font-bold text-[10px]">
                      {lang === 'ur' ? 'فی کلومیٹر ریٹ (PKR / KM)' : 'Per-KM Rate (PKR / KM)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {(['car', 'wagon', 'bus', 'truck', 'articulated'] as const).map(cls => (
                      <div key={`m2-${cls}`} className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#8e8e75] uppercase">
                          {cls === 'car' ? 'Car' : cls === 'wagon' ? 'Wagon' : cls === 'bus' ? 'Bus' : cls === 'truck' ? 'Truck' : 'Trailer'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={tollRates.motorways.M2?.per_km_rate[cls] || 0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setTollRates({
                              ...tollRates,
                              motorways: {
                                ...tollRates.motorways,
                                M2: {
                                  ...tollRates.motorways.M2,
                                  per_km_rate: {
                                    ...tollRates.motorways.M2.per_km_rate,
                                    [cls]: val
                                  }
                                }
                              }
                            });
                          }}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#ecece0] rounded-xl font-mono focus:outline-none focus:border-[#8b9d77]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fixed Route Motorways: M1, M3, M4, M5 */}
                {(['M1', 'M3', 'M4', 'M5'] as const).map(mwKey => {
                  const mw = tollRates.motorways[mwKey];
                  if (!mw) return null;
                  return (
                    <div key={mwKey} className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3">
                      <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
                        <span className="font-serif font-bold text-xs text-[#4a4a35]">
                          {mw.name} ({mw.total_km} km)
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#8b9d77]/20 text-[#4a4a35] font-bold text-[10px]">
                          {lang === 'ur' ? 'مکمل روٹ ٹول (روپے)' : 'Full Route Tariff (PKR)'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {(['car', 'wagon', 'bus', 'truck', 'articulated'] as const).map(cls => (
                          <div key={`${mwKey}-${cls}`} className="space-y-1">
                            <label className="block text-[10px] font-bold text-[#8e8e75] uppercase">
                              {cls === 'car' ? 'Car' : cls === 'wagon' ? 'Wagon' : cls === 'bus' ? 'Bus' : cls === 'truck' ? 'Truck' : 'Trailer'}
                            </label>
                            <input
                              type="number"
                              value={mw.rates[cls] || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setTollRates({
                                  ...tollRates,
                                  motorways: {
                                    ...tollRates.motorways,
                                    [mwKey]: {
                                      ...mw,
                                      rates: {
                                        ...mw.rates,
                                        [cls]: val
                                      }
                                    }
                                  }
                                });
                              }}
                              className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#ecece0] rounded-xl font-mono focus:outline-none focus:border-[#8b9d77]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Highways: N5 GT Road (Per Plaza Rate) */}
                <div className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#ecece0] pb-2">
                    <span className="font-serif font-bold text-xs text-[#4a4a35]">
                      {tollRates.highways.N5?.name || 'N-5 GT Road & National Highway'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#8b9d77]/20 text-[#4a4a35] font-bold text-[10px]">
                      {lang === 'ur' ? 'فی ٹول پلازہ ریٹ (روپے)' : 'Per Plaza Rate (PKR)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {(['car', 'wagon', 'bus', 'truck', 'articulated'] as const).map(cls => (
                      <div key={`n5-${cls}`} className="space-y-1">
                        <label className="block text-[10px] font-bold text-[#8e8e75] uppercase">
                          {cls === 'car' ? 'Car' : cls === 'wagon' ? 'Wagon' : cls === 'bus' ? 'Bus' : cls === 'truck' ? 'Truck' : 'Trailer'}
                        </label>
                        <input
                          type="number"
                          value={tollRates.highways.N5?.per_plaza_rate[cls] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setTollRates({
                              ...tollRates,
                              highways: {
                                ...tollRates.highways,
                                N5: {
                                  ...tollRates.highways.N5,
                                  per_plaza_rate: {
                                    ...tollRates.highways.N5.per_plaza_rate,
                                    [cls]: val
                                  }
                                }
                              }
                            });
                          }}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-[#ecece0] rounded-xl font-mono focus:outline-none focus:border-[#8b9d77]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#ecece0]">
                <button
                  type="button"
                  onClick={() => setShowResetTollConfirm(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ur' ? 'NHA ڈیفالٹ پر بحال کریں' : 'Reset to NHA Defaults'}</span>
                </button>

                <button
                  type="submit"
                  disabled={savingTollRates}
                  className="px-6 py-2.5 bg-[#8b9d77] hover:bg-[#788a65] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingTollRates ? (lang === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...') : (lang === 'ur' ? 'ٹول ریٹس محفوظ کریں' : 'Save Toll Rates')}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SYSTEM AUDIT & ACTIVITY LOG */}
          {activeTab === 'logs' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#4a4a35]">{lang === 'ur' ? 'فلٹر:' : 'Filter:'}</span>
                  <select
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="text-xs px-2.5 py-1 bg-white border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                  >
                    <option value="all">{lang === 'ur' ? 'تمام سرگرمیاں (All)' : 'All Activities'}</option>
                    <option value="bilty">{lang === 'ur' ? 'بلٹی آپریشنز (Bilty)' : 'Bilty Events'}</option>
                    <option value="auth">{lang === 'ur' ? 'لاگ ان سرگرمیاں (Auth)' : 'Auth Events'}</option>
                    <option value="settings">{lang === 'ur' ? 'سیٹنگز تبدیلی (Settings)' : 'Settings'}</option>
                  </select>
                </div>

                <button
                  onClick={loadLogsData}
                  className="px-3 py-1 bg-[#f0f0e4] hover:bg-[#e2e2d5] text-[#5a5a40] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{lang === 'ur' ? 'ریفریش' : 'Refresh'}</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {loadingLogs ? (
                  <div className="p-8 text-center text-xs text-[#8e8e75] italic">
                    {lang === 'ur' ? 'لاگز لوڈ ہو رہے ہیں...' : 'Loading audit trail...'}
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8e8e75] italic bg-[#fdfbf7] rounded-2xl border border-dashed border-[#ecece0]">
                    {lang === 'ur' ? 'ابھی کوئی سرگرمی ریکارڈ نہیں ہوئی۔' : 'No activity logs found.'}
                  </div>
                ) : (
                  filteredLogs.map(item => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-[#ecece0] rounded-2xl flex items-start justify-between gap-3 shadow-2xs hover:border-[#8b9d77] transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-[#8b9d77]/15 text-[#5a5a40] mt-0.5">
                          <Activity className="w-3.5 h-3.5 text-[#8b9d77]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#4a4a35]">{item.action}</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                              {item.category || 'system'}
                            </span>
                          </div>
                          <p className="text-xs text-[#6b6b55] mt-0.5">{item.details}</p>
                          <span className="text-[10px] font-mono text-[#8e8e75] block mt-1">
                            By: {item.email}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-[#8e8e75] shrink-0">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SPARK-TIER OWNER ACCOUNT DELETION QUEUE */}
          {activeTab === 'deletions' && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-rose-50/80 border border-rose-200 rounded-2xl text-xs text-rose-950 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold">
                    {lang === 'ur' ? '30 دن کی اکاؤنٹ ڈیلیٹ درخواستوں کی قطار' : '30-Day Account Deletion Queue'}
                  </h3>
                  <p className="text-[11px] text-rose-900 mt-0.5">
                    {lang === 'ur'
                      ? 'ویب یا ایپ سے موصول شدہ اکاؤنٹ حذف کرنے کی درخواستیں۔ 30 دن مکمل ہونے پر لاگز اور درخواست کو یہاں سے حتمی طور پر صاف کریں۔'
                      : 'Pending and matured deletion requests submitted in-app or via web. Complete cleanup removes shared logs (activity, hazards, crashes) & updates request status.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadDeletionQueueData}
                  className="px-3 py-1.5 bg-white hover:bg-rose-100 border border-rose-200 text-rose-900 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ur' ? 'ریفریش' : 'Refresh'}</span>
                </button>
              </div>

              {deletionStatusMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                    deletionStatusMsg.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{deletionStatusMsg.msg}</span>
                </div>
              )}

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
                {loadingDeletions ? (
                  <div className="p-8 text-center text-xs text-[#8e8e75] italic">
                    {lang === 'ur' ? 'درخواستیں لوڈ ہو رہی ہیں...' : 'Loading deletion queue...'}
                  </div>
                ) : deletionQueue.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8e8e75] italic bg-[#fdfbf7] rounded-2xl border border-dashed border-[#ecece0]">
                    {lang === 'ur' ? 'کوئی اکاؤنٹ ڈیلیٹ درخواست موجود نہیں ہے۔' : 'No account deletion requests in queue.'}
                  </div>
                ) : (
                  deletionQueue.map(item => {
                    const isCompleted = item.status === 'deleted';
                    const isBusy = processingDeletionId === item.docId;
                    return (
                      <div
                        key={item.docId}
                        className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCompleted
                            ? 'bg-slate-50 border-slate-200 opacity-80'
                            : item.isMatured
                            ? 'bg-rose-50/70 border-rose-300'
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="space-y-1 text-right">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-[#4a4a35] font-mono">
                              {item.userEmail || item.userId || item.docId}
                            </span>
                            {isCompleted ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {lang === 'ur' ? 'مکمل' : 'Completed'}
                              </span>
                            ) : item.isMatured ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-200 text-rose-950 border border-rose-300 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {lang === 'ur' ? '30 دن مکمل (واجب العمل)' : 'Matured (>=30d)'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                                {lang === 'ur' ? 'زیر التواء' : 'Pending 30d Window'}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#6b6b55] font-mono">
                            Ref: {item.referenceId} · Source: {item.source || 'app'}
                          </div>
                          <div className="text-[10px] text-[#8e8e75] font-mono">
                            Requested: {item.requestedAt ? item.requestedAt.slice(0, 10) : '-'} · Scheduled:{' '}
                            {item.scheduledFor ? item.scheduledFor.slice(0, 10) : '-'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isCompleted && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleProcessDeletionItem(item, 'complete')}
                              className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold rounded-xl cursor-pointer disabled:opacity-50"
                            >
                              {isBusy
                                ? '...'
                                : lang === 'ur'
                                ? 'لاگز صاف کریں و مکمل'
                                : 'Purge Logs & Complete'}
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleProcessDeletionItem(item, 'remove')}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-bold rounded-xl cursor-pointer disabled:opacity-50"
                          >
                            {lang === 'ur' ? 'قطار سے ہٹائیں' : 'Dismiss'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#ecece0] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-[#8e8e75] font-mono">
              Secure Cloud Synchronized · Warraich Goods
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#4a4a35] text-white rounded-xl font-bold hover:bg-[#383827] transition-all cursor-pointer"
          >
            {lang === 'ur' ? 'بند کریں' : 'Close Panel'}
          </button>
        </div>

        <BackupRestoreConfirmModal
          isOpen={Boolean(pendingRestorePreview)}
          lang={lang}
          preview={pendingRestorePreview}
          confirming={confirmingRestore}
          onCancel={() => {
            setPendingRestorePreview(null);
            setPendingRestoreJson(null);
          }}
          onConfirm={handleConfirmPendingRestore}
        />

        <ConfirmDialog
          isOpen={showResetTollConfirm}
          lang={lang}
          variant="warning"
          title={lang === 'ur' ? 'ٹول ٹیکس ریٹس کی بحالی' : 'Reset Motorway Toll Rates'}
          message={lang === 'ur' ? 'کیا آپ تمام ٹول ٹیکس ریٹس کو NHA کے طے شدہ نرخوں پر بحال کرنا چاہتے ہیں؟' : 'Reset all toll tax tariffs to default NHA rates?'}
          confirmLabel={lang === 'ur' ? 'جی ہاں، بحال کریں' : 'Reset to Defaults'}
          onCancel={() => setShowResetTollConfirm(false)}
          onConfirm={handleConfirmResetTollRates}
        />

      </div>
    </div>
  );
};

