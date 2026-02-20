import type { ReactNode } from "react";

export type SectionKey =
  | "problem_understanding"
  | "approach_and_reasoning"
  | "algorithm_design"
  | "implementation"
  | "complexity_analysis";

/**
 * Describes a single textarea field in a snapshot-driven section.
 * T is the section's snapshot type (all string values).
 */
export interface SectionField<T extends Record<string, string>> {
  key: keyof T & string;
  label: string;
  threshold: number;
  tooltip: string;
  placeholder: string;
  formatHint?: ReactNode;
}
