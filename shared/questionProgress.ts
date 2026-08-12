import type { AnswerLetter } from "./practiceEvidence";
import type { ConfidenceLevel } from "./learnerDomain";

export type QuestionAttemptOutcome = {
  attemptId: number;
  questionId: number;
  questionKey: string;
  category: string | null;
  difficulty: string | null;
  source: string | null;
  selectedAnswer: AnswerLetter;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  activeTimeMs: number;
  submittedAt: Date;
};

export type LatestQuestionOutcome = QuestionAttemptOutcome & {
  attemptCount: number;
};

/**
 * Creates one learner-facing outcome per question from an arbitrary attempt
 * history. The most recent attempt is retained, while total attempts remain
 * available for contextual review.
 */
export function summarizeLatestQuestionOutcomes(
  attempts: QuestionAttemptOutcome[],
): LatestQuestionOutcome[] {
  const groups = new Map<number, QuestionAttemptOutcome[]>();
  for (const attempt of attempts) {
    const group = groups.get(attempt.questionId) ?? [];
    group.push(attempt);
    groups.set(attempt.questionId, group);
  }

  return [...groups.values()]
    .map((group) => {
      const latest = [...group].sort((left, right) => {
        const submittedDelta = right.submittedAt.getTime() - left.submittedAt.getTime();
        return submittedDelta !== 0 ? submittedDelta : right.attemptId - left.attemptId;
      })[0]!;
      return { ...latest, attemptCount: group.length };
    })
    .sort((left, right) => {
      const submittedDelta = right.submittedAt.getTime() - left.submittedAt.getTime();
      return submittedDelta !== 0 ? submittedDelta : right.attemptId - left.attemptId;
    });
}
