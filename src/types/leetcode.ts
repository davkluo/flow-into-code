export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

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
  processedAt: number;
}
