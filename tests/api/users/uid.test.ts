import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/users/[uid]/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import * as userRepo from "@/repositories/firestore/userRepo";
import { User } from "@/types/user";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/repositories/firestore/userRepo", () => ({
  getById: vi.fn(),
}));

const makeRequest = () =>
  new NextRequest("http://localhost/api/users/target-uid");

const makeParams = (uid: string) => ({ params: Promise.resolve({ uid }) });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/users/[uid]", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const response = await GET(makeRequest(), makeParams("target-uid"));
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 403 when requesting user is not admin and uid does not match", async () => {
    const mockUid = "requesting-uid";
    vi.mocked(verifyFirebaseToken).mockResolvedValue(mockUid);
    vi.mocked(userRepo.getById).mockResolvedValue({ role: "user" } as User);
    const response = await GET(makeRequest(), makeParams("target-uid"));
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: "Forbidden" });
  });

  it("returns 404 when user is not found", async () => {
    const mockUid = "target-uid";
    vi.mocked(verifyFirebaseToken).mockResolvedValue(mockUid);
    vi.mocked(userRepo.getById).mockResolvedValue(null);
    const response = await GET(makeRequest(), makeParams("target-uid"));
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: "Not Found" });
  });

  it("returns user data when user is found", async () => {
    const mockUid = "target-uid";
    const mockUser = {
      completedProblems: [],
      preferences: {},
      savedProblems: [],
      role: "user",
    } as User;
    vi.mocked(verifyFirebaseToken).mockResolvedValue(mockUid);
    vi.mocked(userRepo.getById).mockResolvedValue(mockUser);
    const response = await GET(makeRequest(), makeParams("target-uid"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ user: mockUser });
  });

  it("allows an admin to fetch another user's data", async () => {
    const mockTargetUser = {
      completedProblems: [],
      preferences: {},
      savedProblems: [],
      role: "user",
    } as User;
    vi.mocked(verifyFirebaseToken).mockResolvedValue("admin-uid");
    // First mock is for authorization check (either matching uid or admin),
    // second mock is for fetching the target user's data
    vi.mocked(userRepo.getById)
      .mockResolvedValueOnce({ role: "admin" } as User)
      .mockResolvedValueOnce(mockTargetUser);
    const response = await GET(makeRequest(), makeParams("target-uid"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ user: mockTargetUser });
  });
});
