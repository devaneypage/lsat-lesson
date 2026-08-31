import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, RotateCcw } from "lucide-react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { LedgerEmptyState } from "@/components/ledger/LedgerPrimitives";
import { useFeatureFlag } from "@/lib/flags";
import { trpc } from "@/lib/trpc";
import { MAX_ACTIVE_TIME_MS, type AnswerLetter } from "../../../shared/practiceEvidence";
import type { ConfidenceLevel } from "../../../shared/learnerDomain";

const ANSWER_LETTERS: AnswerLetter[] = ["A", "B", "C", "D", "E"];
const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string }[] = [
  { value: "certain", label: "Certain" },
  { value: "unsure", label: "Unsure" },
  { value: "guessed", label: "Guessed" },
];
const SECONDS_PER_QUESTION = 85;

type SubmitResult = {
  index: number;
  questionId: number;
  category: string | null;
  selectedAnswer: AnswerLetter;
  isCorrect: boolean;
  correctAnswer: AnswerLetter;
  explanation: string;
  activeTimeMs: number;
  flagged: boolean;
};

function formatClock(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function DrillPlayer() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { enabled: confidenceTrackingEnabled } = useFeatureFlag("question_confidence_tracking");

  const params = new URLSearchParams(search);
  const category = params.get("category") ?? undefined;
  const difficulty = params.get("difficulty") ?? undefined;
  const length = (() => {
    const n = Number(params.get("length"));
    return n === 5 || n === 10 || n === 25 ? n : 10;
  })();
  const timed = params.get("timed") === "1";

  const setQuery = trpc.practice.buildSet.useQuery({ category, difficulty, length }, { enabled: isAuthenticated });
  const questionIds = useMemo(() => setQuery.data?.questionIds ?? [], [setQuery.data]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answering" | "feedback" | "results">("answering");
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerLetter | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [flaggedIndexes, setFlaggedIndexes] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<SubmitResult[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [remainingSeconds, setRemainingSeconds] = useState(length * SECONDS_PER_QUESTION);
  const [correctSoFar, setCorrectSoFar] = useState(0);
  const questionStartedAtRef = useRef<number>(Date.now());

  const currentQuestionId = questionIds[index];
  const questionQuery = trpc.questions.getById.useQuery({ questionId: currentQuestionId ?? 0 }, { enabled: Boolean(currentQuestionId) });
  const startMutation = trpc.practice.start.useMutation();
  const submitMutation = trpc.practice.submit.useMutation();

  // Reset per-question state when the current question changes.
  useEffect(() => {
    if (!currentQuestionId) return;
    setSelectedAnswer(null);
    setConfidence(null);
    setIdempotencyKey(crypto.randomUUID());
    questionStartedAtRef.current = Date.now();
    startMutation.mutate({ questionId: currentQuestionId, route: "/practice/drill", surface: "drill_player" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionId]);

  // Overall countdown for timed sets.
  useEffect(() => {
    if (!timed || phase === "results") return;
    if (remainingSeconds <= 0) {
      setPhase("results");
      return;
    }
    const timer = window.setInterval(() => setRemainingSeconds((s) => Math.max(0, s - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [timed, remainingSeconds, phase]);

  if (authLoading) return <div className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!isAuthenticated) {
    return (
      <LedgerEmptyState
        title="Sign in to start a practice set"
        description="Practice attempts are private to your learner profile and become part of your evidence record."
        action={<button type="button" onClick={() => window.location.assign(getLoginUrl())} className="inline-flex min-h-11 items-center gap-2 bg-[var(--ledger-ink)] px-5 text-sm font-bold text-white">Sign in</button>}
      />
    );
  }
  if (setQuery.isLoading) return <div className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)] p-6 text-sm text-muted-foreground">Building your set…</div>;
  if (questionIds.length === 0) {
    return <LedgerEmptyState title="No questions matched this set" description="Try a different question type, difficulty, or go back and adjust the filters." action={<Link href="/practice" className="text-sm font-bold text-[var(--ledger-accent)] hover:underline">← Back to Practice</Link>} />;
  }

  async function handlePrimaryAction() {
    if (!currentQuestionId || !selectedAnswer) return;
    const effectiveConfidence = confidenceTrackingEnabled ? confidence : "unsure";
    if (!effectiveConfidence) return;

    const activeTimeMs = Math.min(MAX_ACTIVE_TIME_MS, Math.max(0, Date.now() - questionStartedAtRef.current));
    const result = await submitMutation.mutateAsync({
      questionId: currentQuestionId,
      idempotencyKey,
      selectedAnswer,
      confidence: effectiveConfidence,
      activeTimeMs,
      context: "practice",
      route: "/practice/drill",
      surface: "drill_player",
    });

    const record: SubmitResult = {
      index,
      questionId: currentQuestionId,
      category: questionQuery.data?.category ?? null,
      selectedAnswer,
      isCorrect: result.isCorrect,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation,
      activeTimeMs,
      flagged: flaggedIndexes.has(index),
    };
    setResults((prev) => [...prev, record]);
    if (result.isCorrect) setCorrectSoFar((c) => c + 1);

    if (timed) {
      advance();
    } else {
      setPhase("feedback");
    }
  }

  function advance() {
    if (index + 1 >= questionIds.length) {
      setPhase("results");
    } else {
      setIndex((i) => i + 1);
      setPhase("answering");
    }
  }

  function toggleFlag() {
    setFlaggedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  if (phase === "results") {
    return <ResultsScreen results={results} totalQuestions={questionIds.length} timed={timed} onBack={() => navigate("/practice")} />;
  }

  const question = questionQuery.data;
  const canSubmit = Boolean(selectedAnswer) && (!confidenceTrackingEnabled || Boolean(confidence));
  const feedbackResult = phase === "feedback" ? results[results.length - 1] : null;

  return (
    <div className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--ledger-ink)] px-5 py-3 md:px-8">
        <div className="flex items-center gap-4">
          <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">{category ?? "Mixed practice"}{timed ? " · timed" : " · untimed"}</p>
          <div className="hidden h-5 w-px bg-[var(--ledger-rule)] sm:block" />
          <p className="text-sm font-semibold text-[var(--ledger-ink)]">Question {index + 1} of {questionIds.length}</p>
        </div>
        <div className="flex items-center gap-4">
          {timed ? (
            <div className="flex items-baseline gap-2">
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">Remaining</span>
              <span className="font-display text-lg font-semibold tabular-nums text-[var(--ledger-ink)]">{formatClock(remainingSeconds)}</span>
            </div>
          ) : (
            <p className="text-xs font-semibold text-muted-foreground">{correctSoFar} correct · {results.length - correctSoFar} missed so far</p>
          )}
          <button type="button" onClick={toggleFlag} className={`flex items-center gap-1.5 border-2 px-2.5 py-1.5 text-xs font-semibold ${flaggedIndexes.has(index) ? "border-[var(--ledger-provisional)] text-[var(--ledger-provisional)]" : "border-[var(--ledger-rule)] text-muted-foreground"}`}>
            <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Flag
          </button>
        </div>
      </div>
      <div className="h-1 bg-[var(--ledger-track)]"><div className="h-full bg-[var(--ledger-ink)]" style={{ width: `${((index + 1) / questionIds.length) * 100}%` }} /></div>

      {!question ? (
        <div className="p-8 text-sm text-muted-foreground">Loading question…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b-2 border-[var(--ledger-rule)] p-6 md:border-b-0 md:border-r-2 md:p-9">
            {question.category ? <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--ledger-accent)]">Stimulus · {question.category}</p> : null}
            <p className="mt-3 text-base leading-7 text-[var(--ledger-ink)]" style={{ textWrap: "pretty" }}>{question.questionText}</p>
            {feedbackResult ? (
              <div className="mt-6 border-t-2 border-[var(--ledger-rule)] pt-5">
                <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">Explanation</p>
                <p className="mt-2 text-sm leading-6 text-[var(--ledger-ink)]" style={{ textWrap: "pretty" }}>{feedbackResult.explanation}</p>
              </div>
            ) : null}
          </div>

          <div className="p-6 md:p-9">
            <div className="flex flex-col gap-3">
              {ANSWER_LETTERS.filter((letter) => letter !== "E" || question.optionE).map((letter) => {
                const optionText = { A: question.optionA, B: question.optionB, C: question.optionC, D: question.optionD, E: question.optionE }[letter];
                const isSelected = selectedAnswer === letter;
                const isCorrectAnswer = feedbackResult && letter === feedbackResult.correctAnswer;
                const isWrongSelected = feedbackResult && isSelected && letter !== feedbackResult.correctAnswer;
                const tone = isCorrectAnswer ? "correct" : isWrongSelected ? "incorrect" : isSelected ? "selected" : "default";
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={phase === "feedback"}
                    onClick={() => setSelectedAnswer(letter)}
                    className={`relative flex items-start gap-3.5 border-2 px-4 py-4 text-left disabled:cursor-default ${
                      tone === "correct" ? "border-[var(--ledger-positive)] bg-[var(--ledger-positive-tint)]"
                      : tone === "incorrect" ? "border-[var(--ledger-negative)] bg-[var(--ledger-negative-tint)]"
                      : tone === "selected" ? "border-[var(--ledger-accent)] bg-[var(--ledger-accent-tint)]"
                      : "border-[var(--ledger-rule)] bg-white"
                    }`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${
                      tone === "correct" ? "bg-[var(--ledger-positive)] text-white"
                      : tone === "incorrect" ? "bg-[var(--ledger-negative)] text-white"
                      : tone === "selected" ? "bg-[var(--ledger-accent)] text-white"
                      : "border-2 border-[var(--ledger-rule)] text-muted-foreground"
                    }`}>{letter}</span>
                    <span className="text-sm leading-6 text-[var(--ledger-ink)]">
                      {optionText}
                      {isCorrectAnswer ? <span className="mt-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--ledger-positive)]">Correct answer</span> : null}
                      {isWrongSelected ? <span className="mt-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--ledger-negative)]">Your answer</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {phase === "answering" && confidenceTrackingEnabled ? (
              <div className="mt-5 flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">How sure?</span>
                {CONFIDENCE_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setConfidence(opt.value)} className={`px-2.5 py-1 text-xs font-semibold ${confidence === opt.value ? "bg-[var(--ledger-ink)] text-white" : "border border-[var(--ledger-rule)] text-muted-foreground"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-4 border-t-2 border-[var(--ledger-rule)] pt-5">
              <p className="text-xs text-muted-foreground">{timed ? "Scoring and explanations unlock when the set is submitted." : "Every attempt counts as evidence."}</p>
              {phase === "answering" ? (
                <button type="button" disabled={!canSubmit || submitMutation.isPending} onClick={handlePrimaryAction} className="min-h-11 bg-[var(--ledger-ink)] px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {timed ? "Next question →" : "Check"}
                </button>
              ) : (
                <button type="button" onClick={advance} className="min-h-11 bg-[var(--ledger-ink)] px-6 text-sm font-bold text-white">Next question →</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsScreen({ results, totalQuestions, timed, onBack }: { results: SubmitResult[]; totalQuestions: number; timed: boolean; onBack: () => void }) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalActiveMs = results.reduce((sum, r) => sum + r.activeTimeMs, 0);
  const flaggedCount = results.filter((r) => r.flagged).length;
  const attempted = results.length;
  const byCategory = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    const key = r.category ?? "Uncategorized";
    const bucket = byCategory.get(key) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (r.isCorrect) bucket.correct += 1;
    byCategory.set(key, bucket);
  }

  return (
    <div className="border-2 border-[var(--ledger-rule)] bg-[var(--ledger-surface)]">
      <div className="flex items-center justify-between border-b-2 border-[var(--ledger-ink)] px-6 py-3 md:px-8">
        <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">Set submitted</p>
        <p className="text-xs font-semibold text-muted-foreground">Evidence recorded ✓</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="border-b-2 border-[var(--ledger-rule)] p-6 md:border-b-0 md:border-r-2 md:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[var(--ledger-ink)] pb-4">
            <div>
              <p className="font-display text-3xl font-semibold text-[var(--ledger-ink)]">{correctCount} of {attempted} correct</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Math.round(totalActiveMs / 1000 / 60)} min elapsed{attempted > 0 ? ` · ${Math.round(totalActiveMs / attempted / 1000)}s average per question` : ""}{flaggedCount > 0 ? ` · ${flaggedCount} flagged` : ""}
                {attempted < totalQuestions ? ` · ${totalQuestions - attempted} not reached` : ""}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="grid grid-cols-[3rem_minmax(0,1fr)_5rem_5rem] gap-2 border-b-2 border-[var(--ledger-rule)] pb-2 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              <span>Q</span><span>Question type</span><span>Time</span><span>Result</span>
            </div>
            {results.map((r) => (
              <div key={r.questionId} className={`grid grid-cols-[3rem_minmax(0,1fr)_5rem_5rem] items-center gap-2 border-b border-[var(--ledger-rule)] py-3 text-sm ${r.isCorrect ? "" : "bg-[var(--ledger-negative-tint)]"}`}>
                <span className="font-semibold">{r.index + 1}</span>
                <span className="text-[var(--ledger-ink)]">{r.category ?? "—"}{!r.isCorrect ? <span className="ml-2 text-xs text-muted-foreground">· picked {r.selectedAnswer}, answer {r.correctAnswer}</span> : null}</span>
                <span className="tabular-nums text-muted-foreground">{Math.round(r.activeTimeMs / 1000)}s</span>
                <span className={`font-semibold ${r.isCorrect ? "text-[var(--ledger-positive)]" : "text-[var(--ledger-negative)]"}`}>{r.isCorrect ? "Correct" : "Missed"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div className="border-2 border-[var(--ledger-rule)] bg-white p-5">
            <p className="font-display text-lg font-semibold text-[var(--ledger-ink)]">This set</p>
            <div className="mt-3 flex flex-col gap-3">
              {Array.from(byCategory.entries()).map(([label, bucket]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs font-semibold"><span>{label}</span><span className="text-muted-foreground">{bucket.correct}/{bucket.total}</span></div>
                  <div className="mt-1.5 h-1.5 bg-[var(--ledger-track)]"><div className="h-full bg-[var(--ledger-ink)]" style={{ width: `${(bucket.correct / bucket.total) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          {timed ? (
            <div className="relative border-2 border-[var(--ledger-rule)] bg-white p-5 pl-6">
              <span className="absolute -left-[2px] -top-[2px] bottom-[-2px] w-1 bg-[var(--ledger-accent)]" />
              <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--ledger-accent)]">Recorded</p>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--ledger-ink)]"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Explanations are available on missed questions above.</p>
            </div>
          ) : null}
          <button type="button" onClick={onBack} className="min-h-11 border-2 border-[var(--ledger-rule)] text-sm font-semibold text-[var(--ledger-ink)]">Back to Practice</button>
        </div>
      </div>
    </div>
  );
}
