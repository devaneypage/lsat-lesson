import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  insertQuestions,
  createImportHistory,
  getQuestions,
  getQuestionCount,
  createTag,
  updateTag,
  deleteTag,
  getTags,
  getTagsWithCounts,
  getQuestionTags,
  addTagToQuestion,
  removeTagFromQuestion,
  getQuestionsByTag,
  bulkAddTagToQuestions,
  bulkRemoveTagFromQuestions,
  getQuestionsWithTags,
  getQuestionsFilteredByTags,
} from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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

  tags: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(128),
          type: z.enum(["topic", "objective", "section", "custom"]).default("topic"),
          description: z.string().optional(),
          color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create tags",
          });
        }

        try {
          const tagId = await createTag({
            name: input.name,
            type: input.type,
            description: input.description,
            color: input.color,
            createdBy: ctx.user.id,
          });
          return { success: true, tagId };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create tag",
          });
        }
      }),

    list: publicProcedure.query(async () => {
      return await getTags();
    }),

    getForQuestion: publicProcedure
      .input(z.object({ questionId: z.number() }))
      .query(async ({ input }) => {
        return await getQuestionTags(input.questionId);
      }),

    addToQuestion: protectedProcedure
      .input(
        z.object({
          questionId: z.number(),
          tagId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can tag questions",
          });
        }

        try {
          await addTagToQuestion(input.questionId, input.tagId);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add tag to question",
          });
        }
      }),

    removeFromQuestion: protectedProcedure
      .input(
        z.object({
          questionId: z.number(),
          tagId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can remove tags",
          });
        }

        try {
          await removeTagFromQuestion(input.questionId, input.tagId);
          return { success: true };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to remove tag from question",
          });
        }
      }),

    getQuestions: publicProcedure
      .input(
        z.object({
          tagId: z.number(),
          limit: z.number().default(100),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getQuestionsByTag(input.tagId, input.limit, input.offset);
      }),

    listWithCounts: publicProcedure.query(async () => {
      return await getTagsWithCounts();
    }),

    update: protectedProcedure
      .input(
        z.object({
          tagId: z.number(),
          name: z.string().min(1).max(128).optional(),
          type: z.enum(["topic", "objective", "section", "custom"]).optional(),
          description: z.string().optional(),
          color: z.string().regex(/^#[0-9A-F]{6}$/i).nullable().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can update tags" });
        }
        const { tagId, ...data } = input;
        await updateTag(tagId, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ tagId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can delete tags" });
        }
        await deleteTag(input.tagId);
        return { success: true };
      }),

    bulkAssign: protectedProcedure
      .input(
        z.object({
          questionIds: z.array(z.number()).min(1),
          tagId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can bulk tag questions" });
        }
        const added = await bulkAddTagToQuestions(input.questionIds, input.tagId);
        return { success: true, added };
      }),

    bulkRemove: protectedProcedure
      .input(
        z.object({
          questionIds: z.array(z.number()).min(1),
          tagId: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can bulk remove tags" });
        }
        await bulkRemoveTagFromQuestions(input.questionIds, input.tagId);
        return { success: true };
      }),

    questionsWithTags: publicProcedure
      .input(
        z.object({
          limit: z.number().default(200),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await getQuestionsWithTags(input.limit, input.offset);
      }),

    filteredQuestions: publicProcedure
      .input(
        z.object({
          tagIds: z.array(z.number()).default([]),
          limit: z.number().default(100),
          offset: z.number().default(0),
          search: z.string().optional(),
          category: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getQuestionsFilteredByTags(
          input.tagIds,
          input.limit,
          input.offset,
          input.search,
          input.category
        );
      }),
  }),

  lessonPlan: router({
    generate: publicProcedure
      .input(
        z.object({
          currentScore: z.union([z.number().min(120).max(180), z.literal("untested")]),
          targetScore: z.number().min(120).max(180),
          testDate: z.string(),
          hoursPerWeek: z.enum(["4", "8", "12", "16+"]),
          weakAreas: z
            .array(
              z.enum([
                "Main Point",
                "Assumption",
                "Strengthen/Weaken",
                "Flaw",
                "Inference",
                "Role of Statement",
                "Point at Issue",
                "Method of Argument",
                "Parallel Reasoning",
                "Conditional Reasoning",
                "Reading Comprehension",
              ])
            )
            .min(1),
        })
      )
      .mutation(async ({ input }) => {
        const weeksUntilTest = Math.max(
          1,
          Math.round(
            (new Date(input.testDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)
          )
        );

        const scoreGap =
          input.currentScore === "untested"
            ? "unknown (no diagnostic taken yet)"
            : `${input.targetScore - (input.currentScore as number)} points`;

        const systemPrompt = `You are an expert LSAT instructor and curriculum designer. You create personalized, actionable LSAT study plans grounded in evidence-based instructional design. The 2026 LSAT does NOT include Logic Games — focus only on Logical Reasoning and Reading Comprehension.

Available Study Guide modules on the platform:
- Argument Anatomy (LR-0, LR-2a)
- Introduction to Argument-Based Questions (LR-1)
- Main Point Questions (LR-2)
- Role of Statement Questions (LR-3)
- Method of Argument Questions (LR-4)
- Point at Issue Questions (LR-5)
- Parallel Reasoning Questions (LR-6)
- Conditional Reasoning & Diagramming
- Necessary Assumptions (Bridge & Defender)
- Logical Flaws (19 Common Flaws)
- LSAT Vocabulary & Terminology
- Reading Comprehension Strategy

Format your response in clean Markdown with three clearly labeled sections:
1. ## Priority Rankings
2. ## Week-by-Week Schedule
3. ## Session Breakdowns (first 2 weeks only)

Be specific, practical, and encouraging. Reference the platform's modules by name.`;

        const userMessage = `Please create a personalized LSAT study plan for a student with the following profile:

- **Current Score:** ${input.currentScore === "untested" ? "No diagnostic taken yet" : input.currentScore}
- **Target Score:** ${input.targetScore}
- **Score Gap:** ${scoreGap}
- **Test Date:** ${new Date(input.testDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
- **Weeks Until Test:** ${weeksUntilTest}
- **Study Hours Per Week:** ${input.hoursPerWeek} hours
- **Self-Reported Weak Areas:** ${input.weakAreas.join(", ")}

Generate a complete study plan with:
1. **Priority Rankings** — Top 5 focus areas ranked by score impact, each with a 1-2 sentence rationale explaining why this area will yield the most improvement for this student
2. **Week-by-Week Schedule** — A full schedule from now until the test date, organized by week, with specific Study Guide modules and Question Bank practice sets for each session
3. **Session Breakdowns** — Detailed 45-60 minute session plans for Weeks 1 and 2, following a lesson → practice → review structure`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          });

          const content = response.choices?.[0]?.message?.content ?? "";
          if (!content) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "AI returned an empty response. Please try again.",
            });
          }

          return { plan: content, weeksUntilTest, scoreGap };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[LessonPlan] LLM error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate lesson plan. Please try again.",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
