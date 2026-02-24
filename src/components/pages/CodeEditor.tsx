"use client";

import { autocompletion } from "@codemirror/autocomplete";
import { indentUnit } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import {
  codeMirrorDarkSyntax,
  codeMirrorTheme,
  languages,
} from "@/lib/codeMirror";
import { LangSlug } from "@/types/languages";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: LangSlug;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  const extensions = useMemo(
    () => [
      EditorView.lineWrapping,
      indentUnit.of("    "), // 4 space indents
      autocompletion(),
      languages[language],
      codeMirrorTheme,
      ...(resolvedTheme === "dark" ? [codeMirrorDarkSyntax] : []),
    ],
    [language, resolvedTheme],
  );

  return (
    <CodeMirror
      value={value}
      height="100%"
      className="h-full [&_.cm-content]:!pt-10"
      theme="none"
      basicSetup={{ tabSize: 4 }}
      extensions={extensions}
      onChange={onChange}
    />
  );
}
