import type { ComponentType } from "react";
import { useMemo } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookMarked,
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Clock3,
  Layers,
  Target,
  Zap,
} from "lucide-react";
import { Link } from "wouter";
import {
  CURRICULUM_LESSONS,
  getLessonById,
  type CurriculumLesson,
} from "@shared/learnerDomain";
import { canonicalizeAppPath } from "@/lib/routes";
import { trpc } from "@/lib/trpc";

const LESSON_ICONS: Record<string, ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  "necessary-assumptions": BookOpen,
  "sufficient-assumptions": Layers,
  "flaw-in-reasoning": AlertCircle,
  "common-flaws": Zap,
  "strengthen-weaken": Target,
  "reading-comprehension": BookMarked,
  "formal-logic": Brain,
};

const DOMAIN_CONFIG: Record<CurriculumLesson["section"], { label: string; accent: string }> = {
  LR: { label: "Logical Reasoning", accent: "var(--nexus-amber)" },
  RC: { label: "Reading Comprehension", accent: "var(--nexus-blue)" },
  Logic: { label: "Formal Logic", accent: "var(--nexus-purple)" },
  Strategy: { label: "Test Strategy", accent: "var(--nexus-forest)" },
};

const GRID_CLASS_BY_SEQUENCE: Record<number, string> = {
  1: "lg:col-span-7",
  2: "lg:col-span-5",
  3: "lg:col-span-4",
  4: "lg:col-span-4",
  5: "lg:col-span-4",
  6: "lg:col-span-6",
  7: "lg:col-span-6",
};

function statusPresentation(status: "not_started" | "in_progress" | "completed") {
  if (status === "completed") return { label: "Completed", action: "Review lesson", Icon: CheckCircle2 };
  if (status === "in_progress") return { label: "In progress", action: "Continue lesson", Icon: Clock3 };
  return { label: "Not started", action: "Start lesson", Icon: Circle };
}

export default function LessonGrid() {
  const progressQuery = trpc.learner.progress.useQuery(undefined, { retry: false });
  const progressByLesson = useMemo(
    () => new Map((progressQuery.data ?? []).map((item) => [item.lessonId, item])),
    [progressQuery.data],
  );

  return (
    <section className="nexus-paper-panel p-4 md:p-6" aria-label="Curriculum atlas">
      <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="nexus-index-label text-[var(--nexus-amber)]">Curriculum atlas</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Seven connected studies</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-right">
          Sequence indicates the recommended route; progress comes from your private learner record.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {CURRICULUM_LESSONS.map((lesson) => {
          const progress = progressByLesson.get(lesson.id);
          const status = progress?.status ?? "not_started";
          const percent = progress?.percentComplete ?? 0;
          const { label: statusLabel, action, Icon: StatusIcon } = statusPresentation(status);
          const domain = DOMAIN_CONFIG[lesson.section];
          const LessonIcon = LESSON_ICONS[lesson.id] ?? BookOpen;
          const prerequisite = lesson.prerequisites.map(getLessonById).find(Boolean);
          const isFirst = lesson.sequence === 1;

          return (
            <Link
              key={lesson.id}
              href={canonicalizeAppPath(lesson.route)}
              className={`group relative flex min-h-64 flex-col border border-border border-t-2 bg-card p-5 text-card-foreground shadow-[0_1px_2px_var(--paper-shadow)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-6 ${GRID_CLASS_BY_SEQUENCE[lesson.sequence] ?? "lg:col-span-4"}`}
              style={{ borderTopColor: domain.accent }}
            >
              <div className="flex items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background" style={{ color: domain.accent }}>
                    <LessonIcon className="size-5" aria-hidden={true} />
                  </span>
                  <div>
                    <p className="nexus-index-label" style={{ color: domain.accent }}>{domain.label}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold leading-tight">{lesson.title}</h3>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-muted-foreground">{String(lesson.sequence).padStart(2, "0")}</span>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">{lesson.description}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />{lesson.durationMinutes} min</span>
                <span className="inline-flex items-center gap-1.5"><StatusIcon className="size-3.5" aria-hidden="true" />{statusLabel}</span>
                {prerequisite ? <span>After {prerequisite.title}</span> : <span>No prerequisite</span>}
                {isFirst ? <span className="nexus-index-label border border-[color:var(--nexus-amber)]/50 bg-[color:var(--nexus-amber)]/10 px-2 py-1 text-[var(--nexus-amber)]">Recommended start</span> : null}
              </div>

              {status !== "not_started" ? (
                <div className="mt-5" aria-label={`${percent}% complete`}>
                  <div className="mb-2 flex justify-between nexus-index-label text-muted-foreground"><span>Progress</span><span>{percent}%</span></div>
                  <div className="h-1.5 bg-muted"><div className="h-full bg-primary" style={{ width: `${percent}%` }} /></div>
                </div>
              ) : null}

              <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
                <span className="text-sm font-bold text-foreground group-hover:text-primary">{action}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
              </div>
            </Link>
          );
        })}
      </div>

      {progressQuery.isError ? (
        <p className="mt-5 border-l-2 border-[var(--nexus-amber)] bg-muted/60 px-4 py-3 text-sm text-muted-foreground" role="status">
          Curriculum is available, but progress status could not be refreshed. Lesson access is unaffected.
        </p>
      ) : null}
    </section>
  );
}
