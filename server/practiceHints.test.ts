import { describe, expect, it } from "vitest";
import { buildPracticeHintMessages, sanitizePracticeHint } from "./practiceHints";

describe("practice hint safeguards", () => {
  it("sends only the question stem and category to the hint model", () => {
    const messages = buildPracticeHintMessages({ category: "Necessary Assumption", questionText: "The proposal will work only if a hidden condition holds." });
    const systemPrompt = String(messages[0]?.content);
    const userPayload = String(messages[1]?.content);
    expect(userPayload).toContain("Necessary Assumption");
    expect(userPayload).toContain("hidden condition");
    expect(userPayload).not.toContain("correctAnswer");
    expect(userPayload).not.toContain("explanation");
    expect(systemPrompt).toContain("Never reveal");
  });

  it("accepts a concise Socratic clue but rejects answer-revealing output", () => {
    expect(sanitizePracticeHint("Identify the conclusion first, then ask what claim must connect the evidence to it.")).toContain("Identify the conclusion");
    expect(sanitizePracticeHint("The correct answer is B.")).toBeNull();
    expect(sanitizePracticeHint("Choose option C because it supplies the missing premise.")).toBeNull();
    expect(sanitizePracticeHint("B is correct because it resolves the gap.")).toBeNull();
  });
});
