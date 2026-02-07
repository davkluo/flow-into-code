import { Example, Framing } from "@/types/problem";
import { callLLM } from "./client";
import { buildGenerateFramingPrompt } from "./prompts/generateFraming";

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

  const raw = await callLLM({
    prompt,
    temperature: 0.3,
  });

  console.log("generateFraming raw LLM output:", raw);

  // Strip markdown code fences if the LLM wrapped its response
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "");

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("generateFraming: LLM output was not valid JSON\n" + err);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("generateFraming: expected a JSON object");
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.canonical !== "string") {
    throw new Error("generateFraming: missing required 'canonical' field");
  }

  if ("backend" in obj && typeof obj.backend !== "string") {
    throw new Error("generateFraming: 'backend' must be a string if provided");
  }

  if ("systems" in obj && typeof obj.systems !== "string") {
    throw new Error("generateFraming: 'systems' must be a string if provided");
  }

  return parsed as Framing;
}
