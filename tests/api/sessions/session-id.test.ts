import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/sessions/[session-id]/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import * as rateLimit from "@/lib/rateLimit";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import * as userRepo from "@/repositories/firestore/userRepo";
import { ProblemDetails } from "@/types/problem";
import { Session } from "@/types/session";
import { User } from "@/types/user";
import type { Ratelimit } from "@upstash/ratelimit";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/lib/rateLimit", () => ({
  getGeneralRateLimit: vi.fn(),
}));
vi.mock("@/repositories/firestore/sessionRepo", () => ({
  getById: vi.fn(),
}));
vi.mock("@/repositories/firestore/userRepo", () => ({
  getById: vi.fn(),
}));
vi.mock("@/repositories/firestore/problemRepo", () => ({
  getBySlug: vi.fn(),
}));
vi.mock("@/repositories/firestore/problemDetailsRepo", () => ({
  getBySlug: vi.fn(),
}));

const mockLimit = vi.fn();

const makeRequest = () =>
  new NextRequest("http://localhost/api/sessions/session-123");

const makeParams = (id: string) => ({
  params: Promise.resolve({ "session-id": id }),
});

const mockSession = {
  id: "session-123",
  userId: "owner-uid",
  problemTitleSlug: "two-sum",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  feedback: {
    sections: {},
    interviewerCommunication: {
      score: 8,
      comments: "",
      compliments: "",
      advice: "",
    },
    summary: "Good job",
  },
  chatLog: [],
  fields: {},
} as unknown as Session & { id: string };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(rateLimit.getGeneralRateLimit).mockReturnValue({
    limit: mockLimit,
  } as unknown as Ratelimit);
  mockLimit.mockResolvedValue({ success: true, reset: Date.now() + 60000 });
  vi.mocked(problemRepo.getBySlug).mockResolvedValue(null);
  vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(null);
});

describe("GET /api/sessions/[session-id]", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await GET(makeRequest(), makeParams("session-123"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 404 when session does not exist", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(sessionRepo.getById).mockResolvedValue(null);
    vi.mocked(userRepo.getById).mockResolvedValue({ role: "user" } as User);
    const res = await GET(makeRequest(), makeParams("session-123"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: "Not Found" });
  });

  it("returns 404 when non-owner non-admin requests another user's session", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("other-uid");
    vi.mocked(sessionRepo.getById).mockResolvedValue(mockSession);
    vi.mocked(userRepo.getById).mockResolvedValue({ role: "user" } as User);
    const res = await GET(makeRequest(), makeParams("session-123"));
    expect(res.status).toBe(404);
  });

  it("returns session data with ISO createdAt for the owner", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("owner-uid");
    vi.mocked(sessionRepo.getById).mockResolvedValue(mockSession);
    vi.mocked(userRepo.getById).mockResolvedValue({ role: "user" } as User);
    const res = await GET(makeRequest(), makeParams("session-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.session.id).toBe("session-123");
    expect(body.session.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(body.solutions).toEqual([]);
  });

  it("allows an admin to view another user's session", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("admin-uid");
    vi.mocked(sessionRepo.getById).mockResolvedValue(mockSession);
    vi.mocked(userRepo.getById).mockResolvedValue({ role: "admin" } as User);
    const res = await GET(makeRequest(), makeParams("session-123"));
    expect(res.status).toBe(200);
  });

  it("includes solutions from problem details when available", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("owner-uid");
    vi.mocked(sessionRepo.getById).mockResolvedValue(mockSession);
    vi.mocked(userRepo.getById).mockResolvedValue({ role: "user" } as User);
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      derived: { solutions: [{ approach: "hash map" }] },
    } as ProblemDetails);
    const res = await GET(makeRequest(), makeParams("session-123"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.solutions).toEqual([{ approach: "hash map" }]);
  });
});
