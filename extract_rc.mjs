/**
 * Extract LSAT RC practice questions from image-based PDFs.
 * Converts each PDF page to an image, then uses LLM vision to extract questions.
 * Run with: npx tsx extract_rc.mjs
 */
import { execSync, spawnSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { invokeLLM } from "./server/_core/llm.ts";

const BASE = "/home/ubuntu/upload/rc_materials/III. READING COMPREHENSION";
const OUT_DIR = "/home/ubuntu/rc_extracted";
const IMG_DIR = "/home/ubuntu/rc_page_images";
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(IMG_DIR, { recursive: true });

// Question-containing files to process
const QUESTION_FILES = [
  {
    file: "RC_35_ Question in Categories Drill Set (@LSAT).pdf",
    source: "RC – RC_35 Questions in Categories Drill Set",
    pages: 4,
  },
  {
    file: "RC_38_ Sample RC Section.pdf",
    source: "RC – RC_38 Sample RC Section",
    pages: 8,
  },
  {
    file: "RC_40_ Passage Types & Question Types Practice Set (@KapPrem).pdf",
    source: "RC – RC_40 Passage Types & Question Types Practice Set",
    pages: 12,
  },
  {
    file: "RC_23_ Reading Strategies Mini Drill Set.pdf",
    source: "RC – RC_23 Reading Strategies Mini Drill Set",
    pages: 2,
  },
  {
    file: "RC_25_ Practice Set II (Comparative).pdf",
    source: "RC – RC_25 Comparative Passages Practice Set II",
    pages: 2,
  },
];

const SYSTEM_PROMPT = `You are an expert LSAT Reading Comprehension question extractor.

You will receive images of LSAT RC pages. Each page may contain:
1. A reading passage (the stimulus text students read)
2. Multiple questions about the passage, each with 5 answer choices (A-E)

Your task: Extract ALL complete RC questions from the images.

For each question, return a JSON object with:
- questionId: sequential ID like "RC-001", "RC-002" (I will renumber later)
- passageText: the FULL passage text that this question refers to (copy the entire passage)
- questionStem: the question being asked (e.g., "Which one of the following most accurately states the main point of the passage?")
- answerChoices: array of exactly 5 strings, each starting with "(A)", "(B)", "(C)", "(D)", "(E)"
- correctAnswer: the letter of the correct answer IF shown/marked (otherwise null)
- explanation: any explanation or analysis provided (otherwise null)
- difficulty: "Easy", "Medium", or "Hard" based on question type
- category: the RC question type — one of: "Main Idea", "Detail", "Inference", "Author's Opinion", "Structure", "Analogy", "Vocabulary in Context", "Comparative"
- passageSource: the source citation if shown (e.g., "Practice Test 29, Passage 1")

IMPORTANT RULES:
1. Include the FULL passage text in passageText for EVERY question — even if it's repeated
2. Only include questions that have a complete passage + question stem + 5 answer choices
3. Do NOT include lesson text, strategy tips, or incomplete questions
4. If a page shows questions continuing from a previous passage, include that passage text too
5. RC question categories: Main Idea (main point/summary), Detail (according to passage), Inference (most likely/can be inferred), Author's Opinion (author believes/would agree), Structure (author's purpose/organization), Analogy (most analogous/parallel), Vocabulary in Context (as used in line X)

Return ONLY a JSON array. If no complete questions found, return [].`;

async function convertPdfToImages(pdfPath, fileSlug) {
  const outDir = `${IMG_DIR}/${fileSlug}`;
  mkdirSync(outDir, { recursive: true });
  
  // Convert PDF pages to PNG images using pdftoppm
  const result = spawnSync("pdftoppm", [
    "-r", "150",  // 150 DPI — good balance of quality vs size
    "-png",
    pdfPath,
    `${outDir}/page`,
  ]);
  
  if (result.status !== 0) {
    console.error(`  pdftoppm failed: ${result.stderr?.toString()}`);
    return [];
  }
  
  // List generated images
  const images = execSync(`ls ${outDir}/page-*.png 2>/dev/null || ls ${outDir}/page*.png 2>/dev/null`, { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();
  
  return images;
}

async function imageToBase64(imagePath) {
  const data = readFileSync(imagePath);
  return data.toString("base64");
}

async function extractFromImages(images, fileInfo, batchOffset = 0) {
  console.log(`  Processing ${images.length} pages...`);
  
  // Process pages in batches of 2 (to stay within context limits)
  const allQuestions = [];
  const batchSize = 2;
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    console.log(`    Pages ${i + 1}-${Math.min(i + batchSize, images.length)}...`);
    
    // Build content array with images
    const content = [
      {
        type: "text",
        text: `Source: ${fileInfo.source}\nExtract all complete RC questions from these pages. Remember to include the FULL passage text with each question.`,
      },
    ];
    
    for (const imgPath of batch) {
      const base64 = await imageToBase64(imgPath);
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${base64}`,
          detail: "high",
        },
      });
    }
    
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
        response_format: { type: "json_object" },
      });
      
      const rawContent = response.choices?.[0]?.message?.content ?? "[]";
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        const match = rawContent.match(/\[[\s\S]*\]/);
        parsed = match ? JSON.parse(match[0]) : [];
      }
      
      const questions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);
      console.log(`      Found ${questions.length} questions in this batch`);
      allQuestions.push(...questions);
    } catch (err) {
      console.error(`      Batch failed: ${err.message}`);
    }
    
    // Small delay between batches
    await new Promise(r => setTimeout(r, 1000));
  }
  
  // Renumber and add source
  return allQuestions.map((q, i) => ({
    ...q,
    questionId: `RC-${String(batchOffset + i + 1).padStart(3, "0")}`,
    source: fileInfo.source,
  }));
}

async function main() {
  console.log("=== RC Image-Based PDF Extraction ===\n");
  
  const allQuestions = [];
  
  for (const fileInfo of QUESTION_FILES) {
    const filePath = `${BASE}/${fileInfo.file}`;
    console.log(`\nProcessing: ${fileInfo.file}`);
    
    // Convert PDF to images
    const fileSlug = fileInfo.file.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
    const images = await convertPdfToImages(filePath, fileSlug);
    
    if (images.length === 0) {
      console.log("  No images generated, skipping");
      continue;
    }
    
    console.log(`  Generated ${images.length} page images`);
    
    // Extract questions from images
    const questions = await extractFromImages(images, fileInfo, allQuestions.length);
    allQuestions.push(...questions);
    
    console.log(`  Total from this file: ${questions.length}`);
  }
  
  console.log(`\n\nTotal RC questions extracted: ${allQuestions.length}`);
  
  // Save to JSON
  const outPath = `${OUT_DIR}/rc_questions.json`;
  writeFileSync(outPath, JSON.stringify(allQuestions, null, 2));
  console.log(`Saved to: ${outPath}`);
  
  // Category breakdown
  const cats = allQuestions.reduce((acc, q) => {
    acc[q.category || "Unknown"] = (acc[q.category || "Unknown"] || 0) + 1;
    return acc;
  }, {});
  console.log("\nCategory breakdown:", cats);
}

main().catch(console.error);
