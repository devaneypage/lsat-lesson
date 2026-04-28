import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { nanoid } from "nanoid";
import dotenv from "dotenv";

dotenv.config();

const CSV_PATH = "/home/ubuntu/lr_batch2_questions.csv";

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  let i = 1;
  while (i < lines.length) {
    if (!lines[i].trim()) { i++; continue; }
    let line = lines[i];
    let quoteCount = (line.match(/"/g) || []).length;
    while (quoteCount % 2 !== 0 && i + 1 < lines.length) {
      i++;
      line += '\n' + lines[i];
      quoteCount = (line.match(/"/g) || []).length;
    }
    const values = parseCSVLine(line);
    if (values.length >= headers.length) {
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      rows.push(row);
    }
    i++;
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else { current += ch; }
  }
  result.push(current);
  return result;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.error("DATABASE_URL not set"); process.exit(1); }

  const connection = await mysql.createConnection(dbUrl);
  const content = readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCSV(content);
  console.log(`Parsed ${rows.length} questions from CSV`);

  let inserted = 0, skipped = 0;

  for (const row of rows) {
    if (!row.question_text || !row.question_text.trim()) { skipped++; continue; }

    const choices = {};
    if (row.answer_choices) {
      const parts = row.answer_choices.split(' | ');
      for (const part of parts) {
        const m = part.match(/^\(([A-E])\)\s*(.+)$/);
        if (m) choices[m[1].toLowerCase()] = m[2].trim();
      }
    }

    const questionId = nanoid();
    const now = new Date();
    const optionA = choices.a || 'See stimulus';
    const optionB = choices.b || 'See stimulus';
    const optionC = choices.c || 'See stimulus';
    const optionD = choices.d || 'See stimulus';
    const correctAnswer = (row.correct_answer || '').toUpperCase() || 'A';
    const explanation = row.explanation || 'Review the stimulus and apply the four-step LR method.';

    try {
      await connection.execute(
        `INSERT INTO questions 
         (questionId, questionText, optionA, optionB, optionC, optionD, optionE, correctAnswer, explanation, category, difficulty, source, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          questionId,
          row.question_text.trim(),
          optionA, optionB, optionC, optionD,
          choices.e || null,
          correctAnswer,
          explanation,
          row.category || 'Logical Reasoning',
          row.difficulty || 'medium',
          row.source || 'LR Lessons',
          now, now,
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message.slice(0, 80)}`);
      skipped++;
    }
  }

  const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM questions');
  const total = countResult[0].total;

  console.log(`\n=== Import Complete ===`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Total questions in DB: ${total}`);

  // Show breakdown by source
  const [sources] = await connection.execute(
    'SELECT source, COUNT(*) as cnt FROM questions GROUP BY source ORDER BY cnt DESC'
  );
  console.log('\n=== Questions by Source ===');
  sources.forEach(s => console.log(`  ${s.cnt.toString().padStart(3)} | ${s.source}`));

  await connection.end();
}

main().catch(console.error);
