import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createErrorLogEntry,
  deleteErrorLogEntry,
  getErrorLogEntries,
  updateErrorLogEntry,
} from "../db";

/**
 * LSAT Nexus — Review & Analytics. Per-user error log backed by the
 * errorLogEntries table. All procedures require auth and are scoped to the
 * calling user. When no database is configured the read returns an empty
 * list and the client falls back to local storage.
 */
export const nexusRouter = router({
  listErrors: protectedProcedure.query(({ ctx }) => getErrorLogEntries(ctx.user.id)),

  addError: protectedProcedure
    .input(
      z.object({
        category: z.string().min(1).max(64),
        questionType: z.string().min(1).max(64),
        errorReason: z.string().max(128).optional(),
        notes: z.string().max(2000).optional(),
        source: z.string().max(255).optional(),
        confidence: z.number().int().min(1).max(5).default(1),
      }),
    )
    .mutation(({ ctx, input }) =>
      createErrorLogEntry({ ...input, userId: ctx.user.id }),
    ),

  updateError: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        category: z.string().min(1).max(64).optional(),
        questionType: z.string().min(1).max(64).optional(),
        errorReason: z.string().max(128).optional(),
        notes: z.string().max(2000).optional(),
        source: z.string().max(255).optional(),
        confidence: z.number().int().min(1).max(5).optional(),
        resolved: z.number().int().min(0).max(1).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, ...updates } = input;
      return updateErrorLogEntry(ctx.user.id, id, updates);
    }),

  deleteError: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await deleteErrorLogEntry(ctx.user.id, input.id);
      return { success: true } as const;
    }),
});
