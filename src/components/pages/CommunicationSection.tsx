"use client";

import { ChevronDownIcon } from "lucide-react";
import { ChatLog } from "@/components/pages/ChatLog";
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
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import { cn } from "@/lib/utils";
import type { SessionMessage } from "@/types/chat";
import type { CategoryFeedback } from "@/types/session";

function scoreClass(score: number): string {
  if (score < 2) return "text-red-400";
  if (score < 3) return "text-amber-400";
  if (score < 5) return "text-lime-400";
  return "text-green-400";
}

interface CommunicationSectionProps {
  feedback: CategoryFeedback;
  messages: SessionMessage[];
}

export function CommunicationSection({
  feedback,
  messages,
}: CommunicationSectionProps) {
  const hasFeedbackTab = !!(feedback.compliments || feedback.advice);
  const defaultTab = hasFeedbackTab ? "feedback" : SECTION_ORDER[0];

  return (
    <div
      id="section-communication"
      className="border-input overflow-hidden rounded-md border"
    >
      <Collapsible>
        <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-left transition-colors [&[data-state=open]>svg]:rotate-180">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Interviewer Communication
              </span>
              {feedback.score === null ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-muted-foreground cursor-default text-sm font-semibold">
                      —
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Insufficient content to review
                  </TooltipContent>
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
            <Tabs defaultValue={defaultTab}>
              <TabsList variant="line">
                {hasFeedbackTab && (
                  <TabsTrigger value="feedback" className="text-xs">
                    Feedback
                  </TabsTrigger>
                )}
                {SECTION_ORDER.map((key) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {SECTION_KEY_TO_DETAILS[key].title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {hasFeedbackTab && (
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
              )}
              {SECTION_ORDER.map((key) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="max-h-80 overflow-y-auto pr-2">
                    <ChatLog
                      messages={messages.filter((m) => m.section === key)}
                      emptyStateMessage="No chat messages in this section."
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
