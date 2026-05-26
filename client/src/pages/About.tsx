/**
 * DESIGN: Academic Light — Warm Parchment
 * Page: About & Hire Me
 *
 * Devaney's professional bio, credentials, teaching philosophy, rates, policies,
 * and live contact/booking links.
 */

import { motion } from "framer-motion";
import {
  GraduationCap,
  Scale,
  BookOpen,
  Mail,
  CalendarDays,
  CheckCircle2,
  ArrowRight,
  Award,
  ShieldCheck,
  Clock,
  DollarSign,
  Quote,
} from "lucide-react";
import { useLocation } from "wouter";
import { useFeatureFlag } from "@/lib/flags";

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
    detail: "Freelance · Hampton Roads, Virginia",
    color: "#C8860A",
  },
  {
    icon: BookOpen,
    label: "Logical Reasoning Expert",
    detail: "Assumptions · Flaws · Strengthen/Weaken · RC",
    color: "#2E7D52",
  },
  {
    icon: ShieldCheck,
    label: "Background Check Passed",
    detail: "Verified June 18, 2025",
    color: "#B84030",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "DeVaney is great!",
    name: "Barang",
    detail: "5 stars · Varsity Tutors",
    color: "#5B4A8A",
  },
  {
    quote:
      "Wonderful session. High energy, good information. Great prep.",
    name: "Lloyd",
    detail: "5 stars · Varsity Tutors",
    color: "#C8860A",
  },
  {
    quote:
      "DeVaney is fantastic: clearly knowledgable about the material she's teaching, very personable, and committed to providing high quality tutoring. I'm looking forward to continuing our work together.",
    name: "Anonymous",
    detail: "5 stars · Varsity Tutors",
    color: "#2E7D52",
  },
  {
    quote:
      "DeVaney is casual in a way that makes you feel comfortable expressing and working through uncertainty, while still maintaining a sense of professionalism. I look forward to working with her.",
    name: "Anonymous",
    detail: "5 stars · Varsity Tutors",
    color: "#1a7dff",
  },
  {
    quote:
      "Very personable and helpful! I liked how she used different examples to explain everything. The way she explained the material made it all make sense.",
    name: "Anonymous",
    detail: "5 stars · Varsity Tutors",
    color: "#B84030",
  },
  {
    quote:
      "DeVaney is very helpful and informative.",
    name: "Barang",
    detail: "5 stars · Varsity Tutors",
    color: "#5B4A8A",
  },
  {
    quote:
      "DeVaney is very funny and keeps me engaged in the lesson. Even though I have some knowledge about the LSAT from last year, I like how she teaches me everything as if I've never learned it before so that I can learn new strategies.",
    name: "Carmen",
    detail: "5 stars · Varsity Tutors",
    color: "#C8860A",
  },
  {
    quote:
      "Fantastic tutor! DeVaney explained everything thoroughly and in a way that allowed me to clearly understand the materials. I would highly recommend her to anyone that is interested in taking the LSAT.",
    name: "Peter",
    detail: "5 stars · Varsity Tutors",
    color: "#2E7D52",
  },
  {
    quote:
      "DeVaney was very resourceful and patient while also challenging me to keep pushing through the problems. She had a very positive attitude that made each session enjoyable and productive. I would highly recommend DeVaney to anyone who needs LSAT help!",
    name: "Sara",
    detail: "5 stars · Varsity Tutors",
    color: "#1a7dff",
  },
];

const WHAT_TO_EXPECT = [
  "A structured diagnostic in our first session to locate the specific gaps",
  "Concept-forward instruction — we address the why before the how",
  "Targeted practice calibrated to your actual weak points, not a standardized syllabus",
  "Sessions available online or in-person in the Hampton Roads, Virginia area",
];

export default function About() {
  const [, navigate] = useLocation();

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #F7F4EF 0%, #EDE8DF 60%, #E4DDD0 100%)" }}
    >
      <div className="container py-16 max-w-4xl mx-auto px-6">

        {/* ── Hero headline ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mb-14"
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
            className="mb-5"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.9rem, 4.5vw, 3rem)",
              color: "#1E2130",
              lineHeight: 1.15,
            }}
          >
            The LSAT rewards a specific kind of reasoning.
            <br />
            <span style={{ color: "#C8860A" }}>My job is to help you build it.</span>
          </h1>

          <p
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "1rem",
              color: "rgba(30,33,48,0.45)",
              lineHeight: 1.6,
            }}
          >
            Devaney M. Page, JD · Legal Education Specialist · Hampton Roads, Virginia
          </p>
        </motion.div>

        {/* ── Credentials ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14"
        >
          {CREDENTIALS.map((cred, idx) => {
            const Icon = cred.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.12 + idx * 0.07 }}
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

        {/* ── Bio ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-14"
        >
          <div
            className="rounded-2xl p-8 space-y-5"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
          >
            {[
              "There's a version of LSAT prep that's essentially sophisticated memorization — a different trick for every question type, a shortcut layered on top of a pattern layered on top of a rule. I don't teach that version.",
              "What I teach is the architecture beneath the test: how arguments are constructed, where they're designed to mislead you, and how to engage with them systematically rather than by instinct or elimination. That distinction matters more than most students realize. A student who understands why the Negation Test works — not just how to execute it — can adapt when a question surfaces reasoning they've never encountered before. The student who memorized a procedure cannot.",
              "I'm Devaney — a JD and Legal Education Specialist with a background in legal reasoning and a deep interest in how people actually learn difficult things. I've spent my career working at the intersection of law and pedagogy, tutoring students through the LSAT and the Bar Exam and thinking seriously about what separates genuine comprehension from the appearance of it. I tend to find the structural logic underneath a concept before I teach it, because I've found that students don't really learn from examples — they learn from principles, and then examples become obvious.",
              "My students are usually the ones who have already done the practice problems and still can't identify where exactly their reasoning breaks down. If the score isn't moving despite the hours, that's almost always a signal that something structural is off — a gap in how the argument is being read, not how hard it's being studied. That's the problem I'm best at solving.",
            ].map((para, idx) => (
              <p
                key={idx}
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "1.02rem",
                  color: "rgba(30,33,48,0.72)",
                  lineHeight: 1.9,
                }}
              >
                {para}
              </p>
            ))}
          </div>
        </motion.div>

        {/* ── Teaching Philosophy pull quote ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-14"
        >
          <blockquote
            className="rounded-2xl p-8"
            style={{
              background: "linear-gradient(135deg, rgba(91,74,138,0.07) 0%, rgba(200,134,10,0.06) 100%)",
              border: "1px solid rgba(91,74,138,0.15)",
              borderLeft: "4px solid #5B4A8A",
            }}
          >
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "1.1rem",
                color: "#1E2130",
                lineHeight: 1.85,
              }}
            >
              "I don't believe the LSAT is a test of raw intelligence. I believe it's a test of whether your
              reasoning has been disciplined enough to operate under pressure — and that's something you can
              deliberately develop. That's the only version of this work that interests me."
            </p>
            <p
              className="mt-4"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#5B4A8A",
              }}
            >
              — Devaney M. Page
            </p>
          </blockquote>
        </motion.div>

        {/* ── Testimonials — feature flagged ── */}
        <TestimonialsSection />

        {/* __ placeholder to keep the JSX structure intact __ */}
        {false && <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-7">
            <Quote size={22} style={{ color: "#5B4A8A" }} />
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.6rem",
                color: "#1E2130",
              }}
            >
              What Students Say
            </h2>
          </div>

          <div className="space-y-5">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.27 + idx * 0.08 }}
                className="rounded-xl p-6"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.07)",
                  borderLeft: `4px solid ${t.color}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <p
                  className="mb-4"
                  style={{
                    fontFamily: "'Lora', serif",
                    fontStyle: "italic",
                    fontSize: "1rem",
                    color: "rgba(30,33,48,0.72)",
                    lineHeight: 1.85,
                  }}
                >
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: `${t.color}18`,
                      color: t.color,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#1E2130",
                      }}
                    >
                      {t.name}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Lora', serif",
                        fontSize: "0.8rem",
                        color: "rgba(30,33,48,0.4)",
                        marginLeft: "0.5rem",
                      }}
                    >
                      {t.detail}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>}

        {/* ── Work With Me ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-7">
            <Award size={22} style={{ color: "#C8860A" }} />
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.6rem",
                color: "#1E2130",
              }}
            >
              Work With Me
            </h2>
          </div>

          <p
            className="mb-6"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "1.02rem",
              color: "rgba(30,33,48,0.7)",
              lineHeight: 1.9,
              maxWidth: "44rem",
            }}
          >
            I offer one-on-one tutoring for the LSAT and the Bar Exam. Sessions are built around your
            diagnostic needs, not a generic curriculum — we start by identifying exactly where your
            reasoning breaks down and work backward from there.
          </p>

          <p
            className="mb-6"
            style={{
              fontFamily: "'Lora', serif",
              fontStyle: "italic",
              fontSize: "0.97rem",
              color: "rgba(30,33,48,0.55)",
              lineHeight: 1.7,
              maxWidth: "44rem",
            }}
          >
            <strong style={{ fontStyle: "normal", color: "#1E2130" }}>Who I work best with:</strong>{" "}
            Students who are serious, have already put in some foundational work, and want to understand
            the test rather than outmaneuver it.
          </p>

          {/* What to expect */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="mb-4"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(30,33,48,0.4)",
              }}
            >
              What to expect
            </p>
            <div className="space-y-3">
              {WHAT_TO_EXPECT.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2
                    size={17}
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
                </div>
              ))}
            </div>
          </div>

          {/* Rates */}
          <div
            className="rounded-xl p-6 mb-8"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <DollarSign size={18} style={{ color: "#C8860A" }} />
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(30,33,48,0.4)",
                }}
              >
                Rates
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { format: "In-Person", rate: "$85 / hour" },
                { format: "Online", rate: "$75 / hour" },
              ].map((row) => (
                <div
                  key={row.format}
                  className="rounded-xl p-4 text-center"
                  style={{
                    background: "rgba(200,134,10,0.05)",
                    border: "1px solid rgba(200,134,10,0.15)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color: "#C8860A",
                      lineHeight: 1.2,
                    }}
                  >
                    {row.rate}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.85rem",
                      color: "rgba(30,33,48,0.5)",
                      marginTop: "0.3rem",
                    }}
                  >
                    {row.format}
                  </p>
                </div>
              ))}
            </div>

            {/* Policies */}
            <div className="space-y-3 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex items-start gap-3">
                <Clock size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#5B4A8A" }} />
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.9rem",
                    color: "rgba(30,33,48,0.6)",
                    lineHeight: 1.65,
                  }}
                >
                  <strong style={{ color: "#1E2130" }}>Cancellation:</strong> Two hours' notice is
                  required to cancel or reschedule. Late cancellations may be charged at the full
                  session rate.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#2E7D52" }} />
                <p
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.9rem",
                    color: "rgba(30,33,48,0.6)",
                    lineHeight: 1.65,
                  }}
                >
                  <strong style={{ color: "#1E2130" }}>Good Fit Guarantee:</strong> Your first lesson
                  is backed by a Good Fit Guarantee — if it isn't the right match, you won't be charged.
                </p>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://calendly.com/thedevanagari"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: "#C8860A",
                color: "#FFFFFF",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.95rem",
                boxShadow: "0 2px 12px rgba(200,134,10,0.28)",
                textDecoration: "none",
              }}
            >
              <CalendarDays size={18} />
              Book a Session
            </a>

            <a
              href="mailto:thedevanagari@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              style={{
                background: "rgba(30,33,48,0.06)",
                color: "#1E2130",
                border: "1px solid rgba(30,33,48,0.12)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.95rem",
                textDecoration: "none",
              }}
            >
              <Mail size={18} />
              thedevanagari@gmail.com
            </a>
          </div>
        </motion.div>

        {/* ── A Note on This Site ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-14"
        >
          <div
            className="rounded-2xl p-7"
            style={{
              background: "rgba(46,125,82,0.05)",
              border: "1px solid rgba(46,125,82,0.15)",
            }}
          >
            <p
              className="mb-1"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#2E7D52",
              }}
            >
              A Note on This Site
            </p>
            <p
              style={{
                fontFamily: "'Lora', serif",
                fontSize: "1rem",
                color: "rgba(30,33,48,0.68)",
                lineHeight: 1.9,
              }}
            >
              The lessons here are free — a small attempt to make rigorous LSAT instruction more
              accessible than the prep industry typically allows. If one of them helped you think about
              something differently, or if you're ready to go deeper with individual instruction, I'd
              love to hear from you.
            </p>
            <button
              onClick={() => navigate("/lessons")}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200"
              style={{
                color: "#2E7D52",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Explore free lessons
              <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ─── TestimonialsSection — feature flagged ────────────────────────────────────

function TestimonialsSection() {
  const { enabled } = useFeatureFlag("about_testimonials");
  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.22 }}
      className="mb-14"
    >
      <div className="flex items-center gap-3 mb-7">
        <Quote size={22} style={{ color: "#5B4A8A" }} />
        <h2
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: "1.6rem",
            color: "#1E2130",
          }}
        >
          What Students Say
        </h2>
      </div>

      <div className="space-y-5">
        {TESTIMONIALS.map((t, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.27 + idx * 0.08 }}
            className="rounded-xl p-6"
            style={{
              background: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.07)",
              borderLeft: `4px solid ${t.color}`,
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="mb-4"
              style={{
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                fontSize: "1rem",
                color: "rgba(30,33,48,0.72)",
                lineHeight: 1.85,
              }}
            >
              "{t.quote}"
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: `${t.color}18`,
                  color: t.color,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {t.name[0]}
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#1E2130",
                  }}
                >
                  {t.name}
                </span>
                <span
                  style={{
                    fontFamily: "'Lora', serif",
                    fontSize: "0.8rem",
                    color: "rgba(30,33,48,0.4)",
                    marginLeft: "0.5rem",
                  }}
                >
                  {t.detail}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
