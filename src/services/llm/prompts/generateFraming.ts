interface GenerateFramingPromptInput {
  title: string;
  difficulty: string;
  originalContent: string;
  examples?: { input: string; output: string }[];
}

export function buildGenerateFramingPrompt(
  input: GenerateFramingPromptInput,
): string {
  const examplesBlock =
    input.examples && input.examples.length > 0
      ? `\nExamples:\n${input.examples.map((e, i) => `  ${i + 1}. Input: ${e.input} → Output: ${e.output}`).join("\n")}\n`
      : "";

  return `
You are reframing a coding interview problem into real-world engineering scenarios.

Your task:
- Read the problem and produce up to 3 alternative framings that describe the SAME underlying algorithm/data structure challenge but as a real-world software engineering task.
- You MUST completely rephrase the problem in your own words. Do NOT reuse any of the original problem's wording, variable names, or phrasing. The output must be entirely original for copyright reasons.
- The user will still be implementing a function, so always frame the task around writing/implementing a function — NOT designing a module, creating an endpoint, or building a system. For example, say "Write a function for a module that..." instead of "Design a module that...", or "Implement the core logic function for an API endpoint that..." instead of "Create an API endpoint that...".
- "canonical" is required: phrase it as implementing a function for a real-world software engineering context (e.g. "Write a function that, given a routing table with weighted connections, finds the cheapest path between two servers").
- "backend" is optional: reframe as implementing a function for a backend/API scenario if it fits naturally.
- "systems" is optional: reframe as implementing a function for a systems-level scenario if it fits naturally.
- Each framing should be 1-3 sentences. Be specific enough to convey the problem, but do NOT reveal the solution approach.
- Do NOT include input/output format details or examples in the framings.
- If backend or systems framings feel forced, omit them.

Return valid JSON with this exact shape:
{
  "canonical": string,
  "backend"?: string,
  "systems"?: string
}

Problem title: ${input.title}
Difficulty: ${input.difficulty}
${examplesBlock}
Problem description:
${input.originalContent}
`;
}
