import { NextResponse } from "next/server";
import { getProblemPage } from "@/repositories/firestore/problemRepo";
import { ensureLCProblemIndex } from "@/services/ensureLCProblemIndex";

export async function GET(req: Request) {
  await ensureLCProblemIndex();

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 20);
  const cursor = searchParams.get("cursor") ?? undefined;

  const page = await getProblemPage({
    pageSize: limit,
    cursor,
  });

  // Cache for 1 day, stale while revalidate for 7 days given frequency of
  // problem updates on LeetCode
  return NextResponse.json(page, {
    headers: {
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
