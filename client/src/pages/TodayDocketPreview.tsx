/**
 * PREVIEW ONLY — layout direction "1b Docket" from the Verdict dashboard
 * mockup (_bundle-src.dc.html, #1b). Not linked from any nav; reachable only
 * at /today/docket for side-by-side comparison against the live /today
 * ("Ledger") dashboard and the /today/broadsheet preview.
 *
 * Real data, real auth gating, its own left-rail nav chrome — see the header
 * comment in TodayBroadsheetPreview.tsx for the shared data-fidelity notes
 * (this file's docket cards resolve their own copy from the same
 * `continueLearning` payload).
 */
import type { inferRouterOutputs } from "@trpc/server";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "wouter";
import type { AppRouter } from "../../../server/routers";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LessonDot,
  UNIT_DEFS,
  unitLessons,
  unitStatus,
  type LessonStatus,
  type ProgressByLesson,
} from "@/components/ledger/CurriculumMap";
import { LedgerEmptyState, LedgerLabel } from "@/components/ledger/LedgerPrimitives";
import { TodayBaselineNotice, TodayGreeting, TodayStatTiles } from "@/components/ledger/TodayOverview";
import { LEARNER_NAV_ROUTES } from "@/lib/routes";
import { trpc } from "@/lib/trpc";

type TodayData = inferRouterOutputs<AppRouter>["learner"]["continueLearning"];
type PrimaryAction = NonNullable<TodayData["primaryAction"]>;

const PREVIEW_PATH = "/today/docket";
const MOBILE_NAV_ROUTES = LEARNER_NAV_ROUTES.filter((route) => route.id !== "plan").slice(0, 5);

function formatShortDate(value: Date | string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function stepVerb(kind: PrimaryAction["kind"] | undefined) {
  switch (kind) {
    case "due_review": return "Review";
    case "start": return "Start";
    case "lesson_review": return "Revisit";
    case "plan": return "Plan task";
    case "resume": return "Continue";
    default: return "Continue";
  }
}

function useDocketData() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const continueLearning = trpc.learner.continueLearning.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const progress = trpc.learner.progress.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  return { isAuthenticated, authLoading, continueLearning, progress };
}

function DocketRail() {
  return (
    <aside className="hidden lg:flex lg:min-h-screen lg:w-[220px] lg:shrink-0 lg:flex-col lg:bg-[var(--ledger-ink)] lg:py-7 lg:text-white">
      <Link href={PREVIEW_PATH} className="px-6 font-display text-[1.15rem] font-semibold text-white">
        LSAT&nbsp;Nexus
      </Link>
      <nav className="mt-8 flex flex-col text-[0.82rem] font-semibold" aria-label="Docket preview navigation">
        {LEARNER_NAV_ROUTES.map((route) => {
          const active = route.id === "today";
          return (
            <Link
              key={route.id}
              href={active ? PREVIEW_PATH : route.path}
              className={
                active
                  ? "bg-[var(--ledger-accent)] px-6 py-3 text-white"
                  : "px-6 py-3 text-[#BCC2D4] transition-colors hover:text-white"
              }
            >
              {route.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-6 text-[0.7rem] leading-5 text-[var(--ledger-faint)]">
        Taught by
        <br />
        Devaney M. Page, JD
      </div>
    </aside>
  );
}

function DocketMobileHeader({ data }: { data?: TodayData }) {
  const targetTestDate = data?.workspaceContext.targetTestDate
    ? formatShortDate(data.workspaceContext.targetTestDate)
    : null;
  return (
    <div className="flex items-center justify-between bg-[var(--ledger-ink)] px-5 py-4 text-white lg:hidden">
      <Link href={PREVIEW_PATH} className="font-display text-[1.05rem] font-semibold text-white">
        LSAT&nbsp;Nexus
      </Link>
      <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[#BCC2D4]">
        {targetTestDate ? `Test ${targetTestDate}` : "Docket preview"}
      </span>
    </div>
  );
}

function DocketMobileNav() {
  return (
    <nav
      className="ledger-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-ink)] lg:hidden"
      aria-label="Docket preview mobile navigation"
    >
      {MOBILE_NAV_ROUTES.map((route) => {
        const active = route.id === "today";
        return (
          <Link
            key={route.id}
            href={active ? PREVIEW_PATH : route.path}
            className={`flex min-h-14 flex-col items-center justify-center px-1 text-center text-[0.62rem] font-bold uppercase tracking-[0.03em] ${
              active ? "bg-[var(--ledger-accent)] text-white" : "text-[#BCC2D4]"
            }`}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}

function DocketSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading today's docket">
      <div className="h-20 animate-pulse border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]" />
        ))}
      </div>
      <div className="h-56 animate-pulse border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]" />
    </div>
  );
}

function ContinueCard({ data }: { data: TodayData }) {
  const action = data.primaryAction;
  const verb = stepVerb(action?.kind);
  const isActive = action?.kind === "resume";

  let detail: string | null = null;
  if (action && "lesson" in action && action.progress) {
    if (action.kind === "start") {
      detail = `${action.lesson.durationMinutes} min · not started`;
    } else {
      const remaining = Math.max(1, Math.round(action.lesson.durationMinutes * (1 - action.progress.percentComplete / 100)));
      detail = `${remaining} min remaining`;
    }
  } else if (action && "dueCount" in action) {
    detail = `${action.dueCount} due question${action.dueCount === 1 ? "" : "s"}`;
  } else if (action && "task" in action) {
    detail = `${action.task.itemType} task from your active plan`;
  }

  const className = `relative block border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-5 ${
    action?.route ? "transition-colors hover:bg-[var(--ledger-accent-tint)]" : ""
  }`;
  const inner = (
    <>
      {isActive ? <div className="absolute inset-y-0 left-0 w-1 bg-[var(--ledger-accent)]" aria-hidden="true" /> : null}
      {isActive ? (
        <div
          className="absolute right-3 top-3 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--ledger-accent)] text-[10px] font-bold text-white"
          aria-hidden="true"
        >
          ✓
        </div>
      ) : null}
      <LedgerLabel className={isActive ? "text-[var(--ledger-accent)]" : undefined}>1 · {verb}</LedgerLabel>
      <div className="mt-1.5 font-display text-[1.05rem] font-semibold leading-snug">
        {action?.title ?? "Choose your next study action"}
      </div>
      {detail ? <div className="mt-1 text-xs text-muted-foreground">{detail}</div> : null}
    </>
  );
  return action?.route ? (
    <Link href={action.route} className={className}>{inner}</Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function DrillCard({ data }: { data: TodayData }) {
  const attempts = data.recentPractice.attempts;
  const detail =
    attempts > 0
      ? `${data.recentPractice.correctCount} of ${attempts} correct recently`
      : "No practice recorded yet";
  return (
    <Link
      href="/practice"
      className="block border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-5 transition-colors hover:bg-[var(--ledger-accent-tint)]"
    >
      <LedgerLabel>2 · Drill</LedgerLabel>
      <div className="mt-1.5 font-display text-[1.05rem] font-semibold leading-snug">Practice questions</div>
      <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
    </Link>
  );
}

function ReviewCard({ data }: { data: TodayData }) {
  const due = data.dueReview;
  const className = `block border-2 p-5 ${
    due
      ? "border-[var(--ledger-rule)] bg-[var(--ledger-surface)] transition-colors hover:bg-[var(--ledger-accent-tint)]"
      : "border-dashed border-[var(--ledger-rule)] bg-[var(--ledger-paper)]"
  }`;
  const inner = (
    <>
      <LedgerLabel className={due ? "text-[var(--ledger-negative)]" : undefined}>3 · Review</LedgerLabel>
      <div className="mt-1.5 font-display text-[1.05rem] font-semibold leading-snug">
        {due ? `${due.count} due from prior mistakes` : "No review due"}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {due ? due.reason : "Nothing scheduled from spaced repetition yet."}
      </div>
    </>
  );
  return due ? (
    <Link href="/review" className={className}>{inner}</Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function DocketCurriculumGrid({
  currentLessonId,
  progressMap,
}: {
  currentLessonId: string | null;
  progressMap: ProgressByLesson;
}) {
  const units = UNIT_DEFS.map((unit) => ({ unit, lessons: unitLessons(unit) })).filter((u) => u.lessons.length > 0);
  return (
    <div className="hidden border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-6 lg:block">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-semibold text-[var(--ledger-ink)]">Curriculum</h2>
        <div className="flex gap-4 text-[0.68rem] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--ledger-ink)]" />Complete</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border-2 border-[var(--ledger-accent)] box-border" />Current</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-[var(--ledger-faint)] box-border" />Upcoming</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-4 border-t-2 border-[var(--ledger-rule)]">
        {units.map(({ unit, lessons }, index) => {
          const status = unitStatus(lessons, progressMap);
          const displayStatus = status === "Complete" ? "Complete" : status === "In progress" ? "In progress" : "Upcoming";
          const completeCount = lessons.filter((l) => progressMap.get(l.id)?.status === "completed").length;
          const isCurrent = status === "In progress";
          return (
            <div
              key={unit.id}
              className={`relative p-5 ${index < units.length - 1 ? "border-r-2 border-[var(--ledger-rule)]" : ""} ${
                isCurrent ? "bg-[var(--ledger-accent-tint)]" : ""
              }`}
            >
              {isCurrent ? <div className="absolute inset-x-0 top-0 h-[3px] bg-[var(--ledger-accent)]" aria-hidden="true" /> : null}
              <LedgerLabel style={{ color: unit.color }}>{unit.label}</LedgerLabel>
              <div className="mt-0.5 text-[0.68rem] text-muted-foreground">
                {displayStatus} · {completeCount} of {lessons.length}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {lessons.map((lesson) => {
                  const item = progressMap.get(lesson.id);
                  const isLessonCurrent = lesson.id === currentLessonId;
                  return (
                    <div key={lesson.id} className="flex items-center gap-2">
                      <LessonDot status={item?.status ?? "not_started"} current={isLessonCurrent} />
                      <span
                        className={`text-xs ${isLessonCurrent ? "font-bold" : ""}`}
                        style={
                          isLessonCurrent
                            ? { color: "var(--ledger-accent)" }
                            : item?.status === "completed"
                              ? undefined
                              : { color: "var(--ledger-faint)" }
                        }
                      >
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
    </div>
  );
}

function DocketBody({ data, progressList }: { data: TodayData; progressList: inferRouterOutputs<AppRouter>["learner"]["progress"] }) {
  const progressMap: ProgressByLesson = new Map(
    progressList.map((item) => [item.lessonId, { status: item.status as LessonStatus, percentComplete: item.percentComplete }]),
  );
  const currentLessonId = data.primaryAction && "lesson" in data.primaryAction ? data.primaryAction.lesson.id : null;
  const targetTestDate = data.workspaceContext.targetTestDate ? formatShortDate(data.workspaceContext.targetTestDate) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 border-b-2 border-[var(--ledger-ink)] pb-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <LedgerLabel>Today's docket</LedgerLabel>
          <div className="mt-1">
            <TodayGreeting data={data} />
          </div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground tabular-nums">
          {targetTestDate ? `Test ${targetTestDate}` : "Target test not set"}
        </div>
      </div>

      {data.state === "empty" ? <TodayBaselineNotice /> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ContinueCard data={data} />
        <DrillCard data={data} />
        <ReviewCard data={data} />
      </div>

      <DocketCurriculumGrid currentLessonId={currentLessonId} progressMap={progressMap} />

      <TodayStatTiles data={data} />
    </div>
  );
}

function DocketContent({
  isAuthenticated,
  authLoading,
  continueLearning,
  progress,
}: ReturnType<typeof useDocketData>) {
  if (authLoading || (isAuthenticated && continueLearning.isLoading)) {
    return <DocketSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <LedgerEmptyState
        title="Sign in to see today's docket"
        description="Lesson progress, due review, and practice evidence are private to your learner profile."
        action={
          <button
            type="button"
            onClick={() => window.location.assign(getLoginUrl())}
            className="inline-flex min-h-11 items-center gap-2 bg-[var(--ledger-ink)] px-5 text-sm font-bold text-white"
          >
            Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        }
      />
    );
  }

  if (continueLearning.isError || !continueLearning.data) {
    return (
      <div className="border-2 border-[var(--ledger-negative)] bg-[var(--ledger-negative-tint)] p-6" role="alert">
        <BookOpen className="h-6 w-6 text-[var(--ledger-negative)]" aria-hidden="true" />
        <h2 className="mt-3 font-display text-xl font-semibold">Your docket could not be loaded</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your data is safe. Retry the request before relying on today's docket.
        </p>
        <button
          type="button"
          className="mt-4 min-h-11 border-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)] px-4 text-sm font-semibold"
          onClick={() => void continueLearning.refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  return <DocketBody data={continueLearning.data} progressList={progress.data ?? []} />;
}

export default function TodayDocketPreview() {
  const docketData = useDocketData();

  return (
    <div className="learner-ledger min-h-screen bg-[var(--ledger-paper)] text-[var(--ledger-ink)] lg:grid lg:grid-cols-[220px_1fr]">
      <DocketRail />
      <div className="min-w-0">
        <DocketMobileHeader data={docketData.continueLearning.data} />
        <main id="main-content" className="ledger-mobile-content mx-auto max-w-[1100px] px-5 py-6 md:px-8 md:py-8 lg:pb-10">
          <DocketContent {...docketData} />
        </main>
        <DocketMobileNav />
      </div>
    </div>
  );
}
