import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/meta/problem-index/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import * as rateLimit from "@/lib/rateLimit";
import * as problemIndexMetaRepo from "@/repositories/firestore/problemIndexMetaRepo";
import type { Ratelimit } from "@upstash/ratelimit";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/lib/rateLimit", () => ({
  getGeneralRateLimit: vi.fn(),
}));
vi.mock("@/repositories/firestore/problemIndexMetaRepo", () => ({
  get: vi.fn(),
}));

const mockLimit = vi.fn();

const makeRequest = () =>
  new NextRequest("http://localhost/api/meta/problem-index");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(rateLimit.getGeneralRateLimit).mockReturnValue({
    limit: mockLimit,
  } as unknown as Ratelimit);
  mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 60000 });
});

describe("GET /api/meta/problem-index", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 404 when meta is not found", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(problemIndexMetaRepo.get).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: "Problem index meta not found" });
  });

  it("returns meta data when found", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(problemIndexMetaRepo.get).mockResolvedValue({
      totalProblems: 100,
      fullyPopulated: false,
    } as problemIndexMetaRepo.ProblemIndexMeta);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ totalProblems: 100, fullyPopulated: false });
  });
});
