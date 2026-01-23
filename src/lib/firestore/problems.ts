import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getOrCreateTags } from "./tags";
import { PracticeProblem } from "@/types/practice";
import { ProblemDoc } from "@/types/firestore";
import { generateProblemMetadata } from "../llmGeneration";

const PROBLEMS_COLLECTION = "problems";

/**
 * Upsert a processed problem to Firestore
 * Document ID is the titleSlug
 */
export async function upsertProblem(problem: ProblemDoc): Promise<void> {
  const ref = doc(db, PROBLEMS_COLLECTION, problem.titleSlug);
  await setDoc(ref, problem, { merge: true });
}

/**
 * Get a problem by its titleSlug (document ID)
 */
export async function getProblemByTitleSlug(
  titleSlug: string
): Promise<ProblemDoc | null> {
  const ref = doc(db, PROBLEMS_COLLECTION, titleSlug);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;

  return snapshot.data() as ProblemDoc;
}

/**
 * Create or update a processed problem in Firestore
 * Document ID is the titleSlug
 */
export async function createOrUpdateProcessedProblem(
  problem: PracticeProblem
): Promise<string> {
  const tags = problem.topicTags.map((t) => t.name);
  const tagIds = await getOrCreateTags(tags);

  // Generate metadata (summary for LLM context)
  const metadata = await generateProblemMetadata(
    problem.title,
    problem.content,
    tags
  );

  const problemDoc: ProblemDoc = {
    ...problem,
    tags: tagIds,
    metadata,
  };

  const ref = doc(db, PROBLEMS_COLLECTION, problem.titleSlug);
  await setDoc(ref, problemDoc);

  return problem.titleSlug;
}