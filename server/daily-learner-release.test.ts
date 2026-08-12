import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const questionMocks = vi.hoisted(() => ({
  getById: vi.fn(),
  list: vi.fn(),
  count: vi.fn(),
  insertMany: vi.fn(),
  recordImport: vi.fn(),
}));

vi.mock("./repositories/questions", () => ({
  questionRepository: questionMocks,
}));

import { appRouter } from "./routers";

function anonymousContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const question = {
  id: 321,
  questionId: "LR-321",
  questionText: "Which one of the following most strengthens the argument?",
  optionA: "A",
  optionB: "B",
  optionC: "C",
  optionD: "D",
  optionE: null,
  correctAnswer: "B",
  explanation: "The credited response supplies the missing support.",
  category: "Logical Reasoning",
  difficulty: "medium",
  source: "Internal",
  createdAt: new Date("2026-07-16T00:00:00.000Z"),
  updatedAt: new Date("2026-07-16T00:00:00.000Z"),
};

describe("daily learner release contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    questionMocks.getById.mockResolvedValue(question);
  });

  it("loads one explicit question for a command-search deep link", async () => {
    const caller = appRouter.createCaller(anonymousContext());

    await expect(caller.questions.getById({ questionId: 321 })).resolves.toMatchObject({
      id: 321,
      questionId: "LR-321",
    });
    expect(questionMocks.getById).toHaveBeenCalledWith(321);
    expect(questionMocks.list).not.toHaveBeenCalled();
  });

  it("returns a quiet nullable result for a stale deep-link target", async () => {
    questionMocks.getById.mockResolvedValue(null);
    const caller = appRouter.createCaller(anonymousContext());

    await expect(caller.questions.getById({ questionId: 999_999 })).resolves.toBeNull();
  });

  it("keeps Practice browsing bounded and consumes the command-palette question parameter", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/QuestionBank.tsx"), "utf8");

    expect(source).toContain("const QUESTIONS_PER_PAGE = 200");
    expect(source).toContain("params.get(\"question\")");
    expect(source).toContain("trpc.questions.getById.useQuery");
    expect(source).toContain("retry: false");
    expect(source).toContain("That question is no longer available");
    expect(source).not.toContain("limit: 10000");
  });

  it("provides orientation metadata for every canonical learner surface", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/ContextualOrientationHeader.tsx"), "utf8");

    for (const routeId of ["today", "learn", "practice", "review", "progress", "plan", "resources"]) {
      expect(source).toContain(`${routeId}: {`);
    }
  });

  it("keeps dashboard-v2 actions and evidence summary driven by the aggregated Continue Learning response", () => {
    const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/pages/Dashboard.tsx"), "utf8");
    const continueLearningSource = readFileSync(resolve(process.cwd(), "client/src/components/ContinueLearningDashboard.tsx"), "utf8");

    expect(dashboardSource).not.toContain("<ContinueLearningSidebar />\n      <QuickNavigation />");
    expect(continueLearningSource).toContain("data.summary.dueReviewCount");
    expect(continueLearningSource).toContain("data.summary.hasActivePlanTask");
    expect(continueLearningSource).toContain("data.primaryAction?.route");
  });
});
