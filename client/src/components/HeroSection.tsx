/**
 * DESIGN: Academic Chalkboard Deconstructed
 * Hero section with chalkboard background, chalk-white text, amber accents.
 * Dark text on the image — image is dark so text must be light.
 */

import { motion } from "framer-motion";
import { BookOpen, ChevronDown } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663296889444/4kXdUkpMX9ujMWJCTbKx2q/hero-chalkboard-3eZqNrWX86GpYpPAopMr8w.webp";

interface Props {
  onStart: () => void;
}

export default function HeroSection({ onStart }: Props) {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${HERO_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(28,31,38,0.55) 0%, rgba(28,31,38,0.75) 60%, rgba(28,31,38,0.95) 100%)" }}
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
            background: "rgba(240, 208, 96, 0.15)",
            border: "1px solid rgba(240, 208, 96, 0.4)",
            color: "#F0D060",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
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
            color: "#F0EDE6",
            marginBottom: "1.25rem",
          }}
        >
          Mastering{" "}
          <span style={{ color: "#F0D060", display: "inline-block" }}>
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
            color: "rgba(240, 237, 230, 0.75)",
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
              <div style={{ color: "#F0D060", fontWeight: 700, fontSize: "1.1rem" }}>
                {stat.value}
              </div>
              <div style={{ color: "rgba(240,237,230,0.5)", fontSize: "0.75rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
          style={{
            background: "#F0D060",
            color: "#1C1F26",
            boxShadow: "0 4px 24px rgba(240, 208, 96, 0.3)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Begin the Lesson
          <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform duration-200" />
        </motion.button>

        {/* Instructor credit */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          style={{ color: "rgba(240,237,230,0.4)", fontSize: "0.8rem", marginTop: "1.5rem", letterSpacing: "0.04em" }}
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
        style={{ color: "rgba(240,237,230,0.3)" }}
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
