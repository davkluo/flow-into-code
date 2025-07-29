"use client";

import { useState } from "react";
import { ProblemSelectSection } from "@/components/pages/ProblemSelectSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LCProblem } from "@/types/leetcode";
import { PracticeProblem } from "@/types/practice";
import { ClarificationSection } from "./ClarificationSection";

interface PracticeAccordionSectionsProps {
  problems: LCProblem[];
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
  const [hasStarted, setHasStarted] = useState(false);
  const [problem, setProblem] = useState<PracticeProblem | null>(null);

  const openNextSection = (current: string) => {
    const currentIndex = sections.indexOf(current);
    if (currentIndex === -1 || currentIndex === sections.length - 1) return;

    const next = sections[currentIndex + 1];
    setOpenSections((prev) => [
      ...prev.filter((section) => section !== current),
      next,
    ]);
  };

  const handleProblemStart = (problem: PracticeProblem) => {
    setProblem(problem);
    setHasStarted(true);
  };

  return (
    <Accordion
      type="multiple"
      className="w-full"
      value={openSections}
      onValueChange={setOpenSections}
    >
      <AccordionItem value="accordion-item-problem-selection">
        <AccordionTrigger>
          <h2>1. Select Problem</h2>
        </AccordionTrigger>
        <ProblemSelectSection
          problems={problems}
          onNext={() => openNextSection("accordion-item-problem-selection")}
          hasStarted={hasStarted}
          onProblemStart={handleProblemStart}
        />
      </AccordionItem>
      <AccordionItem value="accordion-item-clarification">
        <AccordionTrigger>
          <h2>2. Ask Clarifying Questions</h2>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <ClarificationSection />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-item-thought-process">
        <AccordionTrigger>
          <h2>3. Explain Thought Process</h2>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance"></AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-item-pseudocode">
        <AccordionTrigger>
          <h2>4. Draft Pseudocode</h2>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>Placeholder</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-item-implementation">
        <AccordionTrigger>
          <h2>5. Implement Code</h2>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>Placeholder</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="accordion-item-complexity-analysis">
        <AccordionTrigger>
          <h2>6. Analyze Complexity</h2>
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 text-balance">
          <p>Placeholder</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
