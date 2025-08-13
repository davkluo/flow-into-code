import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionKey } from "@/types/practice";

interface AISummaryDialogProps {
  summaries: Record<SectionKey, string>;
}

export function AISummaryDialog({ summaries }: AISummaryDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>AI Summary</DialogTitle>
      </DialogHeader>

      {"selection" in summaries && (
        <div>
          <h3 className="font-semibold">Problem</h3>
          <p className="mt-2 text-xs">{summaries.selection}</p>
        </div>
      )}
      {"clarification" in summaries && (
        <div>
          <h3 className="font-semibold">Clarifications</h3>
          <p className="mt-2 text-xs">{summaries.clarification}</p>
        </div>
      )}
      {"thought_process" in summaries && (
        <div>
          <h3 className="font-semibold">Thought Process Summary</h3>
          <p className="mt-2 text-xs">{summaries.thought_process}</p>
        </div>
      )}
      {"pseudocode" in summaries && (
        <div>
          <h3 className="font-semibold">Pseudocode Summary</h3>
          <p className="mt-2 text-xs">{summaries.pseudocode}</p>
        </div>
      )}
      {"implementation" in summaries && (
        <div>
          <h3 className="font-semibold">Implementation Summary</h3>
          <p className="mt-2 text-xs">{summaries.implementation}</p>
        </div>
      )}
      {"complexity_analysis" in summaries && (
        <div>
          <h3 className="font-semibold">Complexity Analysis Summary</h3>
          <p className="mt-2 text-xs">{summaries.complexity_analysis}</p>
        </div>
      )}
    </DialogContent>
  );
}
