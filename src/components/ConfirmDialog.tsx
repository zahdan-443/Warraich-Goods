import React, { useEffect } from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';
import { Language } from '../types';

export interface ConfirmDialogProps {
  isOpen: boolean;
  lang: Language;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  lang,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}) => {
  const isUrdu = lang === 'ur';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };

    const handleBackButton = (e: Event) => {
      if (e.defaultPrevented) return;
      e.preventDefault();
      if (!loading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('app-modal-back', handleBackButton);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('app-modal-back', handleBackButton);
    };
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  const defaultConfirm = confirmLabel || (isUrdu ? 'تصدیق کریں' : 'Confirm');
  const defaultCancel = cancelLabel || (isUrdu ? 'منسوخ کریں' : 'Cancel');

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      dir={isUrdu ? 'rtl' : 'ltr'}
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-[#ecece0] dark:border-slate-700 shadow-2xl p-5 sm:p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
              }`}
            >
              {isDanger ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3
                id="confirm-dialog-title"
                className="text-base sm:text-lg font-bold font-serif text-[#2b2c20] dark:text-slate-100"
              >
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            aria-label={isUrdu ? 'بند کریں' : 'Close'}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-[#5a5a40] dark:text-slate-300 font-serif">
          {message}
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            {defaultCancel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`min-h-[44px] px-5 py-2.5 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {loading ? (isUrdu ? 'جاری ہے...' : 'Working...') : defaultConfirm}
          </button>
        </div>
      </div>
    </div>
  );
};
