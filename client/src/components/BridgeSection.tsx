/**
 * DESIGN: Academic Light — Warm Parchment
 * Bridge analogy section: warm white background, navy text, amber/green accents.
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
            Concept 01
          </span>
        </div>

        {/* Heading */}
        <h2
          className="mb-4"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            color: "#1E2130",
            lineHeight: 1.15,
          }}
        >
          Every Argument Is a Bridge
        </h2>

        <p
          className="mb-10"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "1.05rem",
            color: "rgba(30,33,48,0.65)",
            lineHeight: 1.8,
            maxWidth: "580px",
          }}
        >
          The author gives you a{" "}
          <span style={{ color: "#C8860A", fontWeight: 600 }}>Premise</span> —
          the evidence — and wants you to follow them across to their{" "}
          <span style={{ color: "#C8860A", fontWeight: 600 }}>Conclusion</span>{" "}
          — the main point. But very often, there's a gap. The argument makes a
          logical leap.
        </p>

        {/* Bridge Diagram */}
        <div
          className="relative rounded-xl p-8 mb-8 overflow-hidden"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          }}
        >
          <BridgeDiagram showBlock={showBlock} />
        </div>

        {/* Explanation text */}
        <AnimatePresence>
          {!showBlock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.6)",
                  lineHeight: 1.8,
                }}
              >
                Our job is to figure out what fills that gap. A{" "}
                <strong style={{ color: "#1E2130" }}>Necessary Assumption</strong>{" "}
                is the unstated belief the author <em>must</em> hold for their
                argument to have a chance of being valid.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-5 mb-8"
              style={{
                background: "rgba(46,125,82,0.07)",
                border: "1px solid rgba(46,125,82,0.25)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1rem",
                  color: "rgba(30,33,48,0.75)",
                  lineHeight: 1.8,
                }}
              >
                <strong style={{ color: "#2E7D52" }}>Key Insight:</strong> If
                the Necessary Assumption is <em>false</em>, the entire argument
                collapses. The bridge falls down. This is exactly what we'll
                exploit with the Negation Test™.
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
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
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
              style={{
                background: "#1E2130",
                color: "#F7F4EF",
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "0 2px 12px rgba(30,33,48,0.15)",
              }}
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
      <svg viewBox="0 0 600 180" className="w-full" style={{ overflow: "visible" }}>
        {/* Left bridge */}
        <rect x="20" y="100" width="180" height="20" rx="4" fill="#E4DDD0" />
        <rect x="40" y="60" width="20" height="60" rx="3" fill="#D4CCC0" />
        <rect x="140" y="60" width="20" height="60" rx="3" fill="#D4CCC0" />
        <path d="M 40 100 Q 100 60 160 100" stroke="#C8B89A" strokeWidth="3" fill="none" />

        {/* Right bridge */}
        <rect x="400" y="100" width="180" height="20" rx="4" fill="#E4DDD0" />
        <rect x="420" y="60" width="20" height="60" rx="3" fill="#D4CCC0" />
        <rect x="540" y="60" width="20" height="60" rx="3" fill="#D4CCC0" />
        <path d="M 440 100 Q 500 60 560 100" stroke="#C8B89A" strokeWidth="3" fill="none" />

        {/* Gap dashes */}
        {!showBlock && (
          <>
            {[200, 220, 240, 260, 280, 300, 320, 340, 360, 380].map((x) => (
              <line key={x} x1={x} y1="100" x2={x + 12} y2="100" stroke="#C8860A" strokeWidth="2.5" strokeDasharray="6,4" opacity="0.5" />
            ))}
            <text x="295" y="88" fill="#C8860A" fontSize="22" fontWeight="bold" fontFamily="Space Grotesk, sans-serif">?</text>
          </>
        )}

        {/* Labels */}
        <text x="110" y="150" fill="#2E7D52" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">PREMISE</text>
        <text x="490" y="150" fill="#B84030" fontSize="13" fontWeight="700" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">CONCLUSION</text>

        {/* Assumption block */}
        {showBlock && (
          <motion.g
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          >
            <rect x="195" y="80" width="210" height="40" rx="6" fill="#2E7D52" opacity="0.9" />
            <text x="300" y="105" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Space Grotesk, sans-serif">NECESSARY ASSUMPTION</text>
          </motion.g>
        )}
      </svg>
    </div>
  );
}
