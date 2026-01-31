import { stripHtml } from "@/lib/formatting";
import {
  fetchLCProblemCodeSnippets,
  fetchLCProblemContent,
  fetchLCProblemTestCases,
} from "@/services/leetcode/client";
import { LCProblem, ProcessedProblem } from "@/types/leetcode";

/**
 * Process a problem and save to Firestore.
 * Assumes LCProblem metadata already exists (from selection step).
 */
export async function processProblem(
  problem: LCProblem,
): Promise<ProcessedProblem> {
  const rawContent = await fetchLCProblemContent(problem.titleSlug);
  const cleanedContent = stripHtml(rawContent);
  const testCases = await fetchLCProblemTestCases(problem.titleSlug);
  const codeSnippets = await fetchLCProblemCodeSnippets(problem.titleSlug);

  // Replace later with LLM calls
  const processed: ProcessedProblem = {
    ...problem,
    originalContent: cleanedContent,
    framing: {
      canonical: `Solve the ${problem.title} problem efficiently.`,
    },
    hints: [
      "Think about the core data structure needed.",
      "Consider edge cases early.",
    ],
    pitfalls: ["Off-by-one errors", "Forgetting to handle empty input"],
    solutions: ["Brute force approach", "Optimized approach using a hash map"],
    processedAt: Date.now(),
  };

  // --- Firestore write (disabled for now) ---
  // await problemRepo.upsertMany([processed]);

  return processed;
}
