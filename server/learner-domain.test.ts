import { describe, expect, it } from "vitest";
import {
  ACCESSIBILITY_PREFERENCES,
  CONFIDENCE_LEVELS,
  CURRICULUM_LESSONS,
  CURRICULUM_SKILLS,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  FEATURE_RELEASES,
  MASTERY_FORMULA_VERSION,
  MISTAKE_CATEGORIES,
  PRODUCT_EVENT_NAMES,
  REVIEW_INTERVAL_DAYS,
} from "../shared/learnerDomain";
import { FEATURE_FLAG_KEYS } from "../shared/featureFlags";

describe("learner-domain contracts", () => {
  it("uses unique stable curriculum identifiers and valid prerequisite references", () => {
    const skillIds = CURRICULUM_SKILLS.map(skill => skill.id);
    const lessonIds = CURRICULUM_LESSONS.map(lesson => lesson.id);

    expect(new Set(skillIds).size).toBe(skillIds.length);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);

    for (const skill of CURRICULUM_SKILLS) {
      expect(skill.prerequisites.every(id => skillIds.includes(id))).toBe(true);
    }

    for (const lesson of CURRICULUM_LESSONS) {
      expect(lesson.primarySkillIds.length).toBeGreaterThan(0);
      expect(lesson.primarySkillIds.every(id => skillIds.includes(id))).toBe(true);
      expect(lesson.route).toMatch(/^\//);
      expect(lesson.durationMinutes).toBeGreaterThan(0);
    }
  });

  it("registers every learner capability in the typed feature-flag registry", () => {
    const learnerFlags = FEATURE_RELEASES.map(release => release.key);
    expect(learnerFlags).toHaveLength(10);
    expect(new Set(learnerFlags).size).toBe(learnerFlags.length);
    for (const flag of learnerFlags) {
      expect(FEATURE_FLAG_KEYS).toContain(flag);
    }
  });

  it("keeps controlled vocabularies finite and defaults valid", () => {
    expect(CONFIDENCE_LEVELS).toEqual(["certain", "unsure", "guessed"]);
    expect(new Set(MISTAKE_CATEGORIES).size).toBe(MISTAKE_CATEGORIES.length);
    expect(new Set(PRODUCT_EVENT_NAMES).size).toBe(PRODUCT_EVENT_NAMES.length);

    expect(ACCESSIBILITY_PREFERENCES.textScale).toContain(DEFAULT_ACCESSIBILITY_PREFERENCES.textScale);
    expect(ACCESSIBILITY_PREFERENCES.readingWidth).toContain(DEFAULT_ACCESSIBILITY_PREFERENCES.readingWidth);
    expect(ACCESSIBILITY_PREFERENCES.contrast).toContain(DEFAULT_ACCESSIBILITY_PREFERENCES.contrast);
    expect(ACCESSIBILITY_PREFERENCES.motion).toContain(DEFAULT_ACCESSIBILITY_PREFERENCES.motion);
    expect(ACCESSIBILITY_PREFERENCES.passageFocus).toContain(DEFAULT_ACCESSIBILITY_PREFERENCES.passageFocus);
    expect(ACCESSIBILITY_PREFERENCES.keyboardShortcuts).toContain(DEFAULT_ACCESSIBILITY_PREFERENCES.keyboardShortcuts);
  });

  it("exposes the approved deterministic review cadence and versioned mastery formula", () => {
    expect(REVIEW_INTERVAL_DAYS).toEqual([1, 3, 7, 14, 30]);
    expect(MASTERY_FORMULA_VERSION).toBe(1);
  });
});
