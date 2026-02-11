import { z } from "zod";
import { Example, Framing } from "@/types/problem";
import { LLMGenerationResult, callLLMStructured } from "./client";
import {
  GENERATE_FRAMING_PROMPT_VERSION,
  buildGenerateFramingPrompt,
} from "./prompts/generateFraming";

const FramingSchema = z.object({
  canonical: z.string(),
  backend: z.string().nullable(), // OpenAI structured outputs require nullable() over optional()
  systems: z.string().nullable(),
});

interface GenerateFramingInput {
  title: string;
  difficulty: string;
  originalContent: string;
  examples?: Example[];
}

export async function generateFraming(
  input: GenerateFramingInput,
): Promise<LLMGenerationResult<Framing>> {
  const prompt = buildGenerateFramingPrompt({
    title: input.title,
    difficulty: input.difficulty,
    originalContent: input.originalContent,
    examples: input.examples,
  });

  const { data, model } = await callLLMStructured({
    prompt,
    schema: FramingSchema,
    schemaName: "framing",
    temperature: 0.3,
  });

  return {
    data: {
      canonical: data.canonical,
      ...(data.backend != null && { backend: data.backend }),
      ...(data.systems != null && { systems: data.systems }),
    },
    model,
    promptVersion: GENERATE_FRAMING_PROMPT_VERSION,
  };
}
