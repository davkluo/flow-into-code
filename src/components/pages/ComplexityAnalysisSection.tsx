"use client";

import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PracticeProblem } from "@/types/practice";

interface complexityAnalysisSectionProps {
  problem: PracticeProblem | null;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function ComplexityAnalysisSection({
  problem,
  onNext,
  isCurrentStep,
}: complexityAnalysisSectionProps) {
  return (
    <AccordionContent className="flex flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Analyze the time and space complexity of your solution. Discuss the
        efficiency of your algorithm, considering both best-case and worst-case
        scenarios. You may also want to compare your solution with alternative
        approaches and their complexities.
      </p>

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
