import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SessionDoc } from "@/types/firestore";
import { PracticeProblem, PracticeProblemSource, SectionKey } from "@/types/practice";
import { generateFeedbackData, generateRagMetadata } from "@/lib/llmGeneration";

export async function createSessionDoc(params: {
  userId: string;
  practiceProblem: PracticeProblem;
  distilledSummaries: Record<SectionKey, string>;
  implementation: string;
  totalTimeSec: number;
  pseudocode?: string;
}) {
  const sessionRef = doc(collection(db, "sessions"));
  const sessionId = sessionRef.id;

  const {
    userId,
    practiceProblem,
    distilledSummaries,
    pseudocode,
    implementation,
    totalTimeSec,
  } = params;

  const isCustom = practiceProblem.source === PracticeProblemSource.Custom;

  const ragMetadata = await generateRagMetadata({
    distilledSummaries,
    pseudocode,
    implementation,
    practiceProblem,
  });

  const feedback = await generateFeedbackData({
    distilledSummaries,
    pseudocode,
    implementation,
  });

  const sessionDoc: SessionDoc = {
    id: sessionId,
    userId,
    createdAt: new Date().toISOString(),
    practiceProblemSource: practiceProblem.source,
    problemRefId: !isCustom ? practiceProblem.problem.id : undefined,
    problemInline: isCustom
      ? { description: practiceProblem.problem.description, tags: ragMetadata.tags }
      : undefined,
    distilledSummaries,
    pseudocode,
    implementation,
    totalTimeSec,
    feedback,
    ragMetadata,
  };

  await setDoc(sessionRef, sessionDoc);

  return sessionDoc;
}
