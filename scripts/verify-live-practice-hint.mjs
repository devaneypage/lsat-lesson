import { getPracticeQuestionHintContext } from "../server/repositories/practiceHints.ts";
import { generatePracticeHint } from "../server/practiceHints.ts";

const questionId = 60003;
const context = await getPracticeQuestionHintContext(questionId);
if (!context) throw new Error(`Missing persisted practice question ${questionId}.`);
const hint = await generatePracticeHint(context);
if (!hint || /\b(correct\s+(?:answer|option|choice)|answer\s*(?:is|:)|option\s*[A-E]\b|choice\s*[A-E]\b|[A-E]\s+(?:is\s+)?(?:correct|right))\b/i.test(hint)) {
  throw new Error("Live hint failed the answer-safety verification.");
}
console.log(JSON.stringify({ questionId, hint }, null, 2));
