import { getQuestions, seedOriginalLogicalReasoningSamples } from "../server/db.ts";

try {
  const result = await seedOriginalLogicalReasoningSamples();
  const questions = await getQuestions(200, 0);
  const seededCount = questions.filter((question) => question.questionId.startsWith("nexus-lr-sample-")).length;
  if (seededCount !== result.total) {
    throw new Error(`Expected ${result.total} original sample questions, found ${seededCount}.`);
  }
  console.log(`Question Bank sample seed complete: ${result.inserted} inserted; ${seededCount} original samples verified.`);
  process.exit(0);
} catch (error) {
  console.error("Question Bank sample seed failed:", error);
  process.exit(1);
}
