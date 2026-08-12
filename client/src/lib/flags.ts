import { trpc } from "@/lib/trpc";
import type { FeatureFlagKey } from "@shared/featureFlags";
import { useMemo, useState } from "react";

export type FlagKey = FeatureFlagKey;

const VISITOR_ID_STORAGE_KEY = "devasophy-feature-flag-visitor-id";

function createVisitorId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "server-render";

  try {
    const existing = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);
    if (existing) return existing;

    const created = createVisitorId();
    window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return createVisitorId();
  }
}

export function useAllFeatureFlags(): {
  flags: Partial<Record<FlagKey, boolean>>;
  loading: boolean;
  error: Error | null;
  rawFlags: Array<{ key: string; enabled: boolean }> | undefined;
} {
  const [visitorId] = useState(getOrCreateVisitorId);
  const queryInput = useMemo(() => ({ visitorId }), [visitorId]);
  const { data, isLoading, error } = trpc.flags.evaluate.useQuery(queryInput, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const flags = useMemo(() => {
    if (!data) return {} as Partial<Record<FlagKey, boolean>>;
    return Object.fromEntries(
      data.map((decision) => [decision.key, decision.enabled])
    ) as Partial<Record<FlagKey, boolean>>;
  }, [data]);

  return {
    flags,
    loading: isLoading,
    error: error instanceof Error ? error : null,
    rawFlags: data,
  };
}

/**
 * Reads an evaluated feature decision. Unknown, loading, and error states fail
 * closed so incomplete flag data never exposes a gated feature accidentally.
 */
export function useFeatureFlag(key: FlagKey): {
  enabled: boolean;
  loading: boolean;
  error: Error | null;
} {
  const { flags, loading, error } = useAllFeatureFlags();
  return { enabled: flags[key] ?? false, loading, error };
}
