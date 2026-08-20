import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const hintRepository = { getPracticeQuestionHintContext: vi.fn() };
const generatePracticeHint = vi.fn();

vi.mock("./repositories/practiceHints", () => ({ practiceHintRepository: hintRepository }));
vi.mock("./practiceHints", () => ({ generatePracticeHint }));
vi.mock("./repositories/practice", () => ({ practiceRepository: {} }));

const { practiceRouter } = await import("./routers/practice");

function createContext(): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "hint-learner",
      name: "Learner",
      email: "learner@example.com",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("practice.hint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an answer-safe contextual hint through the protected practice contract", async () => {
    hintRepository.getPracticeQuestionHintContext.mockResolvedValueOnce({ category: "Necessary Assumption", questionText: "A conclusion depends on an unstated claim." });
    generatePracticeHint.mockResolvedValueOnce("Identify the conclusion, then ask what must link the evidence to it.");
    const caller = practiceRouter.createCaller(createContext());

    await expect(caller.hint({ questionId: 42 })).resolves.toEqual({ hint: "Identify the conclusion, then ask what must link the evidence to it." });
    expect(hintRepository.getPracticeQuestionHintContext).toHaveBeenCalledWith(42);
  });

  it("returns NOT_FOUND without invoking the model when the question is unavailable", async () => {
    hintRepository.getPracticeQuestionHintContext.mockResolvedValueOnce(null);
    const caller = practiceRouter.createCaller(createContext());

    await expect(caller.hint({ questionId: 404 })).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(generatePracticeHint).not.toHaveBeenCalled();
  });

  it("returns a safe retryable error when hint generation fails", async () => {
    hintRepository.getPracticeQuestionHintContext.mockResolvedValueOnce({ category: "Flaw", questionText: "The argument draws an unsupported conclusion." });
    generatePracticeHint.mockRejectedValueOnce(new Error("Unsafe model output"));
    const caller = practiceRouter.createCaller(createContext());

    await expect(caller.hint({ questionId: 43 })).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR", message: "A contextual hint is unavailable right now. Please try again." });
  });
});
