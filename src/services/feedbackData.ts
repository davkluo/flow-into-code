import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import { FeedbackLayer } from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { generateGradingCriteria } from "@/services/llm/generateGradingCriteria";
import { generateSolutions } from "@/services/llm/generateSolutions";
import { GENERATE_GRADING_CRITERIA_PROMPT_VERSION } from "@/services/llm/prompts/generateGradingCriteria";
import { GENERATE_SOLUTIONS_PROMPT_VERSION } from "@/services/llm/prompts/generateSolutions";
import {
  PROBLEM_SCHEMA_VERSION,
  ProblemDetails,
  ProblemSolution,
  ProcessingLayerMeta,
  ProcessingResult,
} from "@/types/problem";

const FEEDBACK_LAYERS: FeedbackLayer[] = ["solutions", "gradingCriteria"];

const PROMPT_VERSIONS: Record<FeedbackLayer, number> = {
  solutions: GENERATE_SOLUTIONS_PROMPT_VERSION,
  gradingCriteria: GENERATE_GRADING_CRITERIA_PROMPT_VERSION,
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
  const baseInput = {
    title: problem.title,
    difficulty: problem.difficulty,
    originalContent,
    framing,
    testCases,
    edgeCases,
  };

  // Step 1: Generate solutions if claimed, otherwise load existing for use in step 2
  let solutions: ProblemSolution[];

  if (claimed.has("solutions")) {
    const result = await generateSolutions(baseInput);
    solutions = result.data.solutions;

    await problemDetailsRepo.updateDerived(slug, { solutions });
    await problemDetailsRepo.updateProcessingMeta(slug, "solutions", {
      status: "complete",
      updatedAt: Date.now(),
      model: result.model,
      promptVersion: result.promptVersion,
    });
  } else {
    // solutions layer is already up-to-date; load persisted data to inform criteria generation
    const existing = details?.derived?.solutions;
    if (!existing || existing.length === 0) {
      throw new Error(
        `gradingCriteria claimed but no existing solutions found for: ${slug}`,
      );
    }
    solutions = existing;
  }

  // Step 2: Generate grading criteria if claimed, using solutions as context
  if (claimed.has("gradingCriteria")) {
    const result = await generateGradingCriteria({ ...baseInput, solutions });

    await problemDetailsRepo.updateDerived(slug, {
      gradingCriteria: result.data.gradingCriteria,
    });
    await problemDetailsRepo.updateProcessingMeta(slug, "gradingCriteria", {
      status: "complete",
      updatedAt: Date.now(),
      model: result.model,
      promptVersion: result.promptVersion,
    });
  }

  const final = await problemDetailsRepo.getBySlug(slug);
  return final ?? null;
}
