import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { withAuth } from "@/lib/withAuth";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import * as userRepo from "@/repositories/firestore/userRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";

export const GET = withAuth<{ "session-id": string }>(async (_req, uid, ctx) => {
  const { "session-id": sessionId } = await ctx!.params;

  const [session, user] = await Promise.all([
    sessionRepo.getById(sessionId),
    userRepo.getById(uid),
  ]);

  if (!session) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const isAdmin = user?.role === "admin";
  if (!isAdmin && session.userId !== uid) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
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

  return NextResponse.json({
    session: { ...session, createdAt },
    problem,
    solutions: problemDetails?.derived?.solutions ?? [],
  });
});
