import { PracticeProblemSource, SectionKey } from "@/types/practice";
import { ProblemMetadataSchema } from "./problems";
import z from "zod";
import { TagDocSchema } from "./tags";
import { FeedbackSchema, RagMetadataSchema } from "./session";
import { LanguageKey } from "@/lib/codeMirror";

export type StoredProblemSource = Exclude<
  PracticeProblemSource,
  PracticeProblemSource.Custom
>;

export type ProblemMetadata = z.infer<typeof ProblemMetadataSchema>;

export type ProblemDoc = {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  metadata: ProblemMetadata;
} & (
    { source: PracticeProblemSource.LeetCode; leetcodeId: string; titleSlug: string; } |
    { source: PracticeProblemSource.AiGenerated; description: string; }
  );

export type FeedbackData = z.infer<typeof FeedbackSchema>;

export type SessionDoc = {
  id: string;
  userId: string;
  createdAt: string;
  distilledSummaries: Record<SectionKey, string>;
  implementation: string;
  implementationLanguage: LanguageKey;
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

export type RagMetadata = z.infer<typeof RagMetadataSchema>;

