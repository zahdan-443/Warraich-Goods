import React, { useState, useEffect, useCallback } from 'react';
import { Download, X, Smartphone, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { PublicImage } from '../assets/dashboardIcons';
import { isNativeApp } from '../utils/platform';

interface InstallPwaModalProps {
  lang: Language;
}

const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

function isStandaloneOrTwa(): boolean {
  if (typeof window === 'undefined') return false;
  if (isNativeApp()) return true;
  const ua = (navigator.userAgent || '').toLowerCase();
  const search = window.location.search.toLowerCase();
  return (
    document.referrer.includes('android-app://') ||
    search.includes('utm_source=twa') ||
    search.includes('twa=') ||
    ua.includes('; wv') ||
    ua.includes('version/4.0 chrome/') ||
    (window as any).isTWA === true ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isDismissedRecently(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (sessionStorage.getItem('wg_install_session_dismissed') === 'true') {
      return true;
    }
    const lastDismissed = Number(localStorage.getItem('wg_install_last_dismissed') || '0');
    if (lastDismissed > 0 && Date.now() - lastDismissed < DISMISS_COOLDOWN_MS) {
      return true;
    }
  } catch {
    // ignore storage errors
  }
  return false;
}

function isIOSBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test((navigator.userAgent || '').toLowerCase());
}

const InstallPwaController: React.FC<InstallPwaModalProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    return (window as any).__wg_pwa_deferred_prompt || null;
  });
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isStandaloneOrTwa());
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showAutoBanner, setShowAutoBanner] = useState<boolean>(false);
  const [showManualGuide, setShowManualGuide] = useState<boolean>(false);

  useEffect(() => {
    if (isStandaloneOrTwa()) {
      setIsInstalled(true);
      setShowModal(false);
      setShowAutoBanner(false);
      return;
    }

    const syncDeferredPrompt = (evt?: Event) => {
      const candidate = evt || (window as any).__wg_pwa_deferred_prompt;
      if (!candidate) return;
      (window as any).__wg_pwa_deferred_prompt = candidate;
      setDeferredPrompt(candidate);
      setIsInstalled(false);
      try {
        localStorage.removeItem('wg_pwa_installed');
        localStorage.removeItem('app_installed_status');
      } catch {
        // ignore
      }
    };

    // Pick up prompt if captured in <head> before React hydrated
    if ((window as any).__wg_pwa_deferred_prompt) {
      syncDeferredPrompt((window as any).__wg_pwa_deferred_prompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      syncDeferredPrompt(e);
    };

    const handlePromptReady = () => {
      syncDeferredPrompt((window as any).__wg_pwa_deferred_prompt);
    };

    const handleAppInstalled = () => {
      (window as any).__wg_pwa_deferred_prompt = null;
      try {
        localStorage.setItem('wg_pwa_installed', 'true');
        localStorage.setItem('app_installed_status', 'installed');
      } catch {
        // ignore
      }
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowModal(false);
      setShowAutoBanner(false);
    };

    const handleOpenRequest = () => {
      if (!isStandaloneOrTwa()) {
        setShowAutoBanner(false);
        setShowManualGuide(false);
        setShowModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('wg_pwa_prompt_ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('wg_pwa_app_installed', handleAppInstalled);
    window.addEventListener('wg_open_install_modal', handleOpenRequest);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('wg_pwa_prompt_ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('wg_pwa_app_installed', handleAppInstalled);
      window.removeEventListener('wg_open_install_modal', handleOpenRequest);
    };
  }, []);

  // Automatically surface a non-blocking install prompt banner once Chrome signals installability
  useEffect(() => {
    if (isInstalled || showModal) {
      setShowAutoBanner(false);
      return;
    }
    const hasPrompt = Boolean(deferredPrompt || (typeof window !== 'undefined' && (window as any).__wg_pwa_deferred_prompt));
    if (!hasPrompt || isDismissedRecently()) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!isStandaloneOrTwa() && !isDismissedRecently()) {
        setShowAutoBanner(true);
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [deferredPrompt, isInstalled, showModal]);

  const markDismissed = useCallback(() => {
    setShowModal(false);
    setShowAutoBanner(false);
    try {
      sessionStorage.setItem('wg_install_session_dismissed', 'true');
      localStorage.setItem('wg_install_last_dismissed', Date.now().toString());
    } catch {
      // ignore
    }
  }, []);

  const handleInstallClick = useCallback(async () => {
    const promptEvent = deferredPrompt || (window as any).__wg_pwa_deferred_prompt;
    if (promptEvent && typeof promptEvent.prompt === 'function') {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          try {
            localStorage.setItem('wg_pwa_installed', 'true');
            localStorage.setItem('app_installed_status', 'installed');
          } catch {
            // ignore
          }
          (window as any).__wg_pwa_deferred_prompt = null;
          setDeferredPrompt(null);
          setIsInstalled(true);
          setShowModal(false);
          setShowAutoBanner(false);
          return;
        }
        // User dismissed Chrome's native dialog; clear consumed prompt event
        (window as any).__wg_pwa_deferred_prompt = null;
        setDeferredPrompt(null);
        markDismissed();
        return;
      } catch (err) {
        console.warn('Install prompt triggered error:', err);
      }
    }
    // Fallback: open modal with manual browser install instructions
    setShowAutoBanner(false);
    setShowModal(true);
    setShowManualGuide(true);
  }, [deferredPrompt, markDismissed]);

  if (isInstalled) return null;

  const isUrdu = lang === 'ur';
  const ios = isIOSBrowser();

  return (
    <>
      {/* Non-blocking Floating Web App Install Popup Banner (Web Chrome only) */}
      {showAutoBanner && !showModal && (
        <div
          dir={isUrdu ? 'rtl' : 'ltr'}
          role="dialog"
          aria-label={isUrdu ? 'ویب ایپ انسٹال کریں' : 'Install Driver Dost Web App'}
          className="fixed bottom-20 sm:bottom-5 left-3 right-3 sm:left-auto sm:right-5 sm:w-[370px] z-40 animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          <div className="bg-[#fdfbf7] border border-[#d6d6c2] shadow-2xl rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 border border-[#ecece0] shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
              <PublicImage
                fileName="icon-192.png"
                alt="Driver Dost Icon"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                fallbackIcon={
                  <PublicImage
                    fileName="logo.png"
                    alt="Driver Dost Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                }
              />
            </div>

            <div className={`flex-1 min-w-0 ${isUrdu ? 'text-right' : 'text-left'}`}>
              <div className="font-serif font-bold text-sm text-[#162a4d] truncate">
                {isUrdu ? 'ڈرائیور دوست ایپ انسٹال کریں' : 'Install Driver Dost App'}
              </div>
              <p className="text-[11px] text-[#5a5a40] leading-snug mt-0.5">
                {isUrdu
                  ? 'ہوم اسکرین پر شامل کریں — تیز اور آف لائن استعمال'
                  : 'Add to Home Screen for fast offline access'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'انسٹال کریں' : 'Install'}</span>
                </button>
                <button
                  type="button"
                  onClick={markDismissed}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-[#6b6b52] hover:bg-[#ecece0]/70 cursor-pointer transition-colors"
                >
                  {isUrdu ? 'بعد میں' : 'Later'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={markDismissed}
              aria-label={isUrdu ? 'بند کریں' : 'Dismiss install popup'}
              className="self-start p-1 rounded-full text-[#8e8e75] hover:text-[#4a4a35] hover:bg-[#ecece0]/60 cursor-pointer transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Full Install Modal (opened on demand from Header menu or manual fallback) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 pt-[max(env(safe-area-inset-top,0px),1rem)] pb-[max(env(safe-area-inset-bottom,0px),1rem)] animate-in fade-in duration-300">
          <div
            dir={isUrdu ? 'rtl' : 'ltr'}
            className={`bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-[#ecece0] overflow-hidden ${isUrdu ? 'text-right' : 'text-left'} relative animate-in zoom-in-95 duration-200`}
          >
            {/* Header decoration */}
            <div className="bg-gradient-to-r from-[#162a4d] via-[#1e3a68] to-[#162a4d] p-6 text-white text-center relative">
              <button
                type="button"
                onClick={markDismissed}
                aria-label={isUrdu ? 'بند کریں' : 'Close'}
                className={`absolute top-4 ${isUrdu ? 'left-4' : 'right-4'} p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-white p-2 mx-auto mb-3 shadow-lg border-2 border-[#b58b28] flex items-center justify-center overflow-hidden">
                <PublicImage
                  fileName="icon-192.png"
                  alt="Driver Dost Mobile App Icon"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                  fallbackIcon={
                    <PublicImage
                      fileName="logo.png"
                      alt="Driver Dost Official App Logo"
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                    />
                  }
                />
              </div>

              <h2 className="font-serif font-bold text-lg text-white tracking-tight">
                {isUrdu ? 'ڈرائیور دوست ایپ انسٹال کریں' : 'Install Driver Dost App'}
              </h2>
              <p className="text-xs text-amber-200 font-sans mt-1">
                {isUrdu ? 'آف لائن رسائی، سفر ڈائری اور تیز رفتار فلیٹ کنٹرول' : 'Fast offline trip logger & road logistics toolkit'}
              </p>
            </div>

            {/* Modal content */}
            <div className="p-6 space-y-4 bg-[#fdfbf7]">
              <div className="space-y-2.5 text-xs text-[#5a5a40] font-sans">
                <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#ecece0]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isUrdu ? 'بغیر انٹرنیٹ (آف لائن) سفر ڈائری، کھاتہ اور فلیٹ ریکارڈ' : 'Full offline access for trip logs, ledger & fleet records'}</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#ecece0]">
                  <Smartphone className="w-4 h-4 text-[#8b9d77] shrink-0" />
                  <span>{isUrdu ? 'موبائل ہوم اسکرین اور فل سکرین موڈ (بغیر براؤزر بار)' : 'Home screen launch & full screen (no browser bar)'}</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#ecece0]">
                  <ShieldCheck className="w-4 h-4 text-[#1e3a68] shrink-0" />
                  <span>{isUrdu ? 'آپ کی ڈیوائس پر محفوظ آف لائن ڈیٹا بیس' : 'Secure local & private transport database'}</span>
                </div>
              </div>

              {/* Manual Install Instructions Card */}
              {(showManualGuide || (ios && !deferredPrompt)) && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 animate-in fade-in space-y-1">
                  <strong className="block font-bold">
                    {ios
                      ? (isUrdu ? 'آئی فون سفاری میں انسٹال کرنے کا طریقہ:' : 'How to install on iPhone / iPad:')
                      : (isUrdu ? 'براؤزر سے انسٹال کرنے کا طریقہ:' : 'How to install manually:')}
                  </strong>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    {ios
                      ? (isUrdu
                          ? 'نیچے شیئر بٹن پر کلک کریں اور "Add to Home Screen" منتخب کریں۔'
                          : 'Tap the Safari Share button and select "Add to Home Screen".')
                      : (isUrdu
                          ? 'اوپر کونے میں کروم کے تین نقطوں (⋮) پر کلک کریں اور "انسٹال ایپ" یا "ہوم اسکرین پر شامل کریں" منتخب کریں۔'
                          : 'Tap Chrome menu (⋮) in the top corner and select "Install app" or "Add to Home screen".')}
                  </p>
                </div>
              )}

              {/* Install Button */}
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl font-serif font-bold text-sm tracking-wider flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-5 h-5 text-emerald-200" />
                <span>{isUrdu ? 'ایپ ابھی انسٹال کریں' : 'Install Official App Now'}</span>
              </button>

              <button
                type="button"
                onClick={markDismissed}
                className="w-full py-2 text-center text-xs text-[#8e8e75] hover:text-[#4a4a35] font-semibold cursor-pointer"
              >
                {isUrdu ? 'بعد میں کریں' : 'Skip for now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ lang }) => {
  // If running in native Android or Capacitor app, never mount any PWA install prompt
  if (isNativeApp()) {
    return null;
  }

  return <InstallPwaController lang={lang} />;
};
