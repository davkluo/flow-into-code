import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getOpenAIClient } from "@/lib/openai";
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

/**
 * Call OpenAI's structured output API with a Zod schema, and get back the
 * parsed result.
 *
 * Throws an error if the LLM fails to produce valid output.
 */
export async function callLLMStructured<T extends z.ZodType>({
  prompt,
  schema,
  schemaName,
  model = DEFAULT_MODEL,
  temperature = 0,
}: CallLLMStructuredInput<T>): Promise<LLMStructuredResult<z.infer<T>>> {
  const response = await getOpenAIClient().responses.parse({
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

/**
 * Call OpenAI's chat completion API with streaming enabled, and return a
 * ReadableStream of the deltas as they come in. Each chunk is a JSON string
 * with this shape: { data: string }.
 *
 * The stream will end with a final chunk: { data: "[DONE]" }.
 */
export async function streamChatCompletion({
  messages,
  model = DEFAULT_MODEL,
  temperature = 0.7,
}: CallLLMChatStreamInput): Promise<ReadableStream<Uint8Array>> {
  const stream = await getOpenAIClient().chat.completions.create({
    model,
    messages,
    temperature,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        if (delta) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`),
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}
