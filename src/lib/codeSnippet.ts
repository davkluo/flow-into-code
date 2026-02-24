import { LangSlug } from "@/types/problem";

const MAIN_BLOCKS: Record<LangSlug, string> = {
  [LangSlug.PYTHON3]:
    '\n\nif __name__ == "__main__":\n    # Write your test cases here\n    pass\n',
};

/**
 * Uncomments contiguous blocks of commented-out class/struct definitions that
 * LeetCode prepends to Python snippets (e.g. TreeNode, ListNode). A block is
 * triggered by a line matching `# class ` or `# Definition for` and continues
 * while lines start with `# `. Leading `# ` is stripped from each line in the
 * block (preserving indentation).
 */
function uncommentPythonDefinitions(snippet: string): string {
  const lines = snippet.split("\n");
  const result: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^# (class |Definition for )/.test(line)) {
      // Collect the contiguous commented block
      const block: string[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("# ") ||
          lines[i].startsWith("#\t") ||
          lines[i] === "#")
      ) {
        block.push(lines[i]);
        i++;
      }
      // Strip leading `# ` (hash + single space) from each collected line
      for (const blockLine of block) {
        result.push(blockLine.replace(/^# ?/, ""));
      }
    } else {
      result.push(line);
      i++;
    }
  }

  return result.join("\n");
}

/**
 * Inserts `pass` into any Python function whose body is empty (no indented content
 * following the def line), making the snippet syntactically valid from the start.
 * Handles both single-function and multi-function (design problem) snippets.
 */
function addPassToEmptyFunctions(snippet: string): string {
  const lines = snippet.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    result.push(lines[i]);

    // Only match def lines whose signature is complete on this line (ends with ':')
    const defMatch = lines[i].match(/^(\s*)def \w+.*:\s*$/);
    if (!defMatch) continue;

    const defIndent = defMatch[1].length;

    // Find the next non-blank line
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;

    // If no deeper-indented line follows, the body is empty
    if (j >= lines.length || lines[j].length - lines[j].trimStart().length <= defIndent) {
      result.push(" ".repeat(defIndent + 4) + "pass");
    }
  }

  return result.join("\n");
}

/**
 * Strips the test block appended by processCodeSnippet (e.g. `if __name__ == "__main__":`)
 * so only the solution code is returned. For languages without a test block, returns the
 * code unchanged.
 */
export function stripTestBlock(code: string, lang: LangSlug): string {
  if (lang !== LangSlug.PYTHON3) return code;
  const idx = code.indexOf("\nif __name__");
  return idx !== -1 ? code.slice(0, idx) : code;
}

/**
 * Processes a raw LeetCode code snippet for use in the editor:
 * 1. Uncomments leading class/struct definitions (TreeNode, ListNode, etc.)
 * 2. Appends a language-appropriate main block for writing test cases
 */
export function processCodeSnippet(raw: string, lang: LangSlug): string {
  if (!raw) return "";

  switch (lang) {
    case LangSlug.PYTHON3: {
      const withDefinitions = uncommentPythonDefinitions(raw);
      const withPass = addPassToEmptyFunctions(withDefinitions);
      return withPass + MAIN_BLOCKS[lang];
    }
    default:
      return raw;
  }
}
