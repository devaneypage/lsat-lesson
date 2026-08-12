import { and, eq, inArray } from "drizzle-orm";
import { productEvents, questionAttempts, questions } from "../../drizzle/schema";
import { sanitizeProductEventMetadata, type ConfidenceLevel } from "../../shared/learnerDomain";
import {
  PRACTICE_DISCOVERY_BATCH_MAX,
  evaluatePracticeSubmission,
  summarizePracticeAttempts,
  type AnswerLetter,
  type PracticeContext,
  type PracticeSummary,
} from "../../shared/practiceEvidence";
import { getDb } from "../db";

const EVENT_RETENTION_MS = 90 * 24 * 60 * 60 * 1_000;

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

function eventExpiry(now: Date) {
  return new Date(now.getTime() + EVENT_RETENTION_MS);
}

export async function recordQuestionStarted(input: {
  userId: number;
  questionId: number;
  route?: string;
  surface?: string;
  now?: Date;
}) {
  const db = await requireDb();
  const now = input.now ?? new Date();
  const question = await db
    .select({ id: questions.id })
    .from(questions)
    .where(eq(questions.id, input.questionId))
    .limit(1);
  if (!question[0]) return false;

  await db.insert(productEvents).values({
    userId: input.userId,
    eventName: "question_started",
    route: input.route?.slice(0, 255) ?? "/practice",
    metadata: sanitizeProductEventMetadata({
      surface: input.surface ?? "practice",
      route: input.route ?? "/practice",
      contentType: "question",
      contentId: String(input.questionId),
    }),
    occurredAt: now,
    expiresAt: eventExpiry(now),
  });
  return true;
}

export async function recordQuestionsDiscovered(input: {
  userId: number;
  questionIds: number[];
  route?: string;
  surface?: string;
  now?: Date;
}) {
  const db = await requireDb();
  const now = input.now ?? new Date();
  const uniqueIds = [...new Set(input.questionIds)].slice(0, PRACTICE_DISCOVERY_BATCH_MAX);
  if (uniqueIds.length === 0) return 0;

  const existing = await db
    .select({ id: questions.id })
    .from(questions)
    .where(inArray(questions.id, uniqueIds));
  const existingIds = new Set(existing.map((row) => row.id));

  const route = input.route?.slice(0, 255) ?? "/question-bank";
  const expiresAt = eventExpiry(now);
  const values = uniqueIds
    .filter((id) => existingIds.has(id))
    .map((id) => ({
      userId: input.userId,
      eventName: "question_discovered" as const,
      route,
      metadata: sanitizeProductEventMetadata({
        surface: input.surface ?? "question_bank",
        route,
        contentType: "question",
        contentId: String(id),
      }),
      occurredAt: now,
      expiresAt,
    }));

  if (values.length === 0) return 0;
  await db.insert(productEvents).values(values);
  return values.length;
}

/**
 * Returns one learner's aggregate calibration and timing evidence. Selects
 * only attempt columns so no question text, explanations, or private learner
 * notes ever leave the database for this read model.
 */
export async function getPracticeSummary(userId: number, now: Date = new Date()): Promise<PracticeSummary> {
  const db = await requireDb();
  const rows = await db
    .select({
      isCorrect: questionAttempts.isCorrect,
      confidence: questionAttempts.confidence,
      activeTimeMs: questionAttempts.activeTimeMs,
      submittedAt: questionAttempts.submittedAt,
    })
    .from(questionAttempts)
    .where(eq(questionAttempts.userId, userId));

  return summarizePracticeAttempts(
    rows.map((row) => ({
      isCorrect: row.isCorrect === 1,
      confidence: row.confidence,
      activeTimeMs: row.activeTimeMs,
      submittedAt: row.submittedAt,
    })),
    now,
  );
}

export async function submitPracticeAttempt(input: {
  userId: number;
  questionId: number;
  idempotencyKey: string;
  selectedAnswer: AnswerLetter;
  confidence: ConfidenceLevel;
  activeTimeMs: number;
  context: PracticeContext;
  route?: string;
  surface?: string;
  now?: Date;
}) {
  const db = await requireDb();
  const now = input.now ?? new Date();

  return db.transaction(async (tx) => {
    const [question] = await tx
      .select({
        id: questions.id,
        correctAnswer: questions.correctAnswer,
        explanation: questions.explanation,
      })
      .from(questions)
      .where(eq(questions.id, input.questionId))
      .limit(1);

    if (!question) return null;

    const [existing] = await tx
      .select()
      .from(questionAttempts)
      .where(and(
        eq(questionAttempts.userId, input.userId),
        eq(questionAttempts.idempotencyKey, input.idempotencyKey),
      ))
      .limit(1);

    if (existing) {
      return {
        attemptId: existing.id,
        isCorrect: existing.isCorrect === 1,
        correctAnswer: question.correctAnswer as AnswerLetter,
        explanation: question.explanation,
        confidence: existing.confidence,
        activeTimeMs: existing.activeTimeMs,
        calibration: evaluatePracticeSubmission({
          selectedAnswer: existing.selectedAnswer as AnswerLetter,
          correctAnswer: question.correctAnswer,
          confidence: existing.confidence,
          activeTimeMs: existing.activeTimeMs,
        }).calibration,
        idempotentReplay: true,
      };
    }

    const evaluation = evaluatePracticeSubmission({
      selectedAnswer: input.selectedAnswer,
      correctAnswer: question.correctAnswer,
      confidence: input.confidence,
      activeTimeMs: input.activeTimeMs,
    });

    await tx.insert(questionAttempts).values({
      userId: input.userId,
      questionId: input.questionId,
      idempotencyKey: input.idempotencyKey,
      selectedAnswer: input.selectedAnswer,
      isCorrect: evaluation.isCorrect ? 1 : 0,
      confidence: input.confidence,
      activeTimeMs: evaluation.activeTimeMs,
      context: input.context,
      submittedAt: now,
      createdAt: now,
    });

    const [attempt] = await tx
      .select()
      .from(questionAttempts)
      .where(and(
        eq(questionAttempts.userId, input.userId),
        eq(questionAttempts.idempotencyKey, input.idempotencyKey),
      ))
      .limit(1);

    if (!attempt) throw new Error("Attempt persistence failed");

    const route = input.route?.slice(0, 255) ?? "/practice";
    const metadata = sanitizeProductEventMetadata({
      surface: input.surface ?? "practice",
      route,
      contentType: "question",
      contentId: String(input.questionId),
      status: evaluation.isCorrect ? "correct" : "incorrect",
    });
    const expiresAt = eventExpiry(now);

    await tx.insert(productEvents).values([
      {
        userId: input.userId,
        eventName: "question_submitted",
        route,
        metadata,
        occurredAt: now,
        expiresAt,
      },
      {
        userId: input.userId,
        eventName: "question_completed",
        route,
        metadata,
        occurredAt: now,
        expiresAt,
      },
    ]);

    return {
      attemptId: attempt.id,
      isCorrect: evaluation.isCorrect,
      correctAnswer: question.correctAnswer as AnswerLetter,
      explanation: question.explanation,
      confidence: attempt.confidence,
      activeTimeMs: attempt.activeTimeMs,
      calibration: evaluation.calibration,
      idempotentReplay: false,
    };
  });
}

export const practiceRepository = {
  recordQuestionStarted,
  recordQuestionsDiscovered,
  getPracticeSummary,
  submitPracticeAttempt,
};
