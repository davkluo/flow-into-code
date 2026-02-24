import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { GLOBAL_STATS_DOC_ID, STATS_COLLECTION } from "@/constants/firestore";
const GLOBAL_STATS_DOC = adminDb
  .collection(STATS_COLLECTION)
  .doc(GLOBAL_STATS_DOC_ID);

export async function incrementUserCount(): Promise<void> {
  await GLOBAL_STATS_DOC.update({ userCount: FieldValue.increment(1) });
}

export async function incrementSessionCount(): Promise<void> {
  await GLOBAL_STATS_DOC.update({ sessionCount: FieldValue.increment(1) });
}
