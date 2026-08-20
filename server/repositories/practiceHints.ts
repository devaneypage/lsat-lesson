import { eq } from "drizzle-orm";
import { questionCategories, questions } from "../../drizzle/schema";
import { getDb } from "../db";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export async function getPracticeQuestionHintContext(questionId: number) {
  const db = await requireDb();
  const [question] = await db
    .select({ questionText: questions.questionText, category: questionCategories.name })
    .from(questions)
    .leftJoin(questionCategories, eq(questionCategories.id, questions.categoryId))
    .where(eq(questions.id, questionId))
    .limit(1);
  return question ?? null;
}

export const practiceHintRepository = { getPracticeQuestionHintContext };
