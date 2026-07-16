import { ArrowRight, CheckCircle2, Clock3, Compass, LockKeyhole } from "lucide-react";
import { Link, useLocation } from "wouter";
import { CURRICULUM_LESSONS, getLessonById, type CurriculumLesson } from "@shared/learnerDomain";
import { useFeatureFlag } from "@/lib/flags";
import { canonicalizeAppPath, ROUTE_BY_ID } from "@/lib/routes";

export type OrientationHeaderProps = {
  breadcrumb: Array<{ label: string; href?: string }>;
  title: string;
  purpose: string;
  prerequisites?: Array<{ label: string; href: string }>;
  estimate?: string;
  status?: "not_started" | "in_progress" | "completed";
  statusLabel?: string;
  nextAction?: { label: string; href: string };
};

const statusLabels = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function ContextualOrientationHeader({
  breadcrumb,
  title,
  purpose,
  prerequisites = [],
  estimate,
  status = "not_started",
  statusLabel,
  nextAction,
}: OrientationHeaderProps) {
  return (
    <section className="border-b border-border bg-card/80 px-4 py-5 text-card-foreground backdrop-blur-sm md:px-8" aria-labelledby="orientation-title">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href ? <Link href={item.href} className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            </span>
          ))}
        </nav>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <Compass className="size-5 text-primary" aria-hidden="true" />
              <span className="rounded-sm border border-border bg-background px-2 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em]">
                {status === "completed" && <CheckCircle2 className="mr-1 inline size-3" aria-hidden="true" />}
                {statusLabel ?? statusLabels[status]}
              </span>
              {estimate && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden="true" />{estimate}</span>}
            </div>
            <h1 id="orientation-title" className="font-display font-bold text-2xl leading-tight md:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground"><strong className="text-foreground">Why this matters:</strong> {purpose}</p>
            {prerequisites.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <LockKeyhole className="size-3.5" aria-hidden="true" /><span>Prerequisites:</span>
                {prerequisites.map(item => <Link key={item.href} href={item.href} className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline">{item.label}</Link>)}
              </div>
            )}
          </div>
          {nextAction && (
            <Link href={nextAction.href} className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-4 py-3 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {nextAction.label}<ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function lessonOrientation(lesson: CurriculumLesson) {
  const prerequisites = lesson.prerequisites
    .map(id => getLessonById(id))
    .filter((item): item is CurriculumLesson => Boolean(item))
    .map(item => ({ label: item.title, href: canonicalizeAppPath(item.route) }));
  const next = CURRICULUM_LESSONS.find(item => item.sequence === lesson.sequence + 1);
  return {
    breadcrumb: [{ label: ROUTE_BY_ID.today.label, href: ROUTE_BY_ID.today.path }, { label: ROUTE_BY_ID.learn.label, href: ROUTE_BY_ID.learn.path }, { label: lesson.title }],
    title: lesson.title,
    purpose: lesson.description,
    prerequisites,
    estimate: `${lesson.durationMinutes} minutes`,
    nextAction: next ? { label: `Next: ${next.title}`, href: canonicalizeAppPath(next.route) } : { label: "Review curriculum", href: ROUTE_BY_ID.learn.path },
  };
}

export function RouteOrientation() {
  const { enabled } = useFeatureFlag("contextual_orientation");
  const [location] = useLocation();
  if (!enabled) return null;

  const canonicalLocation = canonicalizeAppPath(location);
  const lesson = CURRICULUM_LESSONS.find(item => canonicalizeAppPath(item.route) === canonicalLocation);
  if (lesson) return <ContextualOrientationHeader {...lessonOrientation(lesson)} />;

  const routeOrientations: Partial<Record<keyof typeof ROUTE_BY_ID, OrientationHeaderProps>> = {
    today: {
      breadcrumb: [{ label: ROUTE_BY_ID.today.label }],
      title: ROUTE_BY_ID.today.label,
      purpose: ROUTE_BY_ID.today.description,
      estimate: "One clear next step",
      statusLabel: "Current workspace",
      nextAction: { label: "Browse curriculum", href: ROUTE_BY_ID.learn.path },
    },
    learn: {
      breadcrumb: [{ label: ROUTE_BY_ID.today.label, href: ROUTE_BY_ID.today.path }, { label: ROUTE_BY_ID.learn.label }],
      title: ROUTE_BY_ID.learn.label,
      purpose: ROUTE_BY_ID.learn.description,
      estimate: "Self-paced curriculum",
      statusLabel: "Available",
      nextAction: { label: "Choose practice", href: ROUTE_BY_ID.practice.path },
    },
    practice: {
      breadcrumb: [{ label: ROUTE_BY_ID.today.label, href: ROUTE_BY_ID.today.path }, { label: ROUTE_BY_ID.practice.label }],
      title: ROUTE_BY_ID.practice.label,
      purpose: ROUTE_BY_ID.practice.description,
      estimate: "Choose your own session",
      statusLabel: "Available",
      nextAction: { label: "Return to Today", href: ROUTE_BY_ID.today.path },
    },
    review: {
      breadcrumb: [{ label: ROUTE_BY_ID.today.label, href: ROUTE_BY_ID.today.path }, { label: ROUTE_BY_ID.review.label }],
      title: ROUTE_BY_ID.review.label,
      purpose: ROUTE_BY_ID.review.description,
      estimate: "Based on due evidence",
      statusLabel: "Evidence dependent",
      nextAction: { label: "Return to Today", href: ROUTE_BY_ID.today.path },
    },
    progress: {
      breadcrumb: [{ label: ROUTE_BY_ID.today.label, href: ROUTE_BY_ID.today.path }, { label: ROUTE_BY_ID.progress.label }],
      title: ROUTE_BY_ID.progress.label,
      purpose: ROUTE_BY_ID.progress.description,
      estimate: "Builds through practice",
      statusLabel: "Evidence dependent",
      nextAction: { label: "Build evidence", href: ROUTE_BY_ID.practice.path },
    },
    plan: {
      breadcrumb: [{ label: ROUTE_BY_ID.today.label, href: ROUTE_BY_ID.today.path }, { label: ROUTE_BY_ID.plan.label }],
      title: ROUTE_BY_ID.plan.label,
      purpose: ROUTE_BY_ID.plan.description,
      estimate: "Weekly planning workspace",
      statusLabel: "Editable",
      nextAction: { label: "Return to Today", href: ROUTE_BY_ID.today.path },
    },
  };
  const routeEntry = Object.entries(ROUTE_BY_ID).find(([, route]) => route.path === canonicalLocation);
  const orientation = routeEntry ? routeOrientations[routeEntry[0] as keyof typeof ROUTE_BY_ID] : undefined;
  return orientation ? <ContextualOrientationHeader {...orientation} /> : null;
}
