import { NextResponse } from "next/server";
import { processProblem } from "@/services/processProblem";
import { Problem } from "@/types/problem";

export async function POST(req: Request) {
  await processProblem((await req.json()) as Problem);
  return NextResponse.json({ status: "processing started" });
}
