/**
 * DESIGN: Nexus Command Center — Lessons Page
 * Page: Lessons
 * 
 * Display all available lessons in a grid format.
 */

import LessonGrid from "@/components/LessonGrid";

export default function Lessons() {
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
