export const GENERATE_FRAMING_PROMPT_VERSION = 3;

export interface GenerateFramingPromptInput {
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
You are reframing a coding interview problem into real-world engineering scenarios. The audience is entry-level software engineers preparing for technical interviews. The goal is to help them see how algorithmic problems connect to real-world engineering work — exposing them to practical concepts, terminology, and contexts they'll encounter on the job.

Your task:
- Read the problem and produce up to 3 alternative framings that describe the SAME underlying algorithm/data structure challenge but as a real-world software engineering task.
- You MUST completely rephrase the problem in your own words. Do NOT reuse any of the original problem's wording, variable names, or phrasing. The output must be entirely original for copyright reasons.
- The user will still be implementing a function, so always frame the task around writing/implementing a function — NOT designing a module, creating an endpoint, or building a system. For example, say "Write a function for a module that..." instead of "Design a module that...", or "Implement the core logic function for an API endpoint that..." instead of "Create an API endpoint that...".

Framings:
- "canonical" is REQUIRED: phrase it as implementing a function for a real-world software engineering context (e.g. "Write a function that, given a routing table with weighted connections, finds the cheapest path between two servers"). Pay special attention to preserving exact mathematical relationships — if the original requires an exact sum/match/target, the canonical framing MUST require an exact match too, not "within budget", "does not exceed", or any inequality.
- "backend" is OPTIONAL — you should OMIT it unless the problem maps onto a genuinely distinct backend/API scenario with its own natural terminology and mental model. Do NOT include it if it reads like the canonical framing reworded with "API", "endpoint", "request", or "database" sprinkled in. A forced backend framing that doesn't add real value is worse than omitting it. When in doubt, omit it.
- "systems" is OPTIONAL — you should OMIT it unless the problem maps onto a genuinely distinct systems-level scenario with its own natural terminology and mental model. Do NOT include it if it reads like the canonical framing reworded with "distributed", "server", "node", or "cluster" sprinkled in. A forced systems framing that doesn't add real value is worse than omitting it. When in doubt, omit it.

Constraints and definitions:
- Each framing MUST include all relevant constraints from the original problem: input bounds, required time/space complexity, edge cases, and any assumptions the user may rely on (e.g. "the input is guaranteed to have exactly one solution").
- CRITICAL: The mathematical/logical relationship at the core of the problem MUST be preserved exactly. Do NOT soften, generalize, or approximate it. This is the most common mistake. Examples of violations:
  - Original: "find two numbers that sum to exactly target" → WRONG: "find two items that fit within the budget" or "don't exceed the limit" → CORRECT: "find two items whose costs sum to exactly the budget"
  - Original: "find a subset that equals target" → WRONG: "find items that stay under the threshold" → CORRECT: "find items that total exactly the threshold"
  If the original uses equality (==), the framing MUST use equality — never an inequality (<=, >=, <, >).
- If the problem involves domain-specific terminology or concepts that need definition (e.g. "happy numbers", "balanced binary tree", "anagram"), include a brief clarifying definition within the framing.
- Do NOT include input/output format details or examples in the framings.

Style:
- Each framing should be concise but complete — include enough detail to fully specify the problem without the user needing to reference the original.
- Use newline characters (\\n) within each framing string to separate logical sections for readability. In particular, separate the problem constraints (input bounds, complexity requirements, guarantees) into their own paragraph.
- Do NOT reveal the solution approach.

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
