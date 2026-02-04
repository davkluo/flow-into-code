import { Flame, Leaf, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Problem } from "@/types/leetcode";

export function DifficultyBadge({
  difficulty,
  className,
}: React.ComponentProps<"span"> & Pick<Problem, "difficulty">) {
  const Icon =
    difficulty === "Easy" ? Leaf : difficulty === "Medium" ? Zap : Flame;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex cursor-default items-center",
            difficulty === "Easy" && "text-green-600",
            difficulty === "Medium" && "text-amber-500",
            difficulty === "Hard" && "text-red-500",
            className,
          )}
        >
          <Icon className="h-4 w-4 translate-y-0.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{difficulty}</TooltipContent>
    </Tooltip>
  );
}
