import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";

type RouteContext<P> = { params: Promise<P> };

type AuthHandler<P> = (
  req: NextRequest,
  uid: string,
  ctx?: RouteContext<P>,
) => Promise<NextResponse>;

/**
 * Wraps a route handler with Firebase auth verification.
 * Automatically returns 401 if no valid token is present.
 * The uid is injected as the second argument, guaranteed non-null.
 *
 * @example
 * // Simple route (no params)
 * export const GET = withAuth(async (req, uid) => { ... });
 *
 * // Dynamic route (with params)
 * export const GET = withAuth<{ slug: string }>(async (req, uid, ctx) => {
 *   const { slug } = await ctx!.params;
 * });
 */
export function withAuth<P = never>(handler: AuthHandler<P>) {
  return async (req: NextRequest, ctx?: RouteContext<P>) => {
    const uid = await verifyFirebaseToken(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, uid, ctx);
  };
}
