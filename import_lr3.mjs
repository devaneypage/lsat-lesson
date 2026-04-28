/**
 * Consolidate and import LR III questions into the database.
 * Merges text-based and image-based extraction results.
 * Run with: npx tsx import_lr3.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { getDb } from "./server/db.ts";
import { questions } from "./drizzle/schema.ts";

const TEXT_FILE = "/home/ubuntu/lr3_extracted/lr3_text_questions.json";
const IMAGE_FILE = "/home/ubuntu/lr3_extracted/lr3_image_questions.json";
const OUT_CSV = "/home/ubuntu/lr3_questions_all.csv";

// Map category names to database enum values
function mapCategory(cat) {
  const map = {
    "Main Point": "Main Point",
    "Role of Statement": "Role of Statement",
    "Method of Argument": "Method of Argument",
    "Point at Issue": "Point at Issue",
    "Parallel Reasoning": "Parallel Reasoning",
    "Necessary Assumption": "Necessary Assumption",
    "Sufficient Assumption": "Sufficient Assumption",
    "Flaw": "Flaw",
    "Strengthen": "Strengthen",
    "Weaken": "Weaken",
    "Strengthen/Weaken": "Strengthen",
    "Match Flaw": "Match Flaw",
    "Inference": "Inference",
    "Resolve the Paradox": "Resolve the Paradox",
    "Principle": "Principle",
  };
  return map[cat] || cat;
}

async function main() {
  console.log("=== LR III Import ===\n");

  // Load both extraction files
  const textQuestions = JSON.parse(readFileSync(TEXT_FILE, "utf8"));
  const imageQuestions = JSON.parse(readFileSync(IMAGE_FILE, "utf8"));
  
  const allRaw = [...textQuestions, ...imageQuestions];
  console.log(`Raw questions: ${textQuestions.length} (text) + ${imageQuestions.length} (image) = ${allRaw.length} total`);

  // Filter to only questions with full stimulus + stem + answer choices
  const valid = allRaw.filter(q => {
    const hasText = q.questionText && q.questionText.trim().length > 20;
    const hasStem = q.questionStem && q.questionStem.trim().length > 10;
    const hasChoices = Array.isArray(q.answerChoices) && q.answerChoices.length >= 4;
    return hasText && hasStem && hasChoices;
  });
  
  console.log(`Valid questions (with full text + stem + choices): ${valid.length}`);

  // Connect to DB
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  // Import each question
  let imported = 0;
  let failed = 0;

  for (const q of valid) {
    try {
      const category = mapCategory(q.category || "Main Point");
      const difficulty = q.difficulty || "Medium";
      
      // Parse answer choices into individual option columns
      const choices = Array.isArray(q.answerChoices) ? q.answerChoices : [];
      const getChoice = (idx) => {
        const c = choices[idx] || "";
        // Strip leading (A), (B), etc.
        return c.replace(/^\([A-E]\)\s*/, "").trim();
      };

      await db.insert(questions).values({
        questionId: q.questionId || `LR3-AUTO-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        questionText: (q.questionText + (q.questionStem ? "\n\n" + q.questionStem : "")).trim(),
        optionA: getChoice(0) || "(A) Not available",
        optionB: getChoice(1) || "(B) Not available",
        optionC: getChoice(2) || "(C) Not available",
        optionD: getChoice(3) || "(D) Not available",
        optionE: getChoice(4) || null,
        correctAnswer: (q.correctAnswer || "A").charAt(0).toUpperCase(),
        explanation: q.explanation || "See source material.",
        difficulty: ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Medium",
        category: category,
        source: q.source || "LR III – Objective Question Types",
      });
      imported++;
    } catch (err) {
      console.error(`  Failed to import ${q.questionId}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nImport complete:`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Failed: ${failed}`);

  // Final count
  const total = await db.select({ id: questions.id }).from(questions);
  console.log(`  Total questions in DB: ${total.length}`);

  // Category breakdown
  const cats = valid.reduce((acc, q) => {
    const c = mapCategory(q.category || "Main Point");
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  console.log("\nCategory breakdown:", cats);
}

main().catch(console.error);
