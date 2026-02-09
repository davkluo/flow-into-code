import { z } from "zod";
import { Example, Framing } from "@/types/problem";
import { callLLMStructured } from "./client";
import { buildGenerateFramingPrompt } from "./prompts/generateFraming";

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
): Promise<Framing> {
  const prompt = buildGenerateFramingPrompt({
    title: input.title,
    difficulty: input.difficulty,
    originalContent: input.originalContent,
    examples: input.examples,
  });

  const { canonical, backend, systems } = await callLLMStructured({
    prompt,
    schema: FramingSchema,
    schemaName: "framing",
    temperature: 0.3,
  });

  return {
    canonical,
    ...(backend != null && { backend }),
    ...(systems != null && { systems }),
  };
}
