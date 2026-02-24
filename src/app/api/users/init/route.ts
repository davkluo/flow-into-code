import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { initUser } from "@/services/initUser";

export async function POST(req: Request) {
  const uid = await verifyFirebaseToken(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initUser(uid);

  return NextResponse.json({ ok: true });
}
