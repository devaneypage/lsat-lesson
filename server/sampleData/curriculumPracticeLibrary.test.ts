import { describe, expect, it } from "vitest";
import { CURRICULUM_LESSONS, CURRICULUM_SKILLS } from "../../shared/learnerDomain";
import { assertCurriculumPracticeLibraryProvenance, CURRICULUM_PRACTICE_LIBRARY, CURRICULUM_PRACTICE_REVIEW_MANIFEST } from "./curriculumPracticeLibrary";

describe("curriculum practice library", () => {
  it("contains exactly six original practice items for every active lesson", () => {
    expect(CURRICULUM_PRACTICE_LIBRARY).toHaveLength(42);
    for (const lesson of CURRICULUM_LESSONS) {
      expect(CURRICULUM_PRACTICE_LIBRARY.filter((question) => question.lessonId === lesson.id)).toHaveLength(6);
    }
  });

  it("keeps complete answer, explanation, taxonomy, and skill-mapping contracts", () => {
    const skillIds = new Set(CURRICULUM_SKILLS.map((skill) => skill.id));
    const ids = new Set<string>();
    for (const question of CURRICULUM_PRACTICE_LIBRARY) {
      expect(ids.has(question.questionId)).toBe(false);
      ids.add(question.questionId);
      expect([question.optionA, question.optionB, question.optionC, question.optionD, question.optionE].every((option) => option.trim().length > 0)).toBe(true);
      expect(["A", "B", "C", "D", "E"]).toContain(question.correctAnswer);
      expect(question.explanation.trim().length).toBeGreaterThan(20);
      expect(question.skillMappings.length).toBeGreaterThan(0);
      expect(question.skillMappings.every((mapping) => skillIds.has(mapping.skillId))).toBe(true);
      expect(`${question.questionText} ${question.explanation}`.toLowerCase()).not.toContain("logic game");
    }
  });

  it("uses the approved two-easy, three-medium, one-hard instructional gradient for every lesson", () => {
    for (const lesson of CURRICULUM_LESSONS) {
      const items = CURRICULUM_PRACTICE_LIBRARY.filter((question) => question.lessonId === lesson.id);
      expect(items.filter((question) => question.difficulty === "easy")).toHaveLength(2);
      expect(items.filter((question) => question.difficulty === "medium")).toHaveLength(3);
      expect(items.filter((question) => question.difficulty === "hard")).toHaveLength(1);
    }
  });

  it("requires a reviewed original-content provenance record for every seeded item", () => {
    expect(CURRICULUM_PRACTICE_REVIEW_MANIFEST).toHaveLength(42);
    expect(() => assertCurriculumPracticeLibraryProvenance()).not.toThrow();
  });
});
