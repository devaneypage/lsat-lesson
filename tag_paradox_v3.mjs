import "dotenv/config";
import { getDb } from "./server/db.ts";
import { tags, questions, questionTags } from "./drizzle/schema.ts";
import { eq, inArray } from "drizzle-orm";

const db = await getDb();

console.log("\n=== Creating & Assigning Resolve the Paradox Tags ===\n");

// 1. Get all Paradox questions
const paradoxQs = await db.select({ id: questions.id })
  .from(questions)
  .where(eq(questions.category, "Resolve the Paradox"));
const questionIds = paradoxQs.map(r => r.id);
console.log(`Found ${questionIds.length} Paradox questions`);

// 2. Helper to upsert a tag
async function upsertTag(name, type, color) {
  const existing = await db.select().from(tags).where(eq(tags.name, name));
  if (existing.length > 0) {
    console.log(`  [skip] "${name}" already exists (id=${existing[0].id})`);
    return existing[0].id;
  }
  const [result] = await db.insert(tags).values({ name, type, color, description: "", createdBy: 1 });
  const id = result.insertId;
  console.log(`  [+] "${name}" (${type}) → id=${id}`);
  return id;
}

// 3. Create/get all needed tags
const paradoxTagId = await upsertTag("QT: Resolve the Paradox", "objective", "#8B5CF6");
const sourceTagId = await upsertTag("Source: LR V.3 Drill Sets", "custom", "#6B7280");

// Get existing section and difficulty tags
const existingTags = await db.select().from(tags).where(
  inArray(tags.name, ["LR II — Subjective Question Types", "Difficulty: Medium"])
);
const tagAssignments = [paradoxTagId, sourceTagId, ...existingTags.map(t => t.id)];

console.log(`\nAssigning ${tagAssignments.length} tags to ${questionIds.length} questions...`);

// 4. Assign all tags to all Paradox questions
let assigned = 0;
let skipped = 0;

for (const qId of questionIds) {
  for (const tagId of tagAssignments) {
    try {
      await db.insert(questionTags).values({ questionId: qId, tagId });
      assigned++;
    } catch {
      // ignore duplicate key errors (INSERT IGNORE equivalent)
      skipped++;
    }
  }
}

console.log(`\nAssigned: ${assigned} new tag-question pairs`);
console.log(`Skipped (already existed): ${skipped}`);

// 5. Verify
const verifyRows = await db.select({
  tagName: tags.name,
})
  .from(tags)
  .innerJoin(questionTags, eq(tags.id, questionTags.tagId))
  .innerJoin(questions, eq(questionTags.questionId, questions.id))
  .where(eq(questions.category, "Resolve the Paradox"))
  .groupBy(tags.id, tags.name);

console.log("\nTags on Paradox questions:");
for (const row of verifyRows) {
  console.log(`  ${row.tagName}`);
}

console.log("\nDone!");
process.exit(0);
