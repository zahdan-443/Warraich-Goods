import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Search, 
  Plus, 
  Crown, 
  BarChart3, 
  Activity, 
  RotateCcw, 
  Calendar, 
  CheckCircle2, 
  Users,
  Milestone,
  Save
} from 'lucide-react';
import { Language, UserProfile, ActivityLogItem, BiltyRecord, Trip, TollRatesConfig } from '../types';
import { 
  getBiltyAccessConfig, 
  updateBiltyAccessInFirestore,
  getAllRegisteredUsers,
  getActivityLogs,
  logActivity,
  getStoredBilties,
  getStoredTrips
} from '../utils/storage';
import { 
  getStoredTollRates, 
  saveTollRatesInFirestore, 
  resetTollRatesToDefault, 
  DEFAULT_TOLL_RATES 
} from '../utils/tollMatrix';

interface ManageBiltyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentUserUid?: string | null;
  onUpdated?: (config: { allowedUIDs: string[]; allowedEmails: string[] }) => void;
}

type PanelTab = 'access' | 'reports' | 'tollRates' | 'logs';

export const ManageBiltyAccessModal: React.FC<ManageBiltyAccessModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentUserUid,
  onUpdated
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('access');

  // Bilty Access State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allowedUIDs, setAllowedUIDs] = useState<string[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualInput, setManualInput] = useState('');

  // Toll Rates State
  const [tollRates, setTollRates] = useState<TollRatesConfig>(DEFAULT_TOLL_RATES);
  const [savingTollRates, setSavingTollRates] = useState(false);
  const [tollSuccessMsg, setTollSuccessMsg] = useState(false);

  // Business Reports State
  const [bilties, setBilties] = useState<BiltyRecord[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Activity Logs State
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    // Load Access Config & Registered Users
    setLoadingUsers(true);
    try {
      const config = await getBiltyAccessConfig();
      setAllowedUIDs(config.allowedUIDs);
      setAllowedEmails(config.allowedEmails);

      const userList = await getAllRegisteredUsers();
      setUsers(userList);
    } catch (err) {
      console.warn("Failed loading access config:", err);
    } finally {
      setLoadingUsers(false);
    }

    // Load Toll Rates
    try {
      const rates = await getStoredTollRates();
      setTollRates(rates);
    } catch (err) {
      console.warn("Failed loading toll rates:", err);
    }

    // Load Operational Data for Reports
    setBilties(getStoredBilties());
    setTrips(getStoredTrips());

    // Load Activity Logs
    loadLogsData();
  };

  const loadLogsData = async () => {
    setLoadingLogs(true);
    try {
      const fetchedLogs = await getActivityLogs();
      setLogs(fetchedLogs);
    } catch (err) {
      console.warn("Failed loading activity logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  if (!isOpen) return null;

  // --- ACCESS TAB HANDLERS ---
  const handleToggleAccess = async (user: UserProfile) => {
    const targetEmail = user.email ? user.email.toLowerCase().trim() : '';
    const targetUid = user.uid;

    let newUIDs = [...allowedUIDs];
    let newEmails = [...allowedEmails];

    const isUidAuth = targetUid ? newUIDs.includes(targetUid) : false;
    const isEmailAuth = targetEmail ? newEmails.map(e => e.toLowerCase().trim()).includes(targetEmail) : false;

    if (isUidAuth || isEmailAuth) {
      if (targetUid) {
        newUIDs = newUIDs.filter(id => id !== targetUid);
      }
      if (targetEmail) {
        newEmails = newEmails.filter(e => e.toLowerCase().trim() !== targetEmail);
      }
      await logActivity('Bilty Access Revoked', `Revoked access for ${user.name} (${user.email || targetUid})`, 'bilty');
    } else {
      if (targetUid && !newUIDs.includes(targetUid)) {
        newUIDs.push(targetUid);
      }
      if (targetEmail && !newEmails.map(e => e.toLowerCase().trim()).includes(targetEmail)) {
        newEmails.push(targetEmail);
      }
      await logActivity('Bilty Access Granted', `Granted bilty creation permission to ${user.name} (${user.email || targetUid})`, 'bilty');
    }

    setAllowedUIDs(newUIDs);
    setAllowedEmails(newEmails);
    await updateBiltyAccessInFirestore(newUIDs, newEmails);
    if (onUpdated) {
      onUpdated({ allowedUIDs: newUIDs, allowedEmails: newEmails });
    }
  };

  const handleAddManualInput = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputVal = manualInput.trim();
    if (!inputVal) return;

    const newUIDs = [...allowedUIDs];
    const newEmails = [...allowedEmails];

    if (inputVal.includes('@')) {
      const emailToAdd = inputVal.toLowerCase().trim();
      if (!newEmails.map(e => e.toLowerCase().trim()).includes(emailToAdd)) {
        newEmails.push(emailToAdd);
      }
      if (!users.some(u => u.email?.toLowerCase().trim() === emailToAdd)) {
        setUsers(prev => [...prev, {
          uid: `email_${Date.now()}`,
          name: emailToAdd.split('@')[0],
          email: emailToAdd,
          role: 'driver'
        }]);
      }
      await logActivity('Manual Email Authorized', `Added ${emailToAdd} to authorized bilty list`, 'bilty');
    } else {
      const uidToAdd = inputVal;
      if (!newUIDs.includes(uidToAdd)) {
        newUIDs.push(uidToAdd);
      }
      if (!users.some(u => u.uid === uidToAdd)) {
        setUsers(prev => [...prev, {
          uid: uidToAdd,
          name: `Manual UID: ${uidToAdd.slice(0, 8)}...`,
          email: 'Direct Permission',
          role: 'driver'
        }]);
      }
      await logActivity('Manual UID Authorized', `Added UID ${uidToAdd} to authorized bilty list`, 'bilty');
    }

    setAllowedUIDs(newUIDs);
    setAllowedEmails(newEmails);
    await updateBiltyAccessInFirestore(newUIDs, newEmails);
    if (onUpdated) {
      onUpdated({ allowedUIDs: newUIDs, allowedEmails: newEmails });
    }
    setManualInput('');
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

  const handleResetTollRates = async () => {
    if (window.confirm(lang === 'ur' ? 'کیا آپ تمام ٹول ٹیکس ریٹس کو NHA کے طے شدہ نرخوں پر بحال کرنا چاہتے ہیں؟' : 'Reset all toll tax tariffs to default NHA rates?')) {
      const def = await resetTollRatesToDefault();
      setTollRates(def);
      setTollSuccessMsg(true);
      setTimeout(() => setTollSuccessMsg(false), 3000);
    }
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

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.uid && u.uid.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] max-w-3xl w-full p-4 sm:p-7 shadow-2xl border border-[#ecece0] max-h-[92vh] flex flex-col space-y-4 text-right dir-rtl">
        
        {/* Top Header */}
        <header className="flex justify-between items-center border-b border-[#ecece0] pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#b58b28] to-amber-400 text-white flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#4a4a35]">
                  {lang === 'ur' ? 'آنر کنٹرول پینل (وارائچ گڈز ایڈمن)' : 'Owner Control Panel'}
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300 font-mono">
                  warraichgoods43@gmail.com
                </span>
              </div>
              <p className="text-xs text-[#8e8e75] mt-0.5 font-sans">
                {lang === 'ur' 
                  ? 'بلٹی بنانے کی سیکیورٹی رسائی، اکاؤنٹس مینجمنٹ اور کاروباری رپورٹس'
                  : 'Manage bilty creation authorization for Gmail accounts & business ledger'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 bg-[#f0f0e4] hover:bg-[#5a5a40] hover:text-white rounded-full text-[#5a5a40] transition-all cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Clean, Focused Tab Navigation (Only Essential, Non-Misusable Tabs) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-[#ecece0] shrink-0">
          <button
            onClick={() => setActiveTab('access')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'access'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'ur' ? 'بلٹی رسائی کنٹرول' : 'Bilty Access'}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-bold">
              {allowedUIDs.length + allowedEmails.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'ur' ? 'ماہانہ رپورٹ و حساب' : 'Business Reports'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tollRates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tollRates'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <Milestone className="w-4 h-4" />
            <span>{lang === 'ur' ? 'موٹروے ٹول ریٹس' : 'Motorway Toll Rates'}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{lang === 'ur' ? 'سسٹم آڈٹ لاگ' : 'Activity Logs'}</span>
          </button>
        </div>

        {/* Tab Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[350px]">

          {/* TAB 1: BILTY ACCESS MANAGEMENT */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{lang === 'ur' ? 'گوگل اکاؤنٹس اور بلٹی رسائی کا کنٹرول' : 'Bilty Creation Permission Control'}</h3>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {lang === 'ur' 
                      ? 'جن صارفین نے جی میل سے سائن ان کیا ہے وہ نیچے نظر آ رہے ہیں۔ آپ 1-کلک سے کسی بھی اکاؤنٹ کو بلٹی بنانے کی اجازت دے سکتے ہیں یا واپس لے سکتے ہیں۔'
                      : 'All Gmail accounts signed into the app are listed below. Click Grant or Revoke to manage Bilty generator access.'}
                  </p>
                </div>
                <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
              </div>

              {/* Add Gmail email directly or search */}
              <div className="space-y-2.5">
                <form onSubmit={handleAddManualInput} className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={lang === 'ur' ? 'نیا جی میل ایڈریس لکھیں (مثلاً driver@gmail.com)...' : 'Enter any Gmail address to grant Bilty access...'}
                    className="flex-1 text-xs px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#8b9d77] text-white text-xs font-bold rounded-xl hover:bg-[#788a65] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ur' ? 'بلٹی رسائی دیں' : 'Grant Access'}</span>
                  </button>
                </form>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#8e8e75] absolute right-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'ur' ? 'موجودہ اکاؤنٹس میں تلاش کریں...' : 'Search accounts by name or email...'}
                    className="w-full text-xs pr-9 pl-3 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {loadingUsers ? (
                  <div className="p-8 text-center text-xs text-[#8e8e75] italic">
                    {lang === 'ur' ? 'اکاؤنٹس لوڈ ہو رہے ہیں...' : 'Loading accounts...'}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8e8e75] italic bg-[#fdfbf7] rounded-2xl border border-dashed border-[#ecece0]">
                    {lang === 'ur' ? 'کوئی اکاؤنٹ نہیں ملا۔ اوپر جی میل ایڈریس درج کر کے اجازت دیں۔' : 'No users found. Enter an email above to grant access.'}
                  </div>
                ) : (
                  filteredUsers.map(user => {
                    const isOwnerRole = user.email?.toLowerCase().trim() === 'warraichgoods43@gmail.com' || user.role === 'owner';
                    const isAuthorized = isOwnerRole || 
                      (user.uid && allowedUIDs.includes(user.uid)) || 
                      (user.email && allowedEmails.map(e => e.toLowerCase().trim()).includes(user.email.toLowerCase().trim()));

                    return (
                      <div
                        key={user.uid || user.email}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isAuthorized
                            ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                            : 'bg-white border-[#ecece0]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOwnerRole 
                              ? 'bg-gradient-to-tr from-amber-500 to-[#b58b28] text-white shadow-2xs' 
                              : isAuthorized 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-gray-200 text-gray-700'
                          }`}>
                            {isOwnerRole ? <Crown className="w-5 h-5" /> : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#4a4a35]">{user.name || user.email?.split('@')[0]}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                isOwnerRole
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                  : isAuthorized
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-gray-100 text-gray-700'
                              }`}>
                                {isOwnerRole ? 'Owner' : isAuthorized ? 'Authorized' : 'Guest / Driver'}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#4a4a35] font-mono mt-0.5 font-medium">{user.email || user.uid}</p>
                            {user.lastLogin && (
                              <p className="text-[9px] text-[#8e8e75] mt-0.5">
                                {lang === 'ur' ? 'آخری لاگ ان:' : 'Last Login:'} {new Date(user.lastLogin).toLocaleDateString('en-PK')}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          {isOwnerRole ? (
                            <span className="text-xs bg-[#8b9d77] text-white px-3.5 py-1.5 rounded-xl font-bold">
                              {lang === 'ur' ? 'مالک (مکمل رسائی)' : 'Owner (Master)'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleAccess(user)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs ${
                                isAuthorized
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {isAuthorized ? (
                                <>
                                  <UserX className="w-3.5 h-3.5 text-red-500" />
                                  <span>{lang === 'ur' ? 'رسائی واپس لیں' : 'Revoke'}</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-white" />
                                  <span>{lang === 'ur' ? 'بلٹی رسائی دیں' : 'Grant Access'}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BUSINESS & MONTHLY FINANCIAL REPORTS */}
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

          {/* TAB 3: TOLL RATES & MOTORWAY TARIFFS */}
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
                  onClick={handleResetTollRates}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
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

      </div>
    </div>
  );
};

