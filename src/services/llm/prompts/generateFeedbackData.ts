import { Framing, TestCase } from "@/types/problem";

export const GENERATE_FEEDBACK_DATA_PROMPT_VERSION = 2;

export interface GenerateFeedbackDataPromptInput {
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

export function buildGenerateFeedbackDataPrompt(
  input: GenerateFeedbackDataPromptInput,
): string {
  return `
You are generating reference solutions and grading criteria for a coding interview problem. This data will be used to evaluate candidates' performance after their session.

Real-world framing of the problem:
${input.framing.canonical}

Use the terminology and context from this framing consistently throughout your output — do not mix in wording from other framings or generic algorithm descriptions.

Test cases:
${formatTestCases(input.testCases)}

Edge cases:
${formatTestCases(input.edgeCases)}

---

## Task 1: Reference Solutions

Generate 2–3 solutions ordered from least to most optimal (e.g. brute force → optimal, or O(n²) → O(n)). For each solution:

- **approach**: A short label (e.g. "Brute Force", "Hash Map", "Two Pointers")
- **explanation**: 2–4 sentences explaining the idea, why it works, and when you'd use it. Use the real-world framing's terminology.
- **algorithm**: Step-by-step algorithm using actual newlines and indentation to suggest code structure. Use code-like conventions ("for each", "if", "return", nested indentation for loops and conditions) without writing actual code. The string MUST use \\n for line breaks and leading spaces for indentation — do not write it as a single run-on sentence. Example of correct formatting: "initialize empty map seen\\nfor i from 0 to len(nums) - 1:\\n    complement = target - nums[i]\\n    if complement in seen:\\n        return [seen[complement], i]\\n    seen[nums[i]] = i"
- **tradeoffs**: Key tradeoffs vs. alternative approaches (readability, memory, edge case handling)
- **timeComplexity**: Big-O time complexity with brief justification (e.g. "O(n) — single pass through the array")
- **spaceComplexity**: Big-O space complexity with brief justification

## Task 2: Grading Criteria

Generate exactly 5 grading criteria — one per interview section. Each criterion must be specific to this problem, not a generic template. For each criterion:

- **category**: The section key (must be one of the exact strings listed below)
- **description**: What a strong candidate demonstrates in this section for this specific problem (2–3 sentences). Use the real-world framing's terminology.
- **rubric**: Two parts:
  1. Anchor scores: what earns 1 (poor), 3 (adequate), and 5 (excellent) for this specific problem. Reference the concrete data structures, insights, or steps relevant to this problem.
  2. Adjustment rules: a list of problem-specific rules for common mistakes or standout moments that allow fractional scoring between anchors. Format each as a short label followed by a point delta (e.g. "Off-by-one in boundary check: −0.5", "Catches empty input edge case unprompted: +0.5", "Confuses time and space complexity: −1"). Aim for 3–6 rules that are genuinely likely to occur on this problem.

The five section keys are (use these exact strings):
- "problem_understanding" — Did the candidate ask the right clarifying questions? Did they correctly identify the input/output contract, constraints, and edge cases?
- "approach_and_reasoning" — Did the candidate explain their strategy clearly? Did they consider multiple approaches and articulate tradeoffs?
- "algorithm_design" — Did the candidate produce correct, complete pseudocode? Were edge cases handled?
- "implementation" — Was the code correct and clean? Did the candidate handle errors and edge cases?
- "complexity_analysis" — Did the candidate correctly derive (not just state) the time and space complexity?

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
  ],
  "gradingCriteria": [
    {
      "category": string,
      "description": string,
      "rubric": string
    }
  ]
}

Problem title: ${input.title}
Difficulty: ${input.difficulty}
Problem description:
${input.originalContent}
`;
}
