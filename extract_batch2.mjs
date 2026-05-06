/**
 * Extract questions from all Batch 2 text-based PDFs with answer key matching.
 * Files: Resolve the Paradox, Inference subtypes, Reasoning Conforms To, Supporting Principle
 * Run with: npx tsx extract_batch2.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { invokeLLM } from "./server/_core/llm.ts";
import { execSync } from "child_process";

const OUT_DIR = "/home/ubuntu/batch2_extracted";
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// Answer key data
const ANSWER_KEY = JSON.parse(readFileSync("/home/ubuntu/batch2_answer_key.json", "utf8"));

const FILES = [
  {
    path: "/home/ubuntu/upload/LR_V.3_ResolvetheParadox(#1-71).pdf",
    label: "Resolve the Paradox (#1-71)",
    category: "Resolve the Paradox",
    questionType: "resolve-paradox",
    answerKeySection: "paradox",
    startNum: 1,
  },
  {
    path: "/home/ubuntu/upload/6.ResolvetheParadoxQuestions.pdf",
    label: "Resolve the Paradox Questions (Lesson Set)",
    category: "Resolve the Paradox",
    questionType: "resolve-paradox",
    answerKeySection: "paradox",
    startNum: null, // numbered independently
  },
  {
    path: "/home/ubuntu/upload/LR_V.3_Inference(MustBeTrue)(#1-50).pdf",
    label: "Inference: Must Be True (#1-50)",
    category: "Inference",
    questionType: "inference-must-be-true",
    answerKeySection: "must_be_true",
    startNum: 1,
  },
  {
    path: "/home/ubuntu/upload/LR_V.3_Inference(MostStronglySupported)(#1-62).pdf",
    label: "Inference: Most Strongly Supported (#1-62)",
    category: "Inference",
    questionType: "inference-most-strongly-supported",
    answerKeySection: "most_strongly_supported",
    startNum: 1,
  },
  {
    path: "/home/ubuntu/upload/LR_V.3_Inference(CannotBeTrue)(#1-13).pdf",
    label: "Inference: Cannot Be True (#1-13)",
    category: "Inference",
    questionType: "inference-cannot-be-true",
    answerKeySection: "cannot_be_true",
    startNum: 1,
  },
  {
    path: "/home/ubuntu/upload/LR_V.3_Inference(CompletetheArgument)(#1-14).pdf",
    label: "Inference: Complete the Argument (#1-14)",
    category: "Inference",
    questionType: "inference-complete-argument",
    answerKeySection: "complete_the_passage",
    startNum: 1,
  },
  {
    path: "/home/ubuntu/upload/5.ReasoningConformsToQuestions.pdf",
    label: "Reasoning Conforms To Questions",
    category: "Method of Argument",
    questionType: "method-statement",
    answerKeySection: "method_statement",
    startNum: null,
  },
  {
    path: "/home/ubuntu/upload/4.SupportingPrincipleQuestions.pdf",
    label: "Supporting Principle Questions",
    category: "Principle",
    questionType: "principle-apply",
    answerKeySection: "principle_apply",
    startNum: null,
  },
];

const SYSTEM_PROMPT = `You are an expert LSAT question extractor. Extract ALL complete multiple-choice questions from the provided text.

Each question has:
1. A stimulus (passage/argument text)
2. A question stem (the actual question)
3. Five answer choices labeled (A) through (E)

Return a JSON object with a "questions" array. Each question object must have:
- questionNumber: integer (the number shown before the question, or sequential if not numbered)
- stimulus: the full passage/argument text (may be shared across multiple questions)
- questionStem: the question being asked
- optionA: text of choice A (without the "(A)" prefix)
- optionB: text of choice B (without the "(B)" prefix)
- optionC: text of choice C (without the "(C)" prefix)
- optionD: text of choice D (without the "(D)" prefix)
- optionE: text of choice E (without the "(E)" prefix)

IMPORTANT:
- Include ONLY questions that have all 5 answer choices present
- If a stimulus is shared by multiple questions, repeat it for each question
- Do not include lesson text, explanations, or headers — only the actual practice questions
- Preserve the exact question numbering shown in the document`;

async function extractFromPDF(fileInfo) {
  console.log(`\n=== Extracting: ${fileInfo.label} ===`);
  
  // Extract text using pdftotext
  let text;
  try {
    text = execSync(`pdftotext "${fileInfo.path}" -`, { maxBuffer: 10 * 1024 * 1024 }).toString();
  } catch (err) {
    console.error(`  Failed to extract text: ${err.message}`);
    return [];
  }
  
  if (text.trim().length < 100) {
    console.log(`  Skipping — insufficient text (${text.trim().length} chars)`);
    return [];
  }
  
  console.log(`  Text extracted: ${text.length} chars`);
  
  // Split into chunks if very long (>40k chars)
  const CHUNK_SIZE = 38000;
  const chunks = [];
  if (text.length > CHUNK_SIZE) {
    for (let i = 0; i < text.length; i += CHUNK_SIZE) {
      chunks.push(text.slice(i, i + CHUNK_SIZE));
    }
  } else {
    chunks.push(text);
  }
  
  console.log(`  Processing ${chunks.length} chunk(s)...`);
  
  const allQuestions = [];
  
  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    console.log(`  Chunk ${ci + 1}/${chunks.length} (${chunk.length} chars)...`);
    
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Extract all complete LSAT questions from this text:\n\n${chunk}` },
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
                      optionE: { type: "string" },
                    },
                    required: ["questionNumber", "stimulus", "questionStem", "optionA", "optionB", "optionC", "optionD", "optionE"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        },
      });
      
      const content = response.choices?.[0]?.message?.content ?? "{}";
      const result = JSON.parse(content);
      const qs = result.questions ?? [];
      console.log(`    Found ${qs.length} questions in chunk ${ci + 1}`);
      allQuestions.push(...qs);
    } catch (err) {
      console.error(`    Chunk ${ci + 1} error: ${err.message}`);
    }
    
    await new Promise(r => setTimeout(r, 800));
  }
  
  // Deduplicate by question number (keep last seen)
  const seen = new Map();
  for (const q of allQuestions) {
    seen.set(q.questionNumber, q);
  }
  const unique = Array.from(seen.values()).sort((a, b) => a.questionNumber - b.questionNumber);
  console.log(`  Total unique questions: ${unique.length}`);
  
  // Match with answer key
  const answerSection = ANSWER_KEY.sections[fileInfo.answerKeySection];
  const enriched = unique.map(q => {
    const idx = q.questionNumber - 1;
    const correctAnswer = answerSection && idx >= 0 && idx < answerSection.answers.length
      ? answerSection.answers[idx]
      : null;
    return {
      ...q,
      correctAnswer,
      source: fileInfo.label,
      category: fileInfo.category,
      questionType: fileInfo.questionType,
    };
  });
  
  const withAnswers = enriched.filter(q => q.correctAnswer !== null);
  const withoutAnswers = enriched.filter(q => q.correctAnswer === null);
  console.log(`  Matched with answer key: ${withAnswers.length}/${enriched.length}`);
  if (withoutAnswers.length > 0) {
    console.log(`  Missing answers for Q#: ${withoutAnswers.map(q => q.questionNumber).join(", ")}`);
  }
  
  return enriched;
}

// Main extraction loop
const allExtracted = [];

for (const fileInfo of FILES) {
  const questions = await extractFromPDF(fileInfo);
  allExtracted.push(...questions);
  
  // Save intermediate results
  const safeName = fileInfo.questionType.replace(/[^a-z0-9-]/g, "_");
  writeFileSync(`${OUT_DIR}/${safeName}.json`, JSON.stringify(questions, null, 2));
  console.log(`  Saved to ${OUT_DIR}/${safeName}.json`);
}

// Save combined output
const outPath = `${OUT_DIR}/batch2_all_questions.json`;
writeFileSync(outPath, JSON.stringify(allExtracted, null, 2));

console.log(`\n=== EXTRACTION COMPLETE ===`);
console.log(`Total questions extracted: ${allExtracted.length}`);
console.log(`With answer keys: ${allExtracted.filter(q => q.correctAnswer).length}`);
console.log(`Saved to: ${outPath}`);

// Summary by type
const byType = allExtracted.reduce((acc, q) => {
  acc[q.questionType] = (acc[q.questionType] || 0) + 1;
  return acc;
}, {});
console.log("\nBy question type:");
for (const [type, count] of Object.entries(byType)) {
  console.log(`  ${type}: ${count}`);
}
