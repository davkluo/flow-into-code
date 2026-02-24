import { adminDb } from "@/lib/firebaseAdmin";
import { USERS_COLLECTION } from "@/constants/firestore";
import * as userRepo from "@/repositories/firestore/userRepo";
import * as statsRepo from "@/repositories/firestore/statsRepo";

/**
 * Idempotent: creates the user doc and increments the global user count
 * atomically if the user doesn't already exist. No-ops on subsequent calls.
 */
export async function initUser(uid: string): Promise<void> {
  const userRef = adminDb.collection(USERS_COLLECTION).doc(uid);

  await adminDb.runTransaction(async (tx) => {
    const userDoc = await tx.get(userRef);
    if (userDoc.exists) return;

    await userRepo.create(uid, tx);
    await statsRepo.incrementUserCount(tx);
  });
}
