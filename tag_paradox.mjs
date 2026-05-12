import "dotenv/config";
import { getDb } from "./server/db.ts";

const db = await getDb();

console.log("\n=== Auto-tagging Resolve the Paradox questions ===\n");

// 1. Get all Paradox questions
const [paradoxRows] = await db.execute(
  "SELECT id FROM questions WHERE category = 'Resolve the Paradox'"
);
const questionIds = paradoxRows.map(r => r.id);
console.log(`Found ${questionIds.length} Paradox questions`);

// 2. Get relevant tags
const [tagRows] = await db.execute(
  "SELECT id, name FROM tags WHERE name IN ('LR II: Argument-Based (Subjective)', 'QT: Resolve the Paradox', 'Difficulty: Medium', 'Source: LR V.3 Drill Sets')"
);

const tagMap = {};
for (const tag of tagRows) {
  tagMap[tag.name] = tag.id;
}
console.log("Tags found:", Object.keys(tagMap));

// 3. Assign tags to each question
let assigned = 0;
let skipped = 0;

for (const qId of questionIds) {
  for (const [tagName, tagId] of Object.entries(tagMap)) {
    try {
      await db.execute(
        "INSERT IGNORE INTO questionTags (questionId, tagId) VALUES (?, ?)",
        [qId, tagId]
      );
      assigned++;
    } catch (err) {
      skipped++;
    }
  }
}

console.log(`\nAssigned: ${assigned} tag-question pairs`);
console.log(`Skipped (already existed): ${skipped}`);
console.log("\nDone!");
process.exit(0);
