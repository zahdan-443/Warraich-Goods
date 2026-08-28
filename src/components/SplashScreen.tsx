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
    // Quick, smooth 1.5s splash
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDismiss, 400);
    }, 1500);
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
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'linear-gradient(180deg, #162a4d 0%, #0f1c34 100%)',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.4s ease-in-out',
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
      ) : null}

      {/* Elegant Fallback Emblem if image is loading or failed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          zIndex: imgFailed ? 1 : 0,
        }}
      >
        <AlHadiLogo className="w-24 h-24 drop-shadow-md" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#c59b27', fontSize: '22px', fontWeight: 'bold', fontFamily: 'serif' }}>
            Warraich Goods
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '13px', marginTop: '4px', fontFamily: "'Noto Sans Arabic', sans-serif" }}>
            وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)
          </div>
        </div>
      </div>
    </div>
  );
};

