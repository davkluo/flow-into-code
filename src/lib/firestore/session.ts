import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SessionDoc } from "@/types/firestore";
import { PracticeProblem, PracticeProblemSource, SectionKey } from "@/types/practice";
import { generateFeedbackData, generateRagMetadata } from "@/lib/llmGeneration";
import { LanguageKey } from "../codeMirror";

export async function createSessionDoc(params: {
  userId: string;
  practiceProblem: PracticeProblem;
  distilledSummaries: Record<SectionKey, string>;
  implementation: string;
  implementationLanguage: LanguageKey;
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
    implementationLanguage,
    totalTimeSec,
  } = params;

  const isCustom = practiceProblem.source === PracticeProblemSource.Custom;

  const ragMetadata = await generateRagMetadata(
    distilledSummaries,
    implementation,
    implementationLanguage,
    pseudocode
  );

  const feedback = await generateFeedbackData(
    distilledSummaries,
    implementation,
    implementationLanguage,
    pseudocode
  );

  let sessionDoc: SessionDoc;

  if (isCustom) {
    sessionDoc = {
      id: sessionId,
      userId,
      createdAt: new Date().toISOString(),
      practiceProblemSource: practiceProblem.source,
      problemInline: {
        description: practiceProblem.problem.description,
        tags: [], // TODO: Handle tags for custom problems
      },
      distilledSummaries,
      pseudocode,
      implementation,
      implementationLanguage,
      totalTimeSec,
      feedback,
      ragMetadata,
    };
  } else {
    sessionDoc = {
      id: sessionId,
      userId,
      createdAt: new Date().toISOString(),
      practiceProblemSource: practiceProblem.source,
      problemRefId: practiceProblem.problem.id,
      distilledSummaries,
      pseudocode,
      implementation,
      implementationLanguage,
      totalTimeSec,
      feedback,
      ragMetadata,
    };
  }

  await setDoc(sessionRef, sessionDoc);

  return sessionDoc.id;
}