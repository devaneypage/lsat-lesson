import { Link } from "wouter";
import { CURRICULUM_LESSONS, type CurriculumLesson } from "@shared/learnerDomain";
import { trpc } from "@/lib/trpc";
import { LedgerLabel } from "./LedgerPrimitives";

export type LessonStatus = "not_started" | "in_progress" | "completed";
export type ProgressByLesson = Map<string, { status: LessonStatus; percentComplete: number }>;

/**
 * The mockup's four named units (Conditional logic / Assumptions / Flaws /
 * Reading comp) don't line up one-to-one with the curriculum's LR/RC/Logic
 * sections, so lessons are grouped by their closest primary skill instead.
 *
 * Exported alongside `unitLessons`/`unitStatus` so other Today-screen layout
 * variants (the docket and broadsheet previews) can reuse this exact grouping
 * without re-deriving it or duplicating a second copy of this table.
 */
export const UNIT_DEFS = [
  { id: "conditional-logic", label: "Conditional logic", color: "var(--unit-conditional-logic)", lessonIds: ["formal-logic"] },
  { id: "assumptions", label: "Assumptions", color: "var(--unit-assumptions)", lessonIds: ["necessary-assumptions", "sufficient-assumptions", "strengthen-weaken"] },
  { id: "flaws", label: "Flaws", color: "var(--unit-flaws)", lessonIds: ["flaw-in-reasoning", "common-flaws"] },
  { id: "reading-comp", label: "Reading comp", color: "var(--unit-reading-comp)", lessonIds: ["reading-comprehension"] },
] as const;

export function unitLessons(unit: (typeof UNIT_DEFS)[number]): CurriculumLesson[] {
  return unit.lessonIds
    .map((id) => CURRICULUM_LESSONS.find((lesson) => lesson.id === id))
    .filter((lesson): lesson is CurriculumLesson => Boolean(lesson))
    .sort((a, b) => a.sequence - b.sequence);
}

export function unitStatus(lessons: CurriculumLesson[], progress: ProgressByLesson) {
  const completeCount = lessons.filter((l) => progress.get(l.id)?.status === "completed").length;
  if (completeCount === lessons.length && lessons.length > 0) return "Complete";
  if (lessons.some((l) => progress.get(l.id)?.status === "in_progress")) return "In progress";
  const anyPrereqMet = lessons.some((l) => l.prerequisites.every((p) => progress.get(p)?.status === "completed"));
  return anyPrereqMet ? "Upcoming" : "Locked";
}

export function LessonDot({ status, current }: { status: LessonStatus | "locked"; current: boolean }) {
  if (current) {
    return <div className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[var(--ledger-accent)] bg-[var(--ledger-accent-tint)]" />;
  }
  if (status === "completed") return <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ledger-ink)]" />;
  if (status === "in_progress") return <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--ledger-ink)]" />;
  return <div className="h-2.5 w-2.5 shrink-0 rounded-full border border-[var(--ledger-faint)]" />;
}

export function CurriculumMap({ currentLessonId }: { currentLessonId?: string | null }) {
  const { data } = trpc.learner.progress.useQuery();
  const progress: ProgressByLesson = new Map(
    (data ?? []).map((item) => [item.lessonId, { status: item.status as LessonStatus, percentComplete: item.percentComplete }]),
  );
  const units = UNIT_DEFS.map((unit) => ({ unit, lessons: unitLessons(unit) })).filter((u) => u.lessons.length > 0);

  return (
    <div className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-5 md:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-[var(--ledger-ink)] md:text-xl">Curriculum map</h2>
        <Link href="/learn" className="text-xs font-bold text-[var(--ledger-accent)] hover:underline">Open Learn →</Link>
      </div>

      {/* Desktop/tablet: full 2x2 unit grid with per-lesson dots. */}
      <div className="mt-4 hidden grid-cols-1 gap-4 sm:grid-cols-2 md:grid">
        {units.map(({ unit, lessons }) => {
          const status = unitStatus(lessons, progress);
          return (
            <div key={unit.id} className="relative border-2 border-[var(--ledger-rule)] p-3.5" style={status === "In progress" ? { borderColor: "var(--ledger-accent)" } : undefined}>
              {status === "In progress" ? <div className="absolute -left-[2px] -top-[2px] bottom-[-2px] w-1" style={{ background: "var(--ledger-accent)" }} /> : null}
              <div className="flex items-baseline justify-between gap-2">
                <LedgerLabel style={{ color: unit.color }}>{unit.label}</LedgerLabel>
                <span className="text-[0.68rem] text-muted-foreground">{status}</span>
              </div>
              <div className="mt-2.5 flex flex-col gap-2">
                {lessons.map((lesson) => {
                  const item = progress.get(lesson.id);
                  const isCurrent = lesson.id === currentLessonId;
                  return (
                    <div key={lesson.id} className="flex items-center gap-2">
                      <LessonDot status={item?.status ?? "not_started"} current={isCurrent} />
                      <span className={`text-xs ${isCurrent ? "font-bold" : ""}`} style={isCurrent ? { color: "var(--ledger-accent)" } : item?.status === "completed" ? undefined : { color: "var(--ledger-faint)" }}>
                        {lesson.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: condensed progress bars, one row per unit. */}
      <div className="mt-3 flex flex-col gap-2.5 md:hidden">
        {units.map(({ unit, lessons }) => {
          const completeCount = lessons.filter((l) => progress.get(l.id)?.status === "completed").length;
          const isCurrentUnit = lessons.some((l) => l.id === currentLessonId);
          return (
            <div key={unit.id}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: isCurrentUnit ? unit.color : "var(--ledger-ink)" }}>{unit.label}</span>
                <span className="text-[0.68rem] text-muted-foreground tabular-nums">{completeCount}/{lessons.length}</span>
              </div>
              <div className="mt-1 h-1 bg-[var(--ledger-track)]">
                <div className="h-full" style={{ width: `${lessons.length ? (completeCount / lessons.length) * 100 : 0}%`, background: unit.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t-2 border-[var(--ledger-rule)] pt-3 text-[0.68rem] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--ledger-ink)]" />Complete</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border-2 border-[var(--ledger-accent)] box-border" />Current</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-[var(--ledger-faint)] box-border" />Upcoming</span>
      </div>
    </div>
  );
}
