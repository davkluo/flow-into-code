"use client";

import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  InfoIcon,
  Loader2Icon,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CODE_EXECUTION_COOLDOWN_MS } from "@/constants/execution";
import { SUPPORTED_LANGS } from "@/constants/languages";
import { toast } from "sonner";
import { authFetch } from "@/lib/authFetch";
import { languageOptions } from "@/lib/codeMirror";
import { processCodeSnippet, stripTestBlock } from "@/lib/codeSnippet";
import { SessionMessage } from "@/types/chat";
import { SectionField } from "@/types/practice";
import { LangSlug } from "@/types/problem";
import { CodeEditor } from "./CodeEditor";

export type ImplementationSnapshot = {
  code: string;
  language: LangSlug;
  output: string;
};

interface ImplementationSectionProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: LangSlug;
  onLanguageChange: (lang: LangSlug) => void;
  messages: SessionMessage[];
  onSend: (content: string) => Promise<void>;
  cooldownUntil?: number;
  codeSnippets: Partial<Record<LangSlug, string>>;
  titleSlug: string;
  output: string;
  onOutputChange: (output: string) => void;
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
  code,
  onCodeChange,
  language,
  onLanguageChange,
  messages,
  onSend,
  cooldownUntil,
  codeSnippets,
  titleSlug,
  output,
  onOutputChange,
}: ImplementationSectionProps) {
  const getSnippet = (lang: LangSlug) =>
    processCodeSnippet(codeSnippets[lang] ?? "", lang);
  const [outputVisible, setOutputVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isError, setIsError] = useState(false);
  const [executionCooldownUntil, setExecutionCooldownUntil] = useState(0);
  const [runSecondsLeft, setRunSecondsLeft] = useState(0);

  useEffect(() => {
    const remaining = Math.ceil((executionCooldownUntil - Date.now()) / 1000);
    if (remaining <= 0) {
      setRunSecondsLeft(0);
      return;
    }
    setRunSecondsLeft(remaining);
    const id = setInterval(() => {
      const r = Math.ceil((executionCooldownUntil - Date.now()) / 1000);
      if (r <= 0) {
        setRunSecondsLeft(0);
        clearInterval(id);
      } else {
        setRunSecondsLeft(r);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [executionCooldownUntil]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard.");
  };

  const handleSubmit = async () => {
    await navigator.clipboard.writeText(stripTestBlock(code, language));
    toast.success("Solution copied to clipboard.");
    window.open(`https://leetcode.com/problems/${titleSlug}/`, "_blank");
  };

  const handleRun = async () => {
    setIsRunning(true);
    setIsError(false);
    setOutputVisible(true);
    onOutputChange("");
    try {
      const res = await authFetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });

      const data = await res.json();
      const hasError = !!data.stderr || !!data.timeout;
      setIsError(hasError);
      onOutputChange(data.stdout || data.stderr || "No output.");
    } catch {
      setIsError(true);
      onOutputChange("Error executing code. Please try again.");
    } finally {
      setIsRunning(false);
      setExecutionCooldownUntil(Date.now() + CODE_EXECUTION_COOLDOWN_MS);
    }
  };

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
                  onChange={onCodeChange}
                  language={language}
                />
              </div>
              {/* Floating controls */}
              <div className="absolute inset-x-3 top-2 z-10 flex items-center justify-between">
                <Select
                  value={language}
                  onValueChange={(v) => {
                    const newLang = v as LangSlug;
                    onLanguageChange(newLang);
                    onCodeChange(getSnippet(newLang));
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

                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 text-xs backdrop-blur-sm hover:to-white/80 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]"
                    disabled={isRunning || runSecondsLeft > 0}
                    onClick={handleRun}
                  >
                    {isRunning ? (
                      <Loader2Icon className="size-3 animate-spin" />
                    ) : (
                      <PlayIcon className="size-3" />
                    )}
                    {isRunning
                      ? "Running"
                      : runSecondsLeft > 0
                        ? `Wait ${runSecondsLeft}s`
                        : "Run"}
                  </Button>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 text-xs backdrop-blur-sm hover:to-white/80 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]"
                        onClick={handleCopy}
                      >
                        <CopyIcon className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-max">
                      <p>Copy full code to clipboard</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 text-xs backdrop-blur-sm hover:to-white/80 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]"
                        onClick={handleSubmit}
                      >
                        <ExternalLinkIcon className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-max">
                      <p>Copy solution (without local test cases) and open LeetCode</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 rounded-md border border-black/10 bg-gradient-to-b from-white/30 to-white/60 px-2 text-xs backdrop-blur-sm hover:to-white/80 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]"
                        onClick={() => onCodeChange(getSnippet(language))}
                      >
                        <RotateCcwIcon className="size-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-max">
                      <p>Reset code to default</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Output panel — between editor and chat on mobile; full-width row 2 on desktop */}
        {outputVisible && (
          <div className="flex flex-col overflow-hidden rounded-md border sm:col-span-2 sm:row-start-2">
            <div className="border-input flex items-center border-b px-3 py-2.5">
              {isRunning ? (
                <span className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
                  <Loader2Icon className="size-3.5 animate-spin" />
                  Loading output
                </span>
              ) : (
                <>
                  <span className="text-sm font-medium">Output &mdash;</span>
                  <span
                    className={`ml-1.5 text-sm ${isError ? "text-destructive" : "text-lime-400"}`}
                  >
                    {isError ? "Error" : "Run successful"}
                  </span>
                </>
              )}
            </div>
            <div className="p-3">
              {isRunning ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3.5 w-2/5" />
                </div>
              ) : (
                <span
                  className={`font-mono text-sm ${isError ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {output}
                </span>
              )}
            </div>
          </div>
        )}

        {/* ChatBox — col 2, row 1 on desktop */}
        <div className="flex h-[26rem] flex-col sm:col-start-2 sm:row-start-1">
          <ChatBox
            location="implementation"
            messages={messages}
            onSend={onSend}
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
