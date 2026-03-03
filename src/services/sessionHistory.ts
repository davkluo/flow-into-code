import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import { PROBLEMS_COLLECTION } from "@/constants/firestore";
import { Problem } from "@/types/problem";
import { SectionKey } from "@/types/practice";
import { CategoryFeedback } from "@/types/session";

export interface SessionHistoryItem {
  id: string;
  problemTitleSlug: string;
  problemId: string | null;
  createdAt: string; // ISO string
  feedback: {
    sections: Record<SectionKey, { score: number | null }>;
    interviewerCommunication: { score: number | null };
    summary: string;
  };
}

/**
 * Fetches and transforms a user's session history for display in the history
 * table. Strips chatLog and fields, resolves LeetCode problem IDs in a single
 * batched Firestore RPC, and normalizes createdAt to ISO strings.
 */
export async function getSessionHistory(uid: string): Promise<SessionHistoryItem[]> {
  const rawSessions = await sessionRepo.getByUserId(uid);

  const uniqueSlugs = [...new Set(rawSessions.map((s) => s.problemTitleSlug))];
  const problemRefs = uniqueSlugs.map((slug) =>
    getAdminDb().collection(PROBLEMS_COLLECTION).doc(slug),
  );
  const problemDocs =
    problemRefs.length > 0 ? await getAdminDb().getAll(...problemRefs) : [];
  const problemIdMap = new Map(
    problemDocs.map((doc) => [
      doc.id,
      doc.exists ? (doc.data() as Problem).id : null,
    ]),
  );

  return rawSessions.map(({ id, problemTitleSlug, createdAt, feedback }) => {
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
        summary: feedback.summary ?? "",
      },
    };
  });
}
