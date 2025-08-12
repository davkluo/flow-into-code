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

export type SectionKey = "selection" | "clarification" | "thought_process" | "pseudocode" | "implementation" | "complexity_analysis";