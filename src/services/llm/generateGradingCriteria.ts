import { z } from "zod";
import { LLMGenerationResult, callLLMStructured } from "./client";
import {
  GENERATE_GRADING_CRITERIA_PROMPT_VERSION,
  GenerateGradingCriteriaPromptInput,
  buildGenerateGradingCriteriaPrompt,
} from "./prompts/generateGradingCriteria";
import { GradingCriterion } from "@/types/problem";

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

const GradingCriteriaSchema = z.object({
  gradingCriteria: z.array(GradingCriterionSchema),
});

export async function generateGradingCriteria(
  input: GenerateGradingCriteriaPromptInput,
): Promise<LLMGenerationResult<{ gradingCriteria: GradingCriterion[] }>> {
  const prompt = buildGenerateGradingCriteriaPrompt(input);

  const { data, model } = await callLLMStructured({
    prompt,
    schema: GradingCriteriaSchema,
    schemaName: "gradingCriteria",
    temperature: 0.3,
  });

  return {
    data,
    model,
    promptVersion: GENERATE_GRADING_CRITERIA_PROMPT_VERSION,
  };
}
