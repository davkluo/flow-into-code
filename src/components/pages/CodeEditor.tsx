"use client";

import { autocompletion } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { languages, codeMirrorTheme } from "@/lib/codeMirror";
import { LangSlug } from "@/types/problem";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: LangSlug;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
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
      ]}
      onChange={onChange}
    />
  );
}
