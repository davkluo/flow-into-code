"use client";

import _ from "lodash";
import { ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AccordionContent } from "@/components/ui/accordion";
import {
  LC_PROBLEMS_API_PATH,
  PROBLEM_INDEX_META_API_PATH,
} from "@/constants/api";
import {
  CACHE_PAGE_SIZE,
  getCachedPagesForUIPage,
  getProblemsForUIPage,
  getTotalUIPages,
  ItemsPerPage,
} from "@/lib/pagination";
import { ProblemsPage } from "@/repositories/firestore/problemRepo";
import { Problem, ProblemDetails } from "@/types/leetcode";
import { PracticeProblem } from "@/types/practice";
import { ProblemsTable } from "./ProblemsTable";

interface ProblemSelectSectionProps {
  onProblemSelect: (problem: PracticeProblem) => void;
  isEditable: boolean;
}

export function ProblemSelectSection({
  onProblemSelect,
  isEditable,
}: ProblemSelectSectionProps) {
  // #region State Variables
  const [isLoadingProblemList, setIsLoadingProblemList] = useState(false);
  const [isLoadingProblemDetails, setIsLoadingProblemDetails] = useState(false);

  const [cachedPages, setCachedPages] = useState<Record<number, Problem[]>>({});
  const [pageCursors, setPageCursors] = useState<
    Record<number, number | undefined>
  >({});

  const [currentUIPage, setCurrentUIPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(5);
  const [totalProblems, setTotalProblems] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Problem[] | null>(null);

  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(
    null,
  );
  // #endregion State Variables

  // #region Local Helpers
  const getSearchResultsForUIPage = (
    results: Problem[],
    uiPage: number,
    itemsPerPage: ItemsPerPage,
  ): Problem[] => {
    const start = (uiPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return results.slice(start, end);
  };
  // #endregion Local Helpers

  // #region Derived Values
  const displayedProblems = useMemo(() => {
    if (searchResults !== null) {
      return getSearchResultsForUIPage(
        searchResults,
        currentUIPage,
        itemsPerPage,
      );
    }

    return getProblemsForUIPage(currentUIPage, itemsPerPage, cachedPages);
  }, [searchResults, currentUIPage, itemsPerPage, cachedPages]);

  const totalUIPages = useMemo(() => {
    if (searchResults !== null) {
      return getTotalUIPages(searchResults.length, itemsPerPage);
    }

    if (totalProblems !== null) {
      return getTotalUIPages(totalProblems, itemsPerPage);
    }

    return null;
  }, [searchResults, totalProblems, itemsPerPage]);
  // #endregion Derived Values

  // #region Stable Callbacks
  /**
   * Load a specific cached page from the API and store it in state.
   */
  const loadCachedPage = useCallback(
    async (cachePage: number) => {
      if (cachedPages[cachePage]) return; // already cached

      setIsLoadingProblemList(true);

      try {
        const cursor = pageCursors[cachePage - 1];

        const res = await fetch(
          `${LC_PROBLEMS_API_PATH}?limit=${CACHE_PAGE_SIZE}${cursor ? `&cursor=${cursor}` : ""}`,
        );

        if (!res.ok) throw new Error("Failed to fetch page");

        const data: ProblemsPage = await res.json();

        if (data.problems.length > 0) {
          setCachedPages((prev) => ({ ...prev, [cachePage]: data.problems }));
          setPageCursors((prev) => ({ ...prev, [cachePage]: data.nextCursor }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingProblemList(false);
      }
    },
    [cachedPages, pageCursors],
  );

  /**
   * Determine which cached pages are needed for a given UI page, and load them.
   */
  const loadPagesForUIPage = useCallback(
    async (uiPage: number) => {
      const requiredCachePages = getCachedPagesForUIPage(uiPage, itemsPerPage);
      for (const cachePage of requiredCachePages) {
        await loadCachedPage(cachePage);
      }
    },
    [itemsPerPage, loadCachedPage],
  );

  /**
   * Handle when the user changes the current UI page.
   * NOTE: Memoized since child component ProblemsTable is a heavy component.
   */
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (totalUIPages !== null) {
        if (newPage < 1 || newPage > totalUIPages) return;
      }

      setCurrentUIPage(newPage);

      if (searchResults === null) {
        loadPagesForUIPage(newPage);
      }
    },
    [totalUIPages, searchResults, loadPagesForUIPage],
  );

  /**
   * Handle when the user changes the number of items per page.
   * NOTE: Memoized since child component ProblemsTable is a heavy component.
   */
  const handleItemsPerPageChange = useCallback(
    (newItemsPerPage: ItemsPerPage) => {
      setItemsPerPage(newItemsPerPage);
      setCurrentUIPage(1);
    },
    [],
  );

  const debouncedSetSearch = useMemo(
    () =>
      _.debounce(
        (value: string) => setDebouncedSearch(value.trim().toLowerCase()),
        300,
      ),
    [],
  );

  const handleViewProblem = useCallback(async (problem: Problem) => {
    setSelectedProblem(problem);

    console.log("Problem selected:", problem);
    // Test: trigger process-problem API
    try {
      const res = await fetch("/api/process-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(problem),
      });
      console.log("process-problem response:", await res.json());
    } catch (err) {
      console.error("Failed to process problem:", err);
    }
  }, []);
  // #endregion Stable Callbacks

  // #region Effects
  // Fetch total problems count on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch(PROBLEM_INDEX_META_API_PATH);
        if (res.ok) {
          const data = await res.json();
          setTotalProblems(data.totalProblems);
        }
      } catch (err) {
        console.error("Failed to fetch problem index meta:", err);
      }
    };
    fetchMeta();
  }, []);

  // Initial load of problems
  useEffect(() => {
    loadPagesForUIPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update debounced search when search changes
  useEffect(() => {
    debouncedSetSearch(search);

    // Cleanup on unmount
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [search, debouncedSetSearch]);

  // Fetch search results when debounced search changes
  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults(null);
      setCurrentUIPage(1);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoadingProblemList(true);
      try {
        const res = await fetch(
          `${LC_PROBLEMS_API_PATH}?q=${encodeURIComponent(debouncedSearch)}`,
        );

        if (!res.ok) throw new Error("Failed to fetch search results");

        const data: ProblemsPage = await res.json();
        setSearchResults(data.problems);
        setCurrentUIPage(1);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoadingProblemList(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearch]);

  // #endregion Effects

  return (
    <AccordionContent className="flex flex-col gap-4 px-3.5">
      <p className="text-muted-foreground text-xs">
        Select a problem from LeetCode to begin your practice session.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="col-span-1">
          <ProblemsTable
            problems={displayedProblems}
            currentPage={currentUIPage}
            totalPages={totalUIPages}
            isLoading={isLoadingProblemList}
            itemsPerPage={itemsPerPage}
            search={search}
            onSearchChange={setSearch}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            onProblemSelect={handleViewProblem}
          />
        </div>

        <div className="col-span-1">
          {selectedProblem ? (
            <div className="flex flex-col gap-4 rounded-lg border p-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">
                    {selectedProblem.id}. {selectedProblem.title}
                  </h3>
                  <a
                    href={`https://leetcode.com/problems/${selectedProblem.titleSlug}/description/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <div className="text-muted-foreground mt-1 text-sm">
                  Difficulty: {selectedProblem.difficulty}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Problem Context</h4>
                <p className="text-muted-foreground text-sm">
                  This problem involves finding an optimal solution using
                  dynamic programming techniques. The key insight is recognizing
                  the overlapping subproblems structure.
                </p>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Key Concepts</h4>
                <ul className="text-muted-foreground list-inside list-disc text-sm">
                  <li>Array manipulation</li>
                  <li>Two-pointer technique</li>
                  <li>Time complexity: O(n)</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Hints</h4>
                <p className="text-muted-foreground text-sm">
                  Consider how you might solve this if the array was sorted.
                  What data structure could help track elements you&apos;ve
                  seen?
                </p>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm">
              Select a problem to view details
            </div>
          )}
        </div>
      </div>
    </AccordionContent>
  );
}
