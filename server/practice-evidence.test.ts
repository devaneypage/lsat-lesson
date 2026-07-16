import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PRODUCT_EVENT_NAMES } from "../shared/learnerDomain";
import {
  MAX_ACTIVE_TIME_MS,
  evaluatePracticeSubmission,
  normalizeActiveTimeMs,
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
      "question_started",
      "question_submitted",
      "question_completed",
    ]));
    expect(practiceRepositorySource).toContain("EVENT_RETENTION_MS = 90");
    expect(practiceRepositorySource).toContain("expiresAt: eventExpiry(now)");
    expect(practiceRepositorySource).toContain("sanitizeProductEventMetadata");
  });
});
