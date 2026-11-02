/**
 * Automated Crash Reporting & Device Diagnostics Service (Crashlytics Alternative)
 * Captures unhandled runtime errors, component exceptions, and hardware metadata.
 * Transmits diagnostic telemetry directly to Firestore (/crashReports) with loop throttling.
 */
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { APP_VERSION } from '../constants/version';
import { Capacitor } from '@capacitor/core';

export interface DeviceMetadata {
  platform: 'android' | 'ios' | 'web';
  isNative: boolean;
  userAgent: string;
  deviceModel: string;
  screenWidth: number;
  screenHeight: number;
  online: boolean;
}

export interface CrashReportPayload {
  errorName?: string;
  errorMessage: string;
  stack?: string;
  componentStack?: string;
  deviceModel: string;
  platform: string;
  appVersion: string;
  url: string;
  userUid?: string;
  createdAt?: any;
}

// In-memory throttle set to prevent flood loops (max 1 report per error signature per 5 minutes)
const reportedErrorSignatures = new Map<string, number>();
const THROTTLE_WINDOW_MS = 5 * 60 * 1000;

export function getDeviceDiagnostics(): DeviceMetadata {
  const isCapacitor = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
  const rawPlatform = isCapacitor ? Capacitor.getPlatform() : 'web';
  const platform = rawPlatform === 'android' ? 'android' : rawPlatform === 'ios' ? 'ios' : 'web';

  let deviceModel = 'Generic Device';
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua)) {
      const match = ua.match(/;\s*([^;)]+)\s*Build\//i);
      if (match && match[1]) {
        deviceModel = match[1].trim();
      } else {
        deviceModel = 'Android Device';
      }
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      deviceModel = 'Apple iOS Device';
    } else if (/windows/i.test(ua)) {
      deviceModel = 'Windows Desktop';
    } else if (/macintosh/i.test(ua)) {
      deviceModel = 'Mac Desktop';
    } else if (/linux/i.test(ua)) {
      deviceModel = 'Linux Desktop';
    }
  }

  return {
    platform,
    isNative: isCapacitor,
    userAgent: typeof navigator !== 'undefined' ? (navigator.userAgent || '').slice(0, 300) : '',
    deviceModel,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
}

/**
 * Report an application crash or fatal exception to Firestore.
 */
export async function reportAppCrash(
  error: unknown,
  componentStack?: string
): Promise<boolean> {
  try {
    let errorName = 'Error';
    let errorMessage = 'Unknown runtime exception';
    let stack = '';

    if (error instanceof Error) {
      errorName = error.name || 'Error';
      errorMessage = error.message || String(error);
      stack = error.stack || '';
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = String(error);
      }
    }

    // Generate unique signature for deduplication
    const signature = `${errorName}::${errorMessage.slice(0, 100)}`;
    const now = Date.now();
    const lastSent = reportedErrorSignatures.get(signature);

    if (lastSent && now - lastSent < THROTTLE_WINDOW_MS) {
      // Throttled duplicate error
      return false;
    }
    reportedErrorSignatures.set(signature, now);

    const diagnostics = getDeviceDiagnostics();
    const url = typeof window !== 'undefined' ? (window.location.href || '').slice(0, 200) : '';
    const userUid = auth?.currentUser?.uid || undefined;

    // Truncate fields to satisfy Firestore limits & avoid oversized packets
    const safeErrorName = (errorName || 'Error').slice(0, 100);
    const safeErrorMessage = (errorMessage || 'Unknown Error').slice(0, 1500);
    const safeStack = (stack || '').slice(0, 1500);
    const safeCompStack = (componentStack || '').slice(0, 1000);

    const reportId = `crash_${now}_${Math.random().toString(36).slice(2, 8)}`;

    const payload: Record<string, any> = {
      errorName: safeErrorName,
      errorMessage: safeErrorMessage,
      stack: safeStack,
      componentStack: safeCompStack,
      deviceModel: diagnostics.deviceModel,
      platform: diagnostics.platform,
      appVersion: APP_VERSION,
      url,
      ...(userUid ? { userUid } : {}),
      createdAt: serverTimestamp()
    };

    // Keep locally in localStorage for offline diagnostics inspection
    try {
      localStorage.setItem('wg_last_crash_report', JSON.stringify({
        ...payload,
        createdAt: new Date().toISOString()
      }));
    } catch {
      // ignore
    }

    if (db) {
      const docRef = doc(db, 'crashReports', reportId);
      await setDoc(docRef, payload);
      return true;
    }
  } catch (err) {
    // Failsafe: never crash the app inside crash reporter
    console.warn('[CrashReportingService] Failed to upload crash report:', err);
  }
  return false;
}

/**
 * Initializes global window error and unhandled rejection listeners.
 */
let isInitialized = false;

export function initCrashReporting(): void {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  window.addEventListener('error', (event) => {
    // Ignore benign cross-origin script or browser extension errors
    if (!event.error && !event.message) return;
    if (event.message && /resizeobserver|websocket/i.test(event.message)) return;

    reportAppCrash(event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (!event.reason) return;
    reportAppCrash(event.reason);
  });
}
