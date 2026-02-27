import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TagBadge({
  tagName,
  className,
}: React.ComponentProps<"span"> & { tagName: string }) {
  return (
    <Badge
      className={cn(
        "rounded-md bg-brand-muted px-1.5 py-0.5 text-xs text-brand-muted-fg dark:bg-gray-600 dark:text-gray-200",
        className,
      )}
    >
      {tagName}
    </Badge>
  );
}
