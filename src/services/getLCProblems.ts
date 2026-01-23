import * as problemRepo from "@/repositories/firestore/problemRepo";
import { LCProblem } from "@/types/leetcode";
import { fetchLCProblems } from "./leetcode/fetchProblems";

/**
 * Get LeetCode problems for the app.
 * - Prefer Firestore
 * - Fallback to LeetCode GraphQL
 * - Persist on cache miss by writing to Firestore
 */
export async function getLCProblems(): Promise<LCProblem[]> {
  const cachedProblems = await problemRepo.getAll();

  if (cachedProblems.length > 0) {
    return cachedProblems;
  }

  const freshProblems = await fetchLCProblems();
  await problemRepo.upsertMany(freshProblems);

  return freshProblems;
}
