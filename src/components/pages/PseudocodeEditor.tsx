"use client";

import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";

interface PseudocodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PseudocodeEditor({ value, onChange }: PseudocodeEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="bg-background h-full w-full rounded-md border p-2 text-sm">
      <CodeMirror
        value={value}
        height="100%"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        basicSetup={{
          tabSize: 2,
        }}
        extensions={[EditorView.lineWrapping]}
        onChange={onChange}
      />
    </div>
  );
}
