"use client";

import _ from "lodash";
import { Check, ChevronsUpDown, MoveRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import { AccordionContent } from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useTimer } from "@/context/TimerContext";
import { filterAndSortProblems } from "@/lib/search";
import { cn } from "@/lib/utils";
import { LCProblem, LCProblemDetails } from "@/types/leetcode";
import { PracticeProblem, ProblemSource } from "@/types/practice";

interface ProblemSelectSectionProps {
  problems: LCProblem[];
  onNext: () => void;
  isCurrentStep: boolean;
  onProblemStart: (problem: PracticeProblem) => void;
}

export function ProblemSelectSection({
  problems,
  onNext,
  isCurrentStep,
  onProblemStart,
}: ProblemSelectSectionProps) {
  const [source, setSource] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<LCProblem | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [customProblem, setCustomProblem] = useState("");
  const [problemDetails, setProblemDetails] = useState<LCProblemDetails | null>(
    null,
  );

  const { setpoint, start: startTimer } = useTimer();

  const fetchProblemDetails = async (
    titleSlug: string,
  ): Promise<LCProblemDetails> => {
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

  const handleProblemSelect = async (problem: LCProblem) => {
    if (selectedProblem?.id === problem.id) {
      setOpen(false);
      return;
    }

    setSelectedProblem(problem);
    setOpen(false);

    const details = await fetchProblemDetails(problem.titleSlug);
    setProblemDetails(details);
    console.log(details);
  };

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const filteredAndSortedProblems = useMemo(() => {
    return filterAndSortProblems(problems, debouncedSearch);
  }, [problems, debouncedSearch]);

  return (
    <AccordionContent className="grid grid-cols-6 gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Select a problem from LeetCode or enter a custom problem description.
      </p>
      <Select
        value={source ?? ""}
        onValueChange={setSource}
        disabled={!isCurrentStep}
      >
        <SelectTrigger className="col-span-1 w-full">
          <SelectValue placeholder="Select a source" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={ProblemSource.LeetCode}>LeetCode</SelectItem>
            <SelectItem value={ProblemSource.Custom}>Custom</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {source === ProblemSource.LeetCode && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-[400px] justify-between"
              disabled={!isCurrentStep}
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

      {source === ProblemSource.Custom && (
        <Textarea
          placeholder="Enter your custom problem description."
          value={customProblem}
          onChange={(e) => setCustomProblem(e.target.value)}
          className="col-span-full h-40"
          disabled={!isCurrentStep}
        />
      )}

      {source === ProblemSource.LeetCode && selectedProblem && (
        <div className="col-span-full mt-2">
          <h3 className="mb-2 text-lg font-semibold">
            {selectedProblem.title}
          </h3>
          <div className="text-muted-foreground mb-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              Difficulty:{" "}
              <DifficultyBadge difficulty={selectedProblem.difficulty} />
            </div>
            <div className="flex items-center gap-1">
              Tags:{" "}
              <div className="flex flex-wrap gap-1">
                {selectedProblem.topicTags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            </div>
          </div>
          <div
            className="prose prose-sm text-sm [&_img]:h-auto [&_img]:max-w-full [&_img]:scale-75"
            dangerouslySetInnerHTML={{ __html: problemDetails?.content || "" }}
          />
        </div>
      )}

      <div className="col-span-full flex items-center justify-start gap-0.5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              disabled={
                !isCurrentStep ||
                (source === ProblemSource.LeetCode
                  ? !selectedProblem || !problemDetails
                  : !customProblem)
              }
            >
              {isCurrentStep ? "Begin Problem" : "In Progress"}
              {isCurrentStep && <MoveRight className="h-4 w-4 pt-0.5" />}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you ready to begin?</AlertDialogTitle>
              <AlertDialogDescription>
                You have selected{" "}
                {source === ProblemSource.LeetCode
                  ? `the LeetCode problem: ${selectedProblem?.title}`
                  : "a custom problem"}
                <br />
                <br />
                The timer is currently set to {setpoint / 60} minutes. You will
                receive a notification when the time is up. You can adjust the
                timer in the settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  let problem: PracticeProblem;

                  if (source === ProblemSource.LeetCode) {
                    if (!problemDetails || !selectedProblem) {
                      throw new Error("Problem details are required");
                    }

                    problem = {
                      source: ProblemSource.LeetCode,
                      problem: {
                        ...selectedProblem,
                        details: problemDetails,
                      },
                    };
                  } else {
                    problem = {
                      source: ProblemSource.Custom,
                      problem: { description: customProblem },
                    };
                  }
                  onProblemStart(problem);
                  setOpen(false);
                  startTimer();
                  onNext();
                }}
              >
                Begin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AccordionContent>
  );
}
