"use client";

import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  InfoIcon,
  PlayIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ChatBox } from "@/components/pages/ChatBox";
import { SectionHeader } from "@/components/pages/SectionHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_LANGUAGE, SUPPORTED_LANGS } from "@/constants/languages";
import { languageOptions } from "@/lib/codeMirror";
import { processCodeSnippet } from "@/lib/codeSnippet";
import { SessionMessage } from "@/types/chat";
import { SectionField } from "@/types/practice";
import { LangSlug } from "@/types/problem";
import { CodeEditor } from "./CodeEditor";

export type ImplementationSnapshot = {
  code: string;
  language: LangSlug;
  output?: string;
};

interface ImplementationSectionProps {
  messages: SessionMessage[];
  onSend: (content: string, snapshot: ImplementationSnapshot) => Promise<void>;
  cooldownUntil?: number;
  codeSnippets: Partial<Record<LangSlug, string>>;
}

const FIELD: SectionField<{ code: string }> = {
  key: "code",
  label: "Code",
  threshold: 50,
  tooltip:
    "Translate your pseudocode into working code. Focus on correctness and readability — use clear variable names and handle the edge cases you identified earlier.",
  placeholder: "",
  formatHint: (
    <p className="mt-1.5">
      Write your own test cases to verify your solution against the examples and
      edge cases you identified.
    </p>
  ),
};

export function ImplementationSection({
  messages,
  onSend,
  cooldownUntil,
  codeSnippets,
}: ImplementationSectionProps) {
  const getSnippet = (lang: LangSlug) =>
    processCodeSnippet(codeSnippets[lang] ?? "", lang);

  const [language, setLanguage] = useState<LangSlug>(DEFAULT_LANGUAGE);
  const [code, setCode] = useState(() => getSnippet(DEFAULT_LANGUAGE));
  const [output, setOutput] = useState<string | undefined>(undefined);

  const [outputVisible, setOutputVisible] = useState(false);

  useEffect(() => {
    setCode(getSnippet(language));
    // Intentionally depends only on codeSnippets identity — resets editor when a new problem is loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeSnippets]);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader sectionKey="implementation" />

      {/* On mobile: code editor → output → chatbox (DOM order).
          On desktop: [code editor | chatbox] row, output full-width below. */}
      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
        {/* Code editor — col 1, row 1 on desktop */}
        <div className="flex h-[26rem] flex-col sm:col-start-1 sm:row-start-1">
          <div className="border-input flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border">
            <div className="border-input flex items-center gap-2 border-b px-3 py-2.5">
              <span className="text-sm font-medium">{FIELD.label}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <InfoIcon className="text-muted-foreground size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="w-[22rem]">
                  <p>{FIELD.tooltip}</p>
                  {FIELD.formatHint}
                </TooltipContent>
              </Tooltip>
              {code.length - getSnippet(language).length >= FIELD.threshold && (
                <CheckIcon className="ml-auto size-4 text-lime-400" />
              )}
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-0">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                />
              </div>
              {/* Floating controls */}
              <div className="absolute inset-x-3 top-2 z-10 flex items-center justify-center gap-2">
                <Select
                  value={language}
                  onValueChange={(v) => {
                    const newLang = v as LangSlug;
                    setLanguage(newLang);
                    setCode(getSnippet(newLang));
                  }}
                >
                  <SelectTrigger className="!h-6 w-fit gap-1 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 py-0 text-xs shadow-none backdrop-blur-sm hover:to-white/80 focus:ring-0 focus-visible:ring-0 dark:border-white/15 dark:bg-transparent dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGS.map((slug) => (
                      <SelectItem key={slug} value={slug} className="text-xs">
                        {languageOptions[slug]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 text-xs backdrop-blur-sm hover:to-white/80 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]"
                  onClick={() => setOutputVisible(true)}
                >
                  <PlayIcon className="size-3" />
                  Run
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 text-xs backdrop-blur-sm hover:to-white/80 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]"
                >
                  <CopyIcon className="size-3" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 text-xs backdrop-blur-sm hover:to-white/80 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]"
                >
                  <ExternalLinkIcon className="size-3" />
                  Submit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 text-xs backdrop-blur-sm hover:to-white/80 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]"
                  onClick={() => setCode(getSnippet(language))}
                >
                  <RotateCcwIcon className="size-3" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Output panel — between editor and chat on mobile; full-width row 2 on desktop */}
        {outputVisible && (
          <div className="flex flex-col overflow-hidden rounded-md border sm:col-span-2 sm:row-start-2">
            <div className="border-input flex items-center border-b px-3 py-2.5">
              <span className="text-sm font-medium">Output</span>
            </div>
            <div className="text-muted-foreground p-3 font-mono text-sm">
              {output ?? "Code execution coming soon."}
            </div>
          </div>
        )}

        {/* ChatBox — col 2, row 1 on desktop */}
        <div className="flex h-[26rem] flex-col sm:col-start-2 sm:row-start-1">
          <ChatBox
            location="implementation"
            messages={messages}
            onSend={(content) => onSend(content, { code, language, output })}
            cooldownUntil={cooldownUntil}
            layoutMode="fixed"
            title="AI Interviewer &mdash; Walk Through Your Code"
            titleTooltip={
              <div className="space-y-1.5">
                <p>
                  Walk through your implementation with an AI interviewer.
                  They&apos;ll ask you to explain your logic, naming choices,
                  and edge case handling — if something looks off, you&apos;ll
                  be questioned rather than corrected.
                </p>
                <p>
                  Explain your code the way you would in a real interview. The
                  AI interviewer can also help provide guidance for debugging.
                </p>
              </div>
            }
            emptyStateMessage="No messages yet."
          />
        </div>
      </div>
    </div>
  );
}
