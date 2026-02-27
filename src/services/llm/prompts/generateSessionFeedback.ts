import { SECTION_KEY_TO_DETAILS } from "@/constants/practice";
import { FIELD_LABELS, formatFieldKey } from "@/lib/chatContext";
import { SessionMessage } from "@/types/chat";
import { SectionKey, SectionSnapshotData } from "@/types/practice";
import { Framing, GradingCriterion } from "@/types/problem";
import { CategoryFeedback } from "@/types/session";

export const GENERATE_SESSION_FEEDBACK_PROMPT_VERSION = 2;

// ---------------------------------------------------------------------------
// Tone — injected into both prompts
// ---------------------------------------------------------------------------

const TONE = `
TONE:
- Write like a technical interviewer filling out a post-interview debrief, not a chatbot writing a performance review.
- No emojis.
- No celebratory openers or closers ("Great job!", "Excellent work!", "You did well here!").
- No hedge phrases ("It's worth noting...", "It's important to remember...", "One thing to keep in mind...").
- Short is better than padded. One honest sentence is better than two that say the same thing.
- If there is nothing genuine to say for a field, write a single direct sentence rather than filling space with generic encouragement.
- A low score with a clear explanation is more useful than a padded score with vague praise.
`.trim();

// ---------------------------------------------------------------------------
// General per-section grading guidance
//
// Applied on every session regardless of problem. Gives the model interview
// calibration context before the problem-specific rubric narrows the scoring.
// ---------------------------------------------------------------------------

const SECTION_GRADING_CONTEXT: Record<SectionKey, string> = {
  problem_understanding: `
General signals to consider:
- Strong: asks targeted factual questions (input bounds, return format, null/empty handling) rather than seeking validation of their understanding; identifies the core constraint or difficulty the problem hinges on; explicitly states their own assumptions when details are ambiguous; surfaces non-obvious edge cases (empty input, single element, overflow, duplicates) without prompting.
- Weak: restates the problem verbatim with no additional insight; asks "is my understanding correct?" instead of clarifying specific facts; misses a key constraint that would change the solution.
- Important distinction: naming and listing edge cases is sufficient for awareness credit. Do not require the candidate to explain the implications of every edge case they list — especially for edge cases that the standard solution handles automatically without special logic. Only penalize a missing edge case if it is non-obvious AND its omission would cause the candidate's solution to be wrong.
`.trim(),

  approach_and_reasoning: `
General signals to consider:
- Strong: starts with a brute-force baseline and explains why it is suboptimal before optimizing; motivates their data structure or algorithm choice in terms of the operation it makes efficient; walks through a concrete example to sanity-check the approach before committing; acknowledges time/space tradeoffs without being prompted.
- Weak: jumps directly to an optimal solution without explaining the reasoning chain; cannot articulate why the chosen approach is better than a naïve one; changes strategies without noting why the previous one was abandoned.
- Note on complexity: this session has a dedicated Complexity Analysis section. Mentioning complexity here is a positive bonus signal, but do not penalize its absence in this section alone. Only mark down here if the candidate cannot articulate any reasoning behind their approach at all — not merely because they saved the complexity discussion for later.
`.trim(),

  algorithm_design: `
General signals to consider:
- Strong: each pseudocode step corresponds to a concrete, implementable operation; control flow covers all cases described in the approach (loops, conditionals, base cases, early exits); edge cases identified earlier are explicitly addressed in the algorithm.
- Weak: vague steps ("process the data", "handle edge case here"); pseudocode that contradicts the stated approach; missing termination conditions or base cases for recursive logic.
- Important distinction on edge cases: an edge case that is implicitly handled by the algorithm's structure does NOT require an explicit guard in the pseudocode. Check the chat log — if the candidate explained how their algorithm handles a particular edge case, this counts as demonstrating awareness and correct reasoning. Only penalize for a missing edge case if the algorithm would actually produce a wrong result for it AND the candidate showed no awareness of the issue.
`.trim(),

  implementation: `
General signals to consider:
- Strong: code structure mirrors pseudocode — deviations from the plan are intentional and noted; meaningful variable and function names; visible test cases pass; edge cases from earlier sections appear in the code.
- When bugs are present: observe whether the candidate reasons through them systematically (tracing values, narrowing scope) or guesses at fixes. Systematic debugging is a positive signal even if the bug is not fully resolved.
- Weak: code silently deviates from stated pseudocode without acknowledgment; trial-and-error patching without reasoning; edge cases that were identified earlier are absent from the implementation.
- Do not penalize for absent error handling on inputs the problem statement guarantees will not occur. Defensive programming is a positive signal only when it addresses real failure modes, not when it guards against inputs ruled out by the problem's explicit constraints. Similarly, edge cases that are implicitly handled by the algorithm's structure do not need to appear as separate code paths.
`.trim(),

  complexity_analysis: `
General signals to consider:
- Strong: derives complexity by walking through the algorithm (counts iterations, identifies the dominant operation); correctly distinguishes time from space; accounts for auxiliary data structures and their operation costs; drops lower-order terms and constants with correct reasoning.
- Weak: states a complexity figure as a guess without derivation; conflates time and space; ignores a nested loop or the cost of a data structure operation; fails to account for auxiliary space.
`.trim(),
};

// ---------------------------------------------------------------------------
// Shared snapshot formatter
// ---------------------------------------------------------------------------

function formatSnapshots(snapshots: { data: SectionSnapshotData }[]): string {
  if (snapshots.length === 0) {
    return "The candidate did not provide any written work in this section.";
  }

  return snapshots
    .map((snap, i) => {
      const isFinal = i === snapshots.length - 1;
      const header = `[Snapshot ${i + 1}${isFinal ? " — final" : ""}]`;
      const fields = Object.entries(snap.data)
        .filter(([, v]) => v.trim() !== "")
        .map(([k, v]) => {
          const label = FIELD_LABELS[k] ?? formatFieldKey(k);
          const indented = v
            .split("\n")
            .map((line) => `    ${line}`)
            .join("\n");
          return `  ${label}:\n${indented}`;
        })
        .join("\n");
      return `${header}\n${fields || "  (no content)"}`;
    })
    .join("\n\n");
}

function formatSectionChatLog(messages: SessionMessage[]): string {
  if (messages.length === 0) {
    return "The candidate did not use the chat in this section.";
  }
  return messages
    .map(
      (m) =>
        `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`,
    )
    .join("\n");
}

// ---------------------------------------------------------------------------
// Prompt 1: Grade a single section
//
// Run once per SectionKey. These calls can run in parallel since each section
// is assessed independently against its own grading criterion.
// ---------------------------------------------------------------------------

export interface GradeSectionPromptInput {
  title: string;
  difficulty: string;
  originalContent: string;
  framing: Framing;
  criterion: GradingCriterion; // criterion.category identifies which section this is
  snapshots: { data: SectionSnapshotData }[]; // pruned; ordered first → last
  chatLog: SessionMessage[]; // filtered to this section only
}

export function buildGradeSectionPrompt(
  input: GradeSectionPromptInput,
): string {
  const sectionTitle = SECTION_KEY_TO_DETAILS[input.criterion.category].title;
  const generalGuidance = SECTION_GRADING_CONTEXT[input.criterion.category];

  return `
You are grading a candidate's performance in the ${sectionTitle} section of a coding interview.

${TONE}

Problem: ${input.title} (${input.difficulty})
${input.framing.canonical}

Problem statement:
${input.originalContent}

---

GENERAL INTERVIEW STANDARDS — ${sectionTitle}:
${generalGuidance}

PROBLEM-SPECIFIC GRADING CRITERION:
${input.criterion.description}

PROBLEM-SPECIFIC RUBRIC:
${input.criterion.rubric}

---

CANDIDATE WORK — SNAPSHOT HISTORY (ordered first to last; final snapshot is their state at submission):
${formatSnapshots(input.snapshots)}

CANDIDATE CHAT LOG (this section only):
${formatSectionChatLog(input.chatLog)}

---

SCORING INSTRUCTIONS:
- If the candidate submitted no work in this section (no snapshots and no chat messages that demonstrate engagement), set score to null. Write a direct one-sentence comments explaining what was missing. Leave compliments and advice as empty strings. This is not a score of zero — it is a signal that the section cannot be assessed.
- Otherwise, score on the 1–5 scale using the rubric's anchor scores and adjustment rules. Use the general interview standards above to fill gaps the rubric does not cover.
- Quarter-step resolution is appropriate (e.g. 1.25, 1.5, 1.75, 2.25, 2.5, 2.75). Avoid finer increments.
- For the implementation section: weigh the full snapshot progression. Catching and fixing a bug mid-session is positive; regressing from a working state is negative.
- Treat the chat log as evidence of understanding. If the candidate verbally explained how their algorithm handles a specific case — even if it is not written in their snapshot — count that as demonstrating awareness. Do not penalize for an absence in the written fields if the point was made clearly in conversation.
- Base your assessment only on what is present. Do not invent strengths or weaknesses.
- comments: justify the score with specific evidence from their work (1–3 sentences).
- compliments: only write something genuine. If there is nothing noteworthy, one honest sentence is enough — do not fabricate positives.
- advice: name a specific gap or concrete improvement. If the score is 4 or 5 and there is nothing genuine to point to, set advice to an empty string. Do not write generic encouragement to fill the field.

Return valid JSON with this exact shape:
{
  "score": number | null,
  "comments": string,
  "compliments": string,
  "advice": string
}
`.trim();
}

// ---------------------------------------------------------------------------
// Prompt 2: Session summary and interviewer communication
//
// Run once after all 5 section grades are complete. Receives the per-section
// results as input so it rolls up rather than re-derives from raw data.
// ---------------------------------------------------------------------------

export interface SessionSummaryPromptInput {
  title: string;
  difficulty: string;
  sectionResults: Partial<Record<SectionKey, CategoryFeedback>>;
  fullChatLog: SessionMessage[]; // all sections combined, in order
}

function formatSectionResults(
  results: Partial<Record<SectionKey, CategoryFeedback>>,
): string {
  return (Object.entries(results) as [SectionKey, CategoryFeedback][])
    .map(([key, fb]) => {
      const scoreLabel =
        fb.score !== null ? `score: ${fb.score}/5` : "not submitted";
      return `${SECTION_KEY_TO_DETAILS[key].title} — ${scoreLabel}\n  ${fb.comments}`;
    })
    .join("\n\n");
}

function formatFullChatLog(messages: SessionMessage[]): string {
  if (messages.length === 0) {
    return "The candidate did not use the chat at any point during the session.";
  }
  return messages
    .map((m) => {
      const section = SECTION_KEY_TO_DETAILS[m.section].title;
      const speaker = m.role === "user" ? "Candidate" : "Interviewer";
      return `[${section}] ${speaker}: ${m.content}`;
    })
    .join("\n");
}

export function buildSessionSummaryPrompt(
  input: SessionSummaryPromptInput,
): string {
  return `
You are writing the final assessment of a candidate's complete coding interview.

${TONE}

Problem: ${input.title} (${input.difficulty})

PER-SECTION SCORES (already computed — do not re-derive them):
${formatSectionResults(input.sectionResults)}

FULL CHAT LOG (all sections, in order):
${formatFullChatLog(input.fullChatLog)}

---

Your task is to produce two outputs:

1. interviewerCommunication — Assess how the candidate used the AI interviewer across the session.
   Positive signals: targeted factual clarifying questions; explaining their reasoning when asked; purposeful debugging questions that show they are reasoning through the problem, not fishing for answers.
   Negative signals: repeatedly seeking validation ("is this correct?", "does this look right?"); leaning on the interviewer to locate bugs rather than reasoning through them; requesting hints without attempting to self-correct first.
   Working independently without soliciting hints or unnecessary validation is itself a positive signal — it is not neutral. A candidate who used the interviewer selectively and purposefully, and otherwise worked independently, should score well (4–5).
   Score on the 1–5 scale; quarter steps are appropriate.
   If the candidate did not use the chat at all, score is null. Write a single direct sentence in comments noting that. Leave compliments and advice as empty strings.
   If they used it minimally, score based on the quality of the interactions that did occur. Do not penalize the absence of unnecessary interaction.

2. summary — 2–4 sentences on the candidate's overall performance. Name the strongest section, the biggest gap, and any consistent pattern. Be direct — do not restate the individual scores. When naming a gap, be specific and accurate: if a lower score stems from a narrow issue, name that issue precisely. Do not draw broad character conclusions (about confidence, thoroughness, etc.) from a single scoring deduction.

Return valid JSON with this exact shape:
{
  "interviewerCommunication": {
    "score": number | null,
    "comments": string,
    "compliments": string,
    "advice": string
  },
  "summary": string
}
`.trim();
}
