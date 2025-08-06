"use client";

import { useState } from "react";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { PracticeProblem } from "@/types/practice";
import { ChatBox } from "./ChatBox";

interface complexityAnalysisSectionProps {
  problem: PracticeProblem | null;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function ComplexityAnalysisSection({
  problem,
  onNext,
  isCurrentStep,
}: complexityAnalysisSectionProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  // TODO: Implement actual AI response logic
  // Create context to send to AI
  // Update context with response from AI
  const handleSend = (content: string) => {
    const newMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, newMessage]);

    // Mock AI response
    const aiResponse: Message = {
      role: "assistant",
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
        Analyze the time and space complexity of your solution. Discuss the
        efficiency of your algorithm, considering both best-case and worst-case
        scenarios. You may also want to compare your solution with alternative
        approaches and their complexities.
      </p>
      <ChatBox
        location="complexity_analysis"
        messages={messages}
        onSend={handleSend}
        layoutMode="grow"
      />

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
