import {
  DEFAULT_ACCESSIBILITY_PREFERENCES,
  type AccessibilityPreferences,
} from "@shared/learnerDomain";

export const ACCESSIBILITY_STORAGE_KEY = "devasophy-accessibility-preferences-v1";
export const QUESTION_SEARCH_DEBOUNCE_MS = 280;

export type PreferenceStorage = Pick<Storage, "getItem" | "setItem">;

export function readAccessibilityPreferences(storage?: PreferenceStorage | null): AccessibilityPreferences {
  if (!storage) return DEFAULT_ACCESSIBILITY_PREFERENCES;
  try {
    const stored = JSON.parse(storage.getItem(ACCESSIBILITY_STORAGE_KEY) ?? "null");
    return stored
      ? { ...DEFAULT_ACCESSIBILITY_PREFERENCES, ...stored }
      : DEFAULT_ACCESSIBILITY_PREFERENCES;
  } catch {
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  }
}

export function persistAccessibilityPreferences(
  storage: PreferenceStorage,
  preferences: AccessibilityPreferences,
) {
  storage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(preferences));
}

export function createPreferenceTransition<K extends keyof AccessibilityPreferences>(
  current: AccessibilityPreferences,
  key: K,
  value: AccessibilityPreferences[K],
) {
  return {
    previous: current,
    next: { ...current, [key]: value },
  };
}

export function rollbackPreferenceTransition(
  transition: { previous: AccessibilityPreferences },
) {
  return transition.previous;
}

export function scheduleDebouncedSearch(
  value: string,
  commit: (normalizedValue: string) => void,
  delay = QUESTION_SEARCH_DEBOUNCE_MS,
) {
  const timer = globalThis.setTimeout(() => commit(value.trim()), delay);
  return () => globalThis.clearTimeout(timer);
}

export const TODAY_EVIDENCE_STATUS = {
  title: "Your baseline begins with completed practice",
  body: "Scores, percentiles, and mastery estimates will appear only after the practice system records enough verified attempts. No sample performance data is shown.",
} as const;
