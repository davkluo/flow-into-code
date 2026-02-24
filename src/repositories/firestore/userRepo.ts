import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { User } from "@/types/user";

import { USERS_COLLECTION } from "@/constants/firestore";

const COLLECTION = USERS_COLLECTION;

export async function create(uid: string): Promise<void> {
  const newUser: User = {
    completedProblems: [],
    preferences: {},
    savedProblems: [],
  };
  await adminDb.collection(COLLECTION).doc(uid).set(newUser);
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
