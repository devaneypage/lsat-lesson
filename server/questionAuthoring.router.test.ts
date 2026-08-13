import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const repository = {
  create: vi.fn(),
  getByKey: vi.fn(),
  list: vi.fn(),
  updateDraft: vi.fn(),
  transition: vi.fn(),
  publish: vi.fn(),
  listSkills: vi.fn(),
  listReviewers: vi.fn(),
  assignReviewer: vi.fn(),
};

vi.mock("./repositories/questionSubmissions", () => ({ questionSubmissionRepository: repository }));

const { questionAuthoringRouter } = await import("./routers/questionAuthoring");

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 7,
      openId: `authoring-${role}`,
      name: "Content Editor",
      email: "editor@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const validDraft = {
  internalTitle: "Necessary assumption — transit authority",
  questionText: "A transit authority will replace cash fare boxes. Which statement is necessary for the argument?",
  optionA: "Every rider owns a smartphone.",
  optionB: "The authority can process contactless payments.",
  optionC: "No rider prefers cash.",
  optionD: "The authority will lower fares.",
  correctAnswer: "B" as const,
  explanation: "The argument depends on the authority being able to process the replacement payment method.",
  category: "Necessary Assumption",
  difficulty: "medium" as const,
  source: "LSAT Nexus Original",
  rightsConfirmed: true as const,
};

const csvRow = {
  internal_title: validDraft.internalTitle,
  question_text: validDraft.questionText,
  option_a: validDraft.optionA,
  option_b: validDraft.optionB,
  option_c: validDraft.optionC,
  option_d: validDraft.optionD,
  correct_answer: validDraft.correctAnswer,
  explanation: validDraft.explanation,
  category: validDraft.category,
  difficulty: validDraft.difficulty,
  source: validDraft.source,
  skill_ids: "lr-assumptions",
};

describe("questionAuthoring router", () => {
  it("denies authoring access to non-administrators before a repository call", async () => {
    const caller = questionAuthoringRouter.createCaller(createContext("user"));
    await expect(caller.list({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(repository.list).not.toHaveBeenCalled();
  });

  it("rejects drafts that lack the original-content rights attestation", async () => {
    const caller = questionAuthoringRouter.createCaller(createContext("admin"));
    await expect(caller.createDraft({ ...validDraft, rightsConfirmed: false })).rejects.toBeDefined();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("requires review notes before returning a submitted item for revision", async () => {
    repository.getByKey.mockResolvedValueOnce({ submissionKey: "submission-1", status: "submitted", authorId: 2 });
    const caller = questionAuthoringRouter.createCaller(createContext("admin"));
    await expect(caller.review({ submissionKey: "submission-1", decision: "needs_revision" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(repository.transition).not.toHaveBeenCalled();
  });

  it("allows the protected publication procedure only after the repository confirms the approved submission", async () => {
    repository.publish.mockResolvedValueOnce({ submissionKey: "submission-1", status: "published", publishedQuestionId: 42 });
    const caller = questionAuthoringRouter.createCaller(createContext("admin"));
    await expect(caller.publish({ submissionKey: "submission-1" })).resolves.toMatchObject({ status: "published", publishedQuestionId: 42 });
    expect(repository.publish).toHaveBeenCalledWith("submission-1");
  });

  it("assigns only active administrators and records an editorial due date", async () => {
    repository.listReviewers.mockResolvedValueOnce([{ id: 9, name: "Reviewer", email: "reviewer@example.com" }]);
    repository.assignReviewer.mockResolvedValueOnce({ submissionKey: "submission-1", assignedReviewerId: 9, editorialDueAt: new Date("2026-09-01T12:00:00Z") });
    const caller = questionAuthoringRouter.createCaller(createContext("admin"));
    await expect(caller.assignReviewer({ submissionKey: "submission-1", assignedReviewerId: 9, editorialDueAt: new Date("2026-09-01T12:00:00Z") })).resolves.toMatchObject({ assignedReviewerId: 9 });
    expect(repository.assignReviewer).toHaveBeenCalledWith("submission-1", 9, new Date("2026-09-01T12:00:00Z"));
  });

  it("returns row-level CSV preview issues when a proposed skill is outside the curriculum registry", async () => {
    repository.listSkills.mockResolvedValueOnce([{ skillId: "lr-assumptions" }]);
    const caller = questionAuthoringRouter.createCaller(createContext("admin"));
    const preview = await caller.previewDraftImport({ rows: [{ ...csvRow, skill_ids: "lr-assumptions;unknown-skill" }] });
    expect(preview[0]).toMatchObject({ isValid: false, skillIds: ["lr-assumptions", "unknown-skill"] });
    expect(preview[0]?.issues.join(" ")).toContain("Unknown curriculum skill: unknown-skill");
  });

  it("preserves malformed CSV rows for row-level preview feedback instead of rejecting the complete preview request", async () => {
    repository.listSkills.mockResolvedValueOnce([{ skillId: "lr-assumptions" }]);
    const caller = questionAuthoringRouter.createCaller(createContext("admin"));
    const preview = await caller.previewDraftImport({ rows: [{ ...csvRow, correct_answer: "Z", difficulty: "advanced" }] });
    expect(preview[0]?.isValid).toBe(false);
    expect(preview[0]?.issues.length).toBeGreaterThan(0);
  });
});
