import React, { useMemo, useState } from 'react';
import {
  KhataDailyExpense,
  KhataExpenseCategory,
  Language,
  Vehicle
} from '../../../types';
import {
  deleteDailyExpense,
  getAllDailyExpenses,
  getDailyExpensesPeriodTotals,
  getTodayIsoDate,
  saveOrUpdateDailyExpense
} from '../../../utils/khataModulesStorage';
import { validateFinancialNumber } from '../../../utils/calculator';
import {
  CheckCircle2,
  Pencil,
  Plus,
  Trash2,
  Truck,
  Wallet,
  X
} from 'lucide-react';

interface KhataDailyExpensesPanelProps {
  lang: Language;
  vehicles?: Vehicle[];
  onDataChanged?: () => void;
}

const EXPENSE_CATEGORIES: Array<{
  key: KhataExpenseCategory;
  ur: string;
  en: string;
  badgeClass: string;
  barClass: string;
}> = [
  {
    key: 'fuel',
    ur: 'ڈیزل / فیول',
    en: 'Fuel',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    barClass: 'bg-amber-500'
  },
  {
    key: 'toll',
    ur: 'ٹول ٹیکس',
    en: 'Toll',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    barClass: 'bg-blue-500'
  },
  {
    key: 'meals',
    ur: 'کھانا / چائے',
    en: 'Meals',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    barClass: 'bg-emerald-500'
  },
  {
    key: 'repair',
    ur: 'مرمت / مکینک',
    en: 'Repair',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    barClass: 'bg-rose-500'
  },
  {
    key: 'parking',
    ur: 'پارکنگ / اڈہ',
    en: 'Parking / Adda',
    badgeClass: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    barClass: 'bg-slate-600'
  },
  {
    key: 'fine',
    ur: 'جرمانہ / چالان',
    en: 'Fine / Challan',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
    barClass: 'bg-red-500'
  },
  {
    key: 'other',
    ur: 'دیگر اخراجات',
    en: 'Other',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    barClass: 'bg-slate-400'
  }
];

export const KhataDailyExpensesPanel: React.FC<KhataDailyExpensesPanelProps> = ({
  lang,
  vehicles = [],
  onDataChanged
}) => {
  const isUrdu = lang === 'ur';
  const [expenses, setExpenses] = useState<KhataDailyExpense[]>(() => getAllDailyExpenses());

  // Quick-add form state
  const [category, setCategory] = useState<KhataExpenseCategory>('fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayIsoDate());
  const [vehicleNo, setVehicleNo] = useState('');
  const [notes, setNotes] = useState('');
  const [editingExpense, setEditingExpense] = useState<KhataDailyExpense | null>(null);
  const [filterCat, setFilterCat] = useState<'all' | KhataExpenseCategory>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = () => {
    setExpenses(getAllDailyExpenses());
    onDataChanged?.();
  };

  const showNotice = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const periodTotals = useMemo(
    () => getDailyExpensesPeriodTotals(expenses, getTodayIsoDate()),
    [expenses]
  );

  const vehicleOptions = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach(v => v.reg && set.add(v.reg.toUpperCase()));
    expenses.forEach(e => e.vehicleNo && set.add(e.vehicleNo.toUpperCase()));
    return Array.from(set).sort();
  }, [vehicles, expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      if (filterCat !== 'all' && e.category !== filterCat) return false;
      if (filterVehicle !== 'all' && (e.vehicleNo || '').toUpperCase() !== filterVehicle) return false;
      return true;
    });
  }, [expenses, filterCat, filterVehicle]);

  const maxCatVal = useMemo(() => {
    const vals = Object.values(periodTotals.byCategory);
    return Math.max(1, ...vals);
  }, [periodTotals]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const valCheck = validateFinancialNumber(amount, isUrdu ? 'رقم' : 'Amount', { allowZero: false });
    if (!valCheck.isValid) {
      setFormError(valCheck.error || (isUrdu ? 'درست مثبت رقم درج کریں۔' : 'Please enter a valid positive amount.'));
      return;
    }
    setFormError(null);

    saveOrUpdateDailyExpense({
      id: editingExpense?.id,
      date: date || getTodayIsoDate(),
      category,
      amount: valCheck.value,
      vehicleNo: vehicleNo.trim() || undefined,
      notes: notes.trim()
    });

    setAmount('');
    setNotes('');
    setEditingExpense(null);
    reload();
    showNotice(
      isUrdu
        ? 'خرچ محفوظ ہو گیا اور کیش بک میں خودکار شامل کر دیا گیا۔'
        : 'Expense saved & synced 1:1 with Cashbook (no double counting).'
    );
  };

  const handleStartEdit = (exp: KhataDailyExpense) => {
    setEditingExpense(exp);
    setCategory(exp.category);
    setAmount(String(exp.amount));
    setDate(exp.date);
    setVehicleNo(exp.vehicleNo || '');
    setNotes(exp.notes || '');
  };

  return (
    <div className="space-y-3.5 font-serif">
      {toastMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold px-3.5 py-2.5 rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sync Info Notice */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl px-3.5 py-2 text-[11px] text-blue-800 dark:text-blue-200 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          {isUrdu
            ? 'روزمرہ اخراجات کیش بک اور گاڑی کھاتہ کے ساتھ خودکار جڑے ہیں (ڈبل گنتی کے بغیر)۔'
            : 'Daily expenses sync 1:1 with Cashbook & Vehicle view without double counting.'}
        </span>
      </div>

      {/* Period KPI Cards: Daily / Weekly / Monthly */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5">
          <span className="text-[11px] text-slate-500 block font-bold">
            {isUrdu ? 'آج کا خرچ' : 'Today'}
          </span>
          <span className="text-xs sm:text-sm font-black text-rose-600">
            PKR {periodTotals.dailyTotal.toLocaleString('en-US')}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5">
          <span className="text-[11px] text-slate-500 block font-bold">
            {isUrdu ? 'ہفتہ (7 دن)' : 'This Week'}
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-600">
            PKR {periodTotals.weeklyTotal.toLocaleString('en-US')}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5">
          <span className="text-[11px] text-slate-500 block font-bold">
            {isUrdu ? 'اس ماہ کا کل' : 'This Month'}
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
            PKR {periodTotals.monthlyTotal.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Quick-Add Expense Card */}
      <form
        onSubmit={handleQuickAdd}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 dark:text-white">
            {editingExpense
              ? isUrdu
                ? 'خرچ میں ترمیم'
                : 'Edit Expense'
              : isUrdu
              ? 'فوری خرچ شامل کریں'
              : 'Quick Add Daily Expense'}
          </h3>
          {editingExpense && (
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setAmount('');
                setNotes('');
              }}
              className="text-xs text-rose-600 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'منسوخ' : 'Cancel'}</span>
            </button>
          )}
        </div>

        {/* Category Pills Grid */}
        <div className="flex flex-wrap gap-1.5">
          {EXPENSE_CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                category === c.key
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {isUrdu ? c.ur : c.en}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input
            type="number"
            required
            min="1"
            step="any"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder={isUrdu ? 'رقم (PKR)' : 'Amount (PKR)'}
            className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold"
          />
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <select
            value={vehicleNo}
            onChange={e => setVehicleNo(e.target.value)}
            className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="">{isUrdu ? 'گاڑی (اختیاری)' : 'Vehicle (Optional)'}</option>
            {vehicleOptions.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={isUrdu ? 'تفصیل / نوٹ' : 'Notes'}
            className="min-h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>

        {formError && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {formError}
          </p>
        )}

        <button
          type="submit"
          className="w-full min-h-[44px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>
            {editingExpense
              ? isUrdu
                ? 'اپ ڈیٹ محفوظ کریں'
                : 'Update Expense'
              : isUrdu
              ? 'خرچ محفوظ کریں'
              : 'Save Expense'}
          </span>
        </button>
      </form>

      {/* Monthly Category Breakdown Bar Chart */}
      {periodTotals.monthlyTotal > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-2">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
            {isUrdu ? 'ماہانہ اخراجات کی تقسیم' : 'This Month Category Breakdown'}
          </h4>
          <div className="space-y-1.5">
            {EXPENSE_CATEGORIES.map(c => {
              const val = periodTotals.byCategory[c.key] || 0;
              if (val === 0) return null;
              const widthPct = Math.max(4, Math.round((val / maxCatVal) * 100));
              return (
                <div key={c.key} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-600 dark:text-slate-300">
                      {isUrdu ? c.ur : c.en}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      PKR {val.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${c.barClass}`} style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value as any)}
          className="min-h-[38px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
        >
          <option value="all">{isUrdu ? 'تمام اقسام' : 'All Categories'}</option>
          {EXPENSE_CATEGORIES.map(c => (
            <option key={c.key} value={c.key}>
              {isUrdu ? c.ur : c.en}
            </option>
          ))}
        </select>

        <select
          value={filterVehicle}
          onChange={e => setFilterVehicle(e.target.value)}
          className="min-h-[38px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
        >
          <option value="all">{isUrdu ? 'تمام گاڑیاں' : 'All Vehicles'}</option>
          {vehicleOptions.map(v => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* Expense List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {isUrdu ? 'کوئی روزمرہ خرچ درج نہیں۔' : 'No daily expenses recorded yet.'}
          </div>
        ) : (
          filteredExpenses.map(exp => {
            const meta = EXPENSE_CATEGORIES.find(c => c.key === exp.category) || EXPENSE_CATEGORIES[6];
            return (
              <div
                key={exp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.badgeClass}`}>
                      {isUrdu ? meta.ur : meta.en}
                    </span>
                    <span className="text-[11px] text-slate-400">{exp.date}</span>
                    {exp.vehicleNo && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                        <Truck className="w-3 h-3" />
                        {exp.vehicleNo}
                      </span>
                    )}
                  </div>
                  {exp.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
                      {exp.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm font-black text-rose-600">
                    PKR {exp.amount.toLocaleString('en-US')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(exp)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteDailyExpense(exp.id);
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
    </div>
  );
};
