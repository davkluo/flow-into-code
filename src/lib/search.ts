import { LCProblem } from "@/types/leetcode";

export function filterAndSortProblems(
  problems: LCProblem[],
  query: string
): LCProblem[] {
  const lowercaseQuery = query.toLowerCase().trim();

  return problems
    .sort((a, b) => {
      const idA = parseInt(a.id, 10);
      const idB = parseInt(b.id, 10);
      return idA - idB;
    })
    .filter((problem) => {
      const fullProblemTitle = `${problem.id}. ${problem.title.toLowerCase()} ${problem.difficulty.toLowerCase()}`;
      const tags = problem.topicTags.map((tag) => tag.name.toLowerCase()).join(" ");
      const fullText = `${fullProblemTitle} ${tags}`.toLowerCase();
      return !problem.isPaidOnly && fullText.includes(lowercaseQuery);
    });
}
