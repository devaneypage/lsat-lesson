import { and, desc, eq, inArray } from "drizzle-orm";
import { curriculumSkills, productEvents, questionAttempts, questionCategories, questionDifficulties, questionSkills, questionSources, questions } from "../../drizzle/schema";
import { sanitizeProductEventMetadata, type ConfidenceLevel } from "../../shared/learnerDomain";
import {
  PRACTICE_DISCOVERY_BATCH_MAX,
  derivePracticeSkillEvidence,
  evaluatePracticeSubmission,
  normalizeActiveTimeMs,
  summarizePracticeAttempts,
  type AnswerLetter,
  type PracticeContext,
  type PracticeSummary,
} from "../../shared/practiceEvidence";
import { getDb } from "../db";
import { summarizeLatestQuestionOutcomes } from "../../shared/questionProgress";

const EVENT_RETENTION_MS = 90 * 24 * 60 * 60 * 1_000;
export const TODAY_RECENT_PRACTICE_LIMIT = 12;
export const TODAY_EVIDENCE_ATTEMPT_LIMIT = 100;
export const TODAY_ESTABLISHED_EVIDENCE_COUNT = 5;

export type TodayPracticeAttempt = {
  attemptId: number;
  questionId: number;
  isCorrect: boolean;
  activeTimeMs: number;
  submittedAt: Date;
};

export type TodayMappedEvidence = {
  attemptId: number;
  isCorrect: boolean;
  skillId: string | null;
  skillTitle: string | null;
  questionType: string | null;
};

export type TodayEvidenceGroup = {
  key: string;
  label: string;
  evidenceCount: number;
  correctCount: number;
  accuracyPercent: number;
  status: "provisional" | "established";
};

export type TodayPracticeAggregate = {
  recentPractice: {
    attempts: number;
    correctCount: number;
    activeTimeMs: number;
    latestSubmittedAt: Date | null;
  };
  practiceEvidence: {
    sampledAttempts: number;
    attemptLimit: number;
    establishedEvidenceCount: number;
    bySkill: TodayEvidenceGroup[];
    byType: TodayEvidenceGroup[];
  };
};

function percent(correct: number, attempts: number) {
  return attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
}

function evidenceStatus(evidenceCount: number) {
  return evidenceCount >= TODAY_ESTABLISHED_EVIDENCE_COUNT
    ? "established" as const
    : "provisional" as const;
}

function summarizeEvidenceGroups(
  entries: Iterable<{ attemptId: number; key: string; label: string; isCorrect: boolean }>,
) {
  const groups = new Map<string, { label: string; attempts: Map<number, boolean> }>();
  for (const entry of entries) {
    const group = groups.get(entry.key) ?? { label: entry.label, attempts: new Map<number, boolean>() };
    group.attempts.set(entry.attemptId, entry.isCorrect);
    groups.set(entry.key, group);
  }

  return Array.from(groups, ([key, group]): TodayEvidenceGroup => {
    const outcomes = Array.from(group.attempts.values());
    const correctCount = outcomes.filter(Boolean).length;
    return {
      key,
      label: group.label,
      evidenceCount: outcomes.length,
      correctCount,
      accuracyPercent: percent(correctCount, outcomes.length),
      status: evidenceStatus(outcomes.length),
    };
  }).sort((a, b) => b.evidenceCount - a.evidenceCount || a.label.localeCompare(b.label));
}

/** Builds the bounded practice portion of Today from persisted attempt rows. */
export function summarizeTodayPractice(
  attempts: TodayPracticeAttempt[],
  mappedEvidence: TodayMappedEvidence[],
): TodayPracticeAggregate {
  const sampled = attempts.slice(0, TODAY_EVIDENCE_ATTEMPT_LIMIT);
  const sampledAttemptIds = new Set(sampled.map(row => row.attemptId));
  const recent = sampled.slice(0, TODAY_RECENT_PRACTICE_LIMIT);
  const mapped = mappedEvidence.filter((row): row is TodayMappedEvidence & { skillId: string } =>
    sampledAttemptIds.has(row.attemptId) && Boolean(row.skillId));
  const correct = recent.filter(row => row.isCorrect).length;

  return {
    recentPractice: {
      attempts: recent.length,
      correctCount: correct,
      activeTimeMs: recent.reduce((sum, row) => sum + normalizeActiveTimeMs(row.activeTimeMs), 0),
      latestSubmittedAt: recent[0]?.submittedAt ?? null,
    },
    practiceEvidence: {
      sampledAttempts: sampled.length,
      attemptLimit: TODAY_EVIDENCE_ATTEMPT_LIMIT,
      establishedEvidenceCount: TODAY_ESTABLISHED_EVIDENCE_COUNT,
      bySkill: summarizeEvidenceGroups(mapped.map(row => ({
        attemptId: row.attemptId,
        key: row.skillId,
        label: row.skillTitle ?? row.skillId,
        isCorrect: row.isCorrect,
      }))),
      byType: summarizeEvidenceGroups(mapped
        .filter((row): row is typeof row & { questionType: string } => Boolean(row.questionType))
        .map(row => ({
          attemptId: row.attemptId,
          key: row.questionType,
          label: row.questionType,
          isCorrect: row.isCorrect,
        }))),
    },
  };
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

function eventExpiry(now: Date) {
  return new Date(now.getTime() + EVENT_RETENTION_MS);
}

type PracticeQuestionRecord = {
  id: number;
  correctAnswer: string;
  explanation: string | null;
};

async function loadPersistedSkillMappings(executor: { select: (...args: any[]) => any }, questionId: number) {
  return executor.select({ skillId: questionSkills.skillId, weight: questionSkills.weight }).from(questionSkills).where(eq(questionSkills.questionId, questionId)) as Promise<{ skillId: string; weight: number }[]>;
}

export async function getPracticeQuestionSkillEvidenceByKey(questionKey: string) {
  const db = await requireDb();
  const [question] = await db.select({ id: questions.id, correctAnswer: questions.correctAnswer, explanation: questions.explanation }).from(questions).where(eq(questions.questionId, questionKey)).limit(1) as PracticeQuestionRecord[];
  if (!question) return null;
  return {
    question,
    skillMappings: await loadPersistedSkillMappings(db, question.id),
  };
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
  const uniqueIds = Array.from(new Set(input.questionIds)).slice(0, PRACTICE_DISCOVERY_BATCH_MAX);
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

/** Returns bounded, user-scoped practice evidence for the Today aggregate. */
export async function getTodayPracticeEvidence(userId: number) {
  const db = await requireDb();
  const rows = await db
    .select({
      attemptId: questionAttempts.id,
      questionId: questionAttempts.questionId,
      isCorrect: questionAttempts.isCorrect,
      activeTimeMs: questionAttempts.activeTimeMs,
      submittedAt: questionAttempts.submittedAt,
    })
    .from(questionAttempts)
    .where(eq(questionAttempts.userId, userId))
    .orderBy(desc(questionAttempts.submittedAt), desc(questionAttempts.id))
    .limit(TODAY_EVIDENCE_ATTEMPT_LIMIT);

  if (rows.length === 0) return summarizeTodayPractice([], []);

  const attemptIds = rows.map(row => row.attemptId);
  const evidenceRows = await db
    .select({
      attemptId: questionAttempts.id,
      isCorrect: questionAttempts.isCorrect,
      skillId: questionSkills.skillId,
      skillTitle: curriculumSkills.title,
      questionType: questionCategories.name,
    })
    .from(questionAttempts)
    .innerJoin(questions, eq(questionAttempts.questionId, questions.id))
    .leftJoin(questionSkills, eq(questions.id, questionSkills.questionId))
    .leftJoin(curriculumSkills, eq(questionSkills.skillId, curriculumSkills.skillId))
    .leftJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
    .where(and(
      eq(questionAttempts.userId, userId),
      inArray(questionAttempts.id, attemptIds),
    ));

  return summarizeTodayPractice(
    rows.map(row => ({ ...row, isCorrect: row.isCorrect === 1 })),
    evidenceRows.map(row => ({ ...row, isCorrect: row.isCorrect === 1 })),
  );
}

/** Returns the latest recorded outcome for each attempted question, newest first. */
export async function getQuestionOutcomes(userId: number, limit = 12) {
  const db = await requireDb();
  const rows = await db
    .select({
      attemptId: questionAttempts.id,
      questionId: questions.id,
      questionKey: questions.questionId,
      category: questionCategories.name,
      difficulty: questionDifficulties.name,
      source: questionSources.name,
      selectedAnswer: questionAttempts.selectedAnswer,
      isCorrect: questionAttempts.isCorrect,
      confidence: questionAttempts.confidence,
      activeTimeMs: questionAttempts.activeTimeMs,
      submittedAt: questionAttempts.submittedAt,
    })
    .from(questionAttempts)
    .innerJoin(questions, eq(questionAttempts.questionId, questions.id))
    .leftJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
    .leftJoin(questionDifficulties, eq(questions.difficultyId, questionDifficulties.id))
    .leftJoin(questionSources, eq(questions.sourceId, questionSources.id))
    .where(eq(questionAttempts.userId, userId))
    .orderBy(desc(questionAttempts.submittedAt), desc(questionAttempts.id));

  const outcomes = summarizeLatestQuestionOutcomes(rows.map((row) => ({
    ...row,
    selectedAnswer: row.selectedAnswer as AnswerLetter,
    isCorrect: row.isCorrect === 1,
  })));

  return {
    uniqueQuestionsAttempted: outcomes.length,
    outcomes: outcomes.slice(0, Math.max(1, Math.min(limit, 50))),
  };
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
    const skillMappings = await loadPersistedSkillMappings(tx, question.id);

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
        skillEvidence: derivePracticeSkillEvidence({ questionId: question.id, mappings: skillMappings, isCorrect: existing.isCorrect === 1 }),
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
      skillEvidence: derivePracticeSkillEvidence({ questionId: question.id, mappings: skillMappings, isCorrect: evaluation.isCorrect }),
      idempotentReplay: false,
    };
  });
}

/** Question type + difficulty options actually present, for the set-builder's filter chips. */
async function getPracticeSetFilters() {
  const db = await requireDb();
  const [categories, difficulties] = await Promise.all([
    db.select({ name: questionCategories.name }).from(questionCategories).orderBy(questionCategories.name),
    db.select({ name: questionDifficulties.name }).from(questionDifficulties).orderBy(questionDifficulties.name),
  ]);
  return { categories: categories.map((c) => c.name), difficulties: difficulties.map((d) => d.name) };
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Selects up to `length` questions matching the optional category/difficulty
 * filter, preferring questions the user hasn't attempted before. Returns
 * browse-safe questions only — correctAnswer/explanation are never sent to
 * the client before an answer is submitted.
 */
async function buildPracticeSet(input: {
  userId: number;
  category?: string;
  difficulty?: string;
  length: number;
}) {
  const db = await requireDb();

  const conditions = [];
  if (input.category) {
    const [row] = await db.select({ id: questionCategories.id }).from(questionCategories).where(eq(questionCategories.name, input.category)).limit(1);
    if (!row) return { questionIds: [] as number[], totalMatching: 0, unseenMatching: 0 };
    conditions.push(eq(questions.categoryId, row.id));
  }
  if (input.difficulty) {
    const [row] = await db.select({ id: questionDifficulties.id }).from(questionDifficulties).where(eq(questionDifficulties.name, input.difficulty)).limit(1);
    if (!row) return { questionIds: [] as number[], totalMatching: 0, unseenMatching: 0 };
    conditions.push(eq(questions.difficultyId, row.id));
  }

  const matching = await db
    .select({ id: questions.id })
    .from(questions)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  if (matching.length === 0) return { questionIds: [] as number[], totalMatching: 0, unseenMatching: 0 };

  const attemptedRows = await db
    .selectDistinct({ questionId: questionAttempts.questionId })
    .from(questionAttempts)
    .where(and(eq(questionAttempts.userId, input.userId), inArray(questionAttempts.questionId, matching.map((q) => q.id))));
  const attemptedIds = new Set(attemptedRows.map((row) => row.questionId));

  const unseen = matching.filter((q) => !attemptedIds.has(q.id));
  const seen = matching.filter((q) => attemptedIds.has(q.id));
  const ordered = [...shuffle(unseen), ...shuffle(seen)].slice(0, input.length);

  return {
    questionIds: ordered.map((q) => q.id),
    totalMatching: matching.length,
    unseenMatching: unseen.length,
  };
}

export const practiceRepository = {
  recordQuestionStarted,
  recordQuestionsDiscovered,
  getPracticeSummary,
  getTodayPracticeEvidence,
  getQuestionOutcomes,
  submitPracticeAttempt,
  getPracticeSetFilters,
  buildPracticeSet,
};
