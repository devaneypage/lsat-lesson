import type { Question } from "../drizzle/schema";
import type { ConfidenceLevel } from "./learnerDomain";

export const ANSWER_LETTERS = ["A", "B", "C", "D", "E"] as const;
export type AnswerLetter = (typeof ANSWER_LETTERS)[number];

export const PRACTICE_CONTEXTS = ["practice", "review", "lesson", "diagnostic"] as const;
export type PracticeContext = (typeof PRACTICE_CONTEXTS)[number];

export const MAX_ACTIVE_TIME_MS = 30 * 60 * 1_000;

export type BrowseSafeQuestion = Omit<Question, "correctAnswer" | "explanation">;

export function toBrowseSafeQuestion(question: Question): BrowseSafeQuestion {
  const { correctAnswer: _correctAnswer, explanation: _explanation, ...safeQuestion } = question;
  return safeQuestion;
}

export function normalizeActiveTimeMs(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_ACTIVE_TIME_MS, Math.max(0, Math.round(value)));
}

export function evaluatePracticeSubmission(input: {
  selectedAnswer: AnswerLetter;
  correctAnswer: string;
  confidence: ConfidenceLevel;
  activeTimeMs: number;
}) {
  const isCorrect = input.selectedAnswer === input.correctAnswer;
  const calibration = isCorrect
    ? input.confidence === "certain" ? "well_calibrated" : "underconfident"
    : input.confidence === "certain" ? "overconfident" : "appropriately_uncertain";

  return {
    isCorrect,
    calibration,
    activeTimeMs: normalizeActiveTimeMs(input.activeTimeMs),
  } as const;
}
