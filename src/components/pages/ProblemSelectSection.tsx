"use client";

import _ from "lodash";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
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
import { filterAndSortProblems } from "@/lib/search";
import { cn } from "@/lib/utils";
import { Problem } from "@/types/leetcode";

interface ProblemSelectSectionProps {
  problems: Problem[];
}

export function ProblemSelectSection({ problems }: ProblemSelectSectionProps) {
  const [source, setSource] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debouncedSetSearch = useMemo(
    () => _.debounce((value: string) => setDebouncedSearch(value), 200),
    [],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSetSearch(value);
  };

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const filteredAndSortedProblems = useMemo(() => {
    return filterAndSortProblems(problems, debouncedSearch);
  }, [problems, debouncedSearch]);

  return (
    <div className="flex gap-4">
      <Select value={source ?? ""} onValueChange={setSource}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a source" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="leetcode">LeetCode</SelectItem>
            <SelectItem value="hackerrank">HackerRank</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[350px] justify-between"
          >
            {selectedProblem
              ? `${selectedProblem.id}. ${selectedProblem.title}`
              : "Select a problem"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                              setSelectedProblem(problem);
                              setOpen(false);
                            }}
                          >
                            {problem.id}. {problem.title}
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
    </div>
  );
}
