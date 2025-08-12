"use client";

import { ChatBox } from "@/components/pages/ChatBox";
import { AccordionContent } from "@/components/ui/accordion";
import { Message } from "@/types/chat";

interface ThoughtProcessSectionProps {
  messages: Message[];
  onSend: (content: string) => Promise<void>;
}

export function ThoughtProcessSection({
  messages,
  onSend,
}: ThoughtProcessSectionProps) {
  return (
    <AccordionContent className="flex flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Share your thought process on how you would approach solving the
        problem. You may want to outline your strategy, potential edge cases,
        and any initial ideas you have. You may also ask for minor hints to
        guide your thinking.
      </p>
      <ChatBox
        location="thought_process"
        messages={messages}
        onSend={onSend}
        layoutMode="grow"
      />
    </AccordionContent>
  );
}
