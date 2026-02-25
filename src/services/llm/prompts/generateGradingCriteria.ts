import { Framing, ProblemSolution, TestCase } from "@/types/problem";

export const GENERATE_GRADING_CRITERIA_PROMPT_VERSION = 3;

export interface GenerateGradingCriteriaPromptInput {
  title: string;
  difficulty: string;
  originalContent: string;
  framing: Framing;
  testCases: TestCase[];
  edgeCases: TestCase[];
  solutions: ProblemSolution[];
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

function formatSolutions(solutions: ProblemSolution[]): string {
  return solutions
    .map(
      (s, i) => `  ${i + 1}. ${s.approach}
     Time: ${s.timeComplexity}
     Space: ${s.spaceComplexity}
     Explanation: ${s.explanation}
     Tradeoffs: ${s.tradeoffs}`,
    )
    .join("\n\n");
}

export function buildGenerateGradingCriteriaPrompt(
  input: GenerateGradingCriteriaPromptInput,
): string {
  return `
You are generating grading criteria for a coding interview problem. This data will be used to evaluate candidates' performance after their session.

Real-world framing of the problem:
${input.framing.canonical}

Use the terminology and context from this framing consistently throughout your output — do not mix in wording from other framings or generic algorithm descriptions.

Test cases:
${formatTestCases(input.testCases)}

Edge cases:
${formatTestCases(input.edgeCases)}

Reference solutions (ordered least to most optimal):
${formatSolutions(input.solutions)}

---

Use the reference solutions above to understand what data structures, algorithmic insights, and complexity targets are relevant to this problem. Let them inform what "good" looks like — but do not treat any single solution as the required destination for an excellent score. A candidate who arrives at a different valid approach, or who makes well-reasoned tradeoffs that diverge from the reference, can still earn a 5. Excellent performance means demonstrating understanding and clear reasoning, not matching a predetermined answer.

Generate exactly 5 grading criteria — one per interview section. Each criterion must be specific to this problem, not a generic template. For each criterion:

- **category**: The section key (must be one of the exact strings listed below)
- **description**: What a strong candidate demonstrates in this section for this specific problem (2–3 sentences). Use the real-world framing's terminology.
- **rubric**: Two parts:
  1. Anchor scores: what earns 1 (poor), 3 (adequate), and 5 (excellent) for this specific problem. Reference the concrete data structures, insights, or steps relevant to this problem. For the 5 anchor, describe what strong understanding and reasoning looks like rather than prescribing a single solution.
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
