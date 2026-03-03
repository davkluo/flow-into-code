import { beforeEach, describe, expect, it, vi } from "vitest";

import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as lcClient from "@/services/leetcode/client";
import * as extractExamplesMod from "@/services/llm/extractExamples";
import * as generateFramingMod from "@/services/llm/generateFraming";
import * as formatting from "@/lib/formatting";
import { GENERATE_FRAMING_PROMPT_VERSION } from "@/services/llm/prompts/generateFraming";
import { PROBLEM_SCHEMA_VERSION, ProblemDetails, ProcessingLayerMeta } from "@/types/problem";
import { getPreviewData, generatePreviewData } from "@/services/previewData";

vi.mock("@/repositories/firestore/problemDetailsRepo");
vi.mock("@/repositories/firestore/problemRepo");
vi.mock("@/services/leetcode/client");
vi.mock("@/services/llm/extractExamples");
vi.mock("@/services/llm/generateFraming");
vi.mock("@/lib/formatting");

const completeFramingMeta: ProcessingLayerMeta = {
  status: "complete",
  updatedAt: 0,
  model: "gpt-4",
  promptVersion: GENERATE_FRAMING_PROMPT_VERSION,
};

const processingFramingMeta: ProcessingLayerMeta = {
  status: "processing",
  updatedAt: 0,
};

const mockFraming = { canonical: "Return indices of two numbers that add to target." };

const baseDetails: ProblemDetails = {
  titleSlug: "two-sum",
  source: { originalContent: "Given an array...", codeSnippets: {}, examples: [] },
  derived: { framing: mockFraming },
  processingMeta: {
    schemaVersion: PROBLEM_SCHEMA_VERSION,
    layers: { framing: completeFramingMeta },
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
// getPreviewData
// ---------------------------------------------------------------------------

describe("getPreviewData", () => {
  it("returns not_found when details do not exist", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(null);
    expect(await getPreviewData("two-sum")).toEqual({ status: "not_found" });
  });

  it("returns complete when framing is up-to-date", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(baseDetails);
    expect(await getPreviewData("two-sum")).toEqual({ status: "complete", data: baseDetails });
  });

  it("returns processing when framing is processing", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      processingMeta: {
        schemaVersion: PROBLEM_SCHEMA_VERSION,
        layers: { framing: processingFramingMeta },
      },
    });
    expect(await getPreviewData("two-sum")).toEqual({ status: "processing" });
  });

  it("returns not_found when schema version is outdated", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      processingMeta: {
        schemaVersion: PROBLEM_SCHEMA_VERSION - 1,
        layers: { framing: completeFramingMeta },
      },
    });
    expect(await getPreviewData("two-sum")).toEqual({ status: "not_found" });
  });

  it("returns not_found when framing prompt version is outdated", async () => {
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      processingMeta: {
        schemaVersion: PROBLEM_SCHEMA_VERSION,
        layers: {
          framing: { status: "complete", updatedAt: 0, model: "gpt-4", promptVersion: 0 },
        },
      },
    });
    expect(await getPreviewData("two-sum")).toEqual({ status: "not_found" });
  });
});

// ---------------------------------------------------------------------------
// generatePreviewData
// ---------------------------------------------------------------------------

describe("generatePreviewData", () => {
  it("throws when the problem does not exist", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(null);
    await expect(generatePreviewData("unknown")).rejects.toThrow("Problem not found");
  });

  it("returns null when already_processing", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFramingGeneration).mockResolvedValue({
      status: "already_processing",
    });
    expect(await generatePreviewData("two-sum")).toBeNull();
  });

  it("returns existing data when already_complete", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFramingGeneration).mockResolvedValue({
      status: "already_complete",
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(baseDetails);

    const result = await generatePreviewData("two-sum");
    expect(result).toEqual(baseDetails);
    expect(generateFramingMod.generateFraming).not.toHaveBeenCalled();
  });

  it("fetches LC content, generates framing, and persists when claimed", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFramingGeneration).mockResolvedValue({
      status: "claimed",
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(null);
    vi.mocked(lcClient.fetchLCProblemContent).mockResolvedValue("<p>Given an array...</p>");
    vi.mocked(lcClient.fetchLCProblemCodeSnippets).mockResolvedValue({ python3: "class Solution:" });
    vi.mocked(formatting.stripHtml).mockReturnValue("Given an array...");
    vi.mocked(extractExamplesMod.extractExamples).mockResolvedValue({
      data: [],
      model: "gpt-4",
      promptVersion: 1,
    });
    vi.mocked(generateFramingMod.generateFraming).mockResolvedValue({
      data: mockFraming,
      model: "gpt-4",
      promptVersion: GENERATE_FRAMING_PROMPT_VERSION,
    });
    vi.mocked(problemDetailsRepo.updateSource).mockResolvedValue(undefined);
    vi.mocked(problemDetailsRepo.updateDerived).mockResolvedValue(undefined);
    vi.mocked(problemDetailsRepo.updateProcessingMeta).mockResolvedValue(undefined);

    const result = await generatePreviewData("two-sum");

    expect(lcClient.fetchLCProblemContent).toHaveBeenCalledWith("two-sum");
    expect(generateFramingMod.generateFraming).toHaveBeenCalledOnce();
    expect(problemDetailsRepo.updateDerived).toHaveBeenCalledWith("two-sum", { framing: mockFraming });
    expect(result).toMatchObject({ derived: { framing: mockFraming } });
  });

  it("uses cached originalContent and snippets when already present", async () => {
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.claimFramingGeneration).mockResolvedValue({
      status: "claimed",
    });
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...baseDetails,
      source: {
        originalContent: "Given an array...",
        codeSnippets: { python3: "class Solution:" },
        examples: [],
      },
    });
    vi.mocked(formatting.stripHtml).mockReturnValue("Given an array...");
    vi.mocked(extractExamplesMod.extractExamples).mockResolvedValue({
      data: [],
      model: "gpt-4",
      promptVersion: 1,
    });
    vi.mocked(generateFramingMod.generateFraming).mockResolvedValue({
      data: mockFraming,
      model: "gpt-4",
      promptVersion: GENERATE_FRAMING_PROMPT_VERSION,
    });
    vi.mocked(problemDetailsRepo.updateSource).mockResolvedValue(undefined);
    vi.mocked(problemDetailsRepo.updateDerived).mockResolvedValue(undefined);
    vi.mocked(problemDetailsRepo.updateProcessingMeta).mockResolvedValue(undefined);

    await generatePreviewData("two-sum");

    expect(lcClient.fetchLCProblemContent).not.toHaveBeenCalled();
    expect(lcClient.fetchLCProblemCodeSnippets).not.toHaveBeenCalled();
  });
});
