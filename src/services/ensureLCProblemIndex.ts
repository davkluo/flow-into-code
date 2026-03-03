import * as metaRepo from "@/repositories/firestore/problemIndexMetaRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { fetchLCProblems } from "@/services/leetcode/client";

/**
 * Ensures that the Firestore collection containing LeetCode problems is fully
 * populated. This is an expensive operation and should be run rarely (e.g. on
 * deployment or when new problems are added on LeetCode).
 */
export async function ensureLCProblemIndex() {
  const meta = await metaRepo.get();

  if (meta?.fullyPopulated) {
    return; // nothing to do
  }

  // Expensive operation (run rarely)
  const problems = await fetchLCProblems();

  await problemRepo.upsertMany(problems);
  await metaRepo.markFullyPopulated(problems.length);
}
