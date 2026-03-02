import { describe, expect, it } from "vitest";
import { processCodeSnippet, stripTestBlock } from "@/lib/codeSnippet";
import { LangSlug } from "@/types/languages";

// ─── stripTestBlock ───────────────────────────────────────────────────────────

describe("stripTestBlock", () => {
  it("strips the __main__ block from Python code", () => {
    const code = `def solve():\n    pass\n\nif __name__ == "__main__":\n    pass\n`;
    expect(stripTestBlock(code, LangSlug.PYTHON3)).toBe(
      `def solve():\n    pass\n`,
    );
  });

  it("returns code unchanged when no __main__ block is present", () => {
    const code = `def solve():\n    pass`;
    expect(stripTestBlock(code, LangSlug.PYTHON3)).toBe(code);
  });
});

// ─── processCodeSnippet ───────────────────────────────────────────────────────

describe("processCodeSnippet", () => {
  it("returns empty string for empty input", () => {
    expect(processCodeSnippet("", LangSlug.PYTHON3)).toBe("");
  });

  it("appends a __main__ block to Python snippets", () => {
    const raw = `def solve():\n    pass`;
    const result = processCodeSnippet(raw, LangSlug.PYTHON3);
    expect(result).toContain('if __name__ == "__main__"');
  });

  it("inserts pass into an empty Python function body", () => {
    const raw = `def solve():`;
    const result = processCodeSnippet(raw, LangSlug.PYTHON3);
    expect(result).toContain("    pass");
  });

  it("uncomments class definitions in Python snippets", () => {
    const raw = `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def solve(self) -> None:`;
    const result = processCodeSnippet(raw, LangSlug.PYTHON3);
    expect(result).toContain("# Definition for singly-linked list.");
    expect(result).toContain("\nclass ListNode:");
    expect(result).not.toContain("# class ListNode:");
    expect(result).toContain("\n    def __init__(self, val=0, next=None):");
  });

  it("uncomments class definitions without a preceding comment", () => {
    const raw = `# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def solve(self) -> None:`;
    const result = processCodeSnippet(raw, LangSlug.PYTHON3);
    expect(result).toContain("class TreeNode:");
    expect(result).not.toContain("# class TreeNode:");
    expect(result).toContain(
      "\n    def __init__(self, val=0, left=None, right=None):",
    );
  });

  it("uncomments multiple class definitions in the same snippet", () => {
    const raw = `# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def solve(self) -> None:`;
    const result = processCodeSnippet(raw, LangSlug.PYTHON3);
    expect(result).toContain("class TreeNode:");
    expect(result).not.toContain("# class TreeNode:");
    expect(result).toContain(
      "\n    def __init__(self, val=0, left=None, right=None):",
    );
    expect(result).toContain("class ListNode:");
    expect(result).not.toContain("# class ListNode:");
    expect(result).toContain("\n    def __init__(self, val=0, next=None):");
  });

  it("does not uncomment if there are no class definitions", () => {
    const raw = `# Just a comment\nclass Solution:\n    def solve(self) -> None:`;
    const result = processCodeSnippet(raw, LangSlug.PYTHON3);
    expect(result).toContain("# Just a comment");
    expect(result).toContain("\nclass Solution:");
  });
});
