/**
 * Feature Flag System
 *
 * Self-hosted feature flags backed by the database.
 * Flags are seeded with defaults on first access and can be toggled
 * from the /admin/flags panel without redeployment.
 *
 * Usage:
 *   const { enabled, loading } = useFeatureFlag('lesson_progress_bar')
 *   if (enabled) return <ProgressBar />
 *
 * Available flag keys (defined in server/db.ts DEFAULT_FLAGS):
 *   - lesson_progress_bar
 *   - assumption_family_arc_cta
 *   - about_testimonials
 *   - ai_lesson_plan_generator
 *   - question_bank
 */

import { trpc } from "@/lib/trpc";
import { useMemo } from "react";

export type FlagKey =
  | "lesson_progress_bar"
  | "assumption_family_arc_cta"
  | "about_testimonials"
  | "ai_lesson_plan_generator"
  | "question_bank";

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
