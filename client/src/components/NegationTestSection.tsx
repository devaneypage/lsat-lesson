/**
 * DESIGN: Academic Chalkboard Deconstructed
 * Negation Test section — 5 steps appear one by one as student clicks through.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FlaskConical } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Find the Conclusion & Premise",
    body: "Before anything else, identify the author's main point (conclusion) and the evidence they give to support it (premise). The conclusion is the anchor of the entire argument.",
  },
  {
    num: "02",
    title: "Pick an Answer Choice to Test",
    body: "Select one of the five answer choices. You'll evaluate each one using the same process — no guessing required.",
  },
  {
    num: "03",
    title: "Negate It",
    body: "Make the answer choice its logical opposite. This is the heart of the technique. If the statement says something 'will happen,' the negation is that it 'will not necessarily happen.'",
    highlight: true,
  },
  {
    num: "04",
    title: "Test: Does It Destroy the Conclusion?",
    body: "Read the negated statement alongside the premise. Ask yourself: does this make the author's conclusion impossible or completely unreasonable? Does the argument fall apart?",
  },
  {
    num: "05",
    title: "If YES → That's Your Answer",
    body: "If the negated statement destroys the conclusion, then the original (un-negated) answer choice is the Necessary Assumption. You've found it — provably, not by gut feeling.",
    isLast: true,
  },
];

interface Props {
  onComplete: () => void;
}

export default function NegationTestSection({ onComplete }: Props) {
  const [revealed, setRevealed] = useState(0); // how many steps are shown

  const showNext = () => {
    if (revealed < STEPS.length) {
      setRevealed((r) => r + 1);
    }
  };

  const allRevealed = revealed === STEPS.length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative py-20 px-6"
      style={{ background: "#252830" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "rgba(240,208,96,0.15)", color: "#F0D060", border: "1px solid rgba(240,208,96,0.3)" }}
          >
            Concept 02
          </span>
        </div>

        {/* Heading */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(240,208,96,0.15)", border: "1px solid rgba(240,208,96,0.3)" }}
          >
            <FlaskConical size={22} style={{ color: "#F0D060" }} />
          </div>
          <div>
            <h2
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#F0EDE6", lineHeight: 1.15 }}
            >
              The Negation Test™
            </h2>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: "rgba(240,237,230,0.55)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
              Your secret weapon for Necessary Assumptions
            </p>
          </div>
        </div>

        <p
          className="mb-10"
          style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", color: "rgba(240,237,230,0.7)", lineHeight: 1.8 }}
        >
          This technique gives you a <strong style={{ color: "#F0EDE6" }}>provable</strong>, repeatable process — not a gut feeling. Click through each step to build the method.
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-10">
          {STEPS.slice(0, revealed).map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="flex gap-5 rounded-xl p-5"
              style={{
                background: step.highlight ? "rgba(240,208,96,0.08)" : "rgba(255,255,255,0.04)",
                border: step.highlight ? "1px solid rgba(240,208,96,0.25)" : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Step number */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: step.isLast ? "#6BAF8A" : step.highlight ? "#F0D060" : "rgba(255,255,255,0.08)",
                  color: step.isLast || step.highlight ? "#1C1F26" : "rgba(255,255,255,0.5)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {step.num}
              </div>

              {/* Content */}
              <div>
                <h3
                  className="mb-1"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: step.highlight ? "#F0D060" : step.isLast ? "#6BAF8A" : "#F0EDE6",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", color: "rgba(240,237,230,0.65)", lineHeight: 1.75 }}>
                  {step.body}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Placeholder for unrevealed steps */}
          {revealed < STEPS.length && (
            <div
              className="rounded-xl p-5 flex items-center gap-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}
            >
              <div className="w-10 h-10 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="flex-1">
                <div className="h-3 rounded" style={{ background: "rgba(255,255,255,0.06)", width: "40%", marginBottom: "8px" }} />
                <div className="h-2 rounded" style={{ background: "rgba(255,255,255,0.04)", width: "70%" }} />
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
              style={{ background: "#F0D060", color: "#1C1F26", fontFamily: "'Space Grotesk', sans-serif" }}
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
              style={{ background: "#F0D060", color: "#1C1F26", fontFamily: "'Space Grotesk', sans-serif" }}
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
