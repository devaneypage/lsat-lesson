import "dotenv/config";
import { getDb } from "./server/db.ts";
import { questions, tags, questionTags } from "./drizzle/schema.ts";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "./server/_core/llm.ts";
import fs from "fs";

const db = await getDb();

// Load the flaw questions
const data = JSON.parse(fs.readFileSync("/home/ubuntu/flaw_questions_for_analysis.json", "utf-8"));
const { flawQuestions, flawSubtypeTags } = data;

const tagNameToId = {};
for (const t of flawSubtypeTags) {
  tagNameToId[t.name] = t.id;
}

const flawTypeDescriptions = `
Available flaw subtypes (use EXACTLY these names):
1. "Flaw: Causal Reasoning" - Confuses correlation with causation, assumes one thing causes another without sufficient evidence, or mistakes cause and effect
2. "Flaw: Overlooked Possibilities" - Fails to consider alternative explanations, ignores other possible causes or solutions, overlooks a third option
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
let assigned = 0;
let skipped = 0;

console.log(`\nAnalyzing ${flawQuestions.length} Flaw questions...\n`);

// Process in batches of 5 to avoid rate limits
const BATCH_SIZE = 5;
for (let i = 0; i < flawQuestions.length; i += BATCH_SIZE) {
  const batch = flawQuestions.slice(i, i + BATCH_SIZE);
  
  const questionsText = batch.map((q, idx) => 
    `Question ${i + idx + 1} (DB id=${q.id}):\n${q.questionText}\n\nAnswer choices:\nA) ${q.optionA}\nB) ${q.optionB}\nC) ${q.optionC}\nD) ${q.optionD}${q.optionE ? `\nE) ${q.optionE}` : ""}\nCorrect: ${q.correctAnswer}`
  ).join("\n\n---\n\n");

  const prompt = `You are an expert LSAT instructor. Analyze each of the following LSAT Flaw questions and identify the PRIMARY logical flaw in the argument's reasoning.

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
      // Try parsing as object with array property first
      const obj = JSON.parse(content);
      parsed = Array.isArray(obj) ? obj : (obj.results || obj.questions || obj.analyses || Object.values(obj)[0]);
    } catch (e) {
      // Try extracting JSON array from content
      const match = content.match(/\[[\s\S]*\]/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error(`Could not parse response: ${content.substring(0, 200)}`);
    }

    for (const item of parsed) {
      const tagId = tagNameToId[item.flawType];
      if (!tagId) {
        console.log(`  [!] Unknown flaw type "${item.flawType}" for question id=${item.id}`);
        skipped++;
        continue;
      }

      // Check if this tag assignment already exists
      const existing = await db
        .select({ id: questionTags.id })
        .from(questionTags)
        .where(and(
          eq(questionTags.questionId, item.id),
          eq(questionTags.tagId, tagId)
        ));

      if (existing.length > 0) {
        console.log(`  [skip] Question ${item.id} already has tag "${item.flawType}"`);
        skipped++;
        continue;
      }

      await db.insert(questionTags).values({
        questionId: item.id,
        tagId: tagId,
        assignedBy: 1,
      });

      console.log(`  [+] Q${item.id}: "${item.flawType}" — ${item.reasoning}`);
      results.push({ id: item.id, flawType: item.flawType, reasoning: item.reasoning });
      assigned++;
    }
  } catch (err) {
    console.error(`  [error] Batch ${i}-${i + BATCH_SIZE}: ${err.message}`);
  }

  // Small delay between batches
  if (i + BATCH_SIZE < flawQuestions.length) {
    await new Promise(r => setTimeout(r, 1000));
  }
}

console.log(`\n══════════════════════════════════════════════`);
console.log(`  FLAW SUBTYPE TAGGING COMPLETE`);
console.log(`  Assigned: ${assigned} | Skipped: ${skipped}`);
console.log(`══════════════════════════════════════════════`);

// Save results for review
fs.writeFileSync(
  "/home/ubuntu/flaw_tag_assignments.json",
  JSON.stringify(results, null, 2)
);
console.log(`\nResults saved to /home/ubuntu/flaw_tag_assignments.json`);

process.exit(0);
