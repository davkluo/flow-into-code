import { describe, expect, it } from "vitest";
import { capitalize, formatTime, stripHtml } from "@/lib/formatting";

describe("formatTime", () => {
  it("formats zero as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("pads seconds under 10", () => {
    expect(formatTime(5)).toBe("00:05");
  });

  it("formats exactly one minute", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("pads both minutes and seconds", () => {
    expect(formatTime(61)).toBe("01:01");
  });

  it("handles values over one hour (no hour component, minutes just keep growing)", () => {
    expect(formatTime(3600)).toBe("60:00");
  });
});

describe("capitalize", () => {
  it("capitalizes a lowercase word", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("does not change an already-capitalized word", () => {
    expect(capitalize("World")).toBe("World");
  });

  it("handles an empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("handles a single character", () => {
    expect(capitalize("a")).toBe("A");
  });
});

describe("stripHtml", () => {
  it("strips a basic tag", () => {
    expect(stripHtml("<p>hello</p>")).toBe("hello");
  });

  it("strips nested tags", () => {
    expect(stripHtml("<div><strong>bold</strong></div>")).toBe("bold");
  });

  it("decodes &lt; and &gt;", () => {
    expect(stripHtml("&lt;div&gt;")).toBe("<div>");
  });

  it("decodes &amp;", () => {
    expect(stripHtml("a &amp; b")).toBe("a & b");
  });

  it("decodes &nbsp; to a space", () => {
    expect(stripHtml("a&nbsp;b")).toBe("a b");
  });

  it("decodes numeric character references", () => {
    expect(stripHtml("&#65;")).toBe("A");
  });

  it("strips <script> blocks including their content", () => {
    expect(stripHtml('<script>alert("xss")</script>visible')).toBe("visible");
  });

  it("strips <style> blocks including their content", () => {
    expect(stripHtml("<style>body { color: red }</style>visible")).toBe(
      "visible",
    );
  });

  it("collapses multiple spaces into one", () => {
    expect(stripHtml("hello   world")).toBe("hello world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(stripHtml("  hi  ")).toBe("hi");
  });
});
