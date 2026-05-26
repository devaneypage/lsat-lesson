/**
 * BookingCTA — Reusable "Book a Session" call-to-action block
 * Used at the end of each lesson's recap section.
 * Design: Warm Parchment / Academic Light theme
 */

import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface BookingCTAProps {
  /** Optional animation delay in seconds */
  delay?: number;
  /** Optional extra className on the outer wrapper */
  className?: string;
}

export default function BookingCTA({ delay = 0.55, className = "" }: BookingCTAProps) {
  const [, navigate] = useLocation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-2xl p-7 text-center ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(91,74,138,0.07) 0%, rgba(123,94,167,0.05) 100%)",
        border: "1px solid rgba(91,74,138,0.18)",
      }}
    >
      <p
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "0.75rem",
          color: "#5B4A8A",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
        }}
      >
        Ready to go further?
      </p>

      <h3
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: "1.2rem",
          color: "#1E2130",
          marginBottom: "0.6rem",
        }}
      >
        Work one-on-one with Devaney
      </h3>

      <p
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "0.92rem",
          color: "rgba(30,33,48,0.6)",
          lineHeight: 1.75,
          marginBottom: "1.25rem",
          maxWidth: "420px",
          margin: "0 auto 1.25rem",
        }}
      >
        Get targeted feedback, personalized strategy, and score-focused coaching from a
        JD-credentialed LSAT tutor.
      </p>

      <button
        onClick={() => navigate("/booking")}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
        style={{
          background: "linear-gradient(135deg, #5B4A8A 0%, #7B5EA7 100%)",
          color: "white",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "0.9rem",
          boxShadow: "0 3px 12px rgba(91,74,138,0.35)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        <Calendar size={16} />
        Book a Session
        <ArrowRight size={15} />
      </button>
    </motion.div>
  );
}
