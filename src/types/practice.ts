import type { ReactNode } from "react";
import { LangSlug } from "./languages";

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

export type SectionSnapshotData = Record<string, string>;

export type UnderstandingSnapshot = {
  restatement: string;
  inputsOutputs: string;
  constraints: string;
  edgeCases: string;
};

export type ApproachSnapshot = {
  approach: string;
  reasoning: string;
};

export type AlgorithmSnapshot = {
  pseudocode: string;
};

export type ImplementationSnapshot = {
  code: string;
  language: LangSlug;
  output: string;
};

export type ComplexitySnapshot = {
  timeComplexity: string;
  spaceComplexity: string;
};

export type SectionSnapshots = {
  problem_understanding: UnderstandingSnapshot;
  approach_and_reasoning: ApproachSnapshot;
  algorithm_design: AlgorithmSnapshot;
  implementation: ImplementationSnapshot;
  complexity_analysis: ComplexitySnapshot;
};
