import { z } from "zod";
import { callLLMStructured, LLMGenerationResult } from "./client";
import {
  buildGeneratePitfallsPrompt,
  GENERATE_PITFALLS_PROMPT_VERSION,
  GeneratePitfallsPromptInput,
} from "./prompts/generatePitfalls";

export const PitfallsSchema = z.object({
  pitfalls: z.array(
    z.object({
      level: z.number(),
      text: z.string(),
    }),
  ),
});

/** Calls LLM to generate common pitfalls for a problem */
export async function generatePitfalls(
  input: GeneratePitfallsPromptInput,
): Promise<LLMGenerationResult<{ level: number; text: string }[]>> {
  const prompt = buildGeneratePitfallsPrompt(input);

  const { data, model } = await callLLMStructured({
    prompt,
    schema: PitfallsSchema,
    schemaName: "pitfalls",
    temperature: 0.3,
  });

  return {
    data: data.pitfalls,
    model,
    promptVersion: GENERATE_PITFALLS_PROMPT_VERSION,
  };
}
