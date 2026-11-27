import React, { useState, useEffect } from 'react';
import { Delete, Lock, ShieldAlert } from 'lucide-react';
import { Language } from '../../../types';

interface KhataPinLockScreenProps {
  lang: Language;
  pinInput: string;
  setPinInput: React.Dispatch<React.SetStateAction<string>>;
  pinError: string;
  lockoutRemaining: number;
  expectedPinLength?: number;
  isSignedIn: boolean;
  onSubmitPin: (attempt: string) => void;
  onResetPinWithGoogleReauth: () => Promise<{ success: boolean; error?: string }>;
  onResetPinAsGuestConfirm: () => void;
}

export const KhataPinLockScreen: React.FC<KhataPinLockScreenProps> = ({
  lang,
  pinInput,
  setPinInput,
  pinError,
  lockoutRemaining,
  expectedPinLength,
  isSignedIn,
  onSubmitPin,
  onResetPinWithGoogleReauth,
  onResetPinAsGuestConfirm
}) => {
  const isUrdu = lang === 'ur';
  const maxDigits = Math.max(4, Math.min(8, expectedPinLength || 6));
  const dotSlots = Math.max(4, expectedPinLength || (pinInput.length > 4 ? 6 : 4));

  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [guestResetPhrase, setGuestResetPhrase] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!showForgotDialog) return;
    const handleModalBack = (e: Event) => {
      if (e.defaultPrevented) return;
      setShowForgotDialog(false);
      e.preventDefault();
    };
    window.addEventListener('app-modal-back', handleModalBack);
    return () => window.removeEventListener('app-modal-back', handleModalBack);
  }, [showForgotDialog]);

  const appendDigit = (digit: string) => {
    if (lockoutRemaining > 0 || pinInput.length >= 8) return;
    const next = pinInput + digit;
    setPinInput(next);
    // Auto-submit only when exact stored pinLength is known and reached (preserves 4-digit snappy UX)
    if (expectedPinLength && next.length === expectedPinLength) {
      onSubmitPin(next);
    } else if (!expectedPinLength && next.length === 4) {
      // Legacy PINs without stored length default to 4-digit auto-attempt
      onSubmitPin(next);
    }
  };

  const handleConfirmForgotPin = async () => {
    setResetError('');
    if (isSignedIn) {
      setResetting(true);
      try {
        const res = await onResetPinWithGoogleReauth();
        if (!res.success) {
          setResetError(
            res.error ||
              (isUrdu
                ? 'گوگل تصدیق مکمل نہیں ہو سکی۔ برائے مہربانی دوبارہ کوشش کریں۔'
                : 'Google re-authentication failed. Please try again.')
          );
        } else {
          setShowForgotDialog(false);
        }
      } finally {
        setResetting(false);
      }
      return;
    }

    if (guestResetPhrase.trim().toUpperCase() !== 'RESET PIN') {
      setResetError(
        isUrdu
          ? 'تصدیق کے لیے انگریزی میں "RESET PIN" ٹائپ کریں'
          : 'Type "RESET PIN" to confirm resetting your lock'
      );
      return;
    }

    onResetPinAsGuestConfirm();
    setShowForgotDialog(false);
    setGuestResetPhrase('');
  };

  return (
    <div dir={isUrdu ? 'rtl' : 'ltr'} className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4 font-serif">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 text-center font-serif">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white mb-1">
          {isUrdu ? 'کھاتہ پن لاک' : 'Khata PIN Lock'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          {isUrdu
            ? `محفوظ کھاتہ دیکھنے کے لیے ${expectedPinLength ? `${expectedPinLength} ہندسوں کا ` : ''}پن کوڈ درج کریں`
            : `Enter your ${expectedPinLength ? `${expectedPinLength}-digit ` : '4–8 digit '}PIN to access private ledger`}
        </p>

        <div className="flex justify-center gap-3 mb-5">
          {Array.from({ length: dotSlots }).map((_, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                pinInput.length > idx
                  ? 'bg-emerald-500 border-emerald-500 scale-125'
                  : 'border-slate-300 dark:border-slate-700 bg-transparent'
              }`}
            />
          ))}
        </div>

        {pinError && (
          <div className="mb-4 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-2xl border border-rose-200 dark:border-rose-900/50">
            {pinError}
            {lockoutRemaining > 0 && (
              <span className="block mt-1 font-mono text-[11px]">
                {lockoutRemaining}s
              </span>
            )}
          </div>
        )}

        <div dir="ltr" className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-4 max-w-[280px] mx-auto select-none">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              disabled={lockoutRemaining > 0}
              onClick={() => appendDigit(num)}
              className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-base sm:text-lg font-bold font-serif text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 active:bg-emerald-100 dark:active:bg-emerald-950 transition-all disabled:opacity-40 cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={lockoutRemaining > 0 || pinInput.length === 0}
            onClick={() => setPinInput('')}
            className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            {isUrdu ? 'صاف' : 'Clear'}
          </button>
          <button
            type="button"
            disabled={lockoutRemaining > 0}
            onClick={() => appendDigit('0')}
            className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-base sm:text-lg font-bold font-serif text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            disabled={lockoutRemaining > 0 || pinInput.length === 0}
            onClick={() => setPinInput(prev => prev.slice(0, -1))}
            className="h-12 sm:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {pinInput.length >= 4 && (!expectedPinLength || maxDigits > 4) && (
          <button
            type="button"
            disabled={lockoutRemaining > 0 || pinInput.length < 4}
            onClick={() => onSubmitPin(pinInput)}
            className="w-full max-w-[280px] mx-auto mb-3 min-h-[44px] py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            {isUrdu ? 'کھاتہ کھولیں' : 'Unlock Khata'}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setResetError('');
            setGuestResetPhrase('');
            setShowForgotDialog(true);
          }}
          className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline min-h-[44px] flex items-center justify-center mx-auto cursor-pointer"
        >
          {isUrdu ? 'پن کوڈ بھول گئے؟ ری سیٹ کریں' : 'Forgot PIN? Reset Lock'}
        </button>

        {showForgotDialog && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-start space-y-3">
            <div className="flex items-start gap-2 text-xs text-amber-950 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {isSignedIn
                  ? isUrdu
                    ? 'پن لاک ختم کرنے کے لیے گوگل اکاؤنٹ سے دوبارہ تصدیق درکار ہے۔'
                    : 'Google account re-authentication is required to reset your Khata PIN lock.'
                  : isUrdu
                  ? 'مہمان موڈ میں پن ختم کرنے کے لیے نیچے RESET PIN لکھ کر تصدیق کریں۔'
                  : 'To reset your PIN in Guest Mode, type "RESET PIN" below to confirm.'}
              </span>
            </div>

            {!isSignedIn && (
              <input
                type="text"
                value={guestResetPhrase}
                onChange={e => setGuestResetPhrase(e.target.value)}
                placeholder="RESET PIN"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-600 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
              />
            )}

            {resetError && (
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                {resetError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForgotDialog(false)}
                className="flex-1 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleConfirmForgotPin}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {resetting
                  ? isUrdu
                    ? 'تصدیق ہو رہی ہے...'
                    : 'Verifying...'
                  : isSignedIn
                  ? isUrdu
                    ? 'گوگل سے تصدیق کریں'
                    : 'Verify with Google'
                  : isUrdu
                  ? 'تصدیق کریں'
                  : 'Confirm Reset'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
