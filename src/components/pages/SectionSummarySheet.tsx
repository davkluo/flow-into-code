import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SECTION_KEY_TO_DETAILS } from "@/constants/practice";
import { SectionKey } from "@/types/practice";

interface SectionSummarySheetProps {
  sectionKey: SectionKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionSummarySheet({
  sectionKey,
  open,
  onOpenChange,
}: SectionSummarySheetProps) {
  const details = SECTION_KEY_TO_DETAILS[sectionKey];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{details.title}</SheetTitle>
          <SheetDescription className="text-xs">
            Review your work from the {details.title.toLowerCase()} section.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 px-4 pb-4">
          <p className="text-muted-foreground text-sm">
            Summary content coming soon.
          </p>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
