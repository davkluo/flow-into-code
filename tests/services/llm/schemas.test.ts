import { describe, expect, it, vi } from "vitest";
import { ExamplesSchema } from "@/services/llm/extractExamples";
import { TestCaseSchema } from "@/services/llm/generateCases";
import { FramingSchema } from "@/services/llm/generateFraming";
import { GradingCriterionSchema } from "@/services/llm/generateGradingCriteria";
import { HintsSchema } from "@/services/llm/generateHints";
import { PitfallsSchema } from "@/services/llm/generatePitfalls";
import { CategoryFeedbackSchema } from "@/services/llm/generateSessionFeedback";
import { SolutionSchema } from "@/services/llm/generateSolutions";

// practice.tsx contains JSX that can't be transformed in the node test environment.
vi.mock("@/constants/practice", () => ({}));

// ---------------------------------------------------------------------------
// CategoryFeedbackSchema — score nullable with "null" string coercion
// ---------------------------------------------------------------------------

describe("CategoryFeedbackSchema", () => {
  const base = { comments: "", compliments: "", advice: "" };

  it("accepts a numeric score", () => {
    expect(CategoryFeedbackSchema.parse({ ...base, score: 8 }).score).toBe(8);
  });

  it("accepts null score", () => {
    expect(
      CategoryFeedbackSchema.parse({ ...base, score: null }).score,
    ).toBeNull();
  });

  it('coerces string "null" score to null', () => {
    expect(
      CategoryFeedbackSchema.parse({ ...base, score: "null" }).score,
    ).toBeNull();
  });

  it("rejects arbitrary string scores", () => {
    expect(() =>
      CategoryFeedbackSchema.parse({ ...base, score: "high" }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// FramingSchema — nullable backend/systems, no "null" string transform
// ---------------------------------------------------------------------------

describe("FramingSchema", () => {
  it("parses a full framing with all optional fields", () => {
    const result = FramingSchema.parse({
      canonical: "Return indices of two numbers that add to target.",
      backend: "Use a hash map for O(n) lookups.",
      systems: null,
    });
    expect(result.canonical).toBe(
      "Return indices of two numbers that add to target.",
    );
    expect(result.backend).toBe("Use a hash map for O(n) lookups.");
    expect(result.systems).toBeNull();
  });

  it("parses when all nullable fields are null", () => {
    const result = FramingSchema.parse({
      canonical: "Some framing.",
      backend: null,
      systems: null,
    });
    expect(result.backend).toBeNull();
    expect(result.systems).toBeNull();
  });

  it("throws when canonical is missing", () => {
    expect(() =>
      FramingSchema.parse({ backend: null, systems: null }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ExamplesSchema — nullable explanation per item
// ---------------------------------------------------------------------------

describe("ExamplesSchema", () => {
  it("parses examples with and without explanations", () => {
    const result = ExamplesSchema.parse({
      examples: [
        {
          input: "[2,7,11,15], target=9",
          output: "[0,1]",
          explanation: "2+7=9",
        },
        { input: "[3,2,4], target=6", output: "[1,2]", explanation: null },
      ],
    });
    expect(result.examples).toHaveLength(2);
    expect(result.examples[0].explanation).toBe("2+7=9");
    expect(result.examples[1].explanation).toBeNull();
  });

  it("throws when input or output is missing from an example", () => {
    expect(() =>
      ExamplesSchema.parse({
        examples: [{ output: "[0,1]", explanation: null }],
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// TestCaseSchema — nullable description and explanation
// ---------------------------------------------------------------------------

describe("TestCaseSchema", () => {
  it("parses a full test case", () => {
    const result = TestCaseSchema.parse({
      input: "nums=[2,7], target=9",
      expectedOutput: "[0,1]",
      description: "Basic case",
      explanation: "2+7=9",
    });
    expect(result.input).toBe("nums=[2,7], target=9");
    expect(result.description).toBe("Basic case");
  });

  it("accepts null for optional fields", () => {
    const result = TestCaseSchema.parse({
      input: "nums=[2,7], target=9",
      expectedOutput: "[0,1]",
      description: null,
      explanation: null,
    });
    expect(result.description).toBeNull();
    expect(result.explanation).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// GradingCriterionSchema — enum constraint on category
// ---------------------------------------------------------------------------

describe("GradingCriterionSchema", () => {
  it("works for a valid category", () => {
    const base = { description: "desc", rubric: "rubric" };
    const validCriterion = {
      ...base,
      category: "approach_and_reasoning" as const,
    };
    const result = GradingCriterionSchema.parse(validCriterion);
    expect(result.category).toBe("approach_and_reasoning");

    const anotherValidCriterion = {
      ...base,
      category: "implementation" as const,
    };
    const anotherResult = GradingCriterionSchema.parse(anotherValidCriterion);
    expect(anotherResult.category).toBe("implementation");
  });

  it("throws for an invalid category", () => {
    const base = { description: "desc", rubric: "rubric" };
    const invalidCriterion = {
      ...base,
      category: "communication",
    };
    expect(() => GradingCriterionSchema.parse(invalidCriterion)).toThrow();
  });

  it("throws for missing description", () => {
    const invalidCriterion = {
      category: "problem_understanding" as const,
      rubric: "rubric",
    };
    expect(() => GradingCriterionSchema.parse(invalidCriterion)).toThrow();
  });

  it("throws for missing rubric", () => {
    const invalidCriterion = {
      category: "problem_understanding" as const,
      description: "desc",
    };
    expect(() => GradingCriterionSchema.parse(invalidCriterion)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// SolutionSchema — all required strings, no nulls
// ---------------------------------------------------------------------------

describe("SolutionSchema", () => {
  const validSolution = {
    approach: "Hash Map",
    explanation: "Store each number and check complement.",
    algorithm: "Iterate array, look up target - current in map.",
    tradeoffs: "O(n) space for O(n) time.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
  };

  it("parses a complete solution", () => {
    const result = SolutionSchema.parse(validSolution);
    expect(result.approach).toBe("Hash Map");
    expect(result.timeComplexity).toBe("O(n)");
  });

  it("throws when a required field is missing", () => {
    expect(() =>
      SolutionSchema.parse({ ...validSolution, timeComplexity: undefined }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// HintsSchema / PitfallsSchema — array of { level, text }
// ---------------------------------------------------------------------------

describe("HintsSchema", () => {
  it("parses a list of hints", () => {
    const result = HintsSchema.parse({
      hints: [
        {
          level: 1,
          text: "Think about what data structure allows O(1) lookup.",
        },
        { level: 2, text: "A hash map stores number → index." },
      ],
    });
    expect(result.hints).toHaveLength(2);
    expect(result.hints[0].level).toBe(1);
  });

  it("parses an empty hints array", () => {
    expect(HintsSchema.parse({ hints: [] }).hints).toHaveLength(0);
  });
});

describe("PitfallsSchema", () => {
  it("parses a list of pitfalls", () => {
    const result = PitfallsSchema.parse({
      pitfalls: [{ level: 1, text: "Don't use the same element twice." }],
    });
    expect(result.pitfalls[0].text).toBe("Don't use the same element twice.");
  });
});
