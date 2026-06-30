/**
 * DESIGN: Nexus Command Center — Lessons Page
 * Page: Lessons
 *
 * Display all available lessons in a grid format.
 *
 * Feature Flags:
 *   lesson_grid — if disabled, renders the legacy lesson list (PathSelector style)
 */

import LessonGrid from "@/components/LessonGrid";
import PathSelector from "@/components/PathSelector";
import { useFeatureFlag } from "@/lib/flags";

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
            fontFamily: "'Archivo', sans-serif",
            fontSize: "0.9rem",
            color: "rgba(17, 17, 17, 0.5)",
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
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <LessonGrid />
      </div>
    </div>
  );
}
