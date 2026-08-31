import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { CONFIDENCE_LEVELS } from "../../shared/learnerDomain";
import {
  ANSWER_LETTERS,
  MAX_ACTIVE_TIME_MS,
  PRACTICE_CONTEXTS,
  PRACTICE_DISCOVERY_BATCH_MAX,
} from "../../shared/practiceEvidence";
import { protectedProcedure, router } from "../_core/trpc";
import { generatePracticeHint } from "../practiceHints";
import { practiceHintRepository } from "../repositories/practiceHints";
import { practiceRepository } from "../repositories/practice";

const routeContextSchema = z.object({
  route: z.string().trim().min(1).max(255).default("/practice"),
  surface: z.string().trim().min(1).max(64).default("practice"),
});

export const practiceRouter = router({
  setFilters: protectedProcedure.query(() => practiceRepository.getPracticeSetFilters()),

  buildSet: protectedProcedure
    .input(
      z.object({
        category: z.string().trim().min(1).max(128).optional(),
        difficulty: z.string().trim().min(1).max(64).optional(),
        length: z.union([z.literal(5), z.literal(10), z.literal(25)]),
      }),
    )
    .query(({ ctx, input }) => practiceRepository.buildPracticeSet({ userId: ctx.user.id, ...input })),

  start: protectedProcedure
    .input(routeContextSchema.extend({
      questionId: z.number().int().positive(),
    }))
    .mutation(async ({ ctx, input }) => ({
      recorded: await practiceRepository.recordQuestionStarted({
        userId: ctx.user.id,
        ...input,
      }),
    })),

  discovered: protectedProcedure
    .input(routeContextSchema.extend({
      questionIds: z.array(z.number().int().positive()).min(1).max(PRACTICE_DISCOVERY_BATCH_MAX),
    }))
    .mutation(async ({ ctx, input }) => ({
      recorded: await practiceRepository.recordQuestionsDiscovered({
        userId: ctx.user.id,
        ...input,
      }),
    })),

  summary: protectedProcedure.query(({ ctx }) =>
    practiceRepository.getPracticeSummary(ctx.user.id)),

  outcomes: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(12) }).default({ limit: 12 }))
    .query(({ ctx, input }) => practiceRepository.getQuestionOutcomes(ctx.user.id, input.limit)),

  hint: protectedProcedure
    .input(z.object({ questionId: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const context = await practiceHintRepository.getPracticeQuestionHintContext(input.questionId);
      if (!context) throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      try {
        return { hint: await generatePracticeHint(context) };
      } catch (error) {
        console.error("[PracticeHint] Generation failed:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "A contextual hint is unavailable right now. Please try again." });
      }
    }),

  submit: protectedProcedure
    .input(routeContextSchema.extend({
      questionId: z.number().int().positive(),
      idempotencyKey: z.string().uuid().max(64),
      selectedAnswer: z.enum(ANSWER_LETTERS),
      confidence: z.enum(CONFIDENCE_LEVELS),
      activeTimeMs: z.number().int().min(0).max(MAX_ACTIVE_TIME_MS),
      context: z.enum(PRACTICE_CONTEXTS).default("practice"),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await practiceRepository.submitPracticeAttempt({
        userId: ctx.user.id,
        ...input,
      });

      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }
      return result;
    }),
});
