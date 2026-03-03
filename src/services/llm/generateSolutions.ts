import { z } from "zod";
import { ProblemSolution } from "@/types/problem";
import { callLLMStructured, LLMGenerationResult } from "./client";
import {
  buildGenerateSolutionsPrompt,
  GENERATE_SOLUTIONS_PROMPT_VERSION,
  GenerateSolutionsPromptInput,
} from "./prompts/generateSolutions";

export const SolutionSchema = z.object({
  approach: z.string(),
  explanation: z.string(),
  algorithm: z.string(),
  tradeoffs: z.string(),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
});

const SolutionsSchema = z.object({
  solutions: z.array(SolutionSchema),
});

/** Calls LLM to generate canonical solutions for a problem */
export async function generateSolutions(
  input: GenerateSolutionsPromptInput,
): Promise<LLMGenerationResult<{ solutions: ProblemSolution[] }>> {
  const prompt = buildGenerateSolutionsPrompt(input);

  const { data, model } = await callLLMStructured({
    prompt,
    schema: SolutionsSchema,
    schemaName: "solutions",
    temperature: 0.3,
  });

  return {
    data,
    model,
    promptVersion: GENERATE_SOLUTIONS_PROMPT_VERSION,
  };
}
