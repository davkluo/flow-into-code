import { Problem } from "@/types/leetcode";

export function filterAndSortProblems(
  problems: Problem[],
  query: string
): Problem[] {
  const lowercaseQuery = query.toLowerCase().trim();

  return problems
    .sort((a, b) => {
      const idA = parseInt(a.id, 10);
      const idB = parseInt(b.id, 10);
      return idA - idB;
    })
    .filter((problem) => {
      const fullProblemTitle = `${problem.id}. ${problem.title.toLowerCase()} ${problem.difficulty.toLowerCase()}`;
      return fullProblemTitle.includes(lowercaseQuery);
    });
}
