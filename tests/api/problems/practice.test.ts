import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/problems/[slug]/practice/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import * as rateLimit from "@/lib/rateLimit";
import { generatePracticeData, getPracticeData } from "@/services/practiceData";
import { ProblemDetails } from "@/types/problem";
import type { Ratelimit } from "@upstash/ratelimit";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/lib/rateLimit", () => ({
  getGeneralRateLimit: vi.fn(),
  getGeneratePracticeRateLimit: vi.fn(),
}));
vi.mock("@/services/practiceData", () => ({
  getPracticeData: vi.fn(),
  generatePracticeData: vi.fn(),
}));

const mockLimit = vi.fn();

const makeRequest = (method = "GET") =>
  new NextRequest("http://localhost/api/problems/two-sum/practice", { method });
const makeParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(rateLimit.getGeneralRateLimit).mockReturnValue({
    limit: mockLimit,
  } as unknown as Ratelimit);
  vi.mocked(rateLimit.getGeneratePracticeRateLimit).mockReturnValue({
    limit: mockLimit,
  } as unknown as Ratelimit);
  mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 60000 });
});

describe("GET /api/problems/[slug]/practice", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with long-lived cache header when complete", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getPracticeData).mockResolvedValue({
      status: "complete",
      data: { titleSlug: "two-sum" } as ProblemDetails,
    });
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage");
  });

  it("returns 202 when processing", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getPracticeData).mockResolvedValue({ status: "processing" });
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body).toEqual({ status: "processing" });
  });

  it("returns 404 when not found", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getPracticeData).mockResolvedValue({ status: "not_found" });
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(404);
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getPracticeData).mockRejectedValue(new Error("db error"));
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/problems/[slug]/practice", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await POST(makeRequest("POST"), makeParams("two-sum"));
    expect(res.status).toBe(401);
  });

  it("returns 202 when generation is still in progress", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generatePracticeData).mockResolvedValue(null);
    const res = await POST(makeRequest("POST"), makeParams("two-sum"));
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body).toEqual({ status: "processing" });
  });

  it("returns 200 with generated data", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generatePracticeData).mockResolvedValue({
      titleSlug: "two-sum",
    } as ProblemDetails);
    const res = await POST(makeRequest("POST"), makeParams("two-sum"));
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generatePracticeData).mockRejectedValue(new Error("fail"));
    const res = await POST(makeRequest("POST"), makeParams("two-sum"));
    expect(res.status).toBe(500);
  });
});
