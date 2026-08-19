import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

function LedgerMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-t border-border pt-3">
      <div className="font-display text-xl font-semibold text-foreground">{value}</div>
      <div className="nexus-index-label mt-1 text-muted-foreground">{label}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5" aria-label="Loading learner dashboard">
      <div className="h-72 animate-pulse border border-border bg-card" />
      <div className="h-28 animate-pulse border border-border bg-card" />
    </div>
  );
}

export function ContinueLearningMain() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const query = trpc.learner.continueLearning.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading || (isAuthenticated && query.isLoading)) return <DashboardSkeleton />;

  if (!isAuthenticated) {
    return (
      <section className="nexus-paper-panel border-t-2 border-t-[var(--nexus-amber)] p-7 text-card-foreground">
        <BookOpen className="mb-6 size-8 text-primary" aria-hidden="true" />
        <p className="nexus-index-label text-[var(--nexus-amber)]">Private study record</p>
        <h3 className="mt-3 max-w-2xl font-display text-2xl font-semibold">Sign in to continue where you stopped.</h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Lesson progress is stored privately with your learner profile and used to select one clear next action.
        </p>
        <button
          className="mt-7 inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-[transform,background-color] hover:bg-[#0a5960] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => window.location.assign(getLoginUrl())}
        >
          Sign in <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="nexus-paper-panel border-l-2 border-l-destructive p-7 text-card-foreground" role="alert">
        <p className="nexus-index-label text-destructive">Retrieval interrupted</p>
        <h3 className="mt-3 font-display text-xl font-semibold">Your next lesson could not be loaded.</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Your study record is safe. Retry the request to restore the session brief.</p>
        <button className="mt-5 border border-border px-4 py-2 text-sm font-semibold hover:bg-muted" onClick={() => query.refetch()}>
          Try again
        </button>
      </section>
    );
  }

  const { state, primaryAction, recentLessons } = query.data;
  const actionRoute = query.data.primaryAction?.route;
  const StateIcon = state === "completed" ? CheckCircle2 : state === "empty" ? Sparkles : Clock3;
  const eyebrow = state === "completed" ? "Curriculum complete" : state === "empty" ? "Begin with the foundation" : "Continue learning";

  return (
    <div className="space-y-5">
      <section className="nexus-paper-panel relative overflow-hidden text-card-foreground">
        <div className="absolute inset-y-0 left-0 w-1 bg-[var(--nexus-amber)]" aria-hidden="true" />
        <div className="grid gap-7 p-7 pl-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:p-9 lg:pl-10">
          <div className="max-w-2xl">
            <div className="mb-7 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center border border-border bg-background text-primary">
                <StateIcon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="nexus-index-label text-primary">{eyebrow}</p>
                <p className="mt-1 text-xs text-muted-foreground">Highest-priority action from your learner record</p>
              </div>
            </div>

            <h3 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
              {primaryAction?.title ?? "Your curriculum is ready"}
            </h3>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              {primaryAction?.description ?? "Choose a lesson from the curriculum atlas."}
            </p>

            {primaryAction?.kind === "resume" && primaryAction.progress ? (
              <div className="mt-7 max-w-xl" aria-label={`${primaryAction.progress.percentComplete}% complete`}>
                <div className="mb-2 flex justify-between nexus-index-label text-muted-foreground">
                  <span>Recorded progress</span>
                  <span>{primaryAction.progress.percentComplete}%</span>
                </div>
                <div className="h-1.5 overflow-hidden bg-muted">
                  <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${primaryAction.progress.percentComplete}%` }} />
                </div>
              </div>
            ) : null}
          </div>

          {primaryAction && actionRoute ? (
            <Link
              href={actionRoute}
              className="inline-flex shrink-0 items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-[transform,background-color,box-shadow] hover:bg-[#0a5960] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {(primaryAction.kind === "due_review" || primaryAction.kind === "lesson_review") && <RotateCcw className="size-4" aria-hidden="true" />}
              {primaryAction.label}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </section>

      <section className="nexus-paper-panel p-6 text-card-foreground" aria-labelledby="activity-trace-title">
        <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="nexus-index-label text-[var(--nexus-amber)]">02 · Activity trace</p>
            <h3 id="activity-trace-title" className="mt-2 font-display text-xl font-semibold">Recent work</h3>
          </div>
          <Link href="/progress" className="text-sm font-semibold text-primary hover:underline">View evidence</Link>
        </div>

        {recentLessons.length > 0 ? (
          <div className="divide-y divide-border">
            {recentLessons.map((item) => (
              <Link
                key={item.lesson.id}
                href={item.lesson.route}
                className="group grid gap-2 py-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <span>
                  <strong className="font-semibold group-hover:text-primary">{item.lesson.title}</strong>
                  <span className="ml-2 text-muted-foreground">{item.percentComplete}% recorded</span>
                </span>
                <span className="inline-flex items-center gap-2 nexus-index-label text-muted-foreground group-hover:text-primary">
                  Continue <ArrowRight className="size-3.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-5 text-sm leading-6 text-muted-foreground">Your first completed step will appear here as an evidence trace.</p>
        )}
      </section>
    </div>
  );
}

export function ContinueLearningSidebar() {
  const { isAuthenticated } = useAuth();
  const { data } = trpc.learner.continueLearning.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  if (!data) return null;

  const evidenceMessage = data.summary.dueReviewCount > 0
    ? `${data.summary.dueReviewCount} question${data.summary.dueReviewCount === 1 ? " is" : "s are"} due for retrieval practice.`
    : data.summary.hasActivePlanTask
      ? "Your active study plan has a pending task."
      : "No due review or plan task is waiting.";
  const percent = Math.min(100, Math.max(0, data.summary.percentComplete));

  return (
    <section className="nexus-paper-panel p-6 text-card-foreground" aria-labelledby="learning-ledger-title">
      <p className="nexus-index-label text-[var(--nexus-amber)]">Evidence ledger</p>
      <h3 id="learning-ledger-title" className="mt-2 font-display text-xl font-semibold">Curriculum position</h3>

      <div className="mt-6 flex items-center gap-5 border-y border-border py-5">
        <div
          className="relative flex size-24 shrink-0 items-center justify-center rounded-full"
          style={{ background: `conic-gradient(var(--primary) ${percent * 3.6}deg, var(--muted) 0deg)` }}
          aria-label={`${percent}% of curriculum complete`}
        >
          <div className="flex size-[4.85rem] items-center justify-center rounded-full bg-card">
            <span className="font-display text-2xl font-semibold">{percent}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Overall completion</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {data.summary.completedLessons} of {data.summary.totalLessons} lessons complete.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <LedgerMetric label="Complete" value={data.summary.completedLessons} />
        <LedgerMetric label="Active" value={data.summary.inProgressLessons} />
        <LedgerMetric label="Remaining" value={data.summary.remainingLessons} />
      </div>

      <div className="mt-6 bg-muted/70 p-4" aria-label="Current study evidence">
        <p className="nexus-index-label text-muted-foreground">Current evidence</p>
        <p className="mt-2 text-sm leading-6 text-foreground/75">{evidenceMessage}</p>
      </div>
    </section>
  );
}
