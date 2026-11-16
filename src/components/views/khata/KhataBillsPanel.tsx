import React, { useMemo, useState } from 'react';
import {
  BiltyRecord,
  KhataBill,
  KhataBillLineItem,
  KhataBillStatus,
  Language,
  LedgerAccount,
  Vehicle
} from '../../../types';
import {
  calculateBillTotals,
  createBillDraftFromBilty,
  deleteBill,
  formatBillWhatsAppMessage,
  getAllBills,
  getNextBillNumber,
  getTodayIsoDate,
  receiveBillPayment,
  saveOrUpdateBill
} from '../../../utils/khataModulesStorage';
import {
  formatPhoneForDisplay,
  getLedgerAccounts,
  normalizePakistaniPhone
} from '../../../utils/ledgerStorage';
import { downloadOrSharePdf, generateBillPdf } from '../../../utils/khataPdf';
import {
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  Filter,
  MessageCircle,
  Pencil,
  Plus,
  Receipt,
  Search,
  Sparkles,
  Trash2,
  Wallet,
  X
} from 'lucide-react';

interface KhataBillsPanelProps {
  lang: Language;
  businessName?: string;
  vehicles?: Vehicle[];
  bilties?: BiltyRecord[];
  isBiltyAuthorized?: boolean;
  onDataChanged?: () => void;
  onCheckGuestSave?: (action: () => void, description?: string) => void;
}

export const KhataBillsPanel: React.FC<KhataBillsPanelProps> = ({
  lang,
  businessName,
  vehicles = [],
  bilties = [],
  isBiltyAuthorized = false,
  onDataChanged,
  onCheckGuestSave
}) => {
  const isUrdu = lang === 'ur';
  const [bills, setBills] = useState<KhataBill[]>(() => getAllBills());
  const [accounts, setAccounts] = useState<LedgerAccount[]>(() => getLedgerAccounts('party'));

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | KhataBillStatus>('all');
  const [partyFilter, setPartyFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [editingBill, setEditingBill] = useState<KhataBill | null>(null);
  const [draftFromDoc, setDraftFromDoc] = useState<Partial<KhataBill> | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [payingBill, setPayingBill] = useState<KhataBill | null>(null);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const reload = () => {
    setBills(getAllBills());
    setAccounts(getLedgerAccounts('party'));
    onDataChanged?.();
  };

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const uniqueParties = useMemo(() => {
    const set = new Set<string>();
    bills.forEach(b => b.partyName && set.add(b.partyName));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (partyFilter !== 'all' && b.partyName !== partyFilter) return false;
      if (dateFrom && b.date < dateFrom) return false;
      if (dateTo && b.date > dateTo) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hit =
          b.billNumber.toLowerCase().includes(q) ||
          b.partyName.toLowerCase().includes(q) ||
          (b.vehicleNo || '').toLowerCase().includes(q) ||
          b.lineItems.some(li => li.description.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [bills, statusFilter, partyFilter, dateFrom, dateTo, searchQuery]);

  const summary = useMemo(() => {
    return filteredBills.reduce(
      (acc, b) => {
        acc.total += b.total;
        acc.collected += b.advance;
        acc.pending += b.balance;
        return acc;
      },
      { total: 0, collected: 0, pending: 0 }
    );
  }, [filteredBills]);

  const handleShareWhatsApp = (bill: KhataBill) => {
    const text = formatBillWhatsAppMessage(bill, businessName, lang);
    const cleanPhone = normalizePakistaniPhone(bill.partyPhone);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') window.open(url, '_blank');
  };

  const handleOpenCreateFromBilty = (record: BiltyRecord) => {
    if (!isBiltyAuthorized) return;
    const draft = createBillDraftFromBilty(record, isBiltyAuthorized);
    if (!draft) return;
    setEditingBill(null);
    setDraftFromDoc(draft);
    setShowDocPicker(false);
    setShowBillModal(true);
  };

  return (
    <div className="space-y-3.5 font-serif">
      {toastMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold px-3.5 py-2.5 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
          <span className="text-[11px] font-bold text-slate-500 block">
            {isUrdu ? 'کل بل رقم' : 'Total Billed'}
          </span>
          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono" dir="ltr">
            PKR {Math.round(summary.total).toLocaleString('en-US')}
          </div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
            {isUrdu ? 'وصول شدہ' : 'Collected'}
          </span>
          <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono" dir="ltr">
            PKR {Math.round(summary.collected).toLocaleString('en-US')}
          </div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">
            {isUrdu ? 'بقایا واجب الوصول' : 'Pending'}
          </span>
          <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 font-mono" dir="ltr">
            PKR {Math.round(summary.pending).toLocaleString('en-US')}
          </div>
        </div>
      </div>

      {/* Action & Search Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'بل نمبر، پارٹی یا گاڑی تلاش کریں...' : 'Search bill #, party, vehicle...'}
            className="w-full min-h-[44px] pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters(v => !v)}
          className={`min-h-[44px] px-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
            showFilters
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>{isUrdu ? 'فلٹر' : 'Filter'}</span>
        </button>

        {isBiltyAuthorized && bilties.length > 0 && (
          <button
            type="button"
            onClick={() => setShowDocPicker(true)}
            className="min-h-[44px] px-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isUrdu ? 'بلٹی سے بل بنائیں' : 'Create Bill from Bilty'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setEditingBill(null);
            setDraftFromDoc(null);
            setShowBillModal(true);
          }}
          className="min-h-[44px] px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نیا بل' : 'New Bill'}</span>
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'unpaid', 'partial', 'paid'] as const).map(st => {
          const labels = {
            all: isUrdu ? 'تمام' : 'All',
            unpaid: isUrdu ? 'غیر ادا شدہ' : 'Unpaid',
            partial: isUrdu ? 'جزوی ادا' : 'Partial',
            paid: isUrdu ? 'ادا شدہ' : 'Paid'
          };
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {labels[st]}
            </button>
          );
        })}
      </div>

      {/* Expandable Party + Date Range Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              {isUrdu ? 'پارٹی فلٹر' : 'Filter by Party'}
            </label>
            <select
              value={partyFilter}
              onChange={e => setPartyFilter(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">{isUrdu ? 'تمام پارٹیاں' : 'All Parties'}</option>
              {uniqueParties.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              {isUrdu ? 'از تاریخ' : 'From Date'}
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              {isUrdu ? 'تا تاریخ' : 'To Date'}
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      )}

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {isUrdu ? 'کوئی بل ریکارڈ نہیں ملا' : 'No Bills Found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            {isUrdu ? 'پارٹی یا کرایہ کے لیے نیا بل بنائیں اور پی ڈی ایف شیئر کریں' : 'Create an invoice with freight lines, advance, and party ledger sync'}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingBill(null);
              setDraftFromDoc(null);
              setShowBillModal(true);
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
          >
            {isUrdu ? 'پہلا بل بنائیں' : 'Create First Bill'}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredBills.map(bill => {
            const statusColor =
              bill.status === 'paid'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : bill.status === 'partial'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
            const statusText =
              bill.status === 'paid'
                ? isUrdu ? 'ادا شدہ' : 'Paid'
                : bill.status === 'partial'
                ? isUrdu ? 'جزوی ادا' : 'Partial'
                : isUrdu ? 'غیر ادا شدہ' : 'Unpaid';

            return (
              <div
                key={bill.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-black font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg" dir="ltr">
                        {bill.billNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${statusColor}`}>
                        {statusText}
                      </span>
                      {bill.vehicleNo && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-mono">
                          {bill.vehicleNo}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 truncate">
                      {bill.partyName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {bill.date} • {bill.lineItems.length} {isUrdu ? 'آئٹمز' : 'line(s)'}
                      {bill.linkedDocNo ? ` • Ref ${bill.linkedDocNo}` : ''}
                    </p>
                  </div>

                  <div className="text-end shrink-0">
                    <div className="text-sm font-black font-mono text-slate-900 dark:text-white" dir="ltr">
                      PKR {bill.total.toLocaleString('en-US')}
                    </div>
                    <div className={`text-xs font-bold font-mono ${bill.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`} dir="ltr">
                      {bill.balance > 0
                        ? `${isUrdu ? 'بقایا:' : 'Bal:'} PKR ${bill.balance.toLocaleString('en-US')}`
                        : isUrdu ? 'مکمل وصول' : 'Cleared'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {bill.balance > 0 && (
                      <button
                        type="button"
                        onClick={() => setPayingBill(bill)}
                        className="min-h-[38px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>{isUrdu ? 'ادائیگی وصول کریں' : 'Receive Payment'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={async () => {
                        const { doc, filename } = generateBillPdf({ bill, businessName });
                        await downloadOrSharePdf(doc, filename);
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'پی ڈی ایف' : 'PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareWhatsApp(bill)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDraftFromDoc(null);
                        setEditingBill(bill);
                        setShowBillModal(true);
                      }}
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                      title={isUrdu ? 'تبدیل کریں' : 'Edit'}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(isUrdu ? `کیا آپ واقعی بل ${bill.billNumber} حذف کرنا چاہتے ہیں؟` : `Delete bill ${bill.billNumber}?`)) {
                          deleteBill(bill.id);
                          reload();
                        }
                      }}
                      className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"
                      title={isUrdu ? 'حذف کریں' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Bill Modal */}
      {showBillModal && (
        <BillFormModal
          lang={lang}
          existingBills={bills}
          accounts={accounts}
          vehicles={vehicles}
          initialBill={editingBill}
          initialDraft={draftFromDoc}
          onClose={() => {
            setShowBillModal(false);
            setEditingBill(null);
            setDraftFromDoc(null);
          }}
          onSave={billData => {
            const doSave = () => {
              saveOrUpdateBill(billData);
              setShowBillModal(false);
              setEditingBill(null);
              setDraftFromDoc(null);
              reload();
              showNotice(isUrdu ? 'بل کامیابی سے محفوظ ہو گیا' : 'Bill saved successfully');
            };
            if (onCheckGuestSave) {
              onCheckGuestSave(doSave, isUrdu ? 'بل محفوظ کرنے کے لیے سائن اِن یا گیسٹ موڈ جاری رکھیں' : 'Save bill to local & cloud ledger');
            } else {
              doSave();
            }
          }}
        />
      )}

      {/* Receive Payment Modal */}
      {payingBill && (
        <ReceivePaymentModal
          lang={lang}
          bill={payingBill}
          onClose={() => setPayingBill(null)}
          onConfirm={(amount, date, note) => {
            const res = receiveBillPayment(payingBill.id, amount, date, note);
            setPayingBill(null);
            reload();
            if (res) {
              showNotice(
                isUrdu
                  ? `PKR ${amount.toLocaleString()} وصولی ${res.account.name} کے کھاتہ میں درج ہو گئی`
                  : `PKR ${amount.toLocaleString()} posted to ${res.account.name}'s Khata`
              );
            }
          }}
        />
      )}

      {/* Authorised Document Picker Modal */}
      {showDocPicker && isBiltyAuthorized && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[82vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-amber-600" />
                <span>{isUrdu ? 'بلٹی منتخب کریں' : 'Select Bilty to Bill'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDocPicker(false)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {bilties.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleOpenCreateFromBilty(b)}
                  className="w-full text-start p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-slate-900 dark:text-white">{b.biltyNo}</span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">PKR {(b.total || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-0.5">
                    {b.receiverName || b.senderName} • {b.sendingCity} → {b.receivingCity}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{b.date} • {b.vehicleNo}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------- BILL FORM MODAL ----------------
const BillFormModal: React.FC<{
  lang: Language;
  existingBills: KhataBill[];
  accounts: LedgerAccount[];
  vehicles: Vehicle[];
  initialBill: KhataBill | null;
  initialDraft: Partial<KhataBill> | null;
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ lang, existingBills, accounts, vehicles, initialBill, initialDraft, onClose, onSave }) => {
  const isUrdu = lang === 'ur';
  const seed = initialBill || initialDraft;

  const [billNumber, setBillNumber] = useState(
    initialBill?.billNumber || getNextBillNumber(existingBills)
  );
  const [date, setDate] = useState(seed?.date || getTodayIsoDate());
  const [partyId, setPartyId] = useState(seed?.partyId || '');
  const [partyName, setPartyName] = useState(seed?.partyName || '');
  const [partyPhone, setPartyPhone] = useState(
    seed?.partyPhone ? formatPhoneForDisplay(seed.partyPhone) : ''
  );
  const [vehicleNo, setVehicleNo] = useState(seed?.vehicleNo || '');
  const [lineItems, setLineItems] = useState<KhataBillLineItem[]>(
    seed?.lineItems && seed.lineItems.length > 0
      ? seed.lineItems
      : [{ id: `line_${Date.now()}`, description: '', qty: 1, rate: 0, amount: 0 }]
  );
  const [extraCharges, setExtraCharges] = useState(String(seed?.extraCharges ?? 0));
  const [discount, setDiscount] = useState(String(seed?.discount ?? 0));
  const [advance, setAdvance] = useState(String(seed?.advance ?? 0));
  const [notes, setNotes] = useState(seed?.notes || '');

  const totals = useMemo(
    () =>
      calculateBillTotals(
        lineItems,
        parseFloat(extraCharges) || 0,
        parseFloat(discount) || 0,
        parseFloat(advance) || 0
      ),
    [lineItems, extraCharges, discount, advance]
  );

  const handleSelectParty = (accId: string) => {
    setPartyId(accId);
    const acc = accounts.find(a => a.id === accId);
    if (acc) {
      setPartyName(acc.name);
      if (acc.phone) setPartyPhone(formatPhoneForDisplay(acc.phone));
    }
  };

  const updateLine = (idx: number, field: keyof KhataBillLineItem, value: string) => {
    setLineItems(prev =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const next = { ...item };
        if (field === 'description') next.description = value;
        else if (field === 'qty') next.qty = Math.max(0, parseFloat(value) || 0);
        else if (field === 'rate') next.rate = Math.max(0, parseFloat(value) || 0);
        next.amount = Math.round(next.qty * next.rate * 100) / 100;
        return next;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) return;
    const validLines = lineItems.filter(l => l.description.trim() || l.amount > 0);
    if (validLines.length === 0) return;

    onSave({
      id: initialBill?.id,
      billNumber: billNumber.trim(),
      date,
      partyId: partyId || undefined,
      partyName: partyName.trim(),
      partyPhone: partyPhone.trim(),
      vehicleNo: vehicleNo.trim(),
      lineItems: validLines,
      extraCharges: Math.max(0, parseFloat(extraCharges) || 0),
      discount: Math.max(0, parseFloat(discount) || 0),
      advance: Math.max(0, parseFloat(advance) || 0),
      notes: notes.trim(),
      linkedDocId: seed?.linkedDocId,
      linkedDocNo: seed?.linkedDocNo
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>{initialBill ? (isUrdu ? 'بل تبدیل کریں' : 'Edit Bill') : (isUrdu ? 'نیا بل بنائیں' : 'Create Bill')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'بل نمبر' : 'Bill No.'}
              </label>
              <input
                type="text"
                required
                value={billNumber}
                onChange={e => setBillNumber(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'تاریخ' : 'Date'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {accounts.length > 0 && (
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'کھاتہ سے پارٹی منتخب کریں (اختیاری)' : 'Pick Khata Party (Optional)'}
              </label>
              <select
                value={partyId}
                onChange={e => handleSelectParty(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              >
                <option value="">{isUrdu ? '-- خود نام درج کریں --' : '-- Manual / Free Text --'}</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'پارٹی کا نام (لازمی)' : 'Party Name *'}
              </label>
              <input
                type="text"
                required
                value={partyName}
                onChange={e => setPartyName(e.target.value)}
                placeholder={isUrdu ? 'پارٹی یا کمپنی کا نام' : 'Party or Client Name'}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'موبائل / گاڑی نمبر' : 'Phone & Vehicle'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="tel"
                  value={partyPhone}
                  onChange={e => setPartyPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full min-h-[42px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  list="bill-vehicles-list"
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  placeholder="LHR-786"
                  className="w-full min-h-[42px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
                <datalist id="bill-vehicles-list">
                  {vehicles.map(v => (
                    <option key={v.id} value={v.reg} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                {isUrdu ? 'بل کی تفصیل / کرایہ لائنز' : 'Line Items / Freight Lines'}
              </span>
              <button
                type="button"
                onClick={() =>
                  setLineItems(prev => [
                    ...prev,
                    { id: `line_${Date.now()}_${prev.length}`, description: '', qty: 1, rate: 0, amount: 0 }
                  ])
                }
                className="text-xs font-bold text-emerald-600 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'لائن شامل کریں' : 'Add Line'}</span>
              </button>
            </div>

            {lineItems.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-1.5 items-center">
                <input
                  type="text"
                  value={item.description}
                  onChange={e => updateLine(idx, 'description', e.target.value)}
                  placeholder={isUrdu ? 'روٹ / تفصیل مال' : 'Route / item description'}
                  className="col-span-6 min-h-[38px] px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.qty || ''}
                  onChange={e => updateLine(idx, 'qty', e.target.value)}
                  placeholder="Qty"
                  className="col-span-2 min-h-[38px] px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.rate || ''}
                  onChange={e => updateLine(idx, 'rate', e.target.value)}
                  placeholder="Rate"
                  className="col-span-3 min-h-[38px] px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  disabled={lineItems.length <= 1}
                  onClick={() => setLineItems(prev => prev.filter((_, i) => i !== idx))}
                  className="col-span-1 flex items-center justify-center text-rose-500 disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'اضافی چارجز' : 'Extra Charges'}
              </label>
              <input
                type="number"
                min="0"
                value={extraCharges}
                onChange={e => setExtraCharges(e.target.value)}
                className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'رعایت' : 'Discount'}
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'پیشگی / وصول' : 'Advance / Paid'}
              </label>
              <input
                type="number"
                min="0"
                value={advance}
                onChange={e => setAdvance(e.target.value)}
                className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-600 dark:text-slate-300">{isUrdu ? 'کل بل:' : 'Total:'} </span>
              <strong className="font-mono text-slate-900 dark:text-white">PKR {totals.total.toLocaleString('en-US')}</strong>
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-300">{isUrdu ? 'بقایا:' : 'Balance:'} </span>
              <strong className="font-mono text-rose-600 dark:text-rose-400">PKR {totals.balance.toLocaleString('en-US')}</strong>
            </div>
          </div>

          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={isUrdu ? 'نوٹس (اختیاری)' : 'Notes (Optional)'}
            className="w-full min-h-[40px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[46px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[46px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              {isUrdu ? 'بل محفوظ کریں' : 'Save Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- RECEIVE PAYMENT MODAL ----------------
const ReceivePaymentModal: React.FC<{
  lang: Language;
  bill: KhataBill;
  onClose: () => void;
  onConfirm: (amount: number, date: string, note: string) => void;
}> = ({ lang, bill, onClose, onConfirm }) => {
  const isUrdu = lang === 'ur';
  const [amount, setAmount] = useState(String(bill.balance));
  const [date, setDate] = useState(getTodayIsoDate());
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>{isUrdu ? 'ادائیگی وصولی (کھاتہ میں درج)' : 'Receive Bill Payment'}</span>
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          {bill.billNumber} • {bill.partyName} ({isUrdu ? 'بقایا:' : 'Due:'} PKR {bill.balance.toLocaleString('en-US')})
        </p>

        <form
          onSubmit={e => {
            e.preventDefault();
            const val = parseFloat(amount) || 0;
            if (val > 0) onConfirm(val, date, note);
          }}
          className="space-y-3"
        >
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'وصول رقم (PKR)' : 'Amount Received (PKR)'}
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تاریخ' : 'Payment Date'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تفصیل / بینک حوالہ' : 'Reference / Note'}
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={isUrdu ? 'کیش یا بینک ٹرانسفر' : 'Cash / Bank transfer'}
              className="w-full min-h-[42px] px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[46px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold cursor-pointer"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[46px] rounded-2xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
            >
              {isUrdu ? 'کھاتہ میں درج کریں' : 'Post to Party Khata'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
