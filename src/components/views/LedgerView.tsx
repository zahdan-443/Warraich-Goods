import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Language,
  LedgerAccount,
  LedgerEntry,
  CashEntry,
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
  getAllCashEntries,
  getCashEntries,
  saveOrUpdateCashEntry,
  deleteCashEntry,
  restoreCashEntry,
  calculateAccountBalance,
  calculateAccountsSummary,
  calculateDayCashSummary,
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
  PendingDocBalance,
  calculateVehicleProfitLoss
} from '../../utils/ledgerStorage';
import {
  generateAccountStatementPdf,
  generateAllAccountsSummaryPdf,
  downloadOrSharePdf
} from '../../utils/khataPdf';
import {
  BookOpen,
  Users,
  Briefcase,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Search,
  DollarSign,
  Calendar,
  Lock,
  Unlock,
  KeyRound,
  Download,
  Upload,
  Settings,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Check,
  AlertCircle,
  Clock,
  Share2,
  FileText,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Delete,
  Calculator,
  Truck,
  Fuel,
  BarChart3
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

  // Active Tab: 'parties' | 'brokers' | 'cashbook' | 'vehiclePnl'
  const [activeTab, setActiveTab] = useState<'parties' | 'brokers' | 'cashbook' | 'vehiclePnl'>('parties');

  // Vehicle P&L Filter States
  const [pnlVehicle, setPnlVehicle] = useState<string>('all');
  const [pnlMonth, setPnlMonth] = useState<string>('all');

  // Guest Save Verification Modal State (Google Sign In prompt for Firebase Cloud backup)
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
  const [cashEntries, setCashEntries] = useState<CashEntry[]>([]);
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
  const [showAddCashModal, setShowAddCashModal] = useState<'in' | 'out' | null>(null);
  const [editingCashEntry, setEditingCashEntry] = useState<CashEntry | null>(null);

  // Undo Snackbar State (5 seconds)
  const [undoItem, setUndoItem] = useState<{
    type: 'entry' | 'cash';
    item: LedgerEntry | CashEntry;
    timeoutId: any;
  } | null>(null);

  // Security / PIN Lock State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Cashbook Date State
  const [selectedCashDate, setSelectedCashDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  // Pending Documents Banner (for authorised accounts)
  const [pendingDocs, setPendingDocs] = useState<PendingDocBalance[]>([]);
  const [dismissPendingBanner, setDismissPendingBanner] = useState(false);

  // Refresh data from storage
  const reloadData = () => {
    const accs = getLedgerAccounts();
    const ents = getAllLedgerEntries();
    const cash = getAllCashEntries();
    const setts = getKhataSettings();

    setAccounts(accs);
    setAllEntries(ents);
    setCashEntries(cash);
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

  // Filtered Accounts
  const currentKind = activeTab === 'parties' ? 'party' : 'broker';
  const filteredAccounts = useMemo(() => {
    if (activeTab === 'cashbook' || activeTab === 'vehiclePnl') return [];

    let list = accounts.filter(a => a.kind === currentKind);
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
  }, [accounts, allEntries, activeTab, currentKind, searchQuery, filterType, sortBy]);

  // Overall Accounts Summary
  const accountsSummary = useMemo(() => {
    const list = accounts.filter(a => a.kind === currentKind);
    return calculateAccountsSummary(list, allEntries);
  }, [accounts, allEntries, currentKind]);

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

  // Cashbook summary for selected date
  const dayCashSummary = useMemo(() => {
    return calculateDayCashSummary(selectedCashDate, cashEntries);
  }, [selectedCashDate, cashEntries]);

  const selectedDayCashList = useMemo(() => {
    return getCashEntries(selectedCashDate);
  }, [selectedCashDate, cashEntries]);

  // 5-Second Undo Handler
  const triggerUndo = (type: 'entry' | 'cash', item: LedgerEntry | CashEntry) => {
    if (undoItem?.timeoutId) clearTimeout(undoItem.timeoutId);

    const timeoutId = setTimeout(() => {
      setUndoItem(null);
    }, 5000);

    setUndoItem({ type, item, timeoutId });
  };

  const handleExecuteUndo = () => {
    if (!undoItem) return;
    clearTimeout(undoItem.timeoutId);
    if (undoItem.type === 'entry') {
      restoreLedgerEntry(undoItem.item as LedgerEntry);
    } else {
      restoreCashEntry(undoItem.item as CashEntry);
    }
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
      <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            {isUrdu ? 'کھاتہ پن لاک' : 'Khata PIN Lock'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {isUrdu ? 'محفوظ کھاتہ دیکھنے کے لیے 4 ہندسوں کا پن کوڈ درج کریں' : 'Enter 4-digit PIN to access private ledger'}
          </p>

          {/* Dots Indicator */}
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

          {/* Touch-Optimized Numeric Keypad (Ergonomic minimum 52px height) */}
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
                className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xl font-black text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 active:bg-emerald-100 dark:active:bg-emerald-950 transition-all disabled:opacity-40"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              disabled={lockoutRemaining > 0 || pinInput.length === 0}
              onClick={() => setPinInput('')}
              className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40"
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
              className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xl font-black text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40"
            >
              0
            </button>
            <button
              type="button"
              disabled={lockoutRemaining > 0 || pinInput.length === 0}
              onClick={() => setPinInput(prev => prev.slice(0, -1))}
              className="h-14 sm:h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Reset Link */}
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
    const isParty = selectedAccount.kind === 'party';
    const gaveLabel = isParty
      ? isUrdu ? 'آپ نے دیا' : 'You Gave'
      : isUrdu ? 'ادائیگی کی' : 'Paid';
    const gotLabel = isParty
      ? isUrdu ? 'آپ کو ملا' : 'You Got'
      : isUrdu ? 'کمیشن واجب الادا' : 'Commission Due';

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
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 flex flex-col h-[calc(100dvh-4.25rem)] overflow-hidden">
        {/* Sticky Mobile App Bar */}
        <div className="shrink-0 -mx-2 sm:-mx-4 px-3 sm:px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            onClick={() => setSelectedAccountId(null)}
            className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold active:scale-95 transition-all"
          >
            <ChevronLeft className={`w-5 h-5 ${isUrdu ? 'rotate-180' : ''}`} />
            <span>{isUrdu ? 'کھاتہ فہرست' : 'Back'}</span>
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
              className="min-h-[44px] px-3 py-1.5 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">{isUrdu ? 'پی ڈی ایف' : 'PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleShareAccountStatementWhatsApp(selectedAccount)}
              title={isUrdu ? 'کھاتہ اسٹیٹمنٹ واٹس ایپ پر شیئر کریں' : 'Share Account Statement on WhatsApp'}
              className="min-h-[44px] px-3 py-1.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isUrdu ? 'واٹس ایپ شیئر' : 'WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReminderModal(selectedAccount)}
              className="min-h-[44px] px-3 py-1.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>{isUrdu ? 'یاد دہانی' : 'Remind'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Account Content (Hero + Transactions) */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-28 pr-0.5 space-y-3.5">
          {/* Hero Account Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {selectedAccount.kind === 'broker' ? (isUrdu ? 'بروکر / کمیشن ایجنٹ' : 'Broker') : (isUrdu ? 'کسٹمر / پارٹی' : 'Party')}
                </span>
                {selectedAccount.dueDate && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isUrdu ? `تاریخ: ${selectedAccount.dueDate}` : `Due: ${selectedAccount.dueDate}`}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {selectedAccount.name}
              </h1>
              {selectedAccount.phone && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  📞 {formatPhoneForDisplay(selectedAccount.phone)}
                </p>
              )}
            </div>

            {/* Large Balance Display */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                {selectedAccountBalance.balance > 0
                  ? (isUrdu ? 'آپ کو ملنا ہے (وصولی)' : "You will get (Receivable)")
                  : selectedAccountBalance.balance < 0
                  ? (isUrdu ? 'آپ کو دینا ہے (واجب الادا)' : "You will give (Payable)")
                  : (isUrdu ? 'حساب بیباق ہے' : 'Settled Balance')}
              </span>
              <div
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
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
              {isUrdu ? `کل ٹرانزیکشنز: ${selectedAccountEntries.length}` : `Entries: ${selectedAccountEntries.length}`}
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleShareAccountStatementWhatsApp(selectedAccount)}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 font-extrabold flex items-center gap-1.5 p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl px-2.5 border border-emerald-200 dark:border-emerald-800 active:scale-95 transition-all"
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
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold p-1.5"
              >
                {isUrdu ? 'کھاتہ تبدیل کریں' : 'Edit Account'}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(isUrdu ? `کیا آپ واقعی "${selectedAccount.name}" کا کھاتہ حذف کرنا چاہتے ہیں؟` : `Delete account "${selectedAccount.name}"?`)) {
                    deleteLedgerAccount(selectedAccount.id);
                    setSelectedAccountId(null);
                    reloadData();
                  }
                }}
                className="text-rose-600 dark:text-rose-400 font-bold p-1.5 hover:underline"
              >
                {isUrdu ? 'کھاتہ حذف کریں' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Section Grouped by Date */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              {isUrdu ? 'لین دین کی تفصیل' : 'Transactions'}
            </h3>
            <span className="text-[11px] text-slate-400">
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
                {isUrdu ? 'نیچے بٹن کے ذریعے رقم کا اندراج کریں' : 'Tap the action buttons below to record an entry'}
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
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
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
                                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-lg ${
                                    isGave
                                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  }`}
                                >
                                  {isGave ? gaveLabel : gotLabel}
                                </span>
                              </div>
                              {entry.note && (
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                                  {entry.note}
                                </p>
                              )}
                              {entry.source === 'auto' && (
                                <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
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
                                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                              >
                                {isUrdu ? 'تبدیل' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const deleted = deleteLedgerEntry(entry.id);
                                  if (deleted) {
                                    triggerUndo('entry', deleted);
                                    reloadData();
                                  }
                                }}
                                className="text-rose-500 hover:text-rose-700 font-semibold"
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
                    className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
                  >
                    {isUrdu ? 'مزید لوڈ کریں (50 مزید)' : 'Load More Entries'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Sticky Tactile Bottom Action Bar with Safe-Area Inset */}
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-30 shadow-2xl pb-[max(env(safe-area-inset-bottom),0.85rem)]">
          <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setShowAddEntryModal('gave');
              }}
              className="min-h-[50px] sm:min-h-[54px] py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.97] text-white font-black text-sm sm:text-base shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-5 h-5" />
              <span>{gaveLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setShowAddEntryModal('got');
              }}
              className="min-h-[50px] sm:min-h-[54px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-5 h-5" />
              <span>{gotLabel}</span>
            </button>
          </div>
        </div>

        {renderEntryModal()}
        {renderReminderModal()}
        {renderUndoSnackbar()}
      </div>
    );
  }

  // ----------------- RENDER: MAIN LIST & TABS -----------------
  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 flex flex-col h-[calc(100dvh-4.25rem)] overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-1.5 pb-1 mb-2 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0" />
            <span>{isUrdu ? 'ڈیجیٹل کھاتہ' : 'Digital Khata'}</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {settings.businessName ? `${settings.businessName} • ` : ''}
            {isUrdu ? 'آف لائن فرسٹ کاروباری حساب کتاب' : 'Offline-first business ledger & cashbook'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {activeTab !== 'cashbook' && activeTab !== 'vehiclePnl' && (
            <button
              type="button"
              onClick={async () => {
                const list = accounts.filter(a => a.kind === currentKind);
                const { doc, filename } = generateAllAccountsSummaryPdf({
                  accounts: list,
                  allEntries,
                  businessName: settings.businessName
                });
                await downloadOrSharePdf(doc, filename);
              }}
              title={isUrdu ? 'مکمل رپورٹ پی ڈی ایف ڈاؤن لوڈ کریں' : 'Download All Accounts Summary PDF'}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            title={isUrdu ? 'کھاتہ سیٹنگز، پن لاک اور بیک اپ' : 'Khata Settings, PIN Lock & Backup'}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs List (Horizontal Swipe & Touch Friendly) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 mb-2.5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('parties')}
          className={`min-h-[44px] shrink-0 min-w-fit py-2 px-4 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'parties'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>👥</span>
          <span>{isUrdu ? 'پارٹیاں' : 'Parties'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brokers')}
          className={`min-h-[44px] shrink-0 min-w-fit py-2 px-4 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'brokers'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🤝</span>
          <span>{isUrdu ? 'بروکرز' : 'Brokers'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cashbook')}
          className={`min-h-[44px] shrink-0 min-w-fit py-2 px-4 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'cashbook'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>💵</span>
          <span>{isUrdu ? 'روزنامچہ' : 'Cashbook'}</span>
        </button>

        {/* 4th Tab: Vehicle P&L (گاڑی نفع و نقصان) */}
        <button
          type="button"
          onClick={() => setActiveTab('vehiclePnl')}
          className={`min-h-[44px] shrink-0 min-w-fit py-2 px-4 rounded-xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'vehiclePnl'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>🚛</span>
          <span>{isUrdu ? 'گاڑی P&L' : 'Vehicle P&L'}</span>
        </button>
      </div>

      {/* Main Scrollable Viewport (Banner + Tab Content) */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-24 pr-0.5">

      {/* Pending Documents Import Banner */}
      {!dismissPendingBanner && pendingDocs.length > 0 && activeTab !== 'cashbook' && activeTab !== 'vehiclePnl' && (
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
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">
                {isUrdu ? 'کھاتہ میں شامل کریں' : 'Import receivables into Khata'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleImportAllPendingDocs}
              className="min-h-[38px] px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
            >
              {isUrdu ? 'شامل کریں' : 'Import'}
            </button>
            <button
              type="button"
              onClick={() => setDismissPendingBanner(true)}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-emerald-700 dark:text-emerald-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: CASHBOOK / VEHICLE P&L / PARTIES & BROKERS */}
      {activeTab === 'cashbook' ? (
        renderCashbookView()
      ) : activeTab === 'vehiclePnl' ? (
        renderVehiclePnlView()
      ) : (
        /* PARTIES & BROKERS TAB CONTENT */
        <>
          {/* Two Prominent Summary Cards (Mobile High-Contrast) */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3.5">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3.5 sm:p-4">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 block mb-0.5">
                {isUrdu ? 'آپ کو ملنا ہے (وصولی)' : 'You will get'}
              </span>
              <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                PKR {accountsSummary.totalWillGet.toLocaleString('en-US')}
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 sm:p-4">
              <span className="text-[11px] sm:text-xs font-bold text-rose-800 dark:text-rose-300 block mb-0.5">
                {isUrdu ? 'آپ کو دینا ہے (واجب الادا)' : 'You will give'}
              </span>
              <div className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                PKR {accountsSummary.totalWillGive.toLocaleString('en-US')}
              </div>
            </div>
          </div>

          {/* Search Bar & Desktop Add Button */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'نام یا فون نمبر تلاش کریں...' : 'Search by name or phone...'}
                className="w-full pl-9 pr-9 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center absolute right-0 top-0 text-slate-400 hover:text-slate-600"
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
              className="hidden sm:flex min-h-[44px] py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{currentKind === 'broker' ? (isUrdu ? 'نیا بروکر' : 'Add Broker') : (isUrdu ? 'نیا کھاتہ' : 'Add Account')}</span>
            </button>
          </div>

          {/* Filter Chips & Sort Dropdown */}
          <div className="flex items-center justify-between gap-2 mb-3.5 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
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
                className={`min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  filterType === 'get'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}
              >
                {isUrdu ? 'ملنا ہے' : "You'll get"}
              </button>

              <button
                type="button"
                onClick={() => setFilterType('give')}
                className={`min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  filterType === 'give'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {isUrdu ? 'دینا ہے' : "You'll give"}
              </button>

              <button
                type="button"
                onClick={() => setFilterType('overdue')}
                className={`min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
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
                className="min-h-[38px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 font-semibold focus:outline-none"
              >
                <option value="recent">{isUrdu ? 'حالیہ' : 'Recent'}</option>
                <option value="name">{isUrdu ? 'نام' : 'Name'}</option>
                <option value="balance">{isUrdu ? 'رقم' : 'Balance'}</option>
              </select>
            </div>
          </div>

          {/* Accounts List Rows */}
          {filteredAccounts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isUrdu ? 'کوئی کھاتہ نہیں ملا' : 'No Accounts Found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                {isUrdu
                  ? 'نیا کھاتہ شامل کریں اور باقاعدہ حساب رکھیں'
                  : 'Add a new party or broker to start tracking balances'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingAccount(null);
                  setShowAddAccountModal(true);
                }}
                className="min-h-[44px] py-2.5 px-5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                {currentKind === 'broker' ? (isUrdu ? 'نیا بروکر شامل کریں' : 'Add Broker') : (isUrdu ? 'نیا کھاتہ شامل کریں' : 'Add Account')}
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
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                        {isUrdu ? 'وقت گزر گیا' : 'Overdue'}
                      </span>
                    );
                  } else if (account.dueDate === today) {
                    dueDateBadge = (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        {isUrdu ? 'آج آخری تاریخ' : 'Due Today'}
                      </span>
                    );
                  } else {
                    const days = Math.ceil((new Date(account.dueDate).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
                    dueDateBadge = (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
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
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {balance > 0
                            ? (isUrdu ? 'ملنا ہے' : "You'll get")
                            : balance < 0
                            ? (isUrdu ? 'دینا ہے' : "You'll give")
                            : (isUrdu ? 'بیباق' : 'Settled')}
                        </span>
                      </div>

                      {/* 44x44px Touch Hitbox for Reminder Button */}
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setShowReminderModal(account);
                        }}
                        title={isUrdu ? 'یاد دہانی بھیجیں' : 'Send Reminder'}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 transition-all"
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

          {/* Mobile Ergonomic Floating Action Button (FAB) */}
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
              <span>{currentKind === 'broker' ? (isUrdu ? 'نیا بروکر' : 'Add Broker') : (isUrdu ? 'نیا کھاتہ' : 'Add Account')}</span>
            </button>
          </div>
        </>
      )}
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

  // ----------------- RENDER: VEHICLE P&L VIEW (گاڑی کا نفع و نقصان) -----------------
  function renderVehiclePnlView() {
    // Unique vehicles from props.vehicles + trips
    const vehicleOptions = Array.from(
      new Set([
        ...vehicles.map(v => v.reg).filter(Boolean),
        ...trips.map(t => (t as any).vehicleNo).filter(Boolean)
      ])
    );

    // Unique months from trips
    const monthOptions = Array.from(
      new Set(trips.map(t => t.month).filter(Boolean))
    );

    const pnl = calculateVehicleProfitLoss(
      pnlVehicle,
      pnlMonth,
      undefined,
      undefined,
      trips
    );

    const profitMargin =
      pnl.totalIncome > 0
        ? ((pnl.netProfit / pnl.totalIncome) * 100).toFixed(1)
        : '0.0';

    const handleSharePnlWhatsApp = () => {
      const vehText = pnlVehicle === 'all' ? (isUrdu ? 'تمام فلیٹ گاڑیاں' : 'All Fleet Vehicles') : pnlVehicle;
      const monthText = pnlMonth === 'all' ? (isUrdu ? 'مکمل ریکارڈ' : 'All Time') : pnlMonth;

      const text =
        `📊 *${isUrdu ? 'گاڑی نفع و نقصان رپورٹ (Vehicle P&L)' : 'Vehicle Profit & Loss Report'}*\n` +
        `🚛 *${isUrdu ? 'گاڑی' : 'Vehicle'}:* ${vehText}\n` +
        `📅 *${isUrdu ? 'مہینہ / مدت' : 'Period'}:* ${monthText}\n` +
        `-------------------------\n` +
        `🟢 *${isUrdu ? 'کل آمدن / کرایہ' : 'Total Revenue'}:* PKR ${pnl.totalIncome.toLocaleString('en-US')}\n` +
        `🔴 *${isUrdu ? 'کل سفر اخراجات' : 'Total Expenses'}:* PKR ${pnl.totalExpenses.toLocaleString('en-US')}\n` +
        `  • ڈیزل (Diesel): PKR ${(pnl.dieselCost || 0).toLocaleString('en-US')}\n` +
        `  • ٹول ٹیکس (Tolls): PKR ${(pnl.tollCost || 0).toLocaleString('en-US')}\n` +
        `  • ڈرائیور خرچہ (Driver): PKR ${(pnl.driverCost || 0).toLocaleString('en-US')}\n` +
        `  • لوڈنگ و دیگر: PKR ${(pnl.otherCost || 0).toLocaleString('en-US')}\n` +
        `-------------------------\n` +
        `${pnl.isProfit ? '🟢 *خالص بچت و منافع (Net Profit):*' : '🔴 *خسارہ / نقصان (Net Loss):*'} PKR ${Math.abs(pnl.netProfit).toLocaleString('en-US')}\n` +
        `📈 *${isUrdu ? 'منافع مارجن' : 'Profit Margin'}:* ${profitMargin}%\n` +
        (pnl.profitPerKm !== 'N/A' ? `🛣️ *${isUrdu ? 'منافع فی کلومیٹر' : 'Profit/KM'}:* Rs ${pnl.profitPerKm} / KM\n` : '') +
        `📝 *${isUrdu ? 'کل مکمل ٹرپس' : 'Total Trips'}:* ${pnl.tripsCount || 0}\n\n` +
        `_ڈرائیور دوست - روڈ فریٹ اور کھاتہ مینجمنٹ_`;

      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    };

    return (
      <div className="space-y-3.5 pb-20 animate-in fade-in duration-200">
        {/* Filters and Controls */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1">
              {/* Vehicle Select */}
              <div className="relative flex-1">
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                  {isUrdu ? 'گاڑی منتخب کریں' : 'Select Vehicle'}
                </label>
                <select
                  value={pnlVehicle}
                  onChange={e => setPnlVehicle(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                >
                  <option value="all">{isUrdu ? '🚛 تمام گاڑیاں (All Fleet)' : '🚛 All Fleet Vehicles'}</option>
                  {vehicleOptions.map(veh => (
                    <option key={veh} value={veh}>
                      🚛 {veh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Select */}
              <div className="relative min-w-[130px]">
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                  {isUrdu ? 'مہینہ / مدت' : 'Select Month'}
                </label>
                <select
                  value={pnlMonth}
                  onChange={e => setPnlMonth(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                >
                  <option value="all">{isUrdu ? '📅 تمام مہینے' : '📅 All Months'}</option>
                  {monthOptions.map(m => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleSharePnlWhatsApp}
                title={isUrdu ? 'واٹس ایپ پر شیئر کریں' : 'Share on WhatsApp'}
                className="min-h-[40px] px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isUrdu ? 'شیئر رپورٹ' : 'Share'}</span>
              </button>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('vehicleAccount')}
                  className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'نیا گاڑی حساب' : 'Add Vehicle Account'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4 Main KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Card 1: Revenue */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {isUrdu ? 'کل کرایہ / آمدن' : 'Total Revenue'}
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              PKR {pnl.totalIncome.toLocaleString('en-US')}
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 block">
              {pnl.tripsCount || 0} {isUrdu ? 'ٹرپس وصولی' : 'trip revenues'}
            </span>
          </div>

          {/* Card 2: Expenses */}
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] sm:text-xs font-bold text-rose-800 dark:text-rose-300">
                {isUrdu ? 'کل آپریشنل اخراجات' : 'Total Expenses'}
              </span>
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              PKR {pnl.totalExpenses.toLocaleString('en-US')}
            </div>
            <span className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5 block">
              {isUrdu ? 'ڈیزل، ٹول و دیگر تمام اخراجات' : 'Diesel, toll & operational'}
            </span>
          </div>

          {/* Card 3: Net Profit / Loss */}
          <div
            className={`border rounded-2xl p-3.5 sm:p-4 ${
              pnl.isProfit
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                : 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] sm:text-xs font-bold opacity-90">
                {pnl.isProfit
                  ? isUrdu
                    ? 'خالص منافع / بچت'
                    : 'Net Profit'
                  : isUrdu
                  ? 'خسارہ / نقصان'
                  : 'Net Loss'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20">
                {profitMargin}%
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-black tracking-tight">
              PKR {Math.abs(pnl.netProfit).toLocaleString('en-US')}
            </div>
            <span className="text-[10px] opacity-85 mt-0.5 block">
              {pnl.isProfit
                ? isUrdu
                  ? 'آمدن اخراجات سے زیادہ ہے'
                  : 'Positive margin'
                : isUrdu
                ? 'اخراجات آمدن سے بڑھ گئے'
                : 'Deficit'}
            </span>
          </div>

          {/* Card 4: Distance & Mileage Performance */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                {isUrdu ? 'کارکردگی و فاصلہ' : 'Performance'}
              </span>
              <Truck className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {pnl.profitPerKm !== 'N/A' ? `Rs ${pnl.profitPerKm} / KM` : `${pnl.totalDistanceKm} KM`}
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              {pnl.totalDistanceKm > 0
                ? `${pnl.totalDistanceKm} ${isUrdu ? 'کل کلومیٹر فاصلہ' : 'Total KM driven'}`
                : isUrdu
                ? `${pnl.tripsCount} مکمل ٹرپس`
                : `${pnl.tripsCount} recorded trips`}
            </span>
          </div>
        </div>

        {/* Expense Breakdown Progress */}
        {pnl.totalExpenses > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mb-2.5 flex items-center justify-between">
              <span>{isUrdu ? 'اخراجات کی تقسیم (Expense Breakdown)' : 'Expense Breakdown'}</span>
              <span className="text-xs font-bold text-slate-400">
                PKR {pnl.totalExpenses.toLocaleString('en-US')}
              </span>
            </h4>

            {/* Visual Multi-Segment Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden mb-3">
              <div
                title="Diesel"
                style={{ width: `${Math.min(100, Math.round(((pnl.dieselCost || 0) / pnl.totalExpenses) * 100))}%` }}
                className="bg-amber-500 h-full"
              />
              <div
                title="Tolls"
                style={{ width: `${Math.min(100, Math.round(((pnl.tollCost || 0) / pnl.totalExpenses) * 100))}%` }}
                className="bg-blue-500 h-full"
              />
              <div
                title="Driver"
                style={{ width: `${Math.min(100, Math.round(((pnl.driverCost || 0) / pnl.totalExpenses) * 100))}%` }}
                className="bg-purple-500 h-full"
              />
              <div
                title="Other"
                style={{ width: `${Math.min(100, Math.round(((pnl.otherCost || 0) / pnl.totalExpenses) * 100))}%` }}
                className="bg-rose-400 h-full"
              />
            </div>

            {/* Breakdown Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block">
                  ⛽ {isUrdu ? 'ڈیزل خرچ' : 'Diesel'}
                </span>
                <span className="font-extrabold text-amber-900 dark:text-amber-200">
                  PKR {(pnl.dieselCost || 0).toLocaleString('en-US')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block">
                  🛣️ {isUrdu ? 'ٹول ٹیکس' : 'Tolls'}
                </span>
                <span className="font-extrabold text-blue-900 dark:text-blue-200">
                  PKR {(pnl.tollCost || 0).toLocaleString('en-US')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
                <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 block">
                  🧑‍✈️ {isUrdu ? 'ڈرائیور خرچہ' : 'Driver'}
                </span>
                <span className="font-extrabold text-purple-900 dark:text-purple-200">
                  PKR {(pnl.driverCost || 0).toLocaleString('en-US')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                <span className="text-[10px] font-bold text-rose-800 dark:text-rose-300 block">
                  📦 {isUrdu ? 'لوڈنگ و دیگر' : 'Other'}
                </span>
                <span className="font-extrabold text-rose-900 dark:text-rose-200">
                  PKR {(pnl.otherCost || 0).toLocaleString('en-US')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Trips / Vehicle Accounts P&L List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'گاڑی حساب اور ٹرپس تاریخ' : 'Vehicle Account & Trip Log'}</span>
            </h4>
            <span className="text-xs text-slate-400 font-bold">
              {pnl.filteredTrips.length} {isUrdu ? 'ریکارڈز' : 'records'}
            </span>
          </div>

          {pnl.filteredTrips.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Truck className="w-7 h-7" />
              </div>
              <h5 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200 mb-1">
                {isUrdu ? 'اس گاڑی کا کوئی حساب درج نہیں' : 'No records found for this vehicle'}
              </h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {isUrdu
                  ? 'گاڑی حساب درج کریں تاکہ آمدن اور اخراجات کا خودکار نفع نقصان یہاں ظاہر ہو۔'
                  : 'Add trip or vehicle accounts to see automatic profit & loss calculations.'}
              </p>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('vehicleAccount')}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isUrdu ? 'گاڑی کا حساب درج کریں' : 'Add Vehicle Account'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {pnl.filteredTrips.map(t => {
                const inc = t.totalIncome || t.expectedIncome || 0;
                const exp = t.total || 0;
                const net = inc - exp;
                const isTripProfitable = net >= 0;

                return (
                  <div
                    key={t.id}
                    className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {t.name || (isUrdu ? 'ٹرپ ریکارڈ' : 'Trip Record')}
                        </span>
                        {(t as any).vehicleNo && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            🚛 {(t as any).vehicleNo}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>📅 {t.date}</span>
                        {t.dist > 0 && <span>• {t.dist} KM</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-[11px] text-slate-500">
                          آمدن: <strong className="text-emerald-600 font-black">+{inc.toLocaleString()}</strong>
                        </span>
                        <span className="text-[11px] text-slate-500">
                          خرچ: <strong className="text-rose-600 font-black">-{exp.toLocaleString()}</strong>
                        </span>
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-black mt-0.5 ${
                          isTripProfitable
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isTripProfitable ? 'نفع: ' : 'خسارہ: '} PKR {Math.abs(net).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------- RENDER: CASHBOOK VIEW -----------------
  function renderCashbookView() {
    return (
      <div className="space-y-3.5">
        {/* Date Selector Navigation (Touch Optimized) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shadow-2xs">
          <button
            type="button"
            onClick={() => {
              const d = new Date(selectedCashDate);
              d.setDate(d.getDate() - 1);
              setSelectedCashDate(d.toISOString().split('T')[0]);
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedCashDate}
              onChange={e => setSelectedCashDate(e.target.value)}
              aria-label={isUrdu ? 'روزنامچہ کی تاریخ منتخب کریں' : 'Select Cashbook Date'}
              className="bg-transparent font-black text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
            />
            {selectedCashDate !== new Date().toISOString().split('T')[0] && (
              <button
                type="button"
                onClick={() => setSelectedCashDate(new Date().toISOString().split('T')[0])}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-extrabold active:scale-95"
              >
                {isUrdu ? 'آج' : 'Today'}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              const d = new Date(selectedCashDate);
              d.setDate(d.getDate() + 1);
              setSelectedCashDate(d.toISOString().split('T')[0]);
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Cash Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[11px] text-slate-500 font-bold block mb-0.5">
                {isUrdu ? 'اوپننگ بیلنس' : 'Opening Cash'}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200">
                PKR {dayCashSummary.openingBalance.toLocaleString('en-US')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">
                {isUrdu ? 'کل کیش ان (+)' : 'Cash In (+)'}
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                + PKR {dayCashSummary.totalIn.toLocaleString('en-US')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30">
              <span className="text-[11px] text-rose-700 dark:text-rose-400 font-bold block mb-0.5">
                {isUrdu ? 'کل کیش آؤٹ (-)' : 'Cash Out (-)'}
              </span>
              <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">
                - PKR {dayCashSummary.totalOut.toLocaleString('en-US')}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold block mb-0.5">
                {isUrdu ? 'کلوزنگ بیلنس' : 'Closing Cash'}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                PKR {dayCashSummary.closingBalance.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          {/* Two Large Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setEditingCashEntry(null);
                setShowAddCashModal('in');
              }}
              className="min-h-[48px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>{isUrdu ? 'کیش ان (آمدن)' : 'Cash In (+)'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingCashEntry(null);
                setShowAddCashModal('out');
              }}
              className="min-h-[48px] py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isUrdu ? 'کیش آؤٹ (خرچہ)' : 'Cash Out (-)'}</span>
            </button>
          </div>
        </div>

        {/* Selected Day Cash Transactions List */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>{isUrdu ? `روزنامچہ اندراج برائے: ${selectedCashDate}` : `Cash Entries for ${selectedCashDate}`}</span>
          </h3>

          {selectedDayCashList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              {isUrdu ? 'آج کے دن کا کوئی کیش اندراج نہیں ہے۔ اوپر بٹن دبا کر اندراج کریں۔' : 'No cash entries for this date. Use Cash In / Cash Out buttons above.'}
            </div>
          ) : (
            <div className="space-y-2">
              {selectedDayCashList.map(entry => {
                const isIn = entry.type === 'in';
                return (
                  <div
                    key={entry.id}
                    className="min-h-[56px] flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIn ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60' : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60'
                        }`}
                      >
                        {isIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                          {entry.category || (isIn ? 'Cash In' : 'Expense')}
                        </span>
                        {entry.note && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-black ${isIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIn ? '+' : '-'} PKR {entry.amount.toLocaleString('en-US')}
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCashEntry(entry);
                            setShowAddCashModal(entry.type);
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold p-1"
                        >
                          {isUrdu ? 'تبدیل' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const deleted = deleteCashEntry(entry.id);
                            if (deleted) {
                              triggerUndo('cash', deleted);
                              reloadData();
                            }
                          }}
                          className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold p-1"
                        >
                          {isUrdu ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {renderCashModal()}
      </div>
    );
  }

  // ----------------- RENDER: ADD / EDIT ACCOUNT MODAL (Bottom Sheet) -----------------
  function renderAddAccountModal() {
    if (!showAddAccountModal) return null;

    return (
      <AccountFormModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        initialAccount={editingAccount}
        kind={currentKind}
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

  // ----------------- RENDER: ADD / EDIT ENTRY MODAL (Bottom Sheet) -----------------
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
        accountKind={selectedAccount.kind}
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

  // ----------------- RENDER: ADD / EDIT CASH MODAL (Bottom Sheet) -----------------
  function renderCashModal() {
    if (!showAddCashModal) return null;

    return (
      <CashFormModal
        isOpen={Boolean(showAddCashModal)}
        onClose={() => {
          setShowAddCashModal(null);
          setEditingCashEntry(null);
        }}
        type={showAddCashModal}
        initialDate={selectedCashDate}
        initialEntry={editingCashEntry}
        lang={lang}
        onCheckGuestSave={triggerGuestSaveCheck}
        onSaved={() => {
          setShowAddCashModal(null);
          setEditingCashEntry(null);
          reloadData();
        }}
      />
    );
  }

  // ----------------- RENDER: MULTI-CHANNEL REMINDER MODAL -----------------
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
          {/* Mobile Bottom Sheet Handle */}
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              <span>{isUrdu ? 'ادائیگی کی یاد دہانی بھیجیں' : 'Send Payment Reminder'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowReminderModal(null)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
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

          {/* Message Preview */}
          <div className="mb-4">
            <span className="text-xs font-bold text-slate-500 block mb-1">
              {isUrdu ? 'پیغام کا متن:' : 'Message Preview:'}
            </span>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line border border-slate-200 dark:border-slate-700 leading-relaxed font-sans max-h-32 overflow-y-auto">
              {reminderText}
            </div>
          </div>

          {/* Three Touch Actions */}
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
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
          >
            {isUrdu ? 'واپس لائیں (Undo)' : 'Undo (5s)'}
          </button>
        </div>
      </div>
    );
  }
};

// =========================================================================
// SUB-COMPONENT: ACCOUNT FORM BOTTOM SHEET (Add / Edit Account)
// =========================================================================
interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAccount: LedgerAccount | null;
  kind: 'party' | 'broker';
  lang: Language;
  existingAccounts?: LedgerAccount[];
  onSaved: (account: LedgerAccount) => void;
  onCheckGuestSave?: (onProceed: () => void, description?: string) => void;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({
  isOpen,
  onClose,
  initialAccount,
  kind,
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
        kind,
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
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {initialAccount
              ? (isUrdu ? 'کھاتہ تبدیل کریں' : 'Edit Account')
              : kind === 'broker'
              ? (isUrdu ? 'نیا بروکر کھاتہ' : 'New Broker Account')
              : (isUrdu ? 'نیا کسٹمر کھاتہ' : 'New Party Account')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'کھاتہ دار / پارٹی کا نام (لازمی)' : 'Account / Party Name (Required)'}
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

          {/* Phone Number Field with Prominent Phone Book Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'موبائل نمبر (اختیاری - واٹس ایپ اور یاد دہانی)' : 'Phone Number (Optional - for WhatsApp & Reminders)'}</span>
              </label>
              <button
                type="button"
                onClick={handleContactPicker}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black active:scale-95 transition-all shadow-2xs"
                title={isUrdu ? 'موبائل کی فون بک سے نمبر چنیں' : 'Pick from mobile phone book'}
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {phoneError && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{phoneError}</p>
            )}
          </div>

          {/* Quick Manual Contact Card / Selector */}
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
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {typeof navigator !== 'undefined' && 'contacts' in navigator && (
                <button
                  type="button"
                  onClick={handleContactPicker}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isUrdu ? 'موبائل فون بک لسٹ کھولیں' : 'Open Device Contacts'}</span>
                </button>
              )}

              {/* Network Prefixes */}
              <div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
                  {isUrdu ? 'پاکستانی موبائل کوڈ چنیں:' : 'Select Network Prefix:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['0300', '0301', '0302', '0312', '0321', '0333', '0345'].map(prefix => (
                    <button
                      key={prefix}
                      type="button"
                      onClick={() => {
                        setPhone(prefix);
                        setShowManualContactsCard(false);
                      }}
                      className="min-h-[32px] px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-300 shadow-2xs active:scale-95"
                    >
                      {prefix}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saved Contacts from Isolated User Store */}
              {savedContacts.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">
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
                        className="text-left px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 active:scale-95 transition-all"
                      >
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{sc.name}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">📞 {formatPhoneForDisplay(sc.phone)}</div>
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
                className={`min-h-[44px] py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                  openingDirection === 'get'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUrdu ? 'ملنا ہے (You will get)' : "You will get"}
              </button>
              <button
                type="button"
                onClick={() => setOpeningDirection('give')}
                className={`min-h-[44px] py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                  openingDirection === 'give'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isUrdu ? 'دینا ہے (You will give)' : "You will give"}
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
              className="min-h-[48px] flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs active:scale-95"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="min-h-[48px] flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 active:scale-95"
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
  accountKind: 'party' | 'broker';
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
  accountKind,
  initialEntry,
  lang,
  onSaved,
  onCheckGuestSave
}) => {
  const isUrdu = lang === 'ur';
  const isParty = accountKind === 'party';
  const isGave = type === 'gave';

  const modalTitle = isParty
    ? isGave
      ? isUrdu ? 'آپ نے دیا (رقم یا سامان)' : 'You Gave'
      : isUrdu ? 'آپ کو ملا (وصولی)' : 'You Got'
    : isGave
    ? isUrdu ? 'ادائیگی کی (کمیشن ادائیگی)' : 'Paid'
    : isUrdu ? 'کمیشن واجب الادا' : 'Commission Due';

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
        {/* Mobile Pull Handle */}
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
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Amount Field with Mobile-Friendly Arithmetic Toolbar */}
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
              className="w-full min-h-[50px] px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xl font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />

            {/* Mobile Calculator Toolbar (Thumb-Friendly arithmetic chips) */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              {['+', '-', '*', '/'].map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setAmountStr(prev => `${prev} ${op} `)}
                  className="min-h-[36px] min-w-[36px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-sm active:scale-90 transition-transform"
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
                  className="min-h-[36px] px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs active:scale-90 transition-transform whitespace-nowrap"
                >
                  {inc}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs active:scale-90"
              >
                C
              </button>
            </div>
          </div>

          {/* Date with Quick Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isUrdu ? 'تاریخ' : 'Date'}
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().split('T')[0])}
                  className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 p-0.5"
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
                  className="text-[11px] font-extrabold text-slate-500 p-0.5"
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

          {/* Note & Quick Tag Chips */}
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

            {/* Quick Note Tags (Mobile Touch friendly) */}
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
                  className="min-h-[34px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 active:scale-95"
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
              className="min-h-[50px] flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs active:scale-95"
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
// SUB-COMPONENT: CASH FORM BOTTOM SHEET (Cashbook In / Out)
// =========================================================================
interface CashFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'in' | 'out';
  initialDate: string;
  initialEntry: CashEntry | null;
  lang: Language;
  onSaved: (entry: CashEntry) => void;
  onCheckGuestSave?: (onProceed: () => void, description?: string) => void;
}

const CashFormModal: React.FC<CashFormModalProps> = ({
  isOpen,
  onClose,
  type,
  initialDate,
  initialEntry,
  lang,
  onSaved,
  onCheckGuestSave
}) => {
  const isUrdu = lang === 'ur';
  const isIn = type === 'in';

  const [amountStr, setAmountStr] = useState(
    initialEntry?.amount ? String(initialEntry.amount) : ''
  );
  const [date, setDate] = useState(initialEntry?.date || initialDate);
  const [category, setCategory] = useState(initialEntry?.category || (isIn ? 'advance' : 'fuel'));
  const [note, setNote] = useState(initialEntry?.note || '');

  const evaluatedAmount = useMemo(() => {
    return evaluateArithmetic(amountStr);
  }, [amountStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = evaluatedAmount ?? Number(amountStr);
    if (!finalAmount || finalAmount <= 0) return;

    const executeSave = () => {
      const saved = saveOrUpdateCashEntry({
        id: initialEntry?.id,
        type,
        amount: finalAmount,
        date,
        category,
        note: note.trim()
      });
      onSaved(saved);
    };

    if (onCheckGuestSave) {
      onCheckGuestSave(
        executeSave,
        isUrdu
          ? 'روزنامچہ کی انٹری فائر بیس کلاؤڈ پر محفوظ کرنے کے لیے گوگل سائن ان کریں۔'
          : 'Sign in with Google to save this cashbook entry securely on Firebase Cloud.'
      );
    } else {
      executeSave();
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'fuel', icon: '⛽', ur: 'ڈیزل', en: 'Fuel' },
    { id: 'toll', icon: '🛣️', ur: 'ٹول', en: 'Toll' },
    { id: 'maintenance', icon: '🔧', ur: 'مرمت', en: 'Repair' },
    { id: 'food', icon: '☕', ur: 'کھانا', en: 'Food' },
    { id: 'kharcha', icon: '👤', ur: 'خرچہ', en: 'Kharcha' },
    { id: 'challan', icon: '📄', ur: 'چالان', en: 'Challan' },
    { id: 'advance', icon: '💸', ur: 'ایڈوانس', en: 'Advance' },
    { id: 'other', icon: '📦', ur: 'دیگر', en: 'Other' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        {/* Mobile Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-3.5">
          <h3
            className={`text-base sm:text-lg font-black flex items-center gap-2 ${
              isIn ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isIn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            <span>{isIn ? (isUrdu ? 'کیش ان (آمدن)' : 'Cash In (+)') : (isUrdu ? 'کیش آؤٹ (خرچہ)' : 'Cash Out (-)')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Amount Field with Calculator Quick Chips */}
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
              className="w-full min-h-[50px] px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xl font-mono font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />

            {/* Quick Math Toolbar */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              {['+', '-', '*', '/'].map(op => (
                <button
                  key={op}
                  type="button"
                  onClick={() => setAmountStr(prev => `${prev} ${op} `)}
                  className="min-h-[36px] min-w-[36px] px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-sm active:scale-90"
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
                  className="min-h-[36px] px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs active:scale-90"
                >
                  {inc}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="min-h-[36px] px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 font-bold text-xs"
              >
                C
              </button>
            </div>
          </div>

          {/* Category Touch Grid (Min 44px Height) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              {isUrdu ? 'کیٹگری منتخب کریں' : 'Select Category'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`min-h-[44px] py-2 px-1.5 rounded-2xl text-xs font-bold flex flex-col items-center justify-center transition-all active:scale-95 ${
                    category === c.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span className="text-[10px] mt-0.5 truncate">{isUrdu ? c.ur : c.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تاریخ' : 'Date'}
            </label>
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
              {isUrdu ? 'تفصیل' : 'Description'}
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={isUrdu ? 'تفصیل لکھیں...' : 'Enter details...'}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[50px] flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs active:scale-95"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!amountStr.trim() || evaluatedAmount === null || evaluatedAmount <= 0}
              className={`min-h-[50px] flex-1 py-3 rounded-2xl text-white font-extrabold text-xs shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer ${
                isIn ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
              }`}
            >
              {isUrdu ? 'محفوظ کریں' : 'Save Cash Entry'}
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
        {/* Mobile Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>{isUrdu ? 'کھاتہ سیٹنگز و بیک اپ' : 'Khata Settings & Security'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600"
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
              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs active:scale-95"
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
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60">
                {isUrdu ? 'فعال ہے' : 'Active'}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
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
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs active:scale-95"
            >
              {isUrdu ? 'پن سیٹ' : 'Set PIN'}
            </button>
            {settings.pinHash && (
              <button
                type="button"
                onClick={handleRemovePin}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 font-extrabold text-xs active:scale-95"
              >
                {isUrdu ? 'ہٹائیں' : 'Remove'}
              </button>
            )}
          </div>
          {pinMessage && (
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{pinMessage}</p>
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
              className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isUrdu ? 'بیک اپ ڈاؤن لوڈ' : 'Export JSON'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
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
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{backupMessage}</p>
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[48px] py-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold text-xs active:scale-95 transition-all"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
