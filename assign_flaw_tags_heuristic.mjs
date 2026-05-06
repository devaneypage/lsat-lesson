import "dotenv/config";
import { getDb } from "./server/db.ts";
import { questionTags } from "./drizzle/schema.ts";
import { eq, and } from "drizzle-orm";
import fs from "fs";

const db = await getDb();

// Load the flaw questions
const data = JSON.parse(fs.readFileSync("/home/ubuntu/flaw_questions_for_analysis.json", "utf-8"));
const { flawQuestions, flawSubtypeTags } = data;

const tagNameToId = {};
for (const t of flawSubtypeTags) {
  tagNameToId[t.name] = t.id;
}

// ─── PATTERN-MATCHING RULES ────────────────────────────────────────────────
// Each rule has a priority (lower = checked first), a list of patterns (regex),
// and the flaw type to assign when matched.
// Rules are checked in priority order; first match wins.

const RULES = [
  // 1. Causal Reasoning — explicit causal language
  {
    priority: 1,
    type: "Flaw: Causal Reasoning",
    patterns: [
      /\bcaus(e|ed|es|ing|ation)\b/i,
      /\bresult(s|ed|ing)? (in|from)\b/i,
      /\bresponsible for\b/i,
      /\bdue to\b/i,
      /\bbrought about\b/i,
      /\bproduced by\b/i,
      /\bcorrelat(e|ed|ion)\b/i,
      /\bsince .{0,60} (therefore|thus|so|hence)\b/i,
      /\bincreas(e|ed|ing) .{0,40} (led|lead|leads|cause)\b/i,
      /\bdecrease .{0,40} (led|lead|cause)\b/i,
    ]
  },

  // 2. Conditional Reasoning Error — if/then confusion
  {
    priority: 2,
    type: "Flaw: Conditional Reasoning Error",
    patterns: [
      /\bif and only if\b/i,
      /\bnecessary (condition|for)\b/i,
      /\bsufficient (condition|for)\b/i,
      /\bonly if\b/i,
      /\bwhenever .{0,60} (must|will|always)\b/i,
      /\ball .{0,40} are .{0,40} therefore .{0,40} (all|every|any)\b/i,
      /\bcontrapositive\b/i,
      /\bdenying the (antecedent|consequent)\b/i,
      /\baffirming the (antecedent|consequent)\b/i,
    ]
  },

  // 3. Sampling / Survey Error — unrepresentative sample
  {
    priority: 3,
    type: "Flaw: Sampling / Survey Error",
    patterns: [
      /\bsurvey\b/i,
      /\bsample\b/i,
      /\bpoll\b/i,
      /\brepresentative\b/i,
      /\bstatistic(s|al)?\b/i,
      /\bpercentage of .{0,40} (surveyed|polled|asked|interviewed)\b/i,
      /\bmost .{0,30} (surveyed|polled|interviewed)\b/i,
      /\bgroup of .{0,30} (people|students|workers|respondents)\b/i,
    ]
  },

  // 4. False Dichotomy — either/or framing
  {
    priority: 4,
    type: "Flaw: False Dichotomy",
    patterns: [
      /\beither .{0,60} or\b/i,
      /\bmust be (one|either)\b/i,
      /\bonly two (options|choices|alternatives|possibilities)\b/i,
      /\bno (other|alternative) (option|choice|way|possibility)\b/i,
      /\bif not .{0,40} then (must|necessarily)\b/i,
      /\bonly (option|choice|way|alternative)\b/i,
    ]
  },

  // 5. Circular Reasoning — conclusion restates premise
  {
    priority: 5,
    type: "Flaw: Circular Reasoning",
    patterns: [
      /\bbecause .{0,80} (therefore|thus|hence|so) .{0,80} because\b/i,
      /\bbegs? the question\b/i,
      /\bassumes? (what|the very thing) .{0,40} (proves?|establishes?|demonstrates?)\b/i,
      /\btakes? for granted .{0,40} (what|that which)\b/i,
    ]
  },

  // 6. Ad Hominem / Source Attack
  {
    priority: 6,
    type: "Flaw: Ad Hominem / Source Attack",
    patterns: [
      /\bself-interest(ed)?\b/i,
      /\bbias(ed)?\b/i,
      /\bmotivat(ed|ion) .{0,40} (financial|personal|selfish)\b/i,
      /\bconflict of interest\b/i,
      /\bcredential(s)?\b/i,
      /\bqualif(ied|ication)\b/i,
      /\b(he|she|they) (benefit|profit|gain)\b/i,
      /\bpaid (by|to)\b/i,
      /\bworks? for\b/i,
    ]
  },

  // 7. Weak Analogy — comparing dissimilar things
  {
    priority: 7,
    type: "Flaw: Weak Analogy",
    patterns: [
      /\bjust (as|like)\b/i,
      /\bsimilar(ly)? to\b/i,
      /\banalog(y|ous)\b/i,
      /\bcompar(e|ed|ing|able) (to|with)\b/i,
      /\blike .{0,40} (so|therefore|thus)\b/i,
      /\bsame (way|manner|logic|reasoning)\b/i,
      /\bparallel (case|situation|reasoning)\b/i,
    ]
  },

  // 8. Equivocation / Ambiguity — word used in two senses
  {
    priority: 8,
    type: "Flaw: Equivocation / Ambiguity",
    patterns: [
      /\bmeaning of\b/i,
      /\bsense of the word\b/i,
      /\bdifferent (sense|meaning|definition)\b/i,
      /\bambiguous\b/i,
      /\bequivocal\b/i,
      /\btwo (different|distinct) (meanings?|senses?|definitions?)\b/i,
    ]
  },

  // 9. Composition / Division
  {
    priority: 9,
    type: "Flaw: Composition / Division",
    patterns: [
      /\beach (part|member|component|element|individual)\b/i,
      /\bthe (whole|entire|group|team|class|set)\b/i,
      /\bparts? of .{0,40} (whole|group|team)\b/i,
      /\bevery (member|individual|part|component)\b/i,
      /\bcompos(e|ed|ition)\b/i,
    ]
  },

  // 10. Inappropriate Appeal
  {
    priority: 10,
    type: "Flaw: Inappropriate Appeal",
    patterns: [
      /\bexpert(s|ise)?\b/i,
      /\bauthority\b/i,
      /\bmost people\b/i,
      /\beveryone (knows?|believes?|agrees?|thinks?)\b/i,
      /\bpopular(ity)?\b/i,
      /\btradition(al)?\b/i,
      /\bemotion(al)?\b/i,
      /\bfear\b/i,
      /\bpity\b/i,
      /\bappeal to\b/i,
      /\bwidely (believed|accepted|held)\b/i,
    ]
  },

  // 11. Scope Shift / Straw Man
  {
    priority: 11,
    type: "Flaw: Scope Shift / Straw Man",
    patterns: [
      /\bstraw man\b/i,
      /\bmisrepresent(s|ed|ing)?\b/i,
      /\bshift(s|ed|ing)? (from|the|its)\b/i,
      /\bdifferent (claim|conclusion|issue|topic)\b/i,
      /\bnot what .{0,40} (said|argued|claimed)\b/i,
      /\bconfus(e|es|ing|ed) .{0,40} (with|for)\b/i,
    ]
  },

  // 12. Overlooked Possibilities — catch-all for "fails to consider"
  {
    priority: 12,
    type: "Flaw: Overlooked Possibilities",
    patterns: [
      /\bfails? to (consider|account for|recognize|acknowledge)\b/i,
      /\bignores?\b/i,
      /\bneglects?\b/i,
      /\boverlooked?\b/i,
      /\balternative (explanation|cause|reason|possibility)\b/i,
      /\banother (explanation|reason|cause|possibility)\b/i,
      /\bother (explanation|reason|cause|possibility|factor)\b/i,
      /\bwithout (considering|accounting for|ruling out)\b/i,
      /\bcould (also|instead|alternatively)\b/i,
    ]
  },
];

function classifyFlaw(questionText) {
  const text = questionText || "";
  
  for (const rule of RULES.sort((a, b) => a.priority - b.priority)) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return { type: rule.type, matchedPattern: pattern.toString() };
      }
    }
  }
  
  // Default fallback
  return { type: "Flaw: Overlooked Possibilities", matchedPattern: "fallback" };
}

// ─── CLASSIFY AND ASSIGN ────────────────────────────────────────────────────
console.log(`\nClassifying ${flawQuestions.length} Flaw questions using pattern matching...\n`);

const results = [];
let assigned = 0;
let skipped = 0;

// Tally for distribution report
const tally = {};

for (const q of flawQuestions) {
  const { type, matchedPattern } = classifyFlaw(q.questionText);
  const tagId = tagNameToId[type];
  
  if (!tagId) {
    console.log(`  [!] No tag ID found for "${type}" — skipping Q${q.id}`);
    skipped++;
    continue;
  }

  // Check if already assigned
  const existing = await db
    .select({ id: questionTags.id })
    .from(questionTags)
    .where(and(
      eq(questionTags.questionId, q.id),
      eq(questionTags.tagId, tagId)
    ));

  if (existing.length > 0) {
    console.log(`  [skip] Q${q.id} already has "${type}"`);
    skipped++;
    tally[type] = (tally[type] || 0) + 1;
    continue;
  }

  await db.insert(questionTags).values({
    questionId: q.id,
    tagId: tagId,
    assignedBy: 1,
  });

  const shortText = q.questionText.substring(0, 80).replace(/\n/g, " ");
  console.log(`  [+] Q${q.id}: "${type}"\n      text: "${shortText}..."\n      matched: ${matchedPattern}\n`);
  
  results.push({ id: q.id, flawType: type, matchedPattern, text: shortText });
  tally[type] = (tally[type] || 0) + 1;
  assigned++;
}

console.log(`\n══════════════════════════════════════════════`);
console.log(`  FLAW SUBTYPE TAGGING COMPLETE`);
console.log(`  Assigned: ${assigned} | Skipped: ${skipped}`);
console.log(`\n  Distribution:`);
for (const [type, count] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${count.toString().padStart(3)} × ${type}`);
}
console.log(`══════════════════════════════════════════════`);

// Save results for review
fs.writeFileSync(
  "/home/ubuntu/flaw_tag_assignments_heuristic.json",
  JSON.stringify(results, null, 2)
);
console.log(`\nResults saved to /home/ubuntu/flaw_tag_assignments_heuristic.json`);
console.log(`\nNOTE: Pattern matching is ~70-80% accurate. Run the LLM-based script in a fresh`);
console.log(`session to review and correct any misclassifications.`);

process.exit(0);
