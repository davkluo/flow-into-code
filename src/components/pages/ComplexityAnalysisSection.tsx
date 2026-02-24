"use client";

import { CheckIcon, InfoIcon } from "lucide-react";
import { ChatBox } from "@/components/pages/ChatBox";
import { SectionHeader } from "@/components/pages/SectionHeader";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionMessage } from "@/types/chat";
import { SectionField } from "@/types/practice";

export type ComplexitySnapshot = {
  timeComplexity: string;
  spaceComplexity: string;
};

interface ComplexityAnalysisSectionProps {
  fields: ComplexitySnapshot;
  onFieldChange: (key: keyof ComplexitySnapshot, value: string) => void;
  messages: SessionMessage[];
  onSend: (content: string) => Promise<void>;
  cooldownUntil?: number;
}

const FIELDS: SectionField<ComplexitySnapshot>[] = [
  {
    key: "timeComplexity",
    label: "Time Complexity",
    threshold: 20,
    tooltip:
      "State the Big-O time complexity of your solution and explain why. Walk through which part of the algorithm drives the dominant term, and note any best-case vs. worst-case differences if relevant.",
    placeholder:
      "e.g. O(n log n) — because we sort the array once, then do a linear scan...",
  },
  {
    key: "spaceComplexity",
    label: "Space Complexity",
    threshold: 20,
    tooltip:
      "State the Big-O space complexity and explain what data structures or call stack depth account for it. Note whether you considered an in-place alternative and why you did or didn't use one.",
    placeholder:
      "e.g. O(n) — we store all elements in a hash map for O(1) lookup...",
  },
];

export function ComplexityAnalysisSection({
  fields,
  onFieldChange,
  messages,
  onSend,
  cooldownUntil,
}: ComplexityAnalysisSectionProps) {
  const isFieldFilled = (key: keyof ComplexitySnapshot): boolean => {
    const field = FIELDS.find((f) => f.key === key)!;
    return fields[key].length >= field.threshold;
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader sectionKey="complexity_analysis" />

      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
        <div className="flex h-[26rem] flex-col gap-4">
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className="border-input flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border"
            >
              <div className="border-input flex items-center gap-2 border-b px-3 py-2.5">
                <span className="text-sm font-medium">{field.label}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <InfoIcon className="text-muted-foreground size-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="w-[22rem]">
                    <p>{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
                {isFieldFilled(field.key) && (
                  <CheckIcon className="ml-auto size-4 text-lime-400" />
                )}
              </div>
              <Textarea
                value={fields[field.key]}
                onChange={(e) => onFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-0 flex-1 resize-none rounded-none border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          ))}
        </div>

        <div className="flex h-[26rem] flex-col">
          <ChatBox
            location="complexity_analysis"
            messages={messages}
            onSend={onSend}
            cooldownUntil={cooldownUntil}
            layoutMode="fixed"
            title="AI Interviewer &mdash; Justify Your Analysis"
            titleTooltip={
              <div className="space-y-1.5">
                <p>
                  Walk through your complexity analysis with an AI interviewer.
                  They&apos;ll probe your Big-O reasoning and ask you to justify
                  the dominant terms — if the analysis is off or the explanation
                  is shallow, expect to be questioned rather than corrected.
                </p>
                <p>
                  Explain your reasoning the way you would in a real interview.
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
