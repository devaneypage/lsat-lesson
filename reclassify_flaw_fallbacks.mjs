/**
 * Re-classify the 32 Flaw questions tagged as "Flaw: Overlooked Possibilities"
 * by the heuristic classifier. Uses LLM to determine the correct flaw subtype.
 * 
 * Only processes questions currently tagged as "Flaw: Overlooked Possibilities"
 * — does NOT touch the 15 high-confidence heuristic assignments.
 */

import "dotenv/config";
import { getDb } from "./server/db.ts";
import { questions, tags, questionTags } from "./drizzle/schema.ts";
import { eq, and, inArray } from "drizzle-orm";
import { invokeLLM } from "./server/_core/llm.ts";
import fs from "fs";

const db = await getDb();

// Find the "Flaw: Overlooked Possibilities" tag ID
const [overlookTag] = await db.select().from(tags).where(eq(tags.name, "Flaw: Overlooked Possibilities"));
if (!overlookTag) {
  console.error("Could not find 'Flaw: Overlooked Possibilities' tag");
  process.exit(1);
}
console.log(`Found "Flaw: Overlooked Possibilities" tag (id=${overlookTag.id})`);

// Get all question IDs currently tagged as Overlooked Possibilities
const taggedRows = await db
  .select({ questionId: questionTags.questionId })
  .from(questionTags)
  .where(eq(questionTags.tagId, overlookTag.id));

const fallbackQuestionIds = taggedRows.map(r => r.questionId);
console.log(`Found ${fallbackQuestionIds.length} questions tagged as Overlooked Possibilities`);

if (fallbackQuestionIds.length === 0) {
  console.log("Nothing to re-classify.");
  process.exit(0);
}

// Fetch the actual question data
const fallbackQuestions = await db
  .select({
    id: questions.id,
    questionText: questions.questionText,
    optionA: questions.optionA,
    optionB: questions.optionB,
    optionC: questions.optionC,
    optionD: questions.optionD,
    optionE: questions.optionE,
    correctAnswer: questions.correctAnswer,
  })
  .from(questions)
  .where(inArray(questions.id, fallbackQuestionIds));

console.log(`Fetched ${fallbackQuestions.length} questions for re-classification\n`);

// Get all flaw subtype tag IDs
const allFlawTags = await db.select().from(tags).where(
  inArray(tags.name, [
    "Flaw: Causal Reasoning",
    "Flaw: Overlooked Possibilities",
    "Flaw: Conditional Reasoning Error",
    "Flaw: Sampling / Survey Error",
    "Flaw: Weak Analogy",
    "Flaw: Circular Reasoning",
    "Flaw: Ad Hominem / Source Attack",
    "Flaw: Equivocation / Ambiguity",
    "Flaw: Composition / Division",
    "Flaw: False Dichotomy",
    "Flaw: Inappropriate Appeal",
    "Flaw: Scope Shift / Straw Man",
  ])
);
const tagNameToId = Object.fromEntries(allFlawTags.map(t => [t.name, t.id]));

const flawTypeDescriptions = `
Available flaw subtypes (use EXACTLY these names):
1. "Flaw: Causal Reasoning" - Confuses correlation with causation, assumes one thing causes another without sufficient evidence, or mistakes cause and effect
2. "Flaw: Overlooked Possibilities" - Fails to consider alternative explanations, ignores other possible causes or solutions, overlooks a third option (use ONLY if this is truly the primary flaw)
3. "Flaw: Conditional Reasoning Error" - Confuses necessary and sufficient conditions, commits the fallacy of affirming the consequent or denying the antecedent
4. "Flaw: Sampling / Survey Error" - Uses an unrepresentative sample, draws conclusions from a biased or insufficient sample
5. "Flaw: Weak Analogy" - Compares two things that are not sufficiently similar, draws a conclusion based on a flawed comparison
6. "Flaw: Circular Reasoning" - The conclusion is assumed in the premises (begging the question), argument goes in circles
7. "Flaw: Ad Hominem / Source Attack" - Attacks the person making the argument rather than the argument itself, dismisses a claim based on the source
8. "Flaw: Equivocation / Ambiguity" - Uses a word or phrase with two different meanings in the same argument
9. "Flaw: Composition / Division" - Assumes what is true of parts is true of the whole (composition) or vice versa (division)
10. "Flaw: False Dichotomy" - Presents only two options when more exist, assumes an either/or situation when other possibilities exist
11. "Flaw: Inappropriate Appeal" - Appeals to authority, popularity, emotion, or tradition in a logically unsound way
12. "Flaw: Scope Shift / Straw Man" - Shifts from one concept to a related but different one, or misrepresents an opponent's argument
`;

const results = [];
let reclassified = 0;
let keptAsOverlooked = 0;
let errors = 0;

console.log("=== Re-classifying Flaw Fallbacks ===\n");

// Process in batches of 5
const BATCH_SIZE = 5;
for (let i = 0; i < fallbackQuestions.length; i += BATCH_SIZE) {
  const batch = fallbackQuestions.slice(i, i + BATCH_SIZE);

  const questionsText = batch.map((q, idx) =>
    `Question ${i + idx + 1} (DB id=${q.id}):\n${q.questionText}\n\nAnswer choices:\nA) ${q.optionA}\nB) ${q.optionB}\nC) ${q.optionC}\nD) ${q.optionD}${q.optionE ? `\nE) ${q.optionE}` : ""}\nCorrect: ${q.correctAnswer}`
  ).join("\n\n---\n\n");

  const prompt = `You are an expert LSAT instructor. Analyze each of the following LSAT Flaw questions and identify the PRIMARY logical flaw in the argument's reasoning.

These questions were previously auto-tagged as "Flaw: Overlooked Possibilities" by a keyword classifier. Your job is to determine the MOST ACCURATE flaw type for each one. Be specific — only use "Flaw: Overlooked Possibilities" if it is genuinely the primary flaw.

${flawTypeDescriptions}

For each question, respond with ONLY a JSON array in this exact format:
[
  {"id": <db_id>, "flawType": "<exact flaw type name from the list above>", "reasoning": "<one sentence explanation>"},
  ...
]

Questions to analyze:
${questionsText}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are an expert LSAT instructor specializing in logical flaw identification. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    let parsed;
    try {
      const obj = JSON.parse(content);
      parsed = Array.isArray(obj) ? obj : (obj.results || obj.questions || obj.analyses || Object.values(obj)[0]);
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error(`Could not parse response: ${content.substring(0, 200)}`);
    }

    for (const item of parsed) {
      const newTagId = tagNameToId[item.flawType];
      if (!newTagId) {
        console.log(`  [!] Unknown flaw type "${item.flawType}" for Q${item.id}`);
        errors++;
        continue;
      }

      if (item.flawType === "Flaw: Overlooked Possibilities") {
        // Keep as-is — confirmed correct
        console.log(`  [keep] Q${item.id}: Overlooked Possibilities confirmed — ${item.reasoning}`);
        keptAsOverlooked++;
        results.push({ id: item.id, flawType: item.flawType, action: "kept", reasoning: item.reasoning });
        continue;
      }

      // Remove the old "Overlooked Possibilities" tag
      await db.delete(questionTags).where(
        and(
          eq(questionTags.questionId, item.id),
          eq(questionTags.tagId, overlookTag.id)
        )
      );

      // Add the new correct tag (ignore duplicate key if already assigned)
      try {
        await db.insert(questionTags).values({
          questionId: item.id,
          tagId: newTagId,
          assignedBy: 1,
        });
      } catch {
        // already has this tag
      }

      console.log(`  [→] Q${item.id}: Overlooked Possibilities → "${item.flawType}" — ${item.reasoning}`);
      reclassified++;
      results.push({ id: item.id, flawType: item.flawType, action: "reclassified", reasoning: item.reasoning });
    }
  } catch (err) {
    console.error(`  [error] Batch ${i}-${i + BATCH_SIZE}: ${err.message}`);
    errors++;
  }

  // Pause between batches
  if (i + BATCH_SIZE < fallbackQuestions.length) {
    await new Promise(r => setTimeout(r, 1200));
  }
}

console.log(`\n══════════════════════════════════════════════`);
console.log(`  FLAW RE-CLASSIFICATION COMPLETE`);
console.log(`  Re-classified: ${reclassified}`);
console.log(`  Kept as Overlooked Possibilities: ${keptAsOverlooked}`);
console.log(`  Errors: ${errors}`);
console.log(`══════════════════════════════════════════════`);

// Save results
fs.writeFileSync("/home/ubuntu/flaw_reclassification_results.json", JSON.stringify(results, null, 2));
console.log(`\nResults saved to /home/ubuntu/flaw_reclassification_results.json`);

process.exit(0);
