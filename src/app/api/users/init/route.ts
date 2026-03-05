import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { initUser } from "@/services/initUser";

export const POST = withAuth(async (_req, uid) => {
  await initUser(uid);
  return NextResponse.json({ ok: true });
});
