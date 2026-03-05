import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";

type RouteContext<P> = { params: Promise<P> };
type AnyCtxHandler = (
  req: NextRequest,
  uid: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx?: any,
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
 *   const { slug } = await ctx.params;
 * });
 */
export function withAuth(
  handler: (req: NextRequest, uid: string) => Promise<NextResponse>,
): (req: NextRequest) => Promise<NextResponse>;
export function withAuth<P>(
  handler: (
    req: NextRequest,
    uid: string,
    ctx: RouteContext<P>,
  ) => Promise<NextResponse>,
): (req: NextRequest, ctx: RouteContext<P>) => Promise<NextResponse>;
export function withAuth(handler: AnyCtxHandler) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (req: NextRequest, ctx?: any) => {
    const uid = await verifyFirebaseToken(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, uid, ctx);
  };
}
