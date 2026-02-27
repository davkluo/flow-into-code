import { adminDb } from "@/lib/firebase/admin";
import { Transaction } from "firebase-admin/firestore";
import { Session } from "@/types/session";
import { SESSIONS_COLLECTION } from "@/constants/firestore";

const COLLECTION = SESSIONS_COLLECTION;

/**
 * Persists a new session document with an auto-generated ID.
 * Returns the generated document ID for use as the sessionId.
 */
export async function create(
  session: Session,
  tx?: Transaction,
): Promise<string> {
  const ref = adminDb.collection(COLLECTION).doc();
  if (tx) {
    tx.set(ref, session);
  } else {
    await ref.set(session);
  }
  return ref.id;
}

export async function getById(
  sessionId: string,
): Promise<(Session & { id: string }) | null> {
  const doc = await adminDb.collection(COLLECTION).doc(sessionId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Session) };
}

export async function getByUserId(
  userId: string,
): Promise<Array<Session & { id: string }>> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Session),
  }));
}
