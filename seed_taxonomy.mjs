/**
 * Seed script: Create core tag taxonomy and auto-assign tags to questions
 * based on their category and source fields.
 *
 * Taxonomy structure:
 *   section   — 3 major curriculum units (LR I, LR II, RC)
 *   topic     — lesson-level groupings (Assumption Family, Flaw Questions, etc.)
 *   objective — question type categories (Flaw, Necessary Assumption, etc.)
 *   custom    — flaw subtypes, difficulty levels, source sets
 */

import { getDb } from './server/db.ts';
import { tags, questionTags, questions } from './drizzle/schema.ts';
import { eq, inArray } from 'drizzle-orm';

const db = await getDb();
if (!db) { console.error('No DB connection'); process.exit(1); }

// ─── Helper: upsert a tag (skip if name already exists) ───────────────────────
async function upsertTag(name, type, color, description = '') {
  // Check if tag already exists
  const existing = await db.select().from(tags).where(eq(tags.name, name));
  if (existing.length > 0) {
    console.log(`  [skip] "${name}" already exists (id=${existing[0].id})`);
    return existing[0].id;
  }
  const [result] = await db.insert(tags).values({ name, type, color, description, createdBy: 1 });
  const id = result.insertId;
  console.log(`  [+] "${name}" (${type}) → id=${id}`);
  return id;
}

// ─── Helper: assign tag to all questions matching a category ──────────────────
async function assignByCategory(tagId, categoryValue) {
  const qs = await db.select({ id: questions.id }).from(questions)
    .where(eq(questions.category, categoryValue));
  if (qs.length === 0) return 0;
  let added = 0;
  for (const q of qs) {
    try {
      await db.insert(questionTags).values({ questionId: q.id, tagId });
      added++;
    } catch {
      // ignore duplicate key errors
    }
  }
  console.log(`    → assigned to ${added}/${qs.length} questions with category="${categoryValue}"`);
  return added;
}

// ─── Helper: assign tag to all questions matching a source pattern ─────────────
async function assignBySourcePattern(tagId, sourcePattern) {
  const allQs = await db.select({ id: questions.id, source: questions.source }).from(questions);
  const matching = allQs.filter(q => q.source && q.source.includes(sourcePattern));
  if (matching.length === 0) return 0;
  let added = 0;
  for (const q of matching) {
    try {
      await db.insert(questionTags).values({ questionId: q.id, tagId });
      added++;
    } catch {
      // ignore duplicate key errors
    }
  }
  console.log(`    → assigned to ${added}/${matching.length} questions with source containing "${sourcePattern}"`);
  return added;
}

// ─── Helper: assign tag to all questions matching multiple categories ──────────
async function assignByCategories(tagId, categoryValues) {
  let total = 0;
  for (const cat of categoryValues) {
    total += await assignByCategory(tagId, cat);
  }
  return total;
}

console.log('\n══════════════════════════════════════════════');
console.log('  SEEDING CORE TAG TAXONOMY');
console.log('══════════════════════════════════════════════\n');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CURRICULUM SECTIONS (type: section)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('▶ CURRICULUM SECTIONS');

const secLR1 = await upsertTag(
  'LR I — Objective Question Types',
  'section', '#0052CC',
  'Main Point, Role of Statement, Method of Argument, Point at Issue, Parallel Reasoning'
);
const secLR2 = await upsertTag(
  'LR II — Subjective Question Types',
  'section', '#6554C0',
  'Necessary Assumption, Sufficient Assumption, Flaw, Strengthen, Weaken, Match Flaw'
);
const secRC = await upsertTag(
  'RC — Reading Comprehension',
  'section', '#00875A',
  'Main Idea, Detail, Inference, Author Perspective, Comparative Passages'
);
const secCond = await upsertTag(
  'Foundational Skills — Conditional Reasoning',
  'section', '#FF8B00',
  'Conditional statement diagramming, sufficient/necessary conditions, contrapositives'
);

// ═══════════════════════════════════════════════════════════════════════════════
// 2. LESSON UNITS (type: topic)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ LESSON UNITS');

const lessonAssumptionFamily = await upsertTag(
  'Lesson: Assumption Family',
  'topic', '#8777D9',
  'Necessary Assumption, Sufficient Assumption — bridge and defender assumptions'
);
const lessonFlaw = await upsertTag(
  'Lesson: Flaw Questions',
  'topic', '#FF5630',
  'Identifying and naming logical flaws in arguments'
);
const lessonStrWeaken = await upsertTag(
  'Lesson: Strengthen & Weaken',
  'topic', '#FFAB00',
  'Strengthening and weakening arguments; overlooked possibilities'
);
const lessonMainPoint = await upsertTag(
  'Lesson: Main Point Questions',
  'topic', '#0065FF',
  'Identifying the main conclusion of an argument'
);
const lessonRoleMethod = await upsertTag(
  'Lesson: Role & Method Questions',
  'topic', '#00B8D9',
  'Role of a Statement and Method of Argument question types'
);
const lessonPointIssue = await upsertTag(
  'Lesson: Point at Issue',
  'topic', '#36B37E',
  'Identifying the point of disagreement between two speakers'
);
const lessonParallel = await upsertTag(
  'Lesson: Parallel Reasoning',
  'topic', '#6B778C',
  'Identifying arguments with parallel logical structure'
);
const lessonRC = await upsertTag(
  'Lesson: Reading Comprehension',
  'topic', '#00875A',
  'Passage mapping, question types, wrong answer patterns'
);
const lessonConditional = await upsertTag(
  'Lesson: Conditional Reasoning',
  'topic', '#FF8B00',
  'Conditional statements, contrapositives, sufficient/necessary conditions'
);
const lessonMatchFlaw = await upsertTag(
  'Lesson: Match Flaw',
  'topic', '#DE350B',
  'Identifying arguments with parallel flawed reasoning'
);

// ═══════════════════════════════════════════════════════════════════════════════
// 3. QUESTION TYPES (type: objective)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ QUESTION TYPES');

const qtNecAssump = await upsertTag('QT: Necessary Assumption', 'objective', '#6554C0');
const qtSufAssump = await upsertTag('QT: Sufficient Assumption', 'objective', '#8777D9');
const qtFlaw = await upsertTag('QT: Flaw', 'objective', '#FF5630');
const qtMatchFlaw = await upsertTag('QT: Match Flaw', 'objective', '#DE350B');
const qtStrengthen = await upsertTag('QT: Strengthen', 'objective', '#FFAB00');
const qtWeaken = await upsertTag('QT: Weaken', 'objective', '#FF8B00');
const qtMainPoint = await upsertTag('QT: Main Point', 'objective', '#0065FF');
const qtRole = await upsertTag('QT: Role of Statement', 'objective', '#00B8D9');
const qtMethod = await upsertTag('QT: Method of Argument', 'objective', '#0052CC');
const qtPointIssue = await upsertTag('QT: Point at Issue', 'objective', '#36B37E');
const qtParallel = await upsertTag('QT: Parallel Reasoning', 'objective', '#6B778C');
const qtInference = await upsertTag('QT: Inference', 'objective', '#00875A');
const qtMainIdea = await upsertTag('QT: Main Idea (RC)', 'objective', '#006644');
const qtDetail = await upsertTag('QT: Detail (RC)', 'objective', '#57D9A3');
const qtArgConstruction = await upsertTag('QT: Argument Construction', 'objective', '#4C9AFF');
const qtConditional = await upsertTag('QT: Conditional Reasoning', 'objective', '#FF8B00');

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FLAW TYPES (type: custom)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ FLAW TYPES');

const flawCausal = await upsertTag(
  'Flaw: Causal Reasoning',
  'custom', '#FF5630',
  'Confusing correlation with causation; reverse causation; third-cause fallacy'
);
const flawGarbage = await upsertTag(
  'Flaw: Overlooked Possibilities',
  'custom', '#FF7452',
  'Failing to consider alternative explanations or counterexamples'
);
const flawConditional = await upsertTag(
  'Flaw: Conditional Reasoning Error',
  'custom', '#FFAB00',
  'Affirming the consequent; denying the antecedent; illegal negation/conversion'
);
const flawSurvey = await upsertTag(
  'Flaw: Sampling / Survey Error',
  'custom', '#FFC400',
  'Unrepresentative sample; hasty generalization; biased survey'
);
const flawAnalogy = await upsertTag(
  'Flaw: Weak Analogy',
  'custom', '#36B37E',
  'Comparing two situations that are not sufficiently similar'
);
const flawCircular = await upsertTag(
  'Flaw: Circular Reasoning',
  'custom', '#00875A',
  'Assuming the conclusion in the premises; begging the question'
);
const flawAdHominem = await upsertTag(
  'Flaw: Ad Hominem / Source Attack',
  'custom', '#0065FF',
  'Attacking the person rather than the argument'
);
const flawEquivocation = await upsertTag(
  'Flaw: Equivocation / Ambiguity',
  'custom', '#4C9AFF',
  'Using a term in two different senses within the same argument'
);
const flawComposition = await upsertTag(
  'Flaw: Composition / Division',
  'custom', '#6554C0',
  'Inferring properties of parts from the whole, or vice versa'
);
const flawFalseChoice = await upsertTag(
  'Flaw: False Dichotomy',
  'custom', '#8777D9',
  'Presenting only two options when more exist'
);
const flawAppeal = await upsertTag(
  'Flaw: Inappropriate Appeal',
  'custom', '#6B778C',
  'Appeal to authority, popularity, emotion, or tradition'
);
const flawScope = await upsertTag(
  'Flaw: Scope Shift / Straw Man',
  'custom', '#97A0AF',
  'Misrepresenting or shifting the scope of the argument'
);

// ═══════════════════════════════════════════════════════════════════════════════
// 5. DIFFICULTY (type: custom)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ DIFFICULTY LEVELS');

const diffEasy = await upsertTag('Difficulty: Easy', 'custom', '#36B37E');
const diffMedium = await upsertTag('Difficulty: Medium', 'custom', '#FFAB00');
const diffHard = await upsertTag('Difficulty: Hard', 'custom', '#FF5630');

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SOURCE SETS (type: custom)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ SOURCE SETS');

const srcLSATTrainer = await upsertTag('Source: LSAT Trainer', 'custom', '#172B4D');
const srcTestmasters = await upsertTag('Source: Testmasters', 'custom', '#0052CC');
const srcLRII = await upsertTag('Source: LR II Drill Sets', 'custom', '#6554C0');
const srcLRIII = await upsertTag('Source: LR III Drill Sets', 'custom', '#8777D9');
const srcRC = await upsertTag('Source: RC Drill Sets', 'custom', '#00875A');

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-ASSIGN: Question Type tags → questions by category
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ AUTO-ASSIGNING QUESTION TYPE TAGS');

await assignByCategory(qtNecAssump, 'Necessary Assumption');
await assignByCategory(qtNecAssump, 'Assumption'); // legacy category
await assignByCategory(qtSufAssump, 'Sufficient Assumption');
await assignByCategory(qtFlaw, 'Flaw');
await assignByCategory(qtMatchFlaw, 'Match Flaw');
await assignByCategory(qtStrengthen, 'Strengthen');
await assignByCategory(qtWeaken, 'Weaken');
await assignByCategory(qtMainPoint, 'Main Point');
await assignByCategory(qtRole, 'Role of Statement');
await assignByCategory(qtMethod, 'Method of Argument');
await assignByCategory(qtMethod, 'Logical Reasoning'); // legacy
await assignByCategory(qtPointIssue, 'Point at Issue');
await assignByCategory(qtParallel, 'Parallel Reasoning');
await assignByCategory(qtInference, 'Inference');
await assignByCategory(qtMainIdea, 'Main Idea');
await assignByCategory(qtDetail, 'Detail');
await assignByCategory(qtDetail, 'Vocabulary in Context');
await assignByCategory(qtArgConstruction, 'Argument Construction');
await assignByCategory(qtConditional, 'Conditional Reasoning');

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-ASSIGN: Lesson unit tags → questions by category
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ AUTO-ASSIGNING LESSON UNIT TAGS');

await assignByCategories(lessonAssumptionFamily, ['Necessary Assumption', 'Sufficient Assumption', 'Assumption']);
await assignByCategories(lessonFlaw, ['Flaw', 'Match Flaw']);
await assignByCategories(lessonStrWeaken, ['Strengthen', 'Weaken']);
await assignByCategory(lessonMainPoint, 'Main Point');
await assignByCategories(lessonRoleMethod, ['Role of Statement', 'Method of Argument', 'Logical Reasoning']);
await assignByCategory(lessonPointIssue, 'Point at Issue');
await assignByCategory(lessonParallel, 'Parallel Reasoning');
await assignByCategories(lessonRC, ['Main Idea', 'Detail', 'Inference', 'Vocabulary in Context']);
await assignByCategory(lessonConditional, 'Conditional Reasoning');
await assignByCategory(lessonMatchFlaw, 'Match Flaw');

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-ASSIGN: Curriculum section tags → questions by category
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ AUTO-ASSIGNING CURRICULUM SECTION TAGS');

// LR I — Objective types
await assignByCategories(secLR1, [
  'Main Point', 'Role of Statement', 'Method of Argument',
  'Point at Issue', 'Parallel Reasoning', 'Logical Reasoning'
]);

// LR II — Subjective types
await assignByCategories(secLR2, [
  'Necessary Assumption', 'Sufficient Assumption', 'Assumption',
  'Flaw', 'Match Flaw', 'Strengthen', 'Weaken', 'Argument Construction'
]);

// RC
await assignByCategories(secRC, [
  'Main Idea', 'Detail', 'Inference', 'Vocabulary in Context'
]);

// Foundational
await assignByCategory(secCond, 'Conditional Reasoning');

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-ASSIGN: Source tags → questions by source pattern
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ AUTO-ASSIGNING SOURCE TAGS');

await assignBySourcePattern(srcLSATTrainer, 'Lesson 5: Flaws');
await assignBySourcePattern(srcLSATTrainer, 'LR Lesson');
await assignBySourcePattern(srcLSATTrainer, 'The Anatomy of an Argument');
await assignBySourcePattern(srcTestmasters, 'Conditional Statement Diagramming Drill');
await assignBySourcePattern(srcLRII, 'LR_II');
await assignBySourcePattern(srcLRIII, 'LR III');
await assignBySourcePattern(srcRC, 'RC –');

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-ASSIGN: Difficulty tags
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n▶ AUTO-ASSIGNING DIFFICULTY TAGS');

const allQs = await db.select({ id: questions.id, difficulty: questions.difficulty }).from(questions);
for (const q of allQs) {
  const d = q.difficulty?.toLowerCase();
  const tagId = d === 'easy' ? diffEasy : d === 'medium' ? diffMedium : d === 'hard' ? diffHard : null;
  if (!tagId) continue;
  try {
    await db.insert(questionTags).values({ questionId: q.id, tagId });
  } catch { /* ignore duplicates */ }
}
const easyCount = allQs.filter(q => q.difficulty?.toLowerCase() === 'easy').length;
const medCount = allQs.filter(q => q.difficulty?.toLowerCase() === 'medium').length;
const hardCount = allQs.filter(q => q.difficulty?.toLowerCase() === 'hard').length;
console.log(`    → Easy: ${easyCount}, Medium: ${medCount}, Hard: ${hardCount}`);

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
const allTags = await db.select().from(tags);
const allAssignments = await db.select().from(questionTags);
console.log('\n══════════════════════════════════════════════');
console.log(`  DONE — ${allTags.length} tags created, ${allAssignments.length} assignments made`);
console.log('══════════════════════════════════════════════\n');

process.exit(0);
