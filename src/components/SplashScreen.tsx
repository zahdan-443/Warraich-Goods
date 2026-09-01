import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';

interface SplashScreenProps {
  onDismiss: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  isBiltyAuthorized?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const base = import.meta.env.BASE_URL ?? './';
  const cleanBase = base.endsWith('/') ? base : base + '/';

  const candidates = [
    './splash.png',
    `${cleanBase}splash.png`,
    '/splash.png',
    'splash.png',
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // Show splash screen for quick snappy intro (700ms) then smoothly fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        try {
          sessionStorage.setItem('ah_splash_shown', '1');
        } catch {
          // ignore
        }
        onDismiss();
      }, 200);
    }, 700);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleError = () => {
    if (idx + 1 < candidates.length) {
      setIdx(i => i + 1);
    }
  };

  const dismiss = () => {
    setFadeOut(true);
    try {
      sessionStorage.setItem('ah_splash_shown', '1');
    } catch {
      // ignore
    }
    setTimeout(onDismiss, 250);
  };

  return (
    <div
      id="app-splash-screen"
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#162a4d',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={candidates[idx]}
        alt="Driver Dost Welcome Splash Screen"
        onLoad={() => setImgLoaded(true)}
        onError={handleError}
        decoding="async"
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          maxWidth: '100vw',
          maxHeight: '100vh',
          display: 'block',
          opacity: imgLoaded ? 1 : 0,
          transition: 'opacity 0.2s ease-in',
        }}
      />
    </div>
  );
};




