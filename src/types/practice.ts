import { LCProblemWithDetails } from "./leetcode";

export enum ProblemSource {
  LeetCode = "leetcode",
  Custom = "custom",
}

export type CustomProblem = {
  description: string;
};

export type PracticeProblem = {
  source: ProblemSource;
  problem: LCProblemWithDetails | CustomProblem;
};