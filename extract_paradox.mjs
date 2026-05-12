/**
 * Visual extraction for Resolve the Paradox PDFs
 * Converts each page to an image, sends to LLM vision, extracts structured questions
 */
import "dotenv/config";
import { execSync } from "child_process";
import { invokeLLM } from "./server/_core/llm.ts";
import fs from "fs";
import path from "path";

const PDFS = [
  {
    file: "/home/ubuntu/upload/LR_V.3_ResolvetheParadox(#1-71).pdf",
    label: "LR_V3_Paradox_1-71",
    questionNumbers: { start: 1, end: 71 },
  },
  {
    file: "/home/ubuntu/upload/6.ResolvetheParadoxQuestions.pdf",
    label: "Paradox_Questions_6",
    questionNumbers: null, // no numbered sequence
  },
  {
    file: "/home/ubuntu/upload/LR_III_5_ResolvetheParadoxQuestionSet.pdf",
    label: "LR_III_5_Paradox",
    questionNumbers: null,
  },
];

const OUTPUT_DIR = "/home/ubuntu/paradox_extracted";
const IMG_DIR = "/home/ubuntu/paradox_pages";
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });

const SYSTEM_PROMPT = `You are an expert LSAT question extractor. Extract LSAT Logical Reasoning questions from the provided page image.

For each complete question found on the page, return a JSON object with:
- "questionNumber": the question number if shown (integer or null)
- "stimulus": the passage/argument text that precedes the question stem
- "questionStem": the question being asked (e.g., "Which one of the following...")
- "optionA": answer choice A text
- "optionB": answer choice B text
- "optionC": answer choice C text
- "optionD": answer choice D text
- "optionE": answer choice E text (or null if only 4 choices)

Rules:
- Only extract COMPLETE questions that have both a stimulus AND all answer choices visible
- If a question is split across pages (stimulus on this page, choices on next), skip it
- If the page contains only passage text, headers, or answer keys, return empty array
- Do NOT include explanations, annotations, or tutor notes
- Preserve the exact wording of each question and answer choice
- Return ONLY a JSON array: [{"questionNumber":1,"stimulus":"...","questionStem":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","optionE":"..."}]`;

async function extractPageQuestions(imagePath, pageNum, pdfLabel) {
  // Upload image to get URL
  const uploadResult = execSync(`manus-upload-file "${imagePath}" 2>&1`).toString().trim();
  const urlMatch = uploadResult.match(/https?:\/\/\S+/);
  if (!urlMatch) {
    console.log(`    [!] Could not upload page ${pageNum} — skipping`);
    return [];
  }
  const imageUrl = urlMatch[0];

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all complete LSAT questions from this page (page ${pageNum} of ${pdfLabel}). Return only a JSON array.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "high" }
            }
          ]
        }
      ]
    });

    const content = response.choices[0].message.content.trim();
    
    // Try to parse JSON array from response
    let parsed = [];
    try {
      // Direct parse
      parsed = JSON.parse(content);
    } catch {
      // Try extracting array from content
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { parsed = []; }
      }
    }

    if (!Array.isArray(parsed)) return [];
    
    // Filter out incomplete questions
    return parsed.filter(q => 
      q.stimulus && q.questionStem && q.optionA && q.optionB && q.optionC && q.optionD
    );
  } catch (err) {
    console.log(`    [!] LLM error on page ${pageNum}: ${err.message}`);
    return [];
  }
}

async function processPDF(pdfConfig) {
  const { file, label, questionNumbers } = pdfConfig;
  console.log(`\n${"═".repeat(60)}`);
  console.log(`Processing: ${label}`);
  console.log(`File: ${path.basename(file)}`);
  
  // Get page count
  const pageCount = parseInt(
    execSync(`pdfinfo "${file}" 2>/dev/null | grep "^Pages:" | awk '{print $2}'`).toString().trim()
  ) || 0;
  console.log(`Pages: ${pageCount}`);

  if (pageCount === 0) {
    console.log(`  [!] Could not determine page count — skipping`);
    return [];
  }

  // Convert all pages to images
  const pdfImgDir = path.join(IMG_DIR, label);
  fs.mkdirSync(pdfImgDir, { recursive: true });
  
  console.log(`Converting pages to images...`);
  try {
    execSync(
      `pdftoppm -r 150 -png "${file}" "${pdfImgDir}/page"`,
      { stdio: "pipe" }
    );
  } catch (err) {
    console.log(`  [!] pdftoppm failed: ${err.message}`);
    return [];
  }

  const imageFiles = fs.readdirSync(pdfImgDir)
    .filter(f => f.endsWith(".png"))
    .sort()
    .map(f => path.join(pdfImgDir, f));

  console.log(`Generated ${imageFiles.length} page images`);

  const allQuestions = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imgPath = imageFiles[i];
    const pageNum = i + 1;
    process.stdout.write(`  Page ${pageNum}/${imageFiles.length}... `);
    
    const questions = await extractPageQuestions(imgPath, pageNum, label);
    
    if (questions.length > 0) {
      console.log(`${questions.length} question(s) found`);
      allQuestions.push(...questions);
    } else {
      console.log(`no complete questions`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nExtracted ${allQuestions.length} questions from ${label}`);
  return allQuestions;
}

// Main extraction
const allExtracted = [];

for (const pdfConfig of PDFS) {
  const questions = await processPDF(pdfConfig);
  allExtracted.push(...questions.map(q => ({ ...q, source: pdfConfig.label })));
}

// Deduplicate by question number (prefer LR_V3 source as it's the primary set)
const byNumber = {};
const unnumbered = [];

for (const q of allExtracted) {
  if (q.questionNumber) {
    const key = q.questionNumber;
    if (!byNumber[key]) {
      byNumber[key] = q;
    } else if (q.source === "LR_V3_Paradox_1-71") {
      // Prefer the primary source
      byNumber[key] = q;
    }
  } else {
    unnumbered.push(q);
  }
}

const deduped = [
  ...Object.values(byNumber).sort((a, b) => a.questionNumber - b.questionNumber),
  ...unnumbered
];

// Apply answer key to numbered questions
const answerKey = JSON.parse(
  fs.readFileSync("/home/ubuntu/batch2_answer_key.json", "utf-8")
);
const paradoxAnswers = answerKey.sections.paradox.answers; // 71 answers, 1-indexed

for (const q of deduped) {
  if (q.questionNumber && q.questionNumber >= 1 && q.questionNumber <= paradoxAnswers.length) {
    q.correctAnswer = paradoxAnswers[q.questionNumber - 1];
  }
}

// Save results
const outputPath = path.join(OUTPUT_DIR, "paradox_questions.json");
fs.writeFileSync(outputPath, JSON.stringify(deduped, null, 2));

console.log(`\n${"═".repeat(60)}`);
console.log(`EXTRACTION COMPLETE`);
console.log(`Total questions extracted: ${deduped.length}`);
console.log(`  Numbered (with answer key): ${Object.keys(byNumber).length}`);
console.log(`  Unnumbered: ${unnumbered.length}`);
console.log(`Output: ${outputPath}`);

process.exit(0);
