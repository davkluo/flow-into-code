"use client";

import _ from "lodash";
import { Check, ChevronsUpDown, MoveRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { filterAndSortProblems } from "@/lib/search";
import { cn } from "@/lib/utils";
import { Problem, ProblemDetails } from "@/types/leetcode";
import { DifficultyBadge } from "../shared/DifficultyBadge";

interface ProblemSelectSectionProps {
  problems: Problem[];
  onNext: () => void;
}

export function ProblemSelectSection({
  problems,
  onNext,
}: ProblemSelectSectionProps) {
  const [source, setSource] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customProblem, setCustomProblem] = useState("");
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(
    null,
  );

  const fetchProblemDetails = async (
    titleSlug: string,
  ): Promise<ProblemDetails> => {
    const res = await fetch("/api/lc-problem-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleSlug }),
    });

    if (!res.ok) {
      throw new Error("Failed to load question");
    }

    const { data } = await res.json();
    return data.question;
  };

  const debouncedSetSearch = useMemo(
    () => _.debounce((value: string) => setDebouncedSearch(value), 200),
    [],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  };

  const handleProblemSelect = async (problem: Problem) => {
    setSelectedProblem(problem);
    setOpen(false);

    const details = await fetchProblemDetails(problem.titleSlug);
    setProblemDetails(details);
  };

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const filteredAndSortedProblems = useMemo(() => {
    return filterAndSortProblems(problems, debouncedSearch);
  }, [problems, debouncedSearch]);

  return (
    <AccordionContent className="grid grid-cols-6 gap-4">
      <Select value={source ?? ""} onValueChange={setSource}>
        <SelectTrigger className="col-span-1 w-full">
          <SelectValue placeholder="Select a source" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="leetcode">LeetCode</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {source === "leetcode" && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-[400px] justify-between"
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
                          <div style={style} key={problem.id}>
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
      )}

      {source === "custom" && (
        <Textarea
          placeholder="Enter your custom problem description."
          value={customProblem}
          onChange={(e) => setCustomProblem(e.target.value)}
          className="col-span-full h-40"
        />
      )}

      {source === "leetcode" && selectedProblem && (
        <div className="col-span-full">
          <h3 className="mb-2 text-lg font-semibold">
            {selectedProblem.id}. {selectedProblem.title}
          </h3>
          <div className="text-muted-foreground mb-4 text-sm">
            Difficulty:{" "}
            <DifficultyBadge difficulty={selectedProblem.difficulty} />
          </div>
          <div
            className="prose prose-sm"
            dangerouslySetInnerHTML={{ __html: problemDetails?.content || "" }}
          />
        </div>
      )}

      {((source === "leetcode" && selectedProblem) ||
        (source === "custom" && customProblem)) && (
        <div className="col-span-full flex items-center justify-start gap-0.5">
          <Button
            variant="default"
            onClick={() => {
              onNext();
              setOpen(false);
            }}
          >
            Next
            <MoveRight className="h-4 w-4 pt-0.5" />
          </Button>
        </div>
      )}
    </AccordionContent>
  );
}
