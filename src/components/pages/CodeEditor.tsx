"use client";

import { autocompletion } from "@codemirror/autocomplete";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
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
import { LanguageKey, languageOptions, languages } from "@/lib/codeMirror";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: LanguageKey;
  onLanguageChange: (language: LanguageKey) => void;
}

export function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();

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
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="absolute right-2 bottom-2 z-10 h-fit w-fit text-xs backdrop-blur-sm">
          <SelectValue placeholder="hello" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.keys(languages).map((lang) => (
              <SelectItem
                key={`code-language-select-${lang}`}
                value={lang as LanguageKey}
              >
                {languageOptions[lang as LanguageKey]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>{" "}
    </ScrollArea>
  );
}
