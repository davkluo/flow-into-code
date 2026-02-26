"use client";

import { ChevronDownIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CRITERION_MAX_SCORE } from "@/constants/grading";
import { CategoryFeedback } from "@/types/session";
import { SectionKey } from "@/types/practice";
import { cn } from "@/lib/utils";

const FIELD_DISPLAY: Record<
  SectionKey,
  { key: string; label: string; isCode?: boolean }[]
> = {
  problem_understanding: [
    { key: "restatement", label: "Problem Restatement" },
    { key: "inputsOutputs", label: "Inputs & Outputs" },
    { key: "constraints", label: "Constraints" },
    { key: "edgeCases", label: "Edge Cases" },
  ],
  approach_and_reasoning: [
    { key: "approach", label: "Approach" },
    { key: "reasoning", label: "Reasoning" },
  ],
  algorithm_design: [{ key: "pseudocode", label: "Pseudocode", isCode: true }],
  implementation: [
    { key: "code", label: "Code", isCode: true },
    { key: "output", label: "Output", isCode: true },
  ],
  complexity_analysis: [
    { key: "timeComplexity", label: "Time Complexity" },
    { key: "spaceComplexity", label: "Space Complexity" },
  ],
};

function scoreClass(score: number): string {
  if (score < 2) return "text-red-400";
  if (score < 3) return "text-amber-400";
  if (score < 5) return "text-lime-400";
  return "text-green-400";
}

interface SectionFeedbackCardProps {
  sectionKey: SectionKey;
  title: string;
  feedback: CategoryFeedback;
  fields?: Record<string, string>;
}

export function SectionFeedbackCard({
  sectionKey,
  title,
  feedback,
  fields,
}: SectionFeedbackCardProps) {
  const fieldDisplay = FIELD_DISPLAY[sectionKey];

  return (
    <div
      id={`section-${sectionKey}`}
      className="border-input overflow-hidden rounded-md border"
    >
      <Collapsible>
        <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-left transition-colors [&[data-state=open]>svg]:rotate-180">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{title}</span>
              {feedback.score === null ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground cursor-default text-sm font-semibold">
                      —
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Insufficient content to review</TooltipContent>
                </Tooltip>
              ) : (
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    scoreClass(feedback.score),
                  )}
                >
                  {feedback.score}/{CRITERION_MAX_SCORE}
                </span>
              )}
            </div>
            {feedback.comments && (
              <span className="text-muted-foreground text-xs">
                {feedback.comments}
              </span>
            )}
          </div>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform duration-200" />
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t">
          <div className="px-4 py-4">
            <Tabs defaultValue="feedback">
              <TabsList variant="line">
                <TabsTrigger value="feedback" className="text-xs">
                  Feedback
                </TabsTrigger>
                <TabsTrigger value="inputs" className="text-xs">
                  Your Inputs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feedback" className="mt-4 space-y-4">
                {feedback.compliments && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-lime-400">
                      What went well
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {feedback.compliments}
                    </p>
                  </div>
                )}
                {feedback.advice && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-400">
                      To improve
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {feedback.advice}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="inputs" className="mt-4">
                {!fields ? (
                  <p className="text-muted-foreground text-sm">
                    No inputs recorded.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {sectionKey === "implementation" && fields.language && (
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">
                          Language
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {fields.language}
                        </Badge>
                      </div>
                    )}
                    {fieldDisplay.map(({ key, label, isCode }) => {
                      const value = fields[key];
                      return (
                        <div key={key} className="space-y-1">
                          <p className="text-muted-foreground text-xs font-medium">
                            {label}
                          </p>
                          {value ? (
                            isCode ? (
                              <pre className="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs whitespace-pre-wrap">
                                {value}
                              </pre>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">
                                {value}
                              </p>
                            )
                          ) : (
                            <p className="text-muted-foreground text-sm italic">
                              Not provided
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
