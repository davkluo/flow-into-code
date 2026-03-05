import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import * as userRepo from "@/repositories/firestore/userRepo";

export const GET = withAuth<{ uid: string }>(async (_req, requestingUid, ctx) => {
  const { uid } = await ctx!.params;

  if (requestingUid !== uid) {
    const requestingUser = await userRepo.getById(requestingUid);
    if (!requestingUser || requestingUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const user = await userRepo.getById(uid);
  if (!user) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  return NextResponse.json({ user });
});
