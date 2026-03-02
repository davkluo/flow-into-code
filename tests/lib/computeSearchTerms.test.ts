import { describe, expect, it } from "vitest";

import { computeSearchTerms } from "@/lib/computeSearchTerms";
import type { Problem } from "@/types/problem";

function makeProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: "1",
    title: "Two Sum",
    titleSlug: "two-sum",
    difficulty: "Easy",
    isPaidOnly: false,
    topicTags: [],
    ...overrides,
  };
}

describe("computeSearchTerms", () => {
  it("includes the problem id", () => {
    const terms = computeSearchTerms(makeProblem({ id: "42" }));
    expect(terms).toContain("42");
  });

  it("includes normalized title words", () => {
    const terms = computeSearchTerms(makeProblem({ title: "Two Sum" }));
    expect(terms).toContain("two");
    expect(terms).toContain("sum");
  });

  it("includes normalized slug words", () => {
    const terms = computeSearchTerms(makeProblem({ titleSlug: "two-sum" }));
    expect(terms).toContain("two");
    expect(terms).toContain("sum");
  });

  it("includes lowercased difficulty", () => {
    expect(computeSearchTerms(makeProblem({ difficulty: "Hard" }))).toContain(
      "hard",
    );
  });

  it("includes words from topic tag names", () => {
    const terms = computeSearchTerms(
      makeProblem({
        topicTags: [{ id: "1", slug: "hash-table", name: "Hash Table" }],
      }),
    );
    expect(terms).toContain("hash");
    expect(terms).toContain("table");
  });

  it("deduplicates terms that appear in both title and slug", () => {
    // "two" and "sum" appear in both title and titleSlug
    const terms = computeSearchTerms(makeProblem());
    const count = terms.filter((t) => t === "two").length;
    expect(count).toBe(1);
  });

  it("handles empty topicTags without error", () => {
    expect(() => computeSearchTerms(makeProblem({ topicTags: [] }))).not.toThrow();
  });
});
