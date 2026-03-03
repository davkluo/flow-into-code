import { z } from "zod";
import { callLLMStructured, LLMGenerationResult } from "./client";
import {
  buildGenerateHintsPrompt,
  GENERATE_HINTS_PROMPT_VERSION,
  GenerateHintsPromptInput,
} from "./prompts/generateHints";

export const HintsSchema = z.object({
  hints: z.array(
    z.object({
      level: z.number(),
      text: z.string(),
    }),
  ),
});

/** Calls LLM to generate hints for a problem */
export async function generateHints(
  input: GenerateHintsPromptInput,
): Promise<LLMGenerationResult<{ level: number; text: string }[]>> {
  const prompt = buildGenerateHintsPrompt(input);

  const { data, model } = await callLLMStructured({
    prompt,
    schema: HintsSchema,
    schemaName: "hints",
    temperature: 0.3,
  });

  return {
    data: data.hints,
    model,
    promptVersion: GENERATE_HINTS_PROMPT_VERSION,
  };
}
