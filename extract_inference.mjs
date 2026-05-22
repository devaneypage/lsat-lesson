/**
 * Visual extraction for all four Inference subtype PDFs
 * Uses pdf2image to convert pages to images, then LLM vision to read questions
 * Matches each question with the answer key from batch2_answer_key.json
 */

import "dotenv/config";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { invokeLLM } from "./server/_core/llm.ts";

const ANSWER_KEY = JSON.parse(fs.readFileSync("/home/ubuntu/batch2_answer_key.json", "utf8"));

const FILES = [
  {
    pdf: "/home/ubuntu/upload/LR_V.3_Inference(MustBeTrue)(#1-50).pdf",
    label: "Must Be True",
    category: "Must Be True (Inference)",
    answerKey: ANSWER_KEY.sections.must_be_true.answers,
    outputFile: "/home/ubuntu/inference_must_be_true.json",
  },
  {
    pdf: "/home/ubuntu/upload/LR_V.3_Inference(MostStronglySupported)(#1-62).pdf",
    label: "Most Strongly Supported",
    category: "Most Strongly Supported (Inference)",
    answerKey: ANSWER_KEY.sections.most_strongly_supported.answers,
    outputFile: "/home/ubuntu/inference_most_strongly_supported.json",
  },
  {
    pdf: "/home/ubuntu/upload/LR_V.3_Inference(CannotBeTrue)(#1-13).pdf",
    label: "Cannot Be True",
    category: "Cannot Be True (Inference)",
    answerKey: ANSWER_KEY.sections.cannot_be_true.answers,
    outputFile: "/home/ubuntu/inference_cannot_be_true.json",
  },
  {
    pdf: "/home/ubuntu/upload/LR_V.3_Inference(CompletetheArgument)(#1-14).pdf",
    label: "Complete the Argument",
    category: "Complete the Argument (Inference)",
    answerKey: ANSWER_KEY.sections.complete_the_passage.answers,
    outputFile: "/home/ubuntu/inference_complete_argument.json",
  },
];

const TEMP_DIR = "/home/ubuntu/inference_pages";
fs.mkdirSync(TEMP_DIR, { recursive: true });

async function convertPdfToImages(pdfPath, prefix) {
  const outDir = path.join(TEMP_DIR, prefix);
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`  Converting ${path.basename(pdfPath)} to images...`);
  execSync(`pdftoppm -r 150 -png "${pdfPath}" "${outDir}/page"`, { stdio: "pipe" });
  const files = fs.readdirSync(outDir)
    .filter(f => f.endsWith(".png"))
    .sort()
    .map(f => path.join(outDir, f));
  console.log(`  → ${files.length} pages`);
  return files;
}

async function extractQuestionsFromPage(imagePath, label, pageNum) {
  const imageData = fs.readFileSync(imagePath);
  const base64 = imageData.toString("base64");

  const prompt = `You are extracting LSAT Logical Reasoning questions from a page of the book "LSAT Logical Reasoning by Type, Volume 3" — specifically the "${label}" section.

Extract ALL complete questions from this page. A complete question has:
1. A stimulus (passage/argument text)
2. A question stem (the actual question being asked)
3. Five answer choices (A through E)

IMPORTANT RULES:
- Only extract questions where ALL parts are visible on this page
- If a question is cut off (stimulus or choices continue to next page), skip it
- Do NOT include page numbers, section headers, or instructions
- The stimulus comes BEFORE the question stem
- Answer choices are labeled (A) through (E)

Return a JSON array of objects with this exact structure:
[
  {
    "questionNumber": 1,
    "stimulus": "The full stimulus text here...",
    "questionStem": "The question being asked?",
    "optionA": "First answer choice text",
    "optionB": "Second answer choice text",
    "optionC": "Third answer choice text",
    "optionD": "Fourth answer choice text",
    "optionE": "Fifth answer choice text"
  }
]

If no complete questions are on this page, return an empty array [].`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${base64}`, detail: "high" },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract array from response
      const match = content.match(/\[[\s\S]*\]/);
      if (match) parsed = JSON.parse(match[0]);
      else return [];
    }

    // Handle both {questions: [...]} and [...] formats
    const arr = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    return arr.filter(q =>
      q.stimulus && q.questionStem &&
      q.optionA && q.optionB && q.optionC && q.optionD && q.optionE
    );
  } catch (err) {
    console.error(`    Error on page ${pageNum}: ${err.message}`);
    return [];
  }
}

async function processFile(fileConfig) {
  const { pdf, label, category, answerKey, outputFile } = fileConfig;

  // Skip if already done
  if (fs.existsSync(outputFile)) {
    const existing = JSON.parse(fs.readFileSync(outputFile, "utf8"));
    console.log(`\n[SKIP] ${label} — already extracted (${existing.length} questions)`);
    return existing;
  }

  console.log(`\n=== Extracting: ${label} ===`);
  const prefix = label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z_]/g, "");
  const pages = await convertPdfToImages(pdf, prefix);

  const allQuestions = [];
  const seenNumbers = new Set();

  for (let i = 0; i < pages.length; i++) {
    console.log(`  Page ${i + 1}/${pages.length}...`);
    const questions = await extractQuestionsFromPage(pages[i], label, i + 1);

    for (const q of questions) {
      const num = q.questionNumber;
      if (!seenNumbers.has(num) && num >= 1 && num <= answerKey.length) {
        seenNumbers.add(num);
        allQuestions.push({
          ...q,
          correctAnswer: answerKey[num - 1],
          category,
          source: "LR V.3 Drill Sets",
          difficulty: "medium",
        });
      }
    }

    // Brief pause between pages to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  // Sort by question number
  allQuestions.sort((a, b) => a.questionNumber - b.questionNumber);

  console.log(`  → Extracted ${allQuestions.length}/${answerKey.length} questions`);
  fs.writeFileSync(outputFile, JSON.stringify(allQuestions, null, 2));
  return allQuestions;
}

// Process all four files
const results = {};
for (const fileConfig of FILES) {
  const questions = await processFile(fileConfig);
  results[fileConfig.label] = questions.length;
}

console.log("\n=== EXTRACTION SUMMARY ===");
let total = 0;
for (const [label, count] of Object.entries(results)) {
  console.log(`  ${label}: ${count} questions`);
  total += count;
}
console.log(`  TOTAL: ${total} questions`);

process.exit(0);
