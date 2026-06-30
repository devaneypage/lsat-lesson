/**
 * Feature Flag System — Server Tests
 *
 * Tests for the feature flag database helpers:
 *   - getAllFlags()
 *   - getFlagByKey()
 *   - toggleFlag()
 *   - updateFlagRollout()
 *
 * These tests mock the database layer to avoid requiring a live DB connection.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock the DB module ───────────────────────────────────────────────────────

const mockFlags = [
  { id: 1, key: "lesson_progress_bar",       name: "Lesson Progress Bar",       enabled: 1, rolloutPercentage: 100, description: "Progress bar" },
  { id: 2, key: "nexus_dashboard",            name: "Nexus Dashboard",            enabled: 1, rolloutPercentage: 100, description: "Nexus dashboard" },
  { id: 3, key: "booking_cta",               name: "Booking CTA",               enabled: 0, rolloutPercentage: 100, description: "Booking CTA" },
  { id: 4, key: "lesson_grid",               name: "Lesson Grid",               enabled: 1, rolloutPercentage:  75, description: "Lesson grid" },
  { id: 5, key: "concept_map",               name: "Concept Map",               enabled: 1, rolloutPercentage: 100, description: "Concept map" },
  { id: 6, key: "score_card",                name: "Score Card",                enabled: 1, rolloutPercentage: 100, description: "Score card" },
  { id: 7, key: "question_bank",             name: "Question Bank",             enabled: 1, rolloutPercentage: 100, description: "Question bank" },
  { id: 8, key: "ai_lesson_plan_generator",  name: "AI Lesson Plan Generator",  enabled: 1, rolloutPercentage: 100, description: "AI plan" },
  { id: 9, key: "about_testimonials",        name: "About Testimonials",        enabled: 1, rolloutPercentage: 100, description: "Testimonials" },
  { id: 10, key: "assumption_family_arc_cta", name: "Assumption Arc CTA",       enabled: 1, rolloutPercentage: 100, description: "Arc CTA" },
];

// Lightweight in-memory mock of the DB query helpers
vi.mock("../server/db", async () => {
  return {
    getAllFlags: vi.fn(async () => mockFlags),
    getFlagByKey: vi.fn(async (key: string) => mockFlags.find((f) => f.key === key) ?? null),
    toggleFlag: vi.fn(async (key: string, enabled: boolean) => {
      const flag = mockFlags.find((f) => f.key === key);
      if (!flag) return null;
      flag.enabled = enabled ? 1 : 0;
      return flag;
    }),
    updateFlagRollout: vi.fn(async (key: string, pct: number) => {
      const flag = mockFlags.find((f) => f.key === key);
      if (!flag) return null;
      flag.rolloutPercentage = pct;
      return flag;
    }),
  };
});

import {
  getAllFlags,
  getFlagByKey,
  toggleFlag,
  updateFlagRollout,
} from "../server/db";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Feature Flag System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset flag states between tests
    const lp = mockFlags.find((f) => f.key === "lesson_progress_bar");
    if (lp) { lp.enabled = 1; lp.rolloutPercentage = 100; }
    const bc = mockFlags.find((f) => f.key === "booking_cta");
    if (bc) { bc.enabled = 0; bc.rolloutPercentage = 100; }
    const lg = mockFlags.find((f) => f.key === "lesson_grid");
    if (lg) { lg.enabled = 1; lg.rolloutPercentage = 75; }
  });

  describe("getAllFlags()", () => {
    it("returns all 10 flags", async () => {
      const flags = await getAllFlags();
      expect(flags).toHaveLength(10);
    });

    it("includes all required Nexus UX flags", async () => {
      const flags = await getAllFlags();
      const keys = flags.map((f) => f.key);
      expect(keys).toContain("nexus_dashboard");
      expect(keys).toContain("booking_cta");
      expect(keys).toContain("lesson_grid");
      expect(keys).toContain("concept_map");
      expect(keys).toContain("score_card");
    });

    it("includes all legacy flags", async () => {
      const flags = await getAllFlags();
      const keys = flags.map((f) => f.key);
      expect(keys).toContain("lesson_progress_bar");
      expect(keys).toContain("assumption_family_arc_cta");
      expect(keys).toContain("about_testimonials");
      expect(keys).toContain("ai_lesson_plan_generator");
      expect(keys).toContain("question_bank");
    });
  });

  describe("getFlagByKey()", () => {
    it("returns the correct flag by key", async () => {
      const flag = await getFlagByKey("nexus_dashboard");
      expect(flag).not.toBeNull();
      expect(flag?.key).toBe("nexus_dashboard");
      expect(flag?.enabled).toBe(1);
    });

    it("returns null for an unknown key", async () => {
      const flag = await getFlagByKey("nonexistent_flag");
      expect(flag).toBeNull();
    });

    it("returns a disabled flag correctly", async () => {
      const flag = await getFlagByKey("booking_cta");
      expect(flag).not.toBeNull();
      expect(flag?.enabled).toBe(0);
    });
  });

  describe("toggleFlag()", () => {
    it("enables a disabled flag", async () => {
      const updated = await toggleFlag("booking_cta", true);
      expect(updated?.enabled).toBe(1);
    });

    it("disables an enabled flag", async () => {
      const updated = await toggleFlag("lesson_progress_bar", false);
      expect(updated?.enabled).toBe(0);
    });

    it("returns null for an unknown key", async () => {
      const updated = await toggleFlag("nonexistent_flag", true);
      expect(updated).toBeNull();
    });
  });

  describe("updateFlagRollout()", () => {
    it("updates rollout percentage", async () => {
      const updated = await updateFlagRollout("lesson_grid", 50);
      expect(updated?.rolloutPercentage).toBe(50);
    });

    it("accepts 0% rollout (kill switch)", async () => {
      const updated = await updateFlagRollout("nexus_dashboard", 0);
      expect(updated?.rolloutPercentage).toBe(0);
    });

    it("accepts 100% rollout (full rollout)", async () => {
      const updated = await updateFlagRollout("lesson_grid", 100);
      expect(updated?.rolloutPercentage).toBe(100);
    });

    it("returns null for an unknown key", async () => {
      const updated = await updateFlagRollout("nonexistent_flag", 50);
      expect(updated).toBeNull();
    });
  });

  describe("Flag key completeness", () => {
    const EXPECTED_KEYS = [
      // Legacy
      "lesson_progress_bar",
      "assumption_family_arc_cta",
      "about_testimonials",
      "ai_lesson_plan_generator",
      "question_bank",
      // Nexus UX
      "nexus_dashboard",
      "booking_cta",
      "lesson_grid",
      "concept_map",
      "score_card",
    ];

    it("has exactly the expected set of flag keys", async () => {
      const flags = await getAllFlags();
      const actualKeys = flags.map((f) => f.key).sort();
      expect(actualKeys).toEqual(EXPECTED_KEYS.sort());
    });
  });
});
