import { randomUUID } from "node:crypto";
import { getDb } from "../server/db.ts";
import { submitPracticeAttempt } from "../server/repositories/practice.ts";
import { users, questions } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = await getDb();
if (!db) throw new Error("Database is not available for live practice verification.");
const [user] = await db.select({ id: users.id }).from(users).limit(1);
const [question] = await db.select({ id: questions.id, correctAnswer: questions.correctAnswer }).from(questions).where(eq(questions.questionId, "nexus-84-necessary-assumptions-009")).limit(1);
if (!user || !question) throw new Error("Missing a real user or persisted nexus-84 question for rollback-only verification.");

const transaction = db.transaction.bind(db);
db.transaction = async (callback) => transaction(async (tx) => {
  const result = await callback(tx);
  if (!result || result.idempotentReplay || result.skillEvidence?.length === 0) throw new Error("Practice submission did not return stored skill evidence.");
  throw new Error(`ROLLBACK_ONLY:${JSON.stringify({ questionId: question.id, skillEvidence: result.skillEvidence })}`);
});

try {
  await submitPracticeAttempt({
    userId: user.id,
    questionId: question.id,
    idempotencyKey: randomUUID(),
    selectedAnswer: question.correctAnswer,
    confidence: "certain",
    activeTimeMs: 5_000,
    context: "practice",
  });
  throw new Error("Rollback-only verification unexpectedly completed without rollback.");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.startsWith("ROLLBACK_ONLY:")) throw error;
  console.log(message.slice("ROLLBACK_ONLY:".length));
}
