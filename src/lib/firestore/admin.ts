import { ProblemDoc, SessionDoc } from "@/types/firestore";
import { adminDb } from "../firebaseAdmin";

export async function getSessionDocAdmin(sessionId: string): Promise<SessionDoc> {
  const snapshot = await adminDb.collection("sessions").doc(sessionId).get();

  if (!snapshot.exists) {
    throw new Error(`Session ${sessionId} not found`);
  }

  return snapshot.data() as SessionDoc;
}

export async function getProblemByIdAdmin(id: string): Promise<ProblemDoc> {
  const docRef = adminDb.collection("problems").doc(id);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    throw new Error(`Problem document with id "${id}" not found`);
  }

  return snapshot.data() as ProblemDoc;
}