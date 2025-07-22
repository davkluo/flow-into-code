import { cn } from "@/lib/utils";
import { Problem } from "@/types/leetcode";
import { Badge } from "../ui/badge";

export function DifficultyBadge({
  difficulty,
  className,
}: React.ComponentProps<"span"> & Pick<Problem, "difficulty">) {
  return (
    <Badge
      className={cn(
        "rounded-md px-1 py-0 text-xs",
        difficulty == "Easy" && "bg-green-300 text-green-800",
        difficulty == "Medium" && "bg-amber-300 text-amber-800",
        difficulty == "Hard" && "bg-red-300 text-red-800",
        className,
      )}
    >
      {difficulty}
    </Badge>
  );
}
