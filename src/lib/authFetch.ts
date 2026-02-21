import { auth } from "./firebase";

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
