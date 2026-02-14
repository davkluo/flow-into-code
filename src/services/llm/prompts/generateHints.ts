import { Framing } from "@/types/problem";

export const GENERATE_HINTS_PROMPT_VERSION = 1;

export interface GenerateHintsPromptInput {
  title: string;
  difficulty: string;
  originalContent: string;
  framing: Framing;
}

export function buildGenerateHintsPrompt(
  input: GenerateHintsPromptInput,
): string {
  return `
You are generating hints for a coding interview problem. The audience is entry-level software engineers preparing for technical interviews. The goal is to help them get unstuck when they hit a roadblock in their problem-solving process, without giving away the solution.

Context — the problem has been reframed as:
${input.framing.canonical}

Your task:
- Generate 3-5 progressive hints, ordered from most general (level 1) to most specific (highest level).
- Level 1 hints should nudge the candidate toward the right category of approach (e.g. "Think about what data structure would let you look up values quickly").
- Mid-level hints should narrow the approach (e.g. "Consider using a hash map to track values you've already seen").
- The highest-level hint should describe the key insight needed without writing the code (e.g. "For each element, compute the complement and check if it exists in your map").
- Each hint should be actionable and specific to this problem, not generic advice.
- Calibrate the depth and complexity of hints to the problem's difficulty. Easier problems may only need a single key insight, while harder problems may require scaffolding multiple non-obvious ideas.
- Do NOT reveal the full solution or write any code.

Return valid JSON with this exact shape:
{
  "hints": [
    { "level": number, "text": string }
  ]
}

Problem title: ${input.title}
Difficulty: ${input.difficulty}
Problem description:
${input.originalContent}
`;
}
