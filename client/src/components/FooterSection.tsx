/**
 * DESIGN: Academic Light — Warm Parchment
 * Footer: warm off-white background, muted navy text, amber brand accent.
 */

import { BookOpen } from "lucide-react";

export default function FooterSection() {
  return (
    <footer
      className="py-12 px-6"
      style={{
        background: "#E4DDD0",
        borderTop: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(200,134,10,0.12)",
                border: "1px solid rgba(200,134,10,0.3)",
              }}
            >
              <BookOpen size={18} style={{ color: "#C8860A" }} />
            </div>
            <div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#1E2130",
                }}
              >
                LSAT Mastery
              </p>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.75rem",
                  color: "rgba(30,33,48,0.4)",
                  letterSpacing: "0.04em",
                }}
              >
                Necessary Assumptions
              </p>
            </div>
          </div>

          {/* Instructor */}
          <div className="text-center sm:text-right">
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "0.9rem",
                color: "rgba(30,33,48,0.45)",
              }}
            >
              Taught by
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                color: "#1E2130",
              }}
            >
              Devaney
            </p>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.75rem",
                color: "rgba(30,33,48,0.35)",
                letterSpacing: "0.04em",
              }}
            >
              Freelance LSAT & Bar Exam Tutor
            </p>
          </div>
        </div>

        <div
          className="mt-8 pt-6 text-center"
          style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
        >
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.75rem",
              color: "rgba(30,33,48,0.25)",
              letterSpacing: "0.04em",
            }}
          >
            Interactive lesson built for Wizeprep instructor audition · 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
