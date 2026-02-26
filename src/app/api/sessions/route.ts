import { NextRequest } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import { PROBLEMS_COLLECTION } from "@/constants/firestore";
import { Problem } from "@/types/problem";
import { SectionKey } from "@/types/practice";
import { CategoryFeedback } from "@/types/session";

export async function GET(req: NextRequest) {
  const uid = await verifyFirebaseToken(req);
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawSessions = await sessionRepo.getByUserId(uid);

  // Batch-fetch problem metadata for all unique slugs in one Firestore RPC
  const uniqueSlugs = [...new Set(rawSessions.map((s) => s.problemTitleSlug))];
  const problemRefs = uniqueSlugs.map((slug) =>
    adminDb.collection(PROBLEMS_COLLECTION).doc(slug),
  );
  const problemDocs =
    problemRefs.length > 0 ? await adminDb.getAll(...problemRefs) : [];
  const problemIdMap = new Map(
    problemDocs.map((doc) => [
      doc.id,
      doc.exists ? (doc.data() as Problem).id : null,
    ]),
  );

  // Strip chatLog and fields — only return what the history table needs
  const sessions = rawSessions.map(({ id, problemTitleSlug, createdAt, feedback }) => {
    const rawCreatedAt = createdAt as Date | Timestamp;
    const createdAtIso =
      rawCreatedAt instanceof Timestamp
        ? rawCreatedAt.toDate().toISOString()
        : new Date(rawCreatedAt).toISOString();

    const sectionScores = Object.fromEntries(
      Object.entries(feedback.sections).map(([key, val]) => [
        key as SectionKey,
        { score: (val as CategoryFeedback).score },
      ]),
    ) as Record<SectionKey, { score: number | null }>;

    return {
      id,
      problemTitleSlug,
      problemId: problemIdMap.get(problemTitleSlug) ?? null,
      createdAt: createdAtIso,
      feedback: {
        sections: sectionScores,
        interviewerCommunication: {
          score: feedback.interviewerCommunication.score,
        },
      },
    };
  });

  return Response.json({ sessions });
}
