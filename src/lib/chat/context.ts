import { SECTION_KEY_TO_DETAILS } from "@/lib/practice";
import { SectionKey } from "@/types/practice";
import { Problem, ProblemDetails } from "@/types/problem";

/**
 * Formats the problem statement into a context block for the LLM to reference
 */
export const buildProblemContext = (
  problem: Problem,
  details: ProblemDetails,
): string => {
  return `Problem: ${problem.title} (LeetCode #${problem.id})\n${details.source.originalContent}`;
};

// ---------------------------------------------------------------------------
// Section snapshot context
// These functions are stubs — full implementation comes in Step 3 once the
// snapshot system is wired up across all sections.
// ---------------------------------------------------------------------------

export type SectionSnapshotData = Record<string, string>;

/**
 * Formats the latest snapshot for each completed section into a system
 * context block so the LLM knows what the user has worked on previously.
 * Sections with no snapshots are omitted.
 */
export const buildPriorSectionsContext = (
  sections: Partial<
    Record<SectionKey, { snapshots: { data: SectionSnapshotData }[] }>
  >,
  currentSection: SectionKey,
): string => {
  const sectionOrder: SectionKey[] = [
    "problem_understanding",
    "approach_and_reasoning",
    "algorithm_design",
    "implementation",
    "complexity_analysis",
  ];

  const lines: string[] = [];

  for (const key of sectionOrder) {
    if (key === currentSection) break; // only include sections before the current one
    const latest = sections[key]?.snapshots.at(-1);
    if (!latest) continue;
    const title = SECTION_KEY_TO_DETAILS[key].title;
    const formatted = Object.entries(latest.data)
      .filter(([, v]) => v.trim() !== "")
      .map(([k, v]) => `  ${k}: ${v}`)
      .join("\n");
    if (formatted) lines.push(`${title}:\n${formatted}`);
  }

  return lines.length > 0
    ? `User's work from prior sections:\n\n${lines.join("\n\n")}`
    : "";
};

/**
 * Formats the current section's latest snapshot so the LLM can see
 * what the user has filled in alongside the chat.
 */
export const buildCurrentSectionContext = (
  snapshots: { data: SectionSnapshotData }[] | undefined,
  currentSection: SectionKey,
): string => {
  const latest = snapshots?.at(-1);
  if (!latest) return "";

  const title = SECTION_KEY_TO_DETAILS[currentSection].title;
  const formatted = Object.entries(latest.data)
    .filter(([, v]) => v.trim() !== "")
    .map(([k, v]) => `  ${k}: ${v}`)
    .join("\n");

  return formatted ? `User's current ${title} notes:\n${formatted}` : "";
};
