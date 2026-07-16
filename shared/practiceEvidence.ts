import type { Question } from "../drizzle/schema";
import type { ConfidenceLevel } from "./learnerDomain";

export const ANSWER_LETTERS = ["A", "B", "C", "D", "E"] as const;
export type AnswerLetter = (typeof ANSWER_LETTERS)[number];

export const PRACTICE_CONTEXTS = ["practice", "review", "lesson", "diagnostic"] as const;
export type PracticeContext = (typeof PRACTICE_CONTEXTS)[number];

export const MAX_ACTIVE_TIME_MS = 30 * 60 * 1_000;
export const PRACTICE_DISCOVERY_BATCH_MAX = 50;
export const PRACTICE_RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;

export type BrowseSafeQuestion = Omit<Question, "correctAnswer" | "explanation">;

export function toBrowseSafeQuestion(question: Question): BrowseSafeQuestion {
  const { correctAnswer: _correctAnswer, explanation: _explanation, ...safeQuestion } = question;
  return safeQuestion;
}

export function normalizeActiveTimeMs(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_ACTIVE_TIME_MS, Math.max(0, Math.round(value)));
}

export const CALIBRATION_STATES = [
  "well_calibrated",
  "underconfident",
  "overconfident",
  "appropriately_uncertain",
] as const;
export type CalibrationState = (typeof CALIBRATION_STATES)[number];

export function getCalibrationState(isCorrect: boolean, confidence: ConfidenceLevel): CalibrationState {
  if (isCorrect) return confidence === "certain" ? "well_calibrated" : "underconfident";
  return confidence === "certain" ? "overconfident" : "appropriately_uncertain";
}

export function evaluatePracticeSubmission(input: {
  selectedAnswer: AnswerLetter;
  correctAnswer: string;
  confidence: ConfidenceLevel;
  activeTimeMs: number;
}) {
  const isCorrect = input.selectedAnswer === input.correctAnswer;

  return {
    isCorrect,
    calibration: getCalibrationState(isCorrect, input.confidence),
    activeTimeMs: normalizeActiveTimeMs(input.activeTimeMs),
  } as const;
}

/** Minimal per-attempt evidence used for aggregate calibration metrics. */
export type PracticeAttemptEvidence = {
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  activeTimeMs: number;
  submittedAt: Date | string | number;
};

export type ConfidenceBreakdown = {
  attempts: number;
  correct: number;
  accuracyPercent: number | null;
};

export type PracticeSummary = {
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercent: number | null;
  byConfidence: Record<ConfidenceLevel, ConfidenceBreakdown>;
  calibration: Record<CalibrationState, number>;
  averageActiveTimeMs: number | null;
  medianActiveTimeMs: number | null;
  recentAttemptCount: number;
};

function toPercent(correct: number, attempts: number) {
  return attempts === 0 ? null : Math.round((correct / attempts) * 100);
}

function medianOfSorted(sorted: number[]) {
  if (sorted.length === 0) return null;
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

/**
 * Aggregates one learner's attempts into privacy-safe calibration and timing
 * metrics. Pure and deterministic so score fixtures stay stable across
 * releases; no question text or private learner text is ever read here.
 */
export function summarizePracticeAttempts(
  attempts: PracticeAttemptEvidence[],
  now: Date | string | number = new Date(),
): PracticeSummary {
  const nowMs = new Date(now).getTime();
  const byConfidence: Record<ConfidenceLevel, ConfidenceBreakdown> = {
    certain: { attempts: 0, correct: 0, accuracyPercent: null },
    unsure: { attempts: 0, correct: 0, accuracyPercent: null },
    guessed: { attempts: 0, correct: 0, accuracyPercent: null },
  };
  const calibration: Record<CalibrationState, number> = {
    well_calibrated: 0,
    underconfident: 0,
    overconfident: 0,
    appropriately_uncertain: 0,
  };
  const activeTimes: number[] = [];
  let correctAttempts = 0;
  let recentAttemptCount = 0;

  for (const attempt of attempts) {
    const isCorrect = attempt.isCorrect === true;
    if (isCorrect) correctAttempts += 1;

    const bucket = byConfidence[attempt.confidence] ?? byConfidence.unsure;
    bucket.attempts += 1;
    if (isCorrect) bucket.correct += 1;

    calibration[getCalibrationState(isCorrect, attempt.confidence)] += 1;
    activeTimes.push(normalizeActiveTimeMs(attempt.activeTimeMs));

    const submittedMs = new Date(attempt.submittedAt).getTime();
    if (Number.isFinite(submittedMs) && submittedMs <= nowMs && nowMs - submittedMs <= PRACTICE_RECENT_WINDOW_MS) {
      recentAttemptCount += 1;
    }
  }

  for (const confidence of ["certain", "unsure", "guessed"] as const) {
    const bucket = byConfidence[confidence];
    bucket.accuracyPercent = toPercent(bucket.correct, bucket.attempts);
  }

  activeTimes.sort((a, b) => a - b);
  const totalActiveTime = activeTimes.reduce((sum, value) => sum + value, 0);

  return {
    totalAttempts: attempts.length,
    correctAttempts,
    accuracyPercent: toPercent(correctAttempts, attempts.length),
    byConfidence,
    calibration,
    averageActiveTimeMs: activeTimes.length === 0 ? null : Math.round(totalActiveTime / activeTimes.length),
    medianActiveTimeMs: medianOfSorted(activeTimes),
    recentAttemptCount,
  };
}
