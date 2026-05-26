/**
 * DESIGN: Academic Light — Warm Parchment
 * Lesson: Sufficient Assumptions
 *
 * Sufficient Assumptions are the "if true, proves the conclusion" family.
 * Unlike Necessary Assumptions (which the argument cannot survive without),
 * a Sufficient Assumption is a statement that, if added to the premises,
 * makes the conclusion logically guaranteed.
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
  Target,
  Zap,
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
const PARCHMENT = "#F7F4EF";
const INK = "#1E2130";

// ─── Shared animation ─────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

// ─── Practice question ────────────────────────────────────────────────────────

const PRACTICE_QUESTION = {
  stimulus: `A city council is debating whether to approve a new highway expansion. The project manager argues: "The expansion will reduce commute times for residents. Therefore, the expansion will improve residents' quality of life."`,
  question:
    "Which one of the following, if assumed, allows the conclusion to be properly drawn?",
  choices: [
    {
      letter: "A",
      text: "Reducing commute times is the most important factor in improving quality of life.",
      correct: false,
      explanation:
        "This is stronger than needed — it claims commute time is the *most* important factor, which overshoots what the argument requires. A sufficient assumption only needs to bridge the gap, not rank the factors.",
    },
    {
      letter: "B",
      text: "Anything that reduces commute times for residents improves their quality of life.",
      correct: true,
      explanation:
        "Correct. This is the classic sufficient assumption form: a conditional statement that bridges the gap between the premise (reduces commute times) and the conclusion (improves quality of life). If this is true, the conclusion follows necessarily from the premise.",
    },
    {
      letter: "C",
      text: "Highway expansions have historically been popular with city residents.",
      correct: false,
      explanation:
        "Popularity is irrelevant to quality of life. This answer introduces a new concept (popularity) that doesn't connect the premise to the conclusion.",
    },
    {
      letter: "D",
      text: "Reducing commute times sometimes improves residents' quality of life.",
      correct: false,
      explanation:
        "Close, but 'sometimes' is too weak. A sufficient assumption must guarantee the conclusion. 'Sometimes' leaves open the possibility that this particular case is an exception.",
    },
    {
      letter: "E",
      text: "The highway expansion will not have any negative environmental effects.",
      correct: false,
      explanation:
        "Environmental effects are outside the scope of this argument. The argument moves from 'reduces commute times' to 'improves quality of life' — environmental impact doesn't bridge that gap.",
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
        background: VIOLET,
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
          style={{ background: `${VIOLET}18`, border: `2px solid ${VIOLET}30` }}
        >
          <Target size={32} style={{ color: VIOLET }} />
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
          Lesson 6 · Assumption Family
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
          Sufficient Assumptions
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
          If a Necessary Assumption is what an argument{" "}
          <em>cannot survive without</em>, a Sufficient Assumption is what
          makes the conclusion <em>logically guaranteed</em>. Learn to spot the
          bridge that seals the deal.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-10 text-sm">
          {["~14 min", "Intermediate", "5 practice choices"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full"
              style={{
                background: `${VIOLET}12`,
                color: VIOLET,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                border: `1px solid ${VIOLET}25`,
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
            background: VIOLET,
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Begin Lesson
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── Step 1: Bridge (NA vs SA contrast) ───────────────────────────────────────

function BridgeStep({ onComplete }: { onComplete: () => void }) {
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
          The Core Distinction
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
        Necessary vs. Sufficient — The Assumption Family
      </h2>

      <p
        className="mb-8"
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "1.05rem",
          color: "rgba(30,33,48,0.72)",
          lineHeight: 1.85,
        }}
      >
        Both question types ask you to find an unstated assumption. But they
        ask for different <em>kinds</em> of assumptions.
      </p>

      {/* Comparison table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          {
            label: "Necessary Assumption",
            color: "#1a7dff",
            definition:
              "A statement the argument CANNOT survive without. Remove it and the argument collapses.",
            test: "Negate it — does the argument fall apart?",
            icon: "🔑",
          },
          {
            label: "Sufficient Assumption",
            color: VIOLET,
            definition:
              "A statement that, if true, GUARANTEES the conclusion. Add it and the argument becomes airtight.",
            test: "Add it — does the conclusion now follow necessarily?",
            icon: "🔒",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-5"
            style={{
              background: "#FFFFFF",
              border: `2px solid ${item.color}30`,
              borderTop: `4px solid ${item.color}`,
            }}
          >
            <p className="text-2xl mb-2">{item.icon}</p>
            <p
              className="font-bold mb-2"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: item.color,
                fontSize: "0.95rem",
              }}
            >
              {item.label}
            </p>
            <p
              className="mb-3"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "0.9rem",
                color: "rgba(30,33,48,0.72)",
                lineHeight: 1.7,
              }}
            >
              {item.definition}
            </p>
            <p
              className="text-xs font-semibold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "rgba(30,33,48,0.45)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              Test: {item.test}
            </p>
          </div>
        ))}
      </div>

      <blockquote
        className="rounded-xl p-5 mb-8"
        style={{
          background: `${VIOLET}08`,
          borderLeft: `4px solid ${VIOLET}`,
        }}
      >
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "1rem",
            color: "rgba(30,33,48,0.75)",
            lineHeight: 1.8,
          }}
        >
          A Necessary Assumption is the{" "}
          <strong style={{ color: INK }}>floor</strong> — without it, the
          argument collapses. A Sufficient Assumption is the{" "}
          <strong style={{ color: INK }}>ceiling</strong> — with it, the
          conclusion is locked in.
        </p>
      </blockquote>

      <ContinueButton onClick={onComplete} />
    </SectionReveal>
  );
}

// ─── Step 2: The Conditional Bridge Method ────────────────────────────────────

function ConditionalBridgeStep({ onComplete }: { onComplete: () => void }) {
  return (
    <SectionReveal>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${VIOLET}18` }}
        >
          <Zap size={20} style={{ color: VIOLET }} />
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
          The Framework
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
        The Conditional Bridge Method
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
        Sufficient Assumption answers almost always take the form of a{" "}
        <strong style={{ color: INK }}>conditional statement</strong> that
        bridges the gap between the premises and the conclusion.
      </p>

      {/* The gap diagram */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: "rgba(30,33,48,0.4)",
          }}
        >
          Argument Structure
        </p>

        <div className="flex flex-col gap-2">
          {[
            { label: "Premise", text: "All mammals are warm-blooded.", color: "#1a7dff" },
            { label: "Gap ↓", text: "??? (unstated bridge)", color: AMBER, italic: true },
            { label: "Conclusion", text: "Therefore, whales are warm-blooded.", color: GREEN },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: `${row.color}08` }}
            >
              <span
                className="text-xs font-bold uppercase tracking-wider pt-0.5 flex-shrink-0"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: row.color,
                  minWidth: "80px",
                }}
              >
                {row.label}
              </span>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontStyle: row.italic ? "italic" : "normal",
                  fontSize: "0.95rem",
                  color: row.italic ? "rgba(30,33,48,0.5)" : INK,
                  lineHeight: 1.6,
                }}
              >
                {row.text}
              </p>
            </div>
          ))}
        </div>

        <div
          className="mt-4 p-3 rounded-lg"
          style={{ background: `${VIOLET}08`, border: `1px solid ${VIOLET}20` }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: VIOLET }}
          >
            Sufficient Assumption (fills the gap)
          </p>
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "0.95rem",
              color: INK,
              lineHeight: 1.6,
            }}
          >
            "Whales are mammals." — If true, the conclusion follows necessarily
            from the premise.
          </p>
        </div>
      </div>

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
          The Three-Step Method
        </p>
        <ol className="space-y-2">
          {[
            "Identify the gap — what concept appears in the conclusion but NOT in the premises?",
            "Find the bridge — which answer connects the premise concept to the conclusion concept?",
            "Test it — add the answer to the argument. Does the conclusion now follow necessarily?",
          ].map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-2"
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "0.95rem",
                color: "rgba(30,33,48,0.75)",
                lineHeight: 1.7,
              }}
            >
              <span
                className="font-bold flex-shrink-0"
                style={{ color: AMBER, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {i + 1}.
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <ContinueButton onClick={onComplete} />
    </SectionReveal>
  );
}

// ─── Step 3: Pro Tip — Strength calibration ───────────────────────────────────

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
        Strength Calibration — The Most Common Trap
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
        The LSAT loves to offer answer choices that are{" "}
        <em>close but wrong</em> because they are either too weak or too
        strong. A correct Sufficient Assumption must be{" "}
        <strong style={{ color: INK }}>exactly strong enough</strong> to
        guarantee the conclusion — not more, not less.
      </p>

      <div className="space-y-4 mb-8">
        {[
          {
            label: "Too Weak — 'sometimes'",
            example:
              '"Reducing commute times sometimes improves quality of life."',
            problem:
              "Leaves open the possibility this case is an exception. The conclusion is not guaranteed.",
            color: "#B84030",
            icon: "✗",
          },
          {
            label: "Too Strong — 'most important'",
            example:
              '"Reducing commute times is the most important factor in quality of life."',
            problem:
              "Overshoots what's needed. The conclusion only requires that commute time reduction improves quality of life — not that it's the top factor.",
            color: AMBER,
            icon: "≈",
          },
          {
            label: "Just Right — universal conditional",
            example:
              '"Anything that reduces commute times improves quality of life."',
            problem:
              "Bridges the gap exactly. If this is true, the conclusion follows necessarily from the premise.",
            color: GREEN,
            icon: "✓",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-5"
            style={{
              background: "#FFFFFF",
              border: `1px solid ${item.color}30`,
              borderLeft: `4px solid ${item.color}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: item.color, fontWeight: 700, fontSize: "1.1rem" }}>
                {item.icon}
              </span>
              <p
                className="font-bold"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: item.color,
                  fontSize: "0.9rem",
                }}
              >
                {item.label}
              </p>
            </div>
            <p
              className="mb-2"
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "0.9rem",
                color: INK,
                lineHeight: 1.6,
              }}
            >
              {item.example}
            </p>
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "0.85rem",
                color: "rgba(30,33,48,0.6)",
                lineHeight: 1.6,
              }}
            >
              {item.problem}
            </p>
          </div>
        ))}
      </div>

      <blockquote
        className="rounded-xl p-5 mb-8"
        style={{
          background: `${GREEN}08`,
          borderLeft: `4px solid ${GREEN}`,
        }}
      >
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "1rem",
            color: "rgba(30,33,48,0.75)",
            lineHeight: 1.8,
          }}
        >
          "The correct answer must be strong enough to{" "}
          <strong style={{ color: INK }}>guarantee</strong> the conclusion —
          but not so strong that it claims more than the argument needs."
        </p>
      </blockquote>

      <ContinueButton onClick={onComplete} />
    </SectionReveal>
  );
}

// ─── Step 4: Practice ─────────────────────────────────────────────────────────

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
          style={{ background: `${VIOLET}18` }}
        >
          <Target size={20} style={{ color: VIOLET }} />
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
          const showResult = revealed && isSelected;
          const showCorrectHighlight = revealed && choice.correct;

          let borderColor = "rgba(0,0,0,0.1)";
          let bg = "#FFFFFF";
          if (isSelected && !revealed) {
            borderColor = VIOLET;
            bg = `${VIOLET}08`;
          }
          if (showResult && isCorrect) {
            borderColor = GREEN;
            bg = `${GREEN}08`;
          }
          if (showResult && !isCorrect) {
            borderColor = "#B84030";
            bg = "rgba(184,64,48,0.06)";
          }
          if (showCorrectHighlight && !isSelected) {
            borderColor = GREEN;
            bg = `${GREEN}06`;
          }

          return (
            <div key={choice.letter}>
              <button
                onClick={() => handleSelect(choice.letter)}
                disabled={revealed}
                className="w-full text-left rounded-xl p-4 transition-all duration-200"
                style={{
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  cursor: revealed ? "default" : "pointer",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5"
                    style={{
                      background: isSelected ? VIOLET : "rgba(0,0,0,0.06)",
                      color: isSelected ? "#fff" : "rgba(30,33,48,0.5)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {choice.letter}
                  </span>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.95rem",
                      color: INK,
                      lineHeight: 1.7,
                    }}
                  >
                    {choice.text}
                  </p>
                  {revealed && choice.correct && (
                    <CheckCircle2
                      size={20}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: GREEN }}
                    />
                  )}
                  {revealed && isSelected && !choice.correct && (
                    <XCircle
                      size={20}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: "#B84030" }}
                    />
                  )}
                </div>
              </button>

              {/* Explanation */}
              <AnimatePresence>
                {revealed && (isSelected || choice.correct) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-2 mx-1 p-4 rounded-xl"
                      style={{
                        background: choice.correct ? `${GREEN}08` : "rgba(184,64,48,0.05)",
                        border: `1px solid ${choice.correct ? GREEN : "#B84030"}20`,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Lora', serif",
                          fontSize: "0.9rem",
                          color: "rgba(30,33,48,0.75)",
                          lineHeight: 1.75,
                        }}
                      >
                        {choice.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Reveal / Continue buttons */}
      {!revealed ? (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleReveal}
          disabled={!selected}
          className="px-7 py-3 rounded-xl font-semibold text-white transition-all"
          style={{
            background: selected ? VIOLET : "rgba(91,74,138,0.35)",
            fontFamily: "'Space Grotesk', sans-serif",
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
                Correct! You identified the conditional bridge.
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
              <XCircle size={20} style={{ color: "#B84030" }} />
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: "#B84030",
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

// ─── Step 5: Recap ────────────────────────────────────────────────────────────

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
          "A Sufficient Assumption guarantees the conclusion — it's the bridge that makes the argument airtight.",
          "The Conditional Bridge Method: find the gap between premises and conclusion, then pick the answer that fills it with a conditional statement.",
          "Strength calibration: the correct answer must be exactly strong enough — 'sometimes' is too weak, 'most important' is too strong.",
          "Sufficient Assumption answers differ from Necessary Assumptions: SA = proves the conclusion; NA = argument cannot survive without it.",
          "Always test your answer: add it to the argument — does the conclusion now follow necessarily?",
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
                fontSize: "0.95rem",
                color: "rgba(30,33,48,0.75)",
                lineHeight: 1.7,
              }}
            >
              {point}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-6 mb-8"
        style={{
          background: `${VIOLET}08`,
          border: `1px solid ${VIOLET}20`,
        }}
      >
        <p
          className="font-bold mb-2"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            color: VIOLET,
            fontSize: "0.9rem",
          }}
        >
          What's Next
        </p>
        <p
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "0.95rem",
            color: "rgba(30,33,48,0.72)",
            lineHeight: 1.75,
          }}
        >
          You've completed both halves of the Assumption Family. The natural
          next step is <strong style={{ color: INK }}>Common Flaws</strong> —
          where you'll learn to identify the structural weaknesses that
          Strengthen/Weaken and Flaw questions exploit.{" "}
          <button
            onClick={() => navigate("/lessons")}
            style={{
              color: VIOLET,
              fontWeight: 700,
              textDecoration: "underline",
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
          background: `${VIOLET}12`,
          color: VIOLET,
          border: `1px solid ${VIOLET}30`,
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

export default function LessonSufficientAssumptions() {
  const [, navigate] = useLocation();
  const { currentStep, setCurrentStep, resetProgress, hasStarted } =
    useLessonProgress("sufficient-assumptions");
  const { markComplete } = useLessonCompletion("sufficient-assumptions");

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
          <BridgeStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 2 && (
        <div style={{ paddingTop: currentStep === 2 ? "80px" : "0" }}>
          <ConditionalBridgeStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 3 && (
        <div style={{ paddingTop: currentStep === 3 ? "80px" : "0" }}>
          <ProTipStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 4 && (
        <div style={{ paddingTop: currentStep === 4 ? "80px" : "0" }}>
          <PracticeStep onComplete={handleStepComplete} />
        </div>
      )}

      {currentStep >= 5 && (
        <div style={{ paddingTop: currentStep === 5 ? "80px" : "0" }}>
          <RecapStep />
          <SessionPlanCTA
            lessonTitle="Sufficient Assumptions"
            lessonDescription="Master the Conditional Bridge Method to identify sufficient assumptions in LSAT arguments."
          />
        </div>
      )}
    </div>
  );
}
