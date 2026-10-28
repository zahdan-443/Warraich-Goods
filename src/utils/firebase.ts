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
  browserLocalPersistence,
  deleteUser
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

export const loginWithGoogle = async (): Promise<User | null> => {
  // 1. Capacitor native platform (Android APK)
  if (Capacitor.isNativePlatform()) {
    try {
      let result;
      try {
        result = await FirebaseAuthentication.signInWithGoogle();
      } catch (nativeErr: any) {
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
    } catch (error: any) {
      console.error("Native Google Sign-In error:", error);
      throw error;
    }
  }

  // 2. Web Browser Flow: Standard Firebase Google Auth with Popup
  // Using signInWithPopup avoids 'missing initial state' caused by browser storage partitioning
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

export { onAuthStateChanged, deleteUser };
export type { User };

