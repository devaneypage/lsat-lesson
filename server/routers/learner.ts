import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  ensureLearnerState,
  getContinueLearning,
  importLegacyLessonProgress,
  listLessonProgress,
  seedCurriculumRegistry,
  updateLearnerProfile,
  upsertLessonProgress,
} from "../learnerDb";
import { CURRICULUM_LESSONS, CURRICULUM_SKILLS } from "../../shared/learnerDomain";

const progressSchema = z.object({
  lessonId: z.string().min(1).max(64),
  status: z.enum(["not_started", "in_progress", "completed"]),
  step: z.number().int().min(0).max(100).optional(),
  percentComplete: z.number().int().min(0).max(100).optional(),
  lastAccessedAt: z.date().optional(),
  completedAt: z.date().nullable().optional(),
});

export const learnerRouter = router({
  bootstrap: protectedProcedure
    .input(z.object({ timezone: z.string().trim().min(1).max(64).default("UTC") }))
    .query(async ({ ctx, input }) => {
      await seedCurriculumRegistry();
      const state = await ensureLearnerState(ctx.user.id, input.timezone);
      const progress = await listLessonProgress(ctx.user.id);
      return {
        ...state,
        progress,
        curriculum: { skills: CURRICULUM_SKILLS, lessons: CURRICULUM_LESSONS },
      };
    }),

  curriculum: protectedProcedure.query(() => ({
    skills: CURRICULUM_SKILLS,
    lessons: CURRICULUM_LESSONS,
  })),

  updateProfile: protectedProcedure
    .input(z.object({
      timezone: z.string().trim().min(1).max(64).optional(),
      targetTestDate: z.date().nullable().optional(),
      weeklyStudyMinutes: z.number().int().min(30).max(2_400).optional(),
    }))
    .mutation(({ ctx, input }) => updateLearnerProfile(ctx.user.id, input)),

  progress: protectedProcedure.query(({ ctx }) => listLessonProgress(ctx.user.id)),

  continueLearning: protectedProcedure.query(({ ctx }) => getContinueLearning(ctx.user.id)),

  saveProgress: protectedProcedure
    .input(progressSchema)
    .mutation(({ ctx, input }) => upsertLessonProgress(ctx.user.id, input)),

  importLegacyProgress: protectedProcedure
    .input(z.object({ items: z.array(progressSchema).max(CURRICULUM_LESSONS.length) }))
    .mutation(({ ctx, input }) => importLegacyLessonProgress(ctx.user.id, input.items)),

});
