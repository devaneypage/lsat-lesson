import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CURRICULUM_LESSONS } from "@shared/learnerDomain";
import { useEffect, useMemo } from "react";

const PROGRESS_PREFIX = "lsat_lesson_progress_";
const COMPLETION_PREFIX = "lsat_lesson_complete_";
const IMPORT_MARKER_PREFIX = "lsat_legacy_progress_imported_";

function readLegacyProgress() {
  if (typeof window === "undefined") return [];

  return CURRICULUM_LESSONS.flatMap(lesson => {
    try {
      const completed = window.localStorage.getItem(`${COMPLETION_PREFIX}${lesson.id}`) === "1";
      const storedStep = window.localStorage.getItem(`${PROGRESS_PREFIX}${lesson.id}`);
      const parsedStep = storedStep === null ? 0 : Number.parseInt(storedStep, 10);
      const step = Number.isFinite(parsedStep) && parsedStep >= 0 ? parsedStep : 0;
      if (!completed && step === 0) return [];

      return [{
        lessonId: lesson.id,
        status: completed ? "completed" as const : "in_progress" as const,
        step,
        percentComplete: completed ? 100 : undefined,
        completedAt: completed ? new Date() : undefined,
      }];
    } catch {
      return [];
    }
  });
}

export function useLegacyProgressImport() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();
  const mutation = trpc.learner.importLegacyProgress.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.learner.bootstrap.invalidate(),
        utils.learner.progress.invalidate(),
      ]);
    },
  });
  const marker = useMemo(
    () => user ? `${IMPORT_MARKER_PREFIX}${user.id}` : null,
    [user],
  );

  useEffect(() => {
    if (loading || !user || !marker || mutation.isPending) return;

    try {
      if (window.localStorage.getItem(marker) === "1") return;
      const items = readLegacyProgress();
      if (items.length === 0) {
        window.localStorage.setItem(marker, "1");
        return;
      }

      mutation.mutate({ items }, {
        onSuccess: () => {
          try {
            window.localStorage.setItem(marker, "1");
          } catch {
            // The server-side import is idempotent even if this local marker cannot be written.
          }
        },
      });
    } catch {
      // Browser storage may be unavailable; durable learner state still works normally.
    }
  }, [loading, marker, mutation, user]);
}
