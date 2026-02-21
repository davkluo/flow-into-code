"use client";

import { autocompletion } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { codeMirrorDarkSyntax, codeMirrorTheme, languages } from "@/lib/codeMirror";
import { LangSlug } from "@/types/problem";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: LangSlug;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <CodeMirror
      value={value}
      height="100%"
      className="h-full [&_.cm-content]:!pt-10"
      theme="none"
      basicSetup={{ tabSize: 2 }}
      extensions={[
        EditorView.lineWrapping,
        autocompletion(),
        languages[language],
        codeMirrorTheme,
        ...(resolvedTheme === "dark" ? [codeMirrorDarkSyntax] : []),
      ]}
      onChange={onChange}
    />
  );
}
