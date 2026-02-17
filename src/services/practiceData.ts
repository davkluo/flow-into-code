import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import { PracticeLayer } from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { generateCases } from "@/services/llm/generateCases";
import { generateHints } from "@/services/llm/generateHints";
import { generatePitfalls } from "@/services/llm/generatePitfalls";
import { GENERATE_CASES_PROMPT_VERSION } from "@/services/llm/prompts/generateCases";
import { GENERATE_HINTS_PROMPT_VERSION } from "@/services/llm/prompts/generateHints";
import { GENERATE_PITFALLS_PROMPT_VERSION } from "@/services/llm/prompts/generatePitfalls";
import {
  PROBLEM_SCHEMA_VERSION,
  ProblemDetails,
  ProcessingLayerMeta,
  ProcessingResult,
} from "@/types/problem";

const PRACTICE_LAYERS: PracticeLayer[] = [
  "testCases",
  "edgeCases",
  "hints",
  "pitfalls",
];

const PROMPT_VERSIONS: Record<PracticeLayer, number> = {
  testCases: GENERATE_CASES_PROMPT_VERSION,
  edgeCases: GENERATE_CASES_PROMPT_VERSION,
  hints: GENERATE_HINTS_PROMPT_VERSION,
  pitfalls: GENERATE_PITFALLS_PROMPT_VERSION,
};

function isLayerUpToDate(
  meta: ProcessingLayerMeta | undefined,
  currentPromptVersion: number,
  schemaOutdated: boolean,
): boolean {
  return (
    meta?.status === "complete" &&
    !schemaOutdated &&
    meta.promptVersion >= currentPromptVersion
  );
}

export async function getPracticeData(slug: string): Promise<ProcessingResult> {
  const details = await problemDetailsRepo.getBySlug(slug);

  if (!details) {
    return { status: "not_found" };
  }

  const schemaOutdated =
    (details.processingMeta?.schemaVersion ?? 0) < PROBLEM_SCHEMA_VERSION;

  const layerStatuses = PRACTICE_LAYERS.map((layer) => {
    const meta = details.processingMeta?.layers?.[layer];
    if (isLayerUpToDate(meta, PROMPT_VERSIONS[layer], schemaOutdated)) {
      return "complete" as const;
    }
    if (meta?.status === "processing") return "processing" as const;
    return "needs_generation" as const;
  });

  if (layerStatuses.every((s) => s === "complete")) {
    return { status: "complete", data: details };
  }

  if (layerStatuses.some((s) => s === "processing")) {
    return { status: "processing" };
  }

  return { status: "not_found" };
}

export async function generatePracticeData(
  slug: string,
): Promise<ProblemDetails | null> {
  const problem = await problemRepo.getBySlug(slug);
  if (!problem) {
    throw new Error(`Problem not found: ${slug}`);
  }

  const claim = await problemDetailsRepo.claimPracticeLayers(
    slug,
    PROMPT_VERSIONS,
    { staleAfterMs: problemDetailsRepo.STALE_AFTER_MS },
  );

  if (claim.status === "already_complete") {
    const result = await getPracticeData(slug);
    return result.status === "complete" ? result.data : null;
  }

  if (claim.status === "already_processing") {
    return null;
  }

  // claimed — load existing data and validate preconditions
  const details = await problemDetailsRepo.getBySlug(slug);
  const originalContent = details?.source?.originalContent;
  const framing = details?.derived?.framing;

  if (!originalContent || !framing) {
    throw new Error(
      `Practice data requires preview data (framing) to exist: ${slug}`,
    );
  }

  const claimed = new Set(claim.claimedLayers);

  const tasks: (() => Promise<void>)[] = [];

  // testCases and edgeCases are produced by a single LLM call
  if (claimed.has("testCases") || claimed.has("edgeCases")) {
    tasks.push(async () => {
      const { data, model, promptVersion } = await generateCases({
        title: problem.title,
        originalContent,
        examples: details.source.examples,
        framing,
      });
      if (claimed.has("testCases")) {
        await problemDetailsRepo.updateDerived(slug, {
          testCases: data.testCases,
        });
        await problemDetailsRepo.updateProcessingMeta(slug, "testCases", {
          status: "complete",
          updatedAt: Date.now(),
          model,
          promptVersion,
        });
      }
      if (claimed.has("edgeCases")) {
        await problemDetailsRepo.updateDerived(slug, {
          edgeCases: data.edgeCases,
        });
        await problemDetailsRepo.updateProcessingMeta(slug, "edgeCases", {
          status: "complete",
          updatedAt: Date.now(),
          model,
          promptVersion,
        });
      }
    });
  }

  if (claimed.has("hints")) {
    tasks.push(async () => {
      const { data, model, promptVersion } = await generateHints({
        title: problem.title,
        difficulty: problem.difficulty,
        originalContent,
        framing,
      });
      await problemDetailsRepo.updateDerived(slug, { hints: data });
      await problemDetailsRepo.updateProcessingMeta(slug, "hints", {
        status: "complete",
        updatedAt: Date.now(),
        model,
        promptVersion,
      });
    });
  }

  if (claimed.has("pitfalls")) {
    tasks.push(async () => {
      const { data, model, promptVersion } = await generatePitfalls({
        title: problem.title,
        difficulty: problem.difficulty,
        originalContent,
        framing,
      });
      await problemDetailsRepo.updateDerived(slug, { pitfalls: data });
      await problemDetailsRepo.updateProcessingMeta(slug, "pitfalls", {
        status: "complete",
        updatedAt: Date.now(),
        model,
        promptVersion,
      });
    });
  }

  const results = await Promise.allSettled(tasks.map((fn) => fn()));
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Practice layer generation failed:", result.reason);
    }
  }

  const final = await problemDetailsRepo.getBySlug(slug);
  return final ?? null;
}
