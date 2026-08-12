import { describe, expect, it } from "vitest";
import {
  SAMPLE_LOGICAL_REASONING_QUESTIONS,
  SAMPLE_LOGICAL_REASONING_SOURCE,
  validateSampleLogicalReasoningQuestions,
} from "./logicalReasoning";

describe("initial Logical Reasoning sample set", () => {
  it("contains exactly five original, uniquely identified questions", () => {
    expect(SAMPLE_LOGICAL_REASONING_QUESTIONS).toHaveLength(5);
    expect(new Set(SAMPLE_LOGICAL_REASONING_QUESTIONS.map((question) => question.questionId)).size).toBe(5);
    expect(SAMPLE_LOGICAL_REASONING_SOURCE).toBe("LSAT Nexus Original Sample Set");
  });

  it("provides five answer choices and a valid keyed answer for every question", () => {
    expect(() => validateSampleLogicalReasoningQuestions()).not.toThrow();

    for (const question of SAMPLE_LOGICAL_REASONING_QUESTIONS) {
      expect([question.optionA, question.optionB, question.optionC, question.optionD, question.optionE]).toHaveLength(5);
      expect(["A", "B", "C", "D", "E"]).toContain(question.correctAnswer);
      expect(question.explanation.trim().length).toBeGreaterThan(30);
    }
  });
});
