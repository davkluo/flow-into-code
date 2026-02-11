"use client";

import _ from "lodash";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import { Card } from "@/components/ui/card";
import { Item, ItemContent } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { cn } from "@/lib/utils";
import { ProblemsPage } from "@/repositories/firestore/problemRepo";
import { Problem, ProblemDetails } from "@/types/problem";
import { Button } from "../ui/button";
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
    setProblemDetails(null);
    setIsLoadingProblemDetails(true);

    try {
      const res = await fetch(`/api/problems/${problem.titleSlug}/preview`);

      if (res.ok) {
        const data: ProblemDetails = await res.json();
        setProblemDetails(data);
      }
    } catch (err) {
      console.error("Failed to fetch problem details:", err);
    } finally {
      setIsLoadingProblemDetails(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setSelectedProblem(null);
    setProblemDetails(null);
  }, []);

  const handleGeneratePreview = useCallback(async () => {
    if (!selectedProblem) return;

    setIsLoadingProblemDetails(true);
    try {
      const res = await fetch(
        `/api/problems/${selectedProblem.titleSlug}/preview`,
        { method: "POST" },
      );

      if (!res.ok) throw new Error("Failed to generate preview");

      const data: ProblemDetails = await res.json();
      setProblemDetails(data);
    } catch (err) {
      console.error("Failed to generate preview:", err);
    } finally {
      setIsLoadingProblemDetails(false);
    }
  }, [selectedProblem]);
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
    <div className="flex flex-col gap-4 px-3.5">
      <Card className="mx-auto mt-12 overflow-hidden py-0 lg:max-w-3xl">
        <div
          className={cn(
            "flex w-[200%] transition-transform duration-300 ease-in-out",
            selectedProblem ? "-translate-x-1/2" : "translate-x-0",
          )}
        >
          {/* Panel 1: Problem List */}
          <div className="w-1/2 shrink-0 p-4">
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

                <div className="mt-2">
                  <h3 className="text-lg font-semibold">
                    {selectedProblem.id}. {selectedProblem.title}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={`https://leetcode.com/problems/${selectedProblem.titleSlug}/description/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground ml-1.5 inline-flex translate-y-[-1px] align-middle"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>View original on LeetCode</TooltipContent>
                    </Tooltip>
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={selectedProblem.difficulty} />
                    {selectedProblem.topicTags.map((tag) => (
                      <TagBadge key={tag.id} tagName={tag.name} />
                    ))}
                  </div>
                </div>

                {!problemDetails && !isLoadingProblemDetails && (
                  <div className="text-muted-foreground rounded-md border border-dashed px-3 py-2.5 text-xs">
                    <p>
                      It looks like you are the first to attempt this problem!
                      This problem hasn&apos;t been prepared yet, but you can
                      generate its details below if you are interested in
                      practicing this problem — it may take a short moment.
                    </p>
                    <div className="flex w-full justify-center">
                      <button
                        onClick={handleGeneratePreview}
                        className="mt-2 cursor-pointer text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
                      >
                        Generate details
                      </button>
                    </div>
                  </div>
                )}

                {isLoadingProblemDetails && (
                  <div className="flex flex-col gap-4">
                    {/* Framing skeleton */}
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-20" />
                      <div className="bg-background rounded-md p-4 dark:bg-black">
                        <div className="flex flex-col gap-2.5">
                          <Skeleton className="h-3.5 w-full" />
                          <Skeleton className="h-3.5 w-full" />
                          <Skeleton className="h-3.5 w-5/6" />
                          <Skeleton className="mt-2 h-3.5 w-full" />
                          <Skeleton className="h-3.5 w-4/6" />
                        </div>
                      </div>
                    </div>
                    {/* Examples skeleton */}
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="bg-background rounded-md p-4 dark:bg-black">
                        <div className="flex flex-col gap-2.5">
                          <Skeleton className="h-3.5 w-2/3" />
                          <Skeleton className="h-3.5 w-1/2" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {problemDetails?.derived?.framing && (
                  <Tabs defaultValue="general">
                    <TabsList variant="line">
                      <TabsTrigger value="general" className="text-xs">
                        General
                      </TabsTrigger>
                      {problemDetails.derived.framing.backend && (
                        <TabsTrigger value="backend" className="text-xs">
                          Backend
                        </TabsTrigger>
                      )}
                      {problemDetails.derived.framing.systems && (
                        <TabsTrigger value="systems" className="text-xs">
                          Systems
                        </TabsTrigger>
                      )}
                    </TabsList>
                    <TabsContent value="general">
                      <Item
                        variant="default"
                        size="sm"
                        className="bg-background rounded-md dark:bg-black"
                      >
                        <ItemContent>
                          <p className="text-sm leading-loose whitespace-pre-line">
                            {problemDetails.derived.framing.canonical}
                          </p>
                        </ItemContent>
                      </Item>
                    </TabsContent>
                    {problemDetails.derived.framing.backend && (
                      <TabsContent value="backend">
                        <Item
                          variant="default"
                          size="sm"
                          className="bg-background rounded-md dark:bg-black"
                        >
                          <ItemContent>
                            <p className="text-sm leading-loose whitespace-pre-line">
                              {problemDetails.derived.framing.backend}
                            </p>
                          </ItemContent>
                        </Item>
                      </TabsContent>
                    )}
                    {problemDetails.derived.framing.systems && (
                      <TabsContent value="systems">
                        <Item
                          variant="default"
                          size="sm"
                          className="bg-background rounded-md dark:bg-black"
                        >
                          <ItemContent>
                            <p className="text-sm leading-loose whitespace-pre-line">
                              {problemDetails.derived.framing.systems}
                            </p>
                          </ItemContent>
                        </Item>
                      </TabsContent>
                    )}
                  </Tabs>
                )}

                {problemDetails?.source?.examples &&
                  problemDetails.source.examples.length > 0 && (
                    <Tabs defaultValue="example-0">
                      <TabsList variant="line">
                        {problemDetails.source.examples.map((_, index) => (
                          <TabsTrigger
                            key={index}
                            value={`example-${index}`}
                            className="text-xs"
                          >
                            Example {index + 1}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {problemDetails.source.examples.map((example, index) => (
                        <TabsContent key={index} value={`example-${index}`}>
                          <Item
                            variant="default"
                            size="sm"
                            className="bg-background rounded-md dark:bg-black"
                          >
                            <ItemContent className="gap-2">
                              <p className="font-mono text-sm">
                                <span className="text-muted-foreground">
                                  Input:{" "}
                                </span>
                                {example.input}
                              </p>
                              <p className="font-mono text-sm">
                                <span className="text-muted-foreground">
                                  Output:{" "}
                                </span>
                                {example.output}
                              </p>
                              {example.explanation &&
                                example.explanation !== "null" && (
                                  <p className="mt-1 text-sm leading-relaxed">
                                    {example.explanation}
                                  </p>
                                )}
                            </ItemContent>
                          </Item>
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}

                {isEditable && problemDetails && (
                  <div className="flex justify-center">
                    <Button
                      className="w-min"
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
