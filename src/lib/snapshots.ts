import { SectionSnapshotData } from "@/types/practice";
import { Snapshot } from "@/hooks/useLLM";

// ---------------------------------------------------------------------------
// Snapshot comparison helpers
// ---------------------------------------------------------------------------

/** Returns true if every field is empty after trimming. */
export const isSnapshotEmpty = (data: SectionSnapshotData): boolean =>
  Object.values(data).every((v) => v.trim() === "");

/**
 * Returns true if every field in `a` equals the corresponding field in `b`
 * after trimming. Used to skip storing duplicate snapshots.
 */
export const isSnapshotEqual = (
  a: SectionSnapshotData,
  b: SectionSnapshotData,
): boolean => {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => a[k].trim() === (b[k] ?? "").trim());
};

/**
 * Returns true if `newer` wholly subsumes `older` — i.e., every field in
 * `older` is a string prefix of (or equal to) the corresponding field in
 * `newer` after trimming. When this is true, `older` contains no information
 * that isn't already present in `newer`, so it can be safely pruned.
 */
export const isSubsumedBy = (
  older: SectionSnapshotData,
  newer: SectionSnapshotData,
): boolean =>
  Object.keys(older).every((k) =>
    (newer[k] ?? "").trim().startsWith(older[k].trim()),
  );

// ---------------------------------------------------------------------------
// Snapshot list management
// ---------------------------------------------------------------------------

/**
 * Returns the updated snapshot history after considering a new incoming
 * snapshot. Applies three optimizations in order:
 *
 * 1. Empty guard   — drop the incoming snapshot if all its fields are empty.
 * 2. Exact dedup   — drop if identical to the most recent stored snapshot.
 * 3. Prefix prune  — remove any older snapshots that are wholly subsumed by
 *                    the incoming one (the new snapshot contains all their
 *                    information and more).
 *
 * Comparisons use trimmed values to ignore trailing whitespace from textareas.
 */
export const pruneSnapshots = (
  prev: Snapshot[],
  incoming: Snapshot,
): Snapshot[] => {
  // 1. Drop empty snapshots — no information to store.
  if (isSnapshotEmpty(incoming.data)) return prev;

  // 2. Drop exact duplicates — no new information since last send.
  const last = prev.at(-1);
  if (last && isSnapshotEqual(last.data, incoming.data)) return prev;

  // 3. Remove older snapshots that the incoming one fully subsumes.
  const pruned = prev.filter((s) => !isSubsumedBy(s.data, incoming.data));

  return [...pruned, incoming];
};
