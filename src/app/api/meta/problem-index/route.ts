import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { getGeneralRateLimit } from "@/lib/rateLimit";
import * as problemIndexMetaRepo from "@/repositories/firestore/problemIndexMetaRepo";

export const GET = withAuth(async (_req, uid) => {
  const { success, reset } = await getGeneralRateLimit().limit(uid);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const meta = await problemIndexMetaRepo.get();

  if (!meta) {
    return NextResponse.json(
      { error: "Problem index meta not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    totalProblems: meta.totalProblems,
    fullyPopulated: meta.fullyPopulated,
  }, {
    headers: {
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
    },
  });
});
