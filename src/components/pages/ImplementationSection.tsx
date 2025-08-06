"use client";

import { useState } from "react";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Message } from "@/types/chat";
import { PracticeProblem } from "@/types/practice";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ChatBox } from "./ChatBox";
import { CodeEditor } from "./CodeEditor";

interface implementationSectionProps {
  problem: PracticeProblem | null;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function ImplementationSection({
  problem,
  onNext,
  isCurrentStep,
}: implementationSectionProps) {
  const [implementation, setImplementation] = useState("");
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
    <AccordionContent className="flex h-120 flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Implement the solution to the problem using your preferred programming
        language. Focus on translating your pseudocode into actual code,
        ensuring that you handle edge cases and follow best practices. You may
        also want to walk through your implementation with sample inputs to
        verify its correctness.
      </p>

      <ResizablePanelGroup direction="horizontal" className="w-full">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full w-full items-center justify-center">
            <div className="bg-background h-full w-full rounded-l-md border border-r-0 p-2 text-sm">
              <CodeEditor value={implementation} onChange={setImplementation} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full min-h-0 w-full items-center justify-center">
            <div className="bg-background h-full min-h-0 w-full rounded-r-md border border-l-0 p-2 text-sm">
              <ChatBox
                location="implementation"
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
