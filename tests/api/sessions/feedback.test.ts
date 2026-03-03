import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/sessions/feedback/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import { generateSessionFeedback } from "@/services/sessionFeedback";
import { DailyLimitExceededError } from "@/lib/errors";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/services/sessionFeedback", () => ({
  generateSessionFeedback: vi.fn(),
}));

const makeRequest = (body: object) =>
  new NextRequest("http://localhost/api/sessions/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/sessions/feedback", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 when problemSlug is missing", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    const res = await POST(makeRequest({ llmState: { messages: [] } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "Bad Request" });
  });

  it("returns 400 when llmState is missing", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    const res = await POST(makeRequest({ problemSlug: "two-sum" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "Bad Request" });
  });

  it("returns 429 when daily limit is exceeded", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generateSessionFeedback).mockRejectedValue(new DailyLimitExceededError());
    const res = await POST(
      makeRequest({ problemSlug: "two-sum", llmState: { messages: [] } }),
    );
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: "Daily session limit reached" });
  });

  it("returns 500 on unexpected errors", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generateSessionFeedback).mockRejectedValue(new Error("oops"));
    const res = await POST(
      makeRequest({ problemSlug: "two-sum", llmState: { messages: [] } }),
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({ error: "Internal Server Error" });
  });

  it("returns session ID on success", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(generateSessionFeedback).mockResolvedValue("session-abc");
    const res = await POST(
      makeRequest({ problemSlug: "two-sum", llmState: { messages: [] } }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ sessionId: "session-abc" });
    expect(generateSessionFeedback).toHaveBeenCalledWith("uid", "two-sum", {
      messages: [],
    });
  });
});
