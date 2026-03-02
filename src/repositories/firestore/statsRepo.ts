import { FieldValue, Transaction } from "firebase-admin/firestore";
import { GLOBAL_STATS_DOC_ID, STATS_COLLECTION } from "@/constants/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

function getGlobalStatsDoc() {
  return getAdminDb().collection(STATS_COLLECTION).doc(GLOBAL_STATS_DOC_ID);
}

export async function incrementUserCount(tx?: Transaction): Promise<void> {
  if (tx) {
    tx.update(getGlobalStatsDoc(), { userCount: FieldValue.increment(1) });
  } else {
    await getGlobalStatsDoc().update({ userCount: FieldValue.increment(1) });
  }
}

export async function incrementSessionCount(tx?: Transaction): Promise<void> {
  if (tx) {
    tx.update(getGlobalStatsDoc(), { sessionCount: FieldValue.increment(1) });
  } else {
    await getGlobalStatsDoc().update({ sessionCount: FieldValue.increment(1) });
  }
}
