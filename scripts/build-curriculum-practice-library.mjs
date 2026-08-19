import { readFile, writeFile } from "node:fs/promises";

const sourcePath = "/home/ubuntu/validate_cross_curriculum_practice_sets.json";
const outputPath = "/home/ubuntu/lsat-lesson/server/sampleData/curriculumPracticeLibrary.ts";

const curriculum = {
  "necessary-assumptions": { module: "LR", topic: "Necessary Assumptions", skills: ["argument-core", "necessary-assumption"] },
  "sufficient-assumptions": { module: "LR", topic: "Sufficient Assumptions", skills: ["argument-core", "sufficient-assumption"] },
  "flaw-in-reasoning": { module: "LR", topic: "Flaw in Reasoning", skills: ["argument-core", "flaw-recognition"] },
  "common-flaws": { module: "LR", topic: "Common Flaws", skills: ["flaw-recognition"] },
  "strengthen-weaken": { module: "LR", topic: "Strengthen and Weaken", skills: ["argument-core", "strengthen-weaken"] },
  "reading-comprehension": { module: "RC", topic: "Reading Comprehension", skills: ["passage-structure"] },
  "formal-logic": { module: "Logic", topic: "Formal Logic", skills: ["conditional-logic"] },
};

const reviewed = JSON.parse(await readFile(sourcePath, "utf8"));
const questions = reviewed.results.flatMap(({ output }) => JSON.parse(output.corrected_content_json)).map((item) => {
  const specification = curriculum[item.lessonId];
  if (!specification) throw new Error(`Unknown lesson: ${item.lessonId}`);
  return {
    ...item,
    module: specification.module,
    topic: specification.topic,
    skillMappings: specification.skills.map((skillId) => ({ skillId, weight: 100 })),
    source: "LSAT Nexus Original Curriculum Library",
  };
});

if (questions.length !== 42) throw new Error(`Expected 42 questions, received ${questions.length}`);
const ids = new Set(questions.map((question) => question.questionId));
if (ids.size !== questions.length) throw new Error("Question IDs must be unique");
for (const [lessonId, specification] of Object.entries(curriculum)) {
  const lessonQuestions = questions.filter((question) => question.lessonId === lessonId);
  if (lessonQuestions.length !== 6) throw new Error(`${lessonId} requires exactly six questions`);
  const difficultyCounts = Object.fromEntries(["easy", "medium", "hard"].map((difficulty) => [difficulty, lessonQuestions.filter((question) => question.difficulty === difficulty).length]));
  if (difficultyCounts.easy !== 2 || difficultyCounts.medium !== 3 || difficultyCounts.hard !== 1) throw new Error(`${lessonId} has an invalid difficulty distribution`);
  for (const question of lessonQuestions) {
    if (question.module !== specification.module || !question.questionText?.trim() || !question.explanation?.trim()) throw new Error(`${question.questionId} has incomplete curriculum metadata`);
    const options = [question.optionA, question.optionB, question.optionC, question.optionD, question.optionE];
    if (options.some((option) => !option?.trim()) || !/[A-E]/.test(question.correctAnswer)) throw new Error(`${question.questionId} has invalid answer choices`);
    if (/logic games?/i.test(`${question.questionText} ${question.explanation}`)) throw new Error(`${question.questionId} includes excluded content`);
  }
}

const source = `/**\n * Original LSAT-style curriculum practice library.\n * All items were independently authored and reviewed for lesson alignment.\n * They contain no proprietary LSAC material and no Logic Games content.\n */\nexport const CURRICULUM_PRACTICE_LIBRARY = ${JSON.stringify(questions, null, 2)} as const;\n\nexport type CurriculumPracticeQuestion = (typeof CURRICULUM_PRACTICE_LIBRARY)[number];\n\nexport const CURRICULUM_PRACTICE_LIBRARY_SOURCE = "LSAT Nexus Original Curriculum Library";\n`;
await writeFile(outputPath, source);
console.log(`Generated ${questions.length} original curriculum practice questions.`);
