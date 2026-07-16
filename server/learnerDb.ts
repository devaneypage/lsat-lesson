import { and, asc, eq, inArray } from "drizzle-orm";
import {
  curriculumSkills,
  learnerPreferences,
  learnerProfiles,
  lessonProgress,
  type LearnerPreference,
  type LearnerProfile,
  type LessonProgress,
} from "../drizzle/schema";
import {
  CURRICULUM_LESSONS,
  CURRICULUM_SKILLS,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferences,
  type CurriculumLesson,
  type LessonProgressStatus,
} from "../shared/learnerDomain";
import { getDb } from "./db";
import { getTodaySignals, type TodayPlanTaskSignal, type TodayReviewSignal } from "./repositories/today";

export type LegacyProgressInput = {
  lessonId: string;
  status: LessonProgressStatus;
  step?: number;
  percentComplete?: number;
  lastAccessedAt?: Date;
  completedAt?: Date | null;
};

function clampInteger(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export async function seedCurriculumRegistry() {
  const db = await requireDb();

  for (const skill of CURRICULUM_SKILLS) {
    await db
      .insert(curriculumSkills)
      .values({
        skillId: skill.id,
        title: skill.title,
        section: skill.section,
        description: skill.description,
        prerequisites: skill.prerequisites,
        registryVersion: 1,
      })
      .onDuplicateKeyUpdate({
        set: {
          title: skill.title,
          section: skill.section,
          description: skill.description,
          prerequisites: skill.prerequisites,
          registryVersion: 1,
        },
      });
  }
}

export async function ensureLearnerState(
  userId: number,
  timezone = "UTC",
): Promise<{ profile: LearnerProfile; preferences: LearnerPreference }> {
  const db = await requireDb();
  const normalizedTimezone = timezone.trim().slice(0, 64) || "UTC";

  await db
    .insert(learnerProfiles)
    .values({ userId, timezone: normalizedTimezone, weeklyStudyMinutes: 300 })
    .onDuplicateKeyUpdate({ set: { userId } });

  await db
    .insert(learnerPreferences)
    .values({ userId, ...DEFAULT_ACCESSIBILITY_PREFERENCES })
    .onDuplicateKeyUpdate({ set: { userId } });

  const [profiles, preferences] = await Promise.all([
    db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, userId)).limit(1),
    db.select().from(learnerPreferences).where(eq(learnerPreferences.userId, userId)).limit(1),
  ]);

  if (!profiles[0] || !preferences[0]) {
    throw new Error("Unable to initialize learner state");
  }

  return { profile: profiles[0], preferences: preferences[0] };
}

export async function getLearnerProfile(userId: number) {
  const db = await requireDb();
  const rows = await db.select().from(learnerProfiles).where(eq(learnerProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function updateLearnerProfile(
  userId: number,
  input: { timezone?: string; targetTestDate?: Date | null; weeklyStudyMinutes?: number },
) {
  const db = await requireDb();
  await ensureLearnerState(userId, input.timezone);

  const update: Partial<typeof learnerProfiles.$inferInsert> = {};
  if (input.timezone !== undefined) update.timezone = input.timezone.trim().slice(0, 64) || "UTC";
  if (input.targetTestDate !== undefined) update.targetTestDate = input.targetTestDate;
  if (input.weeklyStudyMinutes !== undefined) {
    update.weeklyStudyMinutes = clampInteger(input.weeklyStudyMinutes, 30, 2_400);
  }

  if (Object.keys(update).length > 0) {
    await db.update(learnerProfiles).set(update).where(eq(learnerProfiles.userId, userId));
  }

  return getLearnerProfile(userId);
}

export async function getLearnerPreferences(userId: number) {
  const state = await ensureLearnerState(userId);
  return state.preferences;
}

export async function updateLearnerPreferences(
  userId: number,
  preferences: AccessibilityPreferences,
) {
  const db = await requireDb();
  await ensureLearnerState(userId);
  await db
    .update(learnerPreferences)
    .set(preferences)
    .where(eq(learnerPreferences.userId, userId));
  return getLearnerPreferences(userId);
}

export async function listLessonProgress(userId: number): Promise<LessonProgress[]> {
  const db = await requireDb();
  return db
    .select()
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId))
    .orderBy(asc(lessonProgress.lastAccessedAt));
}

type ContinueLearningProgress = Pick<
  LessonProgress,
  "lessonId" | "status" | "step" | "percentComplete" | "lastAccessedAt" | "completedAt"
>;

type ContinueLearningActionKind = "due_review" | "resume" | "plan" | "start" | "lesson_review";

type TodaySignals = {
  dueReview: TodayReviewSignal | null;
  activePlanTask: TodayPlanTaskSignal | null;
};

const EMPTY_TODAY_SIGNALS: TodaySignals = {
  dueReview: null,
  activePlanTask: null,
};

function planTaskRoute(task: TodayPlanTaskSignal, lessons: CurriculumLesson[]) {
  if (task.itemType === "lesson" && task.lessonId) {
    return lessons.find(lesson => lesson.id === task.lessonId)?.route ?? "/learn";
  }
  if (task.itemType === "review") return "/review";
  if (task.itemType === "practice") return "/practice";
  return "/plan";
}

function timestamp(value: Date | null | undefined) {
  return value?.getTime() ?? 0;
}

function lessonSequence(lessonId: string, lessons: CurriculumLesson[]) {
  return lessons.find(item => item.id === lessonId)?.sequence ?? Number.MAX_SAFE_INTEGER;
}

export function buildContinueLearning(
  progress: ContinueLearningProgress[],
  lessons: CurriculumLesson[] = CURRICULUM_LESSONS,
  signals: TodaySignals = EMPTY_TODAY_SIGNALS,
) {
  const orderedLessons = [...lessons].sort((a, b) => a.sequence - b.sequence);
  const progressByLesson = new Map(progress.map(item => [item.lessonId, item]));
  const inProgress = progress
    .filter(item => item.status === "in_progress")
    .sort((a, b) => timestamp(b.lastAccessedAt) - timestamp(a.lastAccessedAt) ||
      lessonSequence(a.lessonId, orderedLessons) - lessonSequence(b.lessonId, orderedLessons));
  const unstarted = orderedLessons.filter(lesson => {
    const item = progressByLesson.get(lesson.id);
    return !item || item.status === "not_started";
  });
  const completed = progress
    .filter(item => item.status === "completed")
    .sort((a, b) => timestamp(b.completedAt ?? b.lastAccessedAt) - timestamp(a.completedAt ?? a.lastAccessedAt) ||
      lessonSequence(a.lessonId, orderedLessons) - lessonSequence(b.lessonId, orderedLessons));

  const selected = inProgress[0] ?? (unstarted[0]
    ? { lessonId: unstarted[0].id, status: "not_started" as const, step: 0, percentComplete: 0, lastAccessedAt: null, completedAt: null }
    : completed[0]);
  const selectedLesson = selected
    ? orderedLessons.find(lesson => lesson.id === selected.lessonId) ?? null
    : null;

  const lessonAction = selectedLesson && selected
    ? {
        kind: (inProgress[0] ? "resume" : unstarted[0] ? "start" : "lesson_review") as ContinueLearningActionKind,
        label: inProgress[0] ? "Resume lesson" : unstarted[0] ? "Start lesson" : "Review lesson",
        title: selectedLesson.title,
        description: selectedLesson.description,
        route: selectedLesson.route,
        lesson: selectedLesson,
        progress: {
          step: selected.step ?? 0,
          percentComplete: selected.percentComplete ?? 0,
          lastAccessedAt: selected.lastAccessedAt ?? null,
        },
      }
    : null;

  const primaryAction = signals.dueReview
    ? {
        kind: "due_review" as const,
        label: signals.dueReview.count === 1 ? "Review 1 due question" : `Review ${signals.dueReview.count} due questions`,
        title: "Strengthen what is due today",
        description: signals.dueReview.reason,
        route: "/review",
        dueCount: signals.dueReview.count,
        progress: null,
      }
    : inProgress[0] && lessonAction
      ? lessonAction
      : signals.activePlanTask
        ? {
            kind: "plan" as const,
            label: "Begin plan task",
            title: signals.activePlanTask.title,
            description: "This is the next pending task in your active study plan.",
            route: planTaskRoute(signals.activePlanTask, orderedLessons),
            task: signals.activePlanTask,
            progress: null,
          }
        : lessonAction;
  const completedCount = orderedLessons.filter(
    lesson => progressByLesson.get(lesson.id)?.status === "completed",
  ).length;

  return {
    state: progress.length === 0 && !signals.dueReview && !signals.activePlanTask
      ? "empty" as const
      : completedCount === orderedLessons.length && !signals.dueReview && !signals.activePlanTask
        ? "completed" as const
        : "active" as const,
    summary: {
      totalLessons: orderedLessons.length,
      completedLessons: completedCount,
      inProgressLessons: inProgress.length,
      remainingLessons: orderedLessons.length - completedCount,
      percentComplete: orderedLessons.length === 0
        ? 0
        : Math.round((completedCount / orderedLessons.length) * 100),
      dueReviewCount: signals.dueReview?.count ?? 0,
      hasActivePlanTask: Boolean(signals.activePlanTask),
    },
    primaryAction,
    recentLessons: [...progress]
      .filter(item => orderedLessons.some(lesson => lesson.id === item.lessonId))
      .sort((a, b) => timestamp(b.lastAccessedAt) - timestamp(a.lastAccessedAt))
      .slice(0, 3)
      .map(item => ({
        lesson: orderedLessons.find(lesson => lesson.id === item.lessonId)!,
        status: item.status,
        percentComplete: item.percentComplete,
        lastAccessedAt: item.lastAccessedAt,
      })),
  };
}

export async function getContinueLearning(userId: number) {
  const [progress, signals] = await Promise.all([
    listLessonProgress(userId),
    getTodaySignals(userId),
  ]);
  return buildContinueLearning(progress, CURRICULUM_LESSONS, signals);
}

export async function upsertLessonProgress(
  userId: number,
  input: LegacyProgressInput & { source?: "server" | "legacy_import" },
) {
  const lesson = CURRICULUM_LESSONS.find(item => item.id === input.lessonId);
  if (!lesson) throw new Error("Unknown lesson ID");

  const db = await requireDb();
  const percentComplete = clampInteger(
    input.status === "completed" ? 100 : (input.percentComplete ?? 0),
    0,
    100,
  );
  const values = {
    userId,
    lessonId: input.lessonId,
    status: input.status,
    step: clampInteger(input.step ?? 0, 0, 100),
    percentComplete,
    source: input.source ?? "server",
    lastAccessedAt: input.lastAccessedAt ?? new Date(),
    completedAt: input.status === "completed" ? (input.completedAt ?? new Date()) : null,
  } as const;

  await db
    .insert(lessonProgress)
    .values(values)
    .onDuplicateKeyUpdate({
      set: {
        status: values.status,
        step: values.step,
        percentComplete: values.percentComplete,
        source: values.source,
        lastAccessedAt: values.lastAccessedAt,
        completedAt: values.completedAt,
      },
    });

  const rows = await db
    .select()
    .from(lessonProgress)
    .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, input.lessonId)))
    .limit(1);
  return rows[0] ?? null;
}

export function planLegacyProgressImport(
  items: LegacyProgressInput[],
  existingLessonIds: Iterable<string>,
) {
  const canonicalIds = new Set(CURRICULUM_LESSONS.map(lesson => lesson.id));
  const existingIds = new Set(existingLessonIds);
  const deduplicated = new Map<string, LegacyProgressInput>();

  for (const item of items) {
    if (canonicalIds.has(item.lessonId)) deduplicated.set(item.lessonId, item);
  }

  const toImport = Array.from(deduplicated.values()).filter(
    item => !existingIds.has(item.lessonId),
  );

  return {
    toImport,
    imported: toImport.length,
    skipped: deduplicated.size - toImport.length,
    ignored: items.length - deduplicated.size,
  };
}

/**
 * Imports only lesson IDs that have no durable server row. Existing records are
 * never updated, making repeated imports idempotent and non-destructive.
 */
export async function importLegacyLessonProgress(userId: number, items: LegacyProgressInput[]) {
  const db = await requireDb();
  const candidateIds = Array.from(new Set(items.map(item => item.lessonId)));
  const existing = candidateIds.length === 0
    ? []
    : await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, candidateIds)));
  const plan = planLegacyProgressImport(items, existing.map(row => row.lessonId));

  for (const item of plan.toImport) {
    await upsertLessonProgress(userId, { ...item, source: "legacy_import" });
  }

  return {
    imported: plan.imported,
    skipped: plan.skipped,
    ignored: plan.ignored,
  };
}
