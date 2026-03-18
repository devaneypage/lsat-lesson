/**
 * DESIGN: Academic Light — Warm Parchment
 * Hero section: warm off-white background, deep navy text, amber accents.
 * Clean, editorial feel — like a premium law school study guide.
 */

import { motion } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";

interface Props {
  onStart: () => void;
}

export default function HeroSection({ onStart }: Props) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F7F4EF 0%, #EDE8DF 60%, #E4DDD0 100%)" }}
    >
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(200,134,10,0.06) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(46,125,82,0.05) 0%, transparent 50%)`,
        }}
      />

      {/* Decorative lines */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, #C8860A, #2E7D52, #C8860A)" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-sm font-medium"
          style={{
            background: "rgba(200,134,10,0.12)",
            border: "1px solid rgba(200,134,10,0.35)",
            color: "#C8860A",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <BookOpen size={14} />
          LSAT Logical Reasoning
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
            lineHeight: 1.1,
            color: "#1E2130",
            marginBottom: "1.25rem",
          }}
        >
          Mastering{" "}
          <span
            style={{
              color: "#C8860A",
              display: "inline-block",
              borderBottom: "3px solid rgba(200,134,10,0.4)",
              paddingBottom: "2px",
            }}
          >
            Necessary
          </span>
          <br />
          Assumptions
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{
            fontFamily: "'Lora', serif",
            fontStyle: "italic",
            fontSize: "1.15rem",
            color: "rgba(30,33,48,0.6)",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
            maxWidth: "560px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          One of the most tested — and most feared — concepts on the LSAT.
          Master the Negation Test™ and build the logical foundation for your
          entire score.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-8 mb-10"
        >
          {[
            { label: "Lesson Length", value: "~14 min" },
            { label: "Concept", value: "Necessary Assumptions" },
            { label: "Includes", value: "Practice Q&A" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                style={{
                  color: "#C8860A",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: "rgba(30,33,48,0.4)",
                  fontSize: "0.72rem",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(200,134,10,0.25)" }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
          style={{
            background: "#1E2130",
            color: "#F7F4EF",
            boxShadow: "0 4px 20px rgba(30,33,48,0.2)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Begin the Lesson
          <ChevronDown
            size={20}
            className="group-hover:translate-y-1 transition-transform duration-200"
          />
        </motion.button>

        {/* Instructor credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          style={{
            color: "rgba(30,33,48,0.35)",
            fontSize: "0.8rem",
            marginTop: "1.5rem",
            letterSpacing: "0.04em",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Taught by Devaney · Freelance LSAT & Bar Exam Tutor
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ color: "rgba(30,33,48,0.25)" }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
}
