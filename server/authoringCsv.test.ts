import { describe, expect, it } from "vitest";
import { parseAuthoringCsv } from "../client/src/lib/authoringCsv";

describe("authoring CSV parser", () => {
  it("normalizes headers and preserves quoted commas for the server preview", () => {
    const rows = parseAuthoringCsv([
      "Internal Title,Question Text,Correct Answer,Difficulty,Skill IDs",
      '"Assumption item","The author says, ""therefore"" the plan will work.",B,medium,"lr-assumptions;lr-argument-core"',
    ].join("\n"));

    expect(rows).toEqual([{
      internal_title: "Assumption item",
      question_text: 'The author says, "therefore" the plan will work.',
      correct_answer: "B",
      difficulty: "medium",
      skill_ids: "lr-assumptions;lr-argument-core",
    }]);
  });
});
