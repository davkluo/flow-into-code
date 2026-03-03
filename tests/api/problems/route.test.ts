import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/problems/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import {
  getProblemPage,
  ProblemsPage,
} from "@/repositories/firestore/problemRepo";
import { ensureLCProblemIndex } from "@/services/ensureLCProblemIndex";
import { Problem } from "@/types/problem";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/repositories/firestore/problemRepo", () => ({
  getProblemPage: vi.fn(),
}));
vi.mock("@/services/ensureLCProblemIndex", () => ({
  ensureLCProblemIndex: vi.fn(),
}));

const makeRequest = (params = "") =>
  new Request(`http://localhost/api/problems${params}`);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ensureLCProblemIndex).mockResolvedValue(undefined);
  vi.mocked(getProblemPage).mockResolvedValue({
    problems: [],
    nextCursor: undefined,
    hasMore: false,
  } as ProblemsPage);
});

describe("GET /api/problems", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns paginated results", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getProblemPage).mockResolvedValue({
      problems: [{ titleSlug: "two-sum" } as Problem],
      nextCursor: 21,
      hasMore: false,
    } as ProblemsPage);
    const res = await GET(makeRequest("?limit=20"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.problems).toHaveLength(1);
    expect(body.nextCursor).toBe(21);
  });

  it("sets long-lived cache header for non-search requests", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    const res = await GET(makeRequest());
    expect(res.headers.get("Cache-Control")).toContain("s-maxage");
  });

  it("sets no-store cache header for search requests", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    const res = await GET(makeRequest("?q=two+sum"));
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("passes cursor, limit, and query params to the repo", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    await GET(makeRequest("?limit=10&cursor=50&q=merge"));
    expect(getProblemPage).toHaveBeenCalledWith({
      pageSize: 10,
      cursor: 50,
      q: "merge",
    });
  });
});
