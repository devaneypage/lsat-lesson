/**
 * Feature Flag System
 *
 * Self-hosted feature flags backed by the database.
 * Flags are seeded with defaults on first access and can be toggled
 * from the /admin/flags panel without redeployment.
 *
 * Usage:
 *   const { enabled, loading } = useFeatureFlag('nexus_dashboard')
 *   if (enabled) return <NexusDashboard />
 *   return <LegacyDashboard />
 *
 * Available flag keys (defined in server/db.ts DEFAULT_FLAGS):
 *
 * ── Legacy Flags ──────────────────────────────────────────────────
 *   lesson_progress_bar       Show progress bar on /lessons hub
 *   assumption_family_arc_cta Show "Next: Flaw in Reasoning →" CTA
 *   about_testimonials        Show testimonials on About page
 *   ai_lesson_plan_generator  Show AI Plan link in nav
 *   question_bank             Show Question Bank link in nav
 *
 * ── Nexus UX Flags ────────────────────────────────────────────────
 *   nexus_dashboard           Enable Nexus two-column dashboard
 *   booking_cta               Show "Book a Session" in nav + recaps
 *   lesson_grid               Show Nexus lesson grid on /lessons
 *   concept_map               Show concept map on dashboard
 *   score_card                Show score card in dashboard sidebar
 */

import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export type FlagKey =
  // Legacy flags
  | "lesson_progress_bar"
  | "assumption_family_arc_cta"
  | "about_testimonials"
  | "ai_lesson_plan_generator"
  | "question_bank"
  // Nexus UX flags
  | "nexus_dashboard"
  | "booking_cta"
  | "lesson_grid"
  | "concept_map"
  | "score_card";

/**
 * Read a single feature flag.
 * Returns { enabled: boolean, loading: boolean }.
 * Falls back to `enabled: false` while loading or on error.
 */
export function useFeatureFlag(key: FlagKey): { enabled: boolean; loading: boolean } {
  const { data, isLoading } = trpc.flags.list.useQuery(undefined, {
    staleTime: 60_000, // cache for 60 s — flags don't change often
    refetchOnWindowFocus: false,
  });

  const enabled = useMemo(() => {
    if (!data) return false;
    const flag = data.find((f) => f.key === key);
    return flag?.enabled ?? false;
  }, [data, key]);

  return { enabled, loading: isLoading };
}

/**
 * Read all feature flags as a key→boolean map.
 * Useful when a component needs to check multiple flags at once.
 */
export function useAllFeatureFlags(): {
  flags: Record<string, boolean>;
  loading: boolean;
  rawFlags: typeof data;
} {
  const { data, isLoading } = trpc.flags.list.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const flags = useMemo(() => {
    if (!data) return {} as Record<string, boolean>;
    return Object.fromEntries(data.map((f) => [f.key, f.enabled]));
  }, [data]);

  return { flags, loading: isLoading, rawFlags: data };
}
