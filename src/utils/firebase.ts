import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  deleteUser,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, getFirestore, setLogLevel } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

// Silence verbose internal Firestore offline connection retry logs
try {
  setLogLevel('silent');
} catch {
  // ignore
}

import { ACTIVE_FIREBASE_CONFIG } from './firebaseConfig';
import { doc, getDocFromServer } from 'firebase/firestore';

const isBrowser = typeof window !== 'undefined';
const isGithubPages = isBrowser && window.location.hostname.includes('github.io');

const firebaseConfig = isGithubPages
  ? {
      apiKey: ACTIVE_FIREBASE_CONFIG.apiKey,
      authDomain: ACTIVE_FIREBASE_CONFIG.authDomain,
      projectId: ACTIVE_FIREBASE_CONFIG.projectId,
      storageBucket: ACTIVE_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: ACTIVE_FIREBASE_CONFIG.messagingSenderId,
      appId: ACTIVE_FIREBASE_CONFIG.appId,
      measurementId: ACTIVE_FIREBASE_CONFIG.measurementId || '',
      firestoreDatabaseId: '(default)'
    }
  : {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || ACTIVE_FIREBASE_CONFIG.apiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || ACTIVE_FIREBASE_CONFIG.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || ACTIVE_FIREBASE_CONFIG.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || ACTIVE_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || ACTIVE_FIREBASE_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ACTIVE_FIREBASE_CONFIG.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ACTIVE_FIREBASE_CONFIG.measurementId || '',
      firestoreDatabaseId: ACTIVE_FIREBASE_CONFIG.firestoreDatabaseId || '(default)'
    };

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const resolveOptionalAppCheckSiteKey = (rawKey?: unknown): string | null => {
  if (typeof rawKey !== 'string') return null;
  const trimmed = rawKey.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null;
  return trimmed;
};

export const appCheck: AppCheck | null = (() => {
  if (typeof window === 'undefined') return null;
  const siteKey = resolveOptionalAppCheckSiteKey(import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY);
  if (!siteKey) return null;
  try {
    return initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
  } catch (err) {
    console.warn('[Firebase] App Check initialization notice:', err);
    return null;
  }
})();

export const auth = getAuth(app);

// Explicitly set browserLocalPersistence to ensure auth state survives storage-partitioning and page refreshes
if (typeof window !== 'undefined') {
  try {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  } catch {
    // ignore
  }
}

// Initialize Firestore with memory cache to prevent IndexedDB "database is closing/hidden" issues in iframe/preview
export const db = (() => {
  try {
    const customDbId = (!firebaseConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId === '(default)')
      ? undefined
      : firebaseConfig.firestoreDatabaseId;
    return initializeFirestore(app, {
      localCache: memoryLocalCache()
    }, customDbId);
  } catch {
    return getFirestore(app);
  }
})();

// Validate Connection to Firestore on boot
if (typeof window !== 'undefined') {
  getDocFromServer(doc(db, 'settings', 'companyProfile')).catch((error) => {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('permission-denied'))) {
      console.warn('[Firebase] Client offline, initializing, or unauthenticated boot check.');
    }
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
  prompt: 'select_account'
});

/**
 * Sign in directly using Google ID token from Google Identity Services (GIS).
 * Completely bypasses /__/auth/handler and storage-partitioned sessionStorage issues!
 */
export const signInWithGoogleIdToken = async (idToken: string): Promise<User> => {
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
};

export const loginWithGoogleRedirect = async (): Promise<void> => {
  console.warn('loginWithGoogleRedirect is deprecated. Use loginWithGoogle() popup authentication.');
  if (typeof window !== 'undefined') {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (e) {
      console.warn('signInWithRedirect notice:', e);
    }
  }
};

export const checkRedirectAuthResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
  } catch (error: unknown) {
    const code = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code?: unknown }).code) : '';
    if (
      code !== 'auth/missing-initial-state' &&
      code !== 'auth/operation-not-supported-in-this-environment'
    ) {
      console.warn("Redirect Auth check notice:", error);
    }
  }
  return null;
};

export const isMobileBrowser = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
};

export const loginWithGoogle = async (): Promise<User | null> => {
  // 1. Capacitor native platform (Android APK)
  if (Capacitor.isNativePlatform()) {
    try {
      let result;
      try {
        result = await FirebaseAuthentication.signInWithGoogle();
      } catch (nativeErr: unknown) {
        console.warn("First native signInWithGoogle attempt notice, retrying with useCredentialManager: false:", nativeErr);
        result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
      }

      if (result?.credential?.idToken) {
        const credential = GoogleAuthProvider.credential(
          result.credential.idToken,
          result.credential.accessToken
        );
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
      }
      if (result?.user) {
        return (auth.currentUser || (result.user as unknown as User));
      }
      if (auth.currentUser) return auth.currentUser;
    } catch (error: unknown) {
      console.error("Native Google Sign-In error:", error);
      throw error;
    }
  }

  // 2. Web Browser Flow: Standard Firebase Google Auth with Popup
  // Using signInWithPopup avoids 'missing initial state' caused by browser storage partitioning
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    console.warn("Google Sign-In popup notice:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      try {
        await FirebaseAuthentication.signOut();
      } catch {}
    }
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
};

/**
 * Permanently deletes the authenticated user from Firebase Authentication
 * Handles both Capacitor native FirebaseAuthentication and Web Firebase Auth SDK.
 */
export const deleteFirebaseUserAccount = async (targetUser?: User | null): Promise<void> => {
  const userToDelete = targetUser || auth.currentUser;
  let nativeDeleted = false;

  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseAuthentication.deleteUser();
      nativeDeleted = true;
    } catch (nativeErr: unknown) {
      const code = typeof nativeErr === 'object' && nativeErr !== null && 'code' in nativeErr ? String((nativeErr as { code?: unknown }).code) : '';
      const msg = (nativeErr instanceof Error ? nativeErr.message : String(nativeErr || '')).toLowerCase();
      if (code === 'auth/requires-recent-login' || msg.includes('recent') || msg.includes('requires-recent-login')) {
        throw new Error('AUTH_REQUIRES_RECENT_LOGIN');
      }
      console.warn('Native deleteUser error, falling back to web SDK:', nativeErr);
    }
  }

  if (userToDelete) {
    try {
      await deleteUser(userToDelete);
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : '';
      const msg = (err instanceof Error ? err.message : String(err || '')).toLowerCase();
      if (nativeDeleted && code === 'auth/user-not-found') {
        return;
      }
      if (code === 'auth/requires-recent-login' || msg.includes('requires-recent-login')) {
        throw new Error('AUTH_REQUIRES_RECENT_LOGIN');
      }
      throw err;
    }
  }
};

export { onAuthStateChanged };
export type { User };


