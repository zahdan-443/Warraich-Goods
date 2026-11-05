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
const MAX_REPORTS_PER_HOUR = 5;
const HOURLY_WINDOW_MS = 60 * 60 * 1000;

function isHourlyRateLimitExceeded(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem('wg_crash_rate_limit');
    const now = Date.now();
    let timestamps: number[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          timestamps = parsed.filter((t: number) => typeof t === 'number' && now - t < HOURLY_WINDOW_MS);
        }
      } catch {
        timestamps = [];
      }
    }
    if (timestamps.length >= MAX_REPORTS_PER_HOUR) {
      return true;
    }
    timestamps.push(now);
    localStorage.setItem('wg_crash_rate_limit', JSON.stringify(timestamps));
    return false;
  } catch {
    return false;
  }
}

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
    userAgent: typeof navigator !== 'undefined' ? (navigator.userAgent || '').slice(0, 200) : '',
    deviceModel: deviceModel.slice(0, 100),
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

    // Check hourly device quota (prevents Denial of Wallet spam)
    if (isHourlyRateLimitExceeded()) {
      return false;
    }

    reportedErrorSignatures.set(signature, now);

    const diagnostics = getDeviceDiagnostics();
    const url = typeof window !== 'undefined' ? (window.location.href || '').slice(0, 200) : '';
    const rawUid = auth?.currentUser?.uid;
    const userUid = rawUid ? rawUid.slice(0, 128) : undefined;

    // Truncate fields strictly to satisfy Firestore security rules (<= 500 / <= 1000)
    const safeErrorName = (errorName || 'Error').slice(0, 100);
    const safeErrorMessage = (errorMessage || 'Unknown Error').slice(0, 500);
    const safeStack = (stack || '').slice(0, 1000);
    const safeCompStack = (componentStack || '').slice(0, 500);
    const safeDeviceModel = (diagnostics.deviceModel || 'Generic Device').slice(0, 100);

    const reportId = `crash_${now}_${Math.random().toString(36).slice(2, 8)}`;

    const payload: Record<string, any> = {
      errorName: safeErrorName,
      errorMessage: safeErrorMessage,
      stack: safeStack,
      componentStack: safeCompStack,
      deviceModel: safeDeviceModel,
      platform: diagnostics.platform.slice(0, 50),
      appVersion: APP_VERSION.slice(0, 50),
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
    // Ignore benign cross-origin script, extension, or observer errors
    if (!event.error && !event.message) return;
    const msg = event.message || '';
    if (
      /script error|resizeobserver|websocket|chrome-extension|moz-extension/i.test(msg) ||
      (!event.filename && !event.lineno)
    ) {
      return;
    }

    reportAppCrash(event.error || event.message);
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (!event.reason) return;
    const reasonStr = event.reason?.message || String(event.reason);
    if (/script error|resizeobserver|database is closing/i.test(reasonStr)) {
      return;
    }
    reportAppCrash(event.reason);
  });
}
