import { describe, expect, it } from "vitest";
import { summarizeLatestQuestionOutcomes, type QuestionAttemptOutcome } from "../shared/questionProgress";
import { readFileSync } from "node:fs";

const practiceRouterSource = readFileSync(new URL("./routers/practice.ts", import.meta.url), "utf8");

const baseAttempt: QuestionAttemptOutcome = {
  attemptId: 1,
  questionId: 101,
  questionKey: "nexus-lr-sample-001",
  category: "Necessary Assumption",
  difficulty: "easy",
  source: "LSAT Nexus Original Sample Set",
  selectedAnswer: "A",
  isCorrect: true,
  confidence: "certain",
  activeTimeMs: 20_000,
  submittedAt: new Date("2026-08-12T12:00:00.000Z"),
};

describe("Question Bank learner outcomes", () => {
  it("keeps the latest outcome per question and preserves attempt counts", () => {
    const outcomes = summarizeLatestQuestionOutcomes([
      baseAttempt,
      { ...baseAttempt, attemptId: 2, selectedAnswer: "B", isCorrect: false, submittedAt: new Date("2026-08-12T12:10:00.000Z") },
      { ...baseAttempt, attemptId: 3, questionId: 102, questionKey: "nexus-lr-sample-002", selectedAnswer: "C", isCorrect: false, submittedAt: new Date("2026-08-12T12:05:00.000Z") },
    ]);

    expect(outcomes).toHaveLength(2);
    expect(outcomes[0]).toMatchObject({ questionId: 101, selectedAnswer: "B", isCorrect: false, attemptCount: 2 });
    expect(outcomes[1]).toMatchObject({ questionId: 102, selectedAnswer: "C", isCorrect: false, attemptCount: 1 });
  });

  it("keeps learner outcomes behind an authenticated practice procedure", () => {
    expect(practiceRouterSource).toContain("outcomes: protectedProcedure");
    expect(practiceRouterSource).toContain("practiceRepository.getQuestionOutcomes(ctx.user.id, input.limit)");
  });
});
