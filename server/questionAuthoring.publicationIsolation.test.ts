import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const learnerQuestionsRouter = readFileSync(join(projectRoot, "server/routers/questions.ts"), "utf8");
const authoringRepository = readFileSync(join(projectRoot, "server/repositories/questionSubmissions.ts"), "utf8");

describe("original-question publication isolation contract", () => {
  it("keeps private submission storage outside learner-facing Question Bank queries", () => {
    expect(learnerQuestionsRouter).toContain("questionRepository.list(input.limit, input.offset)");
    expect(learnerQuestionsRouter).not.toContain("questionSubmissions");
    expect(learnerQuestionsRouter).not.toContain("questionSubmissionRepository");
  });

  it("copies only an approved submission into the learner-visible questions collection before marking it published", () => {
    expect(authoringRepository).toContain('if (submission.status !== "approved") throw new Error("Only approved submissions can be published")');
    expect(authoringRepository).toContain("await tx.insert(questions).values");
    expect(authoringRepository).toContain("await tx.insert(questionSkills).values");
    expect(authoringRepository).toContain('set({ status: "published", publishedQuestionId })');
  });
});
