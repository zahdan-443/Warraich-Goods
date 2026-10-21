import React, { useState, useEffect, useMemo } from 'react';
import {
  Language,
  LedgerParty,
  PartyTransaction,
  LedgerBroker,
  BrokerTransaction,
  Vehicle,
  Trip,
  VehicleExpenseEntry,
  VehicleIncomeEntry
} from '../../types';
import {
  getStoredParties,
  getStoredPartyTransactions,
  saveOrUpdateParty,
  deleteParty,
  addPartyTransaction,
  getStoredBrokers,
  getStoredBrokerTransactions,
  saveOrUpdateBroker,
  deleteBroker,
  addBrokerTransaction,
  toggleBrokerTransactionStatus,
  getStoredVehicleExpenses,
  getStoredVehicleIncomes,
  addVehicleExpense,
  deleteVehicleExpense,
  addVehicleIncome,
  deleteVehicleIncome,
  syncFreightRecordsToLedger,
  getTopPartiesRanking,
  calculateVehicleProfitLoss,
  formatPartyWhatsAppReminder,
  formatBrokerWhatsAppReminder,
  getCleanPhoneForWhatsApp,
  fetchLedgerDataFromFirestore
} from '../../utils/ledgerStorage';
import { CameraOcrInput } from '../CameraOcrInput';
import {
  BookOpen,
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Search,
  DollarSign,
  Calendar,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Crown,
  Receipt,
  X
} from 'lucide-react';

interface LedgerViewProps {
  lang: Language;
  vehicles: Vehicle[];
  trips: Trip[];
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

  // Sub tabs: parties, brokers, vehicleProfitLoss
  const [subTab, setSubTab] = useState<'parties' | 'brokers' | 'vehicleProfitLoss'>('parties');

  // Parties & Brokers State
  const [parties, setParties] = useState<LedgerParty[]>([]);
  const [partyTxs, setPartyTxs] = useState<PartyTransaction[]>([]);
  const [brokers, setBrokers] = useState<LedgerBroker[]>([]);
  const [brokerTxs, setBrokerTxs] = useState<BrokerTransaction[]>([]);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [showAddPartyTxModal, setShowAddPartyTxModal] = useState<string | null>(null); // partyId
  const [selectedPartyHistory, setSelectedPartyHistory] = useState<string | null>(null); // partyId

  const [showAddBrokerModal, setShowAddBrokerModal] = useState(false);
  const [showAddBrokerTxModal, setShowAddBrokerTxModal] = useState<string | null>(null); // brokerId
  const [selectedBrokerHistory, setSelectedBrokerHistory] = useState<string | null>(null); // brokerId

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);

  // Form states - Party
  const [partyName, setPartyName] = useState('');
  const [partyPhone, setPartyPhone] = useState('');
  const [partyCity, setPartyCity] = useState('');
  const [partyOpeningBal, setPartyOpeningBal] = useState('0');

  // Form states - Party Transaction
  const [txType, setTxType] = useState<'debit' | 'credit'>('debit');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txRefNo, setTxRefNo] = useState('');
  const [txVehicleNo, setTxVehicleNo] = useState('');

  // Form states - Broker
  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerCity, setBrokerCity] = useState('');

  // Form states - Broker Transaction
  const [bLoadDesc, setBLoadDesc] = useState('');
  const [bVehicleNo, setBVehicleNo] = useState('');
  const [bFreightAmt, setBFreightAmt] = useState('');
  const [bCommission, setBCommission] = useState('');
  const [bStatus, setBStatus] = useState<'paid' | 'unpaid'>('unpaid');

  // Form states - Vehicle Expense / Income
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [expVehicleNo, setExpVehicleNo] = useState<string>('');
  const [expCategory, setExpCategory] = useState<'fuel' | 'toll' | 'repair' | 'challan' | 'driver' | 'other'>('fuel');
  const [expAmount, setExpAmount] = useState<string>('');
  const [expDesc, setExpDesc] = useState<string>('');

  const [incVehicleNo, setIncVehicleNo] = useState<string>('');
  const [incAmount, setIncAmount] = useState<string>('');
  const [incPartyName, setIncPartyName] = useState<string>('');
  const [incDesc, setIncDesc] = useState<string>('');

  // Date range filter for Profit/Loss
  const [dateRangeType, setDateRangeType] = useState<'today' | 'week' | 'month' | 'custom' | 'all'>('month');
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Notification / Feedback toast
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Initial load & automatic bilty sync if authorized
  const refreshData = () => {
    syncFreightRecordsToLedger(isBiltyAuthorized);
    setParties(getStoredParties());
    setPartyTxs(getStoredPartyTransactions());
    setBrokers(getStoredBrokers());
    setBrokerTxs(getStoredBrokerTransactions());
  };

  useEffect(() => {
    refreshData();
    fetchLedgerDataFromFirestore().then(() => {
      refreshData();
    });
  }, [isBiltyAuthorized]);

  // Top Parties Ranking
  const topParties = useMemo(() => {
    return getTopPartiesRanking(5);
  }, [parties, partyTxs]);

  // Filtered Parties
  const filteredParties = useMemo(() => {
    if (!searchQuery.trim()) return parties;
    const q = searchQuery.toLowerCase().trim();
    return parties.filter(p => p.name.toLowerCase().includes(q) || (p.city && p.city.toLowerCase().includes(q)) || (p.phone && p.phone.includes(q)));
  }, [parties, searchQuery]);

  // Filtered Brokers
  const filteredBrokers = useMemo(() => {
    if (!searchQuery.trim()) return brokers;
    const q = searchQuery.toLowerCase().trim();
    return brokers.filter(b => b.name.toLowerCase().includes(q) || (b.city && b.city.toLowerCase().includes(q)) || (b.phone && b.phone.includes(q)));
  }, [brokers, searchQuery]);

  // Vehicle Profit/Loss Summary
  const pnlSummary = useMemo(() => {
    return calculateVehicleProfitLoss(
      selectedVehicle,
      dateRangeType,
      customStart,
      customEnd,
      trips
    );
  }, [selectedVehicle, dateRangeType, customStart, customEnd, trips, parties]);

  // Handlers - Party
  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;

    const opBal = parseFloat(partyOpeningBal) || 0;
    const newP = saveOrUpdateParty({
      name: partyName.trim(),
      phone: partyPhone.trim(),
      city: partyCity.trim(),
      runningBalance: opBal,
      totalCharged: opBal > 0 ? opBal : 0,
      totalReceived: opBal < 0 ? Math.abs(opBal) : 0
    });

    if (opBal !== 0) {
      addPartyTransaction({
        partyId: newP.id,
        date: new Date().toISOString().slice(0, 10),
        type: opBal > 0 ? 'debit' : 'credit',
        amount: Math.abs(opBal),
        description: isUrdu ? 'ابتدائی بقایا کھاتہ (Opening Balance)' : 'Opening Balance',
        source: 'manual'
      });
    }

    setPartyName('');
    setPartyPhone('');
    setPartyCity('');
    setPartyOpeningBal('0');
    setShowAddPartyModal(false);
    refreshData();
    showToast(isUrdu ? 'نئی پارٹی کھاتہ میں کامیابی سے شامل ہو گئی!' : 'Party added successfully!');
  };

  const handleAddPartyTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddPartyTxModal) return;
    const amt = parseFloat(txAmount);
    if (!amt || amt <= 0) return;

    addPartyTransaction({
      partyId: showAddPartyTxModal,
      date: new Date().toISOString().slice(0, 10),
      type: txType,
      amount: amt,
      description: txDescription.trim() || (txType === 'debit' ? (isUrdu ? 'کرایہ / بل' : 'Freight/Bill') : (isUrdu ? 'رقم وصولی' : 'Payment Received')),
      referenceNo: txRefNo.trim(),
      vehicleNo: txVehicleNo.trim(),
      source: 'manual'
    });

    setTxAmount('');
    setTxDescription('');
    setTxRefNo('');
    setTxVehicleNo('');
    setShowAddPartyTxModal(null);
    refreshData();
    showToast(isUrdu ? 'کھاتہ اندراج کامیابی سے محفوظ ہو گیا!' : 'Entry recorded successfully!');
  };

  // Handlers - Broker
  const handleCreateBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerName.trim()) return;

    saveOrUpdateBroker({
      name: brokerName.trim(),
      phone: brokerPhone.trim(),
      city: brokerCity.trim(),
      totalCommission: 0,
      unpaidCommission: 0
    });

    setBrokerName('');
    setBrokerPhone('');
    setBrokerCity('');
    setShowAddBrokerModal(false);
    refreshData();
    showToast(isUrdu ? 'نیا بروکر کامیابی سے درج ہو گیا!' : 'Broker added successfully!');
  };

  const handleAddBrokerTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddBrokerTxModal) return;
    const comm = parseFloat(bCommission);
    if (isNaN(comm) || comm <= 0) return;

    addBrokerTransaction({
      brokerId: showAddBrokerTxModal,
      date: new Date().toISOString().slice(0, 10),
      loadDescription: bLoadDesc.trim() || (isUrdu ? 'عام مال برداری لوڈ' : 'General Cargo Load'),
      vehicleNo: bVehicleNo.trim(),
      freightAmount: parseFloat(bFreightAmt) || 0,
      commission: comm,
      status: bStatus
    });

    setBLoadDesc('');
    setBVehicleNo('');
    setBFreightAmt('');
    setBCommission('');
    setShowAddBrokerTxModal(null);
    refreshData();
    showToast(isUrdu ? 'بروکر لوڈ اندراج محفوظ ہو گیا!' : 'Broker load entry recorded!');
  };

  // Handlers - Vehicle Expense
  const handleAddVehicleExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (!amt || amt <= 0) return;
    const vNo = expVehicleNo.trim() || (vehicles.length > 0 ? vehicles[0].reg : 'LHR-7860');

    addVehicleExpense({
      vehicleNo: vNo,
      date: new Date().toISOString().slice(0, 10),
      category: expCategory,
      amount: amt,
      description: expDesc.trim() || (isUrdu ? 'گاڑی کا خرچہ' : 'Vehicle Expense'),
      source: 'manual'
    });

    setExpAmount('');
    setExpDesc('');
    setShowAddExpenseModal(false);
    refreshData();
    showToast(isUrdu ? 'گاڑی کا خرچہ کامیابی سے درج ہو گیا!' : 'Expense recorded successfully!');
  };

  // Handlers - Vehicle Income
  const handleAddVehicleIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(incAmount);
    if (!amt || amt <= 0) return;
    const vNo = incVehicleNo.trim() || (vehicles.length > 0 ? vehicles[0].reg : 'LHR-7860');

    addVehicleIncome({
      vehicleNo: vNo,
      date: new Date().toISOString().slice(0, 10),
      amount: amt,
      partyName: incPartyName.trim(),
      description: incDesc.trim() || (isUrdu ? 'کرایہ آمدن' : 'Freight Income'),
      source: 'manual'
    });

    setIncAmount('');
    setIncPartyName('');
    setIncDesc('');
    setShowAddIncomeModal(false);
    refreshData();
    showToast(isUrdu ? 'گاڑی کی آمدن کامیابی سے درج ہو گئی!' : 'Income recorded successfully!');
  };

  // WhatsApp & Phone Calling
  const handleSendPartyWhatsApp = (party: LedgerParty) => {
    const text = formatPartyWhatsAppReminder(party, lang);
    const clean = getCleanPhoneForWhatsApp(party.phone);
    const url = clean 
      ? `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    try {
      window.open(url, '_blank');
    } catch {
      window.location.href = url;
    }
  };

  const handleSendBrokerWhatsApp = (broker: LedgerBroker, tx?: BrokerTransaction) => {
    const text = formatBrokerWhatsAppReminder(broker, tx, lang);
    const clean = getCleanPhoneForWhatsApp(broker.phone);
    const url = clean 
      ? `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    try {
      window.open(url, '_blank');
    } catch {
      window.location.href = url;
    }
  };

  const handleDirectCall = (phone?: string) => {
    if (!phone) return;
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      {/* Header Banner */}
      <div className="bg-[#162A4D] text-white p-4 sm:p-5 rounded-3xl shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <BookOpen className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <span>{isUrdu ? 'حساب کتاب و لیجر سسٹم' : 'Ledger & Account System'}</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                {isUrdu ? 'مفت و محفوظ' : 'Free & Secure'}
              </span>
            </h1>
            <p className="text-xs text-white/80">
              {isUrdu 
                ? 'پارٹی کھاتہ، بروکر کمیشن، گاڑیوں کا نفع و نقصان اور رسید اسکیننگ' 
                : 'Party Ledger, Broker Commission, Vehicle Profit/Loss & Receipt OCR'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            refreshData();
            showToast(isUrdu ? 'کھاتہ کا تازہ ترین ڈیٹا لوڈ ہو گیا' : 'Ledger synced');
          }}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer border border-white/20 shrink-0"
          title={isUrdu ? 'تازہ کریں' : 'Refresh'}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#f0f0e4] rounded-2xl border border-[#d5d5c5]">
        <button
          type="button"
          onClick={() => setSubTab('parties')}
          className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'parties'
              ? 'bg-[#162A4D] text-white shadow-xs'
              : 'text-[#4a4a35] hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isUrdu ? 'پارٹی کھاتہ' : 'Party Ledger'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('brokers')}
          className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'brokers'
              ? 'bg-[#162A4D] text-white shadow-xs'
              : 'text-[#4a4a35] hover:bg-white/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>{isUrdu ? 'بروکر کھاتہ' : 'Broker Ledger'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('vehicleProfitLoss')}
          className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            subTab === 'vehicleProfitLoss'
              ? 'bg-[#162A4D] text-white shadow-xs'
              : 'text-[#4a4a35] hover:bg-white/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{isUrdu ? 'گاڑی نفع / نقصان' : 'Vehicle P&L'}</span>
        </button>
      </div>

      {/* Toast Notification */}
      {feedbackToast && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 p-2.5 rounded-2xl text-xs font-bold text-center shadow-xs animate-in fade-in">
          {feedbackToast}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. PARTY LEDGER (کھاتہ پارٹی) */}
      {/* ========================================================= */}
      {subTab === 'parties' && (
        <div className="space-y-4">
          {/* Top Parties Ranking Widget (Feature Requirement #3) */}
          {topParties.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 p-4 rounded-3xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-600" />
                  <span>{isUrdu ? 'سب سے زیادہ کام کروانے والی ٹاپ پارٹیز (Top Parties Ranking)' : 'Top Parties by Charged Volume'}</span>
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {isUrdu ? 'کاروباری حجم' : 'Volume Share'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {topParties.map((tp) => (
                  <div
                    key={tp.id}
                    className="bg-white/90 p-3 rounded-2xl border border-amber-200 flex items-center justify-between gap-2 shadow-2xs hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        tp.rank === 1 ? 'bg-amber-400 text-amber-950' : tp.rank === 2 ? 'bg-slate-300 text-slate-800' : tp.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tp.rank}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{tp.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Rs {tp.totalCharged.toLocaleString()} ({tp.percentageShare}%)
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-mono font-black ${
                        tp.runningBalance > 0 ? 'text-emerald-700' : tp.runningBalance < 0 ? 'text-amber-700' : 'text-slate-500'
                      }`}>
                        {tp.runningBalance > 0 ? `+${tp.runningBalance.toLocaleString()}` : tp.runningBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Bar & Add Party Button */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-white border-2 border-[#d5d5c5] rounded-2xl px-3 py-2 shadow-2xs focus-within:border-[#162A4D]">
              <Search className="w-4 h-4 text-[#8e8e75] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'پارٹی کا نام، فون یا شہر تلاش کریں...' : 'Search party by name, city, phone...'}
                className="w-full bg-transparent text-xs sm:text-sm text-[#2b2b1f] focus:outline-none px-2 font-bold"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAddPartyModal(true)}
              className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'نئی پارٹی' : 'Add Party'}</span>
            </button>
          </div>

          {/* Parties List */}
          {filteredParties.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-[#d5d5c5] text-center space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {isUrdu ? 'کوئی پارٹی کھاتہ موجود نہیں ہے۔' : 'No party accounts found.'}
              </p>
              <p className="text-xs text-slate-400">
                {isUrdu ? 'اوپر "نئی پارٹی" کے بٹن پر کلک کر کے کھاتہ شروع کریں۔' : 'Click "Add Party" above to create an account.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredParties.map((party) => {
                const bal = party.runningBalance;
                const isReceivable = bal > 0;
                const isPayable = bal < 0;

                return (
                  <div
                    key={party.id}
                    className="bg-white p-4 rounded-3xl border-2 border-[#e0e0d2] shadow-2xs hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-black text-sm sm:text-base text-slate-900 truncate">
                          {party.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                          {party.city && <span>📍 {party.city}</span>}
                          {party.phone && <span>📞 {party.phone}</span>}
                        </p>
                      </div>

                      {/* Running Balance Badge */}
                      <div className={`px-3 py-1 rounded-2xl text-right shrink-0 border ${
                        isReceivable
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : isPayable
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}>
                        <span className="text-[10px] font-bold block opacity-80">
                          {isReceivable ? (isUrdu ? 'واجب الوصول (لینے ہیں)' : 'Receivable') : isPayable ? (isUrdu ? 'ایڈوانس (دینے ہیں)' : 'Payable/Advance') : (isUrdu ? 'حساب بے باق' : 'Clear')}
                        </span>
                        <span className="font-mono font-black text-sm sm:text-base">
                          Rs {Math.abs(bal).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Stats summary */}
                    <div className="grid grid-cols-2 gap-2 p-2 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isUrdu ? 'کل چارج شدہ کرایہ:' : 'Total Charged:'}</span>
                        <span className="font-mono font-bold text-slate-700">Rs {(party.totalCharged || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{isUrdu ? 'کل وصول شدہ رقم:' : 'Total Received:'}</span>
                        <span className="font-mono font-bold text-emerald-700">Rs {(party.totalReceived || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons: Call, WhatsApp Reminder, Add Entry, History */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {party.phone && (
                        <button
                          type="button"
                          onClick={() => handleDirectCall(party.phone)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title={isUrdu ? 'کال کریں' : 'Call'}
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span className="hidden sm:inline">{isUrdu ? 'کال' : 'Call'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSendPartyWhatsApp(party)}
                        className="py-1.5 px-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1b7e3e] border border-[#25D366]/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        title={isUrdu ? 'واٹس ایپ یاد دہانی' : 'WhatsApp Reminder'}
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>{isUrdu ? 'واٹس ایپ یاد دہانی' : 'WhatsApp'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAddPartyTxModal(party.id)}
                        className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'اندراج' : 'Entry'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPartyHistory(party.id)}
                        className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'کھاتہ تفصیل' : 'History'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(isUrdu ? `کیا آپ واقعی ${party.name} کا کھاتہ حذف کرنا چاہتے ہیں؟` : `Delete party ${party.name}?`)) {
                            deleteParty(party.id);
                            refreshData();
                            showToast(isUrdu ? 'پارٹی کھاتہ حذف کر دیا گیا' : 'Party deleted');
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 transition-all cursor-pointer ml-auto"
                        title={isUrdu ? 'حذف کریں' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BROKER LEDGER (بروکر کھاتہ) */}
      {/* ========================================================= */}
      {subTab === 'brokers' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-white border-2 border-[#d5d5c5] rounded-2xl px-3 py-2 shadow-2xs focus-within:border-[#162A4D]">
              <Search className="w-4 h-4 text-[#8e8e75] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'بروکر یا ایجنٹ کا نام تلاش کریں...' : 'Search broker by name, phone...'}
                className="w-full bg-transparent text-xs sm:text-sm text-[#2b2b1f] focus:outline-none px-2 font-bold"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAddBrokerModal(true)}
              className="py-2.5 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isUrdu ? 'نیا بروکر' : 'Add Broker'}</span>
            </button>
          </div>

          {/* Brokers List */}
          {filteredBrokers.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-[#d5d5c5] text-center space-y-2">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {isUrdu ? 'کوئی بروکر کھاتہ موجود نہیں ہے۔' : 'No broker accounts found.'}
              </p>
              <p className="text-xs text-slate-400">
                {isUrdu ? 'اوپر "نیا بروکر" بٹن دبائیں اور کمیشن کا حساب محفوظ کریں۔' : 'Click "Add Broker" to manage commissions and loads.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredBrokers.map((broker) => {
                const unpaid = broker.unpaidCommission || 0;

                return (
                  <div
                    key={broker.id}
                    className="bg-white p-4 rounded-3xl border-2 border-[#e0e0d2] shadow-2xs hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-sm sm:text-base text-slate-900 truncate">
                          {broker.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2">
                          {broker.city && <span>📍 {broker.city}</span>}
                          {broker.phone && <span>📞 {broker.phone}</span>}
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-2xl text-right">
                        <span className="text-[10px] font-bold text-blue-800 block">
                          {isUrdu ? 'غیر ادا شدہ کمیشن:' : 'Unpaid Commission:'}
                        </span>
                        <span className={`font-mono font-black text-sm sm:text-base ${
                          unpaid > 0 ? 'text-amber-700' : 'text-slate-600'
                        }`}>
                          Rs {unpaid.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 bg-[#fdfbf7] rounded-2xl border border-[#ecece0] text-[11px] flex items-center justify-between">
                      <span className="text-slate-500">{isUrdu ? 'کل طے شدہ کمیشن:' : 'Total Commission:'}</span>
                      <span className="font-mono font-bold text-slate-800">Rs {(broker.totalCommission || 0).toLocaleString()}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {broker.phone && (
                        <button
                          type="button"
                          onClick={() => handleDirectCall(broker.phone)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          title={isUrdu ? 'کال کریں' : 'Call'}
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSendBrokerWhatsApp(broker)}
                        className="py-1.5 px-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#1b7e3e] border border-[#25D366]/40 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAddBrokerTxModal(broker.id)}
                        className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'نیا لوڈ / کمیشن' : 'Add Load'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBrokerHistory(broker.id)}
                        className="py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'ہسٹری' : 'History'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(isUrdu ? `حذف کریں ${broker.name}?` : `Delete broker ${broker.name}?`)) {
                            deleteBroker(broker.id);
                            refreshData();
                            showToast(isUrdu ? 'بروکر کھاتہ حذف کر دیا گیا' : 'Broker deleted');
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 transition-all cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. VEHICLE PROFIT & LOSS (گاڑی نفع و نقصان) */}
      {/* ========================================================= */}
      {subTab === 'vehicleProfitLoss' && (
        <div className="space-y-4">
          {/* Controls: Vehicle selector & Date Range Picker */}
          <div className="bg-white p-4 rounded-3xl border-2 border-[#e0e0d2] shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Vehicle Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isUrdu ? 'گاڑی منتخب کریں:' : 'Select Vehicle:'}
                </label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#162A4D]"
                >
                  <option value="all">{isUrdu ? 'تمام گاڑیاں (مجموعی بیڑا)' : 'All Vehicles (Entire Fleet)'}</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.reg}>{v.reg} - {v.model}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Selector */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  {isUrdu ? 'مدت منتخب کریں (Date Range):' : 'Select Date Range:'}
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'today', labelUr: 'آج', labelEn: 'Today' },
                    { id: 'week', labelUr: '7 دن', labelEn: '7 Days' },
                    { id: 'month', labelUr: 'رواں ماہ', labelEn: 'Month' },
                    { id: 'custom', labelUr: 'مخصوص', labelEn: 'Custom' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDateRangeType(tab.id as any)}
                      className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        dateRangeType === tab.id
                          ? 'bg-[#162A4D] text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isUrdu ? tab.labelUr : tab.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Date Pickers */}
            {dateRangeType === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">{isUrdu ? 'تاریخ آغاز:' : 'From:'}</span>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#d5d5c5] rounded-xl px-2 py-1.5 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block mb-0.5">{isUrdu ? 'تاریخ اختتام:' : 'To:'}</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-[#fdfbf7] border border-[#d5d5c5] rounded-xl px-2 py-1.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Profit / Loss KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Total Income */}
            <div className="bg-white p-3.5 rounded-3xl border-2 border-[#e0e0d2] shadow-2xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isUrdu ? 'کل حاصل آمدن' : 'Total Income'}
              </span>
              <span className="font-mono font-black text-base sm:text-lg text-emerald-700 block">
                Rs {pnlSummary.totalIncome.toLocaleString()}
              </span>
            </div>

            {/* 2. Total Expenses */}
            <div className="bg-white p-3.5 rounded-3xl border-2 border-[#e0e0d2] shadow-2xs text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">
                {isUrdu ? 'کل اخراجات' : 'Total Expenses'}
              </span>
              <span className="font-mono font-black text-base sm:text-lg text-red-600 block">
                Rs {pnlSummary.totalExpenses.toLocaleString()}
              </span>
            </div>

            {/* 3. Net Profit / Loss */}
            <div className={`p-3.5 rounded-3xl border-2 shadow-2xs text-center space-y-1 ${
              pnlSummary.isProfit ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
            }`}>
              <span className="text-[10px] font-bold block uppercase opacity-80">
                {pnlSummary.isProfit ? (isUrdu ? 'خالص نفع / بچت' : 'Net Profit') : (isUrdu ? 'خسارہ' : 'Net Loss')}
              </span>
              <span className={`font-mono font-black text-base sm:text-lg block ${
                pnlSummary.isProfit ? 'text-emerald-700' : 'text-red-700'
              }`}>
                Rs {Math.abs(pnlSummary.netProfit).toLocaleString()}
              </span>
            </div>

            {/* 4. Profit Per KM */}
            <div className="bg-indigo-50 border-2 border-indigo-200 p-3.5 rounded-3xl shadow-2xs text-center space-y-1 text-indigo-950">
              <span className="text-[10px] font-bold block uppercase opacity-80">
                {isUrdu ? 'نفع فی کلومیٹر' : 'Profit Per KM'}
              </span>
              <span className="font-mono font-black text-base sm:text-lg text-indigo-800 block">
                {pnlSummary.profitPerKm === 'N/A' ? 'N/A' : `Rs ${pnlSummary.profitPerKm} / KM`}
              </span>
            </div>
          </div>

          {/* Expense Breakdown & Quick Entry Actions */}
          <div className="bg-white p-4 rounded-3xl border-2 border-[#e0e0d2] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-xs sm:text-sm text-slate-900">
                {isUrdu ? 'تفصیلی اخراجات بریک ڈاؤن:' : 'Expense Breakdown:'}
              </h3>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddIncomeModal(true)}
                  className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'آمدن شامل کریں' : 'Add Income'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(true)}
                  className="py-1.5 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'خرچہ درج کریں' : 'Add Expense'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[10px] text-amber-800 block font-bold">{isUrdu ? 'ایندھن (ڈیزل):' : 'Fuel:'}</span>
                <span className="font-mono font-black text-sm text-amber-950">Rs {pnlSummary.fuelExpenses.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-200">
                <span className="text-[10px] text-blue-800 block font-bold">{isUrdu ? 'ٹول پلازہ ٹیکس:' : 'Tolls:'}</span>
                <span className="font-mono font-black text-sm text-blue-950">Rs {pnlSummary.tollExpenses.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-2xl border border-purple-200">
                <span className="text-[10px] text-purple-800 block font-bold">{isUrdu ? 'مرمت و دیگر:' : 'Repairs & Misc:'}</span>
                <span className="font-mono font-black text-sm text-purple-950">Rs {pnlSummary.otherExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW PARTY */}
      {/* ========================================================= */}
      {showAddPartyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border-2 border-[#162A4D] space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-base text-slate-900">
                {isUrdu ? 'نئی پارٹی کھاتہ بنائیں' : 'Create New Party Account'}
              </h3>
              <button type="button" onClick={() => setShowAddPartyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParty} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'پارٹی کا نام:' : 'Party Name:'} *</label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: چوہدری ٹریڈرز' : 'e.g. Chaudhry Traders'}
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold focus:border-[#162A4D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'موبائل نمبر:' : 'Phone:'}</label>
                  <input
                    type="tel"
                    value={partyPhone}
                    onChange={(e) => setPartyPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-[#162A4D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'شہر:' : 'City:'}</label>
                  <input
                    type="text"
                    value={partyCity}
                    onChange={(e) => setPartyCity(e.target.value)}
                    placeholder={isUrdu ? 'لاہور' : 'Lahore'}
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold focus:border-[#162A4D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isUrdu ? 'ابتدائی بقایا رقم (روپے) [مثبت = لینا ہے]:' : 'Opening Balance (PKR) [+ = Receivable]:'}
                </label>
                <input
                  type="number"
                  value={partyOpeningBal}
                  onChange={(e) => setPartyOpeningBal(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:border-[#162A4D] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPartyModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD PARTY TRANSACTION */}
      {/* ========================================================= */}
      {showAddPartyTxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border-2 border-[#162A4D] space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-base text-slate-900">
                {isUrdu ? 'کھاتہ اندراج (Debit / Credit)' : 'Record Transaction'}
              </h3>
              <button type="button" onClick={() => setShowAddPartyTxModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartyTx} className="space-y-3">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('debit')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    txType === 'debit'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>{isUrdu ? 'کرایہ / بل (Debit)' : 'Billed / Debit'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTxType('credit')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                    txType === 'credit'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>{isUrdu ? 'وصولی / جمع (Credit)' : 'Received / Credit'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'رقم (روپے):' : 'Amount (PKR):'} *</label>
                <input
                  type="number"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-sm font-mono font-black focus:border-[#162A4D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'تفصیل:' : 'Description:'}</label>
                <input
                  type="text"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: کرایہ کراچی مال' : 'e.g. Karachi freight payment'}
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold focus:border-[#162A4D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'حوالہ نمبر:' : 'Ref / Invoice #:'}</label>
                  <input
                    type="text"
                    value={txRefNo}
                    onChange={(e) => setTxRefNo(e.target.value)}
                    placeholder="INV-102"
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'گاڑی نمبر:' : 'Vehicle #:'}</label>
                  <input
                    type="text"
                    value={txVehicleNo}
                    onChange={(e) => setTxVehicleNo(e.target.value)}
                    placeholder="LHR-7860"
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPartyTxModal(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  {isUrdu ? 'اندراج کریں' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PARTY HISTORY */}
      {/* ========================================================= */}
      {selectedPartyHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl p-5 shadow-2xl border-2 border-[#162A4D] flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {parties.find(p => p.id === selectedPartyHistory)?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'مکمل کھاتہ تفصیل و ٹرانزیکشن ہسٹری' : 'Account Statement & Transaction History'}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedPartyHistory(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {partyTxs.filter(t => t.partyId === selectedPartyHistory).length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-slate-400">
                  {isUrdu ? 'اس پارٹی کا ابھی تک کوئی اندراج موجود نہیں ہے۔' : 'No transactions recorded yet.'}
                </div>
              ) : (
                partyTxs.filter(t => t.partyId === selectedPartyHistory).map(tx => (
                  <div
                    key={tx.id}
                    className="p-3 bg-[#fdfbf7] rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          tx.type === 'debit' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tx.type === 'debit' ? (isUrdu ? 'کرایہ / بل' : 'Debit') : (isUrdu ? 'وصولی' : 'Credit')}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{tx.description}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        📅 {tx.date} {tx.referenceNo ? `| Ref: ${tx.referenceNo}` : ''} {tx.vehicleNo ? `| 🚛 ${tx.vehicleNo}` : ''}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-black text-sm ${
                        tx.type === 'debit' ? 'text-red-600' : 'text-emerald-700'
                      }`}>
                        {tx.type === 'debit' ? `+Rs ${tx.amount.toLocaleString()}` : `-Rs ${tx.amount.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isUrdu ? 'مجموعی بقایا:' : 'Net Balance:'}</span>
              <span className="font-mono font-black text-sm text-slate-900">
                Rs {(parties.find(p => p.id === selectedPartyHistory)?.runningBalance || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD BROKER */}
      {/* ========================================================= */}
      {showAddBrokerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border-2 border-blue-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-base text-slate-900">
                {isUrdu ? 'نیا بروکر / کمیشن ایجنٹ درج کریں' : 'Register New Broker'}
              </h3>
              <button type="button" onClick={() => setShowAddBrokerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroker} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'بروکر کا نام:' : 'Broker Name:'} *</label>
                <input
                  type="text"
                  required
                  value={brokerName}
                  onChange={(e) => setBrokerName(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: ملک ندیم بروکر' : 'e.g. Malik Nadeem Broker'}
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs sm:text-sm font-bold focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'موبائل نمبر:' : 'Phone:'}</label>
                  <input
                    type="tel"
                    value={brokerPhone}
                    onChange={(e) => setBrokerPhone(e.target.value)}
                    placeholder="03001234567"
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'شہر / اڈا:' : 'City / Stand:'}</label>
                  <input
                    type="text"
                    value={brokerCity}
                    onChange={(e) => setBrokerCity(e.target.value)}
                    placeholder={isUrdu ? 'فیصل آباد' : 'Faisalabad'}
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBrokerModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Broker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ADD BROKER TRANSACTION */}
      {/* ========================================================= */}
      {showAddBrokerTxModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border-2 border-blue-900 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-base text-slate-900">
                {isUrdu ? 'بروکر لوڈ و کمیشن اندراج' : 'Record Broker Load & Commission'}
              </h3>
              <button type="button" onClick={() => setShowAddBrokerTxModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBrokerTx} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'لوڈ کی تفصیل:' : 'Load Description:'} *</label>
                <input
                  type="text"
                  required
                  value={bLoadDesc}
                  onChange={(e) => setBLoadDesc(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: ٹیکسٹائل اسپننگ دھاگہ (لاہور تا کراچی)' : 'e.g. Yarn Load (LHR to KHI)'}
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'کمیشن رقم (روپے):' : 'Commission (PKR):'} *</label>
                  <input
                    type="number"
                    required
                    value={bCommission}
                    onChange={(e) => setBCommission(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'گاڑی نمبر:' : 'Vehicle #:'}</label>
                  <input
                    type="text"
                    value={bVehicleNo}
                    onChange={(e) => setBVehicleNo(e.target.value)}
                    placeholder="LHR-7860"
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'ادائیگی کا اسٹیٹس:' : 'Payment Status:'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBStatus('unpaid')}
                    className={`py-2 px-3 rounded-xl text-xs font-black ${
                      bStatus === 'unpaid' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isUrdu ? 'غیر ادا شدہ (بقایا)' : 'Unpaid'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBStatus('paid')}
                    className={`py-2 px-3 rounded-xl text-xs font-black ${
                      bStatus === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isUrdu ? 'ادا شدہ (Paid)' : 'Paid'}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBrokerTxModal(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  {isUrdu ? 'محفوظ کریں' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: BROKER HISTORY & TOGGLE */}
      {/* ========================================================= */}
      {selectedBrokerHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl p-5 shadow-2xl border-2 border-blue-900 flex flex-col space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {brokers.find(b => b.id === selectedBrokerHistory)?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'بروکر کے لوڈز اور کمیشن کی تفصیل' : 'Broker Loads and Commission Status'}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedBrokerHistory(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {brokerTxs.filter(t => t.brokerId === selectedBrokerHistory).length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-slate-400">
                  {isUrdu ? 'اس بروکر کا کوئی لوڈ ریکارڈ موجود نہیں ہے۔' : 'No loads recorded yet.'}
                </div>
              ) : (
                brokerTxs.filter(t => t.brokerId === selectedBrokerHistory).map(tx => (
                  <div
                    key={tx.id}
                    className="p-3 bg-[#fdfbf7] rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 truncate">{tx.loadDescription}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        📅 {tx.date} {tx.vehicleNo ? `| 🚛 ${tx.vehicleNo}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-black text-sm text-slate-900">
                        Rs {tx.commission.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          toggleBrokerTransactionStatus(tx.id);
                          refreshData();
                        }}
                        className={`px-2 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                          tx.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {tx.status === 'paid' ? (isUrdu ? 'ادا شدہ ✓' : 'Paid ✓') : (isUrdu ? 'بقایا ⏳' : 'Unpaid ⏳')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: ADD VEHICLE EXPENSE (WITH RECEIPT OCR!) */}
      {/* ========================================================= */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border-2 border-red-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-base text-slate-900">
                {isUrdu ? 'گاڑی کا خرچہ درج کریں' : 'Record Vehicle Expense'}
              </h3>
              <button type="button" onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt OCR Scanner Box */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-amber-900 block flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isUrdu ? 'رسید / پرچی کیمرہ اسکین' : 'Receipt OCR Scanner'}</span>
                </span>
                <span className="text-[10px] text-amber-700 block">
                  {isUrdu ? 'پٹرول پمپ پرچی یا مرمت کا بل اسکین کریں' : 'Scan pump slip or workshop receipt'}
                </span>
              </div>
              <CameraOcrInput
                mode="receipt"
                lang={lang}
                onScanResult={(amount) => {
                  setExpAmount(amount);
                  showToast(isUrdu ? `رسید سے رقم مل گئی: Rs. ${amount}` : `Scanned amount: Rs. ${amount}`);
                }}
              />
            </div>

            <form onSubmit={handleAddVehicleExpense} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'گاڑی نمبر:' : 'Vehicle #:'}</label>
                  <input
                    type="text"
                    value={expVehicleNo}
                    onChange={(e) => setExpVehicleNo(e.target.value)}
                    placeholder={vehicles[0]?.reg || 'LHR-7860'}
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'خرچہ کی قسم:' : 'Category:'}</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                  >
                    <option value="fuel">{isUrdu ? 'ڈیزل / ایندھن' : 'Fuel'}</option>
                    <option value="toll">{isUrdu ? 'ٹول ٹیکس' : 'Toll'}</option>
                    <option value="repair">{isUrdu ? 'مرمت و کام' : 'Repair'}</option>
                    <option value="challan">{isUrdu ? 'چالان / جرمانہ' : 'Challan'}</option>
                    <option value="driver">{isUrdu ? 'ڈرائیور خوراک' : 'Driver'}</option>
                    <option value="other">{isUrdu ? 'دیگر خرچہ' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'رقم (روپے):' : 'Amount (PKR):'} *</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-sm font-mono font-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'تفصیل / نوٹ:' : 'Description / Note:'}</label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: آئل فلٹر تبدیلی' : 'e.g. Oil filter change'}
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  {isUrdu ? 'خرچہ محفوظ کریں' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: ADD VEHICLE INCOME */}
      {/* ========================================================= */}
      {showAddIncomeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border-2 border-emerald-700 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-black text-base text-slate-900">
                {isUrdu ? 'گاڑی کی کرایہ آمدن درج کریں' : 'Record Vehicle Income'}
              </h3>
              <button type="button" onClick={() => setShowAddIncomeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicleIncome} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'گاڑی نمبر:' : 'Vehicle #:'}</label>
                  <input
                    type="text"
                    value={incVehicleNo}
                    onChange={(e) => setIncVehicleNo(e.target.value)}
                    placeholder={vehicles[0]?.reg || 'LHR-7860'}
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'پارٹی کا نام:' : 'Party Name:'}</label>
                  <input
                    type="text"
                    value={incPartyName}
                    onChange={(e) => setIncPartyName(e.target.value)}
                    placeholder={isUrdu ? 'الفلاح کاٹن' : 'Al-Falah Cotton'}
                    className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'کرایہ رقم (روپے):' : 'Amount (PKR):'} *</label>
                <input
                  type="number"
                  required
                  value={incAmount}
                  onChange={(e) => setIncAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-sm font-mono font-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isUrdu ? 'تفصیل:' : 'Description:'}</label>
                <input
                  type="text"
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  placeholder={isUrdu ? 'مثلاً: سمندری تا کراچی کرایہ' : 'e.g. Samundri to Karachi freight'}
                  className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddIncomeModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  {isUrdu ? 'منسوخ' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  {isUrdu ? 'آمدن محفوظ کریں' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
