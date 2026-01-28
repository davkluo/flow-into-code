import { adminDb } from "@/lib/firebaseAdmin";

const COLLECTION = "meta";
const DOC_ID = "problemIndex";

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
