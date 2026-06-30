/**
 * DESIGN: Nexus Command Center — Lesson Grid
 * Component: LessonGrid
 * 
 * Grid of lesson cards linking to individual lessons.
 * Each card shows lesson title, description, and duration.
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
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  duration: string;
}

const LESSONS: Lesson[] = [
  {
    id: "necessary-assumptions",
    title: "Necessary Assumptions",
    description: "Master the Negation Test™ to identify unstated premises.",
    icon: <BookOpen size={24} />,
    color: "var(--nexus-amber)",
    route: "/lessons/necessary-assumptions",
    duration: "14 min",
  },
  {
    id: "sufficient-assumptions",
    title: "Sufficient Assumptions",
    description: "Master the Conditional Bridge Method to identify assumptions.",
    icon: <Layers size={24} />,
    color: "var(--nexus-teal)",
    route: "/lessons/sufficient-assumptions",
    duration: "16 min",
  },
  {
    id: "flaw-in-reasoning",
    title: "Flaw in Reasoning",
    description: "Identify logical fallacies and argument weaknesses.",
    icon: <AlertCircle size={24} />,
    color: "var(--nexus-terra)",
    route: "/lessons/flaw-in-reasoning",
    duration: "15 min",
  },
  {
    id: "common-flaws",
    title: "Common Flaws",
    description: "Learn the 19 most tested logical fallacies.",
    icon: <Zap size={24} />,
    color: "var(--nexus-lime)",
    route: "/lessons/common-flaws",
    duration: "18 min",
  },
  {
    id: "strengthen-weaken",
    title: "Strengthen & Weaken",
    description: "Develop the systematic approach to finding answers.",
    icon: <Target size={24} />,
    color: "var(--nexus-forest)",
    route: "/lessons/strengthen-weaken",
    duration: "16 min",
  },
  {
    id: "reading-comprehension",
    title: "Reading Comprehension",
    description: "Master efficient passage annotation and mapping.",
    icon: <BookMarked size={24} />,
    color: "var(--nexus-blue)",
    route: "/lessons/reading-comprehension",
    duration: "15 min",
  },
  {
    id: "formal-logic",
    title: "Formal Logic",
    description: "Master logical notation, conditionals, and quantifiers.",
    icon: <Brain size={24} />,
    color: "var(--nexus-purple)",
    route: "/lessons/formal-logic",
    duration: "17 min",
  },
];

const LessonGrid: React.FC = () => {
  return (
    <div
      className="card p-8"
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--border)",
        borderRadius: "0.25rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <h2
        style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontSize: "1.5rem",
          fontWeight: 900,
          letterSpacing: "0.02em",
          color: "var(--foreground)",
          marginBottom: "2rem",
        }}
      >
        Available Lessons
      </h2>

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
            className="card p-6 transition-all duration-200 hover:shadow-md"
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  color: lesson.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {lesson.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--foreground)",
                    margin: 0,
                  }}
                >
                  {lesson.title}
                </h3>
                <p
                  style={{
                    fontFamily: "'Archivo', sans-serif",
                    fontSize: "0.75rem",
                    color: lesson.color,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  {lesson.duration}
                </p>
              </div>
            </div>

            <p
              style={{
                fontFamily: "'Archivo', sans-serif",
                fontSize: "0.85rem",
                color: "rgba(17, 17, 17, 0.7)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {lesson.description}
            </p>

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
