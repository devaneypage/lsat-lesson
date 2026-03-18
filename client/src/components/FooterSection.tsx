/**
 * DESIGN: Academic Chalkboard Deconstructed
 * Footer with instructor credit and Wizeprep branding.
 */

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function FooterSection() {
  return (
    <footer
      className="py-12 px-6"
      style={{ background: "#141720", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(240,208,96,0.15)", border: "1px solid rgba(240,208,96,0.3)" }}
            >
              <BookOpen size={18} style={{ color: "#F0D060" }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#F0EDE6" }}>
                LSAT Mastery
              </p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", color: "rgba(240,237,230,0.35)", letterSpacing: "0.04em" }}>
                Necessary Assumptions
              </p>
            </div>
          </div>

          {/* Instructor */}
          <div className="text-center sm:text-right">
            <p style={{ fontFamily: "'Lora', serif", fontStyle: "italic", fontSize: "0.9rem", color: "rgba(240,237,230,0.5)" }}>
              Taught by
            </p>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "1rem", color: "#F0EDE6" }}>
              Devaney
            </p>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", color: "rgba(240,237,230,0.35)", letterSpacing: "0.04em" }}>
              Freelance LSAT & Bar Exam Tutor
            </p>
          </div>
        </div>

        <div
          className="mt-8 pt-6 text-center"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", color: "rgba(240,237,230,0.2)", letterSpacing: "0.04em" }}>
            Interactive lesson built for Wizeprep instructor audition · 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
