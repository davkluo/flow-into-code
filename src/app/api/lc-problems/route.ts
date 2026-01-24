import { NextResponse } from "next/server";
import { getLCProblems } from "@/services/getLCProblems";

export async function GET() {
  const problems = await getLCProblems();

  return NextResponse.json(problems, {
    headers: {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
