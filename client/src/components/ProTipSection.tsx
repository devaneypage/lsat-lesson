/**
 * DESIGN: Academic Light — Warm Parchment
 * Pro Tip section: white cards, navy text, amber/green/red accents.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Lightbulb } from "lucide-react";

interface Props {
  onComplete: () => void;
}

const EXAMPLES = [
  {
    statement: "The program will succeed.",
    polar: "The program will fail.",
    logical: "The program will not necessarily succeed.",
    explanation:
      "The polar opposite is too extreme. The logical negation simply removes the certainty — it doesn't guarantee failure.",
  },
  {
    statement: "All retrained workers will find jobs.",
    polar: "No retrained workers will find jobs.",
    logical: "Not all retrained workers will find jobs.",
    explanation:
      "We don't need to say none will find jobs. We just need to deny the 'all' claim.",
  },
];

export default function ProTipSection({ onComplete }: Props) {
  const [activeExample, setActiveExample] = useState(0);
  const [showLogical, setShowLogical] = useState(false);
  const [done, setDone] = useState(false);

  const handleNext = () => {
    if (activeExample < EXAMPLES.length - 1) {
      setActiveExample((e) => e + 1);
      setShowLogical(false);
    } else {
      setDone(true);
    }
  };

  const ex = EXAMPLES[activeExample];

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-20 px-6"
      style={{ background: "#F7F4EF" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              background: "rgba(200,134,10,0.1)",
              color: "#C8860A",
              border: "1px solid rgba(200,134,10,0.3)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Pro Tip
          </span>
        </div>

        {/* Heading */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(200,134,10,0.1)",
              border: "1px solid rgba(200,134,10,0.25)",
            }}
          >
            <Lightbulb size={22} style={{ color: "#C8860A" }} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                color: "#1E2130",
                lineHeight: 1.2,
              }}
            >
              Logical Opposite ≠ Polar Opposite
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
              A critical distinction the LSAT will test you on
            </p>
          </div>
        </div>

        <p
          className="mb-8"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "1.05rem",
            color: "rgba(30,33,48,0.65)",
            lineHeight: 1.8,
          }}
        >
          When you negate, you are looking for the{" "}
          <strong style={{ color: "#1E2130" }}>logical opposite</strong> — not
          the extreme polar opposite. The LSAT rewards precision. Let's practice
          with two examples.
        </p>

        {/* Interactive example card */}
        <motion.div
          key={activeExample}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl p-6 mb-6"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          }}
        >
          {/* Counter */}
          <div className="flex items-center justify-between mb-5">
            <span
              style={{
                color: "rgba(30,33,48,0.35)",
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Example {activeExample + 1} of {EXAMPLES.length}
            </span>
            <div className="flex gap-1.5">
              {EXAMPLES.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background:
                      i === activeExample
                        ? "#C8860A"
                        : i < activeExample
                        ? "#2E7D52"
                        : "rgba(30,33,48,0.15)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Statement */}
          <div className="mb-5">
            <p
              style={{
                color: "rgba(30,33,48,0.4)",
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Original Statement
            </p>
            <div
              className="rounded-lg px-4 py-3"
              style={{
                background: "rgba(30,33,48,0.04)",
                border: "1px solid rgba(30,33,48,0.08)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1.05rem",
                  color: "#1E2130",
                  fontStyle: "italic",
                }}
              >
                "{ex.statement}"
              </p>
            </div>
          </div>

          {/* Polar (wrong) */}
          <div className="mb-5">
            <p
              style={{
                color: "#B84030",
                fontSize: "0.72rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              ✗ Polar Opposite (Too Extreme)
            </p>
            <div
              className="rounded-lg px-4 py-3"
              style={{
                background: "rgba(184,64,48,0.05)",
                border: "1px solid rgba(184,64,48,0.2)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1.05rem",
                  color: "rgba(30,33,48,0.45)",
                  fontStyle: "italic",
                  textDecoration: "line-through",
                }}
              >
                "{ex.polar}"
              </p>
            </div>
          </div>

          {/* Logical (correct) */}
          {!showLogical ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowLogical(true)}
              className="w-full rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
              style={{
                background: "rgba(200,134,10,0.07)",
                border: "1px dashed rgba(200,134,10,0.35)",
                color: "#C8860A",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Reveal the Correct Negation →
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p
                style={{
                  color: "#2E7D52",
                  fontSize: "0.72rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                ✓ Logical Opposite (Correct)
              </p>
              <div
                className="rounded-lg px-4 py-3 mb-4"
                style={{
                  background: "rgba(46,125,82,0.07)",
                  border: "1px solid rgba(46,125,82,0.25)",
                }}
              >
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.95rem",
                    color: "#2E7D52",
                    fontStyle: "normal",
                  }}
                >
                  "{ex.logical}"
                </p>
              </div>
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "0.9rem",
                  color: "rgba(30,33,48,0.55)",
                  lineHeight: 1.7,
                }}
              >
                {ex.explanation}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-3">
          {showLogical && !done && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
            >
              {activeExample < EXAMPLES.length - 1 ? "Next Example →" : "Got It →"}
            </motion.button>
          )}

          {done && (
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
              Next: Practice Question
              <ChevronRight size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
