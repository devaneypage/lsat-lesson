import { afterEach, describe, expect, it, vi } from "vitest";
import { CURRICULUM_LESSONS, DEFAULT_ACCESSIBILITY_PREFERENCES } from "../shared/learnerDomain";
import { buildContinueLearning } from "./learnerDb";
import { escapeSearchLikePattern } from "./searchDb";
import {
  createPreferenceTransition,
  persistAccessibilityPreferences,
  readAccessibilityPreferences,
  rollbackPreferenceTransition,
  scheduleDebouncedSearch,
} from "../client/src/lib/learnerExperience";

function progress(
  lessonId: string,
  status: "not_started" | "in_progress" | "completed",
  lastAccessedAt: Date,
  percentComplete = status === "completed" ? 100 : 0,
) {
  return {
    lessonId,
    status,
    step: Math.round(percentComplete / 10),
    percentComplete,
    lastAccessedAt,
    completedAt: status === "completed" ? lastAccessedAt : null,
  };
}

describe("Continue Learning aggregation", () => {
  const lessons = CURRICULUM_LESSONS.slice(0, 3);

  it("presents the first canonical lesson when durable progress is empty", () => {
    const result = buildContinueLearning([], lessons);

    expect(result.state).toBe("empty");
    expect(result.primaryAction?.kind).toBe("start");
    expect(result.primaryAction?.lesson.id).toBe(lessons[0].id);
    expect(result.summary).toMatchObject({ completedLessons: 0, inProgressLessons: 0, percentComplete: 0 });
  });

  it("resumes the most recently accessed in-progress lesson before proposing an unstarted one", () => {
    const result = buildContinueLearning([
      progress(lessons[0].id, "in_progress", new Date("2026-07-01T10:00:00Z"), 30),
      progress(lessons[1].id, "in_progress", new Date("2026-07-02T10:00:00Z"), 60),
    ], lessons);

    expect(result.state).toBe("active");
    expect(result.primaryAction).toMatchObject({
      kind: "resume",
      lesson: { id: lessons[1].id },
      progress: { percentComplete: 60 },
    });
    expect(result.recentLessons.map(item => item.lesson.id)).toEqual([lessons[1].id, lessons[0].id]);
  });

  it("reports completion and reviews the most recently completed lesson when all lessons are done", () => {
    const completed = lessons.map((lesson, index) =>
      progress(lesson.id, "completed", new Date(`2026-07-0${index + 1}T10:00:00Z`)),
    );
    const result = buildContinueLearning(completed, lessons);

    expect(result.state).toBe("completed");
    expect(result.summary).toMatchObject({
      completedLessons: lessons.length,
      remainingLessons: 0,
      percentComplete: 100,
    });
    expect(result.primaryAction).toMatchObject({ kind: "review", lesson: { id: lessons[2].id } });
  });
});

describe("question search normalization", () => {
  it("escapes MySQL LIKE wildcards and backslashes without changing ordinary text", () => {
    expect(escapeSearchLikePattern("necessary assumption")).toBe("necessary assumption");
    expect(escapeSearchLikePattern("50%_match\\path")).toBe("50\\%\\_match\\\\path");
  });
});

describe("command search debounce", () => {
  afterEach(() => vi.useRealTimers());

  it("commits only after the configured pause and supports cancellation", () => {
    vi.useFakeTimers();
    const commit = vi.fn();
    const cancel = scheduleDebouncedSearch("  flaw  ", commit, 280);

    vi.advanceTimersByTime(279);
    expect(commit).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(commit).toHaveBeenCalledWith("flaw");

    const cancelled = vi.fn();
    const cancelSecond = scheduleDebouncedSearch("logic", cancelled, 280);
    cancelSecond();
    vi.advanceTimersByTime(280);
    expect(cancelled).not.toHaveBeenCalled();
    cancel();
  });
});

describe("accessibility preference persistence", () => {
  function memoryStorage(initial?: string) {
    const values = new Map<string, string>();
    if (initial !== undefined) values.set("devasophy-accessibility-preferences-v1", initial);
    return {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
  }

  it("round-trips a complete preference record and falls back safely for malformed local data", () => {
    const storage = memoryStorage();
    const preferences = { ...DEFAULT_ACCESSIBILITY_PREFERENCES, textScale: "large" as const, contrast: "high" as const };

    persistAccessibilityPreferences(storage, preferences);
    expect(readAccessibilityPreferences(storage)).toEqual(preferences);
    expect(readAccessibilityPreferences(memoryStorage("not-json"))).toEqual(DEFAULT_ACCESSIBILITY_PREFERENCES);
  });

  it("retains the prior record so an optimistic preference change can be rolled back", () => {
    const transition = createPreferenceTransition(DEFAULT_ACCESSIBILITY_PREFERENCES, "motion", "reduced");

    expect(transition.next.motion).toBe("reduced");
    expect(rollbackPreferenceTransition(transition)).toEqual(DEFAULT_ACCESSIBILITY_PREFERENCES);
  });
});
