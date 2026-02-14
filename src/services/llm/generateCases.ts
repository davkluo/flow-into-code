import { z } from "zod";
import { TestCase } from "@/types/problem";
import { LLMGenerationResult, callLLMStructured } from "./client";
import {
  GENERATE_CASES_PROMPT_VERSION,
  GenerateCasesPromptInput,
  buildGenerateCasesPrompt,
} from "./prompts/generateCases";

const TestCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  description: z.string().nullable(),
  explanation: z.string().nullable(),
});

const CasesSchema = z.object({
  testCases: z.array(TestCaseSchema),
  edgeCases: z.array(TestCaseSchema),
});

function stripNulls(
  raw: z.infer<typeof TestCaseSchema>,
): TestCase {
  return {
    input: raw.input,
    expectedOutput: raw.expectedOutput,
    ...(raw.description !== null && raw.description !== "null" && { description: raw.description }),
    ...(raw.explanation !== null && raw.explanation !== "null" && { explanation: raw.explanation }),
  };
}

export async function generateCases(
  input: GenerateCasesPromptInput,
): Promise<LLMGenerationResult<{ testCases: TestCase[]; edgeCases: TestCase[] }>> {
  const prompt = buildGenerateCasesPrompt(input);

  const { data, model } = await callLLMStructured({
    prompt,
    schema: CasesSchema,
    schemaName: "cases",
    temperature: 0.3,
  });

  return {
    data: {
      testCases: data.testCases.map(stripNulls),
      edgeCases: data.edgeCases.map(stripNulls),
    },
    model,
    promptVersion: GENERATE_CASES_PROMPT_VERSION,
  };
}
