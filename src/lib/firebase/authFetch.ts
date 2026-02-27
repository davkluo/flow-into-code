import { auth } from "./client";

export async function authFetch(
  url: string,
  options: RequestInit = {},
  token?: string,
): Promise<Response> {
  if (!token) {
    await auth.authStateReady();
    token = await auth.currentUser?.getIdToken();
  }
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
