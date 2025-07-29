import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LCTag } from "@/types/leetcode";

export function TagBadge({
  tag,
  className,
}: React.ComponentProps<"span"> & { tag: LCTag }) {
  return (
    <Badge
      className={cn(
        "rounded-md bg-gray-200 px-1 py-0 text-xs text-gray-700",
        className,
      )}
    >
      {tag.name}
    </Badge>
  );
}
