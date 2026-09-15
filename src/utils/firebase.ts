import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, getFirestore, setLogLevel } from 'firebase/firestore';

// Silence verbose internal Firestore offline connection retry logs
try {
  setLogLevel('silent');
} catch {
  // ignore
}

// Default public Firebase Client configuration (prevents CI / test crashes when GitHub secrets are empty)
const defaultFirebaseConfig = {
  apiKey: "AIzaSyB2i8AWa0O2fr2CtMvd5HWR94hOzCYBUls",
  authDomain: "warraich-goods.firebaseapp.com",
  projectId: "warraich-goods",
  storageBucket: "warraich-goods.firebasestorage.app",
  messagingSenderId: "805249879186",
  appId: "1:805249879186:web:0ccfeaa631bb1a07e5ea4b",
  measurementId: "G-Y1LF9N2VQT"
};

const getEnvOrFallback = (envVal: string | undefined, fallback: string): string => {
  if (typeof envVal === 'string' && envVal.trim() !== '') {
    return envVal.trim();
  }
  return fallback;
};

// Environment-variable based Firebase configuration with resilient fallback
const firebaseConfig = {
  apiKey: getEnvOrFallback(import.meta.env.VITE_FIREBASE_API_KEY, defaultFirebaseConfig.apiKey),
  authDomain: getEnvOrFallback(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, defaultFirebaseConfig.authDomain),
  projectId: getEnvOrFallback(import.meta.env.VITE_FIREBASE_PROJECT_ID, defaultFirebaseConfig.projectId),
  storageBucket: getEnvOrFallback(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, defaultFirebaseConfig.storageBucket),
  messagingSenderId: getEnvOrFallback(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, defaultFirebaseConfig.messagingSenderId),
  appId: getEnvOrFallback(import.meta.env.VITE_FIREBASE_APP_ID, defaultFirebaseConfig.appId),
  measurementId: getEnvOrFallback(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, defaultFirebaseConfig.measurementId)
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

export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
};

export { onAuthStateChanged };
export type { User };

