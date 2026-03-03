import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/sessions/route";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import { getSessionHistory, SessionHistoryItem } from "@/services/sessionHistory";

vi.mock("@/lib/firebase/verifyToken", () => ({
  verifyFirebaseToken: vi.fn(),
}));
vi.mock("@/services/sessionHistory", () => ({
  getSessionHistory: vi.fn(),
}));

const makeRequest = () => new NextRequest("http://localhost/api/sessions");

const mockItem: SessionHistoryItem = {
  id: "s-1",
  problemTitleSlug: "two-sum",
  problemId: "1",
  createdAt: "2024-06-01T12:00:00.000Z",
  feedback: {
    sections: {
      problem_understanding: { score: 7 },
      approach_and_reasoning: { score: 8 },
      algorithm_design: { score: null },
      implementation: { score: 9 },
      complexity_analysis: { score: 6 },
    },
    interviewerCommunication: { score: 8 },
    summary: "Great session",
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/sessions", () => {
  it("returns 401 when token is invalid", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns empty sessions array when user has no sessions", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getSessionHistory).mockResolvedValue([]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ sessions: [] });
  });

  it("returns sessions from the history service", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("uid");
    vi.mocked(getSessionHistory).mockResolvedValue([mockItem]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sessions).toHaveLength(1);
    expect(body.sessions[0].id).toBe("s-1");
    expect(body.sessions[0].problemId).toBe("1");
  });

  it("passes the authenticated uid to the history service", async () => {
    vi.mocked(verifyFirebaseToken).mockResolvedValue("user-123");
    vi.mocked(getSessionHistory).mockResolvedValue([]);
    await GET(makeRequest());
    expect(getSessionHistory).toHaveBeenCalledWith("user-123");
  });
});
