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
  const onDismissRef = useRef(onDismiss);

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
    try {
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

  return (
    <div
      id="app-splash-screen"
      onClick={dismiss}
      role="banner"
      aria-label="Driver Dost Welcome Screen"
      className="fixed inset-0 w-screen h-screen z-[99999] bg-white flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{
        opacity: fadeOut ? 0 : 1,
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
          <span>چھوڑیں</span>
          <span className="text-[10px] opacity-75">• Skip ✕</span>
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
          dir="rtl"
        >
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/95 shadow-md border border-slate-200 backdrop-blur-sm">
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
