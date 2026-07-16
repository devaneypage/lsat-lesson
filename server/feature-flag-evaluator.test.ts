import { describe, expect, it } from "vitest";
import {
  evaluateFeatureFlag,
  evaluateFeatureFlags,
  getFeatureFlagBucket,
} from "../shared/featureFlags";

describe("feature-flag evaluation", () => {
  it("assigns the same subject and flag to a stable bucket", () => {
    const first = getFeatureFlagBucket("lesson_grid", "visitor-123");
    const second = getFeatureFlagBucket("lesson_grid", "visitor-123");

    expect(second).toBe(first);
    expect(first).toBeGreaterThanOrEqual(0);
    expect(first).toBeLessThan(100);
  });

  it("keeps a disabled flag off regardless of rollout percentage", () => {
    expect(
      evaluateFeatureFlag(
        { key: "booking_cta", enabled: false, rolloutPercentage: 100 },
        "visitor-123"
      )
    ).toEqual({ key: "booking_cta", enabled: false });
  });

  it("handles zero and full rollout boundaries", () => {
    expect(
      evaluateFeatureFlag(
        { key: "concept_map", enabled: true, rolloutPercentage: 0 },
        "visitor-123"
      ).enabled
    ).toBe(false);

    expect(
      evaluateFeatureFlag(
        { key: "concept_map", enabled: true, rolloutPercentage: 100 },
        "visitor-123"
      ).enabled
    ).toBe(true);
  });

  it("produces deterministic mixed decisions for a partial rollout", () => {
    const decisions = Array.from({ length: 1_000 }, (_, index) =>
      evaluateFeatureFlag(
        { key: "nexus_dashboard", enabled: true, rolloutPercentage: 50 },
        `visitor-${index}`
      ).enabled
    );
    const enabledCount = decisions.filter(Boolean).length;

    expect(enabledCount).toBeGreaterThan(400);
    expect(enabledCount).toBeLessThan(600);
  });

  it("evaluates a collection while preserving flag keys", () => {
    expect(
      evaluateFeatureFlags(
        [
          { key: "lesson_grid", enabled: true, rolloutPercentage: 100 },
          { key: "booking_cta", enabled: false, rolloutPercentage: 100 },
        ],
        "visitor-123"
      )
    ).toEqual([
      { key: "lesson_grid", enabled: true },
      { key: "booking_cta", enabled: false },
    ]);
  });
});
