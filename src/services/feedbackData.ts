import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import { FeedbackLayer } from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { generateFeedbackData } from "@/services/llm/generateFeedbackData";
import { GENERATE_FEEDBACK_DATA_PROMPT_VERSION } from "@/services/llm/prompts/generateFeedbackData";
import {
  PROBLEM_SCHEMA_VERSION,
  ProblemDetails,
  ProcessingLayerMeta,
  ProcessingResult,
} from "@/types/problem";

const FEEDBACK_LAYERS: FeedbackLayer[] = ["solutions", "gradingCriteria"];

const PROMPT_VERSIONS: Record<FeedbackLayer, number> = {
  solutions: GENERATE_FEEDBACK_DATA_PROMPT_VERSION,
  gradingCriteria: GENERATE_FEEDBACK_DATA_PROMPT_VERSION,
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

export async function getFeedbackData(slug: string): Promise<ProcessingResult> {
  const details = await problemDetailsRepo.getBySlug(slug);

  if (!details) {
    return { status: "not_found" };
  }

  const schemaOutdated =
    (details.processingMeta?.schemaVersion ?? 0) < PROBLEM_SCHEMA_VERSION;

  const layerStatuses = FEEDBACK_LAYERS.map((layer) => {
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

export async function generateFeedbackDataForProblem(
  slug: string,
): Promise<ProblemDetails | null> {
  const problem = await problemRepo.getBySlug(slug);
  if (!problem) {
    throw new Error(`Problem not found: ${slug}`);
  }

  const claim = await problemDetailsRepo.claimFeedbackLayers(
    slug,
    PROMPT_VERSIONS,
    { staleAfterMs: problemDetailsRepo.STALE_AFTER_MS },
  );

  if (claim.status === "already_complete") {
    const result = await getFeedbackData(slug);
    return result.status === "complete" ? result.data : null;
  }

  if (claim.status === "already_processing") {
    return null;
  }

  // claimed — load existing data and validate preconditions
  const details = await problemDetailsRepo.getBySlug(slug);
  const originalContent = details?.source?.originalContent;
  const framing = details?.derived?.framing;
  const testCases = details?.derived?.testCases;
  const edgeCases = details?.derived?.edgeCases;

  if (!originalContent || !framing) {
    throw new Error(
      `Feedback data requires preview data (framing) to exist: ${slug}`,
    );
  }

  if (!testCases || !edgeCases) {
    throw new Error(
      `Feedback data requires practice data (testCases, edgeCases) to exist: ${slug}`,
    );
  }

  const claimed = new Set(claim.claimedLayers);

  const { data, model, promptVersion } = await generateFeedbackData({
    title: problem.title,
    difficulty: problem.difficulty,
    originalContent,
    framing,
    testCases,
    edgeCases,
  });

  if (claimed.has("solutions")) {
    await problemDetailsRepo.updateDerived(slug, { solutions: data.solutions });
    await problemDetailsRepo.updateProcessingMeta(slug, "solutions", {
      status: "complete",
      updatedAt: Date.now(),
      model,
      promptVersion,
    });
  }

  if (claimed.has("gradingCriteria")) {
    await problemDetailsRepo.updateDerived(slug, {
      gradingCriteria: data.gradingCriteria,
    });
    await problemDetailsRepo.updateProcessingMeta(slug, "gradingCriteria", {
      status: "complete",
      updatedAt: Date.now(),
      model,
      promptVersion,
    });
  }

  const final = await problemDetailsRepo.getBySlug(slug);
  return final ?? null;
}
