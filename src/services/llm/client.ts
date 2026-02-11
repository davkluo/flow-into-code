import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { openAIClient } from "@/lib/openai";

const DEFAULT_MODEL = "gpt-4o-mini";

interface CallLLMStructuredInput<T extends z.ZodType> {
  prompt: string;
  schema: T;
  schemaName: string;
  model?: string;
  temperature?: number;
}

export interface LLMStructuredResult<T> {
  data: T;
  model: string;
}

export interface LLMGenerationResult<T> extends LLMStructuredResult<T> {
  promptVersion: number;
}

export async function callLLMStructured<T extends z.ZodType>({
  prompt,
  schema,
  schemaName,
  model = DEFAULT_MODEL,
  temperature = 0,
}: CallLLMStructuredInput<T>): Promise<LLMStructuredResult<z.infer<T>>> {
  const response = await openAIClient.responses.parse({
    model,
    temperature,
    instructions: "You are a precise JSON-producing assistant.",
    input: prompt,
    text: { format: zodTextFormat(schema, schemaName) },
  });

  if (!response.output_parsed) {
    throw new Error(`callLLMStructured(${schemaName}): LLM returned empty response`);
  }

  return { data: response.output_parsed, model };
}
