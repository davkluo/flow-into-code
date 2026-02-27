import { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import * as userRepo from "@/repositories/firestore/userRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ "session-id": string }> },
) {
  const uid = await verifyFirebaseToken(req);
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { "session-id": sessionId } = await params;

  const [session, user] = await Promise.all([
    sessionRepo.getById(sessionId),
    userRepo.getById(uid),
  ]);

  if (!session) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  const isAdmin = user?.role === "admin";
  if (!isAdmin && session.userId !== uid) {
    return Response.json({ error: "Not Found" }, { status: 404 });
  }

  const [problem, problemDetails] = await Promise.all([
    problemRepo.getBySlug(session.problemTitleSlug),
    problemDetailsRepo.getBySlug(session.problemTitleSlug),
  ]);

  const rawCreatedAt = session.createdAt as Date | Timestamp;
  const createdAt =
    rawCreatedAt instanceof Timestamp
      ? rawCreatedAt.toDate().toISOString()
      : new Date(rawCreatedAt).toISOString();

  return Response.json({
    session: { ...session, createdAt },
    problem,
    solutions: problemDetails?.derived?.solutions ?? [],
  });
}
