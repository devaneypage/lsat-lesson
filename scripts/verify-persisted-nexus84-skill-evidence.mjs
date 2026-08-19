import { getPracticeQuestionSkillEvidenceByKey } from "../server/repositories/practice.ts";

const questionKey = "nexus-84-necessary-assumptions-009";
const evidence = await getPracticeQuestionSkillEvidenceByKey(questionKey);
if (!evidence || evidence.skillMappings.length === 0) {
  throw new Error(`Expected persisted practice skill mappings for ${questionKey}.`);
}
console.log(JSON.stringify({ questionKey, questionId: evidence.question.id, skillMappings: evidence.skillMappings }, null, 2));
