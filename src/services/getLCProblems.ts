import * as metaRepo from "@/repositories/firestore/problemIndexMetaRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { fetchLCProblems } from "@/services/leetcode/client";
import { LCProblem } from "@/types/leetcode";

/**
 * Get LeetCode problems for the app.
 * - Prefer Firestore
 * - Fallback to LeetCode GraphQL
 * - Persist on cache miss by writing to Firestore
 */
export async function getLCProblems(): Promise<LCProblem[]> {
  const meta = await metaRepo.get();

  if (meta?.fullyPopulated) {
    const cachedProblems = await problemRepo.getAll();
    return cachedProblems;
  }

  const freshProblems = await fetchLCProblems();
  await problemRepo.upsertMany(freshProblems);
  await metaRepo.markFullyPopulated();

  return freshProblems;
}
