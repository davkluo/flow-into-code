interface ExtractExamplesPromptInput {
  title: string;
  originalContent: string;
}

export function buildExtractExamplesPrompt(
  input: ExtractExamplesPromptInput,
): string {
  return `
You are extracting example cases from a coding problem description.

Your task:
- Extract ONLY the examples explicitly shown in the problem description.
- Do NOT invent new examples.
- Do NOT solve the problem.
- Preserve input and output formatting as closely as possible.
- If an explanation is shown, include it.
- If no examples exist, return an empty array.

Return valid JSON with this exact shape:
[
  {
    "input": string,
    "output": string,
    "explanation"?: string
  }
]

Problem title:
${input.title}

Problem description:
${input.originalContent}
`;
}
