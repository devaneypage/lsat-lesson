import { readFile } from "node:fs/promises";

const audit = JSON.parse(await readFile("/home/ubuntu/audit_advanced_practice_patterns.json", "utf8"));
const expectedLessons = ["necessary-assumptions", "sufficient-assumptions", "flaw-in-reasoning", "common-flaws", "strengthen-weaken", "reading-comprehension", "formal-logic"];
const failures = [];
for (const lessonId of expectedLessons) {
  const entry = audit.results.find((item) => item.input === lessonId);
  const items = entry?.output?.item_level_audit_json ? JSON.parse(entry.output.item_level_audit_json) : [];
  if (items.length !== 6) failures.push(`${lessonId}: expected 6 audit records, found ${items.length}`);
  for (const item of items) {
    if (item.lessonId !== lessonId || !item.questionId?.startsWith(`nexus-84-${lessonId}-`) || !item.advancedPattern?.trim() || !item.evidencePhrase?.trim() || !item.contrastToFirstTranche?.trim()) failures.push(`${lessonId}: incomplete audit record ${item.questionId ?? "unknown"}`);
    if (item.approved !== true) failures.push(`${lessonId}: requires content revision — ${item.questionId}`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("All second-tranche items pass the item-level advanced-pattern audit.");
}
