import { z } from "zod";
import { Example } from "@/types/problem";
import { LLMGenerationResult, callLLMStructured } from "./client";
import {
  EXTRACT_EXAMPLES_PROMPT_VERSION,
  buildExtractExamplesPrompt,
} from "./prompts/extractExamples";

// OpenAI structured outputs require a top-level object schema
const ExamplesSchema = z.object({
  examples: z.array(
    z.object({
      input: z.string(),
      output: z.string(),
      explanation: z.string().nullable(), // OpenAI structured outputs require nullable() over optional()
    }),
  ),
});

interface ExtractExamplesInput {
  title: string;
  originalContent: string;
}

export async function extractExamples(
  input: ExtractExamplesInput,
): Promise<LLMGenerationResult<Example[]>> {
  const prompt = buildExtractExamplesPrompt({
    title: input.title,
    originalContent: input.originalContent,
  });

  const { data, model } = await callLLMStructured({
    prompt,
    schema: ExamplesSchema,
    schemaName: "examples",
    temperature: 0.1,
  });

  return {
    data: data.examples.map(({ explanation, ...rest }) => ({
      ...rest,
      ...(explanation != null && { explanation }),
    })),
    model,
    promptVersion: EXTRACT_EXAMPLES_PROMPT_VERSION,
  };
}
