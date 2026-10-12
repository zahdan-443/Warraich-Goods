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

import { ACTIVE_FIREBASE_CONFIG } from './firebaseConfig';
import { doc, getDocFromServer } from 'firebase/firestore';

const isRunApp = typeof window !== 'undefined' && window.location.hostname.includes('.run.app');

const firebaseConfig = isRunApp
  ? {
      apiKey: ACTIVE_FIREBASE_CONFIG.apiKey,
      authDomain: ACTIVE_FIREBASE_CONFIG.authDomain,
      projectId: ACTIVE_FIREBASE_CONFIG.projectId,
      storageBucket: ACTIVE_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: ACTIVE_FIREBASE_CONFIG.messagingSenderId,
      appId: ACTIVE_FIREBASE_CONFIG.appId,
      measurementId: ACTIVE_FIREBASE_CONFIG.measurementId || '',
      firestoreDatabaseId: ACTIVE_FIREBASE_CONFIG.firestoreDatabaseId || '(default)'
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

// Initialize Firestore with memory cache to prevent IndexedDB "database is closing/hidden" issues in iframe/preview
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: memoryLocalCache()
    }, firebaseConfig.firestoreDatabaseId);
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);

    // If outside iframe and popup was explicitly blocked by browser, try redirect fallback
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (
      !isIframe &&
      (error?.code === 'auth/popup-blocked' ||
       error?.code === 'auth/operation-not-supported-in-this-environment')
    ) {
      console.warn("Popup blocked outside iframe. Falling back to signInWithRedirect...");
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    // Propagate error to let UI provide immediate feedback
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

