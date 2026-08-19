import { describe, expect, it } from "vitest";
import { CURRICULUM_LESSONS, CURRICULUM_SKILLS } from "../../shared/learnerDomain";
import { CURRICULUM_PRACTICE_LIBRARY, CURRICULUM_PRACTICE_SUBSKILL_MANIFEST } from "./curriculumPracticeLibrary";
import { assertEvidenceReadyAdvancedSubskillCoverage, assertEvidenceReadyPracticeLibraryProvenance, EVIDENCE_READY_PRACTICE_LIBRARY, EVIDENCE_READY_PRACTICE_REVIEW_MANIFEST, EVIDENCE_READY_SUBSKILL_MANIFEST } from "./evidenceReadyPracticeLibrary";
import { derivePracticeSkillEvidence, evaluatePracticeSubmission } from "../../shared/practiceEvidence";

describe("evidence-ready practice library", () => {
  it("adds six distinct reviewed items for every active lesson", () => {
    expect(EVIDENCE_READY_PRACTICE_LIBRARY).toHaveLength(42);
    for (const lesson of CURRICULUM_LESSONS) {
      expect(EVIDENCE_READY_PRACTICE_LIBRARY.filter((question) => question.lessonId === lesson.id)).toHaveLength(6);
    }
    expect(new Set(EVIDENCE_READY_PRACTICE_LIBRARY.map((question) => question.questionId)).size).toBe(42);
  });

  it("uses the approved one-easy, two-medium, three-hard second-tranche gradient", () => {
    for (const lesson of CURRICULUM_LESSONS) {
      const items = EVIDENCE_READY_PRACTICE_LIBRARY.filter((question) => question.lessonId === lesson.id);
      expect(items.filter((question) => question.difficulty === "easy")).toHaveLength(1);
      expect(items.filter((question) => question.difficulty === "medium")).toHaveLength(2);
      expect(items.filter((question) => question.difficulty === "hard")).toHaveLength(3);
    }
  });

  it("maintains canonical skill mappings, complete answers, and reviewed original-content provenance", () => {
    const skillIds = new Set(CURRICULUM_SKILLS.map((skill) => skill.id));
    expect(EVIDENCE_READY_PRACTICE_REVIEW_MANIFEST).toHaveLength(42);
    expect(() => assertEvidenceReadyPracticeLibraryProvenance()).not.toThrow();
    for (const question of EVIDENCE_READY_PRACTICE_LIBRARY) {
      expect(question.skillMappings.every((mapping) => skillIds.has(mapping.skillId))).toBe(true);
      expect([question.optionA, question.optionB, question.optionC, question.optionD, question.optionE].every((option) => option.trim().length > 0)).toBe(true);
      expect(question.explanation.trim().length).toBeGreaterThan(20);
    }
  });

  it("brings the combined practice library to twelve items with a three-easy, five-medium, four-hard lesson distribution", () => {
    const combined = [...CURRICULUM_PRACTICE_LIBRARY, ...EVIDENCE_READY_PRACTICE_LIBRARY];
    expect(combined).toHaveLength(84);
    for (const lesson of CURRICULUM_LESSONS) {
      const items = combined.filter((question) => question.lessonId === lesson.id);
      expect(items).toHaveLength(12);
      expect(items.filter((question) => question.difficulty === "easy")).toHaveLength(3);
      expect(items.filter((question) => question.difficulty === "medium")).toHaveLength(5);
      expect(items.filter((question) => question.difficulty === "hard")).toHaveLength(4);
    }
  });

  it("records six reviewed, non-duplicative advanced subskills for every lesson", () => {
    expect(EVIDENCE_READY_SUBSKILL_MANIFEST).toHaveLength(42);
    expect(() => assertEvidenceReadyAdvancedSubskillCoverage()).not.toThrow();
    for (const lesson of CURRICULUM_LESSONS) {
      const introductory = new Set(CURRICULUM_PRACTICE_SUBSKILL_MANIFEST.filter((record) => record.lessonId === lesson.id).map((record) => record.subskill));
      const advanced = EVIDENCE_READY_SUBSKILL_MANIFEST.filter((record) => record.lessonId === lesson.id).map((record) => record.subskill);
      expect(advanced).toHaveLength(6);
      expect(advanced.some((subskill) => introductory.has(subskill))).toBe(false);
    }
  });

  it("uses substantively distinct stems from the first-tranche patterns within each lesson", () => {
    const meaningfulTokens = (text: string) => new Set(text.toLowerCase().match(/[a-z]{5,}/g)?.filter((token) => !["which", "following", "argument", "conclusion", "because", "therefore", "assumption"].includes(token)) ?? []);
    const overlap = (left: Set<string>, right: Set<string>) => [...left].filter((token) => right.has(token)).length / Math.max(1, Math.min(left.size, right.size));
    for (const advanced of EVIDENCE_READY_PRACTICE_LIBRARY) {
      const advancedTokens = meaningfulTokens(advanced.questionText);
      const firstTrancheItems = CURRICULUM_PRACTICE_LIBRARY.filter((question) => question.lessonId === advanced.lessonId);
      expect(firstTrancheItems.some((introductory) => introductory.questionText.trim() === advanced.questionText.trim())).toBe(false);
      expect(Math.max(...firstTrancheItems.map((introductory) => overlap(advancedTokens, meaningfulTokens(introductory.questionText))))).toBeLessThan(0.7);
    }
  });

  it("remains eligible for the existing answer, calibration, and timing evidence contract", () => {
    for (const question of EVIDENCE_READY_PRACTICE_LIBRARY) {
      const result = evaluatePracticeSubmission({ selectedAnswer: question.correctAnswer, correctAnswer: question.correctAnswer, confidence: "certain", activeTimeMs: 12_000 });
      expect(result.isCorrect).toBe(true);
      expect(result.calibration).toBe("well_calibrated");
      expect(result.activeTimeMs).toBe(12_000);
      expect(derivePracticeSkillEvidence({ questionId: 1, mappings: question.skillMappings, isCorrect: result.isCorrect })).toEqual(question.skillMappings.map((mapping) => ({ questionId: 1, ...mapping, isCorrect: true })));
    }
  });
});
