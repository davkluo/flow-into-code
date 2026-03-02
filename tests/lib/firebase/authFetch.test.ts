import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { authFetch } from "@/lib/firebase/authFetch";

// Mock the Firebase client so the no-token path doesn't try to initialize Firebase.
vi.mock("@/lib/firebase/client", () => ({
  getClientAuth: vi.fn(() => ({
    authStateReady: vi.fn().mockResolvedValue(undefined),
    currentUser: null,
  })),
}));

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockResolvedValue(new Response());
});

afterEach(() => {
  vi.unstubAllGlobals();
  mockFetch.mockReset();
});

describe("authFetch", () => {
  it("sets Authorization header when a token is provided", async () => {
    await authFetch("http://localhost/api", {}, "my-token");
    expect(mockFetch).toHaveBeenCalledWith("http://localhost/api", {
      headers: { Authorization: "Bearer my-token" },
    });
  });

  it("merges the auth header with existing request headers", async () => {
    await authFetch(
      "http://localhost/api",
      { headers: { "Content-Type": "application/json" } },
      "my-token",
    );
    expect(mockFetch).toHaveBeenCalledWith("http://localhost/api", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer my-token",
      },
    });
  });

  it("omits Authorization header when no token and no current user", async () => {
    await authFetch("http://localhost/api");
    expect(mockFetch).toHaveBeenCalledWith("http://localhost/api", {
      headers: {},
    });
  });
});
