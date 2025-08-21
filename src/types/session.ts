import { z } from "zod";

export const FeedbackSchema = z.object({
  scores: z.object({
    understandingAndCommunication: z.object({
      score: z.number(),
      reason: z.string(),
    }),
    problemSolvingAndReasoning: z.object({
      score: z.number(),
      reason: z.string(),
    }),
    codeImplementation: z.object({
      score: z.number(),
      reason: z.string(),
    }),
    complexityAnalysis: z.object({
      score: z.number(),
      reason: z.string(),
    }),
  }),
  strengths: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export const RagMetadataSchema = z.object({
  reasoningSummary: z.string(),
  keyTakeaways: z.array(z.string()),
  embedding: z.array(z.number()),
});

export const RagMetadataPartialSchema = RagMetadataSchema.pick({
  reasoningSummary: true,
  keyTakeaways: true,
});

export type RagMetadataPartial = z.infer<typeof RagMetadataPartialSchema>;