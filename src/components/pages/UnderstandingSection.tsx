"use client";

import { CheckIcon, InfoIcon } from "lucide-react";
import { ChatBox } from "@/components/pages/ChatBox";
import { SectionHeader } from "@/components/pages/SectionHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionMessage } from "@/types/chat";
import { SectionField, UnderstandingSnapshot } from "@/types/practice";

interface UnderstandingSectionProps {
  fields: UnderstandingSnapshot;
  onFieldChange: (key: keyof UnderstandingSnapshot, value: string) => void;
  messages: SessionMessage[];
  onSend: (content: string) => Promise<void>;
  cooldownUntil?: number;
}

const FIELDS: SectionField<UnderstandingSnapshot>[] = [
  {
    key: "restatement",
    label: "Restate Problem",
    threshold: 50,
    tooltip:
      "Explain the problem without referencing the original prompt. This confirms you understand what's actually being asked.",
    formatHint: (
      <div className="mt-2 space-y-0.5">
        <p className="font-medium underline">Example</p>
        <p>Given a collection and some condition...</p>
        <p>The goal is to find elements that satisfy that condition.</p>
        <p>It should return the position(s) of those elements.</p>
        <p>There is always exactly one valid answer.</p>
      </div>
    ),
    placeholder: "Restate the problem in your own words.",
  },
  {
    key: "inputsOutputs",
    label: "Inputs & Outputs",
    threshold: 20,
    tooltip:
      "Be specific about types — array of integers, string, etc. Note any assumptions about the inputs here too.",
    formatHint: (
      <div className="mt-2 space-y-1">
        <p className="font-medium underline">Example</p>
        <div>
          <p className="font-medium">Input:</p>
          <ul className="ml-3 list-disc space-y-0.5">
            <li>nums — int[], the values to search</li>
            <li>target — int, the condition to match</li>
          </ul>
        </div>
        <div>
          <p className="font-medium">Output:</p>
          <ul className="ml-3 list-disc space-y-0.5">
            <li>int[] — indices of the matching elements</li>
          </ul>
        </div>
      </div>
    ),
    placeholder: "Describe the inputs and outputs of the problem.",
  },
  {
    key: "constraints",
    label: "Constraints",
    threshold: 10,
    tooltip:
      "Constraints reveal what you can safely assume about the inputs. Identifying key ones — like guaranteed uniqueness or bounded sizes — can directly simplify your algorithm and code structure.",
    formatHint: (
      <div className="mt-2 space-y-1">
        <p className="font-medium underline">Example</p>
        <ul className="ml-3 list-disc space-y-0.5">
          <li>1 ≤ n ≤ 10⁵ → input is never empty</li>
          <li>Exactly one valid answer → can return as soon as found</li>
          <li>Values fit in a 32-bit integer → no overflow to handle</li>
        </ul>
      </div>
    ),
    placeholder: "List any notable constraints.",
  },
  {
    key: "edgeCases",
    label: "Edge cases",
    threshold: 20,
    tooltip:
      "Catching edge cases now prevents bugs later. Think about inputs that could break a naive approach.",
    formatHint: (
      <div className="mt-2 space-y-1">
        <p className="font-medium underline">Example</p>
        <ul className="ml-3 list-disc space-y-0.5">
          <li>Empty input → return early</li>
          <li>All values identical → still need a valid answer</li>
          <li>Large n → O(n²) is too slow</li>
        </ul>
      </div>
    ),
    placeholder: "Note any edge cases.",
  },
];

export function UnderstandingSection({
  fields,
  onFieldChange,
  messages,
  onSend,
  cooldownUntil,
}: UnderstandingSectionProps) {
  const isFieldFilled = (key: keyof UnderstandingSnapshot): boolean => {
    const field = FIELDS.find((f) => f.key === key)!;
    return fields[key].length >= field.threshold;
  };

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader sectionKey="problem_understanding" />

      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
        <div className="border-input overflow-hidden rounded-md border p-0.5">
          <Accordion type="single" collapsible defaultValue="restatement">
            {FIELDS.map((field) => (
              <AccordionItem key={field.key} value={field.key}>
                <AccordionTrigger className="px-3 hover:no-underline">
                  <div className="flex flex-1 items-center justify-between pr-1">
                    <div className="flex items-center gap-2">
                      {field.label}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="inline-flex"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <InfoIcon className="text-muted-foreground size-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="w-[22rem]">
                          <p>{field.tooltip}</p>
                          {field.formatHint}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {isFieldFilled(field.key) && (
                      <CheckIcon className="size-4 text-lime-400" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pt-0 pb-3">
                  <Textarea
                    value={fields[field.key]}
                    onChange={(e) => onFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="min-h-48 resize-none"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <div className="flex h-[26rem] flex-col">
          <ChatBox
            location="problem_understanding"
            messages={messages}
            onSend={onSend}
            cooldownUntil={cooldownUntil}
            layoutMode="fixed"
            title="AI Interviewer &mdash; Ask Clarifying Questions"
            titleTooltip={
              <div className="space-y-1.5">
                <p>
                  The interviewer can answer clarifying questions about the
                  problem — what the inputs look like, what edge cases are in
                  scope, or what the expected output format is.
                </p>
                <p>
                  They won&apos;t confirm whether your understanding is correct
                  or hint at a solution approach.
                </p>
                <p>
                  Ask what you&apos;d ask a real interviewer before you start
                  coding.
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
