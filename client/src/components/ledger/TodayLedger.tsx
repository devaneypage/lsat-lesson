import type { inferRouterOutputs } from "@trpc/server";
import { ArrowRight, BookOpen, CalendarClock, CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import type { AppRouter } from "../../../../server/routers";
import { CurriculumMap } from "./CurriculumMap";
import { EvidenceStatus, LedgerEmptyState, LedgerLabel, LedgerProgress, LedgerSection } from "./LedgerPrimitives";
import { TodayBaselineNotice, TodayGreeting, TodayStatTiles, TodayWeekStrip } from "./TodayOverview";

type TodayData = inferRouterOutputs<AppRouter>["learner"]["continueLearning"];
type TodayLessonItem = TodayData["recentLessons"][number];
type TodaySkillEvidence = TodayData["practiceEvidence"]["bySkill"][number];

function formatDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatMinutes(milliseconds: number) {
  const minutes = Math.round(milliseconds / 60_000);
  if (minutes < 1) return "Under 1 minute";
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function actionEyebrow(kind: TodayData["primaryAction"] extends infer T ? T extends { kind: infer K } ? K : never : never) {
  if (kind === "due_review") return "Due retrieval practice";
  if (kind === "plan") return "Study plan priority";
  if (kind === "resume") return "Continue learning";
  if (kind === "lesson_review") return "Curriculum review";
  return "Recommended foundation";
}

export function TodayLedgerMain({ data }: { data: TodayData }) {
  const action = data.primaryAction;
  const actionRoute = data.primaryAction?.route;
  const dueCount = action && "dueCount" in action ? action.dueCount : 0;

  return (
    <div className="space-y-5">
      <TodayGreeting data={data} />

      <section className="border-2 border-[var(--ledger-rule-strong)] bg-[var(--ledger-surface)] shadow-[inset_4px_0_0_var(--ledger-accent)]" aria-labelledby="today-primary-action">
        <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="max-w-3xl">
            <LedgerLabel className="text-[var(--ledger-accent)]">{action ? actionEyebrow(action.kind) : "Curriculum ready"}</LedgerLabel>
            <h2 id="today-primary-action" className="mt-2 font-display text-3xl font-semibold leading-tight md:text-[2.35rem]">{action?.title ?? "Choose your next study action"}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{action?.description ?? "Your curriculum is available, but no due review, plan task, or recorded lesson action is waiting."}</p>
            {action?.progress ? <LedgerProgress className="mt-6 max-w-xl" value={action.progress.percentComplete} label="Recorded progress" /> : null}
            {action?.kind === "due_review" ? <p className="mt-5 text-xs font-semibold text-[var(--ledger-negative)]">{dueCount} due question{dueCount === 1 ? "" : "s"} · evidence already recorded</p> : null}
          </div>
          {action && actionRoute ? (
            <Link href={actionRoute} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-[var(--ledger-ink)] px-5 py-3 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {(action.kind === "due_review" || action.kind === "lesson_review") ? <RotateCcw className="h-4 w-4" aria-hidden="true" /> : null}
              {action.label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </section>

      {data.state === "empty" ? <TodayBaselineNotice /> : null}

      <TodayStatTiles data={data} />

      {data.state !== "empty" ? <TodayWeekStrip data={data} /> : null}

      <LedgerSection title="Today’s plan" eyebrow="Current commitments">
        <div className="divide-y-2 divide-[var(--ledger-rule)]">
          {data.dueReview ? (
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:px-6">
              <RotateCcw className="h-4 w-4 text-[var(--ledger-negative)]" aria-hidden="true" />
              <div><p className="text-sm font-semibold">Review {data.dueReview.count} due question{data.dueReview.count === 1 ? "" : "s"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{data.dueReview.reason}</p></div>
              <span className="text-xs font-semibold text-[var(--ledger-negative)]">Due now</span>
            </div>
          ) : null}
          {data.activePlanTask ? (
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:px-6">
              <CalendarClock className="h-4 w-4 text-[var(--ledger-accent)]" aria-hidden="true" />
              <div><p className="text-sm font-semibold">{data.activePlanTask.title}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{data.activePlanTask.itemType} task from your active plan</p></div>
              <span className="text-xs text-muted-foreground">{formatDate(data.activePlanTask.dueAt) ?? "No due date"}</span>
            </div>
          ) : null}
          {action?.progress && action.kind === "resume" ? (
            <div className="grid gap-2 px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:px-6">
              <BookOpen className="h-4 w-4 text-[var(--ledger-positive)]" aria-hidden="true" />
              <div><p className="text-sm font-semibold">Resume {action.title}</p><p className="mt-1 text-xs text-muted-foreground">{action.progress.percentComplete}% recorded</p></div>
              <span className="text-xs font-semibold text-[var(--ledger-positive)]">In progress</span>
            </div>
          ) : null}
          {!data.dueReview && !data.activePlanTask && !(action?.progress && action.kind === "resume") ? (
            <div className="p-5 md:p-6"><LedgerEmptyState title="No scheduled commitments" description="No due review or active study-plan task is waiting. The recommended curriculum action above remains available." /></div>
          ) : null}
        </div>
      </LedgerSection>

      <LedgerSection title="Recent work" eyebrow="Recorded activity" action={<Link href="/progress" className="text-xs font-bold text-[var(--ledger-accent)] hover:underline">Open evidence</Link>}>
        {data.recentLessons.length > 0 || data.recentPractice.attempts > 0 ? (
          <div className="divide-y-2 divide-[var(--ledger-rule)]">
            {data.recentPractice.attempts > 0 ? (
              <div className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-6">
                <div><p className="font-semibold">Recent question practice</p><p className="mt-1 text-xs text-muted-foreground">{data.recentPractice.correctCount} correct from {data.recentPractice.attempts} bounded recent attempts · {formatMinutes(data.recentPractice.activeTimeMs)} active</p></div>
                <span className="text-xs text-muted-foreground">{formatDate(data.recentPractice.latestSubmittedAt)}</span>
              </div>
            ) : null}
            {data.recentLessons.map((item: TodayLessonItem) => (
              <Link key={item.lesson.id} href={item.lesson.route} className="grid gap-2 px-5 py-4 text-sm transition-colors hover:bg-[var(--ledger-accent-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-6">
                <div><p className="font-semibold">{item.lesson.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.status.replace("_", " ")} · {item.percentComplete}% recorded</p></div>
                <span className="text-xs text-muted-foreground">{formatDate(item.lastAccessedAt)}</span>
              </Link>
            ))}
          </div>
        ) : <div className="p-5 md:p-6"><LedgerEmptyState title="No recorded work yet" description="A completed lesson step or evidence-producing practice attempt will appear here." /></div>}
      </LedgerSection>
    </div>
  );
}

export function TodayLedgerEvidence({ data }: { data: TodayData }) {
  const targetTestDate = formatDate(data.workspaceContext.targetTestDate);
  const evidence = data.practiceEvidence.bySkill.slice(0, 4);
  const currentLessonId = data.primaryAction && "lesson" in data.primaryAction ? data.primaryAction.lesson.id : null;

  return (
    <div className="space-y-5">
      <CurriculumMap currentLessonId={currentLessonId} />

      <LedgerSection title="Curriculum position" eyebrow="Evidence ledger">
        <div className="p-5 md:p-6">
          <LedgerProgress value={data.summary.percentComplete} label={`${data.summary.completedLessons} of ${data.summary.totalLessons} lessons complete`} />
          <div className="mt-5 grid grid-cols-3 gap-3 border-t-2 border-[var(--ledger-rule)] pt-4">
            <div><strong className="font-display text-xl font-semibold tabular-nums">{data.summary.completedLessons}</strong><LedgerLabel>Complete</LedgerLabel></div>
            <div><strong className="font-display text-xl font-semibold tabular-nums">{data.summary.inProgressLessons}</strong><LedgerLabel>Active</LedgerLabel></div>
            <div><strong className="font-display text-xl font-semibold tabular-nums">{data.summary.remainingLessons}</strong><LedgerLabel>Remaining</LedgerLabel></div>
          </div>
        </div>
      </LedgerSection>

      <LedgerSection title="Workspace context" eyebrow="Plan settings">
        <div className="space-y-3 p-5 md:p-6">
          <EvidenceStatus tone={targetTestDate ? "neutral" : "provisional"} icon={CalendarClock} label={targetTestDate ? `Target test · ${targetTestDate}` : "Target test not set"} detail={targetTestDate ? "Stored in your learner profile." : "Set a target date in Plan to add schedule context."} />
          <EvidenceStatus tone={data.workspaceContext.weeklyStudyMinutes ? "neutral" : "provisional"} icon={Clock3} label={data.workspaceContext.weeklyStudyMinutes ? `${data.workspaceContext.weeklyStudyMinutes} minutes per week` : "Weekly target unavailable"} detail="This is a planning target, not a claim about completed study time." />
          <EvidenceStatus tone={data.summary.dueReviewCount > 0 ? "negative" : "positive"} icon={data.summary.dueReviewCount > 0 ? RotateCcw : CheckCircle2} label={data.summary.dueReviewCount > 0 ? `${data.summary.dueReviewCount} due for review` : "No review due now"} />
        </div>
      </LedgerSection>

      <LedgerSection title="Practice evidence" eyebrow="Bounded observations">
        <div className="p-5 md:p-6">
          {evidence.length > 0 ? (
            <div className="space-y-4">
              {evidence.map((item: TodaySkillEvidence) => (
                <div key={item.key}>
                  <div className="flex items-baseline justify-between gap-3 text-xs"><span className="font-semibold">{item.label}</span><span className="tabular-nums text-muted-foreground">{item.correctCount}/{item.evidenceCount} correct</span></div>
                  <div className="mt-1.5 h-1.5 bg-[var(--ledger-track)]"><div className="h-full bg-[var(--ledger-ink)]" style={{ width: `${item.accuracyPercent}%` }} /></div>
                  <p className={`mt-1 text-[0.68rem] ${item.status === "provisional" ? "text-[var(--ledger-provisional)]" : "text-[var(--ledger-positive)]"}`}>{item.status === "provisional" ? `Provisional · fewer than ${data.practiceEvidence.establishedEvidenceCount} attempts` : `Established from ${item.evidenceCount} attempts`}</p>
                </div>
              ))}
            </div>
          ) : <LedgerEmptyState title="No mapped practice evidence" description="Complete an evidence-producing question to begin an explainable skill record." />}
        </div>
      </LedgerSection>
    </div>
  );
}
