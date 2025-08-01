"use client";

import { useState } from "react";
import { ChatBox } from "@/components/pages/ChatBox";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Message } from "@/types/chat";
import { PracticeProblem } from "@/types/practice";
import { PseudocodeEditor } from "./PseudocodeEditor";

interface PseudocodeSectionProps {
  problem: PracticeProblem | null;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function PseudocodeSection({
  problem,
  onNext,
  isCurrentStep,
}: PseudocodeSectionProps) {
  const [pseudocode, setPseudocode] = useState("");
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
    <AccordionContent className="flex h-120 flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Develop pseudocode for your solution to the problem. This should outline
        the main steps you would take to solve the problem without getting into
        specific syntax. Focus on the logic and structure of your solution.
        Consider edge cases and how you would handle them in your pseudocode.
      </p>

      <ResizablePanelGroup direction="horizontal" className="w-full">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full w-full items-center justify-center">
            <div className="bg-background h-full w-full rounded-l-md border border-r-0 p-2 text-sm">
              <PseudocodeEditor value={pseudocode} onChange={setPseudocode} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full min-h-0 w-full items-center justify-center">
            <div className="bg-background h-full min-h-0 w-full rounded-r-md border border-l-0 p-2 text-sm">
              <ChatBox
                messages={messages}
                onSend={handleSend}
                layoutMode="fixed"
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
