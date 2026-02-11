import { SectionKey } from "./practice";

export const PROBLEM_SCHEMA_VERSION = 1;

export const GRADING_CATEGORIES: Record<SectionKey, string> = {
  problem_understanding: "Problem Understanding & Clarification",
  approach_and_reasoning: "Approach & Reasoning",
  algorithm_design: "Algorithm Design / Pseudocode",
  implementation: "Implementation Correctness",
  complexity_analysis: "Time & Space Complexity",
} as const;

export const LangSlug = {
  PYTHON3: "python3",
} as const;

export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export type LangSlug = (typeof LangSlug)[keyof typeof LangSlug];

export type ProcessingStatus = "complete" | "processing";

export type ProcessingLayerMeta =
  | { status: "processing"; updatedAt: number }
  | {
      status: "complete";
      updatedAt: number;
      model: string;
      promptVersion: number;
    };

export interface Tag {
  name: string;
  id: string;
  slug: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  description?: string;
  explanation?: string;
}

export interface Framing {
  canonical: string;
  backend?: string;
  systems?: string;
}

export interface GradingCriterion {
  category: SectionKey;
  description: string;
  maxScore: number;
  guidance?: string;
}

export interface Problem {
  id: string; // LeetCode numbering
  difficulty: ProblemDifficulty;
  isPaidOnly: boolean;
  title: string; // for display
  titleSlug: string; // identifier & url
  topicTags: Tag[];
}

export interface ProblemDetails {
  titleSlug: string;
  source: {
    originalContent: string;
    codeSnippets: Partial<Record<LangSlug, string>>;
    examples: Example[]; // From LC
  };

  derived?: {
    // First creation upon problem start
    framing?: Framing;
    testCases?: TestCase[]; // LLM-generated
    edgeCases?: TestCase[]; // LLM-generated; to be used as hints
    hints?: {
      level: number;
      text: string;
    }[];
    pitfalls?: {
      level: number;
      text: string;
    }[];

    // First creation upon submission evaluation
    solutions?: {
      approach: string;
      explanation: string;
      implementation?: Partial<Record<LangSlug, string>>;
      timeComplexity?: string;
      spaceComplexity?: string;
    }[];
    gradingCriteria?: GradingCriterion[];
  };

  processingMeta?: {
    schemaVersion: number;

    layers?: {
      framing?: ProcessingLayerMeta;
      testCases?: ProcessingLayerMeta;
      edgeCases?: ProcessingLayerMeta;
      hints?: ProcessingLayerMeta;
      pitfalls?: ProcessingLayerMeta;
      solutions?: ProcessingLayerMeta;
      gradingCriteria?: ProcessingLayerMeta;
    };
  };
}
