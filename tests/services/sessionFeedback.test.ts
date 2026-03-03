import { beforeEach, describe, expect, it, vi } from "vitest";
import { SECTION_ORDER } from "@/constants/practice";
import { LLMState } from "@/hooks/useLLM";
import { DailyLimitExceededError } from "@/lib/errors";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import * as statsRepo from "@/repositories/firestore/statsRepo";
import * as userRepo from "@/repositories/firestore/userRepo";
import * as llmFeedback from "@/services/llm/generateSessionFeedback";
import { generateSessionFeedback } from "@/services/sessionFeedback";
import { CategoryFeedback } from "@/types/session";

// practice.tsx contains JSX that can't be transformed in the node test environment,
// so we provide explicit factories for any module that imports it (including transitively).
vi.mock("@/constants/practice", () => ({
  SECTION_ORDER: [
    "problem_understanding",
    "approach_and_reasoning",
    "algorithm_design",
    "implementation",
    "complexity_analysis",
  ],
  DAILY_SESSION_LIMIT: 5,
}));
vi.mock("@/repositories/firestore/userRepo", () => ({
  getById: vi.fn(),
  checkAndIncrementDailySessions: vi.fn(),
  addCompletedProblem: vi.fn(),
}));
vi.mock("@/repositories/firestore/problemRepo", () => ({
  getBySlug: vi.fn(),
}));
vi.mock("@/repositories/firestore/problemDetailsRepo", () => ({
  getBySlug: vi.fn(),
}));
vi.mock("@/repositories/firestore/sessionRepo", () => ({
  create: vi.fn(),
}));
vi.mock("@/repositories/firestore/statsRepo", () => ({
  incrementSessionCount: vi.fn(),
}));
vi.mock("@/services/llm/generateSessionFeedback", () => ({
  generateSectionFeedback: vi.fn(),
  generateSessionSummary: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const emptyLlmState: LLMState = { messages: [], sections: {} };

const mockUser = {
  role: "user" as const,
  completedProblems: [],
  savedProblems: [],
  preferences: {},
};

const mockProblem = {
  id: "1",
  titleSlug: "two-sum",
  title: "Two Sum",
  difficulty: "Easy" as const,
  isPaidOnly: false,
  topicTags: [],
};

const mockGradingCriteria = SECTION_ORDER.map((key) => ({
  category: key,
  description: "desc",
  rubric: "rubric",
}));

const mockDetails = {
  titleSlug: "two-sum",
  source: {
    originalContent: "Given an array...",
    codeSnippets: {},
    examples: [],
  },
  derived: {
    framing: { canonical: "Return indices of two numbers that add to target." },
    gradingCriteria: mockGradingCriteria,
  },
};

const mockCategoryFeedback: CategoryFeedback = {
  score: 8,
  comments: "Good.",
  compliments: "Clear explanation.",
  advice: "Be more precise.",
};

const mockSummary = {
  interviewerCommunication: mockCategoryFeedback,
  summary: "Overall solid performance.",
};

function setupHappyPath() {
  vi.mocked(userRepo.getById).mockResolvedValue(mockUser);
  vi.mocked(userRepo.checkAndIncrementDailySessions).mockResolvedValue({
    allowed: true,
  });
  vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
  vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(
    mockDetails as never,
  );
  vi.mocked(llmFeedback.generateSectionFeedback).mockResolvedValue(
    mockCategoryFeedback,
  );
  vi.mocked(llmFeedback.generateSessionSummary).mockResolvedValue(mockSummary);
  vi.mocked(sessionRepo.create).mockResolvedValue("session-abc");
  vi.mocked(statsRepo.incrementSessionCount).mockResolvedValue(undefined);
  vi.mocked(userRepo.addCompletedProblem).mockResolvedValue(undefined);
}

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// Error guard tests
// ---------------------------------------------------------------------------

describe("generateSessionFeedback — error guards", () => {
  it("throws when user is not found", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(null);
    await expect(
      generateSessionFeedback("uid-404", "two-sum", emptyLlmState),
    ).rejects.toThrow("User not found");
  });

  it("throws when problem is not found", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(mockUser);
    vi.mocked(userRepo.checkAndIncrementDailySessions).mockResolvedValue({
      allowed: true,
    });
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(null);
    await expect(
      generateSessionFeedback("uid-1", "unknown-slug", emptyLlmState),
    ).rejects.toThrow("Problem not found");
  });

  it("throws when problem details are not found", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(mockUser);
    vi.mocked(userRepo.checkAndIncrementDailySessions).mockResolvedValue({
      allowed: true,
    });
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue(null);
    await expect(
      generateSessionFeedback("uid-1", "two-sum", emptyLlmState),
    ).rejects.toThrow("Problem details not found");
  });

  it("throws when framing is missing", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(mockUser);
    vi.mocked(userRepo.checkAndIncrementDailySessions).mockResolvedValue({
      allowed: true,
    });
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...mockDetails,
      derived: { ...mockDetails.derived, framing: undefined },
    } as never);
    await expect(
      generateSessionFeedback("uid-1", "two-sum", emptyLlmState),
    ).rejects.toThrow("framing missing");
  });

  it("throws when gradingCriteria is empty", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(mockUser);
    vi.mocked(userRepo.checkAndIncrementDailySessions).mockResolvedValue({
      allowed: true,
    });
    vi.mocked(problemRepo.getBySlug).mockResolvedValue(mockProblem);
    vi.mocked(problemDetailsRepo.getBySlug).mockResolvedValue({
      ...mockDetails,
      derived: { ...mockDetails.derived, gradingCriteria: [] },
    } as never);
    await expect(
      generateSessionFeedback("uid-1", "two-sum", emptyLlmState),
    ).rejects.toThrow("Grading criteria missing");
  });
});

// ---------------------------------------------------------------------------
// Role-based guard tests
// ---------------------------------------------------------------------------

describe("generateSessionFeedback — role-based guard", () => {
  it("throws DailyLimitExceededError if user hits limit", async () => {
    vi.mocked(userRepo.getById).mockResolvedValue(mockUser);
    vi.mocked(userRepo.checkAndIncrementDailySessions).mockResolvedValue({
      allowed: false,
    });
    await expect(
      generateSessionFeedback("uid-1", "two-sum", emptyLlmState),
    ).rejects.toThrow(DailyLimitExceededError);
  });

  it("bypasses daily limit check for power role", async () => {
    setupHappyPath();
    const mockPowerUser = { ...mockUser, role: "power" as const };
    vi.mocked(userRepo.getById).mockResolvedValue(mockPowerUser);

    const sessionId = await generateSessionFeedback(
      "uid-1",
      "two-sum",
      emptyLlmState,
    );

    expect(sessionId).toBe("session-abc");
    expect(userRepo.checkAndIncrementDailySessions).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe("generateSessionFeedback — happy path", () => {
  it("calls generateSectionFeedback once per section and returns a session id", async () => {
    setupHappyPath();

    const sessionId = await generateSessionFeedback(
      "uid-1",
      "two-sum",
      emptyLlmState,
    );

    expect(sessionId).toBe("session-abc");
    expect(llmFeedback.generateSectionFeedback).toHaveBeenCalledTimes(
      SECTION_ORDER.length,
    );
    expect(llmFeedback.generateSessionSummary).toHaveBeenCalledOnce();
    expect(sessionRepo.create).toHaveBeenCalledOnce();
  });

  it("fires side-effect writes after creating the session", async () => {
    setupHappyPath();

    await generateSessionFeedback("uid-1", "two-sum", emptyLlmState);

    expect(statsRepo.incrementSessionCount).toHaveBeenCalledOnce();
    expect(userRepo.addCompletedProblem).toHaveBeenCalledWith(
      "uid-1",
      "two-sum",
    );
  });
});
