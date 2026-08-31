import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../../server/routers";
import { LedgerLabel } from "./LedgerPrimitives";

type TodayData = inferRouterOutputs<AppRouter>["learner"]["continueLearning"];

function formatLongDate(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export function TodayGreeting({ data }: { data: TodayData }) {
  if (data.state === "empty") {
    return (
      <div>
        <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-[var(--ledger-ink)] md:text-[2rem]">Welcome. Start where the curriculum starts.</h1>
        <p className="mt-1 text-sm text-muted-foreground">No study activity is recorded yet.</p>
      </div>
    );
  }
  const today = new Date();
  const minutesToday = data.workspaceContext.weeklyStudyMinutes
    ? Math.round(data.workspaceContext.weeklyStudyMinutes / 7)
    : null;
  return (
    <div>
      <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-[var(--ledger-ink)] md:text-[2rem]">{formatLongDate(today)}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {minutesToday ? `Your plan calls for about ${minutesToday} minutes today.` : "No weekly study target set yet — add one in Plan."}
      </p>
    </div>
  );
}

/** Shown only in the evidence-honest empty state, between the hero card and
 * the stat tiles — explains why the tiles read "—" instead of hiding them. */
export function TodayBaselineNotice() {
  return (
    <div className="border-2 border-[var(--ledger-rule)] bg-[var(--muted)] px-5 py-4">
      <p className="text-sm font-bold text-[var(--ledger-ink)]">Your baseline begins with completed practice</p>
      <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">
        Scores, percentiles, and mastery estimates will appear only after the practice system records enough verified attempts. No sample performance data is shown.
      </p>
    </div>
  );
}

/** Three headline stat tiles. Score estimate stays "—" honestly — there's no
 * timed-practice-test data in the schema to back a number. */
export function TodayStatTiles({ data }: { data: TodayData }) {
  const isEmpty = data.state === "empty";
  const { attempts, correctCount } = data.recentPractice;
  const accuracyPercent = attempts > 0 ? Math.round((correctCount / attempts) * 100) : null;
  const tiles = [
    {
      label: "Review due",
      value: data.summary.dueReviewCount > 0 ? data.summary.dueReviewCount : "—",
      detail: isEmpty ? "nothing recorded yet" : "questions from prior mistakes",
      faint: data.summary.dueReviewCount === 0,
    },
    {
      label: "Accuracy",
      value: accuracyPercent !== null ? `${accuracyPercent}%` : "—",
      detail: attempts > 0 ? `${attempts} question${attempts === 1 ? "" : "s"} drilled` : "appears after first drill",
      faint: accuracyPercent === null,
    },
    {
      label: "Score estimate",
      value: "—",
      detail: "appears after 2 timed practice tests",
      faint: true,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.label} className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] px-4 py-3.5">
          <LedgerLabel>{tile.label}</LedgerLabel>
          <div className={`mt-1.5 font-display text-2xl font-bold tabular-nums ${tile.faint ? "text-[var(--ledger-faint)]" : "text-[var(--ledger-ink)]"}`}>{tile.value}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{tile.detail}</div>
        </div>
      ))}
    </div>
  );
}

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/** A 7-day strip. Only "today" and a real due plan task (if its date falls
 * within the visible week) are populated — every other day is an honest
 * placeholder, since there's no persisted weekly-plan schedule yet. */
export function TodayWeekStrip({ data }: { data: TodayData }) {
  const today = new Date();
  const todayIndex = (today.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayIndex);

  const dueAt = data.activePlanTask?.dueAt ? new Date(data.activePlanTask.dueAt) : null;

  return (
    <div>
      <LedgerLabel>This week</LedgerLabel>
      <div className="mt-2.5 grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((label, index) => {
          const cellDate = new Date(monday);
          cellDate.setDate(monday.getDate() + index);
          const isToday = index === todayIndex;
          const taskHere = dueAt && dueAt.toDateString() === cellDate.toDateString() ? data.activePlanTask : null;
          return (
            <div
              key={label}
              className={
                isToday
                  ? "bg-[var(--ledger-ink)] px-2 py-2.5 text-white"
                  : "border-2 border-[var(--ledger-rule)] px-2 py-2.5"
              }
            >
              <div className={`text-[0.65rem] font-bold ${isToday ? "text-white" : "text-muted-foreground"}`}>{label}</div>
              <div className={`mt-0.5 text-[0.68rem] leading-4 ${isToday ? "text-white/80" : "text-muted-foreground"}`}>
                {isToday ? "Today" : taskHere ? taskHere.title : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
