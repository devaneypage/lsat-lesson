/**
 * Assign taxonomy tags to all 139 Inference questions
 */

import "dotenv/config";
import { getDb } from "./server/db.ts";
import { tags, questions, questionTags } from "./drizzle/schema.ts";
import { eq, inArray } from "drizzle-orm";

const db = await getDb();

console.log("\n=== Assigning Taxonomy Tags to Inference Questions ===\n");

// Helper to upsert a tag
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

// Helper to assign a tag to a list of question IDs
async function assignTagToQuestions(tagId, questionIds) {
  let added = 0;
  for (const qId of questionIds) {
    try {
      await db.insert(questionTags).values({ questionId: qId, tagId });
      added++;
    } catch {
      // ignore duplicate key errors
    }
  }
  return added;
}

// Create new QT tags for each Inference subtype
const mustBeTrueTagId = await upsertTag("QT: Must Be True", "objective", "#3B82F6");
const mostStronglySupportedTagId = await upsertTag("QT: Most Strongly Supported", "objective", "#6366F1");
const cannotBeTrueTagId = await upsertTag("QT: Cannot Be True", "objective", "#EF4444");
const completeArgumentTagId = await upsertTag("QT: Complete the Argument", "objective", "#10B981");
const inferenceUnitTagId = await upsertTag("Unit: Inference Questions", "section", "#8B5CF6");

// Get existing shared tags
const sharedTags = await db.select().from(tags).where(
  inArray(tags.name, [
    "LR II — Subjective Question Types",
    "Source: LR V.3 Drill Sets",
    "Difficulty: Medium",
  ])
);
const sharedTagMap = Object.fromEntries(sharedTags.map(t => [t.name, t.id]));

// Process each subtype
const subtypes = [
  { category: "Must Be True (Inference)", qtTagId: mustBeTrueTagId },
  { category: "Most Strongly Supported (Inference)", qtTagId: mostStronglySupportedTagId },
  { category: "Cannot Be True (Inference)", qtTagId: cannotBeTrueTagId },
  { category: "Complete the Argument (Inference)", qtTagId: completeArgumentTagId },
];

let totalAssigned = 0;

for (const { category, qtTagId } of subtypes) {
  const qs = await db.select({ id: questions.id })
    .from(questions)
    .where(eq(questions.category, category));
  const qIds = qs.map(r => r.id);

  if (qIds.length === 0) {
    console.log(`\n  No questions found for category: ${category}`);
    continue;
  }

  console.log(`\n  ${category}: ${qIds.length} questions`);

  // Assign the specific QT tag
  const qtAdded = await assignTagToQuestions(qtTagId, qIds);
  console.log(`    QT tag: +${qtAdded}`);

  // Assign the unit tag
  const unitAdded = await assignTagToQuestions(inferenceUnitTagId, qIds);
  console.log(`    Unit tag: +${unitAdded}`);

  // Assign shared tags
  for (const [name, tagId] of Object.entries(sharedTagMap)) {
    const added = await assignTagToQuestions(tagId, qIds);
    console.log(`    "${name}": +${added}`);
  }

  totalAssigned += qIds.length;
}

// Verify
const verifyRows = await db.select({
  tagName: tags.name,
})
  .from(tags)
  .innerJoin(questionTags, eq(tags.id, questionTags.tagId))
  .innerJoin(questions, eq(questionTags.questionId, questions.id))
  .where(inArray(questions.category, [
    "Must Be True (Inference)",
    "Most Strongly Supported (Inference)",
    "Cannot Be True (Inference)",
    "Complete the Argument (Inference)",
  ]))
  .groupBy(tags.id, tags.name);

console.log("\n\nTags assigned to Inference questions:");
for (const row of verifyRows) {
  console.log(`  ${row.tagName}`);
}

console.log(`\nTotal questions tagged: ${totalAssigned}`);
console.log("Done!");
process.exit(0);
