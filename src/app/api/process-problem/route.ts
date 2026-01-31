import { NextResponse } from "next/server";
import { processProblem } from "@/services/processProblem";
import { LCProblem } from "@/types/leetcode";

export async function POST(req: Request) {
  await processProblem((await req.json()) as LCProblem);
  return NextResponse.json({ status: "processing started" });
}
