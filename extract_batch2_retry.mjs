/**
 * Re-extract the three files that failed due to JSON truncation.
 * Uses smaller 20k char chunks to avoid LLM response truncation.
 * Run with: npx tsx extract_batch2_retry.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { invokeLLM } from "./server/_core/llm.ts";
import { execSync } from "child_process";

const ANSWER_KEY = JSON.parse(readFileSync("/home/ubuntu/batch2_answer_key.json", "utf8"));

const FILES = [
  {
    path: "/home/ubuntu/upload/LR_V.3_Inference(CompletetheArgument)(#1-14).pdf",
    label: "Inference: Complete the Argument (#1-14)",
    category: "Inference",
    questionType: "inference-complete-argument",
    answerKeySection: "complete_the_passage",
    outFile: "/home/ubuntu/batch2_extracted/inference-complete-argument.json",
  },
  {
    path: "/home/ubuntu/upload/5.ReasoningConformsToQuestions.pdf",
    label: "Reasoning Conforms To Questions",
    category: "Method of Argument",
    questionType: "method-statement",
    answerKeySection: "method_statement",
    outFile: "/home/ubuntu/batch2_extracted/method-statement.json",
  },
  {
    path: "/home/ubuntu/upload/4.SupportingPrincipleQuestions.pdf",
    label: "Supporting Principle Questions",
    category: "Principle",
    questionType: "principle-apply",
    answerKeySection: "principle_apply",
    outFile: "/home/ubuntu/batch2_extracted/principle-apply.json",
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
- Preserve the exact question numbering shown in the document
- Keep stimulus text concise — truncate at 800 characters if longer`;

const CHUNK_SIZE = 18000;

async function extractFile(fileInfo) {
  console.log(`\n=== Extracting: ${fileInfo.label} ===`);
  
  const text = execSync(`pdftotext "${fileInfo.path}" -`, { maxBuffer: 10 * 1024 * 1024 }).toString();
  console.log(`  Text: ${text.length} chars`);
  
  const chunks = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
  }
  console.log(`  Chunks: ${chunks.length}`);
  
  const allQuestions = [];
  
  for (let ci = 0; ci < chunks.length; ci++) {
    console.log(`  Chunk ${ci + 1}/${chunks.length}...`);
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Extract all complete LSAT questions from this text:\n\n${chunks[ci]}` },
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
      console.log(`    Found ${qs.length} questions`);
      allQuestions.push(...qs);
    } catch (err) {
      console.error(`    Error: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }
  
  // Deduplicate by question number
  const seen = new Map();
  for (const q of allQuestions) seen.set(q.questionNumber, q);
  const unique = Array.from(seen.values()).sort((a, b) => a.questionNumber - b.questionNumber);
  console.log(`  Unique questions: ${unique.length}`);
  
  // Match answer key
  const answerSection = ANSWER_KEY.sections[fileInfo.answerKeySection];
  const enriched = unique.map(q => {
    const idx = q.questionNumber - 1;
    const correctAnswer = answerSection && idx >= 0 && idx < answerSection.answers.length
      ? answerSection.answers[idx] : null;
    return { ...q, correctAnswer, source: fileInfo.label, category: fileInfo.category, questionType: fileInfo.questionType };
  });
  
  writeFileSync(fileInfo.outFile, JSON.stringify(enriched, null, 2));
  console.log(`  Saved ${enriched.length} questions to ${fileInfo.outFile}`);
  return enriched;
}

const allNew = [];
for (const f of FILES) {
  const qs = await extractFile(f);
  allNew.push(...qs);
}

// Merge with existing batch2_all_questions.json
const existing = JSON.parse(readFileSync("/home/ubuntu/batch2_extracted/batch2_all_questions.json", "utf8"));
const merged = [...existing, ...allNew];
writeFileSync("/home/ubuntu/batch2_extracted/batch2_all_questions.json", JSON.stringify(merged, null, 2));

console.log(`\n=== RETRY COMPLETE ===`);
console.log(`New questions added: ${allNew.length}`);
console.log(`Total in batch2_all_questions.json: ${merged.length}`);
