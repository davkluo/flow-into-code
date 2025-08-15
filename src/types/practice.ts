import { LCProblemWithDetails } from "./leetcode";

export enum PracticeProblemSource {
  LeetCode = "leetcode",
  Custom = "custom",
}

export type CustomProblem = {
  description: string;
};

export type PracticeProblem = {
  source: PracticeProblemSource;
  problem: LCProblemWithDetails | CustomProblem;
};

export type SectionKey = "selection" | "clarification" | "thought_process" | "pseudocode" | "implementation" | "complexity_analysis";