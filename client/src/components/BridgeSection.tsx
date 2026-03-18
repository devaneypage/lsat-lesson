/**
 * DESIGN: Academic Chalkboard Deconstructed
 * Bridge analogy section — animated SVG bridge with PREMISE, CONCLUSION, gap.
 * The Necessary Assumption block slides in to fill the gap.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface Props {
  onComplete: () => void;
}

export default function BridgeSection({ onComplete }: Props) {
  const [showBlock, setShowBlock] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setShowBlock(true);
    setTimeout(() => setRevealed(true), 800);
  };

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
            Concept 01
          </span>
        </div>

        {/* Heading */}
        <h2
          className="mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#F0EDE6", lineHeight: 1.15 }}
        >
          Every Argument Is a Bridge
        </h2>

        <p
          className="mb-10"
          style={{ fontFamily: "'Lora', serif", fontSize: "1.05rem", color: "rgba(240,237,230,0.7)", lineHeight: 1.8, maxWidth: "580px" }}
        >
          The author gives you a <span style={{ color: "#F0D060", fontWeight: 600 }}>Premise</span> — the evidence — and wants you to follow them across to their{" "}
          <span style={{ color: "#F0D060", fontWeight: 600 }}>Conclusion</span> — the main point. But very often, there's a gap. The argument makes a logical leap.
        </p>

        {/* Bridge Diagram */}
        <div
          className="relative rounded-xl p-8 mb-8 overflow-hidden"
          style={{ background: "#252830", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <BridgeDiagram showBlock={showBlock} />
        </div>

        {/* Explanation text below diagram */}
        <AnimatePresence>
          {!showBlock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(240,237,230,0.65)", lineHeight: 1.8 }}>
                Our job is to figure out what fills that gap. A{" "}
                <strong style={{ color: "#F0EDE6" }}>Necessary Assumption</strong> is the unstated belief the author{" "}
                <em>must</em> hold for their argument to have a chance of being valid.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showBlock && !revealed && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "rgba(240,237,230,0.65)", lineHeight: 1.8, marginBottom: "1.5rem" }}
            >
              The Necessary Assumption fills the gap and makes the bridge stand up. If it's{" "}
              <em>false</em>, the entire argument collapses.
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-5 mb-8"
              style={{ background: "rgba(107,175,138,0.12)", border: "1px solid rgba(107,175,138,0.3)" }}
            >
              <p style={{ fontFamily: "'Lora', serif", fontSize: "1rem", color: "#A8D5BC", lineHeight: 1.8 }}>
                <strong style={{ color: "#6BAF8A" }}>Key Insight:</strong> If the Necessary Assumption is <em>false</em>, the entire argument collapses. The bridge falls down. This is exactly what we'll exploit with the Negation Test™.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          {!showBlock && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReveal}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ background: "#F0D060", color: "#1C1F26", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Fill the Gap →
            </motion.button>
          )}

          {revealed && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{ background: "#F0D060", color: "#1C1F26", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Next: The Negation Test™
              <ChevronRight size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function BridgeDiagram({ showBlock }: { showBlock: boolean }) {
  return (
    <div className="relative w-full" style={{ minHeight: "180px" }}>
      <svg
        viewBox="0 0 600 180"
        className="w-full"
        style={{ overflow: "visible" }}
      >
        {/* Left bridge pillar */}
        <rect x="20" y="100" width="180" height="20" rx="4" fill="#383D50" />
        <rect x="40" y="60" width="20" height="60" rx="3" fill="#383D50" />
        <rect x="140" y="60" width="20" height="60" rx="3" fill="#383D50" />
        {/* Left arch */}
        <path d="M 40 100 Q 100 60 160 100" stroke="#4A5068" strokeWidth="3" fill="none" />

        {/* Right bridge pillar */}
        <rect x="400" y="100" width="180" height="20" rx="4" fill="#383D50" />
        <rect x="420" y="60" width="20" height="60" rx="3" fill="#383D50" />
        <rect x="540" y="60" width="20" height="60" rx="3" fill="#383D50" />
        {/* Right arch */}
        <path d="M 440 100 Q 500 60 560 100" stroke="#4A5068" strokeWidth="3" fill="none" />

        {/* Gap dashes */}
        {!showBlock && (
          <>
            <line x1="200" y1="100" x2="220" y2="100" stroke="#F0D060" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <line x1="230" y1="100" x2="250" y2="100" stroke="#F0D060" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <line x1="260" y1="100" x2="280" y2="100" stroke="#F0D060" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <line x1="290" y1="100" x2="310" y2="100" stroke="#F0D060" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <line x1="320" y1="100" x2="340" y2="100" stroke="#F0D060" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <line x1="350" y1="100" x2="370" y2="100" stroke="#F0D060" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <line x1="380" y1="100" x2="400" y2="100" stroke="#F0D060" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            {/* Question mark */}
            <text x="295" y="90" fill="#F0D060" fontSize="24" fontWeight="bold" fontFamily="Space Grotesk, sans-serif">?</text>
          </>
        )}

        {/* Labels */}
        <text x="110" y="150" fill="#6BAF8A" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">PREMISE</text>
        <text x="490" y="150" fill="#C4614A" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">CONCLUSION</text>

        {/* Necessary Assumption block (animated) */}
        {showBlock && (
          <motion.g
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          >
            <rect x="195" y="80" width="210" height="40" rx="6" fill="#6BAF8A" opacity="0.9" />
            <text x="300" y="105" fill="#1C1F26" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">NECESSARY ASSUMPTION</text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
