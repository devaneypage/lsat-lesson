import { describe, expect, it } from "vitest";
import { TODAY_EVIDENCE_STATUS } from "../client/src/lib/learnerExperience";

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
