"use client";

import { useState } from "react";
import { ChatBox } from "@/components/pages/ChatBox";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { PracticeProblem } from "@/types/practice";

interface ClarificationSectionProps {
  problem: PracticeProblem | null;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function ClarificationSection({
  problem,
  onNext,
  isCurrentStep,
}: ClarificationSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  // TODO: Implement actual AI response logic
  // Create context to send to AI
  // Update context with response from AI
  const handleSend = (content: string) => {
    const newMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, newMessage]);

    // Mock AI response
    const aiResponse: Message = {
      role: "ai",
      content: `Responding to: ${content}`,
    };
    // Simulate AI response after a short delay
    setTimeout(() => {
      setMessages((prev) => [...prev, aiResponse]);
    }, 500);
  };

  return (
    <AccordionContent className="flex flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Ensure that you fully understand the requirements and edge cases of the
        problem before diving into the solution. It may even help to reiterate
        the problem in your own words.
      </p>
      <ChatBox messages={messages} onSend={handleSend} layoutMode="grow" />

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
