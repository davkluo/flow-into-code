"use client";

import _ from "lodash";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  getProblemDataApiPath,
  LC_PROBLEMS_API_PATH,
  PROBLEM_INDEX_META_API_PATH,
  SESSIONS_API_PATH,
} from "@/constants/api";
import { useSessionsRemaining } from "@/hooks/useSessionsRemaining";
import { authFetch } from "@/lib/authFetch";
import { timeUntilMidnightUTC } from "@/lib/date";
import {
  CACHE_PAGE_SIZE,
  getCachedPagesForUIPage,
  getProblemsForUIPage,
  getTotalUIPages,
  ItemsPerPage,
} from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { ProblemsPage } from "@/repositories/firestore/problemRepo";
import { Problem, ProblemDetails } from "@/types/problem";
import { Button } from "../ui/button";
import { ProblemDetailContent } from "./ProblemDetailContent";
import { ProblemsTable } from "./ProblemsTable";

interface ProblemSelectSectionProps {
  onProblemSelect: (problem: Problem, problemDetails: ProblemDetails) => void;
  isEditable: boolean;
}

export function ProblemSelectSection({
  onProblemSelect,
  isEditable,
}: ProblemSelectSectionProps) {
  // #region State Variables
  const [isLoadingProblemList, setIsLoadingProblemList] = useState(true);
  const [isLoadingProblemDetails, setIsLoadingProblemDetails] = useState(false);

  const [cachedPages, setCachedPages] = useState<Record<number, Problem[]>>({});
  const [pageCursors, setPageCursors] = useState<
    Record<number, number | undefined>
  >({});

  const [currentUIPage, setCurrentUIPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(10);
  const [totalProblems, setTotalProblems] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Problem[] | null>(null);

  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(
    null,
  );
  const pollAbortRef = useRef<AbortController | null>(null);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());
  const { remaining, isLoading: isLoadingRemaining } = useSessionsRemaining();
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

        const res = await authFetch(
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

  const pollForPreview = useCallback(
    async (slug: string): Promise<ProblemDetails | null> => {
      pollAbortRef.current?.abort();
      const controller = new AbortController();
      pollAbortRef.current = controller;

      const delays = [1000, 2000, 4000, 8000, 8000, 8000];
      for (const delay of delays) {
        if (controller.signal.aborted) return null;
        await new Promise((r) => setTimeout(r, delay));
        if (controller.signal.aborted) return null;

        try {
          const res = await authFetch(getProblemDataApiPath(slug, "preview"), {
            signal: controller.signal,
          });
          if (res.ok) return (await res.json()) as ProblemDetails;
          if (res.status !== 202) return null;
        } catch {
          if (controller.signal.aborted) return null;
        }
      }

      return null;
    },
    [],
  );

  const handleViewProblem = useCallback(
    async (problem: Problem) => {
      setSelectedProblem(problem);
      setProblemDetails(null);
      setIsLoadingProblemDetails(true);

      try {
        const res = await authFetch(
          getProblemDataApiPath(problem.titleSlug, "preview"),
        );

        if (res.status === 200) {
          const data: ProblemDetails = await res.json();
          setProblemDetails(data);
          return;
        }

        if (res.status === 202) {
          const data = await pollForPreview(problem.titleSlug);
          if (data) {
            setProblemDetails(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch problem details:", err);
      } finally {
        setIsLoadingProblemDetails(false);
      }
    },
    [pollForPreview],
  );

  const handleBack = useCallback(() => {
    pollAbortRef.current?.abort();
    setSelectedProblem(null);
    setProblemDetails(null);
  }, []);

  const handleGeneratePreview = useCallback(async () => {
    if (!selectedProblem) return;

    setIsLoadingProblemDetails(true);
    try {
      const res = await authFetch(
        getProblemDataApiPath(selectedProblem.titleSlug, "preview"),
        { method: "POST" },
      );

      if (res.status === 200) {
        const data: ProblemDetails = await res.json();
        setProblemDetails(data);
        return;
      }

      if (res.status === 202) {
        const data = await pollForPreview(selectedProblem.titleSlug);
        if (data) {
          setProblemDetails(data);
          return;
        }
        toast.warning("Generation is taking longer than expected", {
          description: "Please try again in a moment.",
        });
      } else {
        throw new Error("Failed to generate preview");
      }
    } catch (err) {
      console.error("Failed to generate preview:", err);
    } finally {
      setIsLoadingProblemDetails(false);
    }
  }, [selectedProblem, pollForPreview]);
  // #endregion Stable Callbacks

  // #region Effects
  // Fetch completed problem slugs from session history on mount
  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        const res = await authFetch(SESSIONS_API_PATH);
        if (res.ok) {
          const data = await res.json();
          setCompletedSlugs(
            new Set(
              data.sessions.map(
                (s: { problemTitleSlug: string }) => s.problemTitleSlug,
              ),
            ),
          );
        }
      } catch (err) {
        console.error("Failed to fetch session history:", err);
      }
    };
    fetchCompleted();
  }, []);

  // Fetch total problems count on mount
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await authFetch(PROBLEM_INDEX_META_API_PATH);
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
        const res = await authFetch(
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-0 pt-4 pb-4 sm:px-3.5">
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-semibold">Problems</h1>
      </div>

      {!isLoadingRemaining && remaining !== null && (
        <div
          className={cn(
            "rounded-lg border px-4 py-2.5",
            remaining === 0
              ? "border-destructive/40 bg-destructive/5 text-destructive"
              : "border-border bg-muted/30 text-muted-foreground",
          )}
        >
          <p className="text-xs">
            {remaining === 0
              ? "You have no practice sessions remaining today"
              : `You have ${remaining} practice session${remaining === 1 ? "" : "s"} remaining today`}
            . Resets in {timeUntilMidnightUTC()}
          </p>
        </div>
      )}

      <Card className="overflow-hidden py-0">
        <div
          className={cn(
            "flex w-[200%] transition-transform duration-300 ease-in-out",
            selectedProblem ? "-translate-x-1/2" : "translate-x-0",
          )}
        >
          {/* Panel 1: Problem List */}
          <div className="w-1/2 shrink-0 px-4 pt-4 pb-2">
            <ProblemsTable
              problems={displayedProblems}
              currentPage={currentUIPage}
              totalPages={totalUIPages}
              isLoading={isLoadingProblemList}
              itemsPerPage={itemsPerPage}
              search={search}
              completedSlugs={completedSlugs}
              onSearchChange={setSearch}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onProblemSelect={handleViewProblem}
            />
          </div>

          {/* Panel 2: Problem Detail */}
          <div className="w-1/2 shrink-0 p-4">
            {selectedProblem && (
              <div className="mx-2 flex flex-col gap-4">
                <button
                  onClick={handleBack}
                  className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to problems
                </button>

                <ProblemDetailContent
                  problem={selectedProblem}
                  problemDetails={problemDetails}
                  isLoading={isLoadingProblemDetails}
                  onGeneratePreview={handleGeneratePreview}
                  showGenerateButton={true}
                />

                {isEditable && problemDetails && (
                  <div className="flex justify-center">
                    <Button
                      className="after:bg-brand-primary relative overflow-hidden after:absolute after:right-0 after:bottom-0 after:left-0 after:h-1 after:origin-left after:scale-x-0 after:transition-transform after:duration-300 hover:after:scale-x-100"
                      disabled={remaining !== null && remaining === 0}
                      onClick={() =>
                        onProblemSelect(selectedProblem, problemDetails)
                      }
                    >
                      Begin Practice
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
