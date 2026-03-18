/**
 * DESIGN: Academic Chalkboard Deconstructed
 * Practice Question section — full interactive LSAT question.
 * Student can reveal the negation of each answer choice, then select their answer.
 * Correct = green stamp animation. Wrong = red shake + explanation.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Target } from "lucide-react";

const STIMULUS = `A new government program is designed to retrain steelworkers for jobs in the tech sector. The program's director claims that this initiative will be a resounding success, ensuring that all retrained workers find stable, high-paying jobs. However, the program only provides training in basic coding and offers no specialized skills. Most high-paying tech jobs require advanced, specialized knowledge.`;

const QUESTION = `The argument's conclusion follows logically only if which one of the following is assumed?`;

const ANSWERS = [
  {
    letter: "A",
    text: "Some of the retrained steelworkers will not put in the effort to learn advanced, specialized skills on their own.",
    negation: "All of the retrained steelworkers will put in the effort to learn advanced skills on their own.",
    negationExplain: "Even if every worker is highly motivated, the program still doesn't teach them the advanced skills they need. The argument's conclusion still stands. This is not a necessary assumption.",
    isCorrect: false,
  },
  {
    letter: "B",
    text: "There are not enough available jobs in the tech sector to accommodate all of the retrained steelworkers.",
    negation: "There are enough available jobs in the tech sector to accommodate all of the retrained steelworkers.",
    negationExplain: "Even if there are plenty of jobs available, the workers still might not be qualified for them because they only have basic skills. The argument survives. This is a classic distractor — relevant-sounding but not necessary.",
    isCorrect: false,
  },
  {
    letter: "C",
    text: "The basic coding skills taught in the program are not sufficient on their own for securing a high-paying tech job.",
    negation: "The basic coding skills taught in the program are sufficient on their own for securing a high-paying tech job.",
    negationExplain: "If basic skills ARE sufficient, then the program could actually succeed — completely destroying the author's conclusion. The entire argument depends on this assumption being true. This is the Necessary Assumption.",
    isCorrect: true,
  },
];

interface Props {
  onComplete: () => void;
}

type Phase = "reading" | "analyzing" | "answering" | "explained" | "done";

export default function PracticeSection({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("reading");
  const [revealedNegations, setRevealedNegations] = useState<Set<string>>(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const toggleNegation = (letter: string) => {
    setRevealedNegations((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  };

  const handleAnswer = (letter: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(letter);
    setShowExplanation(true);
    setPhase("explained");
  };

  const isCorrect = selectedAnswer === "C";

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
            Practice Question
          </span>
        </div>

        {/* Heading */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(240,208,96,0.15)", border: "1px solid rgba(240,208,96,0.3)" }}
          >
            <Target size={22} style={{ color: "#F0D060" }} />
          </div>
          <div>
            <h2
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: "#F0EDE6", lineHeight: 1.2 }}
            >
              Let's Apply It
            </h2>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", color: "rgba(240,237,230,0.55)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
              Use the Negation Test™ to find the correct answer
            </p>
          </div>
        </div>

        {/* Stimulus */}
        <div
          className="rounded-xl p-6 mb-5"
          style={{ background: "#1C1F26", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p
            style={{ color: "rgba(240,237,230,0.45)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Stimulus
          </p>
          <p
            className="stimulus-text"
            style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "1rem", color: "#E8E4DC", lineHeight: 1.85 }}
          >
            {STIMULUS}
          </p>
        </div>

        {/* Question stem */}
        <div
          className="rounded-xl px-6 py-4 mb-8"
          style={{ background: "rgba(240,208,96,0.08)", border: "1px solid rgba(240,208,96,0.2)" }}
        >
          <p
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#F0D060", lineHeight: 1.6 }}
          >
            {QUESTION}
          </p>
        </div>

        {/* Instruction */}
        {!selectedAnswer && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
            style={{ fontFamily: "'Lora', serif", fontSize: "0.9rem", color: "rgba(240,237,230,0.5)", lineHeight: 1.7 }}
          >
            Tip: Click <strong style={{ color: "rgba(240,237,230,0.7)" }}>"Reveal Negation"</strong> on each answer choice to test it, then select the one you believe is the Necessary Assumption.
          </motion.p>
        )}

        {/* Answer choices */}
        <div className="space-y-4 mb-8">
          {ANSWERS.map((answer) => {
            const isRevealed = revealedNegations.has(answer.letter);
            const isSelected = selectedAnswer === answer.letter;
            const isThisCorrect = answer.isCorrect;

            let borderColor = "rgba(255,255,255,0.1)";
            let bgColor = "rgba(255,255,255,0.03)";
            if (isSelected && isThisCorrect) { borderColor = "#6BAF8A"; bgColor = "rgba(107,175,138,0.12)"; }
            if (isSelected && !isThisCorrect) { borderColor = "#C4614A"; bgColor = "rgba(196,97,74,0.12)"; }
            if (!isSelected && selectedAnswer && isThisCorrect) { borderColor = "rgba(107,175,138,0.4)"; bgColor = "rgba(107,175,138,0.06)"; }

            return (
              <motion.div
                key={answer.letter}
                layout
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${borderColor}`, background: bgColor, transition: "border-color 0.3s, background 0.3s" }}
              >
                {/* Answer row */}
                <div className="flex items-start gap-4 p-5">
                  {/* Letter badge */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{
                      background: isSelected && isThisCorrect ? "#6BAF8A" : isSelected && !isThisCorrect ? "#C4614A" : "rgba(255,255,255,0.08)",
                      color: isSelected ? "#1C1F26" : "rgba(255,255,255,0.5)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {isSelected && isThisCorrect ? "✓" : isSelected && !isThisCorrect ? "✗" : answer.letter}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p
                      style={{ fontFamily: "'Lora', serif", fontSize: "0.98rem", color: "#E8E4DC", lineHeight: 1.75 }}
                    >
                      {answer.text}
                    </p>

                    {/* Negation reveal */}
                    <AnimatePresence>
                      {isRevealed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 pt-3"
                          style={{ borderTop: "1px dashed rgba(255,255,255,0.1)" }}
                        >
                          <p style={{ color: "rgba(240,237,230,0.4)", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.4rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                            Negation:
                          </p>
                          <p
                            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.88rem", color: "#F0D060", lineHeight: 1.6, background: "rgba(240,208,96,0.06)", padding: "0.5rem 0.75rem", borderRadius: "6px" }}
                          >
                            "{answer.negation}"
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    {!selectedAnswer && (
                      <>
                        <button
                          onClick={() => toggleNegation(answer.letter)}
                          className="text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200"
                          style={{
                            background: isRevealed ? "rgba(240,208,96,0.2)" : "rgba(255,255,255,0.07)",
                            color: isRevealed ? "#F0D060" : "rgba(255,255,255,0.5)",
                            border: `1px solid ${isRevealed ? "rgba(240,208,96,0.3)" : "rgba(255,255,255,0.1)"}`,
                            fontFamily: "'Space Grotesk', sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isRevealed ? "Hide" : "Negate"}
                        </button>
                        <button
                          onClick={() => handleAnswer(answer.letter)}
                          className="text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200"
                          style={{
                            background: "rgba(240,208,96,0.12)",
                            color: "#F0D060",
                            border: "1px solid rgba(240,208,96,0.25)",
                            fontFamily: "'Space Grotesk', sans-serif",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Select
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Explanation (shown after answer selected) */}
                <AnimatePresence>
                  {showExplanation && (isSelected || isThisCorrect) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.4, delay: isThisCorrect ? 0.1 : 0 }}
                      className="px-5 pb-5"
                    >
                      <div
                        className="rounded-lg p-4"
                        style={{
                          background: isThisCorrect ? "rgba(107,175,138,0.1)" : "rgba(196,97,74,0.08)",
                          border: `1px solid ${isThisCorrect ? "rgba(107,175,138,0.25)" : "rgba(196,97,74,0.2)"}`,
                        }}
                      >
                        <p style={{ color: isThisCorrect ? "#6BAF8A" : "#C4614A", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.4rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                          {isThisCorrect ? "✓ Correct — Here's Why" : "✗ Incorrect — Here's Why"}
                        </p>
                        <p style={{ fontFamily: "'Lora', serif", fontSize: "0.92rem", color: isThisCorrect ? "#A8D5BC" : "rgba(240,237,230,0.6)", lineHeight: 1.75 }}>
                          {answer.negationExplain}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Result banner */}
        <AnimatePresence>
          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-xl p-6 mb-8"
              style={{
                background: isCorrect ? "rgba(107,175,138,0.12)" : "rgba(196,97,74,0.1)",
                border: `1px solid ${isCorrect ? "rgba(107,175,138,0.35)" : "rgba(196,97,74,0.3)"}`,
              }}
            >
              <p
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "1.1rem", color: isCorrect ? "#6BAF8A" : "#C4614A", marginBottom: "0.5rem" }}
              >
                {isCorrect ? "🎯 Excellent work!" : "Not quite — review the explanations above."}
              </p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: "0.95rem", color: "rgba(240,237,230,0.65)", lineHeight: 1.75 }}>
                {isCorrect
                  ? "The negation of (C) completely destroys the conclusion — proving it is the Necessary Assumption. Notice how the Negation Test gave you a provable result, not just a gut feeling. That's the power of a systematic approach."
                  : "The key is to apply the Negation Test to every choice. The correct answer is (C) — its negation is the only one that makes the author's conclusion impossible. Review the explanations above and try the next practice question."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue button */}
        {selectedAnswer && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onComplete}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{ background: "#F0D060", color: "#1C1F26", fontFamily: "'Space Grotesk', sans-serif" }}
          >
            View Recap & Key Takeaways
            <ChevronRight size={18} />
          </motion.button>
        )}
      </div>
    </motion.section>
  );
}
