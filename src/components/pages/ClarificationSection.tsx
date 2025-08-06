"use client";

import { useState } from "react";
import { ChatBox } from "@/components/pages/ChatBox";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  getProblemContext,
  GLOBAL_PROMPT,
  SECTION_PROMPTS,
} from "@/lib/prompts";
import { Message } from "@/types/chat";
import { PracticeProblem } from "@/types/practice";

interface ClarificationSectionProps {
  problem: PracticeProblem;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function ClarificationSection({
  problem,
  onNext,
  isCurrentStep,
}: ClarificationSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: GLOBAL_PROMPT.trim() },
    { role: "system", content: getProblemContext(problem) },
    { role: "system", content: SECTION_PROMPTS["clarification"] },
  ]);

  const handleSend = async (content: string) => {
    const newMessage: Message = { role: "user", content };
    console.log(messages);
    setMessages((prev) => [...prev, newMessage]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, newMessage],
      }),
    });

    const data = await res.json();

    const aiResponse: Message = {
      role: "assistant",
      content: data.message,
    };
    setMessages((prev) => [...prev, aiResponse]);
  };

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
        onSend={handleSend}
        layoutMode="grow"
      />

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
