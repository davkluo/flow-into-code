import { adminDb } from "@/lib/firebaseAdmin";
import { LCProblem } from "@/types/leetcode";

const COLLECTION = "problems";

/**
 * Fetch all LeetCode problems from Firestore.
 */
export async function getAll(): Promise<LCProblem[]> {
  const snapshot = await adminDb.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => doc.data() as LCProblem);
}

/**
 * Insert or update many LeetCode problems using titleSlug as ID
 */
export async function upsertMany(problems: LCProblem[]): Promise<void> {
  if (problems.length === 0) return;

  const batch = adminDb.batch();

  for (const problem of problems) {
    const ref = adminDb.collection(COLLECTION).doc(problem.titleSlug);

    batch.set(ref, problem, { merge: true });
  }

  await batch.commit();
}

/**
 * Get a page of LeetCode problems from Firestore.
 */
export async function getProblemPage({
  pageSize,
  cursor,
}: {
  pageSize: number;
  cursor?: string;
}): Promise<{
  problems: LCProblem[];
  nextCursor?: string;
  hasMore: boolean;
}> {
  let q = adminDb.collection(COLLECTION).orderBy("id").limit(pageSize);

  if (cursor) {
    q = q.startAfter(cursor);
  }

  const snap = await q.get();
  const problems = snap.docs.map((d) => d.data() as LCProblem);
  const lastDoc = snap.docs.at(-1);

  return {
    problems,
    nextCursor: lastDoc?.get("id"),
    hasMore: snap.docs.length === pageSize,
  };
}
