import { readFile, writeFile } from "node:fs/promises";

const libraryPath = "/home/ubuntu/lsat-lesson/server/sampleData/evidenceReadyPracticeLibrary.ts";
const repairs = JSON.parse(await readFile("/home/ubuntu/repair_duplicate_advanced_practice_items.json", "utf8"));
const finalRepair = JSON.parse(await readFile("/home/ubuntu/repair_remaining_flaw_duplicate.json", "utf8"));
const expectedIds = new Set([
  "nexus-84-necessary-assumptions-009",
  "nexus-84-necessary-assumptions-010",
  "nexus-84-flaw-in-reasoning-007",
  "nexus-84-flaw-in-reasoning-011",
  "nexus-84-formal-logic-007",
]);
const parseReplacement = (entry) => JSON.parse(entry.output.replacement_json);
const replacements = repairs.results.map(parseReplacement);
const finalRaw = JSON.parse(finalRepair.results[0].output.replacement_json);
replacements.push({
  questionId: finalRaw.id,
  lessonId: finalRaw.lessonId,
  module: finalRaw.module,
  topic: finalRaw.topic,
  difficulty: finalRaw.difficulty,
  questionText: finalRaw.question,
  optionA: finalRaw.options[0],
  optionB: finalRaw.options[1],
  optionC: finalRaw.options[2],
  optionD: finalRaw.options[3],
  optionE: finalRaw.options[4],
  correctAnswer: finalRaw.correctAnswer,
  explanation: finalRaw.explanation,
  source: finalRaw.source,
});
const byId = new Map(replacements.map((item) => [item.questionId, item]));
if (byId.size !== expectedIds.size || [...expectedIds].some((id) => !byId.has(id))) throw new Error("Repair payload does not contain exactly the five expected question IDs.");

let source = await readFile(libraryPath, "utf8");
const match = source.match(/export const EVIDENCE_READY_PRACTICE_LIBRARY = (\[[\s\S]*?\]) as const;/);
if (!match) throw new Error("Unable to locate evidence-ready library array.");
const library = JSON.parse(match[1]);
const merged = library.map((existing) => {
  const replacement = byId.get(existing.questionId);
  if (!replacement) return existing;
  for (const field of ["lessonId", "module", "topic", "difficulty"]) {
    if (replacement[field] !== existing[field]) throw new Error(`${existing.questionId} changed protected ${field} metadata.`);
  }
  if (![replacement.optionA, replacement.optionB, replacement.optionC, replacement.optionD, replacement.optionE].every((option) => typeof option === "string" && option.trim())) throw new Error(`${existing.questionId} has empty replacement options.`);
  return { ...existing, questionText: replacement.questionText, optionA: replacement.optionA, optionB: replacement.optionB, optionC: replacement.optionC, optionD: replacement.optionD, optionE: replacement.optionE, correctAnswer: replacement.correctAnswer, explanation: replacement.explanation, source: existing.source, skillMappings: existing.skillMappings };
});
source = source.replace(match[0], `export const EVIDENCE_READY_PRACTICE_LIBRARY = ${JSON.stringify(merged, null, 2)} as const;`);
source = source
  .replace("net-effect-assumption", "counterfactual-comparison-condition")
  .replace("causal-attribution-control", "measurement-comparability-denominator")
  .replace("causal-alternative", "false-dichotomy")
  .replace("necessary-sufficient-reversal", "normalized-rate-comparison")
  .replace("single-conditional-inference", "exclusive-or-logic");
await writeFile(libraryPath, source);
console.log("Applied five metadata-preserving evidence-ready content repairs.");
