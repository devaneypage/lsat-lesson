import { useMemo } from "react";
import { Check, Circle, Clock3, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import { LedgerEmptyState, LedgerLabel, LedgerProgress, LedgerSection } from "@/components/ledger/LedgerPrimitives";
import { trpc } from "@/lib/trpc";
import { canonicalizeAppPath } from "@/lib/routes";
import { CURRICULUM_LESSONS, getLessonById, type CurriculumLesson, type LessonProgressStatus } from "@shared/learnerDomain";

const SECTION_LABELS: Record<CurriculumLesson["section"], string> = {
  LR: "Logical Reasoning",
  RC: "Reading Comprehension",
  Logic: "Formal Logic",
  Strategy: "Strategy",
};

const SECTION_COLORS: Record<CurriculumLesson["section"], string> = {
  LR: "#284FA8",
  RC: "#2F6B4F",
  Logic: "#6A4E94",
  Strategy: "#8A5B19",
};

type ProgressRecord = {
  lessonId: string;
  status: LessonProgressStatus;
  percentComplete: number;
};

function lessonStatus(lesson: CurriculumLesson, progress: Map<string, ProgressRecord>, currentLessonId: string) {
  const record = progress.get(lesson.id);
  const unmetPrerequisites = lesson.prerequisites.filter((id) => progress.get(id)?.status !== "completed");
  if (record?.status === "completed") return { kind: "completed" as const, label: "Completed", unmetPrerequisites };
  if (lesson.id === currentLessonId) return { kind: "current" as const, label: record?.status === "in_progress" ? "In progress" : "Recommended next", unmetPrerequisites };
  if (unmetPrerequisites.length > 0) return { kind: "prerequisite" as const, label: "Prerequisite pending", unmetPrerequisites };
  return { kind: "not_started" as const, label: "Not started", unmetPrerequisites };
}

function StatusMark({ kind }: { kind: "completed" | "current" | "prerequisite" | "not_started" }) {
  if (kind === "completed") return <span className="flex h-5 w-5 items-center justify-center bg-[var(--ledger-ink)] text-white"><Check className="h-3 w-3" aria-hidden="true" /></span>;
  if (kind === "current") return <span className="flex h-5 w-5 items-center justify-center border-[3px] border-[var(--ledger-accent)] bg-[var(--ledger-accent-tint)]"><span className="h-1.5 w-1.5 bg-[var(--ledger-accent)]" /></span>;
  if (kind === "prerequisite") return <span className="flex h-5 w-5 items-center justify-center border-2 border-[var(--ledger-rule)] text-[var(--ledger-faint)]"><LockKeyhole className="h-3 w-3" aria-hidden="true" /></span>;
  return <Circle className="h-5 w-5 text-[var(--ledger-faint)]" aria-hidden="true" />;
}

export default function LessonGrid() {
  const progressQuery = trpc.learner.progress.useQuery(undefined, { retry: false });
  const progressByLesson = useMemo(
    () => new Map((progressQuery.data ?? []).map((item) => [item.lessonId, item as ProgressRecord])),
    [progressQuery.data],
  );
  const currentLesson = useMemo(() => {
    const inProgress = CURRICULUM_LESSONS.find((lesson) => progressByLesson.get(lesson.id)?.status === "in_progress");
    if (inProgress) return inProgress;
    return CURRICULUM_LESSONS.find((lesson) => progressByLesson.get(lesson.id)?.status !== "completed") ?? CURRICULUM_LESSONS[0];
  }, [progressByLesson]);
  const currentProgress = currentLesson ? progressByLesson.get(currentLesson.id) : undefined;
  const completedCount = CURRICULUM_LESSONS.filter((lesson) => progressByLesson.get(lesson.id)?.status === "completed").length;
  const groups = useMemo(() => {
    const result = new Map<CurriculumLesson["section"], CurriculumLesson[]>();
    for (const lesson of CURRICULUM_LESSONS) result.set(lesson.section, [...(result.get(lesson.section) ?? []), lesson]);
    return Array.from(result.entries());
  }, []);

  if (progressQuery.isLoading) {
    return <div className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-6 text-sm text-muted-foreground">Loading your curriculum record…</div>;
  }
  if (progressQuery.error || !currentLesson) {
    return <LedgerEmptyState title="Curriculum record unavailable" description="Your lesson sequence is still available, but private progress could not be loaded. Refresh before relying on completion status." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start">
      <LedgerSection
        title="Seven connected studies"
        eyebrow="Curriculum ledger"
        action={<span className="text-xs font-semibold tabular-nums text-muted-foreground">{completedCount} of {CURRICULUM_LESSONS.length} complete</span>}
        className="order-2 lg:order-1"
      >
        <div className="divide-y-2 divide-[var(--ledger-rule)]">
          {groups.map(([section, lessons]) => (
            <section key={section} aria-labelledby={`curriculum-${section}`}>
              <div className="flex items-center justify-between gap-4 bg-[var(--ledger-paper)] px-5 py-3 md:px-6">
                <p className="font-mono text-[0.67rem] font-semibold uppercase tracking-[0.12em]" style={{ color: SECTION_COLORS[section] }}>{SECTION_LABELS[section]}</p>
                <span className="text-xs text-muted-foreground">{lessons.filter((lesson) => progressByLesson.get(lesson.id)?.status === "completed").length} / {lessons.length}</span>
              </div>
              <div id={`curriculum-${section}`} className="divide-y-2 divide-[var(--ledger-rule)]">
                {lessons.map((lesson) => {
                  const status = lessonStatus(lesson, progressByLesson, currentLesson.id);
                  const record = progressByLesson.get(lesson.id);
                  const prerequisiteNames = status.unmetPrerequisites.map((id) => getLessonById(id)?.title).filter(Boolean);
                  return (
                    <Link
                      key={lesson.id}
                      href={canonicalizeAppPath(lesson.route)}
                      className={`grid min-h-16 grid-cols-[auto_minmax(0,1fr)] gap-3 px-5 py-4 transition-colors duration-150 hover:bg-[var(--ledger-accent-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:px-6 ${status.kind === "current" ? "bg-[var(--ledger-accent-tint)] shadow-[inset_4px_0_0_var(--ledger-accent)]" : ""}`}
                    >
                      <StatusMark kind={status.kind} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-[0.68rem] font-bold tabular-nums text-muted-foreground">{String(lesson.sequence).padStart(2, "0")}</span>
                          <span className={`text-sm ${status.kind === "current" ? "font-bold text-[var(--ledger-accent)]" : "font-semibold text-[var(--ledger-ink)]"}`}>{lesson.title}</span>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{status.label}{prerequisiteNames.length ? ` · after ${prerequisiteNames.join(", ")}` : ""}</p>
                      </div>
                      <div className="col-start-2 flex items-center gap-3 text-xs text-muted-foreground md:col-auto">
                        <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{lesson.durationMinutes} min</span>
                        {record?.status === "in_progress" ? <span className="font-semibold tabular-nums text-[var(--ledger-ink)]">{record.percentComplete}%</span> : null}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </LedgerSection>

      <aside className="order-1 border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] shadow-[inset_4px_0_0_var(--ledger-accent)] lg:order-2 lg:sticky lg:top-24" aria-labelledby="current-lesson-title">
        <div className="p-5 md:p-6">
          <LedgerLabel className="text-[var(--ledger-accent)]">Current lesson</LedgerLabel>
          <h2 id="current-lesson-title" className="mt-2 font-display text-2xl font-semibold leading-tight">{currentLesson.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{currentLesson.description}</p>
          <LedgerProgress className="mt-5" value={currentProgress?.percentComplete ?? 0} label={currentProgress?.status === "in_progress" ? "Recorded progress" : "Ready to begin"} />
        </div>
        <div className="border-t-2 border-[var(--ledger-rule)] p-5 md:p-6">
          <LedgerLabel>Prerequisites</LedgerLabel>
          {currentLesson.prerequisites.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {currentLesson.prerequisites.map((id) => {
                const prerequisite = getLessonById(id);
                const completed = progressByLesson.get(id)?.status === "completed";
                return <li key={id} className="flex items-center gap-2"><span aria-hidden="true">{completed ? "✓" : "○"}</span><span>{prerequisite?.title ?? id}</span><span className="sr-only">{completed ? "completed" : "not completed"}</span></li>;
              })}
            </ul>
          ) : <p className="mt-2 text-sm text-muted-foreground">No prerequisite lesson.</p>}
          <Link href={canonicalizeAppPath(currentLesson.route)} className="mt-5 inline-flex min-h-11 w-full items-center justify-center bg-[var(--ledger-ink)] px-4 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {currentProgress?.status === "in_progress" ? "Resume lesson" : "Open lesson"} →
          </Link>
        </div>
      </aside>
    </div>
  );
}
