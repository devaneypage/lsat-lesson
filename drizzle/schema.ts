import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here
/**
 * Lookup table for question categories
 */
export const questionCategories = mysqlTable("questionCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export type QuestionCategory = typeof questionCategories.$inferSelect;
export type InsertQuestionCategory = typeof questionCategories.$inferInsert;

/**
 * Lookup table for question difficulties
 */
export const questionDifficulties = mysqlTable("questionDifficulties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export type QuestionDifficulty = typeof questionDifficulties.$inferSelect;
export type InsertQuestionDifficulty = typeof questionDifficulties.$inferInsert;

/**
 * Lookup table for question sources
 */
export const questionSources = mysqlTable("questionSources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export type QuestionSource = typeof questionSources.$inferSelect;
export type InsertQuestionSource = typeof questionSources.$inferInsert;

/**
 * Questions table for storing LSAT practice questions
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  questionId: varchar("questionId", { length: 64 }).notNull().unique(),
  questionText: text("questionText").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  optionE: text("optionE"),
  correctAnswer: varchar("correctAnswer", { length: 1 }).notNull(),
  explanation: text("explanation").notNull(),
  categoryId: int("categoryId").references(() => questionCategories.id),
  difficultyId: int("difficultyId").references(() => questionDifficulties.id),
  sourceId: int("sourceId").references(() => questionSources.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => {
  return {
    categoryIdIdx: index("questions_categoryId_idx").on(table.categoryId),
    difficultyIdIdx: index("questions_difficultyId_idx").on(table.difficultyId),
    sourceIdIdx: index("questions_sourceId_idx").on(table.sourceId),
  };
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * Administrator-authored original questions remain isolated from the learner
 * Question Bank until they have passed an explicit review and publication step.
 */
export const questionSubmissions = mysqlTable("questionSubmissions", {
  id: int("id").autoincrement().primaryKey(),
  submissionKey: varchar("submissionKey", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "submitted", "needs_revision", "approved", "rejected", "published"]).default("draft").notNull(),
  internalTitle: varchar("internalTitle", { length: 180 }).notNull(),
  questionText: text("questionText").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  optionE: text("optionE"),
  correctAnswer: varchar("correctAnswer", { length: 1 }).notNull(),
  explanation: text("explanation").notNull(),
  category: varchar("category", { length: 128 }).notNull(),
  difficulty: varchar("difficulty", { length: 64 }).notNull(),
  source: varchar("source", { length: 256 }).notNull(),
  lessonId: varchar("lessonId", { length: 64 }),
  module: varchar("module", { length: 32 }),
  topic: varchar("topic", { length: 128 }),
  rightsConfirmed: int("rightsConfirmed").default(0).notNull(),
  authorNotes: text("authorNotes"),
  reviewNotes: text("reviewNotes"),
  authorId: int("authorId").notNull().references(() => users.id),
  assignedReviewerId: int("assignedReviewerId").references(() => users.id),
  reviewerId: int("reviewerId").references(() => users.id),
  editorialDueAt: timestamp("editorialDueAt"),
  submittedAt: timestamp("submittedAt"),
  reviewedAt: timestamp("reviewedAt"),
  publishedQuestionId: int("publishedQuestionId").references(() => questions.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("questionSubmissions_status_idx").on(table.status),
  index("questionSubmissions_author_idx").on(table.authorId, table.status),
  index("questionSubmissions_lesson_idx").on(table.lessonId),
  index("questionSubmissions_assignedReviewer_idx").on(table.assignedReviewerId, table.status),
  index("questionSubmissions_reviewer_idx").on(table.reviewerId),
  index("questionSubmissions_due_idx").on(table.editorialDueAt),
  index("questionSubmissions_publishedQuestion_idx").on(table.publishedQuestionId),
]);

export type QuestionSubmission = typeof questionSubmissions.$inferSelect;
export type InsertQuestionSubmission = typeof questionSubmissions.$inferInsert;

/** Skill mappings selected during authoring, copied to question evidence at publication. */
export const questionSubmissionSkills = mysqlTable("questionSubmissionSkills", {
  id: int("id").autoincrement().primaryKey(),
  submissionId: int("submissionId").notNull().references(() => questionSubmissions.id),
  skillId: varchar("skillId", { length: 64 }).notNull(),
  weight: int("weight").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  uniqueIndex("questionSubmissionSkills_submission_skill_unique").on(table.submissionId, table.skillId),
  index("questionSubmissionSkills_skill_idx").on(table.skillId),
]);

export type QuestionSubmissionSkill = typeof questionSubmissionSkills.$inferSelect;
export type InsertQuestionSubmissionSkill = typeof questionSubmissionSkills.$inferInsert;

/** Learner-visible practice taxonomy used for curriculum filtering and coverage reporting. */
export const questionCurriculumMappings = mysqlTable("questionCurriculumMappings", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull().references(() => questions.id),
  lessonId: varchar("lessonId", { length: 64 }).notNull(),
  module: varchar("module", { length: 32 }).notNull(),
  topic: varchar("topic", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  uniqueIndex("questionCurriculumMappings_question_lesson_unique").on(table.questionId, table.lessonId),
  index("questionCurriculumMappings_lesson_idx").on(table.lessonId),
  index("questionCurriculumMappings_module_topic_idx").on(table.module, table.topic),
]);

export type QuestionCurriculumMapping = typeof questionCurriculumMappings.$inferSelect;
export type InsertQuestionCurriculumMapping = typeof questionCurriculumMappings.$inferInsert;

/**
 * Import history table for tracking CSV imports
 */
export const importHistory = mysqlTable("importHistory", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  importedBy: int("importedBy").notNull(),
  rowCount: int("rowCount").notNull(),
  successCount: int("successCount").notNull().default(0),
  errorCount: int("errorCount").notNull().default(0),
  status: mysqlEnum("status", ["pending", "processing", "success", "error"])
    .default("pending")
    .notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImportHistory = typeof importHistory.$inferSelect;
export type InsertImportHistory = typeof importHistory.$inferInsert;

/**
 * Tags table for organizing questions by topic and learning objectives
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  type: mysqlEnum("type", ["topic", "objective", "section", "custom"])
    .default("topic")
    .notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }), // Hex color code
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Junction table for many-to-many relationship between questions and tags
 */
export const questionTags = mysqlTable("questionTags", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuestionTag = typeof questionTags.$inferSelect;
export type InsertQuestionTag = typeof questionTags.$inferInsert;

/**
 * Feature flags table — owner-controlled toggles for gradual rollouts,
 * kill switches, and A/B testing without redeployment.
 */
export const featureFlags = mysqlTable("featureFlags", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique snake_case key used in code: e.g. 'lesson_progress_bar' */
  key: varchar("key", { length: 128 }).notNull().unique(),
  /** Human-readable name shown in the admin panel */
  name: varchar("name", { length: 255 }).notNull(),
  /** What this flag controls */
  description: text("description"),
  /** Whether the flag is currently enabled */
  enabled: int("enabled").default(0).notNull(), // 0=off, 1=on (MySQL has no boolean)
  /** Optional: percentage rollout 0-100 (0 = off, 100 = full rollout) */
  rolloutPercentage: int("rolloutPercentage").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * Error-log entries for the LSAT Nexus "Review & Analytics" section.
 * Each row is a single logged mistake belonging to one user, used to power
 * the error log table, mastery score, and trend analytics.
 */
export const errorLogEntries = mysqlTable("errorLogEntries", {
  id: int("id").autoincrement().primaryKey(),
  /** Owning user (users.id). */
  userId: int("userId").notNull(),
  /** Top-level section, e.g. "Logical Reasoning". */
  category: varchar("category", { length: 64 }).notNull(),
  /** Question type, e.g. "Weaken" or "Main Point". */
  questionType: varchar("questionType", { length: 64 }).notNull(),
  /** Why it was missed, e.g. the answer-trap or flaw that fooled you. */
  errorReason: varchar("errorReason", { length: 128 }),
  /** Free-form notes / takeaway in the student's own words. */
  notes: text("notes"),
  /** Optional source reference, e.g. "PT 73 · S2 · Q14". */
  source: varchar("source", { length: 255 }),
  /** Confidence the student now has on this concept, 1–5. */
  confidence: int("confidence").notNull().default(1),
  /** 1 once the student has re-reviewed and resolved the error, else 0. */
  resolved: int("resolved").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ErrorLogEntry = typeof errorLogEntries.$inferSelect;
export type InsertErrorLogEntry = typeof errorLogEntries.$inferInsert;
/** Durable learner profile data used for study recommendations. */
export const learnerProfiles = mysqlTable("learnerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
  targetTestDate: timestamp("targetTestDate"),
  weeklyStudyMinutes: int("weeklyStudyMinutes").default(300).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("learnerProfiles_userId_unique").on(table.userId)]);

/** Reading and interaction preferences. */
export const learnerPreferences = mysqlTable("learnerPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  textScale: mysqlEnum("textScale", ["default", "large", "extra_large"]).default("default").notNull(),
  readingWidth: mysqlEnum("readingWidth", ["comfortable", "wide", "full"]).default("comfortable").notNull(),
  contrast: mysqlEnum("contrast", ["default", "high"]).default("default").notNull(),
  motion: mysqlEnum("motion", ["system", "reduced"]).default("system").notNull(),
  passageFocus: mysqlEnum("passageFocus", ["off", "on"]).default("off").notNull(),
  keyboardShortcuts: mysqlEnum("keyboardShortcuts", ["off", "on"]).default("on").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("learnerPreferences_userId_unique").on(table.userId)]);

/** Canonical curriculum skill registry persisted for reporting and mappings. */
export const curriculumSkills = mysqlTable("curriculumSkills", {
  id: int("id").autoincrement().primaryKey(),
  skillId: varchar("skillId", { length: 64 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  section: mysqlEnum("section", ["LR", "RC", "Logic", "Strategy"]).notNull(),
  description: text("description").notNull(),
  prerequisites: json("prerequisites").$type<string[]>().notNull(),
  registryVersion: int("registryVersion").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("curriculumSkills_skillId_unique").on(table.skillId)]);

/** Explicit question-to-skill evidence mapping. */
export const questionSkills = mysqlTable("questionSkills", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  skillId: varchar("skillId", { length: 64 }).notNull(),
  weight: int("weight").default(100).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  uniqueIndex("questionSkills_question_skill_unique").on(table.questionId, table.skillId),
  index("questionSkills_skill_idx").on(table.skillId),
]);

/** Server-authoritative lesson progress. */
export const lessonProgress = mysqlTable("lessonProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  lessonId: varchar("lessonId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  step: int("step").default(0).notNull(),
  percentComplete: int("percentComplete").default(0).notNull(),
  source: mysqlEnum("source", ["server", "legacy_import"]).default("server").notNull(),
  lastAccessedAt: timestamp("lastAccessedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("lessonProgress_user_lesson_unique").on(table.userId, table.lessonId),
  index("lessonProgress_user_status_idx").on(table.userId, table.status),
]);

/** Immutable question evidence with idempotent submission keys. */
export const questionAttempts = mysqlTable("questionAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  idempotencyKey: varchar("idempotencyKey", { length: 64 }).notNull(),
  selectedAnswer: varchar("selectedAnswer", { length: 1 }).notNull(),
  isCorrect: int("isCorrect").notNull(),
  confidence: mysqlEnum("confidence", ["certain", "unsure", "guessed"]).notNull(),
  activeTimeMs: int("activeTimeMs").notNull(),
  context: mysqlEnum("context", ["practice", "review", "lesson", "diagnostic"]).default("practice").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  uniqueIndex("questionAttempts_user_idempotency_unique").on(table.userId, table.idempotencyKey),
  index("questionAttempts_user_submitted_idx").on(table.userId, table.submittedAt),
  index("questionAttempts_question_idx").on(table.questionId),
]);

/** One deterministic spaced-review state record per learner and question. */
export const reviewItems = mysqlTable("reviewItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  stage: int("stage").default(0).notNull(),
  status: mysqlEnum("status", ["active", "mastered", "snoozed", "archived"]).default("active").notNull(),
  dueAt: timestamp("dueAt").notNull(),
  snoozedUntil: timestamp("snoozedUntil"),
  lastAttemptId: int("lastAttemptId"),
  reason: varchar("reason", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("reviewItems_user_question_unique").on(table.userId, table.questionId),
  index("reviewItems_user_due_idx").on(table.userId, table.dueAt),
]);

/** Private learner reflections attached to question evidence. */
export const mistakeJournalEntries = mysqlTable("mistakeJournalEntries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: int("questionId").notNull(),
  attemptId: int("attemptId"),
  category: mysqlEnum("category", ["misread_stem", "missed_conclusion", "conditional_logic", "causal_reasoning", "scope_shift", "quantifier_error", "unsupported_inference", "attractive_distractor", "timing_pressure", "other"]).notNull(),
  temptingAnswer: varchar("temptingAnswer", { length: 1 }),
  missedClue: text("missedClue"),
  correctiveRule: text("correctiveRule"),
  privateNotes: text("privateNotes"),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("mistakeJournal_user_created_idx").on(table.userId, table.createdAt),
  index("mistakeJournal_user_question_idx").on(table.userId, table.questionId),
]);

/** Explainable, versioned mastery snapshots derived from attempts. */
export const skillMasterySnapshots = mysqlTable("skillMasterySnapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  skillId: varchar("skillId", { length: 64 }).notNull(),
  score: int("score").notNull(),
  evidenceCount: int("evidenceCount").notNull(),
  confidence: mysqlEnum("confidence", ["insufficient", "emerging", "developing", "established"]).notNull(),
  formulaVersion: int("formulaVersion").default(1).notNull(),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
}, table => [
  uniqueIndex("skillMastery_user_skill_version_unique").on(table.userId, table.skillId, table.formulaVersion),
  index("skillMastery_user_score_idx").on(table.userId, table.score),
]);

/** Versioned plans; only one active plan is enforced transactionally per learner. */
export const studyPlans = mysqlTable("studyPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  version: int("version").default(1).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  targetTestDate: timestamp("targetTestDate"),
  weeklyStudyMinutes: int("weeklyStudyMinutes").notNull(),
  rationale: text("rationale"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("studyPlans_user_status_idx").on(table.userId, table.status),
  uniqueIndex("studyPlans_user_version_unique").on(table.userId, table.version),
]);

export const studyPlanTasks = mysqlTable("studyPlanTasks", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  itemType: mysqlEnum("itemType", ["lesson", "practice", "review", "reflection"]).notNull(),
  lessonId: varchar("lessonId", { length: 64 }),
  skillId: varchar("skillId", { length: 64 }),
  dueAt: timestamp("dueAt"),
  position: int("position").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "skipped"]).default("pending").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("studyPlanTasks_plan_position_idx").on(table.planId, table.position),
  index("studyPlanTasks_user_status_due_idx").on(table.userId, table.status, table.dueAt),
]);

/** Privacy-safe product analytics events. */
export const productEvents = mysqlTable("productEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  anonymousId: varchar("anonymousId", { length: 64 }),
  eventName: varchar("eventName", { length: 64 }).notNull(),
  route: varchar("route", { length: 255 }),
  metadata: json("metadata").$type<Record<string, string>>().notNull(),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
});

export type ProductEvent = typeof productEvents.$inferSelect;
export type InsertProductEvent = typeof productEvents.$inferInsert;
