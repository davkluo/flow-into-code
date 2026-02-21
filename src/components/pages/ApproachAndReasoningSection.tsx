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

export type ApproachSnapshot = {
  approach: string;
  reasoning: string;
};

interface ApproachAndReasoningSectionProps {
  fields: ApproachSnapshot;
  onFieldChange: (key: keyof ApproachSnapshot, value: string) => void;
  messages: SessionMessage[];
  onSend: (content: string, snapshot: ApproachSnapshot) => Promise<void>;
  cooldownUntil?: number;
}

const FIELDS: SectionField<ApproachSnapshot>[] = [
  {
    key: "approach",
    label: "Approach",
    threshold: 50,
    tooltip:
      "Describe the overall approach you're taking — what algorithm or technique you're using and how it solves the problem. You can start with a naive solution and refine from there.",
    placeholder: "Describe your approach.",
  },
  {
    key: "reasoning",
    label: "Reasoning",
    threshold: 30,
    tooltip:
      "What's the core insight that makes this approach work? Why did you choose it over alternatives? Note any complexity or implementation trade-offs you considered.",
    placeholder:
      "Why does this approach work? What trade-offs did you consider?",
  },
];

export function ApproachAndReasoningSection({
  fields,
  onFieldChange,
  messages,
  onSend,
  cooldownUntil,
}: ApproachAndReasoningSectionProps) {
  const isFieldFilled = (key: keyof ApproachSnapshot): boolean => {
    const field = FIELDS.find((f) => f.key === key)!;
    return fields[key].length >= field.threshold;
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader sectionKey="approach_and_reasoning" />

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
            location="approach_and_reasoning"
            messages={messages}
            onSend={(content) => onSend(content, { ...fields })}
            cooldownUntil={cooldownUntil}
            layoutMode="fixed"
            title="AI Interviewer &mdash; Think Out Loud"
            titleTooltip={
              <div className="space-y-1.5">
                <p>
                  Talk through your approach with an AI interviewer. They&apos;ll
                  ask probing questions and push back on your reasoning — if
                  there are flaws or weak trade-off decisions, expect to be
                  questioned rather than told.
                </p>
                <p>
                  Think out loud the way you would with a real interviewer.
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
