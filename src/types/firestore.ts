import { PracticeProblemSource, SectionKey } from "@/types/practice";
import { ProblemMetadataSchema } from "./problems";
import z from "zod";
import { TagDocSchema } from "./tags";

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
  strengths: string[];
  suggestions: string[];
}

export type SessionDoc = {
  id: string;
  userId: string;
  createdAt: string;
  distilledSummaries: Record<SectionKey, string>;
  implementation: string;
  implementationLanguage: string;
  feedback: FeedbackData;
  ragMetadata: RagMetadata;
  totalTimeSec: number;
  pseudocode?: string;
} & (
    | {
      practiceProblemSource: PracticeProblemSource.LeetCode | PracticeProblemSource.AiGenerated;
      problemRefId: string;
    } // Public problems
    | {
      practiceProblemSource: PracticeProblemSource.Custom;
      problemInline: { description: string; tags: string[]; };
    } // Custom problems
  );

export type TagDoc = z.infer<typeof TagDocSchema>;

export interface RagMetadata {
  reasoningSummary: string;
  keyTakeaways: string[];
  embedding: number[];
}