import z from "zod";
import { LanguageKey } from "@/lib/codeMirror";
import { ProblemDetails } from "@/types/leetcode";
import { SectionKey } from "@/types/practice";
import { ProblemMetadataSchema } from "./problems";
import { FeedbackSchema, RagMetadataSchema } from "./session";
import { TagDocSchema } from "./tags";

export type ProblemMetadata = z.infer<typeof ProblemMetadataSchema>;

// ProblemDoc stores ProcessedProblem data in Firestore
// Document ID is the titleSlug
export type ProblemDoc = ProblemDetails & {
  tags: string[]; // Tag IDs for relationships
  metadata: ProblemMetadata;
};

export type FeedbackData = z.infer<typeof FeedbackSchema>;

export type SessionDoc = {
  id: string;
  userId: string;
  createdAt: string;
  problemTitleSlug: string; // References problems/{titleSlug}
  distilledSummaries: Record<SectionKey, string>;
  implementation: string;
  implementationLanguage: LanguageKey;
  feedback: FeedbackData;
  ragMetadata: RagMetadata;
  totalTimeSec: number;
  pseudocode?: string;
};

export type TagDoc = z.infer<typeof TagDocSchema>;

export type RagMetadata = z.infer<typeof RagMetadataSchema>;
