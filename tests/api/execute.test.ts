import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/execute/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import * as rateLimit from "@/lib/rateLimit";
import type { Ratelimit } from "@upstash/ratelimit";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/lib/rateLimit", () => ({
  getExecuteRateLimit: vi.fn(),
}));

const mockLimit = vi.fn();

const makeRequest = (body: object) =>
  new NextRequest("http://localhost/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(rateLimit.getExecuteRateLimit).mockReturnValue({
    limit: mockLimit,
  } as unknown as Ratelimit);
  mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 60000 });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/execute", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await POST(makeRequest({ code: "print('hi')" }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 429 when rate limit is exceeded", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    mockLimit.mockResolvedValue({ success: false, reset: Date.now() + 30000 });
    const res = await POST(makeRequest({ code: "print('hi')" }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body).toEqual({ error: "Too Many Requests" });
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns 400 when code is missing", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    const res = await POST(makeRequest({ language: "python" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: "Code is required" });
  });

  it("returns 502 when executor service is unavailable", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const res = await POST(makeRequest({ code: "print('hi')", language: "python" }));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body).toEqual({ error: "Execution service unavailable" });
  });

  it("returns execution result on success", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ output: "Hello, world!", stderr: "" }),
      }),
    );
    const res = await POST(
      makeRequest({ code: "print('Hello, world!')", language: "python" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.output).toBe("Hello, world!");
  });
});
