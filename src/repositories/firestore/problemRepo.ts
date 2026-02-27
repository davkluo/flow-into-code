import { adminDb } from "@/lib/firebase/admin";
import { PROBLEMS_COLLECTION } from "@/constants/firestore";
import { computeSearchTerms } from "@/lib/computeSearchTerms";
import { Problem } from "@/types/problem";

const COLLECTION = PROBLEMS_COLLECTION;
const FALLBACK_ID_NUMBER = 9999; // Used when id cannot be parsed; sorts to end of list

/**
 * Fetch all LeetCode problems from Firestore.
 */
export async function getAll(): Promise<Problem[]> {
  const snapshot = await adminDb.collection(COLLECTION).get();
  return snapshot.docs.map((doc) => doc.data() as Problem);
}

/**
 * Insert or update many LeetCode problems using titleSlug as ID.
 * WARNING: Firestore batch writes are limited to 500 operations.
 * Ensure the problems array does not exceed this limit.
 */
export async function upsertMany(problems: Problem[]): Promise<void> {
  if (problems.length === 0) return;

  const batch = adminDb.batch();

  for (const problem of problems) {
    const ref = adminDb.collection(COLLECTION).doc(problem.titleSlug);
    const parsedId = Number(problem.id);

    const searchTerms = computeSearchTerms(problem);

    batch.set(
      ref,
      {
        ...problem,
        searchTerms,
        idNumber: Number.isNaN(parsedId) ? FALLBACK_ID_NUMBER : parsedId,
      },
      { merge: true },
    );
  }

  await batch.commit();
}

export interface ProblemsPage {
  problems: Problem[];
  nextCursor?: number;
  hasMore: boolean;
}

/**
 * Get a page of LeetCode problems from Firestore.
 */
export async function getProblemPage({
  pageSize,
  cursor,
  q,
}: {
  pageSize: number;
  cursor?: number;
  q?: string;
}): Promise<ProblemsPage> {
  const collectionRef = adminDb.collection(COLLECTION);

  if (q) {
    const searchQuery = collectionRef
      .where("searchTerms", "array-contains", q)
      .orderBy("idNumber");

    const snap = await searchQuery.get();
    const problems = snap.docs.map((d) => d.data() as Problem);

    return {
      problems,
      nextCursor: undefined,
      hasMore: false,
    };
  }

  let browseQuery = collectionRef.orderBy("idNumber").limit(pageSize);

  if (cursor !== undefined) {
    browseQuery = browseQuery.startAfter(cursor);
  }

  const snap = await browseQuery.get();
  const problems = snap.docs.map((d) => d.data() as Problem);
  const lastDoc = snap.docs.at(-1);

  return {
    problems,
    nextCursor: lastDoc?.get("idNumber"),
    hasMore: snap.docs.length === pageSize,
  };
}

export async function getBySlug(slug: string): Promise<Problem | null> {
  const doc = await adminDb.collection(COLLECTION).doc(slug).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as Problem;
}
