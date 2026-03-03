import { beforeEach, describe, expect, it, vi } from "vitest";

import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as generateCasesMod from "@/services/llm/generateCases";
import * as generateHintsMod from "@/services/llm/generateHints";
import * as generatePitfallsMod from "@/services/llm/generatePitfalls";
import { GENERATE_CASES_PROMPT_VERSION } from "@/services/llm/prompts/generateCases";
import { GENERATE_HINTS_PROMPT_VERSION } from "@/services/llm/prompts/generateHints";
import { GENERATE_PITFALLS_PROMPT_VERSION } from "@/services/llm/prompts/generatePitfalls";
import { PROBLEM_SCHEMA_VERSION, ProblemDetails, ProcessingLayerMeta } from "@/types/problem";
import { getPracticeData, generatePracticeData } from "@/services/practiceData";

vi.mock("@/repositories/firestore/problemDetailsRepo");
vi.mock("@/repositories/firestore/problemRepo");
vi.mock("@/services/llm/generateCases");
vi.mock("@/services/llm/generateHints");
vi.mock("@/services/llm/generatePitfalls");

// Fixtures
const completeCasesMeta: ProcessingLayerMeta = {
  status: "complete",
  updatedAt: 0,
  model: "gpt-4",
  promptVersion: GENERATE_CASES_PROMPT_VERSION,
};

const completeHintsMeta: ProcessingLayerMeta = {
  status: "complete",
  updatedAt: 0,
  model: "gpt-4",
  promptVersion: GENERATE_HINTS_PROMPT_VERSION,
};

const completePitfallsMeta: ProcessingLayerMeta = {
  status: "complete",
  updatedAt: 0,
  model: "gpt-4",
  promptVersion: GENERATE_PITFALLS_PROMPT_VERSION,
};

const processingMeta: ProcessingLayerMeta = { status: "processing", updatedAt: 0 };

const baseDetails: ProblemDetails = {
  titleSlug: "two-sum",
  source: {
    originalContent: "Given an array...",
    codeSnippets: {},
    examples: [],
  },
  derived: {
    framing: { canonical: "Return indices." },
    testCases: [{ input: "[2,7,11,15]\n9", expectedOutput: "[0,1]" }],
    edgeCases: [{ input: "[3,3]\n6", expectedOutput: "[0,1]" }],
    hints: [{ level: 1, text: "Try a hash map." }],
    pitfalls: [{ level: 1, text: "Watch for duplicates." }],
  },
  processingMeta: {
    schemaVersion: PROBLEM_SCHEMA_VERSION,
    layers: {
      testCases: completeCasesMeta,
      edgeCases: completeCasesMeta,
      hints: completeHintsMeta,
      pitfalls: completePitfallsMeta,
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
// getPracticeData
// ---------------------------------------------------------------------------

describe("getPracticeData", () => {
  it("returns not_found when details do not exist", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(null);
    expect(await getPracticeData("two-sum")).toEqual({ status: "not_found" });
  });

  it("returns complete when all layers are up-to-date", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(baseDetails);
    expect(await getPracticeData("two-sum")).toEqual({ status: "complete", data: baseDetails });
  });

  it("returns processing when any layer is processing", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      processingMeta: {
        schemaVersion: PROBLEM_SCHEMA_VERSION,
        layers: {
          testCases: processingMeta,
          edgeCases: completeCasesMeta,
          hints: completeHintsMeta,
          pitfalls: completePitfallsMeta,
        },
      },
    });
    expect(await getPracticeData("two-sum")).toEqual({ status: "processing" });
  });

  it("returns not_found when schema version is outdated", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      processingMeta: {
        schemaVersion: PROBLEM_SCHEMA_VERSION - 1,
        layers: {
          testCases: completeCasesMeta,
          edgeCases: completeCasesMeta,
          hints: completeHintsMeta,
          pitfalls: completePitfallsMeta,
        },
      },
    });
    expect(await getPracticeData("two-sum")).toEqual({ status: "not_found" });
  });
});

// ---------------------------------------------------------------------------
// generatePracticeData
// ---------------------------------------------------------------------------

describe("generatePracticeData", () => {
  it("throws when the problem does not exist", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(null);
    await expect(generatePracticeData("unknown")).rejects.toThrow("Problem not found");
  });

  it("returns null when already_processing", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimPracticeLayers).mockResolvedValue({
      status: "already_processing",
    });
    expect(await generatePracticeData("two-sum")).toBeNull();
  });

  it("returns existing data when already_complete", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimPracticeLayers).mockResolvedValue({
      status: "already_complete",
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(baseDetails);

    const result = await generatePracticeData("two-sum");
    expect(result).toEqual(baseDetails);
    expect(generateCasesMod.generateCases).not.toHaveBeenCalled();
  });

  it("throws when originalContent is missing", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimPracticeLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["testCases", "edgeCases", "hints", "pitfalls"],
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      source: { ...baseDetails.source, originalContent: "" },
    });
    await expect(generatePracticeData("two-sum")).rejects.toThrow(
      "Practice data requires preview data",
    );
  });

  it("throws when framing is missing", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimPracticeLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["testCases"],
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      derived: { ...baseDetails.derived, framing: undefined },
    });
    await expect(generatePracticeData("two-sum")).rejects.toThrow(
      "Practice data requires preview data",
    );
  });

  it("generates cases, hints, and pitfalls when all layers are claimed", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimPracticeLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["testCases", "edgeCases", "hints", "pitfalls"],
    });
    vi.mocked(problemDetailsRepo.getBySlug)
      .mockResolvedValueOnce(baseDetails)
      .mockResolvedValueOnce(baseDetails);
    vi.mocked(generateCasesMod.generateCases).mockResolvedValue({
      data: { testCases: baseDetails.derived!.testCases!, edgeCases: baseDetails.derived!.edgeCases! },
      model: "gpt-4",
      promptVersion: GENERATE_CASES_PROMPT_VERSION,
    });
    vi.mocked(generateHintsMod.generateHints).mockResolvedValue({
      data: baseDetails.derived!.hints!,
      model: "gpt-4",
      promptVersion: GENERATE_HINTS_PROMPT_VERSION,
    });
    vi.mocked(generatePitfallsMod.generatePitfalls).mockResolvedValue({
      data: baseDetails.derived!.pitfalls!,
      model: "gpt-4",
      promptVersion: GENERATE_PITFALLS_PROMPT_VERSION,
    });
    vi.mocked(problemDetailsRepo.updateDerived).mockResolvedValue(undefined);
    vi.mocked(problemDetailsRepo.updateProcessingMeta).mockResolvedValue(undefined);

    await generatePracticeData("two-sum");

    expect(generateCasesMod.generateCases).toHaveBeenCalledOnce();
    expect(generateHintsMod.generateHints).toHaveBeenCalledOnce();
    expect(generatePitfallsMod.generatePitfalls).toHaveBeenCalledOnce();
  });

  it("generates only hints when only hints layer is claimed", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimPracticeLayers).mockResolvedValue({
      status: "claimed",
      claimedLayers: ["hints"],
    });
    vi.mocked(problemDetailsRepo.getBySlug)
      .mockResolvedValueOnce(baseDetails)
      .mockResolvedValueOnce(baseDetails);
    vi.mocked(generateHintsMod.generateHints).mockResolvedValue({
      data: baseDetails.derived!.hints!,
      model: "gpt-4",
      promptVersion: GENERATE_HINTS_PROMPT_VERSION,
    });
    vi.mocked(problemDetailsRepo.updateDerived).mockResolvedValue(undefined);
    vi.mocked(problemDetailsRepo.updateProcessingMeta).mockResolvedValue(undefined);

    await generatePracticeData("two-sum");

    expect(generateCasesMod.generateCases).not.toHaveBeenCalled();
    expect(generateHintsMod.generateHints).toHaveBeenCalledOnce();
    expect(generatePitfallsMod.generatePitfalls).not.toHaveBeenCalled();
  });
});
