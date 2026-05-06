/**
 * Import extracted RC questions into the database.
 * Run with: npx tsx import_rc.mjs
 */
import { readFileSync } from "fs";
import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const data = JSON.parse(readFileSync("/home/ubuntu/rc_extracted/rc_questions_answered.json", "utf8"));
console.log(`Loaded ${data.length} RC questions`);

// Parse DATABASE_URL: mysql://user:pass@host:port/dbname
const url = new URL(DB_URL);
const conn = await createConnection({
  host: url.hostname,
  port: parseInt(url.port || "3306"),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
});

let inserted = 0;
let skipped = 0;
let errors = 0;

for (const q of data) {
  // Validate required fields
  if (!q.passageText || !q.questionStem || !q.answerChoices || q.answerChoices.length < 4) {
    console.log(`  Skipping ${q.questionId}: incomplete data`);
    skipped++;
    continue;
  }

  if (!q.correctAnswer) {
    console.log(`  Skipping ${q.questionId}: no correct answer`);
    skipped++;
    continue;
  }

  // Build questionText = passage + question stem
  const questionText = `${q.passageText.trim()}\n\n---\n\n${q.questionStem.trim()}`;

  // Extract answer choices
  const choices = q.answerChoices;
  const cleanChoice = (c) => c ? c.replace(/^\([A-E]\)\s*/, "").trim() : "";

  const optionA = cleanChoice(choices[0]);
  const optionB = cleanChoice(choices[1]);
  const optionC = cleanChoice(choices[2]);
  const optionD = cleanChoice(choices[3]);
  const optionE = choices[4] ? cleanChoice(choices[4]) : null;

  if (!optionA || !optionB || !optionC || !optionD) {
    console.log(`  Skipping ${q.questionId}: missing answer choices`);
    skipped++;
    continue;
  }

  // Generate a unique questionId with RC prefix
  const questionId = `RC-${q.questionId.replace(/^RC-/, "")}-${Date.now().toString(36)}`;

  try {
    await conn.execute(
      `INSERT INTO questions 
       (questionId, questionText, optionA, optionB, optionC, optionD, optionE, 
        correctAnswer, explanation, category, difficulty, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE questionText = questionText`,
      [
        questionId,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        optionE,
        q.correctAnswer.toUpperCase().charAt(0),
        q.explanation || "See passage for context.",
        q.category || "RC",
        q.difficulty || "Medium",
        q.source || "RC Materials",
      ]
    );
    inserted++;
    if (inserted % 10 === 0) console.log(`  Inserted: ${inserted}/${data.length - skipped}`);
  } catch (err) {
    console.error(`  Error inserting ${q.questionId}: ${err.message}`);
    errors++;
  }
}

await conn.end();

console.log(`\n=== Import Complete ===`);
console.log(`Inserted: ${inserted}`);
console.log(`Skipped:  ${skipped}`);
console.log(`Errors:   ${errors}`);

// Verify total count
const conn2 = await createConnection({
  host: url.hostname,
  port: parseInt(url.port || "3306"),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false },
});
const [rows] = await conn2.execute("SELECT COUNT(*) as total FROM questions");
console.log(`\nTotal questions in DB: ${rows[0].total}`);
await conn2.end();
