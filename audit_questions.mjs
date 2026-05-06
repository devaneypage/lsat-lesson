import { getDb } from './server/db.ts';
import { questions } from './drizzle/schema.ts';

const db = await getDb();
if (!db) { console.error('No DB'); process.exit(1); }

const rows = await db.select({
  category: questions.category,
  source: questions.source,
  difficulty: questions.difficulty
}).from(questions);

const cats = [...new Set(rows.map(r => r.category).filter(Boolean))].sort();
const srcs = [...new Set(rows.map(r => r.source).filter(Boolean))].sort();
const diffs = [...new Set(rows.map(r => r.difficulty).filter(Boolean))].sort();

// Count per category
const catCounts = {};
for (const r of rows) {
  if (r.category) catCounts[r.category] = (catCounts[r.category] || 0) + 1;
}

// Count per source
const srcCounts = {};
for (const r of rows) {
  if (r.source) srcCounts[r.source] = (srcCounts[r.source] || 0) + 1;
}

console.log('\n=== CATEGORIES (with counts) ===');
for (const [cat, count] of Object.entries(catCounts).sort()) {
  console.log(`  [${count}] ${cat}`);
}
console.log('\n=== SOURCES (with counts) ===');
for (const [src, count] of Object.entries(srcCounts).sort()) {
  console.log(`  [${count}] ${src}`);
}
console.log('\n=== DIFFICULTIES ===', diffs);
console.log('\nTOTAL QUESTIONS:', rows.length);

process.exit(0);
