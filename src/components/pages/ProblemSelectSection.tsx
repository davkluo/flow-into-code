"use client";

import _ from "lodash";
import { Check, ChevronsUpDown, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { filterAndSortProblems } from "@/lib/search";
import { cn } from "@/lib/utils";
import { LCProblem } from "@/types/leetcode";
import { PracticeProblem } from "@/types/practice";

interface ProblemSelectSectionProps {
  problems: LCProblem[];
  onProblemSelect: (problem: PracticeProblem) => void;
  isEditable: boolean;
}

export function ProblemSelectSection({
  problems,
  onProblemSelect,
  isEditable,
}: ProblemSelectSectionProps) {
  const [open, setOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<LCProblem | null>(
    null,
  );
  const [processedProblem, setProcessedProblem] =
    useState<PracticeProblem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const getOrCreateProcessedProblem = async (
    problem: LCProblem,
  ): Promise<PracticeProblem> => {
    // TODO: Check Firestore first, then generate if needed
    // For now, create mock processed problem
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...problem,
          content: `Mock LeetCode description for ${problem.titleSlug}`,
          realWorldContext: `This problem helps you understand how to work with ${problem.topicTags.map((t) => t.name).join(", ")} in real-world scenarios.`,
          customHints: [],
          commonMistakes: [],
          solutionStructure: "",
          sampleApproach: "",
          processedAt: new Date(),
        });
      }, 500);
    });
  };

  const debouncedSetSearch = useMemo(
    () => _.debounce((value: string) => setDebouncedSearch(value), 200),
    [],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  };

  const handleProblemSelect = async (problem: LCProblem) => {
    if (selectedProblem?.id === problem.id) {
      setOpen(false);
      return;
    }

    setSelectedProblem(problem);
    setOpen(false);
    setIsProcessing(true);

    const processed = await getOrCreateProcessedProblem(problem);

    setProcessedProblem(processed);
    setIsProcessing(false);
    onProblemSelect(processed);
  };

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const filteredAndSortedProblems = useMemo(() => {
    return filterAndSortProblems(problems, debouncedSearch);
  }, [problems, debouncedSearch]);

  return (
    <AccordionContent className="flex flex-col gap-4 px-3.5">
      <p className="text-muted-foreground text-xs">
        Select a problem from LeetCode to begin your practice session.
      </p>

      <div className="flex flex-col gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-[400px] justify-between"
              disabled={!isEditable}
            >
              <div className="flex w-full items-center">
                <div className="truncate text-center">
                  {selectedProblem
                    ? `${selectedProblem.id}. ${selectedProblem.title}`
                    : "Select a problem"}
                </div>
                {selectedProblem && (
                  <DifficultyBadge
                    difficulty={selectedProblem.difficulty}
                    className="ml-2"
                  />
                )}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search problems..."
                value={search}
                onValueChange={handleSearchChange}
              />
              <div className="max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto">
                {filteredAndSortedProblems.length === 0 ? (
                  <div className="text-muted-foreground py-6 text-center text-sm">
                    No results found.
                  </div>
                ) : (
                  <div className="overflow-hidden p-1">
                    <List
                      height={300}
                      itemCount={filteredAndSortedProblems.length}
                      itemSize={40}
                      width="100%"
                    >
                      {({ index, style }) => {
                        const problem = filteredAndSortedProblems[index];
                        return (
                          <div style={style} key={`LC-problem-${problem.id}`}>
                            <CommandItem
                              onSelect={() => {
                                handleProblemSelect(problem);
                              }}
                            >
                              <div className="truncate text-center">
                                {problem.id}. {problem.title}
                              </div>
                              <DifficultyBadge
                                difficulty={problem.difficulty}
                              />
                              <Check
                                className={cn(
                                  "ml-auto",
                                  selectedProblem === problem
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                            </CommandItem>
                          </div>
                        );
                      }}
                    </List>
                  </div>
                )}
              </div>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedProblem && (
          <div className="mt-2 flex flex-col gap-2 text-xs">
            <div className="text-muted-foreground flex gap-1">
              Tags:{" "}
              {selectedProblem.topicTags.map((tag) => (
                <TagBadge key={tag.id} tagName={tag.name} />
              ))}
            </div>

            {isProcessing && (
              <p className="text-muted-foreground italic">
                Loading problem context...
              </p>
            )}

            {processedProblem && (
              <div className="mt-2">
                <p className="font-semibold">Problem Context:</p>
                <p className="text-muted-foreground mt-1">
                  {processedProblem.realWorldContext}
                </p>
              </div>
            )}

            <a
              href={`https://leetcode.com/problems/${selectedProblem.titleSlug}/description/`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit"
            >
              <span className="flex items-center font-semibold hover:underline">
                View full description on LeetCode
                <ExternalLink className="ml-1.5 inline h-4 w-4" />
              </span>
            </a>
          </div>
        )}

        <p className="text-muted-foreground text-xs">
          LeetCode owns the copyright to all problems sourced from its platform.
          This app is not affiliated with, endorsed by, or sponsored by
          LeetCode. It does not claim ownership of any LeetCode problems and
          does not distribute them for commercial gain. The inclusion of
          LeetCode problems on this platform is purely due to the prevalence of
          LeetCode problems in the coding interview space. Users are encouraged
          to view the complete problem descriptions and execute their code at{" "}
          <a
            href="https://leetcode.com"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            leetcode.com
          </a>
          .
        </p>
      </div>
    </AccordionContent>
  );
}
