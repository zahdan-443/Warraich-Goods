import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';

interface SplashScreenProps {
  onDismiss: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  isBiltyAuthorized?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const base = import.meta.env.BASE_URL ?? './';
  const cleanBase = base.endsWith('/') ? base : base + '/';

  const candidates = [
    `${cleanBase}splash.png`,
    `./splash.png`,
    `${cleanBase}splash-screen.png`,
    `./splash-screen.png`,
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // Show splash for 1.8s then smoothly fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDismiss, 400);
    }, 1800);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleError = () => {
    if (idx + 1 < candidates.length) {
      setIdx(i => i + 1);
    }
  };

  const dismiss = () => {
    setFadeOut(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#162a4d',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.4s ease-in-out',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={candidates[idx]}
        alt="Warraich Goods Splash Screen"
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
        }}
      />
    </div>
  );
};


