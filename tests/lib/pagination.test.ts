import { describe, expect, it } from "vitest";
import {
  CACHE_PAGE_SIZE,
  getCachedPagesForUIPage,
  getProblemsForUIPage,
  getTotalUIPages,
  hasAllCachedPagesForUIPage,
} from "@/lib/pagination";
import type { Problem } from "@/types/problem";

function makeProblem(id: string): Problem {
  return {
    id,
    title: `Problem ${id}`,
    titleSlug: `problem-${id}`,
    difficulty: "Easy",
    isPaidOnly: false,
    topicTags: [],
  };
}

// ─── getTotalUIPages ──────────────────────────────────────────────────────────

describe("getTotalUIPages", () => {
  it("divides evenly", () => {
    expect(getTotalUIPages(20, 10)).toBe(2);
  });

  it("rounds up when problems don't divide evenly", () => {
    expect(getTotalUIPages(21, 10)).toBe(3);
  });

  it("returns 1 when total problems fits on one page", () => {
    expect(getTotalUIPages(5, 10)).toBe(1);
  });

  it("returns 0 for zero problems", () => {
    expect(getTotalUIPages(0, 10)).toBe(0);
  });
});

// ─── getCachedPagesForUIPage ──────────────────────────────────────────────────

describe("getCachedPagesForUIPage", () => {
  it("works when itemsPerPage matches CACHE_PAGE_SIZE", () => {
    expect(getCachedPagesForUIPage(1, CACHE_PAGE_SIZE)).toEqual([1]);
    expect(getCachedPagesForUIPage(2, CACHE_PAGE_SIZE)).toEqual([2]);
    expect(getCachedPagesForUIPage(3, CACHE_PAGE_SIZE)).toEqual([3]);
  });

  it("returns the correct cache page for uiPage=1", () => {
    expect(getCachedPagesForUIPage(1, 5)).toEqual([1]);
    expect(getCachedPagesForUIPage(1, 10)).toEqual([1]);
  });

  it("maps multiple UI pages to the same cache page and advances correctly", () => {
    expect(getCachedPagesForUIPage(1, 5)).toEqual([1]);
    expect(getCachedPagesForUIPage(2, 5)).toEqual([1]);
    expect(getCachedPagesForUIPage(3, 5)).toEqual([1]);
    expect(getCachedPagesForUIPage(4, 5)).toEqual([1]);
    expect(getCachedPagesForUIPage(5, 5)).toEqual([2]);
  });
});

// ─── hasAllCachedPagesForUIPage ───────────────────────────────────────────────

describe("hasAllCachedPagesForUIPage", () => {
  it("returns true when the required cache page is present", () => {
    const cachedPages = { 1: [makeProblem("1")] };
    expect(hasAllCachedPagesForUIPage(1, 5, cachedPages)).toBe(true);
  });

  it("returns false when the required cache page is missing", () => {
    expect(hasAllCachedPagesForUIPage(1, 5, {})).toBe(false);
  });

  it("returns false when a later cache page is missing", () => {
    // uiPage=5, itemsPerPage=5 requires cache page 2
    expect(hasAllCachedPagesForUIPage(5, 5, { 1: [makeProblem("1")] })).toBe(
      false,
    );
  });
});

// ─── getProblemsForUIPage ─────────────────────────────────────────────────────

describe("getProblemsForUIPage", () => {
  it("returns the right problems for the first UI page", () => {
    const cachedPages = {
      1: [
        makeProblem("1"),
        makeProblem("2"),
        makeProblem("3"),
        makeProblem("4"),
        makeProblem("5"),
        makeProblem("6"),
      ],
    };
    expect(getProblemsForUIPage(1, 5, cachedPages)).toEqual([
      makeProblem("1"),
      makeProblem("2"),
      makeProblem("3"),
      makeProblem("4"),
      makeProblem("5"),
    ]);
  });

  it("truncates results when cache page has fewer problems than itemsPerPage", () => {
    const cachedPages = {
      1: [makeProblem("1"), makeProblem("2"), makeProblem("3")],
    };
    expect(getProblemsForUIPage(1, 5, cachedPages)).toEqual([
      makeProblem("1"),
      makeProblem("2"),
      makeProblem("3"),
    ]);
  });

  it("returns an empty array when the required cache page is missing", () => {
    expect(getProblemsForUIPage(1, 5, {})).toEqual([]);
  });

  it("reads from the correct cache page for later UI pages", () => {
    const cachedPages = {
      1: Array.from({ length: CACHE_PAGE_SIZE }, (_, i) =>
        makeProblem((i + 1).toString()),
      ),
      2: [makeProblem("21"), makeProblem("22")],
    };

    expect(getProblemsForUIPage(5, 5, cachedPages)).toEqual([
      makeProblem("21"),
      makeProblem("22"),
    ]);
  });
});
