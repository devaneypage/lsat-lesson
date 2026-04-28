/**
 * Extract LSAT practice questions from LR III text-based PDFs.
 * Uses pdftotext for extraction, then LLM to parse structured questions.
 * Run with: npx tsx extract_lr3_text.mjs
 */
import { execSync } from "child_process";
import { writeFileSync, mkdirSync } from "fs";
import { invokeLLM } from "./server/_core/llm.ts";

const BASE = "/home/ubuntu/upload/lr_objective/A. LR_ Argument-Based Questions (Objective)";
const OUT_DIR = "/home/ubuntu/lr3_extracted";
mkdirSync(OUT_DIR, { recursive: true });

// Text-based files with practice questions
const TEXT_FILES = [
  { file: "LR_1_ Introduction to Argument-Based Questions (Lesson + Practice).pdf", source: "LR III – LR_1 Intro to Argument-Based Questions", category: "Main Point" },
  { file: "LR_2_ Main Point Questions (Lesson + Practice).pdf", source: "LR III – LR_2 Main Point Questions", category: "Main Point" },
  { file: "LR_3_  Role of Statement Questions (Lesson + Practice).pdf", source: "LR III – LR_3 Role of Statement Questions", category: "Role of Statement" },
  { file: "LR_4_ Method of Argument Questions (Lesson + Practice).pdf", source: "LR III – LR_4 Method of Argument Questions", category: "Method of Argument" },
  { file: "LR_5_ Point at Issue Questions (Lesson + Practice).pdf", source: "LR III – LR_5 Point at Issue Questions", category: "Point at Issue" },
  { file: "LR_6_  Parallel Reasoning Questions (Lesson + Practice).pdf", source: "LR III – LR_6 Parallel Reasoning Questions", category: "Parallel Reasoning" },
  { file: "LR_I_V_ Outlining Complete Argument Drill Set.pdf", source: "LR III – LR_I_V Outlining Complete Argument Drill", category: "Main Point" },
  { file: "LR_I_i_ What_s the Conclusion_ Warm-Up Drill.pdf", source: "LR III – LR_I_i What's the Conclusion Warm-Up", category: "Main Point" },
  { file: "LR_I_ii_ Identifying the Argument Core Warm-Up Drill.pdf", source: "LR III – LR_I_ii Identifying Argument Core Warm-Up", category: "Main Point" },
  { file: "LR_I_iii_ ID the Main Conclusion + Name That Role Warm-Up Drills.pdf", source: "LR III – LR_I_iii ID Main Conclusion + Name That Role", category: "Role of Statement" },
  { file: "LR_I_iv_ Identifying + Paraphrasing Conclusions_ Outlining Complete Arguments (Additional Practice).pdf", source: "LR III – LR_I_iv Identifying + Paraphrasing Conclusions", category: "Main Point" },
  { file: "LR_I_z_ Introduction to Assumption Family Questions_ Mismatched Concepts & Overlooked Possibilities (Lesson + Practice).pdf", source: "LR III – LR_I_z Intro to Assumption Family", category: "Necessary Assumption" },
];

const SYSTEM_PROMPT = `You are an expert LSAT question extractor. Extract all LSAT practice questions from the provided text.

For each question, return a JSON object with these fields:
- questionId: a unique identifier like "LR3-001", "LR3-002", etc. (sequential within this batch)
- questionText: the full stimulus/passage text that students read
- questionStem: the actual question being asked (e.g., "Which one of the following most accurately expresses the main conclusion...")
- answerChoices: array of 5 strings, each starting with "(A)", "(B)", "(C)", "(D)", "(E)"
- correctAnswer: the letter of the correct answer (A, B, C, D, or E) if shown
- explanation: the explanation/analysis if provided
- difficulty: "Easy", "Medium", or "Hard" based on context clues
- category: the question type (Main Point, Role of Statement, Method of Argument, Point at Issue, Parallel Reasoning, Necessary Assumption, or other)
- source: the source string provided

Return ONLY a JSON array of question objects. If no complete practice questions are found, return an empty array [].
Do NOT include lesson text, examples used to teach concepts, or incomplete questions.
Only include questions that have a full stimulus + question stem + answer choices.`;

async function extractFromFile(fileInfo, batchOffset = 0) {
  const filePath = `${BASE}/${fileInfo.file}`;
  console.log(`\nProcessing: ${fileInfo.file}`);
  
  // Extract text
  let text;
  try {
    text = execSync(`pdftotext "${filePath}" -`, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    console.error(`  Failed to extract text: ${err.message}`);
    return [];
  }
  
  if (text.trim().length < 100) {
    console.log(`  Skipping (too little text: ${text.trim().length} chars)`);
    return [];
  }
  
  console.log(`  Extracted ${text.length} chars of text`);
  
  // Use LLM to parse questions
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Source: ${fileInfo.source}\nDefault category: ${fileInfo.category}\n\nExtract all practice questions from this text:\n\n${text}` },
      ],
      response_format: { type: "json_object" },
    });
    
    const content = response.choices?.[0]?.message?.content ?? "[]";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON array from content
      const match = content.match(/\[[\s\S]*\]/);
      parsed = match ? JSON.parse(match[0]) : [];
    }
    
    // Handle both array and object with array property
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
    
    // Add source and category
    const enriched = questions.map((q, i) => ({
      ...q,
      questionId: `LR3-${String(batchOffset + i + 1).padStart(3, "0")}`,
      source: fileInfo.source,
      category: q.category || fileInfo.category,
    }));
    
    console.log(`  Found ${enriched.length} questions`);
    return enriched;
  } catch (err) {
    console.error(`  LLM extraction failed: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log("=== LR III Text-Based PDF Extraction ===\n");
  
  const allQuestions = [];
  
  for (const fileInfo of TEXT_FILES) {
    const questions = await extractFromFile(fileInfo, allQuestions.length);
    allQuestions.push(...questions);
  }
  
  console.log(`\n\nTotal questions extracted: ${allQuestions.length}`);
  
  // Save to JSON
  const outPath = `${OUT_DIR}/lr3_text_questions.json`;
  writeFileSync(outPath, JSON.stringify(allQuestions, null, 2));
  console.log(`Saved to: ${outPath}`);
  
  // Also save summary
  const summary = allQuestions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {});
  console.log("\nCategory breakdown:", summary);
}

main().catch(console.error);
