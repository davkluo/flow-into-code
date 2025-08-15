import { PracticeProblemSource, SectionKey } from "@/types/practice";

export enum StoredProblemSource {
  LeetCode = "leetcode",
  AiGenerated = "ai_generated",
}

export interface ProblemMetadata {
  summary?: string;
  hints?: string[];
  solutionOutlines?: string[];
}

export interface ProblemDoc {
  id: string;
  source: StoredProblemSource;
  title?: string;
  titleSlug?: string; // for LeetCode problems
  leetcodeId?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  tags: string[];
  metadata?: ProblemMetadata;
  lastFetchedAt?: string;
}

export type FeedbackCategory =
  | "understandingAndCommunication"
  | "problemSolvingAndReasoning"
  | "codeImplementation"
  | "complexityAnalysis";

export type FeedbackScores = {
  [K in FeedbackCategory]: {
    score: number;
    reason: string;
  };
};

export interface FeedbackDoc {
  scores: FeedbackScores;
  strengths?: string[];
  suggestions?: string[];
}

export interface SessionDoc {
  id: string;
  userId: string;
  createdAt: string;
  practiceProblemSource: PracticeProblemSource;
  problemRef?: string; // Public problems
  problemInline?: {
    title: string;
    description: string;
    tags?: string[];
  }; // Custom problems
  distilledSummaries: Record<SectionKey, string>;
  pseudocode?: string;
  implementation?: string;
  totalTimeSec?: number;
  feedback?: FeedbackDoc;
  ragMetadata?: RagMetadata;
}

export interface TagDoc {
  id: string;
  name: string;
  commonHints?: string[];
  commonPitfalls?: string[];
  vectorEmbedding?: number[];
}

export interface RagMetadata {
  problemSummary: string;
  reasoningSummary: string;
  keyTakeaways: string[];
  tags: string[];
  source: StoredProblemSource;
  problemRefId?: string;
}