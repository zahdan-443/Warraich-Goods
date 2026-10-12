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

export const ACTIVE_FIREBASE_CONFIG: FirebaseConfigType = {
  projectId: "tonal-flames-kj1d7",
  appId: "1:460929296293:web:f35405d556a42b0ec66a4c",
  apiKey: "AIzaSyC2wOqcq5FpIbsaO56TB4iLE9aiXyjfdMg",
  authDomain: "tonal-flames-kj1d7.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-warraichgoodspun-fd5c860a-1eec-472e-bc43-66d7324d14f5",
  storageBucket: "tonal-flames-kj1d7.firebasestorage.app",
  messagingSenderId: "460929296293",
  measurementId: ""
};
