import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("learner router authorization", () => {
  it("rejects anonymous learner bootstrap requests", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.learner.bootstrap({ timezone: "UTC" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects anonymous curriculum and progress access", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.learner.curriculum()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.learner.progress()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.learner.continueLearning()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects anonymous preference mutations", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    await expect(caller.preferences.save({
      textScale: "default",
      readingWidth: "comfortable",
      contrast: "default",
      motion: "system",
      passageFocus: "off",
      keyboardShortcuts: "on",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
