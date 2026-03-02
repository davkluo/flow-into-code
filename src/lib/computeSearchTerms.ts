import { Problem } from "@/types/problem";
import { normalizeToWords } from "./normalize";

/**
 * Compute a set of search terms for a given problem, to be used for querying
 * the Firestore database. The search terms include:
 * - The problem ID (exact match)
 * - Words from the title
 * - Words from the title slug
 * - Words from the topic tags
 * - The difficulty level (e.g., "easy", "medium", "hard")
 */
export function computeSearchTerms(problem: Problem): string[] {
  const terms = new Set<string>();

  // --- ID number (exact match) ---
  terms.add(problem.id);

  // --- Title words ---
  normalizeToWords(problem.title).forEach((word) => terms.add(word));

  // --- Slug words ---
  normalizeToWords(problem.titleSlug).forEach((word) => terms.add(word));

  // --- Tag words ---
  for (const tag of problem.topicTags ?? []) {
    normalizeToWords(tag.name).forEach((word) => terms.add(word));
  }

  // --- Difficulty ---
  terms.add(problem.difficulty.toLowerCase());

  return Array.from(terms);
}
