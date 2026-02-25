import { SECTION_ORDER } from "@/constants/practice";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import * as statsRepo from "@/repositories/firestore/statsRepo";
import * as userRepo from "@/repositories/firestore/userRepo";
import {
  generateSectionFeedback,
  generateSessionSummary,
} from "@/services/llm/generateSessionFeedback";
import { LLMState } from "@/hooks/useLLM";
import { SectionKey, SectionSnapshots } from "@/types/practice";
import { CategoryFeedback, Session, SessionFeedback } from "@/types/session";

export async function generateSessionFeedback(
  uid: string,
  problemSlug: string,
  llmState: LLMState,
): Promise<string> {
  // Step 1: Fetch problem and details — both required
  const [problem, details] = await Promise.all([
    problemRepo.getBySlug(problemSlug),
    problemDetailsRepo.getBySlug(problemSlug),
  ]);

  if (!problem) throw new Error(`Problem not found: ${problemSlug}`);
  if (!details) throw new Error(`Problem details not found: ${problemSlug}`);

  const framing = details.derived?.framing;
  const gradingCriteria = details.derived?.gradingCriteria;

  if (!framing) {
    throw new Error(`Problem framing missing for feedback generation: ${problemSlug}`);
  }
  if (!gradingCriteria || gradingCriteria.length === 0) {
    throw new Error(
      `Grading criteria missing for feedback generation: ${problemSlug}. Ensure problem feedback data has been generated first.`,
    );
  }

  // Step 2: Grade all 5 sections in parallel
  const sectionGrades = await Promise.all(
    SECTION_ORDER.map((key) => {
      const criterion = gradingCriteria.find((c) => c.category === key);
      if (!criterion) {
        throw new Error(`Missing grading criterion for section: ${key}`);
      }
      return generateSectionFeedback({
        title: problem.title,
        difficulty: problem.difficulty,
        originalContent: details.source.originalContent,
        framing,
        criterion,
        snapshots: llmState.sections[key]?.snapshots ?? [],
        chatLog: llmState.messages.filter((m) => m.section === key),
      });
    }),
  );

  // Map section grades back to keyed results
  const sectionResults = Object.fromEntries(
    SECTION_ORDER.map((key, i) => [key, sectionGrades[i]]),
  ) as Record<SectionKey, CategoryFeedback>;

  // Step 3: Generate summary (sequential — needs section results)
  const { interviewerCommunication, summary } = await generateSessionSummary({
    title: problem.title,
    difficulty: problem.difficulty,
    sectionResults,
    fullChatLog: llmState.messages,
  });

  // Step 4: Assemble and persist the session document
  const feedback: SessionFeedback = {
    sections: sectionResults,
    interviewerCommunication,
    summary,
  };

  const fields = Object.fromEntries(
    SECTION_ORDER.map((key) => [
      key,
      llmState.sections[key]?.snapshots.at(-1)?.data ?? {},
    ]),
  ) as Partial<SectionSnapshots>;

  const session: Session = {
    userId: uid,
    createdAt: new Date(),
    problemTitleSlug: problemSlug,
    chatLog: llmState.messages,
    feedback,
    fields,
  };

  const sessionId = await sessionRepo.create(session);

  // Step 5: Fire side-effect writes in parallel (non-critical; drift is acceptable)
  await Promise.all([
    statsRepo.incrementSessionCount(),
    userRepo.addCompletedProblem(uid, problemSlug),
  ]);

  return sessionId;
}
