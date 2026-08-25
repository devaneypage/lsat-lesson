import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const LENGTHS = [5, 10, 25] as const;
const SECONDS_PER_QUESTION = 85;

export function SetBuilder() {
  const [, navigate] = useLocation();
  const filtersQuery = trpc.practice.setFilters.useQuery();
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const [timed, setTimed] = useState(false);
  const [length, setLength] = useState<(typeof LENGTHS)[number]>(10);

  const previewQuery = trpc.practice.buildSet.useQuery(
    { category, difficulty, length },
    { enabled: Boolean(filtersQuery.data) },
  );

  function startSet() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);
    params.set("length", String(length));
    params.set("timed", timed ? "1" : "0");
    navigate(`/practice/drill?${params.toString()}`);
  }

  const totalMatching = previewQuery.data?.totalMatching ?? 0;
  const unseenMatching = previewQuery.data?.unseenMatching ?? 0;
  const canStart = totalMatching > 0;

  return (
    <div className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-5 md:p-6">
      <p className="font-mono text-[0.67rem] font-semibold uppercase tracking-[0.12em] text-[var(--ledger-faint)]">Build a set</p>
      <div className="mt-4 flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Question type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(undefined)}
              className={`min-h-9 px-3 py-1.5 text-xs font-bold ${category === undefined ? "bg-[var(--ledger-ink)] text-white" : "border-2 border-[var(--ledger-rule)] text-[var(--ledger-ink)]"}`}
            >
              All types
            </button>
            {(filtersQuery.data?.categories ?? []).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCategory(name)}
                className={`min-h-9 px-3 py-1.5 text-xs font-bold ${category === name ? "bg-[var(--ledger-ink)] text-white" : "border-2 border-[var(--ledger-rule)] text-[var(--ledger-ink)]"}`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Difficulty</p>
            <div className="mt-2 flex border-2 border-[var(--ledger-rule)]">
              <button
                type="button"
                onClick={() => setDifficulty(undefined)}
                className={`min-h-9 border-r-2 border-[var(--ledger-rule)] px-3.5 text-xs font-bold ${difficulty === undefined ? "bg-[var(--ledger-ink)] text-white" : "text-[var(--ledger-ink)]"}`}
              >
                Mixed
              </button>
              {(filtersQuery.data?.difficulties ?? []).map((name, i, arr) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setDifficulty(name)}
                  className={`min-h-9 px-3.5 text-xs font-bold capitalize ${i < arr.length - 1 ? "border-r-2 border-[var(--ledger-rule)]" : ""} ${difficulty === name ? "bg-[var(--ledger-ink)] text-white" : "text-[var(--ledger-ink)]"}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground">Timing</p>
            <div className="mt-2 flex border-2 border-[var(--ledger-rule)]">
              <button
                type="button"
                onClick={() => setTimed(false)}
                className={`min-h-9 border-r-2 border-[var(--ledger-rule)] px-3.5 text-xs font-bold ${!timed ? "bg-[var(--ledger-ink)] text-white" : "text-[var(--ledger-ink)]"}`}
              >
                Untimed
              </button>
              <button
                type="button"
                onClick={() => setTimed(true)}
                className={`min-h-9 px-3.5 text-xs font-bold ${timed ? "bg-[var(--ledger-ink)] text-white" : "text-[var(--ledger-ink)]"}`}
              >
                {SECONDS_PER_QUESTION < 60 ? `0:${SECONDS_PER_QUESTION}` : `${Math.floor(SECONDS_PER_QUESTION / 60)}:${String(SECONDS_PER_QUESTION % 60).padStart(2, "0")}`} / question
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground">Length</p>
            <div className="mt-2 flex border-2 border-[var(--ledger-rule)]">
              {LENGTHS.map((n, i) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setLength(n)}
                  className={`min-h-9 px-3.5 text-xs font-bold ${i < LENGTHS.length - 1 ? "border-r-2 border-[var(--ledger-rule)]" : ""} ${length === n ? "bg-[var(--ledger-ink)] text-white" : "text-[var(--ledger-ink)]"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[var(--ledger-rule)] pt-4">
          <p className="text-xs text-muted-foreground">
            {previewQuery.isLoading
              ? "Checking available questions…"
              : totalMatching > 0
                ? `${totalMatching} matching question${totalMatching === 1 ? "" : "s"} available · ${unseenMatching === totalMatching ? "none previously seen" : `${totalMatching - unseenMatching} previously seen`}`
                : "No matching questions for this filter combination."}
          </p>
          <button
            type="button"
            disabled={!canStart}
            onClick={startSet}
            className="min-h-11 bg-[var(--ledger-ink)] px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start set → {Math.min(length, totalMatching || length)} questions
          </button>
        </div>
      </div>
    </div>
  );
}

export { SECONDS_PER_QUESTION };
