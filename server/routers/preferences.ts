import { z } from "zod";
import { ACCESSIBILITY_PREFERENCES } from "../../shared/learnerDomain";
import { protectedProcedure, router } from "../_core/trpc";
import { getLearnerPreferences, updateLearnerPreferences } from "../learnerDb";

const preferenceSchema = z.object({
  textScale: z.enum(ACCESSIBILITY_PREFERENCES.textScale),
  readingWidth: z.enum(ACCESSIBILITY_PREFERENCES.readingWidth),
  contrast: z.enum(ACCESSIBILITY_PREFERENCES.contrast),
  motion: z.enum(ACCESSIBILITY_PREFERENCES.motion),
  passageFocus: z.enum(ACCESSIBILITY_PREFERENCES.passageFocus),
  keyboardShortcuts: z.enum(ACCESSIBILITY_PREFERENCES.keyboardShortcuts),
});

export const preferencesRouter = router({
  get: protectedProcedure.query(({ ctx }) => getLearnerPreferences(ctx.user.id)),
  save: protectedProcedure
    .input(preferenceSchema)
    .mutation(({ ctx, input }) => updateLearnerPreferences(ctx.user.id, input)),
});
