/**
 * Assign taxonomy tags to the 78 newly imported questions:
 * - 39 Reasoning Conforms To questions
 * - 39 Supporting Principle questions (keyed ones)
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { questions, tags, questionTags } from "./drizzle/schema.ts";
import { eq, and, inArray, like } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Helper: get or create a tag
async function getOrCreateTag(name, type, color, createdBy = 1) {
  const existing = await db.select().from(tags)
    .where(eq(tags.name, name))
    .limit(1);
  
  if (existing.length > 0) return existing[0];
  
  await db.insert(tags).values({ name, type, color, createdBy });
  const created = await db.select().from(tags)
    .where(eq(tags.name, name))
    .limit(1);
  return created[0];
}

// Helper: assign tag to question (idempotent)
async function assignTag(questionId, tagId) {
  const existing = await db.select().from(questionTags)
    .where(and(eq(questionTags.questionId, questionId), eq(questionTags.tagId, tagId)))
    .limit(1);
  
  if (existing.length === 0) {
    await db.insert(questionTags).values({ questionId, tagId });
    return true;
  }
  return false;
}

// Fetch all questions for both new categories
const rcQuestions = await db.select({ id: questions.id, category: questions.category })
  .from(questions)
  .where(eq(questions.category, "Reasoning Conforms To"));

const spQuestions = await db.select({ id: questions.id, category: questions.category })
  .from(questions)
  .where(eq(questions.category, "Supporting Principle"));

console.log(`Found ${rcQuestions.length} Reasoning Conforms To questions`);
console.log(`Found ${spQuestions.length} Supporting Principle questions`);

// Get/create needed tags
const sectionLR = await getOrCreateTag("Section: LR", "section", "#6366f1");
const unitAdvanced = await getOrCreateTag("Unit: Advanced LR", "section", "#8b5cf6");
const diffMedium = await getOrCreateTag("Difficulty: Medium", "custom", "#f59e0b");
const sourceLRV3 = await getOrCreateTag("Source: LR V.3 Drill Sets", "custom", "#64748b");

// Reasoning Conforms To specific tags
const qtConforms = await getOrCreateTag("QT: Reasoning Conforms To", "objective", "#0891b2");
const lessonConforms = await getOrCreateTag("Lesson: Method of Argument", "topic", "#0e7490");

// Supporting Principle specific tags
const qtPrinciple = await getOrCreateTag("QT: Supporting Principle", "objective", "#7c3aed");
const lessonPrinciple = await getOrCreateTag("Lesson: Principle Questions", "topic", "#6d28d9");

let totalAssigned = 0;

// Assign tags to Reasoning Conforms To questions
console.log("\nAssigning tags to Reasoning Conforms To questions...");
for (const q of rcQuestions) {
  const tagsToAssign = [sectionLR, unitAdvanced, diffMedium, sourceLRV3, qtConforms, lessonConforms];
  for (const tag of tagsToAssign) {
    const assigned = await assignTag(q.id, tag.id);
    if (assigned) totalAssigned++;
  }
}
console.log(`  ✓ Tagged ${rcQuestions.length} Reasoning Conforms To questions`);

// Assign tags to Supporting Principle questions
console.log("\nAssigning tags to Supporting Principle questions...");
for (const q of spQuestions) {
  const tagsToAssign = [sectionLR, unitAdvanced, diffMedium, sourceLRV3, qtPrinciple, lessonPrinciple];
  for (const tag of tagsToAssign) {
    const assigned = await assignTag(q.id, tag.id);
    if (assigned) totalAssigned++;
  }
}
console.log(`  ✓ Tagged ${spQuestions.length} Supporting Principle questions`);

// Final summary
const allTags = await db.select().from(tags);
const allAssignments = await db.select().from(questionTags);

console.log(`\n${'='.repeat(50)}`);
console.log("TAG ASSIGNMENT SUMMARY");
console.log('='.repeat(50));
console.log(`New tag-question pairs created: ${totalAssigned}`);
console.log(`Total tags in taxonomy: ${allTags.length}`);
console.log(`Total tag-question pairs: ${allAssignments.length}`);
console.log('='.repeat(50));

await connection.end();
