import { LCProblem } from "@/types/leetcode";

export const CACHE_PAGE_SIZE = 20;
export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20] as const;
export type ItemsPerPage = (typeof ITEMS_PER_PAGE_OPTIONS)[number];

/**
 * Given a UI page number and items per page, returns the cached page numbers
 * that need to be loaded to display that UI page.
 */
export function getCachedPagesForUIPage(
  uiPage: number,
  itemsPerPage: ItemsPerPage,
): number[] {
  const startIndex = (uiPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;

  const startCachePage = Math.floor(startIndex / CACHE_PAGE_SIZE) + 1;
  const endCachePage = Math.floor(endIndex / CACHE_PAGE_SIZE) + 1;

  const pages: number[] = [];
  for (let i = startCachePage; i <= endCachePage; i++) {
    pages.push(i);
  }
  return pages;
}

/**
 * Extracts problems for a specific UI page from the cached pages.
 */
export function getProblemsForUIPage(
  uiPage: number,
  itemsPerPage: ItemsPerPage,
  cachedPages: Record<number, LCProblem[]>,
): LCProblem[] {
  const startIndex = (uiPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;

  const problems: LCProblem[] = [];

  for (let globalIndex = startIndex; globalIndex <= endIndex; globalIndex++) {
    const cachePage = Math.floor(globalIndex / CACHE_PAGE_SIZE) + 1;
    const indexInCachePage = globalIndex % CACHE_PAGE_SIZE;

    const pageData = cachedPages[cachePage];
    if (!pageData) {
      break; // cached page not loaded yet
    }

    const problem = pageData[indexInCachePage];
    if (!problem) {
      break; // no more problems (end of data)
    }

    problems.push(problem);
  }

  return problems;
}

/**
 * Checks if all required cached pages for a UI page are loaded.
 */
export function hasAllCachedPagesForUIPage(
  uiPage: number,
  itemsPerPage: ItemsPerPage,
  cachedPages: Record<number, LCProblem[]>,
): boolean {
  const requiredPages = getCachedPagesForUIPage(uiPage, itemsPerPage);
  return requiredPages.every((page) => cachedPages[page] !== undefined);
}

/**
 * Calculates the total number of UI pages given total problems and items per page.
 */
export function getTotalUIPages(
  totalProblems: number,
  itemsPerPage: ItemsPerPage,
): number {
  return Math.ceil(totalProblems / itemsPerPage);
}
