export const IMPORTED_ANSWER_CHOICES = ["A", "B", "C", "D", "E"] as const;
export type ImportedAnswerChoice = (typeof IMPORTED_ANSWER_CHOICES)[number];

export function normalizeImportedAnswer(value: unknown): ImportedAnswerChoice {
  return typeof value === "string" && IMPORTED_ANSWER_CHOICES.includes(value as ImportedAnswerChoice)
    ? (value as ImportedAnswerChoice)
    : "A";
}
