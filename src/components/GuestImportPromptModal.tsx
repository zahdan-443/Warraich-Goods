import React, { useState, useEffect } from 'react';
import { CloudUpload, HardDrive, Trash2, X, ShieldCheck, Layers } from 'lucide-react';
import { Language } from '../types';
import type { GuestScopeSummary } from '../utils/storage';

interface GuestImportPromptModalProps {
  isOpen: boolean;
  lang: Language;
  userEmail: string | null;
  summary: GuestScopeSummary | null;
  onMerge: () => Promise<void> | void;
  onKeepSeparate: () => void;
  onDiscard: () => void;
}

export const GuestImportPromptModal: React.FC<GuestImportPromptModalProps> = ({
  isOpen,
  lang,
  userEmail,
  summary,
  onMerge,
  onKeepSeparate,
  onDiscard
}) => {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen || !summary || !summary.hasGuestData) return;
    const handleBack = (e: Event) => {
      if (e.defaultPrevented) return;
      if (!busy) {
        onKeepSeparate();
      }
      e.preventDefault();
    };
    window.addEventListener('app-modal-back', handleBack);
    window.addEventListener('app-back-button', handleBack);
    return () => {
      window.removeEventListener('app-modal-back', handleBack);
      window.removeEventListener('app-back-button', handleBack);
    };
  }, [isOpen, summary, busy, onKeepSeparate]);

  if (!isOpen || !summary || !summary.hasGuestData) return null;

  const isUrdu = lang === 'ur';
  const countItems = [
    { label: isUrdu ? 'سفری ریکارڈ (ٹرپس)' : 'Trips', count: summary.counts.trips },
    { label: isUrdu ? 'گاڑیاں' : 'Vehicles', count: summary.counts.vehicles },
    { label: isUrdu ? 'ڈرائیورز' : 'Drivers', count: summary.counts.drivers },
    { label: isUrdu ? 'روٹس' : 'Routes', count: summary.counts.routes },
    { label: isUrdu ? 'فیول لاگز' : 'Fuel Logs', count: summary.counts.fuel },
    { label: isUrdu ? 'کھاتہ و بل ریکارڈ' : 'Khata / Ledger', count: summary.counts.khata },
    { label: isUrdu ? 'دستاویزات' : 'Saved Documents', count: summary.counts.documents }
  ].filter(i => i.count > 0);

  const handleMergeClick = async () => {
    setBusy(true);
    try {
      await onMerge();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        dir={isUrdu ? 'rtl' : 'ltr'}
        className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#ecece0] dark:border-slate-800 pb-[max(env(safe-area-inset-bottom),1.25rem)] space-y-4 ${isUrdu ? 'text-right' : 'text-left'}`}
      >
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 mb-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>{isUrdu ? 'فون میں موجود گیسٹ ڈیٹا' : 'Device Guest Records Found'}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isUrdu
                  ? 'کیا گیسٹ ریکارڈ اس اکاؤنٹ میں شامل کریں؟'
                  : 'Import Guest Records to Account?'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onKeepSeparate}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {isUrdu
            ? `اس فون پر پہلے سے ${summary.totalRecords} گیسٹ موڈ ریکارڈز موجود ہیں۔ کیا آپ انہیں اپنے گوگل اکاؤنٹ (${userEmail || ''}) میں منتقل و محفوظ کرنا چاہتے ہیں؟`
            : `This phone has ${summary.totalRecords} existing Guest-mode record(s). Choose whether to merge them into ${userEmail || 'your account'}, keep them separate, or discard them.`}
        </p>

        {countItems.length > 0 && (
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
            {countItems.map(item => (
              <div
                key={item.label}
                className="p-2.5 rounded-xl bg-[#fdfbf7] dark:bg-slate-800 border border-[#ecece0] dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-[#5a5a40] dark:text-slate-300">{item.label}</span>
                <span className="font-mono font-bold text-[#4a4a35] dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={handleMergeClick}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
            <span>
              {busy
                ? isUrdu ? 'شامل کیا جا رہا ہے...' : 'Importing...'
                : isUrdu ? 'اکاؤنٹ میں شامل کریں' : 'Merge into Signed-In Account'}
            </span>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onKeepSeparate}
            className="w-full min-h-[42px] py-2 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <HardDrive className="w-4 h-4 text-slate-500" />
            <span>{isUrdu ? 'گیسٹ موڈ میں علیحدہ رکھیں' : 'Keep Separate on Guest Mode'}</span>
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={onDiscard}
            className="w-full min-h-[40px] py-2 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'گیسٹ کاپیاں حذف کریں' : 'Discard Guest Copies'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
