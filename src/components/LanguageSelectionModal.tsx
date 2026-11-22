import React from 'react';
import { Globe, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language } from '../types';
import { CompanyLogo } from './CompanyLogo';

interface LanguageSelectionModalProps {
  isOpen: boolean;
  onSelectLanguage: (selected: Language) => void;
}

export const LanguageSelectionModal: React.FC<LanguageSelectionModalProps> = ({
  isOpen,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-picker-title"
      className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-center justify-center p-4 modal-safe-area animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-[#fdfbf7] dark:bg-[#16181e] rounded-[32px] border border-[#e2e2d5] dark:border-[#2d313b] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Brand Header */}
        <div className="bg-gradient-to-br from-[#162a4d] via-[#1e3a68] to-[#162a4d] px-6 py-6 text-white text-center relative">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-amber-300/60 flex items-center justify-center shrink-0">
              <CompanyLogo className="w-full h-full" />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-amber-300" />
            </div>
          </div>

          <h2 id="lang-picker-title" className="text-lg sm:text-xl font-bold tracking-tight text-white font-serif">
            Choose Your Language
          </h2>
          <p
            dir="rtl"
            className="text-base sm:text-lg font-bold text-amber-200 mt-1 font-nastaliq leading-relaxed"
          >
            اپنی زبان منتخب کریں
          </p>
          <p className="text-[11px] text-blue-100/90 mt-1.5 font-sans">
            Select your preferred language to continue · جاری رکھنے کے لیے زبان چنیں
          </p>
        </div>

        {/* Language Options */}
        <div className="p-5 sm:p-6 space-y-3.5">
          {/* English Option */}
          <button
            type="button"
            onClick={() => onSelectLanguage('en')}
            className="w-full min-h-[76px] p-4 rounded-2xl bg-white dark:bg-[#1a1c22] hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 border-2 border-[#e2e2d5] dark:border-[#2d313b] hover:border-[#8b9d77] dark:hover:border-emerald-500 shadow-xs text-left flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer active:scale-[0.98] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9d77]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#162a4d] dark:bg-emerald-900/70 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                EN
              </div>
              <div className="min-w-0">
                <div className="font-bold text-base text-[#2b2c20] dark:text-white leading-tight">
                  English
                </div>
                <div className="text-xs text-[#555644] dark:text-slate-300 mt-0.5 leading-snug">
                  Compact dashboard & full English interface
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#f0f0e4] dark:bg-[#22252c] group-hover:bg-[#8b9d77] text-[#4a4a35] dark:text-slate-200 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Urdu Option */}
          <button
            type="button"
            dir="rtl"
            onClick={() => onSelectLanguage('ur')}
            className="w-full min-h-[76px] p-4 rounded-2xl bg-white dark:bg-[#1a1c22] hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 border-2 border-[#e2e2d5] dark:border-[#2d313b] hover:border-[#8b9d77] dark:hover:border-emerald-500 shadow-xs text-right flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer active:scale-[0.98] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b9d77]"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                اردو
              </div>
              <div className="min-w-0">
                <div className="font-bold text-lg text-[#2b2c20] dark:text-white font-nastaliq leading-normal">
                  اردو
                </div>
                <div className="text-xs text-[#555644] dark:text-slate-300 mt-0.5 leading-relaxed">
                  مکمل اردو ڈیش بورڈ اور اردو انٹرفیس
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#f0f0e4] dark:bg-[#22252c] group-hover:bg-emerald-700 text-[#4a4a35] dark:text-slate-200 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
          </button>

          <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-[#555644] dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8b9d77] dark:text-emerald-400 shrink-0" />
            <span>You can switch language anytime in the menu</span>
          </div>
        </div>
      </div>
    </div>
  );
};
