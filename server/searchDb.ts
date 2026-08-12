import { asc, like, or, sql, eq } from "drizzle-orm";
import { questions, questionCategories, questionDifficulties, questionSources } from "../drizzle/schema";
import { getDb } from "./db";

export function escapeSearchLikePattern(value: string) {
  return value.replace(/[\\%_]/g, character => `\\${character}`);
}

export async function searchQuestions(input: {
  query: string;
  limit: number;
  offset: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const normalized = input.query.trim().slice(0, 120);
  const pattern = `%${escapeSearchLikePattern(normalized)}%`;
  const predicate = or(
    like(questions.questionId, pattern),
    like(questions.questionText, pattern),
    like(questionCategories.name, pattern),
    like(questionDifficulties.name, pattern),
    like(questionSources.name, pattern),
  );

  const [items, countRows] = await Promise.all([
    db
      .select({
        id: questions.id,
        questionId: questions.questionId,
        questionText: questions.questionText,
        category: questionCategories.name,
        difficulty: questionDifficulties.name,
        source: questionSources.name,
      })
      .from(questions)
      .leftJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
      .leftJoin(questionDifficulties, eq(questions.difficultyId, questionDifficulties.id))
      .leftJoin(questionSources, eq(questions.sourceId, questionSources.id))
      .where(predicate)
      .orderBy(asc(questions.questionId), asc(questions.id))
      .limit(input.limit)
      .offset(input.offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .leftJoin(questionCategories, eq(questions.categoryId, questionCategories.id))
      .leftJoin(questionDifficulties, eq(questions.difficultyId, questionDifficulties.id))
      .leftJoin(questionSources, eq(questions.sourceId, questionSources.id))
      .where(predicate),
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const nextOffset = input.offset + items.length;
  return {
    items,
    total,
    nextOffset: nextOffset < total ? nextOffset : null,
  };
}
