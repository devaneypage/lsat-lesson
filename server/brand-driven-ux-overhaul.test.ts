import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const stylesheet = read("client/src/index.css");
const shells = read("client/src/components/ApplicationShells.tsx");
const dashboardLayout = read("client/src/components/NexusDashboardLayout.tsx");
const continueLearning = read("client/src/components/ContinueLearningDashboard.tsx");
const lessonGrid = read("client/src/components/LessonGrid.tsx");

describe("Scholarly Command Center UX contract", () => {
  it("defines the ink rail, raised paper, teal action, and scholarly display system", () => {
    for (const token of [
      "--workspace-rail:",
      "--workspace-rail-foreground:",
      "--workspace-rail-muted:",
      "--workspace-rail-border:",
      "--paper-raised:",
      "--primary: #0E6F76",
    ]) {
      expect(stylesheet).toContain(token);
    }
    expect(stylesheet).toContain('--font-display: "Lora", serif');
    expect(stylesheet).toContain(".nexus-paper-grid");
  });

  it("renders learner navigation as a continuous inverse rail with an amber active index", () => {
    expect(shells).toContain('bg-[var(--workspace-rail)]');
    expect(shells).toContain('border-[var(--workspace-rail-border)]');
    expect(shells).toContain('before:bg-[var(--nexus-amber)]');
    expect(shells).toContain('<AccountBlock tone="dark" />');
  });

  it("keeps Today focused on one next move instead of a duplicate dashboard title", () => {
    expect(dashboardLayout).toContain("Your next move");
    expect(dashboardLayout).toContain("Session focus");
    expect(dashboardLayout).not.toContain("Study Dashboard");
    expect(continueLearning).toContain("data.summary.dueReviewCount");
    expect(continueLearning).toContain("data.summary.hasActivePlanTask");
    expect(continueLearning).toContain("query.data.primaryAction?.route");
    expect(continueLearning).toContain("Evidence ledger");
  });

  it("builds the curriculum atlas from shared lessons and authoritative progress", () => {
    expect(lessonGrid).toContain("CURRICULUM_LESSONS.map");
    expect(lessonGrid).toContain("trpc.learner.progress.useQuery");
    expect(lessonGrid).toContain("canonicalizeAppPath(lesson.route)");
    expect(lessonGrid).toContain('LR: { label: "Logical Reasoning"');
    expect(lessonGrid).toContain('RC: { label: "Reading Comprehension"');
    expect(lessonGrid).toContain('Logic: { label: "Formal Logic"');
    expect(lessonGrid).not.toContain("Logic Games");
  });
});
