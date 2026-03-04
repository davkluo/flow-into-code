import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Firebase web config objects are safe to expose.
// Security depends on Firebase Auth, Firestore rules, and API key restrictions.
const prodFirebaseConfig = {
  apiKey: "AIzaSyCQ11pbOVqHxoHoGzjE2u-mOEBxpnBP3fc",
  authDomain: "flow-into-code.firebaseapp.com",
  projectId: "flow-into-code",
  storageBucket: "flow-into-code.firebasestorage.app",
  messagingSenderId: "684629568284",
  appId: "1:684629568284:web:d7a041b8e2c252fe9528d9",
  measurementId: "G-TDGZMG37S8",
};

// This config is used only when the app runs on localhost/127.0.0.1.
const devFirebaseConfig = {
  apiKey: "AIzaSyBOwr-HazL58Y06GV--Px5OkRRaVA_wDWE",
  authDomain: "flow-into-code-e2e.firebaseapp.com",
  projectId: "flow-into-code-e2e",
  storageBucket: "flow-into-code-e2e.firebasestorage.app",
  messagingSenderId: "879224697456",
  appId: "1:879224697456:web:db0235265d710ebcefbab5",
};

function getFirebaseConfig() {
  if (typeof window === "undefined") {
    return prodFirebaseConfig;
  }

  const hostname = window.location.hostname;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const hasConfiguredDevKey =
    devFirebaseConfig.apiKey !== "REPLACE_WITH_DEV_FIREBASE_API_KEY";

  if (isLocalHost && hasConfiguredDevKey) {
    return devFirebaseConfig;
  }

  return prodFirebaseConfig;
}

function getClientApp(): FirebaseApp {
  return !getApps().length ? initializeApp(getFirebaseConfig()) : getApp();
}

let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getClientAuth(): Auth {
  if (!_auth) _auth = getAuth(getClientApp());
  return _auth;
}

export function getClientDb(): Firestore {
  if (!_db) _db = getFirestore(getClientApp());
  return _db;
}

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
