import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module so tests don't make real API calls
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content:
            "## Priority Rankings\n1. Flaw Questions\n\n## Week-by-Week Schedule\nWeek 1: Argument Anatomy\n\n## Session Breakdowns\nSession 1: 45 min",
        },
      },
    ],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("lessonPlan.generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a plan with valid inputs (with diagnostic score)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lessonPlan.generate({
      currentScore: 152,
      targetScore: 165,
      testDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(), // 60 days from now
      hoursPerWeek: "8",
      weakAreas: ["Flaw", "Assumption"],
    });

    expect(result.plan).toContain("Priority Rankings");
    expect(result.plan).toContain("Week-by-Week Schedule");
    expect(result.plan).toContain("Session Breakdowns");
    expect(result.weeksUntilTest).toBeGreaterThan(0);
    expect(result.scoreGap).toBe("13 points");
  });

  it("generates a plan with untested score", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lessonPlan.generate({
      currentScore: "untested",
      targetScore: 170,
      testDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(),
      hoursPerWeek: "12",
      weakAreas: ["Conditional Reasoning", "Flaw", "Reading Comprehension"],
    });

    expect(result.plan).toBeTruthy();
    expect(result.scoreGap).toBe("unknown (no diagnostic taken yet)");
    expect(result.weeksUntilTest).toBeGreaterThan(0);
  });

  it("calculates weeks until test correctly", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // 4 weeks from now
    const fourWeeks = new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString();

    const result = await caller.lessonPlan.generate({
      currentScore: 155,
      targetScore: 165,
      testDate: fourWeeks,
      hoursPerWeek: "4",
      weakAreas: ["Main Point"],
    });

    expect(result.weeksUntilTest).toBeGreaterThanOrEqual(3);
    expect(result.weeksUntilTest).toBeLessThanOrEqual(5);
  });

  it("rejects empty weakAreas array", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lessonPlan.generate({
        currentScore: 150,
        targetScore: 165,
        testDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
        hoursPerWeek: "8",
        weakAreas: [] as any,
      })
    ).rejects.toThrow();
  });

  it("rejects score below 120", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lessonPlan.generate({
        currentScore: 100,
        targetScore: 165,
        testDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
        hoursPerWeek: "8",
        weakAreas: ["Flaw"],
      })
    ).rejects.toThrow();
  });

  it("rejects target score above 180", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lessonPlan.generate({
        currentScore: 150,
        targetScore: 185,
        testDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
        hoursPerWeek: "8",
        weakAreas: ["Flaw"],
      })
    ).rejects.toThrow();
  });

  it("handles LLM returning empty content gracefully", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockResolvedValueOnce({ choices: [{ message: { content: "" } }] } as any);

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lessonPlan.generate({
        currentScore: 150,
        targetScore: 165,
        testDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
        hoursPerWeek: "8",
        weakAreas: ["Flaw"],
      })
    ).rejects.toThrow("AI returned an empty response");
  });
});
