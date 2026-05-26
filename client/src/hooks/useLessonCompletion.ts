/**
 * useLessonCompletion — marks a lesson as complete in localStorage.
 *
 * Writes a `lsat_lesson_complete_{lessonId}` flag when `markComplete()` is called.
 * The Dashboard reads these flags to show green checkmarks on lesson cards.
 *
 * Usage:
 *   const { isComplete, markComplete } = useLessonCompletion("necessary-assumptions");
 */

import { useState, useCallback } from "react";

const COMPLETION_PREFIX = "lsat_lesson_complete_";

export function useLessonCompletion(lessonId: string) {
  const storageKey = `${COMPLETION_PREFIX}${lessonId}`;

  const [isComplete, setIsComplete] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  });

  const markComplete = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // Silently ignore write failures
    }
    setIsComplete(true);
  }, [storageKey]);

  return { isComplete, markComplete };
}

/**
 * Reads completion state for a given lesson ID without a React component.
 * Used by Dashboard.tsx to check all lessons at once.
 */
export function getLessonCompletion(lessonId: string): boolean {
  try {
    return localStorage.getItem(`${COMPLETION_PREFIX}${lessonId}`) === "1";
  } catch {
    return false;
  }
}
