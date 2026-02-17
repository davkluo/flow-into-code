import { Example, Framing } from "@/types/problem";

export const GENERATE_CASES_PROMPT_VERSION = 1;

export interface GenerateCasesPromptInput {
  title: string;
  originalContent: string;
  examples: Example[];
  framing: Framing;
}

export function buildGenerateCasesPrompt(
  input: GenerateCasesPromptInput,
): string {
  const examplesBlock =
    input.examples.length > 0
      ? `\nExisting examples (from the problem statement — do NOT duplicate these):\n${input.examples.map((e, i) => `  ${i + 1}. Input: ${e.input} → Output: ${e.output}`).join("\n")}\n`
      : "";

  return `
You are generating test cases for a coding interview problem. The audience is entry-level software engineers preparing for technical interviews. The test cases will be used to validate their implementations during practice.

Context — the problem has been reframed as:
${input.framing.canonical}

Your task:
- Generate two categories of test cases: standard test cases and edge cases.
- Standard test cases should cover typical scenarios and common patterns the solution must handle.
- Edge cases should cover boundary conditions, minimal/maximal inputs, empty inputs, single-element cases, and other scenarios that commonly trip up candidates.
- Each test case must have an \`input\` (the function arguments as a string) and an \`expectedOutput\` (the correct return value as a string).
- Optionally include a \`description\` and \`explanation\`. The \`description\` must be a concise noun phrase label (2-4 words, no verbs) — e.g. "Identical elements", "Minimum input size", "Single character string". The \`explanation\` should be a sentence explaining why the expected output is correct.
- Do NOT duplicate any of the existing examples from the problem statement.
- Ensure no overlap between standard test cases and edge cases.
- All inputs and outputs must be valid for the original problem's constraints.
${examplesBlock}
Return valid JSON with this exact shape:
{
  "testCases": [
    { "input": string, "expectedOutput": string, "description": string | null, "explanation": string | null }
  ],
  "edgeCases": [
    { "input": string, "expectedOutput": string, "description": string | null, "explanation": string | null }
  ]
}

Generate 3-5 standard test cases and 3-5 edge cases.

Problem title: ${input.title}
Problem description:
${input.originalContent}
`;
}
