import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { getGeneralRateLimit } from "@/lib/rateLimit";
import { CACHE_PAGE_SIZE } from "@/lib/pagination";
import { getProblemPage } from "@/repositories/firestore/problemRepo";
import { ensureLCProblemIndex } from "@/services/ensureLCProblemIndex";

export const GET = withAuth(async (req, uid) => {
  const { success, reset } = await getGeneralRateLimit().limit(uid);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  await ensureLCProblemIndex();

  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") ?? CACHE_PAGE_SIZE);

  const cursorParam = searchParams.get("cursor");
  const cursor = cursorParam ? parseInt(cursorParam, 10) : undefined;

  const qParam = searchParams.get("q");
  const q = qParam?.trim().toLowerCase() || undefined;

  const page = await getProblemPage({
    pageSize: limit,
    cursor,
    q,
  });

  const headers: Record<string, string> = {};
  if (q) {
    // No caching for search results given possible variety of queries
    headers["Cache-Control"] = "no-store";
  } else {
    // Cache non-search results for 1 day, with stale-while-revalidate of 7 days
    // This is because the problem list rarely changes.
    headers["Cache-Control"] = "s-maxage=86400, stale-while-revalidate=604800";
  }

  return NextResponse.json(page, { headers });
});
