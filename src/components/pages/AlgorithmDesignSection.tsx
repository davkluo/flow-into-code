"use client";

import { CheckIcon, InfoIcon } from "lucide-react";
import { ChatBox } from "@/components/pages/ChatBox";
import { SectionHeader } from "@/components/pages/SectionHeader";
import {
  AdaptiveTooltip,
  AdaptiveTooltipContent,
  AdaptiveTooltipTrigger,
} from "@/components/ui/adaptive-tooltip";
import { SessionMessage } from "@/types/chat";
import { AlgorithmSnapshot, SectionField } from "@/types/practice";
import { PseudocodeEditor } from "./PseudocodeEditor";

interface AlgorithmDesignSectionProps {
  fields: AlgorithmSnapshot;
  onFieldChange: (key: keyof AlgorithmSnapshot, value: string) => void;
  messages: SessionMessage[];
  onSend: (content: string) => Promise<void>;
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
  fields,
  onFieldChange,
  messages,
  onSend,
  cooldownUntil,
}: AlgorithmDesignSectionProps) {
  const { pseudocode } = fields;
  return (
    <div className="flex flex-col gap-8">
      <SectionHeader sectionKey="algorithm_design" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:grid-rows-[37rem]">
        <div className="flex h-[37rem] flex-col">
          <div className="border-input flex h-full flex-col overflow-hidden rounded-md border">
            <div className="border-input flex items-center gap-2 border-b px-3 py-2.5">
              <span className="text-sm font-medium">{FIELD.label}</span>
              <AdaptiveTooltip>
                <AdaptiveTooltipTrigger asChild>
                  <span className="inline-flex">
                    <InfoIcon className="text-muted-foreground size-3.5" />
                  </span>
                </AdaptiveTooltipTrigger>
                <AdaptiveTooltipContent side="right" className="w-[22rem]">
                  <p>{FIELD.tooltip}</p>
                </AdaptiveTooltipContent>
              </AdaptiveTooltip>
              {pseudocode.length >= FIELD.threshold && (
                <CheckIcon className="ml-auto size-4 text-brand-secondary" />
              )}
            </div>
            <div className="relative flex-1 overflow-hidden" data-testid="pseudocode-editor">
              <div className="absolute inset-0">
                <PseudocodeEditor
                  value={pseudocode}
                  onChange={(v) => onFieldChange("pseudocode", v)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex h-full flex-col">
          <ChatBox
            messages={messages}
            onSend={onSend}
            cooldownUntil={cooldownUntil}
            layoutMode="fixed"
            testIdPrefix="algorithm-chat"
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
