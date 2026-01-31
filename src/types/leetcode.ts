export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export const LangSlug = {
  PYTHON3: "python3",
} as const;

export type LangSlug = (typeof LangSlug)[keyof typeof LangSlug];

export interface LCProblem {
  id: string; // LeetCode numbering
  difficulty: ProblemDifficulty;
  isPaidOnly: boolean;
  title: string; // for display
  titleSlug: string; // identifier & url
  topicTags: LCTag[];
}

export interface LCTag {
  name: string;
  id: string;
  slug: string;
}

export interface ProcessedProblem extends LCProblem {
  originalContent: string;
  framing: {
    canonical: string;
    backend?: string;
    systems?: string;
  };
  hints: string[];
  pitfalls: string[];
  solutions: string[];
  processedAt: number; // turn into processing meta with model, promptversion, schemaversion
  // summary tab: display for when select problem stage is collapsed and we can show a condensed version with a tooltip
}
// test case object with { description of case, input, expected output }
// test cases, grading criteria, boilerplate code, constraints
// coreconcepts
// needsreprocessing flag
// sample solution in each language + explanation?
