import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { getGeneralRateLimit } from "@/lib/rateLimit";
import * as userRepo from "@/repositories/firestore/userRepo";

export const GET = withAuth<{ uid: string }>(async (_req, requestingUid, ctx) => {
  const { success, reset } = await getGeneralRateLimit().limit(requestingUid);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const { uid } = await ctx!.params;

  if (requestingUid !== uid) {
    const requestingUser = await userRepo.getById(requestingUid);
    if (!requestingUser || requestingUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const user = await userRepo.getById(uid);
  if (!user) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json({ user }, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
    },
  });
});
