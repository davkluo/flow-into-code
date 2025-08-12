import { SectionKey } from "@/types/practice";

export const PRACTICE_SECTIONS: SectionKey[] = [
  "selection",
  "clarification",
  "thought_process",
  "pseudocode",
  "implementation",
  "complexity_analysis",
];

export const SECTIONS_TO_NAME: Record<SectionKey, string> = {
  selection: "Problem Selection",
  clarification: "Clarifications",
  thought_process: "Thought Process",
  pseudocode: "Pseudocode",
  implementation: "Implementation",
  complexity_analysis: "Complexity Analysis",
};

export const sectionToIndex = (section: SectionKey): number => {
  return PRACTICE_SECTIONS.indexOf(section);
};