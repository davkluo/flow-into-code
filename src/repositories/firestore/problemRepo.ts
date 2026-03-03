import { getAdminDb } from "@/lib/firebase/admin";
import { PROBLEMS_COLLECTION } from "@/constants/firestore";
import { computeSearchTerms } from "@/lib/computeSearchTerms";
import { normalizeToWords } from "@/lib/normalize";
import { Problem } from "@/types/problem";

// Firestore's array-contains-any supports at most 10 values.
const MAX_SEARCH_TOKENS = 10;

type StoredProblem = Problem & { searchTerms: string[] };

const COLLECTION = PROBLEMS_COLLECTION;
const FALLBACK_ID_NUMBER = 9999; // Used when id cannot be parsed; sorts to end of list

/**
 * Fetch all LeetCode problems from Firestore.
 */
export async function getAll(): Promise<Problem[]> {
  const snapshot = await getAdminDb().collection(COLLECTION).get();
  return snapshot.docs.map((doc) => doc.data() as Problem);
}

/**
 * Insert or update many LeetCode problems using titleSlug as ID.
 * WARNING: Firestore batch writes are limited to 500 operations.
 * Ensure the problems array does not exceed this limit.
 */
export async function upsertMany(problems: Problem[]): Promise<void> {
  if (problems.length === 0) return;

  const batch = getAdminDb().batch();

  for (const problem of problems) {
    const ref = getAdminDb().collection(COLLECTION).doc(problem.titleSlug);
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
  const collectionRef = getAdminDb().collection(COLLECTION);

  if (q) {
    const tokens = normalizeToWords(q).slice(0, MAX_SEARCH_TOKENS);

    if (tokens.length === 0) {
      return { problems: [], nextCursor: undefined, hasMore: false };
    }

    const snap = await collectionRef
      .where("searchTerms", "array-contains-any", tokens)
      .orderBy("idNumber")
      .get();

    const docs = snap.docs.map((d) => d.data() as StoredProblem);
    const problems: Problem[] =
      tokens.length === 1
        ? docs
        : docs.filter((p) => tokens.every((t) => p.searchTerms.includes(t)));

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
  const doc = await getAdminDb().collection(COLLECTION).doc(slug).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as Problem;
}
