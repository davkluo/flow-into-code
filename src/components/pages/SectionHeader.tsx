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
      <div className="flex items-baseline gap-2">
        <h2 className="text-lg font-semibold">{details.title}</h2>
      </div>
      <p className="text-muted-foreground text-sm">{details.description}</p>
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground w-fit cursor-pointer text-xs underline-offset-2 hover:underline">
            Why is this important?
          </button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="max-w-sm">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {details.explanation}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
