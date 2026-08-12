import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PRODUCT_EVENT_NAMES } from "../shared/learnerDomain";
import {
  MAX_ACTIVE_TIME_MS,
  evaluatePracticeSubmission,
  getCalibrationState,
  normalizeActiveTimeMs,
  summarizePracticeAttempts,
  toBrowseSafeQuestion,
} from "../shared/practiceEvidence";

const practiceRouterSource = readFileSync(new URL("./routers/practice.ts", import.meta.url), "utf8");
const practiceRepositorySource = readFileSync(new URL("./repositories/practice.ts", import.meta.url), "utf8");
const questionRouterSource = readFileSync(new URL("./routers/questions.ts", import.meta.url), "utf8");
const questionBankSource = readFileSync(new URL("../client/src/pages/QuestionBank.tsx", import.meta.url), "utf8");

describe("practice evidence contracts", () => {
  it("removes answer truth from browse-safe questions", () => {
    const safe = toBrowseSafeQuestion({
      id: 17,
      questionId: "q-17",
      questionText: "Prompt",
      optionA: "A",
      optionB: "B",
      optionC: "C",
      optionD: "D",
      optionE: "E",
      correctAnswer: "C",
      explanation: "Private until submission",
      category: "LR",
      difficulty: "medium",
      source: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(safe).not.toHaveProperty("correctAnswer");
    expect(safe).not.toHaveProperty("explanation");
    expect(safe.questionText).toBe("Prompt");
  });

  it("bounds active time and reports confidence calibration deterministically", () => {
    expect(normalizeActiveTimeMs(-25)).toBe(0);
    expect(normalizeActiveTimeMs(Number.NaN)).toBe(0);
    expect(normalizeActiveTimeMs(MAX_ACTIVE_TIME_MS + 25_000)).toBe(MAX_ACTIVE_TIME_MS);
    expect(evaluatePracticeSubmission({ selectedAnswer: "A", correctAnswer: "A", confidence: "certain", activeTimeMs: 10_400 })).toMatchObject({
      isCorrect: true,
      calibration: "well_calibrated",
      activeTimeMs: 10_400,
    });
    expect(evaluatePracticeSubmission({ selectedAnswer: "B", correctAnswer: "A", confidence: "certain", activeTimeMs: 9_000 }).calibration).toBe("overconfident");
    expect(evaluatePracticeSubmission({ selectedAnswer: "B", correctAnswer: "A", confidence: "guessed", activeTimeMs: 9_000 }).calibration).toBe("appropriately_uncertain");
    expect(getCalibrationState(true, "unsure")).toBe("underconfident");
  });

  it("keeps answer truth behind authenticated, idempotent submission", () => {
    expect(practiceRouterSource).toContain("submit: protectedProcedure");
    expect(practiceRouterSource).toContain("idempotencyKey: z.string().uuid()");
    expect(practiceRouterSource).toContain("confidence: z.enum(CONFIDENCE_LEVELS)");
    expect(practiceRepositorySource).toContain("eq(questionAttempts.idempotencyKey, input.idempotencyKey)");
    expect(practiceRepositorySource).toContain("correctAnswer: questions.correctAnswer");
    expect(practiceRepositorySource).toContain("return db.transaction");
  });

  it("projects every public question response through the safe contract", () => {
    expect(questionRouterSource).toContain("questions.map(toBrowseSafeQuestion)");
    expect(questionRouterSource).toContain("question ? toBrowseSafeQuestion(question) : null");
    expect(questionBankSource).not.toContain("selectedQuestion.correctAnswer");
    expect(questionBankSource).not.toContain("selectedQuestion.explanation");
    expect(questionBankSource).toContain("submissionResult.correctAnswer");
    expect(questionBankSource).toContain("submissionResult.explanation");
  });

  it("records allow-listed, finite-retention practice events", () => {
    expect(PRODUCT_EVENT_NAMES).toEqual(expect.arrayContaining([
      "question_discovered",
      "question_started",
      "question_submitted",
      "question_completed",
    ]));
    expect(practiceRepositorySource).toContain("EVENT_RETENTION_MS = 90");
    expect(practiceRepositorySource).toContain("expiresAt: eventExpiry(now)");
    expect(practiceRepositorySource).toContain("sanitizeProductEventMetadata");
  });
});

describe("practice summary aggregation", () => {
  const now = new Date("2026-07-16T12:00:00Z");

  it("returns explicit empty metrics when a learner has no attempts", () => {
    const summary = summarizePracticeAttempts([], now);
    expect(summary.totalAttempts).toBe(0);
    expect(summary.accuracyPercent).toBeNull();
    expect(summary.averageActiveTimeMs).toBeNull();
    expect(summary.medianActiveTimeMs).toBeNull();
    expect(summary.recentAttemptCount).toBe(0);
    expect(summary.byConfidence.certain.accuracyPercent).toBeNull();
  });

  it("aggregates accuracy, calibration, timing, and recency deterministically", () => {
    const dayMs = 24 * 60 * 60 * 1_000;
    const summary = summarizePracticeAttempts([
      { isCorrect: true, confidence: "certain", activeTimeMs: 10_000, submittedAt: new Date(now.getTime() - dayMs) },
      { isCorrect: false, confidence: "certain", activeTimeMs: 20_000, submittedAt: new Date(now.getTime() - 2 * dayMs) },
      { isCorrect: true, confidence: "unsure", activeTimeMs: 30_000, submittedAt: new Date(now.getTime() - 3 * dayMs) },
      { isCorrect: false, confidence: "guessed", activeTimeMs: 40_000, submittedAt: new Date(now.getTime() - 4 * dayMs) },
      { isCorrect: true, confidence: "guessed", activeTimeMs: 50_000, submittedAt: new Date(now.getTime() - 10 * dayMs) },
    ], now);

    expect(summary.totalAttempts).toBe(5);
    expect(summary.correctAttempts).toBe(3);
    expect(summary.accuracyPercent).toBe(60);
    expect(summary.byConfidence.certain).toMatchObject({ attempts: 2, correct: 1, accuracyPercent: 50 });
    expect(summary.byConfidence.unsure).toMatchObject({ attempts: 1, correct: 1, accuracyPercent: 100 });
    expect(summary.byConfidence.guessed).toMatchObject({ attempts: 2, correct: 1, accuracyPercent: 50 });
    expect(summary.calibration).toEqual({
      well_calibrated: 1,
      underconfident: 2,
      overconfident: 1,
      appropriately_uncertain: 1,
    });
    expect(summary.averageActiveTimeMs).toBe(30_000);
    expect(summary.medianActiveTimeMs).toBe(30_000);
    expect(summary.recentAttemptCount).toBe(4);
  });

  it("averages the middle pair for even timing samples and normalizes outliers", () => {
    const summary = summarizePracticeAttempts([
      { isCorrect: true, confidence: "certain", activeTimeMs: 10_000, submittedAt: now },
      { isCorrect: true, confidence: "certain", activeTimeMs: 20_000, submittedAt: now },
      { isCorrect: true, confidence: "certain", activeTimeMs: 30_000, submittedAt: now },
      { isCorrect: true, confidence: "certain", activeTimeMs: Number.NaN, submittedAt: now },
    ], now);

    expect(summary.medianActiveTimeMs).toBe(15_000);
  });

  it("serves the summary only to its owner through the authenticated router", () => {
    expect(practiceRouterSource).toContain("summary: protectedProcedure");
    expect(practiceRouterSource).toContain("practiceRepository.getPracticeSummary(ctx.user.id)");
    expect(practiceRepositorySource).toContain("getPracticeSummary");
    expect(practiceRepositorySource).toContain("isCorrect: questionAttempts.isCorrect");
    expect(practiceRepositorySource).not.toContain("questionText");
  });

  it("records discovery as allow-listed, capped, finite-retention events", () => {
    expect(practiceRouterSource).toContain("discovered: protectedProcedure");
    expect(practiceRepositorySource).toContain("recordQuestionsDiscovered");
    expect(practiceRepositorySource).toContain('eventName: "question_discovered"');
    expect(practiceRepositorySource).toContain("PRACTICE_DISCOVERY_BATCH_MAX");
  });

  it("wires the client to discovery instrumentation and the summary read model", () => {
    expect(questionBankSource).toContain("trpc.practice.discovered.useMutation()");
    expect(questionBankSource).toContain("trpc.practice.summary.useQuery");
  });
});
