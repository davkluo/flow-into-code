import { SectionKey } from "@/types/practice";

export const CRITERION_MAX_SCORE = 5;

export const GRADING_CATEGORIES: Record<SectionKey, string> = {
  problem_understanding: "Problem Understanding & Clarification",
  approach_and_reasoning: "Approach & Reasoning",
  algorithm_design: "Algorithm Design / Pseudocode",
  implementation: "Implementation Correctness",
  complexity_analysis: "Time & Space Complexity",
} as const;
