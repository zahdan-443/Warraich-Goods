import React, { useState } from 'react';
import { ShieldCheck, LogIn, X, AlertCircle, Copy, Check, Cloud, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { loginWithGoogle } from '../utils/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (email: string) => void;
  lang: Language;
  fullScreen?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, lang, fullScreen = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopyDomain = () => {
    if (navigator.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setDomainCopied(true);
      setTimeout(() => setDomainCopied(false), 2500);
    }
  };

  const handleStartGoogle = async () => {
    setLoading(true);
    setError(null);
    setIsUnauthorizedDomain(false);
    try {
      const user = await loginWithGoogle();
      const extractedEmail = user?.email || user?.providerData?.[0]?.email || '';
      
      if (user && extractedEmail) {
        onSuccess(extractedEmail);
        if (onClose) onClose();
      } else {
        setError(
          lang === 'ur'
            ? 'گوگل اکاؤنٹ کی معلومات حاصل نہیں ہوسکی۔ دوبارہ کوشش کریں۔'
            : 'Could not retrieve user info from Google Account. Please try again.'
        );
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      const isUnauth = err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('auth/unauthorized-domain'));
      
      if (isUnauth) {
        setIsUnauthorizedDomain(true);
        setError(
          lang === 'ur'
            ? `اس ویب ڈومین (${currentHostname}) پر گوگل سائن ان فائر بیس کنسول کے Authorized Domains میں شامل کرنا ہوگا۔`
            : `This web domain (${currentHostname}) is not yet in your Firebase Authorized Domains list. Please add this domain in Firebase Console > Authentication > Settings.`
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setError(
          lang === 'ur'
            ? 'براؤزر نے گوگل پوپ اپ ونڈو بلاک کر دی۔ براہ کرم پوپ اپ کی اجازت دیں۔'
            : 'Google Sign-In popup was blocked by your browser. Please allow popups.'
        );
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError(
          lang === 'ur'
            ? 'گوگل سائن ان ونڈو لاگ ان سے پہلے بند کر دی گئی۔'
            : 'Google Sign-In popup was closed before completion.'
        );
      } else {
        setError(
          (lang === 'ur' ? 'لاگ ان مکمل نہیں ہو سکا۔ ' : 'Google Sign-In failed: ') +
            (err?.message ? `(${err.message})` : '')
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${fullScreen ? 'bg-[#f5f2eb]' : 'bg-black/50 backdrop-blur-sm'} flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200`}>
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl border border-[#ecece0] overflow-hidden my-auto">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-[#162a4d] via-[#1e3a68] to-[#162a4d] p-6 text-white relative">
          {onClose && !fullScreen && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#b58b28] flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold tracking-tight">
                {lang === 'ur' ? 'ڈرائیور دوست سیکیور لاگ ان' : 'Driver Dost Sign In'}
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                {lang === 'ur' ? 'گوگل فائر بیس کلاؤڈ تصدیق' : 'Official Google Firebase Authentication'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5 bg-[#fdfbf7]">
          
          {/* Cloud Sync Benefit Note */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-900 text-xs">
            <Cloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {lang === 'ur' ? 'کلاؤڈ ڈیٹا سنک اور حفاظت:' : 'Cloud Backup & Sync:'}
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                {lang === 'ur'
                  ? 'اپنے آفیشل جی میل اکاؤنٹ کے ذریعے سائن ان کریں تاکہ آپ کا ریکارڈ کلاؤڈ میں خودکار طور پر بیک اپ رہے۔'
                  : 'Sign in with your official Google Account to automatically synchronize and safeguard your fleet records.'}
              </p>
            </div>
          </div>

          {/* Detailed Error / Unauthorized Domain Banner */}
          {error && (
            <div className={`p-4 rounded-2xl text-xs space-y-3 ${
              isUnauthorizedDomain 
                ? 'bg-amber-50/90 border border-amber-300 text-amber-950' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isUnauthorizedDomain ? 'text-amber-600' : 'text-red-600'}`} />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs">
                    {isUnauthorizedDomain 
                      ? (lang === 'ur' ? 'فائر بیس ڈومین تصدیق درکار ہے' : 'Firebase Domain Authorization Notice') 
                      : (lang === 'ur' ? 'سیکیورٹی و لاگ ان الرٹ' : 'Authentication Alert')}
                  </h4>
                  <p className="text-[11px] leading-relaxed text-[#5a5a40]">
                    {error}
                  </p>
                </div>
              </div>

              {/* Actionable Fallback Helpers for Unauthorized Domain */}
              {isUnauthorizedDomain && (
                <div className="space-y-2 pt-2 border-t border-amber-200/80">
                  <div className="flex items-center justify-between gap-2 bg-amber-100/70 p-2 rounded-xl">
                    <span className="text-[11px] font-mono text-amber-900 truncate max-w-[190px]" title={currentHostname}>
                      {currentHostname}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyDomain}
                      className="px-2.5 py-1 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                    >
                      {domainCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>{lang === 'ur' ? 'کاپی ہو گیا!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{lang === 'ur' ? 'ڈومین کاپی کریں' : 'Copy Domain'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GOOGLE AUTH BUTTON */}
          <div className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                {lang === 'ur' ? 'گوگل اکاؤنٹ سے لاگ ان کریں' : 'Sign In with Google'}
              </h3>
              <p className="text-xs text-[#8e8e75] leading-relaxed">
                {lang === 'ur'
                  ? 'مستند اور محفوظ لاگ ان کے لیے نیچے دیے گئے بٹن پر کلک کریں۔'
                  : 'Click below to securely authenticate with verified Google OAuth credentials.'}
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleStartGoogle}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-[#ecece0] hover:border-[#8b9d77] rounded-2xl font-semibold text-xs text-[#4a4a35] flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-98 disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {loading
                  ? (lang === 'ur' ? 'گوگل سے منسلک ہو رہا ہے...' : 'Connecting Google...')
                  : (lang === 'ur' ? 'گوگل اکاؤنٹ کے ذریعے لاگ ان کریں' : 'Sign In with Google Account')}
              </span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-[#f0f0e4] border-t border-[#ecece0] flex items-center justify-between text-[11px] text-[#8e8e75]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1e3a68]" />
            <span>Driver Dost Security</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-700 font-bold">Google Verified OAuth</span>
        </div>
      </div>
    </div>
  );
};
