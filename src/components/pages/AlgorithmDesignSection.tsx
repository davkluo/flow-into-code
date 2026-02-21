"use client";

import { CheckIcon, InfoIcon } from "lucide-react";
import { ChatBox } from "@/components/pages/ChatBox";
import { SectionHeader } from "@/components/pages/SectionHeader";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SessionMessage } from "@/types/chat";
import { SectionField } from "@/types/practice";
import { PseudocodeEditor } from "./PseudocodeEditor";

export type AlgorithmSnapshot = {
  pseudocode: string;
};

interface AlgorithmDesignSectionProps {
  pseudocode: string;
  onPseudocodeChange: (value: string) => void;
  messages: SessionMessage[];
  onSend: (content: string, snapshot: AlgorithmSnapshot) => Promise<void>;
  cooldownUntil?: number;
}

const FIELD: SectionField<AlgorithmSnapshot> = {
  key: "pseudocode",
  label: "Pseudocode",
  threshold: 50,
  tooltip:
    "Write your algorithm in plain English — no syntax required. Focus on the logic and order of operations, not on a specific language. Use indentation to show structure.",
  placeholder: "",
};

export function AlgorithmDesignSection({
  pseudocode,
  onPseudocodeChange,
  messages,
  onSend,
  cooldownUntil,
}: AlgorithmDesignSectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader sectionKey="algorithm_design" />

      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
        <div className="flex h-[26rem] flex-col">
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
                </TooltipContent>
              </Tooltip>
              {pseudocode.length >= FIELD.threshold && (
                <CheckIcon className="ml-auto size-4 text-lime-400" />
              )}
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-0">
                <PseudocodeEditor value={pseudocode} onChange={onPseudocodeChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[26rem] flex-col">
          <ChatBox
            location="algorithm_design"
            messages={messages}
            onSend={(content) => onSend(content, { pseudocode })}
            cooldownUntil={cooldownUntil}
            layoutMode="fixed"
            title="AI Interviewer &mdash; Walk Through Your Algorithm"
            titleTooltip={
              <div className="space-y-1.5">
                <p>
                  Walk through your pseudocode with an AI interviewer.
                  They&apos;ll probe your logic and ask about edge cases — if
                  something&apos;s off, you&apos;ll be questioned rather than
                  corrected.
                </p>
                <p>
                  Narrate what you&apos;d say before opening your editor in a
                  real interview.
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
