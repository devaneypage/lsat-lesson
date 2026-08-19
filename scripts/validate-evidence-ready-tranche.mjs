import { readFile } from "node:fs/promises";

const file = process.argv[2] ?? "/home/ubuntu/validate_evidence_ready_practice_tranche.json";
const expectedLessons = [
  "necessary-assumptions",
  "sufficient-assumptions",
  "flaw-in-reasoning",
  "common-flaws",
  "strengthen-weaken",
  "reading-comprehension",
  "formal-logic",
];
const data = JSON.parse(await readFile(file, "utf8"));
const problems = [];
for (const expectedLesson of expectedLessons) {
  const result = data.results.find((entry) => entry.input === expectedLesson || entry.input?.startsWith(`lessonId=${expectedLesson};`));
  const contentJson = result?.output?.corrected_content_json ?? result?.output?.content_json;
  if (!contentJson) {
    problems.push(`${expectedLesson}: missing content`);
    continue;
  }
  const questions = JSON.parse(contentJson);
  if (questions.length !== 6) problems.push(`${expectedLesson}: expected 6 questions, found ${questions.length}`);
  const expectedIds = new Set(Array.from({ length: 6 }, (_, index) => `nexus-84-${expectedLesson}-${String(index + 7).padStart(3, "0")}`));
  const counts = { easy: 0, medium: 0, hard: 0 };
  for (const question of questions) {
    if (question.lessonId !== expectedLesson) problems.push(`${expectedLesson}: ${question.questionId} declares lessonId ${question.lessonId}`);
    if (!expectedIds.delete(question.questionId)) problems.push(`${expectedLesson}: unexpected or duplicate ID ${question.questionId}`);
    if (!["easy", "medium", "hard"].includes(question.difficulty)) problems.push(`${expectedLesson}: ${question.questionId} invalid difficulty`);
    else counts[question.difficulty] += 1;
    if (![question.optionA, question.optionB, question.optionC, question.optionD, question.optionE].every((option) => typeof option === "string" && option.trim())) problems.push(`${expectedLesson}: ${question.questionId} has empty options`);
  }
  if (expectedIds.size) problems.push(`${expectedLesson}: missing IDs ${[...expectedIds].join(", ")}`);
  if (counts.easy !== 1 || counts.medium !== 2 || counts.hard !== 3) problems.push(`${expectedLesson}: invalid difficulty counts ${JSON.stringify(counts)}`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log("All seven reviewed second-tranche sets satisfy the structural integrity contract.");
}
