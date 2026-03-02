import { getClientAuth } from "./client";

export async function authFetch(
  url: string,
  options: RequestInit = {},
  token?: string,
): Promise<Response> {
  if (!token) {
    await getClientAuth().authStateReady();
    token = await getClientAuth().currentUser?.getIdToken();
  }
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
