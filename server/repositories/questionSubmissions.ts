import { and, eq, inArray } from "drizzle-orm";
import { curriculumSkills, questionCategories, questionDifficulties, questionSkills, questionSources, questions, questionSubmissionSkills, questionSubmissions, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { seedCurriculumRegistry } from "../learnerDb";
import { learnerQuestionKeyForSubmission, type AuthoringStatus } from "../questionAuthoring";

export type SubmissionInput = {
  submissionKey: string;
  internalTitle: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE?: string | null;
  correctAnswer: "A" | "B" | "C" | "D" | "E";
  explanation: string;
  category: string;
  difficulty: string;
  source: string;
  rightsConfirmed: boolean;
  authorNotes?: string | null;
  skillMappings?: { skillId: string; weight: number }[];
  authorId: number;
};

async function findOrCreateLookup(
  db: Pick<NonNullable<Awaited<ReturnType<typeof getDb>>>, "insert" | "select">,
  table: typeof questionCategories | typeof questionDifficulties | typeof questionSources,
  name: string,
) {
  await db.insert(table).values({ name }).onDuplicateKeyUpdate({ set: { name } });
  const records = await db.select().from(table).where(eq(table.name, name)).limit(1);
  const record = records[0];
  if (!record) throw new Error(`Could not resolve question metadata: ${name}`);
  return record.id;
}

export const questionSubmissionRepository = {
  async create(input: SubmissionInput) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { skillMappings = [], ...submission } = input;
    await db.transaction(async (tx) => {
      await tx.insert(questionSubmissions).values({
        ...submission,
        optionE: submission.optionE ?? null,
        rightsConfirmed: submission.rightsConfirmed ? 1 : 0,
      });
      const created = await tx.select().from(questionSubmissions).where(eq(questionSubmissions.submissionKey, input.submissionKey)).limit(1);
      if (created[0] && skillMappings.length) {
        await tx.insert(questionSubmissionSkills).values(skillMappings.map((mapping) => ({ submissionId: created[0]!.id, ...mapping }))).onDuplicateKeyUpdate({ set: { weight: 100 } });
      }
    });
    return this.getByKey(input.submissionKey);
  },

  async getByKey(submissionKey: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const records = await db.select().from(questionSubmissions).where(eq(questionSubmissions.submissionKey, submissionKey)).limit(1);
    const submission = records[0];
    if (!submission) return null;
    const skillMappings = await db.select().from(questionSubmissionSkills).where(eq(questionSubmissionSkills.submissionId, submission.id));
    return { ...submission, skillMappings };
  },

  async list(status?: AuthoringStatus) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const submissions = await (status
      ? db.select().from(questionSubmissions).where(eq(questionSubmissions.status, status)).orderBy(questionSubmissions.updatedAt)
      : db.select().from(questionSubmissions).orderBy(questionSubmissions.updatedAt));
    if (!submissions.length) return [];
    const mappings = await db.select().from(questionSubmissionSkills).where(inArray(questionSubmissionSkills.submissionId, submissions.map((submission) => submission.id)));
    return submissions.map((submission) => ({ ...submission, skillMappings: mappings.filter((mapping) => mapping.submissionId === submission.id) }));
  },

  async updateDraft(submissionKey: string, authorId: number, input: Omit<SubmissionInput, "submissionKey" | "authorId">) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { skillMappings = [], ...draftValues } = input;
    await db.transaction(async (tx) => {
      await tx.update(questionSubmissions).set({
        ...draftValues,
        optionE: draftValues.optionE ?? null,
        rightsConfirmed: draftValues.rightsConfirmed ? 1 : 0,
        status: "draft",
        reviewNotes: null,
        reviewerId: null,
        reviewedAt: null,
      }).where(and(eq(questionSubmissions.submissionKey, submissionKey), eq(questionSubmissions.authorId, authorId)));
      const saved = await tx.select().from(questionSubmissions).where(eq(questionSubmissions.submissionKey, submissionKey)).limit(1);
      if (saved[0]) {
        await tx.delete(questionSubmissionSkills).where(eq(questionSubmissionSkills.submissionId, saved[0].id));
        if (skillMappings.length) await tx.insert(questionSubmissionSkills).values(skillMappings.map((mapping) => ({ submissionId: saved[0]!.id, ...mapping })));
      }
    });
    return this.getByKey(submissionKey);
  },

  async listSkills() {
    await seedCurriculumRegistry();
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db.select().from(curriculumSkills).orderBy(curriculumSkills.section, curriculumSkills.title);
  },

  async listReviewers() {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.role, "admin")).orderBy(users.name);
  },

  async assignReviewer(submissionKey: string, assignedReviewerId: number | null, editorialDueAt: Date | null) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(questionSubmissions).set({ assignedReviewerId, editorialDueAt }).where(eq(questionSubmissions.submissionKey, submissionKey));
    return this.getByKey(submissionKey);
  },

  async transition(submissionKey: string, status: AuthoringStatus, values: { reviewerId?: number; reviewNotes?: string | null; submittedAt?: Date | null; reviewedAt?: Date | null }) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(questionSubmissions).set({ status, ...values }).where(eq(questionSubmissions.submissionKey, submissionKey));
    return this.getByKey(submissionKey);
  },

  async publish(submissionKey: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db.transaction(async (tx) => {
      const records = await tx.select().from(questionSubmissions).where(eq(questionSubmissions.submissionKey, submissionKey)).limit(1);
      const submission = records[0];
      if (!submission) throw new Error("Submission not found");
      if (submission.status === "published" && submission.publishedQuestionId) return submission;
      if (submission.status !== "approved") throw new Error("Only approved submissions can be published");
      if (submission.rightsConfirmed !== 1) throw new Error("Rights attestation is required before publication");

      const [categoryId, difficultyId, sourceId] = await Promise.all([
        findOrCreateLookup(tx, questionCategories, submission.category),
        findOrCreateLookup(tx, questionDifficulties, submission.difficulty),
        findOrCreateLookup(tx, questionSources, submission.source),
      ]);
      const questionKey = learnerQuestionKeyForSubmission(submission.submissionKey);
      const existing = await tx.select().from(questions).where(eq(questions.questionId, questionKey)).limit(1);
      let publishedQuestionId = existing[0]?.id;
      if (!publishedQuestionId) {
        const result = await tx.insert(questions).values({
          questionId: questionKey,
          questionText: submission.questionText,
          optionA: submission.optionA,
          optionB: submission.optionB,
          optionC: submission.optionC,
          optionD: submission.optionD,
          optionE: submission.optionE,
          correctAnswer: submission.correctAnswer,
          explanation: submission.explanation,
          categoryId,
          difficultyId,
          sourceId,
        });
        publishedQuestionId = Number((result as { insertId?: number }).insertId);
      }
      const skillMappings = await tx.select().from(questionSubmissionSkills).where(eq(questionSubmissionSkills.submissionId, submission.id));
      if (publishedQuestionId && skillMappings.length) await tx.insert(questionSkills).values(skillMappings.map((mapping) => ({ questionId: publishedQuestionId!, skillId: mapping.skillId, weight: mapping.weight }))).onDuplicateKeyUpdate({ set: { weight: 100 } });
      await tx.update(questionSubmissions).set({ status: "published", publishedQuestionId }).where(eq(questionSubmissions.submissionKey, submissionKey));

      const updated = await tx.select().from(questionSubmissions).where(eq(questionSubmissions.submissionKey, submissionKey)).limit(1);
      return updated[0] ?? null;
    });
  },
};
