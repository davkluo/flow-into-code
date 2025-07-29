"use client";

import { useState } from "react";
import { ProblemSelectSection } from "@/components/pages/ProblemSelectSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Problem } from "@/types/leetcode";
import { ClarificationSection } from "./ClarificationSection";

interface PracticeAccordionSectionsProps {
  problems: Problem[];
}

const sections = [
  "accordion-item-problem-selection",
  "accordion-item-clarification",
  "accordion-item-thought-process",
  "accordion-item-pseudocode",
  "accordion-item-implementation",
  "accordion-item-complexity-analysis",
];

export function PracticeAccordionSections({
  problems,
}: PracticeAccordionSectionsProps) {
  const [openSections, setOpenSections] = useState<string[]>([sections[0]]);

  const openNextSection = (current: string) => {
    const currentIndex = sections.indexOf(current);
    if (currentIndex === -1 || currentIndex === sections.length - 1) return;

    const next = sections[currentIndex + 1];
    setOpenSections((prev) => [
      ...prev.filter((section) => section !== current),
      next,
    ]);
  };

  return (
    <Accordion
      type="multiple"
      className="w-full"
      value={openSections}
      onValueChange={setOpenSections}
    >
      <AccordionItem value="accordion-item-problem-selection">
        <AccordionTrigger>1. Select Problem</AccordionTrigger>
        <ProblemSelectSection
          problems={problems}
          onNext={() => openNextSection("accordion-item-problem-selection")}
        />
      </AccordionItem>
      <AccordionItem value="accordion-item-clarification">
        <AccordionTrigger>2. Ask Clarifying Questions</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <ClarificationSection />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-item-thought-process">
        <AccordionTrigger>3. Explain Thought Process</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance"></AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-item-pseudocode">
        <AccordionTrigger>4. Draft Pseudocode</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>Placeholder</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-item-implementation">
        <AccordionTrigger>5. Implement Code</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>Placeholder</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-item-complexity-analysis">
        <AccordionTrigger>6. Analyze Complexity</AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>Placeholder</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
