/**
 * Import script for remaining batch 2 questions:
 * - Reasoning Conforms To (39 questions, all with answer key)
 * - Supporting Principle (71 questions, 39 with answer key, 32 without)
 *
 * Questions without an answer key will use LLM-determined answers from a fallback.
 * For now, questions without correctAnswer will be skipped (only import keyed ones).
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { questions } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";
import fs from "fs";
import crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

function generateQuestionId(stimulus, category) {
  const hash = crypto.createHash("md5")
    .update(`${category}:${stimulus.substring(0, 100)}`)
    .digest("hex")
    .substring(0, 12);
  return `batch2-${hash}`;
}

function buildQuestionText(q) {
  // Combine stimulus + question stem into the questionText field
  return `${q.stimulus}\n\n${q.questionStem}`;
}

async function importQuestions(filePath, label) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Only import questions that have a correct answer
  const withAnswer = data.filter(q => q.correctAnswer && q.correctAnswer.match(/^[A-E]$/));
  const withoutAnswer = data.filter(q => !q.correctAnswer || !q.correctAnswer.match(/^[A-E]$/));

  console.log(`\n${label}: ${data.length} total, ${withAnswer.length} with answer key, ${withoutAnswer.length} without`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const q of withAnswer) {
    try {
      const questionId = generateQuestionId(q.stimulus, q.category);
      const questionText = buildQuestionText(q);

      // Check for existing question
      const existing = await db.select({ id: questions.id })
        .from(questions)
        .where(eq(questions.questionId, questionId))
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      await db.insert(questions).values({
        questionId,
        questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        optionE: q.optionE || "",
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || `This is a ${q.category} question. The correct answer is ${q.correctAnswer}.`,
        category: q.category,
        difficulty: q.difficulty || "medium",
        source: q.source || "LSAT Logical Reasoning by Type, Volume 3"
      });

      imported++;
    } catch (err) {
      console.error(`  Error importing question ${q.questionNumber}:`, err.message);
      errors++;
    }
  }

  console.log(`  ✓ Imported: ${imported}, Skipped (duplicate): ${skipped}, Errors: ${errors}`);
  if (withoutAnswer.length > 0) {
    console.log(`  ⚠ Skipped ${withoutAnswer.length} questions without answer key (can be imported in next session with LLM answer determination)`);
  }

  return imported;
}

// Get current count
const [countResult] = await db.select({ count: questions.id }).from(questions);
console.log(`Current question count: (checking...)`);

// Count all questions
const allQ = await db.select({ id: questions.id }).from(questions);
console.log(`Current question count: ${allQ.length}`);

// Import both sets
const rcImported = await importQuestions(
  "/home/ubuntu/reasoning_conforms_extracted.json",
  "Reasoning Conforms To"
);

const spImported = await importQuestions(
  "/home/ubuntu/supporting_principle_extracted.json",
  "Supporting Principle"
);

// Final count
const finalQ = await db.select({ id: questions.id }).from(questions);
console.log(`\n${'='.repeat(50)}`);
console.log(`IMPORT SUMMARY`);
console.log('='.repeat(50));
console.log(`Reasoning Conforms To imported: ${rcImported}`);
console.log(`Supporting Principle imported: ${spImported}`);
console.log(`Total new questions: ${rcImported + spImported}`);
console.log(`Final database count: ${finalQ.length}`);
console.log('='.repeat(50));

await connection.end();
