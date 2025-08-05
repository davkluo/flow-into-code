"use client";

import { autocompletion } from "@codemirror/autocomplete";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { useState } from "react";
import { useTheme } from "next-themes";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const languages = {
  python: python(),
  javascript: javascript({ typescript: true }),
  cpp: cpp(),
  java: java(),
};

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const [language, setLanguage] = useState<keyof typeof languages>("python");

  return (
    <ScrollArea className="relative h-full w-full">
      <CodeMirror
        value={value}
        height="100%"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        basicSetup={{
          tabSize: 2,
        }}
        extensions={[
          EditorView.lineWrapping,
          autocompletion(),
          languages[language],
        ]}
        onChange={onChange}
      />
      <Select
        value={language}
        onValueChange={setLanguage as (value: string) => void}
      >
        <SelectTrigger className="absolute right-2 bottom-2 z-10 h-fit w-fit text-xs">
          <SelectValue placeholder="hello" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>{" "}
    </ScrollArea>
  );
}
