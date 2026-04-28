import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("tags router", () => {
  it("allows admin to create a tag", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tags.create({
      name: `Logical Reasoning ${Date.now()}`,
      type: "topic",
      description: "Questions focused on logical reasoning",
      color: "#0052CC",
    });

    expect(result.success).toBe(true);
    expect(result.tagId).toBeGreaterThan(0);
  });

  it("prevents non-admin from creating a tag", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tags.create({
        name: "Reading Comprehension",
        type: "topic",
        color: "#0052CC",
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("Only admins can create tags");
    }
  });

  it("retrieves all tags", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a tag first
    await caller.tags.create({
      name: `Test Tag ${Date.now()}`,
      type: "objective",
      color: "#FF0000",
    });

    // List tags
    const tags = await caller.tags.list();
    expect(Array.isArray(tags)).toBe(true);
  });

  it("validates tag name is required", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tags.create({
        name: "",
        type: "topic",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("validates color format", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tags.create({
        name: "Invalid Color Tag",
        type: "topic",
        color: "invalid-color",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("allows admin to add tag to question", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tags.addToQuestion({
      questionId: 1,
      tagId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("prevents non-admin from adding tag to question", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tags.addToQuestion({
        questionId: 1,
        tagId: 1,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("Only admins can tag questions");
    }
  });

  it("allows admin to remove tag from question", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tags.removeFromQuestion({
      questionId: 1,
      tagId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("prevents non-admin from removing tag from question", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.tags.removeFromQuestion({
        questionId: 1,
        tagId: 1,
      });
      expect.fail("Should have thrown FORBIDDEN error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("Only admins can remove tags");
    }
  });
});
