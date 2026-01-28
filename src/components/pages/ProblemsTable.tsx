"use client";

import { Eye, Lock, Search } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ITEMS_PER_PAGE_OPTIONS, ItemsPerPage } from "@/lib/pagination";
import { LCProblem } from "@/types/leetcode";

interface ProblemsTableProps {
  problems: LCProblem[];
  currentPage: number;
  totalPages: number | null;
  isLoading: boolean;
  itemsPerPage: ItemsPerPage;
  search: string;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: ItemsPerPage) => void;
  onProblemSelect?: (problem: LCProblem) => void;
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
    const pages: (number | "ellipsis")[] = [];

    // Determine visible range around current page
    const start = Math.max(1, currentPage - 1);
    const end = currentPage + 1;

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
      <div className="grid grid-cols-[minmax(120px,200px)_1fr] items-center gap-3 text-xs">
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-input bg-background placeholder:text-muted-foreground h-8 w-full rounded-md border py-1 pl-7 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Pagination className="mx-0 w-auto">
            <PaginationContent className="gap-0.5">
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevious}
                  className={`h-7 px-2 text-xs ${
                    !canGoPrevious
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }`}
                />
              </PaginationItem>

              {getVisiblePages().map((page, index) =>
                typeof page === "string" ? (
                  <PaginationItem key={`${page}-${index}`}>
                    <PaginationEllipsis className="h-7 w-7" />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => onPageChange(page)}
                      className="h-7 w-7 cursor-pointer text-xs"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  className={`h-7 px-2 text-xs ${
                    !canGoNext ? "pointer-events-none opacity-50" : "cursor-pointer"
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Per page:</span>
            <Select
              value={String(itemsPerPage)}
              onValueChange={(value) =>
                onItemsPerPageChange(Number(value) as ItemsPerPage)
              }
            >
              <SelectTrigger size="sm" className="h-7 w-14 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)} className="text-xs">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Table>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : problems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground text-center">
                No problems found.
              </TableCell>
            </TableRow>
          ) : (
            problems.map((problem) =>
              problem.isPaidOnly ? (
                <Tooltip key={problem.id}>
                  <TooltipTrigger asChild>
                    <TableRow className="hover:bg-transparent opacity-50 cursor-default">
                      <TableCell className="text-sm">
                        {problem.id}. {problem.title}
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
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
                    <div className="flex flex-wrap gap-1">
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProblemSelect?.(problem);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}
