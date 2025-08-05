"use client";

import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PseudocodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function PseudocodeEditor({ value, onChange }: PseudocodeEditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <ScrollArea className="h-full w-full">
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
    </ScrollArea>
  );
}
