import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import { withAuth } from "@/lib/withAuth";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));

const makeRequest = () => new NextRequest("http://localhost/api/test");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("withAuth", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);

    const handler = vi.fn().mockResolvedValue(new NextResponse("OK"));
    const wrappedHandler = withAuth(handler);

    const response = await wrappedHandler(makeRequest());

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("calls the handler with the authenticated uid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("test-uid");

    const handler = vi.fn().mockResolvedValue(new NextResponse("OK"));
    const wrappedHandler = withAuth(handler);

    const request = makeRequest();
    const response = await wrappedHandler(request);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(request, "test-uid", undefined);
  });

  it("threads ctx through to the handler", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("test-uid");

    const handler = vi.fn().mockResolvedValue(new NextResponse("OK"));
    const wrappedHandler = withAuth<{ slug: string }>(handler);

    const request = makeRequest();
    const ctx = { params: Promise.resolve({ slug: "test-slug" }) };
    const response = await wrappedHandler(request, ctx);

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(request, "test-uid", ctx);
  });
});
