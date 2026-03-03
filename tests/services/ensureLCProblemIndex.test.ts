import { beforeEach, describe, expect, it, vi } from "vitest";

import * as metaRepo from "@/repositories/firestore/problemIndexMetaRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as lcClient from "@/services/leetcode/client";
import { ensureLCProblemIndex } from "@/services/ensureLCProblemIndex";

vi.mock("@/repositories/firestore/problemIndexMetaRepo");
vi.mock("@/repositories/firestore/problemRepo");
vi.mock("@/services/leetcode/client");

const mockProblems = [{ id: "1", titleSlug: "two-sum", title: "Two Sum" }] as Parameters<
  typeof problemRepo.upsertMany
>[0];

beforeEach(() => {
  vi.resetAllMocks();
});

describe("ensureLCProblemIndex", () => {
  it("does nothing when index is already fully populated", async () => {
    vi.mocked(metaRepo.get).mockResolvedValue({ fullyPopulated: true, lastFetchedAt: 0, totalProblems: 10 });

    await ensureLCProblemIndex();

    expect(lcClient.fetchLCProblems).not.toHaveBeenCalled();
    expect(problemRepo.upsertMany).not.toHaveBeenCalled();
  });

  it("fetches and upserts when meta does not exist", async () => {
    vi.mocked(metaRepo.get).mockResolvedValue(null);
    vi.mocked(lcClient.fetchLCProblems).mockResolvedValue(mockProblems);
    vi.mocked(problemRepo.upsertMany).mockResolvedValue(undefined);
    vi.mocked(metaRepo.markFullyPopulated).mockResolvedValue(undefined);

    await ensureLCProblemIndex();

    expect(lcClient.fetchLCProblems).toHaveBeenCalledOnce();
    expect(problemRepo.upsertMany).toHaveBeenCalledWith(mockProblems);
    expect(metaRepo.markFullyPopulated).toHaveBeenCalledWith(mockProblems.length);
  });

  it("fetches and upserts when fullyPopulated is false", async () => {
    vi.mocked(metaRepo.get).mockResolvedValue({ fullyPopulated: false, lastFetchedAt: 0, totalProblems: 0 });
    vi.mocked(lcClient.fetchLCProblems).mockResolvedValue(mockProblems);
    vi.mocked(problemRepo.upsertMany).mockResolvedValue(undefined);
    vi.mocked(metaRepo.markFullyPopulated).mockResolvedValue(undefined);

    await ensureLCProblemIndex();

    expect(problemRepo.upsertMany).toHaveBeenCalledWith(mockProblems);
    expect(metaRepo.markFullyPopulated).toHaveBeenCalledWith(mockProblems.length);
  });
});
