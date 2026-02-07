import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { fetchLCProblemContent } from "@/services/leetcode/client";
import { extractExamples } from "@/services/llm/extractExamples";
import { generateFraming } from "@/services/llm/generateFraming";
import { ProblemDetails } from "@/types/problem";

export async function ensurePreviewData(slug: string): Promise<ProblemDetails> {
  const problem = await problemRepo.getBySlug(slug);
  if (!problem) {
    throw new Error(`Problem not found: ${slug}`);
  }

  const existing = await problemDetailsRepo.getBySlug(slug);

  if (existing?.processingMeta?.layers?.framing?.status === "complete") {
    return existing;
  }

  const originalContent =
    existing?.source?.originalContent ?? (await fetchLCProblemContent(slug));

  const examples = await extractExamples({
    title: problem.title,
    originalContent,
  });

  console.log("Generated examples for", slug, examples);

  const framing = await generateFraming({
    title: problem.title,
    difficulty: problem.difficulty,
    originalContent,
    examples,
  });

  console.log("Generated framing for", slug, framing);

  // await problemDetailsRepo.createIfNotExists(slug, { titleSlug: slug });
  // await problemDetailsRepo.updateSource(slug, {
  //   ...existing?.source,
  //   originalContent,
  //   codeSnippets: existing?.source?.codeSnippets ?? {},
  //   examples,
  // });
  // await problemDetailsRepo.updateDerived(slug, { framing });

  return {
    titleSlug: slug,
    source: {
      originalContent,
      codeSnippets: existing?.source?.codeSnippets ?? {},
      examples,
    },
    derived: { framing },
  };
}
