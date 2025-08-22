import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getOrCreateTags } from "./tags";
import {
  PracticeProblemSource,
  AIProblem
} from "@/types/practice";
import { LCProblemWithDetails } from "@/types/leetcode";
import { ProblemDoc, ProblemMetadata } from "@/types/firestore";
import { generateProblemMetadata } from "../llmGeneration";

const PROBLEMS_COLLECTION = "problems";

export async function upsertProblem(problem: ProblemDoc): Promise<void> {
  const ref = doc(db, PROBLEMS_COLLECTION, problem.id);
  await setDoc(ref, problem, { merge: true });
}

export async function getProblemById(id: string): Promise<ProblemDoc | null> {
  const ref = doc(db, PROBLEMS_COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;

  return snapshot.data() as ProblemDoc;
}

export async function getProblemByLeetCodeId(
  leetcodeId: string
): Promise<ProblemDoc | null> {
  const q = query(
    collection(db, PROBLEMS_COLLECTION),
    where("leetcodeId", "==", leetcodeId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as ProblemDoc;
}

export async function createProblem(
  problemParams:
    | { source: PracticeProblemSource.LeetCode; problem: LCProblemWithDetails; }
    | { source: PracticeProblemSource.AiGenerated; problem: AIProblem; }
): Promise<string> {
  let title: string;
  let difficulty: "Easy" | "Medium" | "Hard";
  let tags: string[] = [];
  let metadata: ProblemMetadata;

  if (problemParams.source === PracticeProblemSource.LeetCode) {
    const p = problemParams.problem;
    title = p.title;
    difficulty = p.difficulty;
    tags = p.topicTags.map((t) => t.name);
    metadata = await generateProblemMetadata(title, p.details.content, tags, problemParams.source);
  } else { // AI Generated
    const p = problemParams.problem;
    title = p.title;
    difficulty = p.difficulty;
    tags = p.tags;
    metadata = await generateProblemMetadata(title, p.description, tags, problemParams.source);
  }

  const tagIds = await getOrCreateTags(tags);

  const ref = doc(collection(db, PROBLEMS_COLLECTION));

  let newProblem: ProblemDoc;
  if (problemParams.source === PracticeProblemSource.LeetCode) {
    newProblem = {
      id: ref.id,
      source: PracticeProblemSource.LeetCode,
      leetcodeId: problemParams.problem.leetcodeId,
      title,
      difficulty,
      tags: tagIds,
      titleSlug: problemParams.problem.titleSlug,
      metadata,
    };
  } else {
    newProblem = {
      id: ref.id,
      source: PracticeProblemSource.AiGenerated,
      title,
      difficulty,
      tags: tagIds,
      metadata,
      description: problemParams.problem.description,
    };
  }

  await setDoc(ref, newProblem);
  return ref.id;
}