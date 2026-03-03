import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/chat/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import * as rateLimit from "@/lib/rateLimit";
import { streamChatCompletion } from "@/services/llm/client";
import type { Ratelimit } from "@upstash/ratelimit";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/lib/rateLimit", () => ({
  getChatRateLimit: vi.fn(),
}));
vi.mock("@/services/llm/client", () => ({
  streamChatCompletion: vi.fn(),
}));

const mockLimit = vi.fn();

const makeRequest = (body: object = {}) =>
  new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(rateLimit.getChatRateLimit).mockReturnValue({
    limit: mockLimit,
  } as unknown as Ratelimit);
  mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 60000 });
});

describe("POST /api/chat", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await POST(makeRequest({ messages: [] }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    mockLimit.mockResolvedValue({ success: false, reset: Date.now() + 30000 });
    const res = await POST(makeRequest({ messages: [] }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: "Too Many Requests" });
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns a streaming response with SSE headers", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode('data: {"delta":"hello"}\n\n'),
        );
        controller.enqueue(
          new TextEncoder().encode("data: [DONE]\n\n"),
        );
        controller.close();
      },
    });
    vi.mocked(streamChatCompletion).mockResolvedValue(mockStream);
    const res = await POST(
      makeRequest({ messages: [{ role: "user", content: "hi" }] }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");
    expect(res.headers.get("Cache-Control")).toBe("no-cache");
    expect(streamChatCompletion).toHaveBeenCalledWith({
      messages: [{ role: "user", content: "hi" }],
    });
  });
});
