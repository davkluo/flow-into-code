import { adminDb } from "@/lib/firebase/admin";
import { META_COLLECTION, PROBLEM_INDEX_META_DOC_ID } from "@/constants/firestore";

const COLLECTION = META_COLLECTION;
const DOC_ID = PROBLEM_INDEX_META_DOC_ID;

let cachedMeta: ProblemIndexMeta | null = null;

export interface ProblemIndexMeta {
  fullyPopulated: boolean;
  lastFetchedAt: number;
  totalProblems: number;
}

export async function get(): Promise<ProblemIndexMeta | null> {
  if (cachedMeta) {
    return cachedMeta;
  }

  const snap = await adminDb.collection(COLLECTION).doc(DOC_ID).get();
  return snap.exists ? (snap.data() as ProblemIndexMeta) : null;
}

export async function markFullyPopulated(totalProblems: number) {
  const timestamp = Date.now();
  await adminDb.collection(COLLECTION).doc(DOC_ID).set({
    fullyPopulated: true,
    lastFetchedAt: timestamp,
    totalProblems,
  });
  cachedMeta = {
    fullyPopulated: true,
    lastFetchedAt: timestamp,
    totalProblems,
  };
}
