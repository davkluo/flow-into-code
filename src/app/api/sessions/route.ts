import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { getSessionHistory } from "@/services/sessionHistory";

export const GET = withAuth(async (_req, uid) => {
  const sessions = await getSessionHistory(uid);
  return NextResponse.json({ sessions });
});
