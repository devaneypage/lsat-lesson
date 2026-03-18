/**
 * DESIGN: Academic Light — Warm Parchment
 * Negation Test section: alternating light background, navy text, amber/green accents.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FlaskConical } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Find the Conclusion & Premise",
    body: "Before anything else, identify the author's main point (conclusion) and the evidence they give to support it (premise). The conclusion is the anchor of the entire argument.",
    highlight: false,
    isLast: false,
  },
  {
    num: "02",
    title: "Pick an Answer Choice to Test",
    body: "Select one of the five answer choices. You'll evaluate each one using the same process — no guessing required.",
    highlight: false,
    isLast: false,
  },
  {
    num: "03",
    title: "Negate It",
    body: "Make the answer choice its logical opposite. This is the heart of the technique. If the statement says something 'will happen,' the negation is that it 'will not necessarily happen.'",
    highlight: true,
    isLast: false,
  },
  {
    num: "04",
    title: "Test: Does It Destroy the Conclusion?",
    body: "Read the negated statement alongside the premise. Ask yourself: does this make the author's conclusion impossible or completely unreasonable? Does the argument fall apart?",
    highlight: false,
    isLast: false,
  },
  {
    num: "05",
    title: "If YES → That's Your Answer",
    body: "If the negated statement destroys the conclusion, then the original (un-negated) answer choice is the Necessary Assumption. You've found it — provably, not by gut feeling.",
    highlight: false,
    isLast: true,
  },
];

interface Props {
  onComplete: () => void;
}

export default function NegationTestSection({ onComplete }: Props) {
  const [revealed, setRevealed] = useState(0);

  const showNext = () => {
    if (revealed < STEPS.length) setRevealed((r) => r + 1);
  };

  const allRevealed = revealed === STEPS.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-20 px-6"
      style={{ background: "#EEEAE3" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              background: "rgba(200,134,10,0.12)",
              color: "#C8860A",
              border: "1px solid rgba(200,134,10,0.3)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Concept 02
          </span>
        </div>

        {/* Heading */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(200,134,10,0.1)",
              border: "1px solid rgba(200,134,10,0.25)",
            }}
          >
            <FlaskConical size={22} style={{ color: "#C8860A" }} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                color: "#1E2130",
                lineHeight: 1.15,
              }}
            >
              The Negation Test™
            </h2>
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                color: "rgba(30,33,48,0.5)",
                fontSize: "0.95rem",
                marginTop: "0.25rem",
              }}
            >
              Your secret weapon for Necessary Assumptions
            </p>
          </div>
        </div>

        <p
          className="mb-10"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "1.05rem",
            color: "rgba(30,33,48,0.65)",
            lineHeight: 1.8,
          }}
        >
          This technique gives you a{" "}
          <strong style={{ color: "#1E2130" }}>provable</strong>, repeatable
          process — not a gut feeling. Click through each step to build the
          method.
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-10">
          {STEPS.slice(0, revealed).map((step) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex gap-5 rounded-xl p-5"
              style={{
                background: step.highlight
                  ? "rgba(200,134,10,0.07)"
                  : "#FFFFFF",
                border: step.highlight
                  ? "1px solid rgba(200,134,10,0.25)"
                  : "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: step.isLast
                    ? "#2E7D52"
                    : step.highlight
                    ? "#C8860A"
                    : "rgba(30,33,48,0.08)",
                  color:
                    step.isLast || step.highlight
                      ? "#FFFFFF"
                      : "rgba(30,33,48,0.4)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {step.num}
              </div>
              <div>
                <h3
                  className="mb-1"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: step.highlight
                      ? "#C8860A"
                      : step.isLast
                      ? "#2E7D52"
                      : "#1E2130",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.95rem",
                    color: "rgba(30,33,48,0.6)",
                    lineHeight: 1.75,
                  }}
                >
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Placeholder */}
          {revealed < STEPS.length && (
            <div
              className="rounded-xl p-5 flex items-center gap-4"
              style={{
                background: "rgba(0,0,0,0.02)",
                border: "1px dashed rgba(0,0,0,0.1)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg"
                style={{ background: "rgba(0,0,0,0.05)" }}
              />
              <div className="flex-1">
                <div
                  className="h-3 rounded mb-2"
                  style={{ background: "rgba(0,0,0,0.06)", width: "40%" }}
                />
                <div
                  className="h-2 rounded"
                  style={{ background: "rgba(0,0,0,0.04)", width: "70%" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {!allRevealed && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={showNext}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              {revealed === 0 ? "Show Step 1" : `Show Step ${revealed + 1}`} →
            </motion.button>
          )}

          {allRevealed && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              Next: Pro Tip
              <ChevronRight size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
