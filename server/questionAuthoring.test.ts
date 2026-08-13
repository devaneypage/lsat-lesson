import { describe, expect, it } from "vitest";
import { canTransitionQuestionSubmission, isLearnerVisibleSubmission, learnerQuestionKeyForSubmission, requireReviewNotes } from "./questionAuthoring";

describe("original-question authoring lifecycle", () => {
  it("allows only the defined draft-to-publication sequence", () => {
    expect(canTransitionQuestionSubmission("draft", "submitted")).toBe(true);
    expect(canTransitionQuestionSubmission("submitted", "approved")).toBe(true);
    expect(canTransitionQuestionSubmission("approved", "published")).toBe(true);
    expect(canTransitionQuestionSubmission("draft", "published")).toBe(false);
    expect(canTransitionQuestionSubmission("published", "draft")).toBe(false);
  });

  it("requires editorial notes when a submission is returned or rejected", () => {
    expect(() => requireReviewNotes("needs_revision")).toThrow("require reviewer notes");
    expect(() => requireReviewNotes("rejected", " ")).toThrow("require reviewer notes");
    expect(() => requireReviewNotes("approved")).not.toThrow();
    expect(() => requireReviewNotes("needs_revision", "Clarify why B is not sufficient.")).not.toThrow();
  });

  it("derives a bounded learner-visible key from the private submission key", () => {
    const learnerKey = learnerQuestionKeyForSubmission("submission-a1b2c3d4");
    expect(learnerKey).toBe("nexus-original-a1b2c3d4");
    expect(learnerKey).toHaveLength(23);
  });

  it("keeps every private authoring state out of learner practice until publication", () => {
    expect(isLearnerVisibleSubmission("draft")).toBe(false);
    expect(isLearnerVisibleSubmission("submitted")).toBe(false);
    expect(isLearnerVisibleSubmission("needs_revision")).toBe(false);
    expect(isLearnerVisibleSubmission("approved")).toBe(false);
    expect(isLearnerVisibleSubmission("rejected")).toBe(false);
    expect(isLearnerVisibleSubmission("published")).toBe(true);
  });
});
