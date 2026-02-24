export const LangSlug = {
  PYTHON3: "python3",
} as const;

export type LangSlug = (typeof LangSlug)[keyof typeof LangSlug];
