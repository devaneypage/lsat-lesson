import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { insertQuestions, createImportHistory, getQuestions, getQuestionCount } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  questions: router({
    import: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          questions: z.array(
            z.object({
              question_id: z.string(),
              question_text: z.string(),
              option_a: z.string(),
              option_b: z.string(),
              option_c: z.string(),
              option_d: z.string(),
              option_e: z.string().optional(),
              correct_answer: z.string().regex(/^[A-E]$/),
              explanation: z.string(),
              category: z.string().optional(),
              difficulty: z.string().optional(),
              source: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can import questions",
          });
        }

        try {
          const questionsData = input.questions.map((q) => ({
            questionId: q.question_id,
            questionText: q.question_text,
            optionA: q.option_a,
            optionB: q.option_b,
            optionC: q.option_c,
            optionD: q.option_d,
            optionE: q.option_e || null,
            correctAnswer: q.correct_answer,
            explanation: q.explanation,
            category: q.category || null,
            difficulty: q.difficulty || null,
            source: q.source || null,
          }));

          const importedCount = await insertQuestions(questionsData);

          // Log import history
          await createImportHistory({
            fileName: input.fileName,
            importedBy: ctx.user.id,
            rowCount: input.questions.length,
            successCount: importedCount,
            errorCount: 0,
            status: "success",
          });

          return {
            success: true,
            importedCount,
            message: `Successfully imported ${importedCount} questions`,
          };
        } catch (error) {
          console.error("[Import] Failed to import questions:", error);

          await createImportHistory({
            fileName: input.fileName,
            importedBy: ctx.user.id,
            rowCount: input.questions.length,
            successCount: 0,
            errorCount: input.questions.length,
            status: "error",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
          });

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to import questions",
          });
        }
      }),

    list: publicProcedure
      .input(
        z.object({
          limit: z.number().default(100),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        const questions = await getQuestions(input.limit, input.offset);
        const total = await getQuestionCount();
        return { questions, total };
      }),

    count: publicProcedure.query(async () => {
      return await getQuestionCount();
    }),
  }),
});

export type AppRouter = typeof appRouter;
