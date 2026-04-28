/**
 * Import LR II questions from CSV into the database.
 * Uses Drizzle ORM directly (same as the server does).
 * Run with: npx tsx import_lr2.mjs
 */
import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { insertQuestions } from "./server/db.ts";

function parseCSV(content) {
  const lines = content.split("\n");
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;
    
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || "";
    }
    rows.push(row);
  }
  
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function main() {
  console.log("=== Importing LR II Questions ===\n");
  
  const csvContent = readFileSync("/home/ubuntu/lr2_questions_all.csv", "utf-8");
  const rows = parseCSV(csvContent);
  console.log(`Parsed ${rows.length} questions from CSV`);
  
  // Transform to the format expected by insertQuestions (matches schema field names)
  const questions = rows
    .filter(row => row.stimulus && row.question_stem && row.answer_a && row.answer_e)
    .map(row => {
      // Build question text: stimulus + question stem
      const questionText = `${row.stimulus.trim()}\n\n${row.question_stem.trim()}`;
      
      return {
        questionId: randomUUID(),
        questionText,
        optionA: row.answer_a || "",
        optionB: row.answer_b || "",
        optionC: row.answer_c || "",
        optionD: row.answer_d || "",
        optionE: row.answer_e || "",
        correctAnswer: (row.correct_answer || "A").toUpperCase().charAt(0),
        explanation: row.source_reference 
          ? `Source: ${row.source_reference}. Category: ${row.category}. Lesson: ${row.lesson}` 
          : `Category: ${row.category}. Lesson: ${row.lesson}`,
        category: row.category || "Logical Reasoning",
        difficulty: (row.difficulty || "medium").toLowerCase(),
        source: row.source || "LR II",
      };
    });
  
  console.log(`Valid questions to import: ${questions.length}`);
  
  // Import in batches of 25
  let imported = 0;
  let failed = 0;
  const batchSize = 25;
  
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    try {
      await insertQuestions(batch);
      imported += batch.length;
      process.stdout.write(`\r  Imported: ${imported}/${questions.length}`);
    } catch (batchErr) {
      failed += batch.length;
      console.error(`\n  Batch ${Math.floor(i/batchSize)+1} failed: ${batchErr.message}`);
    }
  }
  
  console.log(`\n\n✓ Done: ${imported} imported, ${failed} failed`);
}

main().catch(console.error);
