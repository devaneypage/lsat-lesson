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
  nextDueAt: Date;
  reason: string;
};

export type TodayPlanTaskSignal = {
  id: number;
  title: string;
  itemType: "lesson" | "practice" | "review" | "reflection";
  lessonId: string | null;
  skillId: string | null;
  dueAt: Date | null;
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
      .select({ dueAt: reviewItems.dueAt, reason: reviewItems.reason })
      .from(reviewItems)
      .where(reviewPredicate)
      .orderBy(asc(reviewItems.dueAt), asc(reviewItems.id))
      .limit(1),
    db
      .select({
        id: studyPlanTasks.id,
        title: studyPlanTasks.title,
        itemType: studyPlanTasks.itemType,
        lessonId: studyPlanTasks.lessonId,
        skillId: studyPlanTasks.skillId,
        dueAt: studyPlanTasks.dueAt,
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
      ? { count: reviewCount, nextDueAt: nextReview.dueAt, reason: nextReview.reason }
      : null,
    activePlanTask: nextPlanTaskRows[0] ?? null,
  };
}
