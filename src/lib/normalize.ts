/**
 * Normalize the given text into an array of words.
 * Strips punctuation and converts to lowercase.
 */
export function normalizeToWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter(Boolean);
}
