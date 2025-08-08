"use client";

import { ChatBox } from "@/components/pages/ChatBox";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";

interface ClarificationSectionProps {
  messages: Message[];
  onSend: (content: string) => Promise<void>;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function ClarificationSection({
  messages,
  onSend,
  onNext,
  isCurrentStep,
}: ClarificationSectionProps) {
  return (
    <AccordionContent className="flex flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Ensure that you fully understand the requirements and edge cases of the
        problem before diving into the solution. It may even help to reiterate
        the problem in your own words.
      </p>
      <ChatBox
        location="clarification"
        messages={messages}
        onSend={onSend}
        layoutMode="grow"
      />

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
