import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { evaluateFeatureFlags } from "../../shared/featureFlags";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { featureFlagRepository } from "../repositories/featureFlags";

const flagKeySchema = z.string().trim().min(1).max(128);

export const flagsRouter = router({
  evaluate: publicProcedure
    .input(z.object({ visitorId: z.string().trim().min(1).max(128) }))
    .query(async ({ ctx, input }) => {
      const flags = await featureFlagRepository.list();
      const subjectId = ctx.user ? `user:${ctx.user.openId}` : `visitor:${input.visitorId}`;
      return evaluateFeatureFlags(flags, subjectId);
    }),

  adminList: adminProcedure.query(async () => {
    const flags = await featureFlagRepository.list();
    return flags.map((flag) => ({
      key: flag.key,
      name: flag.name,
      description: flag.description ?? "",
      enabled: flag.enabled === 1,
      rolloutPercentage: flag.rolloutPercentage,
      updatedAt: flag.updatedAt,
    }));
  }),

  toggle: adminProcedure
    .input(z.object({ key: flagKeySchema, enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      const updated = await featureFlagRepository.setEnabled(input.key, input.enabled);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Flag '${input.key}' not found` });
      }
      return { key: updated.key, enabled: updated.enabled === 1 };
    }),

  setRollout: adminProcedure
    .input(
      z.object({
        key: flagKeySchema,
        rolloutPercentage: z.number().int().min(0).max(100),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await featureFlagRepository.setRollout(input.key, input.rolloutPercentage);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: `Flag '${input.key}' not found` });
      }
      return { key: updated.key, rolloutPercentage: updated.rolloutPercentage };
    }),
});
