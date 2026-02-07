import { ProblemDetails } from "./problem";

export type PracticeProblem = ProblemDetails;

export type SectionKey =
  | "selection"
  | "clarification"
  | "thought_process"
  | "pseudocode"
  | "implementation"
  | "complexity_analysis";
