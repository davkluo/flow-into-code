import { FieldValue, Transaction } from "firebase-admin/firestore";
import { GLOBAL_STATS_DOC_ID, STATS_COLLECTION } from "@/constants/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

function getGlobalStatsDoc() {
  return getAdminDb().collection(STATS_COLLECTION).doc(GLOBAL_STATS_DOC_ID);
}

export async function incrementUserCount(tx?: Transaction): Promise<void> {
  if (tx) {
    tx.set(getGlobalStatsDoc(), { userCount: FieldValue.increment(1) }, { merge: true });
  } else {
    await getGlobalStatsDoc().set({ userCount: FieldValue.increment(1) }, { merge: true });
  }
}

export async function incrementSessionCount(tx?: Transaction): Promise<void> {
  if (tx) {
    tx.set(getGlobalStatsDoc(), { sessionCount: FieldValue.increment(1) }, { merge: true });
  } else {
    await getGlobalStatsDoc().set({ sessionCount: FieldValue.increment(1) }, { merge: true });
  }
}
