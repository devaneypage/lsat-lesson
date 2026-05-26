/**
 * useLessonStepProgress — localStorage-backed progress for lessons that use
 * named string steps (e.g. "intro" | "flaws" | "practice" | "recap").
 *
 * Stores the step index in localStorage, restores on mount.
 * Provides a `resetProgress` function and `hasStarted` boolean.
 *
 * Usage:
 *   const STEPS: FlawStep[] = ["intro", "flaws", "practice", "recap"];
 *   const { currentStep, goTo, resetProgress, hasStarted } =
 *     useLessonStepProgress("common-flaws", STEPS);
 */

import { useState, useCallback } from "react";

const STORAGE_PREFIX = "lsat_lesson_step_";

export function useLessonStepProgress<T extends string>(
  lessonId: string,
  steps: readonly T[]
) {
  const storageKey = `${STORAGE_PREFIX}${lessonId}`;

  const [currentStep, setCurrentStepState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const idx = parseInt(stored, 10);
        if (!isNaN(idx) && idx >= 0 && idx < steps.length) {
          return steps[idx];
        }
      }
    } catch {
      // localStorage unavailable — start fresh
    }
    return steps[0];
  });

  const goTo = useCallback(
    (step: T) => {
      const idx = steps.indexOf(step);
      if (idx === -1) return;
      try {
        localStorage.setItem(storageKey, String(idx));
      } catch {
        // Silently ignore
      }
      setCurrentStepState(step);
    },
    [storageKey, steps]
  );

  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Silently ignore
    }
    setCurrentStepState(steps[0]);
  }, [storageKey, steps]);

  const hasStarted = currentStep !== steps[0];

  return { currentStep, goTo, resetProgress, hasStarted };
}
