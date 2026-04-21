import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { getGeneralRateLimit } from "@/lib/rateLimit";
import { initUser } from "@/services/initUser";

export const POST = withAuth(async (_req, uid) => {
  const { success, reset } = await getGeneralRateLimit().limit(uid);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  await initUser(uid);
  return NextResponse.json({ ok: true });
});
