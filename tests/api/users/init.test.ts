import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/users/init/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import * as rateLimit from "@/lib/rateLimit";
import { initUser } from "@/services/initUser";
import type { Ratelimit } from "@upstash/ratelimit";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/lib/rateLimit", () => ({
  getGeneralRateLimit: vi.fn(),
}));
vi.mock("@/services/initUser", () => ({
  initUser: vi.fn(),
}));

const mockLimit = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(rateLimit.getGeneralRateLimit).mockReturnValue({
    limit: mockLimit,
  } as unknown as Ratelimit);
  mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 60000 });
  vi.mocked(initUser).mockResolvedValue(undefined);
});

describe("POST /api/users/init", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const response = await POST(
      new NextRequest("http://localhost/api/users/init", { method: "POST" }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("initializes user and returns ok when token is valid", async () => {
    const mockUid = "test-uid";
    vi.mocked(verifyFirebaseToken).mockResolvedValue(mockUid);
    const response = await POST(
      new NextRequest("http://localhost/api/users/init", { method: "POST" }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
    expect(initUser).toHaveBeenCalledWith(mockUid);
  });
});
