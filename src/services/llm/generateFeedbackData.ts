import { z } from "zod";
import { LLMGenerationResult, callLLMStructured } from "./client";
import {
  GENERATE_FEEDBACK_DATA_PROMPT_VERSION,
  GenerateFeedbackDataPromptInput,
  buildGenerateFeedbackDataPrompt,
} from "./prompts/generateFeedbackData";
import { GradingCriterion, ProblemSolution } from "@/types/problem";

const SolutionSchema = z.object({
  approach: z.string(),
  explanation: z.string(),
  algorithm: z.string(),
  tradeoffs: z.string(),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
});

const GradingCriterionSchema = z.object({
  category: z.enum([
    "problem_understanding",
    "approach_and_reasoning",
    "algorithm_design",
    "implementation",
    "complexity_analysis",
  ]),
  description: z.string(),
  rubric: z.string(),
});

const FeedbackDataSchema = z.object({
  solutions: z.array(SolutionSchema),
  gradingCriteria: z.array(GradingCriterionSchema),
});

export async function generateFeedbackData(
  input: GenerateFeedbackDataPromptInput,
): Promise<
  LLMGenerationResult<{
    solutions: ProblemSolution[];
    gradingCriteria: GradingCriterion[];
  }>
> {
  const prompt = buildGenerateFeedbackDataPrompt(input);

  const { data, model } = await callLLMStructured({
    prompt,
    schema: FeedbackDataSchema,
    schemaName: "feedbackData",
    temperature: 0.3,
  });

  return {
    data,
    model,
    promptVersion: GENERATE_FEEDBACK_DATA_PROMPT_VERSION,
  };
}
