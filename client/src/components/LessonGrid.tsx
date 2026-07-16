/**
 * DESIGN: Nexus Command Center — Lesson Grid
 * Component: LessonGrid
 *
 * Grid of lesson cards linking to individual lessons.
 * Each card shows lesson title, description, and duration.
 *
 * P6 fix: Added sequence numbers and "Start Here" badge on card 1
 * P9 fix: Replaced rgba(17,17,17,0.7) with var(--muted-foreground)
 * P10 fix: Consolidated colors to 4 semantic groups (LR=amber/teal/terra/forest, RC=sky, Logic=purple)
 */

import React from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Zap,
  Target,
  BookMarked,
  Brain,
  Layers,
  AlertCircle,
} from "lucide-react";

interface Lesson {
  id: string;
  seq: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  duration: string;
  group: "LR" | "RC" | "Logic";
}

// P10: Color consolidation — 4 semantic groups
// LR (Logical Reasoning): amber, teal, terra, forest, amber-2
// RC (Reading Comprehension): nexus-sky (blue)
// Logic (Formal Logic): nexus-purple
const LESSONS: Lesson[] = [
  {
    seq: 1,
    id: "necessary-assumptions",
    title: "Necessary Assumptions",
    description: "Master the Negation Test™ to identify unstated premises.",
    icon: <BookOpen size={24} />,
    color: "var(--nexus-amber)",
    route: "/learn/necessary-assumptions",
    duration: "14 min",
    group: "LR",
  },
  {
    seq: 2,
    id: "sufficient-assumptions",
    title: "Sufficient Assumptions",
    description: "Master the Conditional Bridge Method to identify assumptions.",
    icon: <Layers size={24} />,
    color: "var(--nexus-teal)",
    route: "/learn/sufficient-assumptions",
    duration: "16 min",
    group: "LR",
  },
  {
    seq: 3,
    id: "flaw-in-reasoning",
    title: "Flaw in Reasoning",
    description: "Identify logical fallacies and argument weaknesses.",
    icon: <AlertCircle size={24} />,
    color: "var(--nexus-terra)",
    route: "/learn/flaw-in-reasoning",
    duration: "15 min",
    group: "LR",
  },
  {
    seq: 4,
    id: "common-flaws",
    title: "Common Flaws",
    description: "Learn the 19 most tested logical fallacies.",
    icon: <Zap size={24} />,
    color: "var(--nexus-lime)",  // P3 already darkened to #4A8A1A (WCAG AA)
    route: "/learn/common-flaws",
    duration: "18 min",
    group: "LR",
  },
  {
    seq: 5,
    id: "strengthen-weaken",
    title: "Strengthen & Weaken",
    description: "Develop the systematic approach to finding answers.",
    icon: <Target size={24} />,
    color: "var(--nexus-forest)",
    route: "/learn/strengthen-weaken",
    duration: "16 min",
    group: "LR",
  },
  {
    seq: 6,
    id: "reading-comprehension",
    title: "Reading Comprehension",
    description: "Master efficient passage annotation and mapping.",
    icon: <BookMarked size={24} />,
    color: "var(--nexus-blue)",  // P0 defined: #2E86C1
    route: "/learn/reading-comprehension",
    duration: "15 min",
    group: "RC",
  },
  {
    seq: 7,
    id: "formal-logic",
    title: "Formal Logic",
    description: "Master logical notation, conditionals, and quantifiers.",
    icon: <Brain size={24} />,
    color: "var(--nexus-purple)",  // P0 defined: #7B5EA7
    route: "/learn/formal-logic",
    duration: "17 min",
    group: "Logic",
  },
];

// Group label colors
const GROUP_COLORS: Record<Lesson["group"], string> = {
  LR: "var(--nexus-teal)",
  RC: "var(--nexus-blue)",
  Logic: "var(--nexus-purple)",
};

const LessonGrid: React.FC = () => {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "0.25rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        padding: "2rem",
      }}
    >
      {/* Grid header — "Available Lessons" removed; page header in Lessons.tsx handles this */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {LESSONS.map((lesson) => (
          <Link
            key={lesson.id}
            href={lesson.route}
            className="transition-all duration-200"
            style={{
              background: "var(--card)",
              border: `1.5px solid ${lesson.color}`,
              borderRadius: "0.25rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              padding: "1.5rem",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 12px ${lesson.color}30`;
              e.currentTarget.style.background = `${lesson.color}08`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
              e.currentTarget.style.background = "var(--card)";
            }}
          >
            {/* P6: Sequence number badge — top-right corner */}
            <div
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              {/* "Start Here" badge on lesson 1 */}
              {lesson.seq === 1 && (
                <span
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--nexus-amber)",
                    background: "var(--nexus-amber)18",
                    border: "1px solid var(--nexus-amber)60",
                    borderRadius: "0.2rem",
                    padding: "0.15rem 0.4rem",
                  }}
                >
                  Start Here
                </span>
              )}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.02em",
                }}
              >
                {String(lesson.seq).padStart(2, "0")}
              </span>
            </div>

            {/* Card header: icon + title + duration */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                paddingRight: "2.5rem",  // prevent overlap with seq badge
              }}
            >
              <div
                style={{
                  color: lesson.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {lesson.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--foreground)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {lesson.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.25rem",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: "0.75rem",
                      color: lesson.color,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {lesson.duration}
                  </p>
                  {/* Group tag */}
                  <span
                    style={{
                      fontFamily: "'Archivo', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: GROUP_COLORS[lesson.group],
                      opacity: 0.75,
                    }}
                  >
                    {lesson.group}
                  </span>
                </div>
              </div>
            </div>

            {/* Description — P9: var(--muted-foreground) instead of rgba */}
            <p
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: "0.9rem",  // P typography: increased from 0.85rem
                color: "var(--muted-foreground)",
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              {lesson.description}
            </p>

            {/* CTA */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: "1rem",
                borderTop: `1.5px solid ${lesson.color}40`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: lesson.color,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
              >
                Start Lesson →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LessonGrid;
