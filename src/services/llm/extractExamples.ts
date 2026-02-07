import { Example } from "@/types/problem";
import { callLLM } from "./client";
import { buildExtractExamplesPrompt } from "./prompts/extractExamples";

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

  const raw = await callLLM({
    prompt,
    temperature: 0.1,
  });

  console.log("extractExamples raw LLM output:", raw);

  // Strip markdown code fences if the LLM wrapped its response
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/, "");

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("extractExamples: LLM output was not valid JSON \n" + err);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("extractExamples: expected an array of examples");
  }

  for (const item of parsed) {
    const obj = item as Record<string, unknown>;

    if (
      typeof obj !== "object" ||
      obj === null ||
      typeof obj.input !== "string" ||
      typeof obj.output !== "string"
    ) {
      throw new Error("extractExamples: invalid example shape in LLM output");
    }

    if ("explanation" in obj && typeof obj.explanation !== "string") {
      throw new Error(
        "extractExamples: explanation must be a string if provided",
      );
    }
  }

  return parsed as Example[];
}
