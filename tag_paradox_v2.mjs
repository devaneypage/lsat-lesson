import "dotenv/config";
import { getDb } from "./server/db.ts";

const db = await getDb();

console.log("\n=== Creating & Assigning Resolve the Paradox Tags ===\n");

// 1. Get all Paradox questions
const [paradoxRows] = await db.execute(
  "SELECT id FROM questions WHERE category = 'Resolve the Paradox'"
);
const questionIds = paradoxRows.map(r => r.id);
console.log(`Found ${questionIds.length} Paradox questions`);

// 2. Create the missing "QT: Resolve the Paradox" tag if it doesn't exist
const [existingTag] = await db.execute(
  "SELECT id FROM tags WHERE name = 'QT: Resolve the Paradox'"
);

let paradoxTagId;
if (existingTag.length === 0) {
  const [result] = await db.execute(
    "INSERT INTO tags (name, type, color, createdBy) VALUES (?, ?, ?, ?)",
    ["QT: Resolve the Paradox", "objective", "#8B5CF6", 1]
  );
  paradoxTagId = result.insertId;
  console.log(`Created tag "QT: Resolve the Paradox" (id: ${paradoxTagId})`);
} else {
  paradoxTagId = existingTag[0].id;
  console.log(`Tag "QT: Resolve the Paradox" already exists (id: ${paradoxTagId})`);
}

// 3. Create "Source: LR V.3 Drill Sets" tag if it doesn't exist
const [existingSource] = await db.execute(
  "SELECT id FROM tags WHERE name = 'Source: LR V.3 Drill Sets'"
);

let sourceTagId;
if (existingSource.length === 0) {
  const [result] = await db.execute(
    "INSERT INTO tags (name, type, color, createdBy) VALUES (?, ?, ?, ?)",
    ["Source: LR V.3 Drill Sets", "custom", "#6B7280", 1]
  );
  sourceTagId = result.insertId;
  console.log(`Created tag "Source: LR V.3 Drill Sets" (id: ${sourceTagId})`);
} else {
  sourceTagId = existingSource[0].id;
  console.log(`Tag "Source: LR V.3 Drill Sets" already exists (id: ${sourceTagId})`);
}

// 4. Get existing relevant tags
const [tagRows] = await db.execute(
  "SELECT id, name FROM tags WHERE name IN ('LR II — Subjective Question Types', 'Difficulty: Medium')"
);
const tagMap = {};
for (const tag of tagRows) tagMap[tag.name] = tag.id;
tagMap["QT: Resolve the Paradox"] = paradoxTagId;
tagMap["Source: LR V.3 Drill Sets"] = sourceTagId;

console.log(`\nAssigning ${Object.keys(tagMap).length} tags to ${questionIds.length} questions...`);

// 5. Assign all tags to all Paradox questions
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

console.log(`\nAssigned: ${assigned} new tag-question pairs`);
console.log(`Skipped (already existed): ${skipped}`);

// 6. Verify
const [verifyRows] = await db.execute(
  `SELECT t.name, COUNT(qt.questionId) as count 
   FROM tags t 
   JOIN questionTags qt ON t.id = qt.tagId 
   JOIN questions q ON qt.questionId = q.id 
   WHERE q.category = 'Resolve the Paradox' 
   GROUP BY t.id, t.name`
);
console.log("\nTag assignments on Paradox questions:");
for (const row of verifyRows) {
  console.log(`  ${row.name}: ${row.count} questions`);
}

console.log("\nDone!");
process.exit(0);
