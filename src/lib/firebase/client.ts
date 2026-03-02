import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

// Firebase client configuration
// Safe to expose as per Firebase documentation
const firebaseConfig = {
  apiKey: "AIzaSyCQ11pbOVqHxoHoGzjE2u-mOEBxpnBP3fc",
  authDomain: "flow-into-code.firebaseapp.com",
  projectId: "flow-into-code",
  storageBucket: "flow-into-code.firebasestorage.app",
  messagingSenderId: "684629568284",
  appId: "1:684629568284:web:d7a041b8e2c252fe9528d9",
  measurementId: "G-TDGZMG37S8",
};

function getClientApp(): FirebaseApp {
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
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
