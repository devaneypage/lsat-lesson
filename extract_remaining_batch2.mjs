/**
 * Visual extraction script for remaining batch 2 PDFs:
 * - 5.ReasoningConformsToQuestions.pdf (14 pages, ~40 questions, Method Statement answers)
 * - 4.SupportingPrincipleQuestions.pdf (22 pages, ~39 questions, Principle Apply answers)
 *
 * Uses pdf2image + LLM vision to extract questions page by page.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { invokeLLM } from "./server/_core/llm.ts";

const ANSWER_KEY = {
  method_statement: ["D","A","E","D","D","A","D","B","E","C","C","E","D","C","B","C","E","A","C","E","B","B","D","D","B","D","B","C","E","B","B","C","B","E","B","E","D","D","D","C"],
  principle_apply: ["D","A","C","D","E","A","E","B","E","C","A","C","C","C","C","D","B","C","C","C","E","E","C","D","A","B","C","E","E","B","C","E","D","D","C","C","B","C","A"]
};

const FILES = [
  {
    pdf: "/home/ubuntu/upload/5.ReasoningConformsToQuestions.pdf",
    name: "reasoning_conforms_to",
    category: "Reasoning Conforms To",
    answerKey: ANSWER_KEY.method_statement,
    pages: 14,
    outputFile: "/home/ubuntu/reasoning_conforms_extracted.json"
  },
  {
    pdf: "/home/ubuntu/upload/4.SupportingPrincipleQuestions.pdf",
    name: "supporting_principle",
    category: "Supporting Principle",
    answerKey: ANSWER_KEY.principle_apply,
    pages: 22,
    outputFile: "/home/ubuntu/supporting_principle_extracted.json"
  }
];

const TEMP_DIR = "/tmp/batch2_remaining_pages";
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

async function extractPagesAsImages(pdfPath, name, totalPages) {
  const outDir = path.join(TEMP_DIR, name);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log(`Converting ${name} (${totalPages} pages) to images...`);
  execSync(
    `python3 -c "
from pdf2image import convert_from_path
import os
pages = convert_from_path('${pdfPath}', dpi=200)
for i, page in enumerate(pages):
    page.save('${outDir}/page_{:03d}.png'.format(i+1), 'PNG')
print(f'Converted {len(pages)} pages')
"`,
    { stdio: "inherit" }
  );

  const images = fs.readdirSync(outDir)
    .filter(f => f.endsWith(".png"))
    .sort()
    .map(f => path.join(outDir, f));

  console.log(`  → ${images.length} page images ready`);
  return images;
}

async function uploadImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  return imageBuffer.toString("base64");
}

async function extractQuestionsFromPages(images, category, chunkSize = 3) {
  const allQuestions = [];
  let questionCounter = 0;

  for (let i = 0; i < images.length; i += chunkSize) {
    const chunk = images.slice(i, i + chunkSize);
    const pageNums = chunk.map((_, idx) => i + idx + 1).join(", ");
    console.log(`  Processing pages ${pageNums}...`);

    // Build content array with all page images
    const content = [
      {
        type: "text",
        text: `These are pages from an LSAT Logical Reasoning practice set. The question type is "${category}".

Extract ALL complete practice questions from these pages. For each question, provide:
1. The full stimulus (argument/passage text)
2. The question stem (the actual question being asked)
3. All five answer choices (A, B, C, D, E) — complete text for each

IMPORTANT RULES:
- Only extract questions that have a complete stimulus + question stem + all 5 answer choices
- Do NOT extract partial questions or lesson/explanation text
- If a question spans multiple pages, include the complete text
- Preserve the exact wording — do not paraphrase
- Number questions sequentially starting from ${questionCounter + 1}

Return a JSON array with this exact structure:
[
  {
    "questionNumber": 1,
    "stimulus": "full stimulus text here",
    "questionStem": "question stem here",
    "optionA": "answer choice A text",
    "optionB": "answer choice B text",
    "optionC": "answer choice C text",
    "optionD": "answer choice D text",
    "optionE": "answer choice E text"
  }
]

If no complete questions are found on these pages, return an empty array: []`
      }
    ];

    // Add each page image
    for (const imagePath of chunk) {
      const base64 = await uploadImageToBase64(imagePath);
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${base64}`,
          detail: "high"
        }
      });
    }

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "user",
            content
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "questions_extraction",
            strict: true,
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      questionNumber: { type: "integer" },
                      stimulus: { type: "string" },
                      questionStem: { type: "string" },
                      optionA: { type: "string" },
                      optionB: { type: "string" },
                      optionC: { type: "string" },
                      optionD: { type: "string" },
                      optionE: { type: "string" }
                    },
                    required: ["questionNumber", "stimulus", "questionStem", "optionA", "optionB", "optionC", "optionD", "optionE"],
                    additionalProperties: false
                  }
                }
              },
              required: ["questions"],
              additionalProperties: false
            }
          }
        }
      });

      const content_str = response.choices[0].message.content;
      const parsed = JSON.parse(content_str);
      const questions = parsed.questions || [];

      if (questions.length > 0) {
        console.log(`    → Found ${questions.length} questions on pages ${pageNums}`);
        allQuestions.push(...questions);
        questionCounter += questions.length;
      } else {
        console.log(`    → No complete questions on pages ${pageNums}`);
      }
    } catch (err) {
      console.error(`    ✗ Error on pages ${pageNums}:`, err.message);
    }

    // Small delay between chunks
    await new Promise(r => setTimeout(r, 1000));
  }

  return allQuestions;
}

function matchAnswerKey(questions, answerKey, category) {
  console.log(`\nMatching ${questions.length} questions with answer key (${answerKey.length} answers)...`);

  // Deduplicate by stimulus similarity
  const unique = [];
  const seen = new Set();
  for (const q of questions) {
    const key = q.stimulus.substring(0, 80).toLowerCase().replace(/\s+/g, ' ').trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }
  console.log(`  After dedup: ${unique.length} unique questions`);

  // Assign answer keys sequentially
  return unique.map((q, idx) => ({
    ...q,
    correctAnswer: idx < answerKey.length ? answerKey[idx] : null,
    category,
    difficulty: "medium",
    explanation: `This is a ${category} question. The correct answer is ${idx < answerKey.length ? answerKey[idx] : 'unknown'}.`,
    source: "LSAT Logical Reasoning by Type, Volume 3"
  }));
}

async function processFile(fileConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${fileConfig.name}`);
  console.log(`Category: ${fileConfig.category}`);
  console.log(`Pages: ${fileConfig.pages}`);
  console.log(`Expected questions: ${fileConfig.answerKey.length}`);
  console.log('='.repeat(60));

  // Convert PDF pages to images
  const images = await extractPagesAsImages(fileConfig.pdf, fileConfig.name, fileConfig.pages);

  // Extract questions from all pages
  console.log(`\nExtracting questions from ${images.length} pages...`);
  const rawQuestions = await extractQuestionsFromPages(images, fileConfig.category);

  console.log(`\nTotal raw questions extracted: ${rawQuestions.length}`);

  // Match with answer key
  const finalQuestions = matchAnswerKey(rawQuestions, fileConfig.answerKey, fileConfig.category);

  // Save results
  fs.writeFileSync(fileConfig.outputFile, JSON.stringify(finalQuestions, null, 2));
  console.log(`\n✓ Saved ${finalQuestions.length} questions to ${fileConfig.outputFile}`);

  return finalQuestions;
}

// Main execution
async function main() {
  console.log("Starting visual extraction for remaining batch 2 PDFs...\n");

  const results = {};

  for (const fileConfig of FILES) {
    try {
      const questions = await processFile(fileConfig);
      results[fileConfig.name] = questions.length;
    } catch (err) {
      console.error(`\n✗ Failed to process ${fileConfig.name}:`, err.message);
      results[fileConfig.name] = 0;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("EXTRACTION SUMMARY");
  console.log("=".repeat(60));
  for (const [name, count] of Object.entries(results)) {
    console.log(`  ${name}: ${count} questions`);
  }
  console.log("=".repeat(60));
}

main().catch(console.error);
