import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { openAIClient } from "@/lib/openai";
import { Message } from "@/types/chat";

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

interface CallLLMChatStreamInput {
  messages: Message[];
  model?: string;
  temperature?: number;
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
    throw new Error(
      `callLLMStructured(${schemaName}): LLM returned empty response`,
    );
  }

  return { data: response.output_parsed, model };
}

export async function streamChatCompletion({
  messages,
  model = DEFAULT_MODEL,
  temperature = 0.7,
}: CallLLMChatStreamInput): Promise<ReadableStream<Uint8Array>> {
  const stream = await openAIClient.chat.completions.create({
    model,
    messages,
    temperature,
    stream: true,
  });
  return stream.toReadableStream();
}
