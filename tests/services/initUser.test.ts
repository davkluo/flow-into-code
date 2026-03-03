import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAdminDb } from "@/lib/firebase/admin";
import * as userRepo from "@/repositories/firestore/userRepo";
import * as statsRepo from "@/repositories/firestore/statsRepo";
import { initUser } from "@/services/initUser";

vi.mock("@/lib/firebase/admin");
// Explicit factories avoid importing the actual modules, which transitively pull
// in practice.tsx (JSX) that can't be transformed in the node test environment.
vi.mock("@/repositories/firestore/userRepo", () => ({
  create: vi.fn(),
}));
vi.mock("@/repositories/firestore/statsRepo", () => ({
  incrementUserCount: vi.fn(),
  incrementSessionCount: vi.fn(),
}));

const mockTx = { get: vi.fn() };
const mockUserRef = {};
const mockDb = {
  collection: vi.fn().mockReturnValue({ doc: vi.fn().mockReturnValue(mockUserRef) }),
  runTransaction: vi.fn().mockImplementation(async (callback) => callback(mockTx)),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAdminDb).mockReturnValue(mockDb as unknown as ReturnType<typeof getAdminDb>);
  vi.mocked(userRepo.create).mockResolvedValue(undefined);
  vi.mocked(statsRepo.incrementUserCount).mockResolvedValue(undefined);
  mockTx.get.mockReset();
});

describe("initUser", () => {
  it("creates the user doc and increments user count when user does not exist", async () => {
    mockTx.get.mockResolvedValue({ exists: false });

    await initUser("uid-123");

    expect(userRepo.create).toHaveBeenCalledWith("uid-123", mockTx);
    expect(statsRepo.incrementUserCount).toHaveBeenCalledWith(mockTx);
  });

  it("is a no-op when the user already exists", async () => {
    mockTx.get.mockResolvedValue({ exists: true });

    await initUser("uid-existing");

    expect(userRepo.create).not.toHaveBeenCalled();
    expect(statsRepo.incrementUserCount).not.toHaveBeenCalled();
  });
});
