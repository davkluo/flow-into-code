import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SECTION_KEY_TO_DETAILS } from "@/constants/practice";
import { formatFieldKey, SectionSnapshotData } from "@/lib/chat/context";
import { SectionKey } from "@/types/practice";

interface SectionSummarySheetProps {
  sectionKey: SectionKey;
  snapshot?: SectionSnapshotData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionSummarySheet({
  sectionKey,
  snapshot,
  open,
  onOpenChange,
}: SectionSummarySheetProps) {
  const details = SECTION_KEY_TO_DETAILS[sectionKey];

  const entries = snapshot
    ? Object.entries(snapshot).filter(([, v]) => v.trim() !== "")
    : [];

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
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing written here yet.
            </p>
          ) : (
            <div className="space-y-5">
              {entries.map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {formatFieldKey(key)}
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{value}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
