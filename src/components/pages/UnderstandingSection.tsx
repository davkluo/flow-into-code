"use client";

import { useState } from "react";
import { ChatBox } from "@/components/pages/ChatBox";
import { SectionHeader } from "@/components/pages/SectionHeader";
import { Textarea } from "@/components/ui/textarea";
import { Message } from "@/types/chat";

interface UnderstandingSectionProps {
  messages: Message[];
  onSend: (content: string) => Promise<void>;
}

const FIELDS = [
  {
    key: "restatement",
    label: "In your own words",
    placeholder:
      "Restate what the problem is asking. What is the goal? What needs to happen?",
    minHeight: "min-h-32",
  },
  {
    key: "inputsOutputs",
    label: "Inputs & Outputs",
    placeholder:
      "What are the inputs and their types? What should the output look like?",
    minHeight: "min-h-24",
  },
  {
    key: "constraints",
    label: "Constraints",
    placeholder:
      "Note important constraints: size limits, value ranges, special conditions...",
    minHeight: "min-h-20",
  },
  {
    key: "edgeCases",
    label: "Edge cases",
    placeholder:
      "What edge cases should you consider? Empty inputs, single elements, duplicates, boundary values...",
    minHeight: "min-h-24",
  },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function UnderstandingSection({
  messages,
  onSend,
}: UnderstandingSectionProps) {
  const [fields, setFields] = useState<Record<FieldKey, string>>({
    restatement: "",
    inputsOutputs: "",
    constraints: "",
    edgeCases: "",
  });

  const updateField = (key: FieldKey, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col gap-8">
      <SectionHeader sectionKey="problem_understanding" />

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <div className="flex min-h-0 flex-col gap-4">
          {FIELDS.map((field) => (
            <div
              key={field.key}
              className="border-input flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border"
            >
              <div className="border-input border-b px-3 py-2">
                <span className="text-sm font-medium">{field.label}</span>
              </div>
              <Textarea
                value={fields[field.key]}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="min-h-0 flex-1 resize-none rounded-none border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          ))}
        </div>
        <div className="flex min-h-0 flex-col gap-4">
          <ChatBox
            location="problem_understanding"
            messages={messages}
            onSend={onSend}
            layoutMode="fixed"
            title="AI Interviewer"
            placeholder="Ask clarifying questions or discuss your understanding..."
            emptyStateMessage="Chat with the AI interviewer to verify your understanding of the problem."
          />
        </div>
      </div>
    </div>
  );
}
