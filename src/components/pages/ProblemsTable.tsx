"use client";

import { ChevronLeft, ChevronRight, Eye, Lock, Search } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ITEMS_PER_PAGE_OPTIONS, ItemsPerPage } from "@/lib/pagination";
import { Problem } from "@/types/leetcode";

interface ProblemsTableProps {
  problems: Problem[];
  currentPage: number;
  totalPages: number | null;
  isLoading: boolean;
  itemsPerPage: ItemsPerPage;
  search: string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: ItemsPerPage) => void;
  onProblemSelect?: (problem: Problem) => void;
}

export function ProblemsTable({
  problems,
  currentPage,
  totalPages,
  isLoading,
  itemsPerPage,
  search,
  onSearchChange,
  onPageChange,
  onItemsPerPageChange,
  onProblemSelect,
}: ProblemsTableProps) {
  const canGoNext = totalPages === null || currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  /**
   * Returns visible page numbers with ellipsis.
   * Shows current page and neighbors, with ellipsis + page 1 for navigation back.
   * Examples:
   * - Page 1: [1] [2] [3]
   * - Page 5: [1] ... [4] [5] [6]
   * - Page 20: [1] ... [19] [20] [21]
   */
  const getVisiblePages = (): (number | "ellipsis")[] => {
    if (totalPages === null) {
      return [currentPage];
    }

    const pages: (number | "ellipsis")[] = [];

    // Determine visible range around current page
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(totalPages, currentPage + 1);

    // Add page 1 and ellipsis if current page is far from start
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("ellipsis");
      }
    }

    // Add pages around current
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[minmax(120px,200px)_1fr] items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 border-b py-0.5">
          <Search className="text-muted-foreground h-3.5 w-3.5" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="placeholder:text-muted-foreground w-full bg-transparent text-sm focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <nav className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`flex items-center gap-0.5 px-1 ${
                canGoPrevious
                  ? "cursor-pointer hover:underline"
                  : "text-muted-foreground cursor-default"
              }`}
            >
              <ChevronLeft className="h-3 w-3" />
              Previous
            </button>

            {getVisiblePages().map((page, index) =>
              typeof page === "string" ? (
                <span
                  key={`${page}-${index}`}
                  className="text-muted-foreground px-1"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-1 ${
                    page === currentPage
                      ? "underline"
                      : "cursor-pointer hover:underline"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className={`flex items-center gap-0.5 px-1 ${
                canGoNext
                  ? "cursor-pointer hover:underline"
                  : "text-muted-foreground cursor-default"
              }`}
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </nav>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Per page:</span>
            <div className="flex items-center gap-1">
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => onItemsPerPageChange(option)}
                  className={`px-1 ${
                    option === itemsPerPage
                      ? "underline"
                      : "cursor-pointer hover:underline"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Table className="table-fixed">
        <colgroup>
          <col className="w-auto" />
          <col className="w-10" />
          <col className="w-60" />
          <col className="w-12" />
        </colgroup>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground text-center"
              >
                Loading...
              </TableCell>
            </TableRow>
          ) : problems.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-muted-foreground text-center"
              >
                No problems found.
              </TableCell>
            </TableRow>
          ) : (
            problems.map((problem) =>
              problem.isPaidOnly ? (
                <Tooltip key={problem.id}>
                  <TooltipTrigger asChild>
                    <TableRow className="cursor-default opacity-50 hover:bg-transparent">
                      <TableCell className="text-sm">
                        {problem.id}. {problem.title}
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          {problem.topicTags.slice(0, 2).map((tag) => (
                            <TagBadge key={tag.id} tagName={tag.name} />
                          ))}
                          {problem.topicTags.length > 2 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-muted-foreground cursor-default text-xs">
                                  +{problem.topicTags.length - 2}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex flex-wrap gap-1">
                                  {problem.topicTags.slice(2).map((tag) => (
                                    <TagBadge key={tag.id} tagName={tag.name} />
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <div className="inline-flex h-8 w-8 items-center justify-center">
                          <Lock className="h-4 w-4" />
                        </div>
                      </TableCell>
                    </TableRow>
                  </TooltipTrigger>
                  <TooltipContent>
                    Sorry! Premium problems are not available.
                  </TooltipContent>
                </Tooltip>
              ) : (
                <TableRow key={problem.id} className="hover:bg-transparent">
                  <TableCell className="text-sm">
                    {problem.id}. {problem.title}
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1">
                      {problem.topicTags.slice(0, 2).map((tag) => (
                        <TagBadge key={tag.id} tagName={tag.name} />
                      ))}
                      {problem.topicTags.length > 2 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-muted-foreground cursor-default text-xs">
                              +{problem.topicTags.length - 2}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="flex flex-wrap gap-1">
                              {problem.topicTags.slice(2).map((tag) => (
                                <TagBadge key={tag.id} tagName={tag.name} />
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProblemSelect?.(problem);
                      }}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ),
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
