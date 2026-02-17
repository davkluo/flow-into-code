import { Framing } from "@/types/problem";

export const GENERATE_PITFALLS_PROMPT_VERSION = 1;

export interface GeneratePitfallsPromptInput {
  title: string;
  difficulty: string;
  originalContent: string;
  framing: Framing;
}

export function buildGeneratePitfallsPrompt(
  input: GeneratePitfallsPromptInput,
): string {
  return `
You are generating common pitfalls for a coding interview problem. The audience is entry-level software engineers preparing for technical interviews. The goal is to warn them about mistakes candidates frequently make, written in a direct, imperative voice.

Context — the problem has been reframed as:
${input.framing.canonical}

Your task:
- Generate 3-5 pitfalls, ordered from most common (level 1) to most subtle (highest level).
- Level 1 pitfalls should cover the most frequent mistakes (e.g. misunderstanding the problem, overlooking a constraint).
- Mid-level pitfalls should address implementation errors (e.g. off-by-one errors, incorrect loop bounds, wrong data structure choice).
- Higher-level pitfalls should address subtle issues (e.g. complexity traps, edge cases that break otherwise-correct solutions, integer overflow).
- Each pitfall should be specific to this problem, not generic advice like "test your code".
- Calibrate the subtlety of pitfalls to the problem's difficulty. Easier problems tend toward straightforward mistakes, while harder problems involve more nuanced traps like complexity issues or non-obvious edge cases.
- Write each pitfall in a direct, imperative voice that warns the candidate — for example: "Make sure you aren't...", "Double-check that...", "Don't assume...". Briefly explain why the mistake is wrong without revealing the correct solution approach.

Return valid JSON with this exact shape:
{
  "pitfalls": [
    { "level": number, "text": string }
  ]
}

Problem title: ${input.title}
Difficulty: ${input.difficulty}
Problem description:
${input.originalContent}
`;
}
