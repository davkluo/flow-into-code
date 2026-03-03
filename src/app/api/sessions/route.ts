import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import { getSessionHistory } from "@/services/sessionHistory";

export async function GET(req: NextRequest) {
  const uid = await verifyFirebaseToken(req);
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await getSessionHistory(uid);
  return Response.json({ sessions });
}
