import { describe, expect, it } from "vitest";

import {
  isSnapshotEmpty,
  isSnapshotEqual,
  isSubsumedBy,
  pruneSnapshots,
} from "@/lib/snapshots";
import type { Snapshot } from "@/hooks/useLLM";

// SectionSnapshotData is Record<string, string> — plain objects work directly.

function makeSnapshot(data: Record<string, string>, messageIndex = 0): Snapshot {
  return { data, messageIndex, timestamp: 0 };
}

// ─── isSnapshotEmpty ──────────────────────────────────────────────────────────

describe("isSnapshotEmpty", () => {
  it("returns true when all fields are empty strings", () => {
    expect(isSnapshotEmpty({ a: "", b: "" })).toBe(true);
  });

  it("returns true when all fields are whitespace-only", () => {
    expect(isSnapshotEmpty({ a: "   ", b: "\t" })).toBe(true);
  });

  it("returns false when any field has content", () => {
    expect(isSnapshotEmpty({ a: "", b: "hello" })).toBe(false);
  });
});

// ─── isSnapshotEqual ─────────────────────────────────────────────────────────

describe("isSnapshotEqual", () => {
  it("returns true for identical values", () => {
    expect(isSnapshotEqual({ a: "hello" }, { a: "hello" })).toBe(true);
  });

  it("returns true when values are equal after trimming", () => {
    expect(isSnapshotEqual({ a: "hello  " }, { a: "  hello" })).toBe(true);
  });

  it("returns false when values differ", () => {
    expect(isSnapshotEqual({ a: "hello" }, { a: "world" })).toBe(false);
  });

  it("returns false when key counts differ", () => {
    expect(isSnapshotEqual({ a: "hello" }, { a: "hello", b: "world" })).toBe(
      false,
    );
  });
});

// ─── isSubsumedBy ─────────────────────────────────────────────────────────────

describe("isSubsumedBy", () => {
  it("returns true when older is a prefix of newer", () => {
    expect(isSubsumedBy({ a: "hel" }, { a: "hello world" })).toBe(true);
  });

  it("returns true when older equals newer (equal is a valid prefix)", () => {
    expect(isSubsumedBy({ a: "hello" }, { a: "hello" })).toBe(true);
  });

  it("returns false when older is longer than newer", () => {
    expect(isSubsumedBy({ a: "hello world" }, { a: "hel" })).toBe(false);
  });

  it("returns true when older field is empty (empty is a prefix of anything)", () => {
    expect(isSubsumedBy({ a: "" }, { a: "hello" })).toBe(true);
  });

  it("returns false when any field in older is not a prefix of newer", () => {
    expect(isSubsumedBy({ a: "hello", b: "xyz" }, { a: "hello world", b: "abc" })).toBe(false);
  });
});

// ─── pruneSnapshots ───────────────────────────────────────────────────────────

describe("pruneSnapshots", () => {
  it("appends to empty history", () => {
    const s = makeSnapshot({ a: "hello" });
    expect(pruneSnapshots([], s)).toEqual([s]);
  });

  it("drops incoming when all fields are empty", () => {
    const prev = [makeSnapshot({ a: "hello" })];
    expect(pruneSnapshots(prev, makeSnapshot({ a: "" }))).toBe(prev);
  });

  it("drops incoming when identical to last snapshot", () => {
    const s = makeSnapshot({ a: "hello" });
    const prev = [s];
    expect(pruneSnapshots(prev, makeSnapshot({ a: "hello" }))).toBe(prev);
  });

  it("appends genuinely new content", () => {
    const s1 = makeSnapshot({ a: "hello" }, 0);
    const s2 = makeSnapshot({ a: "hello world" }, 1);
    const result = pruneSnapshots([s1], s2);
    expect(result).toEqual([s2]);
  });

  it("removes an older snapshot subsumed by incoming", () => {
    const older = makeSnapshot({ a: "hel" }, 0);
    const incoming = makeSnapshot({ a: "hello world" }, 1);
    const result = pruneSnapshots([older], incoming);
    expect(result).toEqual([incoming]);
  });

  it("removes multiple older snapshots all subsumed by incoming", () => {
    const s1 = makeSnapshot({ a: "h" }, 0);
    const s2 = makeSnapshot({ a: "hel" }, 1);
    const incoming = makeSnapshot({ a: "hello world" }, 2);
    const result = pruneSnapshots([s1, s2], incoming);
    expect(result).toEqual([incoming]);
  });

  it("keeps older snapshots not subsumed by incoming", () => {
    const unrelated = makeSnapshot({ a: "something else" }, 0);
    const incoming = makeSnapshot({ a: "hello" }, 1);
    const result = pruneSnapshots([unrelated], incoming);
    expect(result).toEqual([unrelated, incoming]);
  });
});
