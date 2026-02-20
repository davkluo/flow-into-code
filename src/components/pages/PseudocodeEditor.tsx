"use client";

import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { codeMirrorTheme } from "@/lib/codeMirror";

interface PseudocodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PseudocodeEditor({ value, onChange }: PseudocodeEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="100%"
      className="h-full"
      theme="none"
      basicSetup={{
        tabSize: 2,
      }}
      extensions={[EditorView.lineWrapping, codeMirrorTheme]}
      onChange={onChange}
    />
  );
}
