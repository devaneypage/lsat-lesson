/**
 * DESIGN: High Contrast, Bold & Distinctive
 * Dashboard: Course overview with lesson cards and navigation.
 * 
 * Color Palette: Off-white background, indigo text, electric blue CTAs, golden yellow accents, neon orange success
 */

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { BookOpen, ChevronRight, Zap, Target, BarChart3, BookMarked, Brain, Layers } from "lucide-react";
import { getLessonCompletion } from "@/hooks/useLessonCompletion";

const LESSONS = [
  {
    id: "necessary-assumptions",
    title: "Necessary Assumptions",
    description: "Master the Negation Test™ to identify unstated premises that arguments depend on.",
    icon: BookOpen,
    color: "#ffdd33",
    bgColor: "rgba(255,221,51,0.08)",
    borderColor: "rgba(255,221,51,0.25)",
    duration: "~14 min",
    difficulty: "Intermediate",
    status: "completed",
  },
  {
    id: "common-flaws",
    title: "Common Flaws in LSAT Arguments",
    description: "Learn the 19 most tested logical fallacies and how to spot them instantly.",
    icon: Zap,
    color: "#1a7dff",
    bgColor: "rgba(26,125,255,0.08)",
    borderColor: "rgba(26,125,255,0.25)",
    duration: "~18 min",
    difficulty: "Intermediate",
    status: "available",
  },
  {
    id: "strengthen-weaken",
    title: "Strengthen & Weaken Questions",
    description: "Develop the systematic approach to finding answers that impact argument validity.",
    icon: Target,
    color: "#439cdf",
    bgColor: "rgba(67,156,223,0.08)",
    borderColor: "rgba(67,156,223,0.25)",
    duration: "~16 min",
    difficulty: "Advanced",
    status: "available",
  },
  {
    id: "reading-comprehension",
    title: "Reading Comprehension: Passage Mapping",
    description: "Master efficient passage annotation to identify structure, tone, and key details.",
    icon: BookMarked,
    color: "#3366ff",
    bgColor: "rgba(51,102,255,0.08)",
    borderColor: "rgba(51,102,255,0.25)",
    duration: "~15 min",
    difficulty: "Intermediate",
    status: "available",
  },
  {
    id: "formal-logic",
    title: "Formal Logic Fundamentals",
    description: "Master logical notation, conditionals, negation, and quantifiers—the foundation of LSAT reasoning.",
    icon: Brain,
    color: "#46e291",
    bgColor: "rgba(70,226,145,0.08)",
    borderColor: "rgba(70,226,145,0.25)",
    duration: "~17 min",
    difficulty: "Intermediate",
    status: "available",
  },
  {
    id: "sufficient-assumptions",
    title: "Sufficient Assumptions",
    description: "Master the Conditional Bridge Method to identify assumptions that guarantee an argument's conclusion.",
    icon: Layers,
    color: "#9b72cf",
    bgColor: "rgba(155,114,207,0.08)",
    borderColor: "rgba(155,114,207,0.25)",
    duration: "~14 min",
    difficulty: "Intermediate",
    status: "available",
  },
];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  // Read completion flags from localStorage on mount
  useEffect(() => {
    const flags: Record<string, boolean> = {};
    LESSONS.forEach((lesson) => {
      flags[lesson.id] = getLessonCompletion(lesson.id);
    });
    setCompletedLessons(flags);
  }, []);

  const handleLessonClick = (lessonId: string) => {
    navigate(`/lessons/${lessonId}`);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Header */}
      <header
        className="border-b"
        style={{
          borderColor: "var(--border)",
          background: "rgba(249,248,246,0.95)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(0,102,255,0.12)",
                  border: "2px solid var(--primary)",
                }}
              >
                <BookOpen size={24} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    fontSize: "2rem",
                    color: "var(--foreground)",
                    margin: 0,
                  }}
                >
                  LSAT Mastery
                </h1>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.9rem",
                    color: "var(--muted-foreground)",
                    margin: 0,
                  }}
                >
                  Interactive Logical Reasoning Lessons
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h2
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 700,
              fontSize: "1.75rem",
              color: "var(--foreground)",
              marginBottom: "0.5rem",
            }}
          >
            Choose Your Lesson
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "1rem",
              color: "var(--muted-foreground)",
              lineHeight: 1.6,
            }}
          >
            Each lesson combines theory, frameworks, and interactive practice questions to build your Logical Reasoning mastery.
          </p>
        </motion.div>

        {/* Lesson Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LESSONS.map((lesson, idx) => {
            const Icon = lesson.icon;
            const isCompleted = completedLessons[lesson.id] ?? lesson.status === "completed";

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => handleLessonClick(lesson.id)}
                className="group cursor-pointer"
              >
                <div
                  className="rounded-xl overflow-hidden transition-all duration-300 h-full flex flex-col"
                  style={{
                    background: "var(--card)",
                    border: `2px solid ${lesson.borderColor}`,
                    boxShadow: "0 2px 8px rgba(45,27,105,0.12)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.boxShadow = "0 8px 24px rgba(45,27,105,0.2)";
                    el.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.boxShadow = "0 2px 8px rgba(45,27,105,0.12)";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  {/* Top Border Accent */}
                  <div
                    style={{
                      height: "4px",
                      background: lesson.color,
                    }}
                  />

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Icon & Status */}
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
                          style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#2E7D52",
                            background: "rgba(46,125,82,0.12)",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "0.25rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          ✓ Completed
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "var(--foreground)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {lesson.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.9rem",
                        color: "var(--muted-foreground)",
                        lineHeight: 1.5,
                        marginBottom: "1rem",
                        flex: 1,
                      }}
                    >
                      {lesson.description}
                    </p>

                    {/* Meta */}
                    <div
                      className="flex items-center justify-between mb-4 pb-4"
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <div className="flex gap-4">
                        <div>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.7rem",
                              color: "var(--muted-foreground)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: "0.2rem",
                            }}
                          >
                            Duration
                          </p>
                          <p
                            style={{
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: "var(--foreground)",
                            }}
                          >
                            {lesson.duration}
                          </p>
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "0.7rem",
                              color: "var(--muted-foreground)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: "0.2rem",
                            }}
                          >
                            Difficulty
                          </p>
                          <p
                            style={{
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: lesson.color,
                            }}
                          >
                            {lesson.difficulty}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                      style={{
                        background: isCompleted ? "rgba(0,102,255,0.1)" : "var(--primary)",
                        color: isCompleted ? "var(--primary)" : "var(--primary-foreground)",
                        fontFamily: "'Poppins', sans-serif",
                        border: isCompleted ? "1px solid var(--primary)" : "none",
                      }}
                    >
                      {isCompleted ? "Review Lesson" : "Start Lesson"}
                      <ChevronRight size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
