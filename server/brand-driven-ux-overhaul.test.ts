import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

const stylesheet = read("client/src/index.css");
const shells = read("client/src/components/ApplicationShells.tsx");
const dashboard = read("client/src/components/ContinueLearningDashboard.tsx");
const lessonGrid = read("client/src/components/LessonGrid.tsx");
const orientation = read("client/src/components/ContextualOrientationHeader.tsx");

describe("LSAT Nexus ledger workspace UX contract", () => {
  it("defines paper, navy ink, cobalt action, and explicit evidence states", () => {
    for (const token of [
      "--ledger-paper:",
      "--ledger-ink:",
      "--ledger-rule:",
      "--ledger-accent:",
      "--ledger-positive:",
      "--ledger-negative:",
      "--ledger-provisional:",
    ]) expect(stylesheet).toContain(token);
    expect(stylesheet).toContain('--font-display: "Spectral", serif');
    expect(stylesheet).toContain('--font-sans: "Archivo", sans-serif');
  });

  it("renders authenticated navigation as a desktop ledger header and mobile bottom bar", () => {
    expect(shells).toContain("ledger-desktop-nav");
    expect(shells).toContain("ledger-mobile-nav");
    expect(shells).toContain('aria-label="Learner navigation"');
    expect(shells).toContain('aria-label="Learner mobile navigation"');
    expect(shells).toContain("targetTestDate");
    expect(shells).not.toContain('md:grid-cols-[15rem_minmax(0,1fr)]');
  });

  it("keeps orientation compact and Today grounded in one server-selected next move", () => {
    expect(orientation).toContain("ledger-rule-strong");
    expect(orientation).not.toContain("Why this matters:");
    expect(dashboard).toContain("data.summary.dueReviewCount");
    expect(dashboard).toContain("data.summary.hasActivePlanTask");
    expect(dashboard).toContain("data.primaryAction?.route");
  });

  it("builds the sequenced curriculum ledger from shared lessons and authoritative progress", () => {
    expect(lessonGrid).toContain("CURRICULUM_LESSONS");
    expect(lessonGrid).toContain("trpc.learner.progress.useQuery");
    expect(lessonGrid).toContain("canonicalizeAppPath(lesson.route)");
    // Verdict unit color-coding (Conditional logic/Assumptions/Flaws/Reading
    // comp) replaced the earlier LR/RC/Logic section labels as the ledger's
    // grouping scheme, shared with the curriculum map on Today.
    expect(lessonGrid).toContain("UNIT_DEFS");
    expect(lessonGrid).toContain("unitLessons");
    expect(lessonGrid).not.toContain("Logic Games");
  });
});
