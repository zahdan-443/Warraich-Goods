import React from 'react';
import { AlertTriangle, CheckCircle2, Database, ShieldAlert, X } from 'lucide-react';
import { Language } from '../types';
import { BackupPreviewSummary } from '../utils/backupService';

interface BackupRestoreConfirmModalProps {
  isOpen: boolean;
  lang: Language;
  preview: BackupPreviewSummary | null;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: (mode: 'merge' | 'overwrite') => void;
}

const COUNT_LABELS: Record<string, { en: string; ur: string }> = {
  trips: { en: 'Trips', ur: 'ٹرپس' },
  vehicles: { en: 'Vehicles', ur: 'گاڑیاں' },
  drivers: { en: 'Drivers', ur: 'ڈرائیورز' },
  routes: { en: 'Routes', ur: 'روٹس' },
  fuelLogs: { en: 'Fuel Logs', ur: 'ایندھن ریکارڈ' },
  bilties: { en: 'Documents', ur: 'دستاویزات' },
  parties: { en: 'Parties', ur: 'پارٹیاں' },
  bills: { en: 'Bills / Invoices', ur: 'بلز / انوائس' },
  employees: { en: 'Employees', ur: 'ملازمین' },
  receivingPoints: { en: 'Receiving Points', ur: 'ریسیونگ پوائنٹس' },
  dailyExpenses: { en: 'Daily Expenses', ur: 'روزمرہ اخراجات' }
};

export const BackupRestoreConfirmModal: React.FC<BackupRestoreConfirmModalProps> = ({
  isOpen,
  lang,
  preview,
  confirming = false,
  onCancel,
  onConfirm
}) => {
  const [restoreMode, setRestoreMode] = React.useState<'merge' | 'overwrite'>('merge');

  React.useEffect(() => {
    if (isOpen) {
      setRestoreMode('merge');
    }
  }, [isOpen, preview?.backupDate]);

  if (!isOpen || !preview) return null;

  const isUrdu = lang === 'ur';
  const countEntries = Object.entries(preview.counts).filter(([, v]) => v > 0);
  const newerCount = preview.newerLocalCount || 0;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[60] flex items-center justify-center p-4">
      <div
        dir={isUrdu ? 'rtl' : 'ltr'}
        className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#ecece0] dark:border-slate-800 space-y-4 ${isUrdu ? 'text-right' : 'text-left'}`}
      >
        <div className="flex items-center justify-between border-b border-[#ecece0] dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                preview.valid
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {preview.valid ? (
                <Database className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#4a4a35] dark:text-white">
                {isUrdu ? 'بیک اپ بحالی کی تصدیق کریں' : 'Confirm Backup Restore'}
              </h3>
              <p className="text-[11px] text-[#8e8e75]">
                {preview.backupDate
                  ? `${isUrdu ? 'تاریخ:' : 'Snapshot:'} ${preview.backupDate.slice(0, 16).replace('T', ' ')}`
                  : isUrdu
                  ? 'بیک اپ کی تفصیلات'
                  : 'Backup Validation Summary'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!preview.valid ? (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 text-xs text-rose-900">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                {isUrdu
                  ? 'یہ بیک اپ فائل خراب یا نامکمل ہے۔'
                  : 'Backup validation failed — local data was NOT modified.'}
              </span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
              {preview.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {isUrdu
                  ? `فائل درست ہے (${preview.totalRecords.toLocaleString('en-US')} کل ریکارڈز)۔ موجودہ ڈیٹا کا سنیپ شاٹ محفوظ کرنے کے بعد بحالی شروع ہوگی۔`
                  : `Validated ${preview.totalRecords.toLocaleString('en-US')} records. A rollback snapshot will be captured before restoring.`}
              </span>
            </div>

            {newerCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {isUrdu
                    ? `اس فون پر بیک اپ کی تاریخ کے بعد ${newerCount} نئے یا ترمیم شدہ ریکارڈز موجود ہیں۔ "مرج" منتخب کرنے سے وہ محفوظ رہیں گے۔`
                    : `This device has ${newerCount} record(s) created or updated AFTER this backup. Choose "Keep Newer & Merge" to preserve them.`}
                </span>
              </div>
            )}

            {countEntries.length > 0 && (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {countEntries.map(([key, count]) => {
                  const lbl = COUNT_LABELS[key] || { en: key, ur: key };
                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-[#fdfbf7] dark:bg-slate-800 border border-[#ecece0] dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <span className="text-[#5a5a40] dark:text-slate-300 font-semibold">
                        {isUrdu ? lbl.ur : lbl.en}
                      </span>
                      <span className="font-mono font-bold text-[#4a4a35] dark:text-white">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setRestoreMode('merge')}
                className={`p-2.5 rounded-xl border ${isUrdu ? 'text-right' : 'text-left'} transition-all cursor-pointer ${
                  restoreMode === 'merge'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-400'
                    : 'bg-white border-[#ecece0] text-slate-600'
                }`}
              >
                <div>{isUrdu ? 'نیا ڈیٹا محفوظ + مرج' : 'Keep Newer & Merge'}</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">
                  {isUrdu ? 'حذف شدہ بحال ہوں گے، نئے رہیں گے' : 'Restores deleted + keeps newer'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRestoreMode('overwrite')}
                className={`p-2.5 rounded-xl border ${isUrdu ? 'text-right' : 'text-left'} transition-all cursor-pointer ${
                  restoreMode === 'overwrite'
                    ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-1 ring-amber-400'
                    : 'bg-white border-[#ecece0] text-slate-600'
                }`}
              >
                <div>{isUrdu ? 'مکمل سنیپ شاٹ بحال' : 'Full Snapshot Replace'}</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">
                  {isUrdu ? 'بالکل بیک اپ جیسا کر دیں' : 'Exact copy of backup'}
                </div>
              </button>
            </div>
          </>
        )}

        <div className="flex items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
          >
            {isUrdu ? 'منسوخ کریں' : 'Cancel'}
          </button>
          {preview.valid && (
            <button
              type="button"
              disabled={confirming}
              onClick={() => onConfirm(restoreMode)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
            >
              {confirming
                ? isUrdu
                  ? 'بحال ہو رہا ہے...'
                  : 'Restoring...'
                : isUrdu
                ? 'ہاں، ڈیٹا بحال کریں'
                : 'Restore Backup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
