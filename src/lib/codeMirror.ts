import type { Extension } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { EditorView } from "@codemirror/view";

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

// Structural theme using app CSS variables.
// Adapts to light/dark automatically — no resolvedTheme check needed.
// basicSetup includes syntaxHighlighting(defaultHighlightStyle), so code colors are preserved.
export const codeMirrorTheme = EditorView.theme({
  "&": {
    backgroundColor: "color-mix(in oklch, var(--input) 30%, transparent)",
    height: "100%",
  },
  ".cm-content": {
    caretColor: "var(--foreground)",
    fontFamily: "inherit",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--foreground)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
    backgroundColor: "color-mix(in oklch, var(--foreground) 12%, transparent)",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--muted-foreground)",
    border: "none",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
  },
  ".cm-activeLine": {
    backgroundColor:
      "color-mix(in oklch, var(--muted-foreground) 8%, transparent)",
  },
  // Autocomplete popup
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    boxShadow: "var(--shadow-md)",
  },
  ".cm-tooltip-autocomplete ul": {
    fontFamily: "inherit",
  },
  ".cm-tooltip-autocomplete ul li": {
    padding: "2px 8px",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
  ".cm-completionMatchedText": {
    textDecoration: "none",
    fontWeight: "600",
    color: "var(--foreground)",
  },
  ".cm-completionDetail": {
    color: "var(--muted-foreground)",
    fontStyle: "normal",
  },
});