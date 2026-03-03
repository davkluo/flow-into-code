import { beforeEach, describe, expect, it, vi } from "vitest";

import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as generateSolutionsMod from "@/services/llm/generateSolutions";
import * as generateGradingCriteriaMod from "@/services/llm/generateGradingCriteria";
import { GENERATE_SOLUTIONS_PROMPT_VERSION } from "@/services/llm/prompts/generateSolutions";
import { GENERATE_GRADING_CRITERIA_PROMPT_VERSION } from "@/services/llm/prompts/generateGradingCriteria";
import { PROBLEM_SCHEMA_VERSION, ProblemDetails, ProcessingLayerMeta } from "@/types/problem";
import { getFeedbackData, generateFeedbackDataForProblem } from "@/services/feedbackData";

vi.mock("@/repositories/firestore/problemDetailsRepo");
vi.mock("@/repositories/firestore/problemRepo");
vi.mock("@/services/llm/generateSolutions");
vi.mock("@/services/llm/generateGradingCriteria");

// Fixtures
const completeSolutionsMeta: ProcessingLayerMeta = {
  status: "complete",
  updatedAt: 0,
  model: "gpt-4",
  promptVersion: GENERATE_SOLUTIONS_PROMPT_VERSION,
};

const completeGradingMeta: ProcessingLayerMeta = {
  status: "complete",
  updatedAt: 0,
  model: "gpt-4",
  promptVersion: GENERATE_GRADING_CRITERIA_PROMPT_VERSION,
};

const processingMeta: ProcessingLayerMeta = {
  status: "processing",
  updatedAt: 0,
};

const baseDetails: ProblemDetails = {
  titleSlug: "two-sum",
  source: { originalContent: "Given an array...", codeSnippets: {}, examples: [] },
  derived: {
    framing: { canonical: "Return indices of two numbers that add to target." },
    testCases: [{ input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" }],
    edgeCases: [{ input: "[3,3]\n6", expectedOutput: "[0,1]" }],
    solutions: [
      {
        approach: "Hash map",
        explanation: "...",
        algorithm: "...",
        tradeoffs: "...",
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
      },
    ],
    gradingCriteria: [
      { category: "problem_understanding", description: "...", rubric: "..." },
    ],
  },
  processingMeta: {
    schemaVersion: PROBLEM_SCHEMA_VERSION,
    layers: {
      solutions: completeSolutionsMeta,
      gradingCriteria: completeGradingMeta,
    },
  },
};

const mockProblem = {
  id: "1",
  titleSlug: "two-sum",
  title: "Two Sum",
  difficulty: "Easy" as const,
  isPaidOnly: false,
  topicTags: [],
};

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// getFeedbackData
// ---------------------------------------------------------------------------

describe("getFeedbackData", () => {
  it("returns not_found when details do not exist", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(null);
    expect(await getFeedbackData("two-sum")).toEqual({ status: "not_found" });
  });

  it("returns complete when all layers are up-to-date", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(baseDetails);
    const result = await getFeedbackData("two-sum");
    expect(result).toEqual({ status: "complete", data: baseDetails });
  });

  it("returns processing when any layer is processing", async () => {
    const details: ProblemDetails = {
      ...baseDetails,
      processingMeta: {
        schemaVersion: PROBLEM_SCHEMA_VERSION,
        layers: {
          solutions: processingMeta,
          gradingCriteria: completeGradingMeta,
        },
      },
    };
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(details);
    expect(await getFeedbackData("two-sum")).toEqual({ status: "processing" });
  });

  it("returns not_found when schema version is outdated", async () => {
    const details: ProblemDetails = {
      ...baseDetails,
      processingMeta: {
        schemaVersion: PROBLEM_SCHEMA_VERSION - 1,
        layers: {
          solutions: completeSolutionsMeta,
          gradingCriteria: completeGradingMeta,
        },
      },
    };
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(details);
    expect(await getFeedbackData("two-sum")).toEqual({ status: "not_found" });
  });

  it("returns not_found when a layer has an outdated prompt version", async () => {
    const details: ProblemDetails = {
      ...baseDetails,
      processingMeta: {
        schemaVersion: PROBLEM_SCHEMA_VERSION,
        layers: {
          solutions: { status: "complete", updatedAt: 0, model: "gpt-4", promptVersion: 0 },
          gradingCriteria: completeGradingMeta,
        },
      },
    };
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(details);
    expect(await getFeedbackData("two-sum")).toEqual({ status: "not_found" });
  });
});

// ---------------------------------------------------------------------------
// generateFeedbackDataForProblem
// ---------------------------------------------------------------------------

describe("generateFeedbackDataForProblem", () => {
  it("throws when the problem does not exist", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(null);
    await expect(generateFeedbackDataForProblem("unknown")).rejects.toThrow("Problem not found");
  });

  it("returns existing data when already_complete", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFeedbackLayers).mockResolvedValue({
      status: "already_complete",
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(baseDetails);

    const result = await generateFeedbackDataForProblem("two-sum");
    expect(result).toEqual(baseDetails);
    expect(generateSolutionsMod.generateSolutions).not.toHaveBeenCalled();
  });

  it("returns null when already_processing", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFeedbackLayers).mockResolvedValue({
      status: "already_processing",
    });
    expect(await generateFeedbackDataForProblem("two-sum")).toBeNull();
  });

  it("throws when originalContent is missing after claiming", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFeedbackLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["solutions", "gradingCriteria"],
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      source: { ...baseDetails.source, originalContent: "" },
    });
    await expect(generateFeedbackDataForProblem("two-sum")).rejects.toThrow(
      "Feedback data requires preview data",
    );
  });

  it("throws when framing is missing after claiming", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFeedbackLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["solutions", "gradingCriteria"],
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      derived: { ...baseDetails.derived, framing: undefined },
    });
    await expect(generateFeedbackDataForProblem("two-sum")).rejects.toThrow(
      "Feedback data requires preview data",
    );
  });

  it("throws when testCases are missing after claiming", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFeedbackLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["solutions", "gradingCriteria"],
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      derived: { ...baseDetails.derived, testCases: undefined },
    });
    await expect(generateFeedbackDataForProblem("two-sum")).rejects.toThrow(
      "Feedback data requires practice data",
    );
  });

  it("generates both layers when both are claimed", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFeedbackLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["solutions", "gradingCriteria"],
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValueOnce(baseDetails);
    vi.mocked(generateSolutionsMod.generateSolutions).mockResolvedValue({
      data: { solutions: baseDetails.derived!.solutions! },
      model: "gpt-4",
      promptVersion: GENERATE_SOLUTIONS_PROMPT_VERSION,
    });
    vi.mocked(generateGradingCriteriaMod.generateGradingCriteria).mockResolvedValue({
      data: { gradingCriteria: baseDetails.derived!.gradingCriteria! },
      model: "gpt-4",
      promptVersion: GENERATE_GRADING_CRITERIA_PROMPT_VERSION,
    });
    vi.mocked(problemDetailsRepo.updateDerived).mockResolvedValue(undefined);
    vi.mocked(problemDetailsRepo.updateProcessingMeta).mockResolvedValue(undefined);
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValueOnce(baseDetails);

    await generateFeedbackDataForProblem("two-sum");

    expect(generateSolutionsMod.generateSolutions).toHaveBeenCalledOnce();
    expect(generateGradingCriteriaMod.generateGradingCriteria).toHaveBeenCalledOnce();
  });

  it("skips solution generation and throws when gradingCriteria claimed but no existing solutions", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFeedbackLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["gradingCriteria"],
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      derived: { ...baseDetails.derived, solutions: [] },
    });
    await expect(generateFeedbackDataForProblem("two-sum")).rejects.toThrow(
      "no existing solutions found",
    );
    expect(generateSolutionsMod.generateSolutions).not.toHaveBeenCalled();
  });
});
