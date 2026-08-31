/**
 * PREVIEW ONLY — layout direction "1c Broadsheet" from the Verdict dashboard
 * mockup (_bundle-src.dc.html, #1c). Not linked from any nav; reachable only
 * at /today/broadsheet for side-by-side comparison against the live /today
 * ("Ledger") dashboard and the /today/docket preview.
 *
 * Content/data notes (also apply to TodayDocketPreview.tsx):
 *  - The mockup's "Week 6 of 14" and "90 minutes planned" figures aren't
 *    backed by real data — there's no authoritative study-plan start date or
 *    per-session minute target in the schema (see workspaceContext.studyWeek,
 *    always null). Both are dropped; the real target test date and the real
 *    weekly-minutes-derived sentence from <TodayGreeting> stand in instead.
 *  - The mockup's 4-stat row (147 drilled / 71% / studied-this-month / score
 *    est.) is replaced with the existing <TodayStatTiles>, which is the real,
 *    honest, already-built version of this same idea — it already keeps
 *    "Score estimate" at "—" rather than inventing one, per the project's
 *    evidence-honesty rule, and reusing it avoids re-deriving that logic.
 *  - The mockup's fictional lesson names ("Statements & contrapositives",
 *    "Passage mapping", etc.) don't exist in the real 7-lesson curriculum;
 *    the real CURRICULUM_LESSONS titles are used instead, grouped into the
 *    same 4 named units via the shared unitLessons/unitStatus helpers
 *    exported from CurriculumMap.tsx (the same grouping /today already uses).
 */
import type { inferRouterOutputs } from "@trpc/server";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "wouter";
import type { AppRouter } from "../../../server/routers";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { UNIT_DEFS, unitLessons, type LessonStatus, type ProgressByLesson } from "@/components/ledger/CurriculumMap";
import { LedgerEmptyState, LedgerLabel } from "@/components/ledger/LedgerPrimitives";
import { actionEyebrow } from "@/components/ledger/TodayLedger";
import { TodayBaselineNotice, TodayGreeting, TodayStatTiles } from "@/components/ledger/TodayOverview";
import { LEARNER_NAV_ROUTES } from "@/lib/routes";
import { trpc } from "@/lib/trpc";

type TodayData = inferRouterOutputs<AppRouter>["learner"]["continueLearning"];

const PREVIEW_PATH = "/today/broadsheet";
const LEFT_NAV_IDS = new Set(["today", "learn", "practice", "review"]);
const RIGHT_NAV_IDS = new Set(["progress", "plan", "resources"]);
const MOBILE_NAV_ROUTES = LEARNER_NAV_ROUTES.filter((route) => route.id !== "plan").slice(0, 5);

function formatShortDate(value: Date | string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function useBroadsheetData() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const continueLearning = trpc.learner.continueLearning.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const progress = trpc.learner.progress.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  return { isAuthenticated, authLoading, continueLearning, progress, user };
}

function BroadsheetNav({ user }: { user?: { name?: string | null; email?: string | null } | null }) {
  const leftRoutes = LEARNER_NAV_ROUTES.filter((route) => LEFT_NAV_IDS.has(route.id));
  const rightRoutes = LEARNER_NAV_ROUTES.filter((route) => RIGHT_NAV_IDS.has(route.id));
  const initials = (user?.name || user?.email || "L").charAt(0).toUpperCase();
  return (
    <header className="border-b-2 border-[var(--ledger-rule)] bg-[var(--ledger-paper)]">
      <div className="mx-auto flex max-w-[1360px] items-center justify-center gap-6 px-6 py-4 md:justify-between md:px-12">
        <nav className="hidden gap-6 text-[0.8rem] font-semibold text-muted-foreground md:flex" aria-label="Broadsheet preview navigation, primary">
          {leftRoutes.map((route) => {
            const active = route.id === "today";
            return (
              <Link key={route.id} href={active ? PREVIEW_PATH : route.path} className={active ? "text-[var(--ledger-ink)]" : "hover:text-[var(--ledger-ink)]"}>
                {route.label}
              </Link>
            );
          })}
        </nav>
        <Link href={PREVIEW_PATH} className="font-display text-lg font-semibold text-[var(--ledger-ink)] md:text-xl">
          LSAT&nbsp;Nexus
        </Link>
        <nav className="hidden items-center gap-6 text-[0.8rem] font-semibold text-muted-foreground md:flex" aria-label="Broadsheet preview navigation, secondary">
          {rightRoutes.map((route) => (
            <Link key={route.id} href={route.path} className="hover:text-[var(--ledger-ink)]">
              {route.label}
            </Link>
          ))}
          <div className="flex h-7 w-7 items-center justify-center bg-[var(--ledger-ink)] text-[11px] font-bold text-white">{initials}</div>
        </nav>
      </div>
    </header>
  );
}

function BroadsheetMobileNav() {
  return (
    <nav
      className="ledger-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)] lg:hidden"
      aria-label="Broadsheet preview mobile navigation"
    >
      {MOBILE_NAV_ROUTES.map((route) => {
        const active = route.id === "today";
        return (
          <Link
            key={route.id}
            href={active ? PREVIEW_PATH : route.path}
            className={`flex min-h-14 flex-col items-center justify-center px-1 text-center text-[0.62rem] font-bold uppercase tracking-[0.03em] ${
              active ? "text-[var(--ledger-accent)]" : "text-muted-foreground"
            }`}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BroadsheetSkeleton() {
  return (
    <div className="mx-auto max-w-[920px] space-y-6 px-5 py-10" aria-label="Loading today's briefing">
      <div className="mx-auto h-16 w-72 animate-pulse bg-[var(--ledger-track)]" />
      <div className="h-16 animate-pulse border-t-2 border-b-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]" />
      <div className="h-40 animate-pulse border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]" />
      <div className="h-52 animate-pulse border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]" />
    </div>
  );
}

function BroadsheetHero({ data }: { data: TodayData }) {
  const action = data.primaryAction;
  const isActive = action?.kind === "resume";

  if (!action) {
    return (
      <div className="relative mt-8 border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-7 md:p-9">
        <LedgerLabel>Curriculum ready</LedgerLabel>
        <div className="mt-2 font-display text-2xl font-semibold text-[var(--ledger-ink)]">Choose your next study action</div>
        <p className="mt-2 max-w-xl text-[0.85rem] leading-6 text-muted-foreground">
          Your curriculum is available, but no due review, plan task, or recorded lesson action is waiting.
        </p>
      </div>
    );
  }

  return (
    <div className="relative mt-8 border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-7 md:p-9">
      <div className="absolute inset-y-0 left-0 w-1 bg-[var(--ledger-accent)]" aria-hidden="true" />
      {isActive ? (
        <div
          className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ledger-accent)] text-[11px] font-bold text-white"
          aria-hidden="true"
        >
          ✓
        </div>
      ) : null}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <LedgerLabel className="text-[var(--ledger-accent)]">{actionEyebrow(action.kind)}</LedgerLabel>
          <div className="mt-2 font-display text-2xl font-semibold leading-tight text-[var(--ledger-ink)] md:text-[1.7rem]">{action.title}</div>
          <p className="mt-2 text-[0.85rem] leading-6 text-muted-foreground">{action.description}</p>
        </div>
        <Link
          href={action.route}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap bg-[var(--ledger-ink)] px-6 py-3.5 text-sm font-bold text-white"
        >
          {action.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function BroadsheetCurriculumSection({
  currentLessonId,
  progressMap,
}: {
  currentLessonId: string | null;
  progressMap: ProgressByLesson;
}) {
  const units = UNIT_DEFS.map((unit) => ({ unit, lessons: unitLessons(unit) })).filter((u) => u.lessons.length > 0);

  return (
    <div className="mt-11">
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-[var(--ledger-ink)] pb-2.5">
        <h2 className="font-display text-[1.35rem] font-semibold text-[var(--ledger-ink)]">Curriculum</h2>
        <Link href="/learn" className="text-xs font-bold text-[var(--ledger-accent)] hover:underline">Open Learn →</Link>
      </div>

      {/* Desktop/tablet: 4-column grid with underline progress bars, per the mockup. */}
      <div className="mt-5 hidden grid-cols-2 gap-x-7 gap-y-8 sm:grid lg:grid-cols-4">
        {units.map(({ unit, lessons }) => {
          const completeCount = lessons.filter((l) => progressMap.get(l.id)?.status === "completed").length;
          const percent = lessons.length ? Math.round((completeCount / lessons.length) * 100) : 0;
          return (
            <div key={unit.id}>
              <LedgerLabel style={{ color: unit.color }}>{unit.label}</LedgerLabel>
              <div className="mt-2 h-[5px] bg-[var(--ledger-track)]">
                <div className="h-full" style={{ width: `${percent}%`, background: unit.color }} />
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {lessons.map((lesson) => {
                  const item = progressMap.get(lesson.id);
                  const status = item?.status ?? "not_started";
                  const isCurrent = lesson.id === currentLessonId;
                  const symbol = status === "completed" ? "✓" : isCurrent ? "●" : "○";
                  const style = isCurrent
                    ? { color: "var(--ledger-accent)" }
                    : status === "completed"
                      ? { color: "var(--ledger-ink)" }
                      : { color: "var(--ledger-faint)" };
                  return (
                    <div key={lesson.id} className={`text-xs ${isCurrent ? "font-bold" : ""}`} style={style}>
                      {symbol} {lesson.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: condensed underline bars, one row per unit. */}
      <div className="mt-4 flex flex-col gap-4 sm:hidden">
        {units.map(({ unit, lessons }) => {
          const completeCount = lessons.filter((l) => progressMap.get(l.id)?.status === "completed").length;
          const percent = lessons.length ? Math.round((completeCount / lessons.length) * 100) : 0;
          const isCurrentUnit = lessons.some((l) => l.id === currentLessonId);
          return (
            <div key={unit.id}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: isCurrentUnit ? unit.color : "var(--ledger-ink)" }}>{unit.label}</span>
                <span className="text-[0.68rem] text-muted-foreground tabular-nums">{completeCount}/{lessons.length}</span>
              </div>
              <div className="mt-1.5 h-1 bg-[var(--ledger-track)]">
                <div className="h-full" style={{ width: `${percent}%`, background: unit.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BroadsheetBody({ data, progressList }: { data: TodayData; progressList: inferRouterOutputs<AppRouter>["learner"]["progress"] }) {
  const progressMap: ProgressByLesson = new Map(
    progressList.map((item) => [item.lessonId, { status: item.status as LessonStatus, percentComplete: item.percentComplete }]),
  );
  const currentLessonId = data.primaryAction && "lesson" in data.primaryAction ? data.primaryAction.lesson.id : null;
  const targetTestDate = data.workspaceContext.targetTestDate ? formatShortDate(data.workspaceContext.targetTestDate) : null;

  return (
    <div className="mx-auto max-w-[920px] px-5 pb-16 pt-11 md:px-0">
      <div className="text-center">
        <LedgerLabel>{targetTestDate ? `Target test · ${targetTestDate}` : "Target test not set"}</LedgerLabel>
        <TodayGreeting data={data} />
        <p className="mt-1.5 text-sm text-muted-foreground">Taught by Devaney M. Page, JD</p>
      </div>

      {data.state === "empty" ? <div className="mt-6"><TodayBaselineNotice /></div> : null}

      <div className="mt-7 border-y-2 border-[var(--ledger-rule)] py-5" style={{ borderTopColor: "var(--ledger-ink)" }}>
        <TodayStatTiles data={data} />
      </div>

      <BroadsheetHero data={data} />

      <BroadsheetCurriculumSection currentLessonId={currentLessonId} progressMap={progressMap} />
    </div>
  );
}

function BroadsheetContent({
  isAuthenticated,
  authLoading,
  continueLearning,
  progress,
}: Omit<ReturnType<typeof useBroadsheetData>, "user">) {
  if (authLoading || (isAuthenticated && continueLearning.isLoading)) {
    return <BroadsheetSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-[920px] px-5 py-14">
        <LedgerEmptyState
          title="Sign in to see today's briefing"
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
      </div>
    );
  }

  if (continueLearning.isError || !continueLearning.data) {
    return (
      <div className="mx-auto max-w-[920px] px-5 py-14">
        <div className="border-2 border-[var(--ledger-negative)] bg-[var(--ledger-negative-tint)] p-6" role="alert">
          <BookOpen className="h-6 w-6 text-[var(--ledger-negative)]" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl font-semibold">Today's briefing could not be loaded</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your data is safe. Retry the request before relying on today's priority.
          </p>
          <button
            type="button"
            className="mt-4 min-h-11 border-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)] px-4 text-sm font-semibold"
            onClick={() => void continueLearning.refetch()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <BroadsheetBody data={continueLearning.data} progressList={progress.data ?? []} />;
}

export default function TodayBroadsheetPreview() {
  const { user, ...rest } = useBroadsheetData();

  return (
    <div className="learner-ledger ledger-mobile-content min-h-screen bg-[var(--ledger-paper)] text-[var(--ledger-ink)]">
      <BroadsheetNav user={user} />
      <main id="main-content">
        <BroadsheetContent {...rest} />
      </main>
      <BroadsheetMobileNav />
    </div>
  );
}
