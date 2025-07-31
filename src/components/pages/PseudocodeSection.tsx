"use client";

import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PracticeProblem } from "@/types/practice";

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
  return (
    <AccordionContent className="flex flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Develop pseudocode for your solution to the problem. This should outline
        the main steps you would take to solve the problem without getting into
        specific syntax. Focus on the logic and structure of your solution.
        Consider edge cases and how you would handle them in your pseudocode.
      </p>

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
