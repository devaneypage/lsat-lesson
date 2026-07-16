/**
 * DESIGN: Nexus Command Center — Lessons Page
 * Page: Lessons
 *
 * Display all available lessons in a grid format.
 * P5 fix: Added page-level header (title + subtitle + rule) above LessonGrid.
 *
 * Feature Flags:
 *   lesson_grid — if disabled, renders the legacy lesson list (PathSelector style)
 */

import LessonGrid from "@/components/LessonGrid";
import PathSelector from "@/components/PathSelector";
import { useFeatureFlag } from "@/lib/flags";
import PageMeta from "@/components/PageMeta";

export default function Lessons() {
  const { enabled: lessonGridEnabled, loading } = useFeatureFlag("lesson_grid");

  // While flags load, show nothing to avoid layout flash
  if (loading) {
    return (
      <div
        style={{
          background: "var(--background)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.9rem",
            color: "var(--muted-foreground)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Loading…
        </div>
      </div>
    );
  }

  // Kill switch: revert to legacy PathSelector if lesson_grid is disabled
  if (!lessonGridEnabled) {
    return <PathSelector />;
  }

  return (
    <div
      style={{
        background: "var(--background)",
        minHeight: "100vh",
        padding: "1.5rem 1.5rem 3rem",
      }}
    >
      <PageMeta
        title="LSAT Lessons: Logical Reasoning & Reading | Devaney"
        description="Seven structured LSAT lessons covering necessary assumptions, sufficient assumptions, flaw in reasoning, reading comprehension, and more."
        keywords={[
          "LSAT lessons",
          "logical reasoning",
          "necessary assumptions",
          "flaw in reasoning",
          "reading comprehension",
          "LSAT tutor",
          "law school admissions",
        ]}
        canonical="https://devasophy.blog/lessons"
      />
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* P5: Page-level header — orientation anchor */}
        <header style={{ marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "1.75rem",
                fontWeight: 900,
                letterSpacing: "0.02em",
                color: "var(--foreground)",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Core Concepts
            </h1>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              7 Lessons
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "0.95rem",
              color: "var(--muted-foreground)",
              margin: "0 0 0.875rem 0",
              lineHeight: 1.5,
            }}
          >
            Seven structured lessons in Logical Reasoning and Reading
            Comprehension — work through them in sequence or jump to any topic.
          </p>
          {/* Horizontal rule */}
          <div
            style={{
              height: "1.5px",
              background: "var(--border)",
              width: "100%",
            }}
          />
        </header>

        <LessonGrid />
      </div>
    </div>
  );
}
