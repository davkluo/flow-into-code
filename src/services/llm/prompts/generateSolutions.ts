import { Framing, TestCase } from "@/types/problem";

export const GENERATE_SOLUTIONS_PROMPT_VERSION = 3;

export interface GenerateSolutionsPromptInput {
  title: string;
  difficulty: string;
  originalContent: string;
  framing: Framing;
  testCases: TestCase[];
  edgeCases: TestCase[];
}

function formatTestCases(cases: TestCase[]): string {
  return cases
    .map((tc, i) => {
      const lines = [
        `  ${i + 1}. Input: ${tc.input} → Expected: ${tc.expectedOutput}`,
      ];
      if (tc.description) lines.push(`     (${tc.description})`);
      if (tc.explanation) lines.push(`     Why: ${tc.explanation}`);
      return lines.join("\n");
    })
    .join("\n");
}

export function buildGenerateSolutionsPrompt(
  input: GenerateSolutionsPromptInput,
): string {
  return `
You are generating reference solutions for a coding interview problem. This data will be used to evaluate candidates' performance after their session.

Real-world framing of the problem:
${input.framing.canonical}

Use the terminology and context from this framing consistently throughout your output — do not mix in wording from other framings or generic algorithm descriptions.

Test cases:
${formatTestCases(input.testCases)}

Edge cases:
${formatTestCases(input.edgeCases)}

---

Generate 2–3 solutions ordered from least to most optimal (e.g. brute force → optimal, or O(n²) → O(n)). For each solution:

- **approach**: A short label (e.g. "Brute Force", "Hash Map", "Two Pointers")
- **explanation**: 2–4 sentences explaining the idea, why it works, and when you'd use it. Use the real-world framing's terminology.
- **algorithm**: Step-by-step algorithm using actual newlines and indentation to suggest code structure. Use code-like conventions ("for each", "if", "return", nested indentation for loops and conditions) without writing actual code. The string MUST use \\n for line breaks and leading spaces for indentation — do not write it as a single run-on sentence. Example of correct formatting: "initialize empty map seen\\nfor i from 0 to len(nums) - 1:\\n    complement = target - nums[i]\\n    if complement in seen:\\n        return [seen[complement], i]\\n    seen[nums[i]] = i"
- **tradeoffs**: Key tradeoffs vs. alternative approaches (readability, memory, edge case handling)
- **timeComplexity**: Big-O time complexity with brief justification (e.g. "O(n) — single pass through the array")
- **spaceComplexity**: Big-O space complexity with brief justification

---

Return valid JSON with this exact shape:
{
  "solutions": [
    {
      "approach": string,
      "explanation": string,
      "algorithm": string,
      "tradeoffs": string,
      "timeComplexity": string,
      "spaceComplexity": string
    }
  ]
}

Problem title: ${input.title}
Difficulty: ${input.difficulty}
Problem description:
${input.originalContent}
`;
}
