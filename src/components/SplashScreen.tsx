import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveTab, Language } from '../types';

interface SplashScreenProps {
  onDismiss: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  isBiltyAuthorized?: boolean;
  lang?: Language;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss, lang }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const dismissedRef = useRef(false);
  const onDismissRef = useRef(onDismiss);

  const explicitLang = (() => {
    try {
      const saved = localStorage.getItem('ah-lang-user-explicit');
      if (saved === 'en' || saved === 'ur') return saved;
    } catch {}
    return null;
  })();

  const activeLang: Language | null = explicitLang || (lang ?? null);

  // Keep latest onDismiss reference without triggering effect re-runs
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setFadeOut(true);

    setTimeout(() => {
      try {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      } catch {}
      if (typeof onDismissRef.current === 'function') {
        onDismissRef.current();
      }
    }, 200);
  }, []);

  // Single mount effect: strictly timed display that CANNOT be cancelled by parent re-renders
  useEffect(() => {
    // Clean up initial HTML loader if still present
    try {
      const initialLoader = document.getElementById('app-initial-loader');
      if (initialLoader) {
        initialLoader.remove();
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } catch {}

    // Auto-dismiss after 1300ms so user sees the branding without delay
    const timer = setTimeout(() => {
      dismiss();
    }, 1300);

    // Guaranteed failsafe timer: under NO circumstance can splash stay visible past 2000ms
    const failsafe = setTimeout(() => {
      dismiss();
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(failsafe);
      try {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      } catch {}
    };
  }, [dismiss]);

  const skipLabel = activeLang === 'en'
    ? 'Skip ✕'
    : activeLang === 'ur'
      ? 'چھوڑیں ✕'
      : 'Skip • چھوڑیں ✕';

  const loadingLabel = activeLang === 'en'
    ? 'Loading Driver Dost...'
    : 'ڈرائیور دوست لوڈ ہو رہا ہے...';

  const tapLabel = activeLang === 'en'
    ? 'Tap anywhere to continue'
    : activeLang === 'ur'
      ? 'آگے بڑھنے کے لئے ٹچ کریں'
      : 'Tap anywhere to continue • آگے بڑھنے کے لئے ٹچ کریں';

  return (
    <div
      id="app-splash-screen"
      onClick={dismiss}
      role="banner"
      aria-label="Driver Dost Welcome Screen"
      className="fixed inset-0 w-screen h-screen z-[99999] bg-white flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'auto',
        transition: 'opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        touchAction: 'manipulation',
      }}
    >
      {/* Top Quick Skip Button */}
      <div 
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20"
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
      >
        <button
          type="button"
          aria-label="Skip splash screen"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#162a4d]/85 hover:bg-[#162a4d] text-white text-xs font-semibold backdrop-blur-md shadow-md border border-white/20 transition-all active:scale-95 cursor-pointer"
        >
          <span>{skipLabel}</span>
        </button>
      </div>

      {/* Main Splash Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src="./splash.png"
          alt="Driver Dost Welcome Splash Screen - Warraich Goods"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgLoaded(true)}
          decoding="async"
          loading="eager"
          className="w-full h-full object-cover sm:object-contain max-h-screen"
          style={{
            maxWidth: '100vw',
            maxHeight: '100vh',
            display: 'block',
            opacity: imgLoaded ? 1 : 0.98,
            transition: 'opacity 0.2s ease-in',
          }}
        />

        {/* Subtle Brand Loading Status Bar at Bottom */}
        <div 
          className="absolute bottom-5 sm:bottom-8 inset-x-0 flex flex-col items-center justify-center gap-2 pointer-events-none px-4"
          dir={activeLang === 'en' ? 'ltr' : 'rtl'}
        >
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 shadow-md border border-slate-200 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#8b9d77] animate-ping" />
            <span className="text-xs font-bold text-[#162a4d]">
              {loadingLabel}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium tracking-wide">
            {tapLabel}
          </span>
        </div>
      </div>
    </div>
  );
};
