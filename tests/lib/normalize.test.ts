import { describe, expect, it } from "vitest";

import { normalizeToWords } from "@/lib/normalize";

describe("normalizeToWords", () => {
  it("splits on spaces", () => {
    expect(normalizeToWords("hello world")).toEqual(["hello", "world"]);
  });

  it("converts to lowercase", () => {
    expect(normalizeToWords("Hello World")).toEqual(["hello", "world"]);
  });

  it("splits on hyphens", () => {
    expect(normalizeToWords("two-sum")).toEqual(["two", "sum"]);
  });

  it("strips punctuation", () => {
    expect(normalizeToWords("hello, world!")).toEqual(["hello", "world"]);
  });

  it("preserves numbers", () => {
    expect(normalizeToWords("problem 123")).toEqual(["problem", "123"]);
  });

  it("filters empty tokens from leading/trailing whitespace", () => {
    expect(normalizeToWords("  hello  ")).toEqual(["hello"]);
  });

  it("returns empty array for empty string", () => {
    expect(normalizeToWords("")).toEqual([]);
  });
});
