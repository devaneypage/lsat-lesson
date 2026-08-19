import { and, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  questions,
  InsertQuestion,
  importHistory,
  InsertImportHistory,
  InsertTag,
  tags,
  questionTags,
  questionCategories,
  questionDifficulties,
  questionSources,
  questionSkills,
  questionCurriculumMappings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import {
  SAMPLE_LOGICAL_REASONING_QUESTIONS,
  SAMPLE_LOGICAL_REASONING_SOURCE,
  validateSampleLogicalReasoningQuestions,
} from "./sampleData/logicalReasoning";
import { assertCurriculumPracticeLibraryProvenance, CURRICULUM_PRACTICE_LIBRARY, CURRICULUM_PRACTICE_LIBRARY_SOURCE } from "./sampleData/curriculumPracticeLibrary";
import { seedCurriculumRegistry } from "./learnerDb";

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
      values.role = "admin";
      updateSet.role = "admin";
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
 * Idempotently seeds five original LSAT-style Logical Reasoning items for a
 * fresh Question Bank. Existing questions are never modified or duplicated.
 */
export async function seedOriginalLogicalReasoningSamples(): Promise<{ inserted: number; total: number }> {
  validateSampleLogicalReasoningQuestions();

  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const categoryNames = [...new Set(SAMPLE_LOGICAL_REASONING_QUESTIONS.map((question) => question.category))];
  const difficultyNames = [...new Set(SAMPLE_LOGICAL_REASONING_QUESTIONS.map((question) => question.difficulty))];

  await db
    .insert(questionCategories)
    .values(categoryNames.map((name) => ({ name })))
    .onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });
  await db
    .insert(questionDifficulties)
    .values(difficultyNames.map((name) => ({ name })))
    .onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });
  await db
    .insert(questionSources)
    .values({ name: SAMPLE_LOGICAL_REASONING_SOURCE })
    .onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });

  const [categoryRows, difficultyRows, sourceRows, existingRows] = await Promise.all([
    db.select().from(questionCategories).where(inArray(questionCategories.name, categoryNames)),
    db.select().from(questionDifficulties).where(inArray(questionDifficulties.name, difficultyNames)),
    db.select().from(questionSources).where(eq(questionSources.name, SAMPLE_LOGICAL_REASONING_SOURCE)).limit(1),
    db
      .select({ questionId: questions.questionId })
      .from(questions)
      .where(inArray(questions.questionId, SAMPLE_LOGICAL_REASONING_QUESTIONS.map((question) => question.questionId))),
  ]);

  const categoryByName = new Map(categoryRows.map((category) => [category.name, category.id]));
  const difficultyByName = new Map(difficultyRows.map((difficulty) => [difficulty.name, difficulty.id]));
  const sourceId = sourceRows[0]?.id;
  if (!sourceId) {
    throw new Error("Unable to resolve the Question Bank sample source.");
  }

  const existingQuestionIds = new Set(existingRows.map((question) => question.questionId));
  const missingQuestions = SAMPLE_LOGICAL_REASONING_QUESTIONS
    .filter((question) => !existingQuestionIds.has(question.questionId))
    .map((question) => ({
      questionId: question.questionId,
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      optionE: question.optionE,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      categoryId: categoryByName.get(question.category) ?? null,
      difficultyId: difficultyByName.get(question.difficulty) ?? null,
      sourceId,
    }));

  if (missingQuestions.length > 0) {
    await db.insert(questions).values(missingQuestions);
  }

  return { inserted: missingQuestions.length, total: SAMPLE_LOGICAL_REASONING_QUESTIONS.length };
}

/**
 * Idempotently publishes the reviewed original curriculum library. Each record
 * receives canonical lesson, module, topic, and mastery-skill associations.
 */
export async function seedCurriculumPracticeLibrary(): Promise<{ inserted: number; total: number }> {
  assertCurriculumPracticeLibraryProvenance();
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await seedCurriculumRegistry();

  const categoryNames = [...new Set(CURRICULUM_PRACTICE_LIBRARY.map((question) => question.topic))];
  const difficultyNames = [...new Set(CURRICULUM_PRACTICE_LIBRARY.map((question) => question.difficulty))];
  await db.insert(questionCategories).values(categoryNames.map((name) => ({ name }))).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });
  await db.insert(questionDifficulties).values(difficultyNames.map((name) => ({ name }))).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });
  await db.insert(questionSources).values({ name: CURRICULUM_PRACTICE_LIBRARY_SOURCE }).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });

  const [categories, difficulties, sources, existing] = await Promise.all([
    db.select().from(questionCategories).where(inArray(questionCategories.name, categoryNames)),
    db.select().from(questionDifficulties).where(inArray(questionDifficulties.name, difficultyNames)),
    db.select().from(questionSources).where(eq(questionSources.name, CURRICULUM_PRACTICE_LIBRARY_SOURCE)).limit(1),
    db.select({ questionId: questions.questionId }).from(questions).where(inArray(questions.questionId, CURRICULUM_PRACTICE_LIBRARY.map((question) => question.questionId))),
  ]);
  const categoryByName = new Map(categories.map((category) => [category.name, category.id]));
  const difficultyByName = new Map(difficulties.map((difficulty) => [difficulty.name, difficulty.id]));
  const sourceId = sources[0]?.id;
  if (!sourceId) throw new Error("Unable to resolve the curriculum practice source.");

  const existingIds = new Set(existing.map((question) => question.questionId));
  const missing = CURRICULUM_PRACTICE_LIBRARY.filter((question) => !existingIds.has(question.questionId));
  if (missing.length) {
    await db.insert(questions).values(missing.map((question) => ({
      questionId: question.questionId,
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      optionE: question.optionE,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      categoryId: categoryByName.get(question.topic) ?? null,
      difficultyId: difficultyByName.get(question.difficulty) ?? null,
      sourceId,
    })));
  }

  const published = await db.select({ id: questions.id, questionId: questions.questionId }).from(questions).where(inArray(questions.questionId, CURRICULUM_PRACTICE_LIBRARY.map((question) => question.questionId)));
  const publishedByKey = new Map(published.map((question) => [question.questionId, question.id]));
  const skillRows = CURRICULUM_PRACTICE_LIBRARY.flatMap((question) => question.skillMappings.map((mapping) => ({ questionId: publishedByKey.get(question.questionId)!, skillId: mapping.skillId, weight: mapping.weight })));
  const curriculumRows = CURRICULUM_PRACTICE_LIBRARY.map((question) => ({ questionId: publishedByKey.get(question.questionId)!, lessonId: question.lessonId, module: question.module, topic: question.topic }));
  if (skillRows.some((row) => !row.questionId) || curriculumRows.some((row) => !row.questionId)) throw new Error("Unable to resolve every curriculum practice question after seeding.");
  await db.insert(questionSkills).values(skillRows).onDuplicateKeyUpdate({ set: { weight: sql`VALUES(weight)` } });
  await db.insert(questionCurriculumMappings).values(curriculumRows).onDuplicateKeyUpdate({ set: { module: sql`VALUES(module)`, topic: sql`VALUES(topic)` } });
  return { inserted: missing.length, total: CURRICULUM_PRACTICE_LIBRARY.length };
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
    const result = await db.select({
      id: questions.id,
      questionId: questions.questionId,
      questionText: questions.questionText,
      optionA: questions.optionA,
      optionB: questions.optionB,
      optionC: questions.optionC,
      optionD: questions.optionD,
      optionE: questions.optionE,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      categoryId: questions.categoryId,
      difficultyId: questions.difficultyId,
      sourceId: questions.sourceId,
      createdAt: questions.createdAt,
      updatedAt: questions.updatedAt,
      category: questionCategories.name,
      difficulty: questionDifficulties.name,
      source: questionSources.name,
    })
    .from(questions)
    .leftJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
    .leftJoin(questionDifficulties, eq(questions.difficultyId, questionDifficulties.id))
    .leftJoin(questionSources, eq(questions.sourceId, questionSources.id))
    .limit(limit)
    .offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get questions:", error);
    return [];
  }
}

/** Get learner-visible questions associated with a single canonical lesson. */
export async function getQuestionsByLesson(lessonId: string, limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: questions.id,
    questionId: questions.questionId,
    questionText: questions.questionText,
    optionA: questions.optionA,
    optionB: questions.optionB,
    optionC: questions.optionC,
    optionD: questions.optionD,
    optionE: questions.optionE,
    correctAnswer: questions.correctAnswer,
    explanation: questions.explanation,
    categoryId: questions.categoryId,
    difficultyId: questions.difficultyId,
    sourceId: questions.sourceId,
    createdAt: questions.createdAt,
    updatedAt: questions.updatedAt,
    category: questionCategories.name,
    difficulty: questionDifficulties.name,
    source: questionSources.name,
  })
    .from(questions)
    .innerJoin(questionCurriculumMappings, eq(questions.id, questionCurriculumMappings.questionId))
    .leftJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
    .leftJoin(questionDifficulties, eq(questions.difficultyId, questionDifficulties.id))
    .leftJoin(questionSources, eq(questions.sourceId, questionSources.id))
    .where(eq(questionCurriculumMappings.lessonId, lessonId))
    .limit(limit)
    .offset(offset);
}

export async function getQuestionCountByLesson(lessonId: string) {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ count: sql<number>`count(*)` }).from(questionCurriculumMappings).where(eq(questionCurriculumMappings.lessonId, lessonId));
  return Number(rows[0]?.count ?? 0);
}

export async function getCurriculumPracticeCoverage() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    lessonId: questionCurriculumMappings.lessonId,
    module: questionCurriculumMappings.module,
    topic: questionCurriculumMappings.topic,
    questionCount: sql<number>`count(${questionCurriculumMappings.questionId})`,
  }).from(questionCurriculumMappings).groupBy(questionCurriculumMappings.lessonId, questionCurriculumMappings.module, questionCurriculumMappings.topic).orderBy(questionCurriculumMappings.lessonId);
}

/**
 * Get total question count
 */
export async function getQuestionById(questionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get question: database not available");
    return null;
  }

  try {
    const result = await db.select({
      id: questions.id,
      questionId: questions.questionId,
      questionText: questions.questionText,
      optionA: questions.optionA,
      optionB: questions.optionB,
      optionC: questions.optionC,
      optionD: questions.optionD,
      optionE: questions.optionE,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      categoryId: questions.categoryId,
      difficultyId: questions.difficultyId,
      sourceId: questions.sourceId,
      createdAt: questions.createdAt,
      updatedAt: questions.updatedAt,
      category: questionCategories.name,
      difficulty: questionDifficulties.name,
      source: questionSources.name,
    })
    .from(questions)
    .leftJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
    .leftJoin(questionDifficulties, eq(questions.difficultyId, questionDifficulties.id))
    .leftJoin(questionSources, eq(questions.sourceId, questionSources.id))
    .where(eq(questions.id, questionId))
    .limit(1);
    return result[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to get question:", error);
    return null;
  }
}

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
    const result = await db.select().from(importHistory).limit(limit).offset(offset);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get import history:", error);
    return [];
  }
}

// ─── Tag Helpers ──────────────────────────────────────────────────────────────

/**
 * Create a new tag
 */
export async function createTag(data: InsertTag): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(tags).values(data);
    const insertId = (result as any)?.insertId || (result as any)?.[0]?.insertId || 0;
    if (insertId === 0) throw new Error("Failed to get insert ID from tag creation");
    return insertId;
  } catch (error) {
    console.error("[Database] Failed to create tag:", error);
    throw error;
  }
}

/**
 * Update a tag's name, type, color, or description
 */
export async function updateTag(
  tagId: number,
  data: { name?: string; type?: "topic" | "objective" | "section" | "custom"; description?: string; color?: string | null }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(tags).set(data).where(eq(tags.id, tagId));
  } catch (error) {
    console.error("[Database] Failed to update tag:", error);
    throw error;
  }
}

/**
 * Delete a tag and all its question associations
 */
export async function deleteTag(tagId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(questionTags).where(eq(questionTags.tagId, tagId));
    await db.delete(tags).where(eq(tags.id, tagId));
  } catch (error) {
    console.error("[Database] Failed to delete tag:", error);
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
 * Get all tags with their question counts
 */
export async function getTagsWithCounts() {
  const db = await getDb();
  if (!db) return [];
  try {
    const allTags = await db.select().from(tags);
    const counts = await db
      .select({ tagId: questionTags.tagId, count: sql<number>`count(*)` })
      .from(questionTags)
      .groupBy(questionTags.tagId);
    const countMap = new Map(counts.map((c) => [c.tagId, Number(c.count)]));
    return allTags.map((t) => ({ ...t, questionCount: countMap.get(t.id) ?? 0 }));
  } catch (error) {
    console.error("[Database] Failed to get tags with counts:", error);
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
  if (!db) throw new Error("Database not available");

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
  if (!db) throw new Error("Database not available");

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
 * Bulk add a tag to multiple questions (skips duplicates)
 */
export async function bulkAddTagToQuestions(questionIds: number[], tagId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    let added = 0;
    for (const questionId of questionIds) {
      try {
        await db.insert(questionTags).values({ questionId, tagId });
        added++;
      } catch {
        // skip duplicate key errors
      }
    }
    return added;
  } catch (error) {
    console.error("[Database] Failed to bulk add tag:", error);
    throw error;
  }
}

/**
 * Bulk remove a tag from multiple questions
 */
export async function bulkRemoveTagFromQuestions(
  questionIds: number[],
  tagId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    for (const questionId of questionIds) {
      await db
        .delete(questionTags)
        .where(and(eq(questionTags.questionId, questionId), eq(questionTags.tagId, tagId)));
    }
  } catch (error) {
    console.error("[Database] Failed to bulk remove tag:", error);
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

/**
 * Get all questions with their associated tags (for the tag manager view)
 */
export async function getQuestionsWithTags(limit = 200, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  try {
    const qs = await db.select().from(questions).limit(limit).offset(offset);
    if (qs.length === 0) return [];

    const questionIds = qs.map((q) => q.id);
    const tagAssignments = await db
      .select({
        questionId: questionTags.questionId,
        tagId: tags.id,
        tagName: tags.name,
        tagType: tags.type,
        tagColor: tags.color,
      })
      .from(questionTags)
      .innerJoin(tags, eq(questionTags.tagId, tags.id))
      .where(inArray(questionTags.questionId, questionIds));

    const tagsByQuestion = new Map<number, typeof tagAssignments>();
    for (const ta of tagAssignments) {
      if (!tagsByQuestion.has(ta.questionId)) tagsByQuestion.set(ta.questionId, []);
      tagsByQuestion.get(ta.questionId)!.push(ta);
    }

    const categoryNames = await db.select({ id: questionCategories.id, name: questionCategories.name }).from(questionCategories);
    const categoryMap = new Map(categoryNames.map(c => [c.id, c.name]));

    const difficultyNames = await db.select({ id: questionDifficulties.id, name: questionDifficulties.name }).from(questionDifficulties);
    const difficultyMap = new Map(difficultyNames.map(d => [d.id, d.name]));

    const sourceNames = await db.select({ id: questionSources.id, name: questionSources.name }).from(questionSources);
    const sourceMap = new Map(sourceNames.map(s => [s.id, s.name]));

    return qs.map((q) => ({
      ...q,
      category: q.categoryId ? categoryMap.get(q.categoryId) : null,
      difficulty: q.difficultyId ? difficultyMap.get(q.difficultyId) : null,
      source: q.sourceId ? sourceMap.get(q.sourceId) : null,
      tags: (tagsByQuestion.get(q.id) ?? []).map((t) => ({
        id: t.tagId,
        name: t.tagName,
        type: t.tagType,
        color: t.tagColor,
      })),
    }));
  } catch (error) {
    console.error("[Database] Failed to get questions with tags:", error);
    return [];
  }
}

/**
 * Get questions filtered by tag IDs (AND logic — must have all specified tags)
 * Also supports search and category filter
 */
export async function getQuestionsFilteredByTags(
  tagIds: number[],
  limit = 100,
  offset = 0,
  search?: string,
  category?: string
) {
  const db = await getDb();
  if (!db) return { questions: [], total: 0 };
  try {
    let allQs = await db.select().from(questions);

    if (category) {
      const categoryResult = await db.select({ id: questionCategories.id }).from(questionCategories).where(eq(questionCategories.name, category)).limit(1);
      if (categoryResult.length > 0) {
        allQs = allQs.filter((q) => q.categoryId === categoryResult[0].id);
      } else {
        return { questions: [], total: 0 };
      }
    }

    if (search) {
      const lower = search.toLowerCase();
      allQs = allQs.filter((q) => q.questionText.toLowerCase().includes(lower));
    }

    if (tagIds.length > 0) {
      const tagAssignments = await db
        .select({ questionId: questionTags.questionId, tagId: questionTags.tagId })
        .from(questionTags)
        .where(inArray(questionTags.tagId, tagIds));

      const questionTagMap = new Map<number, Set<number>>();
      for (const ta of tagAssignments) {
        if (!questionTagMap.has(ta.questionId)) questionTagMap.set(ta.questionId, new Set());
        questionTagMap.get(ta.questionId)!.add(ta.tagId);
      }

      allQs = allQs.filter((q) => {
        const qTags = questionTagMap.get(q.id);
        if (!qTags) return false;
        return tagIds.every((tid) => qTags.has(tid));
      });
    }

    const total = allQs.length;
    const paginated = allQs.slice(offset, offset + limit);
    return { questions: paginated, total };
  } catch (error) {
    console.error("[Database] Failed to filter questions by tags:", error);
    return { questions: [], total: 0 };
  }
}

// ─── Feature Flag Helpers ─────────────────────────────────────────────────────

import { featureFlags, InsertFeatureFlag, FeatureFlag } from "../drizzle/schema";

/** Default flags seeded on first access if the table is empty */
const DEFAULT_FLAGS: InsertFeatureFlag[] = [
  {
    key: "lesson_progress_bar",
    name: "Lesson Progress Bar",
    description: "Show a 'X of 7 lessons completed' progress bar at the top of the /lessons hub.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "assumption_family_arc_cta",
    name: "Assumption Family Arc CTA",
    description: "Show a direct 'Next: Flaw in the Reasoning →' button at the end of the Sufficient Assumptions lesson recap.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "about_testimonials",
    name: "About Page Testimonials",
    description: "Show the student testimonials section on the About page. Disable to swap in new quotes without a full deploy.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "ai_lesson_plan_generator",
    name: "AI Lesson Plan Generator",
    description: "Show the AI Lesson Plan Generator link in the main navigation bar.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "question_bank",
    name: "Question Bank",
    description: "Show the Question Bank link in the main navigation bar.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  // ── Nexus UX Flags ──────────────────────────────────────────────────────────
  {
    key: "nexus_dashboard",
    name: "Nexus Dashboard",
    description: "Enable the Nexus command-center dashboard (two-column layout with ScoreCard, MasteryOverview, ConceptMap). Disable to revert to the legacy PathSelector landing page.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "booking_cta",
    name: "Booking CTA",
    description: "Show the 'Book a Session' CTA button in the navigation bar and lesson recap sections.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "lesson_grid",
    name: "Lesson Grid",
    description: "Show the Nexus-style lesson grid on the /lessons page. Disable to revert to the legacy lesson card list.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "concept_map",
    name: "Concept Map",
    description: "Show the interactive concept map on the dashboard. Disable to show a simple lesson list instead.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "score_card",
    name: "Score Card",
    description: "Show the score card widget (current score + percentile) in the dashboard sidebar.",
    enabled: 1,
    rolloutPercentage: 100,
  },
  {
    key: "learner_dashboard_v2",
    name: "Continue Learning Dashboard",
    description: "Use server-derived learner state to recommend one primary next action and accurate supporting metrics.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "adaptive_review_queue",
    name: "Adaptive Review Queue",
    description: "Schedule and surface due question reviews with deterministic spaced intervals.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "question_confidence_tracking",
    name: "Question Confidence Tracking",
    description: "Require a pre-answer confidence judgment and persist calibrated attempt evidence.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "unified_command_search",
    name: "Unified Command Search",
    description: "Enable the keyboard-accessible global command palette across curriculum and question content.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "skill_mastery_map",
    name: "Skill Mastery Map",
    description: "Replace static progress displays with explainable evidence-based skill mastery.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "persistent_study_plans",
    name: "Persistent Study Plans",
    description: "Save, version, edit, activate, and complete structured study plans and tasks.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "mistake_journal",
    name: "Mistake Journal",
    description: "Let learners create private, taxonomy-based reflection records from question attempts.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "accessibility_controls",
    name: "Accessibility Controls",
    description: "Persist reading, contrast, motion, focus, and keyboard preferences across the application.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "contextual_orientation",
    name: "Contextual Orientation",
    description: "Show consistent breadcrumbs, purpose, prerequisites, estimates, status, and next actions.",
    enabled: 0,
    rolloutPercentage: 0,
  },
  {
    key: "feature_usage_analytics",
    name: "Feature Usage Analytics",
    description: "Capture allow-listed, privacy-safe product events and expose administrator-only aggregates.",
    enabled: 0,
    rolloutPercentage: 0,
  },
];

/**
 * Seed default flags if the table is empty, then return all flags.
 */
async function seedAndGetFlags(): Promise<FeatureFlag[]> {
  const db = await getDb();
  if (!db) return [];
  try {
    const existing = await db.select().from(featureFlags);
    const existingKeys = new Set(existing.map((f) => f.key));
    // Insert any DEFAULT_FLAGS that are missing from the table (handles new flags added after initial seed)
    for (const flag of DEFAULT_FLAGS) {
      if (!existingKeys.has(flag.key)) {
        try {
          await db.insert(featureFlags).values(flag);
        } catch {
          // skip if already exists (race condition)
        }
      }
    }
    return db.select().from(featureFlags);
  } catch (error) {
    console.error("[Database] Failed to seed/get flags:", error);
    return [];
  }
}

/**
 * Get all feature flags (seeds defaults on first call).
 */
export async function getAllFlags(): Promise<FeatureFlag[]> {
  return seedAndGetFlags();
}

/**
 * Get a single flag by key. Returns null if not found.
 */
export async function getFlagByKey(key: string): Promise<FeatureFlag | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.select().from(featureFlags).where(eq(featureFlags.key, key)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get flag:", error);
    return null;
  }
}

/**
 * Toggle a flag on or off. Returns the updated flag.
 */
export async function toggleFlag(key: string, enabled: boolean): Promise<FeatureFlag | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db
      .update(featureFlags)
      .set({ enabled: enabled ? 1 : 0 })
      .where(eq(featureFlags.key, key));
    return getFlagByKey(key);
  } catch (error) {
    console.error("[Database] Failed to toggle flag:", error);
    throw error;
  }
}

/**
 * Update rollout percentage for a flag (0–100).
 */
export async function setFlagRollout(key: string, rolloutPercentage: number): Promise<FeatureFlag | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db
      .update(featureFlags)
      .set({ rolloutPercentage: Math.max(0, Math.min(100, rolloutPercentage)) })
      .where(eq(featureFlags.key, key));
    return getFlagByKey(key);
  } catch (error) {
    console.error("[Database] Failed to set flag rollout:", error);
    throw error;
  }
}
