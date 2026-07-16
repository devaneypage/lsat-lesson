export const CONFIDENCE_LEVELS = ["certain", "unsure", "guessed"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const LESSON_PROGRESS_STATUSES = ["not_started", "in_progress", "completed"] as const;
export type LessonProgressStatus = (typeof LESSON_PROGRESS_STATUSES)[number];

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
export const REVIEW_DAILY_CAP = 20;
export const MASTERY_FORMULA_VERSION = 1;

export const MISTAKE_CATEGORIES = [
  "misread_stem",
  "missed_conclusion",
  "conditional_logic",
  "causal_reasoning",
  "scope_shift",
  "quantifier_error",
  "unsupported_inference",
  "attractive_distractor",
  "timing_pressure",
  "other",
] as const;
export type MistakeCategory = (typeof MISTAKE_CATEGORIES)[number];

export const ACCESSIBILITY_PREFERENCES = {
  textScale: ["default", "large", "extra_large"],
  readingWidth: ["comfortable", "wide", "full"],
  contrast: ["default", "high"],
  motion: ["system", "reduced"],
  passageFocus: ["off", "on"],
  keyboardShortcuts: ["off", "on"],
} as const;

export type AccessibilityPreferences = {
  textScale: (typeof ACCESSIBILITY_PREFERENCES.textScale)[number];
  readingWidth: (typeof ACCESSIBILITY_PREFERENCES.readingWidth)[number];
  contrast: (typeof ACCESSIBILITY_PREFERENCES.contrast)[number];
  motion: (typeof ACCESSIBILITY_PREFERENCES.motion)[number];
  passageFocus: (typeof ACCESSIBILITY_PREFERENCES.passageFocus)[number];
  keyboardShortcuts: (typeof ACCESSIBILITY_PREFERENCES.keyboardShortcuts)[number];
};

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  textScale: "default",
  readingWidth: "comfortable",
  contrast: "default",
  motion: "system",
  passageFocus: "off",
  keyboardShortcuts: "on",
};

export const PRODUCT_EVENT_NAMES = [
  "dashboard_viewed",
  "dashboard_action_started",
  "lesson_viewed",
  "lesson_completed",
  "question_discovered",
  "question_started",
  "question_submitted",
  "question_completed",
  "review_queue_viewed",
  "review_completed",
  "mistake_journal_saved",
  "search_opened",
  "search_result_selected",
  "study_plan_viewed",
  "study_plan_task_completed",
  "feature_exposed",
] as const;
export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];

export const PRODUCT_EVENT_METADATA_KEYS = [
  "surface",
  "route",
  "contentType",
  "contentId",
  "resultType",
  "queryLengthBucket",
  "flagKey",
  "flagVariant",
  "status",
] as const;
export type ProductEventMetadataKey = (typeof PRODUCT_EVENT_METADATA_KEYS)[number];
export type ProductEventMetadata = Partial<Record<ProductEventMetadataKey, string>>;

export const FEATURE_RELEASES = [
  { key: "learner_dashboard_v2", name: "Continue Learning Dashboard", description: "Aggregated learner next-action dashboard." },
  { key: "adaptive_review_queue", name: "Adaptive Review Queue", description: "Deterministic spaced-review scheduling and queue." },
  { key: "question_confidence_tracking", name: "Question Confidence Tracking", description: "Pre-answer confidence and calibration evidence." },
  { key: "unified_command_search", name: "Unified Search", description: "Global command palette and curriculum/question search." },
  { key: "skill_mastery_map", name: "Skill Mastery Map", description: "Explainable skill-level mastery and evidence views." },
  { key: "persistent_study_plans", name: "Persistent Study Plans", description: "Versioned, editable learner study plans." },
  { key: "mistake_journal", name: "Mistake Journal", description: "Private controlled-taxonomy reflection records." },
  { key: "accessibility_controls", name: "Accessibility Controls", description: "Persistent reading and interaction preferences." },
  { key: "contextual_orientation", name: "Contextual Orientation", description: "Reusable page purpose, prerequisite, and next-step context." },
  { key: "feature_usage_analytics", name: "Feature Usage Analytics", description: "Privacy-safe aggregate product analytics." },
] as const;
export type LearnerFeatureFlagKey = (typeof FEATURE_RELEASES)[number]["key"];

export type CurriculumSkill = {
  id: string;
  title: string;
  section: "LR" | "RC" | "Logic";
  description: string;
  prerequisites: string[];
};

export type CurriculumLesson = {
  id: string;
  sequence: number;
  title: string;
  description: string;
  route: string;
  durationMinutes: number;
  section: CurriculumSkill["section"];
  primarySkillIds: string[];
  prerequisites: string[];
};

export const CURRICULUM_SKILLS: CurriculumSkill[] = [
  { id: "argument-core", title: "Argument Core", section: "LR", description: "Identify conclusions, premises, and logical gaps.", prerequisites: [] },
  { id: "necessary-assumption", title: "Necessary Assumption", section: "LR", description: "Identify claims an argument requires and apply negation.", prerequisites: ["argument-core"] },
  { id: "sufficient-assumption", title: "Sufficient Assumption", section: "LR", description: "Complete an argument by supplying a logically sufficient bridge.", prerequisites: ["argument-core"] },
  { id: "flaw-recognition", title: "Flaw Recognition", section: "LR", description: "Diagnose recurring invalid reasoning patterns.", prerequisites: ["argument-core"] },
  { id: "strengthen-weaken", title: "Strengthen and Weaken", section: "LR", description: "Evaluate how new information changes argumentative support.", prerequisites: ["argument-core"] },
  { id: "passage-structure", title: "Passage Structure", section: "RC", description: "Map viewpoint, purpose, organization, and evidence.", prerequisites: [] },
  { id: "conditional-logic", title: "Conditional Logic", section: "Logic", description: "Translate and reason with conditional relationships and quantifiers.", prerequisites: [] },
];

export const CURRICULUM_LESSONS: CurriculumLesson[] = [
  { id: "necessary-assumptions", sequence: 1, title: "Necessary Assumptions", description: "Master the Negation Test™ to identify unstated premises.", route: "/lessons/necessary-assumptions", durationMinutes: 14, section: "LR", primarySkillIds: ["argument-core", "necessary-assumption"], prerequisites: [] },
  { id: "sufficient-assumptions", sequence: 2, title: "Sufficient Assumptions", description: "Use conditional bridges to complete arguments.", route: "/lessons/sufficient-assumptions", durationMinutes: 16, section: "LR", primarySkillIds: ["argument-core", "sufficient-assumption"], prerequisites: ["necessary-assumptions"] },
  { id: "flaw-in-reasoning", sequence: 3, title: "Flaw in Reasoning", description: "Identify logical fallacies and argument weaknesses.", route: "/lessons/flaw-in-reasoning", durationMinutes: 15, section: "LR", primarySkillIds: ["argument-core", "flaw-recognition"], prerequisites: ["necessary-assumptions"] },
  { id: "common-flaws", sequence: 4, title: "Common Flaws", description: "Learn the most frequently tested reasoning errors.", route: "/lessons/common-flaws", durationMinutes: 18, section: "LR", primarySkillIds: ["flaw-recognition"], prerequisites: ["flaw-in-reasoning"] },
  { id: "strengthen-weaken", sequence: 5, title: "Strengthen & Weaken", description: "Evaluate evidence that changes argumentative support.", route: "/lessons/strengthen-weaken", durationMinutes: 16, section: "LR", primarySkillIds: ["argument-core", "strengthen-weaken"], prerequisites: ["necessary-assumptions"] },
  { id: "reading-comprehension", sequence: 6, title: "Reading Comprehension", description: "Build an efficient passage map and viewpoint model.", route: "/lessons/reading-comprehension", durationMinutes: 15, section: "RC", primarySkillIds: ["passage-structure"], prerequisites: [] },
  { id: "formal-logic", sequence: 7, title: "Formal Logic", description: "Master notation, conditional relationships, and quantifiers.", route: "/lessons/formal-logic", durationMinutes: 17, section: "Logic", primarySkillIds: ["conditional-logic"], prerequisites: [] },
];

export function getLessonById(id: string) {
  return CURRICULUM_LESSONS.find((lesson) => lesson.id === id);
}

export function getSkillById(id: string) {
  return CURRICULUM_SKILLS.find((skill) => skill.id === id);
}

export function sanitizeProductEventMetadata(input: Record<string, unknown>): ProductEventMetadata {
  const allowed = new Set<string>(PRODUCT_EVENT_METADATA_KEYS);
  return Object.fromEntries(
    Object.entries(input)
      .filter(([key, value]) => allowed.has(key) && typeof value === "string")
      .map(([key, value]) => [key, String(value).slice(0, 160)]),
  ) as ProductEventMetadata;
}
