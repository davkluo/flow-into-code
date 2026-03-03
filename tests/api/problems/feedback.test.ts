import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/problems/[slug]/feedback/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import {
  generateFeedbackDataForProblem,
  getFeedbackData,
} from "@/services/feedbackData";
import { ProblemDetails } from "@/types/problem";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/services/feedbackData", () => ({
  getFeedbackData: vi.fn(),
  generateFeedbackDataForProblem: vi.fn(),
}));

const makeRequest = (method = "GET") =>
  new Request("http://localhost/api/problems/two-sum/feedback", { method });
const makeParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/problems/[slug]/feedback", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with long-lived cache header when complete", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getFeedbackData).mockResolvedValue({
      status: "complete",
      data: { titleSlug: "two-sum" } as ProblemDetails,
    });
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage");
  });

  it("returns 202 when processing", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getFeedbackData).mockResolvedValue({ status: "processing" });
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body).toEqual({ status: "processing" });
  });

  it("returns 404 when not found", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getFeedbackData).mockResolvedValue({ status: "not_found" });
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(404);
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getFeedbackData).mockRejectedValue(new Error("db error"));
    const res = await GET(makeRequest(), makeParams("two-sum"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/problems/[slug]/feedback", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await POST(makeRequest("POST"), makeParams("two-sum"));
    expect(res.status).toBe(401);
  });

  it("returns 202 when generation is still in progress", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generateFeedbackDataForProblem).mockResolvedValue(null);
    const res = await POST(makeRequest("POST"), makeParams("two-sum"));
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body).toEqual({ status: "processing" });
  });

  it("returns 200 with generated data", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generateFeedbackDataForProblem).mockResolvedValue({
      titleSlug: "two-sum",
    } as ProblemDetails);
    const res = await POST(makeRequest("POST"), makeParams("two-sum"));
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generateFeedbackDataForProblem).mockRejectedValue(
      new Error("fail"),
    );
    const res = await POST(makeRequest("POST"), makeParams("two-sum"));
    expect(res.status).toBe(500);
  });
});
