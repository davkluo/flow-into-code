import {
  RagMetadata, FeedbackData, ProblemMetadata, StoredProblemSource, TagDoc
} from "@/types/firestore";
import { SectionKey } from "@/types/practice";
import { LanguageKey } from "./codeMirror";

export async function generateFeedbackData(
  distilledSummaries: Record<SectionKey, string>,
  implementation: string,
  implementationLanguage: LanguageKey,
  pseudocode?: string,
): Promise<FeedbackData> {
  const res = await fetch("/api/generate-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      distilledSummaries,
      implementation,
      implementationLanguage,
      pseudocode,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate feedback: ${res.status} ${res.statusText}`);
  }

  const feedback: FeedbackData = await res.json();
  return feedback;
}

export async function generateRagMetadata(
  distilledSummaries: Record<SectionKey, string>,
  implementation: string,
  implementationLanguage: LanguageKey,
  pseudocode?: string
): Promise<RagMetadata> {
  const res = await fetch("/api/session-metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      distilledSummaries,
      implementation,
      implementationLanguage,
      pseudocode,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate session metadata: ${res.status} ${res.statusText}`);
  }

  const ragMetadata: RagMetadata = await res.json();
  return ragMetadata;
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