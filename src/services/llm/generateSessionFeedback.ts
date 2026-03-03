import { z } from "zod";
import { CategoryFeedback } from "@/types/session";
import { callLLMStructured } from "./client";
import {
  buildGradeSectionPrompt,
  buildSessionSummaryPrompt,
  GENERATE_SESSION_FEEDBACK_PROMPT_VERSION,
  GradeSectionPromptInput,
  SessionSummaryPromptInput,
} from "./prompts/generateSessionFeedback";

// Coerces the string literal "null" → null to handle known OpenAI structured
// output quirk where nullable fields sometimes arrive as the string "null".
const CategoryFeedbackSchema = z.object({
  score: z
    .union([z.number(), z.null(), z.literal("null").transform(() => null)])
    .nullable(),
  comments: z.string(),
  compliments: z.string(),
  advice: z.string(),
});

const SessionSummarySchema = z.object({
  interviewerCommunication: CategoryFeedbackSchema,
  summary: z.string(),
});

/**
 * Calls LLM to generate feedback for a specific section of an interview session
 */
export async function generateSectionFeedback(
  input: GradeSectionPromptInput,
): Promise<CategoryFeedback> {
  const prompt = buildGradeSectionPrompt(input);
  const { data } = await callLLMStructured({
    prompt,
    schema: CategoryFeedbackSchema,
    schemaName: "categoryFeedback",
    temperature: 0,
  });
  return data as CategoryFeedback;
}

/**
 * Calls LLM to generate an overall summary and communication feedback for an
 * interview session
 */
export async function generateSessionSummary(
  input: SessionSummaryPromptInput,
): Promise<{ interviewerCommunication: CategoryFeedback; summary: string }> {
  const prompt = buildSessionSummaryPrompt(input);
  const { data } = await callLLMStructured({
    prompt,
    schema: SessionSummarySchema,
    schemaName: "sessionSummary",
    temperature: 0,
  });
  return data as {
    interviewerCommunication: CategoryFeedback;
    summary: string;
  };
}

export { GENERATE_SESSION_FEEDBACK_PROMPT_VERSION };
