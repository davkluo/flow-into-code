import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import * as problemIndexMetaRepo from "@/repositories/firestore/problemIndexMetaRepo";

export async function GET(req: Request) {
  const uid = await verifyFirebaseToken(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
