"use client";

import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PracticeProblem } from "@/types/practice";

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
  return (
    <AccordionContent className="flex flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Implement the solution to the problem using your preferred programming
        language. Focus on translating your pseudocode into actual code,
        ensuring that you handle edge cases and follow best practices. You may
        also want to walk through your implementation with sample inputs to
        verify its correctness.
      </p>

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
