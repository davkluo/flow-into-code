import type { Extension } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";

export type LanguageKey = "python" | "javascript" | "cpp" | "java";

export const languages: Record<LanguageKey, Extension> = {
  python: python(),
  javascript: javascript({ typescript: true }),
  cpp: cpp(),
  java: java(),
};

export const languageOptions: Record<LanguageKey, string> = {
  python: "Python",
  javascript: "JavaScript",
  cpp: "C++",
  java: "Java",
};