import { adminDb } from "@/lib/firebaseAdmin";
import { LCProblem } from "@/types/leetcode";

const COLLECTION = "problems";
const FALLBACK_ID_NUMBER = 9999; // Used when id cannot be parsed; sorts to end of list

/**
 * Fetch all LeetCode problems from Firestore.
 */
export async function getAll(): Promise<LCProblem[]> {
  const snapshot = await adminDb.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => doc.data() as LCProblem);
}

/**
 * Insert or update many LeetCode problems using titleSlug as ID.
 * WARNING: Firestore batch writes are limited to 500 operations.
 * Ensure the problems array does not exceed this limit.
 */
export async function upsertMany(problems: LCProblem[]): Promise<void> {
  if (problems.length === 0) return;

  const batch = adminDb.batch();

  for (const problem of problems) {
    const ref = adminDb.collection(COLLECTION).doc(problem.titleSlug);
    const parsedId = Number(problem.id);

    batch.set(
      ref,
      {
        ...problem,
        idNumber: Number.isNaN(parsedId) ? FALLBACK_ID_NUMBER : parsedId,
      },
      { merge: true },
    );
  }

  await batch.commit();
}

export interface ProblemsPage {
  problems: LCProblem[];
  nextCursor?: number;
  hasMore: boolean;
}

/**
 * Get a page of LeetCode problems from Firestore.
 */
export async function getProblemPage({
  pageSize,
  cursor,
}: {
  pageSize: number;
  cursor?: number;
}): Promise<ProblemsPage> {
  let q = adminDb.collection(COLLECTION).orderBy("idNumber").limit(pageSize);

  if (cursor) {
    q = q.startAfter(cursor);
  }

  const snap = await q.get();
  const problems = snap.docs.map((d) => d.data() as LCProblem);
  const lastDoc = snap.docs.at(-1);

  return {
    problems,
    nextCursor: lastDoc?.get("idNumber"),
    hasMore: snap.docs.length === pageSize,
  };
}
