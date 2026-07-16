import { describe, expect, it } from "vitest";
import { normalizeImportedAnswer } from "../client/src/lib/questionImport";

describe("question import answer normalization", () => {
  it.each(["A", "B", "C", "D", "E"] as const)("preserves valid answer %s", (answer) => {
    expect(normalizeImportedAnswer(answer)).toBe(answer);
  });

  it.each(["", "F", "a", "answer A", undefined, null])(
    "falls back to A for invalid CSV value %s",
    (answer) => {
      expect(normalizeImportedAnswer(answer)).toBe("A");
    },
  );
});
