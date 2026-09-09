import { Capacitor } from '@capacitor/core';

/**
 * Returns true if running inside native Android / iOS wrapper (Capacitor / TWA / WebView).
 */
export function isNativeApp(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (Capacitor.isNativePlatform()) return true;
  } catch {
    // ignore
  }

  if (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:') {
    return true;
  }

  // Capacitor Android scheme runs on https://localhost
  if (window.location.protocol === 'https:' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return true;
  }

  if (document.referrer && document.referrer.includes('android-app://')) {
    return true;
  }

  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  if (
    ua.includes('capacitor') ||
    ua.includes('; wv') ||
    ua.includes('version/4.0 chrome/') ||
    (window as any).isTWA === true ||
    (window as any).Capacitor !== undefined
  ) {
    return true;
  }

  return false;
}
