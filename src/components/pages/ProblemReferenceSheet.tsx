import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Problem, ProblemDetails } from "@/types/problem";
import { ProblemDetailContent } from "./ProblemDetailContent";

interface ProblemReferenceSheetProps {
  problem: Problem;
  problemDetails: ProblemDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProblemReferenceSheet({
  problem,
  problemDetails,
  open,
  onOpenChange,
}: ProblemReferenceSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Problem Reference</SheetTitle>
          <SheetDescription className="text-xs">
            Use this sheet to review the details of the problem as necessary.
            During an interview, it may convey a sense of uncertainty if you
            frequently refer to the problem statement. You should try to use
            this sheet primarily for quick reference when you need to clarify
            specific details or constraints, rather than relying on it for every
            aspect of the problem.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="flex flex-col gap-4">
            <ProblemDetailContent
              problem={problem}
              problemDetails={problemDetails}
              isLoading={false}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
