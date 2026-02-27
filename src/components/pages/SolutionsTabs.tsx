"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProblemSolution } from "@/types/problem";

function firstAvailableTab(solution: ProblemSolution): string {
  if (solution.algorithm) return "algorithm";
  if (solution.tradeoffs) return "tradeoffs";
  return "complexity";
}

export function SolutionsTabs({ solutions }: { solutions: ProblemSolution[] }) {
  return (
    <div className="space-y-2">
      {solutions.map((solution, i) => (
        <div
          key={i}
          className="border-input overflow-hidden rounded-md border"
        >
          <Collapsible>
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-card dark:hover:bg-card [&[data-state=open]>svg]:rotate-180">
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium">
                  Solution {i + 1}: {solution.approach}
                </span>
                {solution.explanation && (
                  <span className="text-foreground text-sm">
                    {solution.explanation}
                  </span>
                )}
              </div>
              <ChevronDownIcon className="text-muted-foreground ml-4 size-4 shrink-0 transition-transform duration-200" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t">
              <div className="px-4 pt-2 pb-4">
                <Tabs defaultValue={firstAvailableTab(solution)}>
                  <TabsList variant="line">
                    {solution.algorithm && (
                      <TabsTrigger value="algorithm" className="text-xs">
                        Algorithm
                      </TabsTrigger>
                    )}
                    {solution.tradeoffs && (
                      <TabsTrigger value="tradeoffs" className="text-xs">
                        Tradeoffs
                      </TabsTrigger>
                    )}
                    {(solution.timeComplexity || solution.spaceComplexity) && (
                      <TabsTrigger value="complexity" className="text-xs">
                        Complexity
                      </TabsTrigger>
                    )}
                  </TabsList>
                  {solution.algorithm && (
                    <TabsContent value="algorithm" className="mt-2">
                      <pre className="bg-card border-input overflow-x-auto rounded-md border p-3 font-mono text-xs whitespace-pre-wrap">
                        {solution.algorithm}
                      </pre>
                    </TabsContent>
                  )}
                  {solution.tradeoffs && (
                    <TabsContent value="tradeoffs" className="mt-2">
                      <p className="text-foreground text-sm">
                        {solution.tradeoffs}
                      </p>
                    </TabsContent>
                  )}
                  {(solution.timeComplexity || solution.spaceComplexity) && (
                    <TabsContent value="complexity" className="mt-2 space-y-3">
                      {solution.timeComplexity && (
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground text-xs font-medium">
                            Time
                          </p>
                          <p className="text-sm">{solution.timeComplexity}</p>
                        </div>
                      )}
                      {solution.spaceComplexity && (
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground text-xs font-medium">
                            Space
                          </p>
                          <p className="text-sm">{solution.spaceComplexity}</p>
                        </div>
                      )}
                    </TabsContent>
                  )}
                </Tabs>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
    </div>
  );
}
