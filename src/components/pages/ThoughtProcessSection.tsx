"use client";

import { useState } from "react";
import { ChatBox } from "@/components/pages/ChatBox";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { PracticeProblem } from "@/types/practice";

interface ThoughtProcessSectionProps {
  problem: PracticeProblem | null;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function ThoughtProcessSection({
  problem,
  onNext,
  isCurrentStep,
}: ThoughtProcessSectionProps) {
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
        Share your thought process on how you would approach solving the
        problem. You may want to outline your strategy, potential edge cases,
        and any initial ideas you have. You may also ask for minor hints to
        guide your thinking.
      </p>
      <ChatBox messages={messages} onSend={handleSend} />

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
