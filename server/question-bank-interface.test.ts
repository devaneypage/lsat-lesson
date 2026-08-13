import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const questionBankSource = readFileSync(join(process.cwd(), "client/src/pages/QuestionBank.tsx"), "utf8");

describe("Question Bank browse controls", () => {
  it("renders exactly one controlled difficulty selector and one controlled tag selector", () => {
    const difficultySelectors = questionBankSource.match(/value=\{selectedDifficulty\}/g) ?? [];
    const tagSelectors = questionBankSource.match(/value=\{selectedTagId !== null \? String\(selectedTagId\) : "all"\}/g) ?? [];

    expect(difficultySelectors).toHaveLength(1);
    expect(tagSelectors).toHaveLength(1);
  });
});
