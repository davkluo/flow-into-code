import { z } from "zod";
import { Example } from "@/types/problem";
import { callLLMStructured } from "./client";
import { buildExtractExamplesPrompt } from "./prompts/extractExamples";

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
): Promise<Example[]> {
  const prompt = buildExtractExamplesPrompt({
    title: input.title,
    originalContent: input.originalContent,
  });

  const { examples } = await callLLMStructured({
    prompt,
    schema: ExamplesSchema,
    schemaName: "examples",
    temperature: 0.1,
  });

  return examples.map(({ explanation, ...rest }) => ({
    ...rest,
    ...(explanation != null && { explanation }),
  }));
}
