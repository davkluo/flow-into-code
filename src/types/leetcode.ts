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

export interface LCProblemWithDetails extends LCProblem {
  content: string;
}

export interface ProcessedProblem extends LCProblemWithDetails {
  framing: { canonical: string; backend?: string; systems?: string };
  customHints: string[];
  commonMistakes: string[];
  solutionStructure: string;
  sampleApproach: string;
  processedAt: Date;
}
