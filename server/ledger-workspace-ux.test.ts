import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

const html = read("client/index.html");
const stylesheet = read("client/src/index.css");
const shells = read("client/src/components/ApplicationShells.tsx");
const dashboard = read("client/src/components/ContinueLearningDashboard.tsx");
const lessonGrid = read("client/src/components/LessonGrid.tsx");

describe("Ledger workspace UX contract", () => {
  it("loads the approved ledger type pairing and semantic token family", () => {
    expect(html).toContain("family=Archivo");
    expect(html).toContain("family=Spectral");
    for (const token of [
      "--ledger-paper:",
      "--ledger-ink:",
      "--ledger-rule:",
      "--ledger-accent:",
      "--ledger-accent-tint:",
      "--ledger-positive:",
      "--ledger-negative:",
      "--ledger-provisional:",
      "--ledger-track:",
      "--ledger-faint:",
    ]) expect(stylesheet).toContain(token);
  });

  it("provides shared ledger primitives instead of page-specific inline replicas", () => {
    const path = "client/src/components/ledger/LedgerPrimitives.tsx";
    expect(existsSync(resolve(root, path))).toBe(true);
    const primitives = read(path);
    for (const component of [
      "LedgerFrame",
      "LedgerHeader",
      "LedgerSection",
      "LedgerRule",
      "LedgerLabel",
      "LedgerProgress",
      "EvidenceStatus",
      "LedgerEmptyState",
    ]) expect(primitives).toContain(`function ${component}`);
  });

  it("uses horizontal desktop navigation and a five-item mobile ledger bar", () => {
    expect(shells).toContain('aria-label="Learner navigation"');
    expect(shells).toContain('aria-label="Learner mobile navigation"');
    expect(shells).toContain("ledger-desktop-nav");
    expect(shells).toContain("ledger-mobile-nav");
    expect(shells).toContain('ROUTE_BY_ID.resources.path');
    expect(shells).not.toContain('md:grid-cols-[15rem_minmax(0,1fr)]');
  });

  it("preserves authoritative Today contracts and rejects prototype learner constants", () => {
    expect(dashboard).toContain("data.summary.dueReviewCount");
    expect(dashboard).toContain("data.summary.hasActivePlanTask");
    expect(dashboard).toContain("data.primaryAction?.route");
    for (const fictional of ["Week 6 of 14", "4 of 12 lessons", "Test Nov 8", "83% · 52 q"]) {
      expect(`${dashboard}\n${lessonGrid}\n${shells}`).not.toContain(fictional);
    }
  });

  it("keeps the seven canonical studies and excludes removed exam content", () => {
    expect(lessonGrid).toContain("CURRICULUM_LESSONS");
    expect(lessonGrid).toContain("trpc.learner.progress.useQuery");
    expect(lessonGrid).not.toContain("Logic Games");
  });
});
