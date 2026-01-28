"use client";

import { ExternalLink } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
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
import { LCProblem } from "@/types/leetcode";

interface ProblemsTableProps {
  problems: LCProblem[];
  currentPage: number;
  maxPage: number;
  isEndReached: boolean;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onProblemSelect?: (problem: LCProblem) => void;
}

export function ProblemsTable({
  problems,
  currentPage,
  maxPage,
  isEndReached,
  isLoading,
  onPageChange,
  onProblemSelect,
}: ProblemsTableProps) {
  const canGoNext = !isEndReached || currentPage < maxPage;
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

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = !isEndReached || currentPage < maxPage - 2;

    if (showEllipsisStart) {
      pages.push(1);
      pages.push("ellipsis");
    }

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(maxPage, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (showEllipsisEnd && isEndReached) {
      pages.push("ellipsis");
      pages.push(maxPage);
    }

    return pages;
  };

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[100px]">Difficulty</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[50px]"></TableHead>
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
              <TableRow
                key={problem.id}
                className={onProblemSelect ? "cursor-pointer" : ""}
                onClick={() => onProblemSelect?.(problem)}
              >
                <TableCell className="font-medium">{problem.id}</TableCell>
                <TableCell>{problem.title}</TableCell>
                <TableCell>
                  <DifficultyBadge difficulty={problem.difficulty} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {problem.topicTags.slice(0, 3).map((tag) => (
                      <TagBadge key={tag.id} tagName={tag.name} />
                    ))}
                    {problem.topicTags.length > 3 && (
                      <span className="text-muted-foreground text-xs">
                        +{problem.topicTags.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://leetcode.com/problems/${problem.titleSlug}/description/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrevious}
              className={!canGoPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {getVisiblePages().map((page, index) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
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
              className={!canGoNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
