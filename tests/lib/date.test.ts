import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { timeUntilMidnightUTC } from "@/lib/date";

describe("timeUntilMidnightUTC", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns hours and minutes when both are non-zero", () => {
    vi.setSystemTime(new Date("2024-01-01T20:17:00.000Z"));
    expect(timeUntilMidnightUTC()).toBe("3h 43m");
  });

  it("omits minutes when the remainder is exactly on the hour", () => {
    vi.setSystemTime(new Date("2024-01-01T21:00:00.000Z"));
    expect(timeUntilMidnightUTC()).toBe("3h");
  });

  it("omits hours when less than 60 minutes remain", () => {
    vi.setSystemTime(new Date("2024-01-01T23:05:00.000Z"));
    expect(timeUntilMidnightUTC()).toBe("55m");
  });

  it("returns only minutes when a single minute remains", () => {
    vi.setSystemTime(new Date("2024-01-01T23:59:00.000Z"));
    expect(timeUntilMidnightUTC()).toBe("1m");
  });

  it("returns 0m when less than a full minute remains", () => {
    vi.setSystemTime(new Date("2024-01-01T23:59:30.000Z"));
    expect(timeUntilMidnightUTC()).toBe("0m");
  });

  it("returns the full day minus one minute just after midnight", () => {
    vi.setSystemTime(new Date("2024-01-01T00:01:00.000Z"));
    expect(timeUntilMidnightUTC()).toBe("23h 59m");
  });
});