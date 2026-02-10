import { stripHtml } from "@/lib/formatting";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { fetchLCProblemContent } from "@/services/leetcode/client";
import { extractExamples } from "@/services/llm/extractExamples";
import { generateFraming } from "@/services/llm/generateFraming";
import { ProblemDetails } from "@/types/problem";

export async function getPreviewData(
  slug: string,
): Promise<ProblemDetails | null> {
  const details = await problemDetailsRepo.getBySlug(slug);

  if (details?.processingMeta?.layers?.framing?.status !== "complete") {
    return null;
  }

  return details;
}

export async function generatePreviewData(
  slug: string,
): Promise<ProblemDetails> {
  const problem = await problemRepo.getBySlug(slug);
  if (!problem) {
    throw new Error(`Problem not found: ${slug}`);
  }

  const existing = await getPreviewData(slug);
  if (existing) return existing;

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

  await problemDetailsRepo.createIfNotExists(slug, { titleSlug: slug });
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
