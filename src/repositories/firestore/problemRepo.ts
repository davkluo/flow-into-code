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
