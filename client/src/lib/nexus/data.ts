/**
 * LSAT Nexus v2 — reference content.
 *
 * Educational data powering the Interactive Reference App. Extracted and typed
 * from the original single-file prototype so the full-stack app renders the
 * same playbooks, libraries, and drills from a single source of truth.
 */

export const NEXUS_COLORS = {
  ink: "#111111",
  offWhite: "#FFFDF8",
  cream: "#F4EFE2",
  terra: "#D0452A",
  teal: "#1AABBC",
  pine: "#2A6B58",
  amber: "#EFA01C",
  lime: "#79C53E",
} as const;

export type SectionId = "lr" | "rc" | "fl" | "str" | "rev" | "pln";

export interface SectionDef {
  id: SectionId;
  label: string;
  color: string;
  blurb: string;
  tabs: string[];
}

/** Top-level sections and their sub-tabs (mirrors the prototype's nav map). */
export const SECTIONS: SectionDef[] = [
  {
    id: "lr",
    label: "Logical Reasoning",
    color: NEXUS_COLORS.terra,
    blurb:
      "Question-type playbooks, the fallacy library, and an argument builder.",
    tabs: ["Question Types", "Fallacy Forest", "Argument Builder"],
  },
  {
    id: "rc",
    label: "Reading Comp",
    color: NEXUS_COLORS.teal,
    blurb: "Passage genres, question stems, and the passage-mapping protocol.",
    tabs: ["Question Types", "Passage Genres", "Mapping Protocol"],
  },
  {
    id: "fl",
    label: "Formal Logic",
    color: NEXUS_COLORS.amber,
    blurb:
      "Conditional translations, quantifier rules, and the translation trainer.",
    tabs: ["Translations", "Inference Rules", "Conditional Trainer"],
  },
  {
    id: "str",
    label: "Strategy & Mindset",
    color: NEXUS_COLORS.pine,
    blurb: "Pacing benchmarks, elimination, answer-choice traps, and flagging.",
    tabs: ["Pacing", "Answer Traps", "Elimination Matrix"],
  },
  {
    id: "rev",
    label: "Review & Analytics",
    color: NEXUS_COLORS.lime,
    blurb:
      "Your error log, mastery score, and trend patterns — backed by your account.",
    tabs: ["Error Log", "Analytics"],
  },
  {
    id: "pln",
    label: "Study Plan",
    color: NEXUS_COLORS.terra,
    blurb: "16, 12, and 4-week templates plus a daily study template.",
    tabs: ["Templates", "Daily Template"],
  },
];

/* ------------------------------------------------------------------ */
/* Logical Reasoning                                                   */
/* ------------------------------------------------------------------ */

export interface QuestionType {
  id: string;
  name: string;
  stem: string;
  tip: string;
  strategy: string;
  color: string;
}

export const LR_QUESTION_TYPES: QuestionType[] = [
  {
    id: "mbt",
    name: "Must Be True",
    stem: "Which of the following must be true?",
    tip: "Proven by stimulus alone",
    strategy:
      "Only pick what the premises guarantee. No inference beyond them.",
    color: NEXUS_COLORS.terra,
  },
  {
    id: "wkn",
    name: "Weaken",
    stem: "Which most seriously weakens the argument?",
    tip: "Attack the assumption",
    strategy: "Find the assumption. Pick the answer that undermines it.",
    color: NEXUS_COLORS.teal,
  },
  {
    id: "str",
    name: "Strengthen",
    stem: "Which most helps justify the conclusion?",
    tip: "Support the assumption",
    strategy: "Assumptions need support. Pick what validates the gap.",
    color: NEXUS_COLORS.pine,
  },
  {
    id: "asm",
    name: "Assumption",
    stem: "The argument assumes which of the following?",
    tip: "Necessary or sufficient?",
    strategy:
      "Necessary: negate the answer — if it kills the argument, it's the assumption.",
    color: NEXUS_COLORS.amber,
  },
  {
    id: "flw",
    name: "Flaw",
    stem: "The argument is most vulnerable to criticism that…",
    tip: "Name the error",
    strategy:
      "Common flaws: correlation→causation, sample bias, equivocation, ad hominem.",
    color: NEXUS_COLORS.lime,
  },
  {
    id: "inf",
    name: "Inference",
    stem: "Which of the following can be properly inferred?",
    tip: "Valid deduction only",
    strategy:
      'Must follow from the stimulus. Avoid "probably" — only certainty.',
    color: NEXUS_COLORS.terra,
  },
  {
    id: "mth",
    name: "Method of Reasoning",
    stem: "The argument proceeds by…",
    tip: "Describe the structure",
    strategy:
      'Abstract the pattern: "Claims X, then supports with Y, concludes Z."',
    color: NEXUS_COLORS.teal,
  },
  {
    id: "rol",
    name: "Role of Statement",
    stem: "The role of the claim that [X] is to…",
    tip: "Function in the argument",
    strategy:
      "Premise, conclusion, counter, illustration, intermediate conclusion?",
    color: NEXUS_COLORS.pine,
  },
  {
    id: "prn",
    name: "Principle",
    stem: "Which principle most helps justify the argument?",
    tip: "Broad rule applied here",
    strategy: "The principle should make the argument valid when applied.",
    color: NEXUS_COLORS.amber,
  },
  {
    id: "pdx",
    name: "Paradox / Explain",
    stem: "Which of the following most helps explain the discrepancy?",
    tip: "Reconcile contradiction",
    strategy:
      "Both sides must be true. The answer makes both possible simultaneously.",
    color: NEXUS_COLORS.lime,
  },
  {
    id: "par",
    name: "Parallel Reasoning",
    stem: "Which is most similar in its reasoning?",
    tip: "Match the abstract structure",
    strategy:
      "Symbolize both. Same logical form, regardless of subject matter.",
    color: NEXUS_COLORS.terra,
  },
  {
    id: "prf",
    name: "Parallel Flaw",
    stem: "Which argument has the same flaw as the argument above?",
    tip: "Same error, different content",
    strategy:
      "Name the flaw first. Then find the answer with that exact flaw type.",
    color: NEXUS_COLORS.teal,
  },
  {
    id: "pnt",
    name: "Main Point",
    stem: "Which best expresses the main conclusion?",
    tip: "What the argument is trying to prove",
    strategy:
      "Conclusion ≠ first/last sentence. Find what everything else supports.",
    color: NEXUS_COLORS.pine,
  },
];

export interface Fallacy {
  name: string;
  abbr: string;
  definition: string;
  example: string;
}

export const FALLACIES: Fallacy[] = [
  {
    name: "Ad Hominem",
    abbr: "AH",
    definition:
      "Attacking the person making the argument rather than the argument itself.",
    example: "\"You can't trust her advice on diet — she's overweight.\"",
  },
  {
    name: "Appeal to Authority",
    abbr: "AA",
    definition:
      "Assuming a claim is true because an authority figure said it, without other support.",
    example: '"Experts agree, so it must be true."',
  },
  {
    name: "Circular Reasoning",
    abbr: "CR",
    definition: "The conclusion is used as a premise to support itself.",
    example: '"The Bible is true because the Bible says so."',
  },
  {
    name: "Correlation = Cause",
    abbr: "CC",
    definition:
      "Assuming that because two things correlate, one causes the other.",
    example:
      '"Ice cream sales and drowning both rise in summer, so ice cream causes drowning."',
  },
  {
    name: "False Dichotomy",
    abbr: "FD",
    definition: "Presenting only two options when others exist.",
    example: '"You\'re either with us or against us."',
  },
  {
    name: "Hasty Generalization",
    abbr: "HG",
    definition:
      "Drawing a broad conclusion from a small or unrepresentative sample.",
    example: '"I met two rude New Yorkers; New Yorkers are rude."',
  },
  {
    name: "Equivocation",
    abbr: "EQ",
    definition:
      "Using the same word in two different senses within one argument.",
    example:
      '"Laws govern natural phenomena. Moral rules are laws. Therefore, moral rules govern natural phenomena."',
  },
  {
    name: "Straw Man",
    abbr: "SM",
    definition:
      "Misrepresenting someone's argument to make it easier to attack.",
    example:
      'Opponent wants less military spending → "You want to leave the country defenseless."',
  },
  {
    name: "Slippery Slope",
    abbr: "SS",
    definition:
      "Claiming one event will lead to extreme consequences without evidence.",
    example:
      '"If we allow same-sex marriage, next people will want to marry animals."',
  },
  {
    name: "Appeal to Popularity",
    abbr: "AP",
    definition: "Something is true because many people believe it.",
    example: '"Millions believe in astrology, so it must have some truth."',
  },
  {
    name: "Part to Whole",
    abbr: "PW",
    definition: "What is true of parts is assumed true of the whole.",
    example: '"Each part of this engine is light, so the engine is light."',
  },
  {
    name: "Whole to Part",
    abbr: "WP",
    definition: "What is true of the whole is assumed true of each part.",
    example: '"The army is large, so each soldier is large."',
  },
  {
    name: "Necessary / Sufficient Confusion",
    abbr: "NSC",
    definition:
      "Confusing a necessary condition with a sufficient one, or vice versa.",
    example:
      '"You need oxygen to survive" → concluding oxygen alone guarantees survival.',
  },
  {
    name: "Unrepresentative Sample",
    abbr: "US",
    definition:
      "Surveying a biased or atypical group and applying results broadly.",
    example:
      '"Our customer survey says everyone loves our product" (only asked satisfied customers).',
  },
  {
    name: "False Analogy",
    abbr: "FA",
    definition: "Comparing two things that are not alike in the relevant ways.",
    example: '"Schools are like factories — both should maximize output."',
  },
];

/* ------------------------------------------------------------------ */
/* Reading Comprehension                                               */
/* ------------------------------------------------------------------ */

export interface RcQuestionType {
  name: string;
  stem: string;
  tip: string;
  color: string;
}

export const RC_QUESTION_TYPES: RcQuestionType[] = [
  {
    name: "Main Point",
    stem: "What is the passage primarily about?",
    tip: "The author's central claim",
    color: NEXUS_COLORS.terra,
  },
  {
    name: "Inference",
    stem: "What can be deduced from the passage?",
    tip: "Supported, not stated",
    color: NEXUS_COLORS.teal,
  },
  {
    name: "Author Tone",
    stem: "The author's attitude can best be described as…",
    tip: "Identify the author's attitude.",
    color: NEXUS_COLORS.pine,
  },
  {
    name: "Analogy",
    stem: "Most similar to what the passage discusses?",
    tip: "Match the relationship, not the topic",
    color: NEXUS_COLORS.amber,
  },
  {
    name: "Detail",
    stem: "According to the passage, which is true?",
    tip: "Find the specific stated fact.",
    color: NEXUS_COLORS.lime,
  },
  {
    name: "Function",
    stem: "The author mentions X primarily to…",
    tip: "Why the detail is there",
    color: NEXUS_COLORS.terra,
  },
  {
    name: "Passage Map",
    stem: "Which best describes the organization of the passage?",
    tip: "Track paragraph-level structure",
    color: NEXUS_COLORS.teal,
  },
];

export interface PassageGenre {
  type: string;
  color: string;
  traits: string[];
}

export const PASSAGE_GENRES: PassageGenre[] = [
  {
    type: "Natural Science",
    color: NEXUS_COLORS.teal,
    traits: [
      "Dense technical vocabulary",
      "Hypothesis + evidence structure",
      "Author stance often implicit",
    ],
  },
  {
    type: "Social Science",
    color: NEXUS_COLORS.amber,
    traits: [
      "Survey/study evidence",
      "Competing theories",
      "Policy implications",
    ],
  },
  {
    type: "Humanities",
    color: NEXUS_COLORS.pine,
    traits: [
      "Interpretation of art/history/text",
      "Subjective + evaluative",
      "Author opinion prominent",
    ],
  },
  {
    type: "Law",
    color: NEXUS_COLORS.terra,
    traits: [
      "Legal reasoning chains",
      "Precedent-based argument",
      "Normative claims",
    ],
  },
];

export interface MappingStep {
  step: string;
  label: string;
  desc: string;
}

export const MAPPING_PROTOCOL: MappingStep[] = [
  { step: "1", label: "Topic", desc: "What is this about? (1 noun phrase)" },
  { step: "2", label: "Scope", desc: "What specific angle is addressed?" },
  { step: "3", label: "Purpose", desc: "Why did the author write this?" },
  { step: "4", label: "Main Point", desc: "What is the author claiming?" },
  {
    step: "5",
    label: "Tone",
    desc: "Critical / Supportive / Neutral / Cautious?",
  },
  {
    step: "6",
    label: "Structure",
    desc: "P1=intro, P2=evidence, P3=counter, P4=conclusion?",
  },
];

/* ------------------------------------------------------------------ */
/* Formal Logic                                                        */
/* ------------------------------------------------------------------ */

export interface Conditional {
  english: string;
  arrow: string;
  contrapositive: string;
  note: string;
}

export const CONDITIONALS: Conditional[] = [
  {
    english: "If A then B",
    arrow: "A → B",
    contrapositive: "¬B → ¬A",
    note: "Core conditional",
  },
  {
    english: "All A are B",
    arrow: "A → B",
    contrapositive: "¬B → ¬A",
    note: "Universal affirmative",
  },
  {
    english: "No A are B",
    arrow: "A → ¬B",
    contrapositive: "B → ¬A",
    note: "Universal negative",
  },
  {
    english: "Some A are B",
    arrow: "A ↔ B (some)",
    contrapositive: "—",
    note: "Existential — no contrapositive",
  },
  {
    english: "Some A are not B",
    arrow: "A ↔ ¬B (some)",
    contrapositive: "—",
    note: "Existential negative",
  },
  {
    english: "Unless A, then B",
    arrow: "¬A → B",
    contrapositive: "¬B → A",
    note: '"Unless" = "if not"',
  },
  {
    english: "Only if A, then B",
    arrow: "B → A",
    contrapositive: "¬A → ¬B",
    note: '"Only if" flips direction',
  },
  {
    english: "The only A are B",
    arrow: "A → B",
    contrapositive: "¬B → ¬A",
    note: 'Same as "All A are B"',
  },
  {
    english: "A only if B",
    arrow: "A → B",
    contrapositive: "¬B → ¬A",
    note: '"Only if" after subject',
  },
  {
    english: "Whenever A, B",
    arrow: "A → B",
    contrapositive: "¬B → ¬A",
    note: '"Whenever" = "if"',
  },
  {
    english: "A requires B",
    arrow: "A → B",
    contrapositive: "¬B → ¬A",
    note: "B is necessary for A",
  },
  {
    english: "A is necessary for B",
    arrow: "B → A",
    contrapositive: "¬A → ¬B",
    note: "Necessary = right side of arrow",
  },
  {
    english: "A is sufficient for B",
    arrow: "A → B",
    contrapositive: "¬B → ¬A",
    note: "Sufficient = left side of arrow",
  },
  {
    english: "Neither A nor B",
    arrow: "¬A ∧ ¬B",
    contrapositive: "A → ¬B ; B → ¬A",
    note: "Both excluded",
  },
];

export interface InferenceRule {
  rule: string;
  name: string;
  color: string;
}

export const INFERENCE_RULES: InferenceRule[] = [
  {
    rule: "All A → B + All B → C  =  All A → C",
    name: "Chain Rule",
    color: NEXUS_COLORS.pine,
  },
  {
    rule: "All A → B + Some C → A  =  Some C → B",
    name: "Some-All Chain",
    color: NEXUS_COLORS.teal,
  },
  {
    rule: "All A → ¬B  =  No A are B",
    name: "Negative Universal",
    color: NEXUS_COLORS.terra,
  },
  {
    rule: "Some A → B + All B → C  =  Some A → C",
    name: "Some Carries",
    color: NEXUS_COLORS.amber,
  },
  {
    rule: "A → B + A → ¬B  =  ¬A (A is false)",
    name: "Contradiction",
    color: NEXUS_COLORS.lime,
  },
];

/* ------------------------------------------------------------------ */
/* Strategy & Mindset                                                  */
/* ------------------------------------------------------------------ */

export interface AnswerTrap {
  name: string;
  abbr: string;
  description: string;
  watch: string;
}

export const ANSWER_TRAPS: AnswerTrap[] = [
  {
    name: "Out of Scope",
    abbr: "OS",
    description:
      "Introduces new information not mentioned or implied by the stimulus.",
    watch: "New nouns, new relationships, or irrelevant comparisons",
  },
  {
    name: "180 / Opposite",
    abbr: "180",
    description:
      "The exact reverse of what you need — it weakens when you need strengthen, or vice versa.",
    watch: "Pre-phrased the answer; trap reverses the direction",
  },
  {
    name: "Irrelevant Comparison",
    abbr: "IC",
    description:
      "Compares two things that don't affect the conclusion at issue.",
    watch: "Comparisons to unrelated groups, time periods, or metrics",
  },
  {
    name: "Temporal Shift",
    abbr: "TS",
    description:
      "Switches time frame — applies past evidence to the future or vice versa.",
    watch: 'Words: "will," "has been," "recently," "historically"',
  },
  {
    name: "Distortion",
    abbr: "DST",
    description:
      "Subtly twists a stated detail so it no longer matches the passage.",
    watch: "Plausible wording that overstates or alters a claim",
  },
  {
    name: "Exaggerated Support",
    abbr: "EXG",
    description:
      'Answer is stronger than the stimulus supports. Uses "always," "never," "all," "none."',
    watch: "Absolute language with no warrant in the text",
  },
  {
    name: "Right Answer, Wrong Question",
    abbr: "RWQ",
    description: "True statements that miss the question stem's target.",
    watch: "Accurate but doesn't answer what was asked",
  },
];

export interface PacingRow {
  qs: number;
  time: number;
  verdict: string;
  color: string;
}

/** Pacing checkpoints for a 35-minute, 25-question LR/RC section. */
export const PACING_TABLE: PacingRow[] = [
  { qs: 10, time: 23, verdict: "On pace", color: NEXUS_COLORS.lime },
  { qs: 15, time: 17, verdict: "Aggressive — okay", color: NEXUS_COLORS.amber },
  { qs: 20, time: 12, verdict: "Flag & move", color: NEXUS_COLORS.terra },
  {
    qs: 23,
    time: 8,
    verdict: "DANGER — guess & move",
    color: NEXUS_COLORS.terra,
  },
];

export const PER_QUESTION_PACING = [
  { range: "≤90 sec", note: "read, solve, move on", color: NEXUS_COLORS.lime },
  {
    range: "90–150 sec",
    note: "narrow to 2, pick best, flag",
    color: NEXUS_COLORS.amber,
  },
  {
    range: "≥150 sec",
    note: "guess and move immediately",
    color: NEXUS_COLORS.terra,
  },
];

/* ------------------------------------------------------------------ */
/* Study Plan                                                          */
/* ------------------------------------------------------------------ */

export interface StudyTemplate {
  name: string;
  weeks: number | null;
  intensity: string;
  color: string;
  phases: { phase: string; focus: string }[];
}

export const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    name: "16-Week Foundation",
    weeks: 16,
    intensity: "10–12 hrs/week",
    color: NEXUS_COLORS.pine,
    phases: [
      {
        phase: "Weeks 1–4",
        focus: "Fundamentals: question types, conditional logic, RC structure",
      },
      {
        phase: "Weeks 5–9",
        focus: "Type mastery: timed sets per question type + error log",
      },
      { phase: "Weeks 10–13", focus: "Mixed sections + full timed sections" },
      {
        phase: "Weeks 14–16",
        focus: "Full PTs, autopsy, fine-tune pacing & mindset",
      },
    ],
  },
  {
    name: "12-Week Standard",
    weeks: 12,
    intensity: "12–15 hrs/week",
    color: NEXUS_COLORS.teal,
    phases: [
      { phase: "Weeks 1–3", focus: "Fundamentals + drilling weakest types" },
      {
        phase: "Weeks 4–8",
        focus: "Timed type sets, full sections, daily error log",
      },
      { phase: "Weeks 9–12", focus: "Full PTs twice weekly + deep review" },
    ],
  },
  {
    name: "4-Week Intensive",
    weeks: 4,
    intensity: "20+ hrs/week",
    color: NEXUS_COLORS.terra,
    phases: [
      { phase: "Week 1", focus: "Rapid concept refresh + diagnostic PT" },
      { phase: "Week 2", focus: "Targeted drilling on top 3 error categories" },
      { phase: "Week 3", focus: "Full PTs every other day + same-day autopsy" },
      {
        phase: "Week 4",
        focus: "Taper: light review, pacing, mindset, test logistics",
      },
    ],
  },
];

export interface DailyBlock {
  time: string;
  label: string;
  detail: string;
  color: string;
}

export const DAILY_TEMPLATE: DailyBlock[] = [
  {
    time: "20 min",
    label: "Warm-up",
    detail: "Re-read 3 logged errors; restate the correct reasoning aloud.",
    color: NEXUS_COLORS.lime,
  },
  {
    time: "35 min",
    label: "Timed Set",
    detail: "One timed section (LR or RC) under real conditions.",
    color: NEXUS_COLORS.teal,
  },
  {
    time: "45 min",
    label: "Review",
    detail: "Blind review first, then autopsy every miss into the error log.",
    color: NEXUS_COLORS.amber,
  },
  {
    time: "20 min",
    label: "Drill",
    detail: "Untimed reps on the single weakest question type.",
    color: NEXUS_COLORS.terra,
  },
];

/** Error-log question categories used across the app. */
export const ERROR_CATEGORIES = [
  "Logical Reasoning",
  "Reading Comprehension",
  "Formal Logic",
] as const;

export const LR_TYPE_NAMES = LR_QUESTION_TYPES.map(q => q.name);
