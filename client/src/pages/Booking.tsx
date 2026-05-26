/**
 * Booking Page — Contact & Schedule a Session
 * Inline Calendly embed + rate card + contact details
 * Design: Warm Parchment / Academic Light theme
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Calendar,
  Mail,
  DollarSign,
  Shield,
  Star,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import PageMeta from "@/components/PageMeta";

const CALENDLY_URL = "https://calendly.com/thedevanagari";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: { url: string; parentElement: HTMLElement | null; prefill?: object; utm?: object }) => void;
    };
  }
}

function CalendlyWidget() {
  useEffect(() => {
    // Load Calendly embed script dynamically
    const scriptId = "calendly-widget-script";
    const cssId = "calendly-widget-css";

    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      className="calendly-inline-widget w-full rounded-2xl overflow-hidden"
      data-url={CALENDLY_URL}
      style={{
        minWidth: "320px",
        height: "700px",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}
    />
  );
}

export default function Booking() {
  const [, navigate] = useLocation();

  return (
    <>
      <PageMeta
        title="Book a Session — Devaney M. Page, JD | LSAT Tutor"
        description="Schedule a one-on-one LSAT tutoring session with Devaney M. Page, JD. Online sessions $75/hr · In-person $85/hr · Good Fit Guarantee."
        canonical="https://devasophy.blog/booking"
      />

      <div
        className="min-h-screen py-12 px-4"
        style={{ background: "linear-gradient(135deg, #F5F3F0 0%, #FFFBF8 100%)" }}
      >
        <div className="max-w-6xl mx-auto">

          {/* Back nav */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate("/about")}
            className="inline-flex items-center gap-2 mb-8 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "#5B4A8A", fontFamily: "'Inter', sans-serif" }}
          >
            <ArrowLeft size={16} />
            Back to About
          </motion.button>

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ background: "rgba(91,74,138,0.1)", border: "1px solid rgba(91,74,138,0.2)" }}>
              <Calendar size={16} style={{ color: "#5B4A8A" }} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#5B4A8A", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Book a Session
              </span>
            </div>
            <h1
              className="mb-3"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(2rem, 5vw, 3rem)",
                color: "#1E2130",
                lineHeight: 1.15,
              }}
            >
              Schedule Your LSAT Session
            </h1>
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "1.1rem",
                color: "rgba(30,33,48,0.6)",
                lineHeight: 1.8,
                maxWidth: "560px",
                margin: "0 auto",
              }}
            >
              One-on-one tutoring tailored to your score goals, learning style, and timeline.
              Pick a time that works for you.
            </p>
          </motion.div>

          {/* Main two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* Left sidebar — rate card + info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-1 space-y-5"
            >

              {/* Rate Card */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign size={18} style={{ color: "#C8860A" }} />
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1E2130",
                    }}
                  >
                    Session Rates
                  </h2>
                </div>

                <div className="space-y-3">
                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "rgba(91,74,138,0.06)", border: "1px solid rgba(91,74,138,0.12)" }}
                  >
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#2D3561" }}>
                        Online Session
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(30,33,48,0.5)" }}>
                        Zoom · Google Meet
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.3rem",
                        color: "#5B4A8A",
                      }}
                    >
                      $75<span style={{ fontSize: "0.8rem", fontWeight: 500, color: "rgba(91,74,138,0.6)" }}>/hr</span>
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ background: "rgba(200,134,10,0.06)", border: "1px solid rgba(200,134,10,0.15)" }}
                  >
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#2D3561" }}>
                        In-Person Session
                      </p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem", color: "rgba(30,33,48,0.5)" }}>
                        Hampton/Newport News, VA
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.3rem",
                        color: "#C8860A",
                      }}
                    >
                      $85<span style={{ fontSize: "0.8rem", fontWeight: 500, color: "rgba(200,134,10,0.6)" }}>/hr</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Good Fit Guarantee */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(46,125,82,0.05)",
                  border: "1px solid rgba(46,125,82,0.2)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={18} style={{ color: "#2E7D52" }} />
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#2E7D52",
                    }}
                  >
                    Good Fit Guarantee
                  </h2>
                </div>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.92rem",
                    color: "rgba(30,33,48,0.65)",
                    lineHeight: 1.75,
                  }}
                >
                  If after our first session you feel I'm not the right tutor for you, that session is{" "}
                  <strong style={{ color: "#2E7D52" }}>free of charge</strong>. No awkward conversations — just a genuine commitment to your success.
                </p>
              </div>

              {/* Cancellation Policy */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={18} style={{ color: "#B84030" }} />
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1E2130",
                    }}
                  >
                    Cancellation Policy
                  </h2>
                </div>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.92rem",
                    color: "rgba(30,33,48,0.65)",
                    lineHeight: 1.75,
                  }}
                >
                  Please provide at least <strong style={{ color: "#1E2130" }}>2 hours' notice</strong> to cancel or reschedule. Late cancellations may be charged the full session rate.
                </p>
              </div>

              {/* What to expect */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Star size={18} style={{ color: "#5B4A8A" }} />
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1E2130",
                    }}
                  >
                    What to Expect
                  </h2>
                </div>
                <ul className="space-y-2">
                  {[
                    "Diagnostic assessment of your current skill level",
                    "Targeted work on your specific weak areas",
                    "Frameworks and strategies you can apply immediately",
                    "Practice with real LSAT-style questions",
                    "A clear action plan for between sessions",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle size={15} style={{ color: "#2E7D52", marginTop: "3px", flexShrink: 0 }} />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "0.85rem",
                          color: "rgba(30,33,48,0.7)",
                          lineHeight: 1.6,
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact directly */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(91,74,138,0.05)",
                  border: "1px solid rgba(91,74,138,0.15)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={18} style={{ color: "#5B4A8A" }} />
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1E2130",
                    }}
                  >
                    Prefer Email?
                  </h2>
                </div>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.92rem",
                    color: "rgba(30,33,48,0.65)",
                    lineHeight: 1.75,
                    marginBottom: "0.75rem",
                  }}
                >
                  Have questions before booking? Reach out directly.
                </p>
                <a
                  href="mailto:thedevanagari@gmail.com"
                  className="inline-flex items-center gap-2 font-semibold transition-opacity hover:opacity-75"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.9rem",
                    color: "#5B4A8A",
                  }}
                >
                  <Mail size={15} />
                  thedevanagari@gmail.com
                </a>
              </div>

            </motion.div>

            {/* Right — Calendly inline widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
                }}
              >
                {/* Widget header */}
                <div
                  className="px-6 py-4 border-b flex items-center gap-3"
                  style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(91,74,138,0.03)" }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(91,74,138,0.12)" }}
                  >
                    <Calendar size={18} style={{ color: "#5B4A8A" }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "0.95rem", color: "#1E2130" }}>
                      Devaney M. Page, JD
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.78rem", color: "rgba(30,33,48,0.5)" }}>
                      LSAT &amp; Bar Exam Tutor · Background check passed June 2025
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <AlertCircle size={13} style={{ color: "rgba(30,33,48,0.3)" }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem", color: "rgba(30,33,48,0.4)" }}>
                      Powered by Calendly
                    </span>
                  </div>
                </div>

                {/* Calendly embed */}
                <div className="p-2">
                  <CalendlyWidget />
                </div>
              </div>

              {/* Fallback direct link */}
              <p
                className="mt-4 text-center"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  color: "rgba(30,33,48,0.45)",
                }}
              >
                Widget not loading?{" "}
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline transition-opacity hover:opacity-70"
                  style={{ color: "#5B4A8A" }}
                >
                  Open Calendly directly →
                </a>
              </p>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}
