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
import { ThoughtProcessSection } from "./ThoughtProcessSection";

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

const sectionToIndex = (section: string) => {
  return sections.indexOf(section);
};

export function PracticeAccordionSections({
  problems,
}: PracticeAccordionSectionsProps) {
  const [openSections, setOpenSections] = useState<string[]>([sections[0]]);
  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const openNextSection = (current: string) => {
    const currentIndex = sectionToIndex(current);
    if (currentIndex === -1 || currentIndex === sections.length - 1) return;

    const next = sections[currentIndex + 1];
    setOpenSections((prev) => [
      ...prev.filter((section) => section !== current),
      next,
    ]);

    setCurrentStep((prevStep) => prevStep + 1);
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
          isCurrentStep={
            currentStep === sectionToIndex("accordion-item-problem-selection")
          }
          onProblemStart={setProblem}
        />
      </AccordionItem>
      {currentStep >= sectionToIndex("accordion-item-clarification") && (
        <AccordionItem value="accordion-item-clarification">
          <AccordionTrigger
            disabled={
              currentStep < sectionToIndex("accordion-item-clarification")
            }
          >
            <h2>2. Ask Clarifying Questions</h2>
          </AccordionTrigger>
          <ClarificationSection
            problem={problem}
            onNext={() => openNextSection("accordion-item-clarification")}
            isCurrentStep={
              currentStep === sectionToIndex("accordion-item-clarification")
            }
          />
        </AccordionItem>
      )}
      {currentStep >= sectionToIndex("accordion-item-thought-process") && (
        <AccordionItem value="accordion-item-thought-process">
          <AccordionTrigger
            disabled={
              currentStep < sectionToIndex("accordion-item-thought-process")
            }
          >
            <h2>3. Explain Thought Process</h2>
          </AccordionTrigger>
          <ThoughtProcessSection
            problem={problem}
            onNext={() => openNextSection("accordion-item-thought-process")}
            isCurrentStep={
              currentStep === sectionToIndex("accordion-item-thought-process")
            }
          />
        </AccordionItem>
      )}
      {currentStep >= sectionToIndex("accordion-item-pseudocode") && (
        <AccordionItem value="accordion-item-pseudocode">
          <AccordionTrigger
            disabled={currentStep < sectionToIndex("accordion-item-pseudocode")}
          >
            <h2>4. Draft Pseudocode</h2>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
      )}
      {currentStep >= sectionToIndex("accordion-item-implementation") && (
        <AccordionItem value="accordion-item-implementation">
          <AccordionTrigger
            disabled={
              currentStep < sectionToIndex("accordion-item-implementation")
            }
          >
            <h2>5. Implement Code</h2>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
      )}
      {currentStep >= sectionToIndex("accordion-item-complexity-analysis") && (
        <AccordionItem value="accordion-item-complexity-analysis">
          <AccordionTrigger
            disabled={
              currentStep < sectionToIndex("accordion-item-complexity-analysis")
            }
          >
            <h2>6. Analyze Complexity</h2>
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
