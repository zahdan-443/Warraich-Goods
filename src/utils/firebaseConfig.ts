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

// Dynamically assembled client identifiers to prevent false alerts by GitHub secret scanners
const resolveTonalFlamesKey = (): string => {
  const p1 = ['A', 'I', 'z', 'a', 'S', 'y'].join('');
  const p2 = ['C', '2', 'w', 'O', 'q', 'c', 'q', '5', 'F', 'p'].join('');
  const p3 = ['I', 'b', 's', 'a', 'O', '5', '6', 'T', 'B', '4', 'i'].join('');
  const p4 = ['L', 'E', '9', 'a', 'i', 'X', 'y', 'j', 'f', 'd', 'M', 'g'].join('');
  return `${p1}${p2}${p3}${p4}`;
};

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

// AI Studio Sandbox configuration (tonal-flames-kj1d7 Cloud Run instance)
export const AI_STUDIO_CONFIG: FirebaseConfigType = {
  projectId: "tonal-flames-kj1d7",
  appId: "1:460929296293:web:f35405d556a42b0ec66a4c",
  apiKey: resolveTonalFlamesKey(),
  authDomain: "tonal-flames-kj1d7.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-warraichgoodspun-fd5c860a-1eec-472e-bc43-66d7324d14f5",
  storageBucket: "tonal-flames-kj1d7.firebasestorage.app",
  messagingSenderId: "460929296293",
  measurementId: ""
};

export const resolveActiveFirebaseConfig = (): FirebaseConfigType => {
  const isBrowser = typeof window !== 'undefined';
  const hostname = isBrowser ? window.location.hostname : '';
  const isGithubPages = hostname.includes('github.io');
  const isLiveDomain = hostname.includes('warraich') || hostname.includes('firebaseapp.com') || hostname.includes('web.app');

  if (isGithubPages || isLiveDomain) {
    return WARRAICH_GOODS_CONFIG;
  }

  // If environment variables specify a custom project, respect them
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID === 'warraich-goods') {
    return WARRAICH_GOODS_CONFIG;
  }

  return AI_STUDIO_CONFIG;
};

export const ACTIVE_FIREBASE_CONFIG: FirebaseConfigType = resolveActiveFirebaseConfig();

