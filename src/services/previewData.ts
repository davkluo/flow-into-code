import { stripHtml } from "@/lib/formatting";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { fetchLCProblemContent } from "@/services/leetcode/client";
import { extractExamples } from "@/services/llm/extractExamples";
import { generateFraming } from "@/services/llm/generateFraming";
import { ProblemDetails } from "@/types/problem";

const STALE_AFTER_MS = 2 * 60 * 1000; // 2 minutes

export type PreviewDataResult =
  | { status: "complete"; data: ProblemDetails }
  | { status: "processing" }
  | { status: "not_found" };

export async function getPreviewData(
  slug: string,
): Promise<PreviewDataResult> {
  const details = await problemDetailsRepo.getBySlug(slug);

  if (!details) {
    return { status: "not_found" };
  }

  const framingStatus = details.processingMeta?.layers?.framing?.status;

  if (framingStatus === "complete") {
    return { status: "complete", data: details };
  }

  if (framingStatus === "processing") {
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

  const claim = await problemDetailsRepo.claimGeneration(
    slug,
    "framing",
    STALE_AFTER_MS,
  );

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

  const examples = await extractExamples({
    title: problem.title,
    originalContent,
  });

  const framing = await generateFraming({
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
