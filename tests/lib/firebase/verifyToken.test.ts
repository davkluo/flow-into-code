import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAdminAuth } from "@/lib/firebase/admin";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";

vi.mock("@/lib/firebase/admin");

const mockVerifyIdToken = vi.fn();

beforeEach(() => {
  vi.mocked(getAdminAuth).mockReturnValue({
    verifyIdToken: mockVerifyIdToken,
  } as unknown as ReturnType<typeof getAdminAuth>);
  mockVerifyIdToken.mockReset();
});

describe("verifyFirebaseToken", () => {
  it("returns null when Authorization header is missing", async () => {
    const req = new Request("http://localhost");
    expect(await verifyFirebaseToken(req)).toBeNull();
  });

  it("returns null when Authorization header is not a Bearer token", async () => {
    const req = new Request("http://localhost", {
      headers: { Authorization: "Basic abc123" },
    });
    expect(await verifyFirebaseToken(req)).toBeNull();
  });

  it("returns the uid for a valid token", async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: "user-123" });
    const req = new Request("http://localhost", {
      headers: { Authorization: "Bearer valid-token" },
    });
    expect(await verifyFirebaseToken(req)).toBe("user-123");
  });

  it("returns null when verifyIdToken throws", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("invalid token"));
    const req = new Request("http://localhost", {
      headers: { Authorization: "Bearer bad-token" },
    });
    expect(await verifyFirebaseToken(req)).toBeNull();
  });
});
