"use client";

import { useState } from "react";
import { ProblemSelectSection } from "@/components/pages/ProblemSelectSection";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLLM } from "@/hooks/useLLM";
import { LCProblem } from "@/types/leetcode";
import { PracticeProblem } from "@/types/practice";
import { ClarificationSection } from "./ClarificationSection";
import { ComplexityAnalysisSection } from "./ComplexityAnalysisSection";
import { ImplementationSection } from "./ImplementationSection";
import { PseudocodeSection } from "./PseudocodeSection";
import { SectionLabel } from "./SectionLabel";
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

  const llm = useLLM(problem);

  const openNextSection = (current: string) => {
    const currentIndex = sectionToIndex(current);
    if (currentIndex === -1) return;

    setOpenSections((prev) => {
      const newOpenSections = [
        ...prev.filter((section) => section !== current),
      ];
      if (currentIndex < sections.length - 1) {
        const next = sections[currentIndex + 1];
        newOpenSections.push(next);
      }

      return newOpenSections;
    });

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
          <SectionLabel
            label="Select Problem"
            isCurrentStep={
              currentStep === sectionToIndex("accordion-item-problem-selection")
            }
          />
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
      {problem &&
        currentStep >= sectionToIndex("accordion-item-clarification") && (
          <AccordionItem value="accordion-item-clarification">
            <AccordionTrigger
              disabled={
                currentStep < sectionToIndex("accordion-item-clarification")
              }
            >
              <SectionLabel
                label="Clarify Problem"
                isCurrentStep={
                  currentStep === sectionToIndex("accordion-item-clarification")
                }
              />
            </AccordionTrigger>
            <ClarificationSection
              messages={llm.getMessages("clarification")}
              onSend={(content) => llm.sendMessage("clarification", content)}
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
            <SectionLabel
              label="Explain Thought Process"
              isCurrentStep={
                currentStep === sectionToIndex("accordion-item-thought-process")
              }
            />
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
            <SectionLabel
              label="Develop Pseudocode"
              isCurrentStep={
                currentStep === sectionToIndex("accordion-item-pseudocode")
              }
            />
          </AccordionTrigger>
          <PseudocodeSection
            problem={problem}
            onNext={() => openNextSection("accordion-item-pseudocode")}
            isCurrentStep={
              currentStep === sectionToIndex("accordion-item-pseudocode")
            }
          />
        </AccordionItem>
      )}
      {currentStep >= sectionToIndex("accordion-item-implementation") && (
        <AccordionItem value="accordion-item-implementation">
          <AccordionTrigger
            disabled={
              currentStep < sectionToIndex("accordion-item-implementation")
            }
          >
            <SectionLabel
              label="Implement Code"
              isCurrentStep={
                currentStep === sectionToIndex("accordion-item-implementation")
              }
            />
          </AccordionTrigger>
          <ImplementationSection
            problem={problem}
            onNext={() => openNextSection("accordion-item-implementation")}
            isCurrentStep={
              currentStep === sectionToIndex("accordion-item-implementation")
            }
          />
        </AccordionItem>
      )}
      {currentStep >= sectionToIndex("accordion-item-complexity-analysis") && (
        <AccordionItem value="accordion-item-complexity-analysis">
          <AccordionTrigger
            disabled={
              currentStep < sectionToIndex("accordion-item-complexity-analysis")
            }
          >
            <SectionLabel
              label="Analyze Complexity"
              isCurrentStep={
                currentStep ===
                sectionToIndex("accordion-item-complexity-analysis")
              }
            />
          </AccordionTrigger>
          <ComplexityAnalysisSection
            problem={problem}
            onNext={() => openNextSection("accordion-item-complexity-analysis")}
            isCurrentStep={
              currentStep ===
              sectionToIndex("accordion-item-complexity-analysis")
            }
          />
        </AccordionItem>
      )}
    </Accordion>
  );
}
