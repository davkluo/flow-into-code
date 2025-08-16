import { LCProblem, LCProblemDetails, LCProblemWithDetails } from "./leetcode";

export enum PracticeProblemSource {
  LeetCode = "leetcode",
  Custom = "custom",
  AiGenerated = "ai_generated",
}

export type CustomProblem = {
  description: string;
};

export type AIProblem = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
};

export type PracticeProblem =
  | {
    source: PracticeProblemSource.LeetCode;
    problem: LCProblemWithDetails;
  }
  | {
    source: PracticeProblemSource.Custom;
    problem: { description: string; };
  }
  | {
    source: PracticeProblemSource.AiGenerated;
    problem: AIProblem;
  };

export type SectionKey = "selection" | "clarification" | "thought_process" | "pseudocode" | "implementation" | "complexity_analysis";

export type ProblemSelection =
  | {
    source: PracticeProblemSource.LeetCode;
    lcProblem: LCProblem;
    lcProblemDetails: LCProblemDetails;
  }
  | {
    source: PracticeProblemSource.Custom;
    customDescription: string;
  };