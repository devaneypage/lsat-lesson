import { ArrowRight, BookOpen, CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-border bg-card p-4 text-card-foreground">
      <div className="font-['Archivo_Black'] text-2xl">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
    </div>
  );
}

export function ContinueLearningMain() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const query = trpc.learner.continueLearning.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });

  if (authLoading || (isAuthenticated && query.isLoading)) {
    return <div className="min-h-64 animate-pulse rounded-sm border border-border bg-card" aria-label="Loading learner dashboard" />;
  }

  if (!isAuthenticated) {
    return (
      <section className="rounded-sm border border-border bg-card p-6 text-card-foreground">
        <BookOpen className="mb-5 size-8 text-primary" aria-hidden="true" />
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your study record</p>
        <h2 className="mt-2 font-['Archivo_Black'] text-2xl">Sign in to continue where you stopped.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Lesson progress is stored privately with your learner profile and used to select one clear next action.</p>
        <button className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-bold text-primary-foreground" onClick={() => window.location.assign(getLoginUrl())}>
          Sign in <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </section>
    );
  }

  if (query.isError || !query.data) {
    return (
      <section className="rounded-sm border border-destructive/50 bg-card p-6 text-card-foreground" role="alert">
        <h2 className="font-['Archivo_Black'] text-xl">Your next lesson could not be loaded.</h2>
        <button className="mt-4 rounded-sm border border-border px-4 py-2 text-sm font-semibold" onClick={() => query.refetch()}>Try again</button>
      </section>
    );
  }

  const { state, primaryAction, summary, recentLessons } = query.data;
  const StateIcon = state === "completed" ? CheckCircle2 : state === "empty" ? BookOpen : Clock3;
  const eyebrow = state === "completed" ? "Curriculum complete" : state === "empty" ? "Begin with the foundation" : "Continue learning";

  return (
    <div className="space-y-5">
      <section className="rounded-sm border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <StateIcon className="mb-5 size-8 text-primary" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
            <h2 className="mt-2 font-['Archivo_Black'] text-2xl leading-tight md:text-3xl">{primaryAction?.lesson.title ?? "Your curriculum is ready"}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{primaryAction?.lesson.description ?? "Choose a lesson from the curriculum map."}</p>
            {primaryAction?.kind === "resume" && (
              <div className="mt-5" aria-label={`${primaryAction.progress.percentComplete}% complete`}>
                <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span>Lesson progress</span><span>{primaryAction.progress.percentComplete}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${primaryAction.progress.percentComplete}%` }} /></div>
              </div>
            )}
          </div>
          {primaryAction && (
            <Link href={primaryAction.lesson.route} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {primaryAction.kind === "review" && <RotateCcw className="size-4" aria-hidden="true" />}
              {primaryAction.label}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </section>

      {recentLessons.length > 0 && (
        <section className="rounded-sm border border-border bg-card p-5 text-card-foreground">
          <h3 className="font-['Archivo_Black'] text-lg">Recent work</h3>
          <div className="mt-4 divide-y divide-border">
            {recentLessons.map(item => (
              <Link key={item.lesson.id} href={item.lesson.route} className="flex items-center justify-between gap-4 py-3 text-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <span><strong>{item.lesson.title}</strong><span className="ml-2 text-muted-foreground">{item.percentComplete}%</span></span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function ContinueLearningSidebar() {
  const { isAuthenticated } = useAuth();
  const { data } = trpc.learner.continueLearning.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  if (!data) return null;

  return (
    <section className="rounded-sm border border-border bg-card p-4 text-card-foreground" aria-labelledby="learning-summary-title">
      <h2 id="learning-summary-title" className="font-['Archivo_Black'] text-lg">Learning summary</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Complete" value={`${data.summary.percentComplete}%`} />
        <Metric label="Lessons" value={`${data.summary.completedLessons}/${data.summary.totalLessons}`} />
        <Metric label="Active" value={data.summary.inProgressLessons} />
        <Metric label="Remaining" value={data.summary.remainingLessons} />
      </div>
    </section>
  );
}
