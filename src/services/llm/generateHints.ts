import { z } from "zod";
import { LLMGenerationResult, callLLMStructured } from "./client";
import {
  GENERATE_HINTS_PROMPT_VERSION,
  GenerateHintsPromptInput,
  buildGenerateHintsPrompt,
} from "./prompts/generateHints";

const HintsSchema = z.object({
  hints: z.array(
    z.object({
      level: z.number(),
      text: z.string(),
    }),
  ),
});

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
