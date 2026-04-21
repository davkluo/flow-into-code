import { toast } from "sonner";
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
 *
 * Automatically shows a toast on 429 (rate limit) responses so callers don't
 * need to handle this individually.
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
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    const seconds = retryAfter ? parseInt(retryAfter, 10) : null;
    toast.error("Too many requests", {
      description: seconds
        ? `Please wait ${seconds}s before trying again.`
        : "Please wait a moment before trying again.",
    });
  }

  return response;
}
