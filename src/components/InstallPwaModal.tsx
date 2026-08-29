import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { PublicImage } from '../assets/dashboardIcons';

interface InstallPwaModalProps {
  lang: Language;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleOpenRequest = () => {
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('wg_open_install_modal', handleOpenRequest);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('wg_open_install_modal', handleOpenRequest);
    };
  }, [isInstalled]);

  const [showManualGuide, setShowManualGuide] = useState<boolean>(false);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowModal(false);
    } else {
      setShowManualGuide(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    localStorage.setItem('wg_install_dismissed', 'true');
  };

  if (!showModal || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl border border-[#ecece0] overflow-hidden text-right relative animate-in zoom-in-95 duration-200">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#162a4d] via-[#1e3a68] to-[#162a4d] p-6 text-white text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-3xl bg-white p-2 mx-auto mb-3 shadow-lg border-2 border-[#b58b28] flex items-center justify-center overflow-hidden">
            <PublicImage
              fileName="icon-192.png"
              alt="Driver Dost"
              className="w-full h-full object-contain"
              fallbackIcon={
                <PublicImage
                  fileName="logo.png"
                  alt="Driver Dost Logo"
                  className="w-full h-full object-contain"
                />
              }
            />
          </div>

          <h3 className="font-serif font-bold text-lg text-white tracking-tight">
            {lang === 'ur' ? 'ڈرائیور دوست ایپ انسٹال کریں' : 'Install Driver Dost App'}
          </h3>
          <p className="text-xs text-amber-200 font-sans mt-1">
            {lang === 'ur' ? 'آف لائن رسائی، سفر ڈائری اور تیز رفتار فلیٹ کنٹرول' : 'Fast offline trip logger & road logistics toolkit'}
          </p>
        </div>

        {/* Modal content */}
        <div className="p-6 space-y-4 bg-[#fdfbf7]">
          <div className="space-y-2.5 text-xs text-[#5a5a40] font-sans">
            <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#ecece0]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lang === 'ur' ? 'بغیر انٹرنیٹ (آف لائن) بلٹی اور سفر ڈائری دیکھیں' : 'Full offline access for bilty & trip logs'}</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#ecece0]">
              <Smartphone className="w-4 h-4 text-[#8b9d77] shrink-0" />
              <span>{lang === 'ur' ? 'موبائل ہوم اسکرین اور فل سکرین موڈ (بغیر براؤزر بار)' : 'Home screen launch & full screen (no browser bar)'}</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white p-3 rounded-2xl border border-[#ecece0]">
              <ShieldCheck className="w-4 h-4 text-[#1e3a68] shrink-0" />
              <span>{lang === 'ur' ? 'محفوظ اینڈ ٹو اینڈ گوڈاؤن ریکارڈ' : 'Encrypted & secure offline transport database'}</span>
            </div>
          </div>

          {/* Manual Install Instructions Card */}
          {showManualGuide && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 animate-in fade-in space-y-1">
              <strong className="block font-bold">
                {lang === 'ur' ? 'براؤزر سے انسٹال کرنے کا طریقہ:' : 'How to install manually:'}
              </strong>
              <p className="text-[11px] leading-relaxed text-amber-800">
                {lang === 'ur'
                  ? 'اوپر دائیں کونے میں براؤزر کے تین نقطوں (⋮) یا شیئر (Share) بٹن پر کلک کریں اور "Install app" یا "Add to Home screen" منتخب کریں۔'
                  : 'Tap your browser menu (⋮ or Share button) and select "Install app" or "Add to Home screen".'}
              </p>
            </div>
          )}

          {/* Install Button */}
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-serif font-bold text-sm tracking-wider flex items-center justify-center gap-2.5 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <Download className="w-5 h-5 text-emerald-200" />
            <span>{lang === 'ur' ? 'ایپ ابھی انسٹال کریں (Install Now)' : 'Install Official App Now'}</span>
          </button>

          <button
            onClick={handleClose}
            className="w-full py-2 text-center text-xs text-[#8e8e75] hover:text-[#4a4a35] font-semibold cursor-pointer"
          >
            {lang === 'ur' ? 'بعد میں کریں (Skip for now)' : 'Skip for now'}
          </button>
        </div>

      </div>
    </div>
  );
};
