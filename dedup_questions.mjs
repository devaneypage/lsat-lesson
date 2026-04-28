/**
 * Deduplicate LSAT questions in the database.
 * Strategy: compare question text using normalized similarity.
 * Near-duplicates (>85% similarity on first 200 chars of stimulus) are flagged.
 * The older record (lower id) is kept; newer duplicates are deleted.
 * Run with: npx tsx dedup_questions.mjs
 */
import { getDb } from "./server/db.ts";
import { questions } from "./drizzle/schema.ts";
import { eq, asc } from "drizzle-orm";

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function similarity(a, b) {
  const na = normalize(a).slice(0, 200);
  const nb = normalize(b).slice(0, 200);
  
  if (na === nb) return 1.0;
  if (na.length === 0 || nb.length === 0) return 0;
  
  // Use first 200 chars of normalized text for comparison
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  
  // Count matching characters in order (simple LCS-like approach)
  let matches = 0;
  let j = 0;
  for (let i = 0; i < shorter.length && j < longer.length; i++) {
    while (j < longer.length && longer[j] !== shorter[i]) j++;
    if (j < longer.length) {
      matches++;
      j++;
    }
  }
  
  return (2 * matches) / (shorter.length + longer.length);
}

async function main() {
  console.log("=== Question Deduplication ===\n");
  
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }
  
  // Fetch all questions ordered by id (oldest first = keep)
  const allQuestions = await db
    .select({
      id: questions.id,
      questionId: questions.questionId,
      questionText: questions.questionText,
      category: questions.category,
      source: questions.source,
    })
    .from(questions)
    .orderBy(asc(questions.id));
  
  console.log(`Total questions: ${allQuestions.length}`);
  
  const toDelete = new Set();
  const duplicateGroups = [];
  
  // Compare each question against all subsequent questions
  for (let i = 0; i < allQuestions.length; i++) {
    if (toDelete.has(allQuestions[i].id)) continue;
    
    const qi = allQuestions[i];
    const stimulusI = qi.questionText.slice(0, 300);
    
    for (let j = i + 1; j < allQuestions.length; j++) {
      if (toDelete.has(allQuestions[j].id)) continue;
      
      const qj = allQuestions[j];
      const stimulusJ = qj.questionText.slice(0, 300);
      
      const sim = similarity(stimulusI, stimulusJ);
      
      if (sim >= 0.85) {
        toDelete.add(qj.id); // Keep older (lower id), delete newer
        duplicateGroups.push({
          kept: qi.id,
          deleted: qj.id,
          similarity: sim.toFixed(3),
          category: qi.category,
          source_kept: qi.source,
          source_deleted: qj.source,
        });
      }
    }
    
    if (i % 50 === 0) {
      process.stdout.write(`\r  Comparing: ${i}/${allQuestions.length}...`);
    }
  }
  
  console.log(`\n\nDuplicates found: ${toDelete.size}`);
  
  if (duplicateGroups.length > 0) {
    console.log("\nSample duplicates:");
    for (const g of duplicateGroups.slice(0, 5)) {
      console.log(`  Keep ID ${g.kept} (${g.source_kept}) | Delete ID ${g.deleted} (${g.source_deleted}) | sim=${g.similarity}`);
    }
  }
  
  if (toDelete.size === 0) {
    console.log("\n✓ No duplicates found. Database is clean.");
    return;
  }
  
  // Delete duplicates
  console.log(`\nDeleting ${toDelete.size} duplicates...`);
  let deleted = 0;
  
  for (const id of toDelete) {
    try {
      await db.delete(questions).where(eq(questions.id, id));
      deleted++;
      if (deleted % 10 === 0) {
        process.stdout.write(`\r  Deleted: ${deleted}/${toDelete.size}`);
      }
    } catch (err) {
      console.error(`\n  Failed to delete ID ${id}: ${err.message}`);
    }
  }
  
  // Final count
  const remaining = await db.select({ id: questions.id }).from(questions);
  console.log(`\n\n✓ Deduplication complete:`);
  console.log(`  Started with: ${allQuestions.length} questions`);
  console.log(`  Duplicates removed: ${deleted}`);
  console.log(`  Remaining: ${remaining.length} questions`);
}

main().catch(console.error);
