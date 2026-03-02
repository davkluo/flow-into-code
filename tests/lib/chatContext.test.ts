import { describe, expect, it, vi } from "vitest";
import {
  buildProblemContext,
  buildSnapshotContext,
  formatFieldKey,
  FIELD_LABELS,
} from "@/lib/chatContext";
import type { Problem, ProblemDetails } from "@/types/problem";

// practice.tsx contains JSX that requires React in scope — mock it to avoid
// loading JSX in the node test environment.
vi.mock("@/constants/practice.tsx", () => ({
  SECTION_ORDER: [
    "problem_understanding",
    "approach_and_reasoning",
    "algorithm_design",
    "implementation",
    "complexity_analysis",
  ],
  SECTION_KEY_TO_DETAILS: {
    problem_understanding: { title: "Understanding" },
    approach_and_reasoning: { title: "Approach & Reasoning" },
    algorithm_design: { title: "Algorithm Design" },
    implementation: { title: "Implementation" },
    complexity_analysis: { title: "Complexity Analysis" },
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: "1",
    title: "Two Sum",
    titleSlug: "two-sum",
    difficulty: "Easy",
    isPaidOnly: false,
    topicTags: [],
    ...overrides,
  };
}

function makeDetails(
  overrides: Partial<ProblemDetails> = {},
): ProblemDetails {
  return {
    titleSlug: "two-sum",
    source: {
      originalContent: "Given an array of integers...",
      codeSnippets: {},
      examples: [],
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// formatFieldKey
// ---------------------------------------------------------------------------

describe("formatFieldKey", () => {
  it("returns the mapped label for a known key", () => {
    expect(formatFieldKey("restatement")).toBe("Problem Restatement");
    expect(formatFieldKey("code")).toBe("Code");
    expect(formatFieldKey("timeComplexity")).toBe("Time Complexity");
  });

  it("every key in FIELD_LABELS resolves to its own label", () => {
    for (const [key, label] of Object.entries(FIELD_LABELS)) {
      expect(formatFieldKey(key)).toBe(label);
    }
  });

  it("converts an unknown camelCase key to Title Case", () => {
    expect(formatFieldKey("myCustomField")).toBe("My Custom Field");
  });

  it("handles a single lowercase word as a fallback", () => {
    expect(formatFieldKey("notes")).toBe("Notes");
  });
});

// ---------------------------------------------------------------------------
// buildProblemContext
// ---------------------------------------------------------------------------

describe("buildProblemContext", () => {
  it("always includes the safety preamble", () => {
    const result = buildProblemContext(makeProblem(), makeDetails());
    expect(result).toContain("system-generated");
    expect(result).toContain("Do not proactively reveal hints or pitfalls");
  });

  it("includes the problem title and LeetCode id", () => {
    const result = buildProblemContext(
      makeProblem({ id: "42", title: "Trapping Rain Water" }),
      makeDetails(),
    );
    expect(result).toContain("Trapping Rain Water (LeetCode #42)");
  });

  it("includes the original problem content", () => {
    const result = buildProblemContext(
      makeProblem(),
      makeDetails({
        source: { originalContent: "Find two numbers that add up to target.", codeSnippets: {}, examples: [] },
      }),
    );
    expect(result).toContain("Find two numbers that add up to target.");
  });

  it("omits Test Cases section when derived is absent", () => {
    const result = buildProblemContext(makeProblem(), makeDetails());
    expect(result).not.toContain("Test Cases:");
  });

  it("includes Test Cases section when present", () => {
    const result = buildProblemContext(
      makeProblem(),
      makeDetails({
        derived: {
          testCases: [{ input: "[2,7,11,15], 9", expectedOutput: "[0,1]" }],
        },
      }),
    );
    expect(result).toContain("Test Cases:");
    expect(result).toContain("Input: [2,7,11,15], 9 → Expected: [0,1]");
  });

  it("includes optional description and explanation lines for test cases", () => {
    const result = buildProblemContext(
      makeProblem(),
      makeDetails({
        derived: {
          testCases: [
            {
              input: "[2,7], 9",
              expectedOutput: "[0,1]",
              description: "Basic case",
              explanation: "2+7=9",
            },
          ],
        },
      }),
    );
    expect(result).toContain("Description: Basic case");
    expect(result).toContain("Explanation: 2+7=9");
  });

  it("includes Edge Cases section when present", () => {
    const result = buildProblemContext(
      makeProblem(),
      makeDetails({
        derived: {
          edgeCases: [{ input: "[], 0", expectedOutput: "[]" }],
        },
      }),
    );
    expect(result).toContain("Edge Cases:");
    expect(result).toContain("Input: [], 0 → Expected: []");
  });

  it("includes hints sorted by level from least to most specific", () => {
    const result = buildProblemContext(
      makeProblem(),
      makeDetails({
        derived: {
          hints: [
            { level: 3, text: "Use a hash map for O(1) lookup." },
            { level: 1, text: "Think about what the complement is." },
            { level: 2, text: "Store values you have seen." },
          ],
        },
      }),
    );
    expect(result).toContain(
      "Hints (ordered from least to most specific",
    );
    const hintsStart = result.indexOf("Hints");
    const hint1Pos = result.indexOf("Think about what the complement is.", hintsStart);
    const hint2Pos = result.indexOf("Store values you have seen.", hintsStart);
    const hint3Pos = result.indexOf("Use a hash map for O(1) lookup.", hintsStart);
    expect(hint1Pos).toBeLessThan(hint2Pos);
    expect(hint2Pos).toBeLessThan(hint3Pos);
  });

  it("includes pitfalls sorted by level", () => {
    const result = buildProblemContext(
      makeProblem(),
      makeDetails({
        derived: {
          pitfalls: [
            { level: 2, text: "Don't forget duplicates." },
            { level: 1, text: "Integer overflow is possible." },
          ],
        },
      }),
    );
    expect(result).toContain("Common Pitfalls:");
    const pitfallsStart = result.indexOf("Common Pitfalls:");
    const p1Pos = result.indexOf("Integer overflow is possible.", pitfallsStart);
    const p2Pos = result.indexOf("Don't forget duplicates.", pitfallsStart);
    expect(p1Pos).toBeLessThan(p2Pos);
  });

  it("omits Hints section when hints array is empty", () => {
    const result = buildProblemContext(
      makeProblem(),
      makeDetails({ derived: { hints: [] } }),
    );
    expect(result).not.toContain("Hints");
  });
});

// ---------------------------------------------------------------------------
// buildSnapshotContext
// ---------------------------------------------------------------------------

describe("buildSnapshotContext", () => {
  it("returns an empty string when no sections are provided", () => {
    expect(buildSnapshotContext({})).toBe("");
  });

  it("returns an empty string when all fields in the snapshot are empty", () => {
    expect(
      buildSnapshotContext({
        problem_understanding: {
          snapshots: [{ data: { restatement: "", inputsOutputs: "  " } }],
        },
      }),
    ).toBe("");
  });

  it("returns an empty string when a section has no snapshots", () => {
    expect(
      buildSnapshotContext({
        problem_understanding: { snapshots: [] },
      }),
    ).toBe("");
  });

  it("includes the candidate notes preamble when content is present", () => {
    const result = buildSnapshotContext({
      problem_understanding: {
        snapshots: [{ data: { restatement: "Find two indices." } }],
      },
    });
    expect(result).toContain("typed by the candidate");
  });

  it("formats a known field key with its label", () => {
    const result = buildSnapshotContext({
      problem_understanding: {
        snapshots: [{ data: { restatement: "Find two indices." } }],
      },
    });
    expect(result).toContain("Problem Restatement: Find two indices.");
  });

  it("omits empty fields within a snapshot", () => {
    const result = buildSnapshotContext({
      problem_understanding: {
        snapshots: [
          { data: { restatement: "Find two indices.", inputsOutputs: "" } },
        ],
      },
    });
    expect(result).toContain("Problem Restatement:");
    expect(result).not.toContain("Inputs & Outputs:");
  });

  it("uses the section title as the block header", () => {
    const result = buildSnapshotContext({
      complexity_analysis: {
        snapshots: [{ data: { timeComplexity: "O(n)", spaceComplexity: "O(1)" } }],
      },
    });
    expect(result).toContain("Complexity Analysis:");
  });

  it("uses the last snapshot when multiple are present", () => {
    const result = buildSnapshotContext({
      problem_understanding: {
        snapshots: [
          { data: { restatement: "Old restatement." } },
          { data: { restatement: "Updated restatement." } },
        ],
      },
    });
    expect(result).toContain("Updated restatement.");
    expect(result).not.toContain("Old restatement.");
  });

  it("outputs sections in SECTION_ORDER regardless of object key order", () => {
    const result = buildSnapshotContext({
      complexity_analysis: {
        snapshots: [{ data: { timeComplexity: "O(n)" } }],
      },
      problem_understanding: {
        snapshots: [{ data: { restatement: "Find two indices." } }],
      },
    });
    const understandingPos = result.indexOf("Understanding:");
    const complexityPos = result.indexOf("Complexity Analysis:");
    expect(understandingPos).toBeLessThan(complexityPos);
  });
});