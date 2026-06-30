/**
 * BookingCTA — Reusable "Book a Session" call-to-action block
 * Used at the end of each lesson's recap section.
 * Design: Nexus Balanced & Refined theme
 *
 * Feature Flags:
 *   booking_cta — if disabled, renders nothing (null)
 */

import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useFeatureFlag } from "@/lib/flags";

interface BookingCTAProps {
  /** Optional animation delay in seconds */
  delay?: number;
  /** Optional extra className on the outer wrapper */
  className?: string;
}

export default function BookingCTA({ delay = 0.55, className = "" }: BookingCTAProps) {
  const [, navigate] = useLocation();
  const { enabled: showBookingCta } = useFeatureFlag("booking_cta");

  // Kill switch: hide entirely if booking_cta flag is disabled
  if (!showBookingCta) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`p-7 text-center ${className}`}
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--nexus-amber)",
        borderRadius: "0.25rem",
        boxShadow: "0 1px 4px rgba(239, 160, 28, 0.1)",
      }}
    >
      <p
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontWeight: 700,
          fontSize: "0.7rem",
          color: "var(--nexus-amber)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "0.5rem",
        }}
      >
        Ready to go further?
      </p>

      <h3
        style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontWeight: 900,
          fontSize: "1.15rem",
          color: "var(--foreground)",
          marginBottom: "0.6rem",
          letterSpacing: "0.01em",
        }}
      >
        Work one-on-one with Devaney
      </h3>

      <p
        style={{
          fontFamily: "'Archivo', sans-serif",
          fontSize: "0.88rem",
          color: "rgba(17, 17, 17, 0.65)",
          lineHeight: 1.7,
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
        className="inline-flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200"
        style={{
          background: "var(--nexus-amber)",
          color: "#111111",
          fontFamily: "'Archivo', sans-serif",
          fontSize: "0.85rem",
          fontWeight: 700,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          border: "1.5px solid var(--nexus-amber)",
          borderRadius: "0.25rem",
          boxShadow: "0 2px 6px rgba(239, 160, 28, 0.2)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#d98a0b";
          e.currentTarget.style.borderColor = "#d98a0b";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--nexus-amber)";
          e.currentTarget.style.borderColor = "var(--nexus-amber)";
        }}
      >
        <Calendar size={16} />
        Book a Session
        <ArrowRight size={15} />
      </button>
    </motion.div>
  );
}
