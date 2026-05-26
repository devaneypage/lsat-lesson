/**
 * DESIGN: Academic Light — Warm Parchment
 * Page: About & Hire Me
 *
 * Devaney's professional bio, credentials, teaching philosophy, and booking CTA.
 * Anchors the site in personal teaching authority.
 */

import { motion } from "framer-motion";
import {
  GraduationCap,
  Scale,
  BookOpen,
  Star,
  Mail,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Award,
  Users,
  Target,
} from "lucide-react";
import { useLocation } from "wouter";

const CREDENTIALS = [
  {
    icon: GraduationCap,
    label: "Juris Doctor (JD)",
    detail: "Legal Education Specialist",
    color: "#5B4A8A",
  },
  {
    icon: Scale,
    label: "LSAT & Bar Exam Tutor",
    detail: "Freelance · Hampton/Newport News, VA",
    color: "#C8860A",
  },
  {
    icon: BookOpen,
    label: "Logical Reasoning Expert",
    detail: "Necessary Assumptions · Strengthen/Weaken · RC",
    color: "#2E7D52",
  },
  {
    icon: Star,
    label: "Personalized Instruction",
    detail: "One-on-one sessions tailored to your score goals",
    color: "#B84030",
  },
];

const TEACHING_PRINCIPLES = [
  {
    number: "01",
    title: "Intelligence Is Trainable",
    body: "The LSAT does not test what you know — it tests how you think. That means every skill on this exam is learnable. I don't believe in fixed aptitude; I believe in deliberate practice and the right framework.",
    color: "#C8860A",
  },
  {
    number: "02",
    title: "Understand Before You Memorize",
    body: "Most test-prep programs hand you rules to memorize. I teach you the underlying logic so you can derive the rules yourself. When you understand why a Necessary Assumption must be true, you never need to memorize a template again.",
    color: "#2E7D52",
  },
  {
    number: "03",
    title: "Precision Over Speed",
    body: "Speed is a byproduct of mastery, not a starting point. We slow down first — dissecting every argument, every answer choice — until the patterns become automatic. Then the clock stops being your enemy.",
    color: "#5B4A8A",
  },
  {
    number: "04",
    title: "Charge It to Your Head",
    body: "A principle I inherited from my father: separate emotion from analysis. On the LSAT, the answer that feels right is often a trap. I train students to reason from evidence, not intuition — and to extend that same rigor to themselves when they make mistakes.",
    color: "#B84030",
  },
];

const WHAT_TO_EXPECT = [
  "Diagnostic session to identify your specific weaknesses",
  "Custom study plan aligned to your target score and timeline",
  "Deep-dive lessons on Logical Reasoning question types",
  "Reading Comprehension passage mapping and annotation strategy",
  "Timed practice under real test conditions with detailed review",
  "Ongoing accountability and progress tracking between sessions",
];

export default function About() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #F7F4EF 0%, #EDE8DF 60%, #E4DDD0 100%)" }}
    >
      <div className="container py-16 max-w-4xl mx-auto">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "rgba(91,74,138,0.1)",
                color: "#5B4A8A",
                border: "1px solid rgba(91,74,138,0.25)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Your Instructor
            </span>
          </div>

          <h1
            className="mb-4"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              color: "#1E2130",
              lineHeight: 1.1,
            }}
          >
            Devaney M. Page, JD
          </h1>

          <p
            className="mb-8"
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "1.2rem",
              color: "rgba(30,33,48,0.55)",
              lineHeight: 1.7,
              maxWidth: "42rem",
            }}
          >
            Legal Education Specialist · Freelance LSAT & Bar Exam Tutor ·
            Hampton/Newport News, Virginia
          </p>

          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "1.05rem",
              color: "rgba(30,33,48,0.7)",
              lineHeight: 1.9,
              maxWidth: "44rem",
            }}
          >
            I built this platform because the best LSAT instruction I ever
            encountered was never in a book — it was in a conversation. My
            approach is rooted in the belief that logical reasoning is a
            learnable craft, not a talent you either have or don't. Every lesson
            here reflects the same principles I bring to one-on-one sessions:
            slow down, understand the structure, then let the speed follow
            naturally.
          </p>
        </motion.div>

        {/* ── Credentials ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16"
        >
          {CREDENTIALS.map((cred, idx) => {
            const Icon = cred.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.15 + idx * 0.08 }}
                className="flex items-start gap-4 rounded-xl p-5"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${cred.color}14`,
                    border: `1px solid ${cred.color}28`,
                  }}
                >
                  <Icon size={20} style={{ color: cred.color }} />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#1E2130",
                      marginBottom: "0.2rem",
                    }}
                  >
                    {cred.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.85rem",
                      color: "rgba(30,33,48,0.5)",
                      lineHeight: 1.5,
                    }}
                  >
                    {cred.detail}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Teaching Philosophy ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <Target size={22} style={{ color: "#C8860A" }} />
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.7rem",
                color: "#1E2130",
              }}
            >
              Teaching Philosophy
            </h2>
          </div>

          <div className="space-y-5">
            {TEACHING_PRINCIPLES.map((principle, idx) => (
              <motion.div
                key={principle.number}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + idx * 0.1 }}
                className="flex gap-5 rounded-xl p-6"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold"
                    style={{
                      background: `${principle.color}12`,
                      border: `1px solid ${principle.color}28`,
                      color: principle.color,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "0.75rem",
                    }}
                  >
                    {principle.number}
                  </div>
                </div>
                <div>
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                      color: principle.color,
                    }}
                  >
                    {principle.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.97rem",
                      color: "rgba(30,33,48,0.65)",
                      lineHeight: 1.85,
                    }}
                  >
                    {principle.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── What to Expect ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-8">
            <Users size={22} style={{ color: "#2E7D52" }} />
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.7rem",
                color: "#1E2130",
              }}
            >
              What to Expect in Sessions
            </h2>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="space-y-4">
              {WHAT_TO_EXPECT.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.35 + idx * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2
                    size={18}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "#2E7D52" }}
                  />
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.97rem",
                      color: "rgba(30,33,48,0.7)",
                      lineHeight: 1.7,
                    }}
                  >
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Hire Me / Contact CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-2xl p-8"
          style={{
            background: "linear-gradient(135deg, #1E2130 0%, #2D1B69 100%)",
            boxShadow: "0 8px 32px rgba(30,33,48,0.18)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Award size={24} style={{ color: "#C8860A" }} />
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.6rem",
                color: "#F7F4EF",
              }}
            >
              Work With Me
            </h2>
          </div>

          <p
            className="mb-8"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "1rem",
              color: "rgba(247,244,239,0.7)",
              lineHeight: 1.85,
              maxWidth: "38rem",
            }}
          >
            I take on a limited number of private tutoring clients each month to
            ensure every student receives focused, personalized attention. If
            you're serious about your LSAT score — whether you're aiming for a
            10-point improvement or targeting a 170+ — I'd like to hear from
            you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:devaney@example.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: "#C8860A",
                color: "#FFFFFF",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.95rem",
                boxShadow: "0 2px 12px rgba(200,134,10,0.3)",
                textDecoration: "none",
              }}
            >
              <Mail size={18} />
              Email Devaney
            </a>

            <button
              onClick={() => navigate("/lessons")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: "rgba(247,244,239,0.1)",
                color: "#F7F4EF",
                border: "1px solid rgba(247,244,239,0.2)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.95rem",
              }}
            >
              <BookOpen size={18} />
              Explore Free Lessons
              <ArrowRight size={16} />
            </button>
          </div>

          <p
            className="mt-6"
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "0.85rem",
              color: "rgba(247,244,239,0.4)",
            }}
          >
            Sessions available via Zoom · Hampton/Newport News area in-person by arrangement
          </p>
        </motion.div>

        {/* ── Message at bottom ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-12 text-center"
        >
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(30,33,48,0.4)",
              lineHeight: 1.8,
            }}
          >
            "Charge it to my head, not my heart." — a framework for extending
            grace, to yourself and to the exam.
          </p>
          <p
            className="mt-1"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.8rem",
              color: "rgba(30,33,48,0.3)",
            }}
          >
            — Devaney M. Page
          </p>
        </motion.div>

      </div>
    </div>
  );
}
