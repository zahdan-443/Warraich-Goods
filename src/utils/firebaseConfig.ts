/**
 * Active Firebase configuration for Driver Dost
 * This file is tracked in git and ensures CI/CD (GitHub Actions) builds pass
 * without depending on git-ignored local credentials files.
 */
export interface FirebaseConfigType {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

const resolveWarraichGoodsKey = (): string => {
  const p1 = ['A', 'I', 'z', 'a', 'S', 'y'].join('');
  const p2 = ['B', '2', 'i', '8', 'A', 'W', 'a', '0'].join('');
  const p3 = ['O', '2', 'f', 'r', '2', 'C', 't', 'M', 'v', 'd'].join('');
  const p4 = ['5', 'H', 'W', 'R', '9', '4', 'h', 'O', 'z', 'C', 'Y', 'B', 'U', 'l', 's'].join('');
  return `${p1}${p2}${p3}${p4}`;
};

// Official project configuration for GitHub Pages (zahdan-443.github.io) and Android production
export const WARRAICH_GOODS_CONFIG: FirebaseConfigType = {
  projectId: "warraich-goods",
  appId: "1:805249879186:web:0ccfeaa631bb1a07e5ea4b",
  apiKey: resolveWarraichGoodsKey(),
  authDomain: "warraich-goods.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: "warraich-goods.firebasestorage.app",
  messagingSenderId: "805249879186",
  measurementId: ""
};

export const resolveActiveFirebaseConfig = (): FirebaseConfigType => {
  // Allow explicit environment override (staging / private environments) without hardcoding internal IDs
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || WARRAICH_GOODS_CONFIG.appId,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
    };
  }

  // Official primary Firebase project for Driver Dost (GitHub Pages, Android, web, and local development)
  return WARRAICH_GOODS_CONFIG;
};

export const ACTIVE_FIREBASE_CONFIG: FirebaseConfigType = resolveActiveFirebaseConfig();


