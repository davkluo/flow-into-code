import { adminDb } from "@/lib/firebaseAdmin";

const COLLECTION = "meta";
const DOC_ID = "problemIndex";

export interface ProblemIndexMeta {
  fullyPopulated: boolean;
  lastFetchedAt?: number;
}

export async function get(): Promise<ProblemIndexMeta | null> {
  const snap = await adminDb.collection(COLLECTION).doc(DOC_ID).get();
  return snap.exists ? (snap.data() as ProblemIndexMeta) : null;
}

export async function markFullyPopulated() {
  await adminDb.collection(COLLECTION).doc(DOC_ID).set({
    fullyPopulated: true,
    lastFetchedAt: Date.now(),
  });
}
