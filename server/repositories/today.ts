import { and, asc, count, eq, isNull, lte, or } from "drizzle-orm";
import { reviewItems, studyPlans, studyPlanTasks } from "../../drizzle/schema";
import { getDb } from "../db";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export type TodayReviewSignal = {
  count: number;
  id?: number;
  questionId?: number;
  stage?: number;
  status?: "active";
  nextDueAt: Date;
  snoozedUntil?: Date | null;
  lastAttemptId?: number | null;
  reason: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TodayPlanTaskSignal = {
  id: number;
  planId?: number;
  title: string;
  itemType: "lesson" | "practice" | "review" | "reflection";
  lessonId: string | null;
  skillId: string | null;
  dueAt: Date | null;
  position?: number;
  status?: "pending";
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function getTodaySignals(userId: number, now = new Date()) {
  const db = await requireDb();
  const reviewPredicate = and(
    eq(reviewItems.userId, userId),
    eq(reviewItems.status, "active"),
    lte(reviewItems.dueAt, now),
    or(isNull(reviewItems.snoozedUntil), lte(reviewItems.snoozedUntil, now)),
  );

  const [reviewCountRows, nextReviewRows, nextPlanTaskRows] = await Promise.all([
    db.select({ value: count() }).from(reviewItems).where(reviewPredicate),
    db
      .select({
        id: reviewItems.id,
        questionId: reviewItems.questionId,
        stage: reviewItems.stage,
        status: reviewItems.status,
        dueAt: reviewItems.dueAt,
        snoozedUntil: reviewItems.snoozedUntil,
        lastAttemptId: reviewItems.lastAttemptId,
        reason: reviewItems.reason,
        createdAt: reviewItems.createdAt,
        updatedAt: reviewItems.updatedAt,
      })
      .from(reviewItems)
      .where(reviewPredicate)
      .orderBy(asc(reviewItems.dueAt), asc(reviewItems.id))
      .limit(1),
    db
      .select({
        id: studyPlanTasks.id,
        planId: studyPlanTasks.planId,
        title: studyPlanTasks.title,
        itemType: studyPlanTasks.itemType,
        lessonId: studyPlanTasks.lessonId,
        skillId: studyPlanTasks.skillId,
        dueAt: studyPlanTasks.dueAt,
        position: studyPlanTasks.position,
        status: studyPlanTasks.status,
        completedAt: studyPlanTasks.completedAt,
        createdAt: studyPlanTasks.createdAt,
        updatedAt: studyPlanTasks.updatedAt,
      })
      .from(studyPlanTasks)
      .innerJoin(studyPlans, eq(studyPlanTasks.planId, studyPlans.id))
      .where(and(
        eq(studyPlanTasks.userId, userId),
        eq(studyPlanTasks.status, "pending"),
        eq(studyPlans.userId, userId),
        eq(studyPlans.status, "active"),
      ))
      .orderBy(asc(studyPlanTasks.dueAt), asc(studyPlanTasks.position), asc(studyPlanTasks.id))
      .limit(1),
  ]);

  const reviewCount = Number(reviewCountRows[0]?.value ?? 0);
  const nextReview = nextReviewRows[0];

  return {
    dueReview: reviewCount > 0 && nextReview
      ? { ...nextReview, count: reviewCount, nextDueAt: nextReview.dueAt, status: "active" as const }
      : null,
    activePlanTask: nextPlanTaskRows[0]
      ? { ...nextPlanTaskRows[0], status: "pending" as const }
      : null,
  };
}
