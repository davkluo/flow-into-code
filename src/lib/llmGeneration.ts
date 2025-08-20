import { RagMetadata, FeedbackData, ProblemMetadata, StoredProblemSource, TagDoc } from "@/types/firestore";
import { PracticeProblem, PracticeProblemSource, SectionKey } from "@/types/practice";

// Placeholder for feedback generation
export async function generateFeedbackData(input: {
  distilledSummaries: Record<SectionKey, string>;
  pseudocode?: string;
  implementation?: string;
}): Promise<FeedbackData> {
  // TODO: Implement with LLM call
  return {
    scores: {
      understandingAndCommunication: { score: 3, reason: "Placeholder" },
      problemSolvingAndReasoning: { score: 3, reason: "Placeholder" },
      codeImplementation: { score: 3, reason: "Placeholder" },
      complexityAnalysis: { score: 3, reason: "Placeholder" },
    },
    strengths: ["Placeholder strength"],
    suggestions: ["Placeholder suggestion"],
  };
}

// Placeholder for metadata generation
export async function generateRagMetadata(input: {
  distilledSummaries: Record<SectionKey, string>;
  practiceProblem: PracticeProblem;
  implementation: string;
  pseudocode?: string;
}): Promise<RagMetadata> {
  // TODO: Implement with LLM call
  const { distilledSummaries, practiceProblem, implementation, pseudocode } = input;
  return {
    reasoningSummary: "Placeholder reasoning summary",
    keyTakeaways: ["Placeholder takeaway"],
    embedding: [], // Placeholder for vector embedding
  };
}

export async function generateProblemMetadata(
  title: string,
  description: string,
  tags: string[],
  source: StoredProblemSource,
): Promise<ProblemMetadata> {
  const res = await fetch("/api/problem-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, tags, source }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to generate problem metadata: ${res.status} ${res.statusText}`
    );
  }

  const problemMetadata: ProblemMetadata = await res.json();
  return problemMetadata;
}

export async function generateTagMetadata(tagId: string): Promise<TagDoc> {
  const res = await fetch("/api/tag-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tagId }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to generate tag metadata: ${res.status} ${res.statusText}`
    );
  }

  const tagDoc: TagDoc = await res.json();
  return tagDoc;
}