import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  category: varchar("category", { length: 64 }),
  difficulty: varchar("difficulty", { length: 20 }),
  source: varchar("source", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

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
