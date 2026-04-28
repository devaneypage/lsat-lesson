/**
 * Extract LSAT questions from image-based LR II PDFs.
 * Converts each PDF page to a PNG, uploads it, then uses LLM vision to extract questions.
 * Run with: npx tsx extract_lr2_images.mjs
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, basename } from "path";
import { invokeLLM } from "./server/_core/llm.ts";

const IMAGE_PDFS = [
  {
    key: "LR_II_6b",
    path: "/home/ubuntu/upload/lr_argument_based/B. LR_ Argument-Based Questions (Subjective)/LR_II_6b_ Flaw Questions (#73-80).pdf",
    source: "LR_II_6b_Flaw_Questions",
    lesson: "Flaw Questions",
    defaultType: "Flaw",
  },
  {
    key: "LR_II_7_8",
    path: "/home/ubuntu/upload/lr_argument_based/B. LR_ Argument-Based Questions (Subjective)/LR_II_7+8_ Strengthen & Weaken Questions (#81-92).pdf",
    source: "LR_II_7_8_Strengthen_Weaken",
    lesson: "Strengthen & Weaken Questions",
    defaultType: "Strengthen/Weaken",
  },
  {
    key: "LR_II_10",
    path: "/home/ubuntu/upload/lr_argument_based/B. LR_ Argument-Based Questions (Subjective)/LR_II_10_ Subjective Argument-Based Question Set (Review 1).pdf",
    source: "LR_II_10_Review_1",
    lesson: "Subjective Argument-Based Questions Review 1",
    defaultType: "Assumption",
  },
  {
    key: "LR_II_11",
    path: "/home/ubuntu/upload/lr_argument_based/B. LR_ Argument-Based Questions (Subjective)/LR_II_11_ Subjective Argument-Based Question Set (Review 2) .pdf",
    source: "LR_II_11_Review_2",
    lesson: "Subjective Argument-Based Questions Review 2",
    defaultType: "Assumption",
  },
  {
    key: "LR_II_17",
    path: "/home/ubuntu/upload/lr_argument_based/B. LR_ Argument-Based Questions (Subjective)/LR_II_17_Flaw & Match the Flaw Question Set.pdf",
    source: "LR_II_17_Flaw_Match_Flaw",
    lesson: "Flaw & Match the Flaw Questions",
    defaultType: "Flaw",
  },
  {
    key: "LR_II_b",
    path: "/home/ubuntu/upload/lr_argument_based/B. LR_ Argument-Based Questions (Subjective)/LR_II_b_ One Argument & Ten Answers Drill Set.pdf",
    source: "LR_II_b_One_Argument_Ten_Answers",
    lesson: "One Argument & Ten Answers Drill",
    defaultType: "Flaw",
  },
  {
    key: "LR_II_c",
    path: "/home/ubuntu/upload/lr_argument_based/B. LR_ Argument-Based Questions (Subjective)/LR_II_c_ (Mixed) Assumption, Flaw, and Strengthen_Weaken Question Pool (Additional Practice) (#65-84).pdf",
    source: "LR_II_c_Mixed_Pool",
    lesson: "Mixed Assumption, Flaw, and Strengthen/Weaken Question Pool",
    defaultType: "Assumption",
  },
  {
    key: "LR_II_d",
    path: "/home/ubuntu/upload/lr_argument_based/B. LR_ Argument-Based Questions (Subjective)/LR_II_d_ Argument-Based Questions (Review _ Objective & Subjective) Question Set.pdf",
    source: "LR_II_d_Review_Objective_Subjective",
    lesson: "Argument-Based Questions Review (Objective & Subjective)",
    defaultType: "Assumption",
  },
];

const SYSTEM_PROMPT = `You are an expert LSAT question extractor. Extract all complete LSAT practice questions visible in this image.

For each question, extract:
- stimulus: The argument/passage text (the paragraph before the question stem)
- question_stem: The actual question being asked
- answer_a through answer_e: The five answer choices (text only, no letter prefix)
- correct_answer: The letter of the correct answer (A, B, C, D, or E) — look for bold, highlighted, circled, or starred answers; null if not shown
- difficulty: "medium" by default
- source_reference: Any PT/PrepTest citation visible (e.g., "PT57, Sec3 Q24") or question number
- question_type: One of: "Necessary Assumption", "Sufficient Assumption", "Flaw", "Match Flaw", "Strengthen", "Weaken", "Main Point", "Inference", "Method of Argument", "Role of Statement", "Point at Issue"

Return a JSON array. If no complete questions are visible, return an empty array [].
Return ONLY the JSON array, no markdown fences or other text.`;

async function convertPdfToImages(pdfPath, outputDir) {
  mkdirSync(outputDir, { recursive: true });
  // Convert PDF pages to PNG images at 150 DPI
  execSync(
    `pdftoppm -r 150 -png "${pdfPath}" "${outputDir}/page"`,
    { stdio: "pipe" }
  );
  // List generated images
  const files = execSync(`ls "${outputDir}"/page-*.png 2>/dev/null || ls "${outputDir}"/page*.png 2>/dev/null`, { encoding: "utf-8" })
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();
  return files;
}

async function extractFromImage(imagePath, pageNum, totalPages) {
  const imageData = readFileSync(imagePath);
  const base64 = imageData.toString("base64");
  const mimeType = "image/png";
  
  const response = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract all LSAT practice questions from this page (page ${pageNum} of ${totalPages}):`,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
  });
  
  let content = response.choices[0].message.content.trim();
  
  // Strip markdown fences if present
  if (content.startsWith("```")) {
    const parts = content.split("```");
    content = parts[1] || parts[0];
    if (content.startsWith("json")) content = content.slice(4);
    content = content.trim();
  }
  
  return JSON.parse(content);
}

async function extractFromPdf(meta) {
  const outputDir = `/tmp/lr2_images/${meta.key}`;
  console.log(`  Converting PDF to images...`);
  
  let imageFiles;
  try {
    imageFiles = await convertPdfToImages(meta.path, outputDir);
  } catch (err) {
    console.error(`  ERROR converting PDF: ${err.message}`);
    return [];
  }
  
  console.log(`  Found ${imageFiles.length} pages`);
  const allQuestions = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imagePath = imageFiles[i];
    console.log(`  Page ${i + 1}/${imageFiles.length}: ${basename(imagePath)}`);
    
    try {
      const questions = await extractFromImage(imagePath, i + 1, imageFiles.length);
      console.log(`    Found ${questions.length} questions`);
      
      for (const q of questions) {
        q.source = meta.source;
        q.unit = "LR II";
        q.lesson = meta.lesson;
        if (!q.question_type) q.question_type = meta.defaultType;
      }
      
      allQuestions.push(...questions);
    } catch (err) {
      console.error(`    ERROR on page ${i + 1}: ${err.message}`);
    }
  }
  
  return allQuestions;
}

async function main() {
  console.log("=== LR II Image PDF Question Extraction ===\n");
  const allQuestions = [];
  
  for (const meta of IMAGE_PDFS) {
    console.log(`\n[${meta.key}]`);
    const questions = await extractFromPdf(meta);
    allQuestions.push(...questions);
    console.log(`  Subtotal for ${meta.key}: ${questions.length} | Running total: ${allQuestions.length}`);
  }
  
  console.log(`\n=== TOTAL: ${allQuestions.length} questions extracted from image PDFs ===`);
  
  writeFileSync(
    "/home/ubuntu/lr2_questions_image_pdfs.json",
    JSON.stringify(allQuestions, null, 2)
  );
  console.log("Saved to /home/ubuntu/lr2_questions_image_pdfs.json");
}

main().catch(console.error);
