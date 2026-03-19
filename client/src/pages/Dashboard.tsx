/**
 * DESIGN: Academic Light — Warm Parchment
 * Dashboard: course overview with lesson cards, progress tracking, and navigation.
 */

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Zap, Target, BarChart3 } from "lucide-react";

const LESSONS = [
  {
    id: "necessary-assumptions",
    title: "Necessary Assumptions",
    description: "Master the Negation Test™ to identify unstated premises that arguments depend on.",
    icon: BookOpen,
    color: "#C8860A",
    bgColor: "rgba(200,134,10,0.08)",
    borderColor: "rgba(200,134,10,0.25)",
    duration: "~14 min",
    difficulty: "Intermediate",
    status: "completed",
  },
  {
    id: "common-flaws",
    title: "Common Flaws in LSAT Arguments",
    description: "Learn the 19 most tested logical fallacies and how to spot them instantly.",
    icon: Zap,
    color: "#B84030",
    bgColor: "rgba(184,64,48,0.08)",
    borderColor: "rgba(184,64,48,0.25)",
    duration: "~18 min",
    difficulty: "Intermediate",
    status: "available",
  },
  {
    id: "strengthen-weaken",
    title: "Strengthen & Weaken Questions",
    description: "Develop the systematic approach to finding answers that impact argument validity.",
    icon: Target,
    color: "#2E7D52",
    bgColor: "rgba(46,125,82,0.08)",
    borderColor: "rgba(46,125,82,0.25)",
    duration: "~16 min",
    difficulty: "Advanced",
    status: "available",
  },
];

export default function Dashboard() {
  const [, navigate] = useLocation();

  const handleLessonClick = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(160deg, #F7F4EF 0%, #EDE8DF 60%, #E4DDD0 100%)" }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          borderColor: "rgba(0,0,0,0.08)",
          background: "rgba(247,244,239,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(200,134,10,0.12)",
                border: "1px solid rgba(200,134,10,0.3)",
              }}
            >
              <BookOpen size={22} style={{ color: "#C8860A" }} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.8rem",
                  color: "#1E2130",
                }}
              >
                LSAT Mastery
              </h1>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "0.75rem",
                  color: "rgba(30,33,48,0.4)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Interactive Logical Reasoning Lessons
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-12">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: "2rem",
              color: "#1E2130",
              marginBottom: "0.5rem",
            }}
          >
            Choose Your Lesson
          </h2>
          <p
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "1.05rem",
              color: "rgba(30,33,48,0.6)",
              lineHeight: 1.8,
              maxWidth: "600px",
            }}
          >
            Each lesson combines theory, frameworks, and interactive practice questions to build your Logical Reasoning mastery.
          </p>
        </motion.div>

        {/* Lesson grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {LESSONS.map((lesson, idx) => {
            const Icon = lesson.icon;
            const isCompleted = lesson.status === "completed";

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.1)" }}
                onClick={() => handleLessonClick(lesson.id)}
                className="rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
                style={{
                  background: "#FFFFFF",
                  border: `1px solid ${lesson.borderColor}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
              >
                {/* Card header with color accent */}
                <div
                  className="h-1"
                  style={{ background: lesson.color }}
                />

                {/* Card content */}
                <div className="p-6">
                  {/* Icon and status */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        background: lesson.bgColor,
                        border: `1px solid ${lesson.borderColor}`,
                      }}
                    >
                      <Icon size={24} style={{ color: lesson.color }} />
                    </div>
                    {isCompleted && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(46,125,82,0.1)",
                          color: "#2E7D52",
                          border: "1px solid rgba(46,125,82,0.25)",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "#1E2130",
                    }}
                  >
                    {lesson.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="mb-4"
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "0.9rem",
                      color: "rgba(30,33,48,0.6)",
                      lineHeight: 1.7,
                      minHeight: "2.8rem",
                    }}
                  >
                    {lesson.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between mb-4 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: "0.7rem",
                          color: "rgba(30,33,48,0.35)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Duration
                      </p>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: "#1E2130",
                        }}
                      >
                        {lesson.duration}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: "0.7rem",
                          color: "rgba(30,33,48,0.35)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        Difficulty
                      </p>
                      <p
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          color: lesson.color,
                        }}
                      >
                        {lesson.difficulty}
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    className="w-full py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                      background: lesson.bgColor,
                      color: lesson.color,
                      border: `1px solid ${lesson.borderColor}`,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {isCompleted ? "Review Lesson" : "Start Lesson"}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="rounded-xl p-6"
          style={{
            background: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={20} style={{ color: "#C8860A" }} />
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1E2130",
              }}
            >
              Your Progress
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Lessons Completed", value: "1/3" },
              { label: "Total Study Time", value: "~14 min" },
              { label: "Next: Common Flaws", value: "18 min" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.7rem",
                    color: "rgba(30,33,48,0.35)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    marginBottom: "0.25rem",
                  }}
                >
                  {stat.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "#1E2130",
                  }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
