"use client";

import { Lock } from "lucide-react";
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
  TableHead,
  TableHeader,
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Per page:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) =>
              onItemsPerPageChange(Number(value) as ItemsPerPage)
            }
          >
            <SelectTrigger size="sm" className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePrevious}
                className={
                  !canGoPrevious
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {getVisiblePages().map((page, index) =>
              typeof page === "string" ? (
                <PaginationItem key={`${page}-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => onPageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                onClick={handleNext}
                className={
                  !canGoNext ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[100px]">Difficulty</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : problems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground text-center">
                No problems found.
              </TableCell>
            </TableRow>
          ) : (
            problems.map((problem) => (
              <TableRow key={problem.id}>
                <TableCell className="text-sm">{problem.id}</TableCell>
                <TableCell className="text-sm">{problem.title}</TableCell>
                <TableCell>
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
                <TableCell>
                  {problem.isPaidOnly ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-muted-foreground inline-flex cursor-default">
                          <Lock className="h-4 w-4" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Premium problems are not available
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProblemSelect?.(problem);
                      }}
                    >
                      View
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
