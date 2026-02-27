import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import * as userRepo from "@/repositories/firestore/userRepo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const requestingUid = await verifyFirebaseToken(req);
  if (!requestingUid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { uid } = await params;

  if (requestingUid !== uid) {
    const requestingUser = await userRepo.getById(requestingUid);
    if (!requestingUser || requestingUser.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const user = await userRepo.getById(uid);
  if (!user) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  return Response.json({ user });
}
