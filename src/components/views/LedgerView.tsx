import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Language,
  LedgerAccount,
  LedgerEntry,
  KhataSettings,
  Vehicle,
  Trip
} from '../../types';
import {
  getLedgerAccounts,
  saveOrUpdateLedgerAccount,
  deleteLedgerAccount,
  getAllLedgerEntries,
  getLedgerEntries,
  saveOrUpdateLedgerEntry,
  deleteLedgerEntry,
  restoreLedgerEntry,
  calculateAccountBalance,
  calculateAccountsSummary,
  getKhataSettings,
  saveKhataSettings,
  normalizePakistaniPhone,
  formatPhoneForDisplay,
  evaluateArithmetic,
  generatePinSalt,
  hashPin,
  verifyPin,
  calculateLockoutDuration,
  isPinLocked,
  formatKhataReminderMessage,
  formatAccountStatementWhatsAppMessage,
  exportKhataBackup,
  importKhataBackup,
  getPendingDocumentBalances,
  importPendingDocumentToKhata,
  PendingDocBalance
} from '../../utils/ledgerStorage';
import {
  generateAccountStatementPdf,
  generateAllAccountsSummaryPdf,
  downloadOrSharePdf
} from '../../utils/khataPdf';
import {
  BookOpen,
  Users,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Search,
  Lock,
  KeyRound,
  Download,
  Upload,
  Settings,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Clock,
  FileText,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Delete
} from 'lucide-react';
import { auth } from '../../utils/firebase';
import { GuestSavePromptModal } from '../GuestSavePromptModal';

interface LedgerViewProps {
  lang: Language;
  vehicles?: Vehicle[];
  trips?: Trip[];
  isBiltyAuthorized?: boolean;
  onNavigate?: (tab: string) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  lang,
  vehicles = [],
  trips = [],
  isBiltyAuthorized = false,
  onNavigate
}) => {
  const isUrdu = lang === 'ur';

  // Guest Save Verification Modal State
  const [showGuestSaveModal, setShowGuestSaveModal] = useState<boolean>(false);
  const [pendingGuestSaveAction, setPendingGuestSaveAction] = useState<(() => void) | null>(null);
  const [guestSaveDescription, setGuestSaveDescription] = useState<string>('');

  const triggerGuestSaveCheck = (action: () => void, description?: string) => {
    if (!auth.currentUser) {
      setPendingGuestSaveAction(() => action);
      if (description) setGuestSaveDescription(description);
      setShowGuestSaveModal(true);
      return;
    }
    action();
  };

  // Accounts & Entries State
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([]);
  const [settings, setSettings] = useState<KhataSettings>({});

  // Account Detail View State
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [entriesLimit, setEntriesLimit] = useState<number>(50);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'get' | 'give' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'balance'>('recent');

  // Modals
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<LedgerAccount | null>(null);
  const [showAddEntryModal, setShowAddEntryModal] = useState<'gave' | 'got' | null>(null);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [showReminderModal, setShowReminderModal] = useState<LedgerAccount | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Undo Snackbar State (5 seconds)
  const [undoItem, setUndoItem] = useState<{
    type: 'entry';
    item: LedgerEntry;
    timeoutId: any;
  } | null>(null);

  // Security / PIN Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Pending Documents Banner (for authorised accounts)
  const [pendingDocs, setPendingDocs] = useState<PendingDocBalance[]>([]);
  const [dismissPendingBanner, setDismissPendingBanner] = useState(false);

  // Refresh data from storage
  const reloadData = () => {
    const accs = getLedgerAccounts();
    const ents = getAllLedgerEntries();
    const setts = getKhataSettings();

    setAccounts(accs);
    setAllEntries(ents);
    setSettings(setts);

    if (isBiltyAuthorized) {
      setPendingDocs(getPendingDocumentBalances(isBiltyAuthorized));
    }
  };

  useEffect(() => {
    reloadData();
  }, [isBiltyAuthorized]);

  // Handle PIN Lock Initialization & Auto-Lock on Backgrounding
  useEffect(() => {
    const currSettings = getKhataSettings();
    if (!currSettings.pinHash) {
      setIsUnlocked(true);
      return;
    }

    if (currSettings.pinLockoutUntil && Date.now() < currSettings.pinLockoutUntil) {
      const remainingSec = Math.ceil((currSettings.pinLockoutUntil - Date.now()) / 1000);
      setLockoutRemaining(remainingSec);
    }

    let backgroundTimestamp = 0;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        backgroundTimestamp = Date.now();
      } else {
        if (backgroundTimestamp > 0 && Date.now() - backgroundTimestamp > 30000) {
          const fresh = getKhataSettings();
          if (fresh.pinHash) {
            setIsUnlocked(false);
            setPinInput('');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Handle PIN Submit
  const handlePinSubmit = async (pinAttempt: string) => {
    const currSettings = getKhataSettings();
    if (!currSettings.pinHash || !currSettings.pinSalt) {
      setIsUnlocked(true);
      return;
    }

    if (isPinLocked(currSettings.pinLockoutUntil)) {
      setPinError(isUrdu ? 'کھاتہ لاک ہے۔ برائے مہربانی انتظار کریں۔' : 'Khata is locked. Please wait.');
      return;
    }

    const isMatch = await verifyPin(pinAttempt, currSettings.pinSalt, currSettings.pinHash);
    if (isMatch) {
      saveKhataSettings({ pinFailedAttempts: 0, pinLockoutUntil: 0 });
      setIsUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      const failed = (currSettings.pinFailedAttempts || 0) + 1;
      const lockoutSec = calculateLockoutDuration(failed);
      const lockoutUntil = lockoutSec > 0 ? Date.now() + lockoutSec * 1000 : 0;

      saveKhataSettings({ pinFailedAttempts: failed, pinLockoutUntil: lockoutUntil });
      setPinInput('');

      if (lockoutSec > 0) {
        setLockoutRemaining(lockoutSec);
        setPinError(
          isUrdu
            ? `5 سے زائد غلط کوششیں! کھاتہ ${lockoutSec} سیکنڈ کے لیے لاک ہو گیا ہے۔`
            : `Too many failed attempts! Locked for ${lockoutSec}s.`
        );
      } else {
        setPinError(
          isUrdu
            ? `غلط پن کوڈ! باقی کوششیں: ${5 - failed}`
            : `Incorrect PIN! Attempts remaining: ${5 - failed}`
        );
      }
    }
  };

  // Filtered Accounts - Unified list for all parties & brokers
  const filteredAccounts = useMemo(() => {
    let list = [...accounts];
    const today = new Date().toISOString().split('T')[0];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        a => a.name.toLowerCase().includes(q) || (a.phone && a.phone.includes(q))
      );
    }

    if (filterType !== 'all') {
      list = list.filter(a => {
        const { balance } = calculateAccountBalance(
          a,
          allEntries.filter(e => e.accountId === a.id)
        );
        if (filterType === 'get') return balance > 0;
        if (filterType === 'give') return balance < 0;
        if (filterType === 'overdue') return a.dueDate && a.dueDate <= today && balance > 0;
        return true;
      });
    }

    list.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'balance') {
        const balA = Math.abs(calculateAccountBalance(a, allEntries.filter(e => e.accountId === a.id)).balance);
        const balB = Math.abs(calculateAccountBalance(b, allEntries.filter(e => e.accountId === b.id)).balance);
        return balB - balA;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return list;
  }, [accounts, allEntries, searchQuery, filterType, sortBy]);

  // Overall Accounts Summary across all parties
  const accountsSummary = useMemo(() => {
    return calculateAccountsSummary(accounts, allEntries);
  }, [accounts, allEntries]);

  // Selected Account Object
  const selectedAccount = useMemo(() => {
    if (!selectedAccountId) return null;
    return accounts.find(a => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  // Selected Account Entries
  const selectedAccountEntries = useMemo(() => {
    if (!selectedAccountId) return [];
    return getLedgerEntries(selectedAccountId);
  }, [selectedAccountId, allEntries]);

  // Selected Account Balance Details
  const selectedAccountBalance = useMemo(() => {
    if (!selectedAccount) return { balance: 0, totalGave: 0, totalGot: 0, status: 'settled' as const };
    return calculateAccountBalance(selectedAccount, selectedAccountEntries);
  }, [selectedAccount, selectedAccountEntries]);

  // Date-grouped transactions for Account Detail
  const groupedAccountEntries = useMemo(() => {
    const groups: { date: string; entries: LedgerEntry[] }[] = [];
    const dateMap = new Map<string, LedgerEntry[]>();

    const paged = selectedAccountEntries.slice(0, entriesLimit);
    for (const entry of paged) {
      const list = dateMap.get(entry.date) || [];
      list.push(entry);
      dateMap.set(entry.date, list);
    }

    for (const [date, entries] of dateMap.entries()) {
      groups.push({ date, entries });
    }

    return groups;
  }, [selectedAccountEntries, entriesLimit]);

  // 5-Second Undo Handler
  const triggerUndo = (item: LedgerEntry) => {
    if (undoItem?.timeoutId) clearTimeout(undoItem.timeoutId);

    const timeoutId = setTimeout(() => {
      setUndoItem(null);
    }, 5000);

    setUndoItem({ type: 'entry', item, timeoutId });
  };

  const handleExecuteUndo = () => {
    if (!undoItem) return;
    clearTimeout(undoItem.timeoutId);
    restoreLedgerEntry(undoItem.item);
    setUndoItem(null);
    reloadData();
  };

  // Import All Pending Documents
  const handleImportAllPendingDocs = () => {
    triggerGuestSaveCheck(
      () => {
        for (const docItem of pendingDocs) {
          importPendingDocumentToKhata(docItem);
        }
        setDismissPendingBanner(true);
        reloadData();
      },
      isUrdu
        ? 'دستاویزات کے بقایا جات کھاتہ میں محفوظ کرنے کے لیے گوگل سائن ان کریں تاکہ ڈیٹا فائر بیس کلاؤڈ پر محفوظ رہے۔'
        : 'Sign in with Google to save document balances securely on Firebase Cloud.'
    );
  };

  // ----------------- RENDER: PIN LOCK SCREEN -----------------
  if (!isUnlocked && settings.pinHash) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4 font-serif">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-center font-serif">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white mb-1">
            {isUrdu ? 'کھاتہ پن لاک' : 'Khata PIN Lock'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {isUrdu ? 'محفوظ کھاتہ دیکھنے کے لیے 4 ہندسوں کا پن کوڈ درج کریں' : 'Enter 4-digit PIN to access private ledger'}
          </p>

          <div className="flex justify-center gap-3.5 mb-6">
            {[0, 1, 2, 3].map(idx => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  pinInput.length > idx
                    ? 'bg-emerald-500 border-emerald-500 scale-125'
                    : 'border-slate-300 dark:border-slate-700 bg-transparent'
                }`}
              />
            ))}
          </div>

          {pinError && (
            <div className="mb-4 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-200 dark:border-rose-900/50">
              {pinError}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-6 max-w-[280px] mx-auto select-none">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                type="button"
                disabled={lockoutRemaining > 0}
                onClick={() => {
                  if (pinInput.length < 4) {
                    const next = pinInput + num;
                    setPinInput(next);
                    if (next.length === 4) handlePinSubmit(next);
                  }
                }}
                className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-base sm:text-lg font-bold font-serif text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 active:bg-emerald-100 dark:active:bg-emerald-950 transition-all disabled:opacity-40"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              disabled={lockoutRemaining > 0 || pinInput.length === 0}
              onClick={() => setPinInput('')}
              className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40"
            >
              {isUrdu ? 'صاف' : 'Clear'}
            </button>
            <button
              type="button"
              disabled={lockoutRemaining > 0}
              onClick={() => {
                if (pinInput.length < 4) {
                  const next = pinInput + '0';
                  setPinInput(next);
                  if (next.length === 4) handlePinSubmit(next);
                }
              }}
              className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-base sm:text-lg font-bold font-serif text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40"
            >
              0
            </button>
            <button
              type="button"
              disabled={lockoutRemaining > 0 || pinInput.length === 0}
              onClick={() => setPinInput(prev => prev.slice(0, -1))}
              className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (auth.currentUser) {
                if (window.confirm(isUrdu ? 'گوگل اکاؤنٹ کی تصدیق کے ساتھ پن لاک ختم کریں؟' : 'Reset PIN lock with Google authentication?')) {
                  saveKhataSettings({ pinHash: '', pinSalt: '', pinFailedAttempts: 0, pinLockoutUntil: 0 });
                  setIsUnlocked(true);
                }
              } else {
                if (window.confirm(isUrdu ? 'کیا آپ اس ڈیوائس پر پن لاک غیر فعال کرنا چاہتے ہیں؟' : 'Disable Khata PIN lock on this device?')) {
                  saveKhataSettings({ pinHash: '', pinSalt: '', pinFailedAttempts: 0, pinLockoutUntil: 0 });
                  setIsUnlocked(true);
                }
              }
            }}
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline min-h-[44px] flex items-center justify-center mx-auto"
          >
            {isUrdu ? 'پن کوڈ بھول گئے؟ ری سیٹ کریں' : 'Forgot PIN? Reset Lock'}
          </button>
        </div>
      </div>
    );
  }

  // ----------------- RENDER: ACCOUNT DETAIL VIEW -----------------
  if (selectedAccount) {
    const gaveLabel = isUrdu ? 'آپ نے دیا (دینا / Pay)' : 'You Gave';
    const gotLabel = isUrdu ? 'آپ کو ملا (لینا / Receive)' : 'You Got';

    const hasMoreEntries = selectedAccountEntries.length > entriesLimit;

    const handleShareAccountStatementWhatsApp = (accountToShare: LedgerAccount) => {
      const text = formatAccountStatementWhatsAppMessage(
        accountToShare,
        selectedAccountEntries,
        settings.businessName,
        lang
      );
      const cleanPhone = normalizePakistaniPhone(accountToShare.phone);
      const waUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
        : `https://wa.me/?text=${encodeURIComponent(text)}`;

      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank');
      }
    };

    return (
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 flex flex-col h-[calc(100dvh-4.25rem)] overflow-hidden font-serif">
        {/* Sticky Mobile App Bar */}
        <div className="shrink-0 -mx-2 sm:-mx-4 px-3 sm:px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 mb-2 font-serif">
          <button
            type="button"
            onClick={() => setSelectedAccountId(null)}
            className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold active:scale-95 transition-all font-serif cursor-pointer"
          >
            <ChevronLeft className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
            <span>{isUrdu ? 'لیجر فہرست' : 'Back'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={async () => {
                const { doc, filename } = generateAccountStatementPdf({
                  account: selectedAccount,
                  entries: selectedAccountEntries,
                  businessName: settings.businessName
                });
                await downloadOrSharePdf(doc, filename);
              }}
              title={isUrdu ? 'کھاتہ پی ڈی ایف ڈاؤن لوڈ یا شیئر کریں' : 'Download/Share Statement PDF'}
              className="min-h-[44px] px-3 py-1.5 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">{isUrdu ? 'پی ڈی ایف' : 'PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleShareAccountStatementWhatsApp(selectedAccount)}
              title={isUrdu ? 'کھاتہ اسٹیٹمنٹ واٹس ایپ پر شیئر کریں' : 'Share Account Statement on WhatsApp'}
              className="min-h-[44px] px-3 py-1.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isUrdu ? 'واٹس ایپ شیئر' : 'WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReminderModal(selectedAccount)}
              className="min-h-[44px] px-3 py-1.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>{isUrdu ? 'یاد دہانی' : 'Remind'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Account Content (Hero + Transactions) */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-28 pr-0.5 space-y-3.5 font-serif">
          {/* Hero Account Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm font-serif">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {isUrdu ? 'لیجر کھاتہ' : 'Ledger Party'}
                </span>
                {selectedAccount.dueDate && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isUrdu ? `تاریخ: ${selectedAccount.dueDate}` : `Due: ${selectedAccount.dueDate}`}
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white">
                {selectedAccount.name}
              </h1>
              {selectedAccount.phone && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  📞 {formatPhoneForDisplay(selectedAccount.phone)}
                </p>
              )}
            </div>

            {/* Large Balance Display */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                {selectedAccountBalance.balance > 0
                  ? (isUrdu ? 'آپ کو ملنا ہے (لینا / Receivable)' : "You will get (Receivable)")
                  : selectedAccountBalance.balance < 0
                  ? (isUrdu ? 'آپ کو دینا ہے (دینا / Payable)' : "You will give (Payable)")
                  : (isUrdu ? 'حساب بیباق ہے' : 'Settled Balance')}
              </span>
              <div
                className={`text-lg sm:text-xl font-bold font-serif tracking-tight ${
                  selectedAccountBalance.balance > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : selectedAccountBalance.balance < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                PKR {Math.abs(selectedAccountBalance.balance).toLocaleString('en-US')}
              </div>
            </div>
          </div>

          {/* Quick Edit/Delete Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-400">
              {isUrdu ? `کل اندراجات: ${selectedAccountEntries.length}` : `Entries: ${selectedAccountEntries.length}`}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleShareAccountStatementWhatsApp(selectedAccount)}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-extrabold flex items-center gap-1.5 p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl px-2.5 border border-emerald-200 dark:border-emerald-800 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>{isUrdu ? 'واٹس ایپ اسٹیٹمنٹ' : 'WhatsApp Statement'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(selectedAccount);
                  setShowAddAccountModal(true);
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold p-1.5 cursor-pointer"
              >
                {isUrdu ? 'کھاتہ تبدیل کریں' : 'Edit Party'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(isUrdu ? `کیا آپ واقعی "${selectedAccount.name}" کا کھاتہ حذف کرنا چاہتے ہیں؟` : `Delete party "${selectedAccount.name}"?`)) {
                    deleteLedgerAccount(selectedAccount.id);
                    setSelectedAccountId(null);
                    reloadData();
                  }
                }}
                className="text-rose-600 dark:text-rose-400 font-bold p-1.5 hover:underline cursor-pointer"
              >
                {isUrdu ? 'حذف کریں' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Section Grouped by Date */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              {isUrdu ? 'حساب کتاب و ٹرانزیکشن ہسٹری' : 'Transactions History'}
            </h3>
            <span className="text-xs text-slate-400">
              {isUrdu ? 'حالیہ اندراج اوپر ہے' : 'Latest on top'}
            </span>
          </div>

          {selectedAccountEntries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {isUrdu ? 'ابھی کوئی لین دین درج نہیں ہے' : 'No transactions recorded yet'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isUrdu ? 'نیچے بٹن کے ذریعے لینا یا دینا کا اندراج کریں' : 'Tap the action buttons below to record a credit/debit entry'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedAccountEntries.map(group => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isToday = group.date === todayStr;

                return (
                  <div key={group.date} className="space-y-2">
                    {/* Date Divider Badge */}
                    <div className="flex items-center justify-center">
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        {isToday ? (isUrdu ? 'آج' : 'Today') : group.date}
                      </span>
                    </div>

                    {group.entries.map(entry => {
                      const isGave = entry.type === 'gave';
                      return (
                        <div
                          key={entry.id}
                          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                isGave
                                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              }`}
                            >
                              {isGave ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                                    isGave
                                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  }`}
                                >
                                  {isGave ? (isUrdu ? 'دینا (Gave)' : 'Gave') : (isUrdu ? 'لینا (Got)' : 'Got')}
                                </span>
                              </div>
                              {entry.note && (
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                                  {entry.note}
                                </p>
                              )}
                              {entry.source === 'auto' && (
                                <span className="inline-block text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                                  ⚡ {isUrdu ? 'دستاویز سے منسلک' : 'Auto-linked'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div
                              className={`text-base font-black ${
                                isGave ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {isGave ? '-' : '+'} PKR {entry.amount.toLocaleString('en-US')}
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-1 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingEntry(entry);
                                  setShowAddEntryModal(entry.type);
                                }}
                                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
                              >
                                {isUrdu ? 'تبدیل' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const deleted = deleteLedgerEntry(entry.id);
                                  if (deleted) {
                                    triggerUndo(deleted);
                                    reloadData();
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                              >
                                {isUrdu ? 'حذف' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {hasMoreEntries && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setEntriesLimit(prev => prev + 50)}
                    className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-all cursor-pointer"
                  >
                    {isUrdu ? 'مزید لوڈ کریں (50 مزید)' : 'Load More Entries'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Sticky Bottom Action Bar for Credit/Debit Entry */}
        <div className="fixed bottom-0 left-0 right-0 p-2.5 sm:p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 shadow-2xl pb-[max(env(safe-area-inset-bottom),0.75rem)] font-serif">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setShowAddEntryModal('gave');
              }}
              className="min-h-[46px] sm:min-h-[48px] py-2.5 px-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.97] text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-serif"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isUrdu ? 'دینا (You Gave)' : 'You Gave'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setShowAddEntryModal('got');
              }}
              className="min-h-[46px] sm:min-h-[48px] py-2.5 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer font-serif"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{isUrdu ? 'لینا (You Got)' : 'You Got'}</span>
            </button>
          </div>
        </div>

        {renderEntryModal()}
        {renderReminderModal()}
        {renderUndoSnackbar()}
      </div>
    );
  }

  // ----------------- RENDER: UNIFIED LEDGER MAIN VIEW -----------------
  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 flex flex-col h-[calc(100dvh-4.25rem)] overflow-hidden font-serif">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1.5 pb-1 mb-2 shrink-0 font-serif">
        <div>
          <h1 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
            <span>{isUrdu ? 'لین دین و حساب کتاب (Unified Ledger)' : 'Udhaar & Party Ledger'}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {settings.businessName ? `${settings.businessName} • ` : ''}
            {isUrdu ? 'تمام پارٹیوں اور کھاتہ داروں کی لین دین کا ایک جگہ ریکارڈ' : 'Unified credit & debit management'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={async () => {
              const { doc, filename } = generateAllAccountsSummaryPdf({
                accounts,
                allEntries,
                businessName: settings.businessName
              });
              await downloadOrSharePdf(doc, filename);
            }}
            title={isUrdu ? 'مکمل رپورٹ پی ڈی ایف ڈاؤن لوڈ کریں' : 'Download All Summary PDF'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            title={isUrdu ? 'سیٹنگز، پن لاک اور بیک اپ' : 'Settings, PIN Lock & Backup'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Viewport */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-24 pr-0.5">

      {/* Pending Documents Import Banner */}
      {!dismissPendingBanner && pendingDocs.length > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-3 mb-3.5 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                {isUrdu
                  ? `${pendingDocs.length} دستاویزات کے بقایا جات دستیاب ہیں`
                  : `${pendingDocs.length} pending document balance(s)`}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                {isUrdu ? 'کھاتہ میں شامل کریں' : 'Import receivables into Khata'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleImportAllPendingDocs}
              className="min-h-[38px] px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm active:scale-95 cursor-pointer"
            >
              {isUrdu ? 'شامل کریں' : 'Import'}
            </button>
            <button
              type="button"
              onClick={() => setDismissPendingBanner(true)}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-emerald-700 dark:text-emerald-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards: Total Receivable (ملنا ہے) vs Total Payable (دینا ہے) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3 font-serif">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3 sm:p-3.5 font-serif">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
            {isUrdu ? 'آپ نے لینا ہے (وصولی / ملنا ہے)' : 'You will get (Receivable)'}
          </span>
          <div className="text-base sm:text-lg font-bold font-serif text-emerald-600 dark:text-emerald-400 tracking-tight">
            PKR {accountsSummary.totalWillGet.toLocaleString('en-US')}
          </div>
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3 sm:p-3.5 font-serif">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300 block mb-0.5">
            {isUrdu ? 'آپ نے دینا ہے (واجب الادا / دینا ہے)' : 'You will give (Payable)'}
          </span>
          <div className="text-base sm:text-lg font-bold font-serif text-rose-600 dark:text-rose-400 tracking-tight">
            PKR {accountsSummary.totalWillGive.toLocaleString('en-US')}
          </div>
        </div>
      </div>

      {/* Search Bar & Add Party Button */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'پارٹی کا نام یا فون نمبر تلاش کریں...' : 'Search by party name or phone...'}
            className="w-full pl-9 pr-9 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center absolute right-0 top-0 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAccount(null);
            setShowAddAccountModal(true);
          }}
          className="min-h-[44px] py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? '+ نیا کھاتہ / پارٹی' : '+ Add Party'}</span>
        </button>
      </div>

      {/* Filter Chips & Sort Dropdown */}
      <div className="flex items-center justify-between gap-2 mb-3.5 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isUrdu ? 'تمام' : 'All'}
          </button>

          <button
            type="button"
            onClick={() => setFilterType('get')}
            className={`min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'get'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            {isUrdu ? 'ملنا ہے (لینا)' : "You'll get"}
          </button>

          <button
            type="button"
            onClick={() => setFilterType('give')}
            className={`min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'give'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {isUrdu ? 'دینا ہے (دینا)' : "You'll give"}
          </button>

          <button
            type="button"
            onClick={() => setFilterType('overdue')}
            className={`min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'overdue'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          >
            {isUrdu ? 'واجب الادا' : 'Overdue'}
            {accountsSummary.overdueCount > 0 && ` (${accountsSummary.overdueCount})`}
          </button>
        </div>

        {/* Sort Toggle */}
        <div className="shrink-0 flex items-center gap-1">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            aria-label={isUrdu ? 'کھاتہ جات کی ترتیب' : 'Sort Accounts'}
            className="min-h-[38px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="recent">{isUrdu ? 'حالیہ' : 'Recent'}</option>
            <option value="name">{isUrdu ? 'نام' : 'Name'}</option>
            <option value="balance">{isUrdu ? 'رقم' : 'Balance'}</option>
          </select>
        </div>
      </div>

      {/* Unified Accounts List Rows */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {isUrdu ? 'کوئی کھاتہ یا پارٹی نہیں ملی' : 'No Accounts Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            {isUrdu
              ? 'نیا کھاتہ / پارٹی شامل کریں اور لین دین کا باقاعدہ حساب رکھیں'
              : 'Add a new party or contact to start tracking credit and debit'}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingAccount(null);
              setShowAddAccountModal(true);
            }}
            className="min-h-[44px] py-2.5 px-5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            {isUrdu ? 'نیا کھاتہ شامل کریں' : 'Add Party Account'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAccounts.map(account => {
            const entries = allEntries.filter(e => e.accountId === account.id);
            const { balance } = calculateAccountBalance(account, entries);
            const cleanPhone = formatPhoneForDisplay(account.phone);
            const today = new Date().toISOString().split('T')[0];

            let dueDateBadge = null;
            if (account.dueDate && balance > 0) {
              if (account.dueDate < today) {
                dueDateBadge = (
                  <span className="text-xs px-2 py-0.5 rounded-full font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                    {isUrdu ? 'وقت گزر گیا' : 'Overdue'}
                  </span>
                );
              } else if (account.dueDate === today) {
                dueDateBadge = (
                  <span className="text-xs px-2 py-0.5 rounded-full font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {isUrdu ? 'آج آخری تاریخ' : 'Due Today'}
                  </span>
                );
              } else {
                const days = Math.ceil((new Date(account.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
                dueDateBadge = (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {isUrdu ? `${days} دن باقی` : `${days}d`}
                  </span>
                );
              }
            }

            return (
              <div
                key={account.id}
                onClick={() => {
                  setSelectedAccountId(account.id);
                  setEntriesLimit(50);
                }}
                className="min-h-[64px] bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 shrink-0 text-base shadow-inner">
                    {account.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {account.name}
                      </h4>
                      {dueDateBadge}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      {cleanPhone && <span className="font-medium">📞 {cleanPhone}</span>}
                      <span>•</span>
                      <span>{account.updatedAt.split('T')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2.5">
                  <div>
                    <div
                      className={`text-sm sm:text-base font-black tracking-tight ${
                        balance > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : balance < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      PKR {Math.abs(balance).toLocaleString('en-US')}
                    </div>
                    <span className="text-xs text-slate-400 block font-semibold">
                      {balance > 0
                        ? (isUrdu ? 'ملنا ہے (لینا)' : "You'll get")
                        : balance < 0
                        ? (isUrdu ? 'دینا ہے (دینا)' : "You'll give")
                        : (isUrdu ? 'بیباق' : 'Settled')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setShowReminderModal(account);
                    }}
                    title={isUrdu ? 'یاد دہانی بھیجیں' : 'Send Reminder'}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <ChevronRight className={`w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform ${isUrdu ? 'rotate-180' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-4 sm:hidden z-30">
        <button
          type="button"
          onClick={() => {
            setEditingAccount(null);
            setShowAddAccountModal(true);
          }}
          className="min-h-[52px] px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{isUrdu ? 'نیا کھاتہ' : 'Add Party'}</span>
        </button>
      </div>

      </div>

      {/* RENDER MODALS */}
      {renderAddAccountModal()}
      {renderReminderModal()}
      {renderSettingsModal()}
      {renderUndoSnackbar()}
      {renderGuestSaveModal()}
    </div>
  );

  // ----------------- RENDER: GUEST SAVE VERIFICATION MODAL -----------------
  function renderGuestSaveModal() {
    return (
      <GuestSavePromptModal
        isOpen={showGuestSaveModal}
        onClose={() => {
          setShowGuestSaveModal(false);
          setPendingGuestSaveAction(null);
        }}
        onProceedWithoutAuth={() => {
          if (pendingGuestSaveAction) {
            pendingGuestSaveAction();
            setPendingGuestSaveAction(null);
          }
        }}
        onAuthSuccess={() => {
          if (pendingGuestSaveAction) {
            pendingGuestSaveAction();
            setPendingGuestSaveAction(null);
          }
          reloadData();
        }}
        lang={lang}
        saveDescription={guestSaveDescription}
      />
    );
  }

  // ----------------- RENDER: ADD / EDIT ACCOUNT MODAL -----------------
  function renderAddAccountModal() {
    if (!showAddAccountModal) return null;

    return (
      <AccountFormModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        initialAccount={editingAccount}
        lang={lang}
        existingAccounts={accounts}
        onCheckGuestSave={triggerGuestSaveCheck}
        onSaved={account => {
          setShowAddAccountModal(false);
          reloadData();
          setSelectedAccountId(account.id);
        }}
      />
    );
  }

  // ----------------- RENDER: ADD / EDIT ENTRY MODAL -----------------
  function renderEntryModal() {
    if (!showAddEntryModal || !selectedAccount) return null;

    return (
      <EntryFormModal
        isOpen={Boolean(showAddEntryModal)}
        onClose={() => {
          setShowAddEntryModal(null);
          setEditingEntry(null);
        }}
        type={showAddEntryModal}
        accountId={selectedAccount.id}
        initialEntry={editingEntry}
        lang={lang}
        onCheckGuestSave={triggerGuestSaveCheck}
        onSaved={() => {
          setShowAddEntryModal(null);
          setEditingEntry(null);
          reloadData();
        }}
      />
    );
  }

  // ----------------- RENDER: REMINDER MODAL -----------------
  function renderReminderModal() {
    if (!showReminderModal) return null;

    const entries = allEntries.filter(e => e.accountId === showReminderModal.id);
    const { balance } = calculateAccountBalance(showReminderModal, entries);
    const cleanPhone = normalizePakistaniPhone(showReminderModal.phone);
    const rawPhone = showReminderModal.phone || '';
    const reminderText = formatKhataReminderMessage(
      showReminderModal,
      balance,
      settings.businessName,
      lang
    );

    const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(reminderText)}`
      : `https://wa.me/?text=${encodeURIComponent(reminderText)}`;

    const smsUrl = rawPhone
      ? `sms:${rawPhone}?body=${encodeURIComponent(reminderText)}`
      : null;

    const callUrl = rawPhone ? `tel:${rawPhone}` : null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>{isUrdu ? 'ادائیگی کی یاد دہانی بھیجیں' : 'Send Payment Reminder'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowReminderModal(null)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 mb-3.5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{showReminderModal.name}</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                PKR {Math.abs(balance).toLocaleString('en-US')}
              </span>
            </div>
            {rawPhone && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                📞 {formatPhoneForDisplay(rawPhone)}
              </p>
            )}
          </div>

          <div className="mb-4">
            <span className="text-xs font-bold text-slate-500 block mb-1">
              {isUrdu ? 'پیغام کا متن:' : 'Message Preview:'}
            </span>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line border border-slate-200 dark:border-slate-700 leading-relaxed font-sans max-h-32 overflow-y-auto">
              {reminderText}
            </div>
          </div>

          <div className="space-y-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShowReminderModal(null)}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {cleanPhone
                  ? (isUrdu ? 'واٹس ایپ پر میسج کریں' : 'Send via WhatsApp')
                  : (isUrdu ? 'واٹس ایپ پر شیئر کریں (رابطہ چنیں)' : 'Share via WhatsApp')}
              </span>
            </a>

            {smsUrl && (
              <a
                href={smsUrl}
                onClick={() => setShowReminderModal(null)}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isUrdu ? 'موبائل ایس ایم ایس (SMS) بھیجیں' : 'Send Direct SMS'}</span>
              </a>
            )}

            {callUrl && (
              <a
                href={callUrl}
                onClick={() => setShowReminderModal(null)}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>{isUrdu ? 'براہ راست کال کریں' : 'Direct Phone Call'}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------- RENDER: SETTINGS & BACKUP MODAL -----------------
  function renderSettingsModal() {
    if (!showSettingsModal) return null;

    return (
      <SettingsBackupModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        lang={lang}
        onUpdated={() => {
          reloadData();
        }}
      />
    );
  }

  // ----------------- RENDER: 5-SECOND UNDO SNACKBAR -----------------
  function renderUndoSnackbar() {
    if (!undoItem) return null;

    return (
      <div className="fixed bottom-20 left-3 right-3 max-w-md mx-auto z-50">
        <div className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700 dark:border-slate-300">
          <div className="flex items-center gap-2 text-xs">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            <span>
              {isUrdu ? 'اندراج حذف کر دیا گیا' : 'Entry deleted'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleExecuteUndo}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            {isUrdu ? 'واپس لائیں (Undo)' : 'Undo (5s)'}
          </button>
        </div>
      </div>
    );
  }
};

// =========================================================================
// SUB-COMPONENT: ACCOUNT FORM BOTTOM SHEET (Add / Edit Party Account)
// =========================================================================
interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccount: LedgerAccount | null;
  lang: Language;
  existingAccounts?: LedgerAccount[];
  onSaved: (account: LedgerAccount) => void;
  onCheckGuestSave?: (onProceed: () => void, description?: string) => void;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({
  isOpen,
  onClose,
  initialAccount,
  lang,
  existingAccounts,
  onSaved,
  onCheckGuestSave
}) => {
  const isUrdu = lang === 'ur';

  const [name, setName] = useState(initialAccount?.name || '');
  const [phone, setPhone] = useState(initialAccount?.phone ? formatPhoneForDisplay(initialAccount.phone) : '');
  const [note, setNote] = useState(initialAccount?.note || '');
  const [openingAmount, setOpeningAmount] = useState(
    initialAccount?.openingAmount ? String(initialAccount.openingAmount) : '0'
  );
  const [openingDirection, setOpeningDirection] = useState<'get' | 'give'>(
    initialAccount?.openingDirection || 'get'
  );
  const [dueDate, setDueDate] = useState(initialAccount?.dueDate || '');
  const [phoneError, setPhoneError] = useState('');
  const [showManualContactsCard, setShowManualContactsCard] = useState(false);

  const savedContacts = useMemo(() => {
    if (!existingAccounts) return [];
    return existingAccounts
      .filter(a => a.phone && a.phone.trim().length > 0 && (!initialAccount || a.id !== initialAccount.id))
      .slice(0, 6);
  }, [existingAccounts, initialAccount]);

  const handleContactPicker = async () => {
    setPhoneError('');
    if (typeof navigator !== 'undefined' && 'contacts' in navigator && (navigator as any).contacts?.select) {
      try {
        const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
        if (contacts && contacts[0]) {
          const c = contacts[0];
          if (c.name && c.name[0] && (!name.trim() || name.trim() === '')) {
            setName(c.name[0]);
          }
          if (c.tel && c.tel[0]) {
            const raw = c.tel[0];
            const normalized = normalizePakistaniPhone(raw);
            if (normalized) {
              setPhone(formatPhoneForDisplay(normalized));
            } else {
              setPhone(raw.replace(/[^\d+]/g, ''));
            }
            setPhoneError('');
          }
          setShowManualContactsCard(false);
          return;
        }
      } catch (err) {
        console.warn('Native contact picker cancelled or unsupported:', err);
      }
    }
    setShowManualContactsCard(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let normalizedPhone: string | null = null;
    if (phone.trim()) {
      normalizedPhone = normalizePakistaniPhone(phone);
      if (!normalizedPhone) {
        setPhoneError(isUrdu ? 'درست پاکستانی موبائل نمبر درج کریں (مثال: 03001234567)' : 'Enter valid Pakistani phone (e.g. 03001234567)');
        return;
      }
    }

    const evaluatedOpening = evaluateArithmetic(openingAmount) ?? Number(openingAmount) ?? 0;

    const executeSave = () => {
      const saved = saveOrUpdateLedgerAccount({
        id: initialAccount?.id,
        kind: initialAccount?.kind || 'party',
        name: name.trim(),
        phone: normalizedPhone || '',
        note: note.trim(),
        openingAmount: Math.abs(evaluatedOpening),
        openingDirection,
        dueDate: dueDate || undefined
      });
      onSaved(saved);
    };

    if (onCheckGuestSave) {
      onCheckGuestSave(
        executeSave,
        isUrdu
          ? 'کھاتہ کا نیا اکاؤنٹ فائر بیس کلاؤڈ پر محفوظ کرنے کے لیے گوگل سائن ان کریں۔'
          : 'Sign in with Google to save this ledger account securely on Firebase Cloud.'
      );
    } else {
      executeSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {initialAccount
              ? (isUrdu ? 'کھاتہ تبدیل کریں' : 'Edit Party')
              : (isUrdu ? 'نیا کھاتہ / پارٹی' : 'New Party')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'کھاتہ دار / پارٹی کا نام (لازمی)' : 'Party Name (Required)'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isUrdu ? 'مثال: حاجی اسلم ٹریڈرز' : 'e.g. Haji Aslam Traders'}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'موبائل نمبر (اختیاری - واٹس ایپ)' : 'Phone Number (Optional)'}</span>
              </label>
              <button
                type="button"
                onClick={handleContactPicker}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 text-xs font-black active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? '📱 فون بک سے چنیں' : '📱 Phone Book'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  setPhoneError('');
                }}
                placeholder="03001234567"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              {phone && (
                <button
                  type="button"
                  onClick={() => {
                    setPhone('');
                    setPhoneError('');
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {phoneError && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{phoneError}</p>
            )}
          </div>

          {/* Quick Manual Contact Selector */}
          {showManualContactsCard && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>{isUrdu ? 'فون بک اور فوری نمبر سلیکٹر' : 'Phone Book & Quick Select'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowManualContactsCard(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {savedContacts.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                    {isUrdu ? 'محفوظ کھاتوں سے نمبر منتخب کریں:' : 'Select from Saved Accounts:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-0.5">
                    {savedContacts.map(sc => (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => {
                          if (!name.trim()) setName(sc.name);
                          setPhone(formatPhoneForDisplay(sc.phone));
                          setPhoneError('');
                          setShowManualContactsCard(false);
                        }}
                        className="text-left px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 active:scale-95 transition-all cursor-pointer"
                      >
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{sc.name}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">📞 {formatPhoneForDisplay(sc.phone)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Opening Balance */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'شروع کا بقایا بیلنس (Opening Balance)' : 'Opening Balance (PKR)'}
            </label>
            <input
              type="text"
              value={openingAmount}
              onChange={e => setOpeningAmount(e.target.value)}
              placeholder="0"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Opening Direction */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {isUrdu ? 'شروع کی رقم کی نوعیت' : 'Balance Direction'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOpeningDirection('get')}
                className={`min-h-[44px] py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                  openingDirection === 'get'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUrdu ? 'ملنا ہے (لینا / Get)' : "You will get"}
              </button>
              <button
                type="button"
                onClick={() => setOpeningDirection('give')}
                className={`min-h-[44px] py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
                  openingDirection === 'give'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUrdu ? 'دینا ہے (دینا / Give)' : "You will give"}
              </button>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'ادائیگی کی آخری تاریخ (Due Date - اختیاری)' : 'Payment Due Date (Optional)'}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'نوٹ / تفصیل' : 'Note (Optional)'}
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={isUrdu ? 'تفصیل لکھیں...' : 'Enter note...'}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs active:scale-95 cursor-pointer"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="min-h-[48px] flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
            >
              {isUrdu ? 'محفوظ کریں' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: ENTRY FORM BOTTOM SHEET (Live Arithmetic Toolbar)
// =========================================================================
interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'gave' | 'got';
  accountId: string;
  initialEntry: LedgerEntry | null;
  lang: Language;
  onSaved: (entry: LedgerEntry) => void;
  onCheckGuestSave?: (onProceed: () => void, description?: string) => void;
}

const EntryFormModal: React.FC<EntryFormModalProps> = ({
  isOpen,
  onClose,
  type,
  accountId,
  initialEntry,
  lang,
  onSaved,
  onCheckGuestSave
}) => {
  const isUrdu = lang === 'ur';
  const isGave = type === 'gave';

  const modalTitle = isGave
    ? isUrdu ? 'آپ نے دیا (دینا / Debit)' : 'You Gave'
    : isUrdu ? 'آپ کو ملا (لینا / Credit)' : 'You Got';

  const [amountStr, setAmountStr] = useState(
    initialEntry?.amount ? String(initialEntry.amount) : ''
  );
  const [date, setDate] = useState(
    initialEntry?.date || new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState(initialEntry?.note || '');

  const evaluatedAmount = useMemo(() => {
    return evaluateArithmetic(amountStr);
  }, [amountStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = evaluatedAmount ?? Number(amountStr);
    if (!finalAmount || finalAmount <= 0) return;

    const executeSave = () => {
      const saved = saveOrUpdateLedgerEntry({
        id: initialEntry?.id,
        accountId,
        type,
        amount: finalAmount,
        date,
        note: note.trim()
      });
      onSaved(saved);
    };

    if (onCheckGuestSave) {
      onCheckGuestSave(
        executeSave,
        isUrdu
          ? 'کھاتہ کی رقم کا اندراج فائر بیس کلاؤڈ پر محفوظ کرنے کے لیے گوگل سائن ان کریں۔'
          : 'Sign in with Google to save this ledger transaction securely on Firebase Cloud.'
      );
    } else {
      executeSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-3.5">
          <h3
            className={`text-base sm:text-lg font-black flex items-center gap-2 ${
              isGave ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            {isGave ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
            <span>{modalTitle}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isUrdu ? 'رقم درج کریں' : 'Amount (PKR)'}
              </label>
              {evaluatedAmount !== null && (
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  = PKR {evaluatedAmount.toLocaleString('en-US')}
                </span>
              )}
            </div>

            <input
              type="text"
              required
              autoFocus
              value={amountStr}
              onChange={e => setAmountStr(e.target.value)}
              placeholder="0"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-base sm:text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              {['+', '-', '*', '/'].map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setAmountStr(prev => `${prev} ${op} `)}
                  className="min-h-[36px] min-w-[36px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-sm active:scale-90 transition-transform cursor-pointer"
                >
                  {op}
                </button>
              ))}
              {['+500', '+1000', '+5000'].map(inc => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => {
                    const addVal = parseInt(inc.replace('+', ''), 10);
                    const current = evaluateArithmetic(amountStr) ?? Number(amountStr) ?? 0;
                    setAmountStr(String(current + addVal));
                  }}
                  className="min-h-[36px] px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs active:scale-90 transition-transform whitespace-nowrap cursor-pointer"
                >
                  {inc}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs active:scale-90 cursor-pointer"
              >
                C
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isUrdu ? 'تاریخ' : 'Date'}
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().split('T')[0])}
                  className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 p-0.5 cursor-pointer"
                >
                  {isUrdu ? 'آج' : 'Today'}
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setDate(d.toISOString().split('T')[0]);
                  }}
                  className="text-xs font-extrabold text-slate-500 p-0.5 cursor-pointer"
                >
                  {isUrdu ? 'کل' : 'Yesterday'}
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تفصیل / نوٹ' : 'Description / Note'}
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={isUrdu ? 'تفصیل لکھیں...' : 'Enter note or reference...'}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none mb-2"
            />

            <div className="flex flex-wrap gap-1.5">
              {[
                { ur: 'نقد وصولی', en: 'Cash' },
                { ur: 'آن لائن بینک', en: 'Bank Transfer' },
                { ur: 'ڈیزل خرچہ', en: 'Fuel' },
                { ur: 'کرایہ بیلنس', en: 'Freight' },
                { ur: 'ایڈوانس', en: 'Advance' }
              ].map(tag => (
                <button
                  key={tag.en}
                  type="button"
                  onClick={() => setNote(isUrdu ? tag.ur : tag.en)}
                  className="min-h-[34px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-95 cursor-pointer"
                >
                  {isUrdu ? tag.ur : tag.en}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[50px] flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs active:scale-95 cursor-pointer"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!amountStr.trim() || evaluatedAmount === null || evaluatedAmount <= 0}
              className={`min-h-[50px] flex-1 py-3 rounded-2xl text-white font-extrabold text-xs shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer ${
                isGave ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
            >
              {isUrdu ? 'اندراج محفوظ کریں' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: SETTINGS, PIN LOCK & BACKUP MODAL
// =========================================================================
interface SettingsBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onUpdated: () => void;
}

const SettingsBackupModal: React.FC<SettingsBackupModalProps> = ({
  isOpen,
  onClose,
  lang,
  onUpdated
}) => {
  const isUrdu = lang === 'ur';

  const [settings, setSettings] = useState<KhataSettings>(() => getKhataSettings());
  const [businessName, setBusinessName] = useState(settings.businessName || '');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [backupMessage, setBackupMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveBusinessName = () => {
    saveKhataSettings({ businessName: businessName.trim() });
    onUpdated();
    setBackupMessage(isUrdu ? 'کاروبار کا نام محفوظ ہو گیا' : 'Business name saved');
    setTimeout(() => setBackupMessage(''), 3000);
  };

  const handleSetNewPin = async () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinMessage(isUrdu ? '4 ہندسوں کا پن کوڈ درج کریں' : 'Enter 4-digit numeric PIN');
      return;
    }
    const salt = generatePinSalt();
    const hash = await hashPin(newPin, salt);
    saveKhataSettings({ pinHash: hash, pinSalt: salt, pinFailedAttempts: 0, pinLockoutUntil: 0 });
    setNewPin('');
    setPinMessage(isUrdu ? 'پن کوڈ محفوظ ہو گیا' : 'PIN saved successfully');
    onUpdated();
    setTimeout(() => setPinMessage(''), 3000);
  };

  const handleRemovePin = () => {
    saveKhataSettings({ pinHash: '', pinSalt: '', pinFailedAttempts: 0, pinLockoutUntil: 0 });
    setPinMessage(isUrdu ? 'پن لاک ختم کر دیا گیا' : 'PIN lock removed');
    onUpdated();
    setTimeout(() => setPinMessage(''), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportKhataBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driverdost-khata-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage(isUrdu ? 'بیک اپ فائل ڈاؤن لوڈ ہو گئی' : 'Backup downloaded');
    setTimeout(() => setBackupMessage(''), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      const mode = window.confirm(
        isUrdu
          ? 'کیا آپ موجودہ ریکارڈز میں ضم (Merge) کرنا چاہتے ہیں؟ (OK = Merge, Cancel = Replace)'
          : 'Merge with existing records? (OK = Merge, Cancel = Replace all)'
      )
        ? 'merge'
        : 'replace';

      const res = importKhataBackup(content, mode);
      if (res.success) {
        setBackupMessage(
          isUrdu
            ? `کامیابی! ${res.accountsCount} کھاتے اور ${res.entriesCount} ٹرانزیکشنز بحال ہو گئے۔`
            : `Success! ${res.accountsCount} accounts restored.`
        );
        onUpdated();
      } else {
        setBackupMessage(isUrdu ? `خرابی: ${res.error}` : `Error: ${res.error}`);
      }
      setTimeout(() => setBackupMessage(''), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>{isUrdu ? 'کھاتہ سیٹنگز و بیک اپ' : 'Khata Settings & Security'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Custom Business Name */}
        <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
            {isUrdu ? 'کاروبار یا ٹرانسپورٹ کمپنی کا نام (پی ڈی ایف پر آئے گا)' : 'Business Name (Shown on Statements)'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder={isUrdu ? 'مثال: المدینہ گڈز' : 'e.g. Al-Madina Goods'}
              className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveBusinessName}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs active:scale-95 cursor-pointer"
            >
              {isUrdu ? 'محفوظ' : 'Save'}
            </button>
          </div>
        </div>

        {/* 2. PIN Lock Setup */}
        <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'کھاتہ پن کوڈ پروٹیکشن' : 'Khata PIN Protection'}</span>
            </span>
            {settings.pinHash ? (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60">
                {isUrdu ? 'فعال ہے' : 'Active'}
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {isUrdu ? 'غیر فعال' : 'Disabled'}
              </span>
            )}
          </div>

          <div className="flex gap-2 mb-2">
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder={isUrdu ? '4 ہندسوں کا نیا پن' : '4-digit PIN'}
              className="flex-1 min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-center font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSetNewPin}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs active:scale-95 cursor-pointer"
            >
              {isUrdu ? 'پن سیٹ' : 'Set PIN'}
            </button>
            {settings.pinHash && (
              <button
                type="button"
                onClick={handleRemovePin}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-extrabold text-xs active:scale-95 cursor-pointer"
              >
                {isUrdu ? 'ہٹائیں' : 'Remove'}
              </button>
            )}
          </div>
          {pinMessage && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{pinMessage}</p>
          )}
        </div>

        {/* 3. Export / Import Backup */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
            {isUrdu ? 'کھاتہ بیک اپ اور ڈیٹا بحالی' : 'Data Backup & Restore'}
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isUrdu ? 'بیک اپ ڈاؤن لوڈ' : 'Export JSON'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isUrdu ? 'بیک اپ بحال کریں' : 'Import JSON'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>

          {backupMessage && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{backupMessage}</p>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] py-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-xs active:scale-95 transition-all cursor-pointer"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
