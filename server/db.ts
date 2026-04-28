import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, questions, InsertQuestion, importHistory, InsertImportHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Insert multiple questions into the database
 */
export async function insertQuestions(questionsData: InsertQuestion[]): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(questions).values(questionsData);
    return questionsData.length;
  } catch (error) {
    console.error("[Database] Failed to insert questions:", error);
    throw error;
  }
}

/**
 * Get all questions with optional filtering
 */
export async function getQuestions(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get questions: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(questions)
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get questions:", error);
    return [];
  }
}

/**
 * Get total question count
 */
export async function getQuestionCount(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot count questions: database not available");
    return 0;
  }

  try {
    const result = await db.select().from(questions);
    return result.length;
  } catch (error) {
    console.error("[Database] Failed to count questions:", error);
    return 0;
  }
}

/**
 * Create import history record
 */
export async function createImportHistory(data: InsertImportHistory): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(importHistory).values(data);
  } catch (error) {
    console.error("[Database] Failed to create import history:", error);
    throw error;
  }
}

/**
 * Get import history
 */
export async function getImportHistory(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get import history: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(importHistory)
      .limit(limit)
      .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get import history:", error);
    return [];
  }
}

import { and } from "drizzle-orm";
import { Tag, InsertTag, InsertQuestionTag, tags, questionTags } from "../drizzle/schema";

/**
 * Create a new tag
 */
export async function createTag(data: InsertTag): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(tags).values(data);
    // MySQL returns insertId in the result object
    const insertId = (result as any)?.insertId || (result as any)?.[0]?.insertId || 0;
    if (insertId === 0) {
      throw new Error("Failed to get insert ID from tag creation");
    }
    return insertId;
  } catch (error) {
    console.error("[Database] Failed to create tag:", error);
    throw error;
  }
}

/**
 * Get all tags
 */
export async function getTags() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tags: database not available");
    return [];
  }

  try {
    const result = await db.select().from(tags);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get tags:", error);
    return [];
  }
}

/**
 * Get tags for a specific question
 */
export async function getQuestionTags(questionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get question tags: database not available");
    return [];
  }

  try {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        type: tags.type,
        description: tags.description,
        color: tags.color,
      })
      .from(questionTags)
      .innerJoin(tags, eq(questionTags.tagId, tags.id))
      .where(eq(questionTags.questionId, questionId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to get question tags:", error);
    return [];
  }
}

/**
 * Add a tag to a question
 */
export async function addTagToQuestion(questionId: number, tagId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(questionTags).values({ questionId, tagId });
  } catch (error) {
    console.error("[Database] Failed to add tag to question:", error);
    throw error;
  }
}

/**
 * Remove a tag from a question
 */
export async function removeTagFromQuestion(questionId: number, tagId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db
      .delete(questionTags)
      .where(and(eq(questionTags.questionId, questionId), eq(questionTags.tagId, tagId)));
  } catch (error) {
    console.error("[Database] Failed to remove tag from question:", error);
    throw error;
  }
}

/**
 * Get questions by tag
 */
export async function getQuestionsByTag(tagId: number, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get questions by tag: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(questions)
      .innerJoin(questionTags, eq(questions.id, questionTags.questionId))
      .where(eq(questionTags.tagId, tagId))
      .limit(limit)
      .offset(offset);
    return result.map((r) => r.questions);
  } catch (error) {
    console.error("[Database] Failed to get questions by tag:", error);
    return [];
  }
}
