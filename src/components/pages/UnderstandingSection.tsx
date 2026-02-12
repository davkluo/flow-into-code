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

export function UnderstandingSection({
  messages,
  onSend,
}: UnderstandingSectionProps) {
  const [interpretation, setInterpretation] = useState("");

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col gap-8">
      <SectionHeader sectionKey="problem_understanding" />

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
        <div className="border-input flex min-h-0 flex-col overflow-hidden rounded-md border">
          <div className="border-input border-b px-3 py-2">
            <span className="text-sm font-medium">Your interpretation</span>
          </div>
          <Textarea
            id="interpretation"
            value={interpretation}
            onChange={(e) => setInterpretation(e.target.value)}
            placeholder="Restate the problem in your own words. What are the inputs? What are the expected outputs? What constraints apply?"
            className="min-h-0 flex-1 resize-none rounded-none border-0 shadow-none focus-visible:ring-0"
          />
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
