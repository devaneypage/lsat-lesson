/**
 * useLessonProgress — localStorage-backed progress persistence for lesson pages.
 *
 * Stores `currentStep` per lesson ID so students can resume where they left off.
 * Provides a `resetProgress` function that clears the stored step and returns to 0.
 *
 * Usage:
 *   const { currentStep, setCurrentStep, resetProgress, hasStarted } = useLessonProgress("necessary-assumptions");
 */

import { useState, useCallback } from "react";

const STORAGE_PREFIX = "lsat_lesson_progress_";

export function useLessonProgress(lessonId: string) {
  const storageKey = `${STORAGE_PREFIX}${lessonId}`;

  const [currentStep, setCurrentStepState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
      }
    } catch {
      // localStorage unavailable (private browsing, etc.) — start fresh
    }
    return 0;
  });

  const setCurrentStep = useCallback(
    (updater: number | ((prev: number) => number)) => {
      setCurrentStepState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        try {
          localStorage.setItem(storageKey, String(next));
        } catch {
          // Silently ignore write failures
        }
        return next;
      });
    },
    [storageKey]
  );

  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Silently ignore
    }
    setCurrentStepState(0);
  }, [storageKey]);

  const hasStarted = currentStep > 0;

  return { currentStep, setCurrentStep, resetProgress, hasStarted };
}
