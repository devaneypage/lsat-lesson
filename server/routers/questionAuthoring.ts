import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { authoringCsvRowSchema, previewAuthoringDraftRows } from "../authoringImport";
import { canTransitionQuestionSubmission, requireReviewNotes, type AuthoringStatus } from "../questionAuthoring";
import { questionSubmissionRepository } from "../repositories/questionSubmissions";

const contentSchema = z.object({
  internalTitle: z.string().trim().min(3).max(180),
  questionText: z.string().trim().min(20).max(20_000),
  optionA: z.string().trim().min(1).max(5_000),
  optionB: z.string().trim().min(1).max(5_000),
  optionC: z.string().trim().min(1).max(5_000),
  optionD: z.string().trim().min(1).max(5_000),
  optionE: z.string().trim().min(1).max(5_000).optional(),
  correctAnswer: z.enum(["A", "B", "C", "D", "E"]),
  explanation: z.string().trim().min(20).max(30_000),
  category: z.string().trim().min(2).max(128),
  difficulty: z.enum(["easy", "medium", "hard"]),
  source: z.string().trim().min(3).max(256).default("LSAT Nexus Original"),
  rightsConfirmed: z.literal(true),
  authorNotes: z.string().trim().max(8_000).optional(),
  skillMappings: z.array(z.object({ skillId: z.string().trim().min(1).max(64), weight: z.number().int().min(1).max(100) })).max(5).default([]),
}).refine((value) => value.correctAnswer !== "E" || Boolean(value.optionE), {
  message: "An E answer requires an E option.",
  path: ["correctAnswer"],
});

const statusSchema = z.enum(["draft", "submitted", "needs_revision", "approved", "rejected", "published"]);

function requireRecord<T>(record: T | null): T {
  if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Question submission not found." });
  return record;
}

export const questionAuthoringRouter = router({
  list: adminProcedure.input(z.object({ status: statusSchema.optional() })).query(({ input }) => questionSubmissionRepository.list(input.status)),
  listSkills: adminProcedure.query(() => questionSubmissionRepository.listSkills()),
  listReviewers: adminProcedure.query(() => questionSubmissionRepository.listReviewers()),

  createDraft: adminProcedure.input(contentSchema).mutation(async ({ ctx, input }) => {
    const record = await questionSubmissionRepository.create({
      ...input,
      optionE: input.optionE ?? null,
      authorNotes: input.authorNotes ?? null,
      authorId: ctx.user.id,
      submissionKey: `submission-${nanoid(16)}`,
    });
    return requireRecord(record);
  }),

  updateDraft: adminProcedure.input(z.object({ submissionKey: z.string().min(1).max(64), content: contentSchema })).mutation(async ({ ctx, input }) => {
    const existing = requireRecord(await questionSubmissionRepository.getByKey(input.submissionKey));
    if (existing.authorId !== ctx.user.id || !["draft", "needs_revision", "rejected"].includes(existing.status)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only the author may revise an editable submission." });
    }
    return requireRecord(await questionSubmissionRepository.updateDraft(input.submissionKey, ctx.user.id, { ...input.content, optionE: input.content.optionE ?? null, authorNotes: input.content.authorNotes ?? null }));
  }),

  submit: adminProcedure.input(z.object({ submissionKey: z.string().min(1).max(64) })).mutation(async ({ ctx, input }) => {
    const existing = requireRecord(await questionSubmissionRepository.getByKey(input.submissionKey));
    if (existing.authorId !== ctx.user.id || !canTransitionQuestionSubmission(existing.status, "submitted")) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This submission cannot be sent for review." });
    }
    return requireRecord(await questionSubmissionRepository.transition(input.submissionKey, "submitted", { submittedAt: new Date() }));
  }),

  assignReviewer: adminProcedure.input(z.object({ submissionKey: z.string().min(1).max(64), assignedReviewerId: z.number().int().positive().nullable(), editorialDueAt: z.coerce.date().nullable() })).mutation(async ({ input }) => {
    if (input.assignedReviewerId !== null) {
      const reviewers = await questionSubmissionRepository.listReviewers();
      if (!reviewers.some((reviewer) => reviewer.id === input.assignedReviewerId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Select an active administrator as reviewer." });
    }
    return requireRecord(await questionSubmissionRepository.assignReviewer(input.submissionKey, input.assignedReviewerId, input.editorialDueAt));
  }),

  previewDraftImport: adminProcedure.input(z.object({ rows: z.array(z.record(z.string(), z.string())).min(1).max(100) })).mutation(async ({ input }) => {
    const skills = await questionSubmissionRepository.listSkills();
    return previewAuthoringDraftRows(input.rows, skills.map((skill) => skill.skillId));
  }),

  commitDraftImport: adminProcedure.input(z.object({ rows: z.array(authoringCsvRowSchema).min(1).max(100), rightsConfirmed: z.literal(true) })).mutation(async ({ ctx, input }) => {
    const skills = await questionSubmissionRepository.listSkills();
    const preview = previewAuthoringDraftRows(input.rows, skills.map((skill) => skill.skillId));
    const invalid = preview.filter((row) => !row.isValid);
    if (invalid.length) throw new TRPCError({ code: "BAD_REQUEST", message: `Fix ${invalid.length} invalid CSV row${invalid.length === 1 ? "" : "s"} before saving drafts.` });
    const created = [] as string[];
    for (const row of preview) {
      if (!row.content) continue;
      const submissionKey = `submission-${nanoid(16)}`;
      await questionSubmissionRepository.create({ ...row.content, rightsConfirmed: true, authorId: ctx.user.id, submissionKey });
      created.push(submissionKey);
    }
    return { createdCount: created.length, submissionKeys: created };
  }),

  review: adminProcedure.input(z.object({ submissionKey: z.string().min(1).max(64), decision: z.enum(["needs_revision", "approved", "rejected"]), reviewNotes: z.string().trim().max(8_000).optional() })).mutation(async ({ ctx, input }) => {
    const existing = requireRecord(await questionSubmissionRepository.getByKey(input.submissionKey));
    if (!canTransitionQuestionSubmission(existing.status, input.decision)) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "This review decision is not available from the submission's current status." });
    }
    try {
      requireReviewNotes(input.decision, input.reviewNotes);
    } catch (error) {
      throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Review notes are required." });
    }
    return requireRecord(await questionSubmissionRepository.transition(input.submissionKey, input.decision as AuthoringStatus, {
      reviewerId: ctx.user.id,
      reviewNotes: input.reviewNotes ?? null,
      reviewedAt: new Date(),
    }));
  }),

  publish: adminProcedure.input(z.object({ submissionKey: z.string().min(1).max(64) })).mutation(async ({ input }) => {
    try {
      return requireRecord(await questionSubmissionRepository.publish(input.submissionKey));
    } catch (error) {
      throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Unable to publish this submission." });
    }
  }),
});
