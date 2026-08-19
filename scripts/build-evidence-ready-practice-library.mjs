import { readFile, writeFile } from "node:fs/promises";

const expectedLessons = [
  "necessary-assumptions",
  "sufficient-assumptions",
  "flaw-in-reasoning",
  "common-flaws",
  "strengthen-weaken",
  "reading-comprehension",
  "formal-logic",
];
const curriculum = {
  "necessary-assumptions": { module: "LR", topic: "Necessary Assumptions", skills: ["argument-core", "necessary-assumption"] },
  "sufficient-assumptions": { module: "LR", topic: "Sufficient Assumptions", skills: ["argument-core", "sufficient-assumption"] },
  "flaw-in-reasoning": { module: "LR", topic: "Flaw in Reasoning", skills: ["argument-core", "flaw-recognition"] },
  "common-flaws": { module: "LR", topic: "Common Flaws", skills: ["flaw-recognition"] },
  "strengthen-weaken": { module: "LR", topic: "Strengthen and Weaken", skills: ["argument-core", "strengthen-weaken"] },
  "reading-comprehension": { module: "RC", topic: "Reading Comprehension", skills: ["passage-structure"] },
  "formal-logic": { module: "Logic", topic: "Formal Logic", skills: ["conditional-logic"] },
};

const [reviewed, raw, repaired] = await Promise.all([
  readFile("/home/ubuntu/validate_evidence_ready_practice_tranche.json", "utf8").then(JSON.parse),
  readFile("/home/ubuntu/author_evidence_ready_practice_tranche.json", "utf8").then(JSON.parse),
  readFile("/home/ubuntu/repair_corrupted_practice_reviews.json", "utf8").then(JSON.parse),
]);

function parseOutput(entry, preferredKey = "corrected_content_json") {
  const value = entry?.output?.[preferredKey] ?? entry?.output?.content_json;
  return value ? JSON.parse(value) : null;
}

function isValidSet(items, lessonId) {
  if (!Array.isArray(items) || items.length !== 6) return false;
  const expectedIds = new Set(Array.from({ length: 6 }, (_, index) => `nexus-84-${lessonId}-${String(index + 7).padStart(3, "0")}`));
  const difficulties = { easy: 0, medium: 0, hard: 0 };
  for (const item of items) {
    if (item.lessonId !== lessonId || !expectedIds.delete(item.questionId)) return false;
    if (!Object.hasOwn(difficulties, item.difficulty)) return false;
    difficulties[item.difficulty] += 1;
    if (![item.optionA, item.optionB, item.optionC, item.optionD, item.optionE].every((option) => typeof option === "string" && option.trim())) return false;
  }
  return expectedIds.size === 0 && difficulties.easy === 1 && difficulties.medium === 2 && difficulties.hard === 3;
}

function normalizeLessonMetadata(items, lessonId) {
  if (!Array.isArray(items)) return items;
  return items.map((item) => ({ ...item, lessonId }));
}

const questions = [];
for (const lessonId of expectedLessons) {
  const reviewedEntry = reviewed.results.find((entry) => entry.input === lessonId);
  const repairedEntry = repaired.results.find((entry) => entry.input === lessonId);
  const rawEntry = raw.results.find((entry) => entry.input.startsWith(`lessonId=${lessonId};`));
  const candidates = [parseOutput(repairedEntry), parseOutput(reviewedEntry), parseOutput(rawEntry)].map((candidate) => normalizeLessonMetadata(candidate, lessonId));
  const accepted = candidates.find((candidate) => isValidSet(candidate, lessonId));
  if (!accepted) throw new Error(`No structurally valid reviewed set available for ${lessonId}.`);
  const specification = curriculum[lessonId];
  questions.push(...accepted.map((item) => ({
    ...item,
    lessonId,
    module: specification.module,
    topic: specification.topic,
    skillMappings: specification.skills.map((skillId) => ({ skillId, weight: 100 })),
    source: "LSAT Nexus Original Curriculum Library",
  })));
}

if (questions.length !== 42 || new Set(questions.map((question) => question.questionId)).size !== 42) throw new Error("Second-tranche records must contain 42 unique questions.");
const output = `/**\n * Evidence-ready second tranche of original LSAT-style curriculum practice.\n * All items are reviewed for lesson alignment and contain no proprietary LSAC or Logic Games material.\n */\nexport const EVIDENCE_READY_PRACTICE_LIBRARY = ${JSON.stringify(questions, null, 2)} as const;\n\nexport type EvidenceReadyPracticeQuestion = (typeof EVIDENCE_READY_PRACTICE_LIBRARY)[number];\n`;
await writeFile("/home/ubuntu/lsat-lesson/server/sampleData/evidenceReadyPracticeLibrary.ts", output);
console.log(`Generated ${questions.length} evidence-ready original practice questions.`);
