import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { users, questions } from "../drizzle/schema";
import { getDb } from "./db";
import { submitPracticeAttempt } from "./repositories/practice";

describe("persisted nexus-84 practice evidence integration", () => {
  it("returns stored skill mappings through a rollback-only live practice submission", async () => {
    const db = await getDb();
    expect(db).not.toBeNull();
    if (!db) return;
    const [user] = await db.select({ id: users.id }).from(users).limit(1);
    const [question] = await db.select({ id: questions.id, correctAnswer: questions.correctAnswer }).from(questions).where(eq(questions.questionId, "nexus-84-necessary-assumptions-009")).limit(1);
    expect(user).toBeDefined();
    expect(question).toBeDefined();
    if (!user || !question) return;

    const originalTransaction = db.transaction.bind(db);
    let result: Awaited<ReturnType<typeof submitPracticeAttempt>> = null;
    const rollbackSignal = "ROLLBACK_NEXUS_84_EVIDENCE";
    (db as typeof db & { transaction: typeof db.transaction }).transaction = async (callback: Parameters<typeof db.transaction>[0]) => originalTransaction(async (tx) => {
      result = await callback(tx);
      throw new Error(rollbackSignal);
    });
    try {
      await expect(submitPracticeAttempt({
        userId: user.id,
        questionId: question.id,
        idempotencyKey: randomUUID(),
        selectedAnswer: question.correctAnswer as "A" | "B" | "C" | "D" | "E",
        confidence: "certain",
        activeTimeMs: 5_000,
        context: "practice",
      })).rejects.toThrow(rollbackSignal);
    } finally {
      (db as typeof db & { transaction: typeof db.transaction }).transaction = originalTransaction;
    }

    expect(result).toMatchObject({ isCorrect: true, idempotentReplay: false });
    expect(result?.skillEvidence).toEqual(expect.arrayContaining([
      expect.objectContaining({ questionId: question.id, skillId: "argument-core", weight: 100, isCorrect: true }),
      expect.objectContaining({ questionId: question.id, skillId: "necessary-assumption", weight: 100, isCorrect: true }),
    ]));
  });
});
