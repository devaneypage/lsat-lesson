/**
 * DESIGN: Academic Chalkboard Deconstructed
 * Pro Tip section — logical vs. polar opposite, with interactive example.
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
    explanation: "The polar opposite is too extreme. The logical negation simply removes the certainty — it doesn't guarantee failure.",
  },
  {
    statement: "All retrained workers will find jobs.",
    polar: "No retrained workers will find jobs.",
    logical: "Not all retrained workers will find jobs.",
    explanation: "We don't need to say none will find jobs. We just need to deny the 'all' claim.",
  },
];

export default function ProTipSection({ onComplete }: Props) {
  const [activeExample, setActiveExample] = useState(0);
  const [showLogical, setShowLogical] = useState(false);
  const [done, setDone] = useState(false);

  const handleShowLogical = () => {
    setShowLogical(true);
  };

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
      style={{ background: "#1C1F26" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "rgba(240,208,96,0.15)", color: "#F0D060", border: "1px solid rgba(240,208,96,0.3)" }}
          >
            Pro Tip
          </span>
        </div>

        {/* Heading */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(240,208,96,0.15)", border: "1px solid rgba(240,208,96,0.3)" }}
          >
            <Lightbulb size={22} style={{ color: "#F0D060" }} />
          </div>
          <div>
            <h2
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: "#F0EDE6", lineHeight: 1.2 }}
            >
              Logical Opposite ≠ Polar Opposite
            </h2>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: "rgba(240,237,230,0.55)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
              A critical distinction the LSAT will test you on
            </p>
          </div>
        </div>

        <p
          className="mb-8"
          style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", color: "rgba(240,237,230,0.7)", lineHeight: 1.8 }}
        >
          When you negate, you are looking for the <strong style={{ color: "#F0EDE6" }}>logical opposite</strong> — not the extreme polar opposite. The LSAT rewards precision. Let's practice with two examples.
        </p>

        {/* Interactive example card */}
        <motion.div
          key={activeExample}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl p-6 mb-6"
          style={{ background: "#252830", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Example counter */}
          <div className="flex items-center justify-between mb-5">
            <span style={{ color: "rgba(240,237,230,0.4)", fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>
              Example {activeExample + 1} of {EXAMPLES.length}
            </span>
            <div className="flex gap-1.5">
              {EXAMPLES.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: i === activeExample ? "#F0D060" : i < activeExample ? "#6BAF8A" : "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
          </div>

          {/* Statement */}
          <div className="mb-5">
            <p style={{ color: "rgba(240,237,230,0.5)", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem", fontFamily: "'Space Grotesk', sans-serif" }}>
              Original Statement
            </p>
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <p style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", color: "#F0EDE6", fontStyle: "italic" }}>
                "{ex.statement}"
              </p>
            </div>
          </div>

          {/* Polar (wrong) */}
          <div className="mb-5">
            <p style={{ color: "#C4614A", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem", fontFamily: "'Space Grotesk', sans-serif" }}>
              ✗ Polar Opposite (Too Extreme)
            </p>
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: "rgba(196,97,74,0.08)", border: "1px solid rgba(196,97,74,0.25)" }}
            >
              <p style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", color: "rgba(240,237,230,0.6)", fontStyle: "italic", textDecoration: "line-through" }}>
                "{ex.polar}"
              </p>
            </div>
          </div>

          {/* Logical (correct) — hidden until revealed */}
          {!showLogical ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleShowLogical}
              className="w-full rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200"
              style={{
                background: "rgba(240,208,96,0.08)",
                border: "1px dashed rgba(240,208,96,0.3)",
                color: "#F0D060",
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
              <p style={{ color: "#6BAF8A", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                ✓ Logical Opposite (Correct)
              </p>
              <div
                className="rounded-lg px-4 py-3 mb-4"
                style={{ background: "rgba(107,175,138,0.1)", border: "1px solid rgba(107,175,138,0.3)" }}
              >
                <p style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", color: "#A8D5BC", fontStyle: "italic" }}>
                  "{ex.logical}"
                </p>
              </div>
              <p style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "rgba(240,237,230,0.55)", lineHeight: 1.7 }}>
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
              style={{ background: "#F0D060", color: "#1C1F26", fontFamily: "'Space Grotesk', sans-serif" }}
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
              style={{ background: "#F0D060", color: "#1C1F26", fontFamily: "'Space Grotesk', sans-serif" }}
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
