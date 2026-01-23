import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateFeedbackData, generateRagMetadata } from "@/lib/llmGeneration";
import { SessionDoc } from "@/types/firestore";
import { PracticeProblem, SectionKey } from "@/types/practice";
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

  const ragMetadata = await generateRagMetadata(
    distilledSummaries,
    implementation,
    implementationLanguage,
    pseudocode,
  );

  const feedback = await generateFeedbackData(
    distilledSummaries,
    implementation,
    implementationLanguage,
    pseudocode,
  );

  const sessionDoc: SessionDoc = {
    id: sessionId,
    userId,
    createdAt: new Date().toISOString(),
    problemTitleSlug: practiceProblem.titleSlug,
    distilledSummaries,
    pseudocode,
    implementation,
    implementationLanguage,
    totalTimeSec,
    feedback,
    ragMetadata,
  };

  await setDoc(sessionRef, sessionDoc);

  return sessionDoc.id;
}
