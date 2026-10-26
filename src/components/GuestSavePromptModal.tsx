import React, { useState } from 'react';
import { ShieldCheck, Cloud, AlertCircle, X, Check, Lock, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { loginWithGoogle } from '../utils/firebase';

interface GuestSavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedWithoutAuth: () => void;
  onAuthSuccess: (email: string) => void;
  lang: Language;
  saveDescription?: string;
}

export const GuestSavePromptModal: React.FC<GuestSavePromptModalProps> = ({
  isOpen,
  onClose,
  onProceedWithoutAuth,
  onAuthSuccess,
  lang,
  saveDescription
}) => {
  const isUrdu = lang === 'ur';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      if (!user) return;
      const email = user.email || (user as any)?.providerData?.[0]?.email || '';
      if (email) {
        onAuthSuccess(email);
        onClose();
      } else {
        setError(
          isUrdu
            ? 'گوگل اکاؤنٹ کی تصدیق نہیں ہو سکی۔ دوبارہ کوشش کریں۔'
            : 'Could not verify Google Account. Please try again.'
        );
      }
    } catch (err: any) {
      console.warn('Guest save Google sign-in notice:', err);
      if (err?.code === 'auth/popup-blocked') {
        setError(
          isUrdu
            ? 'براؤزر نے پوپ اپ ونڈو روک دی۔ ایڈریس بار سے اجازت دیں اور دوبارہ کلک کریں۔'
            : 'Browser blocked sign-in popup. Please allow popups and retry.'
        );
      } else if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setError(
          isUrdu
            ? 'گوگل سائن ان ونڈو بند ہو گئی۔ دوبارہ کوشش کریں۔'
            : 'Sign-in window closed. Please click below to try again.'
        );
      } else {
        setError(
          (isUrdu ? 'لاگ ان مکمل نہیں ہو سکا: ' : 'Sign-in failed: ') +
            (err?.message ? `(${err.message.slice(0, 70)})` : '')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 pb-[max(env(safe-area-inset-bottom),1.25rem)] animate-in slide-in-from-bottom duration-250">
        {/* Mobile Pull Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 mb-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>{isUrdu ? 'محفوظ کلاؤڈ بیک اپ' : 'Secure Cloud Backup'}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isUrdu ? 'فائر بیس پر محفوظ کریں' : 'Save to Firebase Cloud'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Security Message */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 mb-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p className="mb-2 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>
              {isUrdu
                ? 'فائر بیس اسٹوریج فون کے مقابلے میں زیادہ محفوظ ہے'
                : 'Firebase Storage is much more secure than phone memory'}
            </span>
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            {isUrdu
              ? (saveDescription || 'آپ کا اہم ڈیٹا گوگل اور فائر بیس کلاؤڈ پر 100% محفوظ رہتا ہے تاکہ فون خراب یا تبدیل ہونے کی صورت میں بھی سارا ریکارڈ بحال ہو سکے۔')
              : (saveDescription || 'Your important data remains 100% secure on Firebase Cloud and can be restored anytime if your device is changed or lost.')}
          </p>
        </div>

        {/* Benefits bullets */}
        <div className="space-y-1.5 mb-5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{isUrdu ? 'فون اسٹوریج ڈیلیٹ ہونے سے محفوظ' : 'Protected against phone cache clearing'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{isUrdu ? 'ہر ڈیوائس پر خودکار سنک اور بیک اپ' : 'Automatic multi-device synchronization'}</span>
          </div>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Primary: Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>
              {isUrdu
                ? 'گوگل اکاؤنٹ سے سائن ان کریں (فائر بیس پر سیو)'
                : 'Sign in with Google (Save to Firebase)'}
            </span>
          </button>

          {/* Secondary: Proceed locally on phone */}
          <button
            type="button"
            onClick={() => {
              onProceedWithoutAuth();
              onClose();
            }}
            disabled={loading}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span>
              {isUrdu
                ? 'صرف فون میموری میں محفوظ رکھیں (آف لائن)'
                : 'Save to Phone Memory only (Offline)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
