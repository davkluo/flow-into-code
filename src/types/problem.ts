import { SectionKey } from "./practice";

export const PROBLEM_SCHEMA_VERSION = 1;

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

export type ProcessingResult =
  | { status: "complete"; data: ProblemDetails }
  | { status: "processing" }
  | { status: "not_found" };

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

export interface ProblemSolution {
  approach: string;
  explanation: string;
  algorithm: string;
  tradeoffs: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface GradingCriterion {
  category: SectionKey;
  description: string;
  rubric: string;
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
    // First creation on problem view
    framing?: Framing;

    // First creation upon problem start
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
    solutions?: ProblemSolution[];
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
