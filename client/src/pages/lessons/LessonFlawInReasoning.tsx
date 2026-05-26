/**
 * DESIGN: Academic Light — Warm Parchment
 * Lesson: Flaw in the Reasoning (Lesson 7)
 *
 * Flaw questions ask you to identify the structural error in an argument.
 * Unlike Necessary/Sufficient Assumption questions (which ask what's missing),
 * Flaw questions ask what's *wrong* with the reasoning as presented.
 *
 * Signature visual moment: interactive "Flaw Spotter" — students read a short
 * argument and click the flaw type they think it commits, with instant feedback.
 *
 * Progress is persisted to localStorage so students can resume mid-lesson.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Zap,
  Search,
} from "lucide-react";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import type { LessonStep } from "@/components/ProgressBar";
import ProgressBar from "@/components/ProgressBar";
import SessionPlanCTA from "@/components/SessionPlanCTA";
import { useLessonCompletion } from "@/hooks/useLessonCompletion";

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS: LessonStep[] = [
  "hero",
  "bridge",
  "negation",
  "protip",
  "practice",
  "recap",
];

// ─── Colour tokens ────────────────────────────────────────────────────────────

const AMBER = "#C8860A";
const VIOLET = "#5B4A8A";
const GREEN = "#2E7D52";
const RED = "#B84030";
const PARCHMENT = "#F7F4EF";
const INK = "#1E2130";

// ─── Shared animation ─────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

// ─── Flaw taxonomy data ───────────────────────────────────────────────────────

const FLAW_TYPES = [
  {
    id: "correlation-causation",
    name: "Correlation → Causation",
    symbol: "↔ ≠ →",
    color: RED,
    description:
      "The argument treats a statistical association as proof that one thing causes the other.",
    example:
      "Ice cream sales and drowning rates both rise in summer. Therefore, ice cream causes drowning.",
    signal: "Look for: 'therefore causes,' 'leads to,' 'results in' after describing a pattern.",
  },
  {
    id: "necessary-sufficient",
    name: "Necessary / Sufficient Confusion",
    symbol: "N ≠ S",
    color: VIOLET,
    description:
      "The argument treats a necessary condition as if it were sufficient, or vice versa.",
    example:
      "You need oxygen to live. You have oxygen. Therefore, you will live.",
    signal: "Look for: 'only if,' 'requires,' 'must have' being treated as 'guarantees.'",
  },
  {
    id: "unrepresentative-sample",
    name: "Unrepresentative Sample",
    symbol: "n ≪ N",
    color: AMBER,
    description:
      "The argument draws a broad conclusion from a sample that is too small, biased, or atypical.",
    example:
      "I asked five of my friends — all lawyers — and they all support the bill. So most Americans support it.",
    signal: "Look for: small groups, self-selected respondents, or non-random samples.",
  },
  {
    id: "ad-hominem",
    name: "Ad Hominem",
    symbol: "Person ≠ Argument",
    color: "#2E7D52",
    description:
      "The argument attacks or dismisses a person's character or circumstances rather than addressing their reasoning.",
    example:
      "We shouldn't trust Dr. Smith's climate research — she drives a gas-powered car.",
    signal: "Look for: attacks on the speaker's credibility, motives, or personal life.",
  },
  {
    id: "false-dilemma",
    name: "False Dilemma",
    symbol: "A ∨ B (ignoring C, D…)",
    color: "#C8860A",
    description:
      "The argument presents only two options as if they are exhaustive, ignoring other possibilities.",
    example:
      "Either we cut the education budget or we raise taxes. We won't raise taxes. So we must cut education.",
    signal: "Look for: 'either…or,' 'only two options,' 'must choose between.'",
  },
  {
    id: "circular-reasoning",
    name: "Circular Reasoning",
    symbol: "P → P",
    color: "#5B4A8A",
    description:
      "The argument uses the conclusion as part of its own support — the premise and conclusion say the same thing.",
    example:
      "The Bible is true because it says so in the Bible.",
    signal: "Look for: the conclusion restated as a premise, often in different words.",
  },
];

// ─── Flaw Spotter data (interactive step) ────────────────────────────────────

const FLAW_SPOTTER_SCENARIOS = [
  {
    argument:
      "Students at schools with longer lunch periods score higher on standardized tests. Therefore, extending lunch periods causes academic improvement.",
    correctFlawId: "correlation-causation",
    hint: "The argument moves from a pattern to a causal claim without ruling out other explanations.",
  },
  {
    argument:
      "To become a doctor, you must complete medical school. Maria completed medical school. Therefore, Maria is a doctor.",
    correctFlawId: "necessary-sufficient",
    hint: "Completing medical school is required but doesn't by itself guarantee the outcome.",
  },
  {
    argument:
      "A survey of gym members found that 80% exercise at least five times per week. Clearly, most people in this country exercise frequently.",
    correctFlawId: "unrepresentative-sample",
    hint: "Consider who was surveyed and whether they represent the broader population.",
  },
];

// ─── Practice question ────────────────────────────────────────────────────────

const PRACTICE_QUESTION = {
  stimulus: `A pharmaceutical company's internal study found that patients who took Drug X reported fewer headaches than those who took a placebo. The company concluded that Drug X is an effective treatment for headaches and should be approved for widespread use.`,
  question:
    "The argument is most vulnerable to criticism on the grounds that it",
  choices: [
    {
      letter: "A",
      text: "relies on a study conducted by a party with a financial interest in the outcome.",
      correct: false,
      explanation:
        "While researcher bias is a legitimate concern in real life, the LSAT treats this as a separate issue from the logical structure of the argument. The argument's core flaw is structural — it doesn't address whether the sample is representative or whether other explanations exist.",
    },
    {
      letter: "B",
      text: "draws a conclusion about widespread use from a single internal study without considering whether the study's participants are representative of the general population.",
      correct: true,
      explanation:
        "Correct. The argument leaps from one internal study to a recommendation for widespread use. The study's participants may not represent the full range of patients who would use the drug. This is the unrepresentative sample / overgeneralization flaw.",
    },
    {
      letter: "C",
      text: "assumes that reducing headaches is the only relevant measure of a drug's effectiveness.",
      correct: false,
      explanation:
        "This is a scope issue — the argument is specifically about headache treatment, so measuring headache reduction is appropriate within that scope. The flaw lies elsewhere.",
    },
    {
      letter: "D",
      text: "treats a correlation between Drug X and reduced headaches as proof that Drug X causes the reduction.",
      correct: false,
      explanation:
        "Close, but the argument does control for this somewhat by using a placebo group — the comparison is between Drug X and placebo, not just a raw correlation. The stronger flaw is the generalizability of the sample, not the correlation-causation leap.",
    },
    {
      letter: "E",
      text: "fails to consider that headaches may have other causes unrelated to the drug.",
      correct: false,
      explanation:
        "The argument is about whether Drug X treats headaches, not about what causes them. The cause of headaches is outside the argument's scope. The flaw is about generalizing from a limited study to widespread use.",
    },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...fadeUp} className="max-w-2xl mx-auto px-4 py-16">
      {children}
    </motion.div>
  );
}

function ContinueButton({
  label = "Continue",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="mt-10 flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white transition-all"
      style={{
        background: RED,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: "1rem",
      }}
    >
      {label} <ArrowRight size={18} />
    </motion.button>
  );
}

// ─── Step 0: Hero ─────────────────────────────────────────────────────────────

function HeroStep({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
      style={{ background: PARCHMENT }}
    >
      <motion.div {...fadeUp} className="max-w-xl">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: `${RED}18`, border: `2px solid ${RED}30` }}
        >
          <AlertTriangle size={32} style={{ color: RED }} />
        </div>

        <p
          className="uppercase tracking-widest mb-3"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.75rem",
            color: AMBER,
            fontWeight: 700,
          }}
        >
          Lesson 7 · Assumption Family
        </p>

        <h1
          className="mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3rem)",
            color: INK,
            lineHeight: 1.15,
          }}
        >
          Flaw in the Reasoning
        </h1>

        <p
          className="mb-8"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "1.15rem",
            color: "rgba(30,33,48,0.65)",
            lineHeight: 1.75,
          }}
        >
          Necessary and Sufficient Assumption questions ask what's{" "}
          <em>missing</em>. Flaw questions ask what's <em>wrong</em>. You're not
          filling a gap — you're naming the structural error the argument already
          commits.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-10 text-sm">
          {["~16 min", "Intermediate", "6 flaw types", "Interactive Flaw Spotter"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full"
              style={{
                background: `${RED}12`,
                color: RED,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                border: `1px solid ${RED}25`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="px-10 py-4 rounded-xl font-bold text-white text-lg"
          style={{
            background: RED,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Begin Lesson
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── Step 1: Concept — What makes a Flaw question different ──────────────────

function ConceptStep({ onComplete }: { onComplete: () => void }) {
  return (
    <SectionReveal>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${AMBER}18` }}
        >
          <BookOpen size={20} style={{ color: AMBER }} />
        </div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "0.8rem",
            color: AMBER,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          The Core Concept
        </p>
      </div>

      <h2
        className="mb-6"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          fontSize: "1.9rem",
          color: INK,
          lineHeight: 1.2,
        }}
      >
        Assumption vs. Flaw — The Critical Distinction
      </h2>

      {/* Comparison table */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {[
          {
            type: "Necessary Assumption",
            question: "What must be true for this argument to work?",
            task: "Find the hidden premise the argument cannot survive without.",
            color: VIOLET,
            icon: "NA",
          },
          {
            type: "Sufficient Assumption",
            question: "What, if true, guarantees the conclusion?",
            task: "Find the bridge that makes the conclusion logically certain.",
            color: "#5B4A8A",
            icon: "SA",
          },
          {
            type: "Flaw in the Reasoning",
            question: "What is wrong with this argument?",
            task: "Name the structural error already present in the reasoning.",
            color: RED,
            icon: "FL",
          },
        ].map((row) => (
          <div
            key={row.type}
            className="flex items-start gap-4 p-4 rounded-xl"
            style={{
              background: `${row.color}08`,
              border: `1px solid ${row.color}25`,
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
              style={{
                background: `${row.color}18`,
                color: row.color,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {row.icon}
            </div>
            <div>
              <p
                className="font-bold mb-1"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: row.color,
                  fontSize: "0.9rem",
                }}
              >
                {row.type}
              </p>
              <p
                className="italic mb-1"
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "0.9rem",
                  color: "rgba(30,33,48,0.6)",
                }}
              >
                "{row.question}"
              </p>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "0.9rem",
                  color: INK,
                  lineHeight: 1.6,
                }}
              >
                {row.task}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Key insight */}
      <div
        className="rounded-xl p-5 mb-8"
        style={{ background: `${RED}08`, borderLeft: `4px solid ${RED}` }}
      >
        <p
          className="font-bold mb-2"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: RED,
            fontSize: "0.9rem",
          }}
        >
          The Flaw Question Stem
        </p>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "0.95rem",
            color: "rgba(30,33,48,0.75)",
            lineHeight: 1.8,
          }}
        >
          Flaw questions are identified by stems like: <em>"The argument is
          flawed because it…"</em>, <em>"The reasoning is most vulnerable to
          criticism on the grounds that it…"</em>, or{" "}
          <em>"Which of the following identifies a flaw in the argument?"</em>
        </p>
      </div>

      {/* The two-step method */}
      <div
        className="rounded-xl p-5 mb-8"
        style={{ background: `${AMBER}08`, borderLeft: `4px solid ${AMBER}` }}
      >
        <p
          className="font-bold mb-3"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: AMBER,
            fontSize: "0.9rem",
          }}
        >
          The Two-Step Flaw Method
        </p>
        <ol className="space-y-3">
          {[
            {
              step: "1. Identify the gap",
              detail:
                "Read the argument and ask: what logical leap does the author make? Where does the reasoning break down?",
            },
            {
              step: "2. Match the flaw type",
              detail:
                "Flaw answers are written in abstract language ('treats a correlation as causation,' 'assumes that because something is necessary it is also sufficient'). Match your diagnosis to the answer that describes it.",
            },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-3">
              <span
                className="font-bold flex-shrink-0"
                style={{
                  color: AMBER,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.9rem",
                }}
              >
                {item.step}
              </span>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "0.9rem",
                  color: "rgba(30,33,48,0.75)",
                  lineHeight: 1.7,
                }}
              >
                {item.detail}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <ContinueButton onClick={onComplete} />
    </SectionReveal>
  );
}

// ─── Step 2: Flaw Taxonomy (interactive cards) ────────────────────────────────

function TaxonomyStep({ onComplete }: { onComplete: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <SectionReveal>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${VIOLET}18` }}
        >
          <Search size={20} style={{ color: VIOLET }} />
        </div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "0.8rem",
            color: VIOLET,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          The Six Core Flaws
        </p>
      </div>

      <h2
        className="mb-3"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          fontSize: "1.9rem",
          color: INK,
          lineHeight: 1.2,
        }}
      >
        Your Flaw Taxonomy
      </h2>

      <p
        className="mb-8"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "1rem",
          color: "rgba(30,33,48,0.65)",
          lineHeight: 1.8,
        }}
      >
        Tap each flaw to see its definition, a real example, and the signal
        phrase to watch for in LSAT arguments.
      </p>

      <div className="space-y-3 mb-8">
        {FLAW_TYPES.map((flaw) => {
          const isOpen = expanded === flaw.id;
          return (
            <motion.div
              key={flaw.id}
              layout
              className="rounded-xl overflow-hidden cursor-pointer"
              style={{
                border: `1px solid ${isOpen ? flaw.color : "rgba(0,0,0,0.08)"}`,
                background: isOpen ? `${flaw.color}06` : "#FFFFFF",
              }}
              onClick={() => setExpanded(isOpen ? null : flaw.id)}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 p-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs"
                  style={{
                    background: `${flaw.color}15`,
                    color: flaw.color,
                  }}
                >
                  {flaw.symbol.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-bold"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: isOpen ? flaw.color : INK,
                      fontSize: "0.95rem",
                    }}
                  >
                    {flaw.name}
                  </p>
                </div>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: "rgba(30,33,48,0.35)", fontSize: "0.8rem" }}
                >
                  ▼
                </motion.span>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 pb-4"
                  >
                    <p
                      className="mb-3"
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: "0.9rem",
                        color: "rgba(30,33,48,0.75)",
                        lineHeight: 1.75,
                      }}
                    >
                      {flaw.description}
                    </p>

                    <div
                      className="rounded-lg p-3 mb-3"
                      style={{ background: `${flaw.color}08` }}
                    >
                      <p
                        className="text-xs font-bold uppercase tracking-wider mb-1"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: flaw.color,
                        }}
                      >
                        Example
                      </p>
                      <p
                        className="italic"
                        style={{
                          fontFamily: "'Lora', serif",
                          fontSize: "0.88rem",
                          color: INK,
                          lineHeight: 1.65,
                        }}
                      >
                        "{flaw.example}"
                      </p>
                    </div>

                    <div
                      className="rounded-lg p-3"
                      style={{
                        background: "rgba(0,0,0,0.03)",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <p
                        className="text-xs font-bold uppercase tracking-wider mb-1"
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: "rgba(30,33,48,0.45)",
                        }}
                      >
                        Signal Phrase
                      </p>
                      <p
                        style={{
                          fontFamily: "'Lora', serif",
                          fontSize: "0.88rem",
                          color: "rgba(30,33,48,0.7)",
                          lineHeight: 1.65,
                        }}
                      >
                        {flaw.signal}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <ContinueButton onClick={onComplete} />
    </SectionReveal>
  );
}

// ─── Step 3: Flaw Spotter (signature visual moment) ───────────────────────────

function FlawSpotterStep({ onComplete }: { onComplete: () => void }) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);

  const scenario = FLAW_SPOTTER_SCENARIOS[scenarioIndex];

  const handleSelect = (flawId: string) => {
    if (selected !== null) return;
    setSelected(flawId);
  };

  const handleNext = () => {
    if (scenarioIndex < FLAW_SPOTTER_SCENARIOS.length - 1) {
      setScenarioIndex((i) => i + 1);
      setSelected(null);
    } else {
      setAllDone(true);
    }
  };

  const isCorrect = selected === scenario.correctFlawId;
  const correctFlaw = FLAW_TYPES.find((f) => f.id === scenario.correctFlawId)!;

  return (
    <SectionReveal>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${RED}18` }}
        >
          <Zap size={20} style={{ color: RED }} />
        </div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "0.8rem",
            color: RED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Flaw Spotter
        </p>
      </div>

      <h2
        className="mb-3"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          fontSize: "1.9rem",
          color: INK,
          lineHeight: 1.2,
        }}
      >
        Name That Flaw
      </h2>

      <p
        className="mb-6"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "1rem",
          color: "rgba(30,33,48,0.65)",
          lineHeight: 1.8,
        }}
      >
        Read each argument and tap the flaw type it commits. Use your taxonomy
        from the previous step.
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mb-6">
        {FLAW_SPOTTER_SCENARIOS.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background:
                i < scenarioIndex
                  ? GREEN
                  : i === scenarioIndex
                  ? RED
                  : "rgba(0,0,0,0.15)",
            }}
          />
        ))}
      </div>

      {!allDone ? (
        <>
          {/* Argument card */}
          <div
            className="rounded-xl p-5 mb-6"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "rgba(30,33,48,0.4)",
              }}
            >
              Argument {scenarioIndex + 1} of {FLAW_SPOTTER_SCENARIOS.length}
            </p>
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "0.95rem",
                color: INK,
                lineHeight: 1.8,
              }}
            >
              {scenario.argument}
            </p>
          </div>

          {/* Flaw type buttons */}
          <p
            className="mb-3 font-semibold"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.85rem",
              color: "rgba(30,33,48,0.55)",
            }}
          >
            Which flaw does this argument commit?
          </p>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {FLAW_TYPES.map((flaw) => {
              const isSelected = selected === flaw.id;
              const isCorrectFlaw = flaw.id === scenario.correctFlawId;
              let bg = "#FFFFFF";
              let border = "rgba(0,0,0,0.1)";
              let textColor = INK;

              if (selected !== null) {
                if (isCorrectFlaw) {
                  bg = `${GREEN}10`;
                  border = GREEN;
                  textColor = GREEN;
                } else if (isSelected && !isCorrectFlaw) {
                  bg = "rgba(184,64,48,0.06)";
                  border = RED;
                  textColor = RED;
                }
              } else if (isSelected) {
                bg = `${flaw.color}08`;
                border = flaw.color;
                textColor = flaw.color;
              }

              return (
                <motion.button
                  key={flaw.id}
                  whileHover={selected === null ? { scale: 1.02 } : {}}
                  whileTap={selected === null ? { scale: 0.98 } : {}}
                  onClick={() => handleSelect(flaw.id)}
                  className="text-left p-3 rounded-xl transition-all"
                  style={{
                    background: bg,
                    border: `1px solid ${border}`,
                    cursor: selected !== null ? "default" : "pointer",
                  }}
                >
                  <p
                    className="font-bold text-xs mb-0.5"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: textColor,
                      fontSize: "0.75rem",
                    }}
                  >
                    {flaw.name}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div
                  className="flex items-center gap-2 p-3 rounded-xl mb-3"
                  style={{
                    background: isCorrect ? `${GREEN}10` : "rgba(184,64,48,0.06)",
                    border: `1px solid ${isCorrect ? GREEN : RED}30`,
                  }}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={18} style={{ color: GREEN }} />
                  ) : (
                    <XCircle size={18} style={{ color: RED }} />
                  )}
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      color: isCorrect ? GREEN : RED,
                      fontSize: "0.9rem",
                    }}
                  >
                    {isCorrect
                      ? `Correct — ${correctFlaw.name}`
                      : `Not quite — this is ${correctFlaw.name}`}
                  </p>
                </div>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.9rem",
                    color: "rgba(30,33,48,0.7)",
                    lineHeight: 1.75,
                  }}
                >
                  {scenario.hint}
                </p>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white"
                  style={{
                    background: RED,
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.9rem",
                  }}
                >
                  {scenarioIndex < FLAW_SPOTTER_SCENARIOS.length - 1
                    ? "Next Argument"
                    : "See Pro Tip"}{" "}
                  <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <motion.div {...fadeUp}>
          <div
            className="flex items-center gap-3 p-4 rounded-xl mb-6"
            style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30` }}
          >
            <CheckCircle2 size={22} style={{ color: GREEN }} />
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                color: GREEN,
                fontSize: "1rem",
              }}
            >
              Flaw Spotter complete — all three arguments identified.
            </p>
          </div>
          <ContinueButton label="Continue to Pro Tip" onClick={onComplete} />
        </motion.div>
      )}
    </SectionReveal>
  );
}

// ─── Step 4: Pro Tip — Answer language on the LSAT ───────────────────────────

function ProTipStep({ onComplete }: { onComplete: () => void }) {
  return (
    <SectionReveal>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${GREEN}18` }}
        >
          <Lightbulb size={20} style={{ color: GREEN }} />
        </div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "0.8rem",
            color: GREEN,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Pro Tip
        </p>
      </div>

      <h2
        className="mb-6"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          fontSize: "1.9rem",
          color: INK,
          lineHeight: 1.2,
        }}
      >
        How LSAT Flaw Answers Are Written
      </h2>

      <p
        className="mb-6"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "1.05rem",
          color: "rgba(30,33,48,0.72)",
          lineHeight: 1.85,
        }}
      >
        LSAT flaw answers never say "correlation/causation" or "ad hominem"
        directly. They describe the flaw in abstract, structural language. You
        need to recognize the pattern and match it to your diagnosis.
      </p>

      {/* Flaw-to-LSAT-language mapping */}
      <div className="space-y-3 mb-8">
        {[
          {
            flaw: "Correlation → Causation",
            lsatLanguage:
              "\"…treats a correlation between X and Y as evidence that X causes Y\"",
            color: RED,
          },
          {
            flaw: "Necessary / Sufficient Confusion",
            lsatLanguage:
              "\"…assumes that because X is required for Y, X is sufficient to produce Y\"",
            color: VIOLET,
          },
          {
            flaw: "Unrepresentative Sample",
            lsatLanguage:
              "\"…draws a conclusion about a general population from a sample that may not be representative\"",
            color: AMBER,
          },
          {
            flaw: "Ad Hominem",
            lsatLanguage:
              "\"…attacks the source of the argument rather than the argument itself\"",
            color: GREEN,
          },
          {
            flaw: "False Dilemma",
            lsatLanguage:
              "\"…presupposes that there are only two possible courses of action when others may exist\"",
            color: AMBER,
          },
          {
            flaw: "Circular Reasoning",
            lsatLanguage:
              "\"…takes for granted the very point it is trying to establish\"",
            color: VIOLET,
          },
        ].map((row) => (
          <div
            key={row.flaw}
            className="p-4 rounded-xl"
            style={{
              background: `${row.color}06`,
              border: `1px solid ${row.color}20`,
            }}
          >
            <p
              className="font-bold mb-1"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: row.color,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {row.flaw}
            </p>
            <p
              className="italic"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "0.9rem",
                color: "rgba(30,33,48,0.75)",
                lineHeight: 1.65,
              }}
            >
              {row.lsatLanguage}
            </p>
          </div>
        ))}
      </div>

      <blockquote
        className="rounded-xl p-5 mb-8"
        style={{
          background: `${RED}06`,
          borderLeft: `4px solid ${RED}`,
        }}
      >
        <p
          className="italic"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "1rem",
            color: "rgba(30,33,48,0.75)",
            lineHeight: 1.8,
          }}
        >
          "Diagnose first, then match. Never read the answer choices before you
          have a clear diagnosis — the wrong answers are designed to sound
          plausible if you haven't already committed to what the flaw is."
        </p>
      </blockquote>

      <ContinueButton onClick={onComplete} />
    </SectionReveal>
  );
}

// ─── Step 5: Practice ─────────────────────────────────────────────────────────

function PracticeStep({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (letter: string) => {
    if (revealed) return;
    setSelected(letter);
  };

  const handleReveal = () => {
    if (!selected) return;
    setRevealed(true);
  };

  const correctLetter = PRACTICE_QUESTION.choices.find((c) => c.correct)!.letter;
  const isCorrect = selected === correctLetter;

  return (
    <SectionReveal>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${RED}18` }}
        >
          <AlertTriangle size={20} style={{ color: RED }} />
        </div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "0.8rem",
            color: RED,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Practice Question
        </p>
      </div>

      <h2
        className="mb-6"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          fontSize: "1.6rem",
          color: INK,
          lineHeight: 1.25,
        }}
      >
        Apply the Framework
      </h2>

      {/* Stimulus */}
      <div
        className="rounded-xl p-5 mb-4"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-wider mb-3"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: "rgba(30,33,48,0.4)",
          }}
        >
          Stimulus
        </p>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "0.95rem",
            color: INK,
            lineHeight: 1.8,
          }}
        >
          {PRACTICE_QUESTION.stimulus}
        </p>
      </div>

      {/* Question stem */}
      <p
        className="mb-5 font-semibold"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "0.95rem",
          color: INK,
          lineHeight: 1.6,
        }}
      >
        {PRACTICE_QUESTION.question}
      </p>

      {/* Answer choices */}
      <div className="space-y-3 mb-6">
        {PRACTICE_QUESTION.choices.map((choice) => {
          const isSelected = selected === choice.letter;
          const showCorrectHighlight = revealed && choice.correct;

          let borderColor = "rgba(0,0,0,0.1)";
          let bg = "#FFFFFF";
          if (isSelected && !revealed) {
            borderColor = RED;
            bg = `${RED}06`;
          }
          if (revealed && isSelected && isCorrect) {
            borderColor = GREEN;
            bg = `${GREEN}08`;
          }
          if (revealed && isSelected && !isCorrect) {
            borderColor = RED;
            bg = "rgba(184,64,48,0.06)";
          }
          if (showCorrectHighlight && !isSelected) {
            borderColor = GREEN;
            bg = `${GREEN}06`;
          }

          return (
            <motion.div
              key={choice.letter}
              whileHover={!revealed ? { scale: 1.01 } : {}}
              onClick={() => handleSelect(choice.letter)}
              className="rounded-xl p-4 cursor-pointer transition-all"
              style={{
                border: `1px solid ${borderColor}`,
                background: bg,
                cursor: revealed ? "default" : "pointer",
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="font-bold flex-shrink-0"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color:
                      revealed && choice.correct
                        ? GREEN
                        : revealed && isSelected && !isCorrect
                        ? RED
                        : "rgba(30,33,48,0.4)",
                    fontSize: "0.9rem",
                  }}
                >
                  {choice.letter}.
                </span>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.92rem",
                    color: INK,
                    lineHeight: 1.7,
                  }}
                >
                  {choice.text}
                </p>
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {revealed && isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: "0.88rem",
                        color: "rgba(30,33,48,0.7)",
                        lineHeight: 1.75,
                      }}
                    >
                      {choice.explanation}
                    </p>
                  </motion.div>
                )}
                {revealed && !isSelected && choice.correct && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: "0.88rem",
                        color: "rgba(30,33,48,0.7)",
                        lineHeight: 1.75,
                      }}
                    >
                      {choice.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Check / Continue */}
      {!revealed ? (
        <motion.button
          whileHover={selected ? { scale: 1.03 } : {}}
          whileTap={selected ? { scale: 0.97 } : {}}
          onClick={handleReveal}
          disabled={!selected}
          className="px-7 py-3 rounded-xl font-semibold text-white transition-all"
          style={{
            background: selected ? RED : "rgba(0,0,0,0.12)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "1rem",
            cursor: selected ? "pointer" : "not-allowed",
          }}
        >
          Check Answer
        </motion.button>
      ) : (
        <div className="mt-4">
          {isCorrect ? (
            <div
              className="flex items-center gap-2 mb-6 p-4 rounded-xl"
              style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30` }}
            >
              <CheckCircle2 size={20} style={{ color: GREEN }} />
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: GREEN,
                  fontSize: "0.95rem",
                }}
              >
                Correct! You identified the overgeneralization flaw.
              </p>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 mb-6 p-4 rounded-xl"
              style={{
                background: "rgba(184,64,48,0.06)",
                border: "1px solid rgba(184,64,48,0.2)",
              }}
            >
              <XCircle size={20} style={{ color: RED }} />
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: RED,
                  fontSize: "0.95rem",
                }}
              >
                Not quite — review the explanation for (B) above.
              </p>
            </div>
          )}
          <ContinueButton label="See Recap" onClick={onComplete} />
        </div>
      )}
    </SectionReveal>
  );
}

// ─── Step 6: Recap ────────────────────────────────────────────────────────────

function RecapStep() {
  const [, navigate] = useLocation();

  return (
    <SectionReveal>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${GREEN}18` }}
        >
          <CheckCircle2 size={20} style={{ color: GREEN }} />
        </div>
        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "0.8rem",
            color: GREEN,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Lesson Complete
        </p>
      </div>

      <h2
        className="mb-6"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 800,
          fontSize: "1.9rem",
          color: INK,
          lineHeight: 1.2,
        }}
      >
        What You've Learned
      </h2>

      <div className="space-y-3 mb-8">
        {[
          "Flaw questions ask you to name the structural error already present in the argument — not what's missing.",
          "The Two-Step Method: diagnose the gap first, then match your diagnosis to the abstract language in the answer choices.",
          "The six core flaw types: Correlation→Causation, Necessary/Sufficient Confusion, Unrepresentative Sample, Ad Hominem, False Dilemma, and Circular Reasoning.",
          "LSAT flaw answers use abstract structural language — learn the standard phrasing for each flaw type.",
          "Always diagnose before reading answer choices. Wrong answers are designed to sound plausible if you haven't committed to a diagnosis.",
        ].map((point, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            <CheckCircle2
              size={18}
              className="flex-shrink-0 mt-0.5"
              style={{ color: GREEN }}
            />
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "0.92rem",
                color: "rgba(30,33,48,0.75)",
                lineHeight: 1.75,
              }}
            >
              {point}
            </p>
          </div>
        ))}
      </div>

      {/* Assumption family arc complete */}
      <div
        className="rounded-xl p-5 mb-8"
        style={{ background: `${AMBER}08`, borderLeft: `4px solid ${AMBER}` }}
      >
        <p
          className="font-bold mb-2"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: AMBER,
            fontSize: "0.9rem",
          }}
        >
          The Assumption Family — Complete
        </p>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "0.95rem",
            color: "rgba(30,33,48,0.72)",
            lineHeight: 1.8,
          }}
        >
          You have now studied all three members of the Assumption Family:{" "}
          <strong style={{ color: VIOLET }}>Necessary Assumptions</strong> (what
          the argument cannot survive without),{" "}
          <strong style={{ color: "#5B4A8A" }}>Sufficient Assumptions</strong>{" "}
          (what guarantees the conclusion), and{" "}
          <strong style={{ color: RED }}>Flaw in the Reasoning</strong> (what's
          structurally wrong). Together, these three question types account for
          a significant share of every LSAT Logical Reasoning section.
        </p>
      </div>

      <div
        className="mb-8"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "0.95rem",
          color: "rgba(30,33,48,0.65)",
          lineHeight: 1.8,
        }}
      >
        <p>
          What's next:{" "}
          <button
            onClick={() => navigate("/lessons")}
            style={{
              color: RED,
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Lora', serif",
              fontSize: "inherit",
            }}
          >
            Explore all lessons →
          </button>
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/lessons")}
        className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold transition-all"
        style={{
          background: `${RED}12`,
          color: RED,
          border: `1px solid ${RED}30`,
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "1rem",
        }}
      >
        <ChevronLeft size={18} />
        Back to Lessons
      </motion.button>
    </SectionReveal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LessonFlawInReasoning() {
  const [, navigate] = useLocation();
  const { currentStep, setCurrentStep, resetProgress, hasStarted } =
    useLessonProgress("flaw-in-reasoning");
  const { markComplete } = useLessonCompletion("flaw-in-reasoning");

  const handleStart = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStepComplete = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    // Mark complete when reaching recap (step 5)
    if (nextStep >= STEPS.length - 1) {
      markComplete();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    resetProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    navigate("/lessons");
  };

  return (
    <div className="min-h-screen" style={{ background: PARCHMENT }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -4 }}
        onClick={handleBack}
        className="fixed top-20 left-4 z-40 p-2 rounded-lg transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(0,0,0,0.1)",
          backdropFilter: "blur(12px)",
        }}
        title="Back to Lessons"
      >
        <ChevronLeft size={20} style={{ color: INK }} />
      </motion.button>

      {/* Reset Progress button */}
      {hasStarted && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleReset}
          className="fixed top-20 right-4 z-40 flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(0,0,0,0.1)",
            backdropFilter: "blur(12px)",
            color: "rgba(30,33,48,0.5)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
          title="Reset lesson progress"
        >
          <RotateCcw size={14} />
          Reset Progress
        </motion.button>
      )}

      {/* Progress bar */}
      {currentStep > 0 && (
        <ProgressBar currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />
      )}

      {/* Step rendering */}
      {currentStep === 0 && <HeroStep onStart={handleStart} />}

      {currentStep >= 1 && (
        <div style={{ paddingTop: currentStep === 1 ? "80px" : "0" }}>
          <ConceptStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 2 && (
        <div style={{ paddingTop: currentStep === 2 ? "80px" : "0" }}>
          <TaxonomyStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 3 && (
        <div style={{ paddingTop: currentStep === 3 ? "80px" : "0" }}>
          <FlawSpotterStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 4 && (
        <div style={{ paddingTop: currentStep === 4 ? "80px" : "0" }}>
          <ProTipStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 5 && (
        <div style={{ paddingTop: currentStep === 5 ? "80px" : "0" }}>
          <PracticeStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 6 && (
        <div style={{ paddingTop: currentStep === 6 ? "80px" : "0" }}>
          <RecapStep />
          <SessionPlanCTA
            lessonTitle="Flaw in the Reasoning"
            lessonDescription="Master the six core LSAT flaw types and the Two-Step Flaw Method for identifying structural errors in arguments."
          />
        </div>
      )}
    </div>
  );
}
