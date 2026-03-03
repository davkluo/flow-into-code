import { z } from "zod";
import { Framing } from "@/types/problem";
import { callLLMStructured, LLMGenerationResult } from "./client";
import {
  buildGenerateFramingPrompt,
  GENERATE_FRAMING_PROMPT_VERSION,
  GenerateFramingPromptInput,
} from "./prompts/generateFraming";

export const FramingSchema = z.object({
  canonical: z.string(),
  backend: z.string().nullable(), // OpenAI structured outputs require nullable() over optional()
  systems: z.string().nullable(),
});

/**
 * Calls LLM to generate a canonical framing and optional backend/systems for a
 * problem
 */
export async function generateFraming(
  input: GenerateFramingPromptInput,
): Promise<LLMGenerationResult<Framing>> {
  const prompt = buildGenerateFramingPrompt(input);

  const { data, model } = await callLLMStructured({
    prompt,
    schema: FramingSchema,
    schemaName: "framing",
    temperature: 0.3,
  });

  return {
    data: {
      canonical: data.canonical,
      ...(data.backend !== null &&
        data.backend !== "null" && { backend: data.backend }),
      ...(data.systems !== null &&
        data.systems !== "null" && { systems: data.systems }),
    },
    model,
    promptVersion: GENERATE_FRAMING_PROMPT_VERSION,
  };
}
