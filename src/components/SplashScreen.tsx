import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { AlHadiLogo } from './AlHadiLogo';

interface SplashScreenProps {
  onDismiss: () => void;
  onSelectTab?: (tab: ActiveTab) => void;
  isBiltyAuthorized?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // splash.png use kar rahe hain — 1080x1920 proper PNG hai
  // splash-screen.png JPEG hai aur 2752x5716 bahut badi hai
  const base = import.meta.env.BASE_URL ?? './';
  const cleanBase = base.endsWith('/') ? base : base + '/';

  const candidates = [
    `${cleanBase}splash.png`,        // /Warraich-Goods/splash.png  ← GitHub Pages
    `${cleanBase}splash-screen.png`, // backup
    `./splash.png`,                   // relative fallback
    `./splash-screen.png`,
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDismiss, 500);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleError = () => {
    if (idx + 1 < candidates.length) {
      setIdx(i => i + 1);
    } else {
      setImgFailed(true);
    }
  };

  const dismiss = () => {
    setFadeOut(true);
    setTimeout(onDismiss, 400);
  };

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#000',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        cursor: 'pointer',
      }}
    >
      {!imgFailed ? (
        <img
          src={candidates[idx]}
          alt="Warraich Goods"
          onError={handleError}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
          }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          background: '#162a4d',
        }}>
          <AlHadiLogo className="w-28 h-28" />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#c59b27', fontSize: '24px', fontWeight: 'bold' }}>
              Warraich Goods
            </div>
            <div style={{ color: 'white', fontSize: '14px', marginTop: '6px' }}>
              وڑائچ گڈز ٹرانسپورٹ کمپنی
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
