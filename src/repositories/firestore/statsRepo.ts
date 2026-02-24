import { FieldValue, Transaction } from "firebase-admin/firestore";
import { GLOBAL_STATS_DOC_ID, STATS_COLLECTION } from "@/constants/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

const GLOBAL_STATS_DOC = adminDb
  .collection(STATS_COLLECTION)
  .doc(GLOBAL_STATS_DOC_ID);

export async function incrementUserCount(tx?: Transaction): Promise<void> {
  if (tx) {
    tx.update(GLOBAL_STATS_DOC, { userCount: FieldValue.increment(1) });
  } else {
    await GLOBAL_STATS_DOC.update({ userCount: FieldValue.increment(1) });
  }
}

export async function incrementSessionCount(tx?: Transaction): Promise<void> {
  if (tx) {
    tx.update(GLOBAL_STATS_DOC, { sessionCount: FieldValue.increment(1) });
  } else {
    await GLOBAL_STATS_DOC.update({ sessionCount: FieldValue.increment(1) });
  }
}
