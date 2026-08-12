import { getDb } from "../server/db";
import { questions, questionCategories, questionDifficulties, questionSources } from "./schema";
import { eq } from "drizzle-orm";

async function migrateQuestionData() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  console.log("Starting data migration for questions table...");

  // Fetch all questions with their old string-based category, difficulty, and source
  const allQuestions = await db.select().from(questions);

  // Fetch lookup tables
  const categories = await db.select().from(questionCategories);
  const difficulties = await db.select().from(questionDifficulties);
  const sources = await db.select().from(questionSources);

  for (const question of allQuestions) {
    const category = categories.find(cat => cat.name === question.category);
    const difficulty = difficulties.find(diff => diff.name === question.difficulty);
    const source = sources.find(src => src.name === question.source);

    if (category || difficulty || source) {
      await db.update(questions)
        .set({
          categoryId: category?.id || null,
          difficultyId: difficulty?.id || null,
          sourceId: source?.id || null,
        })
        .where(eq(questions.id, question.id));
    }
  }

  console.log("Data migration for questions table completed.");
}

migrateQuestionData().catch(console.error);
