import { getClientAuth } from "./client";

/**
 * Wrapper around fetch that automatically includes the Firebase ID token in the
 * Authorization header. If the token is not provided, it will attempt to get it
 * from the currently authenticated user. This is useful for making
 * authenticated requests to serverless functions or API routes that require
 * Firebase auth.
 *
 * Addition of optional token parameter handles special case where the user has
 * just been created and the auth state is not yet fully ready, so we can pass
 * the token directly without waiting for authStateReady. In general, callers
 * should not need to use this parameter and can rely on the automatic token
 * retrieval.
 */
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
