import { describe, expect, it, vi } from "vitest";
import { EVIDENCE_READY_PRACTICE_LIBRARY } from "./sampleData/evidenceReadyPracticeLibrary";

const selectedQuestion = EVIDENCE_READY_PRACTICE_LIBRARY[0]!;
const questionRow = { id: 8407, correctAnswer: selectedQuestion.correctAnswer, explanation: selectedQuestion.explanation };
const persistedAttempt = {
  id: 901,
  userId: 41,
  questionId: questionRow.id,
  idempotencyKey: "evidence-ready-attempt-0001",
  selectedAnswer: selectedQuestion.correctAnswer,
  isCorrect: 1,
  confidence: "certain" as const,
  activeTimeMs: 9_000,
};

function selectBuilder(result: unknown, needsLimit: boolean) {
  return {
    from: vi.fn(() => ({
      where: vi.fn(() => needsLimit ? { limit: vi.fn().mockResolvedValue(result) } : Promise.resolve(result)),
    })),
  };
}

it("returns persisted nexus-84 skill mappings as practice-submission mastery evidence", async () => {
  const selectResults: Array<{ result: unknown; needsLimit: boolean }> = [
    { result: [questionRow], needsLimit: true },
    { result: selectedQuestion.skillMappings, needsLimit: false },
    { result: [], needsLimit: true },
    { result: [persistedAttempt], needsLimit: true },
  ];
  const tx = {
    select: vi.fn(() => {
      const next = selectResults.shift();
      if (!next) throw new Error("Unexpected select call");
      return selectBuilder(next.result, next.needsLimit);
    }),
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
  };
  const db = { transaction: vi.fn(async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx)) };

  vi.resetModules();
  vi.doMock("./db", () => ({ getDb: vi.fn().mockResolvedValue(db) }));
  const { submitPracticeAttempt } = await import("./repositories/practice");

  const result = await submitPracticeAttempt({
    userId: 41,
    questionId: questionRow.id,
    idempotencyKey: persistedAttempt.idempotencyKey,
    selectedAnswer: selectedQuestion.correctAnswer,
    confidence: "certain",
    activeTimeMs: 9_000,
    context: "practice",
  });

  expect(result).toMatchObject({ isCorrect: true, calibration: "well_calibrated", idempotentReplay: false });
  expect(result?.skillEvidence).toEqual(selectedQuestion.skillMappings.map((mapping) => ({ questionId: questionRow.id, ...mapping, isCorrect: true })));
  expect(tx.select).toHaveBeenCalledTimes(4);
});
