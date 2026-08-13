import { describe, expect, it } from "vitest";
import { buildQuestionBankContentBaseline } from "../client/src/lib/questionBankContent";

describe("Question Bank content baseline", () => {
  it("labels a collection drawn entirely from original sample sources without presenting it as official content", () => {
    const baseline = buildQuestionBankContentBaseline({
      totalQuestions: 5,
      categories: ["Strengthen", "Necessary Assumption", "Strengthen"],
      sources: ["LSAT Nexus Original Sample Set"],
    });

    expect(baseline.categories).toEqual(["Necessary Assumption", "Strengthen"]);
    expect(baseline.sourceLabel).toBe("LSAT Nexus Original Sample Set");
    expect(baseline.statement).toContain("original LSAT-style");
    expect(baseline.statement).toContain("not an official LSAC question set");
  });

  it("uses a no-content state when no questions or source metadata are loaded", () => {
    const baseline = buildQuestionBankContentBaseline({
      totalQuestions: 0,
      categories: [],
      sources: [],
    });

    expect(baseline.sourceLabel).toBe("No source metadata loaded");
    expect(baseline.statement).toContain("No practice questions are currently loaded");
  });

  it("describes mixed or imported sources without misclassifying them as original starter content", () => {
    const baseline = buildQuestionBankContentBaseline({
      totalQuestions: 12,
      categories: ["Reading Comprehension"],
      sources: ["Instructor-authored set", "LSAT Nexus Original Sample Set"],
    });

    expect(baseline.statement).toContain("currently available reviewed practice items");
    expect(baseline.statement).not.toContain("not an official LSAC question set");
  });
});
