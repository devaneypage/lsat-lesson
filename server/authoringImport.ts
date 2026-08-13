import { z } from "zod";

export const MAX_AUTHORING_IMPORT_ROWS = 100;

export const authoringCsvRowSchema = z.object({
  internal_title: z.string().trim().min(3).max(180),
  question_text: z.string().trim().min(20).max(20_000),
  option_a: z.string().trim().min(1).max(5_000),
  option_b: z.string().trim().min(1).max(5_000),
  option_c: z.string().trim().min(1).max(5_000),
  option_d: z.string().trim().min(1).max(5_000),
  option_e: z.string().trim().min(1).max(5_000).optional(),
  correct_answer: z.enum(["A", "B", "C", "D", "E"]),
  explanation: z.string().trim().min(20).max(30_000),
  category: z.string().trim().min(2).max(128),
  difficulty: z.enum(["easy", "medium", "hard"]),
  source: z.string().trim().min(3).max(256).optional(),
  author_notes: z.string().trim().max(8_000).optional(),
  skill_ids: z.string().trim().max(1_000).optional(),
}).refine((row) => row.correct_answer !== "E" || Boolean(row.option_e), {
  message: "An E answer requires an E option.",
  path: ["correct_answer"],
});

export type AuthoringCsvRow = Record<string, string>;

export function parseSkillIds(value?: string) {
  return [...new Set((value ?? "").split(/[;|]/).map((skill) => skill.trim()).filter(Boolean))].slice(0, 5);
}

export function previewAuthoringDraftRows(rows: AuthoringCsvRow[], knownSkillIds: readonly string[]) {
  if (rows.length > MAX_AUTHORING_IMPORT_ROWS) {
    throw new Error(`A draft import can contain at most ${MAX_AUTHORING_IMPORT_ROWS} rows.`);
  }
  const known = new Set(knownSkillIds);
  return rows.map((row, index) => {
    const result = authoringCsvRowSchema.safeParse(row);
    const issues = result.success ? [] : result.error.issues.map((issue) => issue.message);
    const skillIds = parseSkillIds(row.skill_ids);
    const unknownSkills = skillIds.filter((skillId) => !known.has(skillId));
    if (unknownSkills.length) issues.push(`Unknown curriculum skill: ${unknownSkills.join(", ")}`);
    return {
      rowNumber: index + 2,
      internalTitle: row.internal_title?.trim() || `Row ${index + 2}`,
      skillIds,
      issues,
      isValid: issues.length === 0,
      content: result.success ? {
        internalTitle: result.data.internal_title,
        questionText: result.data.question_text,
        optionA: result.data.option_a,
        optionB: result.data.option_b,
        optionC: result.data.option_c,
        optionD: result.data.option_d,
        optionE: result.data.option_e ?? null,
        correctAnswer: result.data.correct_answer,
        explanation: result.data.explanation,
        category: result.data.category,
        difficulty: result.data.difficulty,
        source: result.data.source ?? "LSAT Nexus Original",
        authorNotes: result.data.author_notes ?? null,
        skillMappings: skillIds.map((skillId) => ({ skillId, weight: 100 })),
      } : null,
    };
  });
}
