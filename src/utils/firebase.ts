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
  User
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

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

// Validate that critical Firebase credentials exist
if (!import.meta.env.VITE_FIREBASE_API_KEY && !import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  // Using built-in fallback configuration for warraich-goods
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB2i8AWa0O2fr2CtMvd5HWR94hOzCYBUls',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'warraich-goods.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'warraich-goods',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'warraich-goods.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '805249879186',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:805249879186:web:0ccfeaa631bb1a07e5ea4b',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-Y1LF9N2VQT'
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Initialize Firestore with memory cache to prevent IndexedDB "database is closing/hidden" issues in iframe/preview
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
  } catch {
    return getFirestore(app);
  }
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const loginWithGoogleRedirect = async (): Promise<void> => {
  await signInWithRedirect(auth, googleProvider);
};

export const checkRedirectAuthResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
  } catch (error: any) {
    console.error("Redirect Auth Error:", error);
  }
  return null;
};

export const isMobileBrowser = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
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
      return auth.currentUser;
    } catch (error: any) {
      console.error("Native Google Sign-In Error:", error);
      throw error;
    }
  }

  // Web Browser Flow:
  // Note: Must invoke signInWithPopup immediately during user gesture without preceding blocking alerts
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);

    // If popup was blocked or closed or unsupported, fallback to redirect
    if (
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      console.warn("Popup blocked or unsupported. Falling back to signInWithRedirect...");
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
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

