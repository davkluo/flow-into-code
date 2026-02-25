import { z } from "zod";
import { LLMGenerationResult, callLLMStructured } from "./client";
import {
  GENERATE_SOLUTIONS_PROMPT_VERSION,
  GenerateSolutionsPromptInput,
  buildGenerateSolutionsPrompt,
} from "./prompts/generateSolutions";
import { ProblemSolution } from "@/types/problem";

const SolutionSchema = z.object({
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
