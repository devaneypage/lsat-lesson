import "dotenv/config";
import { getDb } from "./server/db.ts";
import { questions, tags, questionTags } from "./drizzle/schema.ts";
import { eq, and, inArray } from "drizzle-orm";
import fs from "fs";

const db = await getDb();

// Get all Flaw questions
const flawQuestions = await db
  .select({
    id: questions.id,
    questionText: questions.questionText,
    optionA: questions.optionA,
    optionB: questions.optionB,
    optionC: questions.optionC,
    optionD: questions.optionD,
    optionE: questions.optionE,
    correctAnswer: questions.correctAnswer,
    category: questions.category,
    source: questions.source,
  })
  .from(questions)
  .where(eq(questions.category, "Flaw"));

console.log(`Found ${flawQuestions.length} Flaw questions`);

// Get the flaw subtype tag IDs
const flawTags = await db
  .select({ id: tags.id, name: tags.name })
  .from(tags)
  .where(eq(tags.type, "custom"));

const flawSubtypeTags = flawTags.filter(t => 
  t.name.startsWith("Flaw:") || t.name.startsWith("Flaw: ")
);

console.log(`\nAvailable flaw subtype tags:`);
flawSubtypeTags.forEach(t => console.log(`  [${t.id}] ${t.name}`));

// Save to file for LLM analysis
fs.writeFileSync(
  "/home/ubuntu/flaw_questions_for_analysis.json",
  JSON.stringify({ flawQuestions, flawSubtypeTags }, null, 2)
);

console.log(`\nSaved ${flawQuestions.length} questions to /home/ubuntu/flaw_questions_for_analysis.json`);
process.exit(0);
