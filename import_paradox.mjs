import "dotenv/config";
import { getDb } from "./server/db.ts";
import { questions } from "./drizzle/schema.ts";
import fs from "fs";

const db = await getDb();
const data = JSON.parse(
  fs.readFileSync("/home/ubuntu/paradox_extracted/paradox_questions.json", "utf-8")
);

console.log(`\nImporting ${data.length} Resolve the Paradox questions...\n`);

let imported = 0;
let skipped = 0;

for (const q of data) {
  // Build the full question text (stimulus + stem)
  const questionText = [q.stimulus, q.questionStem].filter(Boolean).join("\n\n");

  if (!questionText || !q.optionA || !q.correctAnswer) {
    console.log(`  [skip] Q${q.questionNumber} — missing required fields`);
    skipped++;
    continue;
  }

    try {
      const questionId = `paradox-${q.questionNumber || imported + 1}-${Date.now()}`;
      await db.insert(questions).values({
        questionId,
        questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        optionE: q.optionE || null,
        correctAnswer: q.correctAnswer,
        category: "Resolve the Paradox",
        difficulty: "medium",
        explanation: "",
        source: q.source || "LR_V3_Paradox",
      });
    console.log(`  [+] Q${q.questionNumber}: "${questionText.substring(0, 60)}..." → ${q.correctAnswer}`);
    imported++;
  } catch (err) {
    console.log(`  [!] Q${q.questionNumber} failed: ${err.message}`);
    skipped++;
  }
}

// Verify total count
const countResult = await db.execute("SELECT COUNT(*) as count FROM questions");
const count = countResult[0]?.[0]?.count ?? countResult[0]?.count ?? '?';
console.log(`\n${"═".repeat(50)}`);
console.log(`  IMPORT COMPLETE`);
console.log(`  Imported: ${imported} | Skipped: ${skipped}`);
console.log(`  Total questions in DB: ${count}`);
console.log(`${"═".repeat(50)}`);

process.exit(0);
