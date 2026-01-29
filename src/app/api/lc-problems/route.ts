import { NextResponse } from "next/server";
import { getProblemPage } from "@/repositories/firestore/problemRepo";
import { ensureLCProblemIndex } from "@/services/ensureLCProblemIndex";

export async function GET(req: Request) {
  await ensureLCProblemIndex();

  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get("limit") ?? 20);

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
}
