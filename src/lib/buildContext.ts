import { PracticeProblem } from "@/types/practice";

export const getProblemContext = (problem: PracticeProblem): string => {
  if ("title" in problem.problem) {
    return `Problem: ${problem.problem.title} (LeetCode #${problem.problem.id})\n${problem.problem.details.content}`;
  } else {
    return `Custom Problem:\n${problem.problem.description}`;
  }
};

// TODO:
// Section distilled summaries
// Pseudocode context
// Implementation context