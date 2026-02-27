import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Transaction } from "firebase-admin/firestore";
import { User } from "@/types/user";

import { DAILY_SESSION_LIMIT } from "@/constants/practice";
import { USERS_COLLECTION } from "@/constants/firestore";

const COLLECTION = USERS_COLLECTION;

export async function create(uid: string, tx?: Transaction): Promise<void> {
  const newUser: User = {
    completedProblems: [],
    preferences: {},
    savedProblems: [],
    role: "user",
  };
  const ref = adminDb.collection(COLLECTION).doc(uid);
  if (tx) {
    tx.set(ref, newUser);
  } else {
    await ref.set(newUser);
  }
}

export async function getById(uid: string): Promise<User | null> {
  const doc = await adminDb.collection(COLLECTION).doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as User;
}

export async function addCompletedProblem(
  uid: string,
  titleSlug: string,
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .update({ completedProblems: FieldValue.arrayUnion(titleSlug) });
}

export async function addSavedProblem(
  uid: string,
  titleSlug: string,
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .update({ savedProblems: FieldValue.arrayUnion(titleSlug) });
}

export async function removeSavedProblem(
  uid: string,
  titleSlug: string,
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .update({ savedProblems: FieldValue.arrayRemove(titleSlug) });
}

export async function checkAndIncrementDailySessions(
  uid: string,
): Promise<{ allowed: boolean }> {
  const ref = adminDb.collection(COLLECTION).doc(uid);

  return adminDb.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return { allowed: false };

    const user = doc.data() as User;
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" UTC

    const existing = user.dailySessions;
    const currentCount = !existing || existing.date !== today ? 0 : existing.count;

    if (currentCount >= DAILY_SESSION_LIMIT) return { allowed: false };

    tx.update(ref, { dailySessions: { date: today, count: currentCount + 1 } });
    return { allowed: true };
  });
}
