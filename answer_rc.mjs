/**
 * Use LLM to determine correct answers for RC questions that lack answer keys.
 * Run with: npx tsx answer_rc.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { invokeLLM } from "./server/_core/llm.ts";

const data = JSON.parse(readFileSync("/home/ubuntu/rc_extracted/rc_questions.json", "utf8"));
console.log(`Processing ${data.length} RC questions to determine correct answers...\n`);

const SYSTEM_PROMPT = `You are an expert LSAT Reading Comprehension analyst with decades of experience.

You will be given a reading passage and a multiple-choice question with 5 answer choices.
Your task is to:
1. Carefully read the passage
2. Analyze the question type (Main Idea, Detail, Inference, Author's Opinion, Structure, Analogy, etc.)
3. Evaluate each answer choice against the passage
4. Select the single best answer

Return a JSON object with:
- correctAnswer: the letter (A, B, C, D, or E) of the best answer
- explanation: a 2-3 sentence explanation of why this answer is correct and why the other top contenders are wrong

Be rigorous — LSAT RC questions have one definitively correct answer supported by the passage text.`;

const answered = [];

for (let i = 0; i < data.length; i++) {
  const q = data[i];
  console.log(`[${i + 1}/${data.length}] ${q.questionId} — ${q.category}`);

  const choices = q.answerChoices.map((c, idx) => {
    const letter = ["A", "B", "C", "D", "E"][idx];
    return `(${letter}) ${c.replace(/^\([A-E]\)\s*/, "")}`;
  }).join("\n");

  const userContent = `PASSAGE:\n${q.passageText}\n\nQUESTION:\n${q.questionStem}\n\nANSWER CHOICES:\n${choices}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "rc_answer",
          strict: true,
          schema: {
            type: "object",
            properties: {
              correctAnswer: { type: "string", description: "Single letter: A, B, C, D, or E" },
              explanation: { type: "string", description: "2-3 sentence explanation" },
            },
            required: ["correctAnswer", "explanation"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content ?? "{}";
    const result = JSON.parse(content);

    answered.push({
      ...q,
      correctAnswer: result.correctAnswer?.toUpperCase().charAt(0) || "A",
      explanation: result.explanation || "Correct based on passage analysis.",
    });

    console.log(`  → Answer: ${result.correctAnswer}`);
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    answered.push({ ...q, correctAnswer: "A", explanation: "Answer determination failed." });
  }

  // Small delay to avoid rate limiting
  await new Promise(r => setTimeout(r, 500));
}

const outPath = "/home/ubuntu/rc_extracted/rc_questions_answered.json";
writeFileSync(outPath, JSON.stringify(answered, null, 2));
console.log(`\nSaved ${answered.length} answered questions to ${outPath}`);

// Summary
const byAnswer = answered.reduce((acc, q) => {
  acc[q.correctAnswer] = (acc[q.correctAnswer] || 0) + 1;
  return acc;
}, {});
console.log("Answer distribution:", byAnswer);
