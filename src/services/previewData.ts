import { stripHtml } from "@/lib/formatting";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { fetchLCProblemContent } from "@/services/leetcode/client";
import { extractExamples } from "@/services/llm/extractExamples";
import { generateFraming } from "@/services/llm/generateFraming";
import { GENERATE_FRAMING_PROMPT_VERSION } from "@/services/llm/prompts/generateFraming";
import { PROBLEM_SCHEMA_VERSION, ProblemDetails } from "@/types/problem";

const STALE_AFTER_MS = 2 * 60 * 1000; // 2 minutes

export type PreviewDataResult =
  | { status: "complete"; data: ProblemDetails }
  | { status: "processing" }
  | { status: "not_found" };

export async function getPreviewData(slug: string): Promise<PreviewDataResult> {
  const details = await problemDetailsRepo.getBySlug(slug);

  if (!details) {
    return { status: "not_found" };
  }

  const schemaOutdated =
    (details.processingMeta?.schemaVersion ?? 0) < PROBLEM_SCHEMA_VERSION;
  const framingLayer = details.processingMeta?.layers?.framing;

  if (framingLayer?.status === "complete" && !schemaOutdated) {
    const promptOutdated =
      framingLayer.promptVersion < GENERATE_FRAMING_PROMPT_VERSION;
    if (!promptOutdated) {
      return { status: "complete", data: details };
    }
  }

  if (framingLayer?.status === "processing") {
    return { status: "processing" };
  }

  return { status: "not_found" };
}

export async function generatePreviewData(
  slug: string,
): Promise<ProblemDetails | null> {
  const problem = await problemRepo.getBySlug(slug);
  if (!problem) {
    throw new Error(`Problem not found: ${slug}`);
  }

  const claim = await problemDetailsRepo.claimGeneration(slug, "framing", {
    staleAfterMs: STALE_AFTER_MS,
    currentPromptVersion: GENERATE_FRAMING_PROMPT_VERSION,
  });

  if (claim.status === "already_complete") {
    const result = await getPreviewData(slug);
    return result.status === "complete" ? result.data : null;
  }

  if (claim.status === "already_processing") {
    return null;
  }

  // claimed — proceed with generation
  const partial = await problemDetailsRepo.getBySlug(slug);
  const rawContent =
    partial?.source?.originalContent ?? (await fetchLCProblemContent(slug));
  const originalContent = stripHtml(rawContent);

  const { data: examples } = await extractExamples({
    title: problem.title,
    originalContent,
  });

  const {
    data: framing,
    model,
    promptVersion,
  } = await generateFraming({
    title: problem.title,
    difficulty: problem.difficulty,
    originalContent,
    examples,
  });

  await problemDetailsRepo.updateSource(slug, {
    ...partial?.source,
    originalContent,
    codeSnippets: partial?.source?.codeSnippets ?? {},
    examples,
  });
  await problemDetailsRepo.updateDerived(slug, { framing });
  await problemDetailsRepo.updateProcessingMeta(slug, "framing", {
    status: "complete",
    updatedAt: Date.now(),
    model,
    promptVersion,
  });

  return {
    titleSlug: slug,
    source: {
      originalContent,
      codeSnippets: partial?.source?.codeSnippets ?? {},
      examples,
    },
    derived: { framing },
  };
}
