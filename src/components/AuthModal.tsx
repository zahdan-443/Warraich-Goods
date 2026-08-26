import React, { useState } from 'react';
import { ShieldCheck, LogIn, X, AlertCircle, Copy, Check, User, KeyRound, Lock, Sparkles, Cloud, Database } from 'lucide-react';
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
  const OWNER_EMAIL = 'warraichgoods43@gmail.com';
  // Valid owner master PINs/passwords for app owner access
  const VALID_OWNER_KEYS = ['4430', '03005370443', 'warraich12345', 'zahid4430', 'warraich43'];
  
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);
  
  // Custom email / password login state
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [isOwnerEmailAttempt, setIsOwnerEmailAttempt] = useState(false);

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
      const extractedEmail = user?.email || user?.providerData?.[0]?.email || user?.phoneNumber || user?.displayName || (user?.uid ? `user_${user.uid.slice(0, 6)}@gmail.com` : '');
      
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
            ? `اس ویب ڈومین (${currentHostname}) پر گوگل سائن ان فائر بیس کنسول میں ابھی رجسٹرڈ نہیں ہے۔ آپ "ای میل و پن لاگ ان" کے ذریعے محفوظ طریقے سے سائن ان کر سکتے ہیں، یا فائر بیس کنسول میں یہ ڈومین شامل کر سکتے ہیں۔`
            : `This web domain (${currentHostname}) is not yet in your Firebase Authorized Domains list. Please authenticate using Email & Password/PIN, or add this domain in Firebase Console.`
        );
      } else if (err?.code === 'auth/popup-blocked') {
        setError(
          lang === 'ur'
            ? 'براؤزر نے پوپ اپ ونڈو بلاک کر دی۔ براہ کرم پوپ اپ کی اجازت دیں یا ای میل کے ذریعے لاگ ان کریں۔'
            : 'Google Sign-In popup was blocked by your browser. Please allow popups or use Email login below.'
        );
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError(
          lang === 'ur'
            ? 'گوگل سائن ان ونڈو بند کر دی گئی۔'
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

  const handleEmailChange = (val: string) => {
    setCustomEmail(val);
    const clean = val.trim().toLowerCase();
    setIsOwnerEmailAttempt(clean === OWNER_EMAIL.toLowerCase());
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = customEmail.trim().toLowerCase();
    
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(lang === 'ur' ? 'براہ کرم درست ای میل پتہ درج کریں۔' : 'Please enter a valid email address.');
      return;
    }

    // STRICT OWNER AUTHENTICATION VERIFICATION
    if (cleanEmail === OWNER_EMAIL.toLowerCase()) {
      const cleanPass = customPassword.trim().toLowerCase();
      if (!cleanPass) {
        setError(
          lang === 'ur'
            ? 'ایپ آنر (warraichgoods43@gmail.com) کے لیے سیکیورٹی پاس کوڈ یا پاس ورڈ درج کرنا لازمی ہے۔'
            : 'Security Passcode / Master Password is required for App Owner sign in.'
        );
        return;
      }
      
      const isPassValid = VALID_OWNER_KEYS.includes(cleanPass);
      if (!isPassValid) {
        setError(
          lang === 'ur'
            ? '❌ سیکیورٹی الرٹ: غلط پاس کوڈ/پاس ورڈ۔ ایپ آنر پورٹل تک غیر مجاز رسائی ناممکن ہے۔'
            : '❌ Security Alert: Invalid Passcode. Unauthorized access to Owner Portal is blocked.'
        );
        return;
      }
    }

    // General user / driver / staff login with their own email
    onSuccess(cleanEmail);
    if (onClose) onClose();
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
                {lang === 'ur' ? 'وڑائچ گڈز سیکیور لاگ ان' : 'Warraich Goods Sign In'}
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                {lang === 'ur' ? 'کلاؤڈ ڈیٹا سنک اور سیکیور پورٹل' : 'Cloud Sync & Fleet Management Access'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-black/20 rounded-xl">
            <button
              type="button"
              onClick={() => { setAuthMethod('google'); setError(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate flex items-center justify-center gap-2 ${
                authMethod === 'google' ? 'bg-white text-[#162a4d] shadow-xs' : 'text-slate-200 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign-In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('email'); setError(null); }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center truncate flex items-center justify-center gap-2 ${
                authMethod === 'email' ? 'bg-white text-[#162a4d] shadow-xs' : 'text-slate-200 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{lang === 'ur' ? 'ای میل / پن لاگ ان' : 'Email / Password'}</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5 bg-[#fdfbf7]">
          
          {/* Cloud Sync Benefit Note */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-900 text-xs">
            <Cloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {lang === 'ur' ? 'کلاؤڈ بیک اپ اور حفاظت:' : 'Cloud Backup & Sync:'}
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                {lang === 'ur'
                  ? 'سائن ان کرنے سے آپ کے تمام ٹرپس، بلٹیاں اور اخراجات کلاؤڈ میں خودکار طور پر محفوظ رہیں گے۔'
                  : 'Signing in securely synchronizes your trips, bilties, and fleet records with Cloud backup.'}
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
                  <button
                    type="button"
                    onClick={() => { setAuthMethod('email'); setError(null); }}
                    className="w-full py-2 px-3 bg-[#1e3a68] text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{lang === 'ur' ? 'ای میل / پاس ورڈ سے سائن ان کریں' : 'Sign In via Email / PIN'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: GOOGLE AUTH */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                  {lang === 'ur' ? 'گوگل اکاؤنٹ سے لاگ ان کریں' : 'Official Google Sign In'}
                </h3>
                <p className="text-xs text-[#8e8e75] leading-relaxed">
                  {lang === 'ur'
                    ? 'اپنے رجسٹرڈ جی میل اکاؤنٹ کے ذریعے باضابطہ تصدیق کریں اور کلاؤڈ ریکارڈز سنک رکھیں۔'
                    : 'Authenticate securely using your Google Account to synchronize fleet logs.'}
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
                    : (lang === 'ur' ? 'گوگل اکاؤنٹ کے ذریعے تصدیق کریں' : 'Sign In with Google Account')}
                </span>
              </button>
            </div>
          )}

          {/* TAB 2: SECURE EMAIL / PIN */}
          {authMethod === 'email' && (
            <form onSubmit={handleCustomEmailSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-serif font-bold text-base text-[#4a4a35]">
                  {lang === 'ur' ? 'ای میل اور پاس ورڈ سے لاگ ان' : 'Sign In with Email & Password'}
                </h3>
                <p className="text-xs text-[#8e8e75]">
                  {lang === 'ur'
                    ? 'اپنا رجسٹرڈ ای میل اور سیکیورٹی پاس ورڈ درج کریں'
                    : 'Enter your designated email and security password to access'}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#4a4a35] uppercase tracking-wider">
                  {lang === 'ur' ? 'ای میل ایڈریس' : 'Email Address'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={customEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-[#ecece0] rounded-xl font-mono focus:outline-none focus:border-[#1e3a68]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#4a4a35] uppercase tracking-wider">
                  {isOwnerEmailAttempt
                    ? (lang === 'ur' ? '🔒 آنر ماسٹر پاس کوڈ (لازمی)' : '🔒 Master Owner Passcode (Required)')
                    : (lang === 'ur' ? 'پاس ورڈ یا پن (اختیاری)' : 'Password / PIN (Optional)')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    className={`w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border rounded-xl font-mono focus:outline-none ${
                      isOwnerEmailAttempt 
                        ? 'border-amber-400 focus:border-amber-600 bg-amber-50/30' 
                        : 'border-[#ecece0] focus:border-[#1e3a68]'
                    }`}
                  />
                </div>
                {isOwnerEmailAttempt && (
                  <p className="text-[10px] text-amber-800 font-sans">
                    {lang === 'ur' 
                      ? '⚠️ ایپ آنر (warraichgoods43@gmail.com) پورٹل کے لیے مستند پاس کوڈ درکار ہے۔'
                      : '⚠️ Valid Master passcode required to authenticate as App Owner.'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1e3a68] hover:bg-[#162a4d] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'ur' ? 'محفوظ لاگ ان کریں' : 'Sign In Securely'}</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-[#f0f0e4] border-t border-[#ecece0] flex items-center justify-between text-[11px] text-[#8e8e75]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1e3a68]" />
            <span>Warraich Goods Security</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-700 font-bold">Encrypted & Secure</span>
        </div>
      </div>
    </div>
  );
};
