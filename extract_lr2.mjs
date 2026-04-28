/**
 * Extract LSAT questions from LR II text-based PDFs using the project's LLM helper.
 * Run with: node extract_lr2.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { invokeLLM } from "./server/_core/llm.ts";

// We need tsx to handle TS imports — this script is run via tsx

const TEXT_FILES = [
  {
    key: "LR_II_3",
    path: "/home/ubuntu/lr2_text/LR_II_3_Lesson_Practice_Identifying_Common_Patterns_in_Overlooked_Possibilities_24_41_.txt",
    source: "LR_II_3_Overlooked_Possibilities",
    lesson: "Overlooked Possibilities / Necessary Assumption",
    defaultType: "Necessary Assumption",
  },
  {
    key: "LR_II_5",
    path: "/home/ubuntu/lr2_text/LR_II_5_Sufficient_Necessary_Assumption_Questions_Guided_Practice_42_54_.txt",
    source: "LR_II_5_Assumption_Guided_Practice",
    lesson: "Sufficient & Necessary Assumption Questions",
    defaultType: "Assumption",
  },
  {
    key: "LR_II_6a",
    path: "/home/ubuntu/lr2_text/LR_II_6a_Flaw_Questions_Guided_Practice_55_60_.txt",
    source: "LR_II_6a_Flaw_Guided_Practice",
    lesson: "Flaw Questions",
    defaultType: "Flaw",
  },
  {
    key: "LR_II_a",
    path: "/home/ubuntu/lr2_text/LR_II_a_What_s_Wrong_with_the_Argument_Drill_LSAT_.txt",
    source: "LR_II_a_Whats_Wrong_Drill",
    lesson: "What's Wrong with the Argument Drill",
    defaultType: "Flaw",
  },
  {
    key: "LR_MHP",
    path: "/home/ubuntu/lr2_text/LR_Necessary_Sufficient_Assumption_Questions_MHP_.txt",
    source: "LR_Necessary_Sufficient_MHP",
    lesson: "Necessary & Sufficient Assumption Questions",
    defaultType: "Assumption",
  },
  {
    key: "LR_II_Intro",
    path: "/home/ubuntu/lr2_text/_LR_II_Introduction_to_Assumption_Family_Questions_Mismatched_Concepts_Overlooked_Possibilities_Lesson_Practice_.txt",
    source: "LR_II_Intro_Assumption_Family",
    lesson: "Introduction to Assumption Family Questions",
    defaultType: "Assumption",
  },
];

const SYSTEM_PROMPT = `You are an expert LSAT question extractor. Extract all LSAT practice questions from the provided text.

For each question, extract:
- stimulus: The argument/passage text (the paragraph before the question stem)
- question_stem: The actual question being asked
- answer_a through answer_e: The five answer choices (text only, no letter prefix)
- correct_answer: The letter of the correct answer (A, B, C, D, or E) — look for bold text, highlighted text, or explicit answer keys
- difficulty: "medium" by default
- source_reference: Any PT/PrepTest citation (e.g., "PT57, Sec3 Q24")
- question_type: The specific question type (e.g., "Necessary Assumption", "Sufficient Assumption", "Flaw", "Strengthen", "Weaken", "Main Point", "Inference", "Method of Argument", "Role of Statement", "Point at Issue", "Match Flaw")

Return a JSON array of question objects with exactly these keys:
stimulus, question_stem, answer_a, answer_b, answer_c, answer_d, answer_e, correct_answer, difficulty, source_reference, question_type

Rules:
- If you cannot determine the correct answer, set correct_answer to null
- If a question is incomplete (missing stimulus or answer choices), skip it
- Do NOT include lesson content, instructions, or analysis — only actual practice questions
- Return ONLY the JSON array, no markdown fences or other text`;

async function extractFromFile(meta) {
  const text = readFileSync(meta.path, "utf-8");
  
  if (text.trim().length < 50) {
    console.log(`  SKIP ${meta.key}: too little text (${text.length} chars)`);
    return [];
  }
  
  console.log(`  Processing ${meta.key}: ${text.length} chars`);
  
  // Split into chunks if needed (max ~12000 chars per call)
  const chunks = [];
  const chunkSize = 12000;
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  
  const allQuestions = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`    Chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`);
    
    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Extract all LSAT practice questions from this text (source: ${meta.key}):\n\n${chunk}`,
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
      
      const questions = JSON.parse(content);
      console.log(`    Found ${questions.length} questions`);
      
      for (const q of questions) {
        q.source = meta.source;
        q.unit = "LR II";
        q.lesson = meta.lesson;
        if (!q.question_type) q.question_type = meta.defaultType;
      }
      
      allQuestions.push(...questions);
    } catch (err) {
      console.error(`    ERROR in chunk ${i + 1}: ${err.message}`);
    }
  }
  
  return allQuestions;
}

async function main() {
  console.log("=== LR II Text PDF Question Extraction ===\n");
  const allQuestions = [];
  
  for (const meta of TEXT_FILES) {
    console.log(`\n[${meta.key}]`);
    const questions = await extractFromFile(meta);
    allQuestions.push(...questions);
    console.log(`  Total so far: ${allQuestions.length}`);
  }
  
  console.log(`\n=== TOTAL: ${allQuestions.length} questions extracted ===`);
  
  writeFileSync(
    "/home/ubuntu/lr2_questions_text_pdfs.json",
    JSON.stringify(allQuestions, null, 2)
  );
  console.log("Saved to /home/ubuntu/lr2_questions_text_pdfs.json");
}

main().catch(console.error);
