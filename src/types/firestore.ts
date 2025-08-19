import { PracticeProblemSource, SectionKey } from "@/types/practice";
import { ProblemMetadataSchema } from "./problems";
import z from "zod";

export type StoredProblemSource = Exclude<
  PracticeProblemSource,
  PracticeProblemSource.Custom
>;

export type ProblemMetadata = z.infer<typeof ProblemMetadataSchema>;

export type ProblemDoc = {
  id: string;
  title?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  tags: string[];
  metadata: ProblemMetadata;
  lastFetchedAt?: string;
} & (
    { source: PracticeProblemSource.LeetCode; leetcodeId?: string; titleSlug?: string; } |
    { source: PracticeProblemSource.AiGenerated; }
  );

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

export interface FeedbackData {
  scores: FeedbackScores;
  strengths?: string[];
  suggestions?: string[];
}

export interface SessionDoc {
  id: string;
  userId: string;
  createdAt: string;
  practiceProblemSource: PracticeProblemSource;
  problemRefId?: string; // Public problems
  problemInline?: {
    description: string;
    tags?: string[];
  }; // Custom problems
  distilledSummaries: Record<SectionKey, string>;
  implementation: string;
  implementationLanguage: string;
  pseudocode?: string;
  totalTimeSec?: number;
  feedback?: FeedbackData;
  ragMetadata?: RagMetadata;
}

export interface TagDoc {
  id: string; // normalized tag name
  displayName: string;
  commonHints?: string[];
  commonPitfalls?: string[];
  vectorEmbedding?: number[];
}

export interface RagMetadata {
  problemSummary: string;
  reasoningSummary: string;
  keyTakeaways: string[];
  tags: string[];
  source?: StoredProblemSource;
  problemRefId?: string;
}