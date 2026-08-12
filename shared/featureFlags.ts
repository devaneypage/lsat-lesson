export const FEATURE_FLAG_KEYS = [
  "lesson_progress_bar",
  "assumption_family_arc_cta",
  "about_testimonials",
  "ai_lesson_plan_generator",
  "question_bank",
  "nexus_dashboard",
  "booking_cta",
  "lesson_grid",
  "concept_map",
  "score_card",
  "learner_dashboard_v2",
  "adaptive_review_queue",
  "question_confidence_tracking",
  "unified_command_search",
  "skill_mastery_map",
  "persistent_study_plans",
  "mistake_journal",
  "accessibility_controls",
  "contextual_orientation",
  "feature_usage_analytics",
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];

export type FeatureFlagEvaluationSource = {
  key: string;
  enabled: boolean | number;
  rolloutPercentage: number;
};

export type FeatureFlagDecision = {
  key: string;
  enabled: boolean;
};

/**
 * Maps a stable subject and flag key to one of 100 rollout buckets.
 * FNV-1a is compact, deterministic across JavaScript runtimes, and adequate
 * for non-cryptographic traffic allocation.
 */
export function getFeatureFlagBucket(flagKey: string, subjectId: string): number {
  const value = `${flagKey}:${subjectId}`;
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0) % 100;
}

export function evaluateFeatureFlag(
  flag: FeatureFlagEvaluationSource,
  subjectId: string
): FeatureFlagDecision {
  const globallyEnabled = flag.enabled === true || flag.enabled === 1;
  const rolloutPercentage = Math.max(0, Math.min(100, flag.rolloutPercentage));

  if (!globallyEnabled || rolloutPercentage === 0) {
    return { key: flag.key, enabled: false };
  }

  if (rolloutPercentage === 100) {
    return { key: flag.key, enabled: true };
  }

  return {
    key: flag.key,
    enabled: getFeatureFlagBucket(flag.key, subjectId) < rolloutPercentage,
  };
}

export function evaluateFeatureFlags(
  flags: FeatureFlagEvaluationSource[],
  subjectId: string
): FeatureFlagDecision[] {
  return flags.map((flag) => evaluateFeatureFlag(flag, subjectId));
}
