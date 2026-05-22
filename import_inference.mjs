/**
 * Import all four Inference subtype question sets into the database
 */

import "dotenv/config";
import { getDb } from "./server/db.ts";
import { questions } from "./drizzle/schema.ts";
import { sql } from "drizzle-orm";
import fs from "fs";
import crypto from "crypto";

const db = await getDb();

const FILES = [
  { file: "/home/ubuntu/inference_must_be_true.json", label: "Must Be True" },
  { file: "/home/ubuntu/inference_most_strongly_supported.json", label: "Most Strongly Supported" },
  { file: "/home/ubuntu/inference_cannot_be_true.json", label: "Cannot Be True" },
  { file: "/home/ubuntu/inference_complete_argument.json", label: "Complete the Argument" },
];

function makeQuestionId(category, stimulus) {
  const hash = crypto.createHash("md5").update(stimulus.slice(0, 100)).digest("hex").slice(0, 8);
  const prefix = category.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6);
  return `${prefix}_${hash}`;
}

function makeExplanation(category, correctAnswer) {
  const explanations = {
    "Must Be True (Inference)": `The correct answer is (${correctAnswer}). For Must Be True questions, the correct answer must be directly supported by the stimulus — it cannot go beyond what the passage states. Eliminate answers that are too strong, too weak, or introduce new information.`,
    "Most Strongly Supported (Inference)": `The correct answer is (${correctAnswer}). For Most Strongly Supported questions, the correct answer is the one best supported by the stimulus — it may not be 100% proven but is more strongly supported than the other choices.`,
    "Cannot Be True (Inference)": `The correct answer is (${correctAnswer}). For Cannot Be True questions, the correct answer directly contradicts or is impossible given the information in the stimulus. The other choices could all be true.`,
    "Complete the Argument (Inference)": `The correct answer is (${correctAnswer}). For Complete the Argument questions, the correct answer logically completes the argument — it follows directly from the premises and fits the logical structure of the passage.`,
  };
  return explanations[category] || `The correct answer is (${correctAnswer}).`;
}

let totalImported = 0;
let totalSkipped = 0;

for (const { file, label } of FILES) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`\n=== Importing: ${label} (${data.length} questions) ===`);

  let imported = 0;
  let skipped = 0;

  for (const q of data) {
    const stimulus = q.stimulus || "";
    const questionStem = q.questionStem || "";
    const questionText = stimulus + "\n\n" + questionStem;
    const questionId = makeQuestionId(q.category, stimulus);

    try {
      await db.insert(questions).values({
        questionId,
        questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        optionE: q.optionE,
        correctAnswer: q.correctAnswer,
        explanation: makeExplanation(q.category, q.correctAnswer),
        category: q.category,
        difficulty: q.difficulty || "medium",
        source: q.source || "LR V.3 Drill Sets",
      });
      imported++;
    } catch (err) {
      if (err.message?.includes("Duplicate entry") || err.message?.includes("unique")) {
        skipped++;
      } else {
        console.error(`  Error on Q${q.questionNumber}: ${err.message}`);
        skipped++;
      }
    }
  }

  console.log(`  Imported: ${imported} | Skipped (dup): ${skipped}`);
  totalImported += imported;
  totalSkipped += skipped;
}

// Final count
const [countRow] = await db.execute(sql`SELECT COUNT(*) as total FROM questions`);
const total = countRow[0].total;

console.log(`\n=== IMPORT COMPLETE ===`);
console.log(`Imported: ${totalImported}`);
console.log(`Skipped:  ${totalSkipped}`);
console.log(`DB total: ${total} questions`);

process.exit(0);
