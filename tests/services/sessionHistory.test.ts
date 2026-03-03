import { Timestamp } from "firebase-admin/firestore";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminDb } from "@/lib/firebase/admin";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import { getSessionHistory } from "@/services/sessionHistory";
import { CategoryFeedback, Session, SessionFeedback } from "@/types/session";

vi.mock("@/lib/firebase/admin");
vi.mock("@/repositories/firestore/sessionRepo", () => ({
  getByUserId: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Firestore mock
// ---------------------------------------------------------------------------

const mockDocRef = {};
const mockCollection = { doc: vi.fn().mockReturnValue(mockDocRef) };
const mockDb = {
  collection: vi.fn().mockReturnValue(mockCollection),
  getAll: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockCollection.doc.mockReturnValue(mockDocRef);
  vi.mocked(getAdminDb).mockReturnValue(
    mockDb as unknown as ReturnType<typeof getAdminDb>,
  );
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SECTION_KEYS = [
  "problem_understanding",
  "approach_and_reasoning",
  "algorithm_design",
  "implementation",
  "complexity_analysis",
] as const;

const mockCategoryFeedback: CategoryFeedback = {
  score: 7,
  comments: "Good.",
  compliments: "Clear thinking.",
  advice: "Be more concise.",
};

function makeFeedback(overrides: Partial<SessionFeedback> = {}): SessionFeedback {
  const sections = Object.fromEntries(
    SECTION_KEYS.map((key) => [key, { ...mockCategoryFeedback }]),
  ) as SessionFeedback["sections"];
  return {
    sections,
    interviewerCommunication: { ...mockCategoryFeedback, score: 8 },
    summary: "Solid session.",
    ...overrides,
  };
}

function makeRawSession(
  overrides: Partial<Session & { id: string }> = {},
): Session & { id: string } {
  return {
    id: "sess-1",
    userId: "uid-1",
    createdAt: new Date("2024-06-01T12:00:00.000Z"),
    problemTitleSlug: "two-sum",
    chatLog: [],
    feedback: makeFeedback(),
    fields: {},
    ...overrides,
  };
}

function makeProblemDoc(slug: string, problemId: string | null) {
  return {
    id: slug,
    exists: problemId !== null,
    data: () => (problemId !== null ? { id: problemId } : undefined),
  };
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

describe("getSessionHistory — data fetching", () => {
  it("passes the uid to the session repository", async () => {
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([]);
    await getSessionHistory("user-xyz");
    expect(sessionRepo.getByUserId).toHaveBeenCalledWith("user-xyz");
  });

  it("returns an empty array when the user has no sessions", async () => {
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([]);
    const result = await getSessionHistory("uid-1");
    expect(result).toEqual([]);
  });

  it("skips the getAll call when there are no sessions", async () => {
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([]);
    await getSessionHistory("uid-1");
    expect(mockDb.getAll).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Problem ID resolution
// ---------------------------------------------------------------------------

describe("getSessionHistory — problem ID resolution", () => {
  it("resolves problemId from the batched problem doc lookup", async () => {
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([makeRawSession()]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    const result = await getSessionHistory("uid-1");

    expect(result[0].problemId).toBe("1");
  });

  it("returns null problemId when the problem doc does not exist in Firestore", async () => {
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([makeRawSession()]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", null)]);

    const result = await getSessionHistory("uid-1");

    expect(result[0].problemId).toBeNull();
  });

  it("deduplicates slugs so each unique problem is fetched only once", async () => {
    const sessions = [
      makeRawSession({ id: "sess-1", problemTitleSlug: "two-sum" }),
      makeRawSession({ id: "sess-2", problemTitleSlug: "two-sum" }),
    ];
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue(sessions);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    await getSessionHistory("uid-1");

    expect(mockCollection.doc).toHaveBeenCalledTimes(1);
    expect(mockDb.getAll).toHaveBeenCalledTimes(1);
  });

  it("makes a single batched getAll call for multiple unique slugs", async () => {
    const sessions = [
      makeRawSession({ id: "sess-1", problemTitleSlug: "two-sum" }),
      makeRawSession({ id: "sess-2", problemTitleSlug: "three-sum" }),
    ];
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue(sessions);
    mockDb.getAll.mockResolvedValue([
      makeProblemDoc("two-sum", "1"),
      makeProblemDoc("three-sum", "15"),
    ]);

    const result = await getSessionHistory("uid-1");

    expect(mockDb.getAll).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(2);
    expect(result[0].problemId).toBe("1");
    expect(result[1].problemId).toBe("15");
  });
});

// ---------------------------------------------------------------------------
// Data transformation
// ---------------------------------------------------------------------------

describe("getSessionHistory — timestamp conversion", () => {
  it("converts a plain Date createdAt to an ISO string", async () => {
    const date = new Date("2024-06-01T12:00:00.000Z");
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([
      makeRawSession({ createdAt: date }),
    ]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    const result = await getSessionHistory("uid-1");

    expect(result[0].createdAt).toBe("2024-06-01T12:00:00.000Z");
  });

  it("converts a Firestore Timestamp createdAt to an ISO string", async () => {
    const ts = Timestamp.fromDate(new Date("2024-06-01T12:00:00.000Z"));
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([
      makeRawSession({ createdAt: ts as unknown as Date }),
    ]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    const result = await getSessionHistory("uid-1");

    expect(result[0].createdAt).toBe("2024-06-01T12:00:00.000Z");
  });
});

describe("getSessionHistory — field stripping", () => {
  it("excludes chatLog and fields from the response", async () => {
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([makeRawSession()]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    const result = await getSessionHistory("uid-1");

    expect(result[0]).not.toHaveProperty("chatLog");
    expect(result[0]).not.toHaveProperty("fields");
    expect(result[0]).not.toHaveProperty("userId");
  });

  it("strips comments, compliments, and advice from feedback sections", async () => {
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([makeRawSession()]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    const result = await getSessionHistory("uid-1");
    const section = result[0].feedback.sections.problem_understanding;

    expect(section).toEqual({ score: 7 });
    expect(section).not.toHaveProperty("comments");
    expect(section).not.toHaveProperty("advice");
  });

  it("strips comments, compliments, and advice from interviewerCommunication", async () => {
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([makeRawSession()]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    const result = await getSessionHistory("uid-1");
    const ic = result[0].feedback.interviewerCommunication;

    expect(ic).toEqual({ score: 8 });
    expect(ic).not.toHaveProperty("comments");
    expect(ic).not.toHaveProperty("advice");
  });

  it("preserves null section scores", async () => {
    const feedback = makeFeedback();
    feedback.sections.algorithm_design = {
      score: null,
      comments: "",
      compliments: "",
      advice: "",
    };
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([
      makeRawSession({ feedback }),
    ]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    const result = await getSessionHistory("uid-1");

    expect(result[0].feedback.sections.algorithm_design).toEqual({ score: null });
  });

  it("falls back to an empty string when summary is missing", async () => {
    const feedback = makeFeedback({ summary: undefined as unknown as string });
    vi.mocked(sessionRepo.getByUserId).mockResolvedValue([
      makeRawSession({ feedback }),
    ]);
    mockDb.getAll.mockResolvedValue([makeProblemDoc("two-sum", "1")]);

    const result = await getSessionHistory("uid-1");

    expect(result[0].feedback.summary).toBe("");
  });
});
