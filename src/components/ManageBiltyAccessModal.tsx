import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Search, 
  Plus, 
  Crown, 
  Building2, 
  BarChart3, 
  Activity, 
  Download, 
  Save, 
  RotateCcw, 
  FileSpreadsheet, 
  FileJson, 
  Phone, 
  MapPin, 
  Hash, 
  Calendar, 
  DollarSign, 
  Truck, 
  CheckCircle2, 
  Receipt,
  Users,
  Milestone,
  Key,
  Copy,
  Check
} from 'lucide-react';
import { Language, UserProfile, CompanyProfile, ActivityLogItem, BiltyRecord, Trip, TollRatesConfig } from '../types';
import { 
  getBiltyAccessConfig, 
  updateBiltyAccessInFirestore,
  getStoredCompanyProfile,
  saveCompanyProfileInFirestore,
  DEFAULT_COMPANY_PROFILE,
  getActivityLogs,
  logActivity,
  exportAllBusinessDataJSON,
  exportAllBiltiesCSV,
  exportAllTripsCSV,
  exportContactsCSV,
  getStoredBilties,
  getStoredTrips,
  getStoredVehicles,
  getStoredDrivers
} from '../utils/storage';
import { 
  getStoredTollRates, 
  saveTollRatesInFirestore, 
  resetTollRatesToDefault, 
  DEFAULT_TOLL_RATES 
} from '../utils/tollMatrix';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';

interface ManageBiltyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentUserUid?: string | null;
  onUpdated?: (config: { allowedUIDs: string[]; allowedEmails: string[] }) => void;
}

type PanelTab = 'access' | 'keystore' | 'company' | 'tollRates' | 'reports' | 'logs' | 'export';

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

  // Company Profile State
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

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
    // Load Access Config
    setLoadingUsers(true);
    try {
      const config = await getBiltyAccessConfig();
      setAllowedUIDs(config.allowedUIDs);
      setAllowedEmails(config.allowedEmails);

      const userList: UserProfile[] = [];
      if (typeof navigator === 'undefined' || navigator.onLine) {
        try {
          const usersRef = collection(db, 'users');
          const snap = await Promise.race([
            getDocs(usersRef),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
          ]);
          snap.forEach(docSnap => {
            const data = docSnap.data();
            if (data && (data.uid || data.email)) {
              userList.push({
                uid: data.uid || data.email,
                name: data.name || data.email || 'User',
                email: data.email || '',
                role: data.role || 'driver',
                lastLogin: data.lastLogin
              });
            }
          });
        } catch {
          // offline fallback
        }
      }

      if (!userList.some(u => u.email?.toLowerCase() === 'warraichgoods43@gmail.com')) {
        userList.unshift({
          uid: currentUserUid || 'owner_uid',
          name: 'Warraich Goods Owner',
          email: 'warraichgoods43@gmail.com',
          role: 'owner'
        });
      }
      setUsers(userList);
    } catch (err) {
      console.warn("Failed loading access config:", err);
    } finally {
      setLoadingUsers(false);
    }

    // Load Company Profile
    try {
      const profile = await getStoredCompanyProfile();
      setCompanyProfile(profile);
    } catch (err) {
      console.warn("Failed loading company profile:", err);
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
    const targetEmail = user.email ? user.email.toLowerCase() : '';
    const targetUid = user.uid;

    let newUIDs = [...allowedUIDs];
    let newEmails = [...allowedEmails];

    const isUidAuth = newUIDs.includes(targetUid);
    const isEmailAuth = targetEmail && newEmails.map(e => e.toLowerCase()).includes(targetEmail);

    if (isUidAuth || isEmailAuth) {
      newUIDs = newUIDs.filter(id => id !== targetUid);
      if (targetEmail) {
        newEmails = newEmails.filter(e => e.toLowerCase() !== targetEmail);
      }
      await logActivity('Bilty Access Revoked', `Revoked access for ${user.name} (${user.email || targetUid})`, 'bilty');
    } else {
      if (targetUid && !newUIDs.includes(targetUid)) {
        newUIDs.push(targetUid);
      }
      if (targetEmail && !newEmails.map(e => e.toLowerCase()).includes(targetEmail)) {
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

    let newUIDs = [...allowedUIDs];
    let newEmails = [...allowedEmails];

    if (inputVal.includes('@')) {
      const emailToAdd = inputVal.toLowerCase();
      if (!newEmails.map(e => e.toLowerCase()).includes(emailToAdd)) {
        newEmails.push(emailToAdd);
      }
      if (!users.some(u => u.email.toLowerCase() === emailToAdd)) {
        setUsers([...users, {
          uid: `email_${Date.now()}`,
          name: `Authorized: ${emailToAdd}`,
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
        setUsers([...users, {
          uid: uidToAdd,
          name: `Manual UID: ${uidToAdd.slice(0, 8)}...`,
          email: 'Direct UID Permission',
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

  // --- COMPANY SETTINGS HANDLERS ---
  const handleSaveCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await saveCompanyProfileInFirestore(companyProfile);
      setProfileSuccessMsg(true);
      setTimeout(() => setProfileSuccessMsg(false), 3000);
    } catch (err) {
      console.error('Failed to save company profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetCompanyProfile = () => {
    if (window.confirm(lang === 'ur' ? 'کیا آپ تمام ترتیبات کو اصل حالت پر بحال کرنا چاہتے ہیں؟' : 'Reset all company settings to default values?')) {
      setCompanyProfile(DEFAULT_COMPANY_PROFILE);
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
    // Format could be "YYYY-MM-DD" or "DD Mon, YYYY"
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
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] sm:rounded-[36px] max-w-4xl w-full p-4 sm:p-7 shadow-2xl border border-[#ecece0] max-h-[92vh] flex flex-col space-y-4 text-right dir-rtl">
        
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
                  ? 'کمپنی پروفائل، بلٹی سیکیورٹی رسائی، مالیاتی رپورٹس اور ڈیٹا بیک اپ'
                  : 'Full company settings, bilty authorization, financial reports & system exports'}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-[#ecece0] shrink-0">
          <button
            onClick={() => setActiveTab('access')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'access'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === 'ur' ? 'بلٹی رسائی' : 'Bilty Access'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
              {allowedUIDs.length + allowedEmails.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('keystore')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'keystore'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50/60 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Key className="w-4 h-4 text-amber-700" />
            <span>{lang === 'ur' ? 'اینڈرائیڈ کی اسٹور و سائننگ' : 'Android Keystore'}</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'company'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{lang === 'ur' ? 'کمپنی پروفائل و ہیڈر' : 'Company Profile & Header'}</span>
          </button>

          <button
            onClick={() => setActiveTab('tollRates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tollRates'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <Milestone className="w-4 h-4" />
            <span>{lang === 'ur' ? 'موٹروے ٹول ریٹس' : 'Motorway Toll Rates'}</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{lang === 'ur' ? 'ماہانہ رپورٹ و حساب' : 'Business Reports'}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{lang === 'ur' ? 'سسٹم آڈٹ لاگ' : 'Activity Logs'}</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-[#8b9d77] text-white shadow-xs'
                : 'bg-[#fdfbf7] text-[#5a5a40] hover:bg-[#f0f0e4] border border-[#ecece0]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'ur' ? 'ڈیٹا بیک اپ و ایکسپورٹ' : 'Data Export & Backup'}</span>
          </button>
        </div>

        {/* Tab Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[350px]">

          {/* TAB 1: BILTY ACCESS MANAGEMENT */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{lang === 'ur' ? 'بلٹی فارم رسائی کنٹرول' : 'Bilty Creation Security'}</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {lang === 'ur' 
                      ? 'صرف وہ ڈرائیور یا ملازمین بلٹی بنا سکتے ہیں جنہیں آپ یہاں اجازت دیں گے۔ بغیر اجازت افراد کو بلٹی کا آپشن نظر نہیں آئے گا۔'
                      : 'Only approved users can create bilties. Unauthorized users will have the bilty tab hidden.'}
                  </p>
                </div>
                <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
              </div>

              {/* Search & Manual UID bar */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8e8e75] absolute right-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === 'ur' ? 'نام، ای میل یا Firebase UID سے تلاش کریں...' : 'Search by name, email or UID...'}
                    className="w-full text-xs pr-9 pl-3 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                  />
                </div>

                <form onSubmit={handleAddManualInput} className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={lang === 'ur' ? 'نیا ای میل ایڈریس یا Firebase UID درج کر کے رسائی دیں...' : 'Enter driver email address or Firebase UID to grant access...'}
                    className="flex-1 text-xs px-3 py-2 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#8b9d77] text-white text-xs font-bold rounded-xl hover:bg-[#788a65] transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ur' ? 'اجازت شامل کریں' : 'Grant'}</span>
                  </button>
                </form>
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {loadingUsers ? (
                  <div className="p-8 text-center text-xs text-[#8e8e75] italic">
                    {lang === 'ur' ? 'صارفین کی فہرست لوڈ ہو رہی ہے...' : 'Loading users list...'}
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8e8e75] italic bg-[#fdfbf7] rounded-2xl border border-dashed border-[#ecece0]">
                    {lang === 'ur' ? 'کوئی صارف نہیں ملا۔ اوپر ای میل لکھ کر اجازت دیں۔' : 'No users found. Enter an email above to grant access.'}
                  </div>
                ) : (
                  filteredUsers.map(user => {
                    const isOwnerRole = user.email?.toLowerCase() === 'warraichgoods43@gmail.com' || user.role === 'owner';
                    const isAuthorized = isOwnerRole || 
                      allowedUIDs.includes(user.uid) || 
                      (user.email && allowedEmails.map(e => e.toLowerCase()).includes(user.email.toLowerCase()));

                    return (
                      <div
                        key={user.uid}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isAuthorized
                            ? 'bg-emerald-50/50 border-emerald-200 shadow-2xs'
                            : 'bg-white border-[#ecece0]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isOwnerRole 
                              ? 'bg-gradient-to-tr from-amber-500 to-[#b58b28] text-white shadow-2xs' 
                              : isAuthorized 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isOwnerRole ? <Crown className="w-4 h-4" /> : user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#4a4a35]">{user.name}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                isOwnerRole
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                  : user.role === 'accountant' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-700'
                              }`}>
                                {isOwnerRole ? 'Owner' : user.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#8e8e75] font-mono mt-0.5">{user.email || user.uid}</p>
                          </div>
                        </div>

                        <div>
                          {isOwnerRole ? (
                            <span className="text-[10px] bg-[#8b9d77] text-white px-3 py-1 rounded-full font-bold">
                              {lang === 'ur' ? 'مالک (مکمل رسائی)' : 'Owner (Master)'}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleAccess(user)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isAuthorized
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                              }`}
                            >
                              {isAuthorized ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>{lang === 'ur' ? 'رسائی فعال ہے' : 'Authorized'}</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>{lang === 'ur' ? 'رسائی دیں' : 'Grant Access'}</span>
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

          {/* TAB 2: ANDROID KEYSTORE & SIGNING DETAILS (CONFIDENTIAL APP OWNER) */}
          {activeTab === 'keystore' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-950">
                    {lang === 'ur' ? 'اینڈرائیڈ کی اسٹور اور پروڈکشن سائننگ کریڈینشلز' : 'Confidential Android Keystore & Signing Details'}
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    {lang === 'ur'
                      ? 'یہ معلومات صرف ایپ آنر (warraichgoods43@gmail.com) کے لیے مخصوص اور انتہائی خفیہ ہیں۔ گوگل پلے کنسول، APK اور AAB پیکج سائن کرنے کے لیے یہ تفصیلات استعمال کریں۔'
                      : 'These production signing keys and aliases are strictly confidential and only visible to the authenticated App Owner.'}
                  </p>
                </div>
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 bg-white rounded-2xl border border-[#ecece0] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8e8e75] uppercase font-bold tracking-wider">Key Alias</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">Alias</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#4a4a35] select-all bg-[#f9f9f2] p-2 rounded-xl border border-[#ecece0]">
                    warraich
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#ecece0] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8e8e75] uppercase font-bold tracking-wider">Keystore Password</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">Secret</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#4a4a35] select-all bg-[#f9f9f2] p-2 rounded-xl border border-[#ecece0]">
                    Warraich12345
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#ecece0] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8e8e75] uppercase font-bold tracking-wider">Key Password</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">Secret</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#4a4a35] select-all bg-[#f9f9f2] p-2 rounded-xl border border-[#ecece0]">
                    Warraich12345
                  </div>
                </div>
              </div>

              {/* Package Identification */}
              <div className="p-4 rounded-2xl bg-white border border-[#ecece0] space-y-2">
                <h5 className="font-bold text-xs text-[#4a4a35]">
                  {lang === 'ur' ? 'ایپلیکیشن پیکج آئی ڈی و سرٹیفکیٹ' : 'Application Package ID & Fingerprint'}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#fdfbf7] rounded-xl border border-[#ecece0]">
                    <span className="text-[10px] text-[#8e8e75] block font-bold">Package Name:</span>
                    <span className="font-mono text-xs font-bold text-[#1e3a68]">com.warraichgoods.app</span>
                  </div>
                  <div className="p-2.5 bg-[#fdfbf7] rounded-xl border border-[#ecece0]">
                    <span className="text-[10px] text-[#8e8e75] block font-bold">Target Platform:</span>
                    <span className="font-mono text-xs font-bold text-emerald-800">Android 8.0+ (API Level 26–35)</span>
                  </div>
                </div>
              </div>

              {/* Download Buttons for Keystore Files */}
              <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] space-y-3">
                <h5 className="font-bold text-xs text-[#4a4a35] flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#8b9d77]" />
                  <span>{lang === 'ur' ? 'سائننگ کی فائلز ڈاؤن لوڈ کریں' : 'Download Signing Key Files'}</span>
                </h5>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href={`${import.meta.env.BASE_URL}warraich-release-key.jks`}
                    download="warraich-release-key.jks"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ur' ? 'ڈاؤن لوڈ .JKS فائل (جاوا کی اسٹور)' : 'Download warraich-release-key.jks'}</span>
                  </a>
                  <a
                    href={`${import.meta.env.BASE_URL}warraich-release-key.keystore`}
                    download="warraich-release-key.keystore"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-[#ecece0] text-[#4a4a35] text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{lang === 'ur' ? 'ڈاؤن لوڈ .KEYSTORE فائل' : 'Download warraich-release-key.keystore'}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPANY PROFILE & HEADER SETTINGS */}
          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{lang === 'ur' ? 'کمپنی کا باضابطہ نام اور پرنٹنگ ہیڈر' : 'Company Branding & Print Header'}</h4>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    {lang === 'ur'
                      ? 'یہ تمام معلومات بلٹی کی پی ڈی ایف (PDF)، پرنٹ آؤٹ اور آن لائن تصدیقی صفحے پر ظاہر ہوں گی۔'
                      : 'These settings apply directly to the generated Bilty PDF receipts, headers, and online verification.'}
                  </p>
                </div>
                <Building2 className="w-7 h-7 text-blue-600 shrink-0" />
              </div>

              {profileSuccessMsg && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{lang === 'ur' ? 'کمپنی پروفائل اور سیٹنگز کامیابی سے محفوظ ہو گئیں!' : 'Company profile saved successfully!'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#4a4a35] mb-1">
                    {lang === 'ur' ? 'کمپنی کا نام (اردو)' : 'Company Name (Urdu)'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.nameUr}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, nameUr: e.target.value })}
                    required
                    className="w-full text-xs px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77] font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4a4a35] mb-1">
                    {lang === 'ur' ? 'کمپنی کا نام (انگریزی)' : 'Company Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.nameEn}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, nameEn: e.target.value })}
                    required
                    className="w-full text-xs px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4a4a35] mb-1">
                    {lang === 'ur' ? 'چیف ایگزیکٹو / مالک کا نام' : 'Chief Executive / Proprietor'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.ownerName}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, ownerName: e.target.value })}
                    required
                    className="w-full text-xs px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4a4a35] mb-1">
                    {lang === 'ur' ? 'ہیلپ لائن / فون نمبرز' : 'Phone Numbers & Helpline'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.phoneNumbers}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, phoneNumbers: e.target.value })}
                    required
                    placeholder="0300-5370443, 0339-5370443"
                    className="w-full text-xs px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77] font-mono dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4a4a35] mb-1">
                    {lang === 'ur' ? 'این ٹی این نمبر (NTN)' : 'NTN Registration Number'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.ntn}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, ntn: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77] font-mono dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4a4a35] mb-1">
                    {lang === 'ur' ? 'ہیڈ آفس ایڈریس (اردو)' : 'Head Office Address'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.headOfficeUr}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, headOfficeUr: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-[#4a4a35] mb-1">
                    {lang === 'ur' ? 'ٹیگ لائن / کمپنی کا پیغام' : 'Company Tagline'}
                  </label>
                  <input
                    type="text"
                    value={companyProfile.taglineUr}
                    onChange={(e) => setCompanyProfile({ ...companyProfile, taglineUr: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl focus:outline-none focus:border-[#8b9d77]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetCompanyProfile}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'ur' ? 'ڈیفالٹ پر بحال کریں' : 'Reset to Default'}</span>
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-[#8b9d77] hover:bg-[#788a65] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? (lang === 'ur' ? 'محفوظ ہو رہا ہے...' : 'Saving...') : (lang === 'ur' ? 'سیٹنگز محفوظ کریں' : 'Save Company Profile')}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: TOLL RATES & MOTORWAY TARIFFS */}
          {activeTab === 'tollRates' && (
            <form onSubmit={handleSaveTollRates} className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{lang === 'ur' ? 'این ایچ اے موٹروے و ہائی وے ٹول ریٹس شیڈول' : 'NHA Motorway & Highway Toll Schedule'}</h4>
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

          {/* TAB 3: BUSINESS & MONTHLY FINANCIAL REPORTS */}
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
                  <h4 className="font-serif font-bold text-xs text-[#4a4a35]">
                    {lang === 'ur' ? 'اس مہینے کی تمام بلٹیوں کی تفصیل' : 'Monthly Bilties Ledger'}
                  </h4>
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
                    <option value="settings">{lang === 'ur' ? 'سیٹنگز تبدیلی (Settings)' : 'Settings'}</option>
                    <option value="export">{lang === 'ur' ? 'ڈیٹا ڈاؤن لوڈ (Exports)' : 'Data Exports'}</option>
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

          {/* TAB 5: DATA EXPORT & FULL BACKUP */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs text-purple-950 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{lang === 'ur' ? 'کاروباری ڈیٹا ایکسپورٹ و بیک اپ' : 'Business Data Backup & Exporter'}</h4>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    {lang === 'ur'
                      ? 'اپنے تمام بلٹی ریکارڈز، سفری اخراجات اور فون ڈائریکٹری کو ایک کلک سے ایکسل (CSV) یا مکمل JSON فائل میں ڈاؤن لوڈ کریں۔'
                      : 'Download all bilties, trips, fuel logs, and contact directories as spreadsheet CSV or complete JSON backup.'}
                  </p>
                </div>
                <Download className="w-7 h-7 text-purple-600 shrink-0" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* 1. Full JSON Backup */}
                <div className="p-4 rounded-2xl bg-white border border-[#ecece0] shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-[#1e3a68]">
                    <FileJson className="w-5 h-5 text-amber-600" />
                    <h5 className="font-bold text-xs">{lang === 'ur' ? 'مکمل سسٹم بیک اپ (JSON)' : 'Complete Database Backup (JSON)'}</h5>
                  </div>
                  <p className="text-[11px] text-[#8e8e75]">
                    {lang === 'ur' ? 'کمپنی سیٹنگز، بلٹیاں، سفر، گاڑیاں اور تمام کسٹمرز پر مشتمل جامع فائل۔' : 'Full export containing company settings, all bilties, trips, vehicles and contacts.'}
                  </p>
                  <button
                    onClick={exportAllBusinessDataJSON}
                    className="w-full py-2 px-3 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'مکمل بیک اپ فائل ڈاؤن لوڈ کریں' : 'Download Full JSON Backup'}</span>
                  </button>
                </div>

                {/* 2. Bilties CSV Export */}
                <div className="p-4 rounded-2xl bg-white border border-[#ecece0] shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                    <h5 className="font-bold text-xs">{lang === 'ur' ? 'بلٹیاں ایکسل شیٹ (CSV)' : 'All Bilties Ledger (CSV)'}</h5>
                  </div>
                  <p className="text-[11px] text-[#8e8e75]">
                    {lang === 'ur' ? 'تمام تیار شدہ بلٹیوں کا مکمل ریکارڈ ایکسل شیٹ فارمیٹ میں محفوظ کریں۔' : 'Export all issued bilty receipts with amounts, parties, weights and dates for Excel.'}
                  </p>
                  <button
                    onClick={exportAllBiltiesCSV}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'بلٹی ڈیٹا CSV ڈاؤن لوڈ کریں' : 'Download Bilties CSV'}</span>
                  </button>
                </div>

                {/* 3. Trips History CSV */}
                <div className="p-4 rounded-2xl bg-white border border-[#ecece0] shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-800">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <h5 className="font-bold text-xs">{lang === 'ur' ? 'سفری اخراجات شیٹ (Trips CSV)' : 'Trip Cost Breakdown (CSV)'}</h5>
                  </div>
                  <p className="text-[11px] text-[#8e8e75]">
                    {lang === 'ur' ? 'ڈیزل، ٹول ٹیکس اور سفری اخراجات کا تفصیلی ریکارڈ ڈاؤن لوڈ کریں۔' : 'Export all trip cost calculations, fuel consumed, tolls and kharcha for accounting.'}
                  </p>
                  <button
                    onClick={exportAllTripsCSV}
                    className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'سفری اخراجات CSV ڈاؤن لوڈ کریں' : 'Download Trips CSV'}</span>
                  </button>
                </div>

                {/* 4. Customer & Driver Directory CSV */}
                <div className="p-4 rounded-2xl bg-white border border-[#ecece0] shadow-2xs space-y-2.5">
                  <div className="flex items-center gap-2 text-[#5a5a40]">
                    <Users className="w-5 h-5 text-[#8b9d77]" />
                    <h5 className="font-bold text-xs">{lang === 'ur' ? 'فون ڈائریکٹری (Contacts CSV)' : 'Contacts Directory (CSV)'}</h5>
                  </div>
                  <p className="text-[11px] text-[#8e8e75]">
                    {lang === 'ur' ? 'تمام ڈرائیوروں اور کلائنٹس کے موبائل نمبرز کی خودکار لسٹ ڈاؤن لوڈ کریں۔' : 'Export verified phone numbers of all consignors, consignees and drivers.'}
                  </p>
                  <button
                    onClick={exportContactsCSV}
                    className="w-full py-2 px-3 bg-[#5a5a40] hover:bg-[#4a4a35] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'رابطہ لسٹ CSV ڈاؤن لوڈ کریں' : 'Download Contacts CSV'}</span>
                  </button>
                </div>

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
