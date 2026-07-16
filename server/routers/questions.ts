import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { questionRepository } from "../repositories/questions";
import { toBrowseSafeQuestion } from "../../shared/practiceEvidence";

const importedQuestionSchema = z.object({
  question_id: z.string().trim().min(1).max(128),
  question_text: z.string().trim().min(1).max(20_000),
  option_a: z.string().trim().min(1).max(5_000),
  option_b: z.string().trim().min(1).max(5_000),
  option_c: z.string().trim().min(1).max(5_000),
  option_d: z.string().trim().min(1).max(5_000),
  option_e: z.string().trim().min(1).max(5_000).optional(),
  correct_answer: z.enum(["A", "B", "C", "D", "E"]),
  explanation: z.string().max(30_000),
  category: z.string().trim().max(128).optional(),
  difficulty: z.string().trim().max(64).optional(),
  source: z.string().trim().max(256).optional(),
});

const paginationSchema = z.object({
  limit: z.number().int().min(1).max(200).default(100),
  offset: z.number().int().min(0).max(100_000).default(0),
});

export const questionsRouter = router({
  import: adminProcedure
    .input(
      z.object({
        fileName: z.string().trim().min(1).max(255),
        questions: z.array(importedQuestionSchema).min(1).max(2_000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const questionsData = input.questions.map((question) => ({
          questionId: question.question_id,
          questionText: question.question_text,
          optionA: question.option_a,
          optionB: question.option_b,
          optionC: question.option_c,
          optionD: question.option_d,
          optionE: question.option_e ?? null,
          correctAnswer: question.correct_answer,
          explanation: question.explanation,
          category: question.category ?? null,
          difficulty: question.difficulty ?? null,
          source: question.source ?? null,
        }));

        const importedCount = await questionRepository.insertMany(questionsData);
        await questionRepository.recordImport({
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
        await questionRepository.recordImport({
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

  list: publicProcedure.input(paginationSchema).query(async ({ input }) => {
    const [questions, total] = await Promise.all([
      questionRepository.list(input.limit, input.offset),
      questionRepository.count(),
    ]);
    return { questions: questions.map(toBrowseSafeQuestion), total };
  }),

  getById: publicProcedure
    .input(z.object({ questionId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const question = await questionRepository.getById(input.questionId);
      return question ? toBrowseSafeQuestion(question) : null;
    }),

  count: publicProcedure.query(() => questionRepository.count()),
});
