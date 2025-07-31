import { ArrowRight, CircleCheck } from "lucide-react";

interface SectionLabelProps {
  label: string;
  isCurrentStep: boolean;
}

export function SectionLabel({ label, isCurrentStep }: SectionLabelProps) {
  return (
    <h2 className="flex items-center gap-2">
      {isCurrentStep ? (
        <ArrowRight className="size-5 pt-0.5" />
      ) : (
        <CircleCheck className="size-5 pt-0.5 text-green-500" />
      )}
      {label}
    </h2>
  );
}
