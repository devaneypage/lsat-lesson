import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { taxonomyRepository } from "../repositories/taxonomy";

const tagTypeSchema = z.enum(["topic", "objective", "section", "custom"]);
const tagIdSchema = z.number().int().positive();
const questionIdSchema = z.number().int().positive();
const paginationSchema = z.object({
  limit: z.number().int().min(1).max(200).default(100),
  offset: z.number().int().min(0).max(100_000).default(0),
});

export const taxonomyRouter = router({
  create: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1).max(128),
        type: tagTypeSchema.default("topic"),
        description: z.string().trim().max(2_000).optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tagId = await taxonomyRepository.create({ ...input, createdBy: ctx.user.id });
        return { success: true, tagId };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create tag" });
      }
    }),

  list: publicProcedure.query(() => taxonomyRepository.list()),
  listWithCounts: publicProcedure.query(() => taxonomyRepository.listWithCounts()),

  getForQuestion: publicProcedure
    .input(z.object({ questionId: questionIdSchema }))
    .query(({ input }) => taxonomyRepository.listForQuestion(input.questionId)),

  addToQuestion: adminProcedure
    .input(z.object({ questionId: questionIdSchema, tagId: tagIdSchema }))
    .mutation(async ({ input }) => {
      try {
        await taxonomyRepository.addToQuestion(input.questionId, input.tagId);
        return { success: true };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add tag to question" });
      }
    }),

  removeFromQuestion: adminProcedure
    .input(z.object({ questionId: questionIdSchema, tagId: tagIdSchema }))
    .mutation(async ({ input }) => {
      try {
        await taxonomyRepository.removeFromQuestion(input.questionId, input.tagId);
        return { success: true };
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to remove tag from question" });
      }
    }),

  getQuestions: publicProcedure
    .input(paginationSchema.extend({ tagId: tagIdSchema }))
    .query(({ input }) => taxonomyRepository.listQuestions(input.tagId, input.limit, input.offset)),

  update: adminProcedure
    .input(
      z.object({
        tagId: tagIdSchema,
        name: z.string().trim().min(1).max(128).optional(),
        type: tagTypeSchema.optional(),
        description: z.string().trim().max(2_000).optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { tagId, ...data } = input;
      await taxonomyRepository.update(tagId, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ tagId: tagIdSchema }))
    .mutation(async ({ input }) => {
      await taxonomyRepository.delete(input.tagId);
      return { success: true };
    }),

  bulkAssign: adminProcedure
    .input(z.object({ questionIds: z.array(questionIdSchema).min(1).max(2_000), tagId: tagIdSchema }))
    .mutation(async ({ input }) => {
      const added = await taxonomyRepository.bulkAdd(input.questionIds, input.tagId);
      return { success: true, added };
    }),

  bulkRemove: adminProcedure
    .input(z.object({ questionIds: z.array(questionIdSchema).min(1).max(2_000), tagId: tagIdSchema }))
    .mutation(async ({ input }) => {
      await taxonomyRepository.bulkRemove(input.questionIds, input.tagId);
      return { success: true };
    }),

  questionsWithTags: publicProcedure
    .input(paginationSchema.extend({ limit: z.number().int().min(1).max(500).default(200) }))
    .query(({ input }) => taxonomyRepository.listQuestionsWithTags(input.limit, input.offset)),

  filteredQuestions: publicProcedure
    .input(
      paginationSchema.extend({
        tagIds: z.array(tagIdSchema).max(100).default([]),
        search: z.string().trim().max(500).optional(),
        category: z.string().trim().max(128).optional(),
      }),
    )
    .query(({ input }) => taxonomyRepository.filterQuestions(input)),
});
