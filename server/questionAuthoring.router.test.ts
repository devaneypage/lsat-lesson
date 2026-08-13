import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const repository = {
  create: vi.fn(),
  getByKey: vi.fn(),
  list: vi.fn(),
  updateDraft: vi.fn(),
  transition: vi.fn(),
  publish: vi.fn(),
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
});
