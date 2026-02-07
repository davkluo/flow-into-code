import { Problem } from "@/types/problem";
import { normalizeToWords } from "../normalize";

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
