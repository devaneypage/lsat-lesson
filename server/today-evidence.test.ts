import { describe, expect, it } from "vitest";
import { TODAY_EVIDENCE_STATUS } from "../client/src/lib/learnerExperience";
import { summarizeTodayPractice } from "./repositories/practice";

describe("Today evidence boundary", () => {
  it("states that performance claims require verified practice evidence", () => {
    expect(TODAY_EVIDENCE_STATUS.title).toContain("completed practice");
    expect(TODAY_EVIDENCE_STATUS.body).toContain("only after");
    expect(TODAY_EVIDENCE_STATUS.body).toContain("verified attempts");
    expect(TODAY_EVIDENCE_STATUS.body).toContain("No sample performance data");
  });

  it("does not encode a sample score, percentile, or mastery percentage", () => {
    expect(TODAY_EVIDENCE_STATUS.title).not.toMatch(/\b1[2-8]\d\b/);
    expect(TODAY_EVIDENCE_STATUS.body).not.toMatch(/\b\d{1,3}%\b/);
    expect(TODAY_EVIDENCE_STATUS.body).not.toMatch(/\bpercentile\s*[:=]?\s*\d+/i);
  });
});

describe("Today persisted practice evidence", () => {
  const submittedAt = new Date("2026-07-08T12:00:00Z");

  it("returns an honest empty aggregate when no attempts exist", () => {
    expect(summarizeTodayPractice([], [])).toMatchObject({
      recentPractice: { attempts: 0, correctCount: 0, activeTimeMs: 0, latestSubmittedAt: null },
      practiceEvidence: { sampledAttempts: 0, bySkill: [], byType: [] },
    });
  });

  it("summarizes recent work while exposing sparse mapped evidence as provisional", () => {
    const result = summarizeTodayPractice([
      { attemptId: 2, questionId: 20, isCorrect: true, activeTimeMs: 30_000, submittedAt },
      { attemptId: 1, questionId: 10, isCorrect: false, activeTimeMs: 45_000, submittedAt: new Date("2026-07-07T12:00:00Z") },
    ], [
      { attemptId: 2, isCorrect: true, skillId: "argument-core", skillTitle: "Argument Core", questionType: "Strengthen" },
      { attemptId: 2, isCorrect: true, skillId: "strengthen-weaken", skillTitle: "Strengthen and Weaken", questionType: "Strengthen" },
      { attemptId: 1, isCorrect: false, skillId: null, skillTitle: null, questionType: "Flaw" },
    ]);

    expect(result.recentPractice).toEqual({ attempts: 2, correctCount: 1, activeTimeMs: 75_000, latestSubmittedAt: submittedAt });
    expect(result.practiceEvidence.bySkill).toEqual([
      { key: "argument-core", label: "Argument Core", evidenceCount: 1, correctCount: 1, accuracyPercent: 100, status: "provisional" },
      { key: "strengthen-weaken", label: "Strengthen and Weaken", evidenceCount: 1, correctCount: 1, accuracyPercent: 100, status: "provisional" },
    ]);
    expect(result.practiceEvidence.byType).toEqual([
      { key: "Strengthen", label: "Strengthen", evidenceCount: 1, correctCount: 1, accuracyPercent: 100, status: "provisional" },
    ]);
  });

  it("marks five mapped attempts as established and de-duplicates type evidence across skills", () => {
    const attempts = Array.from({ length: 5 }, (_, index) => ({
      attemptId: index + 1,
      questionId: index + 10,
      isCorrect: index < 4,
      activeTimeMs: 20_000,
      submittedAt: new Date(submittedAt.getTime() - index * 1_000),
    }));
    const mapped = attempts.flatMap(attempt => [
      { attemptId: attempt.attemptId, isCorrect: attempt.isCorrect, skillId: "argument-core", skillTitle: "Argument Core", questionType: "Assumption" },
      { attemptId: attempt.attemptId, isCorrect: attempt.isCorrect, skillId: "necessary-assumption", skillTitle: "Necessary Assumption", questionType: "Assumption" },
    ]);

    const result = summarizeTodayPractice(attempts, mapped);
    expect(result.practiceEvidence.bySkill).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "argument-core", evidenceCount: 5, correctCount: 4, accuracyPercent: 80, status: "established" }),
    ]));
    expect(result.practiceEvidence.byType).toEqual([
      { key: "Assumption", label: "Assumption", evidenceCount: 5, correctCount: 4, accuracyPercent: 80, status: "established" },
    ]);
  });

  it("caps recent-practice counts independently from the bounded evidence sample", () => {
    const attempts = Array.from({ length: 14 }, (_, index) => ({
      attemptId: index + 1,
      questionId: index + 1,
      isCorrect: true,
      activeTimeMs: 1_000,
      submittedAt: new Date(submittedAt.getTime() - index * 1_000),
    }));
    const result = summarizeTodayPractice(attempts, []);
    expect(result.recentPractice).toMatchObject({ attempts: 12, correctCount: 12, activeTimeMs: 12_000 });
    expect(result.practiceEvidence.sampledAttempts).toBe(14);
  });
});
