import { ArrowRight, CheckCircle2, Clock3, Compass, LockKeyhole } from "lucide-react";
import { Link, useLocation } from "wouter";
import { CURRICULUM_LESSONS, getLessonById, type CurriculumLesson } from "@shared/learnerDomain";
import { useFeatureFlag } from "@/lib/flags";

export type OrientationHeaderProps = {
  breadcrumb: Array<{ label: string; href?: string }>;
  title: string;
  purpose: string;
  prerequisites?: Array<{ label: string; href: string }>;
  estimate?: string;
  status?: "not_started" | "in_progress" | "completed";
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
                {statusLabels[status]}
              </span>
              {estimate && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden="true" />{estimate}</span>}
            </div>
            <h1 id="orientation-title" className="font-['Archivo_Black'] text-2xl leading-tight md:text-3xl">{title}</h1>
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
    .map(item => ({ label: item.title, href: item.route }));
  const next = CURRICULUM_LESSONS.find(item => item.sequence === lesson.sequence + 1);
  return {
    breadcrumb: [{ label: "Dashboard", href: "/dashboard" }, { label: "Lessons", href: "/lessons" }, { label: lesson.title }],
    title: lesson.title,
    purpose: lesson.description,
    prerequisites,
    estimate: `${lesson.durationMinutes} minutes`,
    nextAction: next ? { label: `Next: ${next.title}`, href: next.route } : { label: "Review curriculum", href: "/lessons" },
  };
}

export function RouteOrientation() {
  const { enabled } = useFeatureFlag("contextual_orientation");
  const [location] = useLocation();
  if (!enabled) return null;

  const lesson = CURRICULUM_LESSONS.find(item => item.route === location);
  if (lesson) return <ContextualOrientationHeader {...lessonOrientation(lesson)} />;
  if (location === "/question-bank") {
    return <ContextualOrientationHeader breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Question Bank" }]} title="Question Bank" purpose="Deliberate question selection turns practice volume into interpretable evidence about reasoning skill." estimate="Choose your own session" nextAction={{ label: "Return to dashboard", href: "/dashboard" }} />;
  }
  return null;
}
