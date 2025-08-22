import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function TagBadge({
  tagName,
  className,
}: React.ComponentProps<"span"> & { tagName: string }) {
  return (
    <Badge
      className={cn(
        "rounded-md bg-gray-200 px-1 py-0 text-xs text-gray-700",
        className,
      )}
    >
      {tagName}
    </Badge>
  );
}
