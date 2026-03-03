import fs from "fs";
import path from "path";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Server-side API key — no HTTP referrer restriction, restricted to Identity Toolkit API only.
// Distinct from the browser key (src/lib/firebase/client.ts) which has referrer restrictions.
const FIREBASE_API_KEY = process.env.FIREBASE_SERVER_API_KEY!;

// Synthetic UID — no real user needed in Firebase console
const E2E_TEST_UID = "e2e-playwright-test-user";

interface CustomTokenExchangeResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

export type AuthState = {
  apiKey: string;
  uid: string;
  email: string;
  displayName: string;
  idToken: string;
  refreshToken: string;
};

/**
 * Mints a Firebase custom token for the E2E test UID using the service account
 * key, exchanges it for a real idToken + refreshToken via the Firebase REST API,
 * and saves the result to playwright/.auth/user.json.
 *
 * Requires the same env vars the app already uses:
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *
 * No test account or email/password auth needed in Firebase console.
 */
async function globalSetup() {
  const app = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    },
    "e2e-setup",
  );

  const customToken = await getAuth(app).createCustomToken(E2E_TEST_UID);

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Custom token exchange failed (${res.status}): ${body}`);
  }

  const data: CustomTokenExchangeResponse = await res.json();

  // The injected IndexedDB key must use the browser API key, not the server key.
  const FIREBASE_BROWSER_API_KEY = "AIzaSyCQ11pbOVqHxoHoGzjE2u-mOEBxpnBP3fc";

  const authState: AuthState = {
    apiKey: FIREBASE_BROWSER_API_KEY,
    uid: E2E_TEST_UID,
    email: "",
    displayName: "E2E Test",
    idToken: data.idToken,
    refreshToken: data.refreshToken,
  };

  const authDir = path.join(process.cwd(), "playwright", ".auth");
  fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(
    path.join(authDir, "user.json"),
    JSON.stringify(authState, null, 2),
  );
}

export default globalSetup;
