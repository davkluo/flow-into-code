import { getAdminAuth } from "./admin";

/**
 * Verifies a Firebase ID token from an HTTP request. It expects the token to be
 * in the Authorization header as a Bearer token.
 */
export async function verifyFirebaseToken(
  req: Request,
): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7));
    return decoded.uid;
  } catch {
    return null;
  }
}
