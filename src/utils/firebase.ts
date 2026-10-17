import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
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
  getDocFromServer(doc(db, 'test', 'connection')).catch((error) => {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client offline or initializing.');
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
  // Deprecated redirect flow to prevent missing-initial-state in storage-partitioned environments
  console.warn('loginWithGoogleRedirect is deprecated. Use loginWithGoogle() popup authentication.');
};

export const checkRedirectAuthResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
  } catch (error: any) {
    if (
      error?.code !== 'auth/missing-initial-state' &&
      error?.code !== 'auth/operation-not-supported-in-this-environment'
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

/**
 * Request Google OAuth Access Token via Google Identity Services (GIS).
 * Completely bypasses /__/auth/handler and storage-partitioned sessionStorage issues!
 */
export const requestGoogleOAuthAccessToken = (clientId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (!win?.google?.accounts?.oauth2) {
      return reject(new Error('GIS_UNAVAILABLE'));
    }

    try {
      const client = win.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: (resp: any) => {
          if (resp?.error) {
            reject(new Error(resp.error_description || resp.error));
          } else if (resp?.access_token) {
            resolve(resp.access_token);
          } else {
            reject(new Error('No access token returned from Google'));
          }
        },
        error_callback: (err: any) => {
          reject(err);
        }
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (e) {
      reject(e);
    }
  });
};

export const loginWithGoogle = async (): Promise<User | null> => {
  // Capacitor native platform (Android APK WebView)
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await FirebaseAuthentication.signInWithGoogle();
      if (result.credential?.idToken) {
        const credential = GoogleAuthProvider.credential(
          result.credential.idToken,
          result.credential.accessToken
        );
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
      }
      if (result.user) {
        return (auth.currentUser || (result.user as unknown as User));
      }
      if (auth.currentUser) return auth.currentUser;
    } catch (error: any) {
      console.warn("Native Google Sign-In notice, falling back to Web SDK:", error);
    }

    // Fallback on Android: Web popup
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (popupError: any) {
      console.warn("Web popup inside Android failed:", popupError);
      throw popupError;
    }
  }

  // Web Browser Flow:
  // 1. Try Google Identity Services (GIS) Token Client first
  // This opens Google's OAuth window directly without routing through /__/auth/handler,
  // preventing "missing initial state" and storage-partitioning blank screens!
  if (typeof window !== 'undefined') {
    const win = window as any;
    if (win.google?.accounts?.oauth2) {
      try {
        const clientId = ACTIVE_FIREBASE_CONFIG.projectId === 'warraich-goods'
          ? '805249879186-ragamo9rp1srk8bmd3tboskfbe4s8hik.apps.googleusercontent.com'
          : '460929296293-rcsrtg9bepa3ur3ngta3k97qr97dq1cv.apps.googleusercontent.com';

        const accessToken = await requestGoogleOAuthAccessToken(clientId);
        if (accessToken) {
          const credential = GoogleAuthProvider.credential(null, accessToken);
          const userCredential = await signInWithCredential(auth, credential);
          return userCredential.user;
        }
      } catch (gisError: any) {
        console.warn("Google Identity Services notice:", gisError);
        const msg = gisError?.message || String(gisError);
        if (msg.includes('popup_closed') || msg.includes('closed before')) {
          throw new Error('Google Sign-In window was closed before completion.');
        }
        // Fall back to signInWithPopup if GIS token client had an environment issue
      }
    }
  }

  // 2. Standard Firebase signInWithPopup
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
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

export { onAuthStateChanged };
export type { User };

