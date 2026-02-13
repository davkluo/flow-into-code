import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SECTION_KEY_TO_DETAILS } from "@/lib/practice";
import { SectionKey } from "@/types/practice";

interface SectionHeaderProps {
  sectionKey: SectionKey;
}

export function SectionHeader({ sectionKey }: SectionHeaderProps) {
  const details = SECTION_KEY_TO_DETAILS[sectionKey];

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm">{details.description}</p>
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground mt-2 w-fit cursor-pointer text-xs underline underline-offset-2">
            Why is this important?
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          className="w-[calc(100vw-4rem)] max-w-5xl"
        >
          <div className="text-sm leading-relaxed">{details.explanation}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
