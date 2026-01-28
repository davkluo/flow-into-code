import { NextResponse } from "next/server";
import * as problemIndexMetaRepo from "@/repositories/firestore/problemIndexMetaRepo";

export async function GET() {
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
  });
}
