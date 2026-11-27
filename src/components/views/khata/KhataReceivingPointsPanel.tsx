import React, { useMemo, useState, useEffect } from 'react';
import {
  KhataReceivingEntry,
  KhataReceivingEntryType,
  KhataReceivingPoint,
  Language
} from '../../../types';
import {
  calculateReceivingPointSummary,
  deleteReceivingEntry,
  deleteReceivingPoint,
  formatReceivingPointWhatsApp,
  getAllReceivingEntries,
  getAllReceivingPoints,
  getReceivingEntries,
  getTodayIsoDate,
  saveOrUpdateReceivingEntry,
  saveOrUpdateReceivingPoint
} from '../../../utils/khataModulesStorage';
import {
  formatPhoneForDisplay,
  getLedgerAccounts,
  normalizePakistaniPhone
} from '../../../utils/ledgerStorage';
import { validateFinancialNumber } from '../../../utils/calculator';
import {
  downloadOrSharePdf,
  generateReceivingPointStatementPdf
} from '../../../utils/khataPdf';
import {
  ChevronLeft,
  Download,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  Smartphone,
  Trash2,
  X
} from 'lucide-react';
import { openWhatsAppMessage } from '../../../utils/externalLinks';

interface KhataReceivingPointsPanelProps {
  lang: Language;
  businessName?: string;
  onDataChanged?: () => void;
}

export const KhataReceivingPointsPanel: React.FC<KhataReceivingPointsPanelProps> = ({
  lang,
  businessName,
  onDataChanged
}) => {
  const isUrdu = lang === 'ur';
  const [points, setPoints] = useState<KhataReceivingPoint[]>(() => getAllReceivingPoints());
  const [allEntries, setAllEntries] = useState<KhataReceivingEntry[]>(() => getAllReceivingEntries());
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showPointModal, setShowPointModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState<KhataReceivingPoint | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [defaultEntryType, setDefaultEntryType] = useState<KhataReceivingEntryType>('received');

  const reload = () => {
    setPoints(getAllReceivingPoints());
    setAllEntries(getAllReceivingEntries());
    onDataChanged?.();
  };

  useEffect(() => {
    if (!showEntryModal && !showPointModal && !selectedPointId) return;
    const handleModalBack = (e: Event) => {
      if (e.defaultPrevented) return;
      if (showEntryModal) {
        setShowEntryModal(false);
        e.preventDefault();
        return;
      }
      if (showPointModal) {
        setShowPointModal(false);
        setEditingPoint(null);
        e.preventDefault();
        return;
      }
      if (selectedPointId) {
        setSelectedPointId(null);
        e.preventDefault();
        return;
      }
    };
    window.addEventListener('app-modal-back', handleModalBack);
    return () => window.removeEventListener('app-modal-back', handleModalBack);
  }, [showEntryModal, showPointModal, selectedPointId]);

  const filteredPoints = useMemo(() => {
    if (!searchQuery.trim()) return points;
    const q = searchQuery.toLowerCase().trim();
    return points.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.contactPerson || '').toLowerCase().includes(q)
    );
  }, [points, searchQuery]);

  const selectedPoint = useMemo(
    () => points.find(p => p.id === selectedPointId) || null,
    [points, selectedPointId]
  );

  const selectedEntries = useMemo(
    () => (selectedPoint ? getReceivingEntries(selectedPoint.id) : []),
    [selectedPoint, allEntries]
  );

  // ---------------- POINT DETAIL LEDGER ----------------
  if (selectedPoint) {
    const summary = calculateReceivingPointSummary(selectedEntries);
    const chronological = [...selectedEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let running = 0;
    const rowsWithBalance = chronological
      .map(entry => {
        running += entry.type === 'received' ? entry.amount : -entry.amount;
        return { entry, running };
      })
      .reverse();

    const handleShareWa = () => {
      const text = formatReceivingPointWhatsApp(selectedPoint, selectedEntries, businessName, lang);
      const cleanPhone = normalizePakistaniPhone(selectedPoint.phone);
      openWhatsAppMessage(text, cleanPhone || undefined);
    };

    return (
      <div dir={isUrdu ? 'rtl' : 'ltr'} className="space-y-3.5 font-serif">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSelectedPointId(null)}
            className="min-h-[42px] px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />
            <span>{isUrdu ? 'تمام پوائنٹس' : 'All Points'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={async () => {
                const { doc, filename } = generateReceivingPointStatementPdf({
                  point: selectedPoint,
                  entries: selectedEntries,
                  businessName
                });
                await downloadOrSharePdf(doc, filename);
              }}
              className="min-h-[42px] px-3 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'پی ڈی ایف' : 'PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleShareWa}
              className="min-h-[42px] px-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'شیئر' : 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingPoint(selectedPoint);
                setShowPointModal(true);
              }}
              className="min-h-[42px] min-w-[42px] rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                deleteReceivingPoint(selectedPoint.id);
                setSelectedPointId(null);
                reload();
              }}
              className="min-h-[42px] min-w-[42px] rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{selectedPoint.name}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedPoint.city}
                {selectedPoint.contactPerson ? ` • ${selectedPoint.contactPerson}` : ''}
                {selectedPoint.phone ? ` • ${formatPhoneForDisplay(selectedPoint.phone)}` : ''}
              </p>
              {selectedPoint.notes && (
                <p className="text-[11px] text-slate-400 mt-1">{selectedPoint.notes}</p>
              )}
            </div>
            <div className="text-end shrink-0">
              <span className="text-[11px] font-bold text-slate-500 block">
                {isUrdu ? 'بقایا / پینڈنگ' : 'Pending Balance'}
              </span>
              <span
                className={`text-base font-black ${
                  summary.pendingBalance > 0
                    ? 'text-emerald-600'
                    : summary.pendingBalance < 0
                    ? 'text-rose-600'
                    : 'text-slate-600'
                }`}
              >
                PKR {summary.pendingBalance.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">
                {isUrdu ? 'کل وصولی / بلڈ' : 'Total Received'}
              </span>
              <span className="font-bold text-emerald-600">
                PKR {summary.totalReceived.toLocaleString('en-US')}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">
                {isUrdu ? 'کل ادائیگی' : 'Total Paid'}
              </span>
              <span className="font-bold text-rose-600">
                PKR {summary.totalPaid.toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setDefaultEntryType('received');
              setShowEntryModal(true);
            }}
            className="min-h-[44px] rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'وصولی اندراج' : 'Add Received'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDefaultEntryType('paid');
              setShowEntryModal(true);
            }}
            className="min-h-[44px] rounded-2xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isUrdu ? 'ادائیگی اندراج' : 'Add Paid'}</span>
          </button>
        </div>

        {/* Ledger Rows */}
        <div className="space-y-2">
          {rowsWithBalance.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              {isUrdu ? 'ابھی تک کوئی لین دین درج نہیں ہوا۔' : 'No transactions recorded yet.'}
            </div>
          ) : (
            rowsWithBalance.map(({ entry, running: runBal }) => {
              const isReceived = entry.type === 'received';
              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isReceived
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {isReceived
                          ? isUrdu
                            ? 'وصولی (+)'
                            : 'Received (+)'
                          : isUrdu
                          ? 'ادائیگی (-)'
                          : 'Paid (-)'}
                      </span>
                      <span className="text-[11px] text-slate-400">{entry.date}</span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
                        {entry.notes}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isUrdu ? 'بقایا بیلنس' : 'Bal'}: PKR {runBal.toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-sm font-black ${
                        isReceived ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isReceived ? '+' : '-'} PKR {entry.amount.toLocaleString('en-US')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        deleteReceivingEntry(entry.id);
                        reload();
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showPointModal && (
          <ReceivingPointFormModal
            lang={lang}
            point={editingPoint}
            onClose={() => {
              setShowPointModal(false);
              setEditingPoint(null);
            }}
            onSave={payload => {
              saveOrUpdateReceivingPoint(payload);
              setShowPointModal(false);
              setEditingPoint(null);
              reload();
            }}
          />
        )}

        {showEntryModal && (
          <ReceivingEntryModal
            lang={lang}
            point={selectedPoint}
            defaultType={defaultEntryType}
            onClose={() => setShowEntryModal(false)}
            onSave={payload => {
              saveOrUpdateReceivingEntry(payload);
              setShowEntryModal(false);
              reload();
            }}
          />
        )}
      </div>
    );
  }

  // ---------------- MASTER LIST OF RECEIVING POINTS ----------------
  const grandTotals = useMemo(() => {
    let totalReceived = 0;
    let totalPaid = 0;
    for (const e of allEntries) {
      if (e.type === 'received') totalReceived += e.amount;
      else if (e.type === 'paid') totalPaid += e.amount;
    }
    return {
      totalReceived: Math.round(totalReceived),
      totalPaid: Math.round(totalPaid),
      pending: Math.round(totalReceived - totalPaid)
    };
  }, [allEntries]);

  return (
    <div dir={isUrdu ? 'rtl' : 'ltr'} className="space-y-3.5 font-serif">
      {/* KPI Header */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-2.5">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
            {isUrdu ? 'کل وصولی' : 'Received'}
          </span>
          <span className="text-xs sm:text-sm font-black text-emerald-600">
            PKR {grandTotals.totalReceived.toLocaleString('en-US')}
          </span>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-2.5">
          <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">
            {isUrdu ? 'کل ادائیگی' : 'Paid'}
          </span>
          <span className="text-xs sm:text-sm font-black text-rose-600">
            PKR {grandTotals.totalPaid.toLocaleString('en-US')}
          </span>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-2.5">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">
            {isUrdu ? 'پینڈنگ بیلنس' : 'Pending'}
          </span>
          <span className="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-400">
            PKR {grandTotals.pending.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isUrdu ? 'پوائنٹ یا شہر تلاش کریں...' : 'Search receiving point or city...'}
            className="w-full min-h-[42px] ps-9 pe-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingPoint(null);
            setShowPointModal(true);
          }}
          className="min-h-[42px] px-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isUrdu ? 'نیا پوائنٹ' : 'Add Point'}</span>
        </button>
      </div>

      {/* Points List */}
      <div className="space-y-2.5">
        {filteredPoints.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
            <MapPin className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {isUrdu ? 'کوئی ریسیونگ پوائنٹ شامل نہیں' : 'No receiving points added'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isUrdu
                ? 'اڈہ، گودام یا ڈلیوری پوائنٹس کا حساب رکھنے کے لیے نیا پوائنٹ شامل کریں'
                : 'Add depots, addas or delivery points to track receivables and payments'}
            </p>
          </div>
        ) : (
          filteredPoints.map(pt => {
            const ptEntries = allEntries.filter(e => e.pointId === pt.id);
            const sum = calculateReceivingPointSummary(ptEntries);
            return (
              <div
                key={pt.id}
                onClick={() => setSelectedPointId(pt.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-blue-400 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {pt.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {pt.city}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {pt.contactPerson || (isUrdu ? 'رابطہ شخص درج نہیں' : 'No contact person')}
                    {pt.phone ? ` • ${formatPhoneForDisplay(pt.phone)}` : ''}
                  </p>
                </div>

                <div className="text-end shrink-0">
                  <span
                    className={`text-sm font-black block ${
                      sum.pendingBalance > 0
                        ? 'text-emerald-600'
                        : sum.pendingBalance < 0
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    PKR {sum.pendingBalance.toLocaleString('en-US')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isUrdu ? 'پینڈنگ بیلنس' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showPointModal && (
        <ReceivingPointFormModal
          lang={lang}
          point={editingPoint}
          onClose={() => {
            setShowPointModal(false);
            setEditingPoint(null);
          }}
          onSave={payload => {
            saveOrUpdateReceivingPoint(payload);
            setShowPointModal(false);
            setEditingPoint(null);
            reload();
          }}
        />
      )}
    </div>
  );
};

// ---------------- POINT MODAL (ZERO CNIC) ----------------
const ReceivingPointFormModal: React.FC<{
  lang: Language;
  point: KhataReceivingPoint | null;
  onClose: () => void;
  onSave: (payload: Partial<KhataReceivingPoint> & { name: string; city: string }) => void;
}> = ({ lang, point, onClose, onSave }) => {
  const isUrdu = lang === 'ur';
  const [name, setName] = useState(point?.name || '');
  const [city, setCity] = useState(point?.city || '');
  const [contactPerson, setContactPerson] = useState(point?.contactPerson || '');
  const [phone, setPhone] = useState(point?.phone || '');
  const [notes, setNotes] = useState(point?.notes || '');
  const [showSavedContacts, setShowSavedContacts] = useState(false);

  const savedContacts = useMemo(() => {
    const map = new Map<string, { name: string; phone: string }>();
    getLedgerAccounts().forEach(a => {
      if (a.phone) map.set(a.phone, { name: a.name, phone: a.phone });
    });
    return Array.from(map.values());
  }, []);

  const handlePickDeviceContact = async () => {
    const navAny = navigator as any;
    if (navAny?.contacts && typeof navAny.contacts.select === 'function') {
      try {
        const picked = await navAny.contacts.select(['name', 'tel'], { multiple: false });
        if (picked && picked.length > 0) {
          const c = picked[0];
          if (c.name?.[0] && !contactPerson) setContactPerson(c.name[0]);
          if (c.tel?.[0]) setPhone(c.tel[0]);
          return;
        }
      } catch {
        // Fallback below
      }
    }
    setShowSavedContacts(prev => !prev);
  };

  return (
    <div dir={isUrdu ? 'rtl' : 'ltr'} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {point
              ? isUrdu
                ? 'ریسیونگ پوائنٹ ترمیم'
                : 'Edit Receiving Point'
              : isUrdu
              ? 'نیا ریسیونگ پوائنٹ شامل کریں'
              : 'New Receiving Point'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!name.trim() || !city.trim()) return;
            onSave({
              id: point?.id,
              name: name.trim(),
              city: city.trim(),
              contactPerson: contactPerson.trim(),
              phone: phone.trim(),
              notes: notes.trim()
            });
          }}
          className="space-y-3"
        >
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              {isUrdu ? 'پوائنٹ / اڈہ نام *' : 'Point / Adda Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={isUrdu ? 'مثلاً بادامی باغ اڈہ / ماڑی پور گودام' : 'e.g. Badami Bagh Adda'}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'شہر *' : 'City *'}
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder={isUrdu ? 'لاہور / کراچی' : 'Lahore / Karachi'}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {isUrdu ? 'رابطہ شخص' : 'Contact Person'}
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder={isUrdu ? 'منشی / انچارج' : 'Incharge name'}
                className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {isUrdu ? 'فون نمبر' : 'Phone Number'}
              </label>
              <button
                type="button"
                onClick={handlePickDeviceContact}
                className="text-[11px] font-bold text-blue-600 flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'فون بک' : 'Phone Picker'}</span>
              </button>
            </div>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="03XX-XXXXXXX"
                className="w-full min-h-[42px] ps-9 pe-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
            {showSavedContacts && savedContacts.length > 0 && (
              <div className="mt-1.5 max-h-28 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 space-y-1">
                {savedContacts.map(sc => (
                  <button
                    key={sc.phone}
                    type="button"
                    onClick={() => {
                      if (!contactPerson) setContactPerson(sc.name);
                      setPhone(sc.phone);
                      setShowSavedContacts(false);
                    }}
                    className="w-full text-start px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-xs flex justify-between"
                  >
                    <span className="font-bold">{sc.name}</span>
                    <span className="font-mono text-slate-500">{formatPhoneForDisplay(sc.phone)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تفصیل / پتہ نوٹ' : 'Notes / Location'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={isUrdu ? 'پتہ یا اضافی نوٹ' : 'Address or landmark'}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
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
              className="flex-1 min-h-[46px] rounded-2xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              {isUrdu ? 'محفوظ کریں' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------- POINT ENTRY MODAL ----------------
const ReceivingEntryModal: React.FC<{
  lang: Language;
  point: KhataReceivingPoint;
  defaultType: KhataReceivingEntryType;
  onClose: () => void;
  onSave: (payload: any) => void;
}> = ({ lang, point, defaultType, onClose, onSave }) => {
  const isUrdu = lang === 'ur';
  const [type, setType] = useState<KhataReceivingEntryType>(defaultType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayIsoDate());
  const [notes, setNotes] = useState('');
  const [entryError, setEntryError] = useState<string | null>(null);

  return (
    <div dir={isUrdu ? 'rtl' : 'ltr'} className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            {point.name}
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            const valCheck = validateFinancialNumber(amount, isUrdu ? 'رقم' : 'Amount', { allowZero: false });
            if (!valCheck.isValid) {
              setEntryError(valCheck.error || (isUrdu ? 'درست مثبت رقم درج کریں۔' : 'Enter a valid positive amount.'));
              return;
            }
            setEntryError(null);
            onSave({ pointId: point.id, type, amount: valCheck.value, date, notes: notes.trim() });
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('received')}
              className={`min-h-[42px] rounded-xl text-xs font-bold border cursor-pointer ${
                type === 'received'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isUrdu ? 'وصولی (+)' : 'Received (+)'}
            </button>
            <button
              type="button"
              onClick={() => setType('paid')}
              className={`min-h-[42px] rounded-xl text-xs font-bold border cursor-pointer ${
                type === 'paid'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isUrdu ? 'ادائیگی (-)' : 'Paid (-)'}
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'رقم (PKR)' : 'Amount (PKR)'}
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تاریخ' : 'Date'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {isUrdu ? 'تفصیل / نوٹ' : 'Notes'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={isUrdu ? 'وصولی یا کرایہ کی تفصیل' : 'Shipment / cash detail'}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>

          {entryError && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              {entryError}
            </p>
          )}

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
              {isUrdu ? 'محفوظ کریں' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
