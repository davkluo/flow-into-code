import { NextResponse } from "next/server";
import { getProcessedProblem } from "@/services/getProcessedProblem";
import { LCProblem } from "@/types/leetcode";

export async function POST(req: Request) {
  try {
    const problem = (await req.json()) as LCProblem;

    if (!problem?.titleSlug) {
      return NextResponse.json(
        { error: "Invalid problem payload" },
        { status: 400 },
      );
    }

    const processed = await getProcessedProblem(problem);
    return NextResponse.json(processed);
  } catch (err) {
    console.error("process-problem error:", err);
    return NextResponse.json(
      { error: "Failed to process problem" },
      { status: 500 },
    );
  }
}
