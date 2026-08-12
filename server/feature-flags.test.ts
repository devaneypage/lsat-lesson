import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getAllFlags: vi.fn(),
  toggleFlag: vi.fn(),
  setFlagRollout: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getAllFlags: dbMocks.getAllFlags,
    toggleFlag: dbMocks.toggleFlag,
    setFlagRollout: dbMocks.setFlagRollout,
  };
});

import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const now = new Date("2026-07-16T00:00:00.000Z");
const mockFlags = [
  {
    id: 1,
    key: "lesson_grid",
    name: "Lesson Grid",
    description: "Nexus lesson grid",
    enabled: 1,
    rolloutPercentage: 100,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 2,
    key: "booking_cta",
    name: "Booking CTA",
    description: "Booking entry point",
    enabled: 0,
    rolloutPercentage: 100,
    createdAt: now,
    updatedAt: now,
  },
];

function createContext(role: "admin" | "user" | null): TrpcContext {
  const user: AuthenticatedUser | null = role
    ? {
        id: role === "admin" ? 1 : 2,
        openId: `${role}-open-id`,
        email: `${role}@example.com`,
        name: role === "admin" ? "Admin" : "Learner",
        loginMethod: "manus",
        role,
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      }
    : null;

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("feature-flag router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.getAllFlags.mockResolvedValue(mockFlags);
    dbMocks.toggleFlag.mockResolvedValue({ ...mockFlags[0], enabled: 0 });
    dbMocks.setFlagRollout.mockResolvedValue({
      ...mockFlags[0],
      rolloutPercentage: 25,
    });
  });

  it("returns evaluated decisions without admin metadata", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const result = await caller.flags.evaluate({ visitorId: "visitor-123" });

    expect(result).toEqual([
      { key: "lesson_grid", enabled: true },
      { key: "booking_cta", enabled: false },
    ]);
    expect(result[0]).not.toHaveProperty("description");
    expect(result[0]).not.toHaveProperty("rolloutPercentage");
  });

  it("returns management metadata to administrators", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.flags.adminList();

    expect(result[0]).toMatchObject({
      key: "lesson_grid",
      name: "Lesson Grid",
      enabled: true,
      rolloutPercentage: 100,
    });
  });

  it("denies management metadata to ordinary users", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.flags.adminList()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("denies flag mutations to ordinary users", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(
      caller.flags.toggle({ key: "lesson_grid", enabled: false })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(dbMocks.toggleFlag).not.toHaveBeenCalled();
  });

  it("allows administrators to change rollout percentage", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const result = await caller.flags.setRollout({
      key: "lesson_grid",
      rolloutPercentage: 25,
    });

    expect(dbMocks.setFlagRollout).toHaveBeenCalledWith("lesson_grid", 25);
    expect(result).toEqual({ key: "lesson_grid", rolloutPercentage: 25 });
  });
});
