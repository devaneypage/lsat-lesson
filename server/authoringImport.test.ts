import { describe, expect, it } from "vitest";
import { parseSkillIds, previewAuthoringDraftRows } from "./authoringImport";

const validRow = {
  internal_title: "Original sufficient assumption item",
  question_text: "A council plans to change its meeting process. Which claim, if true, guarantees the stated conclusion?",
  option_a: "The council will meet every month.",
  option_b: "All members can attend remotely.",
  option_c: "The process accepts written votes.",
  option_d: "The chair can verify every vote.",
  correct_answer: "D" as const,
  explanation: "The credited response supplies the condition that guarantees the conclusion.",
  category: "Sufficient Assumption",
  difficulty: "medium" as const,
  skill_ids: "lr-assumptions; lr-sufficient",
};

describe("authoring CSV preview", () => {
  it("normalizes semicolon-delimited skills without duplicating them", () => {
    expect(parseSkillIds("lr-assumptions; lr-sufficient;lr-assumptions")).toEqual(["lr-assumptions", "lr-sufficient"]);
  });

  it("accepts a valid original-question row only when every mapped skill exists", () => {
    const preview = previewAuthoringDraftRows([validRow], ["lr-assumptions", "lr-sufficient"]);
    expect(preview[0]).toMatchObject({ rowNumber: 2, isValid: true, skillIds: ["lr-assumptions", "lr-sufficient"] });
    expect(preview[0]?.content?.skillMappings).toEqual([{ skillId: "lr-assumptions", weight: 100 }, { skillId: "lr-sufficient", weight: 100 }]);
  });

  it("returns an actionable preview issue rather than allowing an unknown skill through", () => {
    const preview = previewAuthoringDraftRows([{ ...validRow, skill_ids: "unknown-skill" }], ["lr-assumptions"]);
    expect(preview[0]?.isValid).toBe(false);
    expect(preview[0]?.issues).toContain("Unknown curriculum skill: unknown-skill");
  });

  it("returns malformed answer and difficulty errors at the row level without discarding the preview", () => {
    const preview = previewAuthoringDraftRows([{ ...validRow, correct_answer: "Z", difficulty: "advanced" }], ["lr-assumptions", "lr-sufficient"]);
    expect(preview).toHaveLength(1);
    expect(preview[0]?.isValid).toBe(false);
    expect(preview[0]?.issues.join(" ")).toContain("Invalid option");
  });
});
