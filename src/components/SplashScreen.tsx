import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ActiveTab } from '../types';

interface SplashScreenProps {
  onDismiss: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  isBiltyAuthorized?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const dismissedRef = useRef(false);

  const base = import.meta.env.BASE_URL ?? './';
  const cleanBase = base.endsWith('/') ? base : base + '/';

  const candidates = [
    './splash.png',
    `${cleanBase}splash.png`,
    '/splash.png',
    'splash.png',
  ];
  const [idx, setIdx] = useState(0);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setFadeOut(true);

    setTimeout(() => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      onDismiss();
    }, 320);
  }, [onDismiss]);

  const handleError = useCallback(() => {
    if (idx + 1 < candidates.length) {
      setIdx(prev => prev + 1);
    } else {
      // Even if image fails to load, mark loaded so user sees screen then transitions
      setImgLoaded(true);
    }
  }, [idx, candidates.length]);

  // Initial mount: lock scroll and preload image
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Preload image in memory
    const preloader = new Image();
    preloader.src = candidates[idx];
    if (preloader.complete) {
      setImgLoaded(true);
    } else {
      preloader.onload = () => setImgLoaded(true);
      preloader.onerror = handleError;
    }

    // Safety fallback timeout: under no circumstance should the user be blocked longer than 4.5s
    const maxSafetyTimer = setTimeout(() => {
      dismiss();
    }, 4500);

    return () => {
      clearTimeout(maxSafetyTimer);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [idx, handleError, dismiss]);

  // Auto-dismiss timer starts once image has loaded
  useEffect(() => {
    if (!imgLoaded || dismissedRef.current) return;

    // Show full splash screen for 2200ms once loaded so user can see it cleanly
    const displayTimer = setTimeout(() => {
      dismiss();
    }, 2200);

    return () => clearTimeout(displayTimer);
  }, [imgLoaded, dismiss]);

  return (
    <div
      id="app-splash-screen"
      onClick={dismiss}
      role="banner"
      aria-label="Driver Dost Welcome Screen"
      className="fixed inset-0 w-screen h-screen z-[99999] bg-white flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#162a4d]/80 hover:bg-[#162a4d] text-white text-xs font-semibold backdrop-blur-md shadow-md border border-white/20 transition-all active:scale-95 cursor-pointer"
        >
          <span>چھوڑیں</span>
          <span className="text-[10px] opacity-75">• Skip ✕</span>
        </button>
      </div>

      {/* Main Splash Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={candidates[idx]}
          alt="Driver Dost Welcome Splash Screen - Warraich Goods"
          onLoad={() => setImgLoaded(true)}
          onError={handleError}
          decoding="async"
          loading="eager"
          className="w-full h-full object-cover sm:object-contain max-h-screen"
          style={{
            maxWidth: '100vw',
            maxHeight: '100vh',
            display: 'block',
            opacity: imgLoaded ? 1 : 0.98,
            transition: 'opacity 0.25s ease-in',
          }}
        />

        {/* Subtle Brand Loading Status Bar at Bottom */}
        <div 
          className="absolute bottom-5 sm:bottom-8 inset-x-0 flex flex-col items-center justify-center gap-2 pointer-events-none px-4"
          dir="rtl"
        >
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/90 shadow-md border border-slate-200 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#8b9d77] animate-ping" />
            <span className="text-xs font-bold text-[#162a4d]">
              ڈرائیور دوست لوڈ ہو رہا ہے...
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium tracking-wide">
            Tap anywhere to skip • آگے بڑھنے کے لئے ٹچ کریں
          </span>
        </div>
      </div>
    </div>
  );
};
