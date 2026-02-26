"use client";

import {
  BookOpen,
  Eye,
  FlaskConical,
  Lightbulb,
  Star,
  TriangleAlert,
} from "lucide-react";
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Item, ItemContent } from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Problem, ProblemDetails } from "@/types/problem";
import { ProblemDetailContent } from "./ProblemDetailContent";

function SpoilerCard({
  children,
  revealed,
  onReveal,
  label = "Click to view",
}: {
  children: React.ReactNode;
  revealed: boolean;
  onReveal: () => void;
  label?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-md border">
      <div
        className={cn(!revealed && "pointer-events-none blur-sm select-none")}
      >
        {children}
      </div>
      {!revealed && (
        <button
          className="bg-background/70 absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1.5"
          onClick={onReveal}
        >
          <Eye className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-xs">{label}</span>
        </button>
      )}
    </div>
  );
}

interface ProblemReferenceSheetProps {
  problem: Problem;
  problemDetails: ProblemDetails;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProblemReferenceSheet({
  problem,
  problemDetails,
  open,
  onOpenChange,
}: ProblemReferenceSheetProps) {
  const { derived } = problemDetails;
  const [revealed, setRevealed] = React.useState<Set<string>>(new Set());
  const reveal = (key: string) => setRevealed((prev) => new Set(prev).add(key));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Problem Reference</SheetTitle>
          <SheetDescription className="text-xs">
            Use this sheet to review the details of the problem as necessary. To
            best prepare for interviews, try to use this sheet primarily for
            quick reference when you need to clarify specific details or
            constraints, rather than constantly referring back to it.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1 px-4 pb-4">
          <Accordion type="multiple" className="w-full">
            {/* Description */}
            <AccordionItem value="description">
              <AccordionTrigger>
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Description
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-brand-card rounded-md p-4">
                  <ProblemDetailContent
                    problem={problem}
                    problemDetails={problemDetails}
                    isLoading={false}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Hints */}
            {derived?.hints && derived.hints.length > 0 && (
              <AccordionItem value="hints">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Hints
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    {derived.hints.map((hint, index) => {
                      if (index > 0 && !revealed.has(`hints-${index - 1}`))
                        return null;
                      return (
                        <SpoilerCard
                          key={index}
                          revealed={revealed.has(`hints-${index}`)}
                          onReveal={() => reveal(`hints-${index}`)}
                          label={`Click to view hint ${index + 1}`}
                        >
                          <Item
                            variant="default"
                            size="sm"
                            className="bg-brand-card rounded-md"
                          >
                            <ItemContent>
                              <p className="text-muted-foreground mb-1 text-xs font-medium">
                                Hint {index + 1}
                              </p>
                              <p className="text-sm leading-relaxed">
                                {hint.text}
                              </p>
                            </ItemContent>
                          </Item>
                        </SpoilerCard>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Pitfalls */}
            {derived?.pitfalls && derived.pitfalls.length > 0 && (
              <AccordionItem value="pitfalls">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <TriangleAlert className="h-4 w-4" />
                    Common Pitfalls
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    {derived.pitfalls.map((pitfall, index) => {
                      if (index > 0 && !revealed.has(`pitfalls-${index - 1}`))
                        return null;
                      return (
                        <SpoilerCard
                          key={index}
                          revealed={revealed.has(`pitfalls-${index}`)}
                          onReveal={() => reveal(`pitfalls-${index}`)}
                          label={`Click to view pitfall ${index + 1}`}
                        >
                          <Item
                            variant="default"
                            size="sm"
                            className="bg-brand-card rounded-md"
                          >
                            <ItemContent>
                              <p className="text-muted-foreground mb-1 text-xs font-medium">
                                Pitfall {index + 1}
                              </p>
                              <p className="text-sm leading-relaxed">
                                {pitfall.text}
                              </p>
                            </ItemContent>
                          </Item>
                        </SpoilerCard>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Sample Test Cases */}
            {derived?.testCases && derived.testCases.length > 0 && (
              <AccordionItem value="testCases">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Sample Test Cases
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    {derived.testCases.map((testCase, index) => {
                      if (index > 0 && !revealed.has(`testCases-${index - 1}`))
                        return null;
                      return (
                        <SpoilerCard
                          key={index}
                          revealed={revealed.has(`testCases-${index}`)}
                          onReveal={() => reveal(`testCases-${index}`)}
                          label={`Click to view test case ${index + 1}`}
                        >
                          <Item
                            variant="default"
                            size="sm"
                            className="bg-brand-card rounded-md"
                          >
                            <ItemContent className="gap-2">
                              {testCase.description && (
                                <p className="text-muted-foreground text-sm font-medium underline">
                                  {testCase.description}
                                </p>
                              )}
                              <p className="font-mono text-sm">
                                <span className="text-muted-foreground">
                                  Input:{" "}
                                </span>
                                {testCase.input}
                              </p>
                              <p className="font-mono text-sm">
                                <span className="text-muted-foreground">
                                  Expected:{" "}
                                </span>
                                {testCase.expectedOutput}
                              </p>
                              {testCase.explanation && (
                                <p className="mt-1 text-sm leading-relaxed">
                                  {testCase.explanation}
                                </p>
                              )}
                            </ItemContent>
                          </Item>
                        </SpoilerCard>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Sample Edge Cases */}
            {derived?.edgeCases && derived.edgeCases.length > 0 && (
              <AccordionItem value="edgeCases">
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Sample Edge Cases
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    {derived.edgeCases.map((edgeCase, index) => {
                      if (index > 0 && !revealed.has(`edgeCases-${index - 1}`))
                        return null;
                      return (
                        <SpoilerCard
                          key={index}
                          revealed={revealed.has(`edgeCases-${index}`)}
                          onReveal={() => reveal(`edgeCases-${index}`)}
                          label={`Click to view edge case ${index + 1}`}
                        >
                          <Item
                            variant="default"
                            size="sm"
                            className="bg-brand-card rounded-md"
                          >
                            <ItemContent className="gap-2">
                              {edgeCase.description && (
                                <p className="text-muted-foreground text-sm font-medium underline">
                                  {edgeCase.description}
                                </p>
                              )}
                              <p className="font-mono text-sm">
                                <span className="text-muted-foreground">
                                  Input:{" "}
                                </span>
                                {edgeCase.input}
                              </p>
                              <p className="font-mono text-sm">
                                <span className="text-muted-foreground">
                                  Expected:{" "}
                                </span>
                                {edgeCase.expectedOutput}
                              </p>
                              {edgeCase.explanation && (
                                <p className="mt-1 text-sm leading-relaxed">
                                  {edgeCase.explanation}
                                </p>
                              )}
                            </ItemContent>
                          </Item>
                        </SpoilerCard>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
