"use client";

import { AccordionContent } from "@/components/ui/accordion";
import { Message } from "@/types/chat";
import { ChatBox } from "./ChatBox";

interface complexityAnalysisSectionProps {
  messages: Message[];
  onSend: (content: string) => Promise<void>;
}

export function ComplexityAnalysisSection({
  messages,
  onSend,
}: complexityAnalysisSectionProps) {
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
        onSend={onSend}
        layoutMode="grow"
      />
    </AccordionContent>
  );
}
