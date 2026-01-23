import { ProcessedProblem } from "./leetcode";

export type PracticeProblem = ProcessedProblem;

export type SectionKey =
  | "selection"
  | "clarification"
  | "thought_process"
  | "pseudocode"
  | "implementation"
  | "complexity_analysis";
